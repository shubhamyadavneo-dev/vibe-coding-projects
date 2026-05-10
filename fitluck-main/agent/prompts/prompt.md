# Fitness Tracker Backend — Agent Prompt

## Overview
You are continuing the development of a **Fitness Tracker REST API** built with **Node.js, Express, PostgreSQL and Prisma ORM**. The Auth and Profile modules are already complete. Your job is to complete the remaining modules following the exact same architecture, patterns and conventions already established.

---

## Tech Stack
- **Runtime**: Node.js v20
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma v7 (uses `@prisma/adapter-pg` — see client setup below)
- **Validation**: Zod
- **Auth**: JWT (access token 15min + refresh token 7days)
- **Password Hashing**: bcryptjs
- **Email**: Nodemailer + Gmail
- **Testing**: Jest + Supertest

---

## Project Structure
```
backend/
├── prisma/
│   ├── client.js          ← Prisma singleton
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.js            ← seed script (to be created)
├── src/
│   ├── app.js             ← Express setup, middleware, routes
│   ├── config/
│   │   └── email.js       ← Nodemailer transporter
│   ├── controllers/
│   │   ├── auth.js        ← DONE
│   │   └── profile.js     ← DONE
│   ├── services/
│   │   ├── auth.js        ← DONE
│   │   └── profile.js     ← DONE
│   ├── repositories/
│   │   ├── auth.js        ← DONE
│   │   └── profile.js     ← DONE
│   ├── routes/
│   │   ├── auth.js        ← DONE
│   │   └── profile.js     ← DONE
│   ├── validations/
│   │   ├── auth.js        ← DONE
│   │   └── profile.js     ← DONE
│   ├── middleware/
│   │   ├── auth.js        ← DONE (protect middleware)
│   │   └── validate.js    ← DONE (Zod middleware)
│   ├── utils/
│   │   └── tokens.js      ← DONE
│   └── tests/
│       ├── setup.js       ← DONE
│       ├── unit/
│       │   ├── auth.test.js     ← DONE (16 tests)
│       │   └── profile.test.js  ← DONE (6 tests)
│       └── integration/
│           ├── auth.test.js     ← DONE (15 tests)
│           └── profile.test.js  ← DONE (9 tests)
├── index.js               ← entry point
├── .env
└── package.json
```

---

## Architecture Pattern — STRICTLY FOLLOW THIS

Every module follows this exact layered architecture:

```
Request → Route → Middleware (auth + validate) → Controller → Service → Repository → Prisma → DB
```

### Repository (`src/repositories/module.js`)
- ONLY contains Prisma queries
- No business logic
- No req/res
- Returns raw Prisma results

```js
const prisma = require('../../prisma/client')

const findById = (id) => {
  return prisma.someModel.findUnique({ where: { id } })
}

module.exports = { findById }
```

### Service (`src/services/module.js`)
- Contains ALL business logic
- Calls repository for DB operations
- Throws errors with plain messages (controller catches them)
- No req/res

```js
const repository = require('../repositories/module')

const getSomething = async (id) => {
  const item = await repository.findById(id)
  if (!item) throw new Error('Not found')
  return item
}

module.exports = { getSomething }
```

### Controller (`src/controllers/module.js`)
- Handles req/res ONLY
- Calls service
- Catches errors and sends response
- No business logic

```js
const service = require('../services/module')

const getSomething = async (req, res) => {
  try {
    const result = await service.getSomething(req.params.id)
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

module.exports = { getSomething }
```

### Route (`src/routes/module.js`)
```js
const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const validate = require('../middleware/validate')
const { schema } = require('../validations/module')
const { getSomething } = require('../controllers/module')

router.get('/:id', protect, getSomething)

module.exports = router
```

---

## Prisma Client Setup
```js
// prisma/client.js
const { PrismaClient } = require('./generated/prisma')
const { PrismaPg } = require('@prisma/adapter-pg')

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })
module.exports = prisma
```

---

## Auth Middleware
```js
// src/middleware/auth.js
const jwt = require('jsonwebtoken')

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' })
    }
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    req.user = { id: decoded.userId }
    next()
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}

module.exports = { protect }
```

