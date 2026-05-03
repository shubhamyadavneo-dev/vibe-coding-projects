# Cooksuite - Project Constraints Document

## Technical Constraints

### Hard Constraints (Non-Negotiable)

#### 1. Technology Stack
**Constraint**: Must use exact versions specified  
**Rationale**: Compatibility and feature availability

| Component | Required Version | Justification |
|-----------|-----------------|---------------|
| Node.js | 22.x | Latest LTS with enhanced performance |
| Next.js | 15.x | App Router, Server Components |
| Express | 5.x | Async/await support, improved routing |
| PostgreSQL | 16 (Dockerized) | Advanced indexing, JSONB improvements |
| Prisma | 5.x | Latest migration tools, type safety |
| React | 18.x | Concurrent features, automatic batching |

**Impact**: No downgrades allowed; upgrades require full regression testing.

---

#### 2. Architectural Patterns
**Constraint**: Must follow SOLID principles and DRY pattern  
**Enforcement**:
- **Single Responsibility**: Each service handles one domain (RecipeService, AuthService)
- **Open/Closed**: Services extend via interfaces, not modification
- **Liskov Substitution**: `IMediaStorageService` interface allows swapping LocalStorage → CloudinaryStorage
- **Interface Segregation**: Separate interfaces for read vs. write operations
- **Dependency Inversion**: Controllers depend on service interfaces, not concrete classes

**Code Review Checklist**:
- [ ] No God classes >300 lines
- [ ] No duplicate logic (extracted to utils)
- [ ] Services injected via constructors (DI pattern)

---

#### 3. Test-Driven Development (TDD)
**Constraint**: ≥80% code coverage before merging to `main`  
**Coverage Requirements**:

| Layer | Minimum Coverage | Tools |
|-------|-----------------|-------|
| Controllers | 80% | Jest + Supertest |
| Services | 90% | Jest (unit tests) |
| Middleware | 100% | Jest (RBAC critical) |
| React Components | 75% | React Testing Library |
| Utility Functions | 95% | Jest |

**Enforcement**:
```bash
# Pre-commit hook
npm run test:coverage
if [ $COVERAGE -lt 80 ]; then exit 1; fi
```

**Exemptions**:
- Configuration files (`.eslintrc.js`, `tailwind.config.js`)
- Type definitions (`*.d.ts`)
- Migration scripts (tested via schema validation)

---

#### 4. Docker Containerization
**Constraint**: All services must run in containers; no local installs  
**Requirements**:
- PostgreSQL: Official `postgres:16-alpine` image
- Backend: Custom Node.js 22 Alpine image
- Frontend: Custom Next.js image (multi-stage build)
- Redis (Phase 4): Official `redis:7-alpine` image

**Volume Mounts**:
```yaml
volumes:
  postgres_data:       # Database persistence
  media_uploads:       # Recipe images (LocalFileStorageService)
  redis_data:          # Cache persistence (Phase 4)
```

**Network**: All services on `cooksuite_network` (bridge mode)

---

#### 5. Database Constraints

##### Schema Rules
**Constraint**: All tables must have:
- `id` (UUID primary key, default `gen_random_uuid()`)
- `created_at` (timestamptz, default `now()`)
- `updated_at` (timestamptz, auto-updated via trigger)

**Naming Conventions**:
- Tables: `snake_case` (e.g., `recipe_ingredients`)
- Columns: `snake_case` (e.g., `cooking_time_minutes`)
- Foreign keys: `{table}_id` (e.g., `user_id`)

##### Migration Safety
**Constraint**: Zero-downtime migrations only  
**Prohibited**:
- ❌ `DROP COLUMN` (use deprecation + cleanup script)
- ❌ `ALTER COLUMN TYPE` without default value
- ❌ Non-nullable columns without default (breaks existing rows)

**Allowed**:
- ✅ `ADD COLUMN` with default
- ✅ `CREATE INDEX CONCURRENTLY`
- ✅ `RENAME COLUMN` (with backward-compatible view)

---

#### 6. API Design Constraints

##### Versioning
**Constraint**: All endpoints prefixed with `/api/v1`  
**Breaking Changes**: Require new version (`/api/v2`)  
**Example**:
```
/api/v1/recipes       ✅
/api/v1/cookbooks     ✅
/recipes              ❌ (missing version)
```

