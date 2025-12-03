import React from "react";
import { GraduationCap, Search, Bell, Settings } from "lucide-react";

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

  const totalUnread = mentors.reduce((acc, m) => acc + m.unreadCount, 0);

  return (
    <div className="flex flex-col h-full bg-[#121212] border-r border-gray-700">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gray-800 border border-gray-600">
              <GraduationCap className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">My Mentors</h2>
              <p className="text-[10px] text-gray-400">{mentors.length} active mentorships</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="relative p-1.5 rounded-lg hover:bg-gray-800 transition-colors">
              <Bell className="w-3.5 h-3.5 text-gray-400" />
              {totalUnread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-gray-500 rounded-full text-[9px] font-medium text-white flex items-center justify-center">
                  {totalUnread}
                </span>
              )}
            </button>
            <button className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors">
              <Settings className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search mentors..."
            className="w-full pl-8 pr-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-xs text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
          />
        </div>
      </div>

      {/* Mentor list */}
      <div className="flex-1 overflow-y-auto py-2">
        {mentors.map((mentor) => {
          const progress = (mentor.sessionsCompleted / mentor.totalSessions) * 100;
          return (
            <button
              key={mentor.id}
              onClick={() => onSelectMentor(mentor.id)}
              className={`w-full p-2 mx-2 mb-1 rounded-lg flex flex-col gap-1.5 transition-all duration-200 text-left ${
                activeMentorId === mentor.id
                  ? "bg-gray-800 border border-gray-600"
                  : "hover:bg-gray-800 border border-transparent"
              }`}
              style={{ width: "calc(100% - 16px)" }}
            >
              <div className="flex items-start gap-2">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-600 flex items-center justify-center overflow-hidden">
                    <span className="text-sm font-semibold text-gray-300">{mentor.name.charAt(0)}</span>
                  </div>
                  {mentor.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-gray-400 rounded-full border-2 border-[#121212]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-medium text-white truncate">{mentor.name}</span>
                    <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                      {formatTime(mentor.lastMessageTime)}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mb-1">
                    {mentor.role} @ {mentor.company}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-300 truncate pr-2">{mentor.lastMessage}</p>
                    {mentor.unreadCount > 0 && (
                      <span className="flex-shrink-0 min-w-[16px] h-4 px-1 bg-gray-600 rounded-full text-[10px] font-medium text-white flex items-center justify-center">
                        {mentor.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="h-1 flex-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-[9px] text-gray-400">
                  {mentor.sessionsCompleted}/{mentor.totalSessions}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer - Student profile */}
      <div className="p-3 border-t border-gray-700">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-800 border border-gray-600">
          <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-300">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white">Alex Chen</p>
            <p className="text-[10px] text-gray-400">Student Account</p>
          </div>
        </div>
      </div>
    </div>
  );
}
