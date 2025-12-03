import React, { useEffect, useRef } from "react";
import { StudentMessageBubble } from "./StudentMessageBubble";

export function StudentChatMessages({ messages }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#121212]">
      {messages.map((message) => (
        <StudentMessageBubble key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
