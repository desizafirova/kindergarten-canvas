# Story 5.7: Public Events and Deadlines Display

Status: done

## Story

As a **website visitor**,
I want **to see upcoming events and admission deadlines on the kindergarten website**,
so that **I can plan for activities and never miss important dates**.

## Acceptance Criteria

1. **Public events API** — `GET /api/v1/public/events` returns only PUBLISHED events; sorted by `eventDate` ASC (upcoming first); by default only future events (`eventDate >= today`); response time < 500ms. No authentication required.

2. **Events with past support** — `GET /api/v1/public/events?includePast=true` returns both past and upcoming PUBLISHED events.

3. **Public deadlines API** — `GET /api/v1/public/admission-deadlines` returns only PUBLISHED deadlines; sorted by `deadlineDate` ASC (nearest first); by default only future deadlines (`deadlineDate >= today`); response time < 500ms. No authentication required.

4. **Public events page display** — `/events` page fetches from public API on mount; each event displays: title, date (`dd.MM.yyyy`), location (if present), description excerpt (≤150 chars, HTML stripped); important events (`isImportant=true`) show ⭐ or special highlighted styling.

5. **Public deadlines page display** — `/deadlines` page fetches from public API on mount; each deadline displays: title, deadline date (`dd.MM.yyyy`), description excerpt (≤150 chars, HTML stripped); urgent deadlines (`isUrgent=true`) highlighted with red accent or 🚨; deadlines with `deadlineDate < 7 days from today` show additional visual urgency indicator.

6. **Bulgarian date formatting** — All dates displayed in `dd.MM.yyyy` format (e.g., 15.03.2026) using `date-fns` `format()` with `{ locale: bg }`.

7. **Empty states** — When no published events exist: "Няма предстоящи събития в момента."; when no published deadlines exist: "Няма активни срокове в момента."

8. **Loading and error states** — Both pages show loading indicator while fetching; error message displays on API failure with friendly Bulgarian text.

9. **Accessibility** — Semantic HTML (`<article>`, `<section>`, `<h1>`, `<h2>`); all images have descriptive `alt` text; keyboard navigation works; color contrast ≥ 4.5:1.

## Tasks / Subtasks

- [x] Task 1: Add i18n translations for public events and deadlines pages (AC: 4, 5, 7, 8)
  - [x] 1.1: Add `publicEvents` section to `frontend/src/lib/i18n/types.ts`
  - [x] 1.2: Add `publicDeadlines` section to `frontend/src/lib/i18n/types.ts`
  - [x] 1.3: Add Bulgarian translations to `frontend/src/lib/i18n/bg.ts` for `publicEvents`
  - [x] 1.4: Add Bulgarian translations to `frontend/src/lib/i18n/bg.ts` for `publicDeadlines`

- [x] Task 2: Create public event API endpoint — backend (AC: 1, 2)
  - [x] 2.1: Create `backend/src/controllers/public/event_controller.ts` with `getPublicEvents()` function
  - [x] 2.2: Filter: `status: 'PUBLISHED'`; default filter: `eventDate >= today`; support `?includePast=true` query param to skip date filter
  - [x] 2.3: Sort: `orderBy: [{ eventDate: 'asc' }]`
  - [x] 2.4: Select only public-safe fields: `id, title, description, eventDate, eventEndDate, location, isImportant, imageUrl, publishedAt`
  - [x] 2.5: Performance warning log if query > 500ms
  - [x] 2.6: Return format: `{ status: 'success', data: { events: [...] } }`
  - [x] 2.7: Create `backend/src/routes/public/event_route.ts` — `GET /` → `getPublicEvents`
  - [x] 2.8: Mount route in `backend/src/server/app.ts`: `app.use(baseApiUrl + '/v1/public/events', publicEventRoutes)`

- [x] Task 3: Create public deadline API endpoint — backend (AC: 3)
  - [x] 3.1: Create `backend/src/controllers/public/deadline_controller.ts` with `getPublicDeadlines()` function
  - [x] 3.2: Filter: `status: 'PUBLISHED'`; default filter: `deadlineDate >= today`; no `includePast` support needed (deadlines are always future-facing)
  - [x] 3.3: Sort: `orderBy: [{ deadlineDate: 'asc' }]`
  - [x] 3.4: Select only public-safe fields: `id, title, description, deadlineDate, isUrgent, publishedAt`
  - [x] 3.5: Performance warning log if query > 500ms
  - [x] 3.6: Return format: `{ status: 'success', data: { deadlines: [...] } }`
  - [x] 3.7: Create `backend/src/routes/public/deadline_route.ts` — `GET /` → `getPublicDeadlines`
  - [x] 3.8: Mount route in `backend/src/server/app.ts`: `app.use(baseApiUrl + '/v1/public/admission-deadlines', publicDeadlineRoutes)`

