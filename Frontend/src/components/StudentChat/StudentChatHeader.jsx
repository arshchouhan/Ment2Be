import React from "react";
import { Circle, MoreVertical, Phone, Video, Calendar, Star } from "lucide-react";

export function StudentChatHeader({ mentor }) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-[#121212]">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="h-10 w-10 rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-300">
              {mentor.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          {mentor.isOnline && (
            <Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-gray-400 text-gray-400" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-white">{mentor.name}</h1>
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gray-800 border border-gray-600">
              <Star className="w-2.5 h-2.5 text-gray-400 fill-gray-400" />
              <span className="text-[10px] font-medium text-gray-400">Top Mentor</span>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            {mentor.role} @ {mentor.company} • {mentor.isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Schedule</span>
        </button>
        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <Phone className="h-5 w-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <Video className="h-5 w-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
