# Story 5.5: Events List and Form

Status: done

## Story

As an **administrator**,
I want **to manage calendar events through a list and form interface**,
so that **I can keep parents informed about upcoming kindergarten activities**.

## Acceptance Criteria

1. **Events list at `/admin/events`** — Page loads and displays all events in ItemListRow-style components; each row shows: title, event date (`dd.MM.yyyy`), `StatusBadge`, and an ⭐ important indicator when `isImportant=true`; each row has "Редактирай" (Edit) and "Изтрий" (Delete) buttons; events sorted by `eventDate` ascending (upcoming first).

2. **Empty state** — When no events exist (for the active filter), display: "Няма добавени събития. Създайте първото!" with a prominent "Създай събитие" button (only shown when `activeFilter === 'ALL'`).

3. **Filter tabs** — Three tabs: "Всички" (All), "Предстоящи" (Upcoming, `eventDate >= today`), "Минали" (Past, `eventDate < today`). Clicking a tab refetches with the appropriate `upcoming` query param.

4. **Create form at `/admin/events/create`** — `ContentFormShell` layout with breadcrumb "Събития > Създаване". Fields: "Заглавие" (required), "Дата на събитието" `DatePickerField` (required), "Крайна дата" `DatePickerField` (optional, multi-day), "Място" input (optional), "Описание" `RichTextEditor` (optional), "Важно събитие" checkbox (`isImportant`), `ImageUploadZone` (optional). Action bar: "Запази чернова" and "Публикувай".

5. **End-date validation** — "Крайна дата" `DatePickerField` uses `minDate={eventDate ? new Date(eventDate) : undefined}`, so dates before the start date are disabled. Zod schema produces error `"Крайната дата трябва да е след началната"` when `eventEndDate <= eventDate`.

6. **Edit form at `/admin/events/:id/edit`** — All fields pre-populated with existing event data; date pickers display existing ISO dates; status-aware buttons: DRAFT → "Запази чернова" + "Публикувай"; PUBLISHED → "Обнови" button only.

7. **Publish action** — Clicking "Публикувай" sets `status: 'PUBLISHED'`, POSTs/PUTs to API, and shows toast: "Събитието е публикувано успешно!"; navigates to list on success.

8. **Delete with confirmation** — Clicking "Изтрий" opens `DeleteConfirmDialog` with message: "Сигурни ли сте, че искате да изтриете това събитие?"; confirmation triggers optimistic removal from list + API DELETE call.

9. **Loading and error states** — Skeleton placeholders during data fetch; error banner with retry button on load failure; Bulgarian-language error messages throughout.

10. **ARIA / accessibility** — ARIA live region for delete announcements; `role="listitem"` on rows; `aria-invalid` + `aria-describedby` on all form inputs.

## Tasks / Subtasks

- [x] Task 1: Add i18n translations for Events (AC: 1–10)
  - [x] Add `eventsList` section to `frontend/src/lib/i18n/types.ts`
  - [x] Add `eventForm` section to `frontend/src/lib/i18n/types.ts`
  - [x] Add Bulgarian translations to `frontend/src/lib/i18n/bg.ts`

- [x] Task 2: Create `Event` TypeScript type (AC: 1, 6)
  - [x] Create `frontend/src/types/event.ts` mirroring backend Prisma Event model
  - [x] Export `EventStatus` enum (`DRAFT`, `PUBLISHED`)
  - [x] Export `Event` interface with all fields from Prisma schema

- [x] Task 3: Create Zod form schema for events (AC: 4, 5)
  - [x] Create `frontend/src/schemas/event-form.schema.ts`
  - [x] Required: `title` (min 1), `eventDate` (ISO string, not null)
  - [x] Optional: `eventEndDate` (ISO string | null), with superRefine: if both dates present, `eventEndDate > eventDate`
  - [x] Optional: `location` (string | null), `description` (string | null), `imageUrl` (Cloudinary URL | null), `isImportant` (boolean)
  - [x] `status` field: `z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT')`

