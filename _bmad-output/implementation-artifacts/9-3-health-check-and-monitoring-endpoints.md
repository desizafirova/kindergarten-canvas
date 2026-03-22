# Story 9.3: Health Check and Monitoring Endpoints

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want **health check and monitoring endpoints**,
so that **I can monitor system availability and performance**.

## Acceptance Criteria

**Given** an uptime monitoring service calls the health endpoint
**When** `GET /api/v1/health` is requested
**Then** response is HTTP 200 with:
```json
{
  "status": "ok",
  "timestamp": "2026-03-21T10:30:00.000Z",
  "version": "1.0.0",
  "uptime": 86400
}
```
**And** response time is < 100ms

**Given** a developer needs dependency verification
**When** `GET /api/v1/health?deep=true` is requested
**Then** response includes dependency status:
```json
{
  "status": "ok",
  "database": "connected",
  "cloudinary": "connected",
  "ses": "connected"
}
```
**And** if any dependency is unhealthy, `status` becomes `"degraded"` or `"unhealthy"`
**And** HTTP 200 if all ok, HTTP 503 if any dependency is unhealthy

**Given** the database query fails during deep health check
**When** `GET /api/v1/health?deep=true` is requested
**Then** `status` is `"unhealthy"`, `database` contains the error message, HTTP 503

**Given** a user with valid JWT and role `DEVELOPER` requests metrics
**When** `GET /api/v1/metrics` is requested with `Authorization: Bearer <token>`
**Then** HTTP 200 with:
```json
{
  "status": "success",
  "data": {
    "requestCountLastHour": 42,
    "requestCountLast24h": 350,
    "averageResponseTimeMs": 123,
    "errorRate": 0.02,
    "activeDbConnections": 5
  }
}
```

**Given** a user with valid JWT but role `ADMIN` requests metrics
**When** `GET /api/v1/metrics` is requested
**Then** HTTP 403 with `{ "status": "fail", "data": { "message": "Forbidden: DEVELOPER role required" } }`

**Given** no JWT token is provided
**When** `GET /api/v1/metrics` is requested
**Then** HTTP 401 Unauthorized

## Tasks / Subtasks

- [x] Task 1: Enhance health endpoint with timestamp, version, uptime, and deep check (AC: 1, 2, 3)
  - [x] Update `backend/src/routes/commons/health/health_route.ts`:
    - Replace the simple `{ status: 'ok' }` response with `{ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0', uptime: Math.floor(process.uptime()) }` for basic GET
    - Add query-string branch: `if (req.query.deep === 'true') { /* deep check */ }`
    - Deep check: run all three dependency checks in `Promise.allSettled(...)`:
      1. **Database**: `await prisma.$queryRaw\`SELECT 1\`` — success → `"connected"`, catch → `"error: <message>"`
      2. **Cloudinary**: `await cloudinary.api.ping()` — success → `"connected"`, catch → `"error: <message>"`
      3. **SES**: `await new SESClient({...}).send(new GetSendQuotaCommand({}))` — success → `"connected"`, catch → `"error: <message>"`
    - Determine overall status: all connected → `"ok"`, any error → `"unhealthy"` (or `"degraded"` if partial, but "unhealthy" for any failure satisfies the AC)
    - Return HTTP 200 if `status === "ok"`, HTTP 503 otherwise
    - Import: `prisma` from `../../../../prisma/prisma-client`, `cloudinary` from `../../config/cloudinary.config`, `SESClient` + `GetSendQuotaCommand` from `@aws-sdk/client-ses`
    - **Do NOT** import `verifySesConnection` — implement SES check inline in the route to avoid coupling (use `new SESClient({region: process.env.AWS_SES_REGION ?? 'eu-central-1', credentials: {...}}).send(new GetSendQuotaCommand({}))`)
  - [x] Add import for cloudinary at top: `import cloudinary from '@config/cloudinary.config';` (note: path alias `@config` maps to `src/config`)
  - [x] Wrap deep check in try/catch: if unexpected error → HTTP 503 `{ status: "unhealthy", error: "Health check failed" }`

