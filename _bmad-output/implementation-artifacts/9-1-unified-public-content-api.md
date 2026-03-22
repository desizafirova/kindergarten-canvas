# Story 9.1: Unified Public Content API

Status: done

## Story

As a **developer**,
I want **optimized public API endpoints for all content types**,
so that **the public website can fetch content efficiently**.

## Acceptance Criteria

**Given** the public website needs to fetch content
**When** requesting any public endpoint
**Then** all endpoints follow consistent pattern: `GET /api/v1/public/[resource]`
**And** all responses follow JSend format: `{ status: "success", data: {...} }`
**And** all endpoints return only PUBLISHED content
**And** response time is < 500ms for all endpoints

**Given** the public API needs a summary endpoint
**When** I request `GET /api/v1/public/homepage`
**Then** the response includes aggregated data for homepage display:
- Latest 3 published news items (title, excerpt, publishedAt)
- Upcoming 3 events (title, eventDate, isImportant)
- Active deadlines count with nearest deadline date
- Latest gallery cover image
**And** single API call reduces frontend complexity

**Given** caching requirements
**When** public content is fetched
**Then** responses include Cache-Control headers (max-age=60 for lists, max-age=300 for individual items)
**And** ETags are generated for cache validation

**Given** pagination for large content lists
**When** I request `GET /api/v1/public/news?page=1&limit=10`
**Then** the response includes pagination metadata:
- `totalCount`: total number of items
- `page`: current page number
- `limit`: items per page
- `totalPages`: calculated total pages
**And** default limit is 10, max limit is 50

## Tasks / Subtasks

- [x] Task 1: Create backend HTML strip utility (AC: homepage excerpt)
  - [x] Create `backend/src/utils/text/strip_html.ts` with server-safe `stripHtml(html)` and `getExcerpt(html, maxLength?)` functions using regex (NOT DOM API — runs on Node.js, not browser)
  - [x] `stripHtml`: replace `/<[^>]*>/g` with space, collapse whitespace, trim
  - [x] `getExcerpt`: call `stripHtml`, truncate to `maxLength` (default 200), append `...` if truncated

- [x] Task 2: Add pagination to news public list endpoint (AC: pagination)
  - [x] Modify `backend/src/controllers/public/news_controller.ts` → `getPublishedNews`
  - [x] Parse `req.query.page` (default `1`) and `req.query.limit` (default `10`, max `50`) as integers; clamp limit to `[1, 50]`
  - [x] Use `prisma.news_items.count({ where })` and `prisma.news_items.findMany({ skip, take, where })` in `Promise.all` for efficiency
  - [x] Add `totalCount`, `page`, `limit`, `totalPages` to response: `{ news: [...], totalCount, page, limit, totalPages }`
  - [x] Remove the old `take: 100` hard limit and replace with paginated query

- [x] Task 3: Add Cache-Control headers to all public endpoints (AC: caching)
  - [x] In each public controller list handler, add `res.set('Cache-Control', 'public, max-age=60')` before the success response
  - [x] Files to update: `news_controller.ts` (list), `teacher_controller.ts`, `event_controller.ts`, `deadline_controller.ts`, `job_controller.ts` (list), `gallery_controller.ts` (list)
  - [x] In each public controller single-item handler, add `res.set('Cache-Control', 'public, max-age=300')`
  - [x] Files to update: `news_controller.ts` (by ID), `job_controller.ts` (by ID), `gallery_controller.ts` (by ID)
  - [x] Note: ETags are already generated automatically by Express's default weak ETag support — no extra code needed, just verify `app.disable('etag')` is NOT present in `app.ts` (it isn't)

