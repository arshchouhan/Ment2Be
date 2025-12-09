import React from "react";
import { MessageSquare, Search, Plus } from "lucide-react";
import "../Chat/chat-scrollbar.css";

export function MentorList({ mentors, activeMentorId, onSelectMentor }) {
  const formatTime = (date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const cn = (...classes) => classes.filter(Boolean).join(' ');

  return (
    <div className="flex flex-col h-full bg-[#121212] border-r border-[#535353]/30">
      {/* Header */}
      <div className="p-4 border-b border-[#535353]/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gray-700 border border-gray-600">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-semibold text-white">Messages</h2>
          </div>
          <button className="p-2 rounded-lg hover:bg-[#212121] transition-colors">
            <Plus className="w-5 h-5 text-[#b3b3b3]" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#535353]" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#212121] border border-[#535353]/30 rounded-lg text-sm text-white placeholder:text-[#535353] focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
          />
        </div>
      </div>

      {/* Mentor list */}
      <div className="flex-1 overflow-y-auto py-2 chat-scrollbar">
        {mentors.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            No conversations yet
          </div>
        ) : (
          mentors.map((mentor) => (
          <button
            key={mentor.id}
            onClick={() => onSelectMentor(mentor.id)}
            className={cn(
              "w-full p-3 mx-2 mb-1 rounded-xl flex items-start gap-3 transition-all duration-200 text-left",
              activeMentorId === mentor.id
                ? "bg-[#212121] border border-gray-600"
                : "hover:bg-[#212121]/50 border border-transparent",
            )}
            style={{ width: "calc(100% - 16px)" }}
          >
            {/* Avatar with online indicator */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-[#212121] border border-[#535353]/30 flex items-center justify-center overflow-hidden">
                {mentor.avatar ? (
                  <img 
                    src={mentor.avatar} 
                    alt={mentor.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span 
                  className="text-lg font-semibold text-white flex items-center justify-center"
                  style={{ display: mentor.avatar ? 'none' : 'flex' }}
                >
                  {mentor.name.charAt(0)}
                </span>
              </div>
              {mentor.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-gray-400 rounded-full border-2 border-[#121212]" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-white truncate">{mentor.name}</span>
                <span className="text-xs text-[#535353] flex-shrink-0 ml-2">
                  {formatTime(mentor.lastMessageTime)}
                </span>
              </div>
              <p className="text-xs text-[#535353] mb-1 truncate">{mentor.role}</p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#b3b3b3] truncate pr-2">{mentor.lastMessage}</p>
                {mentor.unreadCount > 0 && (
                  <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-gray-600 rounded-full text-xs font-medium text-white flex items-center justify-center">
                    {mentor.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        )))}
      </div>

      {/* Footer - Current User */}
      <div className="p-4 border-t border-[#535353]/30">
        {(() => {
          try {
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            const userInitial = currentUser?.name?.charAt(0) || 'U';
            const userRole = currentUser?.role === 'mentor' ? 'Mentor Account' : 'Student Account';
            
            return (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#212121] border border-[#535353]/30">
                <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">{userInitial}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{currentUser?.name || 'User'}</p>
                  <p className="text-xs text-gray-400">{userRole}</p>
                </div>
              </div>
            );
          } catch (error) {
            console.error('Error loading user data:', error);
            return null;
          }
        })()}
      </div>
    </div>
  );
}
