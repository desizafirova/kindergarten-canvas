# Story 8.2: Parent Subscription Management API

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want **API endpoints for parent email subscriptions**,
so that **parents can subscribe and unsubscribe from notifications**.

## Acceptance Criteria

### AC1: Subscribe Endpoint — Happy Path

```gherkin
Given a parent wants to subscribe
When they send POST /api/v1/public/subscribe with { email, subscriptionTypes }
Then the response returns status 201
And the body is { status: "success", data: { message: "Успешно се абонирахте за известия!" } }
And a unique unsubscribeToken is generated using crypto.randomBytes(32).toString('hex')
And the subscriber is saved to email_subscribers table with isActive=true
And unsubscribedAt is null
```

### AC2: Already-Subscribed Email

```gherkin
Given a parent submits an already-subscribed email (email already exists in DB)
When the API processes the request
Then the response returns status 200 (not 409, not error)
And the body is { status: "success", data: { message: "Вече сте абонирани" } }
And the existing subscription record is NOT duplicated or modified
```

### AC3: Invalid Email Validation

```gherkin
Given email validation
When an invalid email is submitted (e.g. "not-an-email")
Then the response returns status 400
And the body is { status: "fail", data: { email: ["Невалиден имейл адрес"] } }
```

### AC4: Unsubscribe Endpoint — Valid Token

```gherkin
Given a parent clicks the unsubscribe link from an email
When they visit GET /api/v1/public/unsubscribe?token=[unsubscribeToken] in their browser
Then the response returns status 200 with Content-Type: text/html
And the HTML page displays: "Успешно се отписахте от известията"
And the subscriber record has isActive set to false
And unsubscribedAt is set to current UTC timestamp
```

### AC5: Unsubscribe Endpoint — Invalid/Missing Token

```gherkin
Given an invalid or missing unsubscribe token
When GET /api/v1/public/unsubscribe?token=[bad-or-missing-token] is called
Then the response returns status 400 with Content-Type: text/html
And the HTML page displays: "Невалиден или изтекъл линк"
And no database records are modified
```

### AC6: Admin Subscriber Count Endpoint

```gherkin
Given an authenticated admin user
When they send GET /api/admin/v1/subscribers
Then the response returns status 200
And the body is { status: "success", data: { counts: { NEWS: N, EVENTS: N, DEADLINES: N, total: N } } }
And no individual email addresses are included in the response (privacy protection)
```

### AC7: subscriptionTypes Validation

```gherkin
Given a POST /api/v1/public/subscribe request
When subscriptionTypes contains invalid values (e.g. ["NEWS", "INVALID"])
Then the response returns status 400
And the body is { status: "fail", data: { subscriptionTypes: ["Невалиден тип абонамент"] } }

When subscriptionTypes is an empty array
Then the response returns status 400
And the body is { status: "fail", data: { subscriptionTypes: ["Изберете поне един тип известие"] } }

When subscriptionTypes is missing
Then the response returns status 400
```

## Tasks / Subtasks

### Backend — Schema Validation

- [x] Task 1: Create `backend/src/schemas/subscription_schema.ts` (AC: 1, 2, 3, 7)
  - [x] Export `subscribeSchema` — `z.object({ body: z.object({ email, subscriptionTypes }) })`
  - [x] `email`: `z.string().email('Невалиден имейл адрес')` with required_error Bulgarian message
  - [x] `subscriptionTypes`: `z.array(z.enum(['NEWS', 'EVENTS', 'DEADLINES'])).min(1, 'Изберете поне един тип известие')` with descriptive error for invalid enum values
  - [x] Export `unsubscribeSchema` — validates `query.token` as non-empty string
  - [x] Export TypeScript types via `z.infer<>`

### Backend — Rate Limiter

- [x] Task 2: Add `subscriptionLimiter` to `backend/src/middlewares/rate_limiter/rate_limiter.ts` (AC: 1)
  - [x] 5 subscribe attempts per hour per IP (windowMs: 60 * 60 * 1000, max: 5)
  - [x] Bulgarian error message: `{ status: 'fail', data: { message: 'Твърде много заявки. Моля, опитайте отново по-късно.' } }`
  - [x] Export alongside existing limiters