---

## Validate Middleware
```js
// src/middleware/validate.js
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body)
    next()
  } catch (error) {
    const errors = error.errors.map(e => ({
      field: e.path[0],
      message: e.message
    }))
    return res.status(400).json({ errors })
  }
}
module.exports = validate
```

---

## Full Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "./generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Goal {
  WEIGHT_LOSS
  MUSCLE_GAIN
  STAY_HEALTHY
}

enum Timeframe {
  THREE_MONTHS
  SIX_MONTHS
  ONE_YEAR
}

enum RoutineType {
  ALTERNATE
  DAILY
  WEEKEND
}

enum WorkoutType {
  UNI
  DOUBLE
  FULL_BODY
}

enum DayOfWeek {
  MONDAY
  TUESDAY
  WEDNESDAY
  THURSDAY
  FRIDAY
  SATURDAY
  SUNDAY
}

enum MuscleGroup {
  CHEST
  BACK
  SHOULDERS
  BICEPS
  TRICEPS
  FOREARMS
  QUADS
  HAMSTRINGS
  GLUTES
  CALVES
  ABS
  CARDIO
}

enum Gender {
  MALE
  FEMALE
  OTHER
}

model User {
  id            Int      @id @default(autoincrement())
  email         String   @unique
  password_hash String
  name          String
  is_verified   Boolean  @default(false)
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  profile                 Profile?
  userPlan                UserPlan?
  workoutLogs             WorkoutLog[]
  bodyWeights             BodyWeight[]
  bodyMeasurements        BodyMeasurement[]
  personalRecords         PersonalRecord[]
  refreshTokens           RefreshToken[]
  passwordResetTokens     PasswordResetToken[]
  emailVerificationTokens EmailVerificationToken[]
}

model RefreshToken {
  id         Int       @id @default(autoincrement())
  token      String    @unique
  user_id    Int
  user       User      @relation(fields: [user_id], references: [id])
  expires_at DateTime
  revoked_at DateTime?
  created_at DateTime  @default(now())
}

model PasswordResetToken {
  id         Int       @id @default(autoincrement())
  token      String    @unique
  user_id    Int
  user       User      @relation(fields: [user_id], references: [id])
  expires_at DateTime
  used_at    DateTime?
  created_at DateTime  @default(now())
}

model EmailVerificationToken {
  id         Int      @id @default(autoincrement())
  token      String   @unique
  user_id    Int
  user       User     @relation(fields: [user_id], references: [id])
  expires_at DateTime
  created_at DateTime @default(now())
}

model Profile {
  id            Int       @id @default(autoincrement())
  user_id       Int       @unique
  user          User      @relation(fields: [user_id], references: [id])
  avatar_url    String?
  date_of_birth DateTime?
  gender        Gender?
  height_cm     Float?
  weight_kg     Float?
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
}

model Muscle {
  id        Int         @id @default(autoincrement())
  name      String      @unique
  group     MuscleGroup @unique
  exercises Exercise[]
}

model Exercise {
  id           Int      @id @default(autoincrement())
  name         String   @unique
  description  String?
  instructions String?
  image_url    String?
  video_url    String?
  muscle_id    Int
  muscle       Muscle   @relation(fields: [muscle_id], references: [id])

  userPlanDayExercises UserPlanDayExercise[]
  workoutSets          WorkoutSet[]
  personalRecords      PersonalRecord[]
  planDayExercises     PlanDayExercise[]
}

model PlanTemplate {
  id           Int         @id @default(autoincrement())
  goal         Goal
  routine_type RoutineType
  workout_type WorkoutType
  description  String?
  created_at   DateTime    @default(now())

  dayTemplates PlanDayTemplate[]
  userPlans    UserPlan[]

  @@unique([goal, routine_type, workout_type])
}

model PlanDayTemplate {
  id               Int         @id @default(autoincrement())
  plan_template_id Int
  plan_template    PlanTemplate @relation(fields: [plan_template_id], references: [id])
  day_number       Int
  day_of_week      DayOfWeek
  workout_type     WorkoutType
  label            String?

  exercises        PlanDayExercise[]
}

