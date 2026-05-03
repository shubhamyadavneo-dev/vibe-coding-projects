# Cooksuite - Project Scope Document

## Project Overview
**Application Name**: Cooksuite  
**Tech Stack**: Next.js 15, Express 5, PostgreSQL 16, Node.js 22  
**Architecture**: Monorepo with separate frontend (Next.js) and backend (Express API)  
**Development Approach**: Test-Driven Development (TDD) with ≥80% coverage  
**Design Pattern**: SOLID Principles, DRY, Repository Pattern, Service Layer Architecture

---

## Phase Breakdown (POC → Production)

### **Phase 1: POC/MVP - Core Authentication & Recipe Management**
**Timeline**: Days 1-2  
**Goal**: Functional authentication system with RBAC, basic recipe CRUD, and foundational architecture

#### Features:
1. **User Management (Complete RBAC Implementation)**
   - User registration with email/password
   - User login with JWT authentication
   - Password hashing with bcrypt
   - **RBAC System**:
     - `roles` table (id, name, description)
     - `permissions` table (id, name, resource, action)
     - `role_permissions` junction table
     - Middleware for permission checking
     - Default roles: `admin`, `user`, `viewer`
     - Default permissions: `recipe:create`, `recipe:read`, `recipe:update`, `recipe:delete`, `cookbook:create`, `cookbook:share`, etc.
   - Profile management (view/update)
   - Session management with refresh tokens
   - **TDD Coverage**: 100% for auth flows and RBAC middleware

2. **Recipe Management (Core CRUD)**
   - Create recipe (title, ingredients, instructions, cooking time, difficulty)
   - Read/View recipe details
   - Update recipe (only if user has `recipe:update` permission)
   - Delete recipe (only if user has `recipe:delete` permission)
   - Recipe categories (Breakfast, Lunch, Dinner, Dessert, Snacks)
   - **Media Service** (abstraction layer for future cloud migration):
     - Interface: `IMediaStorageService`
     - Implementation: `LocalFileStorageService` (saves to Docker volume)
     - Methods: `upload()`, `delete()`, `getUrl()`
   - Recipe image upload (single image per recipe)
   - **TDD Coverage**: ≥80% for recipe service and controllers

3. **Database Schema (Prisma ORM)**
   - Users table
   - Roles table
   - Permissions table
   - RolePermissions junction table
   - UserRoles junction table (many-to-many: users can have multiple roles)
   - Recipes table
   - Categories table
   - RecipeImages table
   - Prisma migrations with seeding scripts

4. **API Layer**
   - RESTful endpoints: `/api/v1/auth/*`, `/api/v1/recipes/*`, `/api/v1/users/*`
   - CORS configuration
   - Request validation middleware (express-validator)
   - Error handling middleware (centralized)
   - Response standardization (success/error format)

5. **Frontend (Next.js)**
   - Shadcn/UI component library setup
   - Redux Toolkit store configuration
   - Auth pages: Login, Register, Profile
   - Recipe pages: List, Create, Edit, View
   - Formik forms with Yup validation
   - Input masking for cooking time (HH:MM format)
   - Responsive layout (mobile-first)
   - Protected routes with permission checks

6. **Testing Infrastructure**
   - Jest configuration for backend
   - React Testing Library for frontend
   - Supertest for API integration tests
   - Test database setup (separate from dev DB)
   - CI pipeline setup (GitHub Actions) - basic
   - Coverage reporting (≥80% threshold)

7. **Docker Configuration**
   - `docker-compose.yml` with:
     - PostgreSQL 16 service
     - Backend service (Express)
     - Frontend service (Next.js dev server)
     - Shared volume for media files
   - Environment variable management (`.env.example`)
   - Database volume persistence

#### Deliverables:
- ✅ Fully functional RBAC system with TDD
- ✅ Recipe CRUD with image upload
- ✅ User authentication (register, login, profile)
- ✅ Docker Compose setup
- ✅ API documentation (Swagger/OpenAPI basic setup)
- ✅ Test coverage ≥80%

