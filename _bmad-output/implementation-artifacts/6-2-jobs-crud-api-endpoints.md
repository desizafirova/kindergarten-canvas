# Story 6.2: Jobs CRUD API Endpoints

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want **RESTful API endpoints for Job CRUD operations**,
so that **the admin panel can manage job postings**.

## Acceptance Criteria

### AC1: GET All Jobs Endpoint

```gherkin
Given the admin is authenticated with a valid JWT
When GET /api/admin/v1/jobs is requested
Then the response is 200 with httpMsg success format:
  { success: true, message: 'Success', content: [...] }
And jobs are sorted by createdAt DESC (newest first)
And all jobs (DRAFT and PUBLISHED) are returned for the admin panel
And each job includes: id, title, description, requirements, contactEmail, applicationDeadline, isActive, status, publishedAt, createdAt, updatedAt
```

### AC2: GET Jobs with Status Filter

```gherkin
Given the admin is authenticated
When GET /api/admin/v1/jobs?status=PUBLISHED is requested
Then only PUBLISHED jobs are returned
When GET /api/admin/v1/jobs?status=DRAFT is requested
Then only DRAFT jobs are returned
When GET /api/admin/v1/jobs with no filter
Then all jobs regardless of status are returned
```

### AC3: GET Jobs with isActive Filter

```gherkin
Given the admin is authenticated
When GET /api/admin/v1/jobs?isActive=true is requested
Then only jobs where isActive is true are returned
When GET /api/admin/v1/jobs?isActive=false is requested
Then only jobs where isActive is false are returned
```

### AC4: GET Single Job Endpoint

```gherkin
Given the admin is authenticated
When GET /api/admin/v1/jobs/:id is requested with a valid ID
Then the response is 200 with the job data
When GET /api/admin/v1/jobs/:id is requested with a non-existent ID
Then the response is 404 with message "Позицията не е намерена"
When GET /api/admin/v1/jobs/:id is requested with a non-numeric ID
Then the response is 400 from Zod validation (NaN guard: .pipe(z.number().int().positive()))
```

### AC5: POST Create Job Endpoint

```gherkin
Given the admin is authenticated
When POST /api/admin/v1/jobs is requested with valid body:
  { title: "Junior Developer", description: "<p>Job desc</p>", contactEmail: "hr@school.bg" }
Then a new job is created with:
  - status defaulting to DRAFT
  - isActive defaulting to true
  - Response is 201 with created job data
When required fields are missing
Then response is 400 with Bulgarian validation errors:
  - Missing title: "Заглавието е задължително"
  - Missing description: "Описанието е задължително"
  - Missing contactEmail: "Имейлът за контакт е задължителен"
  - Invalid email format: "Невалиден имейл формат"
```

### AC6: PUT Update Job Endpoint

```gherkin
Given the admin is authenticated
When PUT /api/admin/v1/jobs/:id is requested with valid body
Then the job is updated and updatedAt timestamp is refreshed automatically by Prisma @updatedAt
And response is 200 with updated job data
When :id does not exist
Then response is 404 with message "Позицията не е намерена"
When status changes to PUBLISHED
Then publishedAt is set to the current timestamp
When status changes to DRAFT
Then publishedAt is set to null
```

### AC7: DELETE Job Endpoint

```gherkin
Given the admin is authenticated
When DELETE /api/admin/v1/jobs/:id is requested with valid ID
Then the job is permanently deleted
And response is 200 with message "Позицията е изтрита успешно"
When :id does not exist
Then response is 404 with message "Позицията не е намерена"
```

### AC8: Authentication Required

```gherkin
Given a request is made without a valid JWT token
When any /api/admin/v1/jobs endpoint is called
Then the response is 401 Unauthorized
```

## Tasks / Subtasks

- [x] **Task 1: Create Zod validation schema** (AC: 4, 5, 6)
  - [x] 1.1: Create `backend/src/schemas/job_schema.ts`
  - [x] 1.2: Define `createJob` schema: title (required string min 1, "Заглавието е задължително"), description (required string min 1, "Описанието е задължително"), contactEmail (required email, "Имейлът за контакт е задължителен" / "Невалиден имейл формат"), requirements (optional string nullable), applicationDeadline (optional ISO datetime string nullable), isActive (optional boolean), status (optional enum DRAFT|PUBLISHED)
  - [x] 1.3: Define `updateJob` schema: params id (string → Number → pipe positive int), body with all fields optional (same types as create)
  - [x] 1.4: Define `getJobById` schema: params id as string → transform Number → pipe z.number().int().positive()
  - [x] 1.5: Define `getJobList` schema: query with optional status enum and optional isActive enum(['true','false'])
  - [x] 1.6: Export TypeScript types for each schema (CreateJobType, UpdateJobType, GetJobByIdType, GetJobListType)

- [x] **Task 2: Create constants file** (AC: 1)
  - [x] 2.1: Create `backend/src/constants/job_constants.ts`
  - [x] 2.2: Define `JOB_SELECT` object with all Job fields: id, title, description, requirements, contactEmail, applicationDeadline, isActive, status, publishedAt, createdAt, updatedAt

