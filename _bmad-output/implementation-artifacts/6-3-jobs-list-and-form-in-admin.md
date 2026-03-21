# Story 6.3: Jobs List and Form in Admin

Status: done

## Story

As an **administrator**,
I want **to manage job postings through a list and form interface**,
so that **I can advertise open positions at the kindergarten**.

## Acceptance Criteria

### AC1: Jobs List at `/admin/jobs`

```gherkin
Given I am logged in and navigate to /admin/jobs
When the page loads
Then I see a list of all jobs using ItemListRow-style components
And each row displays: title, StatusBadge, isActive indicator (✓ Активна / ✗ Затворена), applicationDeadline (if set, formatted dd.MM.yyyy)
And each row has "Редактирай" (Edit) and "Изтрий" (Delete) buttons
And jobs are sorted by creation date (newest first — matches backend default)
```

### AC2: Empty State

```gherkin
Given no jobs exist (for the active filter)
When the list loads
Then I see an empty state: "Няма добавени позиции. Създайте първата!"
And a prominent "Създай позиция" button is displayed
And the create button is only shown when activeFilter === 'ALL'
```

### AC3: Filter Tabs

```gherkin
Given the list has filter tabs: "Всички", "Активни", "Затворени"
When I click "Активни"
Then only jobs with isActive=true display (API: ?isActive=true)
When I click "Затворени"
Then only jobs with isActive=false display (API: ?isActive=false)
When I click "Всички"
Then all jobs display regardless of isActive (no filter param)
```

### AC4: Create Form at `/admin/jobs/create`

```gherkin
Given I navigate to /admin/jobs/create
When the form loads
Then I see a ContentFormShell layout with:
- Breadcrumb: "Кариери > Създаване"
- "Заглавие на позицията" text input (required)
- "Описание" TipTap RichTextEditor (required)
- "Изисквания" TipTap RichTextEditor (optional)
- "Имейл за кандидатури" email input (required, email validation)
- "Краен срок за кандидатстване" DatePickerField (optional)
- "Приема кандидатури" Checkbox (isActive, default true)
- Action bar: "Запази чернова" and "Публикувай" buttons
```

### AC5: Edit Form at `/admin/jobs/:id/edit`

```gherkin
Given I am editing an existing job at /admin/jobs/:id/edit
When the form loads
Then all fields are pre-populated with existing data
And DatePickerField shows the existing applicationDeadline ISO string
And isActive Checkbox reflects existing isActive value
And status-aware buttons: DRAFT → "Запази чернова" + "Публикувай"; PUBLISHED → "Обнови"
```

### AC6: Form Validation

```gherkin
Given form validation is active
When I try to save/publish without required fields
Then inline errors display for:
- title: "Заглавието е задължително"
- description: "Описанието е задължително"
- contactEmail: "Имейлът за контакт е задължителен" / "Невалиден имейл формат"
```

### AC7: Publish Action

```gherkin
Given I click "Публикувай" on a draft job
When the action completes successfully
Then the status changes to PUBLISHED
And a success toast displays: "Позицията е публикувана успешно!"
And navigation goes to /admin/jobs
```

### AC8: isActive Toggle

```gherkin
Given I uncheck "Приема кандидатури"
When I save the job
Then isActive is set to false in the API call
```

### AC9: Delete with Confirmation

```gherkin
Given I click "Изтрий" on a job
When the DeleteConfirmDialog opens
Then it shows: "Сигурни ли сте, че искате да изтриете тази позиция?"
When I confirm
Then the job is deleted optimistically from the list
And API DELETE /api/admin/v1/jobs/:id is called
And success toast shows: "Позицията е изтрита успешно"
```

### AC10: Loading and Error States

```gherkin
Given the jobs list is loading
Then skeleton placeholder rows display
Given the API fetch fails
Then an error banner displays with a retry button
And all error messages are in Bulgarian
```

## Tasks / Subtasks

- [x] **Task 1: Add i18n translations for Jobs** (AC: 1–10)
  - [x] 1.1: Add `jobsList` section to `frontend/src/lib/i18n/types.ts`
  - [x] 1.2: Add `jobForm` section to `frontend/src/lib/i18n/types.ts`
  - [x] 1.3: Add Bulgarian translations for both sections to `frontend/src/lib/i18n/bg.ts`

- [x] **Task 2: Create `Job` TypeScript type** (AC: 1, 5)
  - [x] 2.1: Create `frontend/src/types/job.ts` mirroring backend Prisma Job model
  - [x] 2.2: Export `JobStatus` type (`DRAFT`, `PUBLISHED`)
  - [x] 2.3: Export `Job` interface with all fields: id, title, description, requirements, contactEmail, applicationDeadline, isActive, status, publishedAt, createdAt, updatedAt

- [x] **Task 3: Create Zod form schema for jobs** (AC: 4, 6)
  - [x] 3.1: Create `frontend/src/schemas/job-form.schema.ts`
  - [x] 3.2: Required: `title` (min 1), `description` (min 1), `contactEmail` (email)
  - [x] 3.3: Optional: `requirements` (string | null), `applicationDeadline` (string | null), `isActive` (boolean, default true), `status` (enum DRAFT|PUBLISHED, default DRAFT)

