# Story 6.1: Job Prisma Model

Status: done

## Story

As a **developer**,
I want **a Job model defined in the Prisma schema**,
so that **job postings can be stored and retrieved from the database**.

## Acceptance Criteria

### AC1: Job Model Created

```gherkin
Given the backend has Prisma configured
When the Job model is created and migrated
Then the Prisma schema defines a Job model with fields:
- id (Int, auto-increment, primary key)
- title (String, required - job title)
- description (String, required - rich text from TipTap)
- requirements (String, optional - qualifications, rich text)
- contactEmail (String, required - where to send applications)
- applicationDeadline (DateTime, optional)
- isActive (Boolean, default true - accepting applications)
- status (Enum: DRAFT, PUBLISHED)
- publishedAt (DateTime, optional)
- createdAt (DateTime, default now)
- updatedAt (DateTime, auto-update)
```

### AC2: Migration Successful

```gherkin
Given the Job model is defined in schema.prisma
When npx prisma migrate dev --name add-job-model runs
Then the migration creates the jobs table in PostgreSQL
And the migration completes successfully without errors
And Prisma Client regenerates with Job types available
```

## Tasks / Subtasks

- [x] **Task 1: Add JobStatus Enum** (AC: #1)
  - [x] 1.1: Add `JobStatus` enum with `DRAFT` and `PUBLISHED` values to `backend/prisma/schema.prisma`
  - [x] 1.2: Position enum with other existing enums (`NewsStatus`, `TeacherStatus`, `EventStatus`, `DeadlineStatus`, `Role`)

- [x] **Task 2: Define Job Model** (AC: #1)
  - [x] 2.1: Create `Job` model (PascalCase — follows Event/Deadline pattern, NOT news_items/teachers pattern)
  - [x] 2.2: Add required fields: `id`, `title`, `description`, `contactEmail`, `status`, `createdAt`, `updatedAt`
  - [x] 2.3: Add optional fields: `requirements`, `applicationDeadline`, `publishedAt`
  - [x] 2.4: Add `isActive Boolean @default(true)` with `@map("is_active")`
  - [x] 2.5: Apply `@db.Timestamptz(6)` to all DateTime fields (applicationDeadline, publishedAt, createdAt, updatedAt)
  - [x] 2.6: Apply `@map("snake_case")` directives for camelCase fields: `contactEmail`, `applicationDeadline`, `isActive`, `publishedAt`, `createdAt`, `updatedAt`
  - [x] 2.7: Add `@updatedAt` to `updatedAt` field for automatic timestamp management
  - [x] 2.8: Add `@@map("jobs")` for explicit table naming
  - [x] 2.9: Add composite indexes for query optimization (see Dev Notes)

- [x] **Task 3: Run Migration** (AC: #2)
  - [x] 3.1: Run `npx prisma migrate dev --name add-job-model` from `backend/` directory
  - [x] 3.2: Verify the migration SQL in `backend/prisma/migrations/` creates `jobs` table with correct columns
  - [x] 3.3: Verify Prisma Client regenerates successfully (no TypeScript errors)
  - [x] 3.4: Confirm `prisma.job` is accessible in application code

## Dev Notes

### Architecture: Complete Tech Stack for Story 6.1

```
Backend (this story - schema only):
  PostgreSQL ← Prisma Job model (NEW migration)
  schema.prisma ← add JobStatus enum + Job model
  Prisma Client ← auto-regenerated after migration

No frontend changes in this story.
No API endpoint changes in this story.
```

### CRITICAL: Which Prisma Pattern to Follow

There are **two patterns** in the existing schema — use the **NEW pattern** (Event/Deadline):

| Feature | OLD pattern (news_items, teachers) | NEW pattern (Event, Deadline) — USE THIS |
|---|---|---|
| Model name | snake_case (`news_items`) | PascalCase (`Event`) |
| Table mapping | none (implicit) | `@@map("events")` |
| DateTime fields | plain `DateTime` | `@db.Timestamptz(6)` |
| Column mapping | none | `@map("snake_case")` |
| updatedAt | plain `DateTime` | `DateTime @updatedAt` |
| Indexes | single `@@index([status])` | composite `@@index([status, dateField])` |

**Prisma client access:** `prisma.job` (lowercase of model name `Job`)

### Complete Job Model — Exact Schema to Add

Add to `backend/prisma/schema.prisma`:

```prisma
enum JobStatus {
  DRAFT
  PUBLISHED
}

model Job {
  id                  Int        @id @default(autoincrement())
  title               String
  description         String
  requirements        String?
  contactEmail        String     @map("contact_email")
  applicationDeadline DateTime?  @map("application_deadline") @db.Timestamptz(6)
  isActive            Boolean    @default(true) @map("is_active")
  status              JobStatus  @default(DRAFT)
  publishedAt         DateTime?  @map("published_at") @db.Timestamptz(6)
  createdAt           DateTime   @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt           DateTime   @updatedAt @map("updated_at") @db.Timestamptz(6)

  @@index([status, createdAt])
  @@index([isActive, status])
  @@map("jobs")
}
```

**Key decisions:**
- `description` is **required** (`String`, NOT `String?`) — job descriptions are mandatory. Differs from Event.description which is optional.
- `requirements` is **optional** (`String?`) — not all jobs need explicit requirements
- `contactEmail` is **required** (`String`) — applications must go somewhere
- `isActive` boolean controls whether applications are accepted (separate from `status` which controls visibility)
- Two indexes: `[status, createdAt]` for admin list queries, `[isActive, status]` for "accepting applications" filter in Story 6.5

### Where to Place in schema.prisma

Current schema structure:
```
generator client { ... }
datasource db { ... }
model User { ... }
model news_items { ... }
model teachers { ... }
enum NewsStatus { ... }
enum Role { ... }
enum TeacherStatus { ... }
enum EventStatus { ... }
enum DeadlineStatus { ... }
model Event { ... }
model Deadline { ... }
```

Add **after** `enum DeadlineStatus` and **before or after** `model Deadline`:
```
enum JobStatus { ... }   ← add here
model Job { ... }        ← add here
```

### Migration Command

Run from `backend/` directory (NOT project root):

```bash
cd backend
npx prisma migrate dev --name add-job-model
```

This will:
1. Generate migration SQL in `backend/prisma/migrations/YYYYMMDDHHMMSS_add_job_model/migration.sql`
2. Apply the migration to the PostgreSQL database
3. Regenerate Prisma Client with `Job` and `JobStatus` types

**Expected migration SQL (reference — verify against actual output):**
```sql
-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "jobs" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "contact_email" TEXT NOT NULL,
    "application_deadline" TIMESTAMPTZ(6),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "jobs_status_created_at_idx" ON "jobs"("status", "created_at");

-- CreateIndex
CREATE INDEX "jobs_is_active_status_idx" ON "jobs"("is_active", "status");
```

### Previous Story Intelligence (Story 5.1 — Event and Deadline Prisma Models)

- ✅ Established PascalCase model naming as the standard for new models
- ✅ Confirmed `@db.Timestamptz(6)` is required for all DateTime fields
- ✅ Confirmed `@map("snake_case")` for camelCase→database column mapping
- ✅ Confirmed `@updatedAt` for automatic timestamp management
- ✅ Confirmed `@@map("table_name")` for explicit table naming
- ✅ Composite indexes: `@@index([status, dateField])` and `@@index([status, createdAt])`
- ⚠️ Code review issue from Story 5.1: Do NOT add redundant `@map("title")` or `@map("status")` for fields whose names are already snake_case — only map fields where camelCase differs from snake_case

### Previous Story Intelligence (Story 5.7 — text-utils.ts)

- `frontend/src/lib/text-utils.ts` was created in Story 5.7 (uses DOM-based HTML stripping)
- Job 6.4 (public display) will use this utility — do NOT recreate it in Story 6.4

### Architecture Constraints from Story 5.1 Code Review (Known Debt)

The code review for Story 5.1 identified architectural debt in the **old models** (`news_items`, `teachers`) that needs to be fixed eventually but is NOT in scope for this story:
- `news_items` lacks `@updatedAt`, `@db.Timestamptz(6)`, and `@@map()`
- `teachers` lacks `@updatedAt`, `@db.Timestamptz(6)`, and `@@map()`

**Do NOT fix these in Story 6.1** — stay focused. These will be addressed separately.

### Git Intelligence (Recent Commits)

```
a991f4f Add Stories 4.3-4.4 and Epic 5 (5.1-5.6): Teacher UI, Events & Deadlines management
7d15a44 Add Epic 3 Stories (3.7-3.11) and Story 4.1: News Management & Teacher Model
992ef48 Story 4.2: Teacher CRUD API Endpoints with Code Review Improvements
```

Story 5.7 is implemented but not yet committed (untracked file in git). This story's changes (schema.prisma + migration) are self-contained.

### Project Structure Notes

- **Schema file location:** `backend/prisma/schema.prisma` — single file for all models
- **Migration directory:** `backend/prisma/migrations/` — auto-generated by `prisma migrate dev`
- **Run migration from:** `backend/` directory (prisma CLI reads `schema.prisma` relative to CWD)
- **Prisma client path:** `backend/src/prisma/prisma-client.ts` — singleton instance used by all DAOs and controllers
- **Prisma model naming:** `Job` (PascalCase) → accessed as `prisma.job` in application code
- **DO NOT modify** any existing models (`User`, `news_items`, `teachers`, `Event`, `Deadline`) in this story
- **DO NOT add API endpoints** in this story — that's Story 6.2

### References

- Existing Prisma schema (reference for pattern and placement): [backend/prisma/schema.prisma](backend/prisma/schema.prisma)
- Story 5.1 (Event/Deadline model story — master reference for this story type): [_bmad-output/implementation-artifacts/5-1-event-and-deadline-prisma-models.md](_bmad-output/implementation-artifacts/5-1-event-and-deadline-prisma-models.md)
- Story 4.1 (Teacher model story): [_bmad-output/implementation-artifacts/4-1-teacher-prisma-model.md](_bmad-output/implementation-artifacts/4-1-teacher-prisma-model.md)
- Epic 6 requirements (Story 6.1–6.8): [_bmad-output/planning-artifacts/epics.md](_bmad-output/planning-artifacts/epics.md) (line 1745)
- Prisma client singleton: [backend/src/prisma/prisma-client.ts](backend/src/prisma/prisma-client.ts)
- Architecture doc (data model section): [_bmad-output/planning-artifacts/architecture.md](_bmad-output/planning-artifacts/architecture.md)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

_No issues encountered._

### Completion Notes List

- Added `JobStatus` enum (DRAFT/PUBLISHED) positioned after `DeadlineStatus` in schema.prisma
- Added `Job` model following the new PascalCase/Event/Deadline pattern with all required fields, optional fields, `@db.Timestamptz(6)` on all DateTime fields, `@map()` directives for snake_case column names, `@updatedAt` on updatedAt, `@@map("jobs")`, and two composite indexes
- Migration `20260308073024_add_job_model` applied successfully — `jobs` table created in PostgreSQL with correct schema
- Prisma Client regenerated: `Job` type and `JobStatus` enum confirmed present in `node_modules/.prisma/client/index.d.ts`; `prisma.job` accessor available
- TypeScript compilation passes with no errors (`npx tsc --noEmit` clean)
- Note: `EPERM` on DLL unlink during generate is a known Windows file-lock issue when another Node.js process holds the binary; the TypeScript/JS client files were fully updated and all types are available. Tracked as project-level known issue in sprint-status.yaml FUTURE ENHANCEMENTS.
- **Migration side-effect (documented):** Migration `20260308073024_add_job_model` includes `DROP INDEX "teachers_status_idx"` — an unrelated cleanup of migration drift from Epic 4. The original teacher migration (20260228102140) created both `teachers_status_idx` (single-column) and `teachers_status_displayOrder_idx` (composite), but the schema only declares `@@index([status, displayOrder])`. Prisma detected the orphaned single-column index and bundled the DROP into this migration. The cleanup is correct and harmless; this note exists for transparency.

### File List

- `backend/prisma/schema.prisma` (modified — added JobStatus enum and Job model)
- `backend/prisma/migrations/20260308073024_add_job_model/migration.sql` (created — new migration)

### Change Log

- Story 6.1 implemented: Added JobStatus enum and Job Prisma model; migration applied; Prisma Client regenerated (Date: 2026-03-08)
- Story 6.1 code review passed: 1 Medium (migration side-effect documented), 2 Low (EPERM tracked in sprint-status, no automated test acceptable for schema-only story). Status → done (Date: 2026-03-08)
