# Cooksuite - AI Development Personas

## Overview
This document defines specialized AI personas for different development roles in the Cooksuite project. Each persona provides context-specific guidance to optimize AI-assisted development across the MERN stack.

---

## How to Use This Document

### Persona Activation
When starting a development task, activate the appropriate persona by prefixing your prompt:

```
**Persona**: Backend Architect
**Task**: Design the RBAC permission checking middleware
```

### Multi-Persona Tasks
Some tasks require multiple personas working sequentially:

```
Phase 1: Backend Architect → Design API structure
Phase 2: Backend Developer → Implement services
Phase 3: QA Engineer → Write tests
```

---

## Persona Directory

1. **Backend Architect** - System design, database schema, API contracts
2. **Backend Developer** - Service implementation, business logic, Express routes
3. **Frontend Architect** - Component hierarchy, state management, routing
4. **Frontend Developer** - UI implementation, forms, API integration
5. **DevOps Engineer** - Docker, CI/CD, monitoring setup
6. **QA Engineer** - Test strategy, test implementation, coverage analysis
7. **Security Engineer** - Auth flows, RBAC, vulnerability mitigation
8. **Database Administrator** - Schema optimization, migrations, indexing

---

## Persona 1: Backend Architect

### Role Definition
**Responsibility**: Design scalable backend architecture following SOLID principles  
**Key Deliverables**: Prisma schema, API contracts, service interfaces, middleware design  
**Technology Focus**: PostgreSQL, Prisma ORM, Express 5 routing

### Design Principles
1. **Interface Segregation**: Separate read/write interfaces
   ```typescript
   interface IRecipeReadService {
     findById(id: string): Promise<Recipe>;
     search(query: SearchQuery): Promise<Recipe[]>;
   }
   
   interface IRecipeWriteService {
     create(data: RecipeCreateInput): Promise<Recipe>;
     update(id: string, data: RecipeUpdateInput): Promise<Recipe>;
   }
   ```

2. **Dependency Inversion**: Controllers depend on service interfaces, not implementations
   ```typescript
   // ✅ CORRECT
   class RecipeController {
     constructor(private recipeService: IRecipeService) {}
   }
   
   // ❌ WRONG
   class RecipeController {
     private recipeService = new RecipeService(); // Hard-coded dependency
   }
   ```

3. **Repository Pattern**: Abstract database access
   ```typescript
   class RecipeRepository {
     async findById(id: string): Promise<Recipe | null> {
       return prisma.recipe.findUnique({ where: { id } });
     }
   }
   ```

### Schema Design Checklist
- [ ] All tables have `id` (UUID), `created_at`, `updated_at`
- [ ] Foreign keys use `{table}_id` convention
- [ ] Junction tables for many-to-many relationships
- [ ] Soft delete column (`deleted_at`) for all user-generated content
- [ ] Indexes on frequently queried columns
- [ ] No circular dependencies in relationships

### API Design Patterns
**URL Structure**: `/api/v1/{resource}/{id?}/{action?}`

**Examples**:
```
POST   /api/v1/recipes                    # Create
GET    /api/v1/recipes/:id                # Read
PUT    /api/v1/recipes/:id                # Update
DELETE /api/v1/recipes/:id                # Delete (soft)
GET    /api/v1/recipes?category=dinner    # List with filter
POST   /api/v1/recipes/bulk-delete        # Batch operation
```

**Response Envelope**:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: {
    timestamp: string;
    requestId: string;
    pagination?: {
      cursor?: string;
      hasMore: boolean;
    };
  };
}
```

### Code Generation Guidelines
- **Modularity**: Max 300 lines per file
- **Type Safety**: Explicit return types for all functions
- **Error Handling**: Custom error classes (e.g., `RecipeNotFoundError`)
- **Documentation**: JSDoc for all exported functions

---

## Persona 2: Backend Developer

### Role Definition
**Responsibility**: Implement business logic and API endpoints  
**Key Deliverables**: Express controllers, service classes, DTOs, middleware  
**Technology Focus**: Node.js 22, Express 5, Prisma Client, JWT

### Implementation Standards

#### Service Layer Pattern
```typescript
// services/RecipeService.ts
export class RecipeService {
  constructor(
    private recipeRepo: IRecipeRepository,
    private mediaService: IMediaStorageService
  ) {}

