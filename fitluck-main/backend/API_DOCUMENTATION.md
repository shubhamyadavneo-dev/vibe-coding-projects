# Fitness Tracker API Documentation

Base URL:

```http
http://localhost:3000/api
```

Protected endpoints require:

```http
Authorization: Bearer <accessToken>
```

## Auth

### Register

```http
POST /auth/register
```

Body:

```json
{
  "name": "John Doe",
  "email": "john@gmail.com",
  "password": "123456"
}
```

### Verify Email

```http
GET /auth/verify-email?token=<token>
```

### Login

```http
POST /auth/login
```

Body:

```json
{
  "email": "john@gmail.com",
  "password": "123456"
}
```

Returns `accessToken`, `refreshToken`, and user info.

### Logout

```http
POST /auth/logout
```

Body:

```json
{
  "refreshToken": "token"
}
```

This route is currently public in the router, but the token must match a stored refresh token.

### Forgot Password

```http
POST /auth/forgot-password
```

Body:

```json
{
  "email": "john@gmail.com"
}
```

### Reset Password

```http
POST /auth/reset-password
```

Body:

```json
{
  "token": "reset-token",
  "password": "newpassword"
}
```

## Profile

All profile endpoints are protected.

### Get Profile

```http
GET /profile
```

Gets the current user profile.

### Create Profile

```http
POST /profile
```

Body:

```json
{
  "avatar_url": "https://example.com/avatar.png",
  "date_of_birth": "1995-01-15",
  "gender": "MALE",
  "height_cm": 175,
  "weight_kg": 70
}
```

### Update Profile

```http
PATCH /profile
```

Body can contain any profile fields:

```json
{
  "weight_kg": 72
}
```

## Exercises

Exercises are predefined. Users cannot create, edit, or delete exercises.

### Get Exercises

```http
GET /exercises
```

Returns all predefined exercises.

### Filter Exercises By Muscle

```http
GET /exercises?muscle=CHEST
```

Valid muscle values:

```text
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
```

Note: the current route passes the query directly to the service. Use one of the values above; invalid values simply return no matching exercises.

### Get Exercise By ID

```http
GET /exercises/:id
```

Returns one exercise.

### Get Muscles

```http
GET /muscles
```

Returns all muscle groups with exercises.

## Plan

All plan endpoints are protected.

### Create Plan

```http
POST /plan
```

Creates a new active plan. A user can have only one active plan at a time.

Body:

```json
{
  "goal": "WEIGHT_LOSS",
  "timeframe": "THREE_MONTHS",
  "routine_type": "ALTERNATE",
  "workout_type": "FULL_BODY",
  "start_date": "2026-05-03"
}
```

Valid values:

| Field | Values |
| --- | --- |
| `goal` | `WEIGHT_LOSS`, `MUSCLE_GAIN`, `STAY_HEALTHY` |
| `timeframe` | `THREE_MONTHS`, `SIX_MONTHS`, `ONE_YEAR` |
| `routine_type` | `ALTERNATE`, `DAILY`, `WEEKEND` |
| `workout_type` | `UNI`, `DOUBLE`, `FULL_BODY` |

Notes:

- `workout_type` is optional and defaults to `FULL_BODY`.
- `start_date` is optional and defaults to today.
- To create a new plan, kill the current active plan first.

### Get Active Plan

```http
GET /plan
```

Returns the active plan with all generated days and exercises.

### Kill Active Plan

```http
DELETE /plan
```

Kills the active plan by setting `is_active = false`.

### Get Today's Plan Day

```http
GET /plan/today
```

Returns today's plan day with exercises.

### Get All Plan Days

```http
GET /plan/days
```

Returns all active plan days.

### Get Plan Day By ID

```http
GET /plan/days/:id
```

Returns one plan day.

## Workout Logs

All log endpoints are protected.

Important rule: workouts and sets can only be created, edited, or deleted for today's plan day.

### Create Workout Log

```http
POST /logs/:planDayId
```

Body:

