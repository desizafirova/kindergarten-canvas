# Story 3.2: News CRUD API Endpoints

Status: in-progress

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want **RESTful API endpoints for News CRUD operations**,
So that **the admin panel can manage news content**.

## Acceptance Criteria

**Given** authenticated admin user
**When** I send `GET /api/v1/news`
**Then** the response returns status 200 with array of news items
**And** each item includes: id, title, content, imageUrl, status, publishedAt, createdAt, updatedAt
**And** results are sorted by createdAt descending (newest first)

**Given** authenticated admin user
**When** I send `GET /api/v1/news?status=DRAFT`
**Then** the response returns only draft news items

**Given** authenticated admin user
**When** I send `GET /api/v1/news/:id` with valid ID
**Then** the response returns status 200 with the single news item

**Given** authenticated admin user
**When** I send `GET /api/v1/news/:id` with invalid ID
**Then** the response returns status 404 with message: "Новината не е намерена"

**Given** authenticated admin user with valid news data
**When** I send `POST /api/v1/news` with title and content
**Then** the response returns status 201 with the created news item
**And** status defaults to DRAFT
**And** createdAt is set to current timestamp

**Given** authenticated admin user
**When** I send `POST /api/v1/news` with missing required fields
**Then** the response returns status 400 with Bulgarian validation errors:
- Missing title: "Заглавието е задължително"
- Missing content: "Съдържанието е задължително"

**Given** authenticated admin user
**When** I send `PUT /api/v1/news/:id` with updated fields
**Then** the response returns status 200 with the updated news item
**And** updatedAt is set to current timestamp

**Given** authenticated admin user
**When** I send `DELETE /api/v1/news/:id` with valid ID
**Then** the response returns status 200 with message: "Новината е изтрита успешно"
**And** the news item is removed from the database

## Tasks / Subtasks

- [x] **Task 1: Create NewsItem TypeScript Model** (AC: All)
  - [x] 1.1: Create `backend/src/models/news.model.ts`
  - [x] 1.2: Define `NewsStatus` enum (DRAFT, PUBLISHED)
  - [x] 1.3: Define `NewsItem` interface matching Prisma schema (id, title, content, imageUrl, status, publishedAt, createdAt, updatedAt)
  - [x] 1.4: Verify types match Story 3.1 Prisma model exactly

- [x] **Task 2: Create Zod Validation Schemas** (AC: Validation errors)
  - [x] 2.1: Create `backend/src/schemas/news_schema.ts`
  - [x] 2.2: Define `createNews` schema (title: string required, content: string required, imageUrl: string optional, status: enum optional)
  - [x] 2.3: Define `updateNews` schema (all fields optional for PATCH-like behavior)
  - [x] 2.4: Define `getNewsById` schema (params.id: number validation)
  - [x] 2.5: Define `getNewsList` schema (query.status: NewsStatus optional)
  - [x] 2.6: Add Bulgarian error messages: "Заглавието е задължително", "Съдържанието е задължително"
  - [x] 2.7: Export TypeScript types using `z.infer<>`

- [x] **Task 3: Create News DAOs (Data Access Layer)** (AC: Database operations)
  - [x] 3.1: Create `backend/src/dao/news/news_get_all_dao.ts` - findMany with where/select/orderBy
  - [x] 3.2: Create `backend/src/dao/news/news_get_one_dao.ts` - findUnique by id
  - [x] 3.3: Create `backend/src/dao/news/news_create_dao.ts` - create with data/select
  - [x] 3.4: Create `backend/src/dao/news/news_update_dao.ts` - update by id with data/select
  - [x] 3.5: Create `backend/src/dao/news/news_delete_dao.ts` - delete by id
  - [x] 3.6: Follow existing DAO pattern: prisma.newsItem.method(), return {success, data, error}
  - [x] 3.7: Use Winston logger for error logging

- [x] **Task 4: Create News Services (Business Logic)** (AC: All)
  - [x] 4.1: Create `backend/src/services/admin/news/` directory
  - [x] 4.2: Create `news_get_all_service.ts` - handles filtering by status, sorting by createdAt DESC
  - [x] 4.3: Create `news_get_one_service.ts` - handles 404 if not found ("Новината не е намерена")
  - [x] 4.4: Create `news_create_service.ts` - defaults status to DRAFT, sets timestamps
  - [x] 4.5: Create `news_update_service.ts` - updates fields, auto-updates updatedAt
  - [x] 4.6: Create `news_delete_service.ts` - hard delete, returns success message ("Новината е изтрита успешно")
  - [x] 4.7: Create `index.ts` exporting all services
  - [x] 4.8: Use httpMsg utility for standardized responses (http200, http201, http422, http404)

- [x] **Task 5: Create News Controller** (AC: All)
  - [x] 5.1: Create `backend/src/controllers/admin/news_controller.ts`
  - [x] 5.2: Implement `getAll` - calls news_get_all_service
  - [x] 5.3: Implement `getOne` - calls news_get_one_service
  - [x] 5.4: Implement `create` - calls news_create_service
  - [x] 5.5: Implement `update` - calls news_update_service
  - [x] 5.6: Implement `remove` - calls news_delete_service
  - [x] 5.7: Follow pattern: req, res, next → service.then(result => res.status().json()).catch(err => next(err))
  - [x] 5.8: Export default object with all methods

- [x] **Task 6: Create News Routes** (AC: All endpoints)
  - [x] 6.1: Create `backend/src/routes/admin/v1/news_route.ts`
  - [x] 6.2: Define GET `/` route (list) - auth middleware, optional validate for query params
  - [x] 6.3: Define GET `/:id` route (single) - auth middleware, validate params
  - [x] 6.4: Define POST `/` route (create) - auth middleware, validate body, controller.create
  - [x] 6.5: Define PUT `/:id` route (update) - auth middleware, validate params + body, controller.update
  - [x] 6.6: Define DELETE `/:id` route (delete) - auth middleware, validate params, controller.remove
  - [x] 6.7: Use `auth('jwt-user')` middleware for all routes (admin authentication from Story 1.4)