- [x] Task 4: Create `EventCard` public component (AC: 4, 9)
  - [x] 4.1: Create `frontend/src/components/public/EventCard.tsx`
  - [x] 4.2: Props: `event: PublicEvent` (interface with: id, title, description, eventDate, eventEndDate, location, isImportant, imageUrl, publishedAt)
  - [x] 4.3: Display: title (h2), formatted date `format(new Date(event.eventDate), 'dd.MM.yyyy', { locale: bg })`, location (if present), description excerpt (strip HTML tags, truncate to 150 chars + "...")
  - [x] 4.4: Important events (`isImportant=true`): add ⭐ icon before title OR apply highlighted card border/background style
  - [x] 4.5: Event image (`imageUrl`): display with `loading="lazy"`, proper aspect ratio, descriptive alt text; if no image, no image area
  - [x] 4.6: Semantic HTML: `<article>` wrapper, accessible heading structure

- [x] Task 5: Create `DeadlineCard` public component (AC: 5, 6, 9)
  - [x] 5.1: Create `frontend/src/components/public/DeadlineCard.tsx`
  - [x] 5.2: Props: `deadline: PublicDeadline` (interface with: id, title, description, deadlineDate, isUrgent, publishedAt)
  - [x] 5.3: Display: title (h2), formatted date `format(new Date(deadline.deadlineDate), 'dd.MM.yyyy', { locale: bg })`, description excerpt (strip HTML, max 150 chars)
  - [x] 5.4: Urgent deadlines (`isUrgent=true`): apply red accent styling (red border or background tint) + 🚨 indicator
  - [x] 5.5: Near-expiry visual: calculate `daysUntil = differenceInDays(new Date(deadline.deadlineDate), today)`; if `daysUntil < 7 && daysUntil >= 0`: show additional "⏳ Остават X дни" badge with orange/red styling
  - [x] 5.6: Semantic HTML: `<article>` wrapper

- [x] Task 6: Create `EventsPage` public page (AC: 1, 4, 7, 8, 9)
  - [x] 6.1: Create `frontend/src/pages/public/EventsPage.tsx`
  - [x] 6.2: Fetch from `GET /api/v1/public/events` on mount using `AbortController` pattern (same as TeachersPage)
  - [x] 6.3: Check `response.data.status === 'success'` → `setEvents(response.data.data.events)`
  - [x] 6.4: Loading state: show loading text `t.publicEvents.loading`
  - [x] 6.5: Error state: show error text `t.publicEvents.error`
  - [x] 6.6: Empty state: show `t.publicEvents.emptyState` ("Няма предстоящи събития в момента.")
  - [x] 6.7: Map events to `EventCard` components in a responsive grid (1 col mobile, 2 cols tablet, 3 cols desktop)
  - [x] 6.8: Page heading: `t.publicEvents.sectionTitle` ("Предстоящи събития")
  - [x] 6.9: Cancel abort on unmount (cleanup in useEffect)

- [x] Task 7: Create `DeadlinesPage` public page (AC: 3, 5, 7, 8, 9)
  - [x] 7.1: Create `frontend/src/pages/public/DeadlinesPage.tsx`
  - [x] 7.2: Fetch from `GET /api/v1/public/admission-deadlines` on mount using `AbortController` pattern
  - [x] 7.3: Check `response.data.status === 'success'` → `setDeadlines(response.data.data.deadlines)`
  - [x] 7.4: Loading state: show `t.publicDeadlines.loading`
  - [x] 7.5: Error state: show `t.publicDeadlines.error`
  - [x] 7.6: Empty state: show `t.publicDeadlines.emptyState` ("Няма активни срокове в момента.")
  - [x] 7.7: Map deadlines to `DeadlineCard` components in a responsive grid or list layout
  - [x] 7.8: Page heading: `t.publicDeadlines.sectionTitle` ("Срокове за прием")
  - [x] 7.9: Cancel abort on unmount