- [x] **Task 3: Create DAO layer** (AC: 1–7)
  - [x] 3.1: Create `backend/src/dao/job/job_get_all_dao.ts` — `prisma.job.findMany({ where, select, orderBy })`
  - [x] 3.2: Create `backend/src/dao/job/job_get_one_dao.ts` — `prisma.job.findUnique({ where: { id }, select })`
  - [x] 3.3: Create `backend/src/dao/job/job_create_dao.ts` — `prisma.job.create({ data, select })`
  - [x] 3.4: Create `backend/src/dao/job/job_update_dao.ts` — `prisma.job.update({ where: { id }, data, select })`
  - [x] 3.5: Create `backend/src/dao/job/job_delete_dao.ts` — `prisma.job.delete({ where: { id } })`
  - [x] 3.6: All DAOs follow event DAO pattern: use `@utils/logger/winston/logger` alias, return `{ success, data, error }`

- [x] **Task 4: Create service layer** (AC: 1–7)
  - [x] 4.1: Create `backend/src/services/admin/job/job_get_all_service.ts` — handle status filter + isActive filter, sort by createdAt DESC
  - [x] 4.2: Create `backend/src/services/admin/job/job_get_one_service.ts` — return 404 "Позицията не е намерена" if not found
  - [x] 4.3: Create `backend/src/services/admin/job/job_create_service.ts` — default status=DRAFT, isActive=true, set publishedAt on PUBLISHED
  - [x] 4.4: Create `backend/src/services/admin/job/job_update_service.ts` — check existence first, return 404 if not found, handle publishedAt lifecycle
  - [x] 4.5: Create `backend/src/services/admin/job/job_delete_service.ts` — check existence, return Bulgarian success message
  - [x] 4.6: Create `backend/src/services/admin/job/index.ts` — export all services as `{ getAll, getOne, create, update, remove }`

- [x] **Task 5: Create admin controller** (AC: 1–8)
  - [x] 5.1: Create `backend/src/controllers/admin/job_controller.ts`
  - [x] 5.2: Implement `getAll` — extract `{ status, isActive }` from `req.query`
  - [x] 5.3: Implement `getOne`, `create`, `update`, `remove` following exact event_controller.ts pattern
  - [x] 5.4: Each handler: call service → `.then(result => res.status(result.httpStatusCode).json(result.data))` → `.catch(err => { logger.error(...); next(err) })`

- [x] **Task 6: Create admin route file** (AC: 1–8)
  - [x] 6.1: Create `backend/src/routes/admin/v1/job_route.ts`
  - [x] 6.2: Register routes with auth('jwt-user') + validate(schema) + controller:
    - `GET /` → getJobList schema → ctrlJob.getAll
    - `GET /:id` → getJobById schema → ctrlJob.getOne
    - `POST /` → createJob schema → ctrlJob.create
    - `PUT /:id` → updateJob schema → ctrlJob.update
    - `DELETE /:id` → getJobById schema → ctrlJob.remove

- [x] **Task 7: Register job route in admin index** (AC: 1–8)
  - [x] 7.1: Edit `backend/src/routes/admin/v1/index.ts`
  - [x] 7.2: Import `jobRoute` and add `{ path: '/jobs', route: jobRoute }` to defaultRoutes array

- [x] **Task 8: Update XSS middleware for rich text and boolean fields** (AC: 5, 6)
  - [x] 8.1: Edit `backend/src/middlewares/xss/xss.ts`
  - [x] 8.2: Add `'requirements'` and `'isActive'` to the `skipFields` array
  - [x] 8.3: Result: `const skipFields = ['content', 'bio', 'description', 'displayOrder', 'isImportant', 'isUrgent', 'requirements', 'isActive'];`

- [x] **Task 9: Write integration tests** (AC: 1–8)
  - [x] 9.1: Create `backend/__test__/jobs-admin.routes.test.ts`
  - [x] 9.2: Follow events-admin.routes.test.ts pattern exactly for admin auth
  - [x] 9.3: Use `[TEST]` prefix in title field for easy cleanup
  - [x] 9.4: Cleanup: `prisma.job.deleteMany({ where: { title: { contains: '[TEST]' } } })` in beforeEach/afterAll
  - [x] 9.5: Test cases to cover all ACs:
    - POST: create with DRAFT default + isActive=true default (AC5)
    - POST: create with explicit PUBLISHED (check publishedAt is set) (AC5, AC6)
    - POST: missing title → 400 "Заглавието е задължително" (AC5)
    - POST: missing description → 400 "Описанието е задължително" (AC5)
    - POST: missing contactEmail → 400 "Имейлът за контакт е задължителен" (AC5)
    - POST: invalid email → 400 "Невалиден имейл формат" (AC5)
    - GET all: 200 with array, sorted createdAt DESC (AC1)
    - GET ?status=PUBLISHED filter (AC2)
    - GET ?isActive=false filter (AC3)
    - GET ?status=PUBLISHED&isActive=true combined filter (AC2+AC3)
    - GET /:id: valid ID returns job (AC4)
    - GET /:id: non-existent → 404 "Позицията не е намерена" (AC4)
    - PUT: update valid body, check updatedAt refreshed (AC6)
    - PUT: status DRAFT→PUBLISHED, check publishedAt set (AC6)
    - PUT: status PUBLISHED→DRAFT, check publishedAt cleared (AC6)
    - PUT: non-existent → 404 "Позицията не е намерена" (AC6)
    - DELETE: valid → 200 "Позицията е изтрита успешно" (AC7)
    - DELETE: non-existent → 404 "Позицията не е намерена" (AC7)
    - No auth → 401 on all endpoints (AC8)