- [x] Task 4: Create homepage aggregated endpoint (AC: homepage summary)
  - [x] Create `backend/src/utils/text/strip_html.ts` (Task 1 prerequisite)
  - [x] Create `backend/src/controllers/public/homepage_controller.ts`:
    - Use `Promise.all` to run 4 Prisma queries in parallel
    - Query 1: latest 3 news (`status: 'PUBLISHED'`, `publishedAt: { not: null }`, `orderBy: { publishedAt: 'desc' }`, `take: 3`, `select: { id, title, content, publishedAt }`) → map to add `excerpt: getExcerpt(content)`, drop raw `content` from response
    - Query 2: upcoming 3 events (`status: 'PUBLISHED'`, `eventDate: { gte: today }`, `orderBy: { eventDate: 'asc' }`, `take: 3`, `select: { id, title, eventDate, isImportant }`)
    - Query 3: active deadlines (`status: 'PUBLISHED'`, `deadlineDate: { gte: today }`, `orderBy: { deadlineDate: 'asc' }`, `select: { deadlineDate }`) → transform to `{ activeCount: N, nearestDeadlineDate: deadlines[0]?.deadlineDate ?? null }`
    - Query 4: latest published gallery (`status: 'PUBLISHED'`, `orderBy: { publishedAt: 'desc' }`, `take: 1`, `select: { coverImageUrl }`) → extract `latestGalleryCoverUrl`
    - Return: `{ status: 'success', data: { latestNews, upcomingEvents, deadlinesSummary, latestGalleryCoverUrl } }`
    - Add `res.set('Cache-Control', 'public, max-age=60')` (homepage refreshes like a list)
    - Include response time warning (> 500ms → console.warn)
  - [x] Create `backend/src/routes/public/homepage_route.ts`:
    ```ts
    import { Router } from 'express';
    import { getHomepageData } from '../../controllers/public/homepage_controller';
    const router = Router();
    router.get('/', getHomepageData);
    export default router;
    ```
  - [x] Register in `backend/src/server/app.ts`:
    - Import: `import publicHomepageRoutes from '@routes/public/homepage_route';`
    - Register: `app.use(baseApiUrl + '/v1/public/homepage', publicHomepageRoutes);`

- [x] Task 5: Write tests (AC: all)
  - [x] Create `backend/__test__/homepage-public.routes.test.ts`:
    - Mock `prisma` module (follow jest.mock pattern from Story 8.3 — declare mock variables BEFORE imports)
    - Test: `GET /api/v1/public/homepage` → 200, JSend `{ status: 'success', data: { latestNews, upcomingEvents, deadlinesSummary, latestGalleryCoverUrl } }`
    - Test: `latestNews` items contain `excerpt` field (NOT raw `content`)
    - Test: `deadlinesSummary` contains `activeCount` and `nearestDeadlineDate`
    - Test: response includes `Cache-Control: public, max-age=60` header
  - [x] Create `backend/__test__/news-pagination.test.ts` or extend existing news public tests:
    - Test: `GET /api/v1/public/news` (no params) → default page=1, limit=10, includes pagination metadata
    - Test: `GET /api/v1/public/news?page=2&limit=5` → correct skip/take applied, metadata reflects correct values
    - Test: limit clamped to 50 when `?limit=999`
    - Test: response includes `Cache-Control: public, max-age=60` header
  - [x] Optionally verify Cache-Control header on one other public endpoint test (gallery or job)

## Dev Notes

### What Already Exists (DO NOT re-implement)

All individual public routes are **already fully implemented and registered** in `app.ts`:

| Route | Controller | File |
|---|---|---|
| `GET /api/v1/public/news` | `getPublishedNews` | `news_controller.ts` |
| `GET /api/v1/public/news/:id` | `getPublishedNewsById` | `news_controller.ts` |
| `GET /api/v1/public/teachers` | `getPublishedTeachers` | `teacher_controller.ts` |
| `GET /api/v1/public/events` | `getPublicEvents` | `event_controller.ts` |
| `GET /api/v1/public/admission-deadlines` | `getPublicDeadlines` | `deadline_controller.ts` |
| `GET /api/v1/public/jobs` | `getPublicJobs` | `job_controller.ts` |
| `GET /api/v1/public/jobs/:id` | `getPublicJob` | `job_controller.ts` |
| `GET /api/v1/public/galleries` | `getPublicGalleries` | `gallery_controller.ts` |
| `GET /api/v1/public/galleries/:id` | `getPublicGallery` | `gallery_controller.ts` |
| `POST /api/v1/public/subscribe` etc. | application/subscription | various |

**This story adds:**
1. `GET /api/v1/public/homepage` — new aggregated endpoint
2. Pagination support to `GET /api/v1/public/news`
3. `Cache-Control` headers to all public endpoints

