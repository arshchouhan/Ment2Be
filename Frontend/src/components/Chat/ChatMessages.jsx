import React, { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import "./chat-scrollbar.css";

export function ChatMessages({ messages }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-[#121212] chat-scrollbar">
      {messages.map((message, index) => (
        <MessageBubble key={message.id || `msg-${index}`} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
