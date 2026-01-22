import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiVideo, FiVideoOff, FiMic, FiMicOff, FiPhone, FiMessageSquare, FiUsers, FiMonitor, FiSettings } from 'react-icons/fi';
import { API_BASE_URL } from '../config/backendConfig';
import { connect, createLocalAudioTrack, createLocalVideoTrack } from 'twilio-video';

const MeetingRoom = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get URL parameters
  const roomId = searchParams.get('roomId');
  const sessionId = searchParams.get('sessionId');
  const userRole = searchParams.get('userRole');
  
  // States
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Refs
  const localVideoRef = useRef(null);
  const localAudioRef = useRef(null);
  const isMountedRef = useRef(true);
  
  // Get user info
  const user = useMemo(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }, []);

  // Validate parameters
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

  // Get Twilio token from backend
  const getTwilioToken = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/twilio/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          roomName: roomId,
          userName: user.name || `User_${user.id || user._id}`,
          userId: user.id || user._id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get Twilio token');
      }

      const data = await response.json();
      return data.token;
    } catch (err) {
      console.error('Error getting Twilio token:', err);
      setError('Failed to authenticate with video service');
      throw err;
    }
  }, [roomId, user]);

  // Join room
  const joinRoom = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get Twilio token
      const token = await getTwilioToken();

      // Create local tracks
      const audioTrack = await createLocalAudioTrack({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      const videoTrack = await createLocalVideoTrack({
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 24 }
      });

      // Connect to room
      const room = await connect(token, {
        name: roomId,
        audio: audioTrack,
        video: videoTrack,
        maxAudioBitrate: 16000,
        maxVideoBitrate: 2500000,
        networkQuality: {
          local: 1,
          remote: 1
        },
        dominantSpeaker: true,
        bandwidthProfile: {
          video: {
            mode: 'collaboration',
            maxSubscriptionBitrate: 2500000,
            dominantSpeakerPriority: 'high'
          }
        }
      });

      if (isMountedRef.current) {
        setRoom(room);
        setIsConnected(true);
        setParticipants(Array.from(room.participants.values()));

        // Handle participant join
        const participantJoinHandler = (participant) => {
          console.log('Participant joined:', participant.sid);
          setParticipants(prevParticipants => [...prevParticipants, participant]);
        };

        // Handle participant leave
        const participantLeaveHandler = (participant) => {
          console.log('Participant left:', participant.sid);
          setParticipants(prevParticipants =>
            prevParticipants.filter(p => p.sid !== participant.sid)
          );
        };

        room.on('participantConnected', participantJoinHandler);
        room.on('participantDisconnected', participantLeaveHandler);

        // Cleanup
        return () => {
          room.off('participantConnected', participantJoinHandler);
          room.off('participantDisconnected', participantLeaveHandler);
        };
      }
    } catch (err) {
      console.error('Error joining room:', err);
      setError(err.message || 'Failed to join meeting');
    } finally {
      setLoading(false);
    }
  }, [roomId, user, getTwilioToken]);

  // Initialize meeting
  useEffect(() => {
    joinRoom();

    return () => {
      isMountedRef.current = false;
      if (room) {
        setIsConnected(false);
        room.localParticipant.audioTracks.forEach(trackSubscription => {
          trackSubscription.track.stop();
        });
        room.localParticipant.videoTracks.forEach(trackSubscription => {
          trackSubscription.track.stop();
        });
        room.disconnect();
        setRoom(null);
      }
    };
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (room) {
      room.localParticipant.audioTracks.forEach(trackSubscription => {
        trackSubscription.track.enable(!isAudioOn);
      });
      setIsAudioOn(!isAudioOn);
    }
  }, [room, isAudioOn]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (room) {
      room.localParticipant.videoTracks.forEach(trackSubscription => {
        trackSubscription.track.enable(!isVideoOn);
      });
      setIsVideoOn(!isVideoOn);
    }
  }, [room, isVideoOn]);

  // Leave call
  const leaveCall = useCallback(() => {
    if (room) {
      room.localParticipant.audioTracks.forEach(trackSubscription => {
        trackSubscription.track.stop();
      });
      room.localParticipant.videoTracks.forEach(trackSubscription => {
        trackSubscription.track.stop();
      });
      room.disconnect();
    }
    navigate('/');
  }, [room, navigate]);

  // Send message
  const sendMessage = useCallback(() => {
    if (newMessage.trim() && room) {
      const message = {
        id: Date.now(),
        userName: user.name,
        userRole: userRole,
        message: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString()
      };
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  }, [newMessage, room, user, userRole]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4 mx-auto"></div>
          <p>Connecting to meeting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-500">Connection Error</h1>
          <p className="mb-4">{error}</p>
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
          {/* Participants Grid */}
          <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
            {/* Local Participant */}
            <div className="bg-gray-800 rounded-lg overflow-hidden relative">
              {room && (
                <Participant
                  key={room.localParticipant.sid}
                  participant={room.localParticipant}
                  isLocal={true}
                  userName={user.name}
                />
              )}
            </div>

            {/* Remote Participants */}
            {participants.map(participant => (
              <div key={participant.sid} className="bg-gray-800 rounded-lg overflow-hidden">
                <Participant
                  participant={participant}
                  isLocal={false}
                />
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-4 bg-gray-800 bg-opacity-90 px-6 py-3 rounded-full">
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-full transition-colors ${
                  isAudioOn ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'
                }`}
                title={isAudioOn ? 'Mute' : 'Unmute'}
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
                title={isVideoOn ? 'Stop Video' : 'Start Video'}
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
                title="Toggle Chat"
              >
                <FiMessageSquare className="w-5 h-5 text-white" />
              </button>

              <button
                onClick={leaveCall}
                className="p-3 rounded-full bg-red-600 hover:bg-red-500 transition-colors"
                title="Leave Call"
              >
                <FiPhone className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Chat</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((message) => (
                <div key={message.id} className="flex flex-col">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-white">
                      {message.userName}
                    </span>
                    <span className="text-xs text-gray-400 capitalize">
                      {message.userRole}
                    </span>
                    <span className="text-xs text-gray-500">
                      {message.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 bg-gray-700 rounded-lg px-3 py-2">
                    {message.message}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
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

// Participant Component
const Participant = ({ participant, isLocal, userName }) => {
  const videoRef = useRef();
  const audioRef = useRef();
  const videoTrack = useRef();
  const audioTrack = useRef();

  const videoSubscription = participant.videoTracks.size > 0 && Array.from(participant.videoTracks.values())[0];
  const audioSubscription = participant.audioTracks.size > 0 && Array.from(participant.audioTracks.values())[0];

  const videoIsEnabled = videoTrack.current === true;
  const audioIsEnabled = audioTrack.current === true;

  useEffect(() => {
    setVideoTrack(videoSubscription);
    return () => {
      setVideoTrack(undefined);
    };
  }, [videoSubscription]);

  useEffect(() => {
    setAudioTrack(audioSubscription);
    return () => {
      setAudioTrack(undefined);
    };
  }, [audioSubscription]);

  const setVideoTrack = (videoSubscription) => {
    if (videoTrack.current === videoSubscription) {
      return;
    }
    if (videoTrack.current) {
      videoTrack.current.unsubscribe();
    }
    if (videoSubscription) {
      videoSubscription.subscribe(videoRef.current);
      videoTrack.current = videoSubscription;
    } else {
      videoTrack.current = false;
    }
  };

  const setAudioTrack = (audioSubscription) => {
    if (audioTrack.current === audioSubscription) {
      return;
    }
    if (audioTrack.current) {
      audioTrack.current.unsubscribe();
    }
    if (audioSubscription) {
      audioSubscription.subscribe(audioRef.current);
      audioTrack.current = audioSubscription;
    } else {
      audioTrack.current = false;
    }
  };

  return (
    <div className="w-full h-full relative bg-gray-900 flex items-center justify-center">
      <audio ref={audioRef} autoPlay={true} muted={isLocal} />
      {videoIsEnabled ? (
        <video ref={videoRef} autoPlay={true} muted={isLocal} className="w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-white">
              {(userName || participant.identity || 'User').charAt(0).toUpperCase()}
            </span>
          </div>
          <p className="text-white font-medium">{userName || participant.identity || 'User'}</p>
          <p className="text-sm text-gray-400">{isLocal ? 'You' : 'Participant'}</p>
        </div>
      )}
    </div>
  );
};

export default MeetingRoom;
