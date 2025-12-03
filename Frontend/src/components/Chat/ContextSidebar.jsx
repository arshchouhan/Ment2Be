import React from "react";
import { Target, CheckSquare, Lightbulb, FileText, ExternalLink } from "lucide-react";
import { MessageTypes } from "../../lib/types";
import "./chat-scrollbar.css";

const goals = [
  { id: "1", title: "Complete User Research Module", progress: 75, dueDate: "Dec 15" },
  { id: "2", title: "Build Product Roadmap", progress: 30, dueDate: "Dec 30" },
  { id: "3", title: "Present to Stakeholders", progress: 0, dueDate: "Jan 10" },
];

const resources = [
  { id: "1", title: "User Interview Templates", type: "PDF" },
  { id: "2", title: "JTBD Framework Guide", type: "Link" },
  { id: "3", title: "PM Career Roadmap", type: "Doc" },
];

export function ContextSidebar({ messages }) {
  const actionItems = messages.filter((m) => m.type === MessageTypes.ACTION);
  const insights = messages.filter((m) => m.type === MessageTypes.INSIGHT);

  const cn = (...classes) => classes.filter(Boolean).join(' ');

  // Simple Progress component
  const Progress = ({ value, className }) => (
    <div className="w-full bg-gray-700 rounded-full h-1.5">
      <div 
        className="bg-gray-400 h-1.5 rounded-full transition-all duration-300" 
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#121212]">
      {/* Mentee profile section */}
      <div className="p-6 border-b border-[#535353]/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 border-2 border-gray-600 rounded-full overflow-hidden bg-[#212121] flex items-center justify-center">
            <span className="text-sm font-semibold text-white">JD</span>
          </div>
          <div>
            <h3 className="font-medium text-white">James Davis</h3>
            <p className="text-xs text-[#535353]">Aspiring Product Manager</p>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-[#535353]">
          <span>Mentorship Progress</span>
          <span className="text-white font-medium">Session 8 of 12</span>
        </div>
        <Progress value={67} className="h-1.5 mt-2 bg-[#212121]" />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto chat-scrollbar">
        {/* Goals section */}
        <div className="p-6 border-b border-[#535353]/30">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-gray-400" />
            <h4 className="font-medium text-white">Current Goals</h4>
          </div>
          <div className="space-y-3">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="p-3 rounded-lg bg-[#212121] border border-[#535353]/30 hover:border-[#535353]/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm text-[#b3b3b3] leading-tight">{goal.title}</span>
                  <span className="text-[10px] text-[#535353] whitespace-nowrap ml-2">{goal.dueDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={goal.progress} className="h-1 flex-1 bg-[#535353]/30" />
                  <span className="text-[10px] text-[#535353]">{goal.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Items section */}
        <div className="p-6 border-b border-[#535353]/30">
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="h-4 w-4 text-gray-400" />
            <h4 className="font-medium text-white">Action Items</h4>
            <span className="ml-auto text-xs text-[#535353]">{actionItems.length}</span>
          </div>
          <div className="space-y-2">
            {actionItems.length > 0 ? (
              actionItems.slice(-3).map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "p-3 rounded-lg border border-gray-600 bg-gray-800",
                    "hover:bg-gray-700 transition-colors cursor-pointer",
                  )}
                >
                  <p className="text-xs text-[#b3b3b3] leading-relaxed">{item.content}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#535353] italic">No action items yet</p>
            )}
          </div>
        </div>

        {/* Key Insights section */}
        <div className="p-6 border-b border-[#535353]/30">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-4 w-4 text-gray-400" />
            <h4 className="font-medium text-white">Key Insights</h4>
            <span className="ml-auto text-xs text-[#535353]">{insights.length}</span>
          </div>
          <div className="space-y-2">
            {insights.length > 0 ? (
              insights.slice(-3).map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "p-3 rounded-lg border border-gray-600 bg-gray-800",
                    "hover:bg-gray-700 transition-colors cursor-pointer",
                  )}
                >
                  <p className="text-xs text-[#b3b3b3] leading-relaxed">{item.content}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#535353] italic">No insights captured yet</p>
            )}
          </div>
        </div>

        {/* Shared Resources section */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-gray-400" />
            <h4 className="font-medium text-white">Shared Resources</h4>
          </div>
          <div className="space-y-2">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg",
                  "bg-[#212121] border border-[#535353]/30",
                  "hover:border-[#535353]/50 transition-colors cursor-pointer group",
                )}
              >
                <span className="text-xs text-[#b3b3b3]">{resource.title}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#535353] uppercase">{resource.type}</span>
                  <ExternalLink className="h-3 w-3 text-[#535353] group-hover:text-white transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
