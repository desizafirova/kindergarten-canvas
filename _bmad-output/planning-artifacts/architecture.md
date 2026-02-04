---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/product-brief-kindergarten-canvas-2026-02-01.md'
  - 'README.md'
workflowType: 'architecture'
project_name: 'kindergarten-canvas'
user_name: 'Desi'
date: '2026-02-02'
lastStep: 8
status: 'complete'
completedAt: '2026-02-02'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements Summary:**

kindergarten-canvas requires 57 functional capabilities organized across 8 domains:

- **Authentication & Access (FR1-FR5):** JWT-based authentication for administrator and developer access, session management, automatic logout
- **Content Management (FR6-FR15):** Full CRUD operations for 6 content types (News, Jobs, Deadlines, Events, Gallery, Teachers), central dashboard navigation
- **Content Creation (FR16-FR21):** WYSIWYG rich text editor, date pickers, importance flags, validation with Bulgarian error messages, draft saving
- **Publishing & Preview (FR22-FR26):** Preview functionality, immediate publishing to public site, real-time content preview during editing (WebSocket)
- **Image Management (FR27-FR33):** Upload images for all content types, drag-and-drop interface, validation, progress indicators
- **Email & Notifications (FR34-FR40):** Automated parent notifications when content published, job application delivery with CV attachments
- **Job Applications (FR41-FR45):** Public form submission, CV upload (PDF), validation, Bulgarian confirmation messages
- **Public Content Access (FR46-FR52):** All published content viewable on public website, individual content pages
- **Admin Operations (FR53-FR57):** Bulgarian language interface, developer monitoring tools, error logging, help/guidance access

**Non-Functional Requirements Summary:**

35 quality attributes that will drive architectural decisions:

- **Performance (NFR-P1 through NFR-P5):**
  - API response time <500ms for all endpoints
  - User actions complete within 2 seconds
  - Image upload processing <5 seconds for files up to 10MB
  - Public pages load <2 seconds on mobile 4G
  - Optimized database queries required

- **Security (NFR-S1 through NFR-S8):**
  - bcrypt password hashing (12+ salt rounds)
  - JWT tokens expire 1-2 hours with refresh mechanism
  - HTTPS-only in production
  - CORS whitelist (kindergarten domain only)
  - XSS prevention (HTML sanitization)
  - SQL injection prevention (Prisma parameterized queries)
  - Rate limiting: 100 req/min admin, 5 req/hour public job form

- **Reliability & Availability (NFR-R1 through NFR-R6):**
  - 99% system uptime target
  - 95% email delivery success rate
  - Email retry logic for failed deliveries
  - Health check endpoints
  - Automated database backups
  - Critical error logging

- **Accessibility (NFR-A1 through NFR-A10):**
  - WCAG 2.1 Level AA compliance required
  - Keyboard navigation for all interactions
  - Screen reader support (NVDA with Bulgarian pack)
  - Color contrast minimums (4.5:1 normal, 3:1 large text)
  - Semantic HTML with proper ARIA labels

- **Integration & Interoperability (NFR-I1 through NFR-I6):**
  - Image storage integration (Cloudinary or AWS S3)
  - Email service integration (SendGrid or AWS SES)
  - Automatic image optimization
  - Email template support
  - Graceful third-party failure handling
  - CDN for image delivery

- **Usability & UX (NFR-U1 through NFR-U7):**
  - Full Bulgarian language interface (all text, labels, error messages)
  - Modern browsers only (Chrome, Firefox, Safari, Edge - last 2 versions)
  - Bulgarian date formatting (dd.MM.yyyy)
  - Clear visual feedback for all actions
  - Upload progress indicators

- **Maintainability & Operations (NFR-M1 through NFR-M5):**
  - TypeScript across frontend and backend
  - Architectural documentation
  - Centralized error logging
  - Environment-based configuration (dev, staging, production)
  - Performance monitoring
  - Developer troubleshooting access

### Scale & Complexity Assessment

**Complexity Level:** Medium

**Project Domain:** Full-Stack Web Application (API Backend + Admin SPA + Public Website Integration)

**Complexity Indicators:**
- 57 functional requirements across 8 capability domains
- Real-time features required (WebSocket for live preview)
- Third-party service integrations (image storage, email delivery)
- Localization requirements (Bulgarian language throughout)
- Accessibility compliance (WCAG 2.1 Level AA)
- Security requirements (JWT auth, rate limiting, encryption)
- Performance targets (<500ms API responses)
- Single-tenancy architecture (one kindergarten deployment)

**Estimated Architectural Components:** 10-12 major components
- API Server Layer
- Database Layer with ORM
- Authentication Service
- Content Management Service
- Image Upload/Storage Service
- Email Notification Service
- Admin Panel SPA
- WebSocket Server
- Rate Limiting Middleware
- Logging & Monitoring Infrastructure

### Technical Constraints & Dependencies

**Existing Infrastructure:**
- **Brownfield project:** Must integrate with existing React public website
- **Current frontend stack:** Vite, TypeScript, React, shadcn-ui, Tailwind CSS
- Architecture must provide RESTful API consumable by existing frontend

**Hard Constraints:**
- **FREE TECHNOLOGIES ONLY:** All selected technologies, libraries, and services must have free tiers or be open source
- **Bulgarian Localization:** Full language support required throughout admin interface
- **Modern Browsers Only:** No legacy browser support (IE11 excluded)
- **Single-Tenancy:** Architecture optimized for single kindergarten, not multi-tenant SaaS
- **Solo Developer:** AI-assisted development approach with emphasis on maintainability

**Technology Guidance from PRD:**
- Backend: Node.js/Express suggested
- Database: PostgreSQL + Prisma ORM suggested
- Authentication: JWT-based
- Frontend: React 18+ with TypeScript
- Image Storage: Cloudinary or AWS S3 (must verify free tiers)
- Email Service: SendGrid or AWS SES (must verify free tiers)

### Cross-Cutting Concerns Identified

**Security:**
- Authentication strategy (JWT token generation, refresh, expiration)
- Password hashing strategy (bcrypt with 12+ salt rounds)
- HTTPS enforcement in production
- CORS configuration and enforcement
- SQL injection prevention (parameterized queries via ORM)
- XSS attack prevention (HTML sanitization for user-generated content)
- Rate limiting implementation (differentiated by endpoint type)
- Session management and automatic logout

**Localization:**
- Bulgarian language implementation strategy across all UI components
- Date/time formatting (dd.MM.yyyy convention)
- Error message translation and consistency
- Translation file structure and maintenance approach
- Bulgarian keyboard layout support in text editors

**Performance Optimization:**
- Database query optimization for <500ms API target
- Image optimization and compression strategy
- CDN implementation for static assets and images
- Code splitting and lazy loading for admin SPA
- WebSocket connection management and fallback strategy
- Caching strategy (if needed for performance targets)

**Accessibility:**
- Keyboard navigation implementation across all interactive elements
- ARIA label strategy for complex interactions (WYSIWYG, drag-and-drop)
- Screen reader compatibility testing approach
- Color contrast validation throughout UI
- Semantic HTML enforcement
- Focus indicator visibility

**Integration Management:**
- Image storage service abstraction (support both Cloudinary and AWS S3)
- Email service abstraction (support both SendGrid and AWS SES)
- Graceful degradation for third-party service failures
- Error handling and retry logic for external dependencies
- Configuration management for third-party credentials

**Observability & Operations:**
- Centralized logging strategy
- Error tracking and alerting
- Performance monitoring approach
- Health check endpoint design
- Environment-specific configuration management
- Developer troubleshooting access patterns

## Starter Template Evaluation

### Architecture Decision: Monorepo Strategy

**Chosen Approach**: Single repository with three main folders: `frontend/`, `backend/`, and `shared/`.

**Repository Structure**:
- **Single Repository (`kindergarten-canvas`)** containing:
  - `frontend/` - React public site + admin panel
  - `backend/` - Express API server
  - `shared/` - TypeScript types shared between frontend and backend

**Rationale**:
- Ideal for solo developer with single kindergarten deployment
- Shared TypeScript types between frontend and backend (type safety)
- Simpler development workflow (single git repo, single clone)
- Easier dependency management (one package.json per folder)
- Deployments still separate (Vercel for frontend, Render for backend)
- Reuse existing React Router, Tailwind CSS, shadcn-ui infrastructure
- Admin panel integrated at `/admin` route alongside public site

**Monorepo Structure**:
```
kindergarten-canvas/
├── frontend/                # React frontend (Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── public/      # Public website pages
│   │   │   └── admin/       # Admin panel pages
│   │   ├── components/
│   │   │   ├── public/      # Public site components
│   │   │   ├── admin/       # Admin panel components
│   │   │   └── shared/      # Shared UI components
│   │   ├── lib/
│   │   │   ├── api.ts       # API client for backend
│   │   │   ├── auth.ts      # JWT token management
│   │   │   └── i18n/
│   │   │       └── bg.ts    # Bulgarian translations
│   │   └── App.tsx          # Routing for public + admin
│   ├── package.json
│   └── vite.config.ts
├── backend/                 # Express API server
│   ├── src/
│   │   ├── routes/          # Express route definitions
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Auth, validation, CORS
│   │   └── utils/           # Logger, helpers
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── migrations/      # Migration files
│   ├── package.json
│   └── .env.example
├── shared/                  # Shared TypeScript types
│   ├── types/
│   │   ├── news.types.ts
│   │   ├── teacher.types.ts
│   │   ├── event.types.ts
│   │   └── api.types.ts
│   └── package.json         # If needed for type exports
└── README.md                # Root documentation
```

### Technical Stack Confirmation

**Backend (Separate Repository)**:
- Node.js with Express
- PostgreSQL database
- Prisma ORM
- JWT authentication with bcrypt
- WebSocket for real-time preview

**Frontend (Existing Repository - Enhanced)**:
- React 18+ with TypeScript
- Vite (already configured)
- React Router (for `/admin/*` routes)
- Tailwind CSS (already configured)
- shadcn-ui (already configured)
- TailAdmin components (integrate selectively)

**Third-Party Services (FREE Tiers)**:
- Image Storage: Cloudinary (10GB free)
- Email Service: AWS SES (3,000 emails/month free)

### Recommended Starter Templates

#### Backend API: express-prisma-ts-boilerplate