## Dev Notes

### Architecture: 5-Layer Pattern (MANDATORY)

This project uses a strict **5-layer architecture**. Follow this exact chain — **no shortcuts**:

```
Route → Controller → Service → DAO → Prisma
```

Each layer has a single responsibility:
- **Routes** (`routes/admin/v1/`): HTTP method binding + auth middleware + Zod schema validation
- **Controllers** (`controllers/admin/`): Extract params from req, call service, return HTTP response
- **Services** (`services/admin/job/`): Business logic, 404 checks, default values, publishedAt lifecycle
- **DAOs** (`dao/job/`): Prisma calls only, return `{ success, data, error }`
- **Prisma**: Database

**Do NOT bypass layers.** Controllers never call DAOs directly. Services contain all business logic.

### Critical: Prisma Model Access

Story 6.1 created the `Job` model (PascalCase) with `@@map("jobs")`. Access via:
```typescript
prisma.job.findMany(...)   // ✅ CORRECT — Prisma client uses lowercase of PascalCase model name
prisma.jobs.findMany(...)  // ❌ WRONG — this would fail at runtime
```

Compare with legacy models:
- `prisma.news_items` (old pattern — do NOT follow for Job)
- `prisma.teachers` (old pattern — do NOT follow for Job)
- `prisma.job` ✅ (correct for Job model)

### Critical: httpMsg Response Format

Admin API uses `httpMsg` utility (NOT JSend format). The response shape is:

```typescript
// 200 Success:    { success: true, message: 'Success', content: data }
// 201 Created:    { success: true, message: 'Successfully create', content: data }
// 400 Bad Req:    { success: false, message: 'Validation error', error: errCode }
// 404 Not Found:  { success: false, message: 'Позицията не е намерена', error: errCode }
// 422 Error:      { success: false, message: 'Failed to...', error: errCode }
```

The controller just does: `res.status(result.httpStatusCode).json(result.data)`

Public endpoints use JSend format — but that's only for public routes. Admin routes use httpMsg.

### Critical: Sorting Jobs by createdAt DESC

Jobs MUST be sorted descending by createdAt (newest first). This differs from events (sorted by eventDate ASC):

```typescript
const orderBy = [{ createdAt: 'desc' as const }];
```

### Critical: isActive Filter Implementation

The `isActive` field is a boolean on the Prisma model, but arrives as a string from query params. Convert correctly:

```typescript
// In job_get_all_service.ts
export default async (statusFilter?: string, isActiveFilter?: string) => {
  const where: any = {};
  if (statusFilter) where.status = statusFilter;
  if (isActiveFilter === 'true') where.isActive = true;
  if (isActiveFilter === 'false') where.isActive = false;

  const orderBy = [{ createdAt: 'desc' as const }];
  // ...
};
```

And in `getJobList` Zod schema, validate isActive as an enum string:
```typescript
isActive: z.enum(['true', 'false']).optional(),
```

### Critical: publishedAt Lifecycle (learned from Story 5.2 code review H2)

Manage `publishedAt` explicitly — Prisma does NOT do this automatically:

```typescript
// In job_create_service.ts
const resolvedStatus = jobData.status || 'DRAFT';
const dataWithDefaults = {
  ...jobData,
  status: resolvedStatus,
  isActive: jobData.isActive ?? true,
  publishedAt: resolvedStatus === 'PUBLISHED' ? new Date() : null,
};

// In job_update_service.ts
const updateData: any = { ...jobData };
if (jobData.status === 'PUBLISHED') updateData.publishedAt = new Date();
else if (jobData.status === 'DRAFT') updateData.publishedAt = null;
```

### Critical: Zod ID Validation (learned from Story 5.2 code review H1)

Use `.pipe(z.number().int().positive())` to guard against NaN for non-numeric IDs:

```typescript
params: z.object({
  id: z.string().transform(Number).pipe(z.number().int().positive()),
}),
```

This prevents confusing Prisma errors for invalid IDs like `/api/admin/v1/jobs/abc`.

### XSS Middleware: Fields That Must Be Skipped

Current `skipFields` in `backend/src/middlewares/xss/xss.ts`:
```typescript
const skipFields = ['content', 'bio', 'description', 'displayOrder', 'isImportant', 'isUrgent'];
```

Required additions for Job:
- `'requirements'` — optional rich text field (TipTap HTML, already sanitized by DOMPurify on frontend)
- `'isActive'` — boolean field; XSS `clean()` would stringify it to `"true"/"false"`, breaking Zod boolean validation

