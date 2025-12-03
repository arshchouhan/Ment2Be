import React from "react";
import { Circle, MoreVertical, Phone, Video } from "lucide-react";

export function ChatHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-[#535353]/30 bg-[#121212]">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 border-2 border-gray-600 rounded-full overflow-hidden bg-[#212121] flex items-center justify-center">
            <span className="text-lg font-semibold text-white">SM</span>
          </div>
          <Circle className="absolute -bottom-0.5 -right-0.5 h-4 w-4 fill-gray-400 text-gray-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">Sarah Mitchell</h1>
          <p className="text-sm text-[#b3b3b3]">Senior Product Manager • Online</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg text-[#b3b3b3] hover:text-white hover:bg-[#212121] transition-colors">
          <Phone className="h-5 w-5" />
        </button>
        <button className="p-2 rounded-lg text-[#b3b3b3] hover:text-white hover:bg-[#212121] transition-colors">
          <Video className="h-5 w-5" />
        </button>
        <button className="p-2 rounded-lg text-[#b3b3b3] hover:text-white hover:bg-[#212121] transition-colors">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
