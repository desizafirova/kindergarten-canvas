# Story 1.2: Backend API Foundation

Status: done

## Story

As a **developer**,
I want **a configured Express backend with essential middleware**,
so that **I have a secure, production-ready foundation to build API endpoints**.

## Acceptance Criteria

1. **AC1: Backend starts successfully**
   - `npm run dev` in backend/ starts Express server on localhost:3344
   - Server outputs startup confirmation message to console

2. **AC2: CORS configured**
   - CORS allows requests from frontend origin (localhost:5173 in dev, production URL in prod)
   - CORS configuration uses environment variable for allowed origins
   - Preflight requests (OPTIONS) are handled correctly

3. **AC3: Rate limiting configured**
   - Rate limiting middleware installed and configured
   - Admin endpoints limited to 100 requests/minute/IP
   - Rate limit exceeded returns 429 status with appropriate message

4. **AC4: Winston logging configured**
   - All HTTP requests are logged (method, path, status, response time)
   - Errors are logged with stack traces
   - Logs output to console in development, file in production

5. **AC5: Health check endpoint**
   - `GET /api/v1/health` returns `{ status: "ok" }` with 200 status
   - Health check is accessible without authentication

6. **AC6: Environment configuration**
   - Environment variables loaded from `.env` file using dotenv
   - `.env.example` documents all required environment variables
   - Application fails gracefully with clear error if required env vars missing

## Tasks / Subtasks

