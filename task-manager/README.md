# Jira-like Kanban Board - MERN Stack

A modern, production-ready Kanban board application built with the MERN stack (MongoDB, Express, React 19, Node.js). Features drag-and-drop functionality, real-time updates, and a clean, responsive UI.

## Features

### Core Features
- **Board Management**: Create, read, update, and delete boards (projects)
- **Task Management**: Full CRUD operations for tasks with drag-and-drop
- **8-Column Workflow**: Professional Kanban workflow with columns: Backlog, Analysis, Ready, Development, Review, Testing, Staging, Done
- **Drag & Drop**: Intuitive drag-and-drop using @dnd-kit (React 19 compatible)
- **Task Properties**:
  - Title and description (title limited to 255 characters)
  - Status (mapped to 8-column workflow, default: Backlog)
  - Priority (Low, Medium, High)
  - Position tracking for consistent ordering
  - Time tracking with worklogs
- **Real-time Updates**: State management with React Context API
- **Responsive Design**: Works on desktop and mobile devices
- **User Authentication**: JWT-based authentication with secure token management
- **Time Tracking**: Immutable worklog entries for accurate time reporting
- **Reporting**: Task completion reports, worklog summaries, and user performance analytics

### Technical Features
- **Frontend**: React 19 with functional components and hooks
- **Backend**: Express 5 with RESTful API architecture
- **Database**: MongoDB with Mongoose ODM
- **State Management**: React Context API (no Redux overhead)
- **Drag & Drop**: @dnd-kit library with sortable lists
- **API Client**: Axios with interceptors for error handling
- **Modular Architecture**: Clean separation of concerns
- **Docker Support**: Containerized deployment with docker-compose
- **Unit Testing**: Jest test suite for backend services and controllers
- **Security**: Environment-based JWT secrets, input sanitization, rate limiting

## Project Structure

```
task-manager/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── Board.js
│   │   │   ├── Column.js
│   │   │   ├── TaskCard.js
│   │   │   ├── TaskForm.js
│   │   │   ├── BoardForm.js
│   │   │   ├── BoardSelector.js
│   │   │   └── ReportPage.js
│   │   ├── context/       # React context for state
│   │   │   ├── KanbanContext.js
│   │   │   ├── AuthContext.js
│   │   │   └── ThemeContext.js
│   │   ├── hooks/         # Custom hooks
│   │   │   └── useDragAndDrop.js
│   │   ├── services/      # API service layer
│   │   │   └── api.js
│   │   ├── App.js         # Main App component
│   │   └── index.js       # Entry point
│   ├── Dockerfile         # Frontend Docker configuration
│   ├── nginx.conf         # Nginx configuration for production
│   └── package.json
├── server/                # Express backend
│   ├── controllers/       # Request handlers
│   │   ├── authController.js
│   │   ├── boardController.js
│   │   ├── taskController.js
│   │   ├── worklogController.js
│   │   ├── reportController.js
│   │   └── userController.js
│   ├── models/           # Mongoose schemas
│   │   ├── Board.js
│   │   ├── Task.js
│   │   ├── User.js
│   │   └── Worklog.js
│   ├── routes/           # API routes
│   │   ├── authRoutes.js
│   │   ├── boardRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── worklogRoutes.js
│   │   ├── reportRoutes.js
│   │   └── userRoutes.js
│   ├── services/         # Business logic services
│   │   ├── BoardService.js
│   │   ├── TaskService.js
│   │   └── ReportService.js
│   ├── middleware/       # Express middleware
│   │   └── authMiddleware.js
│   ├── __tests__/        # Unit tests
│   │   ├── controllers/
│   │   │   ├── taskController.test.js
│   │   │   └── worklogController.test.js
│   │   └── services/
│   │       └── ReportService.test.js
│   ├── Dockerfile        # Backend Docker configuration
│   ├── jest.config.js    # Jest configuration
│   ├── jest.setup.js     # Jest setup file
│   ├── server.js         # Express app entry
│   └── package.json
├── docker-compose.yml    # Docker Compose for full stack
└── README.md
```

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token
- `POST /api/auth/logout` - Logout (invalidate token)
- `GET /api/auth/me` - Get current user profile

### Board Endpoints
- `GET /api/boards` - Get all boards
- `POST /api/boards` - Create a new board
- `GET /api/boards/:id` - Get a board with its tasks
- `PUT /api/boards/:id` - Update a board
- `DELETE /api/boards/:id` - Delete a board and its tasks

### Task Endpoints
- `GET /api/tasks?boardId=:boardId` - Get all tasks for a board
- `POST /api/tasks` - Create a new task (default status: Backlog)
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `POST /api/tasks/reorder` - Reorder tasks (drag and drop)
- `POST /api/tasks/:id/comments` - Add comment to a task

### Worklog Endpoints (Immutable)
- `POST /api/worklogs` - Create a new worklog entry
- `GET /api/worklogs/task/:taskId` - Get worklogs for a specific task
- `GET /api/worklogs/user` - Get worklogs for the current user
- `DELETE /api/worklogs/:id` - Delete a worklog (owner only)
- **Note**: Worklogs are immutable - no PUT/update endpoint exists

### Report Endpoints
- `GET /api/reports/task-completion` - Get task completion statistics
- `GET /api/reports/worklog-summary` - Get worklog summary by date/user
- `GET /api/reports/user-performance` - Get user performance metrics

