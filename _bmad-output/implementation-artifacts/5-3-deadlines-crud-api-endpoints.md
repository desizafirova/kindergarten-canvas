# Story 5.3: Deadlines CRUD API Endpoints

Status: done

## Story

As a developer,
I want RESTful API endpoints for Deadline CRUD operations,
so that the admin panel can manage admission deadlines.

## Acceptance Criteria

1. **GET All Deadlines** – `GET /api/admin/v1/admission-deadlines` (auth required) returns 200 with array of all deadlines (DRAFT + PUBLISHED), sorted by `deadlineDate` ASC (nearest first), using `{ success: true, message: 'Success', content: [...] }` format.
2. **GET Deadlines with Status Filter** – `GET /api/admin/v1/admission-deadlines?status=PUBLISHED` returns only PUBLISHED deadlines; `?status=DRAFT` returns only DRAFT deadlines.
3. **GET Deadlines with Upcoming Filter** – `GET /api/admin/v1/admission-deadlines?upcoming=true` returns only deadlines where `deadlineDate >= now`.
4. **GET Single Deadline** – `GET /api/admin/v1/admission-deadlines/:id` returns 200 with deadline; non-existent ID returns 404 with Bulgarian message `"Срокът не е намерен"`.
5. **POST Create Deadline** – `POST /api/admin/v1/admission-deadlines` with `{ title, deadlineDate }` returns 201 with created deadline. Status defaults to DRAFT; `isUrgent` defaults to false. Missing required fields return 400 with Bulgarian messages: `"Заглавието е задължително"` and `"Крайната дата е задължителна"`.
6. **PUT Update Deadline** – `PUT /api/admin/v1/admission-deadlines/:id` returns 200 with updated deadline; `updatedAt` auto-refreshes. Non-existent ID returns 404 `"Срокът не е намерен"`.
7. **DELETE Deadline** – `DELETE /api/admin/v1/admission-deadlines/:id` permanently deletes; returns 200 with message `"Срокът е изтрит успешно"` and `content: null`. Non-existent ID returns 404.
8. **Authentication Required** – All endpoints require valid JWT; missing token returns 401 Unauthorized.

## Tasks / Subtasks

- [x] Task 1: Create Zod validation schema (AC: 5, 6)
  - [x] Create `backend/src/schemas/deadline_schema.ts` mirroring `event_schema.ts` but for Deadline fields
  - [x] Include `createDeadline`, `updateDeadline`, `getDeadlineById`, `getDeadlineList` schemas
  - [x] Validate `deadlineDate` as ISO 8601 datetime string with `'INVALID_DATE'` error code
  - [x] Validate `id` param with `.transform(Number).pipe(z.number().int().positive())`
  - [x] Export TypeScript types: `CreateDeadlineType`, `UpdateDeadlineType`, `GetDeadlineByIdType`, `GetDeadlineListType`

- [x] Task 2: Create deadline constants (AC: 1)
  - [x] Create `backend/src/constants/deadline_constants.ts`
  - [x] Define `DEADLINE_SELECT` object with all Deadline fields: `id, title, description, deadlineDate, isUrgent, status, publishedAt, createdAt, updatedAt`

- [x] Task 3: Create deadline DAOs (AC: 1–7)
  - [x] Create `backend/src/dao/deadline/deadline_get_all_dao.ts` — `prisma.deadline.findMany({ where, select, orderBy })`
  - [x] Create `backend/src/dao/deadline/deadline_get_one_dao.ts` — `prisma.deadline.findUnique({ where: { id }, select })`
  - [x] Create `backend/src/dao/deadline/deadline_create_dao.ts` — `prisma.deadline.create({ data, select })`
  - [x] Create `backend/src/dao/deadline/deadline_update_dao.ts` — `prisma.deadline.update({ where: { id }, data, select })`
  - [x] Create `backend/src/dao/deadline/deadline_delete_dao.ts` — `prisma.deadline.delete({ where: { id } })`
  - [x] Each DAO returns `{ success, data, error }` and logs errors via Winston logger

