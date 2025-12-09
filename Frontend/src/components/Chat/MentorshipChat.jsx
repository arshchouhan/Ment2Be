import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { ContextSidebar } from "./ContextSidebar";
import { ChatList } from "./ChatList";
import { MessageTypes, createMessage, createConversation } from "../../lib/types";
import { messageService } from "../../services/messageService";
import * as streamChatClient from "../../services/streamChatClient";


export function MentorshipChat() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedType, setSelectedType] = useState(MessageTypes.NORMAL);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeParticipant, setActiveParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const [channel, setChannel] = useState(null);

  // Get current user info
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  
  // Get user ID (could be 'id' or '_id')
  const userId = currentUser.id || currentUser._id;
  
  // Debug authentication state
  console.log('Auth Debug:', {
    hasToken: !!token,
    hasUserId: !!userId,
    userId: userId,
    userRole: currentUser.role,
    userName: currentUser.name,
    userObject: currentUser
  });
  
  // Check if user is authenticated
  useEffect(() => {
    if (!token || !userId) {
      console.log('Authentication failed - redirecting to login');
      setError('Please log in to access the messaging system.');
      setLoading(false);
      return;
    }
  }, [token, userId]);

  // Initialize Stream Chat connection and fetch conversations on component mount
  useEffect(() => {
    const initializeStreamChat = async () => {
      try {
        if (!token || !userId) return;

        const apiKey = import.meta.env.VITE_STREAM_CHAT_API_KEY;
        if (!apiKey) {
          console.error('Stream Chat API Key not configured');
          return;
        }

        // Fetch token from backend
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
        const apiUrl = `${baseUrl}/stream/auth/token`;
        console.log('🔌 Fetching Stream Chat token from:', apiUrl);
        console.log('📝 Backend Base URL:', baseUrl);
        console.log('🔑 Has JWT Token:', !!token);
        console.log('👤 User ID:', userId);
        
        const tokenResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: currentUser.name || 'Mentor',
            image: currentUser.profilePicture || ''
          })
        });

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json().catch(() => ({}));
          console.error('Stream Chat token error response:', {
            status: tokenResponse.status,
            statusText: tokenResponse.statusText,
            error: errorData
          });
          throw new Error(`Failed to get Stream Chat token: ${tokenResponse.status} ${tokenResponse.statusText}`);
        }

        const responseData = await tokenResponse.json();
        const { apiKey: responseApiKey, token: streamToken } = responseData;
        
        if (!streamToken) {
          throw new Error('No Stream Chat token in response');
        }
        
        console.log('✓ Got Stream Chat token from backend');

        // Connect to Stream Chat
        await streamChatClient.connectUser(
          responseApiKey || apiKey,
          userId,
          streamToken,
          {
            name: currentUser.name || 'Mentor',
            image: currentUser.profilePicture || ''
          }
        );

        console.log('✓ Stream Chat initialized for mentor');
        fetchConversations();
      } catch (error) {
        console.error('Error initializing Stream Chat:', error);
        setError('Failed to initialize chat');
      }
    };

    if (token && userId) {
      initializeStreamChat();
    }

    // Don't disconnect on unmount - keep the connection alive for other components
    return () => {
      // No cleanup needed - connection is shared across components
    };
  }, [token, userId]);

  // Listen for storage changes (when user logs in in another tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        window.location.reload(); // Reload to get fresh auth state
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handle escape key to close chat
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && activeConversationId) {
        setActiveConversationId(null);
        setActiveParticipant(null);
      }
    };

    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [activeConversationId]);

  // Join Stream Chat channel when active conversation changes
  useEffect(() => {
    const joinChannel = async () => {
      if (!activeConversationId || !token || !activeParticipant) return;

      setLoadingMessages(true);
      try {
        // Create or get channel on backend
        const channelResponse = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/stream/channels/upsert`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              studentId: activeParticipant.participantId,
              mentorId: userId
            })
          }
        );

        if (!channelResponse.ok) {
          throw new Error('Failed to create/get channel');
        }

        const { channelId } = await channelResponse.json();

        // Get or create channel on client
        const ch = await streamChatClient.getOrCreateChannel(channelId, {
          name: `Mentor-Student: ${userId}-${activeParticipant.participantId}`,
          members: [userId, activeParticipant.participantId]
        });

        setChannel(ch);

        // Load message history
        const msgs = await streamChatClient.getMessages(ch, 50);
        const formatted = msgs.map(m => ({
          id: m.id,
          content: m.text,
          text: m.text,
          sender: m.user.id === userId ? 'mentor' : 'mentee',
          type: m.type || '',
          custom_type: m.custom_type || MessageTypes.NORMAL,
          timestamp: new Date(m.created_at),
          created_at: m.created_at,
          senderName: m.user?.name || 'Unknown User',
          receiverName: activeParticipant?.name
        }));

        setMessages(formatted);

        // Listen to new messages
        streamChatClient.onMessageReceived(ch, (message) => {
          console.log('New message received:', message);
          console.log('Message user:', message.user);
          console.log('Message user name:', message.user?.name);
          
          setMessages(prev => {
            const isDuplicate = prev.some(m => m.id === message.id);
            if (isDuplicate) return prev;

            return [...prev, {
              id: message.id,
              content: message.text,
              text: message.text,
              sender: message.user.id === userId ? 'mentor' : 'mentee',
              type: message.type || '',
              custom_type: message.custom_type || MessageTypes.NORMAL,
              timestamp: new Date(message.created_at),
              created_at: message.created_at,
              senderName: message.user?.name || 'Unknown User',
              receiverName: activeParticipant?.name
            }];
          });

          // Update conversation list with last message
          setConversations(prev => prev.map(conv => {
            if (conv.participantId === activeParticipant.participantId) {
              return {
                ...conv,
                lastMessage: message.text,
                lastMessageTime: new Date(message.created_at)
              };
            }
            return conv;
          }));
        });

        console.log('✓ Joined Stream Chat channel:', channelId);
      } catch (error) {
        console.error('Error joining channel:', error);
        setError('Failed to join chat channel');
      } finally {
        setLoadingMessages(false);
      }
    };

    joinChannel();
  }, [activeConversationId, activeParticipant?.participantId, userId, token]);

  // Fetch and transform confirmed sessions into conversation format
  const fetchConfirmedSessions = async () => {
    try {
      const sessions = await messageService.getConfirmedSessions();
      return sessions.map(session => {
        // Determine if current user is mentor or mentee
        const isMentor = session.mentor?._id === userId || session.mentor?.id === userId;
        const otherUser = isMentor ? session.student : session.mentor;
        
        return {
          id: `session_${session._id || session.id}`,
          participantId: otherUser?._id || otherUser?.id,
          mentorName: otherUser?.name || 'Session User',
          mentorAvatar: otherUser?.profilePicture || '',
          mentorRole: isMentor ? 'Mentee' : 'Mentor',
          lastMessage: `Session on ${new Date(session.sessionDate).toLocaleDateString()}`,
          lastMessageTime: new Date(session.updatedAt || session.createdAt || new Date()),
          unreadCount: 0,
          isOnline: false,
          isSession: true,
          sessionData: session
        };
      });
    } catch (error) {
      console.error('Error fetching confirmed sessions:', error);
      return [];
    }
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      
      // Fetch both conversations and confirmed sessions in parallel
      const [conversationsData, confirmedSessions] = await Promise.all([
        messageService.getConversations(),
        fetchConfirmedSessions()
      ]);
      
      // Transform regular conversations
      const transformedConversations = conversationsData.map(conv => ({
        id: conv.conversationId,
        participantId: conv.participantId,
        mentorName: conv.participantName,
        mentorAvatar: conv.profilePicture || "",
        mentorRole: conv.participantBio || `${conv.participantRole} User`,
        lastMessage: conv.lastMessage,
        lastMessageTime: new Date(conv.lastMessageTime),
        unreadCount: conv.unreadCount,
        isOnline: conv.isOnline,
        isSession: false
      }));

      // Deduplicate conversations by participantId to prevent multiple chats with same user
      const conversationMap = new Map();
      
      // Add regular conversations first (they have message history)
      transformedConversations.forEach(conv => {
        conversationMap.set(conv.participantId, conv);
      });
      
      // Add confirmed sessions only if not already in map
      confirmedSessions.forEach(session => {
        if (!conversationMap.has(session.participantId)) {
          conversationMap.set(session.participantId, session);
        }
      });
      
      // Convert map to array and sort by last message time (newest first)
      const allConversations = Array.from(conversationMap.values())
        .sort((a, b) => b.lastMessageTime - a.lastMessageTime);

      setConversations(allConversations);
      
      // Don't auto-select any conversation - let user click to start chatting
      // if (allConversations.length > 0 && !activeConversationId) {
      //   const firstConv = allConversations[0];
      //   setActiveConversationId(firstConv.id);
      //   setActiveParticipant({
      //     participantId: firstConv.participantId,
      //     name: firstConv.mentorName,
      //     role: firstConv.mentorRole,
      //     avatar: firstConv.mentorAvatar,
      //     isSession: firstConv.isSession,
      //     sessionData: firstConv.sessionData
      //   });
      // }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      if (err.message.includes('Authentication required') || err.message.includes('Access denied')) {
        setError('Please log in to view your conversations.');
      } else {
        setError('Failed to load conversations. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (participantId) => {
    try {
      const messagesData = await messageService.getConversationMessages(participantId);
      
      // Transform API data to match component expectations
      const transformedMessages = messagesData.map(msg => ({
        id: msg._id,
        content: msg.content,
        sender: msg.sender._id === userId ? 'mentor' : 'mentee',
        type: msg.messageType,
        timestamp: new Date(msg.createdAt),
        senderName: msg.sender.name,
        receiverName: msg.receiver.name
      }));

      setMessages(transformedMessages);
      
      // Mark messages as read
      if (messagesData.length > 0) {
        await messageService.markMessagesAsRead(participantId);
        // Update conversation unread count
        setConversations(prev => prev.map(conv => 
          conv.participantId === participantId 
            ? { ...conv, unreadCount: 0 }
            : conv
        ));
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    }
  };

  const handleSendMessage = async (content) => {
    if (!activeParticipant || !channel) return;

    // Check if Stream Chat client is connected
    if (!streamChatClient.isConnected()) {
      console.error('Stream Chat client not connected');
      setError('Chat connection lost. Please refresh the page.');
      return;
    }

    try {
      // Send message via Stream Chat
      const sentMessage = await streamChatClient.sendMessage(channel, content, {
        type: selectedType
      });

      // Add message to local state
      const newMessage = {
        id: sentMessage.id,
        content: sentMessage.text,
        sender: 'mentor', // Current user is mentor
        type: sentMessage.type || MessageTypes.NORMAL,
        timestamp: new Date(sentMessage.created_at),
        senderName: currentUser.name,
        receiverName: activeParticipant.name
      };

      setMessages(prev => [...prev, newMessage]);
      setSelectedType(MessageTypes.NORMAL);

      // Update conversation last message
      setConversations(prev => prev.map(conv => 
        conv.participantId === activeParticipant.participantId
          ? { 
              ...conv, 
              lastMessage: content,
              lastMessageTime: new Date()
            }
          : conv
      ));

      // Also save to database for persistence
      await messageService.sendMessage(
        activeParticipant.participantId,
        content,
        selectedType
      );
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const handleSelectConversation = (conversationId) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (!conversation) return;

    setActiveConversationId(conversationId);
    
    if (conversation.isSession && conversation.sessionData) {
      // For session conversations, extract the other user's details from the session data
      const session = conversation.sessionData;
      const isMentor = session.mentor?._id === userId || session.mentor?.id === userId;
      const otherUser = isMentor ? session.student : session.mentor;
      
      const participantInfo = {
        participantId: otherUser?._id || otherUser?.id || conversation.participantId,
        name: otherUser?.name || conversation.mentorName || 'Session User',
        role: isMentor ? 'Mentee' : 'Mentor',
        avatar: otherUser?.profilePicture || conversation.mentorAvatar || '',
        isSession: true,
        sessionData: {
          ...session,
          sessionDate: session.sessionDate ? new Date(session.sessionDate) : new Date(),
          isMentor: isMentor
        }
      };
      
      setActiveParticipant(participantInfo);
      
      // Load session info as the first message
      const sessionDate = session.sessionDate ? new Date(session.sessionDate) : new Date();
      const sessionMessage = {
        id: `session_${session._id || session.id}_info`,
        content: `Session scheduled for ${sessionDate.toLocaleString()}`,
        sender: 'system',
        type: 'info',
        timestamp: new Date(),
        isSessionInfo: true
      };
      setMessages([sessionMessage]);
    } else {
      // For regular conversations
      setActiveParticipant({
        participantId: conversation.participantId,
        name: conversation.mentorName,
        role: conversation.mentorRole,
        avatar: conversation.mentorAvatar,
        isSession: false
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full bg-[#121212] items-center justify-center">
        <div className="text-white">Loading conversations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full bg-[#121212] items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error}</div>
          <div className="flex gap-3 justify-center">
            {error.includes('log in') && (
              <button 
                onClick={() => navigate('/login')} 
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                Go to Login
              </button>
            )}
            {!error.includes('log in') && (
              <button 
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  fetchConversations();
                }} 
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-[#121212] overflow-hidden">
      {/* Main content */}
      <div className="relative z-10 flex w-full h-full">
        <div className="hidden md:block w-[280px] flex-shrink-0 h-full">
          <ChatList
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
          />
        </div>

        {/* Chat area - flexible width */}
        <div className="flex flex-col flex-1 h-full min-w-0">
          {activeParticipant ? (
            <>
              <ChatHeader 
                participantName={activeParticipant.name || 'Mentor'}
                participantRole={activeParticipant.role || ''}
                participantAvatar={activeParticipant.avatar}
                sessionData={activeParticipant.sessionData}
              />
              {loadingMessages ? (
                <div className="flex-1 flex items-center justify-center bg-[#121212]">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 rounded-full border-4 border-[#535353]/30"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#b3b3b3] animate-spin"></div>
                    </div>
                    <p className="text-[#b3b3b3] text-sm">Loading messages...</p>
                  </div>
                </div>
              ) : (
                <ChatMessages messages={messages} />
              )}
              <ChatInput 
                selectedType={selectedType} 
                onTypeChange={setSelectedType} 
                onSendMessage={handleSendMessage} 
              />
            </>
          ) : (
            <>
              <ChatHeader 
                participantName={currentUser?.name || 'Mentor'}
                participantRole=""
                participantAvatar=""
              />
              <div className="flex-1 flex items-center justify-center bg-[#000000]">
                <div className="text-center px-4 py-8 max-w-md">
                  {/* Illustration */}
                  <div className="mb-6 flex justify-center">
                    <svg className="w-24 h-24 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  
                  {/* Message */}
                  <h3 className="text-xl font-semibold text-white mb-2">Start Chatting</h3>
                  <p className="text-gray-400 text-sm">
                    {conversations.length === 0 
                      ? "No conversations yet. Start messaging with your mentees!"
                      : "Select a conversation from the list to start chatting"
                    }
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Context sidebar - 320px fixed width */}
        {activeParticipant && (
          <div className="hidden lg:block w-[320px] flex-shrink-0 h-full border-l border-[#535353]/30">
            <ContextSidebar 
              messages={messages} 
              mentee={{
                name: activeParticipant.name,
                role: activeParticipant.role,
                avatar: activeParticipant.avatar,
                bio: activeParticipant.bio || '',
                sessionCount: activeParticipant.sessionCount || 0,
                totalSessions: activeParticipant.totalSessions || 12,
                nextSession: activeParticipant.sessionData?.sessionDate,
                goals: activeParticipant.goals || [],
                resources: activeParticipant.resources || []
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
