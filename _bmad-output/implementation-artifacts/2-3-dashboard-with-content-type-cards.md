# Story 2.3: Dashboard with Content Type Cards

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an **administrator**,
I want **a dashboard showing all 6 content types as cards**,
So that **I can quickly see content status and access any section**.

## Acceptance Criteria

### AC1: Dashboard Layout with 6 Content Type Cards
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

### AC2: Content Counts from API
**Given** content exists in the database
**When** the dashboard loads
**Then** each card displays draft and published counts (e.g., "2 чернови, 5 публикувани")
**And** counts are fetched from the API via `GET /api/v1/stats/content-counts`

### AC3: Empty State
**Given** no content exists yet
**When** the dashboard loads
**Then** cards display "0 чернови, 0 публикувани"
**And** the "Създай" button remains prominent and clickable

### AC4: Mobile Responsive Layout
**Given** I am on mobile (<768px)
**When** the dashboard renders
**Then** cards display in a single column layout
**And** all functionality remains accessible

### AC5: Card Navigation
**Given** I click on a card's title or body area
**When** the click is registered
**Then** I am navigated to that content type's list view (e.g., `/admin/news`)

### AC6: Create Button Navigation
**Given** I click a card's "Създай" button
**When** the click is registered
**Then** I am navigated to that content type's create form (e.g., `/admin/news/create`)

## Tasks / Subtasks

- [x] **Task 1: Create ContentTypeCard Component** (AC: 1, 5, 6)
  - [x] 1.1: Create `src/components/dashboard/ContentTypeCard.tsx`
  - [x] 1.2: Accept props: icon (emoji), title (string), draftCount (number), publishedCount (number), onCardClick (function), onCreateClick (function)
  - [x] 1.3: Render Card with icon at top, title, count text, and "Създай" button
  - [x] 1.4: Style with shadcn Card component and Tailwind CSS
  - [x] 1.5: Make entire card clickable except "Създай" button (separate click handlers)
  - [x] 1.6: Add hover effects for better UX

- [x] **Task 2: Create API Hook for Content Counts** (AC: 2, 3)
  - [x] 2.1: Create `src/hooks/useContentCounts.ts` custom hook
  - [x] 2.2: Use `api.get('/api/v1/stats/content-counts')` to fetch counts
  - [x] 2.3: Return data structure: `{ news: { draft: number, published: number }, careers: {...}, events: {...}, deadlines: {...}, gallery: {...}, teachers: {...} }`
  - [x] 2.4: Handle loading state
  - [x] 2.5: Handle error state
  - [x] 2.6: Return default counts (0 draft, 0 published) if API fails or data missing

- [x] **Task 3: Create Backend API Endpoint** (AC: 2)
  - [x] 3.1: Create `backend/src/routes/stats.routes.ts`
  - [x] 3.2: Define `GET /api/v1/stats/content-counts` endpoint
  - [x] 3.3: Return mock data for now: `{ news: { draft: 0, published: 0 }, careers: { draft: 0, published: 0 }, ... }`
  - [x] 3.4: Add JWT authentication middleware (protected route)
  - [x] 3.5: Register stats routes in main Express app

- [x] **Task 4: Update Dashboard Component** (AC: 1, 2, 3, 4, 5, 6)
  - [x] 4.1: Update `src/pages/admin/Dashboard.tsx` to use AdminLayout (already done in Story 2.2)
  - [x] 4.2: Import and use `useContentCounts()` hook
  - [x] 4.3: Create contentTypes config array with 6 items (icon, title key, route path)
  - [x] 4.4: Map over contentTypes and render ContentTypeCard for each
  - [x] 4.5: Implement 2-column grid layout (Tailwind: `grid grid-cols-1 md:grid-cols-2 gap-6`)
  - [x] 4.6: Handle card click: navigate to list view (e.g., `/admin/news`)
  - [x] 4.7: Handle create button click: navigate to create form (e.g., `/admin/news/create`)
  - [x] 4.8: Show loading state while fetching counts
  - [x] 4.9: Remove old placeholder content (welcome card)

