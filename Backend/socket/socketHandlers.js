// Socket.IO Meeting Logic
const activeRooms = new Map(); // Track active rooms and participants

const handleSocketConnection = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a meeting room
    socket.on('join-room', ({ roomId, userId, userName, userRole }) => {
      console.log(`User ${userName} (${userRole}) joining room: ${roomId}`);
      
      socket.join(roomId);
      socket.userId = userId;
      socket.userName = userName;
      socket.userRole = userRole;
      socket.roomId = roomId;

      // Track room participants
      if (!activeRooms.has(roomId)) {
        activeRooms.set(roomId, new Set());
      }
      activeRooms.get(roomId).add({
        socketId: socket.id,
        userId,
        userName,
        userRole,
        joinedAt: new Date()
      });

      // Notify others in the room
      socket.to(roomId).emit('user-joined', {
        userId,
        userName,
        userRole,
        socketId: socket.id
      });

      // Send current participants to the new user
      const participants = Array.from(activeRooms.get(roomId));
      socket.emit('room-participants', participants);

      console.log(`Room ${roomId} now has ${participants.length} participants`);
    });

    // Handle WebRTC signaling
    socket.on('signal', ({ roomId, targetSocketId, signal }) => {
      console.log(`Signaling in room ${roomId} from ${socket.id} to ${targetSocketId}`);
      socket.to(targetSocketId).emit('signal', {
        signal,
        fromSocketId: socket.id,
        fromUserId: socket.userId,
        fromUserName: socket.userName
      });
    });

    // Handle offer (WebRTC)
    socket.on('offer', ({ roomId, targetSocketId, offer }) => {
      socket.to(targetSocketId).emit('offer', {
        offer,
        fromSocketId: socket.id,
        fromUserId: socket.userId
      });
    });

    // Handle answer (WebRTC)
    socket.on('answer', ({ roomId, targetSocketId, answer }) => {
      socket.to(targetSocketId).emit('answer', {
        answer,
        fromSocketId: socket.id,
        fromUserId: socket.userId
      });
    });

    // Handle ICE candidates (WebRTC)
    socket.on('ice-candidate', ({ roomId, targetSocketId, candidate }) => {
      socket.to(targetSocketId).emit('ice-candidate', {
        candidate,
        fromSocketId: socket.id,
        fromUserId: socket.userId
      });
    });

    // Handle chat messages
    socket.on('chat-message', ({ roomId, message }) => {
      const chatMessage = {
        id: Date.now(),
        userId: socket.userId,
        userName: socket.userName,
        userRole: socket.userRole,
        message,
        timestamp: new Date()
      };
      
      io.to(roomId).emit('chat-message', chatMessage);
      console.log(`Chat message in room ${roomId}: ${socket.userName}: ${message}`);
    });

    // Handle screen sharing
    socket.on('screen-share-start', ({ roomId }) => {
      socket.to(roomId).emit('screen-share-start', {
        userId: socket.userId,
        userName: socket.userName,
        socketId: socket.id
      });
    });

    socket.on('screen-share-stop', ({ roomId }) => {
      socket.to(roomId).emit('screen-share-stop', {
        userId: socket.userId,
        socketId: socket.id
      });
    });

    // Handle mute/unmute
    socket.on('toggle-audio', ({ roomId, isMuted }) => {
      socket.to(roomId).emit('user-audio-toggle', {
        userId: socket.userId,
        socketId: socket.id,
        isMuted
      });
    });

    socket.on('toggle-video', ({ roomId, isVideoOff }) => {
      socket.to(roomId).emit('user-video-toggle', {
        userId: socket.userId,
        socketId: socket.id,
        isVideoOff
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      
      if (socket.roomId && activeRooms.has(socket.roomId)) {
        const participants = activeRooms.get(socket.roomId);
        
        // Remove user from room
        for (let participant of participants) {
          if (participant.socketId === socket.id) {
            participants.delete(participant);
            break;
          }
        }

        // Notify others in the room
        socket.to(socket.roomId).emit('user-left', {
          userId: socket.userId,
          userName: socket.userName,
          socketId: socket.id
        });

        // Clean up empty rooms
        if (participants.size === 0) {
          activeRooms.delete(socket.roomId);
          console.log(`Room ${socket.roomId} cleaned up`);
        } else {
          console.log(`Room ${socket.roomId} now has ${participants.size} participants`);
        }
      }
    });

    // Handle manual leave room
    socket.on('leave-room', ({ roomId }) => {
      socket.leave(roomId);
      
      if (activeRooms.has(roomId)) {
        const participants = activeRooms.get(roomId);
        
        for (let participant of participants) {
          if (participant.socketId === socket.id) {
            participants.delete(participant);
            break;
          }
        }

        socket.to(roomId).emit('user-left', {
          userId: socket.userId,
          userName: socket.userName,
          socketId: socket.id
        });

        if (participants.size === 0) {
          activeRooms.delete(roomId);
        }
      }
    });
  });
};

// Utility functions for room management
const getRoomParticipants = (roomId) => {
  if (activeRooms.has(roomId)) {
    return Array.from(activeRooms.get(roomId));
  }
  return [];
};

const getRoomCount = () => {
  return activeRooms.size;
};

const getTotalParticipants = () => {
  let total = 0;
  for (let participants of activeRooms.values()) {
    total += participants.size;
  }
  return total;
};

export {
  handleSocketConnection,
  getRoomParticipants,
  getRoomCount,
  getTotalParticipants
};
