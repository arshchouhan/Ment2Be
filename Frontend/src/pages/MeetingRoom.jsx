import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiVideo, FiVideoOff, FiMic, FiMicOff, FiPhone, FiMessageSquare, FiUsers, FiMonitor } from 'react-icons/fi';
import { getBackendUrl } from '../utils/apiUrl.js';
import { connect, createLocalAudioTrack, createLocalVideoTrack } from 'twilio-video';

const MeetingRoom = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get URL parameters
  const roomId = searchParams.get('roomId');
  const sessionId = searchParams.get('sessionId');
  const userRole = searchParams.get('userRole');
  
  // States
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  
  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const isMountedRef = useRef(true);
  
  // Get user info (memoize to prevent re-renders)
  const user = useMemo(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }, []);

  // Validate parameters early
  if (!roomId || !sessionId || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Meeting Parameters</h1>
          <p className="mb-4">Unable to join the meeting. Please try again.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {

    // Initialize Socket.IO connection
    const newSocket = io(getBackendUrl());
    setSocket(newSocket);

    // Socket event listeners
    newSocket.on('connect', () => {
      console.log('🔗 Connected to server');
      if (isMountedRef.current) {
        setIsConnected(true);
      }
      
      // Join the room with a small delay to ensure connection is stable
      setTimeout(() => {
        if (isMountedRef.current) {
          console.log('🚪 Joining room:', roomId);
          newSocket.emit('join-room', {
            roomId,
            userId: user.id,
            userName: user.name,
            userRole
          });
        }
      }, 500);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server. Reason:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
    });

    newSocket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    newSocket.on('user-joined', async (userData) => {
      console.log('User joined:', userData);
      if (isMountedRef.current) {
        setParticipants(prev => [...prev.filter(p => p.userId !== userData.userId), userData]);
      }
      
      // Create WebRTC connection for new user (with delay to ensure local stream is ready)
      setTimeout(async () => {
        if (isMountedRef.current && localStreamRef.current && !peerConnection) {
          console.log('Initiating WebRTC connection with new user:', userData.userName);
          await createPeerConnection(userData.socketId, newSocket, true);
        }
      }, 1000);
    });

    newSocket.on('user-left', (userData) => {
      console.log('User left:', userData);
      if (isMountedRef.current) {
        setParticipants(prev => prev.filter(p => p.userId !== userData.userId));
        
        // Clean up peer connection
        if (peerConnection) {
          peerConnection.close();
          setPeerConnection(null);
          setRemoteStream(null);
        }
      }
    });

    newSocket.on('room-participants', async (participantsList) => {
      console.log('Room participants:', participantsList);
      const otherParticipants = participantsList.filter(p => p.userId !== user.id);
      if (isMountedRef.current) {
        setParticipants(otherParticipants);
      }
      
      // Create peer connection with existing participants (but don't initiate offer yet)
      if (isMountedRef.current && otherParticipants.length > 0 && localStreamRef.current && !peerConnection) {
        console.log('Creating peer connection with existing participant');
        await createPeerConnection(otherParticipants[0].socketId, newSocket, false);
      }
    });

    // WebRTC signaling events
    newSocket.on('offer', async ({ offer, fromSocketId }) => {
      console.log('Received offer from:', fromSocketId);
      await handleOffer(offer, fromSocketId, newSocket);
    });

    newSocket.on('answer', async ({ answer, fromSocketId }) => {
      console.log('Received answer from:', fromSocketId);
      await handleAnswer(answer);
    });

    newSocket.on('ice-candidate', async ({ candidate, fromSocketId }) => {
      console.log('Received ICE candidate from:', fromSocketId);
      await handleIceCandidate(candidate);
    });

    newSocket.on('chat-message', (message) => {
      setChatMessages(prev => [...prev, message]);
    });

    // Initialize local video first
    initializeLocalVideo().then(() => {
      console.log('Local video initialized, ready for peer connections');
    });

    // Cleanup on unmount
    return () => {
      console.log('🔌 Cleaning up meeting room connection');
      isMountedRef.current = false;
      
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnection) {
        peerConnection.close();
      }
      newSocket.disconnect();
    };
  }, []); // Empty dependency array to run only once

  // Monitor remote stream changes and update video element
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      console.log('🎥 Setting remote stream to video element');
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(e => {
        console.log('Video play error in useEffect:', e);
        // Try to play again after user interaction
        const playVideo = () => {
          remoteVideoRef.current?.play().catch(console.log);
          document.removeEventListener('click', playVideo);
        };
        document.addEventListener('click', playVideo);
      });
    }
  }, [remoteStream]);

  const initializeLocalVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Could not access camera/microphone. Please check permissions.');
    }
  };

  // WebRTC functions
  const createPeerConnection = async (targetSocketId, socket, isInitiator) => {
    try {
      console.log('Creating peer connection with:', targetSocketId, 'isInitiator:', isInitiator);
      
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Add local stream to peer connection
      if (localStreamRef.current) {
        console.log('Adding local tracks to peer connection');
        localStreamRef.current.getTracks().forEach(track => {
          console.log('Adding track:', track.kind);
          pc.addTrack(track, localStreamRef.current);
        });
      } else {
        console.warn('No local stream available for peer connection');
      }

      // Handle remote stream
      pc.ontrack = (event) => {
        console.log('Received remote stream with tracks:', event.streams[0].getTracks().length);
        const [stream] = event.streams;
        console.log('Stream tracks:', stream.getTracks().map(t => t.kind));
        console.log('Stream active:', stream.active);
        console.log('Stream ID:', stream.id);
        
        setRemoteStream(stream);
        
        // Set remote video immediately and with delay as backup
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
          remoteVideoRef.current.play().catch(e => console.log('Video play error:', e));
          console.log('✅ Set remote video source immediately');
        }
        
        // Also set with delay as backup
        setTimeout(() => {
          if (remoteVideoRef.current && remoteVideoRef.current.srcObject !== stream) {
            remoteVideoRef.current.srcObject = stream;
            remoteVideoRef.current.play().catch(e => console.log('Video play error (delayed):', e));
            console.log('✅ Set remote video source with delay');
          }
        }, 500);
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Sending ICE candidate');
          socket.emit('ice-candidate', {
            roomId,
            targetSocketId,
            candidate: event.candidate
          });
        } else {
          console.log('ICE gathering complete');
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('Connection state:', pc.connectionState);
        if (pc.connectionState === 'connected') {
          console.log('🎉 WebRTC connection established successfully!');
        } else if (pc.connectionState === 'failed') {
          console.error('❌ WebRTC connection failed');
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', pc.iceConnectionState);
        if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
          console.log('🌐 ICE connection successful!');
        }
      };

      setPeerConnection(pc);

      // If initiator, create offer
      if (isInitiator) {
        console.log('Creating offer as initiator');
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log('Sending offer to:', targetSocketId);
        
        socket.emit('offer', {
          roomId,
          targetSocketId,
          offer
        });
      }

      return pc;
    } catch (error) {
      console.error('Error creating peer connection:', error);
    }
  };

  const handleOffer = async (offer, fromSocketId, socket) => {
    try {
      let pc = peerConnection;
      if (!pc) {
        pc = await createPeerConnection(fromSocketId, socket, false);
      }
      
      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      socket.emit('answer', {
        roomId,
        targetSocketId: fromSocketId,
        answer
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (answer) => {
    try {
      if (peerConnection) {
        await peerConnection.setRemoteDescription(answer);
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleIceCandidate = async (candidate) => {
    try {
      if (peerConnection) {
        await peerConnection.addIceCandidate(candidate);
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
        
        if (socket) {
          socket.emit('toggle-video', {
            roomId,
            isVideoOff: !videoTrack.enabled
          });
        }
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
        
        if (socket) {
          socket.emit('toggle-audio', {
            roomId,
            isMuted: !audioTrack.enabled
          });
        }
      }
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() && socket) {
      socket.emit('chat-message', {
        roomId,
        message: newMessage.trim()
      });
      setNewMessage('');
    }
  };

  const leaveCall = () => {
    if (socket) {
      socket.emit('leave-room', { roomId });
    }
    navigate('/');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-white text-lg font-semibold">Meeting Room</h1>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-gray-300 text-sm">
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <FiUsers className="text-gray-300 w-4 h-4" />
          <span className="text-gray-300 text-sm">{participants.length + 1} participants</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 relative bg-black">
          {/* Remote Video */}
          <div className="w-full h-full flex items-center justify-center">
            {participants.length > 0 ? (
              <div className="w-full h-full bg-gray-800 relative">
                {remoteStream ? (
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    muted={false}
                    controls={false}
                    className="w-full h-full object-cover"
                    onLoadedMetadata={() => console.log('🎬 Remote video metadata loaded')}
                    onPlay={() => console.log('▶️ Remote video started playing')}
                    onError={(e) => console.error('❌ Remote video error:', e)}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <span className="text-2xl font-bold">
                          {participants[0]?.userName?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-lg">{participants[0]?.userName}</p>
                      <p className="text-sm text-gray-400 capitalize">{participants[0]?.userRole}</p>
                      <p className="text-xs text-gray-500 mt-2">Connecting video...</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-white text-center">
                <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FiUsers className="w-10 h-10" />
                </div>
                <p className="text-lg">Waiting for others to join...</p>
                <p className="text-sm text-gray-400">Share the meeting link with participants</p>
              </div>
            )}
          </div>

          {/* Local Video (Picture in Picture) */}
          <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600">
            {isVideoOn ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <span className="text-lg font-bold">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs">You</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-4 bg-gray-800 bg-opacity-90 px-6 py-3 rounded-full">
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-full transition-colors ${
                  isAudioOn ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'
                }`}
              >
                {isAudioOn ? (
                  <FiMic className="w-5 h-5 text-white" />
                ) : (
                  <FiMicOff className="w-5 h-5 text-white" />
                )}
              </button>

              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full transition-colors ${
                  isVideoOn ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'
                }`}
              >
                {isVideoOn ? (
                  <FiVideo className="w-5 h-5 text-white" />
                ) : (
                  <FiVideoOff className="w-5 h-5 text-white" />
                )}
              </button>

              <button
                onClick={() => setShowChat(!showChat)}
                className="p-3 rounded-full bg-gray-600 hover:bg-gray-500 transition-colors"
              >
                <FiMessageSquare className="w-5 h-5 text-white" />
              </button>

              <button
                onClick={leaveCall}
                className="p-3 rounded-full bg-red-600 hover:bg-red-500 transition-colors"
              >
                <FiPhone className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Chat</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((message) => (
                <div key={message.id} className="flex flex-col">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {message.userName}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
                      {message.userRole}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 bg-gray-100 rounded-lg px-3 py-2">
                    {message.message}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={sendMessage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingRoom;
