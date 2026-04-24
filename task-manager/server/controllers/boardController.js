const BoardService = require('../services/BoardService');

const boardService = new BoardService();

// Get all boards
exports.getAllBoards = async (req, res) => {
  const result = await boardService.getAllBoards();
  
  if (!result.success) {
    return res.status(500).json({ error: result.error });
  }
  
  res.json(result.data);
};

// Create a new board
exports.createBoard = async (req, res) => {
  const result = await boardService.createBoard(req.body);
  
  if (!result.success) {
    const statusCode = result.statusCode || 500;
    return res.status(statusCode).json({ error: result.error });
  }
  
  res.status(result.statusCode || 201).json(result.data);
};

// Get a single board with its tasks
exports.getBoard = async (req, res) => {
  const result = await boardService.getBoardById(req.params.id);
  
  if (!result.success) {
    const statusCode = result.statusCode || 500;
    return res.status(statusCode).json({ error: result.error });
  }
  
  res.json(result.data);
};

// Update a board
exports.updateBoard = async (req, res) => {
  const result = await boardService.updateBoard(req.params.id, req.body);
  
  if (!result.success) {
    const statusCode = result.statusCode || 500;
    return res.status(statusCode).json({ error: result.error });
  }
  
  res.json(result.data);
};

// Delete a board
exports.deleteBoard = async (req, res) => {
  const result = await boardService.deleteBoard(req.params.id);
  
  if (!result.success) {
    const statusCode = result.statusCode || 500;
    return res.status(statusCode).json({ error: result.error });
  }
  
  res.json(result.data);
};