- [x] Task 2: Create in-memory metrics store and tracking middleware (AC: 4)
  - [x] Create `backend/src/utils/metrics/metrics_store.ts`:
    - Export singleton `metricsStore` with structure:
      ```typescript
      interface RequestRecord {
        timestamp: number; // Date.now()
        responseTimeMs: number;
        statusCode: number;
      }

      class MetricsStore {
        private records: RequestRecord[] = [];
        private readonly MAX_RECORDS = 10000; // prevent unbounded growth

        record(responseTimeMs: number, statusCode: number): void {
          this.records.push({ timestamp: Date.now(), responseTimeMs, statusCode });
          if (this.records.length > this.MAX_RECORDS) {
            this.records = this.records.slice(-this.MAX_RECORDS);
          }
        }

        getMetrics(): { requestCountLastHour: number; requestCountLast24h: number; averageResponseTimeMs: number; errorRate: number } {
          const now = Date.now();
          const oneHourAgo = now - 60 * 60 * 1000;
          const oneDayAgo = now - 24 * 60 * 60 * 1000;

          const last24h = this.records.filter(r => r.timestamp >= oneDayAgo);
          const lastHour = last24h.filter(r => r.timestamp >= oneHourAgo);

          const totalTime = last24h.reduce((sum, r) => sum + r.responseTimeMs, 0);
          const errorCount = last24h.filter(r => r.statusCode >= 500).length;

          return {
            requestCountLastHour: lastHour.length,
            requestCountLast24h: last24h.length,
            averageResponseTimeMs: last24h.length > 0 ? Math.round(totalTime / last24h.length) : 0,
            errorRate: last24h.length > 0 ? parseFloat((errorCount / last24h.length).toFixed(4)) : 0,
          };
        }
      }

      export const metricsStore = new MetricsStore();
      ```
  - [x] Create `backend/src/middlewares/metrics/metrics_middleware.ts`:
    - Standard Express middleware that records response time + status code on `res.on('finish')`:
      ```typescript
      import { Request, Response, NextFunction } from 'express';
      import { metricsStore } from '@utils/metrics/metrics_store';

      export const metricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
        const start = Date.now();
        res.on('finish', () => {
          metricsStore.record(Date.now() - start, res.statusCode);
        });
        next();
      };
      ```

- [x] Task 3: Create metrics route (AC: 4, 5, 6)
  - [x] Create `backend/src/routes/commons/metrics/metrics_route.ts`:
    - Import `auth` from `@middlewares/auth/authenticate`, `metricsStore`, `prisma`
    - Use `auth('jwt-user')` middleware for JWT validation (→ 401 if no/invalid token)
    - Inline DEVELOPER role check AFTER auth:
      ```typescript
      router.get('/', auth('jwt-user'), async (req: Request, res: Response) => {
        const user = req.user as { id: number; email: string; role: string };
        if (user.role !== 'DEVELOPER') {
          return res.status(403).json({
            status: 'fail',
            data: { message: 'Forbidden: DEVELOPER role required' },
          });
        }

        // Get active DB connections
        let activeDbConnections = 0;
        try {
          const result = await prisma.$queryRaw<{ count: bigint }[]>`
            SELECT count(*) FROM pg_stat_activity WHERE datname = current_database()
          `;
          activeDbConnections = Number(result[0]?.count ?? 0);
        } catch {
          activeDbConnections = -1; // indicates query failed
        }

        const metrics = metricsStore.getMetrics();
        return res.status(200).json({
          status: 'success',
          data: {
            ...metrics,
            activeDbConnections,
          },
        });
      });
      ```
    - Note: the `prisma.$queryRaw` returns `BigInt` for count — convert with `Number()`

- [x] Task 4: Register middleware and metrics route (AC: 1-6)
  - [x] In `backend/src/server/app.ts`:
    - Import `metricsMiddleware`: `import { metricsMiddleware } from '@middlewares/metrics/metrics_middleware';`
    - Register BEFORE all routes (after `app.use(rateLimit.limiter)`): `app.use(metricsMiddleware);`
  - [x] In `backend/src/routes/index.ts`:
    - Import: `import metricsRoute from '@routes/commons/metrics/metrics_route';`
    - Add to `defaultRoutes` array: `{ path: '/v1/metrics', route: metricsRoute }`

