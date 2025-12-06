import React, { useState } from "react";
import { Search, Filter, Calendar, Plus, ClipboardList } from "lucide-react";

const tabs = ["All", "In Progress", "Pending Review", "Completed"];

export function TaskListPage({ onCreateTask }) {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
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
      <div className="flex gap-1 border-b border-gray-700 -mx-4 px-4">
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

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex justify-center mb-6">
          <svg className="w-24 h-24 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-300 mb-2">No tasks yet</h3>
        <p className="text-gray-400 mb-6 max-w-md text-center">
          No tasks created yet. Start by creating a task for your mentees.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCreateTask}
            className="inline-flex items-center justify-center px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </button>
          <button className="inline-flex items-center justify-center px-6 py-2.5 border border-gray-600 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors font-medium">
            View Guidelines
          </button>
        </div>
      </div>
    </div>
  );
}