- [x] Task 4: Create `useEvents` custom hook (AC: 1, 3)
  - [x] Create `frontend/src/hooks/useEvents.ts`
  - [x] Mirror `useTeachers` hook pattern: `data`, `loading`, `error`, `refetch`, `setData`
  - [x] Accept optional filter param (type: `'ALL' | 'UPCOMING' | 'PAST'`)
  - [x] Map filter to API query params: `UPCOMING` → `?upcoming=true`, `PAST` → no status filter (client-side or `?upcoming=false`)
  - [x] Export `EventError` class (mirrors `TeacherError`)
  - [x] API endpoint: `GET /api/admin/v1/events`
  - [x] Export individual CRUD functions: `getEvent`, `createEvent`, `updateEvent`, `deleteEvent`

- [x] Task 5: Create `EventListRow` component (AC: 1, 2, 8, 10)
  - [x] Create `frontend/src/components/admin/EventListRow.tsx`
  - [x] Props: `event: Event`, `onEdit: (id: number) => void`, `onDelete: (id: number) => void`, `isDeleting?: boolean`
  - [x] Display: title, `format(new Date(event.eventDate), 'dd.MM.yyyy', { locale: bg })`, `StatusBadge`, ⭐ if `isImportant`
  - [x] "Редактирай" button (blue ghost) + "Изтрий" button (red ghost)
  - [x] Keyboard navigation: Enter/Space triggers edit
  - [x] `isDeleting` → show `Loader2` spinner, dim opacity

- [x] Task 6: Create `EventsList` page (AC: 1–3, 8–10)
  - [x] Create `frontend/src/pages/admin/EventsList.tsx`
  - [x] Mirror `TeachersList.tsx` structure exactly
  - [x] Filter tabs: "Всички", "Предстоящи", "Минали"
  - [x] Use `useEvents(activeFilter)` hook
  - [x] `EventListRow` per event in list
  - [x] Skeleton loading rows, error banner, empty state
  - [x] Delete: optimistic update → close dialog → `api.delete('/api/admin/v1/events/:id')` → toast → refetch
  - [x] `DeleteConfirmDialog` wired with custom message
  - [x] ARIA live region for announcements
  - [x] "Създай събитие" button → navigates to `/admin/events/create`

- [x] Task 7: Create `EventCreate` page (AC: 4, 5, 7)
  - [x] Create `frontend/src/pages/admin/EventCreate.tsx`
  - [x] `useForm<EventFormData>` with `zodResolver(eventFormSchema)`, `mode: 'onChange'`
  - [x] Default values: `title: ''`, `eventDate: null`, `eventEndDate: null`, `location: null`, `description: null`, `imageUrl: null`, `isImportant: false`, `status: 'DRAFT'`
  - [x] `watch('eventDate')` for `minDate` prop on end-date picker
  - [x] `DatePickerField` for `eventDate` (required, `id="eventDate"`)
  - [x] `DatePickerField` for `eventEndDate` (optional, `id="eventEndDate"`, `minDate={eventDate ? new Date(eventDate) : undefined}`)
  - [x] `Input` for `location` (optional)
  - [x] `RichTextEditor` for `description` (optional)
  - [x] `Checkbox` for `isImportant` with label "Важно събитие"
  - [x] `ImageUploadZone` for `imageUrl` (optional)
  - [x] "Запази чернова" → `handleSubmit(handleSaveDraft)`, POST with `status: 'DRAFT'`
  - [x] "Публикувай" → `handleSubmit(handlePublish)`, POST with `status: 'PUBLISHED'`
  - [x] Breadcrumb: `[{ label: t.eventForm.breadcrumb.events, href: '/admin/events' }, { label: t.eventForm.breadcrumb.create }]`
  - [x] Navigate to `/admin/events` on success

- [x] Task 8: Create `EventEdit` page (AC: 6, 7)
  - [x] Create `frontend/src/pages/admin/EventEdit.tsx`
  - [x] `useParams<{ id: string }>()` to get event ID
  - [x] `useEffect` → `api.get('/api/admin/v1/events/:id')` → `reset(data)`
  - [x] Pre-populate all fields including date pickers from existing ISO strings
  - [x] Status-aware buttons: DRAFT → "Запази чернова" + "Публикувай"; PUBLISHED → "Обнови"
  - [x] Loading spinner during initial fetch; error state with back button
  - [x] Mirror `TeacherEdit.tsx` pattern fully