#### **Moved to Phase 2** (to prioritize RBAC):
- Advanced search and filtering
- Shopping list generation

---

### **Phase 2: Cookbook Organization & Search/Filter**
**Timeline**: Day 3  
**Goal**: Enable users to organize recipes into cookbooks and implement intelligent search

#### Features:
1. **Cookbook Management**
   - Create named cookbooks (requires `cookbook:create` permission)
   - Add/remove recipes to/from cookbooks (many-to-many relationship)
   - View cookbook with all recipes
   - Update cookbook details (name, description)
   - Delete cookbook (requires `cookbook:delete` permission)
   - Cookbook ownership (user-specific)

2. **Search & Filtering System**
   - Full-text search across recipe titles, ingredients, instructions (PostgreSQL `tsvector`)
   - Filter by category
   - Filter by cooking time ranges (<30min, 30-60min, >60min)
   - Filter by difficulty (Easy, Medium, Hard)
   - Combined filters (advanced search)
   - Search result relevance scoring
   - Pagination (cursor-based for scalability)

3. **Shopping List Generation (MVP)**
   - Select multiple recipes
   - Aggregate ingredients with basic merging
   - **Unit normalization** (Phase 2 handles same-unit aggregation only):
     - "200g flour" + "300g flour" = "500g flour" ✅
     - "1 cup flour" + "2 cups flour" = "3 cups flour" ✅
     - "200g flour" + "1 cup flour" = separate items (conversion in Phase 3) ⚠️
   - Supported units: g, kg, ml, l, tsp, tbsp, cup
   - Group by ingredient name (case-insensitive)
   - Export as plain text

4. **Database Updates**
   - Cookbooks table
   - CookbookRecipes junction table
   - ShoppingLists table
   - ShoppingListItems table
   - Ingredients table (normalized)
   - RecipeIngredients junction table with quantity/unit fields

5. **Frontend Enhancements**
   - Cookbook pages: List, Create, View
   - Search interface with filter dropdowns
   - Shopping list generation UI
   - Checkbox selection for multiple recipes
   - Shopping list display with grouping

6. **Testing**
   - Unit tests for search/filter logic
   - Integration tests for cookbook APIs
   - E2E tests for shopping list generation flow (Playwright - optional)

#### Deliverables:
- ✅ Cookbook CRUD functionality
- ✅ Advanced search with filters
- ✅ Basic shopping list aggregation
- ✅ PostgreSQL full-text search index
- ✅ Updated API documentation

---

### **Phase 3: Meal Planning & Sharing with Unit Conversion**
**Timeline**: Day 4  
**Goal**: Weekly meal planner with drag-and-drop, cookbook sharing, and intelligent unit conversion

#### Features:
1. **Meal Planning Calendar**
   - Weekly calendar view (7 days)
   - 4 meal slots per day: Breakfast, Lunch, Dinner, Snacks
   - Drag-and-drop recipes from library to calendar slots
   - Remove recipes from calendar
   - View nutritional summary (estimated - static data, no API)
   - Auto-generate shopping list from entire week's plan
   - Save/load meal plans

2. **Cookbook Sharing (RBAC Integration)**
   - Generate shareable link with expiration (JWT-based token)
   - Assign role to shared link (`viewer` or `editor`)
   - View-only access: Can see recipes, cannot edit
   - Editor access: Can add/remove recipes, cannot delete cookbook
   - Revoke share links
   - Track share link usage (view count)