- [x] Task 8: Register public routes in `App.tsx` (AC: 4, 5)
  - [x] 8.1: Import `EventsPage` and `DeadlinesPage`
  - [x] 8.2: Add route: `/events` → `<ErrorBoundary><PublicLayout><EventsPage /></PublicLayout></ErrorBoundary>`
  - [x] 8.3: Add route: `/deadlines` → `<ErrorBoundary><PublicLayout><DeadlinesPage /></PublicLayout></ErrorBoundary>`
  - [x] 8.4: Place routes in the public routes section, after the `/teachers` route

- [x] Task 9: Write frontend unit tests (AC: 4, 5, 7, 8)
  - [x] 9.1: Create `frontend/src/__tests__/EventsPage.test.tsx` — mirror `TeachersPage.test.tsx` pattern
  - [x] 9.2: Test: Fetches and displays published events on mount
  - [x] 9.3: Test: Shows loading state while fetching
  - [x] 9.4: Test: Shows empty state when no events returned
  - [x] 9.5: Test: Shows error state on API failure
  - [x] 9.6: Test: Important events display ⭐ indicator
  - [x] 9.7: Create `frontend/src/__tests__/DeadlinesPage.test.tsx`
  - [x] 9.8: Test: Fetches and displays published deadlines on mount
  - [x] 9.9: Test: Shows loading state while fetching
  - [x] 9.10: Test: Shows empty state when no deadlines returned
  - [x] 9.11: Test: Shows error state on API failure
  - [x] 9.12: Test: Urgent deadlines display 🚨 indicator
  - [x] 9.13: Test: Near-expiry deadlines (< 7 days) show urgency badge
  - [x] 9.14: Create `frontend/src/__tests__/EventCard.test.tsx`
  - [x] 9.15: Create `frontend/src/__tests__/DeadlineCard.test.tsx`

## Dev Notes

### Architecture: Complete Tech Stack for Story 5.7

```
Backend (this story - NEW public endpoints):
  PostgreSQL ← Prisma Event model (migration already applied in Story 5.1)
  PostgreSQL ← Prisma Deadline model (migration already applied in Story 5.1)
  Express ← GET /api/v1/public/events (NEW — no authentication)
  Express ← GET /api/v1/public/admission-deadlines (NEW — no authentication)

Frontend (this story - NEW public display):
  React + TypeScript
  date-fns v3 + bg locale ← already installed (used in admin Stories 5.4–5.6)
  TeachersPage.tsx pattern → replicate for EventsPage and DeadlinesPage
  TeacherCard.tsx pattern → replicate for EventCard and DeadlineCard
  PublicLayout wrapper ← already used for news/teachers pages
  useTranslation hook ← already used for all public pages
```

### API Endpoints (Backend — NEW in this story)

```
GET  /api/v1/public/events                → list PUBLISHED events (future only by default)
GET  /api/v1/public/events?includePast=true → list all PUBLISHED events (past + future)
GET  /api/v1/public/admission-deadlines   → list PUBLISHED deadlines (future only)
```

**CRITICAL: These are public endpoints — NO authentication middleware.**
**CRITICAL: Mount in `backend/src/server/app.ts` BEFORE the error handler.**

Response format (mirrors news/teachers public controllers):
```json
{
  "status": "success",
  "data": {
    "events": [ /* or "deadlines": */ ]
  }
}
```

### Backend Public Controller Implementation — event_controller.ts

```typescript
// backend/src/controllers/public/event_controller.ts
import { Request, Response } from 'express';
import prisma from '../../../prisma/prisma-client';

export const getPublicEvents = async (req: Request, res: Response) => {
    try {
        const startTime = Date.now();
        const includePast = req.query.includePast === 'true';

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today

        const whereClause: any = {
            status: 'PUBLISHED',
        };

        if (!includePast) {
            whereClause.eventDate = { gte: today };
        }

        const publishedEvents = await prisma.event.findMany({
            where: whereClause,
            orderBy: [{ eventDate: 'asc' }],
            select: {
                id: true,
                title: true,
                description: true,
                eventDate: true,
                eventEndDate: true,
                location: true,
                isImportant: true,
                imageUrl: true,
                publishedAt: true,
            },
        });

        const duration = Date.now() - startTime;
        if (duration > 500) {
            console.warn(`⚠️ Public events list query took ${duration}ms (target: <500ms)`);
        }

        return res.status(200).json({
            status: 'success',
            data: { events: publishedEvents },
        });
    } catch (error) {
        console.error('Error fetching published events:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
```

