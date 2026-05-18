# RTCF Prompt — Progress Photos Gallery (Minimal & Non-Breaking)

## R — Role

Act as a senior full-stack engineer working on the current Node.js + Prisma + PostgreSQL project. Your task is to implement a new **Progress Photos Gallery** feature by strictly following the existing project architecture, coding standards, API structure, Prisma patterns, folder structure, UI system, and database conventions already used in the project.

The implementation must be isolated, minimal, and should NOT impact any existing functionality.

---

## T — Task

Add a new sidebar navigation item:

```bash
Progress Photos
````

Create a new route:

```bash id="mr4mcs"
/progress-photos
```

Implement a simple Progress Photos Gallery where users can:

* Upload progress photos
* Add a date
* Add optional notes
* View uploaded photos in a gallery/grid
* Delete photos

Do NOT add extra features beyond the requirements described above.

---

# Backend Requirements (Node.js + Prisma + PostgreSQL)

Follow existing backend architecture and patterns already used in the project.

Create a Prisma model for progress photos.

Suggested schema:

```prisma id="4j9o5v"
model ProgressPhoto {
  id        String   @id @default(cuid())
  imageUrl  String
  note      String?
  date      DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Generate:

* Prisma migration
* Controller/service logic
* REST API routes
* Validation handling
* Proper error responses

Suggested APIs:

```bash id="2gkktd"
POST   /api/progress-photos
GET    /api/progress-photos
DELETE /api/progress-photos/:id
```

Use the existing:

* Express route structure
* Middleware
* Error handling
* Prisma client setup
* Response formatting conventions

Do NOT refactor existing backend code.

---

# Frontend Requirements

Add a new sidebar navigation route and page:

```bash id="yw8xgr"
/progress-photos
```

Page requirements:

* Responsive grid gallery
* Upload photo form/modal
* Date input
* Optional notes textarea
* Image preview
* Delete functionality

Each card should show:

* Photo
* Date
* Optional note
* Delete action

Use the current project theme and existing reusable UI components.

---

# Upload Handling

Use the same upload/storage approach already present in the project if available.

If no upload system exists:

* Keep implementation minimal
* Use simple local upload handling already compatible with current backend structure
* Do NOT introduce unnecessary services or libraries

Supported:

* JPG
* PNG
* WEBP

Add basic validation:

* Required image
* Required date
* File size validation

---

# Suggested Structure

```bash id="2n8x1s"
backend/
  prisma/schema.prisma
  routes/progressPhotos.routes.ts
  controllers/progressPhotos.controller.ts
  services/progressPhotos.service.ts

frontend/
  components/progress-photos/
    ProgressPhotoCard.tsx
    UploadPhotoModal.tsx
    PhotoGallery.tsx

  app/progress-photos/page.tsx
```

---

## C — Constraints

* Do NOT add additional features
* Do NOT refactor unrelated code
* Do NOT impact existing functionality
* Follow existing project architecture exactly
* Reuse existing UI/components/styles
* Keep implementation minimal and isolated
* Use Prisma with PostgreSQL
* Use TypeScript best practices
* Keep API structure consistent with existing backend
* Fully responsive UI
* No unnecessary dependencies
* No state management library additions
* No authentication changes unless already required by existing architecture

---

## F — Format

Generate:

1. Prisma schema changes
2. Migration setup
3. Backend API implementation
4. Frontend route/page
5. Upload modal/form
6. Gallery grid UI
7. API integration
8. Validation handling
9. Minimal non-breaking implementation only

The implementation must feel native to the current project and integrate seamlessly without affecting existing features or architecture.

```
```
