import React, { useState, useMemo } from 'react';
import { Calendar, User, FileText, ChevronRight, Plus, Star, X, Upload, File, Trash2, CheckCircle2 } from 'lucide-react';
import { updateTaskStatus } from '../../services/updateTaskApi';
import { toast } from 'react-toastify';

// Add animations
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes expandCard {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-in-out;
  }
  
  .animate-expandCard {
    animation: expandCard 0.3s ease-out;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

const statusConfig = {
  'not-started': { label: 'Not started', className: 'bg-gray-600 text-gray-100' },
  'in-progress': { label: 'In Progress', className: 'bg-blue-500 text-white' },
  'pending-review': { label: 'Pending Review', className: 'bg-yellow-600 text-white' },
  'completed': { label: 'Completed', className: 'bg-emerald-500 text-white' },
};

const priorityConfig = {
  'low': { label: 'Low Priority', className: 'text-emerald-600' },
  'medium': { label: 'Medium Priority', className: 'text-amber-600' },
  'high': { label: 'High Priority', className: 'text-orange-600' },
  'urgent': { label: 'Urgent Priority', className: 'text-red-600' },
};

export function TaskCard({ task, onTaskUpdate }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState(task.uploadedFiles || []);
  const [isUploading, setIsUploading] = useState(false);
  const status = statusConfig[task.status] || statusConfig['not-started'];
  const priority = priorityConfig[task.priority] || priorityConfig['medium'];

  // Calculate progress based on status
  const calculatedProgress = useMemo(() => {
    switch (task.status) {
      case 'not-started':
        return 0;
      case 'in-progress':
        return 50;
      case 'pending-review':
        return 75; // Waiting for mentor review
      case 'completed':
        return 100; // Only 100% when mentor completes it
      default:
        return 0;
    }
  }, [task.status]);

  // Define status progression - Students can only go up to pending-review
  const statusProgression = {
    'not-started': 'in-progress',
    'in-progress': 'pending-review',
    'pending-review': 'pending-review', // Students cannot go beyond this
    'completed': 'completed' // Students cannot change completed tasks
  };

  const canChangeStatus = () => {
    // Students can only change status if it's not completed
    return task.status !== 'completed';
  };

  const handleStatusChange = async () => {
    try {
      if (!canChangeStatus()) {
        toast.info('This task has been completed by the mentor');
        return;
      }

      setIsUpdating(true);
      const nextStatus = statusProgression[task.status] || 'in-progress';
      
      // Check if trying to move beyond pending-review
      if (task.status === 'pending-review' && nextStatus === 'pending-review') {
        toast.info('Task is pending mentor review. Waiting for mentor approval to complete.');
        setIsUpdating(false);
        return;
      }
      
      console.log(`Changing status from ${task.status} to ${nextStatus}`);
      
      const result = await updateTaskStatus(task._id || task.id, nextStatus);
      
      if (result.success) {
        toast.success(`Task status changed to ${statusConfig[nextStatus].label}`);
        // Call parent callback to refresh tasks
        if (onTaskUpdate) {
          onTaskUpdate(result.task);
        }
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      // Create file objects with metadata
      const newFiles = files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toLocaleString(),
        id: Math.random().toString(36).substr(2, 9)
      }));

      setUploadedFiles([...uploadedFiles, ...newFiles]);
      toast.success(`${files.length} file(s) uploaded successfully`);
      
      // Reset file input
      e.target.value = '';
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (fileId) => {
    setUploadedFiles(uploadedFiles.filter(f => f.id !== fileId));
    toast.info('File removed');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };


  if (isExpanded) {
    return (
      <div className="bg-[#121212] rounded-lg border border-gray-800 w-full animate-expandCard">
        {/* Close Button */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Task Details</h2>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Expanded Content */}
        <div className="p-6 space-y-6">
          {/* Title and Points */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="text-2xl font-bold text-white">{task.title}</h3>
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="h-5 w-5 fill-amber-500" />
                <span className="text-lg font-medium">{task.points || 0}</span>
              </div>
            </div>
            {task.description && (
              <p className="text-gray-300 text-base">{task.description}</p>
            )}
          </div>

          {/* Status and Priority */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleStatusChange}
              disabled={isUpdating || !canChangeStatus()}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${status.className} ${
                canChangeStatus() 
                  ? 'hover:opacity-80 transition-opacity cursor-pointer' 
                  : 'opacity-60 cursor-not-allowed'
              } disabled:opacity-50`}
              title={canChangeStatus() ? 'Click to change status' : 'Task completed - cannot change'}
            >
              {status.label}
            </button>
            <span className={`px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 ${priority.className}`}>
              {priority.label}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Category</p>
              <p className="text-white font-medium capitalize">{task.category || 'General'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Due Date</p>
              <p className="text-white font-medium">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</p>
            </div>
            {task.estimatedTime && (
              <div>
                <p className="text-sm text-gray-400 mb-1">Estimated Time</p>
                <p className="text-white font-medium">{task.estimatedTime}</p>
              </div>
            )}
            {task.mentorName && (
              <div>
                <p className="text-sm text-gray-400 mb-1">Mentor</p>
                <p className="text-white font-medium">{task.mentorName}</p>
              </div>
            )}
          </div>

          {/* Instructions */}
          {task.instructions && (
            <div>
              <p className="text-sm text-gray-400 mb-2">Instructions</p>
              <p className="text-white bg-gray-900 p-4 rounded-lg">{task.instructions}</p>
            </div>
          )}

          {/* Resources */}
          {task.resources && (
            <div>
              <p className="text-sm text-gray-400 mb-2">Resources</p>
              <p className="text-white bg-gray-900 p-4 rounded-lg">{task.resources}</p>
            </div>
          )}

          {/* File Upload Section */}
          <div className="border-t border-gray-700 pt-6">
            <p className="text-sm text-gray-400 mb-4">Upload Proof / Files</p>
            
            {task.status === 'completed' ? (
              // Completed Task - Show message
              <div className="flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed border-emerald-700/50 rounded-lg bg-emerald-900/20">
                <div className="flex flex-col items-center gap-3">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  <div className="text-center">
                    <p className="text-sm text-emerald-400 font-medium">Task Completed</p>
                    <p className="text-xs text-gray-400 mt-1">This task has been completed and approved</p>
                  </div>
                </div>
              </div>
            ) : (
              // Active Task - Show upload area
              <>
                <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-700 rounded-lg hover:border-gray-600 cursor-pointer transition-colors bg-gray-900/50">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-6 w-6 text-gray-400" />
                    <span className="text-sm text-gray-400">Click to upload or drag and drop</span>
                    <span className="text-xs text-gray-500">PDF, Images, Documents (Max 10MB each)</span>
                  </div>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip"
                  />
                </label>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-400 mb-3">Uploaded Files ({uploadedFiles.length})</p>
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-800">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <File className="h-4 w-4 text-blue-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-white truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)} • {file.uploadedAt}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(file.id)}
                          className="p-2 hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
                          title="Remove file"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-700">
            <button
              onClick={() => setIsExpanded(false)}
              className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Close
            </button>
            <button
              disabled={uploadedFiles.length === 0 || isUpdating}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              Submit Proof
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => setIsExpanded(true)}
      className={`bg-[#121212] rounded-lg border border-gray-800 transition-all hover:border-gray-700 hover:shadow-lg cursor-pointer overflow-hidden ${task.status === 'completed' ? 'opacity-80' : ''}`}
    >
      {/* Card Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-gray-800">
            <FileText className="h-4 w-4 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-white ${task.status === 'completed' ? 'line-through' : ''}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-gray-400 line-clamp-2 mt-1">{task.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-4 w-4 fill-amber-500" />
            <span className="text-sm font-medium">{task.points || 0}</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="px-4 pt-0 pb-4">
        {/* Status and Priority Badges */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange();
            }}
            disabled={isUpdating || !canChangeStatus()}
            className={`px-3 py-1 rounded text-sm font-medium ${status.className} ${
              canChangeStatus() 
                ? 'hover:opacity-80 transition-opacity cursor-pointer' 
                : 'opacity-60 cursor-not-allowed'
            } disabled:opacity-50`}
            title={canChangeStatus() ? 'Click to change status' : 'Task completed - cannot change'}
          >
            {status.label}
          </button>
          <span className={`text-sm font-medium ${priority.className}`}>
            {priority.label}
          </span>
        </div>

        {/* Category and Due Date */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-4">
            <span className="capitalize">{task.category || 'General'}</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>

        {/* Mentor Info */}
        {task.mentorName && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-700">
            <div className="h-6 w-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-300">
              {(task.mentorName || 'M').charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-gray-400">{task.mentorName}</span>
          </div>
        )}
      </div>
    </div>
  );
}
