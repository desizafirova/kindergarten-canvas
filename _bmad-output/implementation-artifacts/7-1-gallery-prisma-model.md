# Story 7.1: Gallery Prisma Model

Status: done

## Story

As a **developer**,
I want **Gallery and GalleryImage models defined in the Prisma schema**,
so that **photo galleries with multiple images can be stored and retrieved**.

## Acceptance Criteria

### AC1: Gallery Model Created

```gherkin
Given the backend has Prisma configured
When the Gallery model is created and migrated
Then the Prisma schema defines a Gallery model with fields:
- id (Int, auto-increment, primary key)
- title (String, required)
- description (String, optional)
- coverImageUrl (String, optional - first image or selected cover)
- status (Enum: DRAFT, PUBLISHED)
- publishedAt (DateTime, optional)
- createdAt (DateTime, default now)
- updatedAt (DateTime, auto-update)
- images (relation to GalleryImage[])
```

### AC2: GalleryImage Model Created

```gherkin
Given the Gallery model exists
When the GalleryImage model is created
Then the Prisma schema defines a GalleryImage model with fields:
- id (Int, auto-increment, primary key)
- galleryId (Int, foreign key to Gallery)
- imageUrl (String, required - Cloudinary URL)
- thumbnailUrl (String, optional - Cloudinary thumbnail transformation)
- altText (String, optional)
- displayOrder (Int, default 0)
- createdAt (DateTime, default now)
And cascade delete is configured (deleting a Gallery removes all its GalleryImages)
```

### AC3: Migration Successful

```gherkin
Given the Gallery and GalleryImage models are defined in schema.prisma
When npx prisma migrate dev --name add-gallery-models runs
Then the migration creates galleries and gallery_images tables in PostgreSQL
And the migration completes without errors
And Prisma Client regenerates with Gallery, GalleryImage, and GalleryStatus types available
```

## Tasks / Subtasks

