# Story 5.2: Events CRUD API Endpoints

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want **RESTful API endpoints for Event CRUD operations**,
so that **the admin panel can manage calendar events**.

## Acceptance Criteria

### AC1: GET All Events Endpoint

```gherkin
Given the admin is authenticated with a valid JWT
When GET /api/admin/v1/events is requested
Then the response is 200 with JSend success format:
  { status: 'success', data: { events: [...] } }
  Wait - the admin API uses httpMsg pattern: { success: true, message: 'Success', content: [...] }
And events are sorted by eventDate ASC (upcoming first)
And all events (DRAFT and PUBLISHED) are returned for admin panel
```

### AC2: GET Events with Status Filter

```gherkin
Given the admin is authenticated
When GET /api/admin/v1/events?status=PUBLISHED is requested
Then only PUBLISHED events are returned
When GET /api/admin/v1/events?status=DRAFT is requested
Then only DRAFT events are returned
When GET /api/admin/v1/events with no filter
Then all events regardless of status are returned
```

### AC3: GET Events with Upcoming Filter

```gherkin
Given the admin is authenticated
When GET /api/admin/v1/events?upcoming=true is requested
Then only events where eventDate >= current datetime are returned
And results are sorted by eventDate ASC
```

### AC4: GET Single Event Endpoint

```gherkin
Given the admin is authenticated
When GET /api/admin/v1/events/:id is requested with a valid ID
Then the response is 200 with the event data
When GET /api/admin/v1/events/:id is requested with a non-existent ID
Then the response is 404 with message "Събитието не е намерено"
```

### AC5: POST Create Event Endpoint

```gherkin
Given the admin is authenticated
When POST /api/admin/v1/events is requested with valid body:
  { title: "Пролетен концерт", eventDate: "2026-04-15T10:00:00.000Z" }
Then a new event is created with:
  - status defaulting to DRAFT
  - isImportant defaulting to false
  - Response is 201 with created event data
When required fields are missing (title or eventDate)
Then response is 400/422 with validation error
```

### AC6: PUT Update Event Endpoint

```gherkin
Given the admin is authenticated
When PUT /api/admin/v1/events/:id is requested with valid body
Then the event is updated and updatedAt timestamp is refreshed automatically
And response is 200 with updated event data
When :id does not exist
Then response is 404 with message "Събитието не е намерено"
```

### AC7: DELETE Event Endpoint

```gherkin
Given the admin is authenticated
When DELETE /api/admin/v1/events/:id is requested with valid ID
Then the event is permanently deleted
And response is 200 with message "Събитието е изтрито успешно"
When :id does not exist
Then response is 404 with message "Събитието не е намерено"
```

### AC8: Authentication Required

```gherkin
Given a request is made without a valid JWT token
When any /api/admin/v1/events endpoint is called
Then the response is 401 Unauthorized
```

## Tasks / Subtasks

- [x] Task 1: Create Zod validation schema (AC: 5, 6)
  - [x] Create `backend/src/schemas/event_schema.ts`
  - [x] Define `createEvent` schema: title (required string min 1), eventDate (required ISO datetime string), eventEndDate (optional ISO datetime string), location (optional string), description (optional string), isImportant (optional boolean), imageUrl (optional string URL or empty), status (optional enum DRAFT|PUBLISHED)
  - [x] Define `updateEvent` schema: params id + body with all fields optional (same types as create)
  - [x] Define `getEventById` schema: params id as string → transform Number
  - [x] Define `getEventList` schema: query with optional status enum and optional upcoming boolean string
  - [x] Export TypeScript types for each schema

- [x] Task 2: Create constants file (AC: 1, 2, 3, 4)
  - [x] Create `backend/src/constants/event_constants.ts`
  - [x] Define `EVENT_SELECT` object with all Event fields: id, title, description, eventDate, eventEndDate, location, isImportant, imageUrl, status, publishedAt, createdAt, updatedAt

- [x] Task 3: Create DAO layer (AC: 1-7)
  - [x] Create `backend/src/dao/event/event_get_all_dao.ts` - `prisma.event.findMany({ where, select, orderBy })`
  - [x] Create `backend/src/dao/event/event_get_one_dao.ts` - `prisma.event.findUnique({ where: { id }, select })`
  - [x] Create `backend/src/dao/event/event_create_dao.ts` - `prisma.event.create({ data, select })`
  - [x] Create `backend/src/dao/event/event_update_dao.ts` - `prisma.event.update({ where: { id }, data, select })`
  - [x] Create `backend/src/dao/event/event_delete_dao.ts` - `prisma.event.delete({ where: { id } })`
  - [x] All DAOs follow teacher DAO pattern: import prisma + logger, return `{ success, data, error }`

