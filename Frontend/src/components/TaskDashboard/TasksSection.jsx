import React, { useState } from "react";
import { Search, Filter, Calendar, MoreVertical, User, Target, Clock, MessageSquare } from "lucide-react";

const tabs = ["All", "In Progress", "Pending Review", "Completed"];

const tasks = [
  {
    id: "1",
    title: "Complete React Hooks Tutorial",
    mentee: "Sarah Chen",
    menteeId: "1",
    category: "Technical Skills",
    deadline: "Dec 15, 2025",
    status: "in-progress",
    priority: "high",
    progress: 65,
    hasQuestion: true,
  },
  {
    id: "2",
    title: "Write Blog Post on API Design",
    mentee: "Michael Park",
    menteeId: "2",
    category: "Content Creation",
    deadline: "Dec 18, 2025",
    status: "pending-review",
    priority: "medium",
    progress: 100,
  },
  {
    id: "3",
    title: "Practice Mock Interviews",
    mentee: "Emma Wilson",
    menteeId: "3",
    category: "Career Development",
    deadline: "Dec 20, 2025",
    status: "in-progress",
    priority: "medium",
    progress: 40,
  },
  {
    id: "4",
    title: "Leadership Workshop Exercises",
    mentee: "James Rodriguez",
    menteeId: "4",
    category: "Soft Skills",
    deadline: "Dec 10, 2025",
    status: "completed",
    priority: "low",
    progress: 100,
  },
  {
    id: "5",
    title: "Build Portfolio Website",
    mentee: "Priya Sharma",
    menteeId: "5",
    category: "Technical Skills",
    deadline: "Dec 25, 2025",
    status: "not-started",
    priority: "high",
    progress: 0,
    hasQuestion: true,
  },
];

const statusConfig = {
  "in-progress": { label: "In Progress", color: "text-gray-300", bg: "bg-gray-800" },
  "pending-review": { label: "Pending Review", color: "text-gray-300", bg: "bg-gray-800" },
  completed: { label: "Completed", color: "text-gray-300", bg: "bg-gray-800" },
  "not-started": { label: "Not Started", color: "text-gray-400", bg: "bg-gray-900" },
};

const priorityBorder = {
  high: "border-l-gray-400",
  medium: "border-l-gray-500",
  low: "border-l-gray-600",
};

export function TasksSection({ selectedMentee }) {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTasks = tasks.filter((task) => {
    const matchesMentee = !selectedMentee || task.menteeId === selectedMentee;
    const matchesTab =
      activeTab === "All" ||
      (activeTab === "In Progress" && task.status === "in-progress") ||
      (activeTab === "Pending Review" && task.status === "pending-review") ||
      (activeTab === "Completed" && task.status === "completed");
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMentee && matchesTab && matchesSearch;
  });

  return (
    <div className="bg-[#121212] rounded-lg shadow-sm border border-gray-700">
      {/* Search and Filters */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-600 bg-gray-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-shadow placeholder-gray-400"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-600 text-gray-300 bg-transparent rounded-lg hover:bg-gray-800 transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-600 text-gray-300 bg-transparent rounded-lg hover:bg-gray-800 transition-colors">
              <Calendar className="w-4 h-4" />
              Date Range
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 border-b border-gray-700 -mx-4 px-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                activeTab === tab ? "text-white" : "text-gray-400 hover:text-gray-300"
              }`}
            >
              {tab}
              {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="divide-y divide-gray-700">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No tasks found</div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 hover:bg-gray-900 transition-colors border-l-4 ${priorityBorder[task.priority]}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-white">{task.title}</h3>
                    {task.hasQuestion && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-800 text-gray-300 text-xs font-medium rounded-full border border-gray-600">
                        <MessageSquare className="w-3 h-3" />
                        Question
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-400">
                    <span className="inline-flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      {task.mentee}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Target className="w-4 h-4" />
                      {task.category}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {task.deadline}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400">Progress</span>
                      <span className="font-medium text-gray-300">{task.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-500 rounded-full transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      statusConfig[task.status].bg
                    } ${statusConfig[task.status].color}`}
                  >
                    {statusConfig[task.status].label}
                  </span>
                  <button className="p-1 rounded hover:bg-gray-800 transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-4">
                {task.status === "pending-review" && (
                  <button className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded-lg transition-colors">
                    Review Submission
                  </button>
                )}
                <button className="px-3 py-1.5 border border-gray-600 text-gray-300 text-xs bg-transparent rounded-lg hover:bg-gray-800 transition-colors">
                  View Details
                </button>
                <button className="p-1.5 text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors">
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
