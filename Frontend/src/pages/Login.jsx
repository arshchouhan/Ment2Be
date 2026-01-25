import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";
import ProfileCarousel from "../components/auth/ProfileCarousel";
import LoadingScreen from "../components/LoadingScreen";
import { useGoogleOneTapLogin } from "@react-oauth/google";
import { getApiUrl } from "../config/backendConfig";
import "./Login.css";

const API_URL = getApiUrl().replace(/\/$/, "");

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerRole, setRegisterRole] = useState("student");
  const [showLoading, setShowLoading] = useState(false);
  const [isProcessingLogin, setIsProcessingLogin] = useState(false);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  // --------------------------
  // GOOGLE LOGIN HANDLER
  // --------------------------
  const handleGoogleAuth = async (code, role) => {
    try {
      setError("");
      setShowLoading(true);
      setIsProcessingLogin(true);

      console.log(
        "Sending Google auth request with code:",
        code,
        "role:",
        role,
      );

      const res = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          role,
        }),
      });

      const data = await res.json();
      console.log("Google login response:", data);

      if (!res.ok) {
        setShowLoading(false);
        setIsProcessingLogin(false);
        throw new Error(data.message || "Google login failed");
      }

      // Save user + token
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      console.log("Navigating to dashboard for role:", data.role);

      // Redirect immediately without loading screen
      const dashboardUrl =
        data.role === "mentor" ? "/mentor/dashboard" : "/student/dashboard";
      console.log("Redirecting to:", dashboardUrl);

      // Clear processing state before redirect
      setIsProcessingLogin(false);
      setShowLoading(false);

      // Navigate to dashboard
      navigate(dashboardUrl, { replace: true });
    } catch (err) {
      setShowLoading(false);
      setIsProcessingLogin(false);
      setError(err.message);
      console.error("Google auth error:", err);
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    // Skip if currently processing a login
    if (isProcessingLogin) return;

    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      const parsedUser = JSON.parse(user);

      if (parsedUser.role === "mentor") {
        navigate("/mentor/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    }

    // Handle Google OAuth redirect callback (only for redirect mode)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code && !isProcessingLogin) {
      // Get the stored role and process the login immediately
      const storedRole = sessionStorage.getItem("selectedRole") || "student";
      console.log(
        "Google redirect detected, code:",
        code,
        "stored role:",
        storedRole,
      );
      setIsProcessingLogin(true);
      handleGoogleAuth(code, storedRole);
      // Clean up URL and session storage
      window.history.replaceState({}, document.title, window.location.pathname);
      sessionStorage.removeItem("selectedRole");
    }

    // If came from "Register as Mentor/Student"
    if (location.pathname === "/register" && location.state?.role) {
      setIsRegistering(true);
      setRegisterRole(location.state.role);
    }
  }, [navigate, location, isProcessingLogin]);

  // --------------------------
  // SIMPLE LOGIN FETCH HANDLER
  // --------------------------
  const handleLogin = async (formData) => {
    setIsProcessingLogin(true);
    try {
      setError("");
      setShowLoading(true);

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      if (data.role === "mentor") {
        navigate("/mentor/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setShowLoading(false);
      setIsProcessingLogin(false);
    }
  };

  // ------------------------------
  // REGISTER AND AUTO-LOGIN HANDLER
  // ------------------------------
  const handleRegister = async (formData) => {
    try {
      setError("");
      setShowLoading(true);

      // 1. First, register the user
      const registerRes = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role: registerRole,
        }),
      });

      const registerData = await registerRes.json();
      if (!registerRes.ok) {
        setShowLoading(false);
        throw new Error(registerData.message || "Registration failed");
      }

      // 2. If registration is successful, log the user in
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const loginData = await loginRes.json();
      if (!loginRes.ok) {
        setShowLoading(false);
        throw new Error(
          loginData.message || "Auto-login after registration failed",
        );
      }

      // Save the token and user data from login response
      localStorage.setItem("token", loginData.token);
      localStorage.setItem("user", JSON.stringify(loginData));

      // Redirect immediately without loading screen
      if (registerRole === "mentor") {
        navigate("/mentor/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      setShowLoading(false);
      setError(err.message);
    }
  };

  const handleNavigateToRegister = (role) => {
    setIsRegistering(true);
    setRegisterRole(role);
    window.history.pushState({}, "", "/register");
  };

  const handleSwitchToLogin = () => {
    setIsRegistering(false);
    window.history.pushState({}, "", "/login");
  };

  // Loading handled inline, no full screen loading

  // Check if we should show the two-column layout
  const showTwoColumnLayout = isRegistering;

  return (
    <div className="login-bg h-screen bg-gradient-to-br from-[#000000] via-[#0a1929] to-[#001e3c] relative overflow-hidden flex flex-col lg:flex-row">
      {/* Animated Moon */}
      <div className="moon"></div>

      {/* Animated Stars Background */}
      <div className="stars">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="star"></div>
        ))}
      </div>

      {/* Progress Bar - Shows during Google login redirect */}
      {isProcessingLogin && (
        <div className="progress-bar-container">
          <div className="progress-bar"></div>
        </div>
      )}

      {/* Back to Landing Page Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        <span className="text-sm font-medium">Back to Home</span>
      </button>

      {/* Left Side - Login/Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8 relative z-10">
        <div className="w-full max-w-md">
          {isRegistering ? (
            <RegisterForm
              onSubmit={handleRegister}
              onSwitchToLogin={handleSwitchToLogin}
              role={registerRole}
              isLoading={showLoading}
            />
          ) : (
            <LoginForm
              onSubmit={handleLogin}
              onNavigateToRegister={handleNavigateToRegister}
              onGoogleAuth={handleGoogleAuth}
              isLoading={showLoading}
            />
          )}

          {error && (
            <div className="relative mt-4 p-4 bg-red-900 border border-red-700 text-red-300 rounded-lg">
              <button
                onClick={() => setError("")}
                className="absolute top-2 right-2 text-red-300 hover:text-white"
              >
                ✕
              </button>
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Profile Carousel */}
      <div className="hidden lg:block lg:w-1/2 h-screen relative z-10">
        <ProfileCarousel />
      </div>
    </div>
  );
};

export default Login;
