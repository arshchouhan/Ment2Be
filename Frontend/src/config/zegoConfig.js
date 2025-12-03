// ZegoCloud UI Customization Configuration

export const ZEGO_UI_CONFIG = {
  // Basic UI Controls
  showScreenSharingButton: true,
  showTextChat: true,
  showUserList: true,
  showPinButton: true,
  showLayoutButton: true,
  showRoomDetailsButton: false,
  showTurnOffRemoteCameraButton: false,
  showTurnOffRemoteMicrophoneButton: false,
  showRemoveUserButton: false,
  
  // Video/Audio Controls
  showMyCameraToggleButton: true,
  showMyMicrophoneToggleButton: true,
  showAudioVideoSettingsButton: true,
  turnOnMicrophoneWhenJoining: true,
  turnOnCameraWhenJoining: true,
  
  // Display Settings
  showRoomTimer: true,
  showConnectionStatus: true,
  showSoundWavesInAudioMode: true,
  showNonVideoUser: true,
  showOnlyAudioUser: true,
  
  // Layout Options
  layout: "Auto", // "Auto", "Sidebar", "Grid"
  maxUsers: 2,
  
  // ZegoCloud Theme Configuration
  theme: {
    mode: 'dark', // 'dark' or 'light'
    primaryColor: '#4f46e5', // Main theme color
  },
};

export const ZEGO_STYLE_CONFIG = {
  // Main container
  backgroundColor: '#1a1a1a',
  color: '#ffffff',
  
  // Video containers
  videoContainer: {
    backgroundColor: '#2d2d2d',
    borderRadius: '12px',
    border: '2px solid #374151',
  },
  
  // Control bar at bottom
  controlBar: {
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    borderRadius: '30px',
    padding: '12px 20px',
    backdropFilter: 'blur(10px)',
  },
  
  // Individual buttons
  button: {
    backgroundColor: '#4f46e5',
    borderRadius: '50%',
    border: 'none',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
    transition: 'all 0.2s ease',
  },
  
  // Button hover states
  buttonHover: {
    backgroundColor: '#6366f1',
    transform: 'scale(1.05)',
  },
  
  // Chat panel
  chatContainer: {
    backgroundColor: '#374151',
    borderRadius: '12px',
    border: '1px solid #4b5563',
  },
  
  // Chat messages
  chatMessage: {
    backgroundColor: '#4b5563',
    borderRadius: '8px',
    padding: '8px 12px',
    marginBottom: '8px',
  },
  
  // User list
  userListContainer: {
    backgroundColor: '#374151',
    borderRadius: '12px',
    border: '1px solid #4b5563',
  },
  
  // Screen sharing
  screenShareContainer: {
    backgroundColor: '#111827',
    borderRadius: '12px',
    border: '2px solid #6366f1',
  },
};

export const ZEGO_TEXT_CONFIG = {
  // Dialog messages
  leaveConfirmDialogInfo: 'Are you sure you want to leave this mentoring session?',
  removeUserConfirmDialogInfo: 'Remove this participant from the session?',
  
  // Permission tooltips
  microphonePermissionDeniedTooltip: 'Please allow microphone access to participate in the session',
  cameraPermissionDeniedTooltip: 'Please allow camera access to participate in the session',
  screenSharingPermissionDeniedTooltip: 'Please allow screen sharing to share your screen',
  
  // Button labels
  joinRoomButton: 'Join Session',
  leaveRoomButton: 'Leave Session',
  muteButton: 'Mute',
  unmuteButton: 'Unmute',
  cameraOnButton: 'Camera On',
  cameraOffButton: 'Camera Off',
  screenShareButton: 'Share Screen',
  chatButton: 'Chat',
  participantsButton: 'Participants',
  
  // Status messages
  connecting: 'Connecting to session...',
  connected: 'Connected to session',
  reconnecting: 'Reconnecting...',
  disconnected: 'Disconnected from session',
  
  // Chat placeholders
  chatInputPlaceholder: 'Type your message here...',
  chatSendButton: 'Send',
  
  // Error messages
  networkError: 'Network connection error. Please check your internet connection.',
  cameraError: 'Unable to access camera. Please check your camera permissions.',
  microphoneError: 'Unable to access microphone. Please check your microphone permissions.',
};

export const ZEGO_BRANDING_CONFIG = {
  logoURL: '', // Add your logo URL here
  companyName: 'K23DX Mentoring Platform',
  primaryColor: '#4f46e5',
  secondaryColor: '#6366f1',
  accentColor: '#8b5cf6',
};

// ZegoCloud Theme Presets
export const ZEGO_THEMES = {
  // Dark Theme
  dark: {
    mode: 'dark',
    primaryColor: '#4f46e5', // Indigo
    backgroundColor: '#1f2937',
    surfaceColor: '#374151',
    textColor: '#ffffff',
    borderColor: '#4b5563',
  },
  
  // Light Theme  
  light: {
    mode: 'light',
    primaryColor: '#3b82f6', // Blue
    backgroundColor: '#ffffff',
    surfaceColor: '#f8fafc',
    textColor: '#1f2937',
    borderColor: '#e2e8f0',
  },
  
  // Purple Theme
  purple: {
    mode: 'dark',
    primaryColor: '#8b5cf6', // Purple
    backgroundColor: '#1e1b4b',
    surfaceColor: '#312e81',
    textColor: '#ffffff',
    borderColor: '#4c1d95',
  },
  
  // Blue Theme
  blue: {
    mode: 'dark',
    primaryColor: '#0ea5e9', // Sky Blue
    backgroundColor: '#0c4a6e',
    surfaceColor: '#075985',
    textColor: '#ffffff',
    borderColor: '#0284c7',
  },
  
  // Green Theme
  green: {
    mode: 'dark',
    primaryColor: '#10b981', // Emerald
    backgroundColor: '#064e3b',
    surfaceColor: '#065f46',
    textColor: '#ffffff',
    borderColor: '#059669',
  },
  
  // Red Theme
  red: {
    mode: 'dark',
    primaryColor: '#ef4444', // Red
    backgroundColor: '#7f1d1d',
    surfaceColor: '#991b1b',
    textColor: '#ffffff',
    borderColor: '#dc2626',
  },
};
