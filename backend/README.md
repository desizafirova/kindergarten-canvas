# Kindergarten Canvas - Backend API

Express + TypeScript + Prisma + PostgreSQL backend API for the Kindergarten Canvas admin panel and public website.

## Tech Stack

- **Express** - Node.js web framework
- **TypeScript** - Type-safe JavaScript
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **Winston** - Logging
- **JWT** - Authentication (Passport.js)
- **Zod** - Schema validation
- **Swagger** - API documentation

## Quick Start

### Prerequisites

- Node.js >= 18.0
- PostgreSQL database
- npm >= 9.0

### Installation

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your database connection and secrets

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

The server will start at `http://localhost:3344`

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run start:dev` | Same as dev |
| `npm run build` | Build for production |
| `npm run start:prod` | Build and start production server |
| `npm test` | Run tests |
| `npm run lint:check` | Check ESLint rules |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:seed` | Seed database |

## API Endpoints

### Health Check

```
GET /api/v1/health
Response: { "status": "ok" }
```

### API Info

```
GET /api/info
Response: API version and status information
```

### API Documentation

```
GET /api/docs
Swagger UI documentation (development only)
```

## Environment Variables

See `.env.example` for all available environment variables.

Key variables:
- `APP_URL_PORT` - Server port (default: 3344)
- `DATABASE_URL` - PostgreSQL connection string
- `CORS_ALLOW_ORIGIN` - Frontend URL for CORS
- `JWT_SECRET_*` - JWT signing secrets
- `RATE_LIMIT_MAX` - Rate limit per window
- `RATE_LIMIT_WINDOW` - Rate limit window in minutes

## Project Structure

```
backend/
├── src/
│   ├── config/         # App configuration
│   ├── controllers/    # Request handlers
│   ├── dao/            # Data access objects
│   ├── database/       # Database connection
│   ├── middlewares/    # Express middleware
│   ├── models/         # Data models
│   ├── routes/         # API routes
│   ├── schemas/        # Zod validation schemas
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── app.ts          # App entry point
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── migrations/     # Migration files
├── __test__/           # Test files
└── logs/               # Log files (gitignored)
```

## Security Features

- Rate limiting (100 requests/minute/IP)
- CORS configuration
- Helmet security headers
- XSS protection
- JWT authentication
- bcrypt password hashing (12+ rounds)

## License

ISC
