# Story 1.6: Frontend Authentication Integration

Status: done

## Story

As an **administrator**,
I want **to log in through a Bulgarian login page**,
So that **I can access the protected admin panel**.

## Acceptance Criteria

1. **AC1: Redirect to Login When Unauthenticated**
   - Given I navigate to `/admin` without being logged in
   - When the page loads
   - Then I am redirected to `/admin/login`
   - And the login page displays in Bulgarian with fields for "Имейл" and "Парола"

2. **AC2: Successful Login Flow**
   - Given I am on the login page
   - When I enter valid credentials and click "Вход"
   - Then the system stores the accessToken and refreshToken
   - And I am redirected to `/admin/dashboard`
   - And subsequent API requests include the Authorization header with Bearer token

3. **AC3: Invalid Credentials Error**
   - Given I am on the login page
   - When I enter invalid credentials and click "Вход"
   - Then a Bulgarian error message displays: "Невалиден имейл или парола"
   - And I remain on the login page

4. **AC4: Logout Flow**
   - Given I am logged in to the admin panel
   - When I click "Изход" (Logout)
   - Then my tokens are cleared from storage
   - And I am redirected to `/admin/login`

5. **AC5: Automatic Token Refresh**
   - Given my accessToken is about to expire (< 5 minutes remaining)
   - When I make any API request
   - Then the frontend automatically refreshes the token in the background
   - And my session continues without interruption

6. **AC6: Protected Route Guard**
   - Given the ProtectedRoute component wraps admin routes
   - When an unauthenticated user tries to access any `/admin/*` route (except login)
   - Then they are redirected to `/admin/login`

## Tasks / Subtasks

- [x] **Task 1: Create API Client with Axios** (AC: 2, 3, 5)
  - [x] 1.1: Create `src/lib/api.ts` with axios instance configured for `VITE_API_URL`
  - [x] 1.2: Add request interceptor to attach Bearer token from storage
  - [x] 1.3: Add response interceptor to handle 401 errors and trigger token refresh
  - [x] 1.4: Implement automatic token refresh when access token expires

- [x] **Task 2: Create Auth Context and Hook** (AC: 1, 2, 4, 6)
  - [x] 2.1: Create `src/contexts/AuthContext.tsx` with AuthProvider component
  - [x] 2.2: Implement state for `isAuthenticated`, `user`, `isLoading`
  - [x] 2.3: Create `login(email, password)` function calling backend API
  - [x] 2.4: Create `logout()` function clearing tokens and calling backend
  - [x] 2.5: Create `refreshToken()` function for silent token refresh
  - [x] 2.6: Create `src/hooks/useAuth.ts` hook for consuming AuthContext

- [x] **Task 3: Create Token Storage Utilities** (AC: 2, 4, 5)
  - [x] 3.1: Create `src/lib/auth.ts` with token storage functions
  - [x] 3.2: Implement `getAccessToken()`, `setAccessToken()`, `removeAccessToken()`
  - [x] 3.3: Implement `getRefreshToken()`, `setRefreshToken()`, `removeRefreshToken()`
  - [x] 3.4: Implement `getTokenExpiry()` to decode JWT and check expiration
  - [x] 3.5: Implement `isTokenExpiringSoon(threshold)` for proactive refresh

- [x] **Task 4: Create Login Page** (AC: 1, 2, 3)
  - [x] 4.1: Create `src/pages/admin/Login.tsx` with Bulgarian labels
  - [x] 4.2: Use react-hook-form with zod validation for email and password
  - [x] 4.3: Display form with "Имейл", "Парола" labels and "Вход" button
  - [x] 4.4: Handle login errors and display Bulgarian error messages
  - [x] 4.5: Redirect to `/admin/dashboard` on successful login
  - [x] 4.6: Style using existing Tailwind/shadcn-ui components

- [x] **Task 5: Create ProtectedRoute Component** (AC: 6)
  - [x] 5.1: Create `src/components/auth/ProtectedRoute.tsx`
  - [x] 5.2: Check `isAuthenticated` from AuthContext
  - [x] 5.3: Show loading spinner while checking auth state
  - [x] 5.4: Redirect to `/admin/login` if not authenticated
  - [x] 5.5: Render children if authenticated

- [x] **Task 6: Create Admin Dashboard Placeholder** (AC: 2)
  - [x] 6.1: Create `src/pages/admin/Dashboard.tsx` with Bulgarian welcome message
  - [x] 6.2: Display "Табло" header and "Изход" button
  - [x] 6.3: Wire up logout button to AuthContext logout

