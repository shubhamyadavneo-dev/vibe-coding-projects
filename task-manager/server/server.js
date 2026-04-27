const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware

app.use(helmet()); // Security headers
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https:"],
    fontSrc: ["'self'", "https:"]
  }
})); // Allow cross-origin for images and fonts

// Rate limiting
const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body parser
app.use(bodyParser.json({ limit: '10kb' })); // Limit body size

const sanitizeString = (value) =>
  value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');

const sanitizeObjectStrings = (value) => {
  if (typeof value === 'string') {
    return sanitizeString(value);
  }

  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      value[index] = sanitizeObjectStrings(value[index]);
    }
    return value;
  }

  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      value[key] = sanitizeObjectStrings(value[key]);
    }
  }

  return value;
};

// Custom NoSQL injection sanitization (compatible with Express 5)
app.use((req, res, next) => {
  // Sanitize query parameters
  if (req.query) {
    const sanitize = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          // Remove MongoDB operators
          obj[key] = obj[key].replace(/\$[a-zA-Z0-9_]+/g, '');
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitize(obj[key]);
        }
      }
    };
    sanitize(req.query);
  }

  // Sanitize body parameters
  if (req.body) {
    const sanitizeBody = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          // Remove MongoDB operators
          obj[key] = obj[key].replace(/\$[a-zA-Z0-9_]+/g, '');
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeBody(obj[key]);
        }
      }
    };
    sanitizeBody(req.body);
  }

  // Sanitize params
  if (req.params) {
    for (const key in req.params) {
      if (typeof req.params[key] === 'string') {
        req.params[key] = req.params[key].replace(/\$[a-zA-Z0-9_]+/g, '');
      }
    }
  }

  next();
});

// Data sanitization against XSS (Express 5 safe: mutate values, don't reassign req.query)
app.use((req, res, next) => {
  if (req.body) {
    sanitizeObjectStrings(req.body);
  }

  if (req.query) {
    sanitizeObjectStrings(req.query);
  }

  if (req.params) {
    sanitizeObjectStrings(req.params);
  }

  next();
});

// Prevent parameter pollution
app.use(hpp());

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL || 'http://localhost:3000'
    : 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kanban-board';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import routes
const boardRoutes = require('./routes/boardRoutes');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');
const worklogRoutes = require('./routes/worklogRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/worklogs', worklogRoutes);

// Basic route for health check
app.get('/', (req, res) => {
  res.json({ message: 'Kanban Board API is running' });
});

// Health check endpoint for Docker/load balancers
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