- [x] Task 9: Register routes in `App.tsx` (AC: 1, 4, 6)
  - [x] Import `EventsList`, `EventCreate`, `EventEdit`
  - [x] Add routes: `/admin/events`, `/admin/events/create`, `/admin/events/:id/edit`
  - [x] Wrap each in `ProtectedRoute > AdminLayout > ErrorBoundary`

- [x] Task 10: Write unit tests (AC: 1–10)
  - [x] Create `frontend/src/__tests__/EventsList.test.tsx`
  - [x] Create `frontend/src/__tests__/EventCreate.test.tsx`
  - [x] Create `frontend/src/__tests__/EventEdit.test.tsx`
  - [x] Create `frontend/src/__tests__/EventListRow.test.tsx`
  - [x] Create `frontend/src/__tests__/useEvents.test.tsx`
  - [x] Follow patterns from `TeachersList.test.tsx`, `TeacherCreate.test.tsx`, `TeacherListRow.test.tsx`, `useTeachers.test.tsx`
  - [x] Mock `@/lib/api` module (axios) for all API calls
  - [x] Mock `DatePickerField` and `RichTextEditor` in form tests (complex Radix/TipTap internals)

## Dev Notes

### Architecture: Complete Tech Stack for Story 5.5

```
Backend (already done - Stories 5.1–5.3):
  PostgreSQL ← Prisma Event model (migration applied)
  Express ← /api/admin/v1/events CRUD routes
  Zod validation ← event_schema.ts

Frontend (this story):
  React + TypeScript
  React Hook Form + Zod (zodResolver) → same as TeacherCreate/TeacherEdit
  DatePickerField (Story 5.4) ← Radix Popover + react-day-picker v8 + date-fns v3 bg locale
  RichTextEditor ← TipTap (already used in News and Teacher forms)
  ImageUploadZone ← Cloudinary upload (already used in Teacher form)
  ContentFormShell ← existing admin form wrapper
  useTeachers pattern → replicate as useEvents
  TeacherListRow pattern → replicate as EventListRow
  TeachersList/Create/Edit pattern → replicate as EventsList/Create/Edit
```

### API Endpoints (Backend — Stories 5.1–5.3, ALREADY IMPLEMENTED)

```
GET    /api/admin/v1/events              → list all events (optional: ?status=DRAFT|PUBLISHED, ?upcoming=true|false)
GET    /api/admin/v1/events/:id          → get single event
POST   /api/admin/v1/events              → create event (status defaults to DRAFT, isImportant defaults to false)
PUT    /api/admin/v1/events/:id          → update event
DELETE /api/admin/v1/events/:id          → delete event (returns: "Събитието е изтрито успешно")
```

**Response shape** (admin API JSend format — same as teachers/news):
```json
{
  "success": true,
  "message": "...",
  "content": { /* Event object or array */ }
}
```

**404 message**: `"Събитието не е намерено"` (from backend event_constants.ts)

### Event Model — Field Reference

Matches Prisma schema from Story 5.1:
```typescript
interface Event {
  id: number;
  title: string;
  description: string | null;          // Rich text HTML from TipTap
  eventDate: string;                   // ISO 8601, REQUIRED
  eventEndDate: string | null;         // ISO 8601, optional (multi-day events)
  location: string | null;             // Optional venue string
  isImportant: boolean;                // default false; shows ⭐ in lists
  imageUrl: string | null;             // Cloudinary URL or null
  status: 'DRAFT' | 'PUBLISHED';       // default DRAFT
  publishedAt: string | null;          // Set by backend on publish
  createdAt: string;                   // ISO 8601
  updatedAt: string;                   // ISO 8601
}
```

### File Placement — New Files

```
frontend/src/
├── types/
│   └── event.ts                        ← NEW (mirrors teacher.ts)
├── schemas/
│   └── event-form.schema.ts            ← NEW (mirrors teacher-form.schema.ts)
├── hooks/
│   └── useEvents.ts                    ← NEW (mirrors useTeachers.ts)
├── components/
│   └── admin/
│       └── EventListRow.tsx            ← NEW (mirrors TeacherListRow.tsx)
├── pages/
│   └── admin/
│       ├── EventsList.tsx              ← NEW (mirrors TeachersList.tsx)
│       ├── EventCreate.tsx             ← NEW (mirrors TeacherCreate.tsx)
│       └── EventEdit.tsx               ← NEW (mirrors TeacherEdit.tsx)
├── __tests__/
│   ├── EventsList.test.tsx             ← NEW
│   ├── EventCreate.test.tsx            ← NEW
│   ├── EventEdit.test.tsx              ← NEW
│   ├── EventListRow.test.tsx           ← NEW
│   └── useEvents.test.tsx              ← NEW
└── App.tsx                             ← MODIFY (add 3 event routes)
```

