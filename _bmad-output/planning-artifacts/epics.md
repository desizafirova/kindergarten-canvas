---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
---

# kindergarten-canvas - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for kindergarten-canvas, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

**Authentication & Access Management**
- FR1: Administrator can log into the admin panel using username and password credentials
- FR2: System can authenticate administrator credentials and grant or deny access
- FR3: Administrator can maintain an authenticated session throughout their work
- FR4: System can automatically log out administrator after session expiration
- FR5: Developer can log into the admin panel with developer-level credentials for testing and troubleshooting

**Content Management - Core Operations**
- FR6: Administrator can create new content entries for News/Announcements
- FR7: Administrator can create new content entries for Job Postings
- FR8: Administrator can create new content entries for Admission Deadlines
- FR9: Administrator can create new content entries for Events
- FR10: Administrator can create new content entries for Photo Gallery
- FR11: Administrator can create new content entries for Teacher/Staff Profiles
- FR12: Administrator can edit existing content for any content type
- FR13: Administrator can delete existing content for any content type
- FR14: Administrator can view a list of all existing content for each content type
- FR15: Administrator can navigate between different content sections (News, Jobs, Deadlines, Events, Gallery, Teachers) from a central dashboard

**Content Creation & Editing Features**
- FR16: Administrator can compose rich text content using a visual editor (bold, italic, lists, links, formatting)
- FR17: Administrator can select dates using a date picker for deadlines and events
- FR18: Administrator can mark content as important or urgent (for deadlines and announcements)
- FR19: System can validate that required fields are filled before allowing publication
- FR20: System can display validation error messages in Bulgarian when required fields are missing
- FR21: Administrator can save draft content and return to edit it later before publishing

**Publishing & Preview**
- FR22: Administrator can preview how content will appear on the public website before publishing
- FR23: Administrator can publish new content to make it immediately visible on the public website
- FR24: Administrator can update published content and have changes immediately reflected on public website
- FR25: System can display success confirmation messages in Bulgarian after successful publish/update operations
- FR26: Administrator can see real-time preview of content changes as they edit

**Image & Media Management**
- FR27: Administrator can upload images for photo gallery entries
- FR28: Administrator can upload images for news/announcement entries
- FR29: Administrator can upload profile photos for teacher/staff entries
- FR30: Administrator can upload images using drag-and-drop interface
- FR31: System can store uploaded images and make them accessible to the public website
- FR32: System can validate image file types and sizes before accepting uploads
- FR33: System can display upload progress and completion status to administrator

**Email & Notifications**
- FR34: System can automatically send email notifications to subscribed parents when new news/announcements are published
- FR35: System can automatically send email notifications to subscribed parents when new admission deadlines are published
- FR36: System can automatically send email notifications to subscribed parents when new events are published
- FR37: Email notifications can include content summary and direct link to the website
- FR38: System can deliver job application submissions to administrator via email
- FR39: System can send confirmation email to job applicants after successful submission
- FR40: System can include applicant CV attachment in email to administrator

**Job Application Processing**
- FR41: Job applicants can view active job postings on the public website
- FR42: Job applicants can submit application through a form including name, email, phone, cover letter
- FR43: Job applicants can upload their CV (PDF format) as part of application
- FR44: System can display success confirmation message in Bulgarian to applicant after submission
- FR45: System can validate job application form fields before allowing submission

**Public Content Access**
- FR46: Public website visitors can view all published news/announcements
- FR47: Public website visitors can view all published job postings
- FR48: Public website visitors can view all published admission deadlines
- FR49: Public website visitors can view all published events
- FR50: Public website visitors can view photo gallery with all uploaded images
- FR51: Public website visitors can view teacher/staff profiles with photos and information
- FR52: Public website visitors can access individual content pages for detailed information

**Administrative Operations**
- FR53: Administrator can view the admin interface in Bulgarian language (all labels, buttons, messages)
- FR54: Developer can monitor system performance through logging and debugging tools
- FR55: Developer can access environment configuration for troubleshooting third-party service integrations
- FR56: System can log errors for developer review and troubleshooting
- FR57: Administrator can access help or guidance within the admin panel when needed

### Non-Functional Requirements

**Performance**
- NFR-P1: API response time must be less than 500ms for all endpoints under normal load
- NFR-P2: Admin panel must complete user actions (create, edit, publish) within 2 seconds from user interaction to success confirmation
- NFR-P3: Image upload processing must complete within 5 seconds for files up to 10MB
- NFR-P4: Public website content pages must load within 2 seconds on mobile devices over 4G connection
- NFR-P5: Database queries must be optimized to support sub-500ms API response times

**Security**
- NFR-S1: All administrator passwords must be hashed using bcrypt with minimum 12 salt rounds before storage
- NFR-S2: JWT tokens must expire within 1-2 hours and support secure token refresh mechanism
- NFR-S3: All production traffic must use HTTPS-only connections
- NFR-S4: CORS configuration must whitelist only the kindergarten domain to prevent unauthorized access
- NFR-S5: All user-generated content (news, job descriptions) must be sanitized to prevent XSS attacks
- NFR-S6: SQL injection must be prevented through Prisma parameterized queries
- NFR-S7: Admin endpoints must implement rate limiting (100 requests per minute per IP)
- NFR-S8: Public job application endpoint must implement rate limiting (5 submissions per hour per IP) to prevent spam

**Reliability & Availability**
- NFR-R1: System uptime must be 99% or higher (excluding planned maintenance)
- NFR-R2: Email delivery success rate must be 95% or higher for all notification and application emails
- NFR-R3: System must implement email retry logic for failed delivery attempts
- NFR-R4: System must provide health check endpoint for uptime monitoring
- NFR-R5: Database must have automated backup configured at deployment
- NFR-R6: System must log all critical errors for developer troubleshooting

**Accessibility (WCAG 2.1 Level AA)**
- NFR-A1: All interactive elements in admin panel must be accessible via keyboard navigation
- NFR-A2: Admin panel must maintain logical tab order throughout all sections
- NFR-A3: All focusable elements must have visible focus indicators
- NFR-A4: Text contrast ratio must be minimum 4.5:1 for normal text and 3:1 for large text (18pt+)
- NFR-A5: Admin panel must use semantic HTML elements and proper heading hierarchy (h1 → h2 → h3)
- NFR-A6: Complex interactions (drag-and-drop, WYSIWYG) must include appropriate ARIA labels
- NFR-A7: Form labels must be properly associated with inputs
- NFR-A8: System must provide status announcements for asynchronous operations (save success, errors) for screen readers
- NFR-A9: All images must have alternative text
- NFR-A10: Admin panel must be tested with NVDA screen reader (Bulgarian language pack)

**Integration & Interoperability**
- NFR-I1: System must successfully integrate with either Cloudinary or AWS S3 for image storage
- NFR-I2: System must successfully integrate with either SendGrid or AWS SES for email delivery
- NFR-I3: Image storage integration must support automatic image optimization (resizing, format conversion)
- NFR-I4: Email service integration must support email templates for parent notifications, job applications, and confirmations
- NFR-I5: All third-party service failures must be handled gracefully with user-friendly error messages
- NFR-I6: System must implement CDN for fast image delivery to public website

**Usability & User Experience**
- NFR-U1: All admin panel interface text, labels, buttons, and error messages must be in Bulgarian language
- NFR-U2: Admin panel must be mobile-responsive for tablet use
- NFR-U3: Admin panel must support modern browsers only (Chrome, Firefox, Safari, Edge - last 2 versions)
- NFR-U4: Date/time formatting must follow Bulgarian conventions (dd.MM.yyyy)
- NFR-U5: Admin panel must provide clear visual feedback for every user action
- NFR-U6: Error messages must be user-friendly and avoid technical jargon
- NFR-U7: System must display upload progress and completion status for image uploads

**Maintainability & Operations**
- NFR-M1: Codebase must be documented with architectural notes for future maintenance
- NFR-M2: System must provide centralized error logging for troubleshooting
- NFR-M3: System must support environment-based configuration (dev, staging, production)
- NFR-M4: System must provide performance monitoring for API response times
- NFR-M5: Developer must have access to troubleshooting tools via admin credentials

### Additional Requirements

**From Architecture - Starter Templates & Setup**
- Backend: Use express-prisma-ts-boilerplate starter template (Express + TypeScript + Prisma + JWT + bcrypt + Zod + Winston + Swagger)
- Frontend: Existing Vite + React + TypeScript + Tailwind + shadcn-ui setup with TailAdmin component integration
- Monorepo structure: frontend/, backend/, shared/ folders in single repository
- Shared TypeScript types between frontend and backend via shared/ folder

**From Architecture - Technology Decisions**
- State Management: React Context API for auth state, component-level state for forms
- Form Handling: React Hook Form with Zod validation
- WYSIWYG Editor: TipTap (headless Prosemirror) with Bulgarian toolbar labels
- Date Picker: Radix UI Date Picker via shadcn-ui with date-fns Bulgarian locale
- WebSocket: Socket.io for real-time preview functionality
- File Upload: Backend proxy pattern (frontend → backend → Cloudinary)
- Database Migration: Prisma Migrate with version-controlled migrations
- Bulgarian i18n: Custom translation object (no i18n library needed)

**From Architecture - Hosting & Deployment**
- Frontend Hosting: Vercel (FREE tier) - deploy frontend/ folder
- Backend Hosting: Render (FREE tier) - deploy backend/ folder with included PostgreSQL
- Image Storage: Cloudinary (10GB free tier)
- Email Service: AWS SES (3,000 emails/month free for 12 months)
- CI/CD: Platform built-in auto-deploy on git push (Vercel + Render)

**From Architecture - Naming Conventions**
- Prisma models: PascalCase singular (NewsItem, Teacher)
- Prisma fields: camelCase (createdAt, teacherId)
- API endpoints: Plural kebab-case (/api/news, /api/admission-deadlines)
- Query parameters: camelCase (?includeInactive=true)
- React components: PascalCase files (NewsManager.tsx)
- Hooks: camelCase starting with use (useAuth.ts)
- Utilities: camelCase (api.ts, formatDate.ts)

**From UX Design - Core Experience Patterns**
- News-First Optimization: 3-click maximum from dashboard to published news
- Auto-save: Every 10 seconds with "Saved"/"Saving..." indicator
- Real-time preview: Preview updates as user types
- Draft/Published distinction: Amber badge for Draft, Green badge for Published
- Single-screen forms: All fields visible at once (no multi-step wizards)
- Delete confirmation: Modal dialog with item title, Bulgarian warning, Cancel (default) + Delete (red)