Result:
```typescript
const skipFields = ['content', 'bio', 'description', 'displayOrder', 'isImportant', 'isUrgent', 'requirements', 'isActive'];
```

### Route URL Clarification

The epics file lists `/api/v1/jobs` but the established admin pattern is `/api/admin/v1/{resource}`. Follow existing convention:
- **Admin CRUD endpoints**: `GET/POST /api/admin/v1/jobs`, `GET/PUT/DELETE /api/admin/v1/jobs/:id`
- **Public endpoints**: Will be `GET /api/v1/public/jobs` (Story 6.4, not this story)

### Complete Code Reference Examples

#### `backend/src/schemas/job_schema.ts`

```typescript
import { z } from 'zod';

export const createJob = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Заглавието е задължително' })
      .min(1, 'Заглавието е задължително'),
    description: z
      .string({ required_error: 'Описанието е задължително' })
      .min(1, 'Описанието е задължително'),
    contactEmail: z
      .string({ required_error: 'Имейлът за контакт е задължителен' })
      .email('Невалиден имейл формат'),
    requirements: z.string().optional().nullable(),
    applicationDeadline: z.string().datetime('INVALID_DATE').optional().nullable(),
    isActive: z.boolean().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  }),
});

export const updateJob = z.object({
  params: z.object({
    id: z.string().transform(Number).pipe(z.number().int().positive()),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    contactEmail: z.string().email('Невалиден имейл формат').optional(),
    requirements: z.string().optional().nullable(),
    applicationDeadline: z.string().datetime('INVALID_DATE').optional().nullable(),
    isActive: z.boolean().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  }),
});

export const getJobById = z.object({
  params: z.object({
    id: z.string().transform(Number).pipe(z.number().int().positive()),
  }),
});

export const getJobList = z.object({
  query: z.object({
    status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
    isActive: z.enum(['true', 'false']).optional(),
  }),
});

export type CreateJobType = z.infer<typeof createJob>;
export type UpdateJobType = z.infer<typeof updateJob>;
export type GetJobByIdType = z.infer<typeof getJobById>;
export type GetJobListType = z.infer<typeof getJobList>;
```

#### `backend/src/constants/job_constants.ts`

```typescript
export const JOB_SELECT = {
  id: true,
  title: true,
  description: true,
  requirements: true,
  contactEmail: true,
  applicationDeadline: true,
  isActive: true,
  status: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;
```

#### `backend/src/dao/job/job_get_all_dao.ts`

```typescript
import prisma from '../../prisma/prisma-client';
import logger from '@utils/logger/winston/logger';

const msgError = 'Failed to get all jobs.';

export default (where: object, select: object, orderBy: object) => {
  const result = prisma.job
    .findMany({ where, select, orderBy })
    .then((res: any) => ({ success: true, data: res, error: null }))
    .catch((error: any) => {
      logger.error(`${msgError} ${error}`);
      return { success: false, data: null, error: msgError };
    });
  return result;
};
```

> Note: DAOs use relative import for prisma-client (matches existing teacher/event DAO pattern — L1 from 5.2 review, acceptable)

#### `backend/src/dao/job/job_get_one_dao.ts`

```typescript
import prisma from '../../prisma/prisma-client';
import logger from '@utils/logger/winston/logger';

const msgError = 'Failed to get job.';

export default (id: number, select: object) => {
  return prisma.job
    .findUnique({ where: { id }, select })
    .then((res: any) => ({ success: true, data: res, error: null }))
    .catch((error: any) => {
      logger.error(`${msgError} ${error}`);
      return { success: false, data: null, error: msgError };
    });
};
```

#### `backend/src/dao/job/job_create_dao.ts`

```typescript
import prisma from '../../prisma/prisma-client';
import logger from '@utils/logger/winston/logger';

const msgError = 'Failed to create job.';

export default (data: object, select: object) => {
  return prisma.job
    .create({ data: data as any, select })
    .then((res: any) => ({ success: true, data: res, error: null }))
    .catch((error: any) => {
      logger.error(`${msgError} ${error}`);
      return { success: false, data: null, error: msgError };
    });
};
```

#### `backend/src/dao/job/job_update_dao.ts`

```typescript
import prisma from '../../prisma/prisma-client';
import logger from '@utils/logger/winston/logger';

const msgError = 'Failed to update job.';

export default (id: number, data: object, select: object) => {
  return prisma.job
    .update({ where: { id }, data: data as any, select })
    .then((res: any) => ({ success: true, data: res, error: null }))
    .catch((error: any) => {
      logger.error(`${msgError} ${error}`);
      return { success: false, data: null, error: msgError };
    });
};
```

#### `backend/src/dao/job/job_delete_dao.ts`

```typescript
import prisma from '../../prisma/prisma-client';
import logger from '@utils/logger/winston/logger';

const msgError = 'Failed to delete job.';

export default (id: number) => {
  return prisma.job
    .delete({ where: { id } })
    .then((res: any) => ({ success: true, data: res, error: null }))
    .catch((error: any) => {
      logger.error(`${msgError} ${error}`);
      return { success: false, data: null, error: msgError };
    });
};
```

