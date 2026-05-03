# Cooksuite - Token Budget & Context Management Strategy

## Overview
This document defines the token allocation strategy for AI-assisted development using Claude/GPT models. The goal is to maximize development efficiency while staying within context limits across 4 development phases.

---

## Token Budget Allocation

### Total Budget: 190,000 tokens (per PRD context window)

#### Phase-Wise Allocation

| Phase | Allocated Tokens | Purpose | Priority |
|-------|-----------------|---------|----------|
| **Phase 1: POC/MVP** | 60,000 tokens | RBAC + Recipe CRUD + Docker | 🔴 Critical |
| **Phase 2: Cookbooks** | 45,000 tokens | Cookbook + Search + Shopping List | 🟡 High |
| **Phase 3: Meal Planning** | 50,000 tokens | Calendar + Sharing + Unit Conversion | 🟡 High |
| **Phase 4: Production** | 35,000 tokens | Optimization + Monitoring + Docs | 🟢 Medium |

**Buffer**: Reserved 10% (19,000 tokens) for cross-phase clarifications and bug fixes.

---

## Token Consumption Breakdown

### Phase 1: POC/MVP (60,000 tokens)

#### Initial Context Loading (15,000 tokens)
- **Project Scope** (project_scope.md): ~4,000 tokens
- **Constraints** (project_constraints.md): ~5,000 tokens
- **PRD** (full document): ~3,500 tokens
- **KPI Spec**: ~2,500 tokens

#### Development Tasks (40,000 tokens)

| Task | Estimated Tokens | Deliverables |
|------|-----------------|--------------|
| **RBAC System Design** | 8,000 | Prisma schema, middleware, tests |
| **Auth Implementation** | 7,000 | JWT service, controllers, validation |
| **Recipe CRUD APIs** | 6,000 | Express routes, services, DTOs |
| **Media Storage Service** | 5,000 | `IMediaStorageService` interface, local impl |
| **Frontend Auth Pages** | 6,000 | Login, Register, Profile (Formik + Shadcn) |
| **Frontend Recipe Pages** | 8,000 | List, Create, Edit, View (with image upload) |

#### Testing & Debugging (5,000 tokens)
- Unit test generation: 2,500 tokens
- Integration test setup: 1,500 tokens
- Bug fixes and refinements: 1,000 tokens

---

### Phase 2: Cookbooks & Search (45,000 tokens)

#### Context Refresh (10,000 tokens)
- Re-load Phase 1 deliverables (schema, API structure): 5,000 tokens
- Phase 2 scope from project_scope.md: 3,000 tokens
- Updated constraints: 2,000 tokens

#### Development Tasks (30,000 tokens)

| Task | Estimated Tokens | Deliverables |
|------|-----------------|--------------|
| **Cookbook Schema & APIs** | 7,000 | Prisma models, CRUD endpoints |
| **PostgreSQL Full-Text Search** | 6,000 | GIN index, tsvector, search API |
| **Advanced Filtering** | 5,000 | Query builder, filter combinations |
| **Shopping List Aggregation** | 8,000 | Ingredient parser, basic merging logic |
| **Frontend Cookbook UI** | 4,000 | Cookbook pages (Shadcn cards) |

#### Testing (5,000 tokens)
- Search relevance tests: 2,000 tokens
- Shopping list aggregation tests: 3,000 tokens

---

### Phase 3: Meal Planning & Sharing (50,000 tokens)

#### Context Refresh (12,000 tokens)
- Re-load Phase 1-2 schemas: 6,000 tokens
- Phase 3 scope: 4,000 tokens
- RBAC permission updates: 2,000 tokens

#### Development Tasks (33,000 tokens)

| Task | Estimated Tokens | Deliverables |
|------|-----------------|--------------|
| **Meal Planning Schema** | 5,000 | MealPlans, MealPlanRecipes tables |
| **Drag-and-Drop Calendar** | 8,000 | React DnD setup, calendar component |
| **Cookbook Sharing** | 7,000 | Share tokens, RBAC integration |
| **Unit Conversion Engine** | 9,000 | Conversion maps, parser enhancements |
| **PDF Export** | 4,000 | Shopping list PDF generation |

#### Testing (5,000 tokens)
- Unit conversion accuracy tests (100% coverage): 3,000 tokens
- RBAC permission tests for shared cookbooks: 2,000 tokens

---

### Phase 4: Production Hardening (35,000 tokens)

#### Context Refresh (8,000 tokens)
- Re-load critical services: 4,000 tokens
- Performance constraints: 2,000 tokens
- Deployment checklist: 2,000 tokens

#### Development Tasks (22,000 tokens)