- [x] **Task 7: Register News Routes in Admin Router** (AC: Endpoints accessible)
  - [x] 7.1: Open `backend/src/routes/admin/v1/index.ts`
  - [x] 7.2: Import `newsRoute from './news_route'`
  - [x] 7.3: Add to defaultRoutes array: `{ path: '/news', route: newsRoute }`
  - [x] 7.4: Verify route registration follows existing pattern (users route)

- [x] **Task 8: Create Integration Tests** (AC: All)
  - [x] 8.1: Create `backend/__test__/news.routes.test.ts`
  - [x] 8.2: Test GET /api/admin/v1/news - returns 200, array of news, sorted by createdAt DESC
  - [x] 8.3: Test GET /api/admin/v1/news?status=DRAFT - filters drafts only
  - [x] 8.4: Test GET /api/admin/v1/news/:id - returns 200 with single item
  - [x] 8.5: Test GET /api/admin/v1/news/:id (invalid) - returns 404 with Bulgarian message
  - [x] 8.6: Test POST /api/admin/v1/news - returns 201, created item, defaults to DRAFT
  - [x] 8.7: Test POST /api/admin/v1/news (missing title) - returns 400 with Bulgarian error
  - [x] 8.8: Test POST /api/admin/v1/news (missing content) - returns 400 with Bulgarian error
  - [x] 8.9: Test PUT /api/admin/v1/news/:id - returns 200, updated item, updatedAt changed
  - [x] 8.10: Test DELETE /api/admin/v1/news/:id - returns 200, success message, item removed from DB
  - [x] 8.11: Test all routes require authentication (401 if no token)
  - [x] 8.12: Follow existing test patterns from user routes tests

- [ ] **Task 9: Manual API Testing with Postman/Thunder Client** (AC: All)
  - [ ] 9.1: Start backend server: `cd backend && npm run dev`
  - [ ] 9.2: Get authentication token (login as admin from Story 1.4)
  - [ ] 9.3: Test each endpoint manually with authenticated requests
  - [ ] 9.4: Verify responses match acceptance criteria exactly
  - [ ] 9.5: Test edge cases: invalid IDs, missing fields, unauthorized access

## Dev Notes

### 🎯 Story Requirements [Source: epics.md#Story 3.2]

**Core Objective:**
Create a complete RESTful API for News content management (CRUD operations) that enables the admin panel to create, read, update, and delete news items. This is the second foundational story in Epic 3 (News Content Management - Golden Path).

**Business Context:**
This story provides the backend API that will power:
- Story 3.4: News List View (frontend reads news via GET /api/v1/news)
- Story 3.5: News Creation Form (frontend creates news via POST /api/v1/news)
- Story 3.6: Auto-Save Functionality (frontend auto-saves via PUT /api/v1/news/:id)
- Story 3.8: Publish Workflow (frontend changes status via PUT /api/v1/news/:id)
- Story 3.9: Delete Confirmation (frontend deletes via DELETE /api/v1/news/:id)

**User Outcome (Epic 3):** Admin can independently publish news/announcements in under 15 minutes with full confidence.

**Critical Success Factors:**
1. **Authentication Required** - All endpoints require admin JWT token (from Story 1.4)
2. **Bulgarian Error Messages** - Validation errors in Bulgarian for admin UX
3. **Status Filtering** - Support ?status=DRAFT query parameter for draft/published filtering
4. **Sorted by Newest** - Default sort by createdAt DESC (newest first) for admin list view
5. **404 Handling** - Return Bulgarian error message when news item not found
6. **DRAFT Default** - New news items default to DRAFT status (explicit publish needed)
7. **Hard Delete** - DELETE endpoint performs hard delete (no soft delete for MVP)

### 🏗️ Architecture Requirements [Source: Story 3.1 + Backend Patterns]

**Backend Architecture Pattern** (Layered Architecture):
```
Routes → Middlewares → Controllers → Services → DAOs → Prisma → PostgreSQL
```

**1. Routes Layer** (`backend/src/routes/admin/v1/news_route.ts`):
- Define Express.js route handlers
- Apply middleware chain: auth → validate → controller
- Map HTTP verbs to controller methods
- Register routes in admin router index

**2. Middlewares Layer**:
- **Authentication**: `auth('jwt-user')` - JWT token validation from Story 1.4
- **Validation**: `validate(schema)` - Zod schema validation
- **Error Handling**: Automatic via global error handler

**3. Controllers Layer** (`backend/src/controllers/admin/news_controller.ts`):
- Handle HTTP request/response
- Delegate business logic to services
- Return standardized responses using httpMsg utility
- Pattern: `req, res, next → service.then().catch()`

**4. Services Layer** (`backend/src/services/admin/news/`):
- Business logic implementation
- Data validation and transformation
- Error handling with httpMsg utility
- Call DAOs for data persistence

**5. DAOs Layer** (`backend/src/dao/news/`):
- Data Access Objects - Prisma query wrappers
- Return format: `{success: boolean, data: any, error: string | null}`
- Winston logger for database errors
- Pattern: `prisma.newsItem.method().then().catch()`

**6. Models Layer** (`backend/src/models/news.model.ts`):
- TypeScript interfaces matching Prisma schema
- Enums matching Prisma enums
- Type safety across application

**7. Schemas Layer** (`backend/src/schemas/news_schema.ts`):
- Zod validation schemas
- Bulgarian error messages
- Type inference for TypeScript

**Backend Technology Stack:**
- **Framework**: Express.js (already configured from Story 1.2)
- **ORM**: Prisma Client (NewsItem model from Story 3.1)
- **Validation**: Zod (already installed, used in auth routes)
- **Authentication**: Passport JWT (configured in Story 1.4)
- **Logging**: Winston (configured in Story 1.2)
- **Testing**: Jest + Supertest (from Story 1.2)