- [x] **Task 5: Add Missing Translations** (AC: 1)
  - [x] 5.1: Verify contentTypes translations exist in `src/lib/i18n/bg.ts` (added in Story 2.1)
  - [x] 5.2: Add any missing dashboard-specific translations (e.g., "чернови", "публикувани")

- [x] **Task 6: Write Component Tests** (AC: 1, 2, 3, 4, 5, 6)
  - [x] 6.1: Test ContentTypeCard renders icon, title, counts, and button
  - [x] 6.2: Test ContentTypeCard card click calls onCardClick handler
  - [x] 6.3: Test ContentTypeCard create button click calls onCreateClick handler
  - [x] 6.4: Test useContentCounts hook fetches data from API
  - [x] 6.5: Test useContentCounts hook handles loading state
  - [x] 6.6: Test useContentCounts hook handles error state
  - [x] 6.7: Test Dashboard renders 6 ContentTypeCard components
  - [x] 6.8: Test Dashboard navigates on card click
  - [x] 6.9: Test Dashboard navigates on create button click
  - [x] 6.10: Test Dashboard responsive grid layout

- [x] **Task 7: Write Backend API Tests** (AC: 2)
  - [x] 7.1: Test GET /api/v1/stats/content-counts returns expected structure
  - [x] 7.2: Test endpoint requires authentication (401 without token)
  - [x] 7.3: Test endpoint returns valid JSON response

## Dev Notes

### Story Requirements [Source: epics.md#Story 2.3]

**Core Functionality:**
- Dashboard displays 6 content type cards in a grid
- Each card shows: icon (emoji), Bulgarian title, draft count, published count, "Създай" button
- Cards are clickable to navigate to list view
- "Създай" button navigates to create form
- API endpoint: `GET /api/v1/stats/content-counts` provides counts
- Mobile responsive: 2-column grid on desktop, 1-column on mobile

**Content Types (from Story 2.1 translations):**
1. **News** (Новини) - Icon: 📰 - Path: `/admin/news`
2. **Jobs** (Кариери) - Icon: 💼 - Path: `/admin/careers`
3. **Events** (Събития) - Icon: 📅 - Path: `/admin/events`
4. **Deadlines** (Срокове) - Icon: ⏰ - Path: `/admin/deadlines`
5. **Gallery** (Галерия) - Icon: 🖼️ - Path: `/admin/gallery`
6. **Teachers** (Учители) - Icon: 👨‍🏫 - Path: `/admin/teachers`

### Architecture Requirements [Source: architecture.md]

**Frontend Architecture:**
- React 18.3.1 with TypeScript (strict mode enabled)
- State Management: React Context API for auth, component-level state with `useState` for UI
- No Redux/Zustand needed - keep it simple per architecture decision
- Routing: React Router DOM v6.30.1

**Component Library:**
- shadcn-ui pattern with Radix UI primitives
- Use existing Card component from `@/components/ui/card`
- Use existing Button component from `@/components/ui/button`
- Tailwind CSS 3.4.17 for all styling

**API Communication:**
- Axios client configured in `src/lib/api.ts` with JWT interceptors
- Base URL: `http://localhost:3344` (from VITE_API_URL env)
- All API routes prefixed with `/api/v1/`
- Authentication: Bearer token automatically attached by Axios interceptors

