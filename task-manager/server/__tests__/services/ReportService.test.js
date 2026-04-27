const ReportService = require('../../services/ReportService');
const Task = require('../../models/Task');
const Worklog = require('../../models/Worklog');

// Mock the models
jest.mock('../../models/Task');
jest.mock('../../models/Worklog');

describe('ReportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTaskCompletionReport', () => {
    it('should return task completion report', async () => {
      const mockTasks = [
        { _id: '1', title: 'Task 1', status: 'Done', assignee: 'User1' },
        { _id: '2', title: 'Task 2', status: 'In Progress', assignee: 'User2' },
        { _id: '3', title: 'Task 3', status: 'Backlog', assignee: 'User3' },
      ];

      Task.find.mockResolvedValue(mockTasks);

      const result = await ReportService.getTaskCompletionReport();

      expect(Task.find).toHaveBeenCalled();
      expect(result).toHaveProperty('totalTasks', 3);
      expect(result).toHaveProperty('tasksByStatus');
      expect(result.tasksByStatus).toHaveProperty('Done', 1);
      expect(result.tasksByStatus).toHaveProperty('In Progress', 1);
      expect(result.tasksByStatus).toHaveProperty('Backlog', 1);
    });

    it('should handle empty task list', async () => {
      Task.find.mockResolvedValue([]);

      const result = await ReportService.getTaskCompletionReport();

      expect(Task.find).toHaveBeenCalled();
      expect(result).toHaveProperty('totalTasks', 0);
      expect(result.tasksByStatus).toEqual({});
    });

    it('should handle errors', async () => {
      Task.find.mockRejectedValue(new Error('Database error'));

      await expect(ReportService.getTaskCompletionReport()).rejects.toThrow('Database error');
    });
  });

  describe('getWorklogReport', () => {
    it('should return worklog report', async () => {
      const mockWorklogs = [
        { _id: '1', hours: 5, date: new Date('2024-01-01'), taskId: 'Task1', userId: 'User1' },
        { _id: '2', hours: 3, date: new Date('2024-01-02'), taskId: 'Task2', userId: 'User2' },
        { _id: '3', hours: 2, date: new Date('2024-01-01'), taskId: 'Task1', userId: 'User1' },
      ];

      Worklog.find.mockResolvedValue(mockWorklogs);

      const result = await ReportService.getWorklogReport();

      expect(Worklog.find).toHaveBeenCalled();
      expect(result).toHaveProperty('totalHours', 10);
      expect(result).toHaveProperty('worklogsByDate');
      expect(result).toHaveProperty('worklogsByUser');
      expect(result.worklogsByUser).toHaveProperty('User1', 7);
      expect(result.worklogsByUser).toHaveProperty('User2', 3);
    });

    it('should handle empty worklog list', async () => {
      Worklog.find.mockResolvedValue([]);

      const result = await ReportService.getWorklogReport();

      expect(Worklog.find).toHaveBeenCalled();
      expect(result).toHaveProperty('totalHours', 0);
      expect(result.worklogsByDate).toEqual({});
      expect(result.worklogsByUser).toEqual({});
    });

    it('should handle errors', async () => {
      Worklog.find.mockRejectedValue(new Error('Database error'));

      await expect(ReportService.getWorklogReport()).rejects.toThrow('Database error');
    });
  });

  describe('getUserPerformanceReport', () => {
    it('should return user performance report', async () => {
      const mockTasks = [
        { _id: '1', title: 'Task 1', status: 'Done', assignee: 'User1' },
        { _id: '2', title: 'Task 2', status: 'In Progress', assignee: 'User2' },
        { _id: '3', title: 'Task 3', status: 'Done', assignee: 'User1' },
      ];

      const mockWorklogs = [
        { hours: 5, userId: 'User1' },
        { hours: 3, userId: 'User2' },
        { hours: 2, userId: 'User1' },
      ];

      Task.find.mockResolvedValue(mockTasks);
      Worklog.find.mockResolvedValue(mockWorklogs);

      const result = await ReportService.getUserPerformanceReport();

      expect(Task.find).toHaveBeenCalled();
      expect(Worklog.find).toHaveBeenCalled();
      expect(result).toHaveProperty('User1');
      expect(result).toHaveProperty('User2');
      expect(result.User1).toHaveProperty('totalTasks', 2);
      expect(result.User1).toHaveProperty('completedTasks', 2);
      expect(result.User1).toHaveProperty('totalHours', 7);
      expect(result.User2).toHaveProperty('totalTasks', 1);
      expect(result.User2).toHaveProperty('completedTasks', 0);
      expect(result.User2).toHaveProperty('totalHours', 3);
    });

    it('should handle empty data', async () => {
      Task.find.mockResolvedValue([]);
      Worklog.find.mockResolvedValue([]);

      const result = await ReportService.getUserPerformanceReport();

      expect(Task.find).toHaveBeenCalled();
      expect(Worklog.find).toHaveBeenCalled();
      expect(result).toEqual({});
    });

    it('should handle errors', async () => {
      Task.find.mockRejectedValue(new Error('Database error'));

      await expect(ReportService.getUserPerformanceReport()).rejects.toThrow('Database error');
    });
  });
});