**From UX Design - Component Requirements**
- ContentTypeCard: Dashboard cards for 6 content types with icon, title, draft/published counts, Create button
- ItemListRow: List item with title, StatusBadge, date, Edit button, Delete button
- StatusBadge: Pill-shaped badges - Draft (amber #F59E0B), Published (green #22C55E)
- AutoSaveIndicator: Small text indicator - "Запазва..." (Saving) / "Запазван" (Saved)
- ContentFormShell: Single-screen layout with breadcrumb, auto-save indicator, sticky action bar
- PreviewModal: Full-page preview showing exact public site appearance
- DeleteConfirmDialog: Confirmation modal for destructive actions
- ResponsiveSidebar: Desktop (240px full), Tablet (48px icon-only), Mobile (slide-out drawer)
- ImageUploadZone: Drag-and-drop with thumbnails, progress, remove button

**From UX Design - Responsive Breakpoints**
- Mobile (default): <768px - Single column, drawer sidebar, sticky action bar
- Tablet: 768px-1023px - Icon sidebar, 2-col card grid, touch-optimized
- Desktop: ≥1024px - Full sidebar (240px), 2-col grid, max-width 960px content

**From UX Design - Color System**
- Primary: #3B82F6 (blue) - main actions, buttons, links
- Published/Success: #22C55E (green) - published badges, success messages
- Draft/Warning: #F59E0B (amber) - draft badges, pending states
- Error/Destructive: #EF4444 (red) - error messages, delete actions
- Background: #FFFFFF (light) / #0F172A (dark)
- Text Primary: #1E293B (light) / #F1F5F9 (dark)

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 1 | Admin login with credentials |
| FR2 | Epic 1 | System authenticates credentials |
| FR3 | Epic 1 | Maintain authenticated session |
| FR4 | Epic 1 | Auto logout on session expiration |
| FR5 | Epic 1 | Developer login access |
| FR6 | Epic 3 | Create News entries |
| FR7 | Epic 6 | Create Job Postings |
| FR8 | Epic 5 | Create Deadlines |
| FR9 | Epic 5 | Create Events |
| FR10 | Epic 7 | Create Gallery entries |
| FR11 | Epic 4 | Create Teacher profiles |
| FR12 | Epic 3* | Edit existing content |
| FR13 | Epic 3* | Delete existing content |
| FR14 | Epic 3* | View content list |
| FR15 | Epic 2 | Dashboard navigation |
| FR16 | Epic 3 | WYSIWYG rich text editor |
| FR17 | Epic 5 | Date picker for deadlines/events |
| FR18 | Epic 5 | Mark as important/urgent |
| FR19 | Epic 3 | Required field validation |
| FR20 | Epic 3 | Bulgarian validation messages |
| FR21 | Epic 3 | Save draft functionality |
| FR22 | Epic 3 | Preview before publish |
| FR23 | Epic 3 | Publish to public site |
| FR24 | Epic 3 | Update published content |
| FR25 | Epic 3 | Bulgarian success messages |
| FR26 | Epic 3 | Real-time preview (WebSocket) |
| FR27 | Epic 7 | Upload gallery images |
| FR28 | Epic 3 | Upload news images |
| FR29 | Epic 4 | Upload teacher photos |
| FR30 | Epic 3 | Drag-and-drop upload |
| FR31 | Epic 3 | Store images (Cloudinary) |
| FR32 | Epic 3 | Validate image files |
| FR33 | Epic 3 | Upload progress indicator |
| FR34 | Epic 8 | Email on news publish |
| FR35 | Epic 8 | Email on deadline publish |
| FR36 | Epic 8 | Email on event publish |
| FR37 | Epic 8 | Email with summary and link |
| FR38 | Epic 6 | Job application email delivery |
| FR39 | Epic 6 | Applicant confirmation email |
| FR40 | Epic 6 | CV attachment in email |
| FR41 | Epic 6 | View job postings publicly |
| FR42 | Epic 6 | Submit application form |
| FR43 | Epic 6 | Upload CV (PDF) |
| FR44 | Epic 6 | Bulgarian confirmation message |
| FR45 | Epic 6 | Validate application form |
| FR46 | Epic 3 | View published news |
| FR47 | Epic 6 | View published jobs |
| FR48 | Epic 5 | View published deadlines |
| FR49 | Epic 5 | View published events |
| FR50 | Epic 7 | View gallery |
| FR51 | Epic 4 | View teacher profiles |
| FR52 | Epic 9 | Individual content pages |
| FR53 | Epic 2 | Bulgarian admin interface |
| FR54 | Epic 9 | Developer monitoring tools |
| FR55 | Epic 9 | Environment configuration access |
| FR56 | Epic 9 | Error logging |
| FR57 | Epic 2 | Help/guidance in admin panel |

*Note: FR12-14 (Edit/Delete/List) are implemented per content type but the pattern is established in Epic 3 (News) as the golden path.*

## Epic List

### Epic 1: Project Foundation & Authentication
Admin can securely access the system through a protected login.

**User Outcome:** Developers have the technical foundation to build features; Admin can securely login/logout with session management.

**FRs covered:** FR1, FR2, FR3, FR4, FR5

**Scope:**
- Monorepo restructure (frontend/, backend/, shared/)
- Backend API foundation with express-prisma-ts-boilerplate
- PostgreSQL database with Prisma schema for all 6 content types
- JWT authentication system with bcrypt password hashing
- Session management and automatic logout
- Protected route infrastructure

---

### Epic 2: Admin Dashboard & Navigation
Admin can navigate the system with a Bulgarian-language dashboard.

**User Outcome:** Admin has a functional home base to access all content management features with full Bulgarian interface.

**FRs covered:** FR15, FR53, FR57

**Scope:**
- Dashboard with 6 ContentTypeCard components (News, Jobs, Deadlines, Events, Gallery, Teachers)
- Draft/Published count display per content type
- ResponsiveSidebar (desktop 240px, tablet icon-only, mobile drawer)
- Bulgarian translations for all UI elements
- StatusBadge components (Draft amber, Published green)
- Basic help/guidance access

---

### Epic 3: News Content Management (Golden Path)
Admin can create, edit, preview, publish, and delete news - the most frequent workflow.

**User Outcome:** Admin can independently publish news/announcements in under 15 minutes with full confidence.

**FRs covered:** FR6, FR12, FR13, FR14, FR16, FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26, FR28, FR30, FR31, FR32, FR33, FR46

**Scope:**
- Full CRUD API endpoints for News
- News list view with ItemListRow components
- ContentFormShell with single-screen form layout
- TipTap WYSIWYG editor with Bulgarian toolbar
- ImageUploadZone with drag-and-drop (Cloudinary integration)
- AutoSaveIndicator (saves every 10 seconds)
- PreviewModal showing exact public site appearance
- DeleteConfirmDialog for safe deletion
- Bulgarian validation messages and success toasts
- Real-time preview via WebSocket (Socket.io)
- Public news display on website

---

### Epic 4: Teacher Profiles Management
Admin can manage teacher/staff profiles with photos.

**User Outcome:** Admin can add, edit, and remove teacher profiles that display on the public website.

**FRs covered:** FR11, FR29, FR51

**Scope:**
- Full CRUD API endpoints for Teachers
- Teacher list view and form (reusing Epic 3 patterns)
- Profile photo upload with single image
- Public teacher profiles display on website

---

### Epic 5: Events & Deadlines Management
Admin can manage events and admission deadlines with dates and urgency markers.

**User Outcome:** Admin can keep the school calendar and admission deadlines current for parents.

**FRs covered:** FR8, FR9, FR17, FR18, FR48, FR49

**Scope:**
- Full CRUD API endpoints for Events
- Full CRUD API endpoints for Deadlines
- Radix UI Date Picker with Bulgarian format (dd.MM.yyyy)
- "Mark as important/urgent" checkbox
- Events and Deadlines list views and forms
- Public display on website

---

### Epic 6: Job Postings & Applications
Admin can post jobs; applicants can apply with CV upload.

**User Outcome:** Complete careers workflow - admin posts openings, candidates apply, admin receives applications.

**FRs covered:** FR7, FR38, FR39, FR40, FR41, FR42, FR43, FR44, FR45, FR47

**Scope:**
- Full CRUD API endpoints for Jobs
- Jobs list view and form in admin
- Public job postings display
- Public job application form (Bulgarian)
- CV upload (PDF validation, max 10MB)
- AWS SES: Application email to admin with CV attachment
- AWS SES: Confirmation email to applicant
- Rate limiting on application endpoint (5/hour/IP)

---

### Epic 7: Photo Gallery Management
Admin can manage photo galleries with multi-image upload.

**User Outcome:** Admin can showcase kindergarten life through photo galleries.

**FRs covered:** FR10, FR27, FR50

**Scope:**
- Full CRUD API endpoints for Gallery
- Gallery list view and form
- Multi-image upload with ImageUploadZone
- Thumbnail generation via Cloudinary
- Public gallery display on website

---

### Epic 8: Email Notification System
Parents automatically receive email notifications when content is published.

**User Outcome:** Parents stay informed without admin manual outreach.

**FRs covered:** FR34, FR35, FR36, FR37

**Scope:**
- AWS SES integration for parent notifications
- Email triggers on News, Deadlines, Events publish
- Email templates with content summary and website link
- Email retry logic for failed deliveries
- 95%+ delivery success rate target

---

### Epic 9: Public Website API Integration
Public website dynamically displays all published content with developer tools.

**User Outcome:** Website visitors see current content; developer has monitoring access.

**FRs covered:** FR52, FR54, FR55, FR56, FR57

**Scope:**
- API endpoints optimized for public consumption
- Individual content detail pages support
- Health check endpoint for uptime monitoring
- Centralized error logging (Winston)
- Environment configuration for troubleshooting
- Performance monitoring for API response times

---

## Epic 1: Project Foundation & Authentication

Admin can securely access the system through a protected login.

### Story 1.1: Monorepo Structure Setup

As a **developer**,
I want **the project restructured as a monorepo with frontend, backend, and shared folders**,
So that **I can build the admin panel and API in a unified codebase with shared TypeScript types**.

**Acceptance Criteria:**

**Given** the existing kindergarten-canvas repository with frontend code at root
**When** the monorepo restructure is complete
**Then** the repository has the following structure:
- `frontend/` containing all existing React/Vite code (src/, public/, vite.config.ts, etc.)
- `backend/` ready for API development
- `shared/` for TypeScript type definitions
**And** `npm install` succeeds in the frontend/ folder
**And** `npm run dev` in frontend/ starts the existing public site on localhost:5173
**And** a root README.md documents the monorepo structure

---

### Story 1.2: Backend API Foundation

As a **developer**,
I want **a configured Express backend with essential middleware**,
So that **I have a secure, production-ready foundation to build API endpoints**.

**Acceptance Criteria:**

**Given** the backend/ folder exists from Story 1.1
**When** the backend is set up with express-prisma-ts-boilerplate
**Then** the backend starts successfully with `npm run dev` on localhost:3344
**And** CORS is configured to allow requests from the frontend origin
**And** rate limiting is configured (100 requests/minute/IP for admin endpoints)
**And** Winston logging captures all requests and errors
**And** a health check endpoint `GET /api/v1/health` returns `{ status: "ok" }`
**And** environment variables are loaded from `.env` file
**And** `.env.example` documents all required environment variables

---

### Story 1.3: User Model and Database Setup

As a **developer**,
I want **a User model in PostgreSQL with Prisma**,
So that **administrators can have accounts for authentication**.

**Acceptance Criteria:**

**Given** the backend is running with Prisma configured
**When** the User model is created and migrated
**Then** the Prisma schema defines a User model with fields:
- `id` (Int, auto-increment, primary key)
- `email` (String, unique)
- `password` (String, hashed)
- `role` (Enum: ADMIN, DEVELOPER)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)
**And** `npx prisma migrate dev` creates the users table successfully
**And** a seed script creates a default admin user with:
- email: configurable via environment variable
- password: hashed with bcrypt (12+ salt rounds)
- role: ADMIN
**And** `npx prisma db seed` executes successfully

---

### Story 1.4: JWT Authentication API

As an **administrator**,
I want **to authenticate using my email and password**,
So that **I can receive a secure token to access the admin panel**.

**Acceptance Criteria:**

**Given** a registered admin user exists in the database
**When** I send `POST /api/v1/auth/login` with valid email and password
**Then** the response returns status 200 with:
- `accessToken` (JWT, expires in 1 hour)
- `refreshToken` (JWT, expires in 7 days)
- `user` object (id, email, role - no password)
**And** the JWT payload contains: userId, email, role, exp

**Given** invalid credentials are submitted
**When** I send `POST /api/v1/auth/login` with wrong email or password
**Then** the response returns status 401 with error message in Bulgarian: "Невалиден имейл или парола"
**And** the response follows JSend format: `{ status: "fail", data: { message: "..." } }`

**Given** rate limiting is active
**When** more than 5 failed login attempts occur from the same IP within 15 minutes
**Then** the response returns status 429 with message: "Твърде много опити. Опитайте отново след 15 минути."

---

### Story 1.5: Session Management and Token Refresh

As an **administrator**,
I want **my session to refresh automatically before expiration**,
So that **I don't get logged out while actively working**.

**Acceptance Criteria:**

