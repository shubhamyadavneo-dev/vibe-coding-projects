const User = require('../models/User');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

class UserController {
  /**
   * @swagger
   * /api/users:
   *   get:
   *     summary: Get all users
   *     tags: [Users]
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 100
   *         description: Maximum number of users to return
   *     responses:
   *       200:
   *         description: List of users
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/User'
   *       500:
   *         description: Server error
   */
  static async getAllUsers(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const users = await User.find({})
        .limit(limit)
        .sort({ createdAt: -1 });
      
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  /**
   * @swagger
   * /api/users/{id}:
   *   get:
   *     summary: Get user by ID
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID
   *     responses:
   *       200:
   *         description: User details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Invalid user ID format
   *       404:
   *         description: User not found
   *       500:
   *         description: Server error
   */
  static async getUserById(req, res) {
    try {
      const userId = req.params.id;
      
      // Check if ID is valid MongoDB ObjectId
      if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: 'Invalid user ID format' });
      }
      
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  /**
   * @swagger
   * /api/users:
   *   post:
   *     summary: Create a new user
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - email
   *               - password
   *             properties:
   *               username:
   *                 type: string
   *                 description: Username
   *               email:
   *                 type: string
   *                 format: email
   *                 description: User email
   *               password:
   *                 type: string
   *                 format: password
   *                 description: User password (min 6 characters)
   *     responses:
   *       201:
   *         description: User created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Validation error or missing required fields
   *       409:
   *         description: User already exists
   *       500:
   *         description: Server error
   */
  static async createUser(req, res) {
    try {
      const { username, email, password } = req.body;
      
      // Basic validation
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
      }
      
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });
      
      if (existingUser) {
        return res.status(409).json({ 
          error: 'User already exists',
          field: existingUser.email === email ? 'email' : 'username'
        });
      }
      
      // Create new user
      const user = new User({
        username,
        email,
        password
      });
      
      await user.save();
      
      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: error.errors 
        });
      }
      
      res.status(500).json({ error: 'Failed to create user' });
    }
  }

  /**
   * @swagger
   * /api/users/{id}:
   *   put:
   *     summary: Update user by ID
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username:
   *                 type: string
   *                 description: New username
   *               email:
   *                 type: string
   *                 format: email
   *                 description: New email
   *     responses:
   *       200:
   *         description: User updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Invalid user ID format or validation error
   *       404:
   *         description: User not found
   *       500:
   *         description: Server error
   */
  static async updateUser(req, res) {
    try {
      const userId = req.params.id;
      const { username, email } = req.body;
      
      // Check if ID is valid MongoDB ObjectId
      if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: 'Invalid user ID format' });
      }
      
      // Find and update user
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Update fields if provided
      if (username) user.username = username;
      if (email) user.email = email;
      
      await user.save();
      
      res.json(user);
    } catch (error) {
      console.error('Error updating user:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: error.errors 
        });
      }
      
      res.status(500).json({ error: 'Failed to update user' });
    }
  }

  /**
   * @swagger
   * /api/users/{id}:
   *   delete:
   *     summary: Delete user by ID
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID
   *     responses:
   *       200:
   *         description: User deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: User deleted successfully
   *       400:
   *         description: Invalid user ID format
   *       404:
   *         description: User not found
   *       500:
   *         description: Server error
   */
  static async deleteUser(req, res) {
    try {
      const userId = req.params.id;
      
      // Check if ID is valid MongoDB ObjectId
      if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: 'Invalid user ID format' });
      }
      
      const result = await User.findByIdAndDelete(userId);
      
      if (!result) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ 
        success: true,
        message: 'User deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }

  /**
   * @swagger
   * /api/users/search:
   *   get:
   *     summary: Search users by username or email
   *     tags: [Users]
   *     parameters:
   *       - in: query
   *         name: q
   *         required: true
   *         schema:
   *           type: string
   *         description: Search term
   *     responses:
   *       200:
   *         description: List of matching users
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/User'
   *       400:
   *         description: Search term is required
   *       500:
   *         description: Server error
   */
  static async searchUsers(req, res) {
    try {
      const searchTerm = req.query.q;
      
      if (!searchTerm || searchTerm.trim() === '') {
        return res.status(400).json({ error: 'Search term is required' });
      }
      
      const users = await User.find({
        $or: [
          { username: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } }
        ]
      }).limit(50);
      
      res.json(users);
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  }

  /**
   * @swagger
   * /api/users/stats:
   *   get:
   *     summary: Get user statistics
   *     tags: [Users]
   *     responses:
   *       200:
   *         description: User statistics
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 totalUsers:
   *                   type: integer
   *                   description: Total number of users
   *                 newUsersThisWeek:
   *                   type: integer
   *                   description: Number of new users in the last 7 days
   *                 percentageActive:
   *                   type: number
   *                   format: float
   *                   description: Percentage of active users (new/total)
   *       500:
   *         description: Server error
   */
  static async calculateStats(req, res) {
    try {
      const totalUsers = await User.countDocuments();
      const today = new Date();
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const newUsersThisWeek = await User.countDocuments({
        createdAt: { $gte: lastWeek }
      });
      
      res.json({
        totalUsers,
        newUsersThisWeek,
        percentageActive: totalUsers > 0 ? Math.round((newUsersThisWeek / totalUsers) * 100) : 0
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
      res.status(500).json({ error: 'Failed to calculate statistics' });
    }
  }
}

module.exports = UserController;