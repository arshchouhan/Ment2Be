import { GoogleGenerativeAI } from '@google/generative-ai';
import Booking from '../models/booking.model.js';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate session insights using Gemini AI
export const generateSessionInsights = async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key not configured'
      });
    }

    const { sessionId } = req.params;
    const userId = req.user.id || req.user._id;

    // Fetch session details
    const session = await Booking.findById(sessionId)
      .populate('mentor', 'name email mentorProfile')
      .populate('student', 'name email');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Verify user is part of this session
    const isMentor = session.mentor._id.toString() === userId.toString();
    const isStudent = session.student._id.toString() === userId.toString();
    
    if (!isMentor && !isStudent) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view insights for this session'
      });
    }

    // Check if actual session duration is too short (less than 2 minutes = no real conversation)
    const actualDuration = session.actualDuration || 0; // in seconds
    const minDurationForInsights = 120; // 2 minutes minimum
    
    if (actualDuration < minDurationForInsights) {
      return res.status(200).json({
        success: true,
        noConversation: true,
        message: 'No meaningful conversation recorded',
        data: {
          sessionId,
          mentorName: session.mentor?.name || 'Mentor',
          studentName: session.student?.name || 'Student',
          sessionDate: new Date(session.sessionDate).toLocaleDateString(),
          sessionTime: new Date(session.sessionDate).toLocaleTimeString(),
          duration: session.duration || 60,
          actualDuration: actualDuration,
          insights: null
        }
      });
    }

    // Prepare session context for AI
    const mentorName = session.mentor?.name || 'Mentor';
    const studentName = session.student?.name || 'Student';
    const sessionDate = new Date(session.sessionDate).toLocaleDateString();
    const sessionTime = new Date(session.sessionDate).toLocaleTimeString();
    const duration = session.duration || 60;
    const topic = session.topic || session.notes || 'General mentoring session';
    const mentorExpertise = session.mentor?.mentorProfile?.skills?.join(', ') || 'Various topics';

    // Create prompt for Gemini
    const prompt = `You are an AI assistant for a mentoring platform. Generate helpful session insights and key takeaways for a mentoring session.

Session Details:
- Mentor: ${mentorName}
- Student: ${studentName}
- Date: ${sessionDate} at ${sessionTime}
- Duration: ${duration} minutes
- Topic/Notes: ${topic}
- Mentor's Expertise: ${mentorExpertise}

Based on this mentoring session, generate:
1. **Session Summary** (2-3 sentences summarizing what was likely covered)
2. **Key Takeaways** (3-5 bullet points of important insights the student should remember)
3. **Action Items** (2-3 specific tasks or next steps for the student)
4. **Reflection Questions** (2-3 questions for the student to reflect on)
5. **Recommended Resources** (2-3 suggested topics or areas to explore further)

Format your response as JSON with these exact keys:
{
  "summary": "...",
  "keyTakeaways": ["...", "...", "..."],
  "actionItems": ["...", "...", "..."],
  "reflectionQuestions": ["...", "...", "..."],
  "recommendedResources": ["...", "...", "..."]
}

Only respond with valid JSON, no additional text.`;

    // Call Gemini AI
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    let insights;
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanText = text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.slice(7);
      }
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.slice(3);
      }
      if (cleanText.endsWith('```')) {
        cleanText = cleanText.slice(0, -3);
      }
      insights = JSON.parse(cleanText.trim());
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      // Provide fallback insights
      insights = {
        summary: `This was a ${duration}-minute mentoring session between ${mentorName} and ${studentName} covering ${topic}.`,
        keyTakeaways: [
          'Review the concepts discussed during the session',
          'Practice applying new knowledge to real scenarios',
          'Prepare questions for the next session'
        ],
        actionItems: [
          'Review session notes within 24 hours',
          'Complete any assigned tasks or exercises',
          'Schedule follow-up session if needed'
        ],
        reflectionQuestions: [
          'What was the most valuable insight from this session?',
          'How can you apply what you learned today?',
          'What questions do you still have?'
        ],
        recommendedResources: [
          'Review related documentation or tutorials',
          'Practice with hands-on exercises',
          'Connect with peers for discussion'
        ]
      };
    }

    res.status(200).json({
      success: true,
      message: 'Session insights generated successfully',
      data: {
        sessionId,
        mentorName,
        studentName,
        sessionDate,
        sessionTime,
        duration,
        topic,
        insights,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating session insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate session insights',
      error: error.message
    });
  }
};

// Generate quick insights without session ID (for demo/testing)
export const generateQuickInsights = async (req, res) => {
  try {
    const { topic, mentorName, studentName, duration } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key not configured'
      });
    }

    const prompt = `You are an AI assistant for a mentoring platform. Generate helpful session insights for a mentoring session.

Session Details:
- Mentor: ${mentorName || 'Mentor'}
- Student: ${studentName || 'Student'}
- Duration: ${duration || 60} minutes
- Topic: ${topic || 'General mentoring session'}

Generate insights in JSON format:
{
  "summary": "Brief 2-3 sentence summary",
  "keyTakeaways": ["takeaway1", "takeaway2", "takeaway3"],
  "actionItems": ["action1", "action2"],
  "reflectionQuestions": ["question1", "question2"],
  "recommendedResources": ["resource1", "resource2"]
}

Only respond with valid JSON.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let insights;
    try {
      let cleanText = text.trim();
      if (cleanText.startsWith('```json')) cleanText = cleanText.slice(7);
      if (cleanText.startsWith('```')) cleanText = cleanText.slice(3);
      if (cleanText.endsWith('```')) cleanText = cleanText.slice(0, -3);
      insights = JSON.parse(cleanText.trim());
    } catch (parseError) {
      insights = {
        summary: `A productive ${duration || 60}-minute session on ${topic || 'mentoring'}.`,
        keyTakeaways: ['Key concept reviewed', 'Practical skills discussed', 'Next steps identified'],
        actionItems: ['Review session notes', 'Practice new concepts'],
        reflectionQuestions: ['What was most valuable?', 'How will you apply this?'],
        recommendedResources: ['Related tutorials', 'Practice exercises']
      };
    }

    res.status(200).json({
      success: true,
      data: { insights }
    });

  } catch (error) {
    console.error('Error generating quick insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate insights',
      error: error.message
    });
  }
};
