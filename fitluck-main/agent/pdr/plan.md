PHASES:
1. Auth          → register, login, logout, refresh token
2. Profile       → setup & update profile
3. Exercises     → browse, create custom
4. Workouts      → log, edit, delete, history
5. Sets          → add sets to workout exercises
6. Templates     → save & reuse workouts
7. Routines      → create, schedule, share
8. Progress      → measurements, PRs, goals
9. Analytics     → stats, charts, export

APIS:
AUTH:
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/refresh-token

PROFILE:
GET    /api/users/me
PATCH  /api/users/me
DELETE /api/users/me
GET    /api/profiles/me
PATCH  /api/profiles/me

EXCERCISES:
GET    /api/exercises                  # browse all (filter by muscle/equipment)
GET    /api/exercises/:id              # exercise details
POST   /api/exercises                  # create custom exercise
PATCH  /api/exercises/:id              # edit custom exercise
DELETE /api/exercises/:id              # delete custom exercise

WORKOUTS:
GET    /api/workouts                   # workout history
GET    /api/workouts/:id               # single workout detail
POST   /api/workouts                   # log new workout
PATCH  /api/workouts/:id               # edit workout
DELETE /api/workouts/:id               # delete workout
GET    /api/workouts/calendar          # calendar view

POST   /api/workouts/:id/exercises           # add exercise to workout
DELETE /api/workouts/:id/exercises/:weId     # remove exercise from workout
POST   /api/workouts/:id/exercises/:weId/sets       # add set
PATCH  /api/workouts/:id/exercises/:weId/sets/:setId  # edit set
DELETE /api/workouts/:id/exercises/:weId/sets/:setId  # delete set

WORKOUT TEMPLATES:
GET    /api/templates                  # list user's templates
GET    /api/templates/:id
POST   /api/templates                  # save workout as template
PATCH  /api/templates/:id
DELETE /api/templates/:id
POST   /api/templates/:id/start        # start workout from template

ROUTINES:
GET    /api/routines                   # user's routines
GET    /api/routines/public            # community routines
GET    /api/routines/:id
POST   /api/routines                   # create routine
PATCH  /api/routines/:id
DELETE /api/routines/:id
POST   /api/routines/:id/import        # import community routine
GET    /api/routines/:id/share         # get shareable link/code

PROGRESS TRACKING:
GET    /api/progress/measurements      # all body measurements
POST   /api/progress/measurements      # log measurement
PATCH  /api/progress/measurements/:id
DELETE /api/progress/measurements/:id
GET    /api/progress/records           # all personal records
GET    /api/progress/records/:exerciseId
POST   /api/progress/records           # log personal record
GET    /api/progress/goals             # all goals
POST   /api/progress/goals             # create goal
PATCH  /api/progress/goals/:id
DELETE /api/progress/goals/:id

ANALYTICS:
GET    /api/analytics/stats            # total workouts, volume, etc.
GET    /api/analytics/strength/:exerciseId   # strength progress over time
GET    /api/analytics/consistency      # workout frequency/streaks
GET    /api/analytics/export           # export as CSV