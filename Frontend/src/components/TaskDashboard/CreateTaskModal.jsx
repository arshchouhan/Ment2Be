import React, { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import { API_BASE_URL } from "../../config/backendConfig";

const categories = ["Technical Skills", "Soft Skills", "Career Development", "Content Creation"];
const priorities = ["high", "medium", "low"];

export function CreateTaskModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    menteeId: "",
    category: "",
    priority: "",
    dueDate: "",
  });
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchMentees();
    }
  }, [isOpen]);

  const fetchMentees = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/bookings/mentor`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok && data.success && data.bookings) {
        // Extract unique mentees from bookings
        const menteesMap = new Map();
        data.bookings.forEach(booking => {
          if (booking.student && !menteesMap.has(booking.student._id)) {
            menteesMap.set(booking.student._id, {
              id: booking.student._id,
              name: booking.student.name
            });
          }
        });
        setMentees(Array.from(menteesMap.values()));
      }
    } catch (err) {
      console.error('Error fetching mentees:', err);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }

    try {
      // Convert date string to ISO format
      const dueDate = formData.dueDate ? new Date(formData.dueDate).toISOString() : null;

      const taskData = {
        title: formData.title,
        description: formData.description,
        menteeId: formData.menteeId,
        category: formData.category,
        priority: formData.priority,
        dueDate: dueDate,
        status: "not-started", // Set default status to not-started
        instructions: "",
        estimatedTime: "",
        resources: "",
        notifyMentee: true,
        requireSubmission: false,
        attachments: []
      };

      const response = await fetch(TASK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("Task created successfully:", data.task);
        // Reset form and close
        setFormData({
          title: "",
          description: "",
          menteeId: "",
          category: "",
          priority: "",
          dueDate: "",
        });
        onClose();
        // Trigger a refresh of tasks in parent component
        window.location.reload(); // Simple refresh - you can optimize this later
      } else {
        setError(data.message || "Failed to create task");
      }
    } catch (err) {
      console.error('Error creating task:', err);
      setError("Error creating task: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#121212] rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Create New Task</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Task Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title"
              className="w-full px-4 py-2.5 border border-gray-600 bg-gray-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-shadow placeholder-gray-400"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter task description"
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-600 bg-gray-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-shadow resize-none placeholder-gray-400"
            />
          </div>

          {/* Assign To */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Assign to</label>
            <select
              value={formData.menteeId}
              onChange={(e) => setFormData({ ...formData, menteeId: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-600 bg-gray-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-shadow appearance-none cursor-pointer"
              required
            >
              <option value="">Select mentee</option>
              {mentees.map((mentee) => (
                <option key={mentee.id} value={mentee.id}>
                  {mentee.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-600 bg-gray-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-shadow appearance-none cursor-pointer"
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-600 bg-gray-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-shadow appearance-none cursor-pointer"
                required
              >
                <option value="">Select priority</option>
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Deadline</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-600 bg-gray-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-shadow"
              required
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700 bg-gray-900 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-600 text-gray-300 bg-transparent rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              'Create Task'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
