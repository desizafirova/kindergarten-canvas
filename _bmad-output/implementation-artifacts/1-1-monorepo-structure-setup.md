# Story 1.1: Monorepo Structure Setup

Status: done

## Story

As a **developer**,
I want **the project restructured as a monorepo with frontend, backend, and shared folders**,
so that **I can build the admin panel and API in a unified codebase with shared TypeScript types**.

## Acceptance Criteria

1. **AC1: Repository structure created**
   - `frontend/` folder contains all existing React/Vite code (src/, public/, vite.config.ts, etc.)
   - `backend/` folder exists and is ready for API development
   - `shared/` folder exists for TypeScript type definitions

2. **AC2: Frontend functionality preserved**
   - `npm install` succeeds in the frontend/ folder
   - `npm run dev` in frontend/ starts the existing public site on localhost:5173
   - All existing pages and components work without modification

3. **AC3: Documentation updated**
   - Root README.md documents the monorepo structure
   - Clear instructions for running frontend and backend independently

## Tasks / Subtasks

- [x] **Task 1: Create monorepo folder structure** (AC: 1)
  - [x] 1.1: Create `frontend/`, `backend/`, `shared/` directories at project root
  - [x] 1.2: Move all existing files (except .git, node_modules, _bmad*) into `frontend/`
  - [x] 1.3: Preserve `.gitignore` at root level (update paths as needed)

- [x] **Task 2: Update frontend configuration** (AC: 1, 2)
  - [x] 2.1: Update `frontend/vite.config.ts` if any path references need adjustment
  - [x] 2.2: Update `frontend/tsconfig.json` to reference `../shared/` for shared types
  - [x] 2.3: Update any absolute import paths in frontend code if needed

- [x] **Task 3: Initialize shared types folder** (AC: 1)
  - [x] 3.1: Create `shared/package.json` with name "@kindergarten-canvas/shared"
  - [x] 3.2: Create `shared/tsconfig.json` for TypeScript compilation
  - [x] 3.3: Create `shared/types/index.ts` as entry point (can be empty placeholder)

- [x] **Task 4: Prepare backend folder** (AC: 1)
  - [x] 4.1: Create `backend/.gitkeep` to ensure folder is tracked
  - [x] 4.2: Create `backend/README.md` noting "Backend will be set up in Story 1.2"

- [x] **Task 5: Verify frontend still works** (AC: 2)
  - [x] 5.1: Run `cd frontend && npm install` - must succeed
  - [x] 5.2: Run `cd frontend && npm run dev` - must start on localhost:5173
  - [x] 5.3: Verify homepage loads correctly in browser
  - [x] 5.4: Verify at least one other page (e.g., /admission) loads correctly

- [x] **Task 6: Update root documentation** (AC: 3)
  - [x] 6.1: Update root `README.md` with monorepo structure documentation
  - [x] 6.2: Include commands for running frontend and backend
  - [x] 6.3: Document the shared types strategy

- [x] **Task 7: Update .gitignore** (AC: 1)
  - [x] 7.1: Update root `.gitignore` to handle monorepo structure
  - [x] 7.2: Add `frontend/node_modules/`, `backend/node_modules/`, `shared/node_modules/`
  - [x] 7.3: Add common IDE and OS files if not already present

## Dev Notes

### Critical Architecture Decisions