- [x] **Task 4: Create `useJobs` custom hook** (AC: 1, 3)
  - [x] 4.1: Create `frontend/src/hooks/useJobs.ts`
  - [x] 4.2: Mirror `useEvents` hook pattern: `data`, `loading`, `error`, `refetch`, `setData`
  - [x] 4.3: Accept optional filter param (type: `'ALL' | 'ACTIVE' | 'CLOSED'`)
  - [x] 4.4: Map filter to API query params: `ACTIVE` → `?isActive=true`, `CLOSED` → `?isActive=false`, `ALL` → no param
  - [x] 4.5: Export `JobError` class (mirrors `EventError`)
  - [x] 4.6: API endpoint: `GET /api/admin/v1/jobs` (with optional `?isActive=true|false`)
  - [x] 4.7: Export individual CRUD functions: `getJob`, `createJob`, `updateJob`, `deleteJob`
  - [x] 4.8: No client-side sorting — backend returns newest-first by default (createdAt DESC)

- [x] **Task 5: Create `JobListRow` component** (AC: 1, 2, 9, 10)
  - [x] 5.1: Create `frontend/src/components/admin/JobListRow.tsx`
  - [x] 5.2: Props: `job: Job`, `onEdit: (id: number) => void`, `onDelete: (id: number) => void`, `isDeleting?: boolean`
  - [x] 5.3: Display: title, StatusBadge, isActive indicator (✓ Активна / ✗ Затворена), applicationDeadline (if set: formatted dd.MM.yyyy)
  - [x] 5.4: "Редактирай" button (blue ghost) + "Изтрий" button (red ghost)
  - [x] 5.5: Keyboard navigation: Enter/Space triggers edit
  - [x] 5.6: `isDeleting` → show `Loader2` spinner, dim opacity

- [x] **Task 6: Create `JobsList` page** (AC: 1–3, 9–10)
  - [x] 6.1: Create `frontend/src/pages/admin/JobsList.tsx`
  - [x] 6.2: Mirror `EventsList.tsx` structure exactly (three filter tabs instead of time-based tabs)
  - [x] 6.3: Filter tabs: "Всички" (ALL), "Активни" (ACTIVE), "Затворени" (CLOSED)
  - [x] 6.4: Use `useJobs(activeFilter)` hook
  - [x] 6.5: `JobListRow` per job in list
  - [x] 6.6: Skeleton loading rows, error banner, empty state
  - [x] 6.7: Delete: optimistic update → close dialog → `api.delete('/api/admin/v1/jobs/:id')` → toast → (no refetch on success path)
  - [x] 6.8: `DeleteConfirmDialog` with custom message: "Сигурни ли сте, че искате да изтриете тази позиция?"
  - [x] 6.9: ARIA live region for announcements
  - [x] 6.10: "Създай позиция" button → navigates to `/admin/jobs/create`

- [x] **Task 7: Create `JobCreate` page** (AC: 4, 6, 7, 8)
  - [x] 7.1: Create `frontend/src/pages/admin/JobCreate.tsx`
  - [x] 7.2: `useForm<JobFormData>` with `zodResolver(jobFormSchema)`, `mode: 'onChange'`
  - [x] 7.3: Default values: `title: ''`, `description: ''`, `requirements: null`, `contactEmail: ''`, `applicationDeadline: null`, `isActive: true`, `status: 'DRAFT'`
  - [x] 7.4: `register('title')` for title text input
  - [x] 7.5: `RichTextEditor` for `description` (required) — uses `watch` + `setValue` pattern
  - [x] 7.6: `RichTextEditor` for `requirements` (optional) — uses `watch` + `setValue` pattern
  - [x] 7.7: `register('contactEmail')` for email input
  - [x] 7.8: `DatePickerField` for `applicationDeadline` (optional) — uses `watch` + `setValue` pattern
  - [x] 7.9: `Checkbox` for `isActive` (default checked/true) — uses `watch` + `setValue` pattern
  - [x] 7.10: "Запази чернова" → `handleSubmit(handleSaveDraft)`, POST with `status: 'DRAFT'`
  - [x] 7.11: "Публикувай" → `handleSubmit(handlePublish)`, POST with `status: 'PUBLISHED'`, toast "Позицията е публикувана успешно!"
  - [x] 7.12: Breadcrumb: `[{ label: t.jobForm.breadcrumb.careers, href: '/admin/jobs' }, { label: t.jobForm.breadcrumb.create }]`
  - [x] 7.13: Navigate to `/admin/jobs` on success

- [x] **Task 8: Create `JobEdit` page** (AC: 5, 7, 8)
  - [x] 8.1: Create `frontend/src/pages/admin/JobEdit.tsx`
  - [x] 8.2: `useParams<{ id: string }>()` to get job ID
  - [x] 8.3: `useEffect` → `api.get('/api/admin/v1/jobs/:id')` → `reset(data)` with all fields
  - [x] 8.4: Pre-populate: title, description, requirements, contactEmail, applicationDeadline, isActive, status
  - [x] 8.5: contactEmail is always non-null from API — no null coercion needed
  - [x] 8.6: Status-aware buttons: DRAFT → "Запази чернова" + "Публикувай"; PUBLISHED → "Обнови" (stays on page after update)
  - [x] 8.7: Loading spinner during initial fetch; error state with back button
  - [x] 8.8: Mirror `EventEdit.tsx` pattern fully

