import React from "react";
import { Circle, MoreVertical } from "lucide-react";

export function StudentChatHeader({ 
  mentorName = "Select a conversation", 
  mentorRole = "", 
  mentorAvatar = ""
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

  return (
    <header className="flex items-center justify-between px-6 py-2 border-b border-[#535353]/30 bg-[#121212]">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="h-10 w-10 border-2 border-gray-600 rounded-full overflow-hidden bg-[#212121] flex items-center justify-center">
            {mentorAvatar ? (
              <img 
                src={mentorAvatar} 
                alt={mentorName} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <span 
              className="text-sm font-semibold text-white flex items-center justify-center w-full h-full"
              style={{ display: mentorAvatar ? 'none' : 'flex' }}
            >
              {getInitials(mentorName)}
            </span>
          </div>
          <Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-gray-300 text-gray-300" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-white">
              {mentorName}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#b3b3b3]">
            {mentorRole && (
              <span>{mentorRole}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          className="p-2 rounded-lg text-[#b3b3b3] hover:text-white hover:bg-[#212121] transition-colors"
          title="More options"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