3. **Advanced Shopping List (Unit Conversion)**
   - **Ingredient Parser**:
     - Extract quantity, unit, ingredient name from natural language
     - Example: "2 cups all-purpose flour" → `{ qty: 2, unit: 'cup', name: 'all-purpose flour' }`
   - **Unit Conversion Engine**:
     - Library: `convert-units` or custom conversion maps
     - Metric ↔ Imperial: g/kg ↔ oz/lb (weight)
     - Volume: ml/l ↔ tsp/tbsp/cup
     - **Conversion rules**:
       - 1 cup = 240ml
       - 1 tbsp = 15ml
       - 1 tsp = 5ml
       - 1 kg = 1000g
       - 1 lb = 16oz
     - Merge "200g flour" + "1 cup flour" → convert to grams → "440g flour" (assuming 1 cup flour = 240g)
   - Group by store aisle (manual categorization: Produce, Dairy, Meat, Pantry, etc.)
   - Mark items as purchased (checklist)
   - Export as PDF (using `jsPDF` or Puppeteer)

4. **Database Updates**
   - MealPlans table
   - MealPlanRecipes table (with date and meal_type fields)
   - CookbookShares table (share_token, role_id, expires_at)
   - UnitConversions table (from_unit, to_unit, multiplier)
   - IngredientCategories table (for aisle grouping)

5. **Frontend Features**
   - Drag-and-drop calendar (React DnD or dnd-kit)
   - Share modal with role selection
   - Shopping list with aisle grouping UI
   - PDF export button
   - Nutritional summary dashboard (basic calculation)

6. **Testing**
   - Unit tests for unit conversion logic (100% coverage)
   - Integration tests for meal plan APIs
   - RBAC tests for shared cookbook permissions

#### Deliverables:
- ✅ Weekly meal planner with drag-and-drop
- ✅ Cookbook sharing with role-based access
- ✅ Intelligent shopping list with unit conversion
- ✅ PDF export for shopping lists
- ✅ Aisle-based grouping

---

### **Phase 4: Production Hardening & Performance Optimization**
**Timeline**: Day 5  
**Goal**: Production-ready deployment with caching, monitoring, and security hardening

#### Features:
1. **Performance Optimization**
   - **Redis Caching Layer**:
     - Cache frequently accessed recipes (TTL: 1 hour)
     - Cache search results (TTL: 10 minutes)
     - Cache user permissions (TTL: 5 minutes)
   - Database query optimization:
     - PostgreSQL indexes on `recipes.title`, `recipes.category_id`
     - GIN index for full-text search
     - Compound index on `cookbooks.user_id`
   - API response compression (gzip)
   - Image optimization (Sharp for resizing on upload)
   - Lazy loading for recipe images (Next.js Image component)

2. **Security Hardening**
   - Helmet.js for HTTP headers
   - Rate limiting (express-rate-limit): 100 req/hour per IP for non-authenticated endpoints
   - SQL injection prevention (Prisma parameterized queries)
   - XSS protection (DOMPurify on frontend)
   - CSRF tokens for state-changing operations
   - Secure cookie configuration (httpOnly, secure, sameSite)
   - Environment variable validation (Joi schema)
   - Dependency security audit (npm audit, Snyk)

3. **Monitoring & Logging**
   - **Prometheus** metrics:
     - API request count/duration
     - Database connection pool usage
     - Redis hit/miss rate
   - **Grafana** dashboards:
     - KPI tracking (from PRD metrics)
     - Real-time performance graphs
   - **Winston** logger:
     - Structured JSON logs
     - Log levels: error, warn, info, debug
     - Log rotation (daily files)
   - Error tracking (Sentry integration - optional)

4. **CI/CD Pipeline (GitHub Actions)**
   - Automated testing on PR
   - Linting (ESLint, Prettier)
   - Build verification
   - Docker image build and push to registry
   - Automated deployment to staging
   - Production deployment (manual approval)

5. **Production Docker Setup**
   - Multi-stage Dockerfile (build + runtime)
   - Docker Swarm configuration (as per PRD)
   - Health checks for all services
   - Auto-restart policies
   - Resource limits (CPU/memory)
   - Secrets management (Docker secrets)

6. **Documentation**
   - Complete API documentation (Swagger UI)
   - Deployment guide (README.md)
   - Environment variables guide
   - Database migration guide
   - User manual (basic)
   - Code documentation (JSDoc for critical functions)