- [x] Task 4: Create deadline services (AC: 1–7)
  - [x] Create `backend/src/services/admin/deadline/deadline_get_all_service.ts` — accept `statusFilter?`, `upcoming?`; build WHERE clause; orderBy `[{ deadlineDate: 'asc' }]`
  - [x] Create `backend/src/services/admin/deadline/deadline_get_one_service.ts` — find by id; return 404 with `"Срокът не е намерен"` if not found
  - [x] Create `backend/src/services/admin/deadline/deadline_create_service.ts` — apply defaults (`status: 'DRAFT'`, `isUrgent: false`); set `publishedAt` when status is PUBLISHED; return 201
  - [x] Create `backend/src/services/admin/deadline/deadline_update_service.ts` — check existence (404 if not found); update `publishedAt` on status transitions; return 200
  - [x] Create `backend/src/services/admin/deadline/deadline_delete_service.ts` — check existence (404 if not found); delete; return 200 with Bulgarian success message
  - [x] Create `backend/src/services/admin/deadline/index.ts` — export all services as default object

- [x] Task 5: Create deadline controller (AC: 1–8)
  - [x] Create `backend/src/controllers/admin/deadline_controller.ts` mirroring `event_controller.ts` pattern
  - [x] Methods: `getAll`, `getOne`, `create`, `update`, `remove`
  - [x] Extract `status`, `upcoming` from `req.query` in `getAll`
  - [x] Log errors via Winston logger in catch blocks

- [x] Task 6: Create deadline route and register it (AC: 1–8)
  - [x] Create `backend/src/routes/admin/v1/deadline_route.ts` with all 5 routes
  - [x] Use `auth('jwt-user')` middleware on all routes
  - [x] Use `validate()` middleware with appropriate schemas
  - [x] Register route in `backend/src/routes/admin/v1/index.ts` at path `/admission-deadlines`

- [x] Task 7: Update XSS middleware (AC: 5, 6)
  - [x] Add `'isUrgent'` to `skipFields` in `backend/src/middlewares/xss/xss.ts`
  - [x] This prevents boolean `isUrgent` from being string-converted by XSS sanitizer

- [x] Task 8: Write integration tests (AC: 1–8)
  - [x] Create `backend/__test__/deadlines-admin.routes.test.ts` mirroring `events-admin.routes.test.ts` structure
  - [x] Test POST: create with DRAFT default, create with all fields, `publishedAt` set on PUBLISHED status, 400 missing title, 400 missing deadlineDate, 401 no auth
  - [x] Test GET list: all (AC1), sorted by `deadlineDate` ASC (AC1), status filter PUBLISHED (AC2), status filter DRAFT (AC2), `upcoming=true` (AC3), combined filter (AC2+AC3), 401 no auth (AC8)
  - [x] Test GET single: 200 with correct data, 404 Bulgarian message, 401 no auth (AC8)
  - [x] Test PUT: update + `updatedAt` refresh, update `isUrgent`, 404 non-existent, 401 no auth (AC8)
  - [x] Test DELETE: 200 with Bulgarian success message + `content: null` + verify deletion via GET, 404 non-existent, 401 no auth (AC8)
  - [x] Use `[TEST]` prefix in all test data titles
  - [x] Cleanup via `prisma.deadline.deleteMany({ where: { title: { contains: '[TEST]' } } })` in `beforeEach` and `afterAll`

## Dev Notes

### Critical Architecture: 5-Layer Pattern (MANDATORY)

```
Route → Controller → Service → DAO → Prisma
```

Every layer has a strict, single responsibility. DO NOT skip layers. DO NOT put business logic in DAOs or controllers.

### Prisma Model: `prisma.deadline` (NOT `prisma.deadlines`)

The Deadline model is already in the schema (Story 5.1). Use `prisma.deadline` (PascalCase singular, Prisma convention):

