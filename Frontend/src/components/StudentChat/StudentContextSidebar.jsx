import React from "react";
import { CheckSquare, Lightbulb, Award, TrendingUp, Clock } from "lucide-react";
import "../Chat/chat-scrollbar.css";

export function StudentContextSidebar({ mentor, messages }) {
  const actionItems = messages.filter((m) => m.custom_type === "action" || m.type === "action");
  const insights = messages.filter((m) => m.custom_type === "insight" || m.type === "insight");
  const advice = messages.filter((m) => (m.custom_type === "advice" || m.type === "advice"));

  return (
    <div className="h-full flex flex-col bg-[#121212]">
      {/* Mentor profile section */}
      <div className="p-6 border-b border-[#535353]/30">
        <div className="flex items-center gap-3 mb-4">
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
              className="text-xl font-semibold text-white flex items-center justify-center"
              style={{ display: mentor.avatar ? 'none' : 'flex' }}
            >
              {mentor.name.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-white">{mentor.name}</h3>
            <p className="text-xs text-[#b3b3b3]">{mentor.role}</p>
          </div>
        </div>

        {/* Expertise tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {mentor.expertise && mentor.expertise.map((skill) => (
            <span
              key={skill}
              className="px-2 py-1 rounded-md bg-[#212121] border border-[#535353]/30 text-[10px] text-[#b3b3b3]"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Company info */}
        {mentor.company && (
          <div className="p-3 rounded-lg bg-[#212121] border border-[#535353]/30">
            <p className="text-xs text-[#535353] mb-1">Company</p>
            <p className="text-sm text-white font-medium">{mentor.company}</p>
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto chat-scrollbar">
        {/* Quick stats */}
        <div className="p-6 border-b border-[#535353]/30">
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#b3b3b3]" />
            Conversation Stats
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-lg bg-[#212121] border border-[#535353]/30 text-center">
              <span className="block text-xl font-semibold text-white">{actionItems.length}</span>
              <span className="text-[10px] text-[#535353]">Action Items</span>
            </div>
            <div className="p-3 rounded-lg bg-[#212121] border border-[#535353]/30 text-center">
              <span className="block text-xl font-semibold text-white">{insights.length}</span>
              <span className="text-[10px] text-[#535353]">Insights</span>
            </div>
            <div className="p-3 rounded-lg bg-[#212121] border border-[#535353]/30 text-center">
              <span className="block text-xl font-semibold text-white">{advice.length}</span>
              <span className="text-[10px] text-[#535353]">Advice</span>
            </div>
            <div className="p-3 rounded-lg bg-[#212121] border border-[#535353]/30 text-center">
              <span className="block text-xl font-semibold text-white">{messages.length}</span>
              <span className="text-[10px] text-[#535353]">Messages</span>
            </div>
          </div>
        </div>

        {/* Pending Action Items */}
        <div className="p-6 border-b border-[#535353]/30">
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="h-4 w-4 text-[#b3b3b3]" />
            <h4 className="font-medium text-white">Action Items</h4>
            <span className="ml-auto text-xs text-[#535353]">{actionItems.length}</span>
          </div>
          <div className="space-y-2">
            {actionItems.length > 0 ? (
              actionItems.slice(-3).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg border border-[#535353]/30 bg-[#212121] hover:bg-[#212121]/80 transition-colors cursor-pointer"
                >
                  <p className="text-xs text-[#b3b3b3] leading-relaxed">{item.content || item.text}</p>
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-[#535353]">
                    <Clock className="w-3 h-3" />
                    <span>From your mentor</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#535353] italic">No action items yet</p>
            )}
          </div>
        </div>

        {/* Key Insights */}
        <div className="p-6 border-b border-[#535353]/30">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-4 w-4 text-[#b3b3b3]" />
            <h4 className="font-medium text-white">Insights</h4>
            <span className="ml-auto text-xs text-[#535353]">{insights.length}</span>
          </div>
          <div className="space-y-2">
            {insights.length > 0 ? (
              insights.slice(-3).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg border border-[#535353]/30 bg-[#212121] hover:bg-[#212121]/80 transition-colors cursor-pointer"
                >
                  <p className="text-xs text-[#b3b3b3] leading-relaxed">{item.content || item.text}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#535353] italic">No insights yet</p>
            )}
          </div>
        </div>

        {/* Achievements teaser */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-4 w-4 text-[#b3b3b3]" />
            <h4 className="font-medium text-white">Next Session</h4>
          </div>
          <div className="p-4 rounded-lg bg-[#212121] border border-[#535353]/30 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-700 flex items-center justify-center">
              <Clock className="w-6 h-6 text-[#b3b3b3]" />
            </div>
            <p className="text-sm font-medium text-white mb-1">Keep Learning!</p>
            <p className="text-xs text-[#535353]">
              {mentor.nextSession 
                ? `Session on ${new Date(mentor.nextSession).toLocaleDateString()}`
                : "Schedule your next session"
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