**File Structure [Source: architecture.md#Monorepo Structure]:**
```
frontend/src/
├── components/
│   ├── dashboard/
│   │   └── ContentTypeCard.tsx          # NEW - Card component for content types
│   ├── layout/                          # Exists from Story 2.2
│   │   ├── AdminLayout.tsx              # USE - Wraps all admin pages
│   │   └── ...
│   └── ui/                              # shadcn components
│       ├── card.tsx                     # USE - Card, CardHeader, CardTitle, CardContent
│       └── button.tsx                   # USE - Button component
├── hooks/
│   ├── useAuth.ts                       # Exists from Story 1.6
│   └── useContentCounts.ts              # NEW - Custom hook for fetching content counts
├── pages/
│   └── admin/
│       └── Dashboard.tsx                # MODIFY - Update with 6 content type cards
├── lib/
│   ├── api.ts                           # USE - Axios instance with auth interceptors
│   ├── auth.ts                          # USE - Token management utilities
│   └── i18n/
│       ├── bg.ts                        # USE - Bulgarian translations (contentTypes exist)
│       └── index.ts                     # USE - useTranslation hook
└── test/
    ├── ContentTypeCard.test.tsx         # NEW - Component tests
    ├── useContentCounts.test.ts         # NEW - Hook tests
    └── Dashboard.test.tsx               # EXISTS - Update with new dashboard tests

backend/src/
├── routes/
│   └── stats.routes.ts                  # NEW - Stats API routes
├── middleware/
│   └── auth.middleware.ts               # EXISTS - JWT authentication middleware
└── __test__/
    └── stats.routes.test.ts             # NEW - API endpoint tests
```

### Technical Implementation Requirements

**1. ContentTypeCard Component Structure:**
```typescript
// src/components/dashboard/ContentTypeCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ContentTypeCardProps {
  icon: string;                    // Emoji string (e.g., "📰")
  title: string;                   // Bulgarian title from translations
  draftCount: number;              // Draft content count
  publishedCount: number;          // Published content count
  onCardClick: () => void;         // Navigate to list view
  onCreateClick: () => void;       // Navigate to create form
}

// Card should be clickable except the Create button
// Use cursor-pointer on Card, prevent event propagation on Button
```

**2. Content Counts API Hook Pattern:**
```typescript
// src/hooks/useContentCounts.ts
import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface ContentCounts {
  news: { draft: number; published: number };
  careers: { draft: number; published: number };
  events: { draft: number; published: number };
  deadlines: { draft: number; published: number };
  gallery: { draft: number; published: number };
  teachers: { draft: number; published: number };
}

export function useContentCounts() {
  const [data, setData] = useState<ContentCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await api.get('/api/v1/stats/content-counts');
        setData(response.data.content || getDefaultCounts());
      } catch (err) {
        setError(err as Error);
        setData(getDefaultCounts()); // Graceful fallback
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  return { data, loading, error };
}

// Helper function for default/fallback counts
function getDefaultCounts(): ContentCounts {
  return {
    news: { draft: 0, published: 0 },
    careers: { draft: 0, published: 0 },
    events: { draft: 0, published: 0 },
    deadlines: { draft: 0, published: 0 },
    gallery: { draft: 0, published: 0 },
    teachers: { draft: 0, published: 0 },
  };
}
```

**3. Dashboard Component Pattern:**
```typescript
// src/pages/admin/Dashboard.tsx
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';
import { useContentCounts } from '@/hooks/useContentCounts';
import { ContentTypeCard } from '@/components/dashboard/ContentTypeCard';

// Content types configuration
const contentTypes = [
  { key: 'news', icon: '📰', path: '/admin/news' },
  { key: 'careers', icon: '💼', path: '/admin/careers' },
  { key: 'events', icon: '📅', path: '/admin/events' },
  { key: 'deadlines', icon: '⏰', path: '/admin/deadlines' },
  { key: 'gallery', icon: '🖼️', path: '/admin/gallery' },
  { key: 'teachers', icon: '👨‍🏫', path: '/admin/teachers' },
] as const;

const Dashboard = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const { data: counts, loading } = useContentCounts();

  // Note: Dashboard is already wrapped by AdminLayout (Story 2.2)
  // Remove the old header/logout UI - it's now in AdminLayout's sidebar

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t.nav.dashboard}</h1>

      {loading ? (
        <div className="text-center py-12">{t.common.loading}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contentTypes.map((type) => (
            <ContentTypeCard
              key={type.key}
              icon={type.icon}
              title={t.contentTypes[type.key].title}
              draftCount={counts?.[type.key]?.draft ?? 0}
              publishedCount={counts?.[type.key]?.published ?? 0}
              onCardClick={() => navigate(type.path)}
              onCreateClick={() => navigate(`${type.path}/create`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
```

**4. Backend API Endpoint Structure:**
```typescript
// backend/src/routes/stats.routes.ts
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// GET /api/v1/stats/content-counts
// Protected route - requires JWT authentication
router.get('/content-counts', authenticateToken, async (req, res) => {
  try {
    // For now, return mock data
    // Future stories will query actual database counts
    const counts = {
      news: { draft: 0, published: 0 },
      careers: { draft: 0, published: 0 },
      events: { draft: 0, published: 0 },
      deadlines: { draft: 0, published: 0 },
      gallery: { draft: 0, published: 0 },
      teachers: { draft: 0, published: 0 },
    };

    res.json({
      success: true,
      content: counts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch content counts' },
    });
  }
});

export default router;
```

```typescript
// backend/src/index.ts (or app.ts)
// Add to existing Express app
import statsRoutes from './routes/stats.routes';

// Register routes
app.use('/api/v1/stats', statsRoutes);
```

### Library & Framework Requirements

**Already Installed (from previous stories):**
- React 18.3.1 with TypeScript
- React Router DOM 6.30.1
- Axios (configured with JWT interceptors)
- shadcn-ui components (Card, Button)
- Radix UI primitives
- Tailwind CSS 3.4.17
- lucide-react 0.462.0 (for icons if needed, but using emojis per spec)
- Vitest 3.2.4 + @testing-library/react 16.0.0

**No New Dependencies Required** - Everything needed is already installed.

**Key Imports:**
```typescript
// Frontend
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

// Backend
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
```

### Testing Requirements

**Frontend Tests (Vitest + @testing-library/react):**

**Test File 1: `src/test/ContentTypeCard.test.tsx`**
- Renders icon, title, counts, and create button
- Handles card click (except on button)
- Handles create button click (prevents propagation)
- Shows correct count text format ("X чернови, Y публикувани")

**Test File 2: `src/test/useContentCounts.test.ts`**
- Fetches data from API endpoint
- Returns loading state initially
- Returns data after successful fetch
- Handles API errors gracefully (returns default counts)
- Uses default counts when API returns empty/null

**Test File 3: `src/test/Dashboard.test.tsx` (update existing)**
- Renders 6 ContentTypeCard components
- Shows loading state while fetching counts
- Navigates to list view on card click
- Navigates to create form on create button click
- Renders in 2-column grid on desktop
- Renders in 1-column on mobile (test with viewport mock)

**Backend Tests (Jest):**

**Test File: `backend/__test__/stats.routes.test.ts`**
- GET /api/v1/stats/content-counts returns expected structure
- Endpoint requires authentication (401 without token)
- Returns valid JSON with success: true
- Returns all 6 content types with draft/published counts

**Test Pattern Example:**
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ContentTypeCard } from '@/components/dashboard/ContentTypeCard';