```prisma
model Deadline {
  id           Int            @id @default(autoincrement())
  title        String
  description  String?
  deadlineDate DateTime       @db.Timestamptz(6) @map("deadline_date")
  isUrgent     Boolean        @default(false) @map("is_urgent")
  status       DeadlineStatus @default(DRAFT)
  publishedAt  DateTime?      @db.Timestamptz(6) @map("published_at")
  createdAt    DateTime       @default(now()) @db.Timestamptz(6) @map("created_at")
  updatedAt    DateTime       @updatedAt @db.Timestamptz(6) @map("updated_at")

  @@map("deadlines")
  @@index([status, deadlineDate])
  @@index([status, createdAt])
}
```

### Route Prefix: `/admission-deadlines` (NOT `/deadlines`)

The route prefix is **`/admission-deadlines`**, not simply `/deadlines`. This is important for registration in `index.ts`:

```typescript
// backend/src/routes/admin/v1/index.ts — add:
import deadlineRoute from './deadline_route';
// In defaultRoutes array, add:
{ path: '/admission-deadlines', route: deadlineRoute },
```

Full endpoint paths:
- `GET /api/admin/v1/admission-deadlines`
- `GET /api/admin/v1/admission-deadlines?status=PUBLISHED`
- `GET /api/admin/v1/admission-deadlines?upcoming=true`
- `GET /api/admin/v1/admission-deadlines/:id`
- `POST /api/admin/v1/admission-deadlines`
- `PUT /api/admin/v1/admission-deadlines/:id`
- `DELETE /api/admin/v1/admission-deadlines/:id`

### httpMsg Response Format (CRITICAL — follow exactly)

```typescript
// 200 List/Get:  { success: true, message: 'Success', content: data }
// 201 Created:   { success: true, message: 'Successfully create', content: data }
// 200 Delete:    { success: true, message: 'Срокът е изтрит успешно', content: null }
// 404 Not Found: { success: false, message: 'Срокът не е намерен', error: errCode }
// 422 DB Error:  { success: false, message: 'Failed to...', error: errCode }
// 400 Validate:  [{ message: 'Заглавието е задължително' }, ...]  (from validate middleware)
```

Use the `httpMsg` utility (`@utils/http_messages/http_msg`) — do NOT manually construct response objects.

### Deadline-Specific Field Differences vs Event

| Feature | Event | Deadline |
|---|---|---|
| Date field | `eventDate` | `deadlineDate` |
| Flag field | `isImportant` | `isUrgent` |
| Extra date | `eventEndDate` (optional) | none |
| Location | `location` (optional) | none |
| Image | `imageUrl` (optional) | none |
| 404 message | `"Събитието не е намерено"` | `"Срокът не е намерен"` |
| Delete message | `"Събитието е изтрито успешно"` | `"Срокът е изтрит успешно"` |
| Status enum | `EventStatus` | `DeadlineStatus` |

### Implementation Code Templates

**`backend/src/schemas/deadline_schema.ts`:**
```typescript
import { z } from 'zod';

export const createDeadline = z.object({
    body: z.object({
        title: z
            .string({ required_error: 'Заглавието е задължително' })
            .min(1, 'Заглавието е задължително'),
        deadlineDate: z
            .string({ required_error: 'Крайната дата е задължителна' })
            .datetime('INVALID_DATE'),
        description: z.string().optional().nullable(),
        isUrgent: z.boolean().optional(),
        status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
    }),
});

export const updateDeadline = z.object({
    params: z.object({
        id: z.string().transform(Number).pipe(z.number().int().positive()),
    }),
    body: z.object({
        title: z.string().min(1).optional(),
        deadlineDate: z.string().datetime('INVALID_DATE').optional(),
        description: z.string().optional().nullable(),
        isUrgent: z.boolean().optional(),
        status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
    }),
});

export const getDeadlineById = z.object({
    params: z.object({
        id: z.string().transform(Number).pipe(z.number().int().positive()),
    }),
});

export const getDeadlineList = z.object({
    query: z.object({
        status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
        upcoming: z.enum(['true', 'false']).optional(),
    }),
});

export type CreateDeadlineType = z.infer<typeof createDeadline>;
export type UpdateDeadlineType = z.infer<typeof updateDeadline>;
export type GetDeadlineByIdType = z.infer<typeof getDeadlineById>;
export type GetDeadlineListType = z.infer<typeof getDeadlineList>;
```

