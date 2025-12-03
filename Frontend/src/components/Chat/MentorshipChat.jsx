import React, { useState } from "react";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { ContextSidebar } from "./ContextSidebar";
import { ChatList } from "./ChatList";
import { MessageTypes, createMessage, createConversation } from "../../lib/types";

const sampleConversations = [
  createConversation(
    "1",
    "Sarah Mitchell",
    "",
    "Senior Product Manager @ Google",
    "I want you to conduct 3 user interviews...",
    new Date(Date.now() - 3200000),
    0,
    true
  ),
  createConversation(
    "2",
    "David Park",
    "",
    "Tech Lead @ Stripe",
    "Great progress on the system design module!",
    new Date(Date.now() - 86400000),
    2,
    true
  ),
  createConversation(
    "3",
    "Emily Rodriguez",
    "",
    "VP Engineering @ Airbnb",
    "Let's schedule our next session for Friday",
    new Date(Date.now() - 172800000),
    0,
    false
  ),
  createConversation(
    "4",
    "Michael Chen",
    "",
    "Staff Engineer @ Netflix",
    "The architectural review looks solid",
    new Date(Date.now() - 259200000),
    1,
    false
  ),
];

const initialMessages = [
  createMessage(
    "1",
    "Welcome to our mentorship session! I've reviewed your progress on the product management roadmap. You're making excellent progress.",
    "mentor",
    MessageTypes.NORMAL,
    new Date(Date.now() - 3600000)
  ),
  createMessage(
    "2",
    "Thank you! I've been focusing on the user research module. I have a question about conducting effective user interviews.",
    "mentee",
    MessageTypes.QUESTION,
    new Date(Date.now() - 3500000)
  ),
  createMessage(
    "3",
    "Great question! The key is to ask open-ended questions and avoid leading the user. Let them tell their story naturally.",
    "mentor",
    MessageTypes.ADVICE,
    new Date(Date.now() - 3400000)
  ),
  createMessage(
    "4",
    "I realized that my previous interviews were too structured. I should focus more on understanding the 'why' behind user behaviors.",
    "mentee",
    MessageTypes.INSIGHT,
    new Date(Date.now() - 3300000)
  ),
  createMessage(
    "5",
    "Exactly! For your next step, I want you to conduct 3 user interviews using the Jobs-to-be-Done framework and document your findings.",
    "mentor",
    MessageTypes.ACTION,
    new Date(Date.now() - 3200000)
  ),
];

export function MentorshipChat() {
  const [messages, setMessages] = useState(initialMessages);
  const [selectedType, setSelectedType] = useState(MessageTypes.NORMAL);
  const [activeConversationId, setActiveConversationId] = useState("1");

  const handleSendMessage = (content) => {
    const newMessage = createMessage(
      Date.now().toString(),
      content,
      "mentee",
      selectedType,
      new Date()
    );
    setMessages((prev) => [...prev, newMessage]);
    setSelectedType(MessageTypes.NORMAL);
  };

  return (
    <div className="flex h-full w-full bg-[#121212] overflow-hidden">
      {/* Main content */}
      <div className="relative z-10 flex w-full h-full">
        <div className="hidden md:block w-[280px] flex-shrink-0 h-full">
          <ChatList
            conversations={sampleConversations}
            activeConversationId={activeConversationId}
            onSelectConversation={setActiveConversationId}
          />
        </div>

        {/* Chat area - flexible width */}
        <div className="flex flex-col flex-1 h-full min-w-0">
          <ChatHeader />
          <ChatMessages messages={messages} />
          <ChatInput 
            selectedType={selectedType} 
            onTypeChange={setSelectedType} 
            onSendMessage={handleSendMessage} 
          />
        </div>

        {/* Context sidebar - 320px fixed width */}
        <div className="hidden lg:block w-[320px] flex-shrink-0 h-full border-l border-[#535353]/30">
          <ContextSidebar messages={messages} />
        </div>
      </div>
    </div>
  );
}