### Architecture Compliance

- **JSend format**: All responses use `{ status: 'success'|'fail'|'error', data/message }` — already established, maintain it [Source: `_bmad-output/planning-artifacts/architecture.md#API Response Format`]
- **Response time < 500ms**: Existing controllers use `console.warn` at 500ms; maintain this pattern. Homepage uses `Promise.all` to parallelize 4 queries
- **No authentication on public routes**: Confirmed in `app.ts` comments — do NOT add JWT middleware to these routes
- **Error handling**: follow existing pattern — `catch (error) { console.error; return res.status(500).json({ status: 'error', message: 'Internal server error' }) }`
- **Caching strategy (architecture doc)**: Architecture says "None for MVP" but Story 9.1 **explicitly introduces** Cache-Control headers — this is intentional and overrides the MVP note [Source: `_bmad-output/planning-artifacts/architecture.md#Caching Boundaries`]

### Prisma Model Quick Reference

All models are confirmed in `backend/prisma/schema.prisma`:
- `news_items` — `id, title, content, imageUrl, status (NewsStatus), publishedAt, createdAt, updatedAt`
- `Event` → table `events` — `id, title, description, eventDate, eventEndDate, location, isImportant, imageUrl, status (EventStatus), publishedAt`
- `Deadline` → table `deadlines` — `id, title, description, deadlineDate, isUrgent, status (DeadlineStatus), publishedAt`
- `Job` → table `jobs` — `id, title, description, requirements, contactEmail, applicationDeadline, isActive, status (JobStatus), publishedAt`
- `Gallery` → table `galleries` — `id, title, description, coverImageUrl, status (GalleryStatus), publishedAt, images[]`
- `teachers` — `id, firstName, lastName, position, bio, photoUrl, status (TeacherStatus), displayOrder`

Status enums: `DRAFT | PUBLISHED` across all content types.

### Server-Side HTML Stripping

The frontend has `frontend/src/lib/text-utils.ts` with `stripHtml` using `document.createElement` — this is **browser-only** and **cannot be used on the backend (Node.js)**.

For the backend, create a regex-based version:

```typescript
// backend/src/utils/text/strip_html.ts
export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function getExcerpt(html: string | null | undefined, maxLength = 200): string {
  const text = stripHtml(html);
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}
```

Do NOT install additional npm packages for this — simple regex is sufficient for excerpt generation.

### Pagination Implementation Pattern

```typescript
// In getPublishedNews controller:
const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
const rawLimit = parseInt(String(req.query.limit ?? '10'), 10) || 10;
const limit = Math.min(50, Math.max(1, rawLimit)); // clamp 1..50
const skip = (page - 1) * limit;

const where = { status: 'PUBLISHED' as const, publishedAt: { not: null } };

const [totalCount, news] = await Promise.all([
  prisma.news_items.count({ where }),
  prisma.news_items.findMany({
    where,
    orderBy: { publishedAt: 'desc' },
    skip,
    take: limit,
    select: { id: true, title: true, content: true, imageUrl: true, publishedAt: true },
  }),
]);

const totalPages = Math.ceil(totalCount / limit);

return res.status(200).json({
  status: 'success',
  data: { news, totalCount, page, limit, totalPages },
});
```

### Homepage Endpoint Response Shape

```typescript
// GET /api/v1/public/homepage
{
  status: 'success',
  data: {
    latestNews: [
      { id: 1, title: '...', excerpt: '...', publishedAt: '2026-03-01T...' }
      // max 3 items
    ],
    upcomingEvents: [
      { id: 2, title: '...', eventDate: '2026-04-15T...', isImportant: false }
      // max 3 items, eventDate >= today, sorted ascending
    ],
    deadlinesSummary: {
      activeCount: 5,
      nearestDeadlineDate: '2026-03-28T...' // null if no active deadlines
    },
    latestGalleryCoverUrl: 'https://res.cloudinary.com/...' // null if no published gallery
  }
}
```

### Cache-Control Header Pattern

```typescript
// For list endpoints (max-age=60 = 1 minute)
res.set('Cache-Control', 'public, max-age=60');

// For individual item endpoints (max-age=300 = 5 minutes)
res.set('Cache-Control', 'public, max-age=300');
```

