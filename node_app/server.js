require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const helmet = require('helmet');
const cors = require('cors');
const moment = require('moment');
const request = require('request');
const uuid = require('uuid');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const orderController = require('./controllers/orderController');
const cartController = require('./controllers/cartController');
const userRoutes = require('./routes/userRoutes');
const User = require('./models/User');

const app = express();

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Move secrets to environment variables (TODO: implement .env)
const JWT_SECRET = process.env.JWT_SECRET || 'my-super-secret-key-that-is-not-secret';
const API_KEY = process.env.API_KEY || 'sk_live_1234567890abcdef';

// MongoDB connection with updated options
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mydb';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

global.config = {
  secret: JWT_SECRET,
  apiKey: API_KEY
};

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Node.js Messy App API',
      version: '1.0.0',
      description: 'A messy Node.js project with security issues and bugs - API Documentation',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            username: {
              type: 'string',
              description: 'Username'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Order: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Order ID'
            },
            userId: {
              type: 'string',
              description: 'User ID'
            },
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: {
                    type: 'string'
                  },
                  quantity: {
                    type: 'integer'
                  }
                }
              }
            },
            totalAmount: {
              type: 'number',
              format: 'float'
            },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
            }
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./routes/*.js', './controllers/*.js', './server.js']
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Updated authentication middleware
function authenticate(req, res, next) {
  const token = req.headers['authorization'];
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // Token verification failed - continue without authentication
      console.warn('Token verification failed:', err.message);
    }
  }
  next();
}

/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     description: Authenticate user and return JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Email and password are required
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
// Updated login endpoint using MongoDB
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Compare password (using comparePassword method from User model)
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token with MongoDB user ID
    const token = jwt.sign(
      { 
        id: user._id,
        username: user.username,
        email: user.email 
      }, 
      JWT_SECRET, 
      { expiresIn: '1h' }
    );
    
    res.json({ 
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Remove exposed config endpoint (security issue)
// app.get('/config', (req, res) => {
//   res.json({
//     secret: JWT_SECRET,
//     apiKey: API_KEY
//   });
// });

// Remove unused endpoints
app.get('/unused', (req, res) => {
  res.send('This endpoint is never used');
});

app.get('/error', (req, res) => {
  throw new Error('Intentional error');
});

app.get('/bug', (req, res) => {
  if (req.query.id === '1') {
    res.send('OK');
  } else {
    res.status(400).send('Invalid ID');
  }
});

// E-commerce routes
app.get('/api/orders', orderController.getAllOrders);
app.get('/api/orders/:id', orderController.getOrderById);
app.post('/api/orders', orderController.createOrder);
app.put('/api/orders/:id', orderController.updateOrder);
app.delete('/api/orders/:id', orderController.deleteOrder);
app.get('/api/orders/stats/revenue', orderController.getRevenue);
app.get('/api/orders/stats/summary', orderController.calculateStats);

// Cart routes
app.get('/api/carts/:userId', cartController.getCart);
app.post('/api/carts', cartController.addToCart);
app.put('/api/carts/:userId/items/:productId', cartController.updateCartItem);
app.delete('/api/carts/:userId/items/:productId', cartController.removeFromCart);
app.delete('/api/carts/:userId', cartController.clearCart);
app.post('/api/carts/:userId/checkout', cartController.checkout);
app.get('/api/carts/stats/abandoned', cartController.getAbandonedCarts);
app.get('/api/carts/:userId/stats/summary', cartController.getCartTotal); // User-specific cart summary

// User routes (from routes file - now using MongoDB)
app.use('/api', userRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Don't expose API key in logs
});

module.exports = app;