**`backend/src/constants/deadline_constants.ts`:**
```typescript
/**
 * Shared constants for Deadline entity operations
 */
export const DEADLINE_SELECT = {
    id: true,
    title: true,
    description: true,
    deadlineDate: true,
    isUrgent: true,
    status: true,
    publishedAt: true,
    createdAt: true,
    updatedAt: true,
} as const;
```

**`backend/src/dao/deadline/deadline_get_all_dao.ts`:**
```typescript
import prisma from '../../../prisma/prisma-client';
import logger from '@utils/logger/winston/logger';

const msgError = 'Failed to get all deadlines.';

export default (where: object, select: object, orderBy: object) => {
    const result = prisma.deadline
        .findMany({ where, select, orderBy })
        .then((res: any) => ({ success: true, data: res, error: null }))
        .catch((error: any) => {
            logger.error(`${msgError} ${error}`);
            return { success: false, data: null, error: msgError };
        });

    return result;
};
```

**`backend/src/dao/deadline/deadline_get_one_dao.ts`:**
```typescript
import prisma from '../../../prisma/prisma-client';
import logger from '@utils/logger/winston/logger';

const msgError = 'Failed to get deadline.';

export default (id: number, select: object) => {
    const result = prisma.deadline
        .findUnique({ where: { id }, select })
        .then((res: any) => ({ success: true, data: res, error: null }))
        .catch((error: any) => {
            logger.error(`${msgError} ${error}`);
            return { success: false, data: null, error: msgError };
        });

    return result;
};
```

**`backend/src/dao/deadline/deadline_create_dao.ts`:**
```typescript
import prisma from '../../../prisma/prisma-client';
import logger from '@utils/logger/winston/logger';

const msgError = 'Failed to create a deadline.';

export default (data: object, select: object) => {
    const result = prisma.deadline
        .create({ data: data as any, select })
        .then((res: any) => ({ success: true, data: res, error: null }))
        .catch((error: Error) => {
            logger.error(`${msgError} ${error}`);
            return { success: false, data: null, error: msgError };
        });

    return result;
};
```

**`backend/src/dao/deadline/deadline_update_dao.ts`:**
```typescript
import prisma from '../../../prisma/prisma-client';
import logger from '@utils/logger/winston/logger';

const msgError = 'Failed to update deadline.';

export default (id: number, data: object, select: object) => {
    const result = prisma.deadline
        .update({ where: { id }, data: data as any, select })
        .then((res: any) => ({ success: true, data: res, error: null }))
        .catch((error: Error) => {
            logger.error(`${msgError} ${error}`);
            return { success: false, data: null, error: msgError };
        });

    return result;
};
```

**`backend/src/dao/deadline/deadline_delete_dao.ts`:**
```typescript
import prisma from '../../../prisma/prisma-client';
import logger from '@utils/logger/winston/logger';

const msgError = 'Failed to delete deadline.';

export default (id: number) => {
    const result = prisma.deadline
        .delete({ where: { id } })
        .then((res: any) => ({ success: true, data: res, error: null }))
        .catch((error: any) => {
            logger.error(`${msgError} ${error}`);
            return { success: false, data: null, error: msgError };
        });

    return result;
};
```

