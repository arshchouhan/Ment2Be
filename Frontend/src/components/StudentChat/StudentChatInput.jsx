import React, { useState } from "react";
import { Send, MessageSquare, HelpCircle, Lightbulb, Bookmark } from "lucide-react";

const messageTypes = [
  {
    type: "normal",
    icon: MessageSquare,
    label: "Message",
    color: "text-gray-400 hover:text-gray-300",
    activeColor: "bg-gray-800 text-white ring-gray-600",
  },
  {
    type: "question",
    icon: HelpCircle,
    label: "Question",
    color: "text-gray-400 hover:text-gray-300",
    activeColor: "bg-gray-800 text-gray-300 ring-gray-600",
  },
  {
    type: "insight",
    icon: Lightbulb,
    label: "Insight",
    color: "text-gray-400 hover:text-gray-300",
    activeColor: "bg-gray-800 text-gray-300 ring-gray-600",
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

  return (
    <div className="px-4 py-3 border-t border-gray-700 bg-[#121212]">
      {/* Message type selector */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          {messageTypes.map(({ type, icon: Icon, label, color, activeColor }) => (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-all duration-200 ${
                selectedType === type ? `${activeColor} ring-1 ring-inset` : `${color} hover:bg-gray-800`
              }`}
            >
              <Icon className="h-3 w-3" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium text-gray-400 hover:text-gray-300 hover:bg-gray-800 transition-all">
          <Bookmark className="h-3 w-3" />
          <span className="hidden sm:inline">Save Notes</span>
        </button>
      </div>

      {/* Input area */}
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your mentor a question..."
            rows={1}
            className="w-full resize-none rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 min-h-[36px] max-h-[100px]"
            style={{ height: "36px" }}
            onInput={(e) => {
              const target = e.target;
              target.style.height = "36px";
              target.style.height = `${Math.min(target.scrollHeight, 100)}px`;
            }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!inputValue.trim()}
          className="h-9 w-9 rounded-lg bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
        >
          <Send className="h-4 w-4 text-white" />
        </button>
      </div>
    </div>
  );
}
