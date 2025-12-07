import express from 'express';
import { 
  createTask, 
  getTasksByMentor, 
  getTasksByMentee,
  getTaskById,
  updateTask,
  deleteTask,
  getTasksByStatus,
  getTasksByMentorAndMentee,
  submitTaskProof
} from '../controllers/task.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create a new task (requires authentication)
router.post('/', authenticateToken, createTask);

// Get all tasks for authenticated mentor
router.get('/', authenticateToken, getTasksByMentor);

// Get tasks by status for authenticated mentor
router.get('/status/:status', authenticateToken, getTasksByStatus);

// Get tasks for specific mentee by mentor
router.get('/mentor-mentee/:menteeId', authenticateToken, getTasksByMentorAndMentee);

// Get tasks by mentee (student) - for student dashboard
router.get('/mentee/:menteeId', getTasksByMentee);

// Submit task proof (files) - MUST come before /:id route
router.post('/submit-proof', authenticateToken, submitTaskProof);

// Get task by ID
router.get('/:id', getTaskById);

// Update task
router.put('/:id', authenticateToken, updateTask);

// Delete task
router.delete('/:id', authenticateToken, deleteTask);

// DEBUG: Delete all tasks (for testing only)
router.delete('/debug/delete-all', async (req, res) => {
  try {
    const result = await Task.deleteMany({});
    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} tasks`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting tasks: ' + error.message
    });
  }
});

// DEBUG: Update all tasks status to 'not-started' (for testing only)
router.put('/debug/update-status', async (req, res) => {
  try {
    const result = await Task.updateMany({}, { status: 'not-started' });
    res.status(200).json({
      success: true,
      message: `Updated ${result.modifiedCount} tasks to 'not-started'`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating tasks: ' + error.message
    });
  }
});

export default router;
