import Task from '../models/task.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';

// Create a new task
export const createTask = async (req, res) => {
  try {
    const { title, description, menteeId, category, priority, dueDate, instructions, estimatedTime, resources, notifyMentee, requireSubmission, attachments } = req.body;
    // JWT token uses 'id' field, not '_id'
    const mentorId = req.user.id || req.user._id;

    // Validate required fields
    if (!title || !menteeId) {
      return res.status(400).json({
        success: false,
        message: 'Title and menteeId are required'
      });
    }

    // Fetch mentee name from User collection
    let menteeName = 'Student';
    let mentorName = 'Mentor';
    
    try {
      const mentee = await User.findById(menteeId);
      if (mentee && mentee.name) {
        menteeName = mentee.name;
      }
    } catch (err) {
      console.error('Error fetching mentee name:', err);
    }
    
    try {
      const mentor = await User.findById(mentorId);
      if (mentor && mentor.name) {
        mentorName = mentor.name;
      }
    } catch (err) {
      console.error('Error fetching mentor name:', err);
    }

    const newTask = new Task({
      title,
      description,
      instructions,
      mentorId,
      menteeId,
      menteeName, // Set the mentee's real name
      mentorName, // Set the mentor's real name
      category: category || 'Technical Skills', // Default if empty
      priority: priority || 'medium', // Default if empty
      dueDate,
      estimatedTime,
      resources,
      notifyMentee,
      requireSubmission,
      attachments,
      status: 'not-started' // Default status - Not Started
    });

    await newTask.save();

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: newTask
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating task: ' + error.message
    });
  }
};

// Get all tasks for a mentor
export const getTasksByMentor = async (req, res) => {
  try {
    // JWT token uses 'id' field, not '_id'
    const mentorIdString = req.user.id || req.user._id;
    
    // Convert string to MongoDB ObjectId
    const mentorId = new mongoose.Types.ObjectId(mentorIdString);
    
    console.log('[Task Controller] Searching for mentorId (ObjectId):', mentorId);

    // Get tasks for this mentor and populate mentor info
    let tasks = await Task.find({ mentorId })
      .populate('mentorId', 'name profilePicture')
      .sort({ createdAt: -1 });

    // Fetch mentee and mentor names for all tasks (including existing ones without names)
    for (let task of tasks) {
      let needsSave = false;
      
      // Fetch mentee name if missing
      if (task.menteeId) {
        try {
          const mentee = await User.findById(task.menteeId);
          if (mentee && mentee.name) {
            // Update menteeName if it's missing or default
            if (!task.menteeName || task.menteeName === 'Student') {
              task.menteeName = mentee.name;
              needsSave = true;
            }
          }
        } catch (err) {
          console.error('Error fetching mentee name for task:', err);
        }
      }
      
      // Fetch mentor name if missing
      if (task.mentorId && typeof task.mentorId === 'object' && task.mentorId.name) {
        if (!task.mentorName || task.mentorName === 'Mentor') {
          task.mentorName = task.mentorId.name;
          needsSave = true;
        }
      }
      
      if (needsSave) {
        await task.save();
      }
    }
    
    // Map mentor info to mentorName for frontend
    tasks = tasks.map(task => {
      const taskObj = task.toObject ? task.toObject() : task;
      if (taskObj.mentorId && taskObj.mentorId.name) {
        taskObj.mentorName = taskObj.mentorId.name;
      }
      return taskObj;
    });

    console.log('[Task Controller] Found tasks for this mentor:', tasks.length);

    res.status(200).json({
      success: true,
      tasks,
      total: tasks.length
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks: ' + error.message
    });
  }
};

