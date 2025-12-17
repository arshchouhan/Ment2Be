import React from 'react';
import { FileText } from 'lucide-react';
import { TaskCard } from './TaskCard';

export function TaskList({ tasks, loading, error, onRefresh, onTaskUpdate }) {
  if (loading) {
    return (
      <div className="bg-[#121212] rounded-lg shadow-sm border border-gray-700 p-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
        </div>
        <p className="text-gray-400">Loading your tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#121212] rounded-lg shadow-sm border border-red-700 p-8 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-[#121212] rounded-lg shadow-sm border border-gray-700 p-8 text-center">
        <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-white mb-2">No Tasks Yet</h2>
        <p className="text-gray-400">
          You don't have any tasks assigned yet. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <TaskCard 
          key={task._id || task.id} 
          task={task} 
          onTaskUpdate={onTaskUpdate}
        />
      ))}
    </div>
  );
}