- [x] **Task 7: Update App Router** (AC: 1, 6)
  - [x] 7.1: Add AuthProvider wrapper around app routes
  - [x] 7.2: Add `/admin/login` route pointing to Login page
  - [x] 7.3: Add `/admin/dashboard` route wrapped in ProtectedRoute
  - [x] 7.4: Add `/admin` redirect to `/admin/dashboard`
  - [x] 7.5: Ensure public routes remain accessible without auth

- [x] **Task 8: Add Environment Configuration** (AC: 2)
  - [x] 8.1: Create/update `frontend/.env.example` with `VITE_API_URL`
  - [x] 8.2: Create `frontend/.env.local` with local development API URL

- [x] **Task 9: Write Tests** (AC: 1-6)
  - [x] 9.1: Test ProtectedRoute redirects when unauthenticated
  - [x] 9.2: Test Login form validation
  - [x] 9.3: Test successful login flow
  - [x] 9.4: Test logout clears tokens

## Dev Notes

### Backend API Reference (Stories 1.4 & 1.5)

The backend authentication API is fully implemented and tested. Here are the exact endpoints:

**Login Endpoint:**
```
POST /api/client/auth/login
Content-Type: application/json

Request Body:
{
  "email": "admin@kindergarten.bg",
  "password": "password123"
}

Success Response (200):
{
  "success": true,
  "message": "Success",
  "content": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": {
      "id": 1,
      "email": "admin@kindergarten.bg",
      "role": "ADMIN"
    }
  }
}

Error Response (401):
{
  "success": false,
  "message": "Невалиден имейл или парола",
  "error": "ERROR_AUTH"
}

Rate Limit Response (429) - after 5 failed attempts:
{
  "success": false,
  "message": "Твърде много опити. Опитайте отново след 15 минути.",
  "error": "RATE_LIMIT_EXCEEDED"
}
```

**Token Refresh Endpoint:**
```
POST /api/client/auth/refresh
Content-Type: application/json

Request Body:
{
  "refreshToken": "eyJ..."
}

Success Response (200):
{
  "success": true,
  "message": "Success",
  "content": {
    "accessToken": "eyJ..."
  }
}

Error Response (401) - expired refresh token:
{
  "success": false,
  "message": "Сесията е изтекла. Моля, влезте отново.",
  "error": "ERROR_AUTH"
}
```

**Logout Endpoint:**
```
POST /api/client/auth/logout
Content-Type: application/json
Authorization: Bearer <accessToken>

Request Body:
{
  "refreshToken": "eyJ..."
}

Success Response (200):
{
  "success": true,
  "message": "Success",
  "content": null
}
```

### JWT Token Structure

**Access Token Payload (expires in 1 hour):**
```typescript
{
  userId: number,
  email: string,
  role: 'ADMIN' | 'DEVELOPER',
  exp: number  // Unix timestamp
}
```

**Refresh Token Payload (expires in 7 days):**
```typescript
{
  userId: number,
  type: 'refresh',
  exp: number  // Unix timestamp
}
```

### Architecture Requirements [Source: architecture.md]

**Frontend Authentication Flow:**
1. User submits login form → `POST /api/client/auth/login`
2. On success, store `accessToken` and `refreshToken` in localStorage
3. All API requests include `Authorization: Bearer <accessToken>` header
4. When accessToken expires (< 5 min remaining), call `/api/client/auth/refresh` silently
5. On logout, call `/api/client/auth/logout` and clear tokens from storage