model PlanDayExercise {
  id                   Int             @id @default(autoincrement())
  plan_day_template_id Int
  plan_day_template    PlanDayTemplate @relation(fields: [plan_day_template_id], references: [id])
  exercise_id          Int
  exercise             Exercise        @relation(fields: [exercise_id], references: [id])
  recommended_sets     Int
  recommended_reps     Int
  order                Int
}

model UserPlan {
  id               Int         @id @default(autoincrement())
  user_id          Int         @unique
  user             User        @relation(fields: [user_id], references: [id])
  plan_template_id Int
  plan_template    PlanTemplate @relation(fields: [plan_template_id], references: [id])
  goal             Goal
  timeframe        Timeframe
  routine_type     RoutineType
  start_date       DateTime
  end_date         DateTime
  is_active        Boolean     @default(true)
  killed_at        DateTime?
  created_at       DateTime    @default(now())

  planDays         UserPlanDay[]
}

model UserPlanDay {
  id             Int         @id @default(autoincrement())
  user_plan_id   Int
  user_plan      UserPlan    @relation(fields: [user_plan_id], references: [id])
  day_number     Int
  scheduled_date DateTime
  day_of_week    DayOfWeek
  workout_type   WorkoutType
  label          String?
  is_rest_day    Boolean     @default(false)
  created_at     DateTime    @default(now())

  exercises      UserPlanDayExercise[]
  workoutLog     WorkoutLog?
}

model UserPlanDayExercise {
  id               Int         @id @default(autoincrement())
  user_plan_day_id Int
  user_plan_day    UserPlanDay @relation(fields: [user_plan_day_id], references: [id])
  exercise_id      Int
  exercise         Exercise    @relation(fields: [exercise_id], references: [id])
  recommended_sets Int
  recommended_reps Int
  order            Int
}

model WorkoutLog {
  id               Int         @id @default(autoincrement())
  user_plan_day_id Int         @unique
  user_plan_day    UserPlanDay @relation(fields: [user_plan_day_id], references: [id])
  user_id          Int
  user             User        @relation(fields: [user_id], references: [id])
  completed        Boolean     @default(false)
  duration_minutes Int?
  notes            String?
  logged_at        DateTime    @default(now())

  sets             WorkoutSet[]
}

model WorkoutSet {
  id             Int        @id @default(autoincrement())
  workout_log_id Int
  workout_log    WorkoutLog @relation(fields: [workout_log_id], references: [id])
  exercise_id    Int
  exercise       Exercise   @relation(fields: [exercise_id], references: [id])
  set_number     Int
  reps           Int
  weight_kg      Float?
  created_at     DateTime   @default(now())
}

model BodyWeight {
  id        Int      @id @default(autoincrement())
  user_id   Int
  user      User     @relation(fields: [user_id], references: [id])
  weight_kg Float
  logged_at DateTime @default(now())
}

model BodyMeasurement {
  id           Int      @id @default(autoincrement())
  user_id      Int
  user         User     @relation(fields: [user_id], references: [id])
  chest_cm     Float?
  waist_cm     Float?
  arms_cm      Float?
  thighs_cm    Float?
  calves_cm    Float?
  shoulders_cm Float?
  logged_at    DateTime @default(now())
}

model PersonalRecord {
  id          Int      @id @default(autoincrement())
  user_id     Int
  user        User     @relation(fields: [user_id], references: [id])
  exercise_id Int
  exercise    Exercise @relation(fields: [exercise_id], references: [id])
  weight_kg   Float
  reps        Int
  achieved_at DateTime @default(now())
}
```

---

## All API Endpoints

### Auth (DONE)
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/verify-email
POST   /api/auth/refresh-token
```

### Profile (DONE)
```
GET    /api/profile
POST   /api/profile
PATCH  /api/profile
```