##### Response Format
**Constraint**: Standardized JSON envelope  
**Success Response**:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-05-02T10:30:00Z",
    "requestId": "uuid-v4"
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "RECIPE_NOT_FOUND",
    "message": "Recipe with ID 123 does not exist",
    "details": {}
  },
  "meta": { ... }
}
```

##### Pagination
**Constraint**: Cursor-based pagination for lists  
**Format**:
```
GET /api/v1/recipes?cursor=eyJpZCI6MTIzfQ==&limit=20
```
**Response**:
```json
{
  "data": [...],
  "meta": {
    "nextCursor": "eyJpZCI6MTQzfQ==",
    "hasMore": true
  }
}
```

---

#### 7. Security Constraints

##### Authentication
**Constraint**: JWT with 15-minute access tokens + 7-day refresh tokens  
**Storage**:
- Access token: Memory (Redux state, never localStorage)
- Refresh token: HttpOnly cookie (secure, sameSite: strict)

**Rotation**: Refresh token rotates on every use (prevents replay attacks)

##### Password Policy
**Constraint**: Enforced at application level  
**Rules**:
- Minimum 8 characters
- At least 1 uppercase, 1 lowercase, 1 number
- Hashed with bcrypt (cost factor: 12)
- No password hints stored

##### RBAC Enforcement
**Constraint**: Every protected endpoint checks permissions  
**Middleware**:
```javascript
// ❌ WRONG: Only checks authentication
app.get('/recipes', authenticate, getRecipes);

// ✅ CORRECT: Checks permission
app.get('/recipes', authenticate, requirePermission('recipe:read'), getRecipes);
```

---

#### 8. Frontend Constraints

##### Component Structure
**Constraint**: Atomic Design methodology  
**Hierarchy**:
```
atoms/        # Button, Input, Label
molecules/    # FormField (Label + Input + Error)
organisms/    # RecipeForm, CookbookCard
templates/    # RecipeListLayout
pages/        # /recipes, /cookbooks
```

##### State Management Rules
**Constraint**: Redux Toolkit for global state only  
**Use Cases**:
- ✅ Authentication state (user, token)
- ✅ Shopping list (persistent across pages)
- ✅ API cache (RTK Query)

**Prohibited**:
- ❌ Form state (use Formik local state)
- ❌ UI toggles (use `useState`)
- ❌ Transient data (search filters → URL params)

##### Styling Constraints
**Constraint**: Tailwind CSS utility classes; no custom CSS files  
**Exception**: Global styles (`globals.css`) for:
- CSS variables (theme colors)
- Print media queries
- Third-party overrides (DnD library)

**Shadcn/UI**:
- Use only from official registry (`npx shadcn-ui@latest add button`)
- No manual component modifications (extend via composition)

---

### Soft Constraints (Recommended, Not Enforced)

#### 1. File Size Limits
**Recommendation**: Keep files under 300 lines  
**Workaround**: Split large files into:
- `RecipeService.ts` → `RecipeService.ts` + `RecipeValidation.ts` + `RecipeHelpers.ts`

#### 2. Function Complexity
**Recommendation**: Max cyclomatic complexity of 10  
**Tool**: ESLint rule `complexity: ["error", 10]`

#### 3. Commit Message Format
**Recommendation**: Conventional Commits  
**Format**: `type(scope): message`  
**Examples**:
```
feat(auth): add RBAC permission middleware
fix(recipes): resolve duplicate ingredient merging
test(shopping): add unit tests for unit conversion
docs(api): update Swagger for cookbook endpoints
```

---

## External Dependencies Constraints

### Allowed Libraries
**Constraint**: Only pre-approved libraries to avoid supply chain attacks  

| Purpose | Allowed Libraries | Prohibited Alternatives |
|---------|------------------|------------------------|
| HTTP Client | Axios, native fetch | request (deprecated) |
| Validation | Yup, Zod | Joi (backend only) |
| Date Handling | date-fns | moment (large bundle) |
| UUID | uuid | nanoid (non-standard) |
| Image Processing | Sharp | Jimp (slower) |
| Unit Conversion | convert-units | Custom (error-prone) |

**Audit Requirement**: Run `npm audit` before every deployment.

---

### Prohibited Dependencies
**Constraint**: Banned libraries (security/licensing issues)

| Library | Reason | Alternative |
|---------|--------|-------------|
| `eval()` or `Function()` | Arbitrary code execution | Refactor logic |
| `child_process.exec()` | Command injection risk | Use `execFile()` with args array |
| Unlicensed packages | Legal risk | MIT/Apache-2.0 only |
| Packages with 0 weekly downloads | Unmaintained | Popular alternatives |

---

## Performance Constraints

### API Response Time
**Constraint**: 95th percentile <500ms (measured via Prometheus)  
**Breakdown**:
- Database query: <200ms
- Business logic: <100ms
- Network overhead: <200ms

**Monitoring**: Alert if p95 exceeds threshold for 5 consecutive minutes.

### Frontend Performance
**Constraint**: Lighthouse scores (CI enforced)

| Metric | Target | Minimum Acceptable |
|--------|--------|-------------------|
| Performance | ≥90 | ≥80 |
| Accessibility | 100 | ≥95 |
| Best Practices | 100 | ≥90 |
| SEO | ≥90 | ≥80 |

**Measured On**: Emulated Moto G4, 4G throttled network.

---

## Data Constraints

### Data Retention
**Constraint**: Soft deletes only (GDPR compliance in future)  
**Implementation**:
```sql
ALTER TABLE recipes ADD COLUMN deleted_at TIMESTAMPTZ;
CREATE INDEX idx_recipes_deleted ON recipes(deleted_at) WHERE deleted_at IS NULL;
```

**Queries**:
```sql
-- ❌ WRONG: Hard delete
DELETE FROM recipes WHERE id = ?;

