const Task = require('../models/Task');
const Board = require('../models/Board');
const User = require('../models/User');

class TaskService {
  constructor(taskModel = Task, boardModel = Board, userModel = User) {
    this.Task = taskModel;
    this.Board = boardModel;
    this.User = userModel;
  }

  async getTasksByBoardId(boardId) {
    try {
      // Verify board exists
      const board = await this.Board.findById(boardId);
      if (!board) {
        return { success: false, error: 'Board not found', statusCode: 404 };
      }

      const tasks = await this.Task.find({ boardId })
        .sort({ position: 1 })
        .populate(this.getPopulateOptions());
      
      return { success: true, data: tasks };
    } catch (error) {
      return { success: false, error: 'Failed to fetch tasks' };
    }
  }

  async getTaskById(id) {
    try {
      const task = await this.Task.findById(id).populate(this.getPopulateOptions());
      if (!task) {
        return { success: false, error: 'Task not found', statusCode: 404 };
      }
      return { success: true, data: task };
    } catch (error) {
      return { success: false, error: 'Failed to fetch task' };
    }
  }

  async createTask(taskData) {
    try {
      const { title, description, status, priority, boardId, assignee, dueDate, estimatedHours, actualHours } = taskData;
      
      // Validate required fields
      if (!title || !boardId) {
        return {
          success: false,
          error: 'Title and boardId are required',
          statusCode: 400
        };
      }

      // Verify board exists
      const board = await this.Board.findById(boardId);
      if (!board) {
        return { success: false, error: 'Board not found', statusCode: 404 };
      }

      // Validate assignee if provided
      if (assignee) {
        const assigneeExists = await this.User.exists({ _id: assignee });
        if (!assigneeExists) {
          return { success: false, error: 'Assignee not found', statusCode: 404 };
        }
      }

      // Get the highest position for tasks in this status
      const highestPositionTask = await this.Task.findOne({ boardId, status })
        .sort({ position: -1 })
        .select('position');
      
      const position = highestPositionTask ? highestPositionTask.position + 1 : 0;
      console.log('taskData:', taskData, 'calculated position:', position);
      const task = new this.Task({
        title,
        description: description || '',
        status: status || 'Backlog',
        priority: priority || 'Medium',
        boardId,
        assignee: assignee || null,
        dueDate: dueDate || null,
        estimatedHours: estimatedHours || 0,
        actualHours: actualHours || 0,
        position
      });

      // Add creation activity log
      task.activityLog.push({
        type: 'created',
        message: `Task created${assignee ? ' with an assignee' : ''}`,
        actor: taskData.actor || null,
        metadata: {
          newAssignee: assignee || null
        }
      });

      const savedTask = await task.save();
      const populatedTask = await this.Task.findById(savedTask._id).populate(this.getPopulateOptions());
      
      return { success: true, data: populatedTask, statusCode: 201 };
    } catch (error) {
      return { success: false, error: 'Failed to create task' };
    }
  }

  async updateTask(id, taskData) {
    try {
      const task = await this.Task.findById(id);
      if (!task) {
        return { success: false, error: 'Task not found', statusCode: 404 };
      }

      // Track changes for activity log
      const changes = this.trackChanges(task, taskData);

      // Update task fields
      Object.keys(taskData).forEach(key => {
        if (taskData[key] !== undefined && key !== '_id' && key !== 'boardId') {
          task[key] = taskData[key];
        }
      });

      // Add to activity log if there are changes
      if (changes.length > 0) {
        task.activityLog.push({
          action: 'task_updated',
          actor: taskData.actor || null,
          timestamp: new Date(),
          metadata: { changes }
        });
      }

      const updatedTask = await task.save();
      const populatedTask = await this.Task.findById(updatedTask._id).populate(this.getPopulateOptions());
      
      return { success: true, data: populatedTask };
    } catch (error) {
      return { success: false, error: 'Failed to update task' };
    }
  }

  async deleteTask(id) {
    try {
      const task = await this.Task.findById(id);
      if (!task) {
        return { success: false, error: 'Task not found', statusCode: 404 };
      }

      await this.Task.findByIdAndDelete(id);
      return { success: true, data: { message: 'Task deleted successfully' } };
    } catch (error) {
      return { success: false, error: 'Failed to delete task' };
    }
  }

