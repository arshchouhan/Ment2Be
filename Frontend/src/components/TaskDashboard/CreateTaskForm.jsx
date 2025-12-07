import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, FileText, Link2, Tag, User, AlertCircle, Upload, CheckCircle2, BookOpen, Code, FolderKanban, SearchIcon, FileCheck, PenTool, FileQuestion } from "lucide-react";
import { toast } from "react-toastify";
import { createTask } from "../../services/createTaskApi";

const categories = [
  { value: "coding", label: "Coding Assignment", icon: Code },
  { value: "reading", label: "Reading Material", icon: BookOpen },
  { value: "project", label: "Project Work", icon: FolderKanban },
  { value: "research", label: "Research Task", icon: SearchIcon },
  { value: "review", label: "Code Review", icon: FileCheck },
  { value: "practice", label: "Practice Exercise", icon: PenTool },
  { value: "documentation", label: "Documentation", icon: FileText },
  { value: "other", label: "Other", icon: FileQuestion },
];

export function CreateTaskForm() {
  const navigate = useNavigate();
  const [mentees, setMentees] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    menteeId: "",
    priority: "",
    category: "",
    dueDate: "",
    estimatedTime: "",
    resources: "",
    instructions: "",
    notifyMentee: true,
    requireSubmission: false,
  });

  useEffect(() => {
    fetchMentees();
  }, []);

  const fetchMentees = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:4000/api/bookings/mentor", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success && data.bookings) {
        const menteesMap = new Map();

        data.bookings.forEach((booking) => {
          if (!booking.student) return;

          const studentId = booking.student._id;
          if (!menteesMap.has(studentId)) {
            menteesMap.set(studentId, {
              id: studentId,
              name: booking.student.name,
              email: booking.student.email,
              profilePicture: booking.student.profilePicture,
            });
          }
        });

        setMentees(Array.from(menteesMap.values()));
      }
    } catch (err) {
      console.error("Error fetching mentees:", err);
      toast.error("Failed to load mentees");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.menteeId || !formData.dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Format the data for backend
      const taskData = {
        title: formData.title,
        description: formData.description,
        instructions: formData.instructions,
        category: formData.category,
        priority: formData.priority,
        dueDate: new Date(formData.dueDate).toISOString(),
        estimatedTime: formData.estimatedTime,
        resources: formData.resources,
        notifyMentee: formData.notifyMentee,
        requireSubmission: formData.requireSubmission,
        menteeId: formData.menteeId,
      };

      // Use centralized API service (automatically switches between Java and Node.js)
      const data = await createTask(taskData);

      if (data.success) {
        toast.success("Task created successfully!");
        navigate("/mentor/tasks");
      } else {
        toast.error(data.message || "Failed to create task");
      }
    } catch (err) {
      console.error("Error creating task:", err);
      toast.error("Error creating task: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedMentee = mentees.find((m) => m.id === formData.menteeId);

  return (
    <div className="min-h-screen bg-[#202327]">
      {/* Main Content */}
      <main className="mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Main Form */}
          <div className="space-y-6 lg:col-span-2">
            {/* Basic Information */}
            <div className="bg-[#121212] rounded-lg shadow-sm border border-gray-700 p-6">
              <div className="mb-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-1">
                  <FileText className="w-5 h-5 text-gray-400" />
                  Basic Information
                </h3>
                <p className="text-sm text-gray-400">Enter the main details for this task</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Task Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Build a REST API with Node.js"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Provide a detailed description of what the mentee needs to accomplish..."
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
                    required
                  />
                  <p className="text-xs text-gray-400">
                    Be specific about requirements, expected outcomes, and any constraints.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Special Instructions</label>
                  <textarea
                    placeholder="Any additional instructions, tips, or guidance for the mentee..."
                    rows={3}
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Task Category */}
            <div className="bg-[#121212] rounded-lg shadow-sm border border-gray-700 p-6">
              <div className="mb-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-1">
                  <Tag className="w-5 h-5 text-gray-400" />
                  Task Category
                </h3>
                <p className="text-sm text-gray-400">Select the type of task you are assigning</p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isSelected = formData.category === category.value;
                  return (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: category.value })}
                      className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
                        isSelected
                          ? "border-gray-400 bg-gray-800 text-white"
                          : "border-gray-600 bg-gray-900 text-gray-400 hover:border-gray-500 hover:bg-gray-800"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-xs font-medium text-center">{category.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resources */}
            <div className="bg-[#121212] rounded-lg shadow-sm border border-gray-700 p-6">
              <div className="mb-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-1">
                  <Link2 className="w-5 h-5 text-gray-400" />
                  Resources & Attachments
                </h3>
                <p className="text-sm text-gray-400">Add helpful links or upload files for the mentee</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Resource Links</label>
                  <textarea
                    placeholder="Add helpful links, documentation, or tutorials (one per line)&#10;e.g., https://docs.example.com/guide"
                    rows={4}
                    value={formData.resources}
                    onChange={(e) => setFormData({ ...formData, resources: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Attachments</label>
                  <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-600 bg-gray-900 p-8 transition-colors hover:border-gray-500 hover:bg-gray-800">
                    <div className="text-center">
                      <Upload className="mx-auto w-8 h-8 text-gray-500" />
                      <p className="mt-2 text-sm font-medium text-gray-300">Drop files here or click to upload</p>
                      <p className="mt-1 text-xs text-gray-400">PDF, DOC, images up to 10MB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Assign Mentee */}
            <div className="bg-[#121212] rounded-lg shadow-sm border border-gray-700 p-6">
              <div className="mb-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <User className="w-5 h-5 text-gray-400" />
                  Assign To
                </h3>
              </div>

              <div className="space-y-4">
                <select
                  value={formData.menteeId}
                  onChange={(e) => setFormData({ ...formData, menteeId: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a mentee</option>
                  {mentees.map((mentee) => (
                    <option key={mentee.id} value={mentee.id}>
                      {mentee.name}
                    </option>
                  ))}
                </select>

                {selectedMentee && (
                  <div className="flex items-center gap-3 rounded-lg bg-gray-800 p-3">
                    <img
                      src={selectedMentee.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMentee.name)}&background=4a5568&color=fff`}
                      alt={selectedMentee.name}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMentee.name)}&background=4a5568&color=fff`;
                      }}
                    />
                    <div>
                      <p className="font-medium text-white">{selectedMentee.name}</p>
                      <p className="text-xs text-gray-400">{selectedMentee.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Priority & Timeline */}
            <div className="bg-[#121212] rounded-lg shadow-sm border border-gray-700 p-6">
              <div className="mb-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                  Priority & Timeline
                </h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Priority Level</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="">Select priority</option>
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Estimated Time
                  </label>
                  <select
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="">Select duration</option>
                    <option value="30min">30 minutes</option>
                    <option value="1hr">1 hour</option>
                    <option value="2hr">2 hours</option>
                    <option value="4hr">4 hours</option>
                    <option value="1day">1 day</option>
                    <option value="2-3days">2-3 days</option>
                    <option value="1week">1 week</option>
                    <option value="2weeks">2+ weeks</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="bg-[#121212] rounded-lg shadow-sm border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Options</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="notify"
                    checked={formData.notifyMentee}
                    onChange={(e) => setFormData({ ...formData, notifyMentee: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-gray-400 focus:ring-2 focus:ring-gray-500"
                  />
                  <div className="space-y-1">
                    <label htmlFor="notify" className="block text-sm font-medium text-gray-300 cursor-pointer">
                      Notify mentee
                    </label>
                    <p className="text-xs text-gray-400">Send an email notification when task is created</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="submission"
                    checked={formData.requireSubmission}
                    onChange={(e) => setFormData({ ...formData, requireSubmission: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-gray-400 focus:ring-2 focus:ring-gray-500"
                  />
                  <div className="space-y-1">
                    <label htmlFor="submission" className="block text-sm font-medium text-gray-300 cursor-pointer">
                      Require submission
                    </label>
                    <p className="text-xs text-gray-400">Mentee must submit work for review to complete</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={() => navigate("/mentor/tasks")}
                className="flex-1 px-6 py-2.5 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.title || !formData.menteeId}
                className="flex-1 px-6 py-2.5 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Create Task
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