**Prisma model name is `event` (lowercase) — confirmed from `event_get_all_dao.ts`**: `prisma.event.findMany()`

### Backend Public Controller Implementation — deadline_controller.ts

```typescript
// backend/src/controllers/public/deadline_controller.ts
import { Request, Response } from 'express';
import prisma from '../../../prisma/prisma-client';

export const getPublicDeadlines = async (req: Request, res: Response) => {
    try {
        const startTime = Date.now();

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today

        const publishedDeadlines = await prisma.deadline.findMany({
            where: {
                status: 'PUBLISHED',
                deadlineDate: { gte: today }, // Future deadlines only
            },
            orderBy: [{ deadlineDate: 'asc' }],
            select: {
                id: true,
                title: true,
                description: true,
                deadlineDate: true,
                isUrgent: true,
                publishedAt: true,
            },
        });

        const duration = Date.now() - startTime;
        if (duration > 500) {
            console.warn(`⚠️ Public deadlines list query took ${duration}ms (target: <500ms)`);
        }

        return res.status(200).json({
            status: 'success',
            data: { deadlines: publishedDeadlines },
        });
    } catch (error) {
        console.error('Error fetching published deadlines:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
```

**Prisma model name is `deadline` (lowercase) — confirmed from backend admin tests**: `prisma.deadline.deleteMany()`

### Backend Route Files

```typescript
// backend/src/routes/public/event_route.ts
import { Router } from 'express';
import { getPublicEvents } from '../../controllers/public/event_controller';

const router = Router();

// GET /api/v1/public/events - List published events (no authentication)
router.get('/', getPublicEvents);

export default router;
```

```typescript
// backend/src/routes/public/deadline_route.ts
import { Router } from 'express';
import { getPublicDeadlines } from '../../controllers/public/deadline_controller';

const router = Router();

// GET /api/v1/public/admission-deadlines - List published deadlines (no authentication)
router.get('/', getPublicDeadlines);

export default router;
```

### Backend app.ts — How to Mount Routes

```typescript
// Add these imports (mirror publicNewsRoutes and publicTeacherRoutes pattern):
import publicEventRoutes from '@routes/public/event_route';
import publicDeadlineRoutes from '@routes/public/deadline_route';

// Add these mount lines (after existing public routes):
app.use(baseApiUrl + '/v1/public/events', publicEventRoutes);
app.use(baseApiUrl + '/v1/public/admission-deadlines', publicDeadlineRoutes);
```

Current app.ts mounting pattern for reference:
```typescript
app.use(baseApiUrl + '/v1/public/news', publicNewsRoutes);          // existing
app.use(baseApiUrl + '/v1/public/teachers', publicTeacherRoutes);   // existing
app.use(baseApiUrl + '/v1/public/events', publicEventRoutes);       // ADD THIS
app.use(baseApiUrl + '/v1/public/admission-deadlines', publicDeadlineRoutes); // ADD THIS
```

### Frontend TypeScript Interfaces — PublicEvent and PublicDeadline

Define inline in the page components (no separate type file needed — keep it simple):

```typescript
// In EventsPage.tsx and EventCard.tsx:
interface PublicEvent {
  id: number;
  title: string;
  description: string | null;
  eventDate: string;        // ISO 8601
  eventEndDate: string | null;
  location: string | null;
  isImportant: boolean;
  imageUrl: string | null;
  publishedAt: string | null;
}

// In DeadlinesPage.tsx and DeadlineCard.tsx:
interface PublicDeadline {
  id: number;
  title: string;
  description: string | null;
  deadlineDate: string;     // ISO 8601
  isUrgent: boolean;
  publishedAt: string | null;
}
```

### Frontend Page Pattern — EventsPage.tsx

```tsx
// frontend/src/pages/public/EventsPage.tsx
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useTranslation } from '@/lib/i18n';
import { EventCard } from '@/components/public/EventCard';

interface PublicEvent {
  id: number;
  title: string;
  description: string | null;
  eventDate: string;
  eventEndDate: string | null;
  location: string | null;
  isImportant: boolean;
  imageUrl: string | null;
  publishedAt: string | null;
}

export function EventsPage() {
  const t = useTranslation();
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchEvents = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const response = await api.get('/api/v1/public/events', {
          signal: abortController.signal,
        });
        if (response.data.status === 'success') {
          setEvents(response.data.data.events);
        } else {
          setIsError(true);
        }
      } catch (error: any) {
        if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') return;
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
    return () => abortController.abort();
  }, []);

  if (isLoading) { /* render loading */ }
  if (isError) { /* render error */ }
  if (events.length === 0) { /* render empty state */ }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.publicEvents.sectionTitle}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Frontend Component — EventCard.tsx (Complete)

```tsx
// frontend/src/components/public/EventCard.tsx
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';

