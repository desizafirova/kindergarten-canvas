# Story 6.4: Public Job Postings Display

Status: done

## Story

As a **website visitor**,
I want **to see available job positions on the kindergarten website**,
so that **I can learn about employment opportunities**.

## Acceptance Criteria

1. **Public jobs list API** — `GET /api/v1/public/jobs` returns only PUBLISHED jobs where `isActive=true`; sorted by `createdAt` DESC (newest first); no authentication required; response time < 500ms.
2. **Public job detail API** — `GET /api/v1/public/jobs/:id` returns the job if `status=PUBLISHED` AND `isActive=true`; returns 404 with message `"Позицията не е намерена"` for draft or inactive jobs.
3. **Public jobs page display** — `/jobs` page fetches jobs on mount; each job shows: title (as clickable link to detail page), description excerpt (≤150 chars, HTML stripped), application deadline formatted as `dd.MM.yyyy` if set; each job has a "Кандидатствай" button.
4. **Individual job detail page** — `/jobs/:id` fetches job on mount; shows full description (TipTap HTML rendered), requirements section (if present), application deadline (if set); includes a "Back to all positions" link.
5. **Empty state** — When no published active jobs exist, displays: "В момента няма отворени позиции."
6. **Expired deadline** — When a job has `applicationDeadline` that has passed, the "Кандидатствай" button is disabled and text "Срокът за кандидатстване е изтекъл" displays next to it.
7. **Loading and error states** — Both pages show a loading indicator while fetching; a Bulgarian error message displays on failure.
8. **Accessibility** — Semantic HTML (`<article>`, `<section>`, `<h1>`, `<h2>`); meaningful alt text; keyboard navigable; contrast ≥ 4.5:1.

## Tasks / Subtasks

- [x] Task 1: Add i18n translations (AC: 3, 5, 6, 7)
  - [x] 1.1 Add `publicJobs` interface to `frontend/src/lib/i18n/types.ts` (add after `publicDeadlines` block)
  - [x] 1.2 Add Bulgarian strings for `publicJobs` to `frontend/src/lib/i18n/bg.ts` (add after `publicDeadlines` block)

- [x] Task 2: Backend — public jobs controller (AC: 1, 2)
  - [x] 2.1 Create `backend/src/controllers/public/job_controller.ts`
  - [x] 2.2 Implement `getPublicJobs`: Prisma `findMany` filtering `status: 'PUBLISHED'` + `isActive: true`, `orderBy: [{ createdAt: 'desc' }]`, select: id, title, description, requirements, applicationDeadline, isActive, publishedAt, createdAt; performance warn if >500ms
  - [x] 2.3 Implement `getPublicJob`: Prisma `findFirst` by id + `status: 'PUBLISHED'` + `isActive: true`; return 404 JSON `{ status: 'fail', data: { message: 'Позицията не е намерена' } }` if not found

- [x] Task 3: Backend — public jobs route (AC: 1, 2)
  - [x] 3.1 Create `backend/src/routes/public/job_route.ts` with `GET /` → `getPublicJobs` and `GET /:id` → `getPublicJob`

- [x] Task 4: Register public jobs route in `backend/src/server/app.ts` (AC: 1, 2)
  - [x] 4.1 Import `publicJobRoutes` from `@routes/public/job_route`
  - [x] 4.2 Mount at `baseApiUrl + '/v1/public/jobs'`

- [x] Task 5: `JobCard` component (AC: 3, 6, 8)
  - [x] 5.1 Create `frontend/src/components/public/JobCard.tsx`
  - [x] 5.2 Export `PublicJob` interface with fields: id, title, description, requirements, applicationDeadline, isActive, publishedAt, createdAt
  - [x] 5.3 Render: title as `<Link to={/jobs/${job.id}}>`, description excerpt via `getExcerpt()`, deadline formatted `dd.MM.yyyy` if present
  - [x] 5.4 Derive `isDeadlineExpired = applicationDeadline && isPast(new Date(applicationDeadline))`; render disabled button + "Срокът за кандидатстване е изтекъл" when expired; render enabled "Кандидатствай" button otherwise (Story 6.5 will add onClick handler)