// Get tasks by mentee
export const getTasksByMentee = async (req, res) => {
  try {
    const { menteeId } = req.params;

    console.log('[Task Controller] Fetching tasks for menteeId:', menteeId);

    // First, get ALL tasks to see what's in the database
    const allTasks = await Task.find({});
    console.log('[Task Controller] Total tasks in database:', allTasks.length);
    allTasks.forEach(task => {
      console.log('[Task Controller] Task menteeId:', task.menteeId, 'Type:', typeof task.menteeId, 'Task:', task.title);
    });

    // Search for tasks with menteeId as either String or ObjectId
    const tasks = await Task.find({
      $or: [
        { menteeId: menteeId }, // String comparison
        { menteeId: new mongoose.Types.ObjectId(menteeId) } // ObjectId comparison
      ]
    })
      .populate('mentorId', 'name profilePicture')
      .sort({ createdAt: -1 });

    console.log('[Task Controller] Found tasks for mentee:', tasks.length);

    res.status(200).json({
      success: true,
      tasks,
      total: tasks.length
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks: ' + error.message
    });
  }
};

// Get task by ID
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .populate('mentorId', 'name profilePicture')
      .populate('menteeId', 'name profilePicture');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task: ' + error.message
    });
  }
};

// Update task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, priority, status, dueDate, progress, instructions, estimatedTime, resources, notifyMentee, requireSubmission } = req.body;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Update fields
    if (title) task.title = title;
    if (description) task.description = description;
    if (category) task.category = category;
    if (priority) task.priority = priority;
    if (status) task.status = status;
    if (dueDate) task.dueDate = dueDate;
    if (progress !== undefined) task.progress = progress;
    if (instructions) task.instructions = instructions;
    if (estimatedTime) task.estimatedTime = estimatedTime;
    if (resources) task.resources = resources;
    if (notifyMentee !== undefined) task.notifyMentee = notifyMentee;
    if (requireSubmission !== undefined) task.requireSubmission = requireSubmission;

    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task: ' + error.message
    });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting task: ' + error.message
    });
  }
};

// Get tasks by status
export const getTasksByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const mentorIdString = req.user.id || req.user._id;
    const mentorId = new mongoose.Types.ObjectId(mentorIdString);

    const tasks = await Task.find({ mentorId, status })
      .populate('menteeId', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      tasks,
      total: tasks.length
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks: ' + error.message
    });
  }
};

// Get tasks by mentor and mentee
export const getTasksByMentorAndMentee = async (req, res) => {
  try {
    const { menteeId } = req.params;
    const mentorIdString = req.user.id || req.user._id;
    const mentorId = new mongoose.Types.ObjectId(mentorIdString);

    const tasks = await Task.find({ mentorId, menteeId })
      .populate('menteeId', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      tasks,
      total: tasks.length
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks: ' + error.message
    });
  }
};

// Submit task proof (files)
export const submitTaskProof = async (req, res) => {
  try {
    // Handle both FormData and JSON body
    let taskId = req.body?.taskId;
    
    // If taskId not in body, check FormData fields
    if (!taskId && req.body) {
      taskId = Object.keys(req.body).find(key => key === 'taskId') ? req.body.taskId : null;
    }

    const userId = req.user.id || req.user._id;

    console.log('Submit proof request:', { taskId, userId, body: req.body, files: req.files });

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: 'Task ID is required'
      });
    }

    // Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Verify user is the mentee of this task
    const menteeIdStr = task.menteeId.toString();
    const userIdStr = userId.toString();
    
    console.log('Verifying mentee:', { menteeId: menteeIdStr, userId: userIdStr });

    if (menteeIdStr !== userIdStr) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to submit proof for this task'
      });
    }

    // Initialize uploadedFiles array if it doesn't exist
    if (!task.uploadedFiles) {
      task.uploadedFiles = [];
    }

    // Add file information from request
    const files = req.body.files || [];
    
    if (files && files.length > 0) {
      files.forEach(file => {
        task.uploadedFiles.push({
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date(),
          url: file.url || null
        });
      });
    } else {
      // If no files in request, just mark as submitted
      task.uploadedFiles.push({
        name: 'Proof Submitted',
        uploadedAt: new Date().toISOString()
      });
    }

    // Save the task
    await task.save();

    console.log('Proof submitted successfully for task:', taskId);

    res.status(200).json({
      success: true,
      message: 'Proof submitted successfully',
      task: task
    });
  } catch (error) {
    console.error('Error submitting proof:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting proof: ' + error.message
    });
  }
};
