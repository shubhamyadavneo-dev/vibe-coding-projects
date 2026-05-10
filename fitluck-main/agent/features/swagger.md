# Swagger / OpenAPI Documentation — Agent Prompt

## Task
Add complete OpenAPI/Swagger documentation to an existing Node.js + Express REST API. The API is already fully built. Your job is ONLY to add Swagger docs — do NOT modify any business logic, controllers, services or repositories.

---

## Tech Stack
- Node.js + Express
- swagger-jsdoc
- swagger-ui-express

---

## Step 1 — Install packages

```bash
npm install swagger-jsdoc swagger-ui-express
```

---

## Step 2 — Create `src/config/swagger.js`

```js
const swaggerJsdoc = require('swagger-jsdoc')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fitness Tracker API',
      version: '1.0.0',
      description: 'Complete REST API for Fitness Tracker Application',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string' },
            is_verified: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Profile: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            user_id: { type: 'integer' },
            avatar_url: { type: 'string', nullable: true },
            date_of_birth: { type: 'string', format: 'date', nullable: true },
            gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'], nullable: true },
            height_cm: { type: 'number', nullable: true },
            weight_kg: { type: 'number', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Exercise: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            instructions: { type: 'string', nullable: true },
            image_url: { type: 'string', nullable: true },
            video_url: { type: 'string', nullable: true },
            muscle_id: { type: 'integer' },
            muscle: { $ref: '#/components/schemas/Muscle' },
          },
        },
        Muscle: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            group: {
              type: 'string',
              enum: ['CHEST','BACK','SHOULDERS','BICEPS','TRICEPS','FOREARMS','QUADS','HAMSTRINGS','GLUTES','CALVES','ABS','CARDIO'],
            },
          },
        },
        UserPlan: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            user_id: { type: 'integer' },
            goal: { type: 'string', enum: ['WEIGHT_LOSS', 'MUSCLE_GAIN', 'STAY_HEALTHY'] },
            timeframe: { type: 'string', enum: ['THREE_MONTHS', 'SIX_MONTHS', 'ONE_YEAR'] },
            routine_type: { type: 'string', enum: ['ALTERNATE', 'DAILY', 'WEEKEND'] },
            start_date: { type: 'string', format: 'date-time' },
            end_date: { type: 'string', format: 'date-time' },
            is_active: { type: 'boolean' },
            killed_at: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        UserPlanDay: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            day_number: { type: 'integer' },
            scheduled_date: { type: 'string', format: 'date-time' },
            day_of_week: { type: 'string' },
            workout_type: { type: 'string' },
            label: { type: 'string', nullable: true },
            is_rest_day: { type: 'boolean' },
          },
        },
        WorkoutLog: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            completed: { type: 'boolean' },
            duration_minutes: { type: 'integer', nullable: true },
            notes: { type: 'string', nullable: true },
            logged_at: { type: 'string', format: 'date-time' },
          },
        },
        WorkoutSet: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            set_number: { type: 'integer' },
            reps: { type: 'integer' },
            weight_kg: { type: 'number', nullable: true },
            exercise_id: { type: 'integer' },
          },
        },
        BodyWeight: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            weight_kg: { type: 'number' },
            logged_at: { type: 'string', format: 'date-time' },
          },
        },
        BodyMeasurement: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            chest_cm: { type: 'number', nullable: true },
            waist_cm: { type: 'number', nullable: true },
            arms_cm: { type: 'number', nullable: true },
            thighs_cm: { type: 'number', nullable: true },
            calves_cm: { type: 'number', nullable: true },
            shoulders_cm: { type: 'number', nullable: true },
            logged_at: { type: 'string', format: 'date-time' },
          },
        },
        PersonalRecord: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            exercise_id: { type: 'integer' },
            weight_kg: { type: 'number' },
            reps: { type: 'integer' },
            achieved_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
}

const swaggerSpec = swaggerJsdoc(options)
module.exports = swaggerSpec
```

---

## Step 3 — Wire up in `src/app.js`

Add these lines after your existing middleware setup:

```js
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./config/swagger')

// API Docs — publicly accessible
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Fitness Tracker API Docs',
  swaggerOptions: {
    persistAuthorization: true, // keeps token between page refreshes
  },
}))
```

---

## Step 4 — Add JSDoc comments to ALL route files

Add these comments ABOVE each route definition in the route files. Do NOT modify the actual route handlers.

---

### `src/routes/auth.js` — Add these comments

```js
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and session management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@gmail.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: Registration successful, verification email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Registration successful! Please verify your email.
 *       400:
 *         description: Email already in use or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/auth/verify-email:
 *   get:
 *     summary: Verify email address via token link
 *     tags: [Auth]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token from email link
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@gmail.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid credentials or email not verified
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout and revoke refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       400:
 *         description: Invalid refresh token
 */

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Get new access token using refresh token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Invalid or expired refresh token
 */

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset email
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@gmail.com
 *     responses:
 *       200:
 *         description: Reset email sent if address exists (always same message for security)
 */

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using token from email
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid, expired or already used token
 */
```

---

### `src/routes/profile.js` — Add these comments

