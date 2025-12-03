import React from "react";
import { MessageSquare, HelpCircle, Lightbulb, BookOpen, CheckSquare } from "lucide-react";
import { MessageTypes } from "../../lib/types";

const typeConfig = {
  [MessageTypes.NORMAL]: {
    icon: MessageSquare,
    label: "Message",
    className: "bg-transparent",
  },
  [MessageTypes.QUESTION]: {
    icon: HelpCircle,
    label: "Question",
    className: "bg-gray-700 text-white",
  },
  [MessageTypes.INSIGHT]: {
    icon: Lightbulb,
    label: "Insight",
    className: "bg-gray-700 text-white",
  },
  [MessageTypes.ADVICE]: {
    icon: BookOpen,
    label: "Advice",
    className: "bg-gray-700 text-white",
  },
  [MessageTypes.ACTION]: {
    icon: CheckSquare,
    label: "Action Item",
    className: "bg-gray-700 text-white",
  },
};

export function MessageBubble({ message }) {
  const isMentor = message.sender === "mentor";
  const config = typeConfig[message.type];
  const Icon = config.icon;

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const cn = (...classes) => classes.filter(Boolean).join(' ');

  return (
    <div className={cn("flex w-full", isMentor ? "justify-start" : "justify-end")}>
      <div className={cn("max-w-[80%] relative", isMentor ? "pr-4" : "pl-4")}>
        {/* Message type badge */}
        {message.type !== MessageTypes.NORMAL && (
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium mb-2",
              config.className,
            )}
          >
            <Icon className="h-3 w-3" />
            {config.label}
          </div>
        )}

        <div
          className={cn(
            "relative px-4 py-3 transition-all duration-200 rounded-lg",
            isMentor
              ? "bg-[#212121] border border-gray-600 text-white"
              : "bg-gray-800 border border-gray-600 text-white",
            "hover:shadow-lg",
            "hover:shadow-gray-900/20",
          )}
        >
          <p className="text-sm leading-relaxed relative z-10">{message.content}</p>

          <span className={cn("block text-[10px] mt-2 relative z-10", "text-[#535353]")}>
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
}
