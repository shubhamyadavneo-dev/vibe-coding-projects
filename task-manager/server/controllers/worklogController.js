const Worklog = require('../models/Worklog');
const Task = require('../models/Task');

/**
 * Create a new worklog entry
 * @route POST /api/worklogs
 * @access Private
 */
const createWorklog = async (req, res) => {
  try {
    const { taskId, hours, description, date } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!taskId || !hours) {
      return res.status(400).json({ error: 'Task ID and hours are required' });
    }

    // Validate task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Create worklog
    const worklog = new Worklog({
      taskId,
      userId,
      hours: parseFloat(hours),
      description: description || '',
      date: date ? new Date(date) : new Date()
    });

    await worklog.save();

    // Populate user info for response
    await worklog.populate('userId', 'name email');

    res.status(201).json(worklog);
  } catch (error) {
    console.error('Error in createWorklog:', error);
    res.status(500).json({ error: error.message || 'Failed to create worklog' });
  }
};

/**
 * Get worklogs for a specific task
 * @route GET /api/worklogs/task/:taskId
 * @access Private
 */
const getWorklogsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Validate task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const worklogs = await Worklog.find({ taskId })
      .populate('userId', 'name email')
      .sort({ date: -1, createdAt: -1 });

    res.json(worklogs);
  } catch (error) {
    console.error('Error in getWorklogsByTask:', error);
    res.status(500).json({ error: error.message || 'Failed to get worklogs' });
  }
};

/**
 * Get worklogs for the current user
 * @route GET /api/worklogs/user
 * @access Private
 */
const getWorklogsByUser = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const worklogs = await Worklog.find({ userId })
      .populate('taskId', 'title status')
      .sort({ date: -1, createdAt: -1 });

    res.json(worklogs);
  } catch (error) {
    console.error('Error in getWorklogsByUser:', error);
    res.status(500).json({ error: error.message || 'Failed to get worklogs' });
  }
};

/**
 * Delete a worklog entry
 * @route DELETE /api/worklogs/:id
 * @access Private
 */
const deleteWorklog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find worklog
    const worklog = await Worklog.findById(id);
    if (!worklog) {
      return res.status(404).json({ error: 'Worklog not found' });
    }

    // Check ownership
    if (worklog.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this worklog' });
    }

    await worklog.deleteOne();
    res.json({ message: 'Worklog deleted successfully' });
  } catch (error) {
    console.error('Error in deleteWorklog:', error);
    res.status(500).json({ error: error.message || 'Failed to delete worklog' });
  }
};

module.exports = {
  createWorklog,
  getWorklogsByTask,
  getWorklogsByUser,
  deleteWorklog
};