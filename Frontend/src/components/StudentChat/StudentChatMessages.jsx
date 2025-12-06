import React, { useEffect, useRef } from "react";
import { StudentMessageBubble } from "./StudentMessageBubble";
import "../Chat/chat-scrollbar.css";

export function StudentChatMessages({ messages }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-[#121212] chat-scrollbar">
      {messages.map((message, index) => (
        <StudentMessageBubble key={message.id || `msg-${index}`} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