### Backend — XSS Middleware

- [x] Task 3: Update `backend/src/middlewares/xss/xss.ts` (AC: 1)
  - [x] Add `'subscriptionTypes'` to the `skipFields` array (it's a string array; XSS filtering an array of enum values is harmless but adds `'subscriptionTypes'` alongside `'isActive'` for consistency)
  - [x] Note: `email` field does NOT need to be in skipFields — `inHTMLData` does not modify valid email characters

### Backend — Public Controller

- [x] Task 4: Create `backend/src/controllers/public/subscription_controller.ts` (AC: 1, 2, 3, 4, 5)
  - [x] `subscribe` handler:
    - [x] Validate `req.body` via `subscribeBodySchema.safeParse(req.body)` (inner schema — see Debug Log)
    - [x] If invalid → return 400 with `{ status: 'fail', data: fieldErrors }`
    - [x] Check for existing subscriber: `prisma.emailSubscriber.findUnique({ where: { email } })`
    - [x] If exists → return 200 with `{ status: 'success', data: { message: 'Вече сте абонирани' } }`
    - [x] Generate token: `crypto.randomBytes(32).toString('hex')` (Node.js built-in, no import needed for `randomBytes` — use `import crypto from 'crypto'`)
    - [x] Create subscriber: `prisma.emailSubscriber.create({ data: { email, subscriptionTypes, unsubscribeToken: token } })`
    - [x] Return 201 with `{ status: 'success', data: { message: 'Успешно се абонирахте за известия!' } }`
    - [x] Log subscription: `logger.info('New subscriber', { email, subscriptionTypes })`
    - [x] Catch block → return 500 with `{ status: 'error', message: 'Internal server error' }`
  - [x] `unsubscribe` handler:
    - [x] Read `token` from `req.query.token`
    - [x] If token is missing or empty string → return 400 HTML (see Dev Notes for exact HTML template)
    - [x] `prisma.emailSubscriber.findUnique({ where: { unsubscribeToken: token } })`
    - [x] If not found → return 400 HTML with "Невалиден или изтекъл линк"
    - [x] `prisma.emailSubscriber.update({ where: { unsubscribeToken: token }, data: { isActive: false, unsubscribedAt: new Date() } })`
    - [x] Return 200 HTML with "Успешно се отписахте от известията"
    - [x] Log: `logger.info('Subscriber unsubscribed', { unsubscribeToken: token })`
    - [x] Catch block → return 500 HTML with generic error

### Backend — Admin Controller

- [x] Task 5: Create `backend/src/controllers/admin/subscription_controller.ts` (AC: 6)
  - [x] `getSubscriberCounts` handler (JWT-protected via route middleware):
    - [x] Query 1: `prisma.emailSubscriber.count({ where: { isActive: true, subscriptionTypes: { has: 'NEWS' } } })`
    - [x] Query 2: same for `'EVENTS'`
    - [x] Query 3: same for `'DEADLINES'`
    - [x] Query 4: `prisma.emailSubscriber.count({ where: { isActive: true } })` for total
    - [x] Run all 4 queries in parallel with `Promise.all`
    - [x] Return 200 with `{ status: 'success', data: { counts: { NEWS, EVENTS, DEADLINES, total } } }`
    - [x] NEVER return email addresses in any response field

### Backend — Public Route

- [x] Task 6: Create `backend/src/routes/public/subscription_route.ts` (AC: 1, 4)
  - [x] `router.post('/subscribe', rateLimit.subscriptionLimiter, subscribe)`
  - [x] `router.get('/unsubscribe', unsubscribe)` (no rate limit — harmless GET)
  - [x] Import `subscribe` and `unsubscribe` from public subscription controller
  - [x] Import `rateLimit` from `@middlewares/rate_limiter/rate_limiter`

### Backend — Admin Route

- [x] Task 7: Create `backend/src/routes/admin/v1/subscriber_route.ts` (AC: 6)
  - [x] `router.get('/', authenticateJwt, getSubscriberCounts)` — look at existing admin routes for passport auth pattern
  - [x] See Dev Notes for the correct passport auth import/usage

### Backend — Wire Up Routes

- [x] Task 8: Register public subscription routes in `backend/src/server/app.ts` (AC: 1, 4)
  - [x] Add import: `import publicSubscriptionRoutes from '@routes/public/subscription_route';`
  - [x] Mount: `app.use(baseApiUrl + '/v1/public', publicSubscriptionRoutes);`
  - [x] Add comment: `// Public subscription routes (subscribe + unsubscribe) - NO authentication`
  - [x] Place after the last `app.use(baseApiUrl + '/v1/public/...')` line

- [x] Task 9: Register admin subscriber route in `backend/src/routes/admin/v1/index.ts` (AC: 6)
  - [x] Add import: `import subscriberRoute from './subscriber_route';`
  - [x] Add `{ path: '/subscribers', route: subscriberRoute }` to `defaultRoutes` array

### Tests

- [x] Task 10: Create `backend/__test__/subscription.routes.test.ts` (AC: 1–7)
  - [x] Follow pattern of `backend/__test__/applications.routes.test.ts`
  - [x] Import: `request from 'supertest'`, `server from '../src/server/http_server'`, `prisma from '../prisma/prisma-client'`
  - [x] Import global path: `globalApiPath from '../src/utils/global_api_path/global_api_path'`
  - [x] Cleanup helper: delete `email_subscribers` rows with emails containing `story82test.example.com` domain
  - [x] `beforeAll`: initialize server, cleanup DB
  - [x] `afterAll`: cleanup DB, disconnect prisma, close server
  - [x] Test group: **POST /api/v1/public/subscribe**
    - [x] Returns 201 with success message for valid new subscriber
    - [x] Returns 200 with "Вече сте абонирани" for duplicate email
    - [x] Returns 400 for invalid email format
    - [x] Returns 400 for empty subscriptionTypes array
    - [x] Returns 400 for invalid subscriptionType value
  - [x] Test group: **GET /api/v1/public/unsubscribe**
    - [x] Returns 200 HTML with success text for valid token (verify DB record updated)
    - [x] Returns 400 HTML with error text for invalid token
    - [x] Returns 400 HTML for missing token
  - [x] Test group: **GET /api/admin/v1/subscribers** (requires auth)
    - [x] Login first, get JWT token
    - [x] Returns 200 with counts object including NEWS, EVENTS, DEADLINES, total keys
    - [x] Returns 401 without auth token

## Dev Notes

### Architecture Overview

Story 8.2 builds the public subscription management API on top of the `EmailSubscriber` model from Story 8.1. This story is **backend-only** — no frontend changes. The public subscribe/unsubscribe endpoints are unauthenticated. The admin subscriber count endpoint requires JWT.

Epic 8 data flow:
- **Story 8.1** (done) → `email_subscribers` table exists with all fields
- **This story (8.2)** → API to manage subscriptions
- **Story 8.3** → AWS SES email service (reads `email_subscribers` but doesn't modify this API)
- **Story 8.4** → publish triggers send emails to active subscribers

### Prisma Import Path

**CRITICAL — Do NOT use the wrong path.** The `prisma-client` import path is different in controller vs test files:
- Controllers: `import prisma from '../../../prisma/prisma-client';`
- Test files: `import prisma from '../prisma/prisma-client';`

This was confirmed in Story 8.1's debug log — a wrong import path caused a test failure. The extra `src/` segment does NOT appear in test file paths.

### unsubscribeToken Generation

```typescript
import crypto from 'crypto';

const token = crypto.randomBytes(32).toString('hex');
// Produces a 64-character hex string, e.g. "a3f8c1d2e9b0..."
// Built-in Node.js module — no package install needed
// Referenced in Story 8.1 schema design: "generated in Story 8.2 using crypto.randomBytes(32).toString('hex')"
```

### HTML Response for Unsubscribe Endpoint

The unsubscribe endpoint is accessed directly by clicking a link in an email (browser GET request), so it must return HTML. Use this template structure — keep it minimal and inline-styled:

```typescript
const successHtml = `
<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Отписване от известия</title>
</head>
<body style="font-family: sans-serif; text-align: center; padding: 40px; color: #333;">
  <h1 style="color: #22c55e;">✓</h1>
  <h2>Успешно се отписахте от известията</h2>
  <p>Вече няма да получавате имейл известия от нас.</p>
</body>
</html>`;

const errorHtml = `
<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Грешка</title>
</head>
<body style="font-family: sans-serif; text-align: center; padding: 40px; color: #333;">
  <h1 style="color: #ef4444;">✗</h1>
  <h2>Невалиден или изтекъл линк</h2>
  <p>Линкът за отписване е невалиден или вече е използван.</p>
</body>
</html>`;

// Usage in controller:
res.setHeader('Content-Type', 'text/html');
return res.status(200).send(successHtml);
```

### Admin Endpoint Path Deviation

The epics specify `GET /api/v1/subscribers` for the admin endpoint. However, **the established project pattern** for authenticated admin routes is `GET /api/admin/v1/[resource]` (see `app.ts` line 66: `app.use(baseApiUrl + '/admin/v1/', routesAdmin)`).

**Decision**: Implement as `GET /api/admin/v1/subscribers` to be consistent with all other admin routes. This is a deliberate deviation from the epics spec — document it.

### Passport JWT Auth Pattern for Admin Route

Look at any existing admin route for the auth middleware pattern. Example from `backend/src/routes/admin/v1/job_route.ts`:

```typescript
import passport from 'passport';
// Use passport.authenticate('jwt', { session: false }) as middleware
router.get('/', passport.authenticate('jwt', { session: false }), getSubscriberCounts);
```

Verify the exact import and usage by reading `backend/src/routes/admin/v1/job_route.ts` before implementing.

### Zod Schema for subscriptionTypes Array

The `subscriptionTypes` field is a `String[]` in the DB. Validate it as:

```typescript
import { z } from 'zod';

export const subscribeSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Имейлът е задължителен' })
      .email('Невалиден имейл адрес'),
    subscriptionTypes: z
      .array(
        z.enum(['NEWS', 'EVENTS', 'DEADLINES'], {
          errorMap: () => ({ message: 'Невалиден тип абонамент' }),
        })
      )
      .min(1, 'Изберете поне един тип известие'),
  }),
});

export type SubscribeType = z.infer<typeof subscribeSchema>;
```

**Flatten errors correctly** in the controller:
```typescript
const parseResult = subscribeSchema.safeParse({ body: req.body });
if (!parseResult.success) {
  const errors = parseResult.error.flatten().fieldErrors;
  return res.status(400).json({ status: 'fail', data: errors });
}
const { email, subscriptionTypes } = parseResult.data.body;
```

### Rate Limiter Addition

Add to `backend/src/middlewares/rate_limiter/rate_limiter.ts`:

```typescript
// Public subscription rate limiter: 5 subscribe attempts per hour per IP
const subscriptionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    status: 'fail',
    data: { message: 'Твърде много заявки. Моля, опитайте отново по-късно.' },
  },
  standardHeaders,
  legacyHeaders,
});

export default { limiter, loginLimiter, applicationLimiter, subscriptionLimiter };
```

### app.ts Route Mounting

Mount public subscription routes at `/v1/public` (not `/v1/public/subscriptions`) so that the route handlers define `/subscribe` and `/unsubscribe` paths matching the AC exactly:

```typescript
// In app.ts — add after publicGalleryRoutes:
import publicSubscriptionRoutes from '@routes/public/subscription_route';

// Mount at /v1/public so handlers are at /v1/public/subscribe and /v1/public/unsubscribe
app.use(baseApiUrl + '/v1/public', publicSubscriptionRoutes); // Subscription - NO authentication
```

**Note:** Multiple routers can be mounted at the same path in Express. The `/v1/public` mount does NOT conflict with existing `/v1/public/news`, `/v1/public/jobs` etc. mounts because those have more specific paths and Express handles them correctly.

### Prisma Query for Subscriber Counts

```typescript
// In admin controller — run all 4 queries in parallel:
const [newsCount, eventsCount, deadlinesCount, totalCount] = await Promise.all([
  prisma.emailSubscriber.count({
    where: { isActive: true, subscriptionTypes: { has: 'NEWS' } },
  }),
  prisma.emailSubscriber.count({
    where: { isActive: true, subscriptionTypes: { has: 'EVENTS' } },
  }),
  prisma.emailSubscriber.count({
    where: { isActive: true, subscriptionTypes: { has: 'DEADLINES' } },
  }),
  prisma.emailSubscriber.count({ where: { isActive: true } }),
]);

return res.status(200).json({
  status: 'success',
  data: {
    counts: {
      NEWS: newsCount,
      EVENTS: eventsCount,
      DEADLINES: deadlinesCount,
      total: totalCount,
    },
  },
});
```

### Duplicate Subscription Handling (AC2)

The `email` field has a `@unique` constraint (from Story 8.1). Two approaches:
1. **Check before insert** (`findUnique` first, then `create`) — chosen approach for clarity
2. **Catch P2002 error** — alternative (handle Prisma unique constraint error)

Use approach 1 (check-then-create) to return exactly the right HTTP status (200 vs 201) and message. With P2002 catch, you'd get the same duplicate but lose the ability to distinguish "already subscribed" from other unique violations.

```typescript
// subscribe controller:
const existing = await prisma.emailSubscriber.findUnique({ where: { email } });
if (existing) {
  return res.status(200).json({
    status: 'success',
    data: { message: 'Вече сте абонирани' },
  });
}
// proceed to create...
```

### XSS Middleware Update

In `backend/src/middlewares/xss/xss.ts`, the `skipFields` array currently includes:
```typescript
const skipFields = ['content', 'bio', 'description', 'displayOrder', 'isImportant', 'isUrgent', 'requirements', 'isActive', 'altText', 'images'];
```

Add `'subscriptionTypes'` (the array field) to maintain consistency with other array/non-string fields:
```typescript
const skipFields = ['content', 'bio', 'description', 'displayOrder', 'isImportant', 'isUrgent', 'requirements', 'isActive', 'altText', 'images', 'subscriptionTypes'];
```

**Note on `email` field**: Standard email addresses (`user@example.com`, `user+tag@example.com`) do not contain HTML special characters (`<`, `>`, `&`, `"`, `'`). The `inHTMLData` function will NOT mangle valid email addresses. No need to add `email` to skipFields.

### Test Pattern Reference

Follow `backend/__test__/applications.routes.test.ts` exactly. Key patterns:
1. `server(true)` — pass `true` to get test server instance
2. `globalApiPath()` — returns `/api` prefix
3. Cleanup with named pattern (e.g. `[TEST-SUB]`) to avoid deleting real data
4. Use `beforeAll` for setup, `afterAll` for cleanup + `prisma.$disconnect()`
5. Import from `'../prisma/prisma-client'` (NOT `'../src/prisma/prisma-client'`)

For the subscribe rate limiter test: use a fresh `server(true)` instance (like `applications.routes.test.ts` does for its rate-limit test) to avoid exhausting the 5-per-hour limit across test cases.

### Story 8.1 Learnings (Previous Story Intelligence)

From Story 8.1 dev agent record:
- **Prisma import path in tests**: `'../prisma/prisma-client'` — confirmed. The story 8.1 debug log shows this was a bug found during implementation.
- **Test file location**: `backend/__test__/` (double underscore) — the established backend test directory
- **Code review preference**: Real PrismaClient in tests (not jest-mock-extended) — Story 8.1 was refactored to use real DB during code review. Use real DB in 8.2 tests from the start.
- **Windows EPERM warning**: Not relevant to this story (no Prisma migration or `prisma generate` needed)
- **Migration already applied**: The `email_subscribers` table is live in the DB. Story 8.2 does NOT run any migration.

### Key File Paths

| File | Action | Notes |
|------|--------|-------|
| `backend/src/schemas/subscription_schema.ts` | **NEW** | Zod schemas for subscribe + unsubscribe |
| `backend/src/controllers/public/subscription_controller.ts` | **NEW** | `subscribe` + `unsubscribe` handlers |
| `backend/src/controllers/admin/subscription_controller.ts` | **NEW** | `getSubscriberCounts` handler |
| `backend/src/routes/public/subscription_route.ts` | **NEW** | POST /subscribe + GET /unsubscribe |
| `backend/src/routes/admin/v1/subscriber_route.ts` | **NEW** | GET / → subscriber counts |
| `backend/src/routes/admin/v1/index.ts` | **MODIFY** | Add `/subscribers` route |
| `backend/src/server/app.ts` | **MODIFY** | Mount public subscription routes |
| `backend/src/middlewares/rate_limiter/rate_limiter.ts` | **MODIFY** | Add `subscriptionLimiter` |
| `backend/src/middlewares/xss/xss.ts` | **MODIFY** | Add `'subscriptionTypes'` to skipFields |
| `backend/__test__/subscription.routes.test.ts` | **NEW** | Integration tests (real DB) |
| **REFERENCE** `backend/__test__/applications.routes.test.ts` | Read only | Test pattern to follow exactly |
| **REFERENCE** `backend/src/controllers/public/application_controller.ts` | Read only | Controller pattern |
| **REFERENCE** `backend/src/routes/admin/v1/job_route.ts` | Read only | Passport JWT auth pattern for admin route |
| **REFERENCE** `backend/src/schemas/application_schema.ts` | Read only | Zod schema pattern |
| **REFERENCE** `backend/src/routes/admin/v1/index.ts` | Read only | Admin route registration pattern |

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 8, Story 8.2] — Acceptance criteria and endpoint specifications
- [Source: _bmad-output/implementation-artifacts/8-1-email-subscriber-model.md#Dev Notes] — unsubscribeToken generation, Epic 8.2 forward context, Prisma import path for tests, XSS note
- [Source: backend/src/controllers/public/application_controller.ts] — Controller pattern (Zod validation, Prisma usage, response format, logger)
- [Source: backend/__test__/applications.routes.test.ts] — Integration test pattern (supertest, real DB, cleanup, server init)
- [Source: backend/src/middlewares/rate_limiter/rate_limiter.ts] — `applicationLimiter` pattern to clone for `subscriptionLimiter`
- [Source: backend/src/middlewares/xss/xss.ts] — skipFields array to update
- [Source: backend/src/server/app.ts] — Route mounting pattern; `baseApiUrl` variable
- [Source: backend/src/routes/admin/v1/index.ts] — Admin route registration pattern
- [Source: _bmad-output/planning-artifacts/architecture.md — Email Service section] — AWS SES choice, free tier (not needed for this story but context for Epic 8)

### Project Structure Notes

- **No new directories needed** — all new files go into existing directories
- **No Prisma migration** — the `email_subscribers` table already exists from Story 8.1
- **No frontend changes** — this is a backend-only story; frontend subscription form is deferred (or may use the API in a future story)
- **No new npm packages** — `crypto` is Node.js built-in; all other dependencies (`express`, `zod`, `prisma`) already installed
- **Admin route path deviation** — `GET /api/admin/v1/subscribers` (not `/api/v1/subscribers` as in epics spec) to match established project pattern

## Senior Developer Review (AI)

**Reviewer:** claude-opus-4-6 | **Date:** 2026-03-20 | **Outcome:** APPROVED (after fixes)

### Issues Found and Fixed

| Severity | Issue | Fix Applied |
|----------|-------|-------------|
| HIGH | Race condition: concurrent duplicate emails returned 500 instead of 200 (AC2 violation) | Added P2002 catch block in `subscribe` controller |
| HIGH | `unsubscribeSchema` + `UnsubscribeType` exported but never used (dead code) | Removed from `subscription_schema.ts` |
| MEDIUM | PII (email addresses) logged in plaintext | Changed to log only email domain |
| MEDIUM | Unsubscribe token (bearer secret) logged in plaintext | Changed to log subscriber DB ID |
| MEDIUM | Missing test: `subscriptionTypes` field completely absent (AC7 gap) | Added test case in `subscription.routes.test.ts` |
| MEDIUM | Unsubscribe replay overwrote original `unsubscribedAt` timestamp | Added `isActive` check before update |

### Remaining Low-Severity Notes (no action required)
- Re-subscribe after unsubscribe returns "Вече сте абонирани" — follows AC2 literally; deferred to future epic
- Admin test uses hardcoded seed credentials — consistent with project pattern

---

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

1. **Zod `flatten().fieldErrors` returns `{ body: [...] }` not `{ email: [...] }`** — When using a nested schema `z.object({ body: z.object({ email: ... }) })` and calling `safeParse({ body: req.body })`, the `flatten().fieldErrors` method uses `path[0]` as the key, which is `"body"` — not `"email"`. AC3 requires `{ data: { email: [...] } }`. Fix: export a separate `subscribeBodySchema` (the inner object without the `body` wrapper) and parse `req.body` directly against it. This gives `{ email: [...] }` field errors as expected.

2. **Module-level rate limiter singleton in Jest** — `express-rate-limit` instances are module-level singletons. All server instances created via `server(true)` within the same Jest process share the same in-memory rate limit counters. With `subscriptionLimiter` at 5/hr, calling subscribe more than 5 times in a test suite triggers 429. Fix: restructure test suite to use exactly 5 subscribe API calls (AC1, AC2 reuses AC1 email, AC3, AC7 empty, AC7 invalid), and create the unsubscribe test subscriber directly via `prisma.emailSubscriber.upsert()` instead of POST /subscribe.

3. **`jest.mock` hoisting not available without Babel** — `jest.config.ts` has `transform: {}` which disables ts-jest transforms. `jest.mock(...)` requires Babel hoisting to run before `import` statements. Without Babel, mocks apply after module load, causing "Route.post() requires a callback function but got [object Undefined]". Fix: do not use `jest.mock` for rate limiters; instead restructure tests to stay within real rate limit counts.

### Completion Notes List

- All 10 tasks implemented and 10/10 integration tests passing (`PASS __test__/subscription.routes.test.ts`).
- Used `subscribeBodySchema` (inner schema) for `req.body` parsing in the controller — not the full `subscribeSchema` wrapper — to produce correct `{ email: [...] }` field error keys per AC3/AC7.
- Unsubscribe test subscriber is created directly via Prisma (`upsert`) in `beforeAll` to avoid consuming rate limit slots and allow the test to work reliably.
- Admin route follows the existing `auth('jwt-user')` passport pattern used by all other admin routes in the project.
- TypeScript check (`npx tsc --noEmit`) passes with no errors.
- Admin endpoint path is `GET /api/admin/v1/subscribers` (not `/api/v1/subscribers` as epics spec) to conform with the established project admin route pattern — deliberate and documented deviation.

### File List

**New Files:**
- `backend/src/schemas/subscription_schema.ts`
- `backend/src/controllers/public/subscription_controller.ts`
- `backend/src/controllers/admin/subscription_controller.ts`
- `backend/src/routes/public/subscription_route.ts`
- `backend/src/routes/admin/v1/subscriber_route.ts`
- `backend/__test__/subscription.routes.test.ts`

**Modified Files:**
- `backend/src/middlewares/rate_limiter/rate_limiter.ts` — added `subscriptionLimiter`
- `backend/src/middlewares/xss/xss.ts` — added `'subscriptionTypes'` to skipFields
- `backend/src/server/app.ts` — mounted public subscription routes
- `backend/src/routes/admin/v1/index.ts` — registered `/subscribers` admin route
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — status: in-progress → review

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-17 | 1.0 | Story implemented — all 10 tasks complete, 10/10 tests passing | claude-sonnet-4-6 |
| 2026-03-20 | 1.1 | Code review fixes: P2002 race condition handling, PII/token logging removed, unsubscribe idempotency, dead code removed, missing test added | claude-opus-4-6 |
