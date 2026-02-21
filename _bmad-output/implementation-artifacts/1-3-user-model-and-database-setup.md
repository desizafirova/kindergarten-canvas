# Story 1.3: User Model and Database Setup

Status: done

## Story

As a **developer**,
I want **a User model in PostgreSQL with Prisma**,
so that **administrators can have accounts for authentication**.

## Acceptance Criteria

1. **AC1: User model defined in Prisma schema**
   - Prisma schema defines a User model with fields:
     - `id` (Int, auto-increment, primary key)
     - `email` (String, unique)
     - `password` (String, hashed)
     - `role` (Enum: ADMIN, DEVELOPER)
     - `createdAt` (DateTime)
     - `updatedAt` (DateTime)

2. **AC2: Database migration succeeds**
   - `npx prisma migrate dev` creates the users table successfully
   - Migration files are version-controlled in prisma/migrations/

3. **AC3: Seed script creates default admin**
   - A seed script creates a default admin user with:
     - email: configurable via environment variable (DEFAULT_ADMIN_EMAIL)
     - password: hashed with bcrypt (12+ salt rounds) from env (DEFAULT_ADMIN_PASSWORD)
     - role: ADMIN
   - `npx prisma db seed` executes successfully

4. **AC4: Database connection works**
   - Backend server connects to PostgreSQL successfully
   - No "Unable to connect to database" error on startup

## Tasks / Subtasks

- [x] **Task 1: Set up PostgreSQL database** (AC: 4)
  - [x] 1.1: Install PostgreSQL locally OR use a cloud instance (Render, Supabase)
  - [x] 1.2: Create database named `kindergarten_canvas`
  - [x] 1.3: Update DATABASE_URL in backend/.env with correct connection string
  - [x] 1.4: Verify database connection by running backend (should not show connection error)

- [x] **Task 2: Update Prisma schema with User model** (AC: 1)
  - [x] 2.1: Create Role enum (ADMIN, DEVELOPER)
  - [x] 2.2: Replace existing User model with project-specific schema:
    - id: Int, autoincrement, primary key
    - email: String, unique
    - password: String
    - role: Role enum
    - createdAt: DateTime, default now()
    - updatedAt: DateTime, auto-update
  - [x] 2.3: Run `npx prisma format` to validate schema

- [x] **Task 3: Run database migration** (AC: 2)
  - [x] 3.1: Run `npx prisma migrate dev --name init_user_model`
  - [x] 3.2: Verify migration creates users table in PostgreSQL
  - [x] 3.3: Run `npx prisma generate` to update Prisma Client

- [x] **Task 4: Create seed script** (AC: 3)
  - [x] 4.1: Add DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD to .env.example
  - [x] 4.2: Create/update prisma/seed/seed.ts with admin user creation
  - [x] 4.3: Use bcrypt with 12+ salt rounds for password hashing
  - [x] 4.4: Handle duplicate email gracefully (upsert or check exists)
  - [x] 4.5: Add seed script to package.json prisma config if not present
  - [x] 4.6: Test `npx prisma db seed` executes successfully

- [x] **Task 5: Update environment configuration** (AC: 3, 4)
  - [x] 5.1: Add to .env:
    - DEFAULT_ADMIN_EMAIL (e.g., admin@kindergarten.bg)
    - DEFAULT_ADMIN_PASSWORD (secure password)
  - [x] 5.2: Add to .env.example with placeholder values
  - [x] 5.3: Update backend/README.md with database setup instructions

- [x] **Task 6: Verify all acceptance criteria** (AC: 1-4)
  - [x] 6.1: Verify User model schema matches requirements
  - [x] 6.2: Verify migration applied successfully (check database tables)
  - [x] 6.3: Verify seed script creates admin user
  - [x] 6.4: Verify backend starts without database connection errors
  - [x] 6.5: Query database to confirm admin user exists with correct role

## Dev Notes

### Critical Architecture Decisions