- [x] Task 6: `JobsPage` (AC: 3, 5, 7)
  - [x] 6.1 Create `frontend/src/pages/public/JobsPage.tsx`
  - [x] 6.2 Follow EventsPage pattern: `useEffect` + `useState`, `AbortController`, `isLoading`/`isError` states
  - [x] 6.3 Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
  - [x] 6.4 Use `t.publicJobs.*` for all strings

- [x] Task 7: `JobDetailPage` (AC: 4, 6, 7, 8)
  - [x] 7.1 Create `frontend/src/pages/public/JobDetailPage.tsx`
  - [x] 7.2 Extract `id` from `useParams<{ id: string }>()`
  - [x] 7.3 Fetch `/api/v1/public/jobs/${id}` on mount with AbortController
  - [x] 7.4 Render full description with `dangerouslySetInnerHTML={{ __html: job.description }}` inside a `prose` container
  - [x] 7.5 Render requirements section only if `job.requirements` is non-null
  - [x] 7.6 Show disabled "Кандидатствай" + "Срокът за кандидатстване е изтекъл" if deadline expired; enabled button otherwise (Story 6.5 hooks it)
  - [x] 7.7 Render `<Link to="/jobs">` back link with `t.publicJobs.backToList`
  - [x] 7.8 Handle 404 from API: show `t.publicJobs.notFound` message

- [x] Task 8: Register routes in `frontend/src/App.tsx` (AC: 3, 4)
  - [x] 8.1 Import `JobsPage` and `JobDetailPage`
  - [x] 8.2 Add `<Route path="/jobs" element={<ErrorBoundary><PublicLayout><JobsPage /></PublicLayout></ErrorBoundary>} />`
  - [x] 8.3 Add `<Route path="/jobs/:id" element={<ErrorBoundary><PublicLayout><JobDetailPage /></PublicLayout></ErrorBoundary>} />`
  - [x] 8.4 Place routes with other public routes (after `/deadlines` route)

- [x] Task 9: Frontend tests (AC: 1–7)
  - [x] 9.1 Create `frontend/src/__tests__/JobCard.test.tsx`: active job renders title, excerpt, enabled button; expired deadline disables button + shows expired message; no deadline renders without deadline text
  - [x] 9.2 Create `frontend/src/__tests__/JobsPage.test.tsx`: loading state, error state, empty state, jobs list renders JobCard per job (use `vi.hoisted()` for module mocks per Story 5.7 debug note)

## Dev Notes

### Architecture Overview

This story follows the **exact same pattern** as Story 5.7 (Public Events & Deadlines Display). Replicate that architecture faithfully.

**Backend pattern** (follow `event_controller.ts` and `deadline_controller.ts`):
- Single controller file per public resource
- `prisma.job.findMany` / `prisma.job.findFirst`
- Performance timing with `Date.now()` + `console.warn` if >500ms
- JSend response format: `{ status: 'success', data: { jobs: [...] } }`
- No auth middleware — these are fully public endpoints

**Frontend pattern** (follow `EventsPage.tsx` and `EventCard.tsx`):
- `useEffect` + `useState` (no React Query or custom hook)
- `AbortController` for cleanup in `useEffect` return
- Early-return render pattern: loading → error → empty → list
- `<section>` wrapper with `container mx-auto px-4`
- `api.get(...)` via the shared Axios instance at `@/lib/api`
- `useTranslation()` for all UI strings

### Job Prisma Schema (reference)

```prisma
model Job {
  id                  Int        @id @default(autoincrement())
  title               String
  description         String          // TipTap HTML — required
  requirements        String?         // TipTap HTML — optional
  contactEmail        String     @map("contact_email")
  applicationDeadline DateTime?  @map("application_deadline") @db.Timestamptz(6)
  isActive            Boolean    @default(true) @map("is_active")
  status              JobStatus  @default(DRAFT)
  publishedAt         DateTime?  @map("published_at") @db.Timestamptz(6)
  createdAt           DateTime   @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt           DateTime   @updatedAt @map("updated_at") @db.Timestamptz(6)

  @@index([status, createdAt])
  @@index([isActive, status])
  @@map("jobs")
}
```