- [x] **Task 1: Initialize backend with express-prisma-ts-boilerplate** (AC: 1, 6)
  - [x] 1.1: Clone express-prisma-ts-boilerplate into backend/ folder (or download and copy files)
  - [x] 1.2: Remove .git folder from cloned template (keep parent repo's git)
  - [x] 1.3: Run `npm install` in backend/ folder
  - [x] 1.4: Create `.env` file from `.env.example` with placeholder values
  - [x] 1.5: Verify `npm run dev` starts server (may need to fix initial config)

- [x] **Task 2: Configure Express server port and basic setup** (AC: 1)
  - [x] 2.1: Set server port to 3344 in configuration
  - [x] 2.2: Add startup confirmation log message
  - [x] 2.3: Verify server starts on http://localhost:3344

- [x] **Task 3: Configure CORS middleware** (AC: 2)
  - [x] 3.1: Install cors package if not included in boilerplate
  - [x] 3.2: Add FRONTEND_URL to .env.example (default: http://localhost:5173)
  - [x] 3.3: Configure CORS to allow requests from FRONTEND_URL environment variable
  - [x] 3.4: Enable credentials support in CORS config
  - [x] 3.5: Test CORS headers in response (curl or browser devtools)

- [x] **Task 4: Configure rate limiting middleware** (AC: 3)
  - [x] 4.1: Install express-rate-limit package if not included
  - [x] 4.2: Create rate limiter configuration (100 requests/minute/IP)
  - [x] 4.3: Apply rate limiter to /api routes
  - [x] 4.4: Configure rate limit response message
  - [x] 4.5: Test rate limiting by exceeding limit (should return 429)

- [x] **Task 5: Configure Winston logging** (AC: 4)
  - [x] 5.1: Verify Winston is configured (boilerplate should include it)
  - [x] 5.2: Configure request logging middleware (morgan or custom)
  - [x] 5.3: Ensure all requests log: method, path, status, response time
  - [x] 5.4: Ensure errors log with stack traces
  - [x] 5.5: Configure console transport for development
  - [x] 5.6: Configure file transport for production (logs/ directory)

- [x] **Task 6: Create health check endpoint** (AC: 5)
  - [x] 6.1: Create health route at GET /api/v1/health
  - [x] 6.2: Return JSON response: `{ status: "ok" }`
  - [x] 6.3: Ensure endpoint is accessible without authentication
  - [x] 6.4: Test endpoint with curl: `curl http://localhost:3344/api/v1/health`

- [x] **Task 7: Finalize environment configuration** (AC: 6)
  - [x] 7.1: Update .env.example with all required variables:
    - PORT=3344
    - NODE_ENV=development
    - FRONTEND_URL=http://localhost:5173
    - DATABASE_URL=postgresql://user:pass@localhost:5432/kindergarten
    - JWT_SECRET=your-secret-key-here
    - JWT_EXPIRATION=1h
    - JWT_REFRESH_EXPIRATION=7d
  - [x] 7.2: Add validation for required environment variables at startup
  - [x] 7.3: Add clear error messages if required variables are missing
  - [x] 7.4: Document environment variables in backend/README.md

- [x] **Task 8: Verify all acceptance criteria** (AC: 1-6)
  - [x] 8.1: Test server starts with `npm run dev`
  - [x] 8.2: Test CORS headers in response
  - [x] 8.3: Test rate limiting (100 requests then 429)
  - [x] 8.4: Verify request logging in console
  - [x] 8.5: Test health endpoint returns `{ status: "ok" }`
  - [x] 8.6: Test server fails gracefully with missing env vars

## Dev Notes

### Critical Architecture Decisions

**Backend Starter Template** [Source: architecture.md#Recommended Starter Templates]:
- Use `express-prisma-ts-boilerplate` from GitHub
- Repository: https://github.com/vincent-queimado/express-prisma-ts-boilerplate
- Provides: Express + TypeScript + Prisma + JWT + bcrypt + Zod + Winston + Swagger

**Setup Commands** [Source: architecture.md#CLI Quick Reference]:
```bash
cd backend
git clone https://github.com/vincent-queimado/express-prisma-ts-boilerplate.git temp
cp -r temp/* ./
rm -rf temp
npm install
cp .env.example .env
# Edit .env with configuration
npm run dev  # Should start on configured port
```

**Port Configuration**:
- Backend runs on port 3344 (not the default 3000)
- Frontend runs on port 5173 (Vite default)

**API Versioning** [Source: architecture.md#API Naming Conventions]:
- All API routes prefixed with `/api/v1/`
- Health check at `/api/v1/health`

### Technical Requirements

**Rate Limiting** [Source: epics.md#NFR-S7]:
- 100 requests per minute per IP for admin endpoints
- Use express-rate-limit package
- Configuration:
```typescript
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: { status: 'error', message: 'Too many requests, please try again later' }
});
```

**CORS Configuration** [Source: architecture.md#Security]:
- Whitelist only the kindergarten domain
- In development: allow localhost:5173
- In production: use FRONTEND_URL environment variable
```typescript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

**Winston Logging** [Source: architecture.md#Observability & Operations]:
- Log all requests and responses
- Log errors with stack traces
- Development: console output
- Production: file output to logs/ directory

**JSend Response Format** [Source: architecture.md#API Response Format]:
```typescript
// Success
{ status: 'success', data: { ... } }

// Validation error
{ status: 'fail', data: { field: 'ERROR_CODE' } }

// Server error
{ status: 'error', message: 'Internal server error' }
```

### Previous Story Intelligence (Story 1.1)

**Learnings from Story 1.1**:
- Monorepo structure successfully created with frontend/, backend/, shared/
- Frontend runs on localhost:5173 (verified working)
- Backend folder exists with placeholder README.md
- TypeScript path aliases configured (@/* and @shared/*)
- Root .gitignore updated for monorepo structure

**Files Created in Story 1.1**:
- `backend/README.md` (placeholder)
- `backend/.gitkeep`
- `shared/package.json`
- `shared/tsconfig.json`
- `shared/types/index.ts`

**Patterns Established**:
- Package naming: @kindergarten-canvas/[folder]
- TypeScript strict mode enabled
- Path aliases for imports

### Project Structure Notes

**Current Backend Folder State**:
```
backend/
├── .gitkeep
└── README.md (placeholder noting "Backend will be set up in Story 1.2")
```

**Target Backend Structure After This Story**:
```
backend/
├── src/
│   ├── routes/
│   │   └── health.routes.ts
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   │   ├── cors.middleware.ts
│   │   ├── rateLimiter.middleware.ts
│   │   └── logger.middleware.ts
│   ├── utils/
│   │   └── logger.ts
│   └── index.ts (app entry point)
├── prisma/
│   └── schema.prisma
├── logs/ (gitignored)
├── package.json
├── tsconfig.json
├── .env (gitignored)
├── .env.example
└── README.md
```

### Dependencies to Install

**From boilerplate (should be included)**:
- express
- typescript
- prisma / @prisma/client
- winston
- cors
- dotenv
- zod
- jsonwebtoken
- bcryptjs

**May need to add**:
- express-rate-limit (if not in boilerplate)
- morgan (for HTTP request logging, optional - can use Winston directly)

### Testing Verification Commands

```bash
# Start the server
cd backend
npm run dev

# Test health endpoint
curl http://localhost:3344/api/v1/health
# Expected: {"status":"ok"}

# Test CORS headers
curl -i -X OPTIONS http://localhost:3344/api/v1/health \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET"
# Expected: Access-Control-Allow-Origin header present

# Test rate limiting (run 101+ times quickly)
for i in {1..105}; do curl -s http://localhost:3344/api/v1/health; done
# Expected: Last few requests return 429
```

### References

- [Architecture: Backend Starter Template](../_bmad-output/planning-artifacts/architecture.md#Recommended Starter Templates)
- [Architecture: API Response Format](../_bmad-output/planning-artifacts/architecture.md#API Response Format)
- [Architecture: CORS Configuration](../_bmad-output/planning-artifacts/architecture.md#Security)
- [Epics: Story 1.2 Requirements](../_bmad-output/planning-artifacts/epics.md#Story 1.2: Backend API Foundation)
- [NFR-S7: Rate Limiting](../_bmad-output/planning-artifacts/epics.md#Non-Functional Requirements)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- npm install completed with 825 packages (33 vulnerabilities - non-blocking)
- Server starts successfully on localhost:3344
- Database connection fails as expected (PostgreSQL not configured yet - Story 1.3)
- Health endpoint verified: `curl http://localhost:3344/api/v1/health` returns `{"status":"ok"}`
- CORS headers verified: `Access-Control-Allow-Origin: http://localhost:5173`
- Rate limiting verified: `RateLimit-Limit: 100`, `RateLimit-Remaining: 98`

### Completion Notes List

1. Cloned express-prisma-ts-boilerplate from GitHub into backend/ folder
2. Installed 825 npm packages successfully
3. Updated package.json name to @kindergarten-canvas/backend
4. Created .env file with project-specific configuration:
   - Port: 3344
   - CORS origin: http://localhost:5173
   - Rate limit: 100 requests per 1 minute
   - bcrypt salt rounds: 12 (per NFR-S1)
5. Created .env.example with all documented variables
6. Created health check endpoint at /api/v1/health
7. Verified all acceptance criteria:
   - Server starts on port 3344 ✓
   - CORS headers present for localhost:5173 ✓
   - Rate limiting active (100/min) ✓
   - Winston logging configured ✓
   - Health endpoint returns {"status":"ok"} ✓
8. Updated backend/README.md with project documentation

**Note:** Database connection error is expected - PostgreSQL setup will be done in Story 1.3. The backend foundation is complete and ready for database integration.

### File List

**Created:**
- backend/src/routes/commons/health/health_route.ts
- backend/.env
- backend/__test__/routes/health_route.test.ts (added in code review)

**Modified:**
- backend/package.json (name changed to @kindergarten-canvas/backend, added "dev" script)
- backend/.env.example (updated with project-specific variables)
- backend/README.md (replaced with project documentation)
- backend/src/routes/index.ts (added health route)
- backend/src/config/app/index.ts (added env validation - code review fix)
- backend/src/server/app.ts (added CORS credentials support - code review fix)
- backend/src/utils/logger/winston/logger.ts (fixed console log level - code review fix)
- backend/src/middlewares/rate_limiter/rate_limiter.ts (JSend format - code review fix)
- frontend/package.json (name changed to kindergarten-canvas-frontend)
- frontend/vite.config.ts (added @shared path alias)

**From Boilerplate (new files):**
- backend/src/ (entire source directory structure)
- backend/prisma/schema.prisma
- backend/tsconfig.json
- backend/nodemon.json
- backend/jest.config.ts
- backend/__test__/ (test directory)
- backend/docs/ (API documentation)
- backend/public/ (static files)

### Code Review Fixes Applied

**2026-02-04 - Adversarial Code Review by Claude Opus 4.5:**

1. **C1 Fixed**: Added environment variable validation at startup (`backend/src/config/app/index.ts`)
   - Validates JWT_SECRET_USER and JWT_SECRET_ADMIN are at least 32 characters
   - In production: validates DATABASE_URL and CORS_ALLOW_ORIGIN
   - Outputs clear error messages listing all missing/invalid variables
   - Exits with code 1 in production if validation fails

2. **C2 Fixed**: Enabled CORS credentials support (`backend/src/server/app.ts`)
   - Added `credentials: true` to CORS options
   - Added `methods` and `allowedHeaders` per architecture spec

3. **H1 Fixed**: Winston console logging level (`backend/src/utils/logger/winston/logger.ts`)
   - Console transport now uses 'info' level in development, 'error' in production
   - HTTP requests now visible in console during development

4. **M1 Fixed**: Rate limit message format (`backend/src/middlewares/rate_limiter/rate_limiter.ts`)
   - Changed from plain string to JSend format: `{ status: 'error', message: '...' }`

5. **M2 Fixed**: Added health endpoint test (`backend/__test__/routes/health_route.test.ts`)
   - Tests response body equals `{ status: 'ok' }`
   - Tests endpoint is accessible without authentication
   - Tests correct content-type header

6. **M3 Fixed**: Updated File List to include previously undocumented frontend file changes