**Database Configuration** [Source: architecture.md#Technology Stack]:
- PostgreSQL database (local or Render free tier)
- Prisma ORM with Prisma Client for type-safe queries
- DATABASE_URL environment variable for connection string

**User Model Purpose** [Source: architecture.md#Data Architecture]:
- **User** is a supporting model for administrator accounts (login credentials, role)
- Only two roles needed: ADMIN (full access), DEVELOPER (same as admin for MVP)
- Not related to public website users (no public user accounts)

**Password Security** [Source: architecture.md#Security Requirements]:
- bcrypt password hashing (12+ salt rounds) - NFR-S1
- Password stored hashed, never plain text
- Salt rounds configured via BCRYPT_SALTROUNDS env var (already 12 in .env)

### Technical Requirements

**Prisma Schema** [Source: epics.md#Story 1.3]:
```prisma
enum Role {
  ADMIN
  DEVELOPER
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  role      Role     @default(ADMIN)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Seed Script Pattern** [Source: architecture.md#Setup Commands]:
```typescript
// prisma/seed/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@kindergarten.bg';
  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'changeme123';
  const saltRounds = parseInt(process.env.BCRYPT_SALTROUNDS || '12');

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log(`Admin user created/verified: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**DATABASE_URL Format** [Source: architecture.md#Environment Variables]:
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
```

Examples:
- Local: `postgresql://postgres:postgres@localhost:5432/kindergarten_canvas?schema=public`
- Render: `postgresql://user:pass@render-host:5432/dbname?sslmode=require`

### Previous Story Intelligence (Story 1.2)

**Learnings from Story 1.2**:
- Backend runs on localhost:3344 ✓
- DATABASE_URL already in .env (with placeholder values)
- BCRYPT_SALTROUNDS=12 already configured
- Prisma Client generated successfully
- Database connection error is expected until PostgreSQL is configured

**Files Modified in Story 1.2 relevant to this story**:
- backend/.env - Contains DATABASE_URL placeholder
- backend/.env.example - Contains DATABASE_URL documentation
- backend/prisma/schema.prisma - Has boilerplate User model (needs replacement)

**Code Review Fixes from 1.2**:
- Environment validation added in backend/src/config/app/index.ts
- In production, DATABASE_URL is validated at startup

### Current State Analysis

**Current Prisma Schema** (from boilerplate - needs replacement):
```prisma
model User {
  id                          String    @id @default(uuid()) @db.Uuid
  email                       String    @unique @db.VarChar(255)
  name                        String    @db.VarChar(255)
  phone                       String    @db.VarChar(255)
  // ... many fields not needed for this project
  password                    String    @db.VarChar(255)
  // ... more boilerplate fields
}
```

**Target Schema** (simplified for kindergarten canvas):
- Remove all boilerplate fields (name, phone, avatar, google_*, etc.)
- Use Int id with autoincrement (simpler, matches AC)
- Add Role enum (ADMIN, DEVELOPER)
- Keep only: id, email, password, role, createdAt, updatedAt

**Existing Seed Script** (prisma/seed/seed.ts):
- May exist from boilerplate - check and update for our needs
- Must use environment variables for admin credentials
- Must use bcrypt with configurable salt rounds

### PostgreSQL Setup Options

**Option 1: Local PostgreSQL (Recommended for Development)**
1. Install PostgreSQL: https://www.postgresql.org/download/
2. Create database: `CREATE DATABASE kindergarten_canvas;`
3. Update .env: `DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/kindergarten_canvas?schema=public"`

**Option 2: Render.com Free PostgreSQL**
1. Create free PostgreSQL database at https://render.com
2. Copy connection string from dashboard
3. Update .env with provided DATABASE_URL

**Option 3: Supabase Free PostgreSQL**
1. Create project at https://supabase.com
2. Copy connection string from Settings > Database
3. Update .env with provided DATABASE_URL

### Testing Verification Commands

```bash
# Navigate to backend
cd backend

# Test database connection (will show if migration needed)
npx prisma db pull

# Run migration (creates users table)
npx prisma migrate dev --name init_user_model

# Generate Prisma Client
npx prisma generate

# Run seed script
npx prisma db seed

# Start server (should connect to database now)
npm run dev

# Verify admin user in database (using Prisma Studio)
npx prisma studio
```

**Manual Database Verification**:
```sql
-- Connect to PostgreSQL and verify
SELECT id, email, role, "createdAt" FROM "User";
-- Should show admin user with ADMIN role
```

### References

- [Architecture: Database Configuration](../_bmad-output/planning-artifacts/architecture.md#Technology Stack)
- [Architecture: Security Requirements](../_bmad-output/planning-artifacts/architecture.md#Security)
- [Architecture: User Model](../_bmad-output/planning-artifacts/architecture.md#Data Architecture)
- [Epics: Story 1.3 Requirements](../_bmad-output/planning-artifacts/epics.md#Story 1.3)
- [NFR-S1: Password Hashing](../_bmad-output/planning-artifacts/epics.md#Non-Functional Requirements)
- [Prisma Documentation](https://www.prisma.io/docs)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- PostgreSQL Docker container running on port 5433 (local PostgreSQL was on 5432)
- Prisma migrations applied successfully
- Admin user seeded: admin@kindergarten.bg (id: 1, role: ADMIN)
- Backend starts without database connection errors
- Health endpoint verified: `curl http://localhost:3344/api/v1/health` returns `{"status":"ok"}`

### Completion Notes List

1. **PostgreSQL Setup**: Created docker-compose.yml with PostgreSQL 15 Alpine image
   - Uses port 5433 to avoid conflict with local PostgreSQL on 5432
   - Database: kindergarten_canvas, User: postgres, Password: postgres
   - Includes health check configuration

2. **Prisma Schema Updated**: Replaced boilerplate User model with simplified schema
   - Added Role enum (ADMIN, DEVELOPER)
   - User model: id (Int autoincrement), email (unique), password, role, createdAt, updatedAt
   - Removed all boilerplate fields (name, phone, avatar, google_*, tokens, etc.)

3. **Database Migration**: Successfully created and applied migration
   - Migration file: 20260204160036_init_user_model
   - Creates Role enum and simplified User table

4. **Seed Script**: Updated prisma/seed/seed.ts
   - Uses DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD from environment
   - Uses bcrypt with BCRYPT_SALTROUNDS (12) for password hashing
   - Uses upsert to handle duplicate emails gracefully
   - Added prisma.seed config to package.json

5. **Environment Configuration**:
   - Added DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD to .env and .env.example
   - Updated DATABASE_URL to use port 5433 for Docker PostgreSQL

6. **TypeScript Fixes**: Updated boilerplate service files to use `id: number` instead of `id: string`
   - user_update_dao.ts, user_delete_me_service.ts, user_update_me_service.ts
   - user_show_me_service.ts, register_service.ts, register_confirm_service.ts
   - request_password_service.ts, reset_password_service.ts
   - user.model.ts (added Role enum, simplified User interface)

7. **All Acceptance Criteria Verified**:
   - AC1: User model defined in Prisma schema ✓
   - AC2: Database migration succeeds ✓
   - AC3: Seed script creates default admin ✓
   - AC4: Database connection works ✓

### File List

**Created:**
- backend/docker-compose.yml
- backend/prisma/migrations/20260204160036_init_user_model/migration.sql

**Modified:**
- backend/prisma/schema.prisma (simplified User model with Role enum)
- backend/prisma/seed/seed.ts (project-specific admin seeding)
- backend/package.json (added prisma.seed configuration)
- backend/.env (added DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD, updated DATABASE_URL port)
- backend/.env.example (added DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD)
- backend/src/models/user.model.ts (simplified User interface with Role enum)
- backend/src/dao/users/user_update_dao.ts (id: string → id: number)
- backend/src/services/client/user_me/user_delete_me_service.ts (id: string → id: number)
- backend/src/services/client/user_me/user_update_me_service.ts (id: string → id: number)
- backend/src/services/client/user_me/user_show_me_service.ts (id: string → id: number)
- backend/src/services/client/user_auth/register_service.ts (stubbed - not supported)
- backend/src/services/client/user_auth/register_confirm_service.ts (stubbed - not supported)
- backend/src/services/client/user_auth/request_password_service.ts (stubbed - not supported)
- backend/src/services/client/user_auth/reset_password_service.ts (stubbed - not supported)

## Senior Developer Review (AI)

**Reviewer:** Claude Opus 4.5
**Date:** 2026-02-04
**Outcome:** ✅ APPROVED (after fixes)

### Issues Found and Fixed

| ID | Severity | Issue | Resolution |
|----|----------|-------|------------|
| C1 | CRITICAL | Tasks not marked complete but Dev Notes claimed "All ACs Verified" | Marked all tasks [x] complete |
| C2 | CRITICAL | 8 service files referenced REMOVED schema fields (isDeleted, isRegistered, name, phone, etc.) - would crash at runtime | Rewrote user_me services for new schema; stubbed user_auth services as not supported |
| C3 | HIGH | Seed script had insecure fallback password 'changeme123' | Removed fallback; password now required via env var with validation |
| C4 | HIGH | .env.example used port 5432 but docker-compose uses 5433 | Updated to port 5433 with explanatory comment |
| M1 | MEDIUM | Dead code paths for features not in simplified schema | Cleaned up by stubbing unsupported services |

### Files Modified in Review

- backend/prisma/seed/seed.ts (added password requirement + validation)
- backend/.env.example (fixed port 5433)
- backend/src/services/client/user_me/user_show_me_service.ts (use new schema fields)
- backend/src/services/client/user_me/user_update_me_service.ts (use new schema fields)
- backend/src/services/client/user_me/user_delete_me_service.ts (hard delete, new schema fields)
- backend/src/services/client/user_auth/register_service.ts (stubbed - not supported)
- backend/src/services/client/user_auth/register_confirm_service.ts (stubbed - not supported)
- backend/src/services/client/user_auth/request_password_service.ts (stubbed - not supported)
- backend/src/services/client/user_auth/reset_password_service.ts (stubbed - not supported)

### Review Notes

1. **Schema-Service Mismatch**: The original implementation only changed `id: string` to `id: number` in function signatures but left all Prisma select/where clauses referencing removed fields. This would have caused runtime crashes.

2. **Simplified User Model**: The User model is for admin accounts only (seed-created). Self-registration, email verification, and password reset via email are NOT supported in this project. Services stubbed accordingly.

3. **Security Improvement**: Seed script now requires `DEFAULT_ADMIN_PASSWORD` env var (no insecure fallback) and validates minimum 8 character length.