- [x] **Task 1: Add GalleryStatus Enum** (AC: #1)
  - [x] 1.1: Add `GalleryStatus` enum with `DRAFT` and `PUBLISHED` values to `backend/prisma/schema.prisma`
  - [x] 1.2: Position enum after the existing `JobStatus` enum (following alphabetical/epic order convention)

- [x] **Task 2: Define Gallery Model** (AC: #1)
  - [x] 2.1: Create `Gallery` model (PascalCase — follows Event/Deadline/Job pattern)
  - [x] 2.2: Add required fields: `id`, `title`, `status`, `createdAt`, `updatedAt`
  - [x] 2.3: Add optional fields: `description`, `coverImageUrl`, `publishedAt`
  - [x] 2.4: Apply `@db.Timestamptz(6)` to all DateTime fields (`publishedAt`, `createdAt`, `updatedAt`)
  - [x] 2.5: Apply `@map("snake_case")` to camelCase fields: `coverImageUrl`, `publishedAt`, `createdAt`, `updatedAt`
  - [x] 2.6: Add `@updatedAt` to `updatedAt` field
  - [x] 2.7: Add `@@map("galleries")` for explicit table naming
  - [x] 2.8: Add `images GalleryImage[]` relation field
  - [x] 2.9: Add composite indexes: `@@index([status, createdAt])`

- [x] **Task 3: Define GalleryImage Model** (AC: #2)
  - [x] 3.1: Create `GalleryImage` model (PascalCase)
  - [x] 3.2: Add required fields: `id`, `galleryId`, `imageUrl`, `displayOrder`, `createdAt`
  - [x] 3.3: Add optional fields: `thumbnailUrl`, `altText`
  - [x] 3.4: Add relation: `gallery Gallery @relation(fields: [galleryId], references: [id], onDelete: Cascade)`
  - [x] 3.5: Apply `@map("snake_case")` to camelCase fields: `galleryId`, `imageUrl`, `thumbnailUrl`, `altText`, `displayOrder`, `createdAt`
  - [x] 3.6: Apply `@db.Timestamptz(6)` to `createdAt`
  - [x] 3.7: Add `@@map("gallery_images")` for explicit table naming
  - [x] 3.8: Add composite index: `@@index([galleryId, displayOrder])` for ordered image queries

- [x] **Task 4: Run Migration** (AC: #3)
  - [x] 4.1: Run `npx prisma migrate dev --name add-gallery-models` from `backend/` directory
  - [x] 4.2: Verify migration SQL creates `galleries` and `gallery_images` tables with correct columns
  - [x] 4.3: Verify Prisma Client regenerates — `Gallery`, `GalleryImage`, `GalleryStatus` types available
  - [x] 4.4: Confirm `prisma.gallery` and `prisma.galleryImage` are accessible

## Dev Notes

### Architecture: Complete Tech Stack for Story 7.1

```
Backend (this story — schema only):
  PostgreSQL ← Prisma Gallery + GalleryImage models (NEW migration)
  schema.prisma ← add GalleryStatus enum + Gallery model + GalleryImage model
  Prisma Client ← auto-regenerated after migration

No frontend changes in this story.
No API endpoint changes in this story.
```

### CRITICAL: Follow the NEW Prisma Pattern (Event/Deadline/Job)

There are **two patterns** in the existing schema — use the **NEW pattern** (Event/Deadline/Job):

| Feature | OLD pattern (news_items, teachers) | NEW pattern (Event, Deadline, Job) — USE THIS |
|---|---|---|
| Model name | snake_case (`news_items`) | PascalCase (`Gallery`) |
| Table mapping | none (implicit) | `@@map("galleries")` |
| DateTime fields | plain `DateTime` | `@db.Timestamptz(6)` |
| Column mapping | none | `@map("snake_case")` |
| updatedAt | plain `DateTime` | `DateTime @updatedAt` |
| Indexes | single `@@index([status])` | composite `@@index([status, dateField])` |

### Complete Schema to Add — Exact Prisma Syntax

Add the following **after `model Job { ... }`** and **before `model Event { ... }`** (or after Deadline — order matters for readability):

```prisma
enum GalleryStatus {
  DRAFT
  PUBLISHED
}

model Gallery {
  id             Int           @id @default(autoincrement())
  title          String
  description    String?
  coverImageUrl  String?       @map("cover_image_url")
  status         GalleryStatus @default(DRAFT)
  publishedAt    DateTime?     @map("published_at") @db.Timestamptz(6)
  createdAt      DateTime      @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt      DateTime      @updatedAt @map("updated_at") @db.Timestamptz(6)
  images         GalleryImage[]

  @@index([status, createdAt])
  @@map("galleries")
}

model GalleryImage {
  id            Int      @id @default(autoincrement())
  galleryId     Int      @map("gallery_id")
  gallery       Gallery  @relation(fields: [galleryId], references: [id], onDelete: Cascade)
  imageUrl      String   @map("image_url")
  thumbnailUrl  String?  @map("thumbnail_url")
  altText       String?  @map("alt_text")
  displayOrder  Int      @default(0) @map("display_order")
  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

  @@index([galleryId, displayOrder])
  @@map("gallery_images")
}
```

**Key design decisions:**
- `Gallery` has no `updatedAt` counterpart in `GalleryImage` — images are immutable once uploaded (replaced by delete+re-upload)
- `coverImageUrl` is optional — computed from first image in Story 7.3 if not set
- `displayOrder` defaults to `0` — Story 7.3 will set actual ordering values
- Cascade delete: `onDelete: Cascade` on GalleryImage ensures referential integrity when gallery is deleted
- `@@index([galleryId, displayOrder])` enables efficient ordered image retrieval: `WHERE galleryId = ? ORDER BY displayOrder ASC`
- `@@index([status, createdAt])` on Gallery mirrors the Event/Deadline/Job pattern for admin list queries

### Where to Place in schema.prisma

Current end of schema (after reading `backend/prisma/schema.prisma`):
```
enum JobStatus { DRAFT / PUBLISHED }
model Job { ... @@map("jobs") }
model Event { ... @@map("events") }
model Deadline { ... @@map("deadlines") }
```

**Place after `model Job` and before `model Event`:**
```
enum JobStatus { ... }
model Job { ... }
enum GalleryStatus { ... }   ← NEW
model Gallery { ... }         ← NEW
model GalleryImage { ... }    ← NEW
model Event { ... }
model Deadline { ... }
```

### Migration Command

Run from `backend/` directory (NOT project root):

```bash
cd backend
npx prisma migrate dev --name add-gallery-models
```

**Expected migration SQL (reference — verify against actual output):**
```sql
-- CreateEnum
CREATE TYPE "GalleryStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "galleries" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "cover_image_url" TEXT,
    "status" "GalleryStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "galleries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_images" (
    "id" SERIAL NOT NULL,
    "gallery_id" INTEGER NOT NULL,
    "image_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "alt_text" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gallery_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "galleries_status_created_at_idx" ON "galleries"("status", "created_at");

-- CreateIndex
CREATE INDEX "gallery_images_gallery_id_display_order_idx" ON "gallery_images"("gallery_id", "display_order");

-- AddForeignKey
ALTER TABLE "gallery_images" ADD CONSTRAINT "gallery_images_gallery_id_fkey"
    FOREIGN KEY ("gallery_id") REFERENCES "galleries"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
```

### Previous Story Intelligence (Story 6.1 — Job Prisma Model)

Story 6.1 is the direct template for this story. Key confirmed patterns:
- ✅ PascalCase model naming (`Gallery`, `GalleryImage`) with `@@map("snake_case")` table names
- ✅ `@db.Timestamptz(6)` required on ALL DateTime fields
- ✅ `@map("snake_case")` for all camelCase→snake_case column mappings
- ✅ `@updatedAt` for automatic timestamp management (Gallery only — GalleryImage has no updatedAt)
- ✅ `@@map("table_name")` for explicit table naming
- ✅ Do NOT add `@map()` for fields already snake_case-equivalent (e.g., `status`, `title`)
- ✅ Composite indexes preferred over single-column indexes
- ⚠️ **Windows EPERM on `prisma generate`**: Known issue (tracked in sprint-status.yaml FUTURE ENHANCEMENTS). The TypeScript client files update fully even if DLL unlink fails. Verify types are available in `node_modules/.prisma/client/index.d.ts`, not by the absence of EPERM stderr.

### Previous Story Intelligence (Story 6.8 — Confirmation Email)

Not directly relevant to this schema-only story. No patterns to apply.

### Git Intelligence (Recent Commits)

```
a991f4f Add Stories 4.3-4.4 and Epic 5 (5.1-5.6): Teacher UI, Events & Deadlines management
7d15a44 Add Epic 3 Stories (3.7-3.11) and Story 4.1: News Management & Teacher Model
992ef48 Story 4.2: Teacher CRUD API Endpoints with Code Review Improvements
```

Epic 6 stories (6.1–6.8) are implemented but not committed to git yet (untracked files). This story's changes (schema.prisma + migration) are fully self-contained — no risk of conflicts.

### Project Structure Notes

**Alignment with unified project structure:**
- Schema file: `backend/prisma/schema.prisma` — single file for all models
- Migration directory: `backend/prisma/migrations/` — auto-generated by `prisma migrate dev`
- Run migration from: `backend/` directory (prisma CLI reads `schema.prisma` relative to CWD)
- Prisma client singleton: `backend/src/prisma/prisma-client.ts` — used by all DAOs and controllers
- Prisma model naming: `Gallery` → accessed as `prisma.gallery`; `GalleryImage` → accessed as `prisma.galleryImage`

**Do NOT modify in this story:**
- Any existing models (`User`, `news_items`, `teachers`, `Event`, `Deadline`, `Job`)
- Any API routes, controllers, or services
- Any frontend files

**Do NOT create in this story:**
- DAO files (Story 7.2)
- Route/controller files (Story 7.2)
- Frontend components (Stories 7.3–7.5)

### Known Schema Debt (Do NOT Fix in This Story)

From Story 6.1 code review — old models have missing patterns but are out of scope:
- `news_items` lacks `@updatedAt`, `@db.Timestamptz(6)`, and `@@map()`
- `teachers` lacks `@updatedAt`, `@db.Timestamptz(6)`, and `@@map()`

### References

- Existing Prisma schema (pattern reference + placement): [backend/prisma/schema.prisma](backend/prisma/schema.prisma)
- Story 6.1 (direct template for this story type): [_bmad-output/implementation-artifacts/6-1-job-prisma-model.md](_bmad-output/implementation-artifacts/6-1-job-prisma-model.md)
- Story 5.1 (Event/Deadline model — established the NEW pattern): [_bmad-output/implementation-artifacts/5-1-event-and-deadline-prisma-models.md](_bmad-output/implementation-artifacts/5-1-event-and-deadline-prisma-models.md)
- Prisma client singleton: [backend/src/prisma/prisma-client.ts](backend/src/prisma/prisma-client.ts)
- Epic 7 requirements (Story 7.1–7.5): [_bmad-output/planning-artifacts/epics.md](_bmad-output/planning-artifacts/epics.md)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- Migration `20260314192147_add_gallery_models` applied successfully. EPERM on DLL unlink is the known Windows issue (tracked in sprint-status.yaml FUTURE ENHANCEMENTS). TypeScript types confirmed available in `node_modules/.prisma/client/index.d.ts`.

### Completion Notes List

- Added `GalleryStatus` enum (DRAFT/PUBLISHED) after `JobStatus` enum in schema.prisma, following epic order convention.
- Added `Gallery` model with all required/optional fields, `@db.Timestamptz(6)` on all DateTime fields, `@map()` on all camelCase fields, `@updatedAt`, `@@map("galleries")`, `images GalleryImage[]` relation, and `@@index([status, createdAt])`.
- Added `GalleryImage` model with cascade delete (`onDelete: Cascade`), all column mappings, `@@map("gallery_images")`, and `@@index([galleryId, displayOrder])`.
- Migration `20260314192147_add_gallery_models` created and applied. SQL matches expected reference exactly.
- Prisma Client regenerated: `Gallery`, `GalleryImage`, `GalleryStatus` types confirmed in `index.d.ts`; `prisma.gallery` and `prisma.galleryImage` delegates confirmed available.
- No frontend or API changes made in this story (schema-only story).
- **Code Review Fixes (2026-03-14)**: Added `gallery-models.test.ts` with integration tests covering Gallery CRUD, GalleryImage CRUD, cascade delete, and GalleryStatus enum enforcement. Added schema comment on `coverImageUrl` documenting application-layer staleness responsibility (Story 7.3).

### File List

- `backend/prisma/schema.prisma` (modified — added GalleryStatus enum, Gallery model, GalleryImage model; added coverImageUrl staleness comment)
- `backend/prisma/migrations/20260314192147_add_gallery_models/migration.sql` (created)
- `backend/__test__/gallery-models.test.ts` (created — model integration tests for Gallery, GalleryImage, cascade delete, enum enforcement)

## Change Log

- 2026-03-14: Story 7.1 implemented — added GalleryStatus enum, Gallery model, GalleryImage model to Prisma schema; migration applied; Prisma Client regenerated.
- 2026-03-14: Code review (AI) — fixed M1 (created gallery-models.test.ts integration tests), fixed M2 (added coverImageUrl staleness comment to schema). L1/L2/L3 acknowledged as intentional design / future story concerns. Status → done.
