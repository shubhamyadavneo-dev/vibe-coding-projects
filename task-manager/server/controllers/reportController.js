const ReportService = require('../services/ReportService');

/**
 * Get time report
 * @route GET /api/reports/time
 * @access Private
 */
const getTimeReport = async (req, res) => {
  try {
    const filters = {
      taskName: req.query.taskName || '',
      assignee: req.query.assignee || '',
      status: req.query.status || '',
      priority: req.query.priority || '',
      dueDateStatus: req.query.dueDateStatus || ''
    };
    
    const report = await ReportService.generateTimeReport(filters);
    res.json(report);
  } catch (error) {
    console.error('Error in getTimeReport:', error);
    res.status(500).json({ error: error.message || 'Failed to generate time report' });
  }
};

/**
 * Get task worklog summary
 * @route GET /api/reports/task/:taskId
 * @access Private
 */
const getTaskWorklogSummary = async (req, res) => {
  try {
    const { taskId } = req.params;
    const summary = await ReportService.getTaskWorklogSummary(taskId);
    res.json(summary);
  } catch (error) {
    console.error('Error in getTaskWorklogSummary:', error);
    res.status(500).json({ error: error.message || 'Failed to get task worklog summary' });
  }
};

/**
 * Get user worklog summary
 * @route GET /api/reports/user/:userId
 * @access Private
 */
const getUserWorklogSummary = async (req, res) => {
  try {
    const { userId } = req.params;
    const summary = await ReportService.getUserWorklogSummary(userId);
    res.json(summary);
  } catch (error) {
    console.error('Error in getUserWorklogSummary:', error);
    res.status(500).json({ error: error.message || 'Failed to get user worklog summary' });
  }
};

/**
 * Get date range report
 * @route GET /api/reports/range
 * @access Private
 */
const getDateRangeReport = async (req, res) => {
  try {
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const report = await ReportService.getDateRangeReport(startDate, endDate);
    res.json(report);
  } catch (error) {
    console.error('Error in getDateRangeReport:', error);
    res.status(500).json({ error: error.message || 'Failed to generate date range report' });
  }
};

module.exports = {
  getTimeReport,
  getTaskWorklogSummary,
  getUserWorklogSummary,
  getDateRangeReport
};