`isActive` controls whether the job is accepting applications. `status=PUBLISHED` + `isActive=true` = show on public site.

### Backend Implementation

**`backend/src/controllers/public/job_controller.ts`**

```typescript
import { Request, Response } from 'express';
import prisma from '../../../prisma/prisma-client';

export const getPublicJobs = async (req: Request, res: Response) => {
    try {
        const startTime = Date.now();

        const jobs = await prisma.job.findMany({
            where: {
                status: 'PUBLISHED',
                isActive: true,
            },
            orderBy: [{ createdAt: 'desc' }],
            select: {
                id: true,
                title: true,
                description: true,
                requirements: true,
                applicationDeadline: true,
                isActive: true,
                publishedAt: true,
                createdAt: true,
            },
        });

        const duration = Date.now() - startTime;
        if (duration > 500) {
            console.warn(`⚠️ Public jobs list query took ${duration}ms (target: <500ms)`);
        }

        return res.status(200).json({
            status: 'success',
            data: { jobs },
        });
    } catch (error) {
        console.error('Error fetching published jobs:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};

export const getPublicJob = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(404).json({
                status: 'fail',
                data: { message: 'Позицията не е намерена' },
            });
        }

        const job = await prisma.job.findFirst({
            where: {
                id,
                status: 'PUBLISHED',
                isActive: true,
            },
            select: {
                id: true,
                title: true,
                description: true,
                requirements: true,
                applicationDeadline: true,
                isActive: true,
                publishedAt: true,
                createdAt: true,
            },
        });

        if (!job) {
            return res.status(404).json({
                status: 'fail',
                data: { message: 'Позицията не е намерена' },
            });
        }

        return res.status(200).json({
            status: 'success',
            data: { job },
        });
    } catch (error) {
        console.error('Error fetching published job:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
```

**`backend/src/routes/public/job_route.ts`**

```typescript
import { Router } from 'express';
import { getPublicJobs, getPublicJob } from '../../controllers/public/job_controller';

const router = Router();

// GET /api/v1/public/jobs - List published active jobs (no authentication)
router.get('/', getPublicJobs);

// GET /api/v1/public/jobs/:id - Get single published active job (no authentication)
router.get('/:id', getPublicJob);

export default router;
```

**`backend/src/server/app.ts` — add after `publicDeadlineRoutes`:**

```typescript
import publicJobRoutes from '@routes/public/job_route';
// ...
app.use(baseApiUrl + '/v1/public/jobs', publicJobRoutes);
```

### Frontend i18n

**`frontend/src/lib/i18n/types.ts`** — Add after `publicDeadlines` block:

```typescript
publicJobs: {
  sectionTitle: string;
  emptyState: string;
  loading: string;
  error: string;
  applyButton: string;
  deadlineLabel: string;
  deadlineExpired: string;
  requirementsTitle: string;
  notFound: string;
  backToList: string;
};
```

**`frontend/src/lib/i18n/bg.ts`** — Add after `publicDeadlines` block:

```typescript
publicJobs: {
  sectionTitle: 'Кариери',
  emptyState: 'В момента няма отворени позиции.',
  loading: 'Зареждане...',
  error: 'Грешка при зареждане на позициите',
  applyButton: 'Кандидатствай',
  deadlineLabel: 'Краен срок:',
  deadlineExpired: 'Срокът за кандидатстване е изтекъл',
  requirementsTitle: 'Изисквания',
  notFound: 'Позицията не е намерена',
  backToList: 'Всички позиции',
},
```

### Frontend Components

**`frontend/src/components/public/JobCard.tsx`**

