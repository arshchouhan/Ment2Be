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

  const handleSelectConversation = async (conversationId) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (!conversation) return;

    setActiveConversationId(conversationId);

    let participantIdToMarkRead = null;

    if (conversation.isSession && conversation.sessionData) {
      // For session conversations, extract the other user's details from the session data
      const session = conversation.sessionData;
      const isMentor = session.mentor?._id === userId || session.mentor?.id === userId;
      const otherUser = isMentor ? session.student : session.mentor;

      participantIdToMarkRead = otherUser?._id || otherUser?.id;
      
      setActiveParticipant({
        participantId: participantIdToMarkRead,
        name: otherUser?.name || conversation.mentorName,
        role: isMentor ? 'Mentee' : 'Mentor',
        avatar: otherUser?.profilePicture || conversation.mentorAvatar,
        isSession: true,
        sessionData: session
      });
    } else {
      // For regular conversations
      setActiveParticipant({
        participantId: conversation.participantId,
        name: conversation.mentorName,
        role: conversation.mentorRole,
        avatar: conversation.mentorAvatar,
        isSession: false
      });
      participantIdToMarkRead = conversation.participantId;
    }

    // Mark as read in DB + update badge locally
    if (participantIdToMarkRead) {
      try {
        await messageService.markMessagesAsRead(participantIdToMarkRead);
      } catch (err) {
        console.error('Failed to mark messages as read:', err);
      } finally {
        setConversations(prev => prev.map(conv =>
          conv.participantId === participantIdToMarkRead
            ? { ...conv, unreadCount: 0 }
            : conv
        ));
      }
    }
  };

  // ---------------------- SKELETON LOADING COMPONENT ------------------------
  const SkeletonLoader = () => (
    <div className="flex h-full w-full bg-[#121212] overflow-hidden">
      {/* Sidebar Skeleton */}
      <div className="hidden md:block w-[280px] flex-shrink-0 h-full border-r border-gray-800 bg-[#121212]">
        <div className="p-4">
          <div className="h-6 bg-gray-700 rounded animate-pulse mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 mb-2">
              <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-700 rounded animate-pulse w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Main Content Skeleton */}
      <div className="flex flex-col flex-1 h-full min-w-0 bg-[#121212]">
        <div className="h-16 bg-[#121212] border-b border-gray-800 flex items-center px-4">
          <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse mr-3"></div>
          <div className="h-4 bg-gray-700 rounded animate-pulse w-32"></div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4 py-8 max-w-md">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full animate-pulse"></div>
            </div>
            <div className="h-6 bg-gray-700 rounded animate-pulse mb-3 mx-auto w-48"></div>
            <div className="h-4 bg-gray-700 rounded animate-pulse mx-auto w-64"></div>
          </div>
        </div>
      </div>
    </div>
  );

  // ---------------------- EMPTY STATE COMPONENT ------------------------
  const EmptyState = () => (
    <div className="flex h-full w-full bg-[#121212] overflow-hidden">
      {/* Empty Sidebar */}
      <div className="hidden md:block w-[280px] flex-shrink-0 h-full border-r border-gray-800 bg-[#121212]">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-white mb-4">Messages</h2>
          <div className="text-center py-8">
            <div className="mb-4 flex justify-center">
              <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-2M9 12h.01M12 12h.01M15 12h.01M17 4H7a2 2 0 00-2 2v6a2 2 0 002 2h2v4l4-4h4a2 2 0 002-2V6a2 2 0 00-2-2z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">No conversations yet</p>
          </div>
        </div>
      </div>
      
      {/* Main Empty Content */}
      <div className="flex flex-col flex-1 h-full min-w-0 bg-[#121212]">
        <div className="h-16 bg-[#121212] border-b border-gray-800 flex items-center px-4">
          <h1 className="text-lg font-semibold text-white">Messages</h1>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4 py-8 max-w-lg">
            {/* Large Illustration */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <svg className="w-32 h-32 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {/* Floating dots animation */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full animate-bounce"></div>
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute top-1/2 -right-4 w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
              </div>
            </div>
            
            {/* Main Message */}
            <h3 className="text-2xl font-bold text-white mb-4">Connect with Your Mentees</h3>
            <p className="text-gray-400 text-base mb-6 leading-relaxed">
              Start meaningful conversations with your students. Guide them through their learning journey and help them achieve their goals through personalized mentorship.
            </p>
            
            {/* Action Steps */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-center space-x-3 text-sm text-gray-300">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-black font-bold text-xs">1</div>
                <span>Students book sessions with you</span>
              </div>
              <div className="flex items-center justify-center space-x-3 text-sm text-gray-300">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-black font-bold text-xs">2</div>
                <span>Start conversations after booking</span>
              </div>
              <div className="flex items-center justify-center space-x-3 text-sm text-gray-300">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-black font-bold text-xs">3</div>
                <span>Provide guidance and support</span>
              </div>
            </div>
            
            {/* CTA Button */}
            <button 
              onClick={() => navigate('/mentor/mentees')}
              className="inline-flex items-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl border border-gray-600 hover:border-gray-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              View My Mentees
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading && conversations.length === 0) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#121212]">
        <div className="text-center px-4 py-8">
          <div className="mb-4 flex justify-center">
            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Something went wrong</h3>
          <p className="text-red-400 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            {error.includes('log in') && (
              <button 
                onClick={() => navigate('/login')} 
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
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
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return <EmptyState />;
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
              <div className="flex-1 flex items-center justify-center bg-[#121212]">
                <div className="text-center px-4 py-8 max-w-lg">
                  {/* Enhanced Illustration */}
                  <div className="mb-8 flex justify-center">
                    <div className="relative">
                      <svg className="w-28 h-28 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {/* Animated arrow pointing left */}
                      <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 hidden md:block">
                        <svg className="w-8 h-8 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                      </div>
                      {/* Floating message bubble */}
                      <div className="absolute -top-3 -right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center animate-bounce">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Message */}
                  <h3 className="text-2xl font-bold text-white mb-3">Ready to Mentor!</h3>
                  <p className="text-gray-400 text-base mb-6 leading-relaxed">
                    {conversations.length === 0 
                      ? "No conversations yet. Students will appear here after booking sessions with you!"
                      : `You have ${conversations.length} conversation${conversations.length > 1 ? 's' : ''} available. Select one from the sidebar to start mentoring.`
                    }
                  </p>
                  
                  {/* Helpful tip for mobile users */}
                  <div className="md:hidden mb-6">
                    <div className="inline-flex items-center px-4 py-2 bg-[#2a2d32] border border-[#535353]/30 rounded-lg text-white text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Tap the menu to see your conversations
                    </div>
                  </div>
                  
                  {/* Quick actions */}
                  {conversations.length === 0 && (
                    <button 
                      onClick={() => navigate('/mentor/mentees')}
                      className="inline-flex items-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl border border-gray-600 hover:border-gray-500"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                      View My Mentees
                    </button>
                  )}
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
