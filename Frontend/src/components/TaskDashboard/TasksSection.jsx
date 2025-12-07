import React, { useState, useEffect } from "react";
import { Search, Filter, Calendar, User, Target, Clock, MessageSquare, Plus, FileText, Zap, CheckCircle2, Award, ChevronDown, ChevronUp, File, Download } from "lucide-react";
import { TASK_API_URL } from "../../config/apiConfig.js";
import { toast } from "react-toastify";

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
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, [selectedMentee]); // Refetch when selectedMentee changes

  const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn('No token found in localStorage');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      let url = TASK_API_URL;
      
      // If a specific mentee is selected, fetch only their tasks
      if (selectedMentee) {
        url = `${TASK_API_URL.replace('/api/tasks', '')}/api/tasks/mentee/${selectedMentee}`;
        console.log('Fetching tasks for mentee:', selectedMentee, 'from:', url);
      } else {
        console.log('Fetching all tasks from:', TASK_API_URL);
      }
      
      // Use configured API (can be Node.js or Java)
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        console.error('HTTP Error:', response.status, response.statusText);
        setTasks([]);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success && data.tasks) {
        console.log('Tasks loaded successfully:', data.tasks.length);
        setTasks(data.tasks);
      } else if (Array.isArray(data)) {
        console.log('Tasks loaded as array:', data.length);
        setTasks(data);
      } else {
        console.error('Unexpected response format:', data);
        setTasks([]);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack
      });
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle task review/completion
  const handleReviewTask = async (taskId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error('No authentication token found');
      return;
    }

    try {
      setUpdatingTaskId(taskId);
      
      // Determine the API URL based on the configured backend
      const baseUrl = TASK_API_URL.replace('/api/tasks', '');
      const updateUrl = `${baseUrl}/api/tasks/${taskId}`;
      
      const response = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'completed'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Update local state
      setTasks(tasks.map(task => 
        (task._id || task.id) === taskId 
          ? { ...task, status: 'completed' }
          : task
      ));
      
      toast.success('Task marked as completed!');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task: ' + error.message);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Get task count by status
  const getTaskCount = (status) => {
    if (status === 'all') {
      return tasks.length;
    }
    return tasks.filter(task => task.status === status).length;
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesMentee = !selectedMentee || task.menteeId === selectedMentee;
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "in-progress" && task.status === "in-progress") ||
      (activeFilter === "pending-review" && task.status === "pending-review") ||
      (activeFilter === "completed" && task.status === "completed");
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMentee && matchesFilter && matchesSearch;
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

        {/* Filter Tabs */}
        <div className="flex gap-8 mt-4 border-b border-gray-700 -mx-4 px-4">
          {[
            { key: 'all', label: 'All', Icon: FileText },
            { key: 'in-progress', label: 'In Progress', Icon: Zap },
            { key: 'pending-review', label: 'Pending Review', Icon: Award },
            { key: 'completed', label: 'Completed', Icon: CheckCircle2 }
          ].map(filter => {
            const Icon = filter.Icon;
            return (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`pb-4 px-2 font-medium transition-colors relative flex items-center gap-2 ${
                  activeFilter === filter.key
                    ? 'text-blue-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {filter.label}
                <span className="text-sm ml-2 text-gray-500">
                  ({getTaskCount(filter.key)})
                </span>
                {activeFilter === filter.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-400"></div>
                )}
              </button>
            );
          })}
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
              {activeFilter === 'all' && (
                <FileText className="w-24 h-24 text-gray-600" />
              )}
              {activeFilter === 'in-progress' && (
                <Zap className="w-24 h-24 text-gray-600" />
              )}
              {activeFilter === 'pending-review' && (
                <Award className="w-24 h-24 text-gray-600" />
              )}
              {activeFilter === 'completed' && (
                <CheckCircle2 className="w-24 h-24 text-gray-600" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              {activeFilter === 'all' && 'No tasks yet'}
              {activeFilter === 'in-progress' && 'No tasks in progress'}
              {activeFilter === 'pending-review' && 'No tasks pending review'}
              {activeFilter === 'completed' && 'No completed tasks'}
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              {activeFilter === 'all' && (selectedMentee 
                ? "No tasks assigned to this mentee yet. Create one to get started!" 
                : "No tasks created yet. Start by creating a task for your mentees.")}
              {activeFilter === 'in-progress' && "No tasks are currently in progress. Start one to see it here!"}
              {activeFilter === 'pending-review' && "No tasks are waiting for review. Complete a task to submit it for review!"}
              {activeFilter === 'completed' && "No tasks have been completed yet. Keep working to complete your tasks!"}
            </p>
            {activeFilter === 'all' && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={onCreateTask} className="inline-flex items-center justify-center px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Task
                </button>
                <button className="inline-flex items-center justify-center px-6 py-2.5 border border-gray-600 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors font-medium">
                  View Guidelines
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isExpanded = expandedTaskId === (task._id || task.id);
            return (
              <div
                key={task._id || task.id}
                className={`border-l-4 ${priorityBorder[task.priority]} transition-colors ${
                  isExpanded ? 'bg-gray-900' : 'hover:bg-gray-900'
                }`}
              >
                <div className="p-4">
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
                          {task.menteeName || task.mentee || 'Student'}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Target className="w-4 h-4" />
                          {task.category}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : task.deadline}
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
                      <button 
                        onClick={() => onCreateTask()}
                        className="p-1 rounded hover:bg-blue-700 transition-colors text-blue-400 hover:text-blue-300"
                        title="Create another task for this user"
                      >
                        <Plus className="w-5 h-5" />
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
                    <button 
                      onClick={() => setExpandedTaskId(isExpanded ? null : (task._id || task.id))}
                      className="px-3 py-1.5 border border-gray-600 text-gray-300 text-xs bg-transparent rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                      View Details
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="border-t border-gray-700 bg-gray-950 p-4 space-y-4">
                    {/* Description */}
                    {task.description && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Description</h4>
                        <p className="text-sm text-gray-400">{task.description}</p>
                      </div>
                    )}

                    {/* Instructions */}
                    {task.instructions && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Instructions</h4>
                        <p className="text-sm text-gray-400">{task.instructions}</p>
                      </div>
                    )}

                    {/* Resources */}
                    {task.resources && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Resources</h4>
                        <p className="text-sm text-gray-400">{task.resources}</p>
                      </div>
                    )}

                    {/* Uploaded Files */}
                    {task.uploadedFiles && task.uploadedFiles.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-3">Submitted Files ({task.uploadedFiles.length})</h4>
                        <div className="space-y-2">
                          {task.uploadedFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <File className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm text-white truncate">{file.name || file}</p>
                                  {file.uploadedAt && (
                                    <p className="text-xs text-gray-500">{file.uploadedAt}</p>
                                  )}
                                </div>
                              </div>
                              <button className="p-1.5 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded transition-colors flex-shrink-0">
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No Files Message */}
                    {(!task.uploadedFiles || task.uploadedFiles.length === 0) && (
                      <div className="text-center py-4">
                        <File className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No files submitted yet</p>
                      </div>
                    )}

                    {/* Review Button - Only show for pending-review tasks with submitted files */}
                    {task.status === 'pending-review' && task.uploadedFiles && task.uploadedFiles.length > 0 && (
                      <div className="border-t border-gray-700 pt-4 mt-4">
                        <button
                          onClick={() => handleReviewTask(task._id || task.id)}
                          disabled={updatingTaskId === (task._id || task.id)}
                          className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          {updatingTaskId === (task._id || task.id) ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Marking as Reviewed...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Mark as Reviewed
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