Set this BEFORE `return res.status(200).json(...)`. Express default weak ETags will be computed automatically from the response body — no explicit ETag code needed.

### ETag Behavior

Express v4/v5 generates weak ETags (`W/"..."`) for GET responses by default. This is confirmed enabled in `app.ts` — there is no `app.disable('etag')` or `app.set('etag', false)` call. The `helmet()` middleware does NOT disable ETags. No code changes needed for ETags.

### `app.ts` Registration Pattern

The existing pattern in `backend/src/server/app.ts` (lines 24-77) imports each route file individually. Follow the same pattern for the new homepage route:

```typescript
// Add import near the other public route imports (lines 24-31):
import publicHomepageRoutes from '@routes/public/homepage_route';

// Add registration near the other public route registrations (lines 70-77):
app.use(baseApiUrl + '/v1/public/homepage', publicHomepageRoutes); // Public homepage - NO authentication
```

The `@routes/` path alias resolves to `backend/src/routes/`. This is set up in `tsconfig.json`.

### Testing Pattern (Critical — from Story 8.3 learnings)

From Epic 8 dev notes: `jest.config.ts` has `transform: {}`. Mock variables MUST be declared BEFORE any `import` statements. Jest hoists `jest.mock` but variable declarations must appear before the hoisted mock factories execute.

```typescript
// ✅ Correct order in test file:
const mockPrismaNewsFindMany = jest.fn();
const mockPrismaNewsCount = jest.fn();
// ... other mock declarations ...

jest.mock('../src/prisma/prisma-client', () => ({
  news_items: {
    findMany: mockPrismaNewsFindMany,
    count: mockPrismaNewsCount,
  },
  // ...
}));

import request from 'supertest';
import createApp from '../src/server/app';
```

Logger import alias from `__test__/` directory: `'../src/utils/logger/winston/logger'` (includes `src/` segment).

Test files live in `backend/__test__/` (not co-located with source). Pattern confirmed in existing test files.

### Project Structure Notes

**New files to create:**
- `backend/src/utils/text/strip_html.ts` — server-safe HTML strip/excerpt utility
- `backend/src/controllers/public/homepage_controller.ts` — homepage aggregated controller
- `backend/src/routes/public/homepage_route.ts` — homepage router
- `backend/__test__/homepage-public.routes.test.ts` — homepage endpoint tests
- `backend/__test__/news-pagination.test.ts` — news pagination tests (or extend existing)

**Existing files to modify:**
- `backend/src/server/app.ts` — import + register homepage route
- `backend/src/controllers/public/news_controller.ts` — add pagination + Cache-Control
- `backend/src/controllers/public/teacher_controller.ts` — add Cache-Control header
- `backend/src/controllers/public/event_controller.ts` — add Cache-Control header
- `backend/src/controllers/public/deadline_controller.ts` — add Cache-Control header
- `backend/src/controllers/public/job_controller.ts` — add Cache-Control headers (list + detail)
- `backend/src/controllers/public/gallery_controller.ts` — add Cache-Control headers (list + detail)

**No database migrations needed** — this story is purely API/controller layer changes. No new Prisma models.

**No frontend changes in this story** — Story 9.2 handles frontend detail pages.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 9, Story 9.1] — Acceptance criteria and specifications
- [Source: `_bmad-output/planning-artifacts/architecture.md#API Response Format`] — JSend standard requirement
- [Source: `_bmad-output/planning-artifacts/architecture.md#Caching Boundaries`] — Architecture caching note (MVP=none, Story 9.1 intentionally introduces headers)
- [Source: `backend/src/server/app.ts`] — Public route registration pattern, all existing public routes
- [Source: `backend/src/controllers/public/news_controller.ts`] — Existing pattern to extend (pagination, Cache-Control)
- [Source: `backend/src/controllers/public/gallery_controller.ts`] — List + detail endpoint pattern for Cache-Control
- [Source: `backend/prisma/schema.prisma`] — All model definitions and field names
- [Source: `frontend/src/lib/text-utils.ts`] — Frontend excerpt logic (browser-only; backend version must use regex)
- [Source: `_bmad-output/implementation-artifacts/8-4-publish-trigger-notifications.md#Test Pattern`] — Jest mock declaration order (critical)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None — implementation proceeded without blockers.