  async reorderTasks(reorderData) {
    try {
      const { boardId, sourceStatus, destinationStatus, sourceIndex, destinationIndex, taskId } = reorderData;

      // Get all tasks for the source status
      const sourceTasks = await this.Task.find({ boardId, status: sourceStatus })
        .sort({ position: 1 });

      if (sourceIndex < 0 || sourceIndex >= sourceTasks.length) {
        return { success: false, error: 'Invalid source index', statusCode: 400 };
      }

      const movedTask = sourceTasks[sourceIndex];

      // If moving within the same column
      if (sourceStatus === destinationStatus) {
        // Remove from source position
        sourceTasks.splice(sourceIndex, 1);
        // Insert at destination position
        sourceTasks.splice(destinationIndex, 0, movedTask);

        // Update positions
        await this.updateTaskPositions(sourceTasks);
      } else {
        // Moving to a different column
        const destinationTasks = await this.Task.find({ boardId, status: destinationStatus })
          .sort({ position: 1 });

        // Remove from source
        sourceTasks.splice(sourceIndex, 1);
        
        // Insert into destination
        destinationTasks.splice(destinationIndex, 0, movedTask);
        
        // Update task status
        movedTask.status = destinationStatus;

        // Update positions for both columns
        await this.updateTaskPositions(sourceTasks);
        await this.updateTaskPositions(destinationTasks);
        
        // Save the moved task with new status
        await movedTask.save();
      }

      // Return updated tasks for both columns
      const updatedSourceTasks = await this.Task.find({ boardId, status: sourceStatus })
        .sort({ position: 1 })
        .populate(this.getPopulateOptions());
      
      const updatedDestinationTasks = await this.Task.find({ boardId, status: destinationStatus })
        .sort({ position: 1 })
        .populate(this.getPopulateOptions());

      return { 
        success: true, 
        data: { 
          sourceTasks: updatedSourceTasks,
          destinationTasks: updatedDestinationTasks
        } 
      };
    } catch (error) {
      return { success: false, error: 'Failed to reorder tasks' };
    }
  }

  async addComment(taskId, commentData) {
    try {
      const { body, author } = commentData;
      
      if (!body || !author) {
        return { success: false, error: 'Body and author are required', statusCode: 400 };
      }

      const task = await this.Task.findById(taskId);
      if (!task) {
        return { success: false, error: 'Task not found', statusCode: 404 };
      }

      task.comments.push({
        body,
        author,
        createdAt: new Date()
      });

      const updatedTask = await task.save();
      const populatedTask = await this.Task.findById(updatedTask._id).populate(this.getPopulateOptions());
      
      return { success: true, data: populatedTask };
    } catch (error) {
      return { success: false, error: 'Failed to add comment' };
    }
  }

  async deleteComment(taskId, commentId) {
    try {
      const task = await this.Task.findById(taskId);
      if (!task) {
        return { success: false, error: 'Task not found', statusCode: 404 };
      }

      const commentIndex = task.comments.findIndex(comment => comment._id.toString() === commentId);
      if (commentIndex === -1) {
        return { success: false, error: 'Comment not found', statusCode: 404 };
      }

      task.comments.splice(commentIndex, 1);
      const updatedTask = await task.save();
      const populatedTask = await this.Task.findById(updatedTask._id).populate(this.getPopulateOptions());
      
      return { success: true, data: populatedTask };
    } catch (error) {
      return { success: false, error: 'Failed to delete comment' };
    }
  }

  // Helper methods
  getPopulateOptions() {
    return [
      { path: 'assignee', select: '_id name email' },
      { path: 'comments.author', select: '_id name email' },
      { path: 'activityLog.actor', select: '_id name email' },
      { path: 'activityLog.metadata.previousAssignee', select: '_id name email' },
      { path: 'activityLog.metadata.newAssignee', select: '_id name email' }
    ];
  }

  trackChanges(originalTask, newData) {
    const changes = [];
    
    const fieldsToTrack = ['title', 'description', 'status', 'priority', 'assignee', 'dueDate', 'estimatedHours', 'actualHours'];
    
    fieldsToTrack.forEach(field => {
      if (newData[field] !== undefined && originalTask[field] !== newData[field]) {
        changes.push({
          field,
          oldValue: originalTask[field],
          newValue: newData[field]
        });
      }
    });
    
    return changes;
  }

  async updateTaskPositions(tasks) {
    const updatePromises = tasks.map((task, index) => {
      task.position = index;
      return task.save();
    });
    
    await Promise.all(updatePromises);
  }
}

module.exports = TaskService;