**Database Layer** (Already Configured):
- **Table**: `news_items` (created in Story 3.1)
- **Enum**: `NewsStatus` (DRAFT, PUBLISHED)
- **Connection**: Prisma Client singleton at `backend/prisma/prisma-client.ts`

### 📋 Technical Requirements

**API Endpoint Specifications:**

**Base Path**: `/api/admin/v1/news` (admin routes require authentication)

| Method | Endpoint | Auth | Purpose | Response |
|--------|----------|------|---------|----------|
| GET | `/` | Required | List all news (with optional status filter) | 200 + array |
| GET | `/:id` | Required | Get single news item by ID | 200 + object OR 404 |
| POST | `/` | Required | Create new news item | 201 + object |
| PUT | `/:id` | Required | Update existing news item | 200 + object |
| DELETE | `/:id` | Required | Delete news item | 200 + message |

**Request/Response Specifications:**

**GET /api/admin/v1/news**
```typescript
// Query Parameters (optional)
?status=DRAFT | PUBLISHED

// Response 200
{
  success: true,
  message: "Success",
  content: [
    {
      id: 1,
      title: "Зимна ваканция",
      content: "<p>Информация...</p>",
      imageUrl: null,
      status: "DRAFT",
      publishedAt: null,
      createdAt: "2026-02-07T10:00:00.000Z",
      updatedAt: "2026-02-07T10:00:00.000Z"
    },
    // ... sorted by createdAt DESC
  ]
}
```

**GET /api/admin/v1/news/:id**
```typescript
// Response 200
{
  success: true,
  message: "Success",
  content: {
    id: 1,
    title: "Зимна ваканция",
    content: "<p>Информация...</p>",
    imageUrl: null,
    status: "DRAFT",
    publishedAt: null,
    createdAt: "2026-02-07T10:00:00.000Z",
    updatedAt: "2026-02-07T10:00:00.000Z"
  }
}

// Response 404
{
  success: false,
  message: "Новината не е намерена",
  error: "ERROR_NEWS_NOT_FOUND"
}
```

**POST /api/admin/v1/news**
```typescript
// Request Body
{
  title: "Зимна ваканция",
  content: "<p>Информация...</p>",
  imageUrl: "https://cloudinary.com/..." // optional
}

// Response 201
{
  success: true,
  message: "Successfully create",
  content: {
    id: 1,
    title: "Зимна ваканция",
    content: "<p>Информация...</p>",
    imageUrl: "https://cloudinary.com/...",
    status: "DRAFT", // defaults to DRAFT
    publishedAt: null,
    createdAt: "2026-02-07T10:00:00.000Z",
    updatedAt: "2026-02-07T10:00:00.000Z"
  }
}

// Response 400 (missing title)
[
  {
    success: false,
    error: "VALIDATION_ERROR",
    message: "Заглавието е задължително"
  }
]

// Response 400 (missing content)
[
  {
    success: false,
    error: "VALIDATION_ERROR",
    message: "Съдържанието е задължително"
  }
]
```

**PUT /api/admin/v1/news/:id**
```typescript
// Request Body (all fields optional - PATCH-like behavior)
{
  title: "Updated title",
  content: "<p>Updated content...</p>",
  imageUrl: "https://cloudinary.com/...",
  status: "PUBLISHED",
  publishedAt: "2026-02-07T12:00:00.000Z"
}

// Response 200
{
  success: true,
  message: "Success",
  content: {
    id: 1,
    title: "Updated title",
    content: "<p>Updated content...</p>",
    imageUrl: "https://cloudinary.com/...",
    status: "PUBLISHED",
    publishedAt: "2026-02-07T12:00:00.000Z",
    createdAt: "2026-02-07T10:00:00.000Z",
    updatedAt: "2026-02-07T12:05:00.000Z" // auto-updated
  }
}
```

**DELETE /api/admin/v1/news/:id**
```typescript
// Response 200
{
  success: true,
  message: "Новината е изтрита успешно",
  content: null
}
```

**Authentication Requirement:**
- All endpoints require `Authorization: Bearer <JWT_TOKEN>` header
- Use `auth('jwt-user')` middleware (configured in Story 1.4)
- 401 response if token missing/invalid/expired

### 🔧 Library & Framework Requirements

**Express.js Route Pattern** (From existing users_route.ts):
```typescript
import { Router } from 'express';
import auth from '@middlewares/auth/authenticate';
import { validate } from '@middlewares/validate_schema/validade_schema';
import ctrlNews from '@controllers/admin/news_controller';
import { createNews, updateNews, getNewsById, getNewsList } from '@schemas/news_schema';

const router = Router();

// GET /api/admin/v1/news - List all news (with optional status filter)
router.get('/', auth('jwt-user'), validate(getNewsList), ctrlNews.getAll);

// GET /api/admin/v1/news/:id - Get single news item
router.get('/:id', auth('jwt-user'), validate(getNewsById), ctrlNews.getOne);

// POST /api/admin/v1/news - Create new news item
router.post('/', auth('jwt-user'), validate(createNews), ctrlNews.create);

// PUT /api/admin/v1/news/:id - Update news item
router.put('/:id', auth('jwt-user'), validate(updateNews), ctrlNews.update);

// DELETE /api/admin/v1/news/:id - Delete news item
router.delete('/:id', auth('jwt-user'), ctrlNews.remove);

export default router;
```

**Zod Validation Schema Pattern** (From existing auth_schema.ts):
```typescript
import { z } from 'zod';

export const createNews = z.object({
    body: z.object({
        title: z.string({
            required_error: "Заглавието е задължително"
        }).min(1, "Заглавието е задължително"),
        content: z.string({
            required_error: "Съдържанието е задължително"
        }).min(1, "Съдържанието е задължително"),
        imageUrl: z.string().url().optional(),
        status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
    }),
});

export const updateNews = z.object({
    params: z.object({
        id: z.string().transform(Number), // Convert string param to number
    }),
    body: z.object({
        title: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
        imageUrl: z.string().url().optional().nullable(),
        status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
        publishedAt: z.string().datetime().optional().nullable(),
    }),
});

export const getNewsById = z.object({
    params: z.object({
        id: z.string().transform(Number),
    }),
});

export const getNewsList = z.object({
    query: z.object({
        status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
    }),
});

export type CreateNewsType = z.infer<typeof createNews>;
export type UpdateNewsType = z.infer<typeof updateNews>;
export type GetNewsByIdType = z.infer<typeof getNewsById>;
export type GetNewsListType = z.infer<typeof getNewsList>;
```