interface PublicEvent {
  id: number;
  title: string;
  description: string | null;
  eventDate: string;
  eventEndDate: string | null;
  location: string | null;
  isImportant: boolean;
  imageUrl: string | null;
  publishedAt: string | null;
}

function stripHtml(html: string | null): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
}

function getExcerpt(html: string | null, maxLength = 150): string {
  const text = stripHtml(html);
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}

interface EventCardProps {
  event: PublicEvent;
}

export function EventCard({ event }: EventCardProps) {
  const formattedDate = format(new Date(event.eventDate), 'dd.MM.yyyy', { locale: bg });
  const excerpt = getExcerpt(event.description);

  return (
    <article className={`bg-white rounded-lg shadow-md overflow-hidden ${event.isImportant ? 'border-2 border-amber-400' : ''}`}>
      {event.imageUrl && (
        <div className="aspect-video relative bg-gray-100">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          {event.isImportant && <span aria-label="Важно събитие">⭐ </span>}
          {event.title}
        </h2>
        <p className="text-sm text-gray-500 mb-2">{formattedDate}</p>
        {event.location && (
          <p className="text-sm text-gray-600 mb-2">📍 {event.location}</p>
        )}
        {excerpt && (
          <p className="text-sm text-gray-700">{excerpt}</p>
        )}
      </div>
    </article>
  );
}
```

### Frontend Component — DeadlineCard.tsx (Complete)

```tsx
// frontend/src/components/public/DeadlineCard.tsx
import { format, differenceInDays } from 'date-fns';
import { bg } from 'date-fns/locale';

interface PublicDeadline {
  id: number;
  title: string;
  description: string | null;
  deadlineDate: string;
  isUrgent: boolean;
  publishedAt: string | null;
}

function stripHtml(html: string | null): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
}

function getExcerpt(html: string | null, maxLength = 150): string {
  const text = stripHtml(html);
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}

interface DeadlineCardProps {
  deadline: PublicDeadline;
}

export function DeadlineCard({ deadline }: DeadlineCardProps) {
  const formattedDate = format(new Date(deadline.deadlineDate), 'dd.MM.yyyy', { locale: bg });
  const excerpt = getExcerpt(deadline.description);
  const daysUntil = differenceInDays(new Date(deadline.deadlineDate), new Date());
  const isNearExpiry = daysUntil >= 0 && daysUntil < 7;

  return (
    <article className={`bg-white rounded-lg shadow-md overflow-hidden ${deadline.isUrgent ? 'border-l-4 border-red-500' : ''}`}>
      <div className="p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          {deadline.isUrgent && <span aria-label="Спешен срок">🚨 </span>}
          {deadline.title}
        </h2>
        <p className="text-sm text-gray-500 mb-2">{formattedDate}</p>
        {isNearExpiry && (
          <span className="inline-block bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded mb-2">
            ⏳ Остават {daysUntil === 0 ? 'по-малко от ден' : `${daysUntil} ${daysUntil === 1 ? 'ден' : 'дни'}`}
          </span>
        )}
        {excerpt && (
          <p className="text-sm text-gray-700">{excerpt}</p>
        )}
      </div>
    </article>
  );
}
```

### i18n Additions Required

Add to `frontend/src/lib/i18n/types.ts`:

```typescript
publicEvents: {
  sectionTitle: string;
  emptyState: string;
  loading: string;
  error: string;
};
publicDeadlines: {
  sectionTitle: string;
  emptyState: string;
  loading: string;
  error: string;
};
```

Add to `frontend/src/lib/i18n/bg.ts`:

```typescript
publicEvents: {
  sectionTitle: 'Предстоящи събития',
  emptyState: 'Няма предстоящи събития в момента.',
  loading: 'Зареждане...',
  error: 'Грешка при зареждане на събитията',
},
publicDeadlines: {
  sectionTitle: 'Срокове за прием',
  emptyState: 'Няма активни срокове в момента.',
  loading: 'Зареждане...',
  error: 'Грешка при зареждане на сроковете',
},
```

### App.tsx Route Registration

```tsx
// Add imports:
import { EventsPage } from './pages/public/EventsPage';
import { DeadlinesPage } from './pages/public/DeadlinesPage';

// Add routes (in public routes section, after /teachers):
<Route path="/events" element={<ErrorBoundary><PublicLayout><EventsPage /></PublicLayout></ErrorBoundary>} />
<Route path="/deadlines" element={<ErrorBoundary><PublicLayout><DeadlinesPage /></PublicLayout></ErrorBoundary>} />
```

### Testing Pattern — Mirrors TeachersPage.test.tsx

```typescript
// frontend/src/__tests__/EventsPage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { EventsPage } from '@/pages/public/EventsPage';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
mockedAxios.isCancel = vi.fn(() => false);

vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    publicEvents: {
      sectionTitle: 'Предстоящи събития',
      emptyState: 'Няма предстоящи събития в момента.',
      loading: 'Зареждане...',
      error: 'Грешка при зареждане на събитията',
    },
  }),
}));