### Health Check
- `GET /api/health` - Health check endpoint for Docker/load balancers

## Database Schema

### Board Schema
```javascript
{
  name: String,           // Board name (required)
  description: String,    // Board description
  columns: [String],      // Array of column names (8-column workflow)
  createdAt: Date,
  updatedAt: Date
}
```

### Task Schema
```javascript
{
  title: String,          // Task title (required, maxlength: 255)
  description: String,    // Task description
  status: String,         // 'Backlog', 'Analysis', 'Ready', 'Development', 'Review', 'Testing', 'Staging', 'Done'
  priority: String,       // 'low', 'medium', 'high'
  assignee: ObjectId,     // Reference to assigned user
  boardId: ObjectId,      // Reference to parent board
  position: Number,       // Order within column
  estimatedHours: Number, // Estimated hours for completion
  actualHours: Number,    // Actual hours spent
  comments: [Comment],    // Array of comments
  activityLog: [Activity], // Audit trail of task changes
  createdAt: Date,
  updatedAt: Date
}
```

### Worklog Schema (Immutable)
```javascript
{
  taskId: ObjectId,      // Reference to task
  userId: ObjectId,      // Reference to user who logged time
  hours: Number,         // Hours worked (required)
  description: String,   // Description of work done
  date: Date,            // Date of work (default: current date)
  createdAt: Date        // Creation timestamp (immutable)
}
```

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn
- Docker and Docker Compose (optional, for containerized deployment)

### Option 1: Traditional Installation

#### 1. Clone and Navigate
```bash
cd /home/shubham/Desktop/vibe-coding-projects/task-manager
```

#### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kanban-board
NODE_ENV=development
JWT_SECRET=your-secure-jwt-secret-key-change-in-production
```

#### 3. Frontend Setup
```bash
cd ../client
npm install
```

#### 4. Start MongoDB
Ensure MongoDB is running:
```bash
# On Ubuntu/Debian
sudo systemctl start mongod

# Or start manually
mongod --dbpath /path/to/data
```

#### 5. Run the Application

**Backend:**
```bash
cd server
npm start
# or for development with nodemon
npm run dev
```

**Frontend:**
```bash
cd client
npm start
```

### Option 2: Docker Deployment (Recommended for Production)

#### 1. Build and Run with Docker Compose
```bash
cd task-manager
docker-compose up --build
```

#### 2. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017

#### 3. Docker Commands
```bash
# Start services in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up --build -d

# Run tests inside container
docker-compose exec backend npm test
```

## Testing

### Backend Unit Tests
The application includes comprehensive Jest tests for critical business logic:

```bash
cd server
npm test
```

Test coverage includes:
- **ReportService**: Time aggregation and reporting logic
- **TaskController**: Drag-and-drop reordering functionality
- **WorklogController**: Immutability validation and CRUD operations

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- taskController.test.js
```

## Security Features

### JWT Authentication
- Environment variable based JWT secret (no hardcoded secrets)
- Token validation middleware for protected routes
- Secure token generation with expiration

### Input Sanitization
- Request body sanitization to prevent XSS attacks
- HTML entity encoding for user-generated content
- MongoDB query sanitization

### Rate Limiting
- API rate limiting to prevent abuse
- Configurable limits per endpoint

### Worklog Immutability
- Worklog entries cannot be modified once created
- Ensures accurate time tracking for compliance
- Delete operation requires ownership verification

## 8-Column Workflow

The application implements a professional 8-column Kanban workflow:

1. **Backlog** - New tasks start here (default status)
2. **Analysis** - Requirements analysis and planning
3. **Ready** - Ready for development
4. **Development** - Active development work
5. **Review** - Code/design review
6. **Testing** - Quality assurance testing
7. **Staging** - Pre-production deployment
8. **Done** - Completed and delivered

This workflow ensures proper task progression and visibility across the development lifecycle.

## Development Notes

### React 19 Features
- Functional components with hooks only
- No class components
- Modern React patterns (useCallback, useMemo, useContext)
- Strict mode compatible

### Scalability Considerations
- Modular folder structure for easy expansion
- Index-based queries for efficient task ordering
- MongoDB indexes for performance
- RESTful API design for clear separation
- Docker containerization for easy scaling

### Future Enhancements
1. Real-time collaboration with WebSockets
2. Advanced filtering and search with Elasticsearch
3. Task attachments and file uploads
4. Board templates and cloning
5. Export/Import functionality (CSV, JSON)
6. Mobile app with React Native
7. Integration with CI/CD pipelines
8. Advanced analytics and forecasting

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running: `sudo systemctl status mongod`
   - Check connection string in `.env` file
   - For Docker: Ensure MongoDB container is running

2. **JWT Authentication Errors**
   - Ensure `JWT_SECRET` is set in environment variables
   - Check token expiration (default: 7 days)
   - Verify token is included in Authorization header

3. **Docker Compose Issues**
   - Check Docker daemon is running: `docker ps`
   - Ensure ports 3000 and 5000 are available
   - Clear Docker cache: `docker system prune -a`

4. **Frontend Not Connecting to Backend**
   - Check CORS configuration in server
   - Verify backend is running on port 5000
   - Check network connectivity between containers

### Health Check
Access `http://localhost:5000/api/health` to verify backend is running properly.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- React 19 and @dnd-kit for drag-and-drop functionality
- Express.js for robust backend API
- MongoDB for flexible document storage
- Docker for containerization and deployment
- Jest for comprehensive testing framework