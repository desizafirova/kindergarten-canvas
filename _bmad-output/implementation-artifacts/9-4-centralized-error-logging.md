# Story 9.4: Centralized Error Logging

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want **centralized error logging with Winston**,
so that **I can troubleshoot issues efficiently**.

## Acceptance Criteria

**Given** the backend uses Winston for logging
**When** the application runs
**Then** logs are structured as JSON for parsing
**And** logs include: timestamp, level, message, context, stack trace (for errors)

**Given** different log levels
**When** events occur
**Then** appropriate levels are used:
- `error`: Exceptions, failed operations, critical issues
- `warn`: Degraded performance, retry attempts, deprecated usage
- `info`: Successful operations, startup/shutdown, publish events
- `debug`: Detailed flow information (disabled in production)

**Given** error logging
**When** an unhandled exception occurs
**Then** the error is logged with full stack trace
**And** request context is included (URL, method, user ID if authenticated)
**And** the error is NOT exposed to the client (generic message returned)

**Given** request logging
**When** an API request completes
**Then** the log includes: method, URL, status code, response time, user agent
**And** request body is NOT logged for privacy (except in debug mode)

**Given** production environment
**When** logs are written
**Then** logs are written to stdout/stderr (for Render log aggregation)
**And** log retention follows Render's default policy

**Given** log search requirements
**When** a developer needs to investigate
**Then** logs can be searched in Render dashboard by timestamp, level, or content

## Tasks / Subtasks

- [x] Task 1: Fix Winston logger to output structured JSON (AC: 1, 2, 5, 6)
  - [x] Update `backend/src/utils/logger/winston/logger.ts`:
    - Replace the `printf`-based custom formats with pure JSON format:
      ```typescript
      const jsonFormat = winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
          winston.format.errors({ stack: true }),  // Serialize Error objects with stack traces
          winston.format.json(),
      );
      ```
    - Update Console transport: set level to `isDevelopment ? 'debug' : 'info'` (was `isDevelopment ? 'info' : 'error'`) — in production ALL log levels (info/warn/error) go to stdout for Render; debug only in dev
    - Keep DailyRotateFile transports but update their format to `jsonFormat` as well (local file logs)
    - Remove `custom` and `customInfo` format variables (replaced by `jsonFormat`)
    - Keep `exitOnError: false` and `handleExceptions: true` (already correct)
    - The Console transport's `handleExceptions: true` ensures uncaught exceptions go to stdout

- [x] Task 2: Update error handler middleware to log with Winston (AC: 3, 4)
  - [x] Update `backend/src/middlewares/http_error_handler/error_handler.ts`:
    - Add import at the top: `import logger from '@utils/logger/winston/logger';`
    - Add a helper to extract request context:
      ```typescript
      const getRequestContext = (req: Request) => ({
          method: req.method,
          url: req.originalUrl || req.url,
          userId: (req.user as any)?.id ?? null,
          userAgent: req.get('user-agent') ?? 'unknown',
          ip: req.ip,
      });
      ```
    - Before the 500 default response, add:
      ```typescript
      // Log the error with full context
      logger.error('Unhandled server error', {
          ...getRequestContext(req),
          error: err?.message ?? 'Unknown error',
          stack: err?.stack ?? 'No stack trace available',
          errorType: err?.constructor?.name ?? 'UnknownError',
      });
      ```
    - For Multer errors (400), log at `warn` level:
      ```typescript
      logger.warn('File upload error', { ...getRequestContext(req), code: err.code });
      ```
    - For JWT errors (401), log at `warn` level:
      ```typescript
      logger.warn('Authentication error', { ...getRequestContext(req), error: err.error });
      ```
    - For ValidationError (400), log at `warn` level:
      ```typescript
      logger.warn('Validation error', { ...getRequestContext(req), message: err.message });
      ```
    - For 404 NotFound, log at `info` level:
      ```typescript
      logger.info('Resource not found', getRequestContext(req));
      ```
    - **CRITICAL**: Do NOT expose `err.stack` or internal error details in the HTTP response body — the generic `'Internal Server Error'` message is correct for clients
    - **DO NOT** change the existing response format shapes — only add logging calls

- [x] Task 3: Update Morgan request logging to include user-agent (AC: 4)
  - [x] Update `backend/src/middlewares/morgan/morgan.ts`:
    - Update the `fileLogger` format string to include user-agent:
      ```typescript
      const fileLogger = morgan(
          ':method :url :status :res[content-length] :response-time ms - :user-agent',
          { stream, skip },
      );
      ```
    - The existing format already captures method, URL, status, response-time — just add `:user-agent`
    - Request body is intentionally NOT in the format string (privacy — correct behavior)
    - The `skip` function (based on `config.debug.http_request`) is acceptable — keep it as-is

