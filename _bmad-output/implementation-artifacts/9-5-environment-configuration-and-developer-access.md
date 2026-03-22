# Story 9.5: Environment Configuration and Developer Access

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want **secure access to environment configuration and debugging tools**,
so that **I can troubleshoot third-party service integrations**.

## Acceptance Criteria

**Given** the backend needs environment configuration
**When** the application starts
**Then** all required environment variables are validated at startup
**And** missing required variables cause startup failure with clear error message
**And** `.env.example` documents all variables with descriptions

**Given** required environment variables
**When** configuration is documented
**Then** the following are required:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET_USER`: Secret key for JWT signing (user tokens)
- `JWT_SECRET_ADMIN`: Secret key for JWT signing (admin tokens)
- `JWT_REFRESH_EXPIRATION`: Refresh token expiry
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `AWS_SES_ACCESS_KEY_ID`, `AWS_SES_SECRET_ACCESS_KEY`, `AWS_SES_REGION`, `AWS_SES_FROM_EMAIL`
- `FRONTEND_URL`: For CORS and email links
- `NODE_ENV`: development | staging | production

**Given** a developer user (role=DEVELOPER)
**When** they access the admin panel
**Then** an additional "Разработчик" (Developer) section appears in the sidebar
**And** this section is NOT visible to ADMIN role users

**Given** the developer tools section
**When** accessed by a developer user
**Then** they can view (read-only):
- System health status
- Recent error logs (last 50)
- Environment variable names (NOT values) with status (set/unset)
- API response time metrics
**And** they CANNOT modify configuration through the UI

**Given** authentication for developer endpoints
**When** a request is made to `/api/v1/admin/developer/*` endpoints
**Then** JWT must be valid AND user role must be DEVELOPER
**And** ADMIN role receives 403 Forbidden

**Given** sensitive configuration values
**When** displayed in any context
**Then** API keys and secrets are NEVER exposed in logs, responses, or UI
**And** only names and status (configured/not configured) are shown

## Tasks / Subtasks

- [x] Task 1: Enhance backend environment variable validation at startup (AC: 1, 2)
  - [x] Update `backend/src/config/app/index.ts` `validateEnvVariables()`:
    - Add to always-required (not just prod): `DATABASE_URL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `AWS_SES_REGION`, `AWS_SES_ACCESS_KEY_ID`, `AWS_SES_SECRET_ACCESS_KEY`, `AWS_SES_FROM_EMAIL`
    - Add to prod-required: `FRONTEND_URL` (currently validated only as `CORS_ALLOW_ORIGIN`)
    - Existing: `JWT_SECRET_USER` and `JWT_SECRET_ADMIN` (≥32 chars) already validated — KEEP
    - `DATABASE_URL` is already prod-required — make it always-required (development needs it too)
    - Keep `process.exit(1)` for production errors; dev warns only
    - **CRITICAL**: Do NOT rename/remove existing env var names — the code uses `JWT_SECRET_USER`/`JWT_SECRET_ADMIN`/`JWT_SECRET_APP`, not `JWT_SECRET`/`JWT_REFRESH_SECRET`
  - [x] Verify `.env.example` already documents all env vars (it does — no changes needed there)

- [x] Task 2: Create in-memory error log buffer (AC: 4 — recent error logs)
  - [x] Create `backend/src/utils/logger/error_log_buffer.ts`:
    ```typescript
    interface ErrorLogEntry {
        timestamp: string;
        level: string;
        message: string;
        method?: string;
        url?: string;
        userId?: number | null;
        errorType?: string;
        stack?: string;
    }

    class ErrorLogBuffer {
        private entries: ErrorLogEntry[] = [];
        private readonly MAX_ENTRIES = 50;

        add(entry: ErrorLogEntry): void {
            this.entries.push(entry);
            if (this.entries.length > this.MAX_ENTRIES) {
                this.entries = this.entries.slice(-this.MAX_ENTRIES);
            }
        }

        getRecent(): ErrorLogEntry[] {
            return [...this.entries].reverse(); // most recent first
        }
    }

    export const errorLogBuffer = new ErrorLogBuffer();
    ```
  - [x] Update `backend/src/middlewares/http_error_handler/error_handler.ts`:
    - Import `errorLogBuffer`
    - In the 500 error branch, after `logger.error(...)`, add:
      ```typescript
      errorLogBuffer.add({
          timestamp: new Date().toISOString(),
          level: 'error',
          message: err?.message ?? 'Unknown error',
          method: req.method,
          url: req.originalUrl || req.url,
          userId: (req.user as any)?.id ?? null,
          errorType: err?.constructor?.name ?? 'UnknownError',
          // DO NOT include stack — too verbose for in-memory buffer
      });
      ```
    - **DO NOT** add to warn/info branches — buffer is for error-level entries only

- [x] Task 3: Create developer backend endpoints (AC: 4, 5, 6)
  - [x] Create `backend/src/routes/commons/developer/developer_route.ts`:
    - Auth guard: `auth('jwt-user')` + DEVELOPER role check (return 403 for ADMIN)
    - `GET /` — aggregate developer dashboard data:
      ```typescript
      // Returns:
      {
        status: 'success',
        data: {
          health: { status: 'ok', uptime: number, version: string },
          metrics: { requestCountLastHour, requestCountLast24h, averageResponseTimeMs, errorRate },
          envConfig: [
            { name: 'DATABASE_URL', status: 'configured' | 'missing' },
            { name: 'JWT_SECRET_USER', status: 'configured' | 'missing' },
            // ... all required env vars, names ONLY
          ],
          recentErrors: [ { timestamp, level, message, method, url, userId, errorType } ]
        }
      }
      ```
    - **CRITICAL**: NEVER include actual env var values, only `'configured'` | `'missing'` status
    - Import `metricsStore` from `@utils/metrics/metrics_store`
    - Import `errorLogBuffer` from `@utils/logger/error_log_buffer`
    - The env var list to check (names only):
      `DATABASE_URL`, `JWT_SECRET_USER`, `JWT_SECRET_ADMIN`, `JWT_SECRET_APP`,
      `JWT_REFRESH_EXPIRATION`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`,
      `AWS_SES_REGION`, `AWS_SES_ACCESS_KEY_ID`, `AWS_SES_SECRET_ACCESS_KEY`, `AWS_SES_FROM_EMAIL`,
      `FRONTEND_URL`, `CORS_ALLOW_ORIGIN`, `NODE_ENV`
  - [x] Register route in `backend/src/routes/index.ts`:
    - Add import: `import developerRoute from '@routes/commons/developer/developer_route';`
    - Add to `defaultRoutes`: `{ path: '/v1/admin/developer', route: developerRoute }`
    - **Note**: This registers at `/api/v1/admin/developer` — no separate dev-only guard needed since the auth middleware handles access control

- [x] Task 4: Frontend — add "Разработчик" nav item to sidebar (AC: 3, 4)
  - [x] Add `developer` translation key to `frontend/src/lib/i18n/types.ts`:
    ```typescript
    nav: {
      // ... existing keys ...
      developer: string; // ADD THIS
    };
    ```
  - [x] Add translation to `frontend/src/lib/i18n/bg.ts`:
    ```typescript
    nav: {
      // ... existing keys ...
      developer: 'Разработчик',
    },
    ```
  - [x] Update `frontend/src/components/layout/SidebarNav.tsx`:
    - Import `useContext` and `AuthContext` to access `user.role`
    - Import `Code2` or `Terminal` icon from `lucide-react` (use `Code2`)
    - Add developer nav item conditionally:
      ```tsx
      import { useContext } from 'react';
      import { AuthContext } from '@/contexts/AuthContext';
      // ...
      const { user } = useContext(AuthContext);
      const isDeveloper = user?.role === 'DEVELOPER';
      // Render developer nav item only if isDeveloper:
      {isDeveloper && (
        <NavLink item={{ path: '/admin/developer', icon: Code2, labelKey: 'developer' }} />
      )}
      ```
    - Place the developer section at the BOTTOM of nav, visually separated (use a divider or just render last)
    - **Important**: The `NavItem` type uses `labelKey: keyof ReturnType<typeof useTranslation>['nav']` — adding `developer` to the types.ts will make TypeScript happy

- [x] Task 5: Frontend — create Developer tools page (AC: 4)
  - [x] Create `frontend/src/pages/admin/DeveloperPage.tsx`:
    - Use `useEffect` + `axios/api` to call `GET /api/v1/admin/developer`
    - Display four read-only sections:
      1. **System Health**: Status badge (ok/degraded/unhealthy), uptime, version
      2. **API Metrics**: requestCountLastHour, requestCountLast24h, averageResponseTimeMs, errorRate
      3. **Environment Config**: Table with columns `Variable` | `Status` — status shown as colored badge (green=configured, red=missing). **NO VALUES.**
      4. **Recent Errors**: Table with columns `Time` | `Level` | `Message` | `Method` | `URL` — last 50, newest first
    - No create/edit/delete buttons — read-only display
    - Show loading state while fetching
    - Handle 403 gracefully (shouldn't happen if sidebar guards correctly, but handle anyway)
    - Refresh button to re-fetch data
  - [x] Add route to `frontend/src/App.tsx`:
    ```tsx
    import DeveloperPage from './pages/admin/DeveloperPage';
    // In admin routes:
    <Route
      path="/admin/developer"
      element={
        <ProtectedRoute>
          <AdminLayout>
            <DeveloperPage />
          </AdminLayout>
        </ProtectedRoute>
      }
    />
    ```

- [x] Task 6: Backend tests (AC: 5, 6)
  - [x] Create `backend/__test__/developer.routes.test.ts`:
    - **CRITICAL pattern**: Declare ALL mock variables BEFORE any `import` statements (jest.mock hoisting)
    - Mock `logger`, `verifySesConnection`, and JWT strategy (follow `health.routes.test.ts` pattern)
    - Test cases:
      1. `GET /api/v1/admin/developer` with no auth → 401
      2. `GET /api/v1/admin/developer` with ADMIN role JWT → 403 Forbidden
      3. `GET /api/v1/admin/developer` with DEVELOPER role JWT → 200 with correct shape
      4. Response data structure validation: `data.envConfig` is array with `name` and `status` fields
      5. **CRITICAL**: `data.envConfig` entries MUST NOT contain `value` field — verify this explicitly
      6. `data.recentErrors` is an array (may be empty)
      7. `data.metrics` has `requestCountLastHour`, `requestCountLast24h`, `averageResponseTimeMs`, `errorRate`

## Dev Notes

### What Already Exists (DO NOT re-implement)

| Component | Location | Status |
|---|---|---|
| Env var validation | `backend/src/config/app/index.ts` | EXISTS — validates JWT secrets + prod DATABASE_URL/CORS; needs Cloudinary/SES/FRONTEND_URL added |
| `validateEnvVariables()` | `backend/src/config/app/index.ts:10` | EXISTS — extend this function, do not replace |
| `.env.example` | `backend/.env.example` | EXISTS and comprehensive — no changes needed |
| DEVELOPER role in Prisma | `backend/prisma/schema.prisma:52-55` | EXISTS — `enum Role { ADMIN; DEVELOPER }` |
| AuthenticatedUser interface | `backend/src/middlewares/auth/authenticate.ts:6-10` | EXISTS — `role: 'ADMIN' \| 'DEVELOPER'` |
| Metrics store | `backend/src/utils/metrics/metrics_store.ts` | EXISTS — `metricsStore.getMetrics()` returns requestCountLastHour, requestCountLast24h, averageResponseTimeMs, errorRate |
| Metrics endpoint pattern | `backend/src/routes/commons/metrics/metrics_route.ts` | EXISTS — use as reference for DEVELOPER role check pattern (auth + role check) |
| Health endpoint | `backend/src/routes/commons/health/health_route.ts` | EXISTS — returns status, timestamp, version, uptime |
| Winston logger + error handler | `backend/src/utils/logger/winston/logger.ts`, `backend/src/middlewares/http_error_handler/error_handler.ts` | EXISTS (modified in Story 9.4) |
| AuthContext (user.role) | `frontend/src/contexts/AuthContext.tsx:21` | EXISTS — `role: 'ADMIN' \| 'DEVELOPER'` available in frontend |
| SidebarNav | `frontend/src/components/layout/SidebarNav.tsx` | EXISTS — needs developer nav item |
| i18n types | `frontend/src/lib/i18n/types.ts` | EXISTS — nav type needs `developer: string` |
| bg.ts translations | `frontend/src/lib/i18n/bg.ts` | EXISTS — add `developer: 'Разработчик'` |
| Admin routes in App.tsx | `frontend/src/App.tsx:81+` | EXISTS — add `/admin/developer` route here |

**Existing DEVELOPER role check pattern (copy from metrics_route.ts):**
```typescript
router.get('/', auth('jwt-user'), async (req: Request, res: Response) => {
    const user = req.user as AuthenticatedUser;
    if (user.role !== 'DEVELOPER') {
        return res.status(403).json({
            status: 'fail',
            data: { message: 'Forbidden: DEVELOPER role required' },
        });
    }
    // ... handler logic
});
```

**New files to create:**
- `backend/src/utils/logger/error_log_buffer.ts`
- `backend/src/routes/commons/developer/developer_route.ts`
- `backend/__test__/developer.routes.test.ts`
- `frontend/src/pages/admin/DeveloperPage.tsx`

**Files to modify:**
- `backend/src/config/app/index.ts` — add Cloudinary/SES/FRONTEND_URL to validation
- `backend/src/middlewares/http_error_handler/error_handler.ts` — add errorLogBuffer.add() call
- `backend/src/routes/index.ts` — register `/v1/admin/developer` route
- `frontend/src/lib/i18n/types.ts` — add `developer: string` to nav
- `frontend/src/lib/i18n/bg.ts` — add `developer: 'Разработчик'`
- `frontend/src/components/layout/SidebarNav.tsx` — add DEVELOPER-only nav item
- `frontend/src/App.tsx` — add `/admin/developer` route

### Current Env Validation — What Exists vs What to Add

```typescript
// EXISTING (backend/src/config/app/index.ts:10-36)
const validateEnvVariables = (env: IProcessEnv, isProd: boolean): void => {
    const errors: string[] = [];

    // Always checked:
    if (!env.JWT_SECRET_USER || env.JWT_SECRET_USER.length < 32) { ... }
    if (!env.JWT_SECRET_ADMIN || env.JWT_SECRET_ADMIN.length < 32) { ... }

    // Prod-only checks:
    if (isProd) {
        if (!env.DATABASE_URL) { ... }
        if (!env.CORS_ALLOW_ORIGIN || env.CORS_ALLOW_ORIGIN === '*') { ... }
    }
};
```

**What to add** — add these ALWAYS-required checks (not prod-only):
```typescript
// Cloudinary (needed for image uploads in dev too)
if (!env.CLOUDINARY_CLOUD_NAME) errors.push('CLOUDINARY_CLOUD_NAME is required');
if (!env.CLOUDINARY_API_KEY) errors.push('CLOUDINARY_API_KEY is required');
if (!env.CLOUDINARY_API_SECRET) errors.push('CLOUDINARY_API_SECRET is required');
// AWS SES (needed for email in dev too)
if (!env.AWS_SES_REGION) errors.push('AWS_SES_REGION is required');
if (!env.AWS_SES_ACCESS_KEY_ID) errors.push('AWS_SES_ACCESS_KEY_ID is required');
if (!env.AWS_SES_SECRET_ACCESS_KEY) errors.push('AWS_SES_SECRET_ACCESS_KEY is required');
if (!env.AWS_SES_FROM_EMAIL) errors.push('AWS_SES_FROM_EMAIL is required');
```

**Add to prod-only checks:**
```typescript
if (isProd) {
    // existing checks...
    if (!env.FRONTEND_URL) errors.push('FRONTEND_URL is required in production');
}
```

**IMPORTANT**: The `process.exit(1)` only fires in production — in dev, it logs a warning but continues. This is acceptable behavior. Cloudinary/SES still have fallback defaults so the app won't crash in dev even if missing.

### Route Registration Pattern

Looking at `backend/src/routes/index.ts`, the `defaultRoutes` array is used for all routes. The developer route should be added there (NOT the `devRoutes` array, which is dev-env only):

```typescript
// ADD to defaultRoutes array:
{
    path: '/v1/admin/developer',
    route: developerRoute,
},
```

This registers at `/api/v1/admin/developer` (the `baseApiUrl` is `api/`, combined with the router prefix). Auth is handled inside the route handler itself (same pattern as metrics).

### Path Alias Reference

All `@` aliases map from `backend/tsconfig.json`:
- `@utils` → `src/utils`
- `@middlewares` → `src/middlewares`
- `@config` → `src/config`
- `@routes` → `src/routes`
- `@services` → `src/services`

### Frontend: SidebarNav Role Check

The `SidebarNav` component currently has no access to the user's role. Add:

```tsx
// At top of SidebarNav component:
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { Code2 } from 'lucide-react';

// Inside SidebarNav function body:
const { user } = useContext(AuthContext);
const isDeveloper = user?.role === 'DEVELOPER';
```

Then conditionally render the developer nav item BELOW the main navigation items. The `NavItem` interface requires `labelKey: keyof ReturnType<typeof useTranslation>['nav']`, so add `developer` to the nav type in `types.ts` FIRST.

### Frontend: Developer Page API Call

The developer page calls the backend at:
- `GET /api/v1/admin/developer` — requires Bearer token (use the `api` axios instance from `@/lib/api` which auto-attaches the auth header)

Response shape:
```typescript
{
  status: 'success',
  data: {
    health: { status: string, uptime: number, version: string },
    metrics: {
      requestCountLastHour: number,
      requestCountLast24h: number,
      averageResponseTimeMs: number,
      errorRate: number
    },
    envConfig: Array<{ name: string, status: 'configured' | 'missing' }>,
    recentErrors: Array<{
      timestamp: string,
      level: string,
      message: string,
      method?: string,
      url?: string,
      userId?: number | null,
      errorType?: string
    }>
  }
}
```

### Critical Testing Pattern (MUST follow — from Stories 9.1-9.4)

```typescript
// ✅ Mock variables MUST be declared BEFORE any import statements (jest.mock hoisting)
const mockLoggerError = jest.fn();
const mockLoggerWarn = jest.fn();
const mockLoggerInfo = jest.fn();

jest.mock('../src/utils/logger/winston/logger', () => ({
    __esModule: true,
    default: {
        error: mockLoggerError,
        warn: mockLoggerWarn,
        info: mockLoggerInfo,
        debug: jest.fn(),
    },
}));

// Also mock SES to prevent real connections:
jest.mock('../src/services/email/ses_notification_service', () => ({
    verifySesConnection: jest.fn(() => Promise.resolve()),
}));

// ✅ Only AFTER all jest.mock() calls:
import request from 'supertest';
import createApp from '../src/server/app';
```

**Mocking the JWT/Passport strategy for DEVELOPER role:**
```typescript
// To test with DEVELOPER role, mock passport to inject user:
jest.mock('passport', () => ({
    authenticate: (_strategy: string, _options: unknown, callback: Function) =>
        (_req: unknown, _res: unknown, _next: unknown) =>
            callback(null, { id: 1, email: 'dev@test.com', role: 'DEVELOPER' }),
    use: jest.fn(),
    initialize: jest.fn(() => (_req: unknown, _res: unknown, next: Function) => next()),
}));

// For ADMIN role test, return role: 'ADMIN'
// For 401 test, return null user: callback(null, null)
```

### Architecture Compliance

- **JSend format**: Error responses use `{ status: 'fail', data: { message: '...' } }` — already established pattern
- **No env values exposed**: The developer endpoint returns `status: 'configured' | 'missing'` ONLY — never actual values
- **Test location**: `backend/__test__/` — NOT co-located with source [Source: Story 9.1 learnings]
- **Metrics store singleton**: `metricsStore` is a module-level singleton — import and call directly, no initialization needed
- **Error log buffer**: Follow same singleton pattern as `metricsStore`

### Project Structure Notes

- No new Prisma migrations needed — DEVELOPER role already exists in schema
- No new npm packages needed
- In-memory error log buffer: max 50 entries (circular, FIFO eviction) — small memory footprint
- Backend changes are additive (new route + new utility) + one enhancement (env validation)
- Frontend changes are additive (new page + nav item) + minor type additions

### References

- [Source: `backend/src/config/app/index.ts`] — Existing env validation (lines 10-36)
- [Source: `backend/src/routes/commons/metrics/metrics_route.ts`] — DEVELOPER role check pattern
- [Source: `backend/src/utils/metrics/metrics_store.ts`] — Metrics singleton pattern to replicate for error buffer
- [Source: `backend/src/middlewares/auth/authenticate.ts`] — `AuthenticatedUser` interface with role
- [Source: `backend/src/routes/index.ts`] — Route registration pattern
- [Source: `backend/src/server/app.ts`] — Middleware registration order
- [Source: `frontend/src/components/layout/SidebarNav.tsx`] — SidebarNav structure to extend
- [Source: `frontend/src/contexts/AuthContext.tsx:21`] — `user.role` available in frontend
- [Source: `frontend/src/lib/i18n/types.ts`] — Nav translation type to extend
- [Source: `backend/__test__/health.routes.test.ts`] — Canonical jest.mock hoisting pattern reference
- [Source: `_bmad-output/planning-artifacts/epics.md#Story 9.5`] — Source acceptance criteria
- [Source: `_bmad-output/planning-artifacts/architecture.md#Deployment Architecture`] — Env vars list

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

No issues encountered. All tasks implemented cleanly.

### Completion Notes List

- Task 1: Enhanced `validateEnvVariables()` to always require `DATABASE_URL`, Cloudinary (3 vars), and AWS SES (4 vars); added `FRONTEND_URL` to prod-only checks. Kept `process.exit(1)` prod-only. All existing JWT secret validations preserved.
- Task 2: Created `error_log_buffer.ts` singleton (max 50 entries, FIFO). Integrated into `error_handler.ts` 500 branch only (not warn/info). No stack traces stored in buffer.
- Task 3: Created `developer_route.ts` with DEVELOPER role guard (returns 403 for ADMIN). Aggregates health, metrics, env config (names+status only, no values), and recent errors. Registered at `/v1/admin/developer` in `defaultRoutes`.
- Task 4: Added `developer: string` to nav types, `developer: 'Разработчик'` to bg.ts, and conditionally rendered developer nav item in SidebarNav with divider separator (DEVELOPER role only).
- Task 5: Created `DeveloperPage.tsx` with 4 read-only sections: health, metrics, env config table, recent errors table. Handles 403 gracefully. Has refresh button.
- Task 6: 7 backend tests covering: 401 unauthenticated, 403 ADMIN role, 200 DEVELOPER shape, envConfig no `value` field (security), recentErrors array, metrics fields, populated error buffer.
- All 33 tests in affected modules pass. TypeScript compiles without errors. Pre-existing test failures are unrelated to this story.

### File List

- `backend/src/config/app/index.ts` (modified)
- `backend/src/utils/logger/error_log_buffer.ts` (new)
- `backend/src/middlewares/http_error_handler/error_handler.ts` (modified)
- `backend/src/routes/commons/developer/developer_route.ts` (new)
- `backend/src/routes/index.ts` (modified)
- `backend/__test__/developer.routes.test.ts` (new)
- `backend/__test__/error-log-buffer.test.ts` (new)
- `frontend/src/lib/i18n/types.ts` (modified)
- `frontend/src/lib/i18n/bg.ts` (modified)
- `frontend/src/components/layout/SidebarNav.tsx` (modified)
- `frontend/src/pages/admin/DeveloperPage.tsx` (new)
- `frontend/src/App.tsx` (modified)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)

### Senior Developer Review (AI)

**Reviewer:** Desi | **Date:** 2026-03-22 | **Model:** claude-opus-4-6

**Issues Found:** 3 High, 3 Medium, 3 Low (9 total)

**Fixed (5):**
- [H1] Added `JWT_REFRESH_EXPIRATION` to startup validation (AC2 compliance gap)
- [H2] Wrapped async developer route handler in try/catch to prevent unhandled promise rejections
- [H3] Added `<ErrorBoundary>` wrapper to DeveloperPage route in App.tsx (consistent with all other admin routes)
- [M1] Created unit tests for `ErrorLogBuffer` (5 tests: add/getRecent ordering, copy semantics, FIFO eviction at 50, full/minimal field handling)
- [M3] Exported `ErrorLogEntry` interface from `error_log_buffer.ts`

**Deferred (1):**
- [M2] Fragile `require('../../../../package.json')` — same pattern used in health_route.ts; fixing in isolation would create inconsistency. Should be addressed codebase-wide.

**Accepted as-is (3 Low):**
- [L1] `catch (err: any)` in DeveloperPage — minor TypeScript style
- [L2] Array index as React key for error rows — low risk given refresh-only updates
- [L3] Empty string env vars report as "missing" — arguably correct behavior
