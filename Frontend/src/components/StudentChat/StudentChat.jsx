import React, { useState, useEffect } from "react";
import { StudentChatHeader } from "./StudentChatHeader";
import { StudentChatMessages } from "./StudentChatMessages";
import { StudentChatInput } from "./StudentChatInput";
import { StudentContextSidebar } from "./StudentContextSidebar";
import { MentorList } from "./MentorList";
import { messageService } from "../../services/messageService";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Initial state
const initialMentors = [];
const initialMessages = {};

export function StudentChat() {
  const [mentors, setMentors] = useState(initialMentors);
  const [activeMentorId, setActiveMentorId] = useState(null);
  const [messagesByMentor, setMessagesByMentor] = useState(initialMessages);
  const [selectedType, setSelectedType] = useState("normal");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch conversations when component mounts
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Fetching conversations and confirmed sessions...');
        
        // Get both conversations and confirmed sessions
        const [conversations, confirmedSessions] = await Promise.all([
          messageService.getConversations(),
          messageService.getConfirmedSessions()
        ]);
        
        console.log('API Responses:', { conversations, confirmedSessions });
        
        // Create a Set of mentor IDs who have confirmed sessions
        const mentorIdsWithSessions = new Set(
          confirmedSessions.map(session => {
            const mentorId = session.mentor?._id || session.mentor;
            console.log('Session mentor ID:', mentorId);
            return mentorId;
          }).filter(Boolean) // Remove any undefined/null values
        );
        
        console.log('Mentor IDs with sessions:', Array.from(mentorIdsWithSessions));
        
        // First, process mentors with conversations
        const mentorsFromConversations = conversations
          .filter(conv => {
            const participant = conv.participant || conv.otherParticipant || {};
            const participantId = participant._id;
            const hasSession = participantId && mentorIdsWithSessions.has(participantId);
            console.log('Checking conversation:', { participantId, hasSession });
            return hasSession;
          })
          .map(conv => {
            const participant = conv.participant || conv.otherParticipant || {};
            console.log('Processing conversation with participant:', participant);
            
            // Find the next session for this mentor
            const nextSession = confirmedSessions.find(session => {
              const sessionMentorId = session.mentor?._id || session.mentor;
              return sessionMentorId === participant._id;
            });
            
            return {
              id: participant._id,
              name: participant.name || 'Unknown Mentor',
              avatar: participant.profilePicture || "",
              role: participant.role || "Mentor",
              company: participant.company || "",
              expertise: participant.skills || [],
              lastMessage: conv.lastMessage?.content || "",
              lastMessageTime: conv.lastMessage ? new Date(conv.lastMessage.createdAt) : new Date(),
              unreadCount: conv.unreadCount || 0,
              isOnline: false,
              email: participant.email || "",
              nextSession: nextSession,
              hasConversation: true
            };
          });
          
        // Then, add mentors from confirmed sessions who don't have conversations yet
        const mentorsFromSessions = [];
        
        // Get all mentor IDs that already have conversations
        const mentorIdsWithConversations = new Set(
          mentorsFromConversations.map(m => m.id)
        );
        
        // Find mentors in confirmedSessions who don't have conversations yet
        confirmedSessions.forEach(session => {
          const mentorId = session.mentor?._id || session.mentor;
          if (mentorId && !mentorIdsWithConversations.has(mentorId)) {
            mentorsFromSessions.push({
              id: mentorId,
              name: session.mentor?.name || 'Mentor',
              avatar: session.mentor?.profilePicture || "",
              role: session.mentor?.role || "Mentor",
              company: session.mentor?.company || "",
              expertise: session.mentor?.skills || [],
              lastMessage: "",
              lastMessageTime: new Date(),
              unreadCount: 0,
              isOnline: false,
              email: session.mentor?.email || "",
              nextSession: session,
              hasConversation: false
            });
          }
        });
        
        // Combine both lists
        const mentorsData = [...mentorsFromConversations, ...mentorsFromSessions];
          
        console.log('Processed mentors data:', mentorsData);
        setMentors(mentorsData);
        
        // Set the first mentor as active if available
        if (mentorsData.length > 0 && !activeMentorId) {
          setActiveMentorId(mentorsData[0].id);
        }
        
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError('Failed to load conversations. Please try again.');
        toast.error('Failed to load conversations');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConversations();
  }, []);
  
  // Fetch messages when active mentor changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeMentorId) return;
      
      try {
        setIsLoading(true);
        const messages = await messageService.getConversationMessages(activeMentorId);
        
        // Transform API messages to match our component's expected format
        const formattedMessages = messages.map(msg => ({
          id: msg._id,
          content: msg.content,
          sender: msg.senderType === 'mentor' ? 'mentor' : 'me',
          type: msg.messageType || 'normal',
          timestamp: new Date(msg.createdAt),
          status: msg.status || 'delivered'
        }));

        setMessagesByMentor(prev => ({
          ...prev,
          [activeMentorId]: formattedMessages
        }));
        
        // Mark messages as read
        await messageService.markMessagesAsRead(activeMentorId);
        
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages. Please try again.');
        toast.error('Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMessages();
  }, [activeMentorId]);

  const activeMentor = mentors.find((m) => m.id === activeMentorId) || null;
  const messages = messagesByMentor[activeMentorId] || [];

  const handleSendMessage = async (content) => {
    if (!activeMentorId || !content.trim()) return;
    
    const tempId = Date.now().toString();
    const newMessage = {
      id: tempId,
      content,
      sender: "mentee",
      type: selectedType,
      timestamp: new Date(),
      status: 'sending'
    };

    // Optimistic update
    setMessagesByMentor(prev => ({
      ...prev,
      [activeMentorId]: [...(prev[activeMentorId] || []), newMessage],
    }));

    try {
      // Send message to server
      await messageService.sendMessage(activeMentorId, content, selectedType);
      
      // Update message status to sent
      setMessagesByMentor(prev => ({
        ...prev,
        [activeMentorId]: (prev[activeMentorId] || []).map(msg => 
          msg.id === tempId ? { ...msg, status: 'delivered' } : msg
        ),
      }));
      
      setSelectedType("normal");
    } catch (err) {
      console.error('Error sending message:', err);
      
      // Update message status to error
      setMessagesByMentor(prev => ({
        ...prev,
        [activeMentorId]: (prev[activeMentorId] || []).map(msg => 
          msg.id === tempId ? { ...msg, status: 'error' } : msg
        ),
      }));
      
      toast.error('Failed to send message');
    }
  };

  if (isLoading && mentors.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#121212]">
        <div className="text-gray-400">Loading conversations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#121212]">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (mentors.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#121212]">
        <div className="text-gray-400">No conversations found</div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-[#121212] overflow-hidden">
      <div className="relative z-10 flex w-full">
        {/* Mentor list sidebar */}
        <div className="hidden md:block w-[280px] flex-shrink-0 h-full border-r border-gray-800">
          <MentorList 
            mentors={mentors} 
            activeMentorId={activeMentorId} 
            onSelectMentor={setActiveMentorId} 
          />
        </div>

        {/* Chat area */}
        <div className="flex flex-col flex-1 h-full min-w-0">
          {activeMentor ? (
            <>
              <StudentChatHeader mentor={activeMentor} />
              <StudentChatMessages 
                messages={messages} 
                isLoading={isLoading} 
              />
              <StudentChatInput
                selectedType={selectedType}
                onTypeChange={setSelectedType}
                onSendMessage={handleSendMessage}
                isSending={messages.some(m => m.status === 'sending')}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Select a conversation to start chatting</div>
            </div>
          )}
        </div>

        {/* Context sidebar - Only show if a mentor is selected */}
        {activeMentor && (
          <div className="hidden lg:block w-[300px] flex-shrink-0 h-full border-l border-gray-800">
            <StudentContextSidebar mentor={activeMentor} messages={messages} />
          </div>
        )}
      </div>
    </div>
  );
}
