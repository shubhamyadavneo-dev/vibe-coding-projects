# Product Requirements Document (PRD) - Jira-like Kanban Board

## 1. Executive Summary

**Project Name**: Jira-like Kanban Board Task Manager  
**Version**: 1.0.0  
**Date**: April 27, 2026  
**Status**: Active Development  
**Demo Environment**: Running at localhost:3000 (frontend) & localhost:5000 (backend)

## 2. Project Overview

A modern, production-ready Kanban board application built with the MERN stack (MongoDB, Express, React 19, Node.js). The application provides Jira-like task management capabilities with drag-and-drop functionality, real-time updates, and a clean, responsive UI.

### 2.1 Core Value Proposition
- **Visual Task Management**: Intuitive Kanban board for tracking tasks across customizable workflows
- **Team Collaboration**: Multi-user support with role-based access control
- **Time Tracking**: Comprehensive worklog system for accurate time reporting
- **Analytics & Reporting**: Built-in reporting for task completion and team performance
- **Enterprise Ready**: Dockerized deployment, security features, and scalability

## 3. Current State Analysis

### 3.1 Technical Stack
- **Frontend**: React 19 with Create React App, Tailwind CSS, @dnd-kit for drag-and-drop
- **Backend**: Express 5 with Node.js, MongoDB with Mongoose ODM
- **Authentication**: JWT-based with bcrypt password hashing
- **Containerization**: Docker & Docker Compose for full-stack deployment
- **Testing**: Jest for backend unit tests, React Testing Library for frontend

### 3.2 Active Development Status
- ✅ **Core Kanban Board**: Complete with 8-column workflow
- ✅ **Task Management**: Full CRUD operations implemented
- ✅ **User Authentication**: JWT-based auth with secure endpoints
- ✅ **Drag & Drop**: @dnd-kit integration for smooth task movement
- 🔄 **Time Tracking**: Worklog system partially implemented
- 🔄 **Reporting**: Time report view in development
- 📋 **Testing**: Backend test coverage in progress

### 3.3 Running Services
- **Backend Server**: Active on localhost:5000 (confirmed via terminal)
- **Frontend**: Configured to run on localhost:3000
- **Database**: MongoDB (configured via Docker Compose)

## 4. Feature Requirements

### 4.1 Core Features (Implemented)
1. **Board Management**
   - Create, read, update, and delete boards (projects)
   - Multiple boards per user with customizable workflows

2. **Task Management**
   - Full CRUD operations for tasks
   - Task properties: title (255 char limit), description, status, priority (Low/Medium/High)
   - Position tracking for consistent drag-and-drop ordering

3. **8-Column Workflow**
   - Backlog → Analysis → Ready → Development → Review → Testing → Staging → Done
   - Configurable column names and order

4. **Drag & Drop Interface**
   - Intuitive drag-and-drop using @dnd-kit (React 19 compatible)
   - Reordering within columns and moving across columns
   - Real-time state updates

5. **User Authentication**
   - JWT-based authentication with secure token management
   - Password hashing with bcrypt
   - Protected API endpoints with middleware

### 4.2 Advanced Features (In Development)
1. **Time Tracking System**
   - Immutable worklog entries for accurate time reporting
   - Worklog model with task/user association, hours, description, and date
   - Hours validation (0.25-24 hour range)

2. **Reporting & Analytics**
   - Time report view with aggregated worklog data
   - Task completion reports
   - User performance analytics
   - Project-level time summaries

3. **Enhanced UI/UX**
   - Responsive design for desktop and mobile
   - Theme support (light/dark mode)
   - Real-time notifications
   - Keyboard shortcuts

### 4.3 Technical Requirements
1. **Performance**
   - Sub-second API response times
   - Efficient MongoDB queries with indexing
   - Optimized React rendering with memoization

2. **Security**
   - Environment-based JWT secrets
   - Input sanitization and validation
   - Rate limiting on API endpoints
   - CORS configuration
   - Helmet.js for security headers

3. **Scalability**
   - Modular architecture for easy feature addition
   - Docker containerization for consistent deployment
   - Separation of concerns (controllers, services, models)

## 5. User Personas

### 5.1 Project Manager
- **Needs**: Track project progress, assign tasks, generate reports
- **Key Features**: Board overview, reporting dashboard, team assignment

### 5.2 Developer
- **Needs**: Manage personal tasks, log work hours, update task status
- **Key Features**: Task cards, drag-and-drop, worklog entry, personal dashboard

### 5.3 Team Lead
- **Needs**: Monitor team workload, review progress, generate team reports
- **Key Features**: Team view, workload distribution, performance metrics

## 6. User Stories & Acceptance Criteria

