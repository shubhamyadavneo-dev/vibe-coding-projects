const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT secret - should come from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'my-super-secret-key-that-is-not-secret';

// Authentication middleware that verifies JWT token
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided or invalid format' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

// Middleware to check if user is admin (simplified for now)
function isAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // In a real application, you would check user.role or user.isAdmin from database
  // For now, we'll assume any authenticated user is authorized
  // This should be updated based on your actual authorization logic
  next();
}

// Simple rate limiting middleware
function rateLimit(req, res, next) {
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100;
  
  if (!global.rateLimitStore) {
    global.rateLimitStore = {};
  }
  
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  // Clean up old entries
  if (global.rateLimitStore[ip] && global.rateLimitStore[ip].expires < now) {
    delete global.rateLimitStore[ip];
  }
  
  if (!global.rateLimitStore[ip]) {
    global.rateLimitStore[ip] = {
      count: 1,
      expires: now + windowMs
    };
  } else {
    global.rateLimitStore[ip].count++;
    
    if (global.rateLimitStore[ip].count > maxRequests) {
      return res.status(429).json({ 
        error: 'Too many requests',
        retryAfter: Math.ceil((global.rateLimitStore[ip].expires - now) / 1000)
      });
    }
  }
  
  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', maxRequests);
  res.setHeader('X-RateLimit-Remaining', maxRequests - global.rateLimitStore[ip].count);
  res.setHeader('X-RateLimit-Reset', Math.ceil(global.rateLimitStore[ip].expires / 1000));
  
  next();
}

// User validation middleware (for registration/login)
function validateUser(req, res, next) {
  const { username, email, password } = req.body;
  const errors = [];
  
  // Username validation
  if (username && (username.length < 3 || username.length > 50)) {
    errors.push('Username must be between 3 and 50 characters');
  }
  
  // Email validation
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (email && !emailRegex.test(email)) {
    errors.push('Invalid email format');
  }
  
  // Password validation
  if (password && password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
}

// Optional: Fetch user from database and attach to request
async function attachUser(req, res, next) {
  if (!req.user || !req.user.id) {
    return next();
  }
  
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
      req.currentUser = user;
    }
  } catch (error) {
    console.error('Error fetching user:', error);
  }
  
  next();
}

module.exports = {
  authenticate,
  isAdmin,
  rateLimit,
  validateUser,
  attachUser
};