### Exercises (BUILD THIS)
```
GET    /api/exercises              ← all exercises (cards)
GET    /api/exercises/:id          ← single exercise detail
GET    /api/exercises?muscle=CHEST ← filter by muscle group
GET    /api/muscles                ← all muscle groups
```

### Plan (BUILD THIS)
```
POST   /api/plan                   ← create plan (user picks goal + timeframe + routine)
GET    /api/plan                   ← get active plan with all days
DELETE /api/plan                   ← kill active plan
GET    /api/plan/today             ← get today's plan day with exercises
GET    /api/plan/days              ← all days (past/present/future)
GET    /api/plan/days/:id          ← single day detail
```

### Workout Logging (BUILD THIS)
```
POST   /api/logs/:planDayId              ← create log for today only
PATCH  /api/logs/:planDayId              ← update log (completed, duration, notes)
GET    /api/logs/:planDayId              ← get log for a specific day
POST   /api/logs/:planDayId/sets         ← add a set
PATCH  /api/logs/:planDayId/sets/:setId  ← edit a set
DELETE /api/logs/:planDayId/sets/:setId  ← delete a set
```

### Progress (BUILD THIS)
```
GET    /api/progress/weight              ← weight history
POST   /api/progress/weight              ← log weight
DELETE /api/progress/weight/:id          ← delete entry

GET    /api/progress/measurements        ← measurements history
POST   /api/progress/measurements        ← log measurements
DELETE /api/progress/measurements/:id    ← delete entry

GET    /api/progress/records             ← all personal records
GET    /api/progress/records/:exerciseId ← PR for specific exercise
```

### Analytics (BUILD THIS)
```
GET    /api/analytics/stats              ← total workouts, volume, exercises
GET    /api/analytics/consistency        ← % days completed, streaks
GET    /api/analytics/strength/:exerciseId ← max weight over time per exercise
GET    /api/analytics/calendar           ← all plan days with completion status
GET    /api/analytics/export             ← CSV export of full workout history
```

---

## Business Logic Rules — CRITICAL

### Exercise Module
- All exercises are **predefined** — users cannot create, edit or delete exercises
- Seed script must populate 12 muscles and ~10 exercises per muscle (120 total)
- Filter by muscle group via query param `?muscle=CHEST`

### Plan Module
- User picks 3 things: `goal`, `timeframe`, `routine_type`
- System finds matching `PlanTemplate` from 27 predefined combinations
- System auto generates all `UserPlanDay` rows with **actual calendar dates**
- Date generation rules:
  - `ALTERNATE` → Mon, Wed, Fri every week
  - `DAILY` → Mon to Sat every week
  - `WEEKEND` → Sat, Sun every week
- Timeframe to days:
  - `THREE_MONTHS` → 90 days from start
  - `SIX_MONTHS` → 180 days from start
  - `ONE_YEAR` → 365 days from start
- User can only have **one active plan** at a time (`@unique` on `user_id` in `UserPlan`)
- To create a new plan → must kill existing plan first
- Killing a plan sets `is_active = false` and `killed_at = now()`

### Workout Logging Rules — CRITICAL
- User can **only log on today's date** matching the plan day's `scheduled_date`
- Past days → read only, cannot log
- Future days → locked, cannot log
- One `WorkoutLog` per `UserPlanDay` (`@unique` on `user_plan_day_id`)
- Sets can only be added/edited/deleted if the log belongs to today

### Personal Records
- Auto update when a new `WorkoutSet` is logged with higher weight than existing PR for that exercise

### Analytics
- All derived from existing `WorkoutLog`, `WorkoutSet`, `UserPlanDay` data
- CSV export should include: date, exercise name, sets, reps, weight_kg

---

## Seed Script Requirements (`prisma/seed.js`)

Must seed in this order:
1. **12 Muscles** — one per MuscleGroup enum value
2. **~10 Exercises per muscle** — with real names, descriptions, instructions, image_url placeholder
3. **27 PlanTemplates** — all combinations of Goal × RoutineType × WorkoutType
4. **PlanDayTemplates** — day structure for each template
5. **PlanDayExercises** — exercises assigned to each template day

Run with:
```bash
node prisma/seed.js
```

