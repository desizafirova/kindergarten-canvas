# Kindergarten Canvas

A comprehensive web application for kindergarten management with public website and admin panel.

## Project Structure

This is a monorepo containing:

```
kindergarten-canvas/
├── frontend/     # React public website and admin panel (Vite + TypeScript + Tailwind)
├── backend/      # Express API server (TypeScript + Prisma + PostgreSQL)
├── shared/       # Shared TypeScript types between frontend and backend
├── _bmad/        # BMAD configuration
└── _bmad-output/ # Planning and implementation artifacts
```

## Getting Started

### Frontend (Public Website)

```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

### Backend (API Server)

```bash
cd backend
npm install
npm run dev
# Opens at http://localhost:3344
```

> **Note:** Backend setup will be completed in Story 1.2

## Technology Stack

### Frontend
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Components:** shadcn-ui
- **Routing:** React Router

### Backend (Planned)
- **Runtime:** Node.js with Express
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT with bcrypt
- **Logging:** Winston

### Shared
- TypeScript type definitions shared between frontend and backend
- Enables type safety across the full stack

## Documentation

- [PRD](_bmad-output/planning-artifacts/prd.md)
- [Architecture](_bmad-output/planning-artifacts/architecture.md)
- [Epics & Stories](_bmad-output/planning-artifacts/epics.md)
- [Sprint Status](_bmad-output/implementation-artifacts/sprint-status.yaml)

## Development Workflow

This project uses the BMAD (Business Method for AI Development) workflow:

1. **Planning:** PRD → Architecture → UX Design → Epics & Stories
2. **Implementation:** Story creation → Development → Code review
3. **Tracking:** Sprint status file tracks progress through all epics

## Deployment

- **Frontend:** Vercel (deploy `frontend/` folder)
- **Backend:** Render (deploy `backend/` folder with PostgreSQL)

---

*Originally scaffolded with [Lovable](https://lovable.dev)*
