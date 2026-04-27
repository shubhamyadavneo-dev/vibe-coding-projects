const taskController = require('../../controllers/taskController');
const Task = require('../../models/Task');
const Board = require('../../models/Board');
const User = require('../../models/User');
const Worklog = require('../../models/Worklog');

// Mock the models
jest.mock('../../models/Task');
jest.mock('../../models/Board');
jest.mock('../../models/User');
jest.mock('../../models/Worklog');

describe('Task Controller', () => {
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

  describe('getTasks', () => {
    it('should return tasks for a board', async () => {
      const mockBoard = { _id: 'board123', name: 'Test Board' };
      const mockTasks = [
        { _id: 'task1', title: 'Task 1', boardId: 'board123', position: 0 },
        { _id: 'task2', title: 'Task 2', boardId: 'board123', position: 1 }
      ];

      mockReq.query.boardId = 'board123';
      Board.findById.mockResolvedValue(mockBoard);
      Task.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockTasks)
        })
      });

      await taskController.getTasks(mockReq, mockRes);

      expect(Board.findById).toHaveBeenCalledWith('board123');
      expect(Task.find).toHaveBeenCalledWith({ boardId: 'board123' });
      expect(mockRes.json).toHaveBeenCalledWith(mockTasks);
    });

    it('should return 400 when boardId is missing', async () => {
      mockReq.query.boardId = null;

      await taskController.getTasks(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'boardId query parameter is required' });
    });

    it('should return 404 when board not found', async () => {
      mockReq.query.boardId = 'board123';
      Board.findById.mockResolvedValue(null);

      await taskController.getTasks(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Board not found' });
    });

    it('should handle errors', async () => {
      mockReq.query.boardId = 'board123';
      Board.findById.mockRejectedValue(new Error('Database error'));

      await taskController.getTasks(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to fetch tasks' });
    });
  });

  describe('createTask', () => {
    it('should create a new task with default status Backlog', async () => {
      const mockBoard = { _id: 'board123' };
      const mockTask = {
        _id: 'task123',
        title: 'New Task',
        description: 'Task description',
        status: 'Backlog',
        priority: 'medium',
        boardId: 'board123',
        position: 0,
        save: jest.fn().mockResolvedValue({
          _id: 'task123',
          title: 'New Task',
          status: 'Backlog'
        })
      };

      mockReq.body = {
        title: 'New Task',
        description: 'Task description',
        boardId: 'board123'
      };

      Board.findById.mockResolvedValue(mockBoard);
      Task.findOne.mockResolvedValue(null); // No last task
      Task.mockImplementation(() => mockTask);

      await taskController.createTask(mockReq, mockRes);

      expect(Board.findById).toHaveBeenCalledWith('board123');
      expect(Task.findOne).toHaveBeenCalledWith({ boardId: 'board123', status: 'Backlog' });
      expect(Task).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'Task description',
        status: 'Backlog',
        priority: 'medium',
        assignee: null,
        boardId: 'board123',
        position: 0,
        estimatedHours: 0,
        actualHours: 0
      });
      expect(mockTask.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should validate title and boardId are required', async () => {
      mockReq.body = { description: 'No title' };

      await taskController.createTask(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Title and boardId are required' });
    });

    it('should validate assignee exists', async () => {
      mockReq.body = {
        title: 'New Task',
        boardId: 'board123',
        assignee: 'invalid-user'
      };

      Board.findById.mockResolvedValue({ _id: 'board123' });
      User.exists.mockResolvedValue(false);

      await taskController.createTask(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid assignee' });
    });

    it('should handle board not found', async () => {
      mockReq.body = {
        title: 'New Task',
        boardId: 'board123'
      };

      Board.findById.mockResolvedValue(null);

      await taskController.createTask(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Board not found' });
    });
  });

  describe('updateTask', () => {
    it('should update a task', async () => {
      const mockTask = {
        _id: 'task123',
        title: 'Old Title',
        status: 'Backlog',
        assignee: null,
        actualHours: 0,
        activityLog: [],
        save: jest.fn().mockResolvedValue({
          _id: 'task123',
          title: 'Updated Title',
          status: 'Development',
          populate: jest.fn().mockResolvedValue({
            _id: 'task123',
            title: 'Updated Title'
          })
        })
      };

      mockReq.params.id = 'task123';
      mockReq.body = {
        title: 'Updated Title',
        status: 'Development'
      };

      Task.findById.mockResolvedValue(mockTask);

      await taskController.updateTask(mockReq, mockRes);

      expect(Task.findById).toHaveBeenCalledWith('task123');
      expect(mockTask.title).toBe('Updated Title');
      expect(mockTask.status).toBe('Development');
      expect(mockTask.save).toHaveBeenCalled();
    });

    it('should handle task not found', async () => {
      mockReq.params.id = 'task123';
      Task.findById.mockResolvedValue(null);

      await taskController.updateTask(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Task not found' });
    });

    it('should validate assignee exists', async () => {
      const mockTask = {
        _id: 'task123',
        title: 'Task',
        assignee: null,
        save: jest.fn()
      };

      mockReq.params.id = 'task123';
      mockReq.body = { assignee: 'invalid-user' };

      Task.findById.mockResolvedValue(mockTask);
      User.exists.mockResolvedValue(false);

      await taskController.updateTask(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid assignee' });
    });
  });

  describe('reorderTasks (drag-and-drop)', () => {
    it('should reorder tasks within same column', async () => {
      const mockTasks = [
        { _id: 'task1', status: 'Backlog', position: 0 },
        { _id: 'task2', status: 'Backlog', position: 1 },
        { _id: 'task3', status: 'Backlog', position: 2 }
      ];

      mockReq.body = {
        boardId: 'board123',
        taskId: 'task1',
        sourceStatus: 'Backlog',
        destinationStatus: 'Backlog',
        sourceIndex: 0,
        destinationIndex: 2
      };

      Task.find.mockResolvedValue(mockTasks);
      Task.findByIdAndUpdate.mockResolvedValue({});

      await taskController.reorderTasks(mockReq, mockRes);

      expect(Task.find).toHaveBeenCalledWith({ boardId: 'board123' });
      expect(Task.findByIdAndUpdate).toHaveBeenCalledTimes(3); // task2, task3, task1
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Tasks reordered successfully' });
    });

    it('should move task between columns', async () => {
      const mockTasks = [
        { _id: 'task1', status: 'Backlog', position: 0 },
        { _id: 'task2', status: 'Backlog', position: 1 },
        { _id: 'task3', status: 'Development', position: 0 }
      ];

      mockReq.body = {
        boardId: 'board123',
        taskId: 'task1',
        sourceStatus: 'Backlog',
        destinationStatus: 'Development',
        sourceIndex: 0,
        destinationIndex: 1
      };

      Task.find.mockResolvedValue(mockTasks);
      Task.findByIdAndUpdate.mockResolvedValue({});

      await taskController.reorderTasks(mockReq, mockRes);

      expect(Task.findByIdAndUpdate).toHaveBeenCalledWith('task1', {
        status: 'Development',
        position: 1
      });
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Tasks reordered successfully' });
    });

    it('should return 400 when boardId is missing', async () => {
      mockReq.body = {
        sourceStatus: 'Backlog',
        destinationStatus: 'Development'
      };

      await taskController.reorderTasks(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'boardId is required' });
    });

    it('should return 400 when statuses are missing', async () => {
      mockReq.body = {
        boardId: 'board123',
        taskId: 'task1'
      };

      Task.find.mockResolvedValue([{ _id: 'task1', status: 'Backlog', position: 0 }]);

      await taskController.reorderTasks(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'sourceStatus and destinationStatus are required' });
    });

    it('should return 404 when task not found', async () => {
      mockReq.body = {
        boardId: 'board123',
        taskId: 'task999',
        sourceStatus: 'Backlog',
        destinationStatus: 'Development'
      };

      Task.find.mockResolvedValue([]);

      await taskController.reorderTasks(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Task not found for reorder' });
    });

    it('should return 400 for invalid source index', async () => {
      const mockTasks = [{ _id: 'task1', status: 'Backlog', position: 0 }];

      mockReq.body = {
        boardId: 'board123',
        taskId: 'task1',
        sourceStatus: 'Backlog',
        destinationStatus: 'Backlog',
        sourceIndex: 5, // Invalid index
        destinationIndex: 0
      };

      Task.find.mockResolvedValue(mockTasks);

      await taskController.reorderTasks(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid source index' });
    });

    it('should handle errors', async () => {
      mockReq.body = {
        boardId: 'board123',
        taskId: 'task1',
        sourceStatus: 'Backlog',
        destinationStatus: 'Development'
      };

      Task.find.mockRejectedValue(new Error('Database error'));

      await taskController.reorderTasks(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to reorder tasks' });
    });
  });

  describe('addComment', () => {
    it('should add a comment to a task', async () => {
      const mockTask = {
        _id: 'task123',
        comments: [],
        activityLog: [],
        save: jest.fn().mockResolvedValue({
          _id: 'task123',
          populate: jest.fn().mockResolvedValue({
            _id: 'task123',
            comments: [{ body: 'Test comment', author: 'user123' }]
          })
        })
      };

      mockReq.params.id = 'task123';
      mockReq.body = { body: 'Test comment' };
      mockReq.user = { _id: 'user123' };

      Task.findById.mockResolvedValue(mockTask);

      await taskController.addComment(mockReq, mockRes);

      expect(Task.findById).toHaveBeenCalledWith('task123');
      expect(mockTask.comments).toHaveLength(1);
      expect(mockTask.comments[0].body).toBe('Test comment');
      expect(mockTask.comments[0].author).toBe('user123');
      expect(mockTask.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should validate comment body', async () => {
      mockReq.params.id = 'task123';
      mockReq.body = { body: '' };

      await taskController.addComment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Comment body is required' });
    });

    it('should handle task not found', async () => {
      mockReq.params.id = 'task123';
      mockReq.body = { body: 'Test comment' };

      Task.findById.mockResolvedValue(null);

      await taskController.addComment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Task not found' });
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      const mockTask = {
        _id: 'task123',
        deleteOne: jest.fn().mockResolvedValue({})
      };

      mockReq.params.id = 'task123';
      Task.findById.mockResolvedValue(mockTask);

      await taskController.deleteTask(mockReq, mockRes);

      expect(Task.findById).toHaveBeenCalledWith('task123');
      expect(mockTask.deleteOne).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Task deleted successfully' });
    });

    it('should handle task not found', async () => {
      mockReq.params.id = 'task123';
      Task.findById.mockResolvedValue(null);

      await taskController.deleteTask(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Task not found' });
    });

    it('should handle errors', async () => {
      mockReq.params.id = 'task123';
      Task.findById.mockRejectedValue(new Error('Database error'));

      await taskController.deleteTask(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to delete task' });
    });
  });
});