**Modify existing files:**
```
frontend/src/lib/i18n/types.ts          ← MODIFY (add eventsList, eventForm sections)
frontend/src/lib/i18n/bg.ts             ← MODIFY (add Bulgarian translations)
```

### Zod Schema — event-form.schema.ts (Complete Implementation)

```typescript
import { z } from 'zod';

export const eventFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Заглавието е задължително')
    .max(200, 'Заглавието е твърде дълго (максимум 200 символа)'),
  eventDate: z
    .string({ required_error: 'Датата на събитието е задължителна' })
    .min(1, 'Датата на събитието е задължителна'),
  eventEndDate: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  isImportant: z.boolean().default(false),
  imageUrl: z.preprocess(
    (val) => (val === '' ? null : val),
    z.string().url().refine(
      (url) => url.startsWith('https://res.cloudinary.com/'),
      'Невалиден URL на изображение - трябва да е от Cloudinary'
    ).nullable().optional()
  ),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
}).superRefine((data, ctx) => {
  if (data.eventDate && data.eventEndDate) {
    const start = new Date(data.eventDate);
    const end = new Date(data.eventEndDate);
    if (end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Крайната дата трябва да е след началната',
        path: ['eventEndDate'],
      });
    }
  }
});

export type EventFormData = z.infer<typeof eventFormSchema>;
```

### DatePickerField Integration — CRITICAL PATTERNS (from Story 5.4)

**`type="button"` is mandatory** on the trigger Button. Without it, clicking inside `<form>` submits the form.

**`watch` + `setValue` pattern** (same as RichTextEditor in TeacherCreate):
```tsx
const eventDate = watch('eventDate');

<DatePickerField
  id="eventDate"
  label="Дата на събитието"
  value={eventDate ?? null}
  onChange={(iso) => setValue('eventDate', iso ?? '', { shouldValidate: true })}
  error={errors.eventDate?.message}
  required
/>

<DatePickerField
  id="eventEndDate"
  label="Крайна дата (по избор)"
  value={watch('eventEndDate') ?? null}
  onChange={(iso) => setValue('eventEndDate', iso, { shouldValidate: true })}
  error={errors.eventEndDate?.message}
  minDate={eventDate ? new Date(eventDate) : undefined}
/>
```

**Timezone fix** (from Story 5.4 code review — H2 HIGH severity): `DatePickerField` now calls `new Date(Date.UTC(y, m, d))` internally so `toISOString()` gives correct date regardless of timezone. No extra handling needed in consuming form.

**minDate timezone fix** (from Story 5.4 code review — H1 HIGH severity): `DatePickerField` normalizes both dates to local midnight before comparison. When consuming, just pass `new Date(eventDate)` — the component handles the rest.

### isImportant Checkbox — Implementation

```tsx
import { Checkbox } from '@/components/ui/checkbox';

const isImportant = watch('isImportant');

<div className="flex items-center gap-2">
  <Checkbox
    id="isImportant"
    checked={isImportant}
    onCheckedChange={(checked) =>
      setValue('isImportant', !!checked, { shouldValidate: true })
    }
  />
  <Label htmlFor="isImportant">Важно събитие</Label>
</div>
```

**Note**: Use `watch('isImportant')` + `setValue` pattern (controlled), NOT `register('isImportant')`. Radix `Checkbox` is a controlled component.

### Filter Tabs — Events vs Teachers

Teachers use `status` filter (`DRAFT`/`PUBLISHED`) → passed as `?status=` query param.

Events use **time-based** filter (`UPCOMING`/`PAST`) → mapped to `?upcoming=true` (Upcoming) or no extra param with client-side filtering (Past). The backend supports `?upcoming=true` for events with `eventDate >= today`.

```typescript
// useEvents hook filter mapping:
type EventFilter = 'ALL' | 'UPCOMING' | 'PAST';

const buildQueryString = (filter: EventFilter): string => {
  if (filter === 'UPCOMING') return '?upcoming=true';
  if (filter === 'PAST') return '';  // fetch all, then client-filter by date
  return ''; // ALL = fetch all from API
};
```

