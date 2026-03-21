# Story 8.1: Email Subscriber Model

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want **an EmailSubscriber model to store parent email subscriptions**,
so that **parents can receive notifications about new content**.

## Acceptance Criteria

### AC1: EmailSubscriber Prisma Model

```gherkin
Given the backend has Prisma configured with PostgreSQL
When the EmailSubscriber model is added to schema.prisma
Then the schema defines an EmailSubscriber model with all required fields:
  - id (Int, auto-increment, primary key)
  - email (String, required, unique)
  - isActive (Boolean, default true)
  - subscriptionTypes (String[], array of values: NEWS, EVENTS, DEADLINES)
  - unsubscribeToken (String, required, unique — for one-click unsubscribe)
  - subscribedAt (DateTime, default now)
  - unsubscribedAt (DateTime, optional/nullable)
And the table maps to "email_subscribers" in the database
And the model has an index on isActive for query performance
```

### AC2: Prisma Migration Succeeds

```gherkin
Given the EmailSubscriber model is added to schema.prisma
When `npx prisma migrate dev --name add-email-subscriber-model` is run
Then the migration completes successfully without errors
And a migration file is created in backend/prisma/migrations/
And the migration creates the "email_subscribers" table in PostgreSQL
And email column has a UNIQUE constraint
And unsubscribe_token column has a UNIQUE constraint
And is_active column has a DEFAULT TRUE value
And subscribed_at column defaults to NOW()
```

## Tasks / Subtasks

### Backend — Schema

- [x] Task 1: Add `EmailSubscriber` model to `backend/prisma/schema.prisma` (AC: 1)
  - [x] Place model after the existing `GalleryImage` model (end of schema file)
  - [x] Add all 7 fields with exact types (see Dev Notes for complete model definition)
  - [x] `id`: `Int @id @default(autoincrement())`
  - [x] `email`: `String @unique`
  - [x] `isActive`: `Boolean @default(true) @map("is_active")`
  - [x] `subscriptionTypes`: `String[] @map("subscription_types")`
  - [x] `unsubscribeToken`: `String @unique @map("unsubscribe_token")`
  - [x] `subscribedAt`: `DateTime @default(now()) @map("subscribed_at") @db.Timestamptz(6)`
  - [x] `unsubscribedAt`: `DateTime? @map("unsubscribed_at") @db.Timestamptz(6)`
  - [x] Add `@@index([isActive])` for bulk notification query performance
  - [x] Add `@@map("email_subscribers")` for snake_case table naming

- [x] Task 2: Run Prisma migration (AC: 2)
  - [x] From `backend/` directory, run: `npx prisma migrate dev --name add-email-subscriber-model`
  - [x] Verify migration file is created in `backend/prisma/migrations/`
  - [x] Run `npx prisma generate` to update the Prisma client types
  - [x] Note: On Windows, an EPERM error may appear during `prisma generate` (known issue from Story 6.1) — TypeScript types are still fully updated; ignore the EPERM warning

### Tests

- [x] Task 3: Create `backend/__test__/email-subscriber-model.test.ts` (AC: 1, 2)
  - [x] Follow exact pattern of `backend/__test__/gallery-models.test.ts`
  - [x] Mock Prisma client using `jest-mock-extended` (`mockDeep`, `mockReset`, `DeepMockProxy`)
  - [x] Test: creates EmailSubscriber with required fields — verifies `isActive` defaults to `true`, `unsubscribedAt` is `null`
  - [x] Test: `email` unique constraint — mock returns Prisma error with `code: 'P2002'` and `meta.target: ['email']`
  - [x] Test: `unsubscribeToken` unique constraint — mock returns Prisma error with `code: 'P2002'` and `meta.target: ['unsubscribe_token']`
  - [x] Test: `unsubscribedAt` is nullable (accepts `null` value)
  - [x] Test: `subscriptionTypes` accepts string array (e.g., `['NEWS', 'EVENTS', 'DEADLINES']`)

## Dev Notes

### Architecture: What This Story Does

Story 8.1 is **backend-only** — it defines the database foundation for the entire Epic 8 Email Notification System. No API endpoints, no frontend changes.

This story establishes:
1. The `EmailSubscriber` Prisma model in `schema.prisma`
2. The PostgreSQL migration creating `email_subscribers` table
3. Model-level tests verifying constraints and default values

All subsequent Epic 8 stories depend on this model being in place.

### Prisma Schema: Exact Model Definition

Add this model at the **end of** `backend/prisma/schema.prisma`, after the closing `}` of the `GalleryImage` model:

```prisma
model EmailSubscriber {
  id                Int       @id @default(autoincrement())
  email             String    @unique
  isActive          Boolean   @default(true) @map("is_active")
  subscriptionTypes String[]  @map("subscription_types")
  unsubscribeToken  String    @unique @map("unsubscribe_token")
  subscribedAt      DateTime  @default(now()) @map("subscribed_at") @db.Timestamptz(6)
  unsubscribedAt    DateTime? @map("unsubscribed_at") @db.Timestamptz(6)

  @@index([isActive])
  @@map("email_subscribers")
}
```

**Schema design decisions:**

- `email @unique` — prevents duplicate subscriptions; the unique constraint creates an implicit DB index, so no separate `@@index([email])` is needed
- `unsubscribeToken @unique` — enforces one-click unsubscribe security; the value is generated in Story 8.2 using `crypto.randomBytes(32).toString('hex')` (no extra dependency needed — Node.js built-in)
- `subscriptionTypes String[]` — PostgreSQL native `TEXT[]` array; valid values: `'NEWS'`, `'EVENTS'`, `'DEADLINES'`; value validation enforced at API layer in Story 8.2 using Zod
- `isActive Boolean @default(true)` — subscriber active by default; set to `false` on unsubscribe in Story 8.2
- `unsubscribedAt DateTime?` — nullable; populated only when subscriber opts out (Story 8.2)
- `@@index([isActive])` — enables efficient `WHERE is_active = true` queries for bulk notification sends in Story 8.4
- `@db.Timestamptz(6)` — **mandatory** for all DateTime fields in this project (matches convention in Job, Gallery, Event, Deadline models)
- No `updatedAt @updatedAt` — subscription state changes are fully captured by `isActive` + `unsubscribedAt`; no need for a generic update timestamp

### Prisma Convention Reference (from existing models)

The `Job` model in the current schema is the closest pattern to follow:

```prisma
// Existing Job model conventions to mirror:
model Job {
  id                  Int        @id @default(autoincrement())
  contactEmail        String     @map("contact_email")          // camelCase → snake_case @map
  isActive            Boolean    @default(true) @map("is_active") // Boolean with default + @map
  publishedAt         DateTime?  @map("published_at") @db.Timestamptz(6) // Optional DateTime
  createdAt           DateTime   @default(now()) @map("created_at") @db.Timestamptz(6) // Required DateTime
  @@index([status, createdAt])
  @@map("jobs")                                                  // @@map for table name
}
```

Every camelCase field name gets a `@map("snake_case")` decorator. Every DateTime field gets `@db.Timestamptz(6)`.

### PostgreSQL String Array

`String[]` in Prisma with the PostgreSQL provider maps to `TEXT[]` natively. No JSON workaround needed:

```prisma
subscriptionTypes String[] @map("subscription_types")
```

Generated SQL: `subscription_types TEXT[] NOT NULL DEFAULT '{}'`

**Querying by subscription type** (relevant to Story 8.4 implementation):
```typescript
// Find all active NEWS subscribers — Story 8.4 will use this pattern:
await prisma.emailSubscriber.findMany({
  where: {
    isActive: true,
    subscriptionTypes: { has: 'NEWS' }, // Prisma array filter
  },
  select: { email: true, unsubscribeToken: true },
});
```

### Migration Command

Run from the `backend/` directory:

```bash
npx prisma migrate dev --name add-email-subscriber-model
```

Expected output (timestamps will differ):
```
Applying migration `20260317000000_add-email-subscriber-model`

The following migration(s) have been applied:
migrations/20260317000000_add-email-subscriber-model/migration.sql

Your database is now in sync with your schema.
✔ Generated Prisma Client
```

**Windows EPERM Warning** (known issue from Story 6.1): On Windows, `npx prisma generate` may emit an EPERM error when unlinking the native DLL. TypeScript types are still fully updated. The issue occurs only when another Node.js process (dev server, test runner) holds the DLL open. Close other processes if needed.

### Epic 8 Forward Context

Understanding what this model enables in future stories helps avoid design mistakes:

- **Story 8.2** (`POST /api/v1/public/subscribe`) — creates `EmailSubscriber` records. Will generate `unsubscribeToken` using `crypto.randomBytes(32).toString('hex')`. Will validate `subscriptionTypes` values against `['NEWS', 'EVENTS', 'DEADLINES']` enum via Zod. The `GET /api/v1/public/unsubscribe?token=...` endpoint sets `isActive = false` + `unsubscribedAt = now()`.

- **Story 8.3** (AWS SES service) — reads `EmailSubscriber` rows but doesn't modify the schema. The `.env.example` will be updated in Story 8.3 to add: `AWS_SES_ACCESS_KEY_ID`, `AWS_SES_SECRET_ACCESS_KEY`, `AWS_SES_REGION`, `AWS_SES_FROM_EMAIL`. The current `.env.example` already has placeholder `EMAIL_*` vars from the boilerplate — Story 8.3 will replace/supplement them.