---

## Testing Requirements

For every module write:

### Unit Tests (`src/tests/unit/module.test.js`)
- Test service layer only
- Mock all repository calls with `jest.mock()`
- Test happy path + all error cases
- No DB, no HTTP

### Integration Tests (`src/tests/integration/module.test.js`)
- Test full HTTP flow with Supertest
- Use real test DB (`fitness_tracker_test`)
- Clean relevant tables in `beforeEach`
- Test status codes + response body
- Test auth protection (401 without token)

### Test DB setup
- Test DB: `fitness_tracker_test`
- `src/tests/setup.js` loads `.env` and switches `DATABASE_URL` to `TEST_DATABASE_URL`
- Integration tests run their own `beforeEach` cleanup
- Always call `prisma.$disconnect()` in `afterAll`

---

## Environment Variables
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/fitness_tracker
TEST_DATABASE_URL=postgresql://postgres:password@localhost:5432/fitness_tracker_test
PORT=3000
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_app_password
```

---

## Conventions — MUST FOLLOW

- Use `camelCase` for JS variables and function names
- Use `snake_case` for DB column names in Prisma schema
- All routes are prefixed with `/api/`
- All protected routes use `protect` middleware
- All errors thrown in service as `throw new Error('message')`
- Controllers always wrap in try/catch
- Repositories never throw — let Prisma errors bubble up
- Validations always in `src/validations/` using Zod
- Never hardcode secrets — always use `process.env`
- Always use `async/await` — no `.then()` chains

---

## What Is Already Done — DO NOT RECREATE

```
✅ prisma/client.js
✅ prisma/schema.prisma
✅ prisma/migrations/
✅ src/app.js
✅ src/config/email.js
✅ src/utils/tokens.js
✅ src/middleware/auth.js
✅ src/middleware/validate.js
✅ src/controllers/auth.js
✅ src/controllers/profile.js
✅ src/services/auth.js
✅ src/services/profile.js
✅ src/repositories/auth.js
✅ src/repositories/profile.js
✅ src/routes/auth.js
✅ src/routes/profile.js
✅ src/validations/auth.js
✅ src/validations/profile.js
✅ src/tests/setup.js
✅ src/tests/unit/auth.test.js
✅ src/tests/unit/profile.test.js
✅ src/tests/integration/auth.test.js
✅ src/tests/integration/profile.test.js
✅ index.js
✅ .env
✅ package.json
```

---

## What You Need To Build

```
1. prisma/seed.js
2. src/repositories/exercise.js
3. src/services/exercise.js
4. src/controllers/exercise.js
5. src/routes/exercise.js
6. src/validations/exercise.js (if needed)
7. src/repositories/plan.js
8. src/services/plan.js
9. src/controllers/plan.js
10. src/routes/plan.js
11. src/validations/plan.js
12. src/repositories/log.js
13. src/services/log.js
14. src/controllers/log.js
15. src/routes/log.js
16. src/validations/log.js
17. src/repositories/progress.js
18. src/services/progress.js
19. src/controllers/progress.js
20. src/routes/progress.js
21. src/validations/progress.js
22. src/repositories/analytics.js
23. src/services/analytics.js
24. src/controllers/analytics.js
25. src/routes/analytics.js
26. src/tests/unit/exercise.test.js
27. src/tests/unit/plan.test.js
28. src/tests/unit/log.test.js
29. src/tests/unit/progress.test.js
30. src/tests/unit/analytics.test.js
31. src/tests/integration/exercise.test.js
32. src/tests/integration/plan.test.js
33. src/tests/integration/log.test.js
34. src/tests/integration/progress.test.js
35. src/tests/integration/analytics.test.js
```

---

## Final Checklist Before Submitting

```
□ All 35 files created
□ Seed script runs without errors
□ All endpoints return correct status codes
□ All protected routes return 401 without token
□ Workout logging blocked for non-today dates
□ Plan creation blocked if active plan exists
□ Personal records auto updated on new workout set
□ All unit tests pass
□ All integration tests pass
□ npm test shows 0 failures
```