import User from '../models/user.model.js';
import { sendEmail } from '../services/emailService.js';

export const requestFreeTrial = async (req, res) => {
  try {
    const studentId = req.user?.id || req.user?._id;
    const { mentorId } = req.body;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!mentorId) {
      return res.status(400).json({
        success: false,
        message: 'mentorId is required'
      });
    }

    const [student, mentor] = await Promise.all([
      User.findById(studentId).lean(),
      User.findById(mentorId).lean()
    ]);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    if (!mentor.email) {
      return res.status(400).json({
        success: false,
        message: 'Mentor email not available'
      });
    }

    const studentPhone = student.phoneNumber ? String(student.phoneNumber) : '';
    const studentEmail = student.email ? String(student.email) : '';
    const studentName = student.name ? String(student.name) : 'Student';
    const mentorName = mentor.name ? String(mentor.name) : 'Mentor';

    const subject = `Free Trial Request from ${studentName}`;

    const text = [
      `Hello ${mentorName},`,
      '',
      `You have received a new free trial request from ${studentName}.`,
      '',
      `Student details:`,
      `- Name: ${studentName}`,
      `- Email: ${studentEmail || 'N/A'}`,
      `- Phone: ${studentPhone || 'N/A'}`,
      '',
      `Please connect with the student to schedule a quick call for the free trial session.`,
      '',
      `— MentorLink`
    ].join('\n');

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2 style="margin:0 0 12px 0">Free Trial Request</h2>
        <p>Hello <strong>${mentorName}</strong>,</p>
        <p>You have received a new free trial request from <strong>${studentName}</strong>.</p>
        <h3 style="margin:16px 0 8px 0">Student details</h3>
        <ul>
          <li><strong>Name:</strong> ${studentName}</li>
          <li><strong>Email:</strong> ${studentEmail || 'N/A'}</li>
          <li><strong>Phone:</strong> ${studentPhone || 'N/A'}</li>
        </ul>
        <p>Please connect with the student to schedule a quick call for the free trial session.</p>
        <p style="color:#666">— MentorLink</p>
      </div>
    `;

    await sendEmail({
      to: mentor.email,
      subject,
      text,
      html
    });

    return res.status(200).json({
      success: true,
      message: 'Free trial request email sent to mentor'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to send free trial request',
      error: error.message
    });
  }
};