- [x] **Task 9: Register routes in `App.tsx`** (AC: 1, 4, 5)
  - [x] 9.1: Import `JobsList`, `JobCreate`, `JobEdit`
  - [x] 9.2: Add routes: `/admin/jobs`, `/admin/jobs/create`, `/admin/jobs/:id/edit`
  - [x] 9.3: Wrap each in `ProtectedRoute > AdminLayout > ErrorBoundary` (match exact pattern of deadlines routes)

- [x] **Task 10: Write unit tests** (AC: 1–10)
  - [x] 10.1: Create `frontend/src/__tests__/JobsList.test.tsx`
  - [x] 10.2: Create `frontend/src/__tests__/JobCreate.test.tsx`
  - [x] 10.3: Create `frontend/src/__tests__/JobEdit.test.tsx`
  - [x] 10.4: Create `frontend/src/__tests__/JobListRow.test.tsx`
  - [x] 10.5: Create `frontend/src/__tests__/useJobs.test.tsx`
  - [x] 10.6: Follow `EventsList.test.tsx`, `EventCreate.test.tsx`, `EventListRow.test.tsx`, `useEvents.test.tsx` patterns exactly
  - [x] 10.7: Mock `@/lib/api` module for all API calls
  - [x] 10.8: Mock `DatePickerField` and both `RichTextEditor` instances in form tests
  - [x] 10.9: Checkbox works without mocking (ResizeObserver polyfill in setup.ts)

## Dev Notes

### Architecture: Complete Tech Stack for Story 6.3

```
Backend (already done — Stories 6.1–6.2):
  PostgreSQL ← Prisma Job model (migration 20260308073024 applied)
  Express ← /api/admin/v1/jobs CRUD routes (Story 6.2)
  Zod validation ← job_schema.ts (Story 6.2)

Frontend (this story):
  React + TypeScript
  React Hook Form + Zod (zodResolver) → same as TeacherCreate/EventCreate
  DatePickerField (Story 5.4) ← Radix Popover + react-day-picker v8 + date-fns v3 bg locale
  RichTextEditor × 2 ← TipTap (used in News, Teacher, Event forms — use for description AND requirements)
  Checkbox ← Shadcn (used in EventCreate for isImportant — reuse for isActive)
  ContentFormShell ← existing admin form wrapper
  useEvents pattern → replicate as useJobs
  EventListRow pattern → replicate as JobListRow
  EventsList/Create/Edit pattern → replicate as JobsList/Create/Edit
```

### API Endpoints (Backend — Story 6.2, ALREADY IMPLEMENTED)

```
GET    /api/admin/v1/jobs              → list all jobs (optional: ?status=DRAFT|PUBLISHED, ?isActive=true|false)
GET    /api/admin/v1/jobs/:id          → get single job
POST   /api/admin/v1/jobs              → create job (status defaults to DRAFT, isActive defaults to true)
PUT    /api/admin/v1/jobs/:id          → update job (publishedAt lifecycle managed in service)
DELETE /api/admin/v1/jobs/:id          → delete job (returns: "Позицията е изтрита успешно")
```

**Response shape** (admin API httpMsg format — same as events/deadlines/teachers):
```json
{
  "success": true,
  "message": "Success",
  "content": { /* Job object or array */ }
}
```

**404 message**: `"Позицията не е намерена"`
**Delete success**: `"Позицията е изтрита успешно"`

### Job TypeScript Interface

```typescript
// frontend/src/types/job.ts
export type JobStatus = 'DRAFT' | 'PUBLISHED';

export interface Job {
  id: number;
  title: string;
  description: string;            // Rich text HTML from TipTap — REQUIRED
  requirements: string | null;    // Rich text HTML from TipTap — optional
  contactEmail: string;           // Required email
  applicationDeadline: string | null;  // ISO 8601, optional
  isActive: boolean;              // default true; controls if accepting applications
  status: JobStatus;              // default DRAFT
  publishedAt: string | null;     // Set by backend on publish
  createdAt: string;              // ISO 8601
  updatedAt: string;              // ISO 8601
}
```

### Zod Form Schema — Complete Implementation

```typescript
// frontend/src/schemas/job-form.schema.ts
import { z } from 'zod';

export const jobFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Заглавието е задължително')
    .max(200, 'Заглавието е твърде дълго (максимум 200 символа)'),
  description: z
    .string()
    .min(1, 'Описанието е задължително'),
  requirements: z.string().nullable().optional(),
  contactEmail: z
    .string()
    .min(1, 'Имейлът за контакт е задължителен')
    .email('Невалиден имейл формат'),
  applicationDeadline: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
});

export type JobFormData = z.infer<typeof jobFormSchema>;
```

**Note**: No superRefine needed (no cross-field date validation unlike Events).

### useJobs Hook — Filter Mapping

```typescript
// frontend/src/hooks/useJobs.ts
type JobFilter = 'ALL' | 'ACTIVE' | 'CLOSED';

const buildQueryString = (filter: JobFilter): string => {
  if (filter === 'ACTIVE') return '?isActive=true';
  if (filter === 'CLOSED') return '?isActive=false';
  return ''; // ALL = fetch all from API
};
```

**Critical**: No client-side sorting needed. Backend returns jobs sorted by `createdAt DESC` (newest first) by default. Unlike the Events hook which sorts client-side, `useJobs` trusts the API order.