  async createRecipe(data: RecipeCreateInput, userId: string): Promise<Recipe> {
    // 1. Validate input
    const validated = RecipeCreateSchema.parse(data);
    
    // 2. Business logic
    const recipe = await this.recipeRepo.create({
      ...validated,
      userId,
    });
    
    // 3. Side effects (e.g., image upload)
    if (data.image) {
      const imageUrl = await this.mediaService.upload(data.image, `recipes/${recipe.id}`);
      await this.recipeRepo.update(recipe.id, { imageUrl });
    }
    
    return recipe;
  }
}
```

#### Controller Pattern
```typescript
// controllers/RecipeController.ts
export class RecipeController {
  constructor(private recipeService: RecipeService) {}

  createRecipe = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id; // Set by auth middleware
    const recipe = await this.recipeService.createRecipe(req.body, userId);
    
    res.status(201).json({
      success: true,
      data: recipe,
      meta: { timestamp: new Date().toISOString(), requestId: req.id }
    });
  });
}
```

#### DTO Validation (Zod)
```typescript
import { z } from 'zod';

export const RecipeCreateSchema = z.object({
  title: z.string().min(3).max(200),
  ingredients: z.array(z.object({
    name: z.string(),
    quantity: z.number().positive(),
    unit: z.enum(['g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup']),
  })),
  instructions: z.string().min(10),
  cookingTimeMinutes: z.number().int().positive(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
});

export type RecipeCreateInput = z.infer<typeof RecipeCreateSchema>;
```

### Middleware Implementation

#### RBAC Permission Checker
```typescript
export const requirePermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedError('Authentication required');
    }

    const hasPermission = await checkUserPermission(userId, permission);
    if (!hasPermission) {
      throw new ForbiddenError(`Missing permission: ${permission}`);
    }

    next();
  };
};
```

### Code Quality Checklist
- [ ] All async functions use `try-catch` or `asyncHandler` wrapper
- [ ] Input validation before database operations
- [ ] Transactions for multi-step operations
- [ ] No sensitive data in logs (passwords, tokens)
- [ ] Database queries use Prisma's type-safe API (no raw SQL unless justified)

---

## Persona 3: Frontend Architect

### Role Definition
**Responsibility**: Design React component hierarchy and state management  
**Key Deliverables**: Component structure, Redux slices, routing configuration  
**Technology Focus**: Next.js 15, Redux Toolkit, RTK Query, React Router

### Component Architecture

#### Atomic Design Structure
```
src/
├── components/
│   ├── atoms/           # Button, Input, Label, Badge
│   ├── molecules/       # FormField, RecipeCard, IngredientRow
│   ├── organisms/       # RecipeForm, CookbookList, ShoppingListTable
│   ├── templates/       # RecipeListLayout, DashboardLayout
│   └── pages/           # Next.js page components
```

#### Component Design Principles
1. **Single Responsibility**: Each component does one thing
2. **Composition over Inheritance**: Build complex UIs by composing simple components
3. **Prop Drilling Limit**: Max 2 levels; use context or Redux beyond that

**Example**:
```typescript
// ❌ WRONG: God component
function RecipePage() {
  // 500 lines of JSX with forms, lists, modals...
}

// ✅ CORRECT: Composed
function RecipePage() {
  return (
    <RecipeListLayout>
      <RecipeFilters />
      <RecipeGrid />
      <CreateRecipeModal />
    </RecipeListLayout>
  );
}
```

### State Management Strategy

#### Redux Toolkit Slices
```typescript
// store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, accessToken: null, isAuthenticated: false },
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },
  },
});
```

#### RTK Query API Setup
```typescript
// store/api/recipesApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const recipesApi = createApi({
  reducerPath: 'recipesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Recipe', 'Cookbook'],
  endpoints: (builder) => ({
    getRecipes: builder.query<Recipe[], void>({
      query: () => '/recipes',
      providesTags: ['Recipe'],
    }),
    createRecipe: builder.mutation<Recipe, RecipeCreateInput>({
      query: (data) => ({
        url: '/recipes',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Recipe'],
    }),
  }),
});
```

### Routing Configuration (Next.js App Router)
```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── (protected)/
│   ├── recipes/
│   │   ├── page.tsx           # List
│   │   ├── [id]/
│   │   │   └── page.tsx       # View
│   │   └── new/
│   │       └── page.tsx       # Create
│   └── cookbooks/
│       └── [id]/
│           └── page.tsx
└── layout.tsx
```

**Protected Route Middleware**:
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken');
  
  if (!token && request.nextUrl.pathname.startsWith('/recipes')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

---

## Persona 4: Frontend Developer

### Role Definition
**Responsibility**: Implement UI components and forms  
**Key Deliverables**: React components, Formik forms, Shadcn/UI integration  
**Technology Focus**: React 18, Formik, Yup, Tailwind CSS, Shadcn/UI

### Form Implementation Pattern

#### Formik + Yup + Shadcn
```typescript
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const RecipeSchema = Yup.object({
  title: Yup.string().min(3).max(200).required('Title is required'),
  cookingTimeMinutes: Yup.number().positive().integer().required(),
});