| Task | Estimated Tokens | Deliverables |
|------|-----------------|--------------|
| **Redis Caching** | 5,000 | Cache service, TTL configs |
| **Prometheus Metrics** | 4,000 | Custom metrics, Grafana dashboard |
| **Docker Swarm Config** | 3,000 | docker-compose.prod.yml, health checks |
| **CI/CD Pipeline** | 5,000 | GitHub Actions workflows |
| **Security Hardening** | 3,000 | Helmet, rate limiting, CSRF |
| **Print Stylesheet** | 2,000 | CSS media queries |

#### Documentation (5,000 tokens)
- API docs (Swagger): 2,000 tokens
- Deployment guide: 2,000 tokens
- User manual: 1,000 tokens

---

## Context Management Strategy

### Problem: Context Window Overflow
**Challenge**: As codebase grows, re-loading entire context exceeds token limits.

### Solution: Incremental Context Loading

#### 1. **Core Context** (Always Loaded)
- `project_scope.md` (current phase section only): ~1,500 tokens
- `project_constraints.md` (relevant sections): ~2,000 tokens
- `persona.md` (role-specific guidance): ~800 tokens

**Total Core**: ~4,300 tokens

---

#### 2. **Phase-Specific Context** (Loaded per Phase)

##### Phase 1
```
Core Context (4,300)
+ Prisma Schema (2,000)
+ RBAC Middleware (1,500)
+ API Structure (Express boilerplate) (1,200)
= 9,000 tokens
```

##### Phase 2
```
Core Context (4,300)
+ Phase 1 Schema (summarized) (1,500)
+ Search API Spec (1,000)
+ Shopping List Logic (2,000)
= 8,800 tokens
```

##### Phase 3
```
Core Context (4,300)
+ Phase 1-2 Schema (summarized) (2,500)
+ Unit Conversion Maps (1,500)
+ RBAC Permission Matrix (1,000)
= 9,300 tokens
```

##### Phase 4
```
Core Context (4,300)
+ Full Schema Reference (3,000)
+ Performance Benchmarks (1,500)
+ Security Checklist (1,000)
= 9,800 tokens
```

---

### 3. **On-Demand Context Injection**

When AI needs additional context mid-development:

**Trigger Phrases**:
- "Show me the [X] schema" → Load specific Prisma model (200-500 tokens)
- "Remind me of RBAC rules" → Load constraints section (~800 tokens)
- "What's the API response format?" → Load API constraints (~300 tokens)

**Example Workflow**:
```
Developer: "Create the RecipeService with unit tests"
AI: Loads core context (4,300) + RecipeService spec (1,200) = 5,500 tokens
AI: Generates code (uses ~8,000 tokens)
Total: 13,500 tokens (within Phase 1 budget)
```

---

## Token Optimization Techniques

### 1. **Summarization for Prior Phases**
Instead of re-loading full code from Phase 1 in Phase 3:

**Full Schema** (2,000 tokens):
```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  password_hash String
  // ... 20 more fields
}
```

**Summarized Schema** (300 tokens):
```
User: id, email, password_hash, roles (many-to-many)
Recipe: id, title, user_id, ingredients[], instructions[], category_id
Role: id, name, permissions (many-to-many)
Permission: id, name, resource, action
```

**Savings**: ~1,700 tokens per phase

---

### 2. **Code Compression for Examples**
When providing code examples in prompts:

**Verbose** (1,500 tokens):
```javascript
// Full implementation with comments and error handling
async function aggregateIngredients(recipeIds) {
  try {
    // Fetch all recipes
    const recipes = await prisma.recipe.findMany({
      where: { id: { in: recipeIds } },
      include: { ingredients: true }
    });
    // ... 30 more lines
  } catch (error) {
    // ... error handling
  }
}
```

**Compressed** (400 tokens):
```javascript
// Aggregation logic:
// 1. Fetch recipes with ingredients
// 2. Group by ingredient name (case-insensitive)
// 3. Sum quantities for same units
// See: /docs/shopping-list-spec.md for full logic
```

**Savings**: ~1,100 tokens

---

### 3. **External Reference Documents**
Store detailed specs in separate files, load only when needed:

**Main Prompt**: "Implement unit conversion per `/docs/unit-conversion-spec.md`"  
**Spec File** (loaded on-demand): 2,500 tokens

**Alternative** (all in prompt): 6,000 tokens  
**Savings**: 3,500 tokens

---

## AI Persona Token Allocation

### Persona-Specific Context (from persona.md)

| Persona | Token Allocation | Loaded Context |
|---------|-----------------|----------------|
| **Backend Architect** | 2,000 tokens | SOLID principles, Prisma best practices, Express middleware patterns |
| **Frontend Developer** | 1,800 tokens | Shadcn components, Redux Toolkit slicing, Formik patterns |
| **DevOps Engineer** | 1,500 tokens | Docker multi-stage builds, CI/CD pipeline structure |
| **QA Engineer** | 1,200 tokens | Jest matchers, React Testing Library queries, coverage thresholds |

**Total Persona Context**: ~6,500 tokens (loaded based on current task)