- [x] Task 4: Create service layer (AC: 1-7)
  - [x] Create `backend/src/services/admin/event/event_get_all_service.ts` - handle status filter + upcoming filter, sort by eventDate ASC
  - [x] Create `backend/src/services/admin/event/event_get_one_service.ts` - return 404 if not found
  - [x] Create `backend/src/services/admin/event/event_create_service.ts` - default status=DRAFT, isImportant=false
  - [x] Create `backend/src/services/admin/event/event_update_service.ts` - check existence first, return 404 if not found
  - [x] Create `backend/src/services/admin/event/event_delete_service.ts` - check existence, return Bulgarian success message
  - [x] Create `backend/src/services/admin/event/index.ts` - export all services as `{ getAll, getOne, create, update, remove }`

- [x] Task 5: Create admin controller (AC: 1-8)
  - [x] Create `backend/src/controllers/admin/event_controller.ts`
  - [x] Implement `getAll`, `getOne`, `create`, `update`, `remove` following exact teacher_controller.ts pattern
  - [x] Each handler: call service → `.then(result => res.status(result.httpStatusCode).json(result.data))` → `.catch(err => next(err))`

- [x] Task 6: Create admin route file (AC: 1-8)
  - [x] Create `backend/src/routes/admin/v1/event_route.ts`
  - [x] Register routes with auth('jwt-user') + validate(schema) + controller:
    - `GET /` → getEventList schema → ctrlEvent.getAll
    - `GET /:id` → getEventById schema → ctrlEvent.getOne
    - `POST /` → createEvent schema → ctrlEvent.create
    - `PUT /:id` → updateEvent schema → ctrlEvent.update
    - `DELETE /:id` → getEventById schema → ctrlEvent.remove

- [x] Task 7: Register event route in admin index (AC: 1-8)
  - [x] Edit `backend/src/routes/admin/v1/index.ts`
  - [x] Import `eventRoute` and add `{ path: '/events', route: eventRoute }` to defaultRoutes array

- [x] Task 8: Update XSS middleware for rich text (AC: 5, 6)
  - [x] Edit `backend/src/middlewares/xss/xss.ts`
  - [x] Add `'description'` to `skipFields` array (description is TipTap rich text HTML already sanitized by DOMPurify on frontend)
  - [x] Result: `const skipFields = ['content', 'bio', 'description', 'displayOrder', 'isImportant'];` (isImportant also added to preserve boolean type)

- [x] Task 9: Write integration tests (AC: 1-8)
  - [x] Create `backend/__test__/events-admin.routes.test.ts`
  - [x] Use supertest + Jest, following teacher.routes.test.ts pattern for admin auth
  - [x] Use `[TEST]` prefix in test data, clean up in beforeEach/afterAll
  - [x] Test cases: list all, list with status filter, list with upcoming filter, get by ID, get 404, create valid, create missing required fields, update valid, update 404, delete valid, delete 404, no auth returns 401

## Dev Notes

### Architecture: Project Layer Pattern (MANDATORY)

This project uses a strict **5-layer architecture**. Follow this exact chain — **no shortcuts**:

```
Route → Controller → Service → DAO → Prisma
```

Each layer has a single responsibility:
- **Routes** (`routes/admin/v1/`): HTTP method binding + auth middleware + schema validation
- **Controllers** (`controllers/admin/`): Extract params, call service, return HTTP response
- **Services** (`services/admin/event/`): Business logic, 404 checks, default values
- **DAOs** (`dao/event/`): Prisma calls only, return `{ success, data, error }`
- **Prisma**: Database

**Do NOT bypass layers.** Controllers never call DAOs directly. Services contain all business logic.

### Critical: Prisma Model Name

The Prisma schema uses `Event` (PascalCase) with `@@map("events")`. Access via:
```typescript
prisma.event.findMany(...)   // ✅ CORRECT - Prisma client uses PascalCase
prisma.events.findMany(...)  // ❌ WRONG - this would be the legacy news/teacher pattern
```

Compare with legacy models:
- `prisma.news_items` (old pattern — do NOT follow for Event)
- `prisma.teachers` (old pattern — do NOT follow for Event)
- `prisma.event` (correct pattern for Event, following Prisma PascalCase)

### Critical: httpMsg Response Format

