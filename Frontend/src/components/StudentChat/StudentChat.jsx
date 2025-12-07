import React, { useState, useEffect } from "react";
import { StudentChatHeader } from "./StudentChatHeader";
import { StudentChatMessages } from "./StudentChatMessages";
import { StudentChatInput } from "./StudentChatInput";
import { StudentContextSidebar } from "./StudentContextSidebar";
import { MentorList } from "./MentorList";
import { messageService } from "../../services/messageService";
import * as streamChatClient from "../../services/streamChatClient";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const initialMentors = [];
const initialMessages = {};

export function StudentChat() {
  const [mentors, setMentors] = useState(initialMentors);
  const [activeMentorId, setActiveMentorId] = useState(null);
  const [messagesByMentor, setMessagesByMentor] = useState(initialMessages);
  const [selectedType, setSelectedType] = useState("normal");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = currentUser.id || currentUser._id;
  const token = localStorage.getItem('token');
  const [channel, setChannel] = useState(null);

  // ------------------- STREAM CHAT INITIALIZATION ----------------------
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
        const tokenResponse = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/stream/auth/token`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: currentUser.name || 'Student',
              image: currentUser.profilePicture || ''
            })
          }
        );

        if (!tokenResponse.ok) {
          throw new Error('Failed to get Stream Chat token');
        }

        const { apiKey: responseApiKey, token: streamToken } = await tokenResponse.json();

        // Connect to Stream Chat
        await streamChatClient.connectUser(
          responseApiKey || apiKey,
          userId,
          streamToken,
          {
            name: currentUser.name || 'Student',
            image: currentUser.profilePicture || ''
          }
        );

        console.log('✓ Stream Chat initialized for student');
      } catch (error) {
        console.error('Error initializing Stream Chat:', error);
        toast.error('Failed to initialize chat');
      }
    };

    initializeStreamChat();

    // Don't disconnect on unmount - keep the connection alive for other components
    return () => {
      // No cleanup needed - connection is shared across components
    };
  }, [token, userId]);

  // -------------------- FETCH CONVERSATIONS ------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [conversations, confirmedSessions] = await Promise.all([
          messageService.getConversations(),
          messageService.getConfirmedSessions()
        ]);

        const mentorIdsWithSessions = new Set(
          confirmedSessions.map(s => s.mentor?._id || s.mentor)
        );

        const mentorsFromConversations = conversations
          .filter(conv => {
            const p = conv.participant || conv.otherParticipant;
            return p && mentorIdsWithSessions.has(p._id);
          })
          .map(conv => {
            const p = conv.participant || conv.otherParticipant;
            const nextSession = confirmedSessions.find(
              s => (s.mentor?._id || s.mentor) === p._id
            );

            return {
              id: p._id,
              name: p.name,
              avatar: p.profilePicture || "",
              role: p.role || "Mentor",
              company: p.company || "",
              expertise: p.skills || [],
              lastMessage: conv.lastMessage?.content || "",
              lastMessageTime: conv.lastMessage
                ? new Date(conv.lastMessage.createdAt)
                : new Date(),
              unreadCount: conv.unreadCount || 0,
              isOnline: false,
              email: p.email,
              nextSession,
              hasConversation: true
            };
          });

        const existingIds = new Set(mentorsFromConversations.map(m => m.id));

        const mentorsFromSessions = confirmedSessions
          .filter(s => !existingIds.has(s.mentor?._id || s.mentor))
          .map(s => ({
            id: s.mentor._id,
            name: s.mentor.name,
            avatar: s.mentor.profilePicture || "",
            role: s.mentor.role || "Mentor",
            company: s.mentor.company || "",
            expertise: s.mentor.skills || [],
            lastMessage: "",
            lastMessageTime: new Date(),
            unreadCount: 0,
            isOnline: false,
            email: s.mentor.email,
            nextSession: s,
            hasConversation: false
          }));

        const result = [...mentorsFromConversations, ...mentorsFromSessions];
        setMentors(result);

        if (result.length && !activeMentorId) {
          setActiveMentorId(result[0].id);
        }

      } catch (err) {
        console.error(err);
        toast.error("Failed to load conversations");
        setError("Failed to load conversations.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // -------------------- JOIN STREAM CHAT CHANNEL WHEN ACTIVE MENTOR CHANGES ----
  useEffect(() => {
    const joinChannel = async () => {
      console.log('joinChannel effect triggered:', {
        activeMentorId,
        token: !!token,
        userId
      });

      if (!activeMentorId || !token) {
        console.log('Skipping joinChannel - missing activeMentorId or token');
        return;
      }

      setIsLoadingMessages(true);
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
              studentId: userId,
              mentorId: activeMentorId
            })
          }
        );

        if (!channelResponse.ok) {
          throw new Error('Failed to create/get channel');
        }

        const { channelId } = await channelResponse.json();
        console.log('Channel created on backend:', channelId);

        // Get or create channel on client
        const ch = await streamChatClient.getOrCreateChannel(channelId, {
          name: `Student-Mentor: ${userId}-${activeMentorId}`,
          members: [userId, activeMentorId]
        });
        console.log('Channel created on client:', ch);

        setChannel(ch);
        console.log('Channel state set:', ch);

        // Load message history
        const messages = await streamChatClient.getMessages(ch, 50);
        const formatted = messages.map(m => ({
          id: m.id,
          content: m.text,
          text: m.text,
          sender: m.user.id === userId ? 'me' : 'mentor',
          type: m.type || '',
          custom_type: m.custom_type || 'normal',
          timestamp: new Date(m.created_at),
          created_at: m.created_at,
          status: 'delivered'
        }));

        setMessagesByMentor(prev => ({
          ...prev,
          [activeMentorId]: formatted
        }));

        // Listen to new messages
        streamChatClient.onMessageReceived(ch, (message) => {
          console.log('New message received:', message);
          
          setMessagesByMentor(prev => {
            const existing = prev[activeMentorId] || [];
            const isDuplicate = existing.some(m => m.id === message.id);
            if (isDuplicate) return prev;

            return {
              ...prev,
              [activeMentorId]: [...existing, {
                id: message.id,
                content: message.text,
                text: message.text,
                sender: message.user.id === userId ? 'me' : 'mentor',
                type: message.type || '',
                custom_type: message.custom_type || 'normal',
                timestamp: new Date(message.created_at),
                created_at: message.created_at,
                status: 'delivered'
              }]
            };
          });

          // Update mentor list with last message
          setMentors(prev => prev.map(mentor => {
            if (mentor.id === activeMentorId) {
              return {
                ...mentor,
                lastMessage: message.text,
                lastMessageTime: new Date(message.created_at)
              };
            }
            return mentor;
          }));
        });

        console.log('✓ Joined Stream Chat channel:', channelId);
      } catch (error) {
        console.error('Error joining channel:', error);
        toast.error('Failed to join chat channel');
      } finally {
        setIsLoadingMessages(false);
      }
    };

    joinChannel();
  }, [activeMentorId, userId, token]);

  // Note: Message loading is now handled in the joinChannel effect above

  const activeMentor = mentors.find(m => m.id === activeMentorId) || null;
  const messages = messagesByMentor[activeMentorId] || [];

  // ------------------------ SEND MESSAGE VIA STREAM CHAT --------------------------
  const handleSendMessage = async (messageContent) => {
    console.log('handleSendMessage called:', {
      activeMentorId,
      messageContent,
      channelExists: !!channel,
      channel: channel
    });

    if (!activeMentorId || !messageContent || !messageContent.trim() || !channel) {
      console.error('Cannot send message - missing required data:', {
        activeMentorId: !!activeMentorId,
        message: !!messageContent?.trim(),
        channel: !!channel
      });
      return;
    }

    // Check if Stream Chat client is connected
    if (!streamChatClient.isConnected()) {
      console.error('Stream Chat client not connected');
      toast.error('Chat connection lost. Please refresh the page.');
      return;
    }

    const tempId = Date.now().toString();
    const content = messageContent.trim();

    // Create optimistic message
    const optimisticMessage = {
      id: tempId,
      content,
      sender: "me",
      type: selectedType,
      timestamp: new Date(),
      status: "sending"
    };

    // Optimistic UI update
    setMessagesByMentor(prev => ({
      ...prev,
      [activeMentorId]: [...(prev[activeMentorId] || []), optimisticMessage]
    }));

    try {
      console.log('Step 1: Sending message via Stream Chat...');
      // Send message via Stream Chat
      const sentMessage = await streamChatClient.sendMessage(channel, content, {
        type: selectedType
      });
      console.log('Step 1 Success: Message sent via Stream Chat:', sentMessage);

      console.log('Step 2: Updating local state with Stream Chat message...');
      // Update message with actual ID from Stream Chat
      setMessagesByMentor(prev => ({
        ...prev,
        [activeMentorId]: (prev[activeMentorId] || []).map(m =>
          m.id === tempId 
            ? { 
                id: sentMessage.id,
                content: sentMessage.text,
                sender: 'me',
                type: sentMessage.type || 'normal',
                status: 'delivered',
                timestamp: new Date(sentMessage.created_at)
              } 
            : m
        )
      }));
      console.log('Step 2 Success: Local state updated');

      console.log('Step 3: Saving message to database...');
      // Also save to database for persistence
      const dbResponse = await messageService.sendMessage(
        activeMentorId,
        content,
        selectedType
      );
      console.log('Step 3 Success: Message saved to database:', dbResponse);

      console.log('Step 4: Updating mentor list...');
      // Update last message in mentor list
      setMentors(prev => 
        prev.map(mentor => 
          mentor.id === activeMentorId
            ? {
                ...mentor,
                lastMessage: content,
                lastMessageTime: new Date(),
                unreadCount: 0
              }
            : mentor
        )
      );
      console.log('Step 4 Success: Mentor list updated');

      setSelectedType("normal");
      console.log('✓ Message sent successfully!');
    } catch (err) {
      console.error("Send error:", {
        error: err,
        message: err.message,
        stack: err.stack,
        response: err.response
      });

      setMessagesByMentor(prev => ({
        ...prev,
        [activeMentorId]: (prev[activeMentorId] || []).map(m =>
          m.id === tempId ? { ...m, status: "error" } : m
        )
      }));

      toast.error("Failed to send message: " + (err.message || 'Unknown error'));
    }
  };

  // ---------------------- RENDER UI (UNCHANGED) ------------------------
  if (isLoading && mentors.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#000000]">
        <div className="text-gray-400">Loading conversations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#000000]">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (mentors.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#000000]">
        <div className="text-gray-400">No conversations found</div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-[#000000] overflow-hidden">
      {/* Main content */}
      <div className="relative z-10 flex w-full h-full">
        <div className="hidden md:block w-[280px] flex-shrink-0 h-full border-r border-gray-800">
          <MentorList
            mentors={mentors}
            activeMentorId={activeMentorId}
            onSelectMentor={setActiveMentorId}
          />
        </div>

        {/* Chat area - flexible width */}
        <div className="flex flex-col flex-1 h-full min-w-0 bg-[#000000]">
          {activeMentor ? (
            <>
              <StudentChatHeader 
                mentorName={activeMentor.name}
                mentorRole={activeMentor.role}
                mentorAvatar={activeMentor.avatar}
              />
              {isLoadingMessages ? (
                <div className="flex-1 flex items-center justify-center bg-[#000000]">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 rounded-full border-4 border-gray-700/30"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-gray-400 animate-spin"></div>
                    </div>
                    <p className="text-gray-400 text-sm">Loading messages...</p>
                  </div>
                </div>
              ) : (
                <StudentChatMessages messages={messages} />
              )}
              <StudentChatInput 
                selectedType={selectedType} 
                onTypeChange={setSelectedType} 
                onSendMessage={handleSendMessage} 
              />
            </>
          ) : (
            <>
              <StudentChatHeader 
                mentorName={currentUser?.name || 'Student'}
                mentorRole=""
                mentorAvatar=""
              />
              <div className="flex-1 flex items-center justify-center bg-[#000000]">
                <div className="text-gray-400 text-center px-4">
                  {mentors.length === 0 
                    ? "No conversations yet. Start messaging with your mentors!"
                    : "Select a conversation to start messaging"
                  }
                </div>
              </div>
            </>
          )}
        </div>

        {/* Context sidebar - 320px fixed width */}
        {activeMentor && (
          <div className="hidden lg:block w-[320px] flex-shrink-0 h-full border-l border-gray-800 bg-[#000000]">
            <StudentContextSidebar 
              messages={messages} 
              mentor={{
                name: activeMentor.name,
                role: activeMentor.role,
                avatar: activeMentor.avatar,
                bio: activeMentor.bio || '',
                expertise: activeMentor.expertise || [],
                nextSession: activeMentor.nextSession?.sessionDate,
                company: activeMentor.company || ''
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