**Hook structure** (mirrors `useEvents.ts` exactly):
```typescript
export default function useJobs(filter: JobFilter = 'ALL') {
  const [data, setData] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = buildQueryString(filter);
      const res = await api.get(`/api/admin/v1/jobs${qs}`);
      setData(res.data.content);
    } catch (err) {
      setError(t.jobsList.loadError);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  return { data, setData, loading, error, refetch: fetchJobs };
}

export class JobError extends Error {}
export const getJob = (id: number) => api.get(`/api/admin/v1/jobs/${id}`);
export const createJob = (data: Partial<JobFormData>) => api.post('/api/admin/v1/jobs', data);
export const updateJob = (id: number, data: Partial<JobFormData>) => api.put(`/api/admin/v1/jobs/${id}`, data);
export const deleteJob = (id: number) => api.delete(`/api/admin/v1/jobs/${id}`);
```

### JobListRow — Display Specifics

```
[ Title | [DRAFT badge] | ✓ Активна | 31.03.2026 ] [ Редактирай ] [ Изтрий ]
```

- **isActive indicator**: `job.isActive ? '✓ Активна' : '✗ Затворена'` (style with green/red text or icon)
- **StatusBadge**: `job.status.toLowerCase() as 'draft' | 'published'`
- **applicationDeadline**: `job.applicationDeadline ? format(new Date(job.applicationDeadline), 'dd.MM.yyyy', { locale: bg }) : null`
- Do NOT show applicationDeadline column if null/undefined (omit gracefully)

### Form Field: Two RichTextEditors

This story is unique in having **two** TipTap editors on one form. Both use `watch` + `setValue` pattern:

```tsx
// Description (required)
const description = watch('description');
<RichTextEditor
  value={description ?? ''}
  onChange={(html) => setValue('description', html, { shouldValidate: true })}
  label="Описание"
/>
{errors.description && <span role="alert">{errors.description.message}</span>}

// Requirements (optional)
const requirements = watch('requirements');
<RichTextEditor
  value={requirements ?? ''}
  onChange={(html) => setValue('requirements', html || null, { shouldValidate: true })}
  label="Изисквания (по избор)"
/>
```

**Important**: `description` is required (min 1). `requirements` is optional — when editor is empty, set to `null` (not `''`).

### Form Field: isActive Checkbox (Same Pattern as isImportant in Events)

```tsx
import { Checkbox } from '@/components/ui/checkbox';

const isActive = watch('isActive');

<div className="flex items-center gap-2">
  <Checkbox
    id="isActive"
    checked={isActive}
    onCheckedChange={(checked) =>
      setValue('isActive', !!checked, { shouldValidate: true })
    }
  />
  <Label htmlFor="isActive">Приема кандидатури</Label>
</div>
```

**Note**: Default `isActive: true` means the checkbox starts checked. Use `watch` + `setValue` pattern (NOT `register`) — Radix Checkbox is controlled.

### Form Field: applicationDeadline DatePickerField

```tsx
<DatePickerField
  id="applicationDeadline"
  label="Краен срок за кандидатстване (по избор)"
  value={watch('applicationDeadline') ?? null}
  onChange={(iso) => setValue('applicationDeadline', iso, { shouldValidate: true })}
  error={errors.applicationDeadline?.message}
/>
```

No `minDate` needed (unlike eventEndDate in Events). No cross-field validation.

### contactEmail Field: Controlled Input

```tsx
<input
  type="email"
  {...register('contactEmail')}
  placeholder="hr@kindergarten.bg"
  aria-invalid={!!errors.contactEmail}
  aria-describedby={errors.contactEmail ? 'contactEmail-error' : undefined}
/>
{errors.contactEmail && (
  <span id="contactEmail-error" role="alert">{errors.contactEmail.message}</span>
)}
```

### Delete Flow — Optimistic Update (No Redundant Refetch on Success)

```typescript
// JobsList.tsx — handleConfirmDelete
const handleConfirmDelete = async () => {
  if (!deletingId) return;
  // Optimistic update first
  setData(prev => prev.filter(job => job.id !== deletingId));
  setDeletingId(null);
  try {
    await api.delete(`/api/admin/v1/jobs/${deletingId}`);
    toast({ title: t.jobsList.deleteSuccess });
    // NO refetch on success — optimistic update already removed item
  } catch {
    toast({ title: t.jobsList.deleteError, variant: 'destructive' });
    refetch(); // Only refetch on error (to restore removed item)
  }
};
```

**Critical**: Do NOT call `refetch()` on success path — learned from EventsList code review M1 fix.

### i18n Additions Required

Add these sections to `frontend/src/lib/i18n/types.ts`:

```typescript
// types.ts — add to Translations interface:
jobsList: {
  title: string;
  subtitle: string;
  emptyState: string;
  emptyFilteredState: string;
  createButton: string;
  filterAll: string;
  filterActive: string;
  filterClosed: string;
  deleteSuccess: string;
  deleteError: string;
  deleteConfirmMessage: string;
  loadError: string;
  retryButton: string;
  itemDeleted: string;
};
jobForm: {
  title: string;
  createTitle: string;
  editTitle: string;
  titleLabel: string;
  titlePlaceholder: string;
  descriptionLabel: string;
  requirementsLabel: string;
  contactEmailLabel: string;
  contactEmailPlaceholder: string;
  applicationDeadlineLabel: string;
  isActiveLabel: string;
  saveDraft: string;
  publish: string;
  update: string;
  errors: {
    titleRequired: string;
    descriptionRequired: string;
    contactEmailRequired: string;
    contactEmailInvalid: string;
    saveFailed: string;
    publishFailed: string;
    updateFailed: string;
  };
  success: {
    saved: string;
    published: string;
    updated: string;
  };
  breadcrumb: {
    careers: string;
    create: string;
    edit: string;
  };
};
```