**`backend/src/services/admin/deadline/deadline_get_all_service.ts`:**
```typescript
import httpMsg from '@utils/http_messages/http_msg';
import deadlineGetAllDAO from '@dao/deadline/deadline_get_all_dao';
import { DEADLINE_SELECT } from '@constants/deadline_constants';

const errCode = 'ERROR_DEADLINE_GET_ALL';
const msgError = 'Failed to get all deadlines';

export default async (statusFilter?: string, upcoming?: string) => {
    const where: any = {};
    if (statusFilter) where.status = statusFilter;
    if (upcoming === 'true') where.deadlineDate = { gte: new Date() };

    // CRITICAL: Sort by deadlineDate ASC (nearest first) per AC1
    const orderBy = [{ deadlineDate: 'asc' as const }];

    const result = await deadlineGetAllDAO(where, DEADLINE_SELECT, orderBy);

    if (!result.success || !result.data) {
        return httpMsg.http422(msgError, errCode);
    }

    return httpMsg.http200(result.data);
};
```

**`backend/src/services/admin/deadline/deadline_get_one_service.ts`:**
```typescript
import httpMsg from '@utils/http_messages/http_msg';
import deadlineGetOneDAO from '@dao/deadline/deadline_get_one_dao';
import { DEADLINE_SELECT } from '@constants/deadline_constants';

const errCode = 'ERROR_DEADLINE_GET_ONE';
const msgError = 'Failed to get deadline';
const msgNotFound = 'Срокът не е намерен';

export default async (id: number) => {
    const result = await deadlineGetOneDAO(id, DEADLINE_SELECT);

    if (!result.success) {
        return httpMsg.http422(msgError, errCode);
    }

    if (!result.data) {
        return httpMsg.http404(msgNotFound, errCode);
    }

    return httpMsg.http200(result.data);
};
```

**`backend/src/services/admin/deadline/deadline_create_service.ts`:**
```typescript
import httpMsg from '@utils/http_messages/http_msg';
import deadlineCreateDAO from '@dao/deadline/deadline_create_dao';
import { CreateDeadlineType } from '@schemas/deadline_schema';
import { DEADLINE_SELECT } from '@constants/deadline_constants';

const errCode = 'ERROR_DEADLINE_CREATE';
const msgError = 'Failed to create deadline';

type CreateDeadlineBody = CreateDeadlineType['body'];

export default async (deadlineData: CreateDeadlineBody) => {
    const resolvedStatus = deadlineData.status || 'DRAFT';
    const dataWithDefaults = {
        ...deadlineData,
        status: resolvedStatus,
        isUrgent: deadlineData.isUrgent ?? false,
        // CRITICAL: Set publishedAt when creating with PUBLISHED status (AC5 + test assertion)
        publishedAt: resolvedStatus === 'PUBLISHED' ? new Date() : null,
    };

    const result = await deadlineCreateDAO(dataWithDefaults, DEADLINE_SELECT);

    if (!result.success || !result.data) {
        return httpMsg.http422(msgError, errCode);
    }

    return httpMsg.http201(result.data);
};
```

**`backend/src/services/admin/deadline/deadline_update_service.ts`:**
```typescript
import httpMsg from '@utils/http_messages/http_msg';
import deadlineGetOneDAO from '@dao/deadline/deadline_get_one_dao';
import deadlineUpdateDAO from '@dao/deadline/deadline_update_dao';
import { UpdateDeadlineType } from '@schemas/deadline_schema';
import { DEADLINE_SELECT } from '@constants/deadline_constants';

const errCode = 'ERROR_DEADLINE_UPDATE';
const msgError = 'Failed to update deadline';
const msgNotFound = 'Срокът не е намерен';

type UpdateDeadlineBody = UpdateDeadlineType['body'];

export default async (id: number, deadlineData: UpdateDeadlineBody) => {
    // Check existence first
    const existing = await deadlineGetOneDAO(id, { id: true, publishedAt: true, status: true });

    if (!existing.success) {
        return httpMsg.http422(msgError, errCode);
    }

    if (!existing.data) {
        return httpMsg.http404(msgNotFound, errCode);
    }

    // Handle publishedAt on status transitions
    let publishedAt: Date | null | undefined = undefined;
    if (deadlineData.status === 'PUBLISHED' && !existing.data.publishedAt) {
        publishedAt = new Date();
    } else if (deadlineData.status === 'DRAFT') {
        publishedAt = null;
    }

    const updatePayload: any = { ...deadlineData };
    if (publishedAt !== undefined) updatePayload.publishedAt = publishedAt;

    const result = await deadlineUpdateDAO(id, updatePayload, DEADLINE_SELECT);

    if (!result.success || !result.data) {
        return httpMsg.http422(msgError, errCode);
    }

    return httpMsg.http200(result.data);
};
```