Admin API uses `httpMsg` utility (NOT JSend format). The response shape is:

```typescript
// 200 Success:    { success: true, message: 'Success', content: data }
// 201 Created:    { success: true, message: 'Successfully create', content: data }
// 404 Not Found:  { success: false, message: 'Събитието не е намерено', error: errCode }
// 422 Error:      { success: false, message: 'Failed to...', error: errCode }
```

The controller just does: `res.status(result.httpStatusCode).json(result.data)`

Public endpoints (like news_controller.ts) use JSend format — but that's only for public routes. Admin routes use httpMsg.

### Critical: Sorting Events by eventDate

Events MUST be sorted ascending by eventDate (upcoming first):

```typescript
const orderBy = [{ eventDate: 'asc' as const }];
```

This differs from teachers (sorted by displayOrder, then lastName).

### Upcoming Filter Implementation

```typescript
// In event_get_all_service.ts
if (upcomingFilter === 'true') {
  where = { ...where, eventDate: { gte: new Date() } };
}
```

Combine with status filter if both provided:
```typescript
const where: any = {};
if (statusFilter) where.status = statusFilter;
if (upcoming === 'true') where.eventDate = { gte: new Date() };
```

### Default Values on Create

```typescript
// In event_create_service.ts
const dataWithDefaults = {
  ...eventData,
  status: eventData.status || 'DRAFT',
  isImportant: eventData.isImportant ?? false,
};
```

### Delete Service: Bulgarian Success Message

Follow teacher_delete_service.ts pattern exactly:

```typescript
// Return custom success object (not httpMsg.http200)
return {
  httpStatusCode: 200,
  data: {
    success: true,
    message: 'Събитието е изтрито успешно',
    content: null,
  },
};
```

### XSS Middleware: description Field Must Be Skipped

The `description` field contains TipTap HTML (rich text). It is already sanitized by DOMPurify on the frontend. XSS middleware must skip it to avoid double-sanitizing/breaking HTML content.

Current `skipFields` in `backend/src/middlewares/xss/xss.ts`:
```typescript
const skipFields = ['content', 'bio', 'displayOrder'];
```

Required change:
```typescript
const skipFields = ['content', 'bio', 'description', 'displayOrder'];
```

### Project Structure Notes

**New files to create:**
```
backend/src/schemas/event_schema.ts
backend/src/constants/event_constants.ts
backend/src/dao/event/
  event_get_all_dao.ts
  event_get_one_dao.ts
  event_create_dao.ts
  event_update_dao.ts
  event_delete_dao.ts
backend/src/services/admin/event/
  index.ts
  event_get_all_service.ts
  event_get_one_service.ts
  event_create_service.ts
  event_update_service.ts
  event_delete_service.ts
backend/src/controllers/admin/event_controller.ts
backend/src/routes/admin/v1/event_route.ts
backend/__test__/events-admin.routes.test.ts
```

**Files to modify:**
```
backend/src/routes/admin/v1/index.ts         → add event route registration
backend/src/middlewares/xss/xss.ts            → add 'description' to skipFields
```

**Alignment with existing patterns:**
- `backend/src/schemas/teacher_schema.ts` → mirror for `event_schema.ts`
- `backend/src/constants/teacher_constants.ts` → mirror for `event_constants.ts`
- `backend/src/dao/teacher/*.ts` → mirror for `dao/event/*.ts`
- `backend/src/services/admin/teacher/*.ts` → mirror for `services/admin/event/*.ts`
- `backend/src/controllers/admin/teacher_controller.ts` → mirror for `event_controller.ts`
- `backend/src/routes/admin/v1/teacher_route.ts` → mirror for `event_route.ts`

### Complete Code Reference Examples