**Controller Pattern** (From existing users_controller.ts):
```typescript
import { Request, Response, NextFunction } from 'express';
import newsServices from '@services/admin/news';
import logger from '@utils/logger/winston/logger';

const getAll = (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.query;
    newsServices
        .getAll(status as string | undefined)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Erro de listagem de novini. ${err.message}`);
            next(err);
        });
};

const getOne = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    newsServices
        .getOne(Number(id))
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Erro ao buscar novini. ${err.message}`);
            next(err);
        });
};

const create = (req: Request, res: Response, next: NextFunction) => {
    newsServices
        .create(req.body)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Erro ao criar novini. ${err.message}`);
            next(err);
        });
};

const update = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    newsServices
        .update(Number(id), req.body)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Erro ao atualizar novini. ${err.message}`);
            next(err);
        });
};

const remove = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    newsServices
        .remove(Number(id))
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Erro ao deletar novini. ${err.message}`);
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

**Service Pattern** (From existing show_all_service.ts):
```typescript
import httpMsg from '@utils/http_messages/http_msg';
import newsDAO from '@dao/news';

const errCode = 'ERROR_NEWS_GET_ALL';
const msgError = 'Failed to get all news';

export default async (statusFilter?: string) => {
    const where = statusFilter ? { status: statusFilter as any } : {};

    const select = {
        id: true,
        title: true,
        content: true,
        imageUrl: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
    };

    const orderBy = { createdAt: 'desc' as const };

    const news = await getAllNews(where, select, orderBy);

    return httpMsg.http200(news.data);
};

const getAllNews = async (where: object, select: object, orderBy: object) => {
    const result = await newsDAO.findAll(where, select, orderBy);

    if (!result.success || !result.data) {
        throw httpMsg.http422(msgError, errCode);
    }

    return { success: result.success, data: result.data, error: result.error };
};
```

**DAO Pattern** (From existing user_get_all_dao.ts):
```typescript
import prisma from '../../../prisma/prisma-client';
import logger from '@utils/logger/winston/logger';

const msgError = 'Failed to get all news items.';

export default (where: object, select: object, orderBy: object) => {
    const result = prisma.newsItem
        .findMany({ where, select, orderBy })
        .then((res: any) => {
            return { success: true, data: res, error: null };
        })
        .catch((error: any) => {
            logger.error(`${msgError} ${error}`);
            return { success: false, data: null, error: msgError };
        });

    return result;
};
```

**httpMsg Utility Usage** (From http_msg.ts):
```typescript
import httpMsg from '@utils/http_messages/http_msg';

// Success responses
httpMsg.http200(data)  // { httpStatusCode: 200, data: { success: true, message: "Success", content: data }}
httpMsg.http201(data)  // { httpStatusCode: 201, data: { success: true, message: "Successfully create", content: data }}

// Error responses
httpMsg.http401(customMsg, error)  // Unauthorized
httpMsg.http422(customMsg, error)  // Validation/business logic errors
```

**Prisma Client Usage** (From Story 3.1):
```typescript
import prisma from '../../../prisma/prisma-client';

// The NewsItem model is available from Story 3.1
prisma.newsItem.findMany()
prisma.newsItem.findUnique({ where: { id } })
prisma.newsItem.create({ data })
prisma.newsItem.update({ where: { id }, data })
prisma.newsItem.delete({ where: { id } })
```

### 📂 File Structure Requirements

**Files to Create:**

1. **backend/src/models/news.model.ts** [NEW]
   ```typescript
   export enum NewsStatus {
       DRAFT = 'DRAFT',
       PUBLISHED = 'PUBLISHED',
   }

   export interface NewsItem {
       id: number;
       title: string;
       content: string;
       imageUrl: string | null;
       status: NewsStatus;
       publishedAt: Date | null;
       createdAt: Date;
       updatedAt: Date;
   }
   ```

2. **backend/src/schemas/news_schema.ts** [NEW]
   - Zod schemas for validation
   - Bulgarian error messages
   - TypeScript type exports