```json
{
  "completed": true,
  "duration_minutes": 60,
  "notes": "Good session"
}
```

All fields are optional. If `completed` is omitted, it defaults to `false`.

### Update Workout Log

```http
PATCH /logs/:planDayId
```

Body:

```json
{
  "completed": true,
  "duration_minutes": 75,
  "notes": "Updated notes"
}
```

### Get Workout Log

```http
GET /logs/:planDayId
```

Gets the workout log for a specific plan day.

This route is readable for any of the current user's plan days. Create, update, add-set, edit-set, and delete-set actions are restricted to today's plan day.

### Add Set

```http
POST /logs/:planDayId/sets
```

Adds a set. Also updates the personal record if the logged weight is higher than the previous record for that exercise.

Body:

```json
{
  "exercise_id": 1,
  "set_number": 1,
  "reps": 10,
  "weight_kg": 60
}
```

### Update Set

```http
PATCH /logs/:planDayId/sets/:setId
```

Body:

```json
{
  "reps": 12,
  "weight_kg": 65
}
```

### Delete Set

```http
DELETE /logs/:planDayId/sets/:setId
```

Deletes a set.

## Progress

All progress endpoints are protected.

### Get Weight History

```http
GET /progress/weight
```

Returns body weight history.

### Log Weight

```http
POST /progress/weight
```

Body:

```json
{
  "weight_kg": 72.5,
  "logged_at": "2026-05-03"
}
```

### Delete Weight Entry

```http
DELETE /progress/weight/:id
```

Deletes a weight entry.

### Get Measurement History

```http
GET /progress/measurements
```

Returns body measurement history.

### Log Measurements

```http
POST /progress/measurements
```

Body:

```json
{
  "chest_cm": 100,
  "waist_cm": 82,
  "arms_cm": 36,
  "thighs_cm": 58,
  "calves_cm": 38,
  "shoulders_cm": 115,
  "logged_at": "2026-05-03"
}
```

### Delete Measurement Entry

```http
DELETE /progress/measurements/:id
```

Deletes a measurement entry.

### Get Personal Records

```http
GET /progress/records
```

Returns all personal records.

### Get Personal Records By Exercise

```http
GET /progress/records/:exerciseId
```

Returns personal record history for one exercise.

## Analytics

All analytics endpoints are protected.

### Get Stats

```http
GET /analytics/stats
```

Example response:

```json
{
  "totalWorkouts": 10,
  "totalLogs": 12,
  "totalSets": 80,
  "totalExercises": 18,
  "totalVolume": 24500
}
```

### Get Consistency

```http
GET /analytics/consistency
```

Returns plan completion metrics.

Example response:

```json
{
  "totalPlanDays": 30,
  "completedDays": 18,
  "completionRate": 60,
  "currentStreak": 3,
  "bestStreak": 7
}
```

### Get Strength Progress

```http
GET /analytics/strength/:exerciseId
```

Returns logged set entries for one exercise over time.

Example response:

```json
[
  {
    "date": "2026-05-03",
    "exercise_id": 1,
    "exercise_name": "Bench Press",
    "weight_kg": 60,
    "reps": 10
  }
]
```

### Get Calendar

```http
GET /analytics/calendar
```

Returns plan days with completion status.

Example response:

```json
[
  {
    "id": 1,
    "date": "2026-05-03",
    "day_of_week": "SUNDAY",
    "label": "FULL_BODY Day 1",
    "completed": true,
    "log_id": 1
  }
]
```

### Export Workout History

```http
GET /analytics/export
```

Downloads workout history as CSV.

CSV columns:

```csv
date,exercise name,sets,reps,weight_kg
```

## Common Error Responses

### Missing Token

```json
{
  "message": "No token provided"
}
```

### Invalid Or Expired Token

```json
{
  "message": "Invalid or expired token"
}
```

### Validation Error

```json
{
  "errors": [
    {
      "field": "weight_kg",
      "message": "Too small: expected number to be >0"
    }
  ]
}
```

### Service Error

```json
{
  "message": "Profile not found"
}
```