**event_schema.ts** (mirror of teacher_schema.ts):
```typescript
import { z } from 'zod';

export const createEvent = z.object({
  body: z.object({
    title: z.string({ required_error: 'Заглавието е задължително' }).min(1, 'Заглавието е задължително'),
    eventDate: z.string({ required_error: 'Датата е задължителна' }).datetime('INVALID_DATE'),
    eventEndDate: z.string().datetime('INVALID_DATE').optional().nullable(),
    location: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    isImportant: z.boolean().optional(),
    imageUrl: z.string().url().optional().nullable().or(z.literal('')).transform(val => val === '' ? null : val),
    status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  }),
});

export const updateEvent = z.object({
  params: z.object({ id: z.string().transform(Number) }),
  body: z.object({
    title: z.string().min(1).optional(),
    eventDate: z.string().datetime().optional(),
    eventEndDate: z.string().datetime().optional().nullable(),
    location: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    isImportant: z.boolean().optional(),
    imageUrl: z.string().url().optional().nullable().or(z.literal('')).transform(val => val === '' ? null : val),
    status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  }),
});

export const getEventById = z.object({
  params: z.object({ id: z.string().transform(Number) }),
});

export const getEventList = z.object({
  query: z.object({
    status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
    upcoming: z.string().optional(), // 'true' string from query param
  }),
});

export type CreateEventType = z.infer<typeof createEvent>;
export type UpdateEventType = z.infer<typeof updateEvent>;
export type GetEventByIdType = z.infer<typeof getEventById>;
export type GetEventListType = z.infer<typeof getEventList>;
```

**event_constants.ts**:
```typescript
export const EVENT_SELECT = {
  id: true,
  title: true,
  description: true,
  eventDate: true,
  eventEndDate: true,
  location: true,
  isImportant: true,
  imageUrl: true,
  status: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;
```

**event_get_all_dao.ts** (mirror of teacher_get_all_dao.ts):
```typescript
import prisma from '../../../prisma/prisma-client';
import logger from '@utils/logger/winston/logger';

const msgError = 'Failed to get all events.';

export default (where: object, select: object, orderBy: object) => {
  const result = prisma.event
    .findMany({ where, select, orderBy })
    .then((res: any) => ({ success: true, data: res, error: null }))
    .catch((error: any) => {
      logger.error(`${msgError} ${error}`);
      return { success: false, data: null, error: msgError };
    });
  return result;
};
```

**event_get_all_service.ts** (with upcoming filter):
```typescript
import httpMsg from '@utils/http_messages/http_msg';
import eventGetAllDAO from '@dao/event/event_get_all_dao';
import { EVENT_SELECT } from '@constants/event_constants';

const errCode = 'ERROR_EVENT_GET_ALL';
const msgError = 'Failed to get all events';

export default async (statusFilter?: string, upcoming?: string) => {
  const where: any = {};
  if (statusFilter) where.status = statusFilter;
  if (upcoming === 'true') where.eventDate = { gte: new Date() };

  const orderBy = [{ eventDate: 'asc' as const }];

  const result = await eventGetAllDAO(where, EVENT_SELECT, orderBy);

  if (!result.success || !result.data) {
    return httpMsg.http422(msgError, errCode);
  }

  return httpMsg.http200(result.data);
};
```

**event_delete_service.ts** (with Bulgarian success message):
```typescript
import httpMsg from '@utils/http_messages/http_msg';
import eventDeleteDAO from '@dao/event/event_delete_dao';
import eventGetOneDAO from '@dao/event/event_get_one_dao';

const errCodeNotFound = 'ERROR_EVENT_NOT_FOUND';
const errCodeDelete = 'ERROR_EVENT_DELETE';
const msgNotFound = 'Събитието не е намерено';
const msgError = 'Failed to delete event';

export default async (id: number) => {
  const existing = await eventGetOneDAO(id, { id: true });
  if (!existing.success || !existing.data) {
    return httpMsg.http404(msgNotFound, errCodeNotFound);
  }

  const result = await eventDeleteDAO(id);
  if (!result.success) {
    return httpMsg.http422(msgError, errCodeDelete);
  }

  return {
    httpStatusCode: 200,
    data: {
      success: true,
      message: 'Събитието е изтрито успешно',
      content: null,
    },
  };
};
```

**event_controller.ts** (exact teacher pattern):
```typescript
import { Request, Response, NextFunction } from 'express';
import eventServices from '@services/admin/event';
import logger from '@utils/logger/winston/logger';

const getAll = (req: Request, res: Response, next: NextFunction) => {
  const { status, upcoming } = req.query;
  eventServices
    .getAll(status as string | undefined, upcoming as string | undefined)
    .then((result: any) => res.status(result.httpStatusCode).json(result.data))
    .catch((err: any) => {
      logger.error(`Error listing events. ${err.message}`);
      next(err);
    });
};

// getOne, create, update, remove follow exact teacher pattern
```

