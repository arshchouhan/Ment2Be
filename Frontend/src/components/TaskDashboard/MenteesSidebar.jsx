import React from "react";
import { Award, BarChart3, Users } from "lucide-react";

const mentees = [
  { id: "1", name: "Sarah Chen", initials: "SC", activeTasks: 4, completed: 6, total: 8, streak: 12 },
  { id: "2", name: "Michael Park", initials: "MP", activeTasks: 3, completed: 5, total: 7, streak: 8 },
  { id: "3", name: "Emma Wilson", initials: "EW", activeTasks: 5, completed: 4, total: 6, streak: 15 },
  { id: "4", name: "James Rodriguez", initials: "JR", activeTasks: 2, completed: 9, total: 10, streak: 5 },
  { id: "5", name: "Priya Sharma", initials: "PS", activeTasks: 6, completed: 3, total: 5, streak: 20 },
];

export function MenteesSidebar({ selectedMentee, onSelectMentee }) {
  return (
    <div className="space-y-4">
      <div className="bg-[#121212] rounded-lg shadow-sm border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-400" />
              <h2 className="font-semibold text-white">Mentees</h2>
            </div>
            <span className="bg-gray-700 text-gray-300 text-xs font-medium px-2 py-1 rounded-full">
              {mentees.length}
            </span>
          </div>
        </div>

        <div className="p-2">
          <button
            onClick={() => onSelectMentee(null)}
            className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
              selectedMentee === null ? "bg-gray-800 text-white font-medium" : "hover:bg-gray-800 text-gray-300"
            }`}
          >
            All Mentees
          </button>

          <div className="mt-2 space-y-1">
            {mentees.map((mentee) => (
              <button
                key={mentee.id}
                onClick={() => onSelectMentee(mentee.id)}
                className={`w-full p-3 rounded-lg transition-all ${
                  selectedMentee === mentee.id
                    ? "bg-gray-800 border-2 border-gray-600"
                    : "hover:bg-gray-800 border-2 border-transparent"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                    {mentee.initials}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-medium text-white truncate">{mentee.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-400">{mentee.activeTasks} active tasks</span>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-gray-300">
                        {mentee.completed}/{mentee.total} completed
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Award className="w-3 h-3" />
                        <span>{mentee.streak}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 text-white shadow-sm border border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-5 h-5" />
          <h3 className="font-semibold">Analytics</h3>
        </div>
        <p className="text-sm text-gray-300 mb-3">Track mentee progress and identify areas for improvement.</p>
        <button className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
          View Analytics
        </button>
      </div>
    </div>
  );
}
