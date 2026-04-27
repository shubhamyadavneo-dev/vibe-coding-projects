const worklogController = require('../../controllers/worklogController');
const Worklog = require('../../models/Worklog');
const Task = require('../../models/Task');

// Mock the models
jest.mock('../../models/Worklog');
jest.mock('../../models/Task');

describe('Worklog Controller', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      params: {},
      query: {},
      body: {},
      user: { _id: 'user123', name: 'Test User' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('createWorklog', () => {
    it('should create a new worklog entry', async () => {
      const mockTask = { _id: 'task123', title: 'Test Task' };
      const mockWorklog = {
        _id: 'worklog123',
        taskId: 'task123',
        userId: 'user123',
        hours: 5,
        description: 'Test work',
        date: new Date(),
        save: jest.fn().mockResolvedValue({
          _id: 'worklog123',
          taskId: 'task123',
          userId: 'user123',
          hours: 5,
          populate: jest.fn().mockResolvedValue({
            _id: 'worklog123',
            taskId: 'task123',
            userId: { _id: 'user123', name: 'Test User', email: 'test@example.com' }
          })
        })
      };

      mockReq.body = {
        taskId: 'task123',
        hours: 5,
        description: 'Test work'
      };

      Task.findById.mockResolvedValue(mockTask);
      Worklog.mockImplementation(() => mockWorklog);

      await worklogController.createWorklog(mockReq, mockRes);

      expect(Task.findById).toHaveBeenCalledWith('task123');
      expect(Worklog).toHaveBeenCalledWith({
        taskId: 'task123',
        userId: 'user123',
        hours: 5,
        description: 'Test work',
        date: expect.any(Date)
      });
      expect(mockWorklog.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should validate required fields', async () => {
      mockReq.body = { description: 'No task ID or hours' };

      await worklogController.createWorklog(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Task ID and hours are required' });
    });

    it('should validate task exists', async () => {
      mockReq.body = {
        taskId: 'task123',
        hours: 5
      };

      Task.findById.mockResolvedValue(null);

      await worklogController.createWorklog(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Task not found' });
    });

    it('should handle errors', async () => {
      mockReq.body = {
        taskId: 'task123',
        hours: 5
      };

      Task.findById.mockRejectedValue(new Error('Database error'));

      await worklogController.createWorklog(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('getWorklogsByTask', () => {
    it('should get worklogs for a specific task', async () => {
      const mockTask = { _id: 'task123' };
      const mockWorklogs = [
        { _id: 'worklog1', taskId: 'task123', hours: 3 },
        { _id: 'worklog2', taskId: 'task123', hours: 2 }
      ];

      mockReq.params.taskId = 'task123';
      Task.findById.mockResolvedValue(mockTask);
      Worklog.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockWorklogs)
        })
      });

      await worklogController.getWorklogsByTask(mockReq, mockRes);

      expect(Task.findById).toHaveBeenCalledWith('task123');
      expect(Worklog.find).toHaveBeenCalledWith({ taskId: 'task123' });
      expect(mockRes.json).toHaveBeenCalledWith(mockWorklogs);
    });

    it('should return 404 when task not found', async () => {
      mockReq.params.taskId = 'task123';
      Task.findById.mockResolvedValue(null);

      await worklogController.getWorklogsByTask(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Task not found' });
    });

    it('should handle errors', async () => {
      mockReq.params.taskId = 'task123';
      Task.findById.mockRejectedValue(new Error('Database error'));

      await worklogController.getWorklogsByTask(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('getWorklogsByUser', () => {
    it('should get worklogs for the current user', async () => {
      const mockWorklogs = [
        { _id: 'worklog1', taskId: 'task123', hours: 3, userId: 'user123' },
        { _id: 'worklog2', taskId: 'task456', hours: 2, userId: 'user123' }
      ];

      Worklog.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockWorklogs)
        })
      });

      await worklogController.getWorklogsByUser(mockReq, mockRes);

      expect(Worklog.find).toHaveBeenCalledWith({ userId: 'user123' });
      expect(mockRes.json).toHaveBeenCalledWith(mockWorklogs);
    });

    it('should handle errors', async () => {
      Worklog.find.mockRejectedValue(new Error('Database error'));

      await worklogController.getWorklogsByUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('deleteWorklog', () => {
    it('should delete a worklog when user is owner', async () => {
      const mockWorklog = {
        _id: 'worklog123',
        userId: 'user123',
        deleteOne: jest.fn().mockResolvedValue({})
      };

      mockReq.params.id = 'worklog123';
      Worklog.findById.mockResolvedValue(mockWorklog);

      await worklogController.deleteWorklog(mockReq, mockRes);

      expect(Worklog.findById).toHaveBeenCalledWith('worklog123');
      expect(mockWorklog.deleteOne).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Worklog deleted successfully' });
    });

    it('should return 404 when worklog not found', async () => {
      mockReq.params.id = 'worklog123';
      Worklog.findById.mockResolvedValue(null);

      await worklogController.deleteWorklog(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Worklog not found' });
    });

    it('should return 403 when user is not owner', async () => {
      const mockWorklog = {
        _id: 'worklog123',
        userId: 'otherUser',
        toString: () => 'otherUser'
      };

      mockReq.params.id = 'worklog123';
      Worklog.findById.mockResolvedValue(mockWorklog);

      await worklogController.deleteWorklog(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Not authorized to delete this worklog' });
    });

    it('should handle errors', async () => {
      mockReq.params.id = 'worklog123';
      Worklog.findById.mockRejectedValue(new Error('Database error'));

      await worklogController.deleteWorklog(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  // Test for immutability - ensure no update function exists
  describe('Worklog Immutability', () => {
    it('should not have an updateWorklog function', () => {
      expect(worklogController.updateWorklog).toBeUndefined();
    });

    it('should only have create, read, and delete operations', () => {
      const exportedFunctions = Object.keys(worklogController);
      expect(exportedFunctions).toEqual([
        'createWorklog',
        'getWorklogsByTask',
        'getWorklogsByUser',
        'deleteWorklog'
      ]);
      expect(exportedFunctions).not.toContain('updateWorklog');
    });
  });
});