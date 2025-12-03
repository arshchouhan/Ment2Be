import React from "react";
import { MessageSquare, HelpCircle, Lightbulb, BookOpen, CheckSquare } from "lucide-react";

const typeConfig = {
  normal: {
    icon: MessageSquare,
    label: "Message",
    className: "bg-transparent",
  },
  question: {
    icon: HelpCircle,
    label: "Question",
    className: "bg-gray-800 text-gray-300",
  },
  insight: {
    icon: Lightbulb,
    label: "Insight",
    className: "bg-gray-800 text-gray-300",
  },
  advice: {
    icon: BookOpen,
    label: "Advice",
    className: "bg-gray-800 text-gray-300",
  },
  action: {
    icon: CheckSquare,
    label: "Action Item",
    className: "bg-gray-800 text-gray-300",
  },
};

export function StudentMessageBubble({ message }) {
  const isMentor = message.sender === "mentor";
  const config = typeConfig[message.type];
  const Icon = config.icon;

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={`flex w-full ${isMentor ? "justify-start" : "justify-end"}`}>
      <div className={`max-w-[80%] relative ${isMentor ? "pr-4" : "pl-4"}`}>
        {/* Message type badge */}
        {message.type !== "normal" && (
          <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium mb-1.5 ${config.className}`}>
            <Icon className="h-2.5 w-2.5" />
            {config.label}
          </div>
        )}

        <div
          className={`relative px-3 py-2 transition-all duration-200 rounded-lg ${
            isMentor
              ? "bg-gray-800 border border-gray-600 text-white"
              : "bg-gray-700 border border-gray-600 text-white"
          } hover:shadow-lg`}
        >
          {/* Mentor indicator */}
          {isMentor && <span className="text-[9px] text-gray-400 font-medium block mb-1">From Mentor</span>}
          <p className="text-xs leading-relaxed relative z-10">{message.content}</p>
          <span className="block text-[9px] mt-1.5 relative z-10 text-gray-400">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
}
