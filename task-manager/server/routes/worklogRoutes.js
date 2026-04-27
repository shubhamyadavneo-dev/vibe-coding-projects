const express = require('express');
const router = express.Router();
const worklogController = require('../controllers/worklogController');
const { requireAuth } = require('../middleware/authMiddleware');

// All worklog routes require authentication
router.use(requireAuth);

// POST /api/worklogs - Create a new worklog entry
router.post('/', worklogController.createWorklog);

// GET /api/worklogs/task/:taskId - Get worklogs for a specific task
router.get('/task/:taskId', worklogController.getWorklogsByTask);

// GET /api/worklogs/user - Get worklogs for the current user
router.get('/user', worklogController.getWorklogsByUser);

// DELETE /api/worklogs/:id - Delete a worklog entry
router.delete('/:id', worklogController.deleteWorklog);

module.exports = router;