### 6.1 Board Management
**As a user, I want to create a new project board so I can organize tasks for a specific project**
- **Given** I'm authenticated
- **When** I click "Create Board" and provide a name
- **Then** a new board is created with default columns
- **And** I'm redirected to the board view

**As a user, I want to switch between multiple boards so I can manage different projects**
- **Given** I have access to multiple boards
- **When** I select a board from the board selector
- **Then** the Kanban board updates to show tasks for that board

### 6.2 Task Management
**As a user, I want to create tasks with details so team members understand the work**
- **Given** I'm viewing a board
- **When** I click "Add Task" and fill out the form
- **Then** a new task card appears in the selected column
- **And** the task includes title, description, priority, and assignee

**As a user, I want to drag tasks between columns so I can update their status visually**
- **Given** I'm viewing a board with tasks
- **When** I drag a task from "Development" to "Review"
- **Then** the task moves to the new column
- **And** the task status updates in the database

### 6.3 Time Tracking
**As a user, I want to log time spent on tasks so I can track my work hours**
- **Given** I'm viewing a task
- **When** I click "Log Time" and enter hours and description
- **Then** a worklog entry is created
- **And** the task's total hours are updated

**As a manager, I want to view time reports so I can analyze team productivity**
- **Given** I'm authenticated as a manager
- **When** I navigate to the Reports page
- **Then** I see aggregated time data by user, task, and project
- **And** I can filter by date range and export data

## 7. Technical Architecture

### 7.1 System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │   Express API   │    │   MongoDB       │
│   (localhost:3000)│◄──►│   (localhost:5000)│◄──►│   (Docker)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx         │    │   Docker Compose│    │   Authentication│
│   (Production)  │    │   (Development) │    │   Middleware    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 7.2 Database Schema
```javascript
// Board Model
{
  name: String,
  description: String,
  columns: [String], // Default: 8-column workflow
  createdBy: ObjectId(ref: 'User'),
  createdAt: Date
}

// Task Model
{
  title: String, // max 255 chars
  description: String,
  status: String, // matches column name
  priority: String, // 'Low', 'Medium', 'High'
  position: Number, // for ordering within column
  boardId: ObjectId(ref: 'Board'),
  assignedTo: ObjectId(ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}

// Worklog Model
{
  taskId: ObjectId(ref: 'Task'),
  userId: ObjectId(ref: 'User'),
  hours: Number, // 0.25-24 range
  description: String,
  date: Date,
  createdAt: Date
}

// User Model
{
  username: String,
  email: String,
  password: String (hashed),
  role: String, // 'user', 'admin'
  createdAt: Date
}
```

### 7.3 API Endpoints
```
AUTHENTICATION
POST   /api/auth/register     # User registration
POST   /api/auth/login        # User login
GET    /api/auth/me           # Get current user

BOARD MANAGEMENT
GET    /api/boards           # List all boards for user
POST   /api/boards           # Create new board
GET    /api/boards/:id       # Get board details
PUT    /api/boards/:id       # Update board
DELETE /api/boards/:id       # Delete board

TASK MANAGEMENT
GET    /api/tasks            # List tasks (filter by board)
POST   /api/tasks            # Create task
GET    /api/tasks/:id        # Get task details
PUT    /api/tasks/:id        # Update task
DELETE /api/tasks/:id        # Delete task
PUT    /api/tasks/:id/move   # Move task (drag-and-drop)

WORKLOGS
POST   /api/worklogs         # Create worklog entry
GET    /api/worklogs         # List worklogs (filter by user/task)
GET    /api/worklogs/:id     # Get worklog details
DELETE /api/worklogs/:id     # Delete worklog

REPORTS
GET    /api/reports/time     # Time report aggregation
GET    /api/reports/tasks    # Task completion report
GET    /api/reports/users    # User performance report
```

## 8. Non-Functional Requirements

### 8.1 Performance
- **Page Load Time**: < 3 seconds for initial load
- **API Response Time**: < 500ms for 95% of requests
- **Concurrent Users**: Support for 100+ simultaneous users
- **Database Queries**: Optimized with proper indexing

### 8.2 Security
- **Authentication**: JWT tokens with 24-hour expiry
- **Authorization**: Role-based access control
- **Data Validation**: Input sanitization and schema validation
- **Rate Limiting**: 100 requests per minute per IP
- **HTTPS**: Required in production

### 8.3 Reliability
- **Uptime**: 99.5% availability
- **Error Handling**: Graceful degradation with user-friendly messages
- **Data Backup**: Daily automated backups
- **Monitoring**: Logging and error tracking

### 8.4 Usability
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 AA compliance
- **Browser Support**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Internationalization**: Ready for future i18n implementation

## 9. Development Roadmap