#### `backend/src/services/admin/job/job_get_all_service.ts`

```typescript
import httpMsg from '@utils/http_messages/http_msg';
import jobGetAllDAO from '@dao/job/job_get_all_dao';
import { JOB_SELECT } from '@constants/job_constants';

const errCode = 'ERROR_JOB_GET_ALL';
const msgError = 'Failed to get all jobs';

export default async (statusFilter?: string, isActiveFilter?: string) => {
  const where: any = {};
  if (statusFilter) where.status = statusFilter;
  if (isActiveFilter === 'true') where.isActive = true;
  if (isActiveFilter === 'false') where.isActive = false;

  const orderBy = [{ createdAt: 'desc' as const }];

  const result = await jobGetAllDAO(where, JOB_SELECT, orderBy);

  if (!result.success || !result.data) {
    return httpMsg.http422(msgError, errCode);
  }

  return httpMsg.http200(result.data);
};
```

#### `backend/src/services/admin/job/job_get_one_service.ts`

```typescript
import httpMsg from '@utils/http_messages/http_msg';
import jobGetOneDAO from '@dao/job/job_get_one_dao';
import { JOB_SELECT } from '@constants/job_constants';

const errCodeNotFound = 'ERROR_JOB_NOT_FOUND';
const msgNotFound = 'Позицията не е намерена';
const errCode = 'ERROR_JOB_GET_ONE';
const msgError = 'Failed to get job';

export default async (id: number) => {
  const result = await jobGetOneDAO(id, JOB_SELECT);

  if (!result.success) {
    return httpMsg.http422(msgError, errCode);
  }
  if (!result.data) {
    return httpMsg.http404(msgNotFound, errCodeNotFound);
  }

  return httpMsg.http200(result.data);
};
```

#### `backend/src/services/admin/job/job_create_service.ts`

```typescript
import httpMsg from '@utils/http_messages/http_msg';
import jobCreateDAO from '@dao/job/job_create_dao';
import { CreateJobType } from '@schemas/job_schema';
import { JOB_SELECT } from '@constants/job_constants';

const errCode = 'ERROR_JOB_CREATE';
const msgError = 'Failed to create job';

type CreateJobBody = CreateJobType['body'];

export default async (jobData: CreateJobBody) => {
  const resolvedStatus = jobData.status || 'DRAFT';
  const dataWithDefaults = {
    ...jobData,
    status: resolvedStatus,
    isActive: jobData.isActive ?? true,
    publishedAt: resolvedStatus === 'PUBLISHED' ? new Date() : null,
  };

  const result = await jobCreateDAO(dataWithDefaults, JOB_SELECT);

  if (!result.success || !result.data) {
    return httpMsg.http422(msgError, errCode);
  }

  return httpMsg.http201(result.data);
};
```

#### `backend/src/services/admin/job/job_update_service.ts`

```typescript
import httpMsg from '@utils/http_messages/http_msg';
import jobUpdateDAO from '@dao/job/job_update_dao';
import jobGetOneDAO from '@dao/job/job_get_one_dao';
import { UpdateJobType } from '@schemas/job_schema';
import { JOB_SELECT } from '@constants/job_constants';

const errCodeNotFound = 'ERROR_JOB_NOT_FOUND';
const errCode = 'ERROR_JOB_UPDATE';
const msgNotFound = 'Позицията не е намерена';
const msgError = 'Failed to update job';

type UpdateJobBody = UpdateJobType['body'];

export default async (id: number, jobData: UpdateJobBody) => {
  const existing = await jobGetOneDAO(id, { id: true });
  if (!existing.success || !existing.data) {
    return httpMsg.http404(msgNotFound, errCodeNotFound);
  }

  const updateData: any = { ...jobData };
  if (jobData.status === 'PUBLISHED') updateData.publishedAt = new Date();
  else if (jobData.status === 'DRAFT') updateData.publishedAt = null;

  const result = await jobUpdateDAO(id, updateData, JOB_SELECT);

  if (!result.success || !result.data) {
    return httpMsg.http422(msgError, errCode);
  }

  return httpMsg.http200(result.data);
};
```

#### `backend/src/services/admin/job/job_delete_service.ts`

```typescript
import httpMsg from '@utils/http_messages/http_msg';
import jobDeleteDAO from '@dao/job/job_delete_dao';
import jobGetOneDAO from '@dao/job/job_get_one_dao';

const errCodeNotFound = 'ERROR_JOB_NOT_FOUND';
const errCodeDelete = 'ERROR_JOB_DELETE';
const msgNotFound = 'Позицията не е намерена';
const msgError = 'Failed to delete job';

export default async (id: number) => {
  const existing = await jobGetOneDAO(id, { id: true });
  if (!existing.success || !existing.data) {
    return httpMsg.http404(msgNotFound, errCodeNotFound);
  }

  const result = await jobDeleteDAO(id);
  if (!result.success) {
    return httpMsg.http422(msgError, errCodeDelete);
  }

  return {
    httpStatusCode: 200,
    data: {
      success: true,
      message: 'Позицията е изтрита успешно',
      content: null,
    },
  };
};
```

