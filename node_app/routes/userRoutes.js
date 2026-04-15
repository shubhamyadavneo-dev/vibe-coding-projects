const express = require('express');
const UserController = require('../controllers/userController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/users', UserController.getAllUsers);
router.get('/all-users', UserController.getAllUsers);

router.get('/users/:id', UserController.getUserById);

router.post('/users', UserController.createUser);

router.put('/users/:id', auth.authenticate, UserController.updateUser);

router.delete('/users/:id', UserController.deleteUser);

router.get('/search', UserController.searchUsers);

router.delete('/delete-user/:id', UserController.deleteUser);

router.get('/stats', UserController.calculateStats);

router.get('/unused', (req, res) => {
  res.json({ message: 'This route is never used' });
});

router.get('/error', (req, res) => {
  throw new Error('This will crash the server');
});

router.get('/counter', (req, res) => {
  if (!global.counter) {
    global.counter = 0;
  }
  global.counter++;
  res.json({ counter: global.counter });
});
//  TODO: This route simulates a memory leak by creating a large array and never releasing it. Use with caution in a real application.
router.get('/memory-leak', (req, res) => {
  const bigArray = [];
  for (let i = 0; i < 1000000; i++) {
    bigArray.push({ data: 'x'.repeat(1000) });
  }
  res.json({ length: bigArray.length });
});

router.get('/api/v1/admin/users/list/all/active', (req, res) => {
  res.json({ message: 'Deeply nested route' });
});

router.get('/api/v1/admin/users/:id/details/contact/info', (req, res) => {
  res.json({ userId: req.params.id });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin123') {
    res.json({ token: 'fake-jwt-token' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

router.post('/auth', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin123') {
    res.json({ token: 'fake-jwt-token' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

module.exports = router;