**Monorepo Strategy** [Source: architecture.md#Monorepo Strategy]:
- Single repository with three main folders: `frontend/`, `backend/`, `shared/`
- Shared TypeScript types between frontend and backend for type safety
- Each folder has its own `package.json` (not a workspace/lerna setup)
- Deployments are separate: Vercel for frontend, Render for backend

**Target Structure**:
```
kindergarten-canvas/
├── frontend/                # React frontend (moved from root)
│   ├── src/
│   │   ├── pages/          # Existing public pages
│   │   ├── components/     # Existing components
│   │   └── ...
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── backend/                 # Express API (Story 1.2)
│   └── README.md           # Placeholder
├── shared/                  # Shared TypeScript types
│   ├── types/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── .gitignore              # Updated for monorepo
└── README.md               # Updated documentation
```

### Files to Move (from root → frontend/)

Move ALL these files/folders:
- `src/` → `frontend/src/`
- `public/` → `frontend/public/`
- `package.json` → `frontend/package.json`
- `package-lock.json` → `frontend/package-lock.json`
- `bun.lockb` → `frontend/bun.lockb` (if using bun)
- `vite.config.ts` → `frontend/vite.config.ts`
- `tsconfig.json` → `frontend/tsconfig.json`
- `tsconfig.app.json` → `frontend/tsconfig.app.json`
- `tsconfig.node.json` → `frontend/tsconfig.node.json`
- `tailwind.config.ts` → `frontend/tailwind.config.ts`
- `postcss.config.js` → `frontend/postcss.config.js`
- `eslint.config.js` → `frontend/eslint.config.js`
- `vitest.config.ts` → `frontend/vitest.config.ts`
- `components.json` → `frontend/components.json`
- `index.html` → `frontend/index.html`

**DO NOT MOVE**:
- `.git/` - stays at root
- `node_modules/` - will be recreated in frontend/
- `_bmad/` - stays at root (BMAD configuration)
- `_bmad-output/` - stays at root (planning artifacts)
- `.gitignore` - stays at root (but update paths)
- `README.md` - stays at root (but update content)
- `.claude/` - stays at root
- `.lovable/` - stays at root
- `.serena/` - stays at root

### Project Structure Notes

**Current Structure** (before this story):
- All frontend code at repository root
- No backend folder
- No shared types folder

**Existing Technologies** [Source: architecture.md#Technical Stack]:
- Vite 5.x with React 18+
- TypeScript 5.x
- Tailwind CSS with shadcn-ui
- React Router for routing

### shared/package.json Template

```json
{
  "name": "@kindergarten-canvas/shared",
  "version": "1.0.0",
  "main": "types/index.ts",
  "types": "types/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

### shared/tsconfig.json Template

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./types"
  },
  "include": ["types/**/*"]
}
```

### shared/types/index.ts Template

```typescript
// Shared types between frontend and backend
// This file will be populated as we build features

export interface ApiResponse<T> {
  status: 'success' | 'fail' | 'error';
  data?: T;
  message?: string;
}

// Placeholder - actual types will be added in subsequent stories
export {};
```

### Updated Root README.md Template

```markdown
# Kindergarten Canvas

A comprehensive web application for kindergarten management with public website and admin panel.

## Project Structure

This is a monorepo containing:

- `frontend/` - React public website and admin panel (Vite + TypeScript + Tailwind)
- `backend/` - Express API server (TypeScript + Prisma + PostgreSQL)
- `shared/` - Shared TypeScript types between frontend and backend

## Getting Started

### Frontend (Public Website)

\`\`\`bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
\`\`\`

### Backend (API Server)

\`\`\`bash
cd backend
npm install
npm run dev
# Opens at http://localhost:3344
\`\`\`

## Documentation

- [PRD](_bmad-output/planning-artifacts/prd.md)
- [Architecture](_bmad-output/planning-artifacts/architecture.md)
- [Epics & Stories](_bmad-output/planning-artifacts/epics.md)
```

### Updated Root .gitignore Template

```gitignore
# Dependencies
node_modules/
frontend/node_modules/
backend/node_modules/
shared/node_modules/

# Build outputs
dist/
frontend/dist/
backend/dist/
shared/dist/

# Environment files
.env
.env.local
.env.*.local
frontend/.env
frontend/.env.local
backend/.env
backend/.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Test coverage
coverage/

# Misc
*.tsbuildinfo
```

### Testing Verification Commands

After completing all tasks, run these commands to verify:

```bash
# From project root
cd frontend
npm install
npm run dev
# In browser: verify http://localhost:5173 shows the homepage
# Navigate to /admission, /careers to verify other pages work
```

### References

- [Architecture: Monorepo Strategy](../_bmad-output/planning-artifacts/architecture.md#Architecture Decision: Monorepo Strategy)
- [Architecture: Technical Stack](../_bmad-output/planning-artifacts/architecture.md#Technical Stack Confirmation)
- [Epics: Story 1.1](../_bmad-output/planning-artifacts/epics.md#Story 1.1: Monorepo Structure Setup)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- npm install completed with 496 packages, 8 vulnerabilities (non-blocking)
- Vite dev server started successfully on localhost:5173
- Original src/ folder at root still locked by external process (manual cleanup needed)

### Completion Notes List

1. Created monorepo structure with frontend/, backend/, shared/ directories
2. Copied all frontend files to frontend/ folder (src, public, config files)
3. Updated vite.config.ts port from 8080 to 5173 per AC requirement
4. Added @shared/* path alias to tsconfig.json and tsconfig.app.json
5. Created shared/package.json, shared/tsconfig.json, shared/types/index.ts
6. Created backend/.gitkeep and backend/README.md placeholder
7. Updated root .gitignore for monorepo paths
8. Updated root README.md with full project documentation
9. Verified frontend npm install and dev server work correctly

**Note:** Original src/ folder at project root is locked by another process. Files are correctly copied to frontend/src/. Manual cleanup recommended: close any file explorers or editors accessing the folder, then delete the root src/ folder.

### File List

**Created:**
- frontend/ (directory with all frontend files)
- backend/.gitkeep
- backend/README.md
- shared/package.json
- shared/tsconfig.json
- shared/types/index.ts

**Modified:**
- .gitignore (updated for monorepo paths)
- README.md (updated with monorepo documentation)
- frontend/vite.config.ts (port changed to 5173)
- frontend/tsconfig.json (added @shared/* path)
- frontend/tsconfig.app.json (added @shared/* path and include)