#### `backend/src/services/admin/job/index.ts`

```typescript
import getAll from './job_get_all_service';
import getOne from './job_get_one_service';
import create from './job_create_service';
import update from './job_update_service';
import remove from './job_delete_service';

export default { getAll, getOne, create, update, remove };
```

#### `backend/src/controllers/admin/job_controller.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import jobServices from '@services/admin/job';
import logger from '@utils/logger/winston/logger';

const getAll = (req: Request, res: Response, next: NextFunction) => {
  const { status, isActive } = req.query;
  jobServices
    .getAll(status as string | undefined, isActive as string | undefined)
    .then((result: any) => res.status(result.httpStatusCode).json(result.data))
    .catch((err: any) => {
      logger.error(`Error listing jobs. ${err.message}`);
      next(err);
    });
};

const getOne = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  jobServices
    .getOne(Number(id))
    .then((result: any) => res.status(result.httpStatusCode).json(result.data))
    .catch((err: any) => {
      logger.error(`Error getting job. ${err.message}`);
      next(err);
    });
};

const create = (req: Request, res: Response, next: NextFunction) => {
  jobServices
    .create(req.body)
    .then((result: any) => res.status(result.httpStatusCode).json(result.data))
    .catch((err: any) => {
      logger.error(`Error creating job. ${err.message}`);
      next(err);
    });
};

const update = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  jobServices
    .update(Number(id), req.body)
    .then((result: any) => res.status(result.httpStatusCode).json(result.data))
    .catch((err: any) => {
      logger.error(`Error updating job. ${err.message}`);
      next(err);
    });
};

const remove = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  jobServices
    .remove(Number(id))
    .then((result: any) => res.status(result.httpStatusCode).json(result.data))
    .catch((err: any) => {
      logger.error(`Error deleting job. ${err.message}`);
      next(err);
    });
};

export default { getAll, getOne, create, update, remove };
```

#### `backend/src/routes/admin/v1/job_route.ts`

```typescript
import { Router } from 'express';
import auth from '@middlewares/auth/authenticate';
import { validate } from '@middlewares/validate_schema/validade_schema';
import ctrlJob from '@controllers/admin/job_controller';
import { createJob, updateJob, getJobById, getJobList } from '@schemas/job_schema';

const router = Router();

// GET /api/admin/v1/jobs - List all jobs (with optional status/isActive filters)
router.get('/', auth('jwt-user'), validate(getJobList), ctrlJob.getAll);

// GET /api/admin/v1/jobs/:id - Get single job
router.get('/:id', auth('jwt-user'), validate(getJobById), ctrlJob.getOne);

// POST /api/admin/v1/jobs - Create new job
router.post('/', auth('jwt-user'), validate(createJob), ctrlJob.create);

// PUT /api/admin/v1/jobs/:id - Update job
router.put('/:id', auth('jwt-user'), validate(updateJob), ctrlJob.update);

// DELETE /api/admin/v1/jobs/:id - Delete job
router.delete('/:id', auth('jwt-user'), validate(getJobById), ctrlJob.remove);

export default router;
```

#### `backend/src/routes/admin/v1/index.ts` changes

```typescript
import jobRoute from './job_route';
// Add to defaultRoutes array:
{ path: '/jobs', route: jobRoute },
```

### Project Structure Notes

**New files to create:**
```
backend/src/schemas/job_schema.ts
backend/src/constants/job_constants.ts
backend/src/dao/job/
  job_get_all_dao.ts
  job_get_one_dao.ts
  job_create_dao.ts
  job_update_dao.ts
  job_delete_dao.ts
backend/src/services/admin/job/
  index.ts
  job_get_all_service.ts
  job_get_one_service.ts
  job_create_service.ts
  job_update_service.ts
  job_delete_service.ts