Add Bulgarian translations to `frontend/src/lib/i18n/bg.ts`:

```typescript
jobsList: {
  title: 'Кариери',
  subtitle: 'Управлявайте обявите за работа',
  emptyState: 'Няма добавени позиции. Създайте първата!',
  emptyFilteredState: 'Няма позиции в тази категория.',
  createButton: 'Създай позиция',
  filterAll: 'Всички',
  filterActive: 'Активни',
  filterClosed: 'Затворени',
  deleteSuccess: 'Позицията е изтрита успешно',
  deleteError: 'Грешка при изтриване на позицията',
  deleteConfirmMessage: 'Сигурни ли сте, че искате да изтриете тази позиция?',
  loadError: 'Грешка при зареждане на позициите',
  retryButton: 'Опитайте отново',
  itemDeleted: 'Позицията е премахната от списъка',
},
jobForm: {
  title: 'Кариери',
  createTitle: 'Създаване на позиция',
  editTitle: 'Редактиране на позиция',
  titleLabel: 'Заглавие на позицията',
  titlePlaceholder: 'напр. Учител в детска градина...',
  descriptionLabel: 'Описание',
  requirementsLabel: 'Изисквания (по избор)',
  contactEmailLabel: 'Имейл за кандидатури',
  contactEmailPlaceholder: 'hr@kindergarten.bg',
  applicationDeadlineLabel: 'Краен срок за кандидатстване (по избор)',
  isActiveLabel: 'Приема кандидатури',
  saveDraft: 'Запази чернова',
  publish: 'Публикувай',
  update: 'Обнови',
  errors: {
    titleRequired: 'Заглавието е задължително',
    descriptionRequired: 'Описанието е задължително',
    contactEmailRequired: 'Имейлът за контакт е задължителен',
    contactEmailInvalid: 'Невалиден имейл формат',
    saveFailed: 'Грешка при запазване',
    publishFailed: 'Грешка при публикуване',
    updateFailed: 'Грешка при обновяване',
  },
  success: {
    saved: 'Позицията е запазена успешно',
    published: 'Позицията е публикувана успешно!',
    updated: 'Позицията е обновена успешно',
  },
  breadcrumb: {
    careers: 'Кариери',
    create: 'Създаване',
    edit: 'Редактиране',
  },
},
```

### File Structure — New Files

```
frontend/src/
├── types/
│   └── job.ts                         ← NEW (mirrors event.ts)
├── schemas/
│   └── job-form.schema.ts             ← NEW (mirrors event-form.schema.ts)
├── hooks/
│   └── useJobs.ts                     ← NEW (mirrors useEvents.ts)
├── components/
│   └── admin/
│       └── JobListRow.tsx             ← NEW (mirrors EventListRow.tsx)
├── pages/
│   └── admin/
│       ├── JobsList.tsx               ← NEW (mirrors EventsList.tsx)
│       ├── JobCreate.tsx              ← NEW (mirrors EventCreate.tsx)
│       └── JobEdit.tsx                ← NEW (mirrors EventEdit.tsx)
└── __tests__/
    ├── JobsList.test.tsx              ← NEW
    ├── JobCreate.test.tsx             ← NEW
    ├── JobEdit.test.tsx               ← NEW
    ├── JobListRow.test.tsx            ← NEW
    └── useJobs.test.tsx               ← NEW
```

**Modify existing files:**
```
frontend/src/lib/i18n/types.ts    ← add jobsList, jobForm sections
frontend/src/lib/i18n/bg.ts       ← add Bulgarian translations
frontend/src/App.tsx               ← add 3 routes: /admin/jobs, /admin/jobs/create, /admin/jobs/:id/edit
```

### App.tsx Route Registration

Add after the deadlines routes and before the `/admin` redirect:

```tsx
import JobsList from "./pages/admin/JobsList";
import JobCreate from "./pages/admin/JobCreate";
import JobEdit from "./pages/admin/JobEdit";

// In Routes:
<Route
  path="/admin/jobs"
  element={
    <ProtectedRoute>
      <AdminLayout>
        <ErrorBoundary>
          <JobsList />
        </ErrorBoundary>
      </AdminLayout>
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/jobs/create"
  element={
    <ProtectedRoute>
      <AdminLayout>
        <ErrorBoundary>
          <JobCreate />
        </ErrorBoundary>
      </AdminLayout>
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/jobs/:id/edit"
  element={
    <ProtectedRoute>
      <AdminLayout>
        <ErrorBoundary>
          <JobEdit />
        </ErrorBoundary>
      </AdminLayout>
    </ProtectedRoute>
  }
/>
```

### Testing Approach

**Mock setup** (mirrors EventCreate.test.tsx exactly):

```typescript
vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock DatePickerField (complex Radix internals):
vi.mock('@/components/admin/DatePickerField', () => ({
  DatePickerField: ({ id, label, onChange, error }: any) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <button type="button" id={id} data-testid={id}
        onClick={() => onChange('2026-12-31T00:00:00.000Z')}
      >Pick date</button>
      {error && <span role="alert">{error}</span>}
    </div>
  ),
}));

// Mock both RichTextEditor instances:
vi.mock('@/components/admin/RichTextEditor', () => ({
  RichTextEditor: ({ onChange, label }: any) => (
    <div data-testid={`rich-text-editor-${label}`}>
      <button onClick={() => onChange('<p>test content</p>')}>Type content</button>
    </div>
  ),
}));
```