- [x] Task 5: Write backend tests (AC: 1-6)
  - [x] Create `backend/__test__/health.routes.test.ts`:
    - **CRITICAL pattern**: Declare ALL mock variables BEFORE any `import` statements (jest.mock hoisting)
    - Mock prisma `$queryRaw`, cloudinary module, SES client, verifySesConnection, logger, metricsStore
    - Tests:
      1. `GET /api/v1/health` → 200, body has `status: "ok"`, `timestamp` (ISO string), `version: "1.0.0"`, `uptime` (number ≥ 0)
      2. `GET /api/v1/health?deep=true` with all healthy → 200, `status: "ok"`, `database: "connected"`, `cloudinary: "connected"`, `ses: "connected"`
      3. `GET /api/v1/health?deep=true` with DB failing → 503, `status: "unhealthy"`, `database` contains "error:"
      4. `GET /api/v1/health?deep=true` with Cloudinary failing → 503, `status: "unhealthy"`, `cloudinary` contains "error:"
  - [x] Create `backend/__test__/metrics.routes.test.ts`:
    - Mock: prisma `$queryRaw`, passport JWT strategy to return user, verifySesConnection, logger, metricsStore
    - Tests:
      1. No auth header → 401
      2. Valid JWT with ADMIN role → 403, `{ status: "fail", data: { message: "Forbidden: DEVELOPER role required" } }`
      3. Valid JWT with DEVELOPER role → 200, `{ status: "success", data: { requestCountLastHour, requestCountLast24h, averageResponseTimeMs, errorRate, activeDbConnections } }`
      4. DB connection query throws → 200 with `activeDbConnections: -1` (graceful degradation)

## Dev Notes

### What Already Exists (DO NOT re-implement)

| Component | Location | Status |
|---|---|---|
| Health route (basic) | `backend/src/routes/commons/health/health_route.ts` | EXISTS — needs enhancement |
| Health registered in routes | `backend/src/routes/index.ts` at `/v1/health` | EXISTS |
| `auth('jwt-user')` middleware | `backend/src/middlewares/auth/authenticate.ts` | EXISTS |
| Prisma client | `backend/prisma/prisma-client.ts` | EXISTS |
| Cloudinary config | `backend/src/config/cloudinary.config.ts` | EXISTS |
| SES client pattern | `backend/src/services/email/ses_notification_service.ts` | EXISTS — do NOT reuse directly |
| Winston logger | `backend/src/utils/logger/winston/logger.ts` | EXISTS |

**New files to create:**
- `backend/src/utils/metrics/metrics_store.ts`
- `backend/src/middlewares/metrics/metrics_middleware.ts`
- `backend/src/routes/commons/metrics/metrics_route.ts`
- `backend/__test__/health.routes.test.ts`
- `backend/__test__/metrics.routes.test.ts`

**Files to modify:**
- `backend/src/routes/commons/health/health_route.ts` — enhance with timestamp/version/uptime + deep check
- `backend/src/server/app.ts` — register metricsMiddleware
- `backend/src/routes/index.ts` — register metrics route

### Architecture Compliance

- **JSend format for metrics**: Use `{ status: "success", data: {...} }` — consistent with all other public/admin API responses [Source: `_bmad-output/planning-artifacts/architecture.md#API Response Format`]
- **Health endpoint format**: The AC specifies a flat format (not JSend) for health: `{ status: "ok", timestamp, version, uptime }` — this is intentional for monitoring tool compatibility. Do NOT wrap in JSend.
- **Deep health format**: Also flat (not JSend): `{ status: "ok"|"unhealthy", database: "connected"|"error:...", ... }`
- **Auth**: `auth('jwt-user')` uses `secretAdmin` (JWT_SECRET_ADMIN) — same as all existing admin/user JWT routes
- **Role check**: `req.user` is typed as `{ id: number, email: string, role: 'ADMIN' | 'DEVELOPER' }` per `authenticate.ts` (the `AuthenticatedUser` interface)
- **No new packages**: All needed packages already exist — `@aws-sdk/client-ses`, `cloudinary` (v2), `passport`, Prisma
- **Test location**: `backend/__test__/` — NOT co-located with source [Source: Story 9.1 learnings]
- **Response time < 100ms**: Health endpoint must be fast; do NOT run deep check in basic mode. Basic check: synchronous data only (timestamp, version, process.uptime())

### Critical Testing Pattern (MUST follow — from Story 9.1/9.2 learnings)

