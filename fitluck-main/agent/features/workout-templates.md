````markdown id="v4m2kp"
# RTCF Prompt — Workout Templates Feature (Minimal & Non-Breaking)

## R — Role

Act as a senior full-stack engineer working on the current Node.js + Prisma + PostgreSQL project. Your task is to implement a new **Workout Templates** feature while strictly following the existing project architecture, database patterns, API conventions, UI system, folder structure, and coding standards already used in the project.

The implementation must be isolated, minimal, maintainable, and should NOT impact any existing functionality.

---

## T — Task

Implement a new feature called:

```bash
Workout Templates
````

Add a new sidebar navigation route:

```bash id="6d8g8t"
/workout-templates
```

The feature should allow users to:

* Create workout templates
* Save reusable workout routines
* View all saved templates
* Reuse/select an existing template
* Delete templates

Do NOT add extra features beyond the requirements above.

---

# Backend Requirements (Node.js + Prisma + PostgreSQL)

Follow the existing backend structure and conventions already present in the project.

Create Prisma models for workout templates.

Suggested schema:

```prisma id="wcz1oz"
model WorkoutTemplate {
  id          String                    @id @default(cuid())
  name        String
  description String?
  exercises   WorkoutTemplateExercise[]
  createdAt   DateTime                  @default(now())
  updatedAt   DateTime                  @updatedAt
}

model WorkoutTemplateExercise {
  id                String           @id @default(cuid())
  workoutTemplateId String
  exerciseName      String
  sets              Int
  reps              Int
  restSeconds       Int?

  workoutTemplate WorkoutTemplate @relation(fields: [workoutTemplateId], references: [id], onDelete: Cascade)
}
```

Generate:

* Prisma migration
* REST APIs
* Controllers/services
* Validation handling
* Proper error responses

Suggested APIs:

```bash id="1c6pcg"
POST   /api/workout-templates
GET    /api/workout-templates
GET    /api/workout-templates/:id
DELETE /api/workout-templates/:id
```

Reuse:

* Existing Prisma client setup
* Existing middleware
* Existing API response structure
* Existing validation patterns

Do NOT refactor existing backend code.

---

# Frontend Requirements

Add a new route:

```bash id="4u2gcd"
/workout-templates
```

Create a responsive page matching the existing dashboard/app design system.

---

# Page Features

## Templates List Section

Display saved workout templates in responsive cards.

Each card should show:

* Template name
* Optional description
* Number of exercises
* Created date
* Actions:

  * View
  * Use Template
  * Delete

Use the current project card styles and spacing system.

---

# Create Template Modal/Page

Allow users to create a workout template.

Fields:

* Template name
* Optional description
* Exercises list

Each exercise should support:

* Exercise name
* Sets
* Reps
* Optional rest time

Support:

* Add exercise
* Remove exercise

Keep UI simple and minimal.

---

# Use Template Behavior

When user clicks:

```bash
Use Template
```

Simply return/select the template data for reuse in future workout flows.

Do NOT implement full workout session logic unless already connected in the current architecture.

Keep implementation minimal and isolated.

---

# Suggested Structure

```bash id="lmbx9t"
backend/
  prisma/schema.prisma
  routes/workoutTemplates.routes.ts
  controllers/workoutTemplates.controller.ts
  services/workoutTemplates.service.ts

frontend/
  components/workout-templates/
    WorkoutTemplateCard.tsx
    CreateWorkoutTemplateModal.tsx
    ExerciseFormRow.tsx
    WorkoutTemplateList.tsx

  app/workout-templates/page.tsx
```

---

## C — Constraints

* Do NOT add extra functionality
* Do NOT modify unrelated existing code
* Do NOT impact existing functionality
* Follow current project architecture exactly
* Reuse existing components/styles where possible
* Keep implementation isolated and minimal
* Use Prisma with PostgreSQL
* Use TypeScript best practices
* Fully responsive UI
* No unnecessary dependencies
* No unnecessary global state management
* Keep API and folder structure aligned with the current project
* Avoid over-engineering

---

## F — Format

Generate:

1. Prisma schema updates
2. Database migration
3. Backend API implementation
4. Controllers/services
5. Frontend route/page
6. Create template modal/form
7. Workout template cards/list
8. API integration
9. Validation handling
10. Minimal non-breaking implementation only

The final implementation should integrate seamlessly into the current project while maintaining consistency with the existing architecture, backend patterns, and UI design system.

```
```