**JobsList tests** (mirror EventsList.test.tsx):
- Renders loading skeletons initially
- Renders job rows after successful fetch (title, StatusBadge, isActive indicator)
- Shows empty state when no jobs (filter=ALL)
- Shows filter-specific empty state when filter=ACTIVE or CLOSED with no results
- Opens delete dialog on delete click with correct message
- Performs optimistic delete and shows toast (no refetch on success path)
- Shows error state on fetch failure with retry button
- Filter tabs refetch with correct query params (`?isActive=true`, `?isActive=false`)

**JobCreate tests** (mirror EventCreate.test.tsx):
- Renders all form fields (title, description editor, requirements editor, contactEmail, date picker, isActive checkbox)
- Shows validation error for missing title on save draft (Save Draft calls handleSubmit which triggers validation)
- Shows validation error for missing description
- Shows validation error for missing contactEmail, invalid email format
- Calls POST `/api/admin/v1/jobs` with correct payload including `status: 'DRAFT'` on save draft
- Calls POST with `status: 'PUBLISHED'` on publish, shows success toast "Позицията е публикувана успешно!"
- Navigates to `/admin/jobs` on success

**JobEdit tests** (mirror EventEdit.test.tsx):
- Fetches job on mount, pre-populates all fields
- Shows loading spinner while fetching
- Shows error state with back button if fetch fails
- Status-aware buttons: PUBLISHED shows only "Обнови"
- Calls PUT `/api/admin/v1/jobs/:id` on save/publish/update

**JobListRow tests** (mirror EventListRow.test.tsx):
- Renders title, StatusBadge, isActive indicator
- Shows "✓ Активна" when isActive=true, "✗ Затворена" when isActive=false
- Shows applicationDeadline formatted dd.MM.yyyy when present
- Calls onEdit/onDelete with correct id
- Shows spinner + dimmed opacity when isDeleting=true

**useJobs tests** (mirror useEvents.test.tsx):
- Fetches all jobs by default (no query param)
- Fetches with `?isActive=true` when filter='ACTIVE'
- Fetches with `?isActive=false` when filter='CLOSED'
- Handles API error gracefully
- refetch() triggers new API call

### Key Differences from Events (Story 5.5)

| Aspect | Events (5.5) | Jobs (6.3) |
|---|---|---|
| Filter type | Time-based (UPCOMING/PAST) | isActive boolean (ACTIVE/CLOSED) |
| Filter API params | `?upcoming=true` or client-side filter | `?isActive=true` or `?isActive=false` |
| Client-side sort | Yes (eventDate ASC) | No (API returns newest first) |
| Required editors | eventDate (DatePickerField) | contactEmail input |
| Optional DatePicker | eventEndDate (with minDate) | applicationDeadline (no minDate) |
| TipTap editors | 1 optional (description) | 2: description (required) + requirements (optional) |
| Boolean toggle | isImportant (Checkbox, default false) | isActive (Checkbox, default TRUE) |
| Image upload | Yes (ImageUploadZone) | No image |
| Empty state text | "Няма добавени събития. Създайте първото!" | "Няма добавени позиции. Създайте първата!" |
| Create button | "Създай събитие" | "Създай позиция" |
| Delete message | "...това събитие?" | "...тази позиция?" |
| Breadcrumb section | "Събития" | "Кариери" |
| Publish toast | "Събитието е публикувано успешно!" | "Позицията е публикувана успешно!" |

### Critical: isActive Default = true in JobCreate

Unlike `isImportant` in Events (default false → checkbox unchecked), `isActive` defaults to `true` (checkbox **starts checked**):

```typescript
// JobCreate.tsx default values:
const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } =
  useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      requirements: null,
      contactEmail: '',
      applicationDeadline: null,
      isActive: true,   // ← STARTS CHECKED
      status: 'DRAFT',
    },
  });
```

### Critical: JobEdit — Reset for Null Fields

When resetting form with fetched data, `null` fields must be handled for controlled inputs:

```typescript
// In JobEdit, after fetching:
reset({
  title: job.title,
  description: job.description,
  requirements: job.requirements,          // null OK for RichTextEditor
  contactEmail: job.contactEmail,          // string, always present
  applicationDeadline: job.applicationDeadline,  // null OK for DatePickerField
  isActive: job.isActive,
  status: job.status,
});
```

Note: `contactEmail` is always a non-null string from the API, so no null coercion needed.

### Critical: Validation for Empty Description (RichTextEditor)

TipTap emits `<p></p>` (not empty string) when the editor is cleared. The description Zod validation uses `.min(1, ...)` on a string. The RichTextEditor `onChange` callback fires with the HTML string. Handle this:

```typescript
// In JobCreate/JobEdit:
onChange={(html) => setValue('description', html, { shouldValidate: true })}
```

The form schema validates `description.min(1)` — TipTap's `<p></p>` is NOT empty (length > 0), so the validation may pass even for visually empty content. If this is an issue, check if `RichTextEditor` already strips empty paragraphs (look at `frontend/src/components/admin/RichTextEditor.tsx` for its actual output when empty).

