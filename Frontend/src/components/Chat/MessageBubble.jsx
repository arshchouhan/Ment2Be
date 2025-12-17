import React from "react";
import { MessageSquare, HelpCircle, Lightbulb, BookOpen, CheckSquare, AlertCircle } from "lucide-react";
import { MessageTypes } from "../../lib/types";

// Default configuration for message types
const typeConfig = {
  [MessageTypes.NORMAL]: {
    icon: MessageSquare,
    label: "Message",
    className: "bg-transparent",
  },
  [MessageTypes.QUESTION]: {
    icon: HelpCircle,
    label: "Question",
    className: "bg-[#2a2d32] text-white",
  },
  [MessageTypes.INSIGHT]: {
    icon: Lightbulb,
    label: "Insight",
    className: "bg-[#2a2d32] text-white",
  },
  [MessageTypes.ADVICE]: {
    icon: BookOpen,
    label: "Advice",
    className: "bg-[#2a2d32] text-white",
  },
  [MessageTypes.ACTION]: {
    icon: CheckSquare,
    label: "Action Item",
    className: "bg-[#2a2d32] text-white",
  },
  // Fallback for unknown message types
  unknown: {
    icon: AlertCircle,
    label: "Unknown",
    className: "bg-[#2a2d32] text-white",
  },
};

export function MessageBubble({ message = {} }) {
  // Safely get message properties with defaults
  const { 
    type = MessageTypes.NORMAL,
    custom_type = MessageTypes.NORMAL, // Stream Chat stores custom type here
    sender = 'mentor', 
    content = '',
    text = '', // Stream Chat uses 'text' field
    timestamp = new Date(),
    created_at = new Date(), // Stream Chat uses 'created_at'
    senderName = '',
    receiverName = ''
  } = message;

  // Use text from Stream Chat if content is empty
  const messageContent = (content || text || '').trim();
  // Use custom_type if type is empty (Stream Chat sends type as '')
  const messageType = (type && type !== '') ? type : custom_type;
  // Use created_at if timestamp is not a valid date
  const messageTime = timestamp instanceof Date && !isNaN(timestamp.getTime()) ? timestamp : new Date(created_at);

  // Don't render empty messages
  if (!messageContent) {
    return null;
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isMentor = sender === 'mentor' || sender?._id === (user?._id || user?.id);
  
  // Get config with fallback to unknown type
  const config = typeConfig[messageType] || typeConfig.unknown;
  const Icon = config?.icon || AlertCircle;

  const formatTime = (date) => {
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return isNaN(dateObj.getTime()) 
        ? 'Invalid Date' 
        : dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return '--:--';
    }
  };

  const cn = (...classes) => classes.filter(Boolean).join(' ');

  // Handle session info messages differently
  if (message.isSessionInfo) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm px-4 py-2 rounded-full">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex w-full mb-3", isMentor ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[80%] relative", isMentor ? "pl-4" : "pr-4")}>
        {/* Sender name */}
        {senderName && (
          <div className="text-xs text-gray-500 mb-1 ml-1">
            {senderName}
          </div>
        )}
        
        <div 
          className={cn(
            "rounded-2xl px-4 py-2 text-sm transition-all duration-200",
            isMentor 
              ? "bg-[#2a2d32] text-white border border-[#535353]/30 rounded-tr-none" 
              : "bg-[#212121] text-white border border-[#535353]/30 rounded-tl-none",
            "hover:shadow-lg hover:shadow-gray-900/20"
          )}
        >
          {/* Message type indicator */}
          {messageType !== MessageTypes.NORMAL && (
            <div className={cn("flex items-center mb-1 text-xs font-medium", isMentor ? 'text-white' : 'text-gray-300')}>
              <Icon className="w-3.5 h-3.5 mr-1" />
              <span>{config.label}</span>
            </div>
          )}
          
          {/* Message content */}
          <div className="whitespace-pre-wrap break-words">
            {messageContent || 'No content'}
          </div>
          
          {/* Message time */}
          <div className={cn("text-xs mt-1 text-right", isMentor ? 'text-[#b3b3b3]' : 'text-[#b3b3b3]')}>
            {formatTime(messageTime)}
          </div>
        </div>
      </div>
    </div>
  );
}