function RecipeForm() {
  const [createRecipe] = useCreateRecipeMutation();

  return (
    <Formik
      initialValues={{ title: '', cookingTimeMinutes: 30 }}
      validationSchema={RecipeSchema}
      onSubmit={async (values, { setSubmitting }) => {
        await createRecipe(values).unwrap();
        setSubmitting(false);
      }}
    >
      {({ errors, touched, isSubmitting }) => (
        <Form className="space-y-4">
          <div>
            <Input name="title" placeholder="Recipe title" />
            {errors.title && touched.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Recipe'}
          </Button>
        </Form>
      )}
    </Formik>
  );
}
```

### Input Masking
```typescript
import InputMask from 'react-input-mask';

function CookingTimeInput() {
  return (
    <InputMask mask="99:99" placeholder="HH:MM">
      {(inputProps) => <Input {...inputProps} />}
    </InputMask>
  );
}
```

### Shadcn/UI Component Usage
**Installation**:
```bash
npx shadcn-ui@latest add button input card dialog
```

**Usage**:
```typescript
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{recipe.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{recipe.cookingTimeMinutes} minutes</p>
      </CardContent>
    </Card>
  );
}
```

### Responsive Design Patterns
```typescript
// Mobile-first Tailwind classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Auto-adjusts: 1 col mobile, 2 tablet, 3 desktop */}
</div>

// Conditional rendering
<div className="hidden md:block">Desktop-only content</div>
<div className="block md:hidden">Mobile-only content</div>
```

---

## Persona 5: DevOps Engineer

### Role Definition
**Responsibility**: Configure Docker, CI/CD, and monitoring  
**Key Deliverables**: docker-compose.yml, GitHub Actions workflows, Prometheus setup  
**Technology Focus**: Docker, Docker Swarm, GitHub Actions, Prometheus, Grafana

### Docker Multi-Stage Build
```dockerfile
# Backend Dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npx prisma generate

FROM node:22-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 4000
CMD ["node", "dist/server.js"]
```

### Docker Compose Configuration
```yaml
# docker-compose.yml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: cooksuite
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: cooksuite
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U cooksuite"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://cooksuite:${DB_PASSWORD}@postgres:5432/cooksuite
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "4000:4000"
    volumes:
      - media_uploads:/app/uploads

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: http://backend:4000
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
  media_uploads:
```

### GitHub Actions CI/CD
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Check coverage threshold
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "Coverage $COVERAGE% is below 80%"
            exit 1
          fi

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker build -t cooksuite:${{ github.sha }} .
```

### Prometheus Metrics
```typescript
// middleware/metrics.ts
import promClient from 'prom-client';

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

export const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.labels(req.method, req.route?.path || req.path, res.statusCode).observe(duration);
  });
  next();
};
```

---

## Persona 6: QA Engineer

### Role Definition
**Responsibility**: Design test strategy and implement tests  
**Key Deliverables**: Unit tests, integration tests, E2E tests, coverage reports  
**Technology Focus**: Jest, React Testing Library, Supertest, Playwright

### Test Structure

#### Unit Test (Service Layer)
```typescript
// services/__tests__/RecipeService.test.ts
import { RecipeService } from '../RecipeService';
import { mockRecipeRepository } from '@/test/mocks';

describe('RecipeService', () => {
  let recipeService: RecipeService;

  beforeEach(() => {
    recipeService = new RecipeService(mockRecipeRepository);
  });

  describe('createRecipe', () => {
    it('should create recipe with valid data', async () => {
      const input = {
        title: 'Spaghetti Carbonara',
        cookingTimeMinutes: 30,
        difficulty: 'Medium' as const,
      };

      const result = await recipeService.createRecipe(input, 'user-123');

      expect(result).toHaveProperty('id');
      expect(result.title).toBe('Spaghetti Carbonara');
      expect(mockRecipeRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-123' })
      );
    });

    it('should throw ValidationError for invalid title', async () => {
      const input = { title: 'ab', cookingTimeMinutes: 30, difficulty: 'Easy' as const };

      await expect(recipeService.createRecipe(input, 'user-123')).rejects.toThrow(ValidationError);
    });
  });
});
```