**Given** I have a valid refresh token
**When** I send `POST /api/v1/auth/refresh` with the refresh token
**Then** the response returns status 200 with a new accessToken
**And** the new accessToken has a fresh 1-hour expiration

**Given** my refresh token has expired
**When** I send `POST /api/v1/auth/refresh` with the expired token
**Then** the response returns status 401 with message: "Сесията е изтекла. Моля, влезте отново."

**Given** I want to log out
**When** I send `POST /api/v1/auth/logout` with my refresh token
**Then** the response returns status 200
**And** the refresh token is invalidated (cannot be used again)

**Given** a protected endpoint requires authentication
**When** I send a request without a valid accessToken
**Then** the response returns status 401 with message: "Неоторизиран достъп"

---

### Story 1.6: Frontend Authentication Integration

As an **administrator**,
I want **to log in through a Bulgarian login page**,
So that **I can access the protected admin panel**.

**Acceptance Criteria:**

**Given** I navigate to `/admin` without being logged in
**When** the page loads
**Then** I am redirected to `/admin/login`
**And** the login page displays in Bulgarian with fields for "Имейл" and "Парола"

**Given** I am on the login page
**When** I enter valid credentials and click "Вход"
**Then** the system stores the accessToken and refreshToken
**And** I am redirected to `/admin/dashboard`
**And** subsequent API requests include the Authorization header with Bearer token

**Given** I am on the login page
**When** I enter invalid credentials and click "Вход"
**Then** a Bulgarian error message displays: "Невалиден имейл или парола"
**And** I remain on the login page

**Given** I am logged in to the admin panel
**When** I click "Изход" (Logout)
**Then** my tokens are cleared from storage
**And** I am redirected to `/admin/login`

**Given** my accessToken is about to expire (< 5 minutes remaining)
**When** I make any API request
**Then** the frontend automatically refreshes the token in the background
**And** my session continues without interruption

**Given** the ProtectedRoute component wraps admin routes
**When** an unauthenticated user tries to access any `/admin/*` route (except login)
**Then** they are redirected to `/admin/login`

---

## Epic 2: Admin Dashboard & Navigation

Admin can navigate the system with a Bulgarian-language dashboard.

### Story 2.1: Bulgarian Translation System

As a **developer**,
I want **a centralized Bulgarian translation system**,
So that **all admin UI text displays in Bulgarian consistently**.

**Acceptance Criteria:**

**Given** the frontend requires Bulgarian text throughout
**When** the translation system is implemented
**Then** a `src/lib/i18n/bg.ts` file exports a typed translations object containing:
- Navigation labels (Табло, Новини, Кариери, Галерия, Учители, Събития, Срокове)
- Button text (Създай, Редактирай, Изтрий, Запази, Публикувай, Отказ)
- Status labels (Чернова, Публикуван)
- Common UI text (Търси, Зареждане, Няма резултати)
- Error messages
- Success messages
**And** TypeScript provides autocomplete for translation keys
**And** a `useTranslation()` hook or helper function provides access to translations
**And** no English text appears in the admin interface (except technical terms if appropriate)

---

### Story 2.2: Admin Layout Shell with Responsive Sidebar

As an **administrator**,
I want **a responsive sidebar navigation**,
So that **I can easily access all content management sections on any device**.

**Acceptance Criteria:**

**Given** I am logged into the admin panel on a desktop (≥1024px)
**When** the admin layout renders
**Then** a 240px sidebar displays on the left with:
- Kindergarten logo at top
- Navigation items with icons and Bulgarian labels for: Табло, Новини, Кариери, Събития, Срокове, Галерия, Учители
- Settings link at bottom
- Logout button
**And** the main content area fills the remaining width (max 960px)
**And** the active navigation item is highlighted with primary blue background

**Given** I am on a tablet (768px-1023px)
**When** the admin layout renders
**Then** the sidebar collapses to 48px showing only icons
**And** hovering over an icon shows a tooltip with the Bulgarian label
**And** clicking a toggle button expands the sidebar to full width temporarily

**Given** I am on a mobile device (<768px)
**When** the admin layout renders
**Then** the sidebar is hidden by default
**And** a hamburger menu icon appears in the top header
**And** clicking the hamburger opens a slide-out drawer with full navigation
**And** selecting a navigation item closes the drawer

**Given** keyboard navigation is used
**When** I press Tab through the sidebar
**Then** focus moves logically through all navigation items
**And** each focused item has a visible focus indicator (blue ring)
**And** pressing Enter activates the focused navigation item

---

### Story 2.3: Dashboard with Content Type Cards

As an **administrator**,
I want **a dashboard showing all 6 content types as cards**,
So that **I can quickly see content status and access any section**.

**Acceptance Criteria:**

**Given** I am logged in and navigate to `/admin/dashboard`
**When** the dashboard loads
**Then** 6 ContentTypeCard components display in a 2-column grid:
1. Новини (News) - 📰 icon
2. Кариери (Jobs) - 💼 icon
3. Събития (Events) - 📅 icon
4. Срокове (Deadlines) - ⏰ icon
5. Галерия (Gallery) - 🖼️ icon
6. Учители (Teachers) - 👨‍🏫 icon
**And** each card shows the content type icon, Bulgarian title, and counts
**And** each card has a "Създай" (Create) button styled as primary blue

**Given** content exists in the database
**When** the dashboard loads
**Then** each card displays draft and published counts (e.g., "2 чернови, 5 публикувани")
**And** counts are fetched from the API via `GET /api/v1/stats/content-counts`

**Given** no content exists yet
**When** the dashboard loads
**Then** cards display "0 чернови, 0 публикувани"
**And** the "Създай" button remains prominent and clickable

**Given** I am on mobile (<768px)
**When** the dashboard renders
**Then** cards display in a single column layout
**And** all functionality remains accessible

**Given** I click on a card's title or body area
**When** the click is registered
**Then** I am navigated to that content type's list view (e.g., `/admin/news`)

**Given** I click a card's "Създай" button
**When** the click is registered
**Then** I am navigated to that content type's create form (e.g., `/admin/news/create`)

---

### Story 2.4: StatusBadge Component

As an **administrator**,
I want **clear visual badges showing content status**,
So that **I always know if content is draft or published**.

**Acceptance Criteria:**