**`backend/src/services/admin/deadline/deadline_delete_service.ts`:**
```typescript
import httpMsg from '@utils/http_messages/http_msg';
import deadlineGetOneDAO from '@dao/deadline/deadline_get_one_dao';
import deadlineDeleteDAO from '@dao/deadline/deadline_delete_dao';

const errCode = 'ERROR_DEADLINE_DELETE';
const msgError = 'Failed to delete deadline';
const msgNotFound = 'Срокът не е намерен';

export default async (id: number) => {
    // Check existence first (AC7: return 404 if not found)
    const existing = await deadlineGetOneDAO(id, { id: true });

    if (!existing.success) {
        return httpMsg.http422(msgError, errCode);
    }

    if (!existing.data) {
        return httpMsg.http404(msgNotFound, errCode);
    }

    const result = await deadlineDeleteDAO(id);

    if (!result.success) {
        return httpMsg.http422(msgError, errCode);
    }

    return {
        httpStatusCode: 200,
        data: {
            success: true,
            message: 'Срокът е изтрит успешно',
            content: null,
        },
    };
};
```

**`backend/src/services/admin/deadline/index.ts`:**
```typescript
import deadlineGetAllService from './deadline_get_all_service';
import deadlineGetOneService from './deadline_get_one_service';
import deadlineCreateService from './deadline_create_service';
import deadlineUpdateService from './deadline_update_service';
import deadlineDeleteService from './deadline_delete_service';

export default {
    getAll: deadlineGetAllService,
    getOne: deadlineGetOneService,
    create: deadlineCreateService,
    update: deadlineUpdateService,
    remove: deadlineDeleteService,
};
```

**`backend/src/controllers/admin/deadline_controller.ts`:**
```typescript
import { Request, Response, NextFunction } from 'express';
import deadlineServices from '@services/admin/deadline';
import logger from '@utils/logger/winston/logger';

const getAll = (req: Request, res: Response, next: NextFunction) => {
    const { status, upcoming } = req.query;
    deadlineServices
        .getAll(status as string | undefined, upcoming as string | undefined)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Error listing deadlines. ${err.message}`);
            next(err);
        });
};

const getOne = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    deadlineServices
        .getOne(Number(id))
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Error getting deadline. ${err.message}`);
            next(err);
        });
};

const create = (req: Request, res: Response, next: NextFunction) => {
    deadlineServices
        .create(req.body)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Error creating deadline. ${err.message}`);
            next(err);
        });
};

const update = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    deadlineServices
        .update(Number(id), req.body)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Error updating deadline. ${err.message}`);
            next(err);
        });
};

const remove = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    deadlineServices
        .remove(Number(id))
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Error deleting deadline. ${err.message}`);
            next(err);
        });
};

export default {
    getAll,
    getOne,
    create,
    update,
    remove,
};
```

**`backend/src/routes/admin/v1/deadline_route.ts`:**
```typescript
import { Router } from 'express';
import auth from '@middlewares/auth/authenticate';
import { validate } from '@middlewares/validate_schema/validade_schema';
import ctrlDeadline from '@controllers/admin/deadline_controller';
import {
    createDeadline,
    updateDeadline,
    getDeadlineById,
    getDeadlineList,
} from '@schemas/deadline_schema';

const router = Router();

// GET /api/admin/v1/admission-deadlines
router.get('/', auth('jwt-user'), validate(getDeadlineList), ctrlDeadline.getAll);

