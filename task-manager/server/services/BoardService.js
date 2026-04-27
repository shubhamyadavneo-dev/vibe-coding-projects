const Board = require('../models/Board');
const Task = require('../models/Task');

class BoardService {
  constructor(boardModel = Board, taskModel = Task) {
    this.Board = boardModel;
    this.Task = taskModel;
  }

  async getAllBoards() {
    try {
      const boards = await this.Board.find().sort({ createdAt: -1 });
      return { success: true, data: boards };
    } catch (error) {
      return { success: false, error: 'Failed to fetch boards' };
    }
  }

  async getBoardById(id) {
    try {
      const board = await this.Board.findById(id);
      if (!board) {
        return { success: false, error: 'Board not found', statusCode: 404 };
      }

      // Get tasks for this board, sorted by position
      const tasks = await this.Task.find({ boardId: id })
        .sort({ position: 1 })
        .populate([
          { path: 'assignee', select: '_id name email' },
          { path: 'comments.author', select: '_id name email' }
        ]);

      return { 
        success: true, 
        data: { 
          board, 
          tasks 
        } 
      };
    } catch (error) {
      return { success: false, error: 'Failed to fetch board' };
    }
  }

  async createBoard(boardData) {
    try {
      const { name, description, columns } = boardData;
      
      if (!name) {
        return { 
          success: false, 
          error: 'Board name is required', 
          statusCode: 400 
        };
      }

      const board = new this.Board({
        name,
        description: description || '',
        columns: columns || ['Backlog', 'Analysis', 'Ready', 'Development', 'Review', 'Testing', 'Staging', 'Done']
      });

      const savedBoard = await board.save();
      return { success: true, data: savedBoard, statusCode: 201 };
    } catch (error) {
      return { success: false, error: 'Failed to create board' };
    }
  }

  async updateBoard(id, boardData) {
    try {
      const { name, description, columns } = boardData;
      
      const board = await this.Board.findById(id);
      if (!board) {
        return { success: false, error: 'Board not found', statusCode: 404 };
      }

      if (name !== undefined) board.name = name;
      if (description !== undefined) board.description = description;
      if (columns !== undefined) board.columns = columns;

      const updatedBoard = await board.save();
      return { success: true, data: updatedBoard };
    } catch (error) {
      return { success: false, error: 'Failed to update board' };
    }
  }

  async deleteBoard(id) {
    try {
      const board = await this.Board.findById(id);
      if (!board) {
        return { success: false, error: 'Board not found', statusCode: 404 };
      }

      // Delete all tasks associated with this board
      await this.Task.deleteMany({ boardId: id });
      
      // Delete the board
      await this.Board.findByIdAndDelete(id);
      
      return { success: true, data: { message: 'Board deleted successfully' } };
    } catch (error) {
      return { success: false, error: 'Failed to delete board' };
    }
  }

  async validateBoardExists(boardId) {
    try {
      const board = await this.Board.findById(boardId);
      return !!board;
    } catch (error) {
      return false;
    }
  }
}

module.exports = BoardService;