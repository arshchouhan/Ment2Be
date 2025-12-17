import React from "react";
import { Circle, MoreVertical, Clock } from "lucide-react";

export function ChatHeader({ 
  participantName = "Select a conversation", 
  participantRole = "", 
  participantAvatar = "",
  sessionData = null
}) {
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Format session time if available
  const formatSessionTime = () => {
    if (!sessionData?.sessionDate) return null;
    
    try {
      const date = new Date(sessionData.sessionDate);
      if (isNaN(date.getTime())) return null;
      
      return date.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting session time:', e);
      return null;
    }
  };

  const sessionTime = formatSessionTime();

  return (
    <header className="flex items-center justify-between px-6 py-2 border-b border-[#535353]/30 bg-[#121212]">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="h-10 w-10 border-2 border-gray-600 rounded-full overflow-hidden bg-[#212121] flex items-center justify-center">
            {participantAvatar ? (
              <img 
                src={participantAvatar} 
                alt={participantName} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <span 
              className="text-sm font-semibold text-white flex items-center justify-center w-full h-full"
              style={{ display: participantAvatar ? 'none' : 'flex' }}
            >
              {getInitials(participantName)}
            </span>
          </div>
          <Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-white text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-white">
              {participantName}
            </h1>
            {sessionData?.isMentor === false && (
              <span className="text-xs bg-[#2a2d32] text-white px-2 py-0.5 rounded-full border border-[#535353]/30">
                Mentor
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-[#b3b3b3]">
            {participantRole && (
              <span>{participantRole}</span>
            )}
            {sessionTime && (
              <div className="flex items-center text-xs text-gray-400">
                <Clock className="h-3 w-3 mr-1 text-white" />
                <span>{sessionTime}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          className="p-2 rounded-lg text-[#b3b3b3] hover:text-white hover:bg-[#212121] transition-colors"
          title="More options"
        >
          <MoreVertical className="h-5 w-5 text-white" />
        </button>
      </div>
    </header>
  );
}