- **Story 8.4** (publish trigger notifications) — uses `emailSubscriber.findMany({ where: { isActive: true, subscriptionTypes: { has: contentType } } })` where `contentType` is `'NEWS'`, `'EVENTS'`, or `'DEADLINES'`. The `@@index([isActive])` added in this story is specifically for this query pattern.

- **Architecture note**: AWS SES is the designated email provider (3,000 emails/month free tier). Alternative: Brevo (300 emails/day free) if SES setup proves complex. This decision is deferred to Story 8.3.

### Testing Pattern for Model Tests

Follow `backend/__test__/gallery-models.test.ts`. The pattern for model-only stories uses `jest-mock-extended`:

```typescript
// backend/__test__/email-subscriber-model.test.ts
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import prisma from '../src/prisma/prisma-client';

jest.mock('../src/prisma/prisma-client', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});

describe('EmailSubscriber model', () => {
  const baseSubscriberData = {
    email: 'parent@example.com',
    subscriptionTypes: ['NEWS', 'EVENTS'],
    unsubscribeToken: 'abc123-unique-token',
  };

  it('creates subscriber with required fields and correct defaults', async () => {
    const mockSubscriber = {
      id: 1,
      ...baseSubscriberData,
      isActive: true,
      subscribedAt: new Date(),
      unsubscribedAt: null,
    };
    prismaMock.emailSubscriber.create.mockResolvedValue(mockSubscriber);

    const result = await prisma.emailSubscriber.create({ data: baseSubscriberData });

    expect(result.isActive).toBe(true);
    expect(result.unsubscribedAt).toBeNull();
    expect(result.subscriptionTypes).toEqual(['NEWS', 'EVENTS']);
  });

  it('enforces unique constraint on email (Prisma P2002)', async () => {
    const uniqueError = Object.assign(new Error('Unique constraint failed on email'), {
      code: 'P2002',
      meta: { target: ['email'] },
    });
    prismaMock.emailSubscriber.create.mockRejectedValue(uniqueError);

    await expect(
      prisma.emailSubscriber.create({ data: baseSubscriberData })
    ).rejects.toMatchObject({ code: 'P2002', meta: { target: ['email'] } });
  });

  it('enforces unique constraint on unsubscribeToken (Prisma P2002)', async () => {
    const uniqueError = Object.assign(new Error('Unique constraint failed on unsubscribe_token'), {
      code: 'P2002',
      meta: { target: ['unsubscribe_token'] },
    });
    prismaMock.emailSubscriber.create.mockRejectedValue(uniqueError);

    await expect(
      prisma.emailSubscriber.create({
        data: { email: 'new@example.com', subscriptionTypes: ['NEWS'], unsubscribeToken: 'existing-token' },
      })
    ).rejects.toMatchObject({ code: 'P2002', meta: { target: ['unsubscribe_token'] } });
  });

  it('accepts null unsubscribedAt (subscriber remains active)', async () => {
    const mockSubscriber = {
      id: 2,
      email: 'active@example.com',
      isActive: true,
      subscriptionTypes: ['DEADLINES'],
      unsubscribeToken: 'token-xyz',
      subscribedAt: new Date(),
      unsubscribedAt: null,
    };
    prismaMock.emailSubscriber.create.mockResolvedValue(mockSubscriber);

    const result = await prisma.emailSubscriber.create({
      data: { email: 'active@example.com', subscriptionTypes: ['DEADLINES'], unsubscribeToken: 'token-xyz' },
    });

    expect(result.unsubscribedAt).toBeNull();
  });

  it('accepts all three subscriptionTypes in array', async () => {
    const allTypes = ['NEWS', 'EVENTS', 'DEADLINES'];
    const mockSubscriber = {
      id: 3,
      email: 'all@example.com',
      isActive: true,
      subscriptionTypes: allTypes,
      unsubscribeToken: 'full-sub-token',
      subscribedAt: new Date(),
      unsubscribedAt: null,
    };
    prismaMock.emailSubscriber.create.mockResolvedValue(mockSubscriber);

    const result = await prisma.emailSubscriber.create({
      data: { email: 'all@example.com', subscriptionTypes: allTypes, unsubscribeToken: 'full-sub-token' },
    });

    expect(result.subscriptionTypes).toHaveLength(3);
    expect(result.subscriptionTypes).toContain('NEWS');
    expect(result.subscriptionTypes).toContain('EVENTS');
    expect(result.subscriptionTypes).toContain('DEADLINES');
  });
});
```

### Key File Paths