Key points:
- Import `isPast` from `date-fns` (already installed — used in DeadlineCard)
- Import `Link` from `react-router-dom`
- Import `getExcerpt` from `@/lib/text-utils`
- Export `PublicJob` interface for use in `JobsPage`
- Title is `<Link>` to `/jobs/${job.id}`
- "Кандидатствай" button placeholder: Story 6.5 will add onClick. For now just render as `<button disabled>` or `<button>` (do NOT link to `/jobs/:id/apply` — that route doesn't exist yet)

```typescript
import { format, isPast } from 'date-fns';
import { bg } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { getExcerpt } from '@/lib/text-utils';
import { useTranslation } from '@/lib/i18n';

export interface PublicJob {
  id: number;
  title: string;
  description: string;
  requirements: string | null;
  applicationDeadline: string | null;
  isActive: boolean;
  publishedAt: string | null;
  createdAt: string;
}

interface JobCardProps {
  job: PublicJob;
}

export function JobCard({ job }: JobCardProps) {
  const t = useTranslation();
  const excerpt = getExcerpt(job.description);
  const isDeadlineExpired = job.applicationDeadline
    ? isPast(new Date(job.applicationDeadline))
    : false;
  const formattedDeadline = job.applicationDeadline
    ? format(new Date(job.applicationDeadline), 'dd.MM.yyyy', { locale: bg })
    : null;

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
      <div className="p-5 flex flex-col flex-1">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          <Link to={`/jobs/${job.id}`} className="hover:text-primary transition-colors">
            {job.title}
          </Link>
        </h2>
        {formattedDeadline && (
          <p className="text-sm text-gray-500 mb-2">
            {t.publicJobs.deadlineLabel} {formattedDeadline}
          </p>
        )}
        {excerpt && <p className="text-sm text-gray-700 mb-4 flex-1">{excerpt}</p>}
        <div className="mt-auto">
          {isDeadlineExpired ? (
            <div>
              <button
                disabled
                className="w-full bg-gray-200 text-gray-400 text-sm font-medium py-2 px-4 rounded cursor-not-allowed"
              >
                {t.publicJobs.applyButton}
              </button>
              <p className="text-xs text-red-500 mt-1">{t.publicJobs.deadlineExpired}</p>
            </div>
          ) : (
            <button
              className="w-full bg-primary text-white text-sm font-medium py-2 px-4 rounded hover:bg-primary/90 transition-colors"
            >
              {t.publicJobs.applyButton}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
```

**`frontend/src/pages/public/JobsPage.tsx`** — Follow `EventsPage.tsx` exactly:

```typescript
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useTranslation } from '@/lib/i18n';
import { JobCard, type PublicJob } from '@/components/public/JobCard';

export function JobsPage() {
  const t = useTranslation();
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchJobs = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const response = await api.get('/api/v1/public/jobs', {
          signal: abortController.signal,
        });
        if (response.data.status === 'success') {
          setJobs(response.data.data.jobs);
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

    fetchJobs();
    return () => abortController.abort();
  }, []);

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.publicJobs.sectionTitle}</h1>
          <p className="text-gray-600">{t.publicJobs.loading}</p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.publicJobs.sectionTitle}</h1>
          <p className="text-red-600">{t.publicJobs.error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.publicJobs.sectionTitle}</h1>
        {jobs.length === 0 ? (
          <p className="text-gray-600">{t.publicJobs.emptyState}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
```

**`frontend/src/pages/public/JobDetailPage.tsx`**:

```typescript
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format, isPast } from 'date-fns';
import { bg } from 'date-fns/locale';
import api from '@/lib/api';
import { useTranslation } from '@/lib/i18n';
import type { PublicJob } from '@/components/public/JobCard';

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslation();
  const [job, setJob] = useState<PublicJob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    const abortController = new AbortController();

    const fetchJob = async () => {
      setIsLoading(true);
      setIsError(false);
      setIsNotFound(false);
      try {
        const response = await api.get(`/api/v1/public/jobs/${id}`, {
          signal: abortController.signal,
        });
        if (response.data.status === 'success') {
          setJob(response.data.data.job);
        } else {
          setIsError(true);
        }
      } catch (error: any) {
        if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') return;
        if (error.response?.status === 404) {
          setIsNotFound(true);
        } else {
          setIsError(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
    return () => abortController.abort();
  }, [id]);

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <p className="text-gray-600">{t.publicJobs.loading}</p>
        </div>
      </section>
    );
  }

  if (isNotFound || (!isLoading && !job && !isError)) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <p className="text-gray-600 mb-4">{t.publicJobs.notFound}</p>
          <Link to="/jobs" className="text-primary hover:underline">{t.publicJobs.backToList}</Link>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <p className="text-red-600 mb-4">{t.publicJobs.error}</p>
          <Link to="/jobs" className="text-primary hover:underline">{t.publicJobs.backToList}</Link>
        </div>
      </section>
    );
  }

  if (!job) return null;

  const isDeadlineExpired = job.applicationDeadline
    ? isPast(new Date(job.applicationDeadline))
    : false;
  const formattedDeadline = job.applicationDeadline
    ? format(new Date(job.applicationDeadline), 'dd.MM.yyyy', { locale: bg })
    : null;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link to="/jobs" className="text-sm text-primary hover:underline mb-6 inline-block">
          ← {t.publicJobs.backToList}
        </Link>
        <article>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
          {formattedDeadline && (
            <p className="text-sm text-gray-500 mb-6">
              {t.publicJobs.deadlineLabel} {formattedDeadline}
            </p>
          )}
          <div
            className="prose prose-gray max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: job.description }}
          />
          {job.requirements && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.publicJobs.requirementsTitle}</h2>
              <div
                className="prose prose-gray max-w-none"
                dangerouslySetInnerHTML={{ __html: job.requirements }}
              />
            </div>
          )}
          <div className="mt-8">
            {isDeadlineExpired ? (
              <div>
                <button
                  disabled
                  className="bg-gray-200 text-gray-400 text-sm font-medium py-3 px-8 rounded cursor-not-allowed"
                >
                  {t.publicJobs.applyButton}
                </button>
                <p className="text-sm text-red-500 mt-2">{t.publicJobs.deadlineExpired}</p>
              </div>
            ) : (
              <button
                className="bg-primary text-white text-sm font-medium py-3 px-8 rounded hover:bg-primary/90 transition-colors"
              >
                {t.publicJobs.applyButton}
              </button>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
```

### App.tsx Route Registration

Add imports (after `JobEdit` import):
```typescript
import { JobsPage } from './pages/public/JobsPage';
import { JobDetailPage } from './pages/public/JobDetailPage';
```

Add routes (after `/deadlines` route):
```tsx
<Route path="/jobs" element={<ErrorBoundary><PublicLayout><JobsPage /></PublicLayout></ErrorBoundary>} />
<Route path="/jobs/:id" element={<ErrorBoundary><PublicLayout><JobDetailPage /></PublicLayout></ErrorBoundary>} />
```

### Testing Patterns

**Critical note from Story 5.7**: Use `vi.hoisted()` for page-level test mocks due to Vitest hoisting issue with `vi.mock`.

**`frontend/src/__tests__/JobCard.test.tsx`** structure:
```typescript
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { JobCard, type PublicJob } from '../components/public/JobCard';

const baseJob: PublicJob = {
  id: 1,
  title: 'Учител',
  description: '<p>Описание на позицията</p>',
  requirements: null,
  applicationDeadline: null,
  isActive: true,
  publishedAt: '2026-03-01T00:00:00.000Z',
  createdAt: '2026-03-01T00:00:00.000Z',
};

// Wrap in MemoryRouter because JobCard uses <Link>
const renderCard = (job: PublicJob) =>
  render(<MemoryRouter><JobCard job={job} /></MemoryRouter>);
```

Test cases:
1. Renders title as a link to `/jobs/1`
2. Renders description excerpt (≤150 chars)
3. Active button when no deadline
4. Active button when future deadline
5. Disabled button + expired message when past deadline
6. No deadline text when `applicationDeadline` is null

**`frontend/src/__tests__/JobsPage.test.tsx`** structure:
```typescript
// Use vi.hoisted() pattern from Story 5.7
const { mockGet } = vi.hoisted(() => {
  const mockGet = vi.fn();
  return { mockGet };
});

vi.mock('../lib/api', () => ({
  default: { get: mockGet },
}));
```

Test cases:
1. Shows loading state initially
2. Shows error state on API failure
3. Shows empty state when API returns empty array
4. Renders one JobCard per job in API response
5. Cleans up with AbortController on unmount

### Project Structure Notes

**New files to create:**
```
backend/src/controllers/public/job_controller.ts  (new)
backend/src/routes/public/job_route.ts             (new)
frontend/src/components/public/JobCard.tsx         (new)
frontend/src/pages/public/JobsPage.tsx             (new)
frontend/src/pages/public/JobDetailPage.tsx        (new)
frontend/src/__tests__/JobCard.test.tsx            (new)
frontend/src/__tests__/JobsPage.test.tsx           (new)
```

**Files to modify:**
```
backend/src/server/app.ts           (add publicJobRoutes import + mount)
frontend/src/lib/i18n/types.ts      (add publicJobs interface block)
frontend/src/lib/i18n/bg.ts         (add publicJobs translations block)
frontend/src/App.tsx                (add /jobs and /jobs/:id routes + imports)
```

**Do NOT touch:**
- `frontend/src/pages/Careers.tsx` — static marketing page; leave unchanged
- Any admin job files (`JobsList.tsx`, `JobCreate.tsx`, `JobEdit.tsx`, `useJobs.ts`) — already complete from Story 6.3
- `backend/src/routes/admin/v1/job_route.ts` — admin CRUD; leave unchanged
- `frontend/src/types/job.ts` — admin type; `PublicJob` is a separate interface in `JobCard.tsx`

**Route pattern**: Public routes use `<PublicLayout>` wrapper (not `AdminLayout`); admin routes use `<ProtectedRoute><AdminLayout>`. Follow exactly as done for `/events` and `/deadlines` in App.tsx.

### References

- [Story 5.7 pattern](../implementation-artifacts/5-7-public-events-and-deadlines-display.md) — Primary pattern reference (controllers, pages, cards, tests)
- [EventsPage.tsx](../../frontend/src/pages/public/EventsPage.tsx) — Copy structure exactly
- [EventCard.tsx](../../frontend/src/components/public/EventCard.tsx) — Copy structure + adapt for jobs
- [event_controller.ts](../../backend/src/controllers/public/event_controller.ts) — Copy backend pattern
- [app.ts](../../backend/src/server/app.ts) — Reference for mount point
- [App.tsx](../../frontend/src/App.tsx) — Reference for route registration
- [types.ts](../../frontend/src/lib/i18n/types.ts) — Add `publicJobs` after `publicDeadlines`
- [bg.ts](../../frontend/src/lib/i18n/bg.ts) — Add translations after `publicDeadlines` block
- [text-utils.ts](../../frontend/src/lib/text-utils.ts) — `getExcerpt()` for description excerpt
- [Architecture.md](../planning-artifacts/architecture.md#Implementation-Patterns) — JSend format, naming conventions
- [Source: epics.md#Story-6.4] — Acceptance criteria and user story

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- Used `import * as dateFns from 'date-fns'` + `vi.mocked(dateFns.isPast)` pattern in JobCard tests instead of `await import()` inside sync `it()` blocks — `await` is not allowed in non-async functions (Vitest/SWC syntax error).

### Completion Notes List

- Implemented public jobs controller following exact pattern from `event_controller.ts` (JSend format, performance timing with `Date.now()` + `console.warn` if >500ms, no auth middleware).
- Created `job_route.ts` with GET `/` and GET `/:id` endpoints, mounted at `/api/v1/public/jobs` in `app.ts`.
- Added `publicJobs` i18n block to both `types.ts` and `bg.ts` after the `publicDeadlines` block as specified.
- `JobCard` component exports `PublicJob` interface; uses `<Link>` for title, `getExcerpt()` for description, `isPast()` for deadline expiry check, and renders disabled/enabled apply button accordingly.
- `JobsPage` and `JobDetailPage` follow `EventsPage` pattern exactly: `useEffect` + `useState`, `AbortController`, early-return render for loading/error/empty states.
- `JobDetailPage` handles 404 from API by checking `error.response?.status === 404` and showing `t.publicJobs.notFound`.
- Routes registered in `App.tsx` after `/deadlines` using `<ErrorBoundary><PublicLayout>` wrapper.
- All 13 new tests pass (8 JobCard + 5 JobsPage). Pre-existing `TeacherEdit.test.tsx` failures confirmed unrelated to this story.

### File List

- `backend/src/controllers/public/job_controller.ts` (new)
- `backend/src/routes/public/job_route.ts` (new)
- `backend/src/server/app.ts` (modified — added publicJobRoutes import + mount)
- `frontend/src/lib/i18n/types.ts` (modified — added publicJobs interface)
- `frontend/src/lib/i18n/bg.ts` (modified — added publicJobs translations)
- `frontend/src/components/public/JobCard.tsx` (new)
- `frontend/src/pages/public/JobsPage.tsx` (new)
- `frontend/src/pages/public/JobDetailPage.tsx` (new)
- `frontend/src/App.tsx` (modified — added /jobs and /jobs/:id routes + imports)
- `frontend/src/__tests__/JobCard.test.tsx` (new)
- `frontend/src/__tests__/JobsPage.test.tsx` (new)
- `frontend/src/__tests__/JobDetailPage.test.tsx` (new — added in code review)

### Senior Developer Review (AI)

**Reviewer:** Desi (claude-opus-4-6) — 2026-03-10

**Outcome:** APPROVED with fixes applied

**Issues found and fixed (6):**

- 🔴 HIGH [FIXED] — `JobDetailPage`: `isLoading` initialized to `false` caused a flash of "Позицията не е намерена" on every render before the first useEffect fires. Fixed: `useState(true)` at [JobDetailPage.tsx:14](frontend/src/pages/public/JobDetailPage.tsx).
- 🟡 MEDIUM [FIXED] — `JobsPage`: same `isLoading: false` pattern caused brief flash of empty state. Fixed: `useState(true)` at [JobsPage.tsx:9](frontend/src/pages/public/JobsPage.tsx).
- 🟡 MEDIUM [FIXED] — No tests for `JobDetailPage` — 404 handling, expired deadline, requirements rendering all untested. Created `frontend/src/__tests__/JobDetailPage.test.tsx` with 8 test cases.
- 🟡 MEDIUM [FIXED] — `catch (error: any)` suppresses TypeScript strict checking in both pages. Changed to `error: unknown` with proper type-cast narrowing in [JobsPage.tsx:27](frontend/src/pages/public/JobsPage.tsx) and [JobDetailPage.tsx:34](frontend/src/pages/public/JobDetailPage.tsx).
- 🟢 LOW [FIXED] — Missing `type="button"` on all 4 apply buttons (2 in `JobCard.tsx`, 2 in `JobDetailPage.tsx`). Added to prevent accidental form submission if ever nested in a form.
- 🟡 MEDIUM [NOT FIXED — architectural] — `dangerouslySetInnerHTML` renders `job.description` and `job.requirements` without DOMPurify client-side sanitization. Follows established pattern from News/Events stories. Recommend adding DOMPurify as a separate architectural task.

## Change Log

- 2026-03-10: Story 6.4 implemented — public job postings display with backend API endpoints, frontend pages (JobsPage + JobDetailPage), JobCard component, i18n translations, and 13 unit tests. All tasks complete.
- 2026-03-10: Code review fixes applied — fixed `isLoading` flash bug (HIGH), empty-state flash (MEDIUM), added `JobDetailPage` tests (8 cases), tightened `error: unknown` types, added `type="button"` to all apply buttons.
