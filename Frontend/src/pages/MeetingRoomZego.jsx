import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { 
  ZEGO_UI_CONFIG, 
  ZEGO_STYLE_CONFIG, 
  ZEGO_TEXT_CONFIG, 
  ZEGO_BRANDING_CONFIG,
  ZEGO_THEMES 
} from '../config/zegoConfig';

const MeetingRoomZego = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get URL parameters
  const roomId = searchParams.get('roomId');
  const sessionId = searchParams.get('sessionId');
  const userRole = searchParams.get('userRole');
  
  // States
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState([]);
  
  // Refs
  const meetingContainerRef = useRef(null);
  const isMountedRef = useRef(true);
  
  // Get user info (memoize to prevent re-renders)
  const user = useMemo(() => {
    const userData = localStorage.getItem('user');
    const parsedUser = userData ? JSON.parse(userData) : null;
    console.log('User data from localStorage:', parsedUser);
    return parsedUser;
  }, []);

  // ZegoCloud Configuration - You'll provide these credentials
  const ZEGO_CONFIG = {
    appID: 1797883520, // Replace with your ZegoCloud App ID
    serverSecret: "998c5a5fd88e6a612fb75f2b488fe56a", // Replace with your ZegoCloud Server Secret
  };

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
        console.log('Initializing ZegoCloud with:', {
          appID: ZEGO_CONFIG.appID,
          roomId,
          userId: userId,
          userName: user.name
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

        // Configure meeting settings with custom UI
        const meetingConfig = {
          container: meetingContainerRef.current,
          sharedLinks: [
            {
              name: 'Meeting Link',
              url: window.location.protocol + '//' + window.location.host + window.location.pathname + '?roomId=' + roomId + '&sessionId=' + sessionId + '&userRole=' + userRole,
            },
          ],
          scenario: {
            mode: ZegoUIKitPrebuilt.VideoConference,
          },
          
          // Apply UI configuration from config file
          ...ZEGO_UI_CONFIG,
          
          // Callbacks
          onJoinRoom: () => {
            console.log('✅ Joined ZegoCloud room:', roomId);
            setIsConnected(true);
            setParticipants(prev => [...prev, { userId: userId, userName: user.name, userRole }]);
          },
          
          onLeaveRoom: () => {
            console.log('👋 Left ZegoCloud room');
            setIsConnected(false);
            navigate('/');
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
          theme: ZEGO_THEMES.purple, // Options: dark, light, purple, blue, green, red
          
          // Apply branding configuration
          branding: ZEGO_BRANDING_CONFIG,
          
          // Apply custom text/labels
          text: ZEGO_TEXT_CONFIG,
        };

        // Join the room
        console.log('Joining room with config:', meetingConfig);
        zp.joinRoom(meetingConfig);
        console.log('✅ Successfully joined ZegoCloud room');

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

    // Initialize with a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        initializeMeeting();
      }
    }, 1000);

    // Cleanup
    return () => {
      clearTimeout(timer);
      isMountedRef.current = false;
    };
  }, [roomId, sessionId, user, navigate]);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-white text-lg font-semibold">Meeting Room - {userRole}</h1>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-gray-300 text-sm">
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-gray-300 text-sm">Room: {roomId?.slice(-8)}</span>
        </div>
      </div>

      {/* ZegoCloud Meeting Container */}
      <div className="flex-1 h-screen">
        {ZEGO_CONFIG.appID ? (
          <div 
            ref={meetingContainerRef} 
            className="w-full h-full"
            style={{ height: 'calc(100vh - 80px)' }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-center">
              <h2 className="text-xl font-bold mb-4">ZegoCloud Configuration Required</h2>
              <p className="text-gray-400 mb-4">
                Please provide your ZegoCloud App ID and Server Secret to enable video calling.
              </p>
              <div className="bg-gray-800 p-4 rounded-lg text-left">
                <p className="text-sm text-gray-300 mb-2">Update the configuration in MeetingRoomZego.jsx:</p>
                <code className="text-green-400 text-sm">
                  const ZEGO_CONFIG = {`{`}<br/>
                  &nbsp;&nbsp;appID: YOUR_APP_ID,<br/>
                  &nbsp;&nbsp;serverSecret: "YOUR_SERVER_SECRET",<br/>
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