### Phase 1: MVP (Completed)
- [x] Basic Kanban board with drag-and-drop
- [x] Task CRUD operations
- [x] User authentication
- [x] 8-column workflow
- [x] Docker configuration

### Phase 2: Enhanced Features (Current)
- [x] Worklog system for time tracking
- [ ] Time report view and analytics
- [ ] Enhanced UI with theme support
- [ ] Real-time updates via WebSocket
- [ ] Export functionality (CSV/PDF)

### Phase 3: Advanced Features (Planned)
- [ ] Team management and collaboration
- [ ] Advanced filtering and search
- [ ] Custom workflows and columns
- [ ] Integration with external tools (GitHub, Slack)
- [ ] Mobile app (React Native)

### Phase 4: Enterprise Features (Future)
- [ ] SSO integration
- [ ] Advanced reporting and dashboards
- [ ] Custom fields and templates
- [ ] Audit logging
- [ ] API rate limiting and monetization

## 10. Demo Instructions

### 10.1 Quick Start (Development)
```bash
# Clone and navigate to project
cd task-manager

# Start with Docker Compose
docker-compose up -d

# Or run manually
cd server && npm install && npm start
cd client && npm install && npm start
```

### 10.2 Demo Credentials
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Default User**: demo@example.com / password123
- **Admin User**: admin@example.com / admin123

### 10.3 Demo Scenarios
1. **Board Creation**: Create a new project board with custom name
2. **Task Management**: Add, edit, and delete tasks
3. **Drag & Drop**: Move tasks between columns
4. **Time Tracking**: Log work hours on tasks
5. **Reporting**: View time reports and analytics
6. **User Management**: Register new users and manage roles

## 11. Success Metrics

### 11.1 Technical Metrics
- **Test Coverage**: > 80% for critical paths
- **API Latency**: < 200ms P95 for core endpoints
- **Bundle Size**: < 500KB gzipped for frontend
- **Build Time**: < 2 minutes for full CI/CD pipeline

### 11.2 Business Metrics
- **User Adoption**: 100+ active users in first month
- **Task Completion Rate**: > 70% of tasks moved to "Done"
- **User Satisfaction**: > 4.5/5 rating in feedback surveys
- **Team Productivity**: 20% reduction in task completion time

### 11.3 Quality Metrics
- **Bug Rate**: < 0.5 bugs per 1000 lines of code
- **Uptime**: > 99.5% monthly availability
- **Security**: Zero critical vulnerabilities
- **Performance**: Lighthouse score > 90 for all pages

## 12. Risks & Mitigations

### 12.1 Technical Risks
- **Risk**: MongoDB performance with large datasets
  - **Mitigation**: Implement proper indexing, query optimization, and consider sharding for scale
- **Risk**: Real-time updates causing WebSocket connection issues
  - **Mitigation**: Implement connection pooling, reconnection logic, and fallback to polling
- **Risk**: Cross-browser compatibility issues
  - **Mitigation**: Comprehensive testing on target browsers, polyfills for older browsers

### 12.2 Business Risks
- **Risk**: Low user adoption due to complexity
  - **Mitigation**: Progressive onboarding, tutorial videos, simplified UI options
- **Risk**: Competition from established tools (Jira, Trello)
  - **Mitigation**: Focus on specific niche features (time tracking, reporting), competitive pricing

### 12.3 Security Risks
- **Risk**: JWT token theft
  - **Mitigation**: Short token expiration, refresh tokens, HTTPS enforcement
- **Risk**: MongoDB injection attacks
  - **Mitigation**: Input validation, Mongoose schema validation, parameterized queries
- **Risk**: DDoS attacks on API
  - **Mitigation**: Rate limiting, CDN protection, cloud-based DDoS mitigation

## 13. Appendix

### 13.1 Project Structure
```
task-manager/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React context for state
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API service layer
│   │   └── tests/         # Frontend tests
│   ├── Dockerfile
│   └── nginx.conf
├── server/                # Express backend
│   ├── controllers/       # Request handlers
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── middleware/       # Express middleware
│   ├── __tests__/        # Backend tests
│   └── Dockerfile
└── docker-compose.yml    # Full stack deployment
```

### 13.2 Dependencies
**Frontend**: React 19, @dnd-kit, Axios, Tailwind CSS  
**Backend**: Express 5, MongoDB, Mongoose, JWT, bcrypt  
**DevOps**: Docker, Docker Compose, Jest, Supertest  
**Security**: Helmet, CORS, rate limiting, input sanitization

### 13.3 Environment Variables
```env
# Server
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development

# Client
REACT_APP_API_URL=http://localhost:5000
```

---

*Document Version: 1.0.0*  
*Last Updated: April 27, 2026*  
*Maintained by: Development Team*  
*Status: Active Development*