```js
/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile management
 */

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: Profile data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       404:
 *         description: Profile not found
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create user profile
 *     tags: [Profile]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               avatar_url:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *                 example: "1995-01-15"
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, OTHER]
 *               height_cm:
 *                 type: number
 *                 example: 175
 *               weight_kg:
 *                 type: number
 *                 example: 70
 *     responses:
 *       201:
 *         description: Profile created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       400:
 *         description: Profile already exists
 *       401:
 *         description: Unauthorized
 *   patch:
 *     summary: Update user profile
 *     tags: [Profile]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               height_cm:
 *                 type: number
 *               weight_kg:
 *                 type: number
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, OTHER]
 *               avatar_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       400:
 *         description: Profile not found
 *       401:
 *         description: Unauthorized
 */
```

---

### `src/routes/exercise.js` — Add these comments

```js
/**
 * @swagger
 * tags:
 *   name: Exercises
 *   description: Exercise library (predefined, read-only)
 */

/**
 * @swagger
 * /api/muscles:
 *   get:
 *     summary: Get all muscle groups
 *     tags: [Exercises]
 *     security: []
 *     responses:
 *       200:
 *         description: List of all muscles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Muscle'
 */

/**
 * @swagger
 * /api/exercises:
 *   get:
 *     summary: Get all exercises (optionally filter by muscle)
 *     tags: [Exercises]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: muscle
 *         schema:
 *           type: string
 *           enum: [CHEST,BACK,SHOULDERS,BICEPS,TRICEPS,FOREARMS,QUADS,HAMSTRINGS,GLUTES,CALVES,ABS,CARDIO]
 *         description: Filter by muscle group
 *     responses:
 *       200:
 *         description: List of exercises
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Exercise'
 */

/**
 * @swagger
 * /api/exercises/{id}:
 *   get:
 *     summary: Get single exercise detail
 *     tags: [Exercises]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Exercise detail
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exercise'
 *       404:
 *         description: Exercise not found
 */
```

---

### `src/routes/plan.js` — Add these comments

```js
/**
 * @swagger
 * tags:
 *   name: Plan
 *   description: User fitness plan management
 */

/**
 * @swagger
 * /api/plan:
 *   post:
 *     summary: Create a new fitness plan
 *     tags: [Plan]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [goal, timeframe, routine_type]
 *             properties:
 *               goal:
 *                 type: string
 *                 enum: [WEIGHT_LOSS, MUSCLE_GAIN, STAY_HEALTHY]
 *               timeframe:
 *                 type: string
 *                 enum: [THREE_MONTHS, SIX_MONTHS, ONE_YEAR]
 *               routine_type:
 *                 type: string
 *                 enum: [ALTERNATE, DAILY, WEEKEND]
 *     responses:
 *       201:
 *         description: Plan created with all workout days generated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPlan'
 *       400:
 *         description: Active plan already exists — kill it first
 *       401:
 *         description: Unauthorized
 *   get:
 *     summary: Get active plan with all days
 *     tags: [Plan]
 *     responses:
 *       200:
 *         description: Active plan with days
 *       404:
 *         description: No active plan found
 *       401:
 *         description: Unauthorized
 *   delete:
 *     summary: Kill active plan
 *     tags: [Plan]
 *     responses:
 *       200:
 *         description: Plan killed successfully
 *       404:
 *         description: No active plan found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/plan/today:
 *   get:
 *     summary: Get today's workout day
 *     tags: [Plan]
 *     responses:
 *       200:
 *         description: Today's plan day with exercises
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPlanDay'
 *       404:
 *         description: No workout scheduled for today
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/plan/days:
 *   get:
 *     summary: Get all plan days (past, present, future)
 *     tags: [Plan]
 *     responses:
 *       200:
 *         description: All plan days with status
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/plan/days/{id}:
 *   get:
 *     summary: Get single plan day detail
 *     tags: [Plan]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Plan day with exercises
 *       404:
 *         description: Plan day not found
 *       401:
 *         description: Unauthorized
 */
```

---

### `src/routes/log.js` — Add these comments