**For PAST filter**: fetch all from API (no `upcoming` param), then `filter(event => new Date(event.eventDate) < today)` client-side. The backend `upcoming=true` only returns future events; past-only requires client-side filtering.

**Alternative**: Use two calls for PAST filter — first fetch all (`upcoming` omitted), client-filter where `eventDate < now`. This avoids adding a `?past=true` param not in the backend schema.

### EventListRow — Display Specifics

```
[ ⭐? | Title          | 15.03.2026 | [DRAFT badge] ] [ Редактирай ] [ Изтрий ]
```

- ⭐ shown inline when `isImportant=true` (e.g., before title or as separate column)
- Date formatted: `format(new Date(event.eventDate), 'dd.MM.yyyy', { locale: bg })`
- StatusBadge: `event.status.toLowerCase() as 'draft' | 'published'`
- If `eventEndDate` exists, optionally display date range: `15.03.2026 – 17.03.2026`

### i18n Additions Required

Add these sections to `types.ts` and `bg.ts`:

```typescript
// types.ts additions:
eventsList: {
  title: string;
  subtitle: string;
  emptyState: string;
  emptyFilteredState: string;
  createButton: string;
  filterAll: string;
  filterUpcoming: string;
  filterPast: string;
  deleteSuccess: string;
  deleteError: string;
  loadError: string;
  retryButton: string;
  itemDeleted: string;
};
eventForm: {
  title: string;
  createTitle: string;
  editTitle: string;
  titleLabel: string;
  titlePlaceholder: string;
  eventDateLabel: string;
  eventEndDateLabel: string;
  locationLabel: string;
  locationPlaceholder: string;
  descriptionLabel: string;
  isImportantLabel: string;
  imageLabel: string;
  saveDraft: string;
  publish: string;
  update: string;
  errors: {
    titleRequired: string;
    eventDateRequired: string;
    endBeforeStart: string;
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
    events: string;
    create: string;
    edit: string;
  };
};
```

```typescript
// bg.ts Bulgarian translations:
eventsList: {
  title: 'Събития',
  subtitle: 'Управлявайте събитията на вашия уебсайт',
  emptyState: 'Няма добавени събития. Създайте първото!',
  emptyFilteredState: 'Няма събития в тази категория.',
  createButton: 'Създай събитие',
  filterAll: 'Всички',
  filterUpcoming: 'Предстоящи',
  filterPast: 'Минали',
  deleteSuccess: 'Събитието е изтрито успешно',
  deleteError: 'Грешка при изтриване на събитието',
  loadError: 'Грешка при зареждане на събитията',
  retryButton: 'Опитайте отново',
  itemDeleted: 'Събитието е премахнато от списъка',
},
eventForm: {
  title: 'Събития',
  createTitle: 'Създаване на събитие',
  editTitle: 'Редактиране на събитие',
  titleLabel: 'Заглавие',
  titlePlaceholder: 'Въведете заглавие на събитието...',
  eventDateLabel: 'Дата на събитието',
  eventEndDateLabel: 'Крайна дата (по избор)',
  locationLabel: 'Място (по избор)',
  locationPlaceholder: 'напр. Сала за мероприятия, Двор...',
  descriptionLabel: 'Описание (по избор)',
  isImportantLabel: 'Важно събитие',
  imageLabel: 'Изображение (по избор)',
  saveDraft: 'Запази чернова',
  publish: 'Публикувай',
  update: 'Обнови',
  errors: {
    titleRequired: 'Заглавието е задължително',
    eventDateRequired: 'Датата на събитието е задължителна',
    endBeforeStart: 'Крайната дата трябва да е след началната',
    saveFailed: 'Грешка при запазване',
    publishFailed: 'Грешка при публикуване',
    updateFailed: 'Грешка при обновяване',
  },
  success: {
    saved: 'Събитието е запазено успешно',
    published: 'Събитието е публикувано успешно!',
    updated: 'Събитието е обновено успешно',
  },
  breadcrumb: {
    events: 'Събития',
    create: 'Създаване',
    edit: 'Редактиране',
  },
},
```

### Project Structure Notes