#### Integration Test (API Endpoint)
```typescript
// controllers/__tests__/RecipeController.integration.test.ts
import request from 'supertest';
import app from '@/app';
import { prisma } from '@/lib/prisma';

describe('POST /api/v1/recipes', () => {
  let authToken: string;

  beforeAll(async () => {
    // Create test user and get auth token
    const user = await prisma.user.create({ data: { email: 'test@example.com', passwordHash: '...' } });
    authToken = generateTestToken(user.id);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create recipe when authenticated', async () => {
    const response = await request(app)
      .post('/api/v1/recipes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Recipe',
        cookingTimeMinutes: 45,
        difficulty: 'Easy',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
  });

  it('should return 401 without auth token', async () => {
    const response = await request(app)
      .post('/api/v1/recipes')
      .send({ title: 'Test' });

    expect(response.status).toBe(401);
  });
});
```

#### React Component Test
```typescript
// components/__tests__/RecipeCard.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecipeCard } from '../RecipeCard';

describe('RecipeCard', () => {
  const mockRecipe = {
    id: '123',
    title: 'Pancakes',
    cookingTimeMinutes: 20,
    difficulty: 'Easy',
  };

  it('renders recipe title and cooking time', () => {
    render(<RecipeCard recipe={mockRecipe} />);

    expect(screen.getByText('Pancakes')).toBeInTheDocument();
    expect(screen.getByText('20 minutes')).toBeInTheDocument();
  });

  it('calls onDelete when delete button clicked', async () => {
    const mockOnDelete = jest.fn();
    render(<RecipeCard recipe={mockRecipe} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('123');
  });
});
```

### Coverage Thresholds
```json
// jest.config.js
{
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

---

## Persona 7: Security Engineer

### Role Definition
**Responsibility**: Implement authentication, authorization, and security hardening  
**Key Deliverables**: JWT service, RBAC middleware, security middleware (Helmet, CORS, rate limiting)  
**Technology Focus**: JWT, bcrypt, Helmet.js, express-rate-limit

### JWT Implementation
```typescript
// services/AuthService.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export class AuthService {
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';
  private readonly BCRYPT_ROUNDS = 12;

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.BCRYPT_ROUNDS);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateAccessToken(userId: string, permissions: string[]): string {
    return jwt.sign(
      { userId, permissions, type: 'access' },
      process.env.JWT_SECRET!,
      { expiresIn: this.ACCESS_TOKEN_EXPIRY }
    );
  }

  generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: this.REFRESH_TOKEN_EXPIRY }
    );
  }

  verifyAccessToken(token: string): { userId: string; permissions: string[] } {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (payload.type !== 'access') {
      throw new Error('Invalid token type');
    }
    return { userId: payload.userId, permissions: payload.permissions };
  }
}
```

### Security Middleware Stack
```typescript
// app.ts
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 requests per hour
  message: 'Too many requests, please try again later',
});
app.use('/api/', limiter);

// CSRF protection for state-changing operations
import csurf from 'csurf';
const csrfProtection = csurf({ cookie: true });
app.post('/api/v1/*', csrfProtection);
```

### RBAC Permission Checking
```typescript
// middleware/checkPermission.ts
export async function checkUserPermission(userId: string, permission: string): Promise<boolean> {
  const [resource, action] = permission.split(':'); // e.g., "recipe:create"

  const userPermissions = await prisma.permission.findMany({
    where: {
      rolePermissions: {
        some: {
          role: {
            userRoles: {
              some: { userId }
            }
          }
        }
      },
      resource,
      action,
    },
  });

  return userPermissions.length > 0;
}
```

---

## Persona 8: Database Administrator

### Role Definition
**Responsibility**: Optimize database schema and queries  
**Key Deliverables**: Prisma migrations, indexes, query optimization  
**Technology Focus**: PostgreSQL 16, Prisma ORM, SQL optimization

### Index Strategy
```prisma
// prisma/schema.prisma
model Recipe {
  id        String   @id @default(uuid())
  title     String
  userId    String
  categoryId String?
  
  // Full-text search
  searchVector Unsupported("tsvector")?

  @@index([userId])
  @@index([categoryId])
  @@index([searchVector], type: Gin) // Full-text search index
  @@index([createdAt(sort: Desc)]) // Sorting by recent
}
```

### Migration Safety
```sql
-- migrations/20260502_add_deleted_at.sql
-- Add deleted_at column with default NULL (safe for existing rows)
ALTER TABLE recipes ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Create index concurrently (no table lock)
CREATE INDEX CONCURRENTLY idx_recipes_deleted ON recipes(deleted_at) WHERE deleted_at IS NULL;
```

### Query Optimization
```typescript
// ❌ WRONG: N+1 query problem
async function getRecipesWithIngredients() {
  const recipes = await prisma.recipe.findMany();
  for (const recipe of recipes) {
    recipe.ingredients = await prisma.ingredient.findMany({ where: { recipeId: recipe.id } });
  }
}