```typescript
// ✅ Mock variables MUST be declared BEFORE any import statements
const mockPrismaQueryRaw = jest.fn() as jest.Mock<any>;
const mockCloudinaryPing = jest.fn() as jest.Mock<any>;
const mockVerifySesConnection = jest.fn(() => Promise.resolve()) as jest.Mock<any>;
const mockMetricsStoreGetMetrics = jest.fn() as jest.Mock<any>;
const mockMetricsStoreRecord = jest.fn() as jest.Mock<any>;

jest.mock('../prisma/prisma-client', () => ({
    __esModule: true,
    default: {
        $queryRaw: mockPrismaQueryRaw,
    },
}));

jest.mock('cloudinary', () => ({
    v2: {
        api: { ping: mockCloudinaryPing },
        config: jest.fn(),
    },
}));

jest.mock('../src/services/email/ses_notification_service', () => ({
    verifySesConnection: mockVerifySesConnection,
}));

jest.mock('../src/utils/logger/winston/logger', () => ({
    __esModule: true,
    default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock('../src/utils/metrics/metrics_store', () => ({
    metricsStore: {
        record: mockMetricsStoreRecord,
        getMetrics: mockMetricsStoreGetMetrics,
    },
}));

// ✅ Only AFTER all jest.mock() calls:
import request from 'supertest';
import createApp from '../src/server/app';
```

**Note on mocking SES in health check**: The health route creates an inline `new SESClient(...)` — you need to mock `@aws-sdk/client-ses`:
```typescript
const mockSesClientSend = jest.fn() as jest.Mock<any>;
jest.mock('@aws-sdk/client-ses', () => ({
    SESClient: jest.fn().mockImplementation(() => ({ send: mockSesClientSend })),
    GetSendQuotaCommand: jest.fn(),
}));
```

### Path Alias Reference

All `@` aliases map from `backend/src/tsconfig.json` (or jest config):
- `@config` → `src/config`
- `@utils` → `src/utils`
- `@middlewares` → `src/middlewares`
- `@routes` → `src/routes`
- `@services` → `src/services`

### Cloudinary `api.ping()` Method

The `cloudinary` v2 package's `api.ping()` method sends a test API request to Cloudinary. It returns a promise that resolves with `{ status: "ok" }` on success and rejects on failure (invalid credentials, network error).

```typescript
import { v2 as cloudinary } from 'cloudinary';
// NOT: import cloudinary from '@config/cloudinary.config'
// Using @config/cloudinary.config works because it imports and configures the same singleton
// but for the health check, import directly from cloudinary to avoid config coupling:
import cloudinary from '@config/cloudinary.config'; // This re-exports the configured v2 instance
await cloudinary.api.ping();
```

### `process.uptime()` Returns

`Math.floor(process.uptime())` returns integer seconds since Node.js process started — matches the AC's example of `86400` (24 hours in seconds).

### Prisma `$queryRaw` with PostgreSQL

```typescript
// Count active connections to the current database
const result = await prisma.$queryRaw<{ count: bigint }[]>`
  SELECT count(*) FROM pg_stat_activity WHERE datname = current_database()
`;
const activeDbConnections = Number(result[0]?.count ?? 0);
```

**BigInt**: Prisma returns `count(*)` as `BigInt` in TypeScript — MUST convert with `Number()` before including in JSON response (JSON.stringify throws on BigInt).

**SQLite note**: This raw query is PostgreSQL-specific. Tests that mock `prisma.$queryRaw` will be fine. If local dev uses SQLite, the deep check DB test will use the mock.

### Metrics Middleware Placement in app.ts

```typescript
// In backend/src/server/app.ts — AFTER existing middleware setup:
app.use(xss());
app.use(rateLimit.limiter);
// ADD HERE:
app.use(metricsMiddleware); // Tracks all requests for /metrics endpoint
```

Place AFTER `rateLimit.limiter` so rate-limited requests are still counted, but BEFORE route handlers.

### SES Inline Check Pattern (for health_route.ts deep check)

```typescript
import { SESClient, GetSendQuotaCommand } from '@aws-sdk/client-ses';

// Inside deep check handler:
const sesCheckClient = new SESClient({
    region: process.env.AWS_SES_REGION ?? 'eu-central-1',
    credentials: {
        accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY ?? '',
    },
});
await sesCheckClient.send(new GetSendQuotaCommand({}));
```

Do NOT reuse `verifySesConnection` from `ses_notification_service.ts` — it logs internally and is designed for startup, not health checks.

