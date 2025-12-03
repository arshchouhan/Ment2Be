import React from "react";
import { Bell, Settings, Plus } from "lucide-react";

export function Header({ onCreateTask }) {
  return (
    <header className="bg-[#121212] border-b border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div>
            <h1 className="text-xl font-semibold text-white">Task Management</h1>
            <p className="text-sm text-gray-400">Manage and track mentee assignments</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors relative">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gray-500 rounded-full" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={onCreateTask}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Task
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
