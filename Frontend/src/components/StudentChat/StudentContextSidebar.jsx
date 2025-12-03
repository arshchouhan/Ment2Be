import React from "react";
import { CheckSquare, Lightbulb, Award, TrendingUp, Clock } from "lucide-react";

export function StudentContextSidebar({ mentor, messages }) {
  const actionItems = messages.filter((m) => m.type === "action" && m.sender === "mentor");
  const insights = messages.filter((m) => m.type === "insight");
  const advice = messages.filter((m) => m.type === "advice" && m.sender === "mentor");

  const progress = (mentor.sessionsCompleted / mentor.totalSessions) * 100;

  return (
    <div className="h-full flex flex-col bg-[#121212]">
      {/* Mentor profile section */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gray-800 border border-gray-600 flex items-center justify-center">
            <span className="text-xl font-semibold text-gray-300">{mentor.name.charAt(0)}</span>
          </div>
          <div>
            <h3 className="font-medium text-white">{mentor.name}</h3>
            <p className="text-xs text-gray-400">{mentor.role}</p>
          </div>
        </div>

        {/* Expertise tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {mentor.expertise.map((skill) => (
            <span
              key={skill}
              className="px-2 py-1 rounded-md bg-gray-800 border border-gray-600 text-[10px] text-gray-300"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Session progress */}
        <div className="p-3 rounded-lg bg-gray-800 border border-gray-600">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-gray-400">Mentorship Progress</span>
            <span className="text-white font-medium">
              {mentor.sessionsCompleted} of {mentor.totalSessions} sessions
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Quick stats */}
        <div className="p-6 border-b border-gray-700">
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            Your Progress
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-lg bg-gray-800 border border-gray-600 text-center">
              <span className="block text-xl font-semibold text-gray-300">{actionItems.length}</span>
              <span className="text-[10px] text-gray-400">Action Items</span>
            </div>
            <div className="p-3 rounded-lg bg-gray-800 border border-gray-600 text-center">
              <span className="block text-xl font-semibold text-gray-300">{insights.length}</span>
              <span className="text-[10px] text-gray-400">Insights</span>
            </div>
            <div className="p-3 rounded-lg bg-gray-800 border border-gray-600 text-center">
              <span className="block text-xl font-semibold text-gray-300">{advice.length}</span>
              <span className="text-[10px] text-gray-400">Advice Given</span>
            </div>
            <div className="p-3 rounded-lg bg-gray-800 border border-gray-600 text-center">
              <span className="block text-xl font-semibold text-white">{messages.length}</span>
              <span className="text-[10px] text-gray-400">Messages</span>
            </div>
          </div>
        </div>

        {/* Pending Action Items */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="h-4 w-4 text-gray-400" />
            <h4 className="font-medium text-white">Action Items</h4>
            <span className="ml-auto text-xs text-gray-400">{actionItems.length}</span>
          </div>
          <div className="space-y-2">
            {actionItems.length > 0 ? (
              actionItems.slice(-3).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg border border-gray-600 bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <p className="text-xs text-gray-300 leading-relaxed">{item.content}</p>
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>From your mentor</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 italic">No action items yet</p>
            )}
          </div>
        </div>

        {/* Key Insights */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-4 w-4 text-gray-400" />
            <h4 className="font-medium text-white">Your Insights</h4>
            <span className="ml-auto text-xs text-gray-400">{insights.length}</span>
          </div>
          <div className="space-y-2">
            {insights.length > 0 ? (
              insights.slice(-3).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg border border-gray-600 bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <p className="text-xs text-gray-300 leading-relaxed">{item.content}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 italic">Share your insights during conversations</p>
            )}
          </div>
        </div>

        {/* Achievements teaser */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-4 w-4 text-gray-400" />
            <h4 className="font-medium text-white">Achievements</h4>
          </div>
          <div className="p-4 rounded-lg bg-gray-800 border border-gray-600 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-700 flex items-center justify-center">
              <Award className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-white mb-1">Keep Learning!</p>
            <p className="text-xs text-gray-400">
              Complete {mentor.totalSessions - mentor.sessionsCompleted} more sessions to earn your certificate
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
