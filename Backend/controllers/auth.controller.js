import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { OAuth2Client } from 'google-auth-library';
import { sendPasswordResetEmail, sendWelcomeEmail } from "../services/emailService.js";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'postmessage'
);

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

export async function Register(req, res) {
  try {
    const { name, email, password, role, phoneNumber } = req.validatedData;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email"
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      ...(phoneNumber && { phoneNumber })
    });

    if (user) {      
      const token = generateToken(user._id, user.role);

      const frontendUrl = process.env.FRONTEND_URL || req.get('origin') || 'http://localhost:5173';
      const dashboardPath = user.role === 'mentor' ? '/mentor/dashboard' : '/student/dashboard';
      const dashboardLink = `${frontendUrl.replace(/\/$/, '')}${dashboardPath}`;

      sendWelcomeEmail(user.email, user.name, user.role, dashboardLink).catch((err) => {
        console.error('Welcome email error:', err);
      });
      
      res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid user data"
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export async function Login(req, res) {
  try {
    const { email, password } = req.validatedData;
    const normalizedEmail = email.toLowerCase().trim();

    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${escapeRegex(normalizedEmail)}$`, 'i') } 
    }).select('+password');

    if (!user) {
      console.log("User not found for email:", normalizedEmail);
      return res.status(401).json({"success":false,"message":"User not found"});
    }

    if (!user.password) {
      console.log("User has no password (Google OAuth user):", user._id);
      return res.status(401).json({"success":false,"message":"Please use Google Sign In for this account"});
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({"success":false,"message":"Invalid email or password"});
    }

    const token = generateToken(user._id, user.role);
    const { password: _, ...userData } = user.toObject();
    
    return res.status(200).json({
      success: true,
      ...userData,
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({"success":false,"message":"Server error during login", "error": process.env.NODE_ENV === 'development' ? error.message : undefined});
  }
}

export async function GoogleLogin(req, res) {
  try {
    const { code, role } = req.body;
    
    if (!code) {
      return res.status(400).json({ success: false, message: "Google code is required" });
    }

    const { tokens } = await client.getToken(code);
    const idToken = tokens.id_token;

    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const { name, email, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (user) {
      // Link Google ID if not present
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Create new user
      const userRole = role || 'student';
      
      user = await User.create({
        name,
        email,
        googleId,
        role: userRole,
      });

      const frontendUrl = process.env.FRONTEND_URL || req.get('origin') || 'http://localhost:5173';
      const dashboardPath = userRole === 'mentor' ? '/mentor/dashboard' : '/student/dashboard';
      const dashboardLink = `${frontendUrl.replace(/\/$/, '')}${dashboardPath}`;

      sendWelcomeEmail(email, name, userRole, dashboardLink).catch((err) => {
        console.error('Welcome email error:', err);
      });
    }

    const jwtToken = generateToken(user._id, user.role);
    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({
      success: true,
      ...userData,
      token: jwtToken
    });
  } catch (error) {
    console.error("Google Login error:", error);
    res.status(401).json({
      success: false,
      message: "Google authentication failed",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export function Logout(req, res) {
  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
}

export async function ForgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with this email"
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || req.get('origin') || 'http://localhost:5173';
    const resetLink = `${frontendUrl.replace(/\/$/, '')}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    await sendPasswordResetEmail(email, resetToken, resetLink);

    return res.status(200).json({
      success: true,
      message: "Password reset email sent successfully. Please check your email."
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Error sending password reset email",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export async function ResetPassword(req, res) {
  try {
    const { token, email, newPassword, confirmPassword } = req.body;

    if (!token || !email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password."
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Error resetting password",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export async function ValidateResetToken(req, res) {
  try {
    const { token, email } = req.query;

    if (!token || !email) {
      return res.status(400).json({
        success: false,
        message: "Token and email are required"
      });
    }

    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Token is valid",
      email: user.email
    });
  } catch (error) {
    console.error("Validate reset token error:", error);
    return res.status(500).json({
      success: false,
      message: "Error validating token",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}