> Note: Check how EventCreate handles description validation — same component is used there as optional. For Jobs, description is required so watch for this edge case.

### Previous Story Intelligence (Story 6.2 — Jobs CRUD API)

- ✅ All backend endpoints at `/api/admin/v1/jobs` are implemented and tested
- ✅ `?isActive=true|false` query params correctly filter by isActive boolean
- ✅ `?status=DRAFT|PUBLISHED` also works (may be useful for future filtering)
- ✅ Backend returns jobs sorted `createdAt DESC` — no client-side sorting needed
- ✅ XSS skipFields already includes `requirements` and `isActive` — backend handles these correctly
- ✅ Response format: `{ success: true, message: 'Success', content: [...] }` — access via `res.data.content`
- ✅ 404 message: `"Позицията не е намерена"` for ID not found
- ✅ Delete message: `"Позицията е изтрита успешно"` (from service, not httpMsg util)
- ⚠️ publishedAt is managed by the backend — frontend only needs to send `status: 'PUBLISHED'`

### Previous Story Intelligence (Story 5.5 — Events List and Form, Code Review Fixes)

- ✅ H1: `DeleteConfirmDialog` now accepts optional `message?` prop — use it for Jobs delete message
- ✅ H2: Events sorted client-side by eventDate ASC — Jobs do NOT need client-side sorting (API handles it)
- ✅ M1: No `refetch()` on success path of delete — optimistic update is sufficient
- ✅ M2: Null defaults for controlled inputs can cause React warnings — use `''` for text inputs, `null` OK for DatePickerField/RichTextEditor
- ✅ ResizeObserver polyfill is in `frontend/src/test/setup.ts` — covers Radix Checkbox in tests
- ✅ Validation test pattern: Use "Save Draft" button to trigger validation on empty required fields (Publish button may have `disabled={!isValid}` guard)

### Git Intelligence (Recent Commits)

```
a991f4f Add Stories 4.3-4.4 and Epic 5 (5.1-5.6): Teacher UI, Events & Deadlines management
7d15a44 Add Epic 3 Stories (3.7-3.11) and Story 4.1: News Management & Teacher Model
992ef48 Story 4.2: Teacher CRUD API Endpoints with Code Review Improvements
```

Stories 5.7 and 6.1–6.2 are implemented but not yet committed. Current untracked files include public event/deadline controllers and all Job backend files.

### Reusable Components — DO NOT Recreate

- `DatePickerField` → `frontend/src/components/admin/DatePickerField.tsx` (Story 5.4)
- `RichTextEditor` → `frontend/src/components/admin/RichTextEditor.tsx` (Story 3.5)
- `ContentFormShell` → `frontend/src/components/admin/ContentFormShell.tsx`
- `DeleteConfirmDialog` → `frontend/src/components/admin/DeleteConfirmDialog.tsx` (now with optional `message?` prop)
- `StatusBadge` → `frontend/src/components/ui/StatusBadge.tsx`
- `Checkbox` → `frontend/src/components/ui/checkbox.tsx` (Shadcn)
- `useTeachers` / `useEvents` → reference patterns at `frontend/src/hooks/`

### Project Structure Notes

- **TypeScript path aliases**: `@/` → `frontend/src/` (configured in `frontend/tsconfig.json`)
- **API client**: `import api from '@/lib/api'` (axios instance with auth headers)
- **i18n hook**: `import { useTranslations } from '@/lib/i18n'` (or equivalent used in existing pages)
- **Toast**: `import { useToast } from '@/components/ui/use-toast'`
- **date-fns**: `import { format } from 'date-fns'; import { bg } from 'date-fns/locale/bg'` (already installed)
- **Loader2**: `import { Loader2 } from 'lucide-react'` (already in node_modules)
- **DO NOT add** any backend changes — backend is 100% complete for this story
- **DO NOT create** public-facing pages in this story — that's Story 6.4

### References

- Story 6.2 (done — Jobs CRUD API, master backend reference): [_bmad-output/implementation-artifacts/6-2-jobs-crud-api-endpoints.md](_bmad-output/implementation-artifacts/6-2-jobs-crud-api-endpoints.md)
- Story 5.5 (done — Events List and Form, primary frontend pattern): [_bmad-output/implementation-artifacts/5-5-events-list-and-form.md](_bmad-output/implementation-artifacts/5-5-events-list-and-form.md)
- Job Prisma schema (field reference): [backend/prisma/schema.prisma](backend/prisma/schema.prisma)
- EventsList (mirror for JobsList): [frontend/src/pages/admin/EventsList.tsx](frontend/src/pages/admin/EventsList.tsx)
- EventCreate (mirror for JobCreate): [frontend/src/pages/admin/EventCreate.tsx](frontend/src/pages/admin/EventCreate.tsx)
- EventEdit (mirror for JobEdit): [frontend/src/pages/admin/EventEdit.tsx](frontend/src/pages/admin/EventEdit.tsx)
- EventListRow (mirror for JobListRow): [frontend/src/components/admin/EventListRow.tsx](frontend/src/components/admin/EventListRow.tsx)
- useEvents (mirror for useJobs): [frontend/src/hooks/useEvents.ts](frontend/src/hooks/useEvents.ts)
- event-form.schema.ts (mirror for job-form.schema.ts): [frontend/src/schemas/event-form.schema.ts](frontend/src/schemas/event-form.schema.ts)
- event.ts type (mirror for job.ts): [frontend/src/types/event.ts](frontend/src/types/event.ts)
- i18n types (add jobsList, jobForm): [frontend/src/lib/i18n/types.ts](frontend/src/lib/i18n/types.ts)
- i18n Bulgarian translations: [frontend/src/lib/i18n/bg.ts](frontend/src/lib/i18n/bg.ts)
- App.tsx (add 3 job routes): [frontend/src/App.tsx](frontend/src/App.tsx)
- DeleteConfirmDialog (with message prop): [frontend/src/components/admin/DeleteConfirmDialog.tsx](frontend/src/components/admin/DeleteConfirmDialog.tsx)
- DatePickerField (Story 5.4): [frontend/src/components/admin/DatePickerField.tsx](frontend/src/components/admin/DatePickerField.tsx)
- RichTextEditor: [frontend/src/components/admin/RichTextEditor.tsx](frontend/src/components/admin/RichTextEditor.tsx)
- ContentFormShell: [frontend/src/components/admin/ContentFormShell.tsx](frontend/src/components/admin/ContentFormShell.tsx)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- Fix: DeleteConfirmDialog confirm button text is `t.buttons.delete` ("Изтрий"), not "Потвърди". Fixed JobsList test to use `getAllByText('Изтрий')` and click the last one (dialog button).