3. **backend/src/dao/news/** [NEW FOLDER]
   - `news_get_all_dao.ts`
   - `news_get_one_dao.ts`
   - `news_create_dao.ts`
   - `news_update_dao.ts`
   - `news_delete_dao.ts`

4. **backend/src/services/admin/news/** [NEW FOLDER]
   - `news_get_all_service.ts`
   - `news_get_one_service.ts`
   - `news_create_service.ts`
   - `news_update_service.ts`
   - `news_delete_service.ts`
   - `index.ts` (exports all services)

5. **backend/src/controllers/admin/news_controller.ts** [NEW]
   - Controller methods for all CRUD operations

6. **backend/src/routes/admin/v1/news_route.ts** [NEW]
   - Express route definitions

7. **backend/__test__/news.routes.test.ts** [NEW]
   - Integration tests for all endpoints

**Files to Modify:**

1. **backend/src/routes/admin/v1/index.ts** [MODIFY]
   - Add news route registration:
   ```typescript
   import newsRoute from './news_route';

   const defaultRoutes = [
       { path: '/users', route: usersRoute },
       { path: '/news', route: newsRoute }, // ADD THIS
   ];
   ```

**Folder Structure After This Story:**
```
backend/
├── src/
│   ├── models/
│   │   ├── user.model.ts (existing)
│   │   └── news.model.ts (NEW)
│   ├── schemas/
│   │   ├── auth_schema.ts (existing)
│   │   └── news_schema.ts (NEW)
│   ├── dao/
│   │   ├── users/ (existing)
│   │   └── news/ (NEW)
│   │       ├── news_get_all_dao.ts
│   │       ├── news_get_one_dao.ts
│   │       ├── news_create_dao.ts
│   │       ├── news_update_dao.ts
│   │       └── news_delete_dao.ts
│   ├── services/
│   │   └── admin/
│   │       ├── users/ (existing)
│   │       └── news/ (NEW)
│   │           ├── news_get_all_service.ts
│   │           ├── news_get_one_service.ts
│   │           ├── news_create_service.ts
│   │           ├── news_update_service.ts
│   │           ├── news_delete_service.ts
│   │           └── index.ts
│   ├── controllers/
│   │   └── admin/
│   │       ├── users_controller.ts (existing)
│   │       └── news_controller.ts (NEW)
│   ├── routes/
│   │   └── admin/
│   │       └── v1/
│   │           ├── index.ts (MODIFY)
│   │           ├── users_route.ts (existing)
│   │           └── news_route.ts (NEW)
│   └── middlewares/
│       └── auth/ (existing - reuse)
└── __test__/
    ├── news.routes.test.ts (NEW)
    └── ... (existing tests)
```

### 🧪 Testing & Verification Requirements

**Test Strategy:**

1. **Integration Tests** (Primary verification method):
   - Test all CRUD endpoints via HTTP requests
   - Verify authentication requirement (401 if no token)
   - Verify validation errors (400 with Bulgarian messages)
   - Verify database changes (create/update/delete actually persist)
   - Verify sorting (createdAt DESC)
   - Verify filtering (status query parameter)
   - Verify 404 handling (invalid IDs)

2. **Manual Testing with Postman/Thunder Client**:
   - Test happy path scenarios
   - Test edge cases (invalid data, unauthorized access)
   - Verify Bulgarian error messages display correctly

**Test File Pattern** (Following existing test structure):
```typescript
import request from 'supertest';
import app from '../src/app';
import prisma from '../prisma/prisma-client';

describe('News CRUD API', () => {
    let authToken: string;
    let testNewsId: number;

    beforeAll(async () => {
        // Login and get auth token
        const loginResponse = await request(app)
            .post('/api/client/v1/auth/login')
            .send({ email: 'admin@test.com', password: 'password' });
        authToken = loginResponse.body.content.token;
    });

    afterAll(async () => {
        // Cleanup test data
        await prisma.newsItem.deleteMany({ where: { title: { contains: 'Test News' } } });
        await prisma.$disconnect();
    });

    describe('POST /api/admin/v1/news', () => {
        it('should create news item with status DRAFT by default', async () => {
            const response = await request(app)
                .post('/api/admin/v1/news')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Test News',
                    content: '<p>Test content</p>',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.content.status).toBe('DRAFT');
            expect(response.body.content.title).toBe('Test News');

            testNewsId = response.body.content.id;
        });

        it('should return 400 with Bulgarian error if title missing', async () => {
            const response = await request(app)
                .post('/api/admin/v1/news')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ content: '<p>Test</p>' });

            expect(response.status).toBe(400);
            expect(response.body[0].message).toBe('Заглавието е задължително');
        });

        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .post('/api/admin/v1/news')
                .send({ title: 'Test', content: 'Test' });

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/admin/v1/news', () => {
        it('should return all news items sorted by createdAt DESC', async () => {
            const response = await request(app)
                .get('/api/admin/v1/news')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.content)).toBe(true);

            // Verify sorting
            const items = response.body.content;
            for (let i = 0; i < items.length - 1; i++) {
                const current = new Date(items[i].createdAt);
                const next = new Date(items[i + 1].createdAt);
                expect(current >= next).toBe(true);
            }
        });

        it('should filter by status DRAFT', async () => {
            const response = await request(app)
                .get('/api/admin/v1/news?status=DRAFT')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            response.body.content.forEach((item: any) => {
                expect(item.status).toBe('DRAFT');
            });
        });
    });

    describe('GET /api/admin/v1/news/:id', () => {
        it('should return single news item', async () => {
            const response = await request(app)
                .get(`/api/admin/v1/news/${testNewsId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.content.id).toBe(testNewsId);
        });

        it('should return 404 with Bulgarian error for invalid ID', async () => {
            const response = await request(app)
                .get('/api/admin/v1/news/999999')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Новината не е намерена');
        });
    });

    describe('PUT /api/admin/v1/news/:id', () => {
        it('should update news item and auto-update updatedAt', async () => {
            const response = await request(app)
                .put(`/api/admin/v1/news/${testNewsId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ title: 'Updated Title' });

            expect(response.status).toBe(200);
            expect(response.body.content.title).toBe('Updated Title');
            expect(response.body.content.updatedAt).not.toBe(response.body.content.createdAt);
        });
    });

    describe('DELETE /api/admin/v1/news/:id', () => {
        it('should delete news item with Bulgarian success message', async () => {
            const response = await request(app)
                .delete(`/api/admin/v1/news/${testNewsId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Новината е изтрита успешно');

            // Verify deletion
            const verifyResponse = await request(app)
                .get(`/api/admin/v1/news/${testNewsId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(verifyResponse.status).toBe(404);
        });
    });
});
```

**Running Tests:**
```bash
cd backend
npm test news.routes.test.ts
```

**Expected Test Results:**
- All tests pass ✓
- Coverage: Routes, controllers, services, DAOs
- Authentication tested (401 responses)
- Validation tested (400 responses with Bulgarian messages)
- CRUD operations tested (database persistence verified)

### 📚 Previous Story Intelligence

**Story 3.1: News Prisma Model** [Source: 3-1-news-prisma-model.md]

**Critical Learnings:**

1. **Database Model Established:**
   - NewsItem table: `news_items` (mapped via @@map)
   - NewsStatus enum: DRAFT, PUBLISHED
   - Fields: id (Int), title (String), content (String), imageUrl (String?), status (NewsStatus), publishedAt (DateTime?), createdAt (DateTime), updatedAt (DateTime)
   - Table name: `news_items` (NOT NewsItem - important for Prisma queries)
   - Index on status field for query performance

2. **Prisma Client Ready:**
   - Migration successful: `20260207204606_add_news_model`
   - Prisma Client regenerated with NewsItem types
   - TypeScript types available: `prisma.newsItem.*`
   - Can import from: `@prisma/client`

3. **Testing Standards Established:**
   - Integration tests required for all database operations
   - Model tests created: `backend/__test__/models/news_item.model.test.ts`
   - 15 tests passing for NewsItem model
   - Test coverage includes: required fields, optional fields, enums, auto-generated fields

4. **Code Review Process:**
   - Story 3.1 went through adversarial code review
   - Issues found and fixed: table naming, indexing, test coverage
   - Standard established: ALL stories require tests before marking done

**DO's from Story 3.1:**
- ✅ Use `prisma.newsItem.*` for database queries (lowercase newsItem)
- ✅ Reference table name `news_items` in tests/docs
- ✅ Use NewsStatus enum for type safety: `status: 'DRAFT' | 'PUBLISHED'`
- ✅ Create comprehensive tests before marking story done
- ✅ Follow established patterns from User model implementation

**DON'Ts from Story 3.1:**
- ❌ DON'T use incorrect casing: `prisma.NewsItem` (wrong) vs `prisma.newsItem` (correct)
- ❌ DON'T forget to handle optional fields (imageUrl, publishedAt can be null)
- ❌ DON'T skip test coverage (review process will catch this)
- ❌ DON'T assume defaults - explicitly set status: 'DRAFT' on create

### 🔍 Git Intelligence Summary

**Recent Commits Analysis:**

1. **"project restructured into monorepo" (4f05b5e):**
   - Confirmed monorepo structure: /frontend and /backend folders
   - Backend routes: backend/src/routes/admin/v1/ ✓
   - Backend follows layered architecture ✓

2. **Current Epic Progress:**
   - Epic 1 (Authentication): COMPLETE ✓ (6/6 stories)
   - Epic 2 (Admin Dashboard): COMPLETE ✓ (5/5 stories)
   - **Epic 3 (News Content Management): IN PROGRESS** (1/11 stories done)
     - Story 3.1 (News Prisma Model): DONE ✓
     - **Story 3.2 (News CRUD API): STARTING NOW** ← This story
     - Stories 3.3-3.11: PENDING (depend on 3.1 + 3.2)

3. **Development Environment:**
   - PostgreSQL running on port 5433 (Docker)
   - Backend Node.js server operational
   - Frontend React app running
   - Authentication system working (JWT from Story 1.4)

**Commit Pattern for This Story:**
```bash
# After dev-story completes, expected commit:
git add backend/src/models/news.model.ts
git add backend/src/schemas/news_schema.ts
git add backend/src/dao/news/
git add backend/src/services/admin/news/
git add backend/src/controllers/admin/news_controller.ts
git add backend/src/routes/admin/v1/news_route.ts
git add backend/src/routes/admin/v1/index.ts
git add backend/__test__/news.routes.test.ts
git commit -m "Story 3.2: News CRUD API Endpoints

- Created NewsItem TypeScript model (enum + interface)
- Created Zod validation schemas with Bulgarian error messages
- Implemented 5 DAOs: getAll, getOne, create, update, delete
- Implemented 5 services with business logic and httpMsg responses
- Created news_controller with all CRUD methods
- Created news_route with authentication and validation middleware
- Registered /news route in admin router
- Created comprehensive integration tests (all endpoints tested)
- All tests passing (authentication, validation, CRUD operations)
- Verified Bulgarian error messages, sorting, filtering, 404 handling

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### 🌐 Latest Technical Information (Express.js + Zod + Prisma - 2026)

**Express.js Routing Best Practices (2026):**

1. **Middleware Chaining Order:**
   ```typescript
   router.post('/',
       auth('jwt-user'),      // 1. Authentication first
       validate(schema),      // 2. Validation second
       controller.method      // 3. Controller last
   );
   ```
   - Authentication before validation (no need to validate if not authenticated)
   - Validation before controller (controller assumes valid data)

2. **Route Parameter Types:**
   - Express req.params are always strings
   - Use Zod transform to convert: `z.string().transform(Number)`
   - Controller receives number: `Number(req.params.id)`

3. **Error Handling:**
   - Async errors: Use .catch() → next(err) pattern
   - Global error handler catches all errors
   - Don't use try-catch in controllers (service layer handles it)

**Zod Validation Patterns (2026):**

1. **Bulgarian Error Messages:**
   ```typescript
   z.string({
       required_error: "Заглавието е задължително"
   }).min(1, "Заглавието е задължително")
   ```
   - Use both required_error and min validation
   - Covers missing field AND empty string cases

2. **Optional vs Nullable:**
   ```typescript
   imageUrl: z.string().url().optional()           // Can be undefined
   imageUrl: z.string().url().nullable()          // Can be null
   imageUrl: z.string().url().optional().nullable() // Can be both
   ```
   - Use `.optional()` for fields not required in request
   - Use `.nullable()` for fields that can be null in database

3. **Enum Validation:**
   ```typescript
   status: z.enum(['DRAFT', 'PUBLISHED'])
   ```
   - Matches NewsStatus enum from Prisma
   - Type-safe: TypeScript knows exact values

4. **Type Inference:**
   ```typescript
   export type CreateNewsType = z.infer<typeof createNews>;
   ```
   - TypeScript types automatically derived from Zod schema
   - No need to duplicate types

**Prisma Query Patterns (2026):**

1. **FindMany with Filtering and Sorting:**
   ```typescript
   prisma.newsItem.findMany({
       where: { status: 'DRAFT' },
       select: { id: true, title: true, ... },
       orderBy: { createdAt: 'desc' }
   })
   ```
   - Use `select` for specific fields (performance optimization)
   - Use `orderBy` for sorting (database-level, faster than JS sort)

2. **FindUnique for Single Record:**
   ```typescript
   prisma.newsItem.findUnique({
       where: { id: newsId }
   })
   ```
   - Returns null if not found (handle 404 in service layer)

3. **Create with Defaults:**
   ```typescript
   prisma.newsItem.create({
       data: {
           title,
           content,
           imageUrl,
           status: 'DRAFT', // Explicit default
       }
   })
   ```
   - Prisma schema has @default(DRAFT), but explicit is clearer
   - createdAt and updatedAt auto-generated by Prisma

4. **Update:**
   ```typescript
   prisma.newsItem.update({
       where: { id },
       data: { title, content }, // Only changed fields
   })
   ```
   - updatedAt automatically updated by Prisma (@updatedAt)
   - Partial updates supported (only fields in data object)

5. **Delete (Hard Delete):**
   ```typescript
   prisma.newsItem.delete({
       where: { id }
   })
   ```
   - Permanent deletion (no soft delete for MVP)
   - Returns deleted record
   - Throws error if ID not found (handle in DAO)

**Performance Considerations:**

1. **Database Indexes** (Already added in Story 3.1):
   - Index on `status` field for fast filtering
   - Queries like `WHERE status = 'DRAFT'` use index

2. **Select Only Needed Fields:**
   - Use Prisma `select` to avoid fetching unnecessary data
   - Smaller response payloads = faster API

3. **Sorting at Database Level:**
   - Use Prisma `orderBy` instead of JavaScript sort
   - PostgreSQL sorts faster than Node.js

### 🎯 Project Context & Critical Success Factors

**Project Type:** Kindergarten CMS Admin Panel (Детска градина Дъга)

**Current Status:**
- Epic 1 (Authentication): ✅ COMPLETE (6/6 stories)
- Epic 2 (Admin Dashboard): ✅ COMPLETE (5/5 stories)
- **Epic 3 (News Content Management): 🔧 IN PROGRESS** (1/11 stories done)
  - Story 3.1 (News Prisma Model): ✅ DONE
  - **Story 3.2 (News CRUD API)**: ← Current story (foundational)
  - Stories 3.3-3.11: All depend on 3.1 + 3.2

**Why This Story is Critical:**

1. **Foundation for All News UI Stories:**
   - Story 3.4 (News List View): Consumes GET /api/v1/news
   - Story 3.5 (News Creation Form): Consumes POST /api/v1/news
   - Story 3.6 (Auto-Save): Consumes PUT /api/v1/news/:id
   - Story 3.8 (Publish Workflow): Consumes PUT /api/v1/news/:id (status change)
   - Story 3.9 (Delete Dialog): Consumes DELETE /api/v1/news/:id

2. **Golden Path Workflow:**
   - News management is the PRIMARY use case for kindergarten admins
   - API must be reliable, performant, and user-friendly (Bulgarian errors)
   - Getting the API contract right NOW prevents frontend rework later

3. **API Contract Establishes Frontend Expectations:**
   - Response structure defines frontend TypeScript types
   - Validation errors define frontend error handling
   - Authentication requirement defines frontend auth flow

4. **Testing Standards for Future Stories:**
   - This story establishes testing patterns for Stories 3.3-3.11
   - Integration test approach can be reused for Teachers, Events, Jobs, Gallery

5. **No Going Back:**
   - Once frontend consumes this API (Stories 3.4+), changes are breaking
   - Response structure must be correct from the start
   - Authentication flow must work perfectly

**Next Stories After 3.2:**
- **Story 3.3: Cloudinary Image Upload Service** (Uploads images, returns URLs for imageUrl field)
- **Story 3.4: News List View** (Frontend admin UI consuming GET /api/v1/news)
- **Story 3.5: News Creation Form** (Frontend form consuming POST /api/v1/news)

### ⚠️ Anti-Patterns to Avoid (Critical Developer Guardrails)

**DON'T Reinvent Backend Patterns:**
- ❌ DON'T create custom response formats (use httpMsg utility consistently)
- ❌ DON'T skip authentication middleware (all admin routes require auth)
- ❌ DON'T skip validation middleware (all POST/PUT routes need Zod validation)
- ❌ DON'T use English error messages (Bulgarian required for admin UX)

**DON'T Break Layered Architecture:**
- ❌ DON'T put business logic in controllers (belongs in services)
- ❌ DON'T put Prisma queries in services (belongs in DAOs)
- ❌ DON'T skip DAO layer (services should NOT call prisma directly)
- ❌ DON'T put validation in services (belongs in Zod schemas + middleware)

**DON'T Skip Testing:**
- ❌ DON'T skip integration tests (code review will reject)
- ❌ DON'T skip authentication tests (verify 401 responses)
- ❌ DON'T skip validation tests (verify 400 responses with Bulgarian messages)
- ❌ DON'T skip database verification tests (verify create/update/delete actually persist)

**DON'T Ignore Existing Patterns:**
- ❌ DON'T use different folder structure than users (follow established pattern)
- ❌ DON'T use different naming conventions (follow user_controller.ts pattern)
- ❌ DON'T use different DAO return format (always {success, data, error})
- ❌ DON'T use different service error handling (use httpMsg utility)

**DON'T Add Premature Features:**
- ❌ DON'T add pagination yet (not in acceptance criteria - Story 3.4 may add)
- ❌ DON'T add search/filtering beyond status (not required for MVP)
- ❌ DON'T add soft delete (Epic 3 uses hard delete)
- ❌ DON'T add audit logs (not in Epic 3 scope)

**DON'T Break TypeScript Safety:**
- ❌ DON'T use `any` type (Zod and Prisma provide full types)
- ❌ DON'T skip Zod type exports (frontend needs these types)
- ❌ DON'T bypass Zod validation (defeats purpose of type safety)
- ❌ DON'T forget to handle nullable fields (imageUrl, publishedAt can be null)

### 📝 Implementation Sequence (Critical Order)

**MUST follow this order (dependencies):**

1. **Create TypeScript Models:**
   - Create `backend/src/models/news.model.ts`
   - Define NewsStatus enum and NewsItem interface
   - Verify types match Story 3.1 Prisma schema exactly

2. **Create Zod Validation Schemas:**
   - Create `backend/src/schemas/news_schema.ts`
   - Define all 4 schemas (create, update, getById, getList)
   - Add Bulgarian error messages
   - Export TypeScript types

3. **Create DAOs (Data Access Layer):**
   - Create `backend/src/dao/news/` folder
   - Implement all 5 DAOs following existing pattern
   - Test each DAO works with Prisma (optional: unit tests)

4. **Create Services (Business Logic):**
   - Create `backend/src/services/admin/news/` folder
   - Implement all 5 services using httpMsg and DAOs
   - Handle 404 for getOne ("Новината не е намерена")
   - Handle success message for delete ("Новината е изтрита успешно")

5. **Create Controller:**
   - Create `backend/src/controllers/admin/news_controller.ts`
   - Implement all 5 controller methods
   - Follow existing controller pattern (req, res, next)

6. **Create Routes:**
   - Create `backend/src/routes/admin/v1/news_route.ts`
   - Define all 5 routes with middleware chain
   - Use auth('jwt-user') for all routes
   - Use validate() for appropriate routes

7. **Register Routes:**
   - Modify `backend/src/routes/admin/v1/index.ts`
   - Add news route to defaultRoutes array

8. **Create Tests:**
   - Create `backend/__test__/news.routes.test.ts`
   - Test all CRUD operations
   - Test authentication (401)
   - Test validation (400 with Bulgarian messages)
   - Test 404 handling
   - Test sorting and filtering

9. **Run Tests:**
   - Run `npm test news.routes.test.ts`
   - Verify all tests pass
   - Fix any failures

10. **Manual Testing:**
    - Start backend: `npm run dev`
    - Test with Postman/Thunder Client
    - Verify all acceptance criteria met

11. **Mark Story Complete:**
    - All acceptance criteria met ✓
    - All tests passing ✓
    - Bulgarian error messages verified ✓
    - Ready for Story 3.3 (Cloudinary Upload)

**If Errors Occur:**
- Import errors → Check path aliases in tsconfig.json (@dao, @services, etc.)
- Authentication fails → Verify JWT token from Story 1.4 login
- Validation errors → Check Zod schema matches request body
- Database errors → Check Prisma Client regenerated after Story 3.1
- Test failures → Check test database connection and cleanup

### 📖 References

- [Epics: Epic 3 Overview](_bmad-output/planning-artifacts/epics.md#Epic-3)
- [Epics: Story 3.2 Requirements](_bmad-output/planning-artifacts/epics.md#Story-3.2)
- [Story 3.1: News Prisma Model](_bmad-output/implementation-artifacts/3-1-news-prisma-model.md)
- [Existing Pattern: Users Route](backend/src/routes/admin/v1/users_route.ts)
- [Existing Pattern: Users Controller](backend/src/controllers/admin/users_controller.ts)
- [Existing Pattern: Users Service](backend/src/services/admin/users/show_all_service.ts)
- [Existing Pattern: Users DAO](backend/src/dao/users/user_get_all_dao.ts)
- [Existing Pattern: Auth Schema](backend/src/schemas/auth_schema.ts)
- [Middleware: Authentication](backend/src/middlewares/auth/authenticate.ts)
- [Middleware: Validation](backend/src/middlewares/validate_schema/validade_schema.ts)
- [Utility: HTTP Messages](backend/src/utils/http_messages/http_msg.ts)
- [Express.js Documentation](https://expressjs.com/)
- [Zod Documentation](https://zod.dev/)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Debug Log References

- Code review performed 2026-02-21 identified story file not updated after implementation
- Tests could not run due to port 3344 already in use (backend server running)

### Completion Notes List

1. All CRUD API endpoints implemented following layered architecture (Routes → Controllers → Services → DAOs)
2. Bulgarian error messages implemented for validation ("Заглавието е задължително", "Съдържанието е задължително") and 404 ("Новината не е намерена")
3. Bulgarian success message for delete ("Новината е изтрита успешно")
4. DELETE service updated during code review to properly return 404 for non-existent items
5. TypeScript types improved - replaced `any` with Zod-inferred types in services
6. Parameter naming fixed - `datas` → `data` in DAOs and services
7. Integration tests created with comprehensive coverage
8. **PENDING**: Run integration tests after stopping dev server to verify all passing

### File List

**New Files Created:**
- `backend/src/models/news.model.ts` - NewsStatus enum and NewsItem interface
- `backend/src/schemas/news_schema.ts` - Zod validation schemas with Bulgarian error messages
- `backend/src/dao/news/news_get_all_dao.ts` - findMany DAO
- `backend/src/dao/news/news_get_one_dao.ts` - findUnique DAO
- `backend/src/dao/news/news_create_dao.ts` - create DAO
- `backend/src/dao/news/news_update_dao.ts` - update DAO
- `backend/src/dao/news/news_delete_dao.ts` - delete DAO
- `backend/src/services/admin/news/news_get_all_service.ts` - list service with filtering/sorting
- `backend/src/services/admin/news/news_get_one_service.ts` - single item service with 404 handling
- `backend/src/services/admin/news/news_create_service.ts` - create service with DRAFT default
- `backend/src/services/admin/news/news_update_service.ts` - update service
- `backend/src/services/admin/news/news_delete_service.ts` - delete service with 404 handling
- `backend/src/services/admin/news/index.ts` - service exports
- `backend/src/controllers/admin/news_controller.ts` - CRUD controller
- `backend/src/routes/admin/v1/news_route.ts` - route definitions with auth middleware
- `backend/__test__/news.routes.test.ts` - integration tests

**Modified Files:**
- `backend/src/routes/admin/v1/index.ts` - added news route registration
