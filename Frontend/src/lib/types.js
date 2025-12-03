// Message types for different kinds of communication
export const MessageTypes = {
  NORMAL: "normal",
  QUESTION: "question", 
  INSIGHT: "insight",
  ADVICE: "advice",
  ACTION: "action"
};

// Type definitions for chat components
export const createMessage = (id, content, sender, type = MessageTypes.NORMAL, timestamp = new Date()) => ({
  id,
  content,
  sender, // "mentor" or "mentee"
  type,
  timestamp
});

export const createConversation = (id, mentorName, mentorAvatar, mentorRole, lastMessage, lastMessageTime, unreadCount = 0, isOnline = false) => ({
  id,
  mentorName,
  mentorAvatar,
  mentorRole,
  lastMessage,
  lastMessageTime,
  unreadCount,
  isOnline
});