**Given** a StatusBadge component is rendered with status "draft"
**When** the badge displays
**Then** it shows Bulgarian text "Чернова"
**And** the background color is amber (#F59E0B)
**And** the text color is white
**And** the badge has rounded pill shape (border-radius 6px)

**Given** a StatusBadge component is rendered with status "published"
**When** the badge displays
**Then** it shows Bulgarian text "Публикуван"
**And** the background color is green (#22C55E)
**And** the text color is white

**Given** accessibility requirements
**When** the badge is rendered
**Then** it includes `role="status"` for screen readers
**And** the status is conveyed by both color AND text (never color alone)
**And** the badge text has sufficient contrast ratio (≥3:1 for large text)

---

### Story 2.5: Help Modal

As an **administrator**,
I want **access to basic help information**,
So that **I can get guidance when I'm unsure how to use the system**.

**Acceptance Criteria:**

**Given** I am on any admin page
**When** I click the help icon (?) in the header or sidebar
**Then** a modal dialog opens with Bulgarian help content

**Given** the help modal is open
**When** I view the content
**Then** I see sections explaining:
- How to create content (Как да създадете съдържание)
- How to publish content (Как да публикувате)
- How to edit/delete content (Как да редактирате и изтривате)
- Contact information for technical support
**And** the modal has a close button (×) and "Затвори" button

**Given** the help modal is open
**When** I press Escape or click outside the modal
**Then** the modal closes
**And** focus returns to the element that triggered it

**Given** keyboard navigation
**When** the modal is open
**Then** focus is trapped inside the modal
**And** Tab cycles through modal content and buttons only

---

## Epic 3: News Content Management (Golden Path)

Admin can create, edit, preview, publish, and delete news - the most frequent workflow.

### Story 3.1: News Prisma Model

As a **developer**,
I want **a News model defined in the Prisma schema**,
So that **news content can be stored and retrieved from the database**.

**Acceptance Criteria:**

**Given** the backend has Prisma configured
**When** the News model is created and migrated
**Then** the Prisma schema defines a NewsItem model with fields:
- `id` (Int, auto-increment, primary key)
- `title` (String, required)
- `content` (String, required, stores HTML from TipTap)
- `imageUrl` (String, optional)
- `status` (Enum: DRAFT, PUBLISHED)
- `publishedAt` (DateTime, optional)
- `createdAt` (DateTime, default now)
- `updatedAt` (DateTime, auto-update)
**And** `npx prisma migrate dev --name add-news-model` runs successfully
**And** the migration creates the `news_items` table in PostgreSQL

---

### Story 3.2: News CRUD API Endpoints

As a **developer**,
I want **RESTful API endpoints for News CRUD operations**,
So that **the admin panel can manage news content**.

**Acceptance Criteria:**

**Given** authenticated admin user
**When** I send `GET /api/v1/news`
**Then** the response returns status 200 with array of news items
**And** each item includes: id, title, content, imageUrl, status, publishedAt, createdAt, updatedAt
**And** results are sorted by createdAt descending (newest first)

**Given** authenticated admin user
**When** I send `GET /api/v1/news?status=DRAFT`
**Then** the response returns only draft news items

**Given** authenticated admin user
**When** I send `GET /api/v1/news/:id` with valid ID
**Then** the response returns status 200 with the single news item

**Given** authenticated admin user
**When** I send `GET /api/v1/news/:id` with invalid ID
**Then** the response returns status 404 with message: "Новината не е намерена"

**Given** authenticated admin user with valid news data
**When** I send `POST /api/v1/news` with title and content
**Then** the response returns status 201 with the created news item
**And** status defaults to DRAFT
**And** createdAt is set to current timestamp

**Given** authenticated admin user
**When** I send `POST /api/v1/news` with missing required fields
**Then** the response returns status 400 with Bulgarian validation errors:
- Missing title: "Заглавието е задължително"
- Missing content: "Съдържанието е задължително"

**Given** authenticated admin user
**When** I send `PUT /api/v1/news/:id` with updated fields
**Then** the response returns status 200 with the updated news item
**And** updatedAt is set to current timestamp

**Given** authenticated admin user
**When** I send `DELETE /api/v1/news/:id` with valid ID
**Then** the response returns status 200 with message: "Новината е изтрита успешно"
**And** the news item is removed from the database

---

### Story 3.3: Cloudinary Image Upload Service

As an **administrator**,
I want **to upload images that are stored in Cloudinary**,
So that **news articles can include images that load quickly for parents**.

**Acceptance Criteria:**

**Given** authenticated admin user
**When** I send `POST /api/v1/upload` with an image file (multipart/form-data)
**Then** the backend validates the file:
- File type must be: jpeg, jpg, png, gif, webp
- File size must be ≤ 10MB
**And** the backend uploads the file to Cloudinary
**And** the response returns status 200 with:
- `url`: Cloudinary CDN URL for the optimized image
- `publicId`: Cloudinary public ID for potential deletion

**Given** authenticated admin user
**When** I send `POST /api/v1/upload` with invalid file type
**Then** the response returns status 400 with message: "Невалиден тип файл. Позволени са: JPEG, PNG, GIF, WebP"

**Given** authenticated admin user
**When** I send `POST /api/v1/upload` with file > 10MB
**Then** the response returns status 400 with message: "Файлът е твърде голям. Максимален размер: 10MB"

**Given** Cloudinary integration
**When** an image is uploaded
**Then** Cloudinary automatically optimizes the image (format conversion, compression)
**And** the returned URL serves via Cloudinary CDN

**Given** upload is in progress
**When** the frontend polls or receives progress
**Then** upload progress percentage is trackable (0-100%)

---

### Story 3.4: News List View

As an **administrator**,
I want **to see a list of all news items with their status**,
So that **I can manage existing news content**.

**Acceptance Criteria:**

**Given** I am logged in and navigate to `/admin/news`
**When** the page loads
**Then** I see a list of all news items using ItemListRow components
**And** each row displays: title, StatusBadge (Чернова/Публикуван), creation date (dd.MM.yyyy)
**And** each row has "Редактирай" (Edit) and "Изтрий" (Delete) buttons

**Given** news items exist in the database
**When** the list loads
**Then** items are sorted by creation date (newest first)

**Given** no news items exist
**When** the list loads
**Then** I see an empty state message: "Няма новини все още. Създайте първата!"
**And** a prominent "Създай новина" button is displayed

**Given** the list view has filter tabs
**When** I click "Всички" (All)
**Then** all news items display regardless of status

**Given** the list view has filter tabs
**When** I click "Чернови" (Drafts)
**Then** only news items with status DRAFT display

**Given** the list view has filter tabs
**When** I click "Публикувани" (Published)
**Then** only news items with status PUBLISHED display

**Given** I click "Редактирай" on a news item
**When** the click is registered
**Then** I am navigated to `/admin/news/:id/edit`

**Given** I click "Изтрий" on a news item
**When** the click is registered
**Then** the DeleteConfirmDialog opens (not immediate deletion)

---

### Story 3.5: News Creation Form with TipTap Editor

As an **administrator**,
I want **to create news articles with rich text and images**,
So that **I can publish attractive, formatted announcements**.

**Acceptance Criteria:**

**Given** I am logged in and navigate to `/admin/news/create`
**When** the form loads
**Then** I see a ContentFormShell layout with:
- Breadcrumb: "Новини > Създаване"
- Title field with label "Заглавие" and placeholder "Въведете заглавие..."
- TipTap WYSIWYG editor with label "Съдържание"
- ImageUploadZone with label "Изображение (по избор)"
- Action bar with "Запази чернова" and "Публикувай" buttons

**Given** the TipTap editor is rendered
**When** I interact with the toolbar
**Then** I can apply formatting: Bold, Italic, Underline
**And** I can create: Ordered lists, Unordered lists
**And** I can insert: Links, Headings (H2, H3)
**And** toolbar buttons have Bulgarian tooltips

**Given** I am creating a news item
**When** I use the ImageUploadZone
**Then** I can drag-and-drop an image file onto the zone
**And** I can click to browse and select a file
**And** after upload, a thumbnail preview displays
**And** I can click (×) to remove the uploaded image

**Given** form validation is active
**When** I try to publish without a title
**Then** an inline error displays below the title field: "Заглавието е задължително"
**And** the field border turns red
**And** the Publish button remains disabled until valid

**Given** form validation is active
**When** I try to publish without content
**Then** an inline error displays: "Съдържанието е задължително"

**Given** the form is accessible
**When** I navigate using keyboard
**Then** Tab moves through: Title → Editor → Image Upload → Save Draft → Publish
**And** all interactive elements have visible focus indicators

---

### Story 3.6: Auto-Save Functionality

As an **administrator**,
I want **my work to be saved automatically**,
So that **I never lose content if my browser closes or connection drops**.

**Acceptance Criteria:**

**Given** I am editing a news item (new or existing)
**When** I make changes to any field
**Then** the AutoSaveIndicator shows "Запазва..." (Saving...)
**And** after 10 seconds of no changes OR on field blur, the system saves to the API
**And** the indicator changes to "Запазено" with a checkmark
**And** the indicator fades after 3 seconds

**Given** I am creating a new news item
**When** auto-save triggers for the first time
**Then** a new draft is created via `POST /api/v1/news`
**And** the URL updates to `/admin/news/:id/edit` (with the new ID)
**And** subsequent saves use `PUT /api/v1/news/:id`

**Given** auto-save fails (network error)
**When** the save attempt completes
**Then** the indicator shows "Грешка при запазване" in red
**And** the indicator persists until the next successful save
**And** the system retries after 30 seconds

**Given** I navigate away from an unsaved form
**When** I attempt to leave the page
**Then** a browser confirmation dialog warns about unsaved changes
**And** I can choose to stay or leave

---

### Story 3.7: Preview Modal

As an **administrator**,
I want **to preview how my news will look on the public website**,
So that **I can verify it's correct before publishing**.

**Acceptance Criteria:**

**Given** I am editing a news item
**When** I click the "Преглед" (Preview) button
**Then** a PreviewModal opens showing the news as it will appear on the public site
**And** the preview uses the actual public site styling (fonts, colors, layout)
**And** the title, formatted content, and image display correctly

**Given** the PreviewModal is open on desktop
**When** I view the modal
**Then** it displays as a large centered modal (max-width 800px)
**And** a close button (×) appears at top-right
**And** "Затвори" button appears at the bottom

**Given** the PreviewModal is open on mobile
**When** I view the modal
**Then** it displays as full-screen
**And** close button remains accessible

**Given** the PreviewModal is open
**When** I press Escape or click outside the modal
**Then** the modal closes
**And** focus returns to the Preview button

**Given** the preview content
**When** I view it
**Then** it is read-only (no editing within preview)
**And** Bulgarian date formatting is applied (dd.MM.yyyy)

---

### Story 3.8: Publish and Update Workflow

As an **administrator**,
I want **to publish news to the public website with one click**,
So that **parents can immediately see the announcement**.

**Acceptance Criteria:**

**Given** I am editing a draft news item
**When** I click "Публикувай" (Publish)
**Then** the API is called with status: PUBLISHED and publishedAt: current timestamp
**And** the StatusBadge changes from amber "Чернова" to green "Публикуван"
**And** a success toast displays: "Новината е публикувана успешно!"
**And** the toast includes a link: "Виж на сайта" (opens public news page in new tab)

**Given** I am editing a published news item
**When** I click "Обнови" (Update)
**Then** the API is called with the updated content
**And** a success toast displays: "Новината е обновена успешно!"
**And** the public website reflects changes immediately

**Given** the action bar on a draft
**When** I view the buttons
**Then** I see "Запази чернова" (secondary) and "Публикувай" (primary blue)

**Given** the action bar on a published item
**When** I view the buttons
**Then** I see "Запази" (secondary) and "Обнови" (primary blue)

**Given** validation fails
**When** I click Publish/Update with invalid data
**Then** the action is prevented
**And** validation errors display inline

---

### Story 3.9: Delete Confirmation Dialog

As an **administrator**,
I want **a confirmation before deleting news**,
So that **I don't accidentally remove content**.

**Acceptance Criteria:**

**Given** I click "Изтрий" on a news item
**When** the DeleteConfirmDialog opens
**Then** it displays:
- The news item title for context
- Warning message: "Сигурни ли сте, че искате да изтриете тази новина?"
- "Отказ" button (secondary, focused by default)
- "Изтрий" button (destructive red)

**Given** the DeleteConfirmDialog is open
**When** I click "Отказ" or press Escape
**Then** the dialog closes
**And** no deletion occurs
**And** focus returns to the Delete button that triggered it

**Given** the DeleteConfirmDialog is open
**When** I click "Изтрий" (confirm)
**Then** the API is called to delete the news item
**And** the dialog closes
**And** a success toast displays: "Новината е изтрита успешно"
**And** the item is removed from the list

**Given** deletion fails (API error)
**When** the delete attempt completes
**Then** an error toast displays: "Грешка при изтриване. Моля, опитайте отново."
**And** the item remains in the list

---

### Story 3.10: Real-Time Preview (WebSocket)

As an **administrator**,
I want **to see a live preview updating as I type**,
So that **I can see exactly how my content will look without clicking Preview**.

**Acceptance Criteria:**

**Given** I am editing a news item
**When** the form loads
**Then** a Socket.io connection is established to the backend

**Given** I am typing in the TipTap editor
**When** content changes
**Then** the preview pane (if visible) updates in real-time
**And** updates are debounced (100ms) to prevent excessive renders

**Given** the WebSocket connection fails
**When** the form loads or connection drops
**Then** a fallback to manual preview (Preview button) is available
**And** the live preview pane hides or shows "Preview unavailable"
**And** the user can still use the Preview Modal

**Given** real-time preview is active
**When** I view the preview pane
**Then** it shows the news with public site styling
**And** title, content, and image update as I edit

---

### Story 3.11: Public News Display Integration

As a **website visitor**,
I want **to see published news on the kindergarten website**,
So that **I can stay informed about kindergarten announcements**.

**Acceptance Criteria:**

**Given** published news exists
**When** I request `GET /api/v1/public/news`
**Then** the response returns only PUBLISHED news items
**And** items are sorted by publishedAt descending (newest first)
**And** response time is < 500ms

**Given** published news exists
**When** I request `GET /api/v1/public/news/:id`
**Then** the response returns the single published news item
**And** draft items return 404

**Given** the public website News section
**When** the page loads
**Then** news items are fetched from the public API
**And** each news item displays: title, formatted content, image (if present), publication date
**And** Bulgarian date formatting is used (dd.MM.yyyy)

**Given** I click on a news item title/card
**When** the click is registered
**Then** I am navigated to the individual news detail page

**Given** no published news exists
**When** the News section loads
**Then** a friendly message displays: "Няма публикувани новини в момента."

---

## Epic 4: Teacher Profiles Management

Admin can manage teacher/staff profiles with photos.

### Story 4.1: Teacher Prisma Model

As a **developer**,
I want **a Teacher model defined in the Prisma schema**,
So that **teacher profiles can be stored and retrieved from the database**.

**Acceptance Criteria:**

**Given** the backend has Prisma configured
**When** the Teacher model is created and migrated
**Then** the Prisma schema defines a Teacher model with fields:
- `id` (Int, auto-increment, primary key)
- `firstName` (String, required)
- `lastName` (String, required)
- `position` (String, required - e.g., "Учител", "Директор", "Помощник-възпитател")
- `bio` (String, optional - short description)
- `photoUrl` (String, optional)
- `status` (Enum: DRAFT, PUBLISHED)
- `displayOrder` (Int, optional - for sorting on public site)
- `createdAt` (DateTime, default now)
- `updatedAt` (DateTime, auto-update)
**And** `npx prisma migrate dev --name add-teacher-model` runs successfully

---

### Story 4.2: Teacher CRUD API Endpoints

As a **developer**,
I want **RESTful API endpoints for Teacher CRUD operations**,
So that **the admin panel can manage teacher profiles**.

**Acceptance Criteria:**

**Given** authenticated admin user
**When** I send `GET /api/v1/teachers`
**Then** the response returns status 200 with array of teachers
**And** each item includes: id, firstName, lastName, position, bio, photoUrl, status, displayOrder, createdAt, updatedAt
**And** results are sorted by displayOrder ascending, then by lastName

**Given** authenticated admin user
**When** I send `GET /api/v1/teachers?status=PUBLISHED`
**Then** the response returns only published teacher profiles

**Given** authenticated admin user
**When** I send `GET /api/v1/teachers/:id` with valid ID
**Then** the response returns status 200 with the single teacher profile

**Given** authenticated admin user
**When** I send `GET /api/v1/teachers/:id` with invalid ID
**Then** the response returns status 404 with message: "Учителят не е намерен"

**Given** authenticated admin user with valid teacher data
**When** I send `POST /api/v1/teachers` with firstName, lastName, and position
**Then** the response returns status 201 with the created teacher
**And** status defaults to DRAFT

**Given** authenticated admin user
**When** I send `POST /api/v1/teachers` with missing required fields
**Then** the response returns status 400 with Bulgarian validation errors:
- Missing firstName: "Името е задължително"
- Missing lastName: "Фамилията е задължителна"
- Missing position: "Длъжността е задължителна"

**Given** authenticated admin user
**When** I send `PUT /api/v1/teachers/:id` with updated fields
**Then** the response returns status 200 with the updated teacher
**And** updatedAt is set to current timestamp

**Given** authenticated admin user
**When** I send `DELETE /api/v1/teachers/:id` with valid ID
**Then** the response returns status 200 with message: "Учителят е изтрит успешно"
**And** the teacher is removed from the database

---

### Story 4.3: Teacher List and Form

As an **administrator**,
I want **to manage teacher profiles through a list and form interface**,
So that **I can add, edit, and remove staff members displayed on the website**.

**Acceptance Criteria:**

**Given** I am logged in and navigate to `/admin/teachers`
**When** the page loads
**Then** I see a list of all teachers using ItemListRow components
**And** each row displays: full name (firstName + lastName), position, StatusBadge, photo thumbnail (if exists)
**And** each row has "Редактирай" (Edit) and "Изтрий" (Delete) buttons

**Given** no teachers exist
**When** the list loads
**Then** I see an empty state: "Няма добавени учители. Добавете първия!"
**And** a prominent "Добави учител" button is displayed

**Given** I navigate to `/admin/teachers/create`
**When** the form loads
**Then** I see a ContentFormShell layout with:
- Breadcrumb: "Учители > Добавяне"
- "Име" field (firstName)
- "Фамилия" field (lastName)
- "Длъжност" field (position)
- "Описание" textarea (bio, optional)
- ImageUploadZone for profile photo with label "Снимка (по избор)"
- Action bar with "Запази чернова" and "Публикувай" buttons

**Given** I am editing an existing teacher at `/admin/teachers/:id/edit`
**When** the form loads
**Then** all fields are pre-populated with existing data
**And** the existing photo displays as a thumbnail (if present)

**Given** form validation is active
**When** I try to publish without required fields
**Then** inline errors display for: firstName, lastName, position

**Given** I use the ImageUploadZone
**When** I upload a photo
**Then** the image uploads to Cloudinary (reusing Epic 3 upload service)
**And** a thumbnail preview displays
**And** I can remove the photo with (×) button

**Given** I click "Публикувай" on a draft teacher
**When** the action completes
**Then** the status changes to PUBLISHED
**And** a success toast displays: "Учителят е публикуван успешно!"

**Given** I click "Изтрий" on a teacher
**When** the DeleteConfirmDialog opens
**Then** it shows: "Сигурни ли сте, че искате да изтриете [firstName lastName]?"

---

### Story 4.4: Public Teacher Profiles Display

As a **website visitor**,
I want **to see teacher profiles on the kindergarten website**,
So that **I can learn about the staff caring for my child**.

**Acceptance Criteria:**

**Given** published teachers exist
**When** I request `GET /api/v1/public/teachers`
**Then** the response returns only PUBLISHED teacher profiles
**And** teachers are sorted by displayOrder ascending, then by lastName
**And** response time is < 500ms

**Given** the public website Teachers section
**When** the page loads
**Then** teachers are fetched from the public API
**And** each teacher displays: photo (or placeholder), full name, position, bio (if present)

**Given** I view a teacher card
**When** the teacher has a photo
**Then** the photo displays with proper aspect ratio
**And** the image loads from Cloudinary CDN

**Given** I view a teacher card
**When** the teacher has no photo
**Then** a placeholder avatar displays (generic person icon or initials)

**Given** no published teachers exist
**When** the Teachers section loads
**Then** a friendly message displays: "Информация за екипа скоро."

---

## Epic 5: Events & Deadlines Management

Admin can manage events and admission deadlines with dates and urgency markers.

### Story 5.1: Event and Deadline Prisma Models

As a **developer**,
I want **Event and Deadline models defined in the Prisma schema**,
So that **events and admission deadlines can be stored and retrieved from the database**.

**Acceptance Criteria:**

**Given** the backend has Prisma configured
**When** the Event model is created and migrated
**Then** the Prisma schema defines an Event model with fields:
- `id` (Int, auto-increment, primary key)
- `title` (String, required)
- `description` (String, optional - rich text from TipTap)
- `eventDate` (DateTime, required)
- `eventEndDate` (DateTime, optional - for multi-day events)
- `location` (String, optional)
- `isImportant` (Boolean, default false)
- `imageUrl` (String, optional)
- `status` (Enum: DRAFT, PUBLISHED)
- `publishedAt` (DateTime, optional)
- `createdAt` (DateTime, default now)
- `updatedAt` (DateTime, auto-update)

**Given** the backend has Prisma configured
**When** the Deadline model is created and migrated
**Then** the Prisma schema defines a Deadline model with fields:
- `id` (Int, auto-increment, primary key)
- `title` (String, required)
- `description` (String, optional - rich text from TipTap)
- `deadlineDate` (DateTime, required)
- `isUrgent` (Boolean, default false)
- `status` (Enum: DRAFT, PUBLISHED)
- `publishedAt` (DateTime, optional)
- `createdAt` (DateTime, default now)
- `updatedAt` (DateTime, auto-update)

**And** `npx prisma migrate dev --name add-event-deadline-models` runs successfully
**And** the migrations create `events` and `deadlines` tables in PostgreSQL

---

### Story 5.2: Events CRUD API Endpoints

As a **developer**,
I want **RESTful API endpoints for Event CRUD operations**,
So that **the admin panel can manage calendar events**.

**Acceptance Criteria:**

**Given** authenticated admin user
**When** I send `GET /api/v1/events`
**Then** the response returns status 200 with array of events
**And** each item includes: id, title, description, eventDate, eventEndDate, location, isImportant, imageUrl, status, publishedAt, createdAt, updatedAt
**And** results are sorted by eventDate ascending (upcoming first)

**Given** authenticated admin user
**When** I send `GET /api/v1/events?status=PUBLISHED`
**Then** the response returns only published events

**Given** authenticated admin user
**When** I send `GET /api/v1/events?upcoming=true`
**Then** the response returns only events where eventDate >= today

**Given** authenticated admin user
**When** I send `GET /api/v1/events/:id` with valid ID
**Then** the response returns status 200 with the single event

**Given** authenticated admin user
**When** I send `GET /api/v1/events/:id` with invalid ID
**Then** the response returns status 404 with message: "Събитието не е намерено"

**Given** authenticated admin user with valid event data
**When** I send `POST /api/v1/events` with title and eventDate
**Then** the response returns status 201 with the created event
**And** status defaults to DRAFT
**And** isImportant defaults to false

**Given** authenticated admin user
**When** I send `POST /api/v1/events` with missing required fields
**Then** the response returns status 400 with Bulgarian validation errors:
- Missing title: "Заглавието е задължително"
- Missing eventDate: "Датата на събитието е задължителна"

**Given** authenticated admin user
**When** I send `PUT /api/v1/events/:id` with updated fields
**Then** the response returns status 200 with the updated event
**And** updatedAt is set to current timestamp

**Given** authenticated admin user
**When** I send `DELETE /api/v1/events/:id` with valid ID
**Then** the response returns status 200 with message: "Събитието е изтрито успешно"
**And** the event is removed from the database

---

### Story 5.3: Deadlines CRUD API Endpoints

As a **developer**,
I want **RESTful API endpoints for Deadline CRUD operations**,
So that **the admin panel can manage admission deadlines**.

**Acceptance Criteria:**

**Given** authenticated admin user
**When** I send `GET /api/v1/admission-deadlines`
**Then** the response returns status 200 with array of deadlines
**And** each item includes: id, title, description, deadlineDate, isUrgent, status, publishedAt, createdAt, updatedAt
**And** results are sorted by deadlineDate ascending (nearest first)

**Given** authenticated admin user
**When** I send `GET /api/v1/admission-deadlines?status=PUBLISHED`
**Then** the response returns only published deadlines

**Given** authenticated admin user
**When** I send `GET /api/v1/admission-deadlines?upcoming=true`
**Then** the response returns only deadlines where deadlineDate >= today

**Given** authenticated admin user
**When** I send `GET /api/v1/admission-deadlines/:id` with valid ID
**Then** the response returns status 200 with the single deadline

**Given** authenticated admin user
**When** I send `GET /api/v1/admission-deadlines/:id` with invalid ID
**Then** the response returns status 404 with message: "Срокът не е намерен"

**Given** authenticated admin user with valid deadline data
**When** I send `POST /api/v1/admission-deadlines` with title and deadlineDate
**Then** the response returns status 201 with the created deadline
**And** status defaults to DRAFT
**And** isUrgent defaults to false

**Given** authenticated admin user
**When** I send `POST /api/v1/admission-deadlines` with missing required fields
**Then** the response returns status 400 with Bulgarian validation errors:
- Missing title: "Заглавието е задължително"
- Missing deadlineDate: "Крайната дата е задължителна"

**Given** authenticated admin user
**When** I send `PUT /api/v1/admission-deadlines/:id` with updated fields
**Then** the response returns status 200 with the updated deadline
**And** updatedAt is set to current timestamp

**Given** authenticated admin user
**When** I send `DELETE /api/v1/admission-deadlines/:id` with valid ID
**Then** the response returns status 200 with message: "Срокът е изтрит успешно"
**And** the deadline is removed from the database

---

### Story 5.4: Date Picker Component with Bulgarian Locale

As an **administrator**,
I want **to select dates using a Bulgarian date picker**,
So that **I can easily set event and deadline dates in my preferred format**.

**Acceptance Criteria:**

**Given** the Events or Deadlines form is rendered
**When** I click on the date field
**Then** a Radix UI Date Picker calendar opens
**And** the calendar displays Bulgarian month names (Януари, Февруари, etc.)
**And** the calendar displays Bulgarian day names (Пн, Вт, Ср, etc.)
**And** week starts on Monday (Bulgarian convention)

**Given** I have selected a date
**When** the date displays in the input field
**Then** it shows in Bulgarian format: dd.MM.yyyy (e.g., 15.03.2026)
**And** the format is consistent across Events and Deadlines forms

**Given** the date picker is open
**When** I navigate months
**Then** I can click left/right arrows to move between months
**And** I can click month/year header to switch to month/year selection view

**Given** the date picker is open
**When** I select a date
**Then** the picker closes
**And** the selected date populates the input field
**And** the form state updates with the ISO date value

**Given** keyboard navigation
**When** I focus the date field and press Enter or Space
**Then** the date picker opens
**And** arrow keys navigate the calendar
**And** Enter selects the focused date
**And** Escape closes the picker without selection

**Given** validation is required
**When** I try to save without selecting a required date
**Then** an inline error displays: "Моля, изберете дата"
**And** the date field border turns red

**Given** the Event form allows optional end date
**When** I select an end date that is before the start date
**Then** an inline error displays: "Крайната дата трябва да е след началната"

---

### Story 5.5: Events List and Form

As an **administrator**,
I want **to manage calendar events through a list and form interface**,
So that **I can keep parents informed about upcoming kindergarten activities**.

**Acceptance Criteria:**

**Given** I am logged in and navigate to `/admin/events`
**When** the page loads
**Then** I see a list of all events using ItemListRow components
**And** each row displays: title, event date (dd.MM.yyyy), StatusBadge, important indicator (⭐ if isImportant)
**And** each row has "Редактирай" (Edit) and "Изтрий" (Delete) buttons
**And** events are sorted by eventDate ascending (upcoming first)

**Given** no events exist
**When** the list loads
**Then** I see an empty state: "Няма добавени събития. Създайте първото!"
**And** a prominent "Създай събитие" button is displayed

**Given** the list has filter tabs
**When** I click "Предстоящи" (Upcoming)
**Then** only events with eventDate >= today display

**Given** the list has filter tabs
**When** I click "Минали" (Past)
**Then** only events with eventDate < today display

**Given** I navigate to `/admin/events/create`
**When** the form loads
**Then** I see a ContentFormShell layout with:
- Breadcrumb: "Събития > Създаване"
- "Заглавие" field (required)
- "Дата на събитието" date picker (required)
- "Крайна дата" date picker (optional, for multi-day events)
- "Място" field (optional)
- "Описание" TipTap editor (optional)
- "Важно събитие" checkbox (isImportant)
- ImageUploadZone for event image (optional)
- Action bar with "Запази чернова" and "Публикувай"

**Given** I check the "Важно събитие" checkbox
**When** I publish the event
**Then** the event displays with ⭐ indicator in lists
**And** the event is highlighted on the public website

**Given** I am editing an existing event at `/admin/events/:id/edit`
**When** the form loads
**Then** all fields are pre-populated with existing data
**And** the date picker shows the existing date

**Given** I click "Публикувай" on a draft event
**When** the action completes
**Then** the status changes to PUBLISHED
**And** a success toast displays: "Събитието е публикувано успешно!"

**Given** I click "Изтрий" on an event
**When** the DeleteConfirmDialog opens
**Then** it shows: "Сигурни ли сте, че искате да изтриете това събитие?"

---

### Story 5.6: Deadlines List and Form

As an **administrator**,
I want **to manage admission deadlines through a list and form interface**,
So that **I can ensure parents don't miss important enrollment dates**.

**Acceptance Criteria:**

**Given** I am logged in and navigate to `/admin/deadlines`
**When** the page loads
**Then** I see a list of all deadlines using ItemListRow components
**And** each row displays: title, deadline date (dd.MM.yyyy), StatusBadge, urgent indicator (🚨 if isUrgent)
**And** each row has "Редактирай" (Edit) and "Изтрий" (Delete) buttons
**And** deadlines are sorted by deadlineDate ascending (nearest first)

**Given** no deadlines exist
**When** the list loads
**Then** I see an empty state: "Няма добавени срокове. Създайте първия!"
**And** a prominent "Създай срок" button is displayed

**Given** the list has filter tabs
**When** I click "Активни" (Active)
**Then** only deadlines with deadlineDate >= today display

**Given** the list has filter tabs
**When** I click "Изтекли" (Expired)
**Then** only deadlines with deadlineDate < today display

**Given** I navigate to `/admin/deadlines/create`
**When** the form loads
**Then** I see a ContentFormShell layout with:
- Breadcrumb: "Срокове > Създаване"
- "Заглавие" field (required)
- "Краен срок" date picker (required)
- "Описание" TipTap editor (optional)
- "Спешен срок" checkbox (isUrgent)
- Action bar with "Запази чернова" and "Публикувай"

**Given** I check the "Спешен срок" checkbox
**When** I publish the deadline
**Then** the deadline displays with 🚨 indicator in lists
**And** the deadline is highlighted with red accent on public website

**Given** I am editing an existing deadline at `/admin/deadlines/:id/edit`
**When** the form loads
**Then** all fields are pre-populated with existing data
**And** the date picker shows the existing deadline date

**Given** I click "Публикувай" on a draft deadline
**When** the action completes
**Then** the status changes to PUBLISHED
**And** a success toast displays: "Срокът е публикуван успешно!"

**Given** I click "Изтрий" on a deadline
**When** the DeleteConfirmDialog opens
**Then** it shows: "Сигурни ли сте, че искате да изтриете този срок?"

---

### Story 5.7: Public Events and Deadlines Display

As a **website visitor**,
I want **to see upcoming events and admission deadlines on the kindergarten website**,
So that **I can plan for activities and never miss important dates**.

**Acceptance Criteria:**

**Given** published events exist
**When** I request `GET /api/v1/public/events`
**Then** the response returns only PUBLISHED events
**And** events are sorted by eventDate ascending (upcoming first)
**And** by default, only future events (eventDate >= today) are returned
**And** response time is < 500ms

**Given** published events exist
**When** I request `GET /api/v1/public/events?includePast=true`
**Then** the response includes both past and upcoming published events

**Given** published deadlines exist
**When** I request `GET /api/v1/public/admission-deadlines`
**Then** the response returns only PUBLISHED deadlines
**And** deadlines are sorted by deadlineDate ascending (nearest first)
**And** by default, only future deadlines (deadlineDate >= today) are returned
**And** response time is < 500ms

**Given** the public website Events section
**When** the page loads
**Then** events are fetched from the public API
**And** each event displays: title, date (dd.MM.yyyy), location (if present), description excerpt
**And** important events (isImportant=true) are visually highlighted with ⭐ or special styling

**Given** the public website Deadlines section
**When** the page loads
**Then** deadlines are fetched from the public API
**And** each deadline displays: title, deadline date (dd.MM.yyyy), description excerpt
**And** urgent deadlines (isUrgent=true) are visually highlighted with red accent or 🚨
**And** deadlines nearing expiration (< 7 days) have additional visual urgency

**Given** I view an event or deadline date
**When** the date displays
**Then** Bulgarian date formatting is used: dd.MM.yyyy (e.g., 15.03.2026)

**Given** no published events exist
**When** the Events section loads
**Then** a friendly message displays: "Няма предстоящи събития в момента."

**Given** no published deadlines exist
**When** the Deadlines section loads
**Then** a friendly message displays: "Няма активни срокове в момента."

---

## Epic 6: Job Postings & Applications

Admin can post jobs; applicants can apply with CV upload.

### Story 6.1: Job Prisma Model

As a **developer**,
I want **a Job model defined in the Prisma schema**,
So that **job postings can be stored and retrieved from the database**.

**Acceptance Criteria:**

**Given** the backend has Prisma configured
**When** the Job model is created and migrated
**Then** the Prisma schema defines a Job model with fields:
- `id` (Int, auto-increment, primary key)
- `title` (String, required - job title)
- `description` (String, required - rich text from TipTap)
- `requirements` (String, optional - qualifications, rich text)
- `contactEmail` (String, required - where to send applications)
- `applicationDeadline` (DateTime, optional)
- `isActive` (Boolean, default true - accepting applications)
- `status` (Enum: DRAFT, PUBLISHED)
- `publishedAt` (DateTime, optional)
- `createdAt` (DateTime, default now)
- `updatedAt` (DateTime, auto-update)

**And** `npx prisma migrate dev --name add-job-model` runs successfully
**And** the migration creates the `jobs` table in PostgreSQL

---

### Story 6.2: Jobs CRUD API Endpoints

As a **developer**,
I want **RESTful API endpoints for Job CRUD operations**,
So that **the admin panel can manage job postings**.

**Acceptance Criteria:**

**Given** authenticated admin user
**When** I send `GET /api/v1/jobs`
**Then** the response returns status 200 with array of jobs
**And** each item includes: id, title, description, requirements, contactEmail, applicationDeadline, isActive, status, publishedAt, createdAt, updatedAt
**And** results are sorted by createdAt descending (newest first)

**Given** authenticated admin user
**When** I send `GET /api/v1/jobs?status=PUBLISHED`
**Then** the response returns only published job postings

**Given** authenticated admin user
**When** I send `GET /api/v1/jobs?isActive=true`
**Then** the response returns only jobs currently accepting applications

**Given** authenticated admin user
**When** I send `GET /api/v1/jobs/:id` with valid ID
**Then** the response returns status 200 with the single job posting

**Given** authenticated admin user
**When** I send `GET /api/v1/jobs/:id` with invalid ID
**Then** the response returns status 404 with message: "Позицията не е намерена"

**Given** authenticated admin user with valid job data
**When** I send `POST /api/v1/jobs` with title, description, and contactEmail
**Then** the response returns status 201 with the created job
**And** status defaults to DRAFT
**And** isActive defaults to true

**Given** authenticated admin user
**When** I send `POST /api/v1/jobs` with missing required fields
**Then** the response returns status 400 with Bulgarian validation errors:
- Missing title: "Заглавието е задължително"
- Missing description: "Описанието е задължително"
- Missing contactEmail: "Имейлът за контакт е задължителен"
- Invalid email format: "Невалиден имейл формат"

**Given** authenticated admin user
**When** I send `PUT /api/v1/jobs/:id` with updated fields
**Then** the response returns status 200 with the updated job
**And** updatedAt is set to current timestamp

**Given** authenticated admin user
**When** I send `DELETE /api/v1/jobs/:id` with valid ID
**Then** the response returns status 200 with message: "Позицията е изтрита успешно"
**And** the job is removed from the database

---

### Story 6.3: Jobs List and Form in Admin

As an **administrator**,
I want **to manage job postings through a list and form interface**,
So that **I can advertise open positions at the kindergarten**.

**Acceptance Criteria:**

**Given** I am logged in and navigate to `/admin/jobs`
**When** the page loads
**Then** I see a list of all jobs using ItemListRow components
**And** each row displays: title, StatusBadge, isActive indicator (✓ Активна / ✗ Затворена), application deadline (if set)
**And** each row has "Редактирай" (Edit) and "Изтрий" (Delete) buttons
**And** jobs are sorted by creation date (newest first)

**Given** no jobs exist
**When** the list loads
**Then** I see an empty state: "Няма добавени позиции. Създайте първата!"
**And** a prominent "Създай позиция" button is displayed

**Given** the list has filter tabs
**When** I click "Активни" (Active)
**Then** only jobs with isActive=true display

**Given** the list has filter tabs
**When** I click "Затворени" (Closed)
**Then** only jobs with isActive=false display

**Given** I navigate to `/admin/jobs/create`
**When** the form loads
**Then** I see a ContentFormShell layout with:
- Breadcrumb: "Кариери > Създаване"
- "Заглавие на позицията" field (required)
- "Описание" TipTap editor (required)
- "Изисквания" TipTap editor (optional)
- "Имейл за кандидатури" field (required, email validation)
- "Краен срок за кандидатстване" date picker (optional)
- "Приема кандидатури" toggle/checkbox (isActive)
- Action bar with "Запази чернова" and "Публикувай"

**Given** I am editing an existing job at `/admin/jobs/:id/edit`
**When** the form loads
**Then** all fields are pre-populated with existing data

**Given** form validation is active
**When** I try to publish without required fields
**Then** inline errors display for: title, description, contactEmail

**Given** I click "Публикувай" on a draft job
**When** the action completes
**Then** the status changes to PUBLISHED
**And** a success toast displays: "Позицията е публикувана успешно!"

**Given** I uncheck "Приема кандидатури"
**When** I save the job
**Then** isActive is set to false
**And** the public application form shows "Позицията не приема кандидатури"

**Given** I click "Изтрий" on a job
**When** the DeleteConfirmDialog opens
**Then** it shows: "Сигурни ли сте, че искате да изтриете тази позиция?"

---

### Story 6.4: Public Job Postings Display

As a **website visitor**,
I want **to see available job positions on the kindergarten website**,
So that **I can learn about employment opportunities**.

**Acceptance Criteria:**

**Given** published active jobs exist
**When** I request `GET /api/v1/public/jobs`
**Then** the response returns only PUBLISHED jobs where isActive=true
**And** jobs are sorted by createdAt descending (newest first)
**And** response time is < 500ms

**Given** published jobs exist
**When** I request `GET /api/v1/public/jobs/:id`
**Then** the response returns the job if PUBLISHED and isActive=true
**And** draft jobs or inactive jobs return 404

**Given** the public website Careers/Jobs section
**When** the page loads
**Then** jobs are fetched from the public API
**And** each job displays: title, description excerpt, application deadline (if set)
**And** each job has a "Кандидатствай" (Apply) button

**Given** I click on a job title
**When** the click is registered
**Then** I am navigated to the individual job detail page
**And** full description, requirements, and application deadline display

**Given** no published active jobs exist
**When** the Jobs section loads
**Then** a friendly message displays: "В момента няма отворени позиции."

**Given** a job has an application deadline that has passed
**When** the job displays
**Then** the "Кандидатствай" button is disabled
**And** text displays: "Срокът за кандидатстване е изтекъл"

---

### Story 6.5: Job Application Form

As a **job applicant**,
I want **to submit my application through an online form**,
So that **I can apply for a position at the kindergarten**.

**Acceptance Criteria:**

**Given** I am viewing an active job posting
**When** I click "Кандидатствай" (Apply)
**Then** a job application form displays with fields:
- "Име и фамилия" (Full name, required)
- "Имейл" (Email, required, email validation)
- "Телефон" (Phone, required)
- "Мотивационно писмо" (Cover letter, textarea, optional)
- "CV (PDF)" file upload (required)
- "Изпрати кандидатура" submit button

**Given** the application form is displayed
**When** I view the form header
**Then** I see the job title I'm applying for
**And** all labels and placeholder text are in Bulgarian

**Given** form validation is active
**When** I try to submit without required fields
**Then** inline errors display in Bulgarian:
- Missing name: "Името е задължително"
- Missing email: "Имейлът е задължителен"
- Invalid email: "Невалиден имейл формат"
- Missing phone: "Телефонът е задължителен"
- Missing CV: "CV файлът е задължителен"

**Given** phone validation
**When** I enter a phone number
**Then** common Bulgarian formats are accepted (e.g., +359 888 123 456, 0888123456)

**Given** I have filled out the form completely
**When** I click "Изпрати кандидатура"
**Then** the form validates all fields
**And** if valid, the application is submitted to `POST /api/v1/public/applications`
**And** a loading state shows while submitting

**Given** rate limiting is active
**When** more than 5 applications are submitted from the same IP in 1 hour
**Then** the response returns status 429 with message: "Твърде много заявки. Моля, опитайте отново по-късно."

---

### Story 6.6: CV Upload and Validation

As a **job applicant**,
I want **to upload my CV as a PDF file**,
So that **my application includes my qualifications**.

**Acceptance Criteria:**

**Given** the CV upload field in the application form
**When** I click on the upload area
**Then** a file browser opens allowing PDF selection only
**And** the input has accept=".pdf" attribute

**Given** I drag-and-drop a file
**When** the file is a valid PDF under 10MB
**Then** the file is accepted for upload
**And** the filename displays with a checkmark icon
**And** a "Премахни" (Remove) button appears

**Given** I select a file that is not a PDF
**When** I try to upload
**Then** an error displays: "Моля, качете PDF файл"
**And** the file is rejected

**Given** I select a PDF file larger than 10MB
**When** I try to upload
**Then** an error displays: "Файлът е твърде голям. Максимален размер: 10MB"
**And** the file is rejected

**Given** I have uploaded a CV
**When** I click "Премахни"
**Then** the file is removed
**And** I can upload a different file

**Given** the form is submitted
**When** the CV file is sent to the backend
**Then** the file is uploaded to temporary storage (or Cloudinary)
**And** the file URL is included in the application data

---

### Story 6.7: Application Email to Admin with CV

As an **administrator**,
I want **to receive job applications via email with CV attachment**,
So that **I can review candidates without logging into the system**.

**Acceptance Criteria:**

**Given** an applicant submits a valid application
**When** the application is processed
**Then** the backend sends an email via AWS SES to the job's contactEmail

**Given** the email to admin
**When** it is composed
**Then** the subject line is: "Нова кандидатура за: [Job Title]"
**And** the body includes:
- Applicant name
- Applicant email (as clickable mailto: link)
- Applicant phone
- Cover letter (if provided)
- Application date/time (Bulgarian format)
**And** the CV PDF is attached to the email

**Given** email attachment handling
**When** the CV is attached
**Then** the attachment preserves the original filename
**And** the attachment size is under SES limits (10MB)

**Given** the email send succeeds
**When** the application API responds
**Then** the response returns status 201 with message: "Кандидатурата е изпратена успешно!"
**And** the application is logged for record-keeping

**Given** the email send fails
**When** the application API responds
**Then** the system retries up to 3 times with exponential backoff
**And** if all retries fail, the error is logged
**And** the user receives: "Възникна проблем. Моля, опитайте отново или се свържете директно."

**Given** email delivery tracking
**When** an application is submitted
**Then** the system logs: jobId, applicantEmail, timestamp, success/failure status

---

### Story 6.8: Confirmation Email to Applicant

As a **job applicant**,
I want **to receive a confirmation email after applying**,
So that **I know my application was received**.

**Acceptance Criteria:**

**Given** an applicant submits a valid application
**When** the admin email is sent successfully
**Then** a confirmation email is sent to the applicant's email address

**Given** the confirmation email to applicant
**When** it is composed
**Then** the subject line is: "Потвърждение за кандидатура - [Kindergarten Name]"
**And** the body includes (in Bulgarian):
- Thank you message: "Благодарим ви за кандидатурата!"
- Job title they applied for
- Confirmation that their CV was received
- Message that they will be contacted if shortlisted
- Kindergarten contact information

**Given** the confirmation email template
**When** it is rendered
**Then** it uses professional, friendly Bulgarian language
**And** it includes the kindergarten logo/branding (if configured)
**And** it is mobile-responsive

**Given** the confirmation send fails
**When** the primary attempt fails
**Then** the system retries up to 2 times
**And** failure is logged but doesn't affect the application status
**And** the user still sees success message (admin received the application)

**Given** successful application submission
**When** the user sees the success screen
**Then** a message displays: "Кандидатурата е изпратена успешно!"
**And** subtext: "Ще получите потвърждение на имейла си."
**And** a "Обратно към позициите" (Back to Jobs) link is provided

---

## Epic 7: Photo Gallery Management

Admin can manage photo galleries with multi-image upload.

### Story 7.1: Gallery Prisma Model

As a **developer**,
I want **Gallery and GalleryImage models defined in the Prisma schema**,
So that **photo galleries with multiple images can be stored and retrieved**.

**Acceptance Criteria:**

**Given** the backend has Prisma configured
**When** the Gallery model is created and migrated
**Then** the Prisma schema defines a Gallery model with fields:
- `id` (Int, auto-increment, primary key)
- `title` (String, required)
- `description` (String, optional)
- `coverImageUrl` (String, optional - first image or selected cover)
- `status` (Enum: DRAFT, PUBLISHED)
- `publishedAt` (DateTime, optional)
- `createdAt` (DateTime, default now)
- `updatedAt` (DateTime, auto-update)
- `images` (relation to GalleryImage[])

**And** the Prisma schema defines a GalleryImage model with fields:
- `id` (Int, auto-increment, primary key)
- `galleryId` (Int, foreign key to Gallery)
- `imageUrl` (String, required - Cloudinary URL)
- `thumbnailUrl` (String, optional - Cloudinary thumbnail transformation)
- `altText` (String, optional)
- `displayOrder` (Int, default 0)
- `createdAt` (DateTime, default now)

**And** `npx prisma migrate dev --name add-gallery-models` runs successfully
**And** the migrations create `galleries` and `gallery_images` tables
**And** cascade delete is configured (deleting gallery removes all images)

---

### Story 7.2: Gallery CRUD API Endpoints

As a **developer**,
I want **RESTful API endpoints for Gallery CRUD operations**,
So that **the admin panel can manage photo galleries**.

**Acceptance Criteria:**

**Given** authenticated admin user
**When** I send `GET /api/v1/galleries`
**Then** the response returns status 200 with array of galleries
**And** each item includes: id, title, description, coverImageUrl, status, imageCount, publishedAt, createdAt, updatedAt
**And** results are sorted by createdAt descending (newest first)

**Given** authenticated admin user
**When** I send `GET /api/v1/galleries?status=PUBLISHED`
**Then** the response returns only published galleries

**Given** authenticated admin user
**When** I send `GET /api/v1/galleries/:id` with valid ID
**Then** the response returns status 200 with gallery and all images array
**And** images are sorted by displayOrder ascending

**Given** authenticated admin user
**When** I send `GET /api/v1/galleries/:id` with invalid ID
**Then** the response returns status 404 with message: "Галерията не е намерена"

**Given** authenticated admin user with valid gallery data
**When** I send `POST /api/v1/galleries` with title
**Then** the response returns status 201 with the created gallery
**And** status defaults to DRAFT
**And** images array is empty

**Given** authenticated admin user
**When** I send `POST /api/v1/galleries` with missing title
**Then** the response returns status 400 with message: "Заглавието е задължително"

**Given** authenticated admin user
**When** I send `PUT /api/v1/galleries/:id` with updated fields
**Then** the response returns status 200 with the updated gallery
**And** updatedAt is set to current timestamp

**Given** authenticated admin user
**When** I send `DELETE /api/v1/galleries/:id` with valid ID
**Then** the response returns status 200 with message: "Галерията е изтрита успешно"
**And** the gallery and all associated images are removed from the database

---

### Story 7.3: Multi-Image Upload for Gallery

As an **administrator**,
I want **to upload multiple images at once to a gallery**,
So that **I can quickly add photos from kindergarten events**.

**Acceptance Criteria:**

**Given** I am editing a gallery
**When** the ImageUploadZone is rendered for gallery
**Then** it supports multiple file selection (multiple=true)
**And** the zone text says: "Плъзнете снимки тук или кликнете за избор"

**Given** I select multiple images
**When** the images are valid (JPEG, PNG, GIF, WebP, each ≤10MB)
**Then** all images begin uploading in parallel (max 3 concurrent)
**And** each image shows individual upload progress (0-100%)
**And** uploaded images appear as thumbnails in a grid

**Given** authenticated admin user
**When** I send `POST /api/v1/galleries/:id/images` with image files
**Then** each image is uploaded to Cloudinary
**And** Cloudinary generates thumbnail transformation (150x150 crop)
**And** a GalleryImage record is created for each uploaded image
**And** the response returns array of created image objects

**Given** some images fail validation
**When** batch upload is processed
**Then** valid images are uploaded successfully
**And** invalid images show error message next to their thumbnail
**And** user can retry or remove failed uploads

**Given** I view the uploaded images grid
**When** I hover over an image thumbnail
**Then** a delete button (×) appears
**And** clicking delete removes the image from the gallery

**Given** I want to reorder images
**When** I drag an image to a new position
**Then** the displayOrder updates for affected images
**And** the new order is saved automatically

**Given** the gallery has images
**When** I don't select a cover image
**Then** the first image (displayOrder=0) becomes the coverImageUrl automatically

---

### Story 7.4: Gallery List and Form

As an **administrator**,
I want **to manage galleries through a list and form interface**,
So that **I can showcase kindergarten life through photos**.

**Acceptance Criteria:**

**Given** I am logged in and navigate to `/admin/galleries`
**When** the page loads
**Then** I see a list of all galleries using card or grid layout
**And** each card displays: title, cover image thumbnail, StatusBadge, image count (e.g., "12 снимки")
**And** each card has "Редактирай" (Edit) and "Изтрий" (Delete) buttons

**Given** no galleries exist
**When** the list loads
**Then** I see an empty state: "Няма добавени галерии. Създайте първата!"
**And** a prominent "Създай галерия" button is displayed

**Given** I navigate to `/admin/galleries/create`
**When** the form loads
**Then** I see a ContentFormShell layout with:
- Breadcrumb: "Галерия > Създаване"
- "Заглавие" field (required)
- "Описание" textarea (optional)
- ImageUploadZone for multiple images
- Action bar with "Запази чернова" and "Публикувай"

**Given** I am editing an existing gallery at `/admin/galleries/:id/edit`
**When** the form loads
**Then** all fields are pre-populated with existing data
**And** existing images display in a thumbnail grid
**And** I can add more images or remove existing ones

**Given** I click "Публикувай" on a draft gallery
**When** the gallery has at least 1 image
**Then** the status changes to PUBLISHED
**And** a success toast displays: "Галерията е публикувана успешно!"

**Given** I click "Публикувай" on a gallery with 0 images
**When** validation runs
**Then** an error displays: "Добавете поне една снимка преди публикуване"
**And** the gallery remains as DRAFT

**Given** I click "Изтрий" on a gallery
**When** the DeleteConfirmDialog opens
**Then** it shows: "Сигурни ли сте, че искате да изтриете тази галерия? Всички снимки ще бъдат изтрити."

---

### Story 7.5: Public Gallery Display

As a **website visitor**,
I want **to browse photo galleries on the kindergarten website**,
So that **I can see the kindergarten environment and activities**.

**Acceptance Criteria:**

**Given** published galleries exist
**When** I request `GET /api/v1/public/galleries`
**Then** the response returns only PUBLISHED galleries with at least 1 image
**And** each gallery includes: id, title, description, coverImageUrl, imageCount, publishedAt
**And** galleries are sorted by publishedAt descending (newest first)
**And** response time is < 500ms

**Given** published galleries exist
**When** I request `GET /api/v1/public/galleries/:id`
**Then** the response returns the gallery with all images
**And** images are sorted by displayOrder ascending
**And** draft galleries return 404

**Given** the public website Gallery section
**When** the page loads
**Then** galleries display as a grid of cover images with titles
**And** each gallery card shows the image count

**Given** I click on a gallery card
**When** the gallery detail opens
**Then** all images display in a responsive grid
**And** clicking an image opens a lightbox viewer
**And** in lightbox: I can navigate between images with arrows
**And** in lightbox: I can close with × or Escape key
**And** in lightbox: images load from Cloudinary CDN for fast delivery

**Given** keyboard navigation in lightbox
**When** the lightbox is open
**Then** Left/Right arrows navigate between images
**And** Escape closes the lightbox
**And** focus is trapped within lightbox

**Given** no published galleries exist
**When** the Gallery section loads
**Then** a friendly message displays: "Галерията скоро ще бъде обновена."

---

## Epic 8: Email Notification System

Parents automatically receive email notifications when content is published.

### Story 8.1: Email Subscriber Model

As a **developer**,
I want **an EmailSubscriber model to store parent email subscriptions**,
So that **parents can receive notifications about new content**.

**Acceptance Criteria:**

**Given** the backend has Prisma configured
**When** the EmailSubscriber model is created and migrated
**Then** the Prisma schema defines an EmailSubscriber model with fields:
- `id` (Int, auto-increment, primary key)
- `email` (String, required, unique)
- `isActive` (Boolean, default true)
- `subscriptionTypes` (String[], array of: NEWS, EVENTS, DEADLINES)
- `unsubscribeToken` (String, unique - for one-click unsubscribe)
- `subscribedAt` (DateTime, default now)
- `unsubscribedAt` (DateTime, optional)

**And** `npx prisma migrate dev --name add-email-subscriber-model` runs successfully
**And** the migration creates the `email_subscribers` table

---

### Story 8.2: Parent Subscription Management API

As a **developer**,
I want **API endpoints for parent email subscriptions**,
So that **parents can subscribe and unsubscribe from notifications**.

**Acceptance Criteria:**

**Given** a parent wants to subscribe
**When** they send `POST /api/v1/public/subscribe` with email and subscriptionTypes
**Then** the response returns status 201 with confirmation message
**And** a unique unsubscribeToken is generated
**And** the subscriber is added to the database with isActive=true

**Given** a parent submits an already-subscribed email
**When** the API processes the request
**Then** the response returns status 200 (not error) with message: "Вече сте абонирани"
**And** existing subscription is not duplicated

**Given** email validation
**When** an invalid email is submitted
**Then** the response returns status 400 with message: "Невалиден имейл адрес"

**Given** a parent clicks the unsubscribe link
**When** they send `GET /api/v1/public/unsubscribe?token=[unsubscribeToken]`
**Then** the subscriber's isActive is set to false
**And** unsubscribedAt is set to current timestamp
**And** a confirmation page displays: "Успешно се отписахте от известията"

**Given** an invalid or expired unsubscribe token
**When** the unsubscribe endpoint is called
**Then** the response returns status 400 with message: "Невалиден или изтекъл линк"

**Given** authenticated admin user
**When** they send `GET /api/v1/subscribers`
**Then** the response returns count of active subscribers per type
**And** no individual emails are exposed (privacy protection)

---

### Story 8.3: AWS SES Email Service Integration

As a **developer**,
I want **a centralized email service using AWS SES**,
So that **all notification emails are sent reliably**.

**Acceptance Criteria:**

**Given** the backend needs to send emails
**When** the email service is configured
**Then** AWS SES credentials are loaded from environment variables:
- `AWS_SES_ACCESS_KEY_ID`
- `AWS_SES_SECRET_ACCESS_KEY`
- `AWS_SES_REGION`
- `AWS_SES_FROM_EMAIL` (verified sender email)

**Given** the email service is initialized
**When** the application starts
**Then** the service verifies AWS SES connection
**And** logs success or failure at startup

**Given** an email needs to be sent
**When** the service sends the email
**Then** it uses AWS SES v3 SDK
**And** supports HTML email content with inline styles
**And** includes plain text fallback

**Given** email send fails
**When** the failure is detected
**Then** the service retries up to 3 times with exponential backoff (1s, 2s, 4s)
**And** after all retries fail, the error is logged with full details
**And** the failure is recorded in a failed_emails log/table

**Given** rate limiting requirements
**When** sending bulk notifications
**Then** emails are sent at max 14 per second (SES sandbox limit)
**And** for production, rate adjusts based on SES account limits

**Given** email templates
**When** notification emails are composed
**Then** templates are stored as TypeScript functions
**And** templates support variable interpolation
**And** all templates include unsubscribe link in footer

---

### Story 8.4: Publish Trigger Notifications

As a **parent subscriber**,
I want **to receive email notifications when new content is published**,
So that **I stay informed about kindergarten news, events, and deadlines**.

**Acceptance Criteria:**

**Given** a news item is published (status changes to PUBLISHED)
**When** the publish action completes successfully
**Then** the system triggers notification to all active subscribers with NEWS type
**And** emails are queued asynchronously (doesn't block the publish response)

**Given** an event is published
**When** the publish action completes successfully
**Then** the system triggers notification to all active subscribers with EVENTS type

**Given** a deadline is published
**When** the publish action completes successfully
**Then** the system triggers notification to all active subscribers with DEADLINES type

**Given** the notification email for news
**When** it is composed
**Then** the subject is: "Ново в [Kindergarten Name]: [News Title]"
**And** the body includes:
- News title as heading
- First 200 characters of content (HTML stripped) as excerpt
- "Прочетете повече" link to the full news article
- Unsubscribe link in footer

**Given** the notification email for events
**When** it is composed
**Then** the subject is: "Предстоящо събитие: [Event Title]"
**And** the body includes:
- Event title and date (dd.MM.yyyy)
- Location (if present)
- Description excerpt
- "Вижте детайлите" link to event page
- Unsubscribe link

**Given** the notification email for deadlines
**When** it is composed
**Then** the subject is: "Важен срок: [Deadline Title]"
**And** the body includes:
- Deadline title and date (dd.MM.yyyy)
- Visual urgency indicator if isUrgent=true
- Description excerpt
- "Вижте детайлите" link
- Unsubscribe link

**Given** an item is updated (already published)
**When** the update is saved
**Then** NO notification is sent (only first publish triggers notification)

**Given** a draft is saved
**When** the save completes
**Then** NO notification is sent (only PUBLISHED status triggers)

**Given** email delivery tracking
**When** notifications are sent
**Then** the system logs: contentType, contentId, subscriberCount, sentCount, failedCount, timestamp

---

## Epic 9: Public Website API Integration

Public website dynamically displays all published content with developer tools.

### Story 9.1: Unified Public Content API

As a **developer**,
I want **optimized public API endpoints for all content types**,
So that **the public website can fetch content efficiently**.

**Acceptance Criteria:**

**Given** the public website needs to fetch content
**When** requesting any public endpoint
**Then** all endpoints follow consistent pattern: `GET /api/v1/public/[resource]`
**And** all responses follow JSend format: `{ status: "success", data: {...} }`
**And** all endpoints return only PUBLISHED content
**And** response time is < 500ms for all endpoints

**Given** the public API needs a summary endpoint
**When** I request `GET /api/v1/public/homepage`
**Then** the response includes aggregated data for homepage display:
- Latest 3 published news items (title, excerpt, publishedAt)
- Upcoming 3 events (title, eventDate, isImportant)
- Active deadlines count with nearest deadline date
- Latest gallery cover image
**And** single API call reduces frontend complexity

**Given** caching requirements
**When** public content is fetched
**Then** responses include Cache-Control headers (max-age=60 for lists, max-age=300 for individual items)
**And** ETags are generated for cache validation

**Given** pagination for large content lists
**When** I request `GET /api/v1/public/news?page=1&limit=10`
**Then** the response includes pagination metadata:
- `totalCount`: total number of items
- `page`: current page number
- `limit`: items per page
- `totalPages`: calculated total pages
**And** default limit is 10, max limit is 50

---

### Story 9.2: Individual Content Detail Pages

As a **website visitor**,
I want **to view full details of individual content items**,
So that **I can read complete news articles, event details, and more**.

**Acceptance Criteria:**

**Given** I navigate to a news detail page
**When** the page loads with route `/news/:id`
**Then** the frontend fetches `GET /api/v1/public/news/:id`
**And** the full news item displays: title, full content (HTML), image, publication date
**And** Bulgarian date formatting is used (dd.MM.yyyy)

**Given** I navigate to an event detail page
**When** the page loads with route `/events/:id`
**Then** the full event displays: title, description, date, end date (if multi-day), location, image
**And** if isImportant=true, visual indicator shows

**Given** I navigate to a deadline detail page
**When** the page loads with route `/deadlines/:id`
**Then** the full deadline displays: title, description, deadline date
**And** if isUrgent=true, visual urgency indicator shows
**And** if deadline is < 7 days away, countdown displays

**Given** I navigate to a job detail page
**When** the page loads with route `/jobs/:id`
**Then** the full job displays: title, description, requirements, application deadline
**And** "Кандидатствай" button is prominent (if isActive=true)

**Given** I request a non-existent or draft content item
**When** the API returns 404
**Then** a friendly 404 page displays: "Съдържанието не е намерено"
**And** a link to homepage is provided

**Given** SEO requirements
**When** content detail pages render
**Then** appropriate meta tags are included: title, description, og:image
**And** URLs are clean and shareable

---

### Story 9.3: Health Check and Monitoring Endpoints

As a **developer**,
I want **health check and monitoring endpoints**,
So that **I can monitor system availability and performance**.

**Acceptance Criteria:**

**Given** uptime monitoring service
**When** it requests `GET /api/v1/health`
**Then** the response returns status 200 with:
```json
{
  "status": "ok",
  "timestamp": "2026-02-03T10:30:00Z",
  "version": "1.0.0",
  "uptime": 86400
}
```
**And** response time is < 100ms

**Given** the health check needs to verify dependencies
**When** requesting `GET /api/v1/health?deep=true`
**Then** the response includes dependency status:
```json
{
  "status": "ok",
  "database": "connected",
  "cloudinary": "connected",
  "ses": "connected"
}
```
**And** if any dependency is unhealthy, status becomes "degraded"
**And** unhealthy dependencies are listed with error messages

**Given** the deep health check
**When** a database query fails
**Then** status is "unhealthy" and database shows error
**And** HTTP status code is 503 (Service Unavailable)

**Given** authenticated developer access
**When** requesting `GET /api/v1/metrics` with developer credentials
**Then** the response includes basic metrics:
- Request count (last hour, last 24 hours)
- Average response time
- Error rate
- Active database connections
**And** this endpoint is NOT public (requires auth)

---

### Story 9.4: Centralized Error Logging

As a **developer**,
I want **centralized error logging with Winston**,
So that **I can troubleshoot issues efficiently**.

**Acceptance Criteria:**

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

---

### Story 9.5: Environment Configuration and Developer Access

As a **developer**,
I want **secure access to environment configuration and debugging tools**,
So that **I can troubleshoot third-party service integrations**.

**Acceptance Criteria:**

**Given** the backend needs environment configuration
**When** the application starts
**Then** all required environment variables are validated at startup
**And** missing required variables cause startup failure with clear error message
**And** `.env.example` documents all variables with descriptions

**Given** required environment variables
**When** configuration is documented
**Then** the following are required:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT signing
- `JWT_REFRESH_SECRET`: Secret key for refresh tokens
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
