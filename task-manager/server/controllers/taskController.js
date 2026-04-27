const Task = require('../models/Task');
const Board = require('../models/Board');
const User = require('../models/User');
const Worklog = require('../models/Worklog');
const TaskService = require('../services/TaskService');

const taskPopulateOptions = [
  { path: 'assignee', select: '_id name email' },
  { path: 'comments.author', select: '_id name email' },
  { path: 'activityLog.actor', select: '_id name email' },
  { path: 'activityLog.metadata.previousAssignee', select: '_id name email' },
  { path: 'activityLog.metadata.newAssignee', select: '_id name email' }
];

const getUserLabel = (user) => {
  if (!user) {
    return 'Unassigned';
  }

  return user.name || user.email || 'Unknown user';
};

// Get all tasks for a board
exports.getTasks = async (req, res) => {
  try {
    const { boardId } = req.query;
    
    if (!boardId) {
      return res.status(400).json({ error: 'boardId query parameter is required' });
    }

    // Verify board exists
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const tasks = await Task.find({ boardId })
      .sort({ position: 1 })
      .populate(taskPopulateOptions);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const taskService = new TaskService();
    
    // Prepare task data including dueDate
    const taskData = {
      ...req.body,
      actor: req.user?._id || null
    };
    
    // Call service to create task
    const result = await taskService.createTask(taskData);
    
    if (!result.success) {
      return res.status(result.statusCode || 400).json({ error: result.error });
    }
    
    // Auto-create worklog if actualHours is provided
    if (req.body.actualHours && req.body.actualHours > 0) {
      try {
        const worklog = new Worklog({
          taskId: result.data._id,
          userId: req.user?._id,
          hours: parseFloat(req.body.actualHours),
          description: `Auto-logged from task creation`,
          date: new Date()
        });
        await worklog.save();
      } catch (err) {
        console.error('Error creating worklog:', err);
      }
    }
    
    res.status(201).json(result.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, position, assignee, estimatedHours, actualHours, dueDate } = req.body;
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // If status is changing, we need to adjust positions
    if (status && status !== task.status) {
      // Remove from old status positions
      await Task.updateMany(
        { 
          boardId: task.boardId, 
          status: task.status, 
          position: { $gt: task.position } 
        },
        { $inc: { position: -1 } }
      );

      // Add to new status at the end
      const lastTask = await Task.findOne({ 
        boardId: task.boardId, 
        status 
      }).sort({ position: -1 });
      
      const newPosition = lastTask ? lastTask.position + 1 : 0;
      
      task.status = status;
      task.position = newPosition;
    }

    // If position is changing within same status
    if (position !== undefined && position !== task.position && (!status || status === task.status)) {
      const oldPosition = task.position;
      const newPosition = position;
      
      if (newPosition > oldPosition) {
        // Moving down - decrement positions between old and new
        await Task.updateMany(
          { 
            boardId: task.boardId, 
            status: task.status,
            position: { $gt: oldPosition, $lte: newPosition }
          },
          { $inc: { position: -1 } }
        );
      } else {
        // Moving up - increment positions between new and old
        await Task.updateMany(
          { 
            boardId: task.boardId, 
            status: task.status,
            position: { $gte: newPosition, $lt: oldPosition }
          },
          { $inc: { position: 1 } }
        );
      }
      
      task.position = newPosition;
    }

    // Update other fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
    if (actualHours !== undefined) task.actualHours = actualHours;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (assignee !== undefined) {
      if (assignee === null || assignee === '') {
        const previousAssigneeId = task.assignee ? task.assignee.toString() : null;
        if (previousAssigneeId) {
          const previousAssigneeUser = await User.findById(previousAssigneeId).select('name email');
          task.activityLog.push({
            type: 'assignee_changed',
            message: `Assignee changed from ${getUserLabel(previousAssigneeUser)} to Unassigned`,
            actor: req.user?._id || null,
            metadata: {
              previousAssignee: previousAssigneeId,
              newAssignee: null
            }
          });
        }
        task.assignee = null;
      } else {
        const assigneeExists = await User.exists({ _id: assignee });
        if (!assigneeExists) {
          return res.status(400).json({ error: 'Invalid assignee' });
        }
        const previousAssigneeId = task.assignee ? task.assignee.toString() : null;
        if (previousAssigneeId !== assignee.toString()) {
          const previousAssigneeUser = previousAssigneeId ? await User.findById(previousAssigneeId).select('name email') : null;
          const newAssigneeUser = await User.findById(assignee).select('name email');
          task.activityLog.push({
            type: 'assignee_changed',
            message: `Assignee changed from ${getUserLabel(previousAssigneeUser)} to ${getUserLabel(newAssigneeUser)}`,
            actor: req.user?._id || null,
            metadata: {
              previousAssignee: previousAssigneeId,
              newAssignee: assignee
            }
          });
          task.assignee = assignee;
        }
      }
    }

    const updatedTask = await task.save();
    
    // Auto-create/update worklog when actualHours changes
    if (actualHours !== undefined && actualHours > 0) {
      try {
        // Check if a worklog already exists for this task from auto-logging
        const existingWorklog = await Worklog.findOne({
          taskId: task._id,
          description: { $regex: 'Auto-logged' }
        });
        
        if (existingWorklog) {
          // Update existing worklog
          existingWorklog.hours = parseFloat(actualHours);
          existingWorklog.date = new Date();
          await existingWorklog.save();
        } else {
          // Create new worklog
          const worklog = new Worklog({
            taskId: task._id,
            userId: req.user?._id,
            hours: parseFloat(actualHours),
            description: `Auto-logged from task update`,
            date: new Date()
          });
          await worklog.save();
        }
      } catch (err) {
        console.error('Error managing worklog:', err);
      }
    }
    
    await updatedTask.populate(taskPopulateOptions);
    return res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
};

// Add comment to a task
exports.addComment = async (req, res) => {
  try {
    const { body } = req.body;
    if (!body || !body.trim()) {
      return res.status(400).json({ error: 'Comment body is required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.comments.push({
      body: body.trim(),
      author: req.user._id
    });
    task.activityLog.push({
      type: 'comment_added',
      message: 'Comment added',
      actor: req.user._id,
      metadata: {
        commentBody: body.trim()
      }
    });

    const updatedTask = await task.save();
    await updatedTask.populate(taskPopulateOptions);
    return res.status(201).json(updatedTask);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Delete comment from a task
exports.deleteComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const comment = task.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    task.activityLog.push({
      type: 'comment_deleted',
      message: 'Comment deleted',
      actor: req.user._id,
      metadata: {
        commentBody: comment.body
      }
    });
    task.comments.pull({ _id: req.params.commentId });
    const updatedTask = await task.save();
    await updatedTask.populate(taskPopulateOptions);
    return res.json(updatedTask);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete comment' });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Remove the task and adjust positions of remaining tasks in the same status
    await Task.updateMany(
      { 
        boardId: task.boardId, 
        status: task.status, 
        position: { $gt: task.position } 
      },
      { $inc: { position: -1 } }
    );

    await Task.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

// Reorder tasks (drag and drop)
exports.reorderTasks = async (req, res) => {
  try {
    const { taskId, sourceStatus, destinationStatus, sourceIndex, destinationIndex, boardId } = req.body;
    
    if (!boardId) {
      return res.status(400).json({ error: 'boardId is required' });
    }

    // Get all tasks for the board
    const tasks = await Task.find({ boardId }).sort({ position: 1 });

    // Resolve moved task from DB first; this avoids stale client source status/index mismatches.
    let movedTask = null;
    if (taskId) {
      movedTask = tasks.find(task => task._id.toString() === taskId);
      if (!movedTask) {
        return res.status(404).json({ error: 'Task not found for reorder' });
      }
    }

    // Source status comes from moved task when available, otherwise fallback to payload.
    const effectiveSourceStatus = movedTask ? movedTask.status : sourceStatus;
    if (!effectiveSourceStatus || !destinationStatus) {
      return res.status(400).json({ error: 'sourceStatus and destinationStatus are required' });
    }

    // Filter tasks by effective source status.
    const sourceTasks = tasks.filter(task => task.status === effectiveSourceStatus);

    // Resolve source index robustly.
    const parsedSourceIndex = Number.parseInt(sourceIndex, 10);
    let resolvedSourceIndex = Number.isNaN(parsedSourceIndex) ? -1 : parsedSourceIndex;
    if (movedTask) {
      resolvedSourceIndex = sourceTasks.findIndex(task => task._id.toString() === movedTask._id.toString());
    }

    if (resolvedSourceIndex < 0 || resolvedSourceIndex >= sourceTasks.length) {
      return res.status(400).json({ error: 'Invalid source index' });
    }

    movedTask = sourceTasks[resolvedSourceIndex];
    const parsedDestinationIndex = Number.parseInt(destinationIndex, 10);
    const safeDestinationIndex = !Number.isNaN(parsedDestinationIndex) && parsedDestinationIndex >= 0
      ? parsedDestinationIndex
      : 0;
    
    // If moving within same column
    if (effectiveSourceStatus === destinationStatus) {
      if (resolvedSourceIndex === safeDestinationIndex) {
        return res.json({ message: 'No change needed' });
      }

      // Update positions within same status
      const updatePromises = [];
      
      if (safeDestinationIndex > resolvedSourceIndex) {
        // Moving down
        for (let i = resolvedSourceIndex + 1; i <= safeDestinationIndex && i < sourceTasks.length; i++) {
          updatePromises.push(
            Task.findByIdAndUpdate(sourceTasks[i]._id, { position: i - 1 })
          );
        }
      } else {
        // Moving up
        for (let i = safeDestinationIndex; i < resolvedSourceIndex; i++) {
          updatePromises.push(
            Task.findByIdAndUpdate(sourceTasks[i]._id, { position: i + 1 })
          );
        }
      }
      
      updatePromises.push(
        Task.findByIdAndUpdate(movedTask._id, { 
          position: Math.min(safeDestinationIndex, sourceTasks.length - 1)
        })
      );
      
      await Promise.all(updatePromises);
    } else {
      // Moving to different column
      const destTasks = tasks.filter(task => task.status === destinationStatus);
      const clampedDestIndex = Math.min(safeDestinationIndex, destTasks.length);
      
      // Adjust source column positions
      for (let i = resolvedSourceIndex + 1; i < sourceTasks.length; i++) {
        await Task.findByIdAndUpdate(sourceTasks[i]._id, { position: i - 1 });
      }
      
      // Adjust destination column positions
      for (let i = clampedDestIndex; i < destTasks.length; i++) {
        await Task.findByIdAndUpdate(destTasks[i]._id, { position: i + 1 });
      }
      
      // Update moved task
      await Task.findByIdAndUpdate(movedTask._id, {
        status: destinationStatus,
        position: clampedDestIndex
      });
    }
    
    res.json({ message: 'Tasks reordered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder tasks' });
  }
};
