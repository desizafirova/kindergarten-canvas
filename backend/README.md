# Backend API Server

This folder will contain the Express API server for the Kindergarten Canvas admin panel.

## Status

**Not yet implemented** - Backend will be set up in Story 1.2 (Backend API Foundation).

## Planned Stack

- Node.js with Express
- TypeScript
- PostgreSQL with Prisma ORM
- JWT authentication
- Winston logging

## Setup (Coming in Story 1.2)

```bash
cd backend
npm install
cp .env.example .env
# Configure database connection
npx prisma migrate dev
npm run dev
# Opens at http://localhost:3344
```