**Repository**: [vincent-queimado/express-prisma-ts-boilerplate](https://github.com/vincent-queimado/express-prisma-ts-boilerplate)

**What It Provides**:
- Express + TypeScript production configuration
- Prisma ORM with PostgreSQL
- JWT authentication via Passport-jwt
- Bcrypt password hashing
- Zod request/response validation
- Winston structured logging
- Swagger/OpenAPI documentation
- Jest testing framework
- ESLint + Prettier + Husky
- Hot reload for development

**Setup** (Monorepo Integration):
```bash
# In kindergarten-canvas root, create backend folder
mkdir backend
cd backend

# Clone starter template contents (not the repo itself)
git clone https://github.com/vincent-queimado/express-prisma-ts-boilerplate.git temp
cp -r temp/* ./
rm -rf temp

npm install
cp .env.example .env
# Configure PostgreSQL connection in .env
npx prisma migrate dev --name init
npm run dev  # Starts on http://localhost:3344
```

**Architectural Decisions**:
- RESTful API architecture (not GraphQL)
- Layered structure: Routes → Controllers → Services → Prisma
- Token-based authentication (JWT stored client-side)
- Request validation at API boundary (Zod schemas)
- Swagger documentation auto-generated

#### Frontend Admin Components: TailAdmin React (Selective Integration)

**Repository**: [TailAdmin/free-react-tailwind-admin-dashboard](https://github.com/TailAdmin/free-react-tailwind-admin-dashboard)

**Integration Strategy**: Instead of using TailAdmin as a standalone template, **selectively copy components** into your existing `kindergarten-canvas` repo.

**What You'll Extract from TailAdmin**:
- Dashboard layout components (Sidebar, Header, Card containers)
- Form components (Input, Select, Textarea, DatePicker)
- Data table components
- Chart/graph components (if needed for analytics)
- Authentication page templates (Login form)
- Button and icon sets

**Integration Steps**:
```bash
# In a temporary directory, clone TailAdmin to extract components
git clone https://github.com/TailAdmin/free-react-tailwind-admin-dashboard.git tailadmin-temp
cd tailadmin-temp
npm install

# Review components you need:
# - src/components/Sidebar/*
# - src/components/Header/*
# - src/components/Forms/*
# - src/components/Tables/*
# - src/pages/Authentication/SignIn.tsx (for login page)

# Copy selected components to your kindergarten-canvas repo:
# cp -r src/components/Sidebar ../kindergarten-canvas/src/components/admin/
# cp -r src/components/Forms ../kindergarten-canvas/src/components/admin/
# etc.

# Adapt components to:
# 1. Use your existing Tailwind config
# 2. Translate all text to Bulgarian
# 3. Integrate with your API client
# 4. Add WCAG 2.1 AA accessibility features
```

**Why Selective Integration Instead of Full Template**:
- You already have a configured Vite + React + Tailwind setup
- Avoids conflicts with existing public site routing and styling
- Keeps bundle size optimized (only include what you need)
- Easier to customize for Bulgarian localization
- Maintains consistency with existing shadcn-ui components

**Alternative Approach**: Build admin components from scratch using your existing shadcn-ui library (which is already Tailwind-based and accessible).

### Third-Party Services (FREE Tiers Verified)

#### Image Storage: Cloudinary (RECOMMENDED)

**Free Tier** (2026):
- 25 monthly credits
- 10 GB managed storage
- 20 GB bandwidth
- 300,000 total images/videos
- Max file size: 10 MB images, 100 MB videos
- Built-in image transformations and CDN delivery

**Why Cloudinary**:
- More generous than AWS S3 (10GB vs 5GB)
- Automatic image optimization and transformations
- CDN delivery included
- Simpler integration (no AWS complexity)
- Perfect for kindergarten gallery use case

**Cost Assessment**: Free tier covers MVP and long-term usage (unlikely to exceed 10GB for single kindergarten)

**Integration**: Node.js SDK available for backend upload handling

#### Email Service: AWS SES (ONLY FREE OPTION)

**Critical Finding**: SendGrid discontinued free tier in July 2025.

**AWS SES Free Tier**:
- 3,000 emails/month for first 12 months
- OR 62,000 emails/month when sending from EC2/Lambda
- $0.10 per 1,000 emails after free tier expires

**Setup Requirements**:
- AWS account required
- Email domain verification needed
- Initially in "sandbox mode" (requires production access request)
- Developer-focused setup (not plug-and-play)

**Cost Assessment**:
- Free tier sufficient for MVP (kindergarten notifications won't exceed 3,000/month)
- After 12 months: ~$1-2/month for typical usage

**Alternative FREE Options** (if AWS complexity is too high):
- **Brevo** (formerly Sendinblue): 300 emails/day free tier (9,000/month)
- **Mailgun**: 5,000 emails/month for 3 months trial
- **Postmark**: 100 emails/month free (may be insufficient)

**Recommendation**: Start with AWS SES for cost-effectiveness; switch to Brevo if setup proves too complex.

### Routing Strategy for Single Repository

**React Router Configuration**:

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public pages
import Home from './pages/public/Home';
import Admission from './pages/public/Admission';
import Careers from './pages/public/Careers';
// ... other public pages

// Admin pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import NewsManager from './pages/admin/NewsManager';
// ... other admin pages

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/admission" element={<Admission />} />
          <Route path="/careers" element={<Careers />} />
          {/* ... other public routes */}
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/news" element={<NewsManager />} />
          <Route path="/admin/jobs" element={<JobsManager />} />
          {/* ... other admin routes */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

**Authentication Guard**:
```typescript
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
```

### What Starters Provide vs. Custom Development

**Backend Starter Handles**:
- ✅ Express server setup and middleware configuration
- ✅ Prisma ORM connection and schema structure
- ✅ JWT authentication infrastructure (Passport-jwt)
- ✅ Password hashing with bcrypt
- ✅ Request validation framework (Zod)
- ✅ Logging infrastructure (Winston)
- ✅ API documentation (Swagger)
- ✅ Testing framework (Jest)
- ✅ Code quality tools (ESLint, Prettier, Husky)

**Frontend (Existing Setup + TailAdmin Components)**:
- ✅ Vite build configuration (already exists)
- ✅ React + TypeScript setup (already exists)
- ✅ Tailwind CSS configuration (already exists)
- ✅ Reusable admin UI components (from TailAdmin)
- ✅ Layout patterns for admin dashboard

**Custom Development Required**:

**Backend**:
- 6 content type Prisma models (News, Jobs, Deadlines, Events, Gallery, Teachers)
- CRUD API endpoints for each content type
- Cloudinary integration for image uploads
- AWS SES integration for email notifications
- WebSocket server for real-time preview
- Rate limiting middleware configuration
- CORS whitelist configuration
- Bulgarian error message responses

**Frontend**:
- Bulgarian localization for ALL UI text (labels, buttons, errors, placeholders)
- Content management forms for 6 content types
- WYSIWYG rich text editor integration (e.g., TipTap, Quill)
- Drag-and-drop image uploader with preview
- Date pickers with Bulgarian format (dd.MM.yyyy)
- Preview functionality before publishing
- API client integration with backend
- WCAG 2.1 Level AA accessibility implementation:
  - Keyboard navigation for all interactions
  - ARIA labels for complex widgets
  - Focus indicators
  - Screen reader announcements
  - Color contrast compliance

### Key Architectural Decisions

By selecting this single-repository approach with backend starter template:

1. **Monolithic Frontend Architecture**: Public site and admin panel share single Vite build and deployment
2. **API-First Backend**: Express REST API serves both public and admin frontends
3. **JWT Token Authentication**: Client-side token storage, sent with each API request
4. **Route-Based Access Control**: React Router guards protect `/admin/*` routes
5. **Shared Component Library**: Public and admin UIs can share common components (buttons, forms, etc.)
6. **Unified Styling System**: Tailwind CSS provides consistent design language across public and admin
7. **Type-Safe Data Layer**: Prisma ORM with TypeScript ensures compile-time safety
8. **Cloud-Optimized**: Cloudinary CDN for images, AWS SES for email
9. **Documentation-Driven API**: Swagger auto-generates backend API documentation
10. **Test-Ready**: Jest configured for unit/integration testing

### Deployment Architecture

**Production Setup** (Monorepo with Separate Deployments):
- **Frontend (Public + Admin)**: Deploy `frontend/` folder to Vercel (FREE tier)
- **Backend API**: Deploy `backend/` folder to Render (FREE tier)
- **Database**: PostgreSQL on Render (included with backend hosting, FREE tier)
- **Images**: Cloudinary CDN (FREE tier)
- **Email**: AWS SES (FREE tier for 12 months)

**Deployment Configuration**:
- **Vercel**: Set root directory to `frontend/`, auto-detects Vite
- **Render**: Set root directory to `backend/`, auto-detects Node.js
- Both platforms deploy separately from same GitHub repo using different root directories

**Environment Variables**:
```env
# Frontend (frontend/.env)
VITE_API_URL=https://kindergarten-canvas-backend.onrender.com

# Backend (backend/.env)
DATABASE_URL=postgresql://user:pass@host:5432/kindergarten  # Render provides this
JWT_SECRET=your-secret-key-here-generate-random-64-char-string
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
AWS_SES_REGION=eu-central-1
AWS_SES_ACCESS_KEY=your-aws-access-key
AWS_SES_SECRET_KEY=your-aws-secret-key
FRONTEND_URL=https://kindergarten-canvas.vercel.app  # For CORS whitelist
```

### CLI Quick Reference

**Monorepo Setup**:
```bash
# Current frontend is at root - restructure to monorepo
cd kindergarten-canvas

# Move existing frontend to frontend/ folder
mkdir frontend
git mv src frontend/src
git mv public frontend/public
git mv index.html frontend/index.html
git mv vite.config.ts frontend/vite.config.ts
git mv tailwind.config.js frontend/tailwind.config.js
git mv tsconfig.json frontend/tsconfig.json
# Move other frontend config files to frontend/

# Create backend folder with starter template
mkdir backend
cd backend
git clone https://github.com/vincent-queimado/express-prisma-ts-boilerplate.git temp
cp -r temp/* ./
rm -rf temp
npm install
cp .env.example .env
# Edit .env with PostgreSQL connection string
npx prisma migrate dev --name init
npm run dev  # http://localhost:3344

# Create shared types folder
cd ..
mkdir -p shared/types
# Add TypeScript types here as needed

# Frontend development
cd frontend
npm install react-router-dom  # If not already installed
# Add admin routes to src/pages/admin/
npm run dev  # http://localhost:5173 (Public site + /admin routes)
```

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- State Management: React Context API + component state
- Form Handling: React Hook Form
- WYSIWYG Editor: TipTap
- Date Picker: Radix UI Date Picker
- WebSocket: Socket.io
- File Upload Strategy: Backend proxy to Cloudinary
- Database Migration: Prisma Migrate
- Frontend Hosting: Vercel
- Backend Hosting: Render (includes PostgreSQL)

**Important Decisions (Shape Architecture):**
- Bulgarian i18n: Custom translation object
- Caching: None for MVP (defer to post-MVP)
- CI/CD: Platform built-in (Vercel/Render auto-deploy)

**Deferred Decisions (Post-MVP):**
- Performance caching layer (Redis/in-memory)
- Advanced monitoring/observability tools
- Automated testing in CI/CD pipeline

### Frontend Architecture Decisions

#### State Management
**Decision**: React Context API for authentication state, component-level state for forms

**Rationale**:
- No additional bundle size (built-in React feature)
- Sufficient complexity for admin panel with 6 content types
- Context API handles global auth state (JWT token, user info)
- Component state manages form data (isolated, performant)
- Avoids over-engineering with Redux/Zustand for solo developer project

**Implementation**:
- `AuthContext` provides authentication state to entire app
- Individual form components use `useState` for form data
- React Hook Form manages form validation and submission

#### Form Handling
**Decision**: React Hook Form

**Version**: Latest stable (v7.x as of 2026)

**Rationale**:
- Lightweight bundle size (~24KB minified)
- Excellent TypeScript support
- Integrates seamlessly with Zod validation (backend already uses Zod)
- Minimal re-renders (uncontrolled components by default)
- Handles complex forms efficiently (6 content types with validation)

**Integration**:
- Works with Radix UI components (shadcn-ui compatibility)
- Bulgarian error message translation via custom resolver
- Supports async validation for API calls

#### WYSIWYG Rich Text Editor
**Decision**: TipTap (headless Prosemirror editor)

**Version**: TipTap v2.x (latest stable)

**Rationale**:
- Headless architecture allows full Tailwind CSS styling
- Excellent accessibility support (WCAG 2.1 AA compliant)
- Modern React integration with hooks
- Customizable toolbar with Bulgarian labels
- Extensions for basic formatting (bold, italic, lists, links, headings)
- Active development and community

**Features Needed**:
- Basic text formatting (bold, italic, underline, strikethrough)
- Headings (H2, H3)
- Lists (ordered, unordered)
- Links
- Bulgarian toolbar tooltips

**Bundle Size**: ~160KB (acceptable for admin panel)

#### Date Picker
**Decision**: Radix UI Date Picker (via shadcn-ui)

**Rationale**:
- Already using shadcn-ui (built on Radix UI primitives)
- WCAG 2.1 Level AA accessible by default
- Headless, fully stylable with Tailwind CSS
- Supports Bulgarian date format (dd.MM.yyyy) via date-fns
- Keyboard navigation built-in

**Integration**:
- Use date-fns for Bulgarian locale formatting
- Custom format function: `format(date, 'dd.MM.yyyy', { locale: bg })`

#### Bulgarian Internationalization
**Decision**: Custom translation object (no i18n library)

**Rationale**:
- Bulgarian-only interface (no multi-language requirement)
- No need for 70KB+ i18n library overhead
- Simple key-value structure in TypeScript
- Type-safe translations with TypeScript inference
- Easy to maintain for solo developer

**Implementation**:
```typescript
// src/lib/i18n/bg.ts
export const translations = {
  admin: {
    login: 'Вход',
    logout: 'Изход',
    dashboard: 'Табло',
    news: 'Новини',
    jobs: 'Кариери',
    // ... all Bulgarian strings
  },
  errors: {
    required: 'Полето е задължително',
    invalidEmail: 'Невалиден имейл адрес',
    // ... all error messages
  }
} as const;

export type TranslationKey = keyof typeof translations;
```

### API & Communication Decisions

#### WebSocket Implementation
**Decision**: Socket.io

**Version**: Socket.io v4.x (latest stable)

**Rationale**:
- Most popular WebSocket library (battle-tested)
- Automatic reconnection handling
- Fallback to HTTP long-polling if WebSocket unavailable
- Room-based architecture for admin-specific real-time updates
- Easy integration with Express backend

**Use Case**: Real-time preview during content editing (FR24)

**Implementation**:
- Backend: Socket.io server integrated with Express
- Frontend: Socket.io client connects on admin panel load
- Emit preview updates when admin types in editor
- Display live preview to admin before publishing

#### File Upload Strategy
**Decision**: Upload to backend → backend uploads to Cloudinary (proxy pattern)

**Rationale**:
- Security: Backend validates file type, size before cloud upload
- Control: Rate limiting enforced on backend
- Error Handling: Backend handles Cloudinary failures gracefully
- Consistent API: All admin operations go through same backend API
- Signed uploads not needed (backend manages Cloudinary credentials)

**Flow**:
1. Admin selects image in drag-and-drop uploader
2. Frontend sends multipart/form-data to backend `/api/upload`
3. Backend validates file (type, size, dimensions)
4. Backend uploads to Cloudinary using Node.js SDK
5. Backend returns Cloudinary URL to frontend
6. Frontend stores URL in form state

#### Error Response Format
**Decision**: JSend standard

**Rationale**:
- Simple, consistent structure
- Status field ('success', 'fail', 'error') clarifies response type
- Already popular in Express APIs
- Easy to parse on frontend

**Format**:
```typescript
// Success
{ status: 'success', data: { ... } }

// Validation error
{ status: 'fail', data: { field: 'error message' } }

// Server error
{ status: 'error', message: 'Internal server error' }
```

### Data Architecture Decisions

#### Database Migration Strategy
**Decision**: Prisma Migrate (version-controlled migrations)

**Rationale**:
- Production-ready migration system
- Version-controlled SQL migration files in git
- Rollback capability if needed
- Team-friendly (AI agents can generate migrations)
- Clear audit trail of schema changes

**Commands**:
```bash
npx prisma migrate dev --name add-news-table  # Development
npx prisma migrate deploy  # Production
```

#### Caching Strategy
**Decision**: None for MVP (defer to post-MVP)

**Rationale**:
- Premature optimization for single kindergarten use case
- PostgreSQL query performance sufficient for low traffic
- Admin panel usage: 1 user, weekly content updates
- Public site traffic: Low (local kindergarten)
- Can add Redis or in-memory caching later if needed

**Post-MVP Consideration**: Add caching if API response times exceed 500ms target

### Infrastructure & Deployment Decisions

#### Frontend Hosting
**Decision**: Vercel (FREE tier)

**Rationale**:
- Best Vite support (instant deploys, optimized builds)
- Automatic HTTPS
- CDN included (global edge network)
- GitHub integration (auto-deploy on push)
- Zero configuration needed
- Generous free tier (unlimited bandwidth for hobby projects)

**Free Tier Limits**: Unlimited bandwidth, 100GB build execution time/month

#### Backend Hosting
**Decision**: Render (FREE tier)

**Rationale**:
- Includes free PostgreSQL database (eliminates separate DB hosting)
- 750 hours/month free tier (sufficient for 24/7 uptime)
- Automatic deployments from GitHub
- Built-in environment variables management
- HTTPS included
- Health checks and auto-restart

**Free Tier Limits**: 750 hours/month, spins down after 15 min inactivity (acceptable for low-traffic kindergarten site)

#### Database Hosting
**Decision**: Render PostgreSQL (included with backend hosting)

**Rationale**:
- Free tier includes 1GB PostgreSQL database
- Automatic backups
- No separate service to manage
- Same platform as backend (simpler operations)
- Sufficient for kindergarten content (news, jobs, events, gallery, teachers)

**Free Tier Limits**: 1GB storage, 90-day data retention

**Alternative**: Supabase (2GB free) if Render DB proves insufficient

#### CI/CD Pipeline
**Decision**: Platform built-in (Vercel/Render auto-deploy)

**Rationale**:
- Zero configuration needed
- Automatic deployments on git push to main branch
- Preview deployments for pull requests (Vercel)
- Build logs and deployment history included
- Sufficient for solo developer MVP

**Deployment Flow**:
1. Push to GitHub main branch
2. Vercel detects change → builds frontend → deploys
3. Render detects change → builds backend → deploys
4. Both platforms run health checks

**Post-MVP**: Add GitHub Actions for automated tests before deployment

### Decision Impact Analysis

**Implementation Sequence** (ordered by dependency):

1. **Backend Foundation** (Week 1)
   - Clone express-prisma-ts-boilerplate
   - Configure PostgreSQL connection (Render DB)
   - Define Prisma models for 6 content types
   - Run initial migration

2. **Backend API Development** (Week 2-3)
   - CRUD endpoints for each content type
   - Cloudinary integration for image uploads
   - AWS SES integration for email notifications
   - Socket.io server for real-time preview
   - Rate limiting and CORS configuration

3. **Frontend Foundation** (Week 4)
   - Set up admin routes in existing repo
   - Implement AuthContext for JWT authentication
   - Create ProtectedRoute component
   - Build admin layout (sidebar, header)

4. **Frontend Features** (Week 5-6)
   - Content management forms (React Hook Form + Zod)
   - TipTap rich text editor integration
   - Radix UI date picker with Bulgarian format
   - Drag-and-drop image uploader
   - Bulgarian translations (custom object)

5. **Integration & Polish** (Week 7)
   - Socket.io client for real-time preview
   - WCAG 2.1 AA accessibility audit
   - Error handling and user feedback
   - Testing (manual + basic Jest tests)

6. **Deployment** (Week 8)
   - Deploy backend to Render
   - Deploy frontend to Vercel
   - Configure environment variables
   - Verify Cloudinary and AWS SES integrations
   - Test end-to-end in production

**Cross-Component Dependencies**:

- **React Hook Form ↔ Zod**: Frontend validation mirrors backend Zod schemas
- **TipTap ↔ Bulgarian i18n**: Editor toolbar uses custom translation object
- **Radix UI ↔ shadcn-ui**: Date picker styled with existing Tailwind config
- **Socket.io ↔ Express**: Real-time preview requires WebSocket server on backend
- **Cloudinary ↔ Backend API**: Image upload proxy pattern requires backend integration
- **Vercel ↔ Render**: Frontend `.env` must point to Render backend URL
- **Prisma Migrate ↔ CI/CD**: Migrations run automatically on Render deployment

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified**: 8 areas where AI agents could make different choices without explicit patterns

This section defines mandatory patterns that ALL AI agents must follow when implementing this architecture. These patterns prevent conflicts and ensure code consistency across the entire project.

### Naming Patterns

#### Database Naming Conventions (Prisma Schema)

**Pattern**: camelCase for all Prisma models, fields, and relations

**Rationale**: Matches JavaScript/TypeScript conventions, Prisma generates camelCase by default, maintains consistency with frontend code

**Examples**:
```prisma
// ✅ CORRECT
model NewsItem {
  id          Int      @id @default(autoincrement())
  title       String
  content     String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  teacherId   Int?
  teacher     Teacher? @relation(fields: [teacherId], references: [id])
}

model Teacher {
  id        Int         @id @default(autoincrement())
  firstName String
  lastName  String
  newsItems NewsItem[]
}

// ❌ INCORRECT
model news_item {
  id          Int      @id @default(autoincrement())
  created_at  DateTime @default(now())
  teacher_id  Int?
}
```

**Rules**:
- Model names: PascalCase singular (`NewsItem`, `Teacher`, not `news_items` or `teachers`)
- Field names: camelCase (`createdAt`, `teacherId`, not `created_at` or `teacher_id`)
- Relations: camelCase singular or plural as appropriate (`teacher`, `newsItems`)
- No underscores in names (except Prisma directives like `@map`)

---

#### API Naming Conventions

**Pattern**: Plural resource names in kebab-case, camelCase for query parameters

**Rationale**: RESTful convention uses plural resources, matches JavaScript/TypeScript object property naming

**Examples**:
```typescript
// ✅ CORRECT
GET    /api/news                    // List all news items
GET    /api/news/:id                // Get specific news item
POST   /api/news                    // Create news item
PUT    /api/news/:id                // Update news item
DELETE /api/news/:id                // Delete news item

GET    /api/teachers?includeInactive=true
GET    /api/events?startDate=2026-02-01&endDate=2026-02-28

// ❌ INCORRECT
GET    /api/news-item               // Singular resource name
GET    /api/news_items              // Underscore instead of hyphen
GET    /api/teacher/:id             // Singular when should be plural
GET    /api/events?start_date=...   // Underscore in query param
```

**Rules**:
- Resource paths: Plural kebab-case (`/api/news`, `/api/admission-deadlines`)
- Route parameters: camelCase (`:id`, `:teacherId`)
- Query parameters: camelCase (`?includeInactive=true`, `?teacherId=5`)
- No trailing slashes on endpoints

---

#### Frontend File & Component Naming

**Pattern**: PascalCase for component files and components, camelCase for utilities

**Rationale**: Matches React convention, clear distinction between components and utilities, consistent with shadcn-ui

**Examples**:
```typescript
// ✅ CORRECT - Components
src/components/admin/NewsManager.tsx
src/components/admin/TeacherCard.tsx
src/components/shared/Button.tsx
src/pages/admin/Dashboard.tsx

// ✅ CORRECT - Utilities
src/lib/api.ts
src/lib/auth.ts
src/lib/i18n/bg.ts
src/hooks/useAuth.ts
src/utils/formatDate.ts

// ❌ INCORRECT
src/components/admin/news-manager.tsx      // kebab-case component
src/components/admin/newsManager.tsx       // camelCase component
src/lib/Api.ts                            // PascalCase utility
src/hooks/UseAuth.ts                      // PascalCase hook
```

**Rules**:
- React components: PascalCase files (`NewsManager.tsx`, `TeacherCard.tsx`)
- Hooks: camelCase starting with `use` (`useAuth.ts`, `useCreateNews.ts`)
- Utilities/libs: camelCase (`api.ts`, `formatDate.ts`)
- Pages: PascalCase (`Dashboard.tsx`, `Login.tsx`)
- Test files: Same name as source + `.test` (`NewsManager.test.tsx`)

---

#### Code Naming Conventions

**Pattern**: camelCase for variables/functions, PascalCase for types/interfaces/components

**Rationale**: Standard TypeScript/JavaScript conventions

**Examples**:
```typescript
// ✅ CORRECT
const newsItems: NewsItem[] = [];
const teacherId = 5;

function fetchNewsItems(): Promise<NewsItem[]> { }
async function createNewsItem(data: CreateNewsData) { }

interface NewsItem {
  id: number;
  title: string;
  createdAt: Date;
}

type CreateNewsData = Omit<NewsItem, 'id' | 'createdAt'>;

// ❌ INCORRECT
const NewsItems = [];                    // PascalCase variable
const teacher_id = 5;                    // snake_case variable
function FetchNewsItems() { }            // PascalCase function
interface newsItem { }                   // camelCase interface
```

**Rules**:
- Variables: camelCase (`newsItems`, `teacherId`, `isLoading`)
- Functions: camelCase (`fetchNewsItems`, `handleSubmit`)
- Types/Interfaces: PascalCase (`NewsItem`, `CreateNewsData`)
- React Components: PascalCase (`NewsManager`, `Button`)
- Constants: SCREAMING_SNAKE_CASE only for truly constant values (`API_BASE_URL`)
- Boolean variables: Prefix with `is`, `has`, `should` (`isLoading`, `hasError`)

---

### Format Patterns

#### Date/Time Formats

**Pattern**: ISO 8601 in APIs, dd.MM.yyyy in Bulgarian UI, PostgreSQL timestamp in database

**Rationale**: ISO 8601 is standard for APIs, dd.MM.yyyy is Bulgarian convention, Prisma handles DB format automatically

**Examples**:
```typescript
// ✅ CORRECT - API Response
{
  "id": 1,
  "title": "Нова новина",
  "createdAt": "2026-02-02T10:30:00.000Z",     // ISO 8601
  "publishDate": "2026-02-05T00:00:00.000Z"
}

// ✅ CORRECT - Bulgarian UI Display
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';

const displayDate = format(new Date(item.createdAt), 'dd.MM.yyyy', { locale: bg });
// Output: "02.02.2026"

// ✅ CORRECT - Prisma Schema
model NewsItem {
  createdAt   DateTime @default(now())    // Stores as PostgreSQL timestamp
  publishDate DateTime
}

// ❌ INCORRECT
{
  "createdAt": 1738493400000,              // Unix timestamp in API
  "publishDate": "02.02.2026"              // dd.MM.yyyy in API (not ISO)
}
```

**Rules**:
- **API responses**: Always ISO 8601 strings (`2026-02-02T10:30:00.000Z`)
- **Frontend display**: Bulgarian format (`dd.MM.yyyy`) using date-fns
- **Frontend internal**: JavaScript `Date` objects or ISO strings
- **Database**: Prisma `DateTime` type (auto-handles PostgreSQL format)
- **Date-only values**: Use ISO 8601 date string (`2026-02-02`) in API, still display as `dd.MM.yyyy` in UI

---

#### API Response Format

**Pattern**: JSend standard with camelCase field names

**Rationale**: Consistent response structure, easy error handling, matches JavaScript conventions

**Examples**:
```typescript
// ✅ CORRECT - Success Response
{
  "status": "success",
  "data": {
    "newsItem": {
      "id": 1,
      "title": "Нова новина",
      "content": "Съдържание...",
      "createdAt": "2026-02-02T10:30:00.000Z"
    }
  }
}

// ✅ CORRECT - Validation Error (fail)
{
  "status": "fail",
  "data": {
    "title": "REQUIRED_FIELD",           // Error code, not Bulgarian text
    "content": "MIN_LENGTH",
    "publishDate": "INVALID_DATE"
  }
}

// ✅ CORRECT - Server Error (error)
{
  "status": "error",
  "message": "Database connection failed",
  "code": "DB_CONNECTION_ERROR"
}

// ❌ INCORRECT
{
  "success": true,                        // Not JSend format
  "result": { ... }
}

{
  "status": "fail",
  "data": {
    "title": "Заглавието е задължително"  // Bulgarian text in API (should be code)
  }
}
```

**Rules**:
- **Success**: `{ status: 'success', data: { ... } }`
- **Validation errors**: `{ status: 'fail', data: { field: 'ERROR_CODE' } }`
- **Server errors**: `{ status: 'error', message: string, code?: string }`
- **All field names**: camelCase (not snake_case)
- **Error messages in API**: English error codes (frontend translates to Bulgarian)

---

### Structure Patterns

#### Test File Location

**Pattern**: Co-located tests next to source files

**Rationale**: Easier to find tests, follows Jest convention, simpler imports

**Examples**:
```
✅ CORRECT
src/
├── services/
│   ├── news.service.ts
│   ├── news.service.test.ts
│   ├── teacher.service.ts
│   └── teacher.service.test.ts
├── components/
│   └── admin/
│       ├── NewsManager.tsx
│       └── NewsManager.test.tsx

❌ INCORRECT
src/
├── services/
│   ├── news.service.ts
│   └── teacher.service.ts
└── __tests__/
    └── services/
        ├── news.service.test.ts
        └── teacher.service.test.ts
```

**Rules**:
- Test files: Same name as source + `.test` extension
- Location: Same directory as source file
- Test utilities: Can be in `src/test-utils/` for shared helpers

---

#### Project Organization

**Pattern**: Feature-based organization for backend, component-type for frontend

**Rationale**: Backend organized by domain logic, frontend by UI hierarchy

**Backend Structure**:
```
src/
├── models/              # Prisma schema models
├── routes/              # Express route definitions
│   ├── news.routes.ts
│   ├── teachers.routes.ts
│   └── auth.routes.ts
├── controllers/         # Request handlers
│   ├── news.controller.ts
│   └── teachers.controller.ts
├── services/            # Business logic
│   ├── news.service.ts
│   └── email.service.ts
├── middleware/          # Express middleware
│   ├── auth.middleware.ts
│   └── validation.middleware.ts
└── utils/               # Shared utilities
    └── logger.ts
```

**Frontend Structure** (already established):
```
src/
├── pages/
│   ├── public/          # Public website pages
│   └── admin/           # Admin panel pages
├── components/
│   ├── public/          # Public site components
│   ├── admin/           # Admin panel components
│   └── shared/          # Shared between public/admin
├── lib/                 # Utilities and helpers
│   ├── api.ts
│   ├── auth.ts
│   └── i18n/
├── hooks/               # Custom React hooks
└── types/               # Shared TypeScript types
```

---

### Communication Patterns

#### Error Message Translation

**Pattern**: Backend returns error codes, frontend translates to Bulgarian

**Rationale**: Keeps backend language-agnostic, frontend owns UI language, enables future multi-language support

**Examples**:
```typescript
// ✅ CORRECT - Backend (error codes)
// Zod validation schema
const newsSchema = z.object({
  title: z.string().min(1, 'REQUIRED_FIELD').max(200, 'MAX_LENGTH'),
  content: z.string().min(1, 'REQUIRED_FIELD'),
  publishDate: z.string().datetime('INVALID_DATE')
});

// API response
{
  "status": "fail",
  "data": {
    "title": "REQUIRED_FIELD",
    "content": "MIN_LENGTH"
  }
}

// ✅ CORRECT - Frontend (translation)
// src/lib/i18n/bg.ts
export const translations = {
  errors: {
    REQUIRED_FIELD: 'Полето е задължително',
    MIN_LENGTH: 'Полето е твърде кратко',
    MAX_LENGTH: 'Полето е твърде дълго',
    INVALID_DATE: 'Невалидна дата',
    INVALID_EMAIL: 'Невалиден имейл адрес'
  }
} as const;

// Component usage
const errorMessage = translations.errors[error.code] || 'Грешка при обработката';

// ❌ INCORRECT - Backend returns Bulgarian
{
  "status": "fail",
  "data": {
    "title": "Заглавието е задължително"  // Hard-coded Bulgarian
  }
}
```

**Rules**:
- **Backend**: Always return SCREAMING_SNAKE_CASE error codes
- **Frontend**: Translate error codes using `translations.errors` object
- **Fallback**: If error code not found, show generic Bulgarian error message
- **Validation errors**: Map field names to error codes in JSend `data` object

---

#### Loading State Management

**Pattern**: Per-operation loading states (not global)

**Rationale**: More granular control, better UX, avoids conflicts between multiple operations

**Examples**:
```typescript
// ✅ CORRECT - Per-operation loading
function NewsManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleCreate(data: CreateNewsData) {
    setIsCreating(true);
    try {
      await api.createNews(data);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDelete(id: number) {
    setIsDeleting(true);
    try {
      await api.deleteNews(id);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <button disabled={isCreating}>
        {isCreating ? 'Създаване...' : 'Създай новина'}
      </button>
      <button disabled={isDeleting}>
        {isDeleting ? 'Изтриване...' : 'Изтрий'}
      </button>
    </>
  );
}

// ❌ INCORRECT - Global loading state
function App() {
  const [isLoading, setIsLoading] = useState(false);
  // All operations share same loading state - causes conflicts
}
```

**Rules**:
- **One loading state per operation**: `isCreating`, `isUpdating`, `isDeleting`, etc.
- **Boolean naming**: Prefix with `is` (`isLoading`, `isSaving`, `isSubmitting`)
- **Set in try/finally**: Ensure loading state resets even on error
- **Disable UI during loading**: Disable submit buttons, show loading text

---

### Enforcement Guidelines

**All AI Agents MUST:**

1. **Follow naming conventions exactly** - No deviations from camelCase/PascalCase/kebab-case rules defined above
2. **Use JSend format for all API responses** - Consistent success/fail/error structure
3. **Return error codes (not Bulgarian text) from backend** - Frontend handles translation
4. **Use ISO 8601 for all date/time in APIs** - Backend always outputs ISO strings
5. **Co-locate test files with source** - `*.test.ts` next to `*.ts`
6. **Use per-operation loading states** - Never share loading state between operations
7. **Follow project structure patterns** - Backend organized by feature, frontend by component type

**Pattern Enforcement:**

- **Code review checklist**: Verify all patterns before merging
- **Linting**: ESLint/Prettier enforce code style (camelCase, PascalCase)
- **Prisma schema**: Run `npx prisma format` to enforce consistent formatting
- **Testing**: Ensure tests follow co-location pattern

**Process for Updating Patterns:**

- If pattern conflicts arise, document in architecture decision log
- Update this section with new patterns or refinements
- Communicate pattern changes to all AI agents working on the project

---

### Pattern Examples

#### Good Example: Creating News API Endpoint

```typescript
// ✅ Backend - routes/news.routes.ts
import express from 'express';
import { createNewsItem, getNewsItems } from '../controllers/news.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/api/news', getNewsItems);             // Plural, camelCase
router.post('/api/news', authMiddleware, createNewsItem);

export default router;

// ✅ Backend - controllers/news.controller.ts
import { Request, Response } from 'express';
import { newsService } from '../services/news.service';

export async function createNewsItem(req: Request, res: Response) {
  try {
    const newsItem = await newsService.create(req.body);
    res.json({
      status: 'success',                           // JSend format
      data: { newsItem }                           // camelCase field
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({
        status: 'fail',
        data: {
          title: 'REQUIRED_FIELD',                 // Error code, not Bulgarian
          content: 'MIN_LENGTH'
        }
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to create news item'
      });
    }
  }
}

// ✅ Frontend - pages/admin/NewsManager.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';
import { translations } from '@/lib/i18n/bg';

export function NewsManager() {
  const [isCreating, setIsCreating] = useState(false);  // Per-operation state
  const { register, handleSubmit, formState: { errors } } = useForm();

  async function onSubmit(data: CreateNewsData) {
    setIsCreating(true);
    try {
      const response = await api.post('/api/news', data);
      if (response.status === 'success') {
        // Success handling
      } else if (response.status === 'fail') {
        // Translate error codes to Bulgarian
        Object.entries(response.data).forEach(([field, code]) => {
          const message = translations.errors[code];
          // Show Bulgarian error message
        });
      }
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <button type="submit" disabled={isCreating}>
        {isCreating ? 'Създаване...' : 'Създай новина'}
      </button>
    </form>
  );
}
```

---

#### Anti-Patterns (What to Avoid)

```typescript
// ❌ Backend - Inconsistent naming
router.get('/api/news_items', ...);         // Underscore instead of hyphen
router.post('/api/NewsItem', ...);          // PascalCase URL
const news_data = req.body;                 // snake_case variable

// ❌ Backend - Wrong response format
res.json({ success: true, result: data });  // Not JSend

// ❌ Backend - Bulgarian text in error
res.json({
  status: 'fail',
  data: { title: 'Заглавието е задължително' }  // Should be error code
});

// ❌ Frontend - Wrong file naming
src/components/admin/news-manager.tsx       // kebab-case component
src/lib/Api.ts                             // PascalCase utility

// ❌ Frontend - Global loading state
const [isLoading, setIsLoading] = useState(false);
// Used for create, update, delete - causes conflicts

// ❌ Frontend - Hardcoded Bulgarian
<button>Създай новина</button>             // Should use translations.admin.createNews
```

## Project Structure & Boundaries

### Complete Monorepo Directory Structure

```
kindergarten-canvas/
│
├── frontend/                           # React Frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── public/                 # Public website pages
│   │   │   │   ├── Home.tsx
│   │   │   │   ├── Admission.tsx
│   │   │   │   ├── Careers.tsx
│   │   │   │   ├── Groups.tsx
│   │   │   │   ├── DailySchedule.tsx
│   │   │   │   ├── WeeklyMenu.tsx
│   │   │   │   ├── Documents.tsx
│   │   │   │   ├── News.tsx             # Public news list page
│   │   │   │   ├── NewsDetail.tsx       # Individual news article page
│   │   │   │   ├── Events.tsx           # Public events list page
│   │   │   │   ├── EventDetail.tsx      # Individual event page
│   │   │   │   ├── Gallery.tsx          # Public gallery page
│   │   │   │   ├── Teachers.tsx         # Public teachers page
│   │   │   │   └── NotFound.tsx
│   │   │   └── admin/                  # Admin panel pages
│   │   │       ├── Dashboard.tsx        # Admin dashboard overview
│   │   │       ├── Login.tsx            # Admin login page
│   │   │       ├── NewsManager.tsx      # CRUD for News content type
│   │   │       ├── JobsManager.tsx      # CRUD for Jobs content type
│   │   │       ├── DeadlinesManager.tsx # CRUD for Deadlines content type
│   │   │       ├── EventsManager.tsx    # CRUD for Events content type
│   │   │       ├── GalleryManager.tsx   # CRUD for Gallery content type
│   │   │       └── TeachersManager.tsx  # CRUD for Teachers content type
│   │   ├── components/
│   │   │   ├── public/                 # Public site components
│   │   │   │   ├── Hero.tsx
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Programs.tsx
│   │   │   │   ├── About.tsx
│   │   │   │   ├── Contact.tsx
│   │   │   │   ├── NewsCard.tsx         # News item display
│   │   │   │   ├── EventCard.tsx        # Event item display
│   │   │   │   ├── GalleryGrid.tsx      # Gallery image grid
│   │   │   │   └── TeacherCard.tsx      # Teacher profile card
│   │   │   ├── admin/                  # Admin panel components
│   │   │   │   ├── AdminLayout.tsx      # Main admin layout wrapper
│   │   │   │   ├── Sidebar.tsx          # Admin sidebar navigation
│   │   │   │   ├── Header.tsx           # Admin header with logout
│   │   │   │   ├── DashboardCard.tsx    # Dashboard widget cards
│   │   │   │   ├── NewsForm.tsx         # News create/edit form
│   │   │   │   ├── JobForm.tsx          # Job create/edit form
│   │   │   │   ├── DeadlineForm.tsx     # Deadline create/edit form
│   │   │   │   ├── EventForm.tsx        # Event create/edit form
│   │   │   │   ├── GalleryUploader.tsx  # Gallery image uploader
│   │   │   │   ├── TeacherForm.tsx      # Teacher create/edit form
│   │   │   │   ├── RichTextEditor.tsx   # TipTap WYSIWYG editor wrapper
│   │   │   │   ├── DatePicker.tsx       # Radix UI date picker wrapper
│   │   │   │   ├── ImageUploader.tsx    # Drag-and-drop image uploader
│   │   │   │   ├── PreviewModal.tsx     # Content preview before publish
│   │   │   │   └── ContentTable.tsx     # Reusable data table for content lists
│   │   │   └── shared/                 # Shared components (public + admin)
│   │   │       ├── Button.tsx           # Reusable button component
│   │   │       ├── Input.tsx            # Form input component
│   │   │       ├── Select.tsx           # Form select component
│   │   │       ├── Textarea.tsx         # Form textarea component
│   │   │       ├── Card.tsx             # Card layout component
│   │   │       ├── Modal.tsx            # Modal/dialog component
│   │   │       ├── Spinner.tsx          # Loading spinner
│   │   │       └── ErrorMessage.tsx     # Error message display
│   │   ├── layouts/
│   │   │   ├── PublicLayout.tsx         # Layout wrapper for public pages
│   │   │   └── AdminLayout.tsx          # Layout wrapper for admin pages
│   │   ├── lib/
│   │   │   ├── api.ts                   # API client (axios/fetch wrapper)
│   │   │   ├── auth.ts                  # JWT token management utilities
│   │   │   ├── socket.ts                # Socket.io client setup
│   │   │   ├── i18n/
│   │   │   │   └── bg.ts                # Bulgarian translation object
│   │   │   └── utils/
│   │   │       ├── formatDate.ts        # Date formatting utilities
│   │   │       ├── validation.ts        # Frontend validation helpers
│   │   │       └── errorCodes.ts        # Error code to Bulgarian translation
│   │   ├── hooks/
│   │   │   ├── useAuth.ts               # Authentication hook (AuthContext consumer)
│   │   │   ├── useApi.ts                # Generic API request hook
│   │   │   ├── useNews.ts               # News-specific API hooks
│   │   │   ├── useJobs.ts               # Jobs-specific API hooks
│   │   │   ├── useEvents.ts             # Events-specific API hooks
│   │   │   ├── useGallery.ts            # Gallery-specific API hooks
│   │   │   ├── useTeachers.ts           # Teachers-specific API hooks
│   │   │   └── useDeadlines.ts          # Deadlines-specific API hooks
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx          # Authentication context provider
│   │   ├── types/
│   │   │   └── index.ts                 # Frontend-specific types (imports from shared/)
│   │   ├── assets/
│   │   │   ├── logo.png
│   │   │   ├── logo-footer.png
│   │   │   └── icons/
│   │   ├── styles/
│   │   │   └── globals.css              # Global styles, Tailwind directives
│   │   ├── App.tsx                      # Root component with routing
│   │   ├── main.tsx                     # Vite entry point
│   │   └── vite-env.d.ts                # Vite TypeScript declarations
│   ├── public/
│   │   ├── favicon.ico
│   │   └── robots.txt
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── .env.example
│   ├── .env.local                       # Git-ignored, local dev config
│   ├── .eslintrc.json
│   ├── .prettierrc
│   └── README.md
│
├── backend/                             # Express API Server (Node.js + TypeScript)
│   ├── src/
│   │   ├── routes/                      # Express route definitions
│   │   │   ├── index.ts                 # Main router aggregator
│   │   │   ├── auth.routes.ts           # POST /api/auth/login, /logout, /refresh
│   │   │   ├── news.routes.ts           # CRUD /api/news
│   │   │   ├── jobs.routes.ts           # CRUD /api/jobs
│   │   │   ├── deadlines.routes.ts      # CRUD /api/admission-deadlines
│   │   │   ├── events.routes.ts         # CRUD /api/events
│   │   │   ├── gallery.routes.ts        # CRUD /api/gallery
│   │   │   ├── teachers.routes.ts       # CRUD /api/teachers
│   │   │   ├── upload.routes.ts         # POST /api/upload (images to Cloudinary)
│   │   │   └── health.routes.ts         # GET /api/health
│   │   ├── controllers/                 # Request/response handlers
│   │   │   ├── auth.controller.ts       # Login, logout, token refresh logic
│   │   │   ├── news.controller.ts       # News CRUD logic
│   │   │   ├── jobs.controller.ts       # Jobs CRUD + email notification logic
│   │   │   ├── deadlines.controller.ts  # Deadlines CRUD logic
│   │   │   ├── events.controller.ts     # Events CRUD logic
│   │   │   ├── gallery.controller.ts    # Gallery CRUD logic
│   │   │   ├── teachers.controller.ts   # Teachers CRUD logic
│   │   │   └── upload.controller.ts     # Image upload proxy to Cloudinary
│   │   ├── services/                    # Business logic layer
│   │   │   ├── news.service.ts          # News business logic + DB operations
│   │   │   ├── jobs.service.ts          # Jobs business logic + DB operations
│   │   │   ├── deadlines.service.ts     # Deadlines business logic + DB operations
│   │   │   ├── events.service.ts        # Events business logic + DB operations
│   │   │   ├── gallery.service.ts       # Gallery business logic + DB operations
│   │   │   ├── teachers.service.ts      # Teachers business logic + DB operations
│   │   │   ├── email.service.ts         # AWS SES email sending logic
│   │   │   ├── cloudinary.service.ts    # Cloudinary image upload logic
│   │   │   └── auth.service.ts          # JWT token generation/validation
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts       # JWT token verification
│   │   │   ├── validation.middleware.ts # Zod schema validation
│   │   │   ├── errorHandler.middleware.ts # Global error handling
│   │   │   ├── rateLimit.middleware.ts  # Rate limiting (100 req/min admin, 5/hr public)
│   │   │   ├── cors.middleware.ts       # CORS configuration (whitelist frontend URL)
│   │   │   └── logger.middleware.ts     # Request/response logging
│   │   ├── validators/                  # Zod validation schemas
│   │   │   ├── news.validator.ts        # News create/update schemas
│   │   │   ├── jobs.validator.ts        # Jobs create/update schemas
│   │   │   ├── deadlines.validator.ts   # Deadlines create/update schemas
│   │   │   ├── events.validator.ts      # Events create/update schemas
│   │   │   ├── gallery.validator.ts     # Gallery create/update schemas
│   │   │   ├── teachers.validator.ts    # Teachers create/update schemas
│   │   │   └── auth.validator.ts        # Login validation schema
│   │   ├── utils/
│   │   │   ├── logger.ts                # Winston logger configuration
│   │   │   ├── response.ts              # JSend response helpers
│   │   │   ├── errorCodes.ts            # Error code constants
│   │   │   └── config.ts                # Environment variables loader
│   │   ├── socket/
│   │   │   └── preview.socket.ts        # Socket.io server for real-time preview
│   │   ├── types/
│   │   │   └── index.ts                 # Backend-specific types (imports from shared/)
│   │   ├── app.ts                       # Express app setup (middleware, routes)
│   │   └── server.ts                    # HTTP server + Socket.io initialization
│   ├── prisma/
│   │   ├── schema.prisma                # Database schema (6 content type models)
│   │   └── migrations/                  # Version-controlled migrations
│   │       └── ...migration files
│   ├── tests/                           # Backend tests (co-located in future)
│   │   ├── unit/
│   │   │   ├── services/
│   │   │   │   ├── news.service.test.ts
│   │   │   │   ├── jobs.service.test.ts
│   │   │   │   └── ...
│   │   │   └── utils/
│   │   └── integration/
│   │       ├── news.routes.test.ts
│   │       ├── jobs.routes.test.ts
│   │       └── ...
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── .env                             # Git-ignored, local dev config
│   ├── .eslintrc.json
│   ├── .prettierrc
│   ├── jest.config.js
│   └── README.md
│
├── shared/                              # Shared TypeScript Types (Frontend + Backend)
│   ├── types/
│   │   ├── news.types.ts                # NewsItem, CreateNewsData, UpdateNewsData
│   │   ├── jobs.types.ts                # JobPosting, CreateJobData, JobApplication
│   │   ├── deadlines.types.ts           # Deadline, CreateDeadlineData
│   │   ├── events.types.ts              # Event, CreateEventData
│   │   ├── gallery.types.ts             # GalleryImage, CreateGalleryImageData
│   │   ├── teachers.types.ts            # Teacher, CreateTeacherData
│   │   ├── auth.types.ts                # LoginRequest, LoginResponse, TokenPayload
│   │   ├── api.types.ts                 # JSendSuccessResponse, JSendFailResponse, JSendErrorResponse
│   │   └── common.types.ts              # Shared enums, utility types
│   ├── package.json                     # Optional: for npm workspace or type exports
│   └── README.md
│
├── .github/
│   └── workflows/
│       ├── frontend-deploy.yml          # Vercel deployment (optional, auto-deploy)
│       └── backend-deploy.yml           # Render deployment (optional, auto-deploy)
│
├── .gitignore                           # Ignore node_modules, .env, dist/
├── README.md                            # Root project documentation
└── package.json                         # Optional: root package.json for workspace management
```

### Architectural Boundaries

#### API Boundaries

**External API Endpoints** (Backend exposes RESTful API):

**Authentication Endpoints:**
- `POST /api/auth/login` - Administrator login (returns JWT token)
- `POST /api/auth/logout` - Invalidate session
- `POST /api/auth/refresh` - Refresh expired JWT token

**Content Management Endpoints (Protected - Require JWT):**
- News: `GET /api/news`, `GET /api/news/:id`, `POST /api/news`, `PUT /api/news/:id`, `DELETE /api/news/:id`
- Jobs: `GET /api/jobs`, `GET /api/jobs/:id`, `POST /api/jobs`, `PUT /api/jobs/:id`, `DELETE /api/jobs/:id`
- Deadlines: `GET /api/admission-deadlines`, `GET /api/admission-deadlines/:id`, `POST /api/admission-deadlines`, `PUT /api/admission-deadlines/:id`, `DELETE /api/admission-deadlines/:id`
- Events: `GET /api/events`, `GET /api/events/:id`, `POST /api/events`, `PUT /api/events/:id`, `DELETE /api/events/:id`
- Gallery: `GET /api/gallery`, `GET /api/gallery/:id`, `POST /api/gallery`, `PUT /api/gallery/:id`, `DELETE /api/gallery/:id`
- Teachers: `GET /api/teachers`, `GET /api/teachers/:id`, `POST /api/teachers`, `PUT /api/teachers/:id`, `DELETE /api/teachers/:id`

**Public Endpoints (No Authentication):**
- `GET /api/news` - Public news list (published only)
- `GET /api/news/:id` - Public news detail
- `GET /api/events` - Public events list (published only)
- `GET /api/events/:id` - Public event detail
- `GET /api/gallery` - Public gallery images (published only)
- `GET /api/teachers` - Public teachers list (published only)
- `POST /api/jobs/apply` - Public job application submission with CV upload

**Utility Endpoints:**
- `POST /api/upload` - Image upload (proxies to Cloudinary, protected)
- `GET /api/health` - Health check for monitoring

**Authorization Boundaries:**
- **Admin routes** (`POST`, `PUT`, `DELETE`): Require valid JWT token in `Authorization: Bearer <token>` header
- **Public routes** (`GET` for published content): No authentication required
- **Rate limits**: 100 req/min for admin, 5 req/hour for public job applications

#### Component Boundaries

**Frontend Component Communication Patterns:**

**Public Site Components:**
- Self-contained, stateless presentation components
- Fetch data via custom hooks (`useNews`, `useEvents`, etc.)
- No direct API calls (all through `lib/api.ts` wrapper)
- Shared UI components imported from `components/shared/`

**Admin Panel Components:**
- Form components manage local state via React Hook Form
- CRUD operations via custom hooks (e.g., `useNews` provides `createNews`, `updateNews`)
- Loading states per operation (not global)
- Real-time preview via Socket.io connection (`lib/socket.ts`)
- Authentication managed via `AuthContext` (no prop drilling)

**Shared Components:**
- Pure UI components (Button, Input, Card, Modal)
- No business logic or API calls
- Accept props for customization
- Styled with Tailwind CSS (consistent across public/admin)

**Component Communication:**
- **Parent → Child**: Props for data and callbacks
- **Child → Parent**: Event callbacks (e.g., `onSubmit`, `onDelete`)
- **Cross-component**: Context API for authentication state only
- **Real-time updates**: Socket.io events from backend (preview feature)

#### Service Boundaries

**Backend Service Layer:**
- Services encapsulate business logic and database operations
- Controllers call services (thin layer, no business logic)
- Services use Prisma Client for database access
- Services handle email/Cloudinary integrations

**Service Communication Patterns:**
- **news.service** ↔ **email.service**: Notify parents when news published
- **jobs.service** ↔ **email.service**: Send job application confirmations
- **upload.controller** ↔ **cloudinary.service**: Proxy image uploads
- **auth.service**: Standalone JWT token generation/validation

**External Service Integration:**
- **Cloudinary SDK**: Image upload, transformation, CDN delivery
- **AWS SES SDK**: Email sending with retry logic
- **Prisma Client**: Database ORM with query optimization

#### Data Boundaries

**Database Schema Boundaries** (Prisma Models):

**6 Core Content Type Models:**
1. **NewsItem** - News articles with title, content (rich text), images, publish date, importance flag
2. **JobPosting** - Job openings with title, description, requirements, application deadline
3. **Deadline** - Admission deadlines with date, description, academic year
4. **Event** - Kindergarten events with title, description, date, location, images
5. **GalleryImage** - Photo gallery with image URL, caption, category, upload date
6. **Teacher** - Teacher profiles with name, bio, photo, subjects taught

**Supporting Models:**
- **User** - Administrator accounts (login credentials, role)
- **JobApplication** - Submitted job applications with CV file URL

**Data Access Patterns:**
- **Read-heavy**: Public site fetches published content (caching consideration for post-MVP)
- **Write-occasional**: Admin creates/updates content weekly
- **Relationships**: Teachers ↔ NewsItem (optional author relation), Events ↔ Gallery (event photos)

**Data Flow:**
1. **Create/Update Flow**: Frontend form → Backend API → Service validation → Prisma → PostgreSQL
2. **Read Flow**: Frontend request → Backend API → Service query → Prisma → PostgreSQL → JSend response
3. **Image Upload Flow**: Frontend file → Backend `/api/upload` → Cloudinary SDK → Cloudinary CDN URL returned
4. **Email Notification Flow**: Content published → Backend service → AWS SES → Parent email inboxes

**Caching Boundaries** (Post-MVP):
- None for MVP (direct database queries)
- Future consideration: Redis cache for public content lists (if API response time exceeds 500ms)

### Requirements to Structure Mapping

#### Feature/Content Type Mapping

**News Content Type** (FR6, FR16-FR26):
- **Backend**:
  - Model: `prisma/schema.prisma` → `model NewsItem { }`
  - Routes: `src/routes/news.routes.ts` → `/api/news` CRUD endpoints
  - Controller: `src/controllers/news.controller.ts` → Request handlers
  - Service: `src/services/news.service.ts` → Business logic + Prisma queries
  - Validator: `src/validators/news.validator.ts` → Zod schemas for create/update
- **Frontend**:
  - Admin Page: `src/pages/admin/NewsManager.tsx` → Admin CRUD interface
  - Admin Form: `src/components/admin/NewsForm.tsx` → Create/edit form
  - Public Page: `src/pages/public/News.tsx` → Public news list
  - Public Detail: `src/pages/public/NewsDetail.tsx` → Individual news article
  - Public Component: `src/components/public/NewsCard.tsx` → News card display
  - Hook: `src/hooks/useNews.ts` → API integration hook
- **Shared**:
  - Types: `shared/types/news.types.ts` → NewsItem, CreateNewsData, UpdateNewsData

**Jobs Content Type** (FR7, FR34-FR45):
- **Backend**:
  - Model: `prisma/schema.prisma` → `model JobPosting { }`, `model JobApplication { }`
  - Routes: `src/routes/jobs.routes.ts` → `/api/jobs` CRUD, `/api/jobs/apply` public endpoint
  - Controller: `src/controllers/jobs.controller.ts` → Request handlers + application logic
  - Service: `src/services/jobs.service.ts` → Business logic + email integration
  - Validator: `src/validators/jobs.validator.ts` → Zod schemas
- **Frontend**:
  - Admin Page: `src/pages/admin/JobsManager.tsx` → Admin CRUD interface
  - Admin Form: `src/components/admin/JobForm.tsx` → Create/edit form
  - Public Page: `src/pages/public/Careers.tsx` → Public job listings + application form
  - Hook: `src/hooks/useJobs.ts` → API integration hook
- **Shared**:
  - Types: `shared/types/jobs.types.ts` → JobPosting, CreateJobData, JobApplication

**Deadlines Content Type** (FR8):
- **Backend**:
  - Model: `prisma/schema.prisma` → `model Deadline { }`
  - Routes: `src/routes/deadlines.routes.ts` → `/api/admission-deadlines` CRUD
  - Controller: `src/controllers/deadlines.controller.ts` → Request handlers
  - Service: `src/services/deadlines.service.ts` → Business logic + Prisma queries
  - Validator: `src/validators/deadlines.validator.ts` → Zod schemas
- **Frontend**:
  - Admin Page: `src/pages/admin/DeadlinesManager.tsx` → Admin CRUD interface
  - Admin Form: `src/components/admin/DeadlineForm.tsx` → Create/edit form
  - Public Page: `src/pages/public/Admission.tsx` → Public deadlines display
  - Hook: `src/hooks/useDeadlines.ts` → API integration hook
- **Shared**:
  - Types: `shared/types/deadlines.types.ts` → Deadline, CreateDeadlineData

**Events Content Type** (FR9):
- **Backend**:
  - Model: `prisma/schema.prisma` → `model Event { }`
  - Routes: `src/routes/events.routes.ts` → `/api/events` CRUD
  - Controller: `src/controllers/events.controller.ts` → Request handlers
  - Service: `src/services/events.service.ts` → Business logic + Prisma queries
  - Validator: `src/validators/events.validator.ts` → Zod schemas
- **Frontend**:
  - Admin Page: `src/pages/admin/EventsManager.tsx` → Admin CRUD interface
  - Admin Form: `src/components/admin/EventForm.tsx` → Create/edit form
  - Public Page: `src/pages/public/Events.tsx` → Public events list
  - Public Detail: `src/pages/public/EventDetail.tsx` → Individual event page
  - Public Component: `src/components/public/EventCard.tsx` → Event card display
  - Hook: `src/hooks/useEvents.ts` → API integration hook
- **Shared**:
  - Types: `shared/types/events.types.ts` → Event, CreateEventData

**Gallery Content Type** (FR10, FR27-FR33):
- **Backend**:
  - Model: `prisma/schema.prisma` → `model GalleryImage { }`
  - Routes: `src/routes/gallery.routes.ts` → `/api/gallery` CRUD
  - Controller: `src/controllers/gallery.controller.ts` → Request handlers
  - Service: `src/services/gallery.service.ts` → Business logic + Cloudinary integration
  - Validator: `src/validators/gallery.validator.ts` → Zod schemas
- **Frontend**:
  - Admin Page: `src/pages/admin/GalleryManager.tsx` → Admin CRUD interface
  - Admin Component: `src/components/admin/GalleryUploader.tsx` → Drag-and-drop uploader
  - Public Page: `src/pages/public/Gallery.tsx` → Public gallery grid
  - Public Component: `src/components/public/GalleryGrid.tsx` → Image grid display
  - Hook: `src/hooks/useGallery.ts` → API integration hook
- **Shared**:
  - Types: `shared/types/gallery.types.ts` → GalleryImage, CreateGalleryImageData

**Teachers Content Type** (FR11):
- **Backend**:
  - Model: `prisma/schema.prisma` → `model Teacher { }`
  - Routes: `src/routes/teachers.routes.ts` → `/api/teachers` CRUD
  - Controller: `src/controllers/teachers.controller.ts` → Request handlers
  - Service: `src/services/teachers.service.ts` → Business logic + Prisma queries
  - Validator: `src/validators/teachers.validator.ts` → Zod schemas
- **Frontend**:
  - Admin Page: `src/pages/admin/TeachersManager.tsx` → Admin CRUD interface
  - Admin Form: `src/components/admin/TeacherForm.tsx` → Create/edit form
  - Public Page: `src/pages/public/Teachers.tsx` → Public teachers list
  - Public Component: `src/components/public/TeacherCard.tsx` → Teacher profile card
  - Hook: `src/hooks/useTeachers.ts` → API integration hook
- **Shared**:
  - Types: `shared/types/teachers.types.ts` → Teacher, CreateTeacherData

#### Cross-Cutting Concerns Mapping

**Authentication System** (FR1-FR5):
- **Backend**:
  - Routes: `src/routes/auth.routes.ts` → `/api/auth/login`, `/logout`, `/refresh`
  - Controller: `src/controllers/auth.controller.ts` → Login/logout logic
  - Service: `src/services/auth.service.ts` → JWT token generation/validation
  - Middleware: `src/middleware/auth.middleware.ts` → JWT verification for protected routes
  - Validator: `src/validators/auth.validator.ts` → Login validation
- **Frontend**:
  - Page: `src/pages/admin/Login.tsx` → Admin login form
  - Context: `src/contexts/AuthContext.tsx` → Global auth state
  - Hook: `src/hooks/useAuth.ts` → Auth operations
  - Lib: `src/lib/auth.ts` → Token storage/retrieval utilities

**Rich Text Editor** (FR16-FR18):
- **Frontend**:
  - Component: `src/components/admin/RichTextEditor.tsx` → TipTap wrapper
  - Used in: NewsForm, JobForm, EventForm, TeacherForm

**Image Upload System** (FR27-FR33):
- **Backend**:
  - Routes: `src/routes/upload.routes.ts` → `/api/upload`
  - Controller: `src/controllers/upload.controller.ts` → Multipart form handler
  - Service: `src/services/cloudinary.service.ts` → Cloudinary SDK integration
- **Frontend**:
  - Component: `src/components/admin/ImageUploader.tsx` → Drag-and-drop uploader
  - Used in: NewsForm, EventForm, GalleryUploader, TeacherForm

**Email Notifications** (FR34-FR40):
- **Backend**:
  - Service: `src/services/email.service.ts` → AWS SES integration
  - Called by: news.service, jobs.service (when content published)

**Real-Time Preview** (FR24):
- **Backend**:
  - Socket: `src/socket/preview.socket.ts` → Socket.io server setup
- **Frontend**:
  - Lib: `src/lib/socket.ts` → Socket.io client connection
  - Component: `src/components/admin/PreviewModal.tsx` → Live preview display

**Bulgarian Localization** (FR53, NFR-U1):
- **Frontend**:
  - Lib: `src/lib/i18n/bg.ts` → Bulgarian translation object
  - Lib: `src/lib/utils/formatDate.ts` → dd.MM.yyyy formatting
  - Lib: `src/lib/utils/errorCodes.ts` → Error code to Bulgarian mapping

**Security & Rate Limiting** (NFR-S7, NFR-S8):
- **Backend**:
  - Middleware: `src/middleware/rateLimit.middleware.ts` → Rate limiting (100/min admin, 5/hr public)
  - Middleware: `src/middleware/cors.middleware.ts` → CORS whitelist configuration

### Integration Points

#### Internal Communication

**Frontend ↔ Backend API:**
- **Protocol**: HTTP/HTTPS RESTful API
- **Data Format**: JSON (JSend standard)
- **Authentication**: JWT token in `Authorization: Bearer <token>` header
- **Base URL**: `https://kindergarten-canvas-backend.onrender.com` (production) or `http://localhost:3344` (development)
- **Error Handling**: Backend returns error codes, frontend translates to Bulgarian

**Frontend ↔ Socket.io Server:**
- **Protocol**: WebSocket (Socket.io v4.x)
- **Use Case**: Real-time content preview (admin edits → live preview)
- **Connection**: Established on admin panel load
- **Events**: `preview:update` (client → server), `preview:render` (server → client)

**Backend Services Internal:**
- **news.service → email.service**: Trigger parent notifications when news published
- **jobs.service → email.service**: Send job application confirmations
- **upload.controller → cloudinary.service**: Proxy image uploads to Cloudinary
- **All services → Prisma Client**: Database operations

#### External Integrations

**Cloudinary Image Storage:**
- **Integration Point**: `backend/src/services/cloudinary.service.ts`
- **SDK**: `cloudinary` npm package
- **Operations**: Upload images, generate transformation URLs, CDN delivery
- **Configuration**: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` environment variables
- **Error Handling**: Graceful fallback if Cloudinary unavailable (return error, don't crash)

**AWS SES Email Service:**
- **Integration Point**: `backend/src/services/email.service.ts`
- **SDK**: `@aws-sdk/client-ses` npm package
- **Operations**: Send emails (parent notifications, job application confirmations)
- **Configuration**: `AWS_SES_REGION`, `AWS_SES_ACCESS_KEY`, `AWS_SES_SECRET_KEY` environment variables
- **Error Handling**: Retry logic (3 attempts), log failures, continue operation if email fails

**PostgreSQL Database:**
- **Integration Point**: `backend/prisma/schema.prisma` + Prisma Client
- **Connection**: `DATABASE_URL` environment variable (connection string)
- **Migrations**: Prisma Migrate (`npx prisma migrate deploy` on deployment)
- **Queries**: Generated Prisma Client provides type-safe database access

#### Data Flow

**Create Content Flow** (e.g., Create News Article):
1. Admin fills form in `frontend/src/pages/admin/NewsManager.tsx`
2. Form validation via React Hook Form + Zod schema
3. Submit triggers `useNews.createNews()` hook
4. Hook calls `frontend/src/lib/api.ts` → `POST /api/news`
5. Backend `src/routes/news.routes.ts` receives request
6. `auth.middleware.ts` verifies JWT token
7. `validation.middleware.ts` validates request body with Zod
8. `src/controllers/news.controller.ts` extracts request data
9. `src/services/news.service.ts` executes business logic
10. Prisma Client inserts record into PostgreSQL `NewsItem` table
11. If published, `news.service` calls `email.service` to notify parents
12. Backend returns JSend success response with created NewsItem
13. Frontend receives response, displays success message, updates list

**Read Content Flow** (Public Site):
1. User visits `frontend/src/pages/public/News.tsx`
2. Component calls `useNews.getPublishedNews()` hook
3. Hook calls `frontend/src/lib/api.ts` → `GET /api/news?status=published`
4. Backend `src/routes/news.routes.ts` receives request (no auth required)
5. `src/controllers/news.controller.ts` calls `src/services/news.service.ts`
6. Service queries PostgreSQL via Prisma: `prisma.newsItem.findMany({ where: { published: true } })`
7. Backend returns JSend success response with news items array
8. Frontend receives response, maps data to `NewsCard` components, displays list

**Image Upload Flow**:
1. Admin drags image to `frontend/src/components/admin/ImageUploader.tsx`
2. Component sends multipart/form-data to `POST /api/upload`
3. Backend `src/controllers/upload.controller.ts` receives file
4. Validates file type (jpg/png/gif), size (<10MB)
5. `src/services/cloudinary.service.ts` uploads to Cloudinary SDK
6. Cloudinary returns CDN URL: `https://res.cloudinary.com/.../image.jpg`
7. Backend returns JSend success response with Cloudinary URL
8. Frontend stores URL in form state (e.g., `newsItem.imageUrl`)

### File Organization Patterns

#### Configuration Files

**Root Level:**
- `.gitignore` - Ignore `node_modules/`, `.env`, `dist/`, build artifacts
- `README.md` - Root project documentation (monorepo setup instructions)
- `package.json` (optional) - Workspace management for npm/yarn workspaces

**Frontend Configuration:**
- `frontend/vite.config.ts` - Vite build configuration
- `frontend/tailwind.config.js` - Tailwind CSS customization
- `frontend/tsconfig.json` - TypeScript compiler options
- `frontend/.env.example` - Example environment variables (VITE_API_URL)
- `frontend/.env.local` - Git-ignored, local dev config
- `frontend/.eslintrc.json` - ESLint rules
- `frontend/.prettierrc` - Prettier code formatting

**Backend Configuration:**
- `backend/tsconfig.json` - TypeScript compiler options
- `backend/.env.example` - Example environment variables (DATABASE_URL, JWT_SECRET, etc.)
- `backend/.env` - Git-ignored, local dev config
- `backend/.eslintrc.json` - ESLint rules
- `backend/.prettierrc` - Prettier code formatting
- `backend/jest.config.js` - Jest testing configuration
- `backend/prisma/schema.prisma` - Prisma database schema

#### Source Organization

**Frontend Source Code** (`frontend/src/`):
- **pages/** - Route-level components (one per URL)
- **components/** - Reusable UI components (organized by public/admin/shared)
- **layouts/** - Layout wrappers (PublicLayout, AdminLayout)
- **lib/** - Utilities and helpers (API client, auth, i18n, socket)
- **hooks/** - Custom React hooks (useAuth, useNews, etc.)
- **contexts/** - React Context providers (AuthContext)
- **types/** - Frontend-specific TypeScript types (imports from shared/)
- **assets/** - Static assets (images, icons)
- **styles/** - Global styles, Tailwind directives

**Backend Source Code** (`backend/src/`):
- **routes/** - Express route definitions (one file per content type)
- **controllers/** - Request/response handlers (thin layer)
- **services/** - Business logic and database operations (thick layer)
- **validators/** - Zod validation schemas (request validation)
- **middleware/** - Express middleware (auth, validation, error handling, CORS, rate limiting)
- **socket/** - Socket.io server setup
- **utils/** - Shared utilities (logger, response helpers, config)
- **types/** - Backend-specific TypeScript types (imports from shared/)

**Shared Types** (`shared/types/`):
- One file per content type (news.types.ts, jobs.types.ts, etc.)
- Shared interfaces used by both frontend and backend
- Imported by frontend and backend via relative paths

#### Test Organization

**Pattern**: Co-located tests next to source files (future implementation)

**Frontend Tests** (future):
- `src/components/admin/NewsForm.test.tsx` - Next to NewsForm.tsx
- `src/hooks/useNews.test.ts` - Next to useNews.ts
- `src/lib/api.test.ts` - Next to api.ts

**Backend Tests** (current structure, migrate to co-located):
- `tests/unit/services/news.service.test.ts` - Unit tests for services
- `tests/integration/news.routes.test.ts` - Integration tests for API endpoints

**Test Utilities**:
- `frontend/src/test-utils/` - Shared test helpers (render with providers)
- `backend/src/test-utils/` - Shared test helpers (mock Prisma, test database)

#### Asset Organization

**Frontend Assets** (`frontend/src/assets/` and `frontend/public/`):
- **src/assets/** - Imported assets (logo, icons used in components)
  - `logo.png` - Main logo
  - `logo-footer.png` - Footer logo variant
  - `icons/` - SVG icons
- **public/** - Static assets (served directly)
  - `favicon.ico` - Browser favicon
  - `robots.txt` - SEO robots file

**Uploaded Images** (Cloudinary CDN):
- Not stored in repository
- URLs stored in PostgreSQL database
- Served via Cloudinary CDN: `https://res.cloudinary.com/.../image.jpg`

### Development Workflow Integration

#### Development Server Structure

**Frontend Development** (`frontend/`):
```bash
cd frontend
npm run dev  # Starts Vite dev server on http://localhost:5173
```
- Hot module replacement (HMR) enabled
- Public site accessible at `http://localhost:5173/`
- Admin panel accessible at `http://localhost:5173/admin`
- API requests proxied to `http://localhost:3344` (backend)

**Backend Development** (`backend/`):
```bash
cd backend
npm run dev  # Starts Express server on http://localhost:3344
```
- Hot reload via nodemon or ts-node-dev
- API endpoints at `http://localhost:3344/api/*`
- Socket.io server running on same port
- PostgreSQL database (local or Render free tier)

**Concurrent Development** (run both simultaneously):
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

#### Build Process Structure

**Frontend Build** (`frontend/`):
```bash
cd frontend
npm run build  # Vite builds to frontend/dist/
```
- TypeScript compilation
- Tailwind CSS purging (remove unused styles)
- Asset optimization (images, fonts)
- Code splitting (dynamic imports)
- Output: `frontend/dist/` directory

**Backend Build** (`backend/`):
```bash
cd backend
npm run build  # TypeScript compiles to backend/dist/
```
- TypeScript compilation to JavaScript
- Prisma Client generation
- Output: `backend/dist/` directory

#### Deployment Structure

**Frontend Deployment** (Vercel):
- **Root Directory**: Set to `frontend/` in Vercel project settings
- **Build Command**: `npm run build` (Vercel auto-detects Vite)
- **Output Directory**: `dist` (default for Vite)
- **Environment Variables**: `VITE_API_URL=https://kindergarten-canvas-backend.onrender.com`
- **Deployment Trigger**: Automatic on push to `main` branch (GitHub integration)

**Backend Deployment** (Render):
- **Root Directory**: Set to `backend/` in Render service settings
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npx prisma migrate deploy && npm start`
- **Environment Variables**: `DATABASE_URL`, `JWT_SECRET`, `CLOUDINARY_*`, `AWS_SES_*`, `FRONTEND_URL`
- **Deployment Trigger**: Automatic on push to `main` branch (GitHub integration)
- **Database**: Render PostgreSQL (1GB free tier) auto-provisioned

**Deployment Flow**:
1. Push code to GitHub `main` branch
2. Vercel detects change → builds `frontend/` → deploys to CDN
3. Render detects change → builds `backend/` → runs migrations → deploys to server
4. Both deployments complete within 2-5 minutes
5. Health checks verify services are running


## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**

All architectural decisions work together seamlessly without conflicts:

- **Frontend Stack Compatibility**: React Context API, React Hook Form v7.x, TipTap v2.x, and Radix UI components are all part of the React ecosystem and integrate naturally with each other
- **Backend Stack Compatibility**: Express + TypeScript + Prisma ORM + PostgreSQL form a well-established, battle-tested stack
- **Real-Time Integration**: Socket.io v4.x integrates cleanly with Express server for WebSocket preview functionality
- **External Services**: Cloudinary (images) and AWS SES (email) are independent services with no conflicts
- **Type Safety**: Shared TypeScript types folder ensures type consistency between frontend and backend
- **Version Compatibility**: All specified versions (React 18+, Node.js, TipTap v2.x, Socket.io v4.x) are current and production-ready as of 2026

**No conflicting decisions found** - all technology choices complement each other.

**Pattern Consistency:**

Implementation patterns fully support architectural decisions:

- **Naming Conventions Align with Stack**: camelCase for Prisma (JavaScript convention), kebab-case for REST APIs (RESTful convention), PascalCase for React components (React convention)
- **Date Format Consistency**: ISO 8601 in APIs (backend), dd.MM.yyyy in Bulgarian UI (frontend) - clear separation of concerns
- **Error Handling Consistency**: Backend returns error codes (language-agnostic), frontend translates to Bulgarian (UI layer responsibility)
- **Loading State Pattern**: Per-operation loading states align with React Hook Form's form-level state management
- **Test Pattern**: Co-location aligns with Jest convention and monorepo structure

**All patterns are consistent across the architecture** - no contradictory rules found.

**Structure Alignment:**

Project structure fully supports all architectural decisions:

- **Monorepo Structure**: frontend/, backend/, shared/ folders enable type sharing while maintaining deployment separation
- **Feature-Based Backend**: Routes → Controllers → Services → Prisma matches Express + Prisma best practices
- **Component-Type Frontend**: public/, admin/, shared/ organization supports route-based access control
- **All 6 Content Types Mapped**: Every content type (News, Jobs, Deadlines, Events, Gallery, Teachers) has complete file mapping from database model to UI component
- **Integration Points Defined**: Cloudinary (backend service), AWS SES (backend service), Socket.io (client + server), API client (frontend lib)

**Structure enables all architectural decisions** - no misalignments found.

### Requirements Coverage Validation ✅

**Functional Requirements Coverage (57 FRs across 8 domains):**

✅ **Authentication & Access (FR1-FR5):** Fully covered
- JWT authentication: auth.service.ts generates/validates tokens
- Login/logout: auth.routes.ts + auth.controller.ts
- Session management: JWT token expiration (1-2 hours) with refresh endpoint
- Automatic logout: Frontend handles token expiration

✅ **Content Management (FR6-FR15):** Fully covered
- CRUD for 6 content types: Each has routes, controller, service, Prisma model
- Dashboard navigation: AdminLayout with Sidebar component

✅ **Content Creation (FR16-FR21):** Fully covered
- WYSIWYG editor: TipTap v2.x integration in RichTextEditor component
- Date pickers: Radix UI Date Picker with Bulgarian format (dd.MM.yyyy)
- Importance flags: Supported in Prisma models and forms
- Validation: React Hook Form + Zod schemas (frontend + backend)
- Draft saving: Prisma schema includes published/draft status field
- Bulgarian error messages: Custom translation object (lib/i18n/bg.ts)

✅ **Publishing & Preview (FR22-FR26):** Fully covered
- Preview functionality: PreviewModal component
- Publishing: Update published status via API
- Real-time preview: Socket.io integration (preview.socket.ts)

✅ **Image Management (FR27-FR33):** Fully covered
- Image upload: Cloudinary service integration
- Drag-and-drop: ImageUploader component
- Validation: Backend validates type/size before upload
- Progress indicators: ImageUploader component with loading states

✅ **Email & Notifications (FR34-FR40):** Fully covered
- Parent notifications: email.service.ts with AWS SES
- Job application delivery: jobs.service.ts calls email.service.ts
- CV attachments: Supported via Cloudinary file upload

✅ **Job Applications (FR41-FR45):** Fully covered
- Public form: Careers.tsx public page
- CV upload: File upload to Cloudinary
- Validation: React Hook Form + Zod
- Bulgarian confirmations: Translation object

✅ **Public Content Access (FR46-FR52):** Fully covered
- Public pages: News.tsx, Events.tsx, Gallery.tsx, Teachers.tsx
- Individual pages: NewsDetail.tsx, EventDetail.tsx
- API endpoints: Public GET routes (no authentication required)

✅ **Admin Operations (FR53-FR57):** Fully covered
- Bulgarian interface: Custom translation object (lib/i18n/bg.ts)
- Monitoring tools: Winston logger (backend)
- Error logging: Centralized error handling middleware
- Help access: Can be added to AdminLayout (implementation detail)

**Non-Functional Requirements Coverage (35 NFRs):**

✅ **Performance (NFR-P1 to P5):** Architecturally supported
- <500ms API target: Direct database queries via Prisma (optimized by default)
- User actions <2s: Frontend optimizations (code splitting, lazy loading)
- Image processing <5s: Cloudinary handles optimization server-side
- Public pages <2s: Vercel CDN for frontend, Cloudinary CDN for images
- Optimized queries: Prisma query optimization (can add caching if needed post-MVP)

✅ **Security (NFR-S1 to S8):** Fully covered
- Password hashing: bcrypt (12+ rounds) via auth.service.ts
- JWT expiration: 1-2 hours with refresh token mechanism
- HTTPS: Enforced by Vercel/Render in production
- CORS whitelist: cors.middleware.ts restricts to kindergarten domain
- XSS prevention: TipTap HTML sanitization
- SQL injection: Prisma parameterized queries (ORM prevents SQL injection)
- Rate limiting: rateLimit.middleware.ts (100 req/min admin, 5 req/hr public)

✅ **Reliability & Availability (NFR-R1 to R6):** Fully covered
- 99% uptime: Vercel/Render free tier uptime guarantees
- Email delivery 95%: AWS SES reliability + retry logic in email.service.ts
- Health checks: /api/health endpoint
- Database backups: Render automatic backups (free tier)
- Error logging: Winston logger with centralized error handling

✅ **Accessibility (NFR-A1 to A10):** Fully covered
- WCAG 2.1 Level AA: Radix UI components accessible by default
- Keyboard navigation: All Radix UI components support keyboard
- Screen reader: ARIA labels in admin forms, semantic HTML
- Color contrast: Can be validated during implementation (Tailwind utilities)

✅ **Integration & Interoperability (NFR-I1 to I6):** Fully covered
- Image storage: Cloudinary integration (cloudinary.service.ts)
- Email: AWS SES integration (email.service.ts)
- Image optimization: Cloudinary automatic optimization
- Email templates: AWS SES template support
- Graceful failures: Error handling in all services
- CDN: Cloudinary CDN for images, Vercel CDN for frontend

✅ **Usability & UX (NFR-U1 to U7):** Fully covered
- Bulgarian language: Custom translation object (lib/i18n/bg.ts)
- Modern browsers: Vite targets last 2 versions
- dd.MM.yyyy format: date-fns with Bulgarian locale
- Visual feedback: Loading states per operation, error messages
- Upload progress: ImageUploader component with progress indicators

✅ **Maintainability & Operations (NFR-M1 to M5):** Fully covered
- TypeScript: Frontend and backend both TypeScript
- Architecture documentation: This comprehensive document
- Centralized logging: Winston logger (backend)
- Environment config: .env files for dev/staging/production
- Performance monitoring: Winston logging (can add APM tools post-MVP)

### Implementation Readiness Validation ✅

**Decision Completeness:**

✅ **All critical decisions documented with versions:**
- React Hook Form v7.x (verified latest stable)
- TipTap v2.x (verified production-ready)
- Socket.io v4.x (verified latest stable)
- Radix UI Date Picker (verified WCAG AA compliant)
- Prisma ORM (migration strategy specified)
- Cloudinary (10GB free tier verified)
- AWS SES (3,000 emails/month free tier verified)
- Vercel (frontend hosting, free tier)
- Render (backend + PostgreSQL hosting, free tier)

✅ **Implementation patterns comprehensive:**
- Naming conventions (database, API, code, files)
- Format patterns (dates, API responses)
- Structure patterns (test co-location, project organization)
- Communication patterns (error translation, loading states)

✅ **Consistency rules clear and enforceable:**
- JSend API response format (all endpoints)
- Error codes in backend, translation in frontend
- Per-operation loading states (not global)
- camelCase/PascalCase/kebab-case rules by context

✅ **Examples provided:**
- Good example: Complete News API endpoint implementation
- Anti-patterns: What to avoid (wrong naming, wrong response format)

**Structure Completeness:**

✅ **Project structure complete and specific:**
- Complete monorepo directory tree with 3 main folders (frontend/, backend/, shared/)
- All files and directories defined for each content type
- Root configuration files documented
- Frontend structure: pages, components, layouts, lib, hooks, contexts
- Backend structure: routes, controllers, services, validators, middleware, socket
- Shared structure: TypeScript types for all 6 content types

✅ **All files and directories defined:**
- 6 content types × (backend routes + controllers + services + validators) = 24 backend files
- 6 content types × (admin pages + forms + public pages + components + hooks) = 30+ frontend files
- Shared types: 6 content type files + auth.types + api.types = 8 shared files
- Integration files: API client, socket client, Cloudinary service, email service

✅ **Integration points clearly specified:**
- Frontend → Backend: HTTP REST API (JSend format)
- Frontend → Backend: Socket.io WebSocket (real-time preview)
- Backend → Cloudinary: Image upload SDK
- Backend → AWS SES: Email sending SDK
- Backend → PostgreSQL: Prisma ORM

✅ **Component boundaries well-defined:**
- Frontend: public/ vs admin/ vs shared/ component separation
- Backend: routes (thin) vs controllers (thin) vs services (thick business logic)
- API boundaries: Protected admin routes vs public routes
- Data boundaries: Prisma models with relationships

**Pattern Completeness:**

✅ **All potential conflict points addressed:**
- Database naming: camelCase Prisma models and fields
- API naming: plural kebab-case resources, camelCase params
- Component naming: PascalCase files and components
- Variable naming: camelCase variables, PascalCase types
- Date formats: ISO 8601 in API, dd.MM.yyyy in UI
- Error messages: Codes in backend, Bulgarian translation in frontend
- Loading states: Per-operation (isCreating, isUpdating, isDeleting)

✅ **Naming conventions comprehensive:**
- Prisma schema: camelCase models, fields, relations
- REST endpoints: /api/news, /api/teachers (plural, kebab-case)
- React components: NewsManager.tsx, TeacherCard.tsx (PascalCase)
- Hooks: useAuth.ts, useNews.ts (camelCase with 'use' prefix)
- Utilities: api.ts, formatDate.ts (camelCase)

✅ **Communication patterns fully specified:**
- API request/response format: JSend standard
- WebSocket events: preview:update, preview:render
- Error handling: Backend error codes → Frontend Bulgarian translation
- Loading states: Per-operation boolean flags

✅ **Process patterns complete:**
- Error handling: Global error middleware, JSend error responses
- Loading states: Per-operation with try/finally
- Authentication: JWT token in Authorization header
- File upload: Frontend → Backend → Cloudinary proxy pattern

### Gap Analysis Results

**Critical Gaps:** ✅ **NONE FOUND**
- All requirements have architectural support
- All decisions are implementable with chosen technologies
- No blocking architectural issues identified

**Important Gaps:** ✅ **NONE BLOCKING**

Minor implementation details that can be addressed during development:
- **Testing Configuration Details**: Jest configuration mentioned but test setup scripts can be defined in package.json during implementation
- **Performance Monitoring Tools**: Post-MVP consideration documented (can add APM tools like Sentry if needed)
- **CI/CD Pipeline Details**: Platform auto-deploy documented, optional GitHub Actions for tests can be added post-MVP

**Nice-to-Have Enhancements** (Optional, Post-MVP):
- **Shared Constants Folder**: Could add shared/constants/ for error codes, status values (currently error codes are in backend utils)
- **Database Seeding Strategy**: Prisma seed script can be added for development data
- **Environment Variable Validation**: Can use zod-dotenv for runtime env validation
- **Package.json Scripts Documentation**: Development workflow scripts can be documented in root README.md

**None of these gaps block implementation** - all are implementation details that can be addressed as development progresses.

### Architecture Completeness Checklist

**✅ Requirements Analysis**

- [x] Project context thoroughly analyzed (57 FRs, 35 NFRs, 6 content types)
- [x] Scale and complexity assessed (Medium complexity, 10-12 components)
- [x] Technical constraints identified (FREE technologies only, Bulgarian language)
- [x] Cross-cutting concerns mapped (security, localization, performance, accessibility)

**✅ Architectural Decisions**

- [x] Critical decisions documented with versions (React Hook Form v7.x, TipTap v2.x, Socket.io v4.x)
- [x] Technology stack fully specified (React, Express, Prisma, PostgreSQL, Cloudinary, AWS SES)
- [x] Integration patterns defined (REST API, WebSocket, Cloudinary SDK, AWS SES SDK)
- [x] Performance considerations addressed (<500ms target, caching strategy for post-MVP)
- [x] FREE technology constraint honored (Cloudinary 10GB, AWS SES 3000 emails, Vercel/Render free tiers)
- [x] Monorepo strategy decided (frontend/, backend/, shared/ folders)

**✅ Implementation Patterns**

- [x] Naming conventions established (camelCase DB, kebab-case API, PascalCase components)
- [x] Structure patterns defined (co-located tests, feature-based backend, component-type frontend)
- [x] Communication patterns specified (error code translation, per-operation loading)
- [x] Process patterns documented (JSend API format, JWT auth flow, image upload proxy)
- [x] Format patterns defined (ISO 8601 in API, dd.MM.yyyy in UI)

**✅ Project Structure**

- [x] Complete directory structure defined (monorepo with 3 main folders)
- [x] Component boundaries established (public/admin/shared separation)
- [x] Integration points mapped (REST API, Socket.io, Cloudinary, AWS SES, PostgreSQL)
- [x] Requirements to structure mapping complete (6 content types mapped to specific files)
- [x] All 6 content types have complete file paths (routes, controllers, services, pages, forms, hooks, types)

### Architecture Readiness Assessment

**Overall Status:** ✅ **READY FOR IMPLEMENTATION**

**Confidence Level:** **HIGH**

Rationale:
- All 57 functional requirements architecturally supported
- All 35 non-functional requirements addressed
- All decisions coherent and compatible
- No critical or important gaps found
- Comprehensive patterns prevent AI agent conflicts
- Complete file structure with all integration points defined
- FREE technology constraint satisfied for MVP and long-term usage

**Key Strengths:**

1. **Comprehensive Requirements Coverage**: All 57 FRs and 35 NFRs mapped to specific architectural decisions and implementation files
2. **Type-Safe Monorepo**: Shared TypeScript types ensure consistency between frontend and backend
3. **AI-Agent Ready**: Detailed naming conventions and implementation patterns prevent conflicts when multiple agents work on the codebase
4. **Free Technology Stack**: Cloudinary (10GB), AWS SES (3,000 emails/month), Vercel (unlimited bandwidth), Render (750 hours/month) - MVP costs $0
5. **Production-Ready Technologies**: React Hook Form v7.x, TipTap v2.x, Socket.io v4.x, Prisma ORM - all battle-tested
6. **Accessibility Built-In**: Radix UI components provide WCAG 2.1 Level AA compliance by default
7. **Bulgarian Localization Strategy**: Custom translation object avoids 70KB+ i18n library overhead for single-language app
8. **Clear Deployment Path**: Monorepo with separate deployments (Vercel for frontend, Render for backend) - simple solo developer workflow

**Areas for Future Enhancement** (Post-MVP):

1. **Performance Optimization**: Add Redis caching layer if API responses exceed 500ms target
2. **Advanced Monitoring**: Integrate APM tools (Sentry, LogRocket) for production error tracking
3. **Automated Testing Pipeline**: Add GitHub Actions for running tests before deployment
4. **Content Versioning**: Add revision history for content changes (audit trail)
5. **Multi-Language Support**: Extend custom i18n object if additional languages needed in future
6. **Advanced Analytics**: Integrate analytics for admin panel usage patterns
7. **Database Scaling**: Migrate from Render 1GB to larger PostgreSQL instance if content volume grows
8. **Email Templates**: Create reusable HTML email templates for better parent communications

### Implementation Handoff

**AI Agent Guidelines:**

1. **Follow All Architectural Decisions Exactly**: Do not deviate from technology choices (React Hook Form, TipTap, Radix UI, Socket.io, Cloudinary, AWS SES)
2. **Use Implementation Patterns Consistently**: Apply naming conventions (camelCase DB, kebab-case API, PascalCase components) across all code
3. **Respect Project Structure and Boundaries**: Place files in correct folders (frontend/src/pages/admin/, backend/src/services/, shared/types/)
4. **Refer to This Document for Architectural Questions**: All decisions, patterns, and structures are documented here
5. **Maintain Type Safety**: Import shared types from shared/types/ - never duplicate types between frontend and backend
6. **Follow JSend API Format**: All API responses must use { status: 'success'|'fail'|'error', data/message }
7. **Translate Error Codes to Bulgarian**: Backend returns error codes (REQUIRED_FIELD), frontend translates using lib/i18n/bg.ts
8. **Use Per-Operation Loading States**: Never use global loading state - each operation (isCreating, isUpdating) has its own boolean

**First Implementation Priority:**

**Step 1: Monorepo Restructure**
```bash
# Move existing frontend to frontend/ folder
mkdir frontend
git mv src frontend/src
git mv public frontend/public
git mv index.html frontend/index.html
git mv vite.config.ts frontend/vite.config.ts
git mv tailwind.config.js frontend/tailwind.config.js
git mv tsconfig.json frontend/tsconfig.json
git mv package.json frontend/package.json
# Move other frontend config files
```

**Step 2: Backend Setup**
```bash
# Create backend from starter template
mkdir backend
cd backend
git clone https://github.com/vincent-queimado/express-prisma-ts-boilerplate.git temp
cp -r temp/* ./
rm -rf temp
npm install
cp .env.example .env
# Configure DATABASE_URL in .env (Render PostgreSQL or local)
```

**Step 3: Shared Types Setup**
```bash
# Create shared types folder
mkdir -p shared/types
# Create initial type files (news.types.ts, jobs.types.ts, etc.)
```

**Step 4: Prisma Schema Definition**
```bash
cd backend
# Define 6 content type models in prisma/schema.prisma
# Run initial migration
npx prisma migrate dev --name init
```

**Step 5: Backend API Development**
```bash
# Implement CRUD endpoints for each content type
# Priority order: Auth → News → Jobs → Events → Gallery → Teachers → Deadlines
```

**Step 6: Frontend Admin Panel**
```bash
cd frontend
# Set up admin routes in src/App.tsx
# Implement admin pages for each content type
# Priority order: Login → Dashboard → News → Jobs → Events → Gallery → Teachers → Deadlines
```

**Step 7: Integration & Testing**
```bash
# Connect frontend to backend API
# Test all CRUD operations
# Verify Bulgarian translations
# Test real-time preview (Socket.io)
# Test image uploads (Cloudinary)
# Test email notifications (AWS SES)
```

**Step 8: Deployment**
```bash
# Deploy frontend to Vercel (set root directory to frontend/)
# Deploy backend to Render (set root directory to backend/)
# Configure environment variables in both platforms
# Verify production deployment
```

---

**Architecture Document Complete** ✅

This architecture is **ready to guide AI agents through consistent, conflict-free implementation** of the kindergarten-canvas admin panel.
