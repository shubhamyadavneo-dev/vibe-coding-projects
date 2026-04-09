# Todo Dashboard - SaaS UI with Aurora Background

A modern, responsive todo dashboard built with Next.js, TypeScript, and Tailwind CSS, featuring a stunning WebGL Aurora background and localStorage data persistence.

## Features

- **Aurora WebGL Background**: Dynamic, animated aurora effect using OGL (WebGL library)
- **LocalStorage Persistence**: All todo data is saved locally in the browser
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Full CRUD Operations**: Create, Read, Update, Delete todos with real-time updates
- **Advanced Filtering & Search**: Filter by status, priority, and search by title
- **Priority Levels**: Low, Medium, High priority classification
- **Due Date Management**: Set and track due dates with overdue detection
- **Analytics Dashboard**: Visual stats and completion metrics
- **Mock Authentication**: Login/logout functionality with user state
- **Export/Import**: Backup and restore todo data

## Pages

1. **Dashboard** (`/`) - Overview with statistics and recent tasks
2. **Todos** (`/todos`) - Full todo list with search and filtering
3. **Create** (`/create`) - Dedicated page for creating new tasks
4. **Stats** (`/stats`) - Analytics with charts and metrics
5. **Login** (`/login`) - Mock authentication page

## Tech Stack

- **Next.js 16.2.3** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS v4** - Utility-first CSS framework
- **OGL** - Minimal WebGL library for Aurora background
- **Lucide React** - Icon library
- **LocalStorage API** - Client-side data persistence

## Getting Started

### Prerequisites
- Node.js >=20.9.0
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd todos
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
app/
├── components/
│   ├── Aurora/           # WebGL Aurora background component
│   ├── Sidebar/          # Navigation sidebar
│   └── Todo/             # Todo-related components (List, Item, Form)
├── lib/
│   ├── storage.ts        # LocalStorage utilities
│   └── types.ts          # TypeScript interfaces
├── create/               # Create todo page
├── login/                # Login page
├── stats/                # Analytics dashboard
├── todos/                # Todo list page
├── layout.tsx            # Root layout with Aurora and Sidebar
└── page.tsx              # Dashboard homepage
```

## Key Components

### Aurora Background
- Based on `bg-design.md` specifications
- Configurable color stops, amplitude, blend, and speed
- GPU-accelerated WebGL animations
- Responsive to window resize

### Sidebar Navigation
- Collapsible on mobile
- User profile section with mock authentication
- Active state indicators
- Smooth transitions

### Todo Management
- **TodoList**: Search, filter, sort functionality
- **TodoItem**: Individual todo with toggle, edit, delete
- **TodoForm**: Modal form for creating/editing todos
- **Storage**: LocalStorage CRUD operations with sample data

## Design Features

- **Glassmorphism Effects**: Frosted glass UI elements
- **Gradient Backgrounds**: Purple/violet gradient theme
- **Custom Scrollbars**: Styled scrollbars for better UX
- **Responsive Grid**: Adaptive layouts for all screen sizes
- **Interactive Elements**: Hover states and smooth animations

## Data Model

```typescript
interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}
```

## Development Notes

- The project uses Next.js App Router for file-based routing
- All components are written in TypeScript with strict type checking
- Tailwind CSS v4 is configured with custom colors and utilities
- The Aurora component is imported from `bg-design.md` specifications
- LocalStorage utilities handle data persistence across page reloads

## Browser Compatibility

- Modern browsers with WebGL support (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- LocalStorage API for data persistence

## License

MIT