- **DO NOT** reinvent `DatePickerField` — it is complete and tested in `frontend/src/components/admin/DatePickerField.tsx` (Story 5.4)
- **DO NOT** reinstall date libraries — `date-fns`, `date-fns/locale/bg`, `react-day-picker`, `@radix-ui/react-popover` already installed
- `Checkbox` from `@/components/ui/checkbox` (shadcn) is already available — check if present, do not reinstall
- `ContentFormShell` is at `frontend/src/components/admin/ContentFormShell.tsx` — already used by Teacher forms
- `RichTextEditor` is at `frontend/src/components/admin/RichTextEditor.tsx` — already used by Teacher/News forms
- `ImageUploadZone` is at `frontend/src/components/admin/ImageUploadZone.tsx` — already used by Teacher/News forms
- `DeleteConfirmDialog` is at `frontend/src/components/admin/DeleteConfirmDialog.tsx` — already used by TeachersList
- `StatusBadge` is at `frontend/src/components/ui/StatusBadge.tsx` — already used by TeacherListRow
- `useTeachers` at `frontend/src/hooks/useTeachers.ts` is the **exact template** for `useEvents`
- Backend API is 100% complete — no backend changes needed in this story

### Testing Approach — Mirrors Teacher Tests

```typescript
// Pattern from TeacherCreate.test.tsx:
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
      <button
        type="button"
        id={id}
        data-testid={id}
        onClick={() => onChange('2026-03-15T00:00:00.000Z')}
      >
        Pick date
      </button>
      {error && <span role="alert">{error}</span>}
    </div>
  ),
}));

// Mock RichTextEditor:
vi.mock('@/components/admin/RichTextEditor', () => ({
  RichTextEditor: ({ onChange }: any) => (
    <div data-testid="rich-text-editor">
      <button onClick={() => onChange('<p>test</p>')}>Type content</button>
    </div>
  ),
}));
```

**EventsList tests** (mirror TeachersList.test.tsx):
- Renders loading skeletons initially
- Renders event rows after successful fetch
- Shows ⭐ for important events
- Shows empty state when no events
- Opens delete dialog on delete click
- Performs optimistic delete and shows toast
- Shows error state on fetch failure

**EventCreate tests** (mirror TeacherCreate.test.tsx):
- Renders all form fields
- Shows validation errors on submit with empty required fields
- Calls POST `/api/admin/v1/events` with correct payload on save draft
- Calls POST with `status: 'PUBLISHED'` on publish
- Navigates to `/admin/events` on success

**EventEdit tests**:
- Fetches event on mount and pre-populates form
- Shows loading spinner while fetching
- Shows 404 error state appropriately
- Calls PUT `/api/admin/v1/events/:id` on save/publish/update
- Status-aware buttons: PUBLISHED shows only "Обнови"

### Previous Story Intelligence (Story 5.4)