-- ✅ CORRECT: Soft delete
UPDATE recipes SET deleted_at = NOW() WHERE id = ?;
```

**Cleanup**: Background job (Phase 4) purges records >90 days deleted.

---

### File Upload Limits
**Constraint**: Enforced at Nginx + Application layer

| File Type | Max Size | Allowed Extensions |
|-----------|----------|-------------------|
| Recipe Images | 5 MB | .jpg, .jpeg, .png, .webp |
| Profile Pictures | 2 MB | .jpg, .jpeg, .png |

**Validation**:
```javascript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
```

---

## Environment Constraints

### Environment Variables
**Constraint**: All secrets via environment variables; no hardcoded values  
**Required Variables**:

```bash
# Backend (.env.backend)
DATABASE_URL=postgresql://user:pass@postgres:5432/cooksuite
JWT_SECRET=<generated-secret-min-32-chars>
JWT_REFRESH_SECRET=<different-secret>
NODE_ENV=development|staging|production
CORS_ORIGIN=http://localhost:3000
MEDIA_STORAGE_PATH=/app/uploads

# Frontend (.env.frontend)
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_ENV=development
```

**Validation**: Joi schema on backend startup:
```javascript
const envSchema = Joi.object({
  DATABASE_URL: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  // ...
});
```

---

### Development vs. Production
**Constraint**: Strict separation of configs

| Feature | Development | Production |
|---------|------------|------------|
| CORS Origin | `*` | Whitelist only |
| Debug Logs | Enabled | Disabled |
| Source Maps | Inline | External |
| Hot Reload | Enabled | N/A |
| HTTPS | Optional | Required |
| Rate Limiting | Disabled | 100 req/hr |

---

## Documentation Constraints

### Code Documentation
**Constraint**: JSDoc for all exported functions  
**Format**:
```javascript
/**
 * Aggregates ingredients from multiple recipes and normalizes units.
 * @param {string[]} recipeIds - Array of recipe UUIDs
 * @param {Object} options - Aggregation options
 * @param {boolean} options.convertUnits - Enable unit conversion (default: true)
 * @returns {Promise<AggregatedIngredient[]>} Merged ingredient list
 * @throws {RecipeNotFoundError} If any recipe ID is invalid
 */
async function aggregateIngredients(recipeIds, options = {}) { ... }
```

### API Documentation
**Constraint**: OpenAPI 3.0 spec updated per endpoint  
**Location**: `/docs/openapi.yaml`  
**UI**: Swagger UI served at `/api/docs`

---

## Version Control Constraints

### Branching Strategy
**Constraint**: Git Flow model

```
main            # Production-ready code
  ↑
develop         # Integration branch
  ↑