**event_route.ts** (exact teacher_route.ts pattern):
```typescript
import { Router } from 'express';
import auth from '@middlewares/auth/authenticate';
import { validate } from '@middlewares/validate_schema/validade_schema';
import ctrlEvent from '@controllers/admin/event_controller';
import { createEvent, updateEvent, getEventById, getEventList } from '@schemas/event_schema';

const router = Router();

router.get('/', auth('jwt-user'), validate(getEventList), ctrlEvent.getAll);
router.get('/:id', auth('jwt-user'), validate(getEventById), ctrlEvent.getOne);
router.post('/', auth('jwt-user'), validate(createEvent), ctrlEvent.create);
router.put('/:id', auth('jwt-user'), validate(updateEvent), ctrlEvent.update);
router.delete('/:id', auth('jwt-user'), validate(getEventById), ctrlEvent.remove);

export default router;
```

**routes/admin/v1/index.ts changes** (add events):
```typescript
import eventRoute from './event_route';
// Add to defaultRoutes array:
{ path: '/events', route: eventRoute },
```

### Route URL Clarification

The epics file lists endpoints as `/api/v1/events` but the established admin pattern is `/api/admin/v1/{resource}`. Following the existing convention:

- **Admin CRUD endpoints**: `GET/POST /api/admin/v1/events`, `GET/PUT/DELETE /api/admin/v1/events/:id`
- **Public endpoints**: Will be `GET /api/v1/public/events` (Story 5.7)

This matches the teacher pattern:
- Admin: `/api/admin/v1/teachers`
- Public: `/api/v1/public/teachers`

### Testing Pattern

Follow `backend/__test__/public-teachers.routes.test.ts` exactly:
- Import: `supertest`, `@jest/globals`, `server`, `prisma`
- `beforeAll`: start server (silent mode)
- `afterAll`: clean test data + `prisma.$disconnect()`
- `beforeEach`: clean test data
- Test data: use `[TEST]` prefix in title field for easy cleanup

```typescript
// Cleanup in beforeEach/afterAll:
await prisma.event.deleteMany({
  where: { title: { contains: '[TEST]' } }
});
```

### Authentication: @alias Path Resolution

The project uses TypeScript path aliases (configured in tsconfig.json):
- `@dao/event/...` → resolves to `src/dao/event/...`
- `@services/admin/event` → resolves to `src/services/admin/event/index.ts`
- `@controllers/admin/...` → resolves to `src/controllers/admin/...`
- `@schemas/...` → resolves to `src/schemas/...`
- `@constants/...` → resolves to `src/constants/...`
- `@middlewares/...` → resolves to `src/middlewares/...`
- `@utils/...` → resolves to `src/utils/...`

Use these aliases in all new files (do NOT use relative paths like `../../../`).

### References