- [x] Task 4: Add process-level unhandled rejection handler (AC: 3)
  - [x] In `backend/src/server/server.ts` (or wherever `createApp()` is called/server starts), add:
    ```typescript
    process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
        const error = reason instanceof Error ? reason : new Error(String(reason));
        logger.error('Unhandled Promise Rejection', {
            error: error.message,
            stack: error.stack,
            promise: String(promise),
        });
        // Do NOT exit — let the process continue; Render will restart if truly fatal
    });
    ```
  - **Note**: Check if `server.ts` exists; if not, add this to `app.ts` before the export or in the main entry point
  - `handleExceptions: true` in Winston already handles `uncaughtException` events — this task adds `unhandledRejection` coverage

- [x] Task 5: Write backend tests (AC: 1-4)
  - [x] Create `backend/__test__/error-logging.test.ts`:
    - **CRITICAL pattern**: Declare ALL mock variables BEFORE any `import` statements (jest.mock hoisting)
    - Mock logger to verify calls:
      ```typescript
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
      ```
    - Tests for error handler:
      1. `POST /api/v1/unknown-route-that-errors` → 500 response, `logger.error` called with `{ method, url, error, stack }`
      2. JWT auth error → 401 response, `logger.warn` called with auth error context
      3. 404 not found error → 404 response, `logger.info` called
      4. Multer file size error → 400 response, `logger.warn` called
    - Tests for logger JSON format (unit test):
      1. Import actual (unmocked) logger, verify it has `transports` configured
      2. Verify Console transport exists (for stdout/stderr in Render)
      3. Verify logger level hierarchy (error < warn < info < debug)

## Dev Notes

### What Already Exists (DO NOT re-implement)

| Component | Location | Status |
|---|---|---|
| Winston logger | `backend/src/utils/logger/winston/logger.ts` | EXISTS — format needs fix (printf → JSON) |
| Error handler middleware | `backend/src/middlewares/http_error_handler/error_handler.ts` | EXISTS — needs logger calls added |
| Morgan request logger | `backend/src/middlewares/morgan/morgan.ts` | EXISTS — needs user-agent added to format |
| DailyRotateFile transport | `backend/src/utils/logger/winston/logger.ts` | EXISTS — keep for local file logs |
| Console transport | `backend/src/utils/logger/winston/logger.ts` | EXISTS — primary transport for Render stdout |
| `handleExceptions: true` | `backend/src/utils/logger/winston/logger.ts` | EXISTS — covers uncaughtException |
| Morgan stream → Winston | `backend/src/middlewares/morgan/morgan.ts` | EXISTS — pipes HTTP logs to logger.info |

**New files to create:**
- `backend/__test__/error-logging.test.ts`

**Files to modify:**
- `backend/src/utils/logger/winston/logger.ts` — fix format, fix console level
- `backend/src/middlewares/http_error_handler/error_handler.ts` — add logger calls with request context
- `backend/src/middlewares/morgan/morgan.ts` — add user-agent to format
- `backend/src/server/server.ts` (or entry point) — add `unhandledRejection` handler

**No new npm packages needed** — `winston`, `winston-daily-rotate-file` already installed.

### Critical Problem: Current Logger Outputs Plain Text, NOT JSON

The current logger has a deceptive format chain:
```typescript
// ❌ CURRENT (broken — printf OVERRIDES json())
const custom = winston.format.combine(
    winston.format.json(),        // ← This runs but output is overridden
    winston.format.timestamp(),   // ← This runs but output is overridden
    winston.format.printf(        // ← This OVERRIDES everything above with plain text
        (info) => `${info.timestamp} | ${info.level.toUpperCase()} | ${info.message}`,
    ),
);
```

**Result**: Logs look like `2026-03-21 10:30:00 | ERROR | Something failed` — plain text, not parseable JSON.

**Fix**:
```typescript
// ✅ NEW (correct — pure JSON output)
const jsonFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
    winston.format.errors({ stack: true }),  // CRITICAL: serializes Error objects
    winston.format.json(),
);
```

**Result**: Logs look like:
```json
{"level":"error","message":"Unhandled server error","timestamp":"2026-03-21T10:30:00.000Z","method":"POST","url":"/api/v1/news","userId":42,"stack":"Error: ..."}
```
This is searchable in Render dashboard by any field.

### Current Winston Logger — Console Level Issue