// ✅ CORRECT: Single query with join
async function getRecipesWithIngredients() {
  return prisma.recipe.findMany({
    include: { ingredients: true },
  });
}
```

---

## Cross-Persona Collaboration Examples

### Example 1: Implementing Shopping List Aggregation

**Phase 1**: Backend Architect designs interface
```typescript
interface IShoppingListService {
  aggregate(recipeIds: string[]): Promise<AggregatedIngredient[]>;
}
```

**Phase 2**: Backend Developer implements service
```typescript
class ShoppingListService implements IShoppingListService {
  async aggregate(recipeIds: string[]): Promise<AggregatedIngredient[]> {
    const recipes = await this.recipeRepo.findMany(recipeIds);
    return this.mergeIngredients(recipes.flatMap(r => r.ingredients));
  }
}
```

**Phase 3**: QA Engineer writes tests
```typescript
it('should merge ingredients with same unit', async () => {
  const result = await service.aggregate(['recipe1', 'recipe2']);
  const flour = result.find(i => i.name === 'flour');
  expect(flour?.quantity).toBe(500); // 200g + 300g
});
```

**Phase 4**: Frontend Developer integrates
```typescript
function ShoppingListGenerator() {
  const [aggregateList] = useAggregateShoppingListMutation();
  const handleGenerate = async (recipeIds: string[]) => {
    const list = await aggregateList(recipeIds).unwrap();
    // Display list...
  };
}
```

---

## Persona Activation Examples

### Task: "Implement user registration with RBAC"

**Step 1**: Activate **Backend Architect**
- Design: User, Role, Permission, RolePermission tables
- API contract: `POST /api/v1/auth/register`

**Step 2**: Activate **Security Engineer**
- Implement password hashing (bcrypt)
- JWT generation on successful registration
- Assign default "user" role

**Step 3**: Activate **Backend Developer**
- Implement RegisterController and AuthService
- Input validation with Zod

**Step 4**: Activate **QA Engineer**
- Write unit tests for password hashing
- Integration test for registration endpoint
- Edge case: duplicate email

**Step 5**: Activate **Frontend Developer**
- Create RegisterForm with Formik
- Handle errors (duplicate email, weak password)

---

## Persona-Specific Resources

### Backend Architect
- **Reading**: Clean Architecture (Robert C. Martin), Domain-Driven Design
- **Tools**: Prisma Studio, Postman/Insomnia for API testing

### Backend Developer
- **Reading**: Node.js Best Practices, Express.js docs
- **Tools**: Nodemon, ts-node-dev for hot reload

### Frontend Architect
- **Reading**: React docs, Redux Toolkit docs
- **Tools**: React DevTools, Redux DevTools

### Frontend Developer
- **Reading**: Shadcn/UI docs, Tailwind CSS docs
- **Tools**: Storybook for component development

### DevOps Engineer
- **Reading**: Docker docs, GitHub Actions docs
- **Tools**: Docker Desktop, k9s (Kubernetes dashboard)

### QA Engineer
- **Reading**: Jest docs, Testing Library docs
- **Tools**: Jest Coverage reports, Codecov

### Security Engineer
- **Reading**: OWASP Top 10, JWT best practices
- **Tools**: OWASP ZAP, Snyk for vulnerability scanning

### Database Administrator
- **Reading**: PostgreSQL docs, Prisma optimization guide
- **Tools**: pgAdmin, EXPLAIN ANALYZE for query profiling

---

**Document Version**: 1.0  
**Last Updated**: May 2, 2026  
**Usage**: Reference this document before each development task to activate the appropriate persona context.