// Mock date-fns to avoid locale issues in tests:
vi.mock('date-fns', async (importOriginal) => {
  const actual = await importOriginal<typeof import('date-fns')>();
  return {
    ...actual,
    format: vi.fn(() => '15.03.2026'),
  };
});
```

**Key test scenarios for EventsPage:**
- Fetches from `GET /api/v1/public/events` on mount with AbortSignal
- Shows loading while fetching
- Renders event titles, dates, locations when loaded
- Shows ⭐ for important events
- Shows empty state when `events: []`
- Shows error on API failure
- Does NOT show error for cancelled (aborted) requests

**Key test scenarios for DeadlinesPage:**
- Fetches from `GET /api/v1/public/admission-deadlines` on mount
- Renders deadline titles, dates when loaded
- Shows 🚨 for urgent deadlines
- Shows near-expiry badge ("Остават X дни") for deadlines < 7 days
- Shows empty state when `deadlines: []`
- Shows error on API failure

**DeadlineCard near-expiry test — mock `differenceInDays`:**
```typescript
vi.mock('date-fns', async (importOriginal) => {
  const actual = await importOriginal<typeof import('date-fns')>();
  return {
    ...actual,
    format: vi.fn(() => '20.03.2026'),
    differenceInDays: vi.fn(() => 3), // 3 days until deadline
  };
});
// Then verify "Остават 3 дни" badge appears
```

### File Structure — New and Modified Files

**New files:**
```
backend/src/controllers/public/event_controller.ts
backend/src/controllers/public/deadline_controller.ts
backend/src/routes/public/event_route.ts
backend/src/routes/public/deadline_route.ts
frontend/src/components/public/EventCard.tsx
frontend/src/components/public/DeadlineCard.tsx
frontend/src/pages/public/EventsPage.tsx
frontend/src/pages/public/DeadlinesPage.tsx
frontend/src/__tests__/EventsPage.test.tsx
frontend/src/__tests__/DeadlinesPage.test.tsx
frontend/src/__tests__/EventCard.test.tsx
frontend/src/__tests__/DeadlineCard.test.tsx
```

**Modified files:**
```
backend/src/server/app.ts             ← add 2 new public route mounts
frontend/src/lib/i18n/types.ts        ← add publicEvents, publicDeadlines sections
frontend/src/lib/i18n/bg.ts           ← add Bulgarian translations
frontend/src/App.tsx                  ← add /events and /deadlines routes
```

### Project Structure Notes

- **Prisma model names (CRITICAL):** Use `prisma.event` (not `prisma.events`) and `prisma.deadline` (not `prisma.deadlines`) — confirmed from `event_get_all_dao.ts` and backend admin tests
- **Public controller location:** `backend/src/controllers/public/` — mirrors `news_controller.ts` and `teacher_controller.ts` already there
- **`@routes/public/` alias works** — confirmed by existing `@routes/public/news_route` import in app.ts
- **DO NOT use authentication middleware** on public routes — these are public-facing, unauthenticated endpoints
- **date-fns and bg locale already installed** — used in Story 5.4–5.6, no new packages needed
- **`differenceInDays` is part of date-fns** — already installed, no separate import needed
- **`format` from date-fns** — same library used in admin EventListRow and DeadlineListRow
- **DOMPurify is NOT used** — codebase uses `dangerouslySetInnerHTML={{ __html: bio }}` in TeacherCard without sanitization. For events/deadlines, since description is admin-entered (trusted source), use the **`stripHtml` + plain text excerpt** approach instead (safer for public display of excerpts)
- **Frontend test mocking:** Tests mock `axios` directly (not `@/lib/api`) — confirmed in `TeachersPage.test.tsx`. `mockedAxios.get` resolves with `{ data: { status: 'success', data: { events/deadlines: [...] } } }`
- **AbortController pattern** — same as TeachersPage: ignore `CanceledError` and `ERR_CANCELED`
- **PublicLayout** — already used for `/news` and `/teachers` routes in App.tsx

### Previous Story Intelligence (Story 5.6 — Deadlines Admin)

- ✅ Backend admin CRUD for both events and deadlines is 100% complete (Stories 5.1–5.3)
- ✅ Prisma models for `Event` and `Deadline` are migrated and working
- ✅ All frontend admin UI for events and deadlines is done (Stories 5.4–5.6)
- ✅ `date-fns`, `date-fns/locale/bg` confirmed installed and used in DatePickerField
- ✅ `format()` from date-fns confirmed working with `{ locale: bg }`
- ✅ `differenceInDays()` from date-fns is available (same library)
- ✅ `EventListRow` and `DeadlineListRow` use `format(new Date(date), 'dd.MM.yyyy', { locale: bg })` — use identical pattern in public cards
- ⚠️ This story is purely additive — backend admin API unchanged, frontend admin unchanged

### Previous Story Intelligence (Story 4.4 — Public Teacher Profiles)

- ✅ Public API endpoint pattern fully established: `backend/src/controllers/public/teacher_controller.ts`
- ✅ Public route mount pattern: `app.use(baseApiUrl + '/v1/public/teachers', publicTeacherRoutes)`
- ✅ Frontend public page pattern: `TeachersPage.tsx` with AbortController, `api.get()`, state management
- ✅ Component pattern: `TeacherCard.tsx` in `frontend/src/components/public/`
- ✅ Test pattern: `TeachersPage.test.tsx` mocks `axios` directly, mocks `useTranslation`
- ✅ App.tsx route pattern: `<Route path="/teachers" element={<ErrorBoundary><PublicLayout><TeachersPage /></PublicLayout></ErrorBoundary>} />`
- ✅ Response structure from backend: `{ status: 'success', data: { teachers: [...] } }` → adapt for `events` and `deadlines`

### Git Intelligence (Recent Commits)

Recent commits show:
- `Story 5.5` + `Story 5.6`: Events and Deadlines admin UI complete — no changes needed to these files
- `Story 4.4`: Public teacher profiles — **this story follows the exact same pattern**
- `Story 3.11`: Public news display — additional reference for public page patterns

**Established conventions from previous stories:**
1. Public endpoints return `{ status: 'success', data: { [resource]: [...] } }` format
2. Public pages use `api.get('/api/v1/public/...')` with AbortController
3. Public components in `frontend/src/components/public/`; pages in `frontend/src/pages/public/`
4. App.tsx public routes wrapped in `<ErrorBoundary><PublicLayout>...</PublicLayout></ErrorBoundary>`
5. i18n: `publicTeachers`, `publicNews` naming convention → follow with `publicEvents`, `publicDeadlines`
6. Tests mock `axios` directly (not the `@/lib/api` module)
7. Performance target: log warning if backend query > 500ms (don't fail, just warn)
8. `isLoading=false` initially, set to `true` inside `fetchX()` before the request

### References

- Public teacher controller (exact pattern to follow): [backend/src/controllers/public/teacher_controller.ts](backend/src/controllers/public/teacher_controller.ts)
- Public teacher route (exact pattern to follow): [backend/src/routes/public/teacher_route.ts](backend/src/routes/public/teacher_route.ts)
- Backend app.ts (where to mount new routes): [backend/src/server/app.ts](backend/src/server/app.ts)
- Event DAO (confirms prisma model name `prisma.event`): [backend/src/dao/event/event_get_all_dao.ts](backend/src/dao/event/event_get_all_dao.ts)
- Prisma schema (Event and Deadline models): [backend/prisma/schema.prisma](backend/prisma/schema.prisma)
- TeachersPage (exact frontend pattern to follow): [frontend/src/pages/public/TeachersPage.tsx](frontend/src/pages/public/TeachersPage.tsx)
- TeachersPage test (exact test pattern to follow): [frontend/src/__tests__/TeachersPage.test.tsx](frontend/src/__tests__/TeachersPage.test.tsx)
- TeacherCard (public component pattern): [frontend/src/components/public/TeacherCard.tsx](frontend/src/components/public/TeacherCard.tsx)
- App.tsx (public route registration): [frontend/src/App.tsx](frontend/src/App.tsx)
- i18n types (add publicEvents, publicDeadlines): [frontend/src/lib/i18n/types.ts](frontend/src/lib/i18n/types.ts)
- i18n translations (add Bulgarian strings): [frontend/src/lib/i18n/bg.ts](frontend/src/lib/i18n/bg.ts)
- EventListRow (date format pattern): [frontend/src/components/admin/EventListRow.tsx](frontend/src/components/admin/EventListRow.tsx)
- Story 4.4 (Public Teacher Profiles — master reference for this story): [_bmad-output/implementation-artifacts/4-4-public-teacher-profiles-display.md](_bmad-output/implementation-artifacts/4-4-public-teacher-profiles-display.md)
- Story 5.6 (Deadlines admin — confirms deadline patterns): [_bmad-output/implementation-artifacts/5-6-deadlines-list-and-form.md](_bmad-output/implementation-artifacts/5-6-deadlines-list-and-form.md)
- Epic 5 story 5.7 requirements: [_bmad-output/planning-artifacts/epics.md](_bmad-output/planning-artifacts/epics.md) (line 1692)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- Fixed `vi.mock('@/lib/api')` hoisting issue by using `vi.hoisted()` — `const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }))` ensures the mock function is available when vi.mock factory runs. Required because vi.mock is hoisted to top of file before variable declarations.

### Completion Notes List

- Implemented complete public events and deadlines display feature: 2 backend API endpoints, 2 frontend pages, 2 frontend components, i18n translations, route registrations, and 35 unit tests.
- Backend: `GET /api/v1/public/events` (with `?includePast=true` support) and `GET /api/v1/public/admission-deadlines` — both no-auth public endpoints with performance warning at >500ms.
- Frontend: `EventCard` (⭐ for important, lazy image loading, semantic `<article>`) and `DeadlineCard` (🚨 for urgent, ⏳ countdown for <7 days, red border, semantic `<article>`).
- Pages: `EventsPage` and `DeadlinesPage` follow identical AbortController + `@/lib/api` pattern as `TeachersPage`.
- All 9 Acceptance Criteria satisfied. TypeScript compiles without errors (frontend and backend). 35 new tests pass; no regressions.
- Note: Used `vi.hoisted()` for page test mocks instead of direct `axios` mock (pre-existing TeachersPage.test.tsx pattern has a known isolation issue when run alone; new tests use `@/lib/api` mock directly which is more correct).

### File List

**New files:**
- `backend/src/controllers/public/event_controller.ts`
- `backend/src/controllers/public/deadline_controller.ts`
- `backend/src/routes/public/event_route.ts`
- `backend/src/routes/public/deadline_route.ts`
- `frontend/src/components/public/EventCard.tsx`
- `frontend/src/components/public/DeadlineCard.tsx`
- `frontend/src/pages/public/EventsPage.tsx`
- `frontend/src/pages/public/DeadlinesPage.tsx`
- `frontend/src/__tests__/EventsPage.test.tsx`
- `frontend/src/__tests__/DeadlinesPage.test.tsx`
- `frontend/src/__tests__/EventCard.test.tsx`
- `frontend/src/__tests__/DeadlineCard.test.tsx`
- `frontend/src/lib/text-utils.ts`

**Modified files:**
- `backend/src/server/app.ts`
- `frontend/src/lib/i18n/types.ts`
- `frontend/src/lib/i18n/bg.ts`
- `frontend/src/App.tsx`

## Change Log

- 2026-03-07: Story 5.7 implemented — public events and deadlines display. Added 2 backend public API endpoints (GET /api/v1/public/events, GET /api/v1/public/admission-deadlines), 2 public frontend pages (EventsPage, DeadlinesPage), 2 public components (EventCard, DeadlineCard), i18n translations, route registrations in App.tsx, and 35 unit tests covering all ACs.
- 2026-03-08: Code review fixes applied — extracted shared text-utils (stripHtml/getExcerpt using DOM parsing, eliminates regex and duplication), exported PublicEvent/PublicDeadline interfaces from Card components (single source of truth), fixed whereClause: any in event_controller (spread pattern), aligned EventsPage/DeadlinesPage to TeachersPage early-return render pattern with semantic `<section>` wrapper, added aria-hidden to decorative 📍 and ⏳ emojis. All 35 tests pass.