// GET /api/admin/v1/admission-deadlines/:id
router.get('/:id', auth('jwt-user'), validate(getDeadlineById), ctrlDeadline.getOne);

// POST /api/admin/v1/admission-deadlines
router.post('/', auth('jwt-user'), validate(createDeadline), ctrlDeadline.create);

// PUT /api/admin/v1/admission-deadlines/:id
router.put('/:id', auth('jwt-user'), validate(updateDeadline), ctrlDeadline.update);

// DELETE /api/admin/v1/admission-deadlines/:id
router.delete('/:id', auth('jwt-user'), validate(getDeadlineById), ctrlDeadline.remove);

export default router;
```

**`backend/src/routes/admin/v1/index.ts` update — add deadline route:**
```typescript
// Add import:
import deadlineRoute from './deadline_route';

// Add to defaultRoutes array:
{
    path: '/admission-deadlines',
    route: deadlineRoute,
},
```

**`backend/src/middlewares/xss/xss.ts` update — add `isUrgent` to skipFields:**
```typescript
// Change:
const skipFields = ['content', 'bio', 'description', 'displayOrder', 'isImportant'];
// To:
const skipFields = ['content', 'bio', 'description', 'displayOrder', 'isImportant', 'isUrgent'];
```

### Testing Pattern (follow `events-admin.routes.test.ts` exactly)

Key differences from events test:
- Import/use `prisma.deadline` (not `prisma.event`)
- Cleanup: `prisma.deadline.deleteMany({ where: { title: { contains: '[TEST]' } } })`
- Use `admission-deadlines` in URL paths
- Use `deadlineDate` field (not `eventDate`)
- Use `isUrgent` flag (not `isImportant`)
- 404 message: `"Срокът не е намерен"`
- Delete message: `"Срокът е изтрит успешно"`
- Missing title: `400` with `"Заглавието е задължително"`
- Missing deadlineDate: `400` with `"Крайната дата е задължителна"`
- No `eventEndDate`, `location`, `imageUrl` fields in test data

**Test coverage required:**
- POST: 7 tests (DRAFT default, all fields, publishedAt set on PUBLISHED, publishedAt null on DRAFT, 400 missing title, 400 missing deadlineDate, 401 no auth)
- GET list: 7 tests (all, sorted ASC, filter PUBLISHED, filter DRAFT, upcoming=true, combined status+upcoming, 401 no auth)
- GET single: 3 tests (200, 404 Bulgarian, 401 no auth)
- PUT: 5 tests (update + updatedAt refresh, isUrgent flag, publishedAt clearing on PUBLISHED→DRAFT, 404, 401 no auth)
- DELETE: 3 tests (200 Bulgarian msg + verify deletion, 404, 401 no auth)

### XSS Middleware: Why `isUrgent` Must Be Added to skipFields

The XSS middleware converts all field values to strings by default. Boolean `false` would become the string `"false"`, breaking Zod validation and Prisma type expectations. The `isImportant` boolean is already in skipFields — `isUrgent` follows the exact same pattern.

### Path Aliases Available (`tsconfig.json`)

```
@utils/   → src/utils/
@dao/     → src/dao/
@services/ → src/services/
@controllers/ → src/controllers/
@schemas/ → src/schemas/
@constants/ → src/constants/
@middlewares/ → src/middlewares/
```

### Project Structure Notes

- All deadline DAOs go in: `backend/src/dao/deadline/`
- All deadline services go in: `backend/src/services/admin/deadline/`
- Controller: `backend/src/controllers/admin/deadline_controller.ts`
- Schema: `backend/src/schemas/deadline_schema.ts`
- Constants: `backend/src/constants/deadline_constants.ts`
- Route file: `backend/src/routes/admin/v1/deadline_route.ts`
- Test file: `backend/__test__/deadlines-admin.routes.test.ts`

Follows the exact same directory structure as `event` files established in Story 5.2.

### References

- Event schema pattern: [backend/src/schemas/event_schema.ts](backend/src/schemas/event_schema.ts)
- Event constants pattern: [backend/src/constants/event_constants.ts](backend/src/constants/event_constants.ts)
- Event DAOs pattern: [backend/src/dao/event/](backend/src/dao/event/)
- Event services pattern: [backend/src/services/admin/event/](backend/src/services/admin/event/)
- Event controller pattern: [backend/src/controllers/admin/event_controller.ts](backend/src/controllers/admin/event_controller.ts)
- Event route pattern: [backend/src/routes/admin/v1/event_route.ts](backend/src/routes/admin/v1/event_route.ts)
- Route registration: [backend/src/routes/admin/v1/index.ts](backend/src/routes/admin/v1/index.ts)
- XSS middleware: [backend/src/middlewares/xss/xss.ts](backend/src/middlewares/xss/xss.ts)
- Test pattern: [backend/__test__/events-admin.routes.test.ts](backend/__test__/events-admin.routes.test.ts)
- Prisma schema (Deadline model): [backend/prisma/schema.prisma](backend/prisma/schema.prisma)
- Story 5.1 (models): [_bmad-output/implementation-artifacts/5-1-event-and-deadline-prisma-models.md](_bmad-output/implementation-artifacts/5-1-event-and-deadline-prisma-models.md)
- Story 5.2 (event CRUD): [_bmad-output/implementation-artifacts/5-2-events-crud-api-endpoints.md](_bmad-output/implementation-artifacts/5-2-events-crud-api-endpoints.md)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Implemented full 5-layer CRUD for Deadline model following the exact pattern from Story 5.2 (Events)
- 25/25 integration tests pass covering all 8 acceptance criteria
- TypeScript compiles cleanly with no errors
- Added `isUrgent` to XSS middleware skipFields to prevent boolean-to-string conversion
- Route registered at `/api/admin/v1/admission-deadlines` with JWT authentication on all endpoints
- `publishedAt` is set on PUBLISHED creation/transition and cleared on DRAFT transition
- Results sorted by `deadlineDate ASC` (nearest first) per AC1
- Events tests confirmed passing (24/24) — no regressions introduced

### File List

backend/src/schemas/deadline_schema.ts
backend/src/constants/deadline_constants.ts
backend/src/dao/deadline/deadline_get_all_dao.ts
backend/src/dao/deadline/deadline_get_one_dao.ts
backend/src/dao/deadline/deadline_create_dao.ts
backend/src/dao/deadline/deadline_update_dao.ts
backend/src/dao/deadline/deadline_delete_dao.ts
backend/src/services/admin/deadline/deadline_get_all_service.ts
backend/src/services/admin/deadline/deadline_get_one_service.ts
backend/src/services/admin/deadline/deadline_create_service.ts
backend/src/services/admin/deadline/deadline_update_service.ts
backend/src/services/admin/deadline/deadline_delete_service.ts
backend/src/services/admin/deadline/index.ts
backend/src/controllers/admin/deadline_controller.ts
backend/src/routes/admin/v1/deadline_route.ts
backend/src/routes/admin/v1/index.ts (modified — added deadlineRoute)
backend/src/middlewares/xss/xss.ts (modified — added isUrgent to skipFields)
backend/__test__/deadlines-admin.routes.test.ts

### Change Log

- 2026-03-03: Story 5.3 implemented — Deadlines CRUD API Endpoints. Created 5 DAOs, 5 services + index barrel, controller, route, schema, constants. Updated route index and XSS middleware. 24 integration tests written and passing.
- 2026-03-03: Code review fixes — (H1) Added separate error codes in delete service (`ERROR_DEADLINE_NOT_FOUND` vs `ERROR_DEADLINE_DELETE`). (H2) Added test for publishedAt clearing on PUBLISHED→DRAFT status transition. (M1) Removed unnecessary 1s setTimeout in update test. (M3) Corrected test count documentation. Total: 25 tests.