```js
/**
 * @swagger
 * tags:
 *   name: Workout Logs
 *   description: Daily workout logging (today only)
 */

/**
 * @swagger
 * /api/logs/{planDayId}:
 *   post:
 *     summary: Create workout log for today
 *     tags: [Workout Logs]
 *     parameters:
 *       - in: path
 *         name: planDayId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               completed:
 *                 type: boolean
 *               duration_minutes:
 *                 type: integer
 *                 example: 45
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Log created
 *       400:
 *         description: Can only log today's workout
 *       401:
 *         description: Unauthorized
 *   patch:
 *     summary: Update workout log
 *     tags: [Workout Logs]
 *     parameters:
 *       - in: path
 *         name: planDayId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               completed:
 *                 type: boolean
 *               duration_minutes:
 *                 type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Log updated
 *       401:
 *         description: Unauthorized
 *   get:
 *     summary: Get workout log for a specific day
 *     tags: [Workout Logs]
 *     parameters:
 *       - in: path
 *         name: planDayId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Workout log with sets
 *       404:
 *         description: Log not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/logs/{planDayId}/sets:
 *   post:
 *     summary: Add a set to today's workout log
 *     tags: [Workout Logs]
 *     parameters:
 *       - in: path
 *         name: planDayId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [exercise_id, set_number, reps]
 *             properties:
 *               exercise_id:
 *                 type: integer
 *               set_number:
 *                 type: integer
 *                 example: 1
 *               reps:
 *                 type: integer
 *                 example: 10
 *               weight_kg:
 *                 type: number
 *                 example: 50
 *     responses:
 *       201:
 *         description: Set added
 *       400:
 *         description: Can only add sets to today's log
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/logs/{planDayId}/sets/{setId}:
 *   patch:
 *     summary: Edit a set
 *     tags: [Workout Logs]
 *     parameters:
 *       - in: path
 *         name: planDayId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: setId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reps:
 *                 type: integer
 *               weight_kg:
 *                 type: number
 *     responses:
 *       200:
 *         description: Set updated
 *       401:
 *         description: Unauthorized
 *   delete:
 *     summary: Delete a set
 *     tags: [Workout Logs]
 *     parameters:
 *       - in: path
 *         name: planDayId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: setId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Set deleted
 *       401:
 *         description: Unauthorized
 */
```

---

### `src/routes/progress.js` — Add these comments

```js
/**
 * @swagger
 * tags:
 *   name: Progress
 *   description: Body measurements and personal records tracking
 */

/**
 * @swagger
 * /api/progress/weight:
 *   get:
 *     summary: Get body weight history
 *     tags: [Progress]
 *     responses:
 *       200:
 *         description: List of weight entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BodyWeight'
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Log body weight
 *     tags: [Progress]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [weight_kg]
 *             properties:
 *               weight_kg:
 *                 type: number
 *                 example: 72.5
 *     responses:
 *       201:
 *         description: Weight logged
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/progress/weight/{id}:
 *   delete:
 *     summary: Delete a weight entry
 *     tags: [Progress]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Entry deleted
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/progress/measurements:
 *   get:
 *     summary: Get body measurements history
 *     tags: [Progress]
 *     responses:
 *       200:
 *         description: List of measurement entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BodyMeasurement'
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Log body measurements
 *     tags: [Progress]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chest_cm:
 *                 type: number
 *               waist_cm:
 *                 type: number
 *               arms_cm:
 *                 type: number
 *               thighs_cm:
 *                 type: number
 *               calves_cm:
 *                 type: number
 *               shoulders_cm:
 *                 type: number
 *     responses:
 *       201:
 *         description: Measurements logged
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/progress/records:
 *   get:
 *     summary: Get all personal records
 *     tags: [Progress]
 *     responses:
 *       200:
 *         description: List of personal records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PersonalRecord'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/progress/records/{exerciseId}:
 *   get:
 *     summary: Get personal record for a specific exercise
 *     tags: [Progress]
 *     parameters:
 *       - in: path
 *         name: exerciseId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Personal record for exercise
 *       404:
 *         description: No record found
 *       401:
 *         description: Unauthorized
 */
```

---

### `src/routes/analytics.js` — Add these comments

```js
/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Workout analytics and insights
 */

/**
 * @swagger
 * /api/analytics/stats:
 *   get:
 *     summary: Get overall workout statistics
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Stats including total workouts, volume, exercises
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalWorkouts:
 *                   type: integer
 *                 totalSets:
 *                   type: integer
 *                 totalVolume:
 *                   type: number
 *                 totalDays:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/analytics/consistency:
 *   get:
 *     summary: Get workout consistency metrics
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Consistency percentage and streak data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 completionRate:
 *                   type: number
 *                   example: 85.5
 *                 currentStreak:
 *                   type: integer
 *                 longestStreak:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/analytics/strength/{exerciseId}:
 *   get:
 *     summary: Get strength progress for a specific exercise
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: exerciseId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Max weight over time for exercise
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/analytics/calendar:
 *   get:
 *     summary: Get calendar view of all workout days
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: All plan days with completion status
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/analytics/export:
 *   get:
 *     summary: Export full workout history as CSV
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       401:
 *         description: Unauthorized
 */
```

---

## Step 5 — Verify it works

Start your server:
```bash
npm run dev
```

Visit:
```
http://localhost:3000/api/docs
```

You should see full Swagger UI with all endpoints grouped by tags.

---

## How to use Swagger UI for demo

1. Open `http://localhost:3000/api/docs`
2. Click **POST /api/auth/login** → Try it out → Execute
3. Copy the `accessToken` from response
4. Click **Authorize** button (top right, 🔒 icon)
5. Paste token → Authorize
6. Now all protected endpoints work directly from the UI ✅

---

## Checklist
```
□ swagger-jsdoc and swagger-ui-express installed
□ src/config/swagger.js created
□ /api/docs wired up in src/app.js
□ JSDoc comments added to all 7 route files
□ http://localhost:3000/api/docs loads correctly
□ All endpoint groups visible: Auth, Profile, Exercises, Plan, Workout Logs, Progress, Analytics
□ Authorization works with JWT token
□ Can execute requests directly from Swagger UI
```