feature/*       # New features (from develop)
hotfix/*        # Production fixes (from main)
release/*       # Pre-production (from develop)
```

### Merge Requirements
**Constraint**: All PRs must pass:
1. ✅ CI tests (100% pass rate)
2. ✅ Code coverage ≥80%
3. ✅ 1 peer review approval
4. ✅ No merge conflicts
5. ✅ Linter errors resolved

---

## Deployment Constraints

### Docker Image Size
**Constraint**: Max 500MB per image  
**Optimization**:
- Use Alpine base images
- Multi-stage builds (separate build/runtime)
- `.dockerignore` excludes `node_modules`, `.git`, `*.log`

### Database Migrations
**Constraint**: Automated via Prisma in CI/CD  
**Process**:
1. Generate migration: `npx prisma migrate dev --name <name>`
2. Review SQL in PR
3. Apply on deploy: `npx prisma migrate deploy`
4. Rollback plan: Revert migration file + re-deploy

---

## Monitoring Constraints

### Logging
**Constraint**: Structured JSON logs only  
**Format**:
```json
{
  "level": "error",
  "message": "Failed to create recipe",
  "userId": "uuid",
  "recipeData": { ... },
  "error": { "stack": "..." },
  "timestamp": "2026-05-02T10:30:00Z"
}
```

**Log Levels**:
- `error`: System failures (DB connection lost)
- `warn`: Recoverable issues (slow query >1s)
- `info`: Business events (recipe created)
- `debug`: Verbose diagnostics (disabled in prod)

### Metrics
**Constraint**: Prometheus exposition format at `/metrics`  
**Required Metrics**:
- `http_requests_total` (counter)
- `http_request_duration_seconds` (histogram)
- `db_connections_active` (gauge)
- `shopping_list_aggregation_time` (histogram)

---

## Testing Constraints

### Test Isolation
**Constraint**: Each test must be independent  
**Enforcement**:
- Use `beforeEach()` to reset database state
- Mock external dependencies (file system, Redis)
- No shared state between tests

### Test Naming
**Constraint**: Descriptive test names  
**Format**: `should <expected behavior> when <condition>`  
**Examples**:
```javascript
describe('RecipeService', () => {
  it('should merge ingredients with same unit when aggregating shopping list', async () => { ... });
  it('should throw RecipeNotFoundError when recipe ID is invalid', async () => { ... });
});
```

---

## Compliance Constraints

### GDPR Readiness (Future)
**Constraint**: Data export and deletion hooks  
**Implementation** (Phase 4):
- User data export API (`GET /api/v1/users/me/export`)
- Account deletion API (`DELETE /api/v1/users/me`)
- Audit log for data access

### Accessibility (WCAG 2.1 Level AA)
**Constraint**: Enforced via Lighthouse CI  
**Requirements**:
- All images have `alt` text
- Color contrast ratio ≥4.5:1
- Keyboard navigation (no mouse-only interactions)
- Form labels associated with inputs
- ARIA labels for custom components

---

## Known Limitations

### Phase 1 Limitations
1. **Unit Conversion**: Same-unit aggregation only ("200g + 300g" works; "200g + 1 cup" remains separate)
2. **Email Invitations**: Sharing deferred to Phase 3 (manual share link only in Phase 2)
3. **Nutritional Data**: Static estimates, no API integration

### Scaling Limitations (Phase 1-3)
- **Concurrent Users**: ~500 (limited by single PostgreSQL instance)
- **Media Storage**: Local filesystem (no CDN)
- **Search**: Basic full-text (no fuzzy matching or Elasticsearch)

**Mitigation in Phase 4**:
- Add Redis caching → 2000 concurrent users
- Abstract media service → CloudinaryStorage
- PostgreSQL tuning → read replicas

---

## Change Request Process

### Adding New Dependencies
**Constraint**: Requires approval  
**Process**:
1. Create RFC (Request for Comments) issue
2. Justify need (no existing library, performance gain, etc.)
3. Security audit (`npm audit`, Snyk scan)
4. License compatibility check
5. Approval from 2 team members

### Modifying Constraints
**Constraint**: Document version bump  
**Process**:
1. Propose change in project meeting
2. Update this document (increment version)
3. Add entry to `CHANGELOG.md`
4. Notify all developers

---

**Document Version**: 1.0  
**Last Updated**: May 2, 2026  
**Next Review**: After Phase 1 completion  
**Approved By**: Product Manager, Lead Engineer