| File | Action | Notes |
|------|--------|-------|
| `backend/prisma/schema.prisma` | Extend | Add `EmailSubscriber` model after `GalleryImage` model |
| `backend/__test__/email-subscriber-model.test.ts` | **NEW** | Model tests using jest-mock-extended |
| `backend/prisma/migrations/YYYYMMDD_add-email-subscriber-model/` | Auto-generated | Created by `prisma migrate dev` |
| **REFERENCE** `backend/__test__/gallery-models.test.ts` | Read only | Test pattern to follow exactly |
| **REFERENCE** `backend/prisma/schema.prisma` (Job model) | Read only | `@map`, `@@map`, `@db.Timestamptz(6)` conventions |

### Previous Story Learnings (from Story 7.5 → Epic 8 transition)

- **Test file location**: `backend/__test__/` (double underscore, NOT `__tests__`) — this is the established backend test directory
- **No frontend work** in this story — Epic 8 has no frontend changes until Story 8.2 adds the subscribe form
- **No XSS middleware changes** — the `email` field will be added to XSS `skipFields` in Story 8.2 when the subscription API is built
- **No admin route** in this story — the admin subscriber count endpoint (`GET /api/v1/subscribers`) is Story 8.2
- **Architecture doc vs. actual**: Architecture doc says co-located tests, but project consistently uses `frontend/src/__tests__/` and `backend/__test__/` directories — follow actual project convention

### Git Intelligence

Recent commit pattern: Stories are committed in batches per epic. Epic 7 (Gallery) was the last completed set. Epic 8 starts fresh. No email-related code exists in the codebase yet — this story lays the groundwork.

### Project Structure Notes

- **No new directories needed** — only 2 files modified/created: `backend/prisma/schema.prisma` (modified) + `backend/__test__/email-subscriber-model.test.ts` (new) + auto-generated migration folder
- **No cross-model relationships** — `EmailSubscriber` is a standalone model with no foreign key relations to other tables
- **No enum needed for subscriptionTypes** — using `String[]` per story specification; enum validation happens at API layer in Story 8.2

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 8, Story 8.1] — Acceptance criteria and field specifications
- [Source: backend/prisma/schema.prisma — Job model] — `@map`, `@@map`, `@db.Timestamptz(6)`, `@@index` conventions
- [Source: backend/prisma/schema.prisma — Gallery/GalleryImage models] — Cascade delete pattern (not needed here), index conventions
- [Source: _bmad-output/planning-artifacts/architecture.md — Email Service section] — AWS SES choice, free tier limits, Brevo fallback option
- [Source: _bmad-output/implementation-artifacts/7-5-public-gallery-display.md#Dev Notes] — Test file location, Prisma patterns, Windows EPERM warning
- [Source: backend/.env.example] — Existing EMAIL_* placeholder vars; AWS SES vars added in Story 8.3

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- Fixed import path in test file: story Dev Notes referenced `'../src/prisma/prisma-client'` but actual project convention (confirmed from `jobs-admin.routes.test.ts`) is `'../prisma/prisma-client'`. Updated both the import and jest.mock paths accordingly.

### Completion Notes List

- ✅ Added `EmailSubscriber` model to `backend/prisma/schema.prisma` after the `Deadline` model (end of file), with all 7 fields, `@@index([isActive])`, and `@@map("email_subscribers")` following project conventions (`@map`, `@@map`, `@db.Timestamptz(6)`)
- ✅ Migration `20260317063436_add_email_subscriber_model` applied successfully — `email_subscribers` table created in PostgreSQL with UNIQUE constraints on `email` and `unsubscribe_token`, DEFAULT TRUE on `is_active`, DEFAULT NOW() on `subscribed_at`
- ✅ Prisma Client regenerated (no EPERM errors on this run)
- ✅ Created `backend/__test__/email-subscriber-model.test.ts` with 5 tests using `jest-mock-extended` — all pass
- ✅ Code review fixes applied: Converted test file from `jest-mock-extended` mocks to real `PrismaClient` (matching `gallery-models.test.ts` pattern). Added 3 new tests: empty `subscriptionTypes` array, `findMany` with `isActive` filter, and unsubscribe update flow. Now 8 tests, all passing against real DB.

### File List

- `backend/prisma/schema.prisma` — Modified: Added `EmailSubscriber` model
- `backend/prisma/migrations/20260317063436_add_email_subscriber_model/migration.sql` — Auto-generated by `prisma migrate dev`
- `backend/__test__/email-subscriber-model.test.ts` — New: Model tests using real PrismaClient (8 tests)

### Change Log

- 2026-03-17: Story 8.1 implemented — EmailSubscriber Prisma model added, migration applied, 5 model tests written and passing
- 2026-03-17: Code review (AI) — Converted tests from jest-mock-extended to real PrismaClient; added 3 tests (empty array, findMany/isActive filter, unsubscribe update); 8 tests passing. Story marked done.