- ✅ `DatePickerField` is complete and reviewed — use exactly as documented
- ✅ Critical fix H1: minDate timezone — component handles internally via date normalization
- ✅ Critical fix H2: toISOString timezone — component now uses `Date.UTC(y,m,d)` internally
- ✅ `calendar.tsx` was modified to add `caption_dropdowns` and `vhidden` classNames — already done
- ✅ `datePicker` i18n section added — already in `types.ts` and `bg.ts`
- ⚠️ When consuming forms pass `error={errors.eventEndDate?.message}` — this is how the end-before-start error string renders (Zod sets it via `superRefine`)
- ⚠️ Always use `watch` + `setValue` for DatePickerField, NOT `register` (it's a controlled component)
- ⚠️ 16 unit tests for DatePickerField all pass — your forms should NOT re-test DatePickerField internals, just mock it

### Git Intelligence (Recent Commits)

Based on commit history:
- `Story 4.2`: Teacher CRUD API — established the `useTeachers` hook + `TeacherCreate`/`TeacherEdit`/`TeachersList` pattern to follow **exactly**
- `Story 3.5/3.6`: News form with TipTap auto-save — `RichTextEditor` is stable
- `Story 3.3`: Cloudinary image upload — `ImageUploadZone` is stable

**Established conventions from previous stories:**
1. Admin API response format: `{ success: boolean, message: string, content: T }`
2. Navigate to list view after successful create/publish/update
3. Optimistic delete: `setData(prev => prev.filter(...))` → close dialog → API DELETE → toast → refetch
4. Action buttons: always `type="button"` to prevent accidental form submission
5. Bulgarian error strings in Zod schemas match backend validation messages
6. All controlled components (RichTextEditor, ImageUploadZone, DatePickerField) use `watch` + `setValue` pattern
7. `mode: 'onChange'` on React Hook Form for live validation

### References

- Backend events controller: [backend/src/controllers/admin/event_controller.ts](backend/src/controllers/admin/event_controller.ts)
- Backend event route: [backend/src/routes/admin/v1/event_route.ts](backend/src/routes/admin/v1/event_route.ts)
- Backend event schema: [backend/src/schemas/event_schema.ts](backend/src/schemas/event_schema.ts)
- DatePickerField component (Story 5.4): [frontend/src/components/admin/DatePickerField.tsx](frontend/src/components/admin/DatePickerField.tsx)
- Story 5.4 (full implementation + code review): [_bmad-output/implementation-artifacts/5-4-date-picker-component-with-bulgarian-locale.md](_bmad-output/implementation-artifacts/5-4-date-picker-component-with-bulgarian-locale.md)
- TeachersList pattern: [frontend/src/pages/admin/TeachersList.tsx](frontend/src/pages/admin/TeachersList.tsx)
- TeacherCreate pattern: [frontend/src/pages/admin/TeacherCreate.tsx](frontend/src/pages/admin/TeacherCreate.tsx)
- TeacherEdit pattern: [frontend/src/pages/admin/TeacherEdit.tsx](frontend/src/pages/admin/TeacherEdit.tsx)
- TeacherListRow pattern: [frontend/src/components/admin/TeacherListRow.tsx](frontend/src/components/admin/TeacherListRow.tsx)
- useTeachers pattern: [frontend/src/hooks/useTeachers.ts](frontend/src/hooks/useTeachers.ts)
- Teacher Zod schema: [frontend/src/schemas/teacher-form.schema.ts](frontend/src/schemas/teacher-form.schema.ts)
- Teacher type: [frontend/src/types/teacher.ts](frontend/src/types/teacher.ts)
- i18n types: [frontend/src/lib/i18n/types.ts](frontend/src/lib/i18n/types.ts)
- i18n translations: [frontend/src/lib/i18n/bg.ts](frontend/src/lib/i18n/bg.ts)
- App.tsx (routing): [frontend/src/App.tsx](frontend/src/App.tsx)
- Admin routes index: [backend/src/routes/admin/v1/index.ts](backend/src/routes/admin/v1/index.ts)
- DeleteConfirmDialog: [frontend/src/components/admin/DeleteConfirmDialog.tsx](frontend/src/components/admin/DeleteConfirmDialog.tsx)
- ContentFormShell: [frontend/src/components/admin/ContentFormShell.tsx](frontend/src/components/admin/ContentFormShell.tsx)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None — all issues resolved during implementation.

### Completion Notes List

1. All 10 tasks implemented following exact mirror patterns from Teacher features (Stories 4.2–4.4).
2. PAST filter implemented client-side: fetch all events (no query param), then filter `eventDate < today`. Backend only supports `?upcoming=true` for future events.
3. ResizeObserver polyfill added to `frontend/src/test/setup.ts` — required for Radix UI Checkbox component used in EventCreate/EventEdit. This fix benefits all future tests using Radix UI components.
4. `Checkbox` uses `watch('isImportant')` + `setValue` pattern (controlled), NOT `register` — same as other controlled components (DatePickerField, RichTextEditor, ImageUploadZone).
5. EventEdit has 3 action modes: DRAFT → Save Draft + Publish; PUBLISHED → Update only (stays on page after update, reloads form data).
6. Validation error test for "empty title on save attempt" uses Save Draft button (not Publish) because Publish has `disabled={!isValid}` guard while Save Draft calls `handleSubmit` which triggers full validation including untouched fields.
7. Pre-existing test failures (11 files from Story 4.3): TeachersList.test.tsx and related tests have same `Cannot read properties of undefined (reading 'title')` pattern — missing `deleteConfirmDialog` in their i18n mocks. These failures pre-date Story 5.5 and are not regressions.
8. All 40 new tests pass: useEvents (12), EventListRow (8), EventsList (8), EventCreate (5), EventEdit (7).

### File List

**New files:**
- `frontend/src/types/event.ts`
- `frontend/src/schemas/event-form.schema.ts`
- `frontend/src/hooks/useEvents.ts`
- `frontend/src/components/admin/EventListRow.tsx`
- `frontend/src/pages/admin/EventsList.tsx`
- `frontend/src/pages/admin/EventCreate.tsx`
- `frontend/src/pages/admin/EventEdit.tsx`
- `frontend/src/__tests__/useEvents.test.tsx`
- `frontend/src/__tests__/EventListRow.test.tsx`
- `frontend/src/__tests__/EventsList.test.tsx`
- `frontend/src/__tests__/EventCreate.test.tsx`
- `frontend/src/__tests__/EventEdit.test.tsx`

**Modified files:**
- `frontend/src/lib/i18n/types.ts` — added `eventsList` and `eventForm` sections; added `deleteConfirmMessage` to `eventsList` (code review fix)
- `frontend/src/lib/i18n/bg.ts` — added Bulgarian translations for both sections; added `deleteConfirmMessage` (code review fix)
- `frontend/src/App.tsx` — added 3 routes: `/admin/events`, `/admin/events/create`, `/admin/events/:id/edit`
- `frontend/src/test/setup.ts` — added ResizeObserver polyfill for Radix UI components
- `frontend/src/components/admin/DeleteConfirmDialog.tsx` — added optional `message` prop (code review fix H1)
- `frontend/src/__tests__/EventsList.test.tsx` — updated i18n mock to include `deleteConfirmMessage` (code review fix)

## Senior Developer Review (AI)

**Reviewer:** claude-opus-4-6 on 2026-03-06
**Result:** APPROVED with fixes applied

### Issues Found and Fixed

**🔴 HIGH — H1: AC 8 delete dialog uses generic news-specific message**
- `DeleteConfirmDialog` used `t.deleteConfirmDialog.message` ("тази новина") for all entities
- Added optional `message?` prop to `DeleteConfirmDialog`; `EventsList` now passes `t.eventsList.deleteConfirmMessage` ("Сигурни ли сте, че искате да изтриете това събитие?") per AC 8
- Files: `frontend/src/components/admin/DeleteConfirmDialog.tsx`, `frontend/src/pages/admin/EventsList.tsx`, `frontend/src/lib/i18n/types.ts`, `frontend/src/lib/i18n/bg.ts`

**🔴 HIGH — H2: AC 1 events not sorted by eventDate ascending**
- Neither `useEvents` nor `EventsList` applied any sorting; AC 1 explicitly requires ascending order
- Added `.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())` after filtering in `useEvents.ts`
- File: `frontend/src/hooks/useEvents.ts`

**🟡 MEDIUM — M1: Redundant `refetch()` on successful delete**
- `handleConfirmDelete` called `refetch()` after successful optimistic delete — unnecessary API round-trip since optimistic update already removed the item; only the catch path needs refetch for rollback
- Removed success-path `refetch()` from `EventsList.tsx`
- File: `frontend/src/pages/admin/EventsList.tsx`

**🟡 MEDIUM — M2: `location` field null default causes uncontrolled input issues**
- `location: null` default with `register('location')` can cause React controlled/uncontrolled warnings; HTML inputs cannot be `null`
- Changed default to `location: ''`; added `setValueAs: (v) => v === '' ? null : v` to `register()` to restore null for the API; updated both `reset()` calls in `EventEdit` to coerce `null → ''`
- Files: `frontend/src/pages/admin/EventCreate.tsx`, `frontend/src/pages/admin/EventEdit.tsx`

**🟡 MEDIUM — M3: Redundant spread `{ ...data, status: data.status }` in `EventEdit.handleSave`**
- Spreading `status: data.status` over `...data` is a no-op — `status` is already in `data`
- Simplified to `data` directly; same fix applied to `handleUpdate`
- File: `frontend/src/pages/admin/EventEdit.tsx`

### False Positive Retracted
- H3 (aria-invalid on DatePickerField): `DatePickerField` already correctly implements `aria-invalid={!!error}` and `aria-describedby={error ? \`${id}-error\` : undefined}` on the trigger Button (lines 69-70). Not an issue.

### All 40 tests pass after fixes.