7. **Print Stylesheet**
   - CSS media query for `@media print`
   - Hide navigation, buttons, footers
   - Show only recipe content
   - Page break optimization

8. **Final Testing**
   - Load testing (Artillery or k6): 5000 concurrent users
   - Security testing (OWASP ZAP scan)
   - Accessibility testing (Lighthouse CI)
   - Cross-browser testing (Chrome, Firefox, Safari, Edge)
   - Mobile responsiveness testing (320px, 768px, 1024px+)

#### Deliverables:
- ✅ Redis caching implemented
- ✅ Prometheus + Grafana monitoring
- ✅ Production Docker Swarm setup
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Complete documentation
- ✅ Security hardened (Helmet, rate limiting, etc.)
- ✅ Performance targets met (TTI <3s, API p95 <500ms)
- ✅ Print-friendly recipe view

---

## Success Criteria Mapping to Phases

| KPI Category | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|-------------|---------|---------|---------|---------|
| User Management (RBAC) | ✅ Complete | - | Share permissions | - |
| Recipe Management | ✅ CRUD | - | - | Performance |
| Cookbook Organization | - | ✅ Complete | Sharing | - |
| Search & Filtering | - | ✅ Complete | - | Caching |
| Shopping List | - | ✅ Basic | ✅ Advanced (units) | PDF export |
| Meal Planning | - | - | ✅ Complete | - |
| Responsive Design | ✅ Mobile-first | - | - | ✅ Print CSS |
| Docker & Deployment | ✅ Dev setup | - | - | ✅ Production |
| Testing | ✅ TDD (80%) | ≥80% | ≥80% | ✅ Load testing |

---

## Non-Functional Requirements Across All Phases

### Scalability
- Stateless API design (horizontal scaling ready)
- Database connection pooling (max 20 connections)
- Redis for session storage (Phase 4)
- CDN-ready for media files (interface already abstracted)

### Maintainability
- Code comments for complex logic (aggregation engine, RBAC middleware)
- Consistent naming conventions (camelCase JS, snake_case DB)
- Git branching strategy: `main`, `develop`, `feature/*`, `hotfix/*`
- PR template with checklist

### Reliability
- Database migrations with rollback scripts
- Automated backups (PostgreSQL volume snapshots)
- Graceful degradation (if Redis down, bypass cache)
- Error boundaries in React components

---

## Technology Stack Summary

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: Shadcn/UI + Tailwind CSS
- **State Management**: Redux Toolkit + RTK Query
- **Forms**: Formik + Yup
- **Input Masking**: react-input-mask
- **Drag-and-Drop**: dnd-kit
- **Charts**: Recharts (for nutritional summary)
- **Testing**: Jest + React Testing Library

### Backend
- **Framework**: Express 5
- **Runtime**: Node.js 22
- **Database**: PostgreSQL 16 (Dockerized)
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Caching**: Redis (Phase 4)
- **File Upload**: Multer
- **Validation**: express-validator
- **Testing**: Jest + Supertest

### DevOps
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Docker Swarm
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: Winston

---

## Exclusions (Non-Goals for All Phases)
- ❌ Mobile native apps (PWA only)
- ❌ Grocery delivery integration
- ❌ Recipe URL scraping
- ❌ External nutritional APIs (USDA)
- ❌ Voice input
- ❌ Barcode scanning
- ❌ Social feed/comments
- ❌ Offline mode (full PWA)
- ❌ Multi-language support
- ❌ Subscription billing
- ❌ WebSockets (polling for real-time if needed)

---

## Phase Dependencies

```
Phase 1 (POC/MVP)
    ↓
Phase 2 (Cookbooks + Search)
    ↓
Phase 3 (Meal Planning + Sharing)
    ↓
Phase 4 (Production Hardening)
```

**Critical Path**: RBAC implementation in Phase 1 is prerequisite for all sharing features in Phase 3.

---

**Document Version**: 1.0  
**Last Updated**: May 2, 2026  
**Next Review**: After Phase 1 completion