**Required Files (per architecture.md#Project Structure):**
```
frontend/src/
├── contexts/
│   └── AuthContext.tsx     # Authentication context provider
├── hooks/
│   └── useAuth.ts          # Authentication hook (AuthContext consumer)
├── lib/
│   ├── api.ts              # API client (axios wrapper)
│   └── auth.ts             # JWT token management utilities
├── components/
│   └── auth/
│       └── ProtectedRoute.tsx  # Route guard component
└── pages/
    └── admin/
        ├── Login.tsx       # Login page
        └── Dashboard.tsx   # Dashboard placeholder
```

### Bulgarian Text Requirements

**Login Page:**
- Page title: "Вход в администраторския панел"
- Email label: "Имейл"
- Password label: "Парола"
- Submit button: "Вход"
- Error message (invalid credentials): "Невалиден имейл или парола"
- Error message (rate limit): "Твърде много опити. Опитайте отново след 15 минути."

**Dashboard:**
- Header: "Табло"
- Logout button: "Изход"

### Token Storage Strategy

Use localStorage for token storage (per architecture.md decision). The tokens are:
- `accessToken` - Short-lived (1 hour), sent with every API request
- `refreshToken` - Long-lived (7 days), only used for token refresh

```typescript
// src/lib/auth.ts pattern
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const setAccessToken = (token: string) => localStorage.setItem(ACCESS_TOKEN_KEY, token);
export const removeAccessToken = () => localStorage.removeItem(ACCESS_TOKEN_KEY);
// ... similar for refreshToken
```

### Automatic Token Refresh Pattern

Check token expiry before API requests and refresh proactively:

```typescript
// Check if token expires in less than 5 minutes
const isTokenExpiringSoon = (token: string, thresholdMinutes = 5): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresAt = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const threshold = thresholdMinutes * 60 * 1000;
    return expiresAt - now < threshold;
  } catch {
    return true; // Treat as expired if can't parse
  }
};
```

### Axios Interceptor Pattern

```typescript
// src/lib/api.ts pattern
import axios from 'axios';
import { getAccessToken, getRefreshToken, setAccessToken } from './auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor - attach token
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401 and refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/client/auth/refresh`, {
            refreshToken,
          });
          setAccessToken(data.content.accessToken);
          // Retry original request
          error.config.headers.Authorization = `Bearer ${data.content.accessToken}`;
          return api(error.config);
        } catch {
          // Refresh failed - clear tokens and redirect to login
        }
      }
    }
    return Promise.reject(error);
  }
);
```

### Existing Frontend Stack

From `frontend/package.json`:
- React 18.3.1 with TypeScript
- react-router-dom 6.30.1 (for routing)
- @tanstack/react-query 5.83.0 (for data fetching - optional for auth)
- react-hook-form 7.61.1 (for form handling)
- zod 3.25.76 (for validation)
- shadcn-ui components (Button, Input, Label, Card, etc.)
- Tailwind CSS for styling

**Note:** Axios is NOT currently installed. Either:
1. Install axios: `npm install axios` (recommended for interceptor pattern)
2. Use fetch with custom wrapper (more code but no new dependency)

### Recommended: Install Axios

```bash
cd frontend
npm install axios
```

### Current App Router (from App.tsx)

Currently no admin routes exist. The App.tsx uses:
- `BrowserRouter` with `Routes` and `Route`
- QueryClientProvider for TanStack Query
- Public routes: `/`, `/groups`, `/admission`, etc.

Add admin routes BEFORE the `*` catch-all route.

### Testing Verification Commands

```bash
cd frontend
npm run dev
# Navigate to http://localhost:5173/admin → should redirect to /admin/login
# Login with valid credentials → should redirect to /admin/dashboard
# Click logout → should redirect to /admin/login