### Completion Notes List

- Implemented all 10 tasks: i18n types, Bulgarian translations, Job TypeScript type, Zod form schema, useJobs hook (with JobError + CRUD exports), JobListRow component, JobsList/JobCreate/JobEdit pages, App.tsx route registration, and 5 test files.
- 46 new tests written and passing. No regressions introduced.
- Followed EventsList/EventCreate/EventEdit patterns closely. Key differences: isActive filter (not time-based), no client-side sorting, two RichTextEditor instances (description required + requirements optional), isActive defaults to true.
- Optimistic delete flow: setData → close dialog → api.delete → toast. No refetch on success (as per code review learnings from Story 5.5).
- Pre-existing test failures in AutoSave, WebSocket, Teacher tests are NOT related to this story.

### File List

- frontend/src/lib/i18n/types.ts (modified — added jobsList, jobForm sections)
- frontend/src/lib/i18n/bg.ts (modified — added Bulgarian translations)
- frontend/src/types/job.ts (new)
- frontend/src/schemas/job-form.schema.ts (new)
- frontend/src/hooks/useJobs.ts (new)
- frontend/src/components/admin/JobListRow.tsx (new)
- frontend/src/pages/admin/JobsList.tsx (new)
- frontend/src/pages/admin/JobCreate.tsx (new)
- frontend/src/pages/admin/JobEdit.tsx (new)
- frontend/src/App.tsx (modified — added JobsList, JobCreate, JobEdit imports and 3 routes)
- frontend/src/__tests__/useJobs.test.tsx (new)
- frontend/src/__tests__/JobListRow.test.tsx (new)
- frontend/src/__tests__/JobsList.test.tsx (new)
- frontend/src/__tests__/JobCreate.test.tsx (new)
- frontend/src/__tests__/JobEdit.test.tsx (new)

## Senior Developer Review (AI)

**Reviewer:** claude-opus-4-6 | **Date:** 2026-03-09 | **Result:** APPROVED with fixes applied

**Issues Found:** 1 Critical, 1 High, 3 Medium, 2 Low → 3 AUTO-FIXED, 2 noted only

**Fixes Applied:**
- [CRITICAL] `types.ts` — `jobsList` and `jobForm` sections were placed OUTSIDE the `Translations` interface (dangling `}` at line 366 prematurely closed the interface). Fixed: removed premature closing brace, both sections now correctly inside `Translations`. Confirmed: `tsc -p tsconfig.app.json` now clean for story 6.3 files.
- [HIGH] `JobListRow.tsx:86` — Hardcoded Bulgarian string "Краен срок:" replaced with `t.jobsList.applicationDeadlinePrefix`. Added `applicationDeadlinePrefix` key to `types.ts` and `bg.ts`.
- [MEDIUM] `JobEdit.handleUpdate` — Removed redundant `api.get()` after `api.put()`. PUT response already returns the updated job in `response.data.content`; form is now reset from the PUT response directly, saving a network round-trip.

**Not Fixed (noted only):**
- [MEDIUM] Dead code: `getJob`, `createJob`, `updateJob`, `deleteJob` exports in `useJobs.ts` are unused by components but are tested per story spec (Task 4.7). Keeping per design intent.
- [MEDIUM] `useJobs` diverges from `useEvents` pattern (custom `JobError` class, enhanced error handling). Works correctly; no functional impact.

**All 46 tests pass after fixes.**

## Change Log

- 2026-03-09: Story 6.3 implemented — Jobs List and Form in Admin. Added full CRUD frontend for job postings: JobsList page with ALL/ACTIVE/CLOSED filter tabs, JobCreate and JobEdit forms with two TipTap editors (description required, requirements optional), contactEmail input, DatePickerField for applicationDeadline, and isActive Checkbox (default true). 46 new tests passing.
- 2026-03-09: Code review fixes applied — Fixed `Translations` interface brace structure in types.ts (CRITICAL), replaced hardcoded "Краен срок:" with i18n key in JobListRow (HIGH), removed redundant GET after PUT in JobEdit.handleUpdate (MEDIUM). All 46 tests still passing.