### Completion Notes List

- Task 1: Created `backend/src/utils/text/strip_html.ts` with regex-based `stripHtml` and `getExcerpt` (max 200 chars, appends `...`). Node.js safe — no DOM API.
- Task 2: Refactored `getPublishedNews` to paginate via `Promise.all([count, findMany])`. Page/limit parsed from query params with clamping (limit: 1-50). Pagination metadata added to response. Old `take: 100` removed.
- Task 3: Added `Cache-Control: public, max-age=60` to all 6 public list handlers and `Cache-Control: public, max-age=300` to 3 single-item handlers (news by ID, job by ID, gallery by ID). ETags confirmed enabled (no `app.disable('etag')` in app.ts).
- Task 4: Created `homepage_controller.ts` using `Promise.all` for 4 parallel Prisma queries. Maps news items to strip HTML and produce `excerpt`. Returns `{ latestNews, upcomingEvents, deadlinesSummary, latestGalleryCoverUrl }`. Route registered at `GET /api/v1/public/homepage`.
- Task 5: Created 2 test files with mocked Prisma (jest.mock pattern, vars before imports, `jest.fn(() => Promise.resolve())` for SES connection). 17 tests: 9 homepage + 8 pagination, all passing.
- Pre-existing failures: `public-news.routes.test.ts` and `public-teachers.routes.test.ts` fail with TS error (`prisma.newsItem` → should be `prisma.news_items`) — confirmed pre-existing, unrelated to this story.

### File List

**New files:**
- `backend/src/utils/text/strip_html.ts`
- `backend/src/controllers/public/homepage_controller.ts`
- `backend/src/routes/public/homepage_route.ts`
- `backend/__test__/homepage-public.routes.test.ts`
- `backend/__test__/news-pagination.test.ts`

**Modified files:**
- `backend/src/controllers/public/news_controller.ts`
- `backend/src/controllers/public/teacher_controller.ts`
- `backend/src/controllers/public/event_controller.ts`
- `backend/src/controllers/public/deadline_controller.ts`
- `backend/src/controllers/public/job_controller.ts`
- `backend/src/controllers/public/gallery_controller.ts`
- `backend/src/server/app.ts`

### Senior Developer Review (AI)

**Reviewer:** Desi — 2026-03-21
**Outcome:** Approved with fixes applied

**Issues Fixed (4):**
- **H1 [FIXED]:** `stripHtml` regex did not decode HTML entities — TipTap content with `&nbsp;`, `&amp;`, `&mdash;`, etc. would appear as literal text in excerpts. Added entity decoding map + numeric entity support to `strip_html.ts`.
- **M1 [FIXED]:** Homepage deadlines query used `findMany` to load all active deadline rows just to count and take the first. Replaced with efficient `count()` + `findFirst()` (5 parallel queries, minimal data transfer).
- **M2 [FIXED]:** No test coverage for `Cache-Control: max-age=300` on single-item endpoints. Added test for `GET /api/v1/public/news/:id` verifying max-age=300 header.
- **M4 [FIXED]:** Error test triggered real `console.error` polluting test output. Added `jest.spyOn(console, 'error').mockImplementation()` with assertion and restore.

**Additional test added:** Entity decoding test — verifies `&nbsp;&mdash;` etc. are decoded correctly in excerpts.

**Tests after fixes:** 20 passing (up from 17).

**Low issues (not fixed — documented):**
- L1: No tests for negative/zero page or limit params (clamping logic covered by code, acceptable gap).
- L2: No barrel `index.ts` for `utils/text/` (single file, no pattern issue yet).

## Change Log

- 2026-03-21: Implemented Story 9.1 — Unified Public Content API. Added paginated news endpoint with metadata, Cache-Control headers (max-age=60 for lists, max-age=300 for detail items) across all public controllers, new `GET /api/v1/public/homepage` aggregated endpoint with 4 parallel Prisma queries, server-side HTML strip utility, and 17 passing tests.
- 2026-03-21: Code review fixes — HTML entity decoding in stripHtml, efficient deadlines query (count+findFirst), max-age=300 test for news/:id, console.error suppression in error test. 20 tests passing.
