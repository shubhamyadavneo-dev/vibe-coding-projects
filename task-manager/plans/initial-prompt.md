ROLE:
Act as a senior MERN stack developer with strong expertise in scalable architecture, modern React (v19), and clean production-ready code.

TASK:
Build a Jira-like Kanban board application with drag-and-drop functionality using a MERN stack.

CONTEXT:
- Frontend is built using Create React App with React v19
- Backend is built using Node.js with Express v5
- MongoDB is used for persistence
- Client and server are maintained as separate folders (no monorepo tooling required)
- The goal is to build a minimal but scalable Jira-like board

REQUIREMENTS:

1. CORE FEATURES:
- Create and manage boards (projects)
- Each board contains columns (Todo, In Progress, Done - configurable)
- Create, update, delete tasks
- Each task contains:
  - title
  - description
  - status (column)
  - priority (low, medium, high)
- Drag and drop tasks across columns
- Persist all data via backend APIs

2. FRONTEND (React 19):
- Use functional components with hooks only
- Follow modern React patterns (no class components)
- Use Context API for global state (avoid overengineering with Redux)
- Use @dnd-kit for drag-and-drop (React 19 compatible)
- API communication using axios or fetch
- Component structure:
  - Board
  - Column
  - TaskCard
- Maintain clean folder structure:
  /src
    /components
    /pages
    /services
    /context

3. BACKEND (Express 5):
- Build RESTful APIs
- Use modular MVC architecture:
  /controllers
  /models
  /routes
- Implement APIs:
  - GET /boards
  - POST /boards
  - GET /tasks
  - POST /tasks
  - PUT /tasks/:id
  - DELETE /tasks/:id
- Use Mongoose for schema modeling
- Add validation and proper error handling

4. DATABASE (MongoDB):
- Board schema
- Task schema with reference to boardId
- Include status field for column mapping
- Store order/position of tasks for drag-and-drop consistency

5. DRAG AND DROP LOGIC:
- Use @dnd-kit
- Handle:
  - Reordering within same column
  - Moving across columns
- Update backend on drag end
- Maintain order index in DB

6. NON-FUNCTIONAL REQUIREMENTS:
- Clean, readable, and modular code
- Scalable folder structure
- Proper separation of concerns
- Basic error handling and loading states

7. CONSTRAINTS:
- Do not use microservices
- Keep implementation simple and runnable locally
- Avoid unnecessary libraries

OUTPUT:
- Provide folder structure for client and server
- Provide key code snippets:
  - React drag-and-drop implementation
  - API service layer
  - Express routes/controllers
  - Mongoose schemas
- Provide steps to run both apps locally