```typescript
// ❌ CURRENT (production only shows errors)
new winston.transports.Console({
    level: isDevelopment ? 'info' : 'error',  // Production misses warn/info logs
    handleExceptions: true,
})

// ✅ FIX (production shows info/warn/error; debug only in dev)
new winston.transports.Console({
    level: isDevelopment ? 'debug' : 'info',  // Production gets info+warn+error; dev gets debug too
    handleExceptions: true,
})
```

This ensures Render collects all meaningful log levels (not just errors).

### Error Handler — Adding Winston Calls (Non-Breaking)

The error handler already works correctly for response format — we are ONLY adding logging:

```typescript
// ✅ ADD at top of file
import logger from '@utils/logger/winston/logger';

// ✅ ADD helper function (before errorHandler export)
const getRequestContext = (req: Request) => ({
    method: req.method,
    url: req.originalUrl || req.url,
    userId: (req.user as any)?.id ?? null,
    userAgent: req.get('user-agent') ?? 'unknown',
    ip: req.ip,
});

// ✅ In the default 500 handler:
logger.error('Unhandled server error', {
    ...getRequestContext(req),
    error: err?.message ?? 'Unknown error',
    stack: err?.stack ?? 'No stack trace available',
    errorType: err?.constructor?.name ?? 'UnknownError',
});
return res.status(500).json({ error: { code: 500, error: 'SERVER_ERROR', message: 'Internal Server Error' } });
```

**IMPORTANT**: The `err.stack` and internal details go to the LOG only — NEVER to the HTTP response. The client continues to receive the generic `'Internal Server Error'` message.

### Morgan Format Update (Minimal Change)

```typescript
// ❌ CURRENT (missing user-agent)
'HTTP request from :remote-addr :method :url :status :res[content-length] - :response-time ms'

// ✅ FIX (add :user-agent at end, keep all existing fields)
':method :url :status :res[content-length] :response-time ms - :user-agent'
```

Note: Morgan pipes to `logger.info()` via the stream — so the HTTP request log line becomes a JSON field in the Winston output:
```json
{"level":"info","message":"GET /api/v1/public/news 200 1234 45.23 ms - Mozilla/5.0...","timestamp":"..."}
```

### Finding server.ts Entry Point

Look for the main server startup file — likely one of:
- `backend/src/server/server.ts`
- `backend/src/index.ts`
- `backend/src/app.ts`

The `process.on('unhandledRejection')` handler should be added in the file that calls `app.listen()`, early in the startup sequence before any async operations.

### Architecture Compliance

- **JSON format**: AC 1 requires "logs structured as JSON" — the fix aligns with this
- **JSend responses**: Do NOT change error handler HTTP response format — JSend is for API responses. Error logging is orthogonal. [Source: `_bmad-output/planning-artifacts/architecture.md#API Response Format`]
- **No request body logging**: Morgan format intentionally omits body — privacy compliance per AC 4
- **Stdout/stderr for Render**: Console transport writes to stdout (info/warn) and stderr (error) automatically — Render ingests both [Source: Story 9.3 notes — Render deployment on free tier]
- **Debug disabled in production**: `level: isDevelopment ? 'debug' : 'info'` implements this
- **Test location**: `backend/__test__/` — NOT co-located with source [Source: Story 9.1 learnings]

### Critical Testing Pattern (MUST follow — from Story 9.1/9.2/9.3 learnings)

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

// Also mock other side-effect dependencies to prevent real connections:
jest.mock('../src/services/email/ses_notification_service', () => ({
    verifySesConnection: jest.fn(() => Promise.resolve()),
}));

// ✅ Only AFTER all jest.mock() calls:
import request from 'supertest';
import createApp from '../src/server/app';

// In beforeEach: clear mocks
beforeEach(() => {
    mockLoggerError.mockClear();
    mockLoggerWarn.mockClear();
    mockLoggerInfo.mockClear();
});
```

### Testing Error Handler Logging

To trigger 500 errors in tests, create a test route that throws:
```typescript
// In the test file, use a custom app with an error-throwing route:
import express from 'express';
import handleError from '../src/middlewares/http_error_handler/error_handler';

const testApp = express();
testApp.get('/test-error', (_req, _res, next) => {
    next(new Error('Test error for logging'));
});
testApp.use(handleError);