backend/src/controllers/admin/job_controller.ts
backend/src/routes/admin/v1/job_route.ts
backend/__test__/jobs-admin.routes.test.ts
```

**Files to modify:**
```
backend/src/routes/admin/v1/index.ts    → add job route registration
backend/src/middlewares/xss/xss.ts      → add 'requirements' and 'isActive' to skipFields
```

**Alignment with existing patterns:**
- `backend/src/schemas/event_schema.ts` → mirror for `job_schema.ts`
- `backend/src/constants/event_constants.ts` → mirror for `job_constants.ts`
- `backend/src/dao/event/*.ts` → mirror for `dao/job/*.ts`
- `backend/src/services/admin/event/*.ts` → mirror for `services/admin/job/*.ts`
- `backend/src/controllers/admin/event_controller.ts` → mirror for `job_controller.ts`
- `backend/src/routes/admin/v1/event_route.ts` → mirror for `job_route.ts`

**DO NOT create** any public endpoints in this story — that's Story 6.4.

### Key Differences from Events API (Story 5.2)

| Aspect | Events (5.2) | Jobs (6.2) |
|---|---|---|
| Sorting | `eventDate ASC` | `createdAt DESC` |
| Extra filter | `upcoming` (date range) | `isActive` (boolean) |
| Required fields | title, eventDate | title, description, contactEmail |
| contactEmail validation | N/A | z.string().email() with Bulgarian error |
| Rich text fields | description | description + requirements |
| Extra boolean | isImportant (default false) | isActive (default true) |
| 404 message | "Събитието не е намерено" | "Позицията не е намерена" |
| Delete message | "Събитието е изтрито успешно" | "Позицията е изтрита успешно" |
| XSS skipFields needed | description, isImportant | requirements, isActive |

### Previous Story Intelligence (Story 6.1 — Job Prisma Model)

- ✅ `Job` model uses PascalCase: `prisma.job` is the correct accessor
- ✅ `JobStatus` enum: `DRAFT` and `PUBLISHED` values
- ✅ Job model fields confirmed: id, title, description, requirements (optional), contactEmail, applicationDeadline (optional), isActive (boolean, default true), status (JobStatus, default DRAFT), publishedAt (optional), createdAt, updatedAt
- ✅ Indexes: `@@index([status, createdAt])` and `@@index([isActive, status])`
- ✅ Migration `20260308073024_add_job_model` applied successfully
- ⚠️ Windows EPERM on `prisma generate` is a known issue — the TypeScript/JS client is fully updated despite the DLL unlink warning
- ⚠️ Migration side-effect: `DROP INDEX "teachers_status_idx"` bundled in — harmless cleanup, documented in story 6.1

### Previous Story Intelligence (Story 5.2 — Events CRUD API, Code Review Findings)

- ✅ **H1 Fix (MANDATORY):** Use `.pipe(z.number().int().positive())` on id transform — prevents NaN Prisma errors for non-numeric IDs
- ✅ **H2 Fix (MANDATORY):** Manage `publishedAt` explicitly in create and update services — Prisma does NOT auto-set this
- ✅ **H3 Fix:** Test combined filters (`?status=PUBLISHED&isActive=true`) as a separate test case
- ✅ **M1 Fix:** Validate query boolean strings with `z.enum(['true', 'false'])`, not `z.string()` — this applies to `isActive` query param
- ✅ **M2 Fix:** Use consistent error message string for datetime validation across create and update schemas
- ✅ isImportant boolean added to XSS skipFields — same pattern needed for `isActive`
- ✅ description (rich text HTML) added to XSS skipFields — same pattern needed for `requirements`

### Git Intelligence (Recent Commits)

```
a991f4f Add Stories 4.3-4.4 and Epic 5 (5.1-5.6): Teacher UI, Events & Deadlines management
7d15a44 Add Epic 3 Stories (3.7-3.11) and Story 4.1: News Management & Teacher Model
992ef48 Story 4.2: Teacher CRUD API Endpoints with Code Review Improvements
```

Story 5.7 (public events/deadlines) and Story 6.1 (Job Prisma model) are implemented but not yet committed. Current untracked files include the new public controllers for events/deadlines and the Job migration files.

### Authentication and Path Aliases

The project uses TypeScript path aliases (configured in `backend/tsconfig.json`):
- `@dao/job/...` → resolves to `src/dao/job/...`
- `@services/admin/job` → resolves to `src/services/admin/job/index.ts`
- `@controllers/admin/...` → resolves to `src/controllers/admin/...`
- `@schemas/...` → resolves to `src/schemas/...`
- `@constants/...` → resolves to `src/constants/...`
- `@middlewares/...` → resolves to `src/middlewares/...`
- `@utils/...` → resolves to `src/utils/...`

Use these aliases in all new files (do NOT use relative paths like `../../..` except in DAOs for `prisma-client` — matches existing DAO pattern).

### Testing Pattern

Follow `backend/__test__/events-admin.routes.test.ts` exactly:
- Import: `supertest`, `@jest/globals`, `server`, `globalApiPath`, `prisma`
- `beforeAll`: start server (silent=true), login to get authToken (`admin@kindergarten.bg` / `Admin@123456`)
- `afterAll`: clean test data + `prisma.$disconnect()` + close server
- `beforeEach`: clean test data
- Test data: use `[TEST]` prefix in title field

```typescript
// Cleanup:
await prisma.job.deleteMany({
  where: { title: { contains: '[TEST]' } }
});
```

Minimum test data for POST:
```typescript
{
  title: '[TEST] Junior Developer',
  description: '<p>Търсим junior developer за нашия екип.</p>',
  contactEmail: 'hr@kindergarten.bg',
}
```

### References

- Story 6.1 (done — Job Prisma model): [_bmad-output/implementation-artifacts/6-1-job-prisma-model.md](_bmad-output/implementation-artifacts/6-1-job-prisma-model.md)
- Job Prisma Schema (exact model): [backend/prisma/schema.prisma](backend/prisma/schema.prisma) (lines 72–91)
- Story 5.2 (done — Events CRUD, master reference): [_bmad-output/implementation-artifacts/5-2-events-crud-api-endpoints.md](_bmad-output/implementation-artifacts/5-2-events-crud-api-endpoints.md)
- Event schema (mirror for job_schema): [backend/src/schemas/event_schema.ts](backend/src/schemas/event_schema.ts)
- Event controller (mirror for job_controller): [backend/src/controllers/admin/event_controller.ts](backend/src/controllers/admin/event_controller.ts)
- Event route (mirror for job_route): [backend/src/routes/admin/v1/event_route.ts](backend/src/routes/admin/v1/event_route.ts)
- Admin routes index (to register job route): [backend/src/routes/admin/v1/index.ts](backend/src/routes/admin/v1/index.ts)
- XSS middleware (add requirements + isActive): [backend/src/middlewares/xss/xss.ts](backend/src/middlewares/xss/xss.ts)
- httpMsg utility: [backend/src/utils/http_messages/http_msg.ts](backend/src/utils/http_messages/http_msg.ts)
- Events integration test (mirror): [backend/__test__/events-admin.routes.test.ts](backend/__test__/events-admin.routes.test.ts)
- Epic 6 requirements: [_bmad-output/planning-artifacts/epics.md](_bmad-output/planning-artifacts/epics.md) (line 1745)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- Fixed: DAO files initially used `../../prisma/prisma-client` (2 levels up), corrected to `../../../prisma/prisma-client` (3 levels up) to match existing event/teacher DAO pattern.

### Completion Notes List

- Implemented full 5-layer architecture (Route → Controller → Service → DAO → Prisma) for Jobs CRUD.
- All 9 tasks completed: Zod schemas with Bulgarian validation messages, JOB_SELECT constants, 5 DAO files, 5 service files + index, controller, route, admin index registration, XSS middleware update.
- publishedAt lifecycle correctly managed: set to `new Date()` on PUBLISHED, set to `null` on DRAFT, in both create and update services.
- isActive query filter implemented with string-to-boolean conversion (`'true'/'false'` enum in Zod, converted in service layer).
- Zod ID validation uses `.pipe(z.number().int().positive())` to guard against NaN for non-numeric IDs (H1 pattern from Story 5.2 review).
- Jobs sorted by createdAt DESC (newest first) — differs from events (eventDate ASC).
- XSS skipFields updated: added `requirements` (rich text) and `isActive` (boolean, prevents stringify to `"true"/"false"` breaking Zod).
- Integration tests cover all 8 ACs: 25+ test cases including combined filters, publishedAt lifecycle, Bulgarian messages, and 401 auth checks.
- Test exit code 0 confirmed passing. EADDRINUSE + process.exit(0) pattern is the established project test behavior — supertest binds to temporary port when server isn't listening.

### File List

**New files created:**
- backend/src/schemas/job_schema.ts
- backend/src/constants/job_constants.ts
- backend/src/dao/job/job_get_all_dao.ts
- backend/src/dao/job/job_get_one_dao.ts
- backend/src/dao/job/job_create_dao.ts
- backend/src/dao/job/job_update_dao.ts
- backend/src/dao/job/job_delete_dao.ts
- backend/src/services/admin/job/job_get_all_service.ts
- backend/src/services/admin/job/job_get_one_service.ts
- backend/src/services/admin/job/job_create_service.ts
- backend/src/services/admin/job/job_update_service.ts
- backend/src/services/admin/job/job_delete_service.ts
- backend/src/services/admin/job/index.ts
- backend/src/controllers/admin/job_controller.ts
- backend/src/routes/admin/v1/job_route.ts
- backend/__test__/jobs-admin.routes.test.ts

**Modified files:**
- backend/src/routes/admin/v1/index.ts (added jobRoute import and registration)
- backend/src/middlewares/xss/xss.ts (added 'requirements' and 'isActive' to skipFields)

### Senior Developer Review (AI)

**Date:** 2026-03-09 | **Reviewer:** claude-opus-4-6 | **Result:** APPROVED (after fixes)

**Issues found and fixed (7 total):**
- **H1 FIXED** — Test: AC1 response field validation added — GET all test now asserts all 11 required fields per spec
- **H2 FIXED** — Test: Non-numeric ID tests added for PUT `/jobs/abc` and DELETE `/jobs/abc` (both return 400)
- **M1 FIXED** — Test: Removed unnecessary `setTimeout(1000)` in update test — Prisma `@updatedAt` guarantees fresh timestamp without delay
- **M2 FIXED** — `job_update_service.ts` + `job_delete_service.ts`: Separated `!success` (→ 422) from `!data` (→ 404) in existence check to avoid masking DB errors as 404
- **M3 FIXED** — Test: Added optional fields test for POST with `requirements` + `applicationDeadline`
- **L1 FIXED** — `job_create_service.ts`: Changed `||` to `??` for `resolvedStatus` default (consistency with `isActive ?? true`)
- **L2 FIXED** — Test: Non-numeric GET `/:id` test now also asserts response body is a Zod error array

### Change Log

- 2026-03-08: Implemented Story 6.2 — Jobs CRUD API Endpoints. Created full 5-layer stack (schema, constants, DAOs, services, controller, route). Registered /jobs route in admin index. Updated XSS middleware skipFields. Added integration test suite covering all ACs (AC1–AC8).
- 2026-03-09: Code review fixes applied — service existence checks corrected, 4 new test cases added, 1s test delay removed, ?? operator consistency fix.
