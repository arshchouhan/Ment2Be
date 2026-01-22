import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config/backendConfig';
import { getBackendUrl } from '../utils/apiUrl.js';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { io } from 'socket.io-client';
import { 
  ZEGO_UI_CONFIG, 
  ZEGO_STYLE_CONFIG, 
  ZEGO_TEXT_CONFIG, 
  ZEGO_BRANDING_CONFIG,
  ZEGO_THEMES 
} from '../config/zegoConfig';

const MeetingRoomZego = () => {
  const navigate = useNavigate();
  const { roomId, sessionId } = useParams();
  const location = useLocation();
  
  console.log('MeetingRoomZego - URL Params:', { roomId, sessionId });
  console.log('MeetingRoomZego - Pathname:', location.pathname);
  
  // Determine user role from URL path
  const userRole = location.pathname.includes('/student/') ? 'student' : 'mentor';
  
  // States
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [sessionDuration, setSessionDuration] = useState(3600); // 60 minutes in seconds
  const [sessionEnded, setSessionEnded] = useState(false);
  const [showEndedPopup, setShowEndedPopup] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [sessionStartTime, setSessionStartTime] = useState(null); // Track when session actually started
  const [endedByOther, setEndedByOther] = useState(null); // Track who ended the session
  
  // Refs
  const meetingContainerRef = useRef(null);
  const isMountedRef = useRef(true);
  const socketRef = useRef(null);
  
  // Get user info (memoize to prevent re-renders)
  const user = useMemo(() => {
    const userData = localStorage.getItem('user');
    const parsedUser = userData ? JSON.parse(userData) : null;
    console.log('User data from localStorage:', parsedUser);
    return parsedUser;
  }, []);

  // ZegoCloud Configuration - Load from environment variables
  const ZEGO_CONFIG = {
    appID: parseInt(import.meta.env.VITE_ZEGO_APP_ID || '1797883520'),
    serverSecret: import.meta.env.VITE_ZEGO_SERVER_SECRET || "998c5a5fd88e6a612fb75f2b488fe56a",
  };

  // Start session timer - 60 minutes
  const startSessionTimer = () => {
    console.log('⏱️ Starting 60-minute session timer...');
    
    const timerInterval = setInterval(() => {
      setSessionDuration(prev => {
        const newDuration = prev - 1;
        
        // Log every 5 minutes
        if (newDuration % 300 === 0) {
          const minutes = Math.floor(newDuration / 60);
          console.log(`⏱️ Session time remaining: ${minutes} minutes`);
        }
        
        // When timer reaches 0, end session
        if (newDuration <= 0) {
          clearInterval(timerInterval);
          endSession();
          return 0;
        }
        
        return newDuration;
      });
    }, 1000); // Update every second
  };

  // End session - show popup and redirect to journal
  const endSession = async (isManualLeave = false, triggeredByOther = false) => {
    // Prevent double-ending
    if (sessionEnded) return;
    
    console.log(isManualLeave ? '👋 User left session manually' : '⏰ 60-minute session time has ended');
    setSessionEnded(true);
    setShowEndedPopup(true);
    
    // Calculate actual session duration
    const sessionEndTime = new Date();
    const actualDurationSeconds = sessionStartTime 
      ? Math.floor((sessionEndTime - sessionStartTime) / 1000) 
      : 0;
    
    console.log(`📊 Actual session duration: ${actualDurationSeconds} seconds (${Math.floor(actualDurationSeconds / 60)} minutes)`);
    
    // Notify other participant via Socket.IO (only if we initiated the end)
    if (!triggeredByOther && socketRef.current && roomId) {
      socketRef.current.emit('end-session', {
        roomId,
        sessionId,
        endedBy: user?.id || user?._id,
        endedByName: user?.name,
        endedByRole: userRole
      });
      console.log('📤 Notified other participant that session ended');
    }
    
    // Update session status in backend with actual duration
    try {
      const token = localStorage.getItem('token');
      if (token && sessionId) {
        const response = await fetch(`${API_BASE_URL}/bookings/${sessionId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            status: 'completed',
            actualDuration: actualDurationSeconds,
            sessionStartedAt: sessionStartTime?.toISOString(),
            sessionEndedAt: sessionEndTime.toISOString()
          })
        });
        
        if (!response.ok) {
          console.error('Failed to mark session as completed:', await response.text());
        }
        console.log('✅ Session marked as completed in database with duration:', actualDurationSeconds);
      }
    } catch (error) {
      console.error('Error updating session status:', error);
    }
    
    // Start countdown for redirect
    let countdown = 5;
    const countdownInterval = setInterval(() => {
      countdown -= 1;
      setRedirectCountdown(countdown);
      
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        // Redirect to journal page
        navigate(userRole === 'mentor' ? '/mentor/journal' : '/student/journal', {
          state: { sessionId, fromSession: true }
        });
      }
    }, 1000);
  };

  // Socket.IO connection for session sync
  useEffect(() => {
    // Connect to Socket.IO server
    const socket = io(getBackendUrl());
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Connected to Socket.IO for session sync');
      
      // Join the room for this session
      if (roomId && user) {
        socket.emit('join-room', {
          roomId,
          userId: user.id || user._id,
          userName: user.name,
          userRole
        });
      }
    });

    // Listen for session ended by other participant
    socket.on('session-ended', (data) => {
      console.log('📥 Session ended by other participant:', data);
      
      // Only handle if we didn't initiate the end
      const myUserId = user?.id || user?._id;
      if (data.endedBy !== myUserId && !sessionEnded) {
        setEndedByOther({
          name: data.endedByName,
          role: data.endedByRole
        });
        endSession(true, true); // triggeredByOther = true
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from Socket.IO');
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [roomId, user, userRole]);

  // Prevent user from leaving the meeting page
  useEffect(() => {
    if (!isConnected) return;

    // Handle browser back button and page navigation
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'If you leave the session, it will be marked as expired. Are you sure you want to leave?';
      return 'If you leave the session, it will be marked as expired. Are you sure you want to leave?';
    };

    // Handle navigation attempts
    const handlePopState = (e) => {
      e.preventDefault();
      alert('⚠️ If you leave the session, it will be marked as expired. Please end the session properly.');
      window.history.pushState(null, null, window.location.href);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    window.history.pushState(null, null, window.location.href);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isConnected]);

  useEffect(() => {
    // Initialize ZegoCloud meeting
    const initializeMeeting = async () => {
      if (!meetingContainerRef.current || !ZEGO_CONFIG.appID) {
        console.error('ZegoCloud configuration missing or container not ready');
        return;
      }

      if (!user || (!user.id && !user._id) || !user.name) {
        console.error('User information missing:', user);
        alert('User information is required to join the meeting. Please log in again.');
        navigate('/');
        return;
      }

      // Use _id if id is not available (MongoDB format)
      const userId = user.id || user._id;

      if (!roomId) {
        console.error('Room ID missing');
        alert('Room ID is required to join the meeting.');
        navigate('/');
        return;
      }

      try {
        console.log('Initializing ZegoCloud 1-on-1 Tutoring with:', {
          appID: ZEGO_CONFIG.appID,
          roomId,
          userId: userId,
          userName: user.name,
          mode: 'OneONOneCall'
        });

        // Generate Kit Token for authentication
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          ZEGO_CONFIG.appID,
          ZEGO_CONFIG.serverSecret,
          roomId,
          userId.toString(), // Ensure user ID is string
          user.name || `User_${userId}`
        );

        console.log('Generated kit token successfully');

        // Create ZegoCloud instance
        const zp = ZegoUIKitPrebuilt.create(kitToken);
        
        if (!zp) {
          throw new Error('Failed to create ZegoCloud instance');
        }

        console.log('ZegoCloud instance created successfully');

        // Configure meeting settings with 1-on-1 Tutoring mode
        const meetingConfig = {
          container: meetingContainerRef.current,
          sharedLinks: [
            {
              name: 'Meeting Link',
              url: window.location.protocol + '//' + window.location.host + window.location.pathname,
            },
          ],
          scenario: {
            mode: ZegoUIKitPrebuilt.OneONOneCall,
          },
          
          // Apply UI configuration from config file
          ...ZEGO_UI_CONFIG,
          
          // Callbacks
          onJoinRoom: () => {
            console.log('✅ Joined ZegoCloud 1-on-1 Tutoring room:', roomId);
            setIsConnected(true);
            setParticipants(prev => [...prev, { userId: userId, userName: user.name, userRole }]);
            
            // Track session start time
            setSessionStartTime(new Date());
            console.log('⏱️ Session started at:', new Date().toISOString());
            
            // Start 60-minute session timer
            startSessionTimer();
          },
          
          onLeaveRoom: () => {
            console.log('👋 Left ZegoCloud room');
            setIsConnected(false);
            endSession(true); // Manual leave - show popup and redirect to journal
          },
          
          onUserJoin: (users) => {
            console.log('👥 Users joined:', users);
            users.forEach(user => {
              setParticipants(prev => {
                const exists = prev.find(p => p.userId === user.userID);
                if (!exists) {
                  return [...prev, { 
                    userId: user.userID, 
                    userName: user.userName,
                    userRole: 'participant' 
                  }];
                }
                return prev;
              });
            });
          },
          
          onUserLeave: (users) => {
            console.log('👋 Users left:', users);
            users.forEach(user => {
              setParticipants(prev => prev.filter(p => p.userId !== user.userID));
            });
          },

          // Apply ZegoCloud theme (change this to switch themes)
          theme: ZEGO_THEMES.dark, // Options: dark, light, purple, blue, green, red
          
          // Apply branding configuration
          branding: ZEGO_BRANDING_CONFIG,
          
          // Apply custom text/labels
          text: ZEGO_TEXT_CONFIG,
        };

        // Join the room
        console.log('Joining room with 1-on-1 Tutoring config:', meetingConfig);
        zp.joinRoom(meetingConfig);
        console.log('✅ Successfully joined ZegoCloud 1-on-1 Tutoring room');

      } catch (error) {
        console.error('❌ Error initializing ZegoCloud meeting:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          user: user,
          roomId: roomId,
          appID: ZEGO_CONFIG.appID
        });
        alert(`Failed to initialize video call: ${error.message}. Please check your connection and try again.`);
      }
    };

    // Only initialize once when component mounts
    if (isMountedRef.current && roomId && user) {
      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          initializeMeeting();
        }
      }, 500);

      return () => {
        clearTimeout(timer);
      };
    }
  }, []);

  return (
    <div className="h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex flex-col overflow-hidden">
      {/* Session Ended Popup */}
      {showEndedPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121212] border border-gray-700 rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Session Ended</h2>
            <p className="text-gray-400 mb-6">
              {endedByOther 
                ? `${endedByOther.name} (${endedByOther.role}) has ended the session. You're being redirected to your journal.`
                : "Your mentoring session has ended successfully. You're being redirected to your journal to record your session insights."
              }
            </p>
            <div className="flex items-center justify-center space-x-2 text-gray-300">
              <svg className="w-5 h-5 animate-spin text-blue-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Redirecting to Journal in <span className="text-white font-bold">{redirectCountdown}</span> seconds...</span>
            </div>
            <button
              onClick={() => navigate(userRole === 'mentor' ? '/mentor/journal' : '/student/journal', { state: { sessionId, fromSession: true } })}
              className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Go to Journal Now
            </button>
          </div>
        </div>
      )}

      <style>{`
        * {
          box-shadow: none !important;
        }
        
        /* Modern gradient background */
        body {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
        }
        
        /* Override ZegoCloud blue button to gray */
        button {
          background-color: #374151 !important;
          color: #ffffff !important;
        }
        
        button:hover {
          background-color: #4b5563 !important;
        }
        
        /* Override all blue colors */
        [style*="blue"],
        [style*="Blue"],
        [style*="#0066ff"],
        [style*="#007bff"],
        [style*="rgb(0, 102, 255)"],
        [style*="rgb(0, 123, 255)"] {
          background-color: #374151 !important;
          color: #ffffff !important;
        }
        
        /* Remove background from copy/icon buttons */
        svg {
          background-color: transparent !important;
        }
        
        [class*="icon"],
        [class*="copy"],
        [class*="btn"] svg {
          background-color: transparent !important;
        }
      `}</style>
      
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#121212] border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-white text-lg font-bold">Meeting Room</h1>
              <p className="text-gray-400 text-xs capitalize">{userRole}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-8 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="text-gray-300 text-sm">
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-8">
          {/* Session Timer */}
          <div className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-900/40 to-blue-800/40 border border-blue-700/50">
            <svg className="w-5 h-5 text-blue-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-right">
              <p className="text-gray-400 text-xs">Session Time</p>
              <p className={`text-white font-mono font-bold text-sm ${sessionDuration <= 300 ? 'text-red-400 animate-pulse' : 'text-blue-400'}`}>
                {Math.floor(sessionDuration / 60)}:{String(sessionDuration % 60).padStart(2, '0')}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-gray-400 text-xs">Room ID</p>
            <p className="text-white font-mono text-sm">{roomId?.slice(-8)}</p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 mt-24 overflow-hidden">
        {ZEGO_CONFIG.appID ? (
          <div 
            ref={meetingContainerRef} 
            className="w-full h-full"
            style={{}}
          />
        ) : (
          <div className="flex items-center justify-center" style={{ minHeight: '700px' }}>
            <div className="text-center max-w-md mx-auto">
              <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-800 border border-gray-700">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Configuration Required</h2>
              <p className="text-gray-400 mb-6">
                ZegoCloud credentials are not configured. Please update the configuration.
              </p>
              <div className="bg-gray-800 border border-gray-700 p-4 rounded-xl text-left">
                <p className="text-sm text-gray-300 mb-3 font-mono">MeetingRoomZego.jsx</p>
                <code className="text-gray-300 text-xs leading-relaxed block">
                  const ZEGO_CONFIG = {`{`}<br/>
                  &nbsp;&nbsp;appID: YOUR_APP_ID,<br/>
                  &nbsp;&nbsp;serverSecret: "YOUR_SECRET",<br/>
                  {`}`}
                </code>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingRoomZego;