- Story 5.1 (done): [Source: _bmad-output/implementation-artifacts/5-1-event-and-deadline-prisma-models.md]
- Event Prisma Schema: [Source: backend/prisma/schema.prisma#L72-L89]
- Teacher route pattern: [Source: backend/src/routes/admin/v1/teacher_route.ts]
- Teacher controller pattern: [Source: backend/src/controllers/admin/teacher_controller.ts]
- Teacher service pattern: [Source: backend/src/services/admin/teacher/]
- Teacher DAO pattern: [Source: backend/src/dao/teacher/]
- Teacher constants: [Source: backend/src/constants/teacher_constants.ts]
- Teacher schema: [Source: backend/src/schemas/teacher_schema.ts]
- Admin routes index: [Source: backend/src/routes/admin/v1/index.ts]
- XSS middleware: [Source: backend/src/middlewares/xss/xss.ts]
- httpMsg utility: [Source: backend/src/utils/http_messages/http_msg.ts]
- Integration test pattern: [Source: backend/__test__/public-teachers.routes.test.ts]
- Epic 5 stories: [Source: _bmad-output/planning-artifacts/epics.md#Epic5]
- Architecture patterns: [Source: _bmad-output/planning-artifacts/architecture.md]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- XSS middleware required `isImportant` added to `skipFields`: boolean fields get stringified by XSS `clean()` function — same pattern as `displayOrder` numeric field. Discovered via failing test "should create event with all optional fields" returning 400. Fix: add `isImportant` to `skipFields` array alongside `description`.

### Completion Notes List

- Implemented full 5-layer CRUD API for Events: Schema → Constants → DAOs → Services → Controller → Route → Registration
- Used `prisma.event` (PascalCase) per story Dev Notes — NOT legacy `prisma.teachers` pattern
- Events sorted by `eventDate ASC` (upcoming first) as required by AC1/AC3
- Status filter (AC2) and upcoming filter (AC3) combined cleanly in `event_get_all_service.ts`
- Default values enforced in create service: `status='DRAFT'`, `isImportant=false`
- Bulgarian 404 messages: "Събитието не е намерено" (AC4, AC6, AC7)
- Bulgarian delete success: "Събитието е изтрито успешно" (AC7)
- XSS middleware updated: added `description` (rich text HTML) and `isImportant` (boolean) to `skipFields`
- Integration tests: 21 tests, all passing — covers all ACs including auth (AC8), filters (AC2, AC3), CRUD (AC4-AC7)
- TypeScript: no type errors (`tsc --noEmit` clean)

### File List

**New files created:**
- `backend/src/schemas/event_schema.ts`
- `backend/src/constants/event_constants.ts`
- `backend/src/dao/event/event_get_all_dao.ts`
- `backend/src/dao/event/event_get_one_dao.ts`
- `backend/src/dao/event/event_create_dao.ts`
- `backend/src/dao/event/event_update_dao.ts`
- `backend/src/dao/event/event_delete_dao.ts`
- `backend/src/services/admin/event/event_get_all_service.ts`
- `backend/src/services/admin/event/event_get_one_service.ts`
- `backend/src/services/admin/event/event_create_service.ts`
- `backend/src/services/admin/event/event_update_service.ts`
- `backend/src/services/admin/event/event_delete_service.ts`
- `backend/src/services/admin/event/index.ts`
- `backend/src/controllers/admin/event_controller.ts`
- `backend/src/routes/admin/v1/event_route.ts`
- `backend/__test__/events-admin.routes.test.ts`

**Modified files:**
- `backend/src/routes/admin/v1/index.ts`
- `backend/src/middlewares/xss/xss.ts`

## Senior Developer Review (AI)

**Reviewer:** Desi (AI Code Review) | **Date:** 2026-03-02 | **Outcome:** APPROVED with fixes applied

### Issues Found & Fixed

**HIGH — Fixed:**
- **H1** `event_schema.ts`: `id` transform `z.string().transform(Number)` produced `NaN` for non-numeric strings, passing Zod but causing confusing Prisma errors. Fixed: added `.pipe(z.number().int().positive())` to both `getEventById` and `updateEvent` params.
- **H2** `event_create_service.ts`, `event_update_service.ts`: `publishedAt` field never set on status transitions. Events published via API had `publishedAt: null`. Fixed: create service sets `publishedAt: new Date()` when `status='PUBLISHED'`; update service sets/clears `publishedAt` on status change.
- **H3** `events-admin.routes.test.ts`: No test for combined `?status=PUBLISHED&upcoming=true` filter (key real-world usage). Fixed: added combined filter test + two `publishedAt` assertion tests (25 tests total).

**MEDIUM — Fixed:**
- **M1** `event_schema.ts`: `upcoming` query param accepted any string (`"hello"`, `"0"` etc). Fixed: changed to `z.enum(['true', 'false']).optional()`.
- **M2** `event_schema.ts`: Inconsistent datetime error messages between create (`'INVALID_DATE'`) and update (default Zod). Fixed: all datetime fields now use `'INVALID_DATE'`.
- **M3** Repo root: `backend/nul`, `nul`, `cd` Windows artifact files deleted.

**LOW — Not fixed (acceptable):**
- L1: DAOs use relative import for prisma-client (matches existing teacher DAO pattern).
- L2: TOCTOU race condition in update/delete (inherited from teacher pattern, low risk for this app).

### AC Validation
- AC1 ✅ GET all events, httpMsg format, sorted ASC
- AC2 ✅ Status filter DRAFT/PUBLISHED
- AC3 ✅ Upcoming filter `eventDate >= now`
- AC4 ✅ GET single event, 404 with Bulgarian message
- AC5 ✅ POST create, DRAFT default, isImportant=false default, 201 response
- AC6 ✅ PUT update, 404 on missing, updatedAt auto-refreshed
- AC7 ✅ DELETE, 404 on missing, Bulgarian success message
- AC8 ✅ 401 on all endpoints without JWT

## Change Log

- 2026-03-02: Story 5.2 implemented — Events Admin CRUD API with full 5-layer architecture (Schema, Constants, DAO, Service, Controller, Route). 21 integration tests passing. XSS middleware updated for `description` (rich text) and `isImportant` (boolean) fields.
- 2026-03-02: Code review — 6 issues fixed (3 HIGH, 3 MEDIUM). publishedAt lifecycle management added, id NaN guard added, combined filter test added, upcoming enum validation, datetime error consistency, junk files deleted. 25 tests total. Status → done.
