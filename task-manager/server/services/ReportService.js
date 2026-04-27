const Task = require('../models/Task');
const Worklog = require('../models/Worklog');
const User = require('../models/User');

class ReportService {
  /**
   * Generate time report with task details and total hours
   * @param {Object} filters - Optional filters for taskName, assignee, status, priority, dueDateStatus
   * @returns {Promise<Object>} Report data with rows and grand total
   */
  static async generateTimeReport(filters = {}) {
    try {
      // Build match stage for filters
      const matchStage = {};
      
      if (filters.taskName) {
        matchStage.title = { $regex: filters.taskName, $options: 'i' };
      }
      
      if (filters.assignee) {
        matchStage.assignee = filters.assignee;
      }
      
      if (filters.status) {
        matchStage.status = filters.status;
      }
      
      if (filters.priority) {
        matchStage.priority = filters.priority;
      }
      
      // Handle due date status filters
      if (filters.dueDateStatus === 'overdue') {
        matchStage.dueDate = { $lt: new Date() };
        matchStage.status = { $ne: 'Done' };
      } else if (filters.dueDateStatus === 'upcoming') {
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        matchStage.dueDate = { $gte: today, $lte: nextWeek };
      } else if (filters.dueDateStatus === 'no-due-date') {
        matchStage.dueDate = { $eq: null };
      }

      // Build aggregation pipeline
      const pipeline = [];
      
      if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
      }
      
      pipeline.push(
        {
          $lookup: {
            from: 'worklogs',
            localField: '_id',
            foreignField: 'taskId',
            as: 'worklogs'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'assignee',
            foreignField: '_id',
            as: 'assigneeInfo'
          }
        },
        {
          $addFields: {
            totalHours: {
              $sum: '$worklogs.hours'
            },
            assigneeName: {
              $arrayElemAt: ['$assigneeInfo.name', 0]
            },
            // Calculate if task is overdue
            isOverdue: {
              $and: [
                { $ne: ['$dueDate', null] },
                { $lt: ['$dueDate', new Date()] },
                { $ne: ['$status', 'Done'] }
              ]
            }
          }
        },
        {
          $project: {
            _id: 1,
            title: 1,
            status: 1,
            assignee: '$assigneeName',
            estimatedHours: 1,
            actualHours: 1,
            totalHours: 1,
            boardId: 1,
            dueDate: 1,
            priority: 1,
            isOverdue: 1
          }
        },
        {
          $sort: { totalHours: -1 }
        }
      );

      const reportData = await Task.aggregate(pipeline);

      // Calculate grand total and overdue statistics
      const grandTotalHours = reportData.reduce((sum, task) => sum + task.totalHours, 0);
      const overdueTasks = reportData.filter(task => task.isOverdue).length;
      const tasksWithDueDate = reportData.filter(task => task.dueDate).length;

      return {
        rows: reportData,
        grandTotalHours,
        totalTasks: reportData.length,
        overdueTasks,
        tasksWithDueDate,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Error generating time report:', error);
      throw new Error('Failed to generate time report');
    }
  }

  /**
   * Get worklog summary for a specific task
   * @param {string} taskId - Task ID
   * @returns {Promise<Object>} Task worklog summary
   */
  static async getTaskWorklogSummary(taskId) {
    try {
      const worklogs = await Worklog.find({ taskId })
        .populate('userId', 'name email')
        .sort({ date: -1 });

      const totalHours = worklogs.reduce((sum, log) => sum + log.hours, 0);

      return {
        taskId,
        worklogs,
        totalHours,
        count: worklogs.length
      };
    } catch (error) {
      console.error('Error getting task worklog summary:', error);
      throw new Error('Failed to get task worklog summary');
    }
  }

  /**
   * Get user worklog summary
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User worklog summary
   */
  static async getUserWorklogSummary(userId) {
    try {
      const worklogs = await Worklog.find({ userId })
        .populate('taskId', 'title status')
        .sort({ date: -1 });

      const totalHours = worklogs.reduce((sum, log) => sum + log.hours, 0);

      // Group by task
      const byTask = worklogs.reduce((acc, log) => {
        const taskId = log.taskId._id.toString();
        if (!acc[taskId]) {
          acc[taskId] = {
            task: log.taskId,
            hours: 0,
            logs: []
          };
        }
        acc[taskId].hours += log.hours;
        acc[taskId].logs.push(log);
        return acc;
      }, {});

      return {
        userId,
        worklogs,
        totalHours,
        byTask: Object.values(byTask),
        count: worklogs.length
      };
    } catch (error) {
      console.error('Error getting user worklog summary:', error);
      throw new Error('Failed to get user worklog summary');
    }
  }

  /**
   * Get report for a specific date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Object>} Date range report
   */
  static async getDateRangeReport(startDate, endDate) {
    try {
      const worklogs = await Worklog.find({
        date: {
          $gte: startDate,
          $lte: endDate
        }
      })
        .populate('taskId', 'title status')
        .populate('userId', 'name email')
        .sort({ date: -1 });

      // Aggregate by task
      const taskMap = new Map();
      let grandTotalHours = 0;

      worklogs.forEach(log => {
        const taskId = log.taskId._id.toString();
        if (!taskMap.has(taskId)) {
          taskMap.set(taskId, {
            task: log.taskId,
            totalHours: 0,
            worklogs: []
          });
        }
        const taskData = taskMap.get(taskId);
        taskData.totalHours += log.hours;
        taskData.worklogs.push(log);
        grandTotalHours += log.hours;
      });

      const rows = Array.from(taskMap.values()).map(data => ({
        title: data.task.title,
        status: data.task.status,
        assignee: 'Multiple', // Since multiple users can log time
        totalHours: data.totalHours
      }));

      return {
        rows,
        grandTotalHours,
        startDate,
        endDate,
        totalWorklogs: worklogs.length
      };
    } catch (error) {
      console.error('Error generating date range report:', error);
      throw new Error('Failed to generate date range report');
    }
  }
}

module.exports = ReportService;