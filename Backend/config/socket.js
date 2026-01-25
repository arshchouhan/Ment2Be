import { Server } from 'socket.io';
import { handleSocketConnection, getRoomCount, getTotalParticipants } from '../socket/socketHandlers.js';
import { handleChatConnection, getActiveConversationCount, getTotalChatParticipants } from '../socket/chatSocketHandlers.js';

/**
 * Initialize Socket.IO server with CORS configuration
 * @param {http.Server} server - HTTP server instance
 * @returns {Server} Socket.IO server instance
 */
export const initializeSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        process.env.FRONTEND_URL,
        process.env.HOSTED_FRONTEND_DOMAIN,
        ...(process.env.NODE_ENV === 'development' ? [
          "http://localhost:3000",
          "http://localhost:5173"
        ] : [])
      ].filter(Boolean),
      methods: ["GET", "POST"]
    }
  });

  // Initialize Socket.IO handlers
  handleSocketConnection(io);
  handleChatConnection(io);

  _io = io;
  return io;
};

let _io;
export const getIO = () => _io;

/**
 * Get Socket.IO statistics
 * @returns {Object} Socket.IO stats object
 */
export const getSocketStats = () => {
  return {
    activeRooms: getRoomCount(),
    totalParticipants: getTotalParticipants(),
    activeConversations: getActiveConversationCount(),
    totalChatParticipants: getTotalChatParticipants(),
    timestamp: new Date().toISOString()
  };
};
