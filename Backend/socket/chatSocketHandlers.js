// Socket.IO Chat Messaging Logic
// Handles real-time communication between mentor and student chat pages

const activeConversations = new Map(); // Track active conversations: conversationId -> Set of sockets

const handleChatConnection = (io) => {
  io.on('connection', (socket) => {
    console.log(`Chat user connected: ${socket.id}`);

    // Join a conversation room
    socket.on('join-conversation', ({ conversationId, userId, userName, userRole }) => {
      console.log(`User ${userName} (${userRole}) joining conversation: ${conversationId}`);
      
      socket.join(conversationId);
      socket.conversationId = conversationId;
      socket.userId = userId;
      socket.userName = userName;
      socket.userRole = userRole;

      // Track conversation participants
      if (!activeConversations.has(conversationId)) {
        activeConversations.set(conversationId, new Set());
      }
      activeConversations.get(conversationId).add({
        socketId: socket.id,
        userId,
        userName,
        userRole,
        joinedAt: new Date()
      });

      // Notify others in the conversation
      socket.to(conversationId).emit('user-joined-chat', {
        userId,
        userName,
        userRole,
        socketId: socket.id,
        timestamp: new Date()
      });

      // Send current participants to the new user
      const participants = Array.from(activeConversations.get(conversationId));
      socket.emit('conversation-participants', participants);

      console.log(`Conversation ${conversationId} now has ${participants.length} participants`);
    });

    // Handle real-time message sending
    socket.on('send-message', ({ conversationId, receiverId, content, messageType = 'normal' }) => {
      console.log(`Message in conversation ${conversationId} from ${socket.userName}: ${content}`);
      
      const messageData = {
        id: Date.now().toString(),
        conversationId,
        senderId: socket.userId,
        senderName: socket.userName,
        senderRole: socket.userRole,
        receiverId,
        content,
        messageType,
        timestamp: new Date(),
        status: 'delivered'
      };

      // Broadcast message to all users in the conversation
      io.to(conversationId).emit('message-received', messageData);
    });

    // Handle typing indicator
    socket.on('user-typing', ({ conversationId, isTyping }) => {
      socket.to(conversationId).emit('user-typing-indicator', {
        userId: socket.userId,
        userName: socket.userName,
        isTyping,
        timestamp: new Date()
      });
    });

    // Handle message read receipt
    socket.on('message-read', ({ conversationId, messageId, readBy }) => {
      socket.to(conversationId).emit('message-read-receipt', {
        messageId,
        readBy,
        readAt: new Date()
      });
    });

    // Handle conversation status (online/offline)
    socket.on('update-status', ({ conversationId, status }) => {
      socket.to(conversationId).emit('user-status-changed', {
        userId: socket.userId,
        userName: socket.userName,
        status, // 'online', 'away', 'offline'
        timestamp: new Date()
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`Chat user disconnected: ${socket.id}`);
      
      if (socket.conversationId && activeConversations.has(socket.conversationId)) {
        const participants = activeConversations.get(socket.conversationId);
        
        // Remove user from conversation
        for (let participant of participants) {
          if (participant.socketId === socket.id) {
            participants.delete(participant);
            break;
          }
        }

        // Notify others in the conversation
        socket.to(socket.conversationId).emit('user-left-chat', {
          userId: socket.userId,
          userName: socket.userName,
          socketId: socket.id,
          timestamp: new Date()
        });

        // Clean up empty conversations
        if (participants.size === 0) {
          activeConversations.delete(socket.conversationId);
          console.log(`Conversation ${socket.conversationId} cleaned up`);
        } else {
          console.log(`Conversation ${socket.conversationId} now has ${participants.size} participants`);
        }
      }
    });

    // Handle manual leave conversation
    socket.on('leave-conversation', ({ conversationId }) => {
      socket.leave(conversationId);
      
      if (activeConversations.has(conversationId)) {
        const participants = activeConversations.get(conversationId);
        
        for (let participant of participants) {
          if (participant.socketId === socket.id) {
            participants.delete(participant);
            break;
          }
        }

        socket.to(conversationId).emit('user-left-chat', {
          userId: socket.userId,
          userName: socket.userName,
          socketId: socket.id,
          timestamp: new Date()
        });

        if (participants.size === 0) {
          activeConversations.delete(conversationId);
        }
      }
    });
  });
};

// Utility functions for conversation management
const getConversationParticipants = (conversationId) => {
  if (activeConversations.has(conversationId)) {
    return Array.from(activeConversations.get(conversationId));
  }
  return [];
};

const getActiveConversationCount = () => {
  return activeConversations.size;
};

const getTotalChatParticipants = () => {
  let total = 0;
  for (let participants of activeConversations.values()) {
    total += participants.size;
  }
  return total;
};

export {
  handleChatConnection,
  getConversationParticipants,
  getActiveConversationCount,
  getTotalChatParticipants
};