describe('ContentTypeCard', () => {
  it('renders icon, title, counts, and create button', () => {
    render(
      <ContentTypeCard
        icon="📰"
        title="Новини"
        draftCount={2}
        publishedCount={5}
        onCardClick={vi.fn()}
        onCreateClick={vi.fn()}
      />
    );

    expect(screen.getByText('📰')).toBeInTheDocument();
    expect(screen.getByText('Новини')).toBeInTheDocument();
    expect(screen.getByText(/2 чернови, 5 публикувани/)).toBeInTheDocument();
    expect(screen.getByText('Създай')).toBeInTheDocument();
  });

  it('calls onCardClick when card body is clicked', () => {
    const onCardClick = vi.fn();
    render(
      <ContentTypeCard
        icon="📰"
        title="Новини"
        draftCount={0}
        publishedCount={0}
        onCardClick={onCardClick}
        onCreateClick={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Новини'));
    expect(onCardClick).toHaveBeenCalledTimes(1);
  });
});
```

### Previous Story Intelligence

**Story 2.1 (Bulgarian Translation System) - Key Learnings:**

1. **Translation System Usage:**
   - All UI text uses `useTranslation()` hook
   - Content types already defined in `src/lib/i18n/bg.ts`:
     ```typescript
     contentTypes: {
       news: { title: 'Новини', icon: '📰' },
       careers: { title: 'Кариери', icon: '💼' },
       events: { title: 'Събития', icon: '📅' },
       deadlines: { title: 'Срокове', icon: '⏰' },
       gallery: { title: 'Галерия', icon: '🖼️' },
       teachers: { title: 'Учители', icon: '👨‍🏫' },
     }
     ```
   - Status labels: `t.status.draft` = "Чернова", `t.status.published` = "Публикуван"
   - Button labels: `t.buttons.create` = "Създай"

2. **Established Patterns:**
   - shadcn-ui components throughout
   - Path alias `@/` for imports
   - TypeScript strict mode
   - Test files in `src/test/` folder
   - All 56 tests pass after Story 2.1

**Story 2.2 (Admin Layout Shell) - Key Learnings:**

1. **Layout Structure:**
   - AdminLayout wraps all admin pages (including Dashboard)
   - Dashboard no longer needs its own header/logout - that's in the sidebar
   - Sidebar provides navigation to all content types
   - Main content area has max-width constraint and padding

2. **Component Patterns:**
   - Created reusable layout components in `src/components/layout/`
   - Used Radix Sheet for mobile drawer
   - Responsive design: desktop (≥1024px), tablet (768-1023px), mobile (<768px)
   - Tailwind breakpoints: `md:` (≥768px), `lg:` (≥1024px)

3. **Files Modified:**
   - `src/App.tsx` - AdminLayout wraps Dashboard route
   - Dashboard is already using AdminLayout wrapper
   - All 83 tests pass after Story 2.2

4. **Critical Notes:**
   - **MUST REMOVE** old header/logout UI from Dashboard.tsx - it's redundant with sidebar
   - Dashboard content should be simple: heading + grid of cards
   - No need for separate header/logout buttons (already in AdminLayout sidebar)

### Git Intelligence Summary

**Recent Commits Analysis:**

1. **"project restructured into monorepo" (4f05b5e):**
   - Frontend in `/frontend` folder
   - Backend in `/backend` folder
   - Clear separation of concerns

2. **"logo changed, navigations changes, hero section changes" (2d84016):**
   - Active UI/UX development
   - Logo in `src/assets/logo.png` (used by AdminLayout)
   - Navigation patterns established in Story 2.2

3. **Development Pattern:**
   - Frequent iterative improvements
   - All tests pass before committing
   - TypeScript build succeeds with no errors

### Latest Technology Information

**React 18.3.1 (current stable as of 2026):**
- Automatic batching for state updates (improves performance)
- useId hook available for unique IDs (not needed for this story)
- Concurrent features enabled by default

**React Router DOM v6.30.1:**
- `useNavigate()` hook for programmatic navigation
- Path-based routing (no regex patterns needed)
- Future flags already set in App.tsx (Story 2.2 review fixes)

**Axios API Pattern (from Story 1.5-1.6):**
- JWT tokens automatically attached via request interceptor
- Automatic token refresh when expiring soon
- 401 errors trigger token refresh and retry
- Base URL: `http://localhost:3344` (from VITE_API_URL)
- Response format: `{ success: boolean, content: {...}, error?: {...} }`

**shadcn-ui Best Practices (2026):**
- Import components from `@/components/ui/*`
- Card: Use CardHeader, CardTitle, CardContent for proper structure
- Button: Use variant prop ("default", "outline", "ghost")
- Tailwind classes for spacing and colors

**TypeScript Strict Mode:**
- All props must be typed (use interfaces)
- Null/undefined checks required (`??` operator for defaults)
- No implicit any types

### Project Context & Critical Success Factors

**Project Type:** Kindergarten CMS Admin Panel (Bulgarian-language only)

**Current Status:**
- Epic 1 (Authentication) is COMPLETE
- Epic 2 (Admin Dashboard & Navigation) in progress
  - Story 2.1 (Bulgarian Translation System) DONE
  - Story 2.2 (Admin Layout Shell) DONE
  - **Story 2.3 (Dashboard with Content Type Cards)** ← Current story
  - Story 2.4 (StatusBadge Component) - Backlog
  - Story 2.5 (Help Modal) - Backlog

**Next Epic:** Epic 3 (News Content Management) - the "golden path"
- News is the most frequent use case
- Dashboard cards will navigate to News management pages (built in Epic 3)

**Critical Implementation Notes:**

1. **Dashboard Simplification (Story 2.2 Context):**
   - MUST remove old header with user info and logout button
   - AdminLayout sidebar already provides logout functionality
   - Dashboard content should be clean: heading + card grid
   - Main content area already has padding from AdminLayout

2. **API Endpoint is Mock Data Only:**
   - Backend endpoint returns hardcoded zeros for all counts
   - Future stories (Epic 3+) will implement real database queries
   - Frontend should handle gracefully if API fails (show 0 counts)

3. **Navigation Paths Don't Exist Yet:**
   - Clicking cards/create buttons navigates to routes like `/admin/news`
   - These routes don't exist until Epic 3 (News), Epic 4 (Teachers), etc.
   - This is expected and acceptable - story just creates the dashboard
   - Users will see "not found" or blank pages until future epics

4. **Content Type Configuration:**
   - Order matters: News first (golden path), then Jobs, Events, Deadlines, Gallery, Teachers
   - Icons are emojis (simple, no library needed)
   - Bulgarian titles come from i18n system (already exist from Story 2.1)

5. **Mobile Responsiveness:**
   - 2-column grid on desktop (md: ≥768px)
   - 1-column on mobile (<768px)
   - Cards should be touch-friendly (adequate tap targets)

### Anti-Patterns to Avoid

1. **DON'T keep old Dashboard header/logout** - redundant with AdminLayout sidebar
2. **DON'T use hardcoded Bulgarian text** - always use `useTranslation()` hook
3. **DON'T fetch counts on every re-render** - use useEffect with empty dependency array
4. **DON'T block UI if API fails** - show default 0 counts gracefully
5. **DON'T use icon libraries** - emojis are specified (📰, 💼, etc.)
6. **DON'T implement real database queries** - backend returns mock data only
7. **DON'T create placeholder pages for content types** - just navigate (404 is fine for now)
8. **DON'T forget event.stopPropagation()** - Create button should not trigger card click

### Verification Checklist

Before marking story complete, verify:
- [x] Dashboard wrapped by AdminLayout (already done in Story 2.2)
- [x] Old header/logout UI removed from Dashboard component
- [x] 6 ContentTypeCard components render in 2-column grid
- [x] Each card shows emoji icon, Bulgarian title, counts, and "Създай" button
- [x] Clicking card body navigates to list view (e.g., `/admin/news`)
- [x] Clicking "Създай" button navigates to create form (e.g., `/admin/news/create`)
- [x] API endpoint `/api/v1/stats/content-counts` returns mock data
- [x] API endpoint requires JWT authentication (401 without token)
- [x] Frontend gracefully handles API errors (shows 0 counts)
- [x] Mobile responsive: 1-column grid on small screens
- [x] Loading state shown while fetching counts
- [x] All text uses translation system (no hardcoded strings)
- [x] All tests pass (minimum 15 new test cases)
- [x] TypeScript compiles with no errors
- [x] No console errors or warnings

### References

- [Epics: Story 2.3](_bmad-output/planning-artifacts/epics.md#Story 2.3)
- [Architecture: Frontend Architecture](_bmad-output/planning-artifacts/architecture.md#Frontend Architecture Decisions)
- [UX Design: Dashboard](_bmad-output/planning-artifacts/ux-design-specification.md#Dashboard)
- [Story 2.1: Bulgarian Translation System](./2-1-bulgarian-translation-system.md)
- [Story 2.2: Admin Layout Shell](./2-2-admin-layout-shell-with-responsive-sidebar.md)
- [Story 1.6: Frontend Authentication Integration](./1-6-frontend-authentication-integration.md) (API patterns)
- [Story 1.2: Backend API Foundation](./1-2-backend-api-foundation.md) (Express setup)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

- All 95 frontend tests pass
- TypeScript compilation successful with no errors
- Backend API endpoint created with JWT authentication

### Completion Notes List

- **Task 1**: Created ContentTypeCard component in `frontend/src/components/dashboard/ContentTypeCard.tsx` with full TypeScript types, event propagation handling, and hover effects
- **Task 2**: Created useContentCounts hook in `frontend/src/hooks/useContentCounts.ts` with loading states, error handling, and graceful fallback to default counts
- **Task 3**: Created backend stats API endpoint at `backend/src/routes/commons/stats/stats_route.ts` with JWT authentication and registered in main routes
- **Task 4**: Completely refactored Dashboard component to display 6 ContentTypeCard components in responsive 2-column grid, removed old placeholder UI (header/logout now in AdminLayout from Story 2.2)
- **Task 5**: Added dashboard-specific translations `dashboard.drafts` and `dashboard.published` to support plural forms in Bulgarian
- **Task 6**: Created comprehensive frontend tests:
  - ContentTypeCard tests (7 tests) - component rendering, click handlers, event propagation
  - useContentCounts hook tests (5 tests) - API integration, loading states, error handling
  - Dashboard tests (7 tests) - rendering, navigation, responsive layout
- **Task 7**: Created backend API tests in `backend/__test__/stats.routes.test.ts` - authentication, response structure, mock data validation

### File List

**Created:**
- frontend/src/components/dashboard/ContentTypeCard.tsx
- frontend/src/hooks/useContentCounts.ts
- frontend/src/test/ContentTypeCard.test.tsx
- frontend/src/test/useContentCounts.test.ts
- backend/src/routes/commons/stats/stats_route.ts
- backend/__test__/stats.routes.test.ts

**Modified:**
- frontend/src/pages/admin/Dashboard.tsx (complete refactor)
- frontend/src/lib/i18n/types.ts (added dashboard section)
- frontend/src/lib/i18n/bg.ts (added dashboard translations)
- frontend/src/test/Dashboard.test.tsx (updated tests for new dashboard)
- backend/src/routes/index.ts (registered stats routes)

## Senior Developer Review (AI)

### Review Date: 2026-02-07

### Reviewer: Claude Opus 4.5

### Review Outcome: APPROVED (after fixes)

### Issues Found and Fixed

**HIGH Severity (2 fixed):**
1. **AC1 Count Display Format** - Counts were displayed on separate lines instead of the AC1-specified single-line format "X чернови, Y публикувани". Fixed by consolidating into a single `<p>` element with comma-separated format.

2. **No Error Feedback to User** - Dashboard ignored error state from hook, silently showing 0 counts on API failure. Fixed by adding visible error banner with Bulgarian translation when API fails.

**MEDIUM Severity (3 fixed):**
1. **Backend Test Skip Pattern** - Tests silently skipped when auth token was unavailable. Fixed by adding `requireAuthToken()` helper that throws explicit errors instead of returning early.

2. **Missing Accessibility Attributes** - Cards had no screen reader support. Fixed by adding `role="button"`, `tabIndex={0}`, `aria-label`, and keyboard event handlers (Enter/Space).

3. **No data-testid Attributes** - Tests relied on text content. Fixed by adding `data-testid` attributes to cards, counts, and buttons.

### Files Modified During Review
- frontend/src/components/dashboard/ContentTypeCard.tsx (accessibility, count format, data-testid)
- frontend/src/pages/admin/Dashboard.tsx (error state display, data-testid)
- frontend/src/test/ContentTypeCard.test.tsx (updated tests, added accessibility tests, removed unnecessary BrowserRouter)
- frontend/src/test/Dashboard.test.tsx (added error state test, updated count format tests)
- backend/__test__/stats.routes.test.ts (replaced silent skips with explicit failures)

### Test Results After Review
- All 99 frontend tests pass
- New tests added: 4 (accessibility tests, error state test)
- Total test count increased from 95 to 99

### Change Log Entry
- 2026-02-07: Senior Developer Review completed. Fixed 5 issues (2 HIGH, 3 MEDIUM). All ACs now properly implemented. Status → done.