---

## Context Rotation Strategy

### Problem: Long conversations exceed limits

### Solution: Session Checkpoints

Every 10,000 tokens of conversation:
1. **Save State**: Export current schema, completed tasks, blockers
2. **Reset Context**: Start new chat session
3. **Load Checkpoint**: Re-inject saved state (compressed summary)

**Example Checkpoint** (Phase 1, after RBAC implementation):
```markdown
## Completed:
- ✅ Prisma schema (users, roles, permissions, role_permissions)
- ✅ RBAC middleware (`requirePermission()`)
- ✅ Auth controllers (register, login, refresh)
- ✅ 12 unit tests (100% coverage for RBAC)

## In Progress:
- RecipeService (50% done, need aggregation logic)

## Blockers:
- None

## Schema Summary:
[Compressed schema - 500 tokens]

## Next Task:
Complete RecipeService.aggregateIngredients() with tests
```

**Token Savings**: Checkpoint (2,000 tokens) vs. Full History (15,000 tokens) = 13,000 saved

---

## Token Metrics & Monitoring

### Track Token Usage Per Task

**Log Format**:
```
Task: RBAC Middleware Implementation
Input Tokens: 5,200 (context) + 800 (prompt)
Output Tokens: 3,500 (code + tests)
Total: 9,500 tokens
Remaining Phase 1 Budget: 50,500 tokens
```

**Alert Thresholds**:
- ⚠️ Warning: 80% of phase budget consumed
- 🔴 Critical: 95% of phase budget consumed (requires context pruning)

---

## Emergency Token Budget

### Buffer Allocation: 19,000 tokens

**Reserved For**:
1. **Critical Bug Fixes** (8,000 tokens):
   - Production hotfixes that require full context reload
2. **Cross-Phase Refactoring** (6,000 tokens):
   - Schema changes that impact multiple phases
3. **Security Patches** (3,000 tokens):
   - Urgent dependency updates, vulnerability fixes
4. **Client Clarifications** (2,000 tokens):
   - Scope changes, requirement clarifications

**Access Control**: Requires explicit approval before using buffer.

---

## Best Practices for Token Efficiency

### 1. **Lazy Loading**
Don't load entire schema if task only touches one table:
```
❌ Load all 15 Prisma models (4,000 tokens)
✅ Load only User + Role models (800 tokens)
```

### 2. **Incremental Code Generation**
Generate code in chunks:
```
Step 1: Schema definition (500 tokens)
Step 2: Service interface (300 tokens)
Step 3: Implementation (2,000 tokens)
Step 4: Tests (1,500 tokens)
Total: 4,300 tokens across 4 prompts
```

**vs. Single Prompt**: 6,000 tokens (includes redundant context re-loads)

### 3. **Reference Over Duplication**
```
❌ "Here's the User model again: [2,000 tokens of code]"
✅ "As defined in prisma/schema.prisma (User model)"
```

### 4. **Use Type Definitions**
For TypeScript, rely on imported types instead of re-defining:
```typescript
// ❌ Verbose (300 tokens)
interface RecipeCreateInput {
  title: string;
  ingredients: Array<{ name: string; quantity: number; unit: string }>;
  // ... 10 more fields
}

// ✅ Concise (50 tokens)
import { RecipeCreateInput } from '@/types/recipe';
```

---

## Token Budget Review Checkpoints

### After Phase 1:
- [ ] Review actual token usage vs. allocated 60,000
- [ ] Adjust Phase 2-4 budgets if needed
- [ ] Identify token-heavy tasks for optimization

### After Phase 2:
- [ ] Analyze context compression effectiveness
- [ ] Update checkpoint strategy if sessions exceeded limits

### After Phase 3:
- [ ] Final buffer check (should have ≥10,000 tokens remaining)
- [ ] Allocate surplus to Phase 4 documentation

### After Phase 4:
- [ ] Document lessons learned for future projects
- [ ] Create token efficiency report

---

## Appendix: Token Estimation Guide

### Code Block Sizes

| Code Type | Lines | Estimated Tokens |
|-----------|-------|-----------------|
| Prisma Model (simple) | 10 | 150 |
| Prisma Model (complex) | 30 | 500 |
| Express Controller | 50 | 800 |
| Service Class | 100 | 1,500 |
| React Component | 80 | 1,200 |
| Unit Test Suite | 60 | 900 |
| Integration Test | 40 | 600 |

### Documentation Sizes

| Document Type | Pages | Estimated Tokens |
|--------------|-------|-----------------|
| API Endpoint Spec | 1 | 300 |
| Architecture Diagram | 1 | 200 |
| User Guide Section | 1 | 400 |
| Code Comments | Per function | 50 |

---

**Document Version**: 1.0  
**Last Updated**: May 2, 2026  
**Review Frequency**: After each phase completion  
**Owner**: Lead Engineer + AI Development Lead