import React, { useState, useEffect } from "react";
import { Search, Filter, Calendar, MoreVertical, User, Target, Clock, MessageSquare, Plus } from "lucide-react";

const tabs = ["All", "In Progress", "Pending Review", "Completed"];

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

export function TasksSection({ selectedMentee, onCreateTask }) {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      // Use Java backend API (port 8081)
      const response = await fetch('http://localhost:8081/api/tasks', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok && data.success && data.tasks) {
        setTasks(data.tasks);
      } else if (response.ok && Array.isArray(data)) {
        setTasks(data);
      } else {
        console.error('Error fetching tasks:', data.message);
        setTasks([]);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

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
        {loading ? (
          <div className="p-12 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
            </div>
            <p className="text-gray-400">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <div className="flex justify-center mb-6">
              <svg className="w-24 h-24 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No tasks yet</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              {selectedMentee 
                ? "No tasks assigned to this mentee yet. Create one to get started!" 
                : "No tasks created yet. Start by creating a task for your mentees."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={onCreateTask} className="inline-flex items-center justify-center px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium">
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </button>
              <button className="inline-flex items-center justify-center px-6 py-2.5 border border-gray-600 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors font-medium">
                View Guidelines
              </button>
            </div>
          </div>
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