// Test:
const res = await request(testApp).get('/test-error');
expect(res.status).toBe(500);
expect(mockLoggerError).toHaveBeenCalledWith(
    'Unhandled server error',
    expect.objectContaining({
        error: 'Test error for logging',
        stack: expect.stringContaining('Error: Test error for logging'),
        method: 'GET',
        url: '/test-error',
    })
);
```

### Path Alias Reference

All `@` aliases map from `backend/src/tsconfig.json`:
- `@utils` → `src/utils`
- `@middlewares` → `src/middlewares`
- `@config` → `src/config`
- `@services` → `src/services`

### No Frontend Changes

This story is **backend-only**. No frontend changes needed — error logging and monitoring are developer-facing only.

### Project Structure Notes

- No new Prisma migrations needed — no database changes
- No new npm packages needed — `winston` and `winston-daily-rotate-file` already installed
- Changes are additive (adding logger calls) and format-fixing (JSON instead of printf) — low regression risk
- The `winston.format.errors({ stack: true })` is critical for Error objects; without it, `err.stack` is not serialized in JSON format

### References

- [Source: `backend/src/utils/logger/winston/logger.ts`] — Existing Winston config with printf format issue
- [Source: `backend/src/middlewares/http_error_handler/error_handler.ts`] — Existing error handler without logging
- [Source: `backend/src/middlewares/morgan/morgan.ts`] — Morgan HTTP request logger
- [Source: `backend/src/server/app.ts`] — Middleware registration order
- [Source: `_bmad-output/planning-artifacts/architecture.md#Observability & Operations`] — "Centralized logging: Winston logger (backend)"
- [Source: `_bmad-output/planning-artifacts/architecture.md#API Response Format`] — JSend format rules
- [Source: `_bmad-output/implementation-artifacts/9-3-health-check-and-monitoring-endpoints.md`] — Story 9.3 learnings, test patterns
- [Source: `backend/__test__/health.routes.test.ts`] — Canonical jest.mock hoisting pattern reference

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

_No debug issues encountered. Implementation was straightforward._

### Completion Notes List

- **Task 1**: Replaced `printf`-based custom format (which overrode `json()`) with pure `jsonFormat` using `winston.format.combine(timestamp, errors({stack:true}), json())`. Fixed console transport level from `isDevelopment ? 'info' : 'error'` to `isDevelopment ? 'debug' : 'info'` so production Render logs capture info/warn/error. Removed `custom` and `customInfo` variables.
- **Task 2**: Added `getRequestContext()` helper and logger calls to all error branches in `error_handler.ts`: `logger.error` for 500s (with full stack/context), `logger.warn` for multer/validation/JWT errors, `logger.info` for 404s. Response format shapes are unchanged — stack trace never exposed to client.
- **Task 3**: Updated Morgan `fileLogger` format to `:method :url :status :res[content-length] :response-time ms - :user-agent`. Request body intentionally omitted for privacy.
- **Task 4**: Added `process.on('unhandledRejection')` handler in `http_server.ts` (before `export default`) which logs via `logger.error` with message, stack, and promise string. Does not exit the process.
- **Task 5**: Created `backend/__test__/error-logging.test.ts` with 11 tests (8 error handler integration tests + 3 logger config unit tests). All pass. Used `jest.requireActual` for real logger config tests.

### File List

- `backend/src/utils/logger/winston/logger.ts` (modified)
- `backend/src/middlewares/http_error_handler/error_handler.ts` (modified)
- `backend/src/middlewares/morgan/morgan.ts` (modified)
- `backend/src/server/http_server.ts` (modified)
- `backend/__test__/error-logging.test.ts` (created)

## Senior Developer Review (AI)

**Reviewer:** claude-opus-4-6 on 2026-03-21
**Outcome:** Changes Requested → Fixed

**Issues Found:** 1 High, 4 Medium fixed automatically.

- **[HIGH] 422 Unprocessable handler missing logging** — `error_handler.ts:107` had no `logger.warn` call, inconsistent with all other error branches. Added `logger.warn('Unprocessable entity', ...)`.
- **[MEDIUM] Missing tests for 422, LIMIT_UNEXPECTED_FILE, generic multer, and fileFilter paths** — 5 new tests added covering all previously untested error handler branches.
- **[MEDIUM] Level hierarchy test was trivial** — Replaced `typeof` checks with actual Winston `npm.levels` integer comparison + console transport level assertion.
- **[MEDIUM] `shutDown` used `logger.error` for routine SIGTERM/SIGINT** — Downgraded to `logger.warn`/`logger.info` so error searches aren't polluted by graceful shutdowns.

**Final test count:** 16 tests, all passing.

## Change Log

- 2026-03-21: Implemented Story 9.4 — Centralized Error Logging. Fixed Winston logger to output structured JSON (replaced printf format). Added Winston logger calls with request context to error handler middleware. Updated Morgan format to include user-agent. Added process-level unhandledRejection handler. Created 11-test suite verifying error handler logging behaviour and logger configuration.
- 2026-03-21: Code review fixes — Added missing `logger.warn` to 422 Unprocessable handler. Added 5 new tests for uncovered error paths. Improved level hierarchy test. Downgraded shutdown log levels from error to warn/info.
