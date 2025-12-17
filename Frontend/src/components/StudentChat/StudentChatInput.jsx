import React, { useState } from "react";
import { Send, MessageSquare, HelpCircle, Lightbulb, BookOpen, CheckSquare } from "lucide-react";
import { MessageTypes } from "../../lib/types";

const messageTypes = [
  {
    type: MessageTypes.NORMAL,
    icon: MessageSquare,
    label: "Message",
    color: "text-gray-300 hover:text-white",
    activeColor: "bg-[#212121] text-white ring-[#535353]",
  },
  {
    type: MessageTypes.QUESTION,
    icon: HelpCircle,
    label: "Question",
    color: "text-gray-300 hover:text-white",
    activeColor: "bg-gray-700 text-white ring-gray-600",
  },
  {
    type: MessageTypes.INSIGHT,
    icon: Lightbulb,
    label: "Insight",
    color: "text-gray-300 hover:text-white",
    activeColor: "bg-gray-700 text-white ring-gray-600",
  },
  {
    type: MessageTypes.ADVICE,
    icon: BookOpen,
    label: "Advice",
    color: "text-gray-300 hover:text-white",
    activeColor: "bg-gray-700 text-white ring-gray-600",
  },
  {
    type: MessageTypes.ACTION,
    icon: CheckSquare,
    label: "Action",
    color: "text-gray-300 hover:text-white",
    activeColor: "bg-gray-700 text-white ring-gray-600",
  },
];

export function StudentChatInput({ selectedType, onTypeChange, onSendMessage }) {
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const cn = (...classes) => classes.filter(Boolean).join(' ');

  return (
    <div className="px-6 py-4 border-t border-[#535353]/30 bg-[#121212]">
      {/* Message type selector */}
      <div className="flex items-center gap-1 mb-3">
        {messageTypes.map(({ type, icon: Icon, label, color, activeColor }) => (
          <button
            key={type}
            onClick={() => onTypeChange(type)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
              selectedType === type ? `${activeColor} ring-1 ring-inset` : `${color} hover:bg-[#212121]/50`,
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            className={cn(
              "w-full resize-none rounded-lg border border-[#535353]/30 bg-[#212121]",
              "px-4 py-3 text-sm text-white placeholder:text-[#535353]",
              "focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500",
              "transition-all duration-200 min-h-[48px] max-h-[120px]",
            )}
            style={{ height: "48px" }}
            onInput={(e) => {
              const target = e.target;
              target.style.height = "48px";
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
            }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!inputValue.trim()}
          className={cn(
            "h-12 w-12 rounded-lg",
            "bg-gray-600 hover:bg-gray-500",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-all duration-200",
          )}
        >
          <Send className="h-5 w-5 text-white" />
        </button>
      </div>
    </div>
  );
}
