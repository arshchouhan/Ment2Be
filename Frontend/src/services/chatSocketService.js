import io from 'socket.io-client';
import { getBackendUrl } from '../utils/apiUrl.js';

const SOCKET_URL = getBackendUrl();

class ChatSocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
  }

  // Initialize socket connection
  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
        userId: user.id || user._id,
        userName: user.name
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('Chat socket connected:', this.socket.id);
      this.emit('connected', { socketId: this.socket.id });
    });

    this.socket.on('disconnect', () => {
      console.log('Chat socket disconnected');
      this.emit('disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Chat socket error:', error);
      this.emit('error', error);
    });

    return this.socket;
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join a conversation
  joinConversation(conversationId, userId, userName, userRole) {
    if (!this.socket?.connected) {
      this.connect();
    }

    this.socket.emit('join-conversation', {
      conversationId,
      userId,
      userName,
      userRole
    });

    console.log(`Joined conversation: ${conversationId}`);
  }

  // Leave a conversation
  leaveConversation(conversationId) {
    if (this.socket?.connected) {
      this.socket.emit('leave-conversation', { conversationId });
      console.log(`Left conversation: ${conversationId}`);
    }
  }

  // Send a message
  sendMessage(senderId, receiverId, content, messageType = 'normal', messageId) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    const messageData = {
      id: messageId || `temp-${Date.now()}`,
      senderId,
      receiverId,
      content,
      messageType,
      timestamp: new Date().toISOString(),
      status: 'delivered'
    };

    console.log('Sending message:', messageData);

    // Emit to server for broadcasting
    this.socket.emit('send-message', messageData);

    // Also emit locally for immediate UI update
    this.emit('message-sent', messageData);

    return messageData;
  }

  // Send typing indicator
  sendTypingIndicator(conversationId, isTyping) {
    if (this.socket?.connected) {
      this.socket.emit('user-typing', {
        conversationId,
        isTyping
      });
    }
  }

  // Send read receipt
  sendReadReceipt(conversationId, messageId, readBy) {
    if (this.socket?.connected) {
      this.socket.emit('message-read', {
        conversationId,
        messageId,
        readBy
      });
    }
  }

  // Update user status
  updateStatus(conversationId, status) {
    if (this.socket?.connected) {
      this.socket.emit('update-status', {
        conversationId,
        status
      });
    }
  }

  // Listen for incoming messages
  onMessageReceived(callback) {
    if (this.socket) {
      this.socket.on('message-received', callback);
    }
  }

  // Listen for user joined
  onUserJoinedChat(callback) {
    if (this.socket) {
      this.socket.on('user-joined-chat', callback);
    }
  }

  // Listen for user left
  onUserLeftChat(callback) {
    if (this.socket) {
      this.socket.on('user-left-chat', callback);
    }
  }

  // Listen for typing indicator
  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user-typing-indicator', callback);
    }
  }

  // Listen for read receipt
  onMessageRead(callback) {
    if (this.socket) {
      this.socket.on('message-read-receipt', callback);
    }
  }

  // Listen for status changes
  onUserStatusChanged(callback) {
    if (this.socket) {
      this.socket.on('user-status-changed', callback);
    }
  }

  // Listen for achievements
  onAchievementUnlocked(callback) {
    if (this.socket) {
      this.socket.on('achievement-unlocked', callback);
    }
  }

  // Listen for conversation participants
  onConversationParticipants(callback) {
    if (this.socket) {
      this.socket.on('conversation-participants', callback);
    }
  }

  // Remove listener
  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  // Check if socket is connected
  isConnected() {
    return this.socket?.connected || false;
  }

  // Get socket ID
  getSocketId() {
    return this.socket?.id || null;
  }

  // Emit custom event (for internal use)
  emit(event, data) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].forEach(callback => callback(data));
  }

  // Listen to custom events (for internal use)
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
}

// Export singleton instance
export const chatSocketService = new ChatSocketService();