### No Frontend Changes

This story is **backend-only**. No frontend changes needed for health/metrics endpoints — they are developer/monitoring tools, not public-facing UI.

### Project Structure Notes

- No new Prisma migrations needed — no new database tables
- No new npm packages needed — all required packages already installed
- The `metrics_store.ts` is a plain TypeScript class (no Prisma, no external deps)
- The MetricsStore holds records **in memory** — resets on every server restart. This is acceptable for the MVP (Render.com single-instance deployment)
- Cleanup of old records (beyond 24h) is handled lazily via filtering — no timer/interval needed

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 9, Story 9.3] — Acceptance criteria
- [Source: `backend/src/routes/commons/health/health_route.ts`] — Existing health route to enhance
- [Source: `backend/src/routes/index.ts`] — Route registration pattern, health at `/v1/health`
- [Source: `backend/src/server/app.ts`] — Middleware registration order, route registration
- [Source: `backend/src/routes/commons/stats/stats_route.ts`] — `auth('jwt-user')` usage pattern for authenticated routes
- [Source: `backend/src/middlewares/auth/authenticate.ts`] — `AuthenticatedUser` interface with `role: 'ADMIN' | 'DEVELOPER'`
- [Source: `backend/src/middlewares/auth/passport_strategies/passportStrategy.ts`] — JWT uses `secretAdmin`, user data includes `role`
- [Source: `backend/prisma/prisma-client.ts`] — Singleton PrismaClient, import path for tests: `../prisma/prisma-client`
- [Source: `backend/src/config/cloudinary.config.ts`] — Cloudinary v2 configured singleton
- [Source: `backend/src/services/email/ses_notification_service.ts`] — SES client pattern (SESClient + GetSendQuotaCommand)
- [Source: `backend/__test__/homepage-public.routes.test.ts`] — Jest mock-vars-before-imports pattern (canonical reference)
- [Source: `_bmad-output/implementation-artifacts/9-2-individual-content-detail-pages.md`] — Story 9.2 learnings, test structure

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

_(none)_

### Completion Notes List

- Enhanced `health_route.ts` to return `{ status, timestamp, version, uptime }` on basic GET and run parallel `Promise.allSettled` checks for DB/Cloudinary/SES on `?deep=true`. HTTP 503 returned if any dependency is unhealthy.
- Created `MetricsStore` singleton (`metrics_store.ts`) holding up to 10,000 in-memory request records with lazy cleanup beyond 24h window.
- Created `metricsMiddleware` that hooks into `res.on('finish')` to record response time and status code for every request.
- Created `metrics_route.ts` with `auth('jwt-user')` for 401, inline DEVELOPER role check for 403, and JSend-format 200 response with aggregated metrics + active DB connections from `pg_stat_activity`.
- Registered `metricsMiddleware` in `app.ts` after `rateLimit.limiter`; registered `/v1/metrics` route in `index.ts`.
- Wrote 4 health tests and 4 metrics tests (8 total); all pass. No regressions in 40 existing mock-based tests.
- Code review (claude-opus-4-6): Fixed degraded vs unhealthy status distinction (partial vs total dependency failure), sanitized error messages on public health endpoint, read version from package.json, exported AuthenticatedUser type for type-safe role check, added SES failure test and all-deps-fail test (10 tests total).

### File List

backend/src/routes/commons/health/health_route.ts (modified)
backend/src/utils/metrics/metrics_store.ts (new)
backend/src/middlewares/metrics/metrics_middleware.ts (new)
backend/src/routes/commons/metrics/metrics_route.ts (new)
backend/src/server/app.ts (modified)
backend/src/routes/index.ts (modified)
backend/__test__/health.routes.test.ts (new)
backend/__test__/metrics.routes.test.ts (new)

## Change Log

| Date | Change | Author |
|---|---|---|
| 2026-03-21 | Implemented Story 9.3: enhanced health endpoint with timestamp/version/uptime/deep check, created in-memory metrics store and middleware, added DEVELOPER-only metrics route, registered all components, wrote 8 tests (all pass) | claude-sonnet-4-6 |
| 2026-03-21 | Code review fixes: degraded/unhealthy status distinction, sanitized public error messages, version from package.json, exported AuthenticatedUser type, added SES and all-fail tests (10 tests total, all pass) | claude-opus-4-6 |