# Run tests
npm run test
```

### Test Admin User

Use the seeded admin user (from Story 1.3):
- Email: (check backend/.env or seed script)
- Password: (check backend/.env or seed script)

### Project Structure Notes

**Alignment with unified project structure:**
- Admin pages go in `src/pages/admin/` (new folder)
- Auth components go in `src/components/auth/` (new folder)
- Context providers go in `src/contexts/` (new folder)
- Hooks go in `src/hooks/` (already exists, has `use-mobile.tsx`)
- Utilities go in `src/lib/` (already has utils)

**Path alias:** Use `@/` for imports (configured in vite.config.ts)

### Previous Story Intelligence

**From Story 1.4:**
- Backend auth is fully implemented with login, refresh, logout endpoints
- JSend response format: `{ success: boolean, message: string, content: {...} }`
- Rate limiting: 5 attempts per 15 minutes per IP
- Bulgarian error messages already configured in backend

**From Story 1.5:**
- Error messages refined to exact Bulgarian wording
- "Неоторизиран достъп" for protected endpoint without token
- "Сесията е изтекла. Моля, влезте отново." for expired refresh token

**Files Created in Previous Stories (backend):**
- `backend/src/routes/client/v1/user_auth_route.ts` - Auth endpoints
- `backend/src/services/client/user_auth/login_service.ts` - Login logic
- `backend/src/services/client/user_auth/refresh_token_service.ts` - Refresh logic
- `backend/src/services/client/user_auth/logout_service.ts` - Logout logic

### Common Pitfalls to Avoid

1. **Don't use Redux/Zustand** - Architecture specifies React Context API for auth state
2. **Don't store tokens in memory only** - Use localStorage per architecture decision
3. **Don't forget CORS** - Backend already configured to allow frontend URL
4. **Don't hardcode API URL** - Use `import.meta.env.VITE_API_URL`
5. **Don't create English error messages** - All user-facing text must be Bulgarian
6. **Don't skip loading states** - Show spinner while checking authentication

### References

- [Architecture: Authentication System](_bmad-output/planning-artifacts/architecture.md#Authentication System)
- [Architecture: Frontend Architecture Decisions](_bmad-output/planning-artifacts/architecture.md#Frontend Architecture Decisions)
- [Story 1.4: JWT Authentication API](./1-4-jwt-authentication-api.md)
- [Story 1.5: Session Management and Token Refresh](./1-5-session-management-and-token-refresh.md)
- [React Auth Kit - Refresh Token](https://authkit.arkadip.dev/getting_started/refreshtoken/)
- [BezKoder - React Refresh Token with Axios Interceptors](https://www.bezkoder.com/react-refresh-token/)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- All 30 tests pass (18 auth utility tests, 3 ProtectedRoute tests, 8 Login tests, 1 example test)
- TypeScript compilation passes with no errors

### Senior Developer Review (AI)

**Reviewed:** 2026-02-06
**Reviewer:** Claude Opus 4.5 (Code Review Agent)
**Outcome:** Changes Requested → Fixed

**Issues Found:** 9 total (0 Critical, 2 High, 4 Medium, 3 Low)
**Issues Fixed:** 6 (2 High, 4 Medium)
**Issues Deferred:** 3 Low (L1: Silent error handling, L2: No direct AuthContext tests, L3: No API interceptor tests)

**Summary:**
- All acceptance criteria verified as implemented
- All tasks verified as complete
- Documentation errors corrected (API endpoint paths)
- Missing logout test added
- Login page now redirects authenticated users
- Token refresh race condition fixed
- Hard redirect removed for better SPA navigation

### Completion Notes List

- **Task 1**: Created `src/lib/api.ts` with Axios client, request interceptor for Bearer token, response interceptor for 401 handling and token refresh, proactive token refresh when token expiring soon
- **Task 2**: Created `src/contexts/AuthContext.tsx` with AuthProvider, login/logout/refreshToken functions, and `src/hooks/useAuth.ts` hook
- **Task 3**: Created `src/lib/auth.ts` with token storage (localStorage), getTokenExpiry, isTokenExpiringSoon, isTokenExpired utilities
- **Task 4**: Created `src/pages/admin/Login.tsx` with Bulgarian labels, react-hook-form + zod validation, error handling
- **Task 5**: Created `src/components/auth/ProtectedRoute.tsx` with auth check, loading state, redirect to login
- **Task 6**: Created `src/pages/admin/Dashboard.tsx` with Bulgarian welcome message and logout button
- **Task 7**: Updated `src/App.tsx` with AuthProvider wrapper, admin routes, ProtectedRoute wrapping
- **Task 8**: Created `frontend/.env.example` and `frontend/.env.local` with VITE_API_URL
- **Task 9**: Created comprehensive tests for auth utilities, ProtectedRoute, and Login page

### File List

**Created:**
- frontend/src/lib/api.ts
- frontend/src/lib/auth.ts
- frontend/src/contexts/AuthContext.tsx
- frontend/src/hooks/useAuth.ts
- frontend/src/components/auth/ProtectedRoute.tsx
- frontend/src/pages/admin/Login.tsx
- frontend/src/pages/admin/Dashboard.tsx
- frontend/.env.example
- frontend/.env.local
- frontend/src/test/auth.test.ts
- frontend/src/test/ProtectedRoute.test.tsx
- frontend/src/test/Login.test.tsx
- frontend/src/test/AuthContext.test.tsx (added during code review)

**Modified:**
- frontend/src/App.tsx (added AuthProvider, admin routes)
- frontend/package.json (added axios, @testing-library/user-event)
- frontend/vite.config.ts (added @shared alias for shared types)

## Change Log

- 2026-02-06: Story implementation complete - All 9 tasks completed, 30 tests pass
- 2026-02-06: Code review completed - Fixed 6 issues (2 HIGH, 4 MEDIUM):
  - H1: Added missing logout test (AuthContext.test.tsx)
  - H2: Added auth redirect to Login page for already-authenticated users
  - M1: Corrected API endpoint documentation from /api/v1 to /api/client
  - M2: Removed hard window.location redirect in api.ts, letting AuthContext handle redirects
  - M3: Fixed race condition in token refresh subscriber pattern with proper reject handling
  - M4: Updated File List to include vite.config.ts and new test file
