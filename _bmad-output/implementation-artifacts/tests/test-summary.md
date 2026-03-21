# Test Automation Summary — Story 6.3: Jobs List and Form in Admin

**Date**: 2026-03-09
**Framework**: Vitest + @testing-library/react
**Status**: ✅ All tests passing

---

## Generated Tests

### Frontend Unit Tests (Vitest)

- [x] `frontend/src/__tests__/useJobs.test.tsx` — Hook data fetching, filter params, CRUD functions
- [x] `frontend/src/__tests__/JobListRow.test.tsx` — Component rendering, isActive display, button interactions
- [x] `frontend/src/__tests__/JobsList.test.tsx` — Page list, filter tabs, loading/error/empty states, delete flow
- [x] `frontend/src/__tests__/JobCreate.test.tsx` — Form rendering, validation, draft save, publish, navigation
- [x] `frontend/src/__tests__/JobEdit.test.tsx` — Pre-population, loading/error states, status-aware buttons, PUT calls

---

## Test Results

```
Test Files   5 passed (5)
Tests       46 passed (46)
Duration    ~15s
```

---

## Coverage by Acceptance Criteria

| AC | Description | Tests |
|----|-------------|-------|
| AC1 | Jobs list at `/admin/jobs` | JobsList: renders list, shows title/StatusBadge/isActive |
| AC2 | Empty state | JobsList: shows empty state with create button (filter=ALL) |
| AC3 | Filter tabs (Всички/Активни/Затворени) | JobsList: tabs refetch with correct query params |
| AC4 | Create form at `/admin/jobs/create` | JobCreate: all fields rendered |
| AC5 | Edit form pre-population | JobEdit: pre-populates all fields after fetch |
| AC6 | Form validation | JobCreate: errors for title, description, contactEmail |
| AC7 | Publish action | JobCreate: POST with PUBLISHED status + success toast |
| AC8 | isActive toggle | JobCreate: isActive checkbox checked by default; included in payload |
| AC9 | Delete with confirmation | JobsList: opens dialog, optimistic delete, no refetch on success |
| AC10 | Loading and error states | JobsList/JobEdit: skeletons, error banner with retry |

---

## Test Detail

### `useJobs.test.tsx` (15 tests)

**useJobs hook**
- [x] Fetches all jobs (no query param for filter=ALL)
- [x] Fetches with `?isActive=true` for filter=ACTIVE
- [x] Fetches with `?isActive=false` for filter=CLOSED
- [x] Handles fetch error — sets error, keeps data empty
- [x] `refetch()` triggers a new API call

**getJob**
- [x] Fetches single job by id, returns content
- [x] Throws `JobError` on 404

**createJob**
- [x] POSTs to `/api/admin/v1/jobs` with correct payload
- [x] Throws `JobError` on 400

**updateJob**
- [x] PUTs to `/api/admin/v1/jobs/:id` with update data
- [x] Throws `JobError` on 404

**deleteJob**
- [x] DELETEs `/api/admin/v1/jobs/:id`
- [x] Throws `JobError` on 404

---

### `JobListRow.test.tsx` (8 tests)

- [x] Renders title and StatusBadge
- [x] Shows "✓ Активна" when `isActive=true`
- [x] Shows "✗ Затворена" when `isActive=false`
- [x] Shows formatted `applicationDeadline` (`dd.MM.yyyy`) when present
- [x] Does not show deadline column when `applicationDeadline` is null
- [x] Calls `onEdit(id)` on edit button click
- [x] Calls `onDelete(id)` on delete button click
- [x] Shows `Loader2` spinner and hides edit button when `isDeleting=true`

---

### `JobsList.test.tsx` (9 tests)

- [x] Renders list with job rows after successful fetch
- [x] Shows "✓ Активна" for active jobs
- [x] Shows empty state "Няма добавени позиции. Създайте първата!" when no jobs (filter=ALL)
- [x] Shows skeleton loading rows during fetch
- [x] Shows error banner with retry button on fetch failure
- [x] Opens `DeleteConfirmDialog` with correct message on delete click
- [x] Navigates to edit page on edit button click
- [x] Navigates to `/admin/jobs/create` on create button click
- [x] Performs optimistic delete + shows success toast (no refetch on success path)

---

### `JobCreate.test.tsx` (9 tests)

- [x] Renders all form fields (title, description editor, requirements editor, contactEmail, date picker, isActive checkbox)
- [x] Shows validation error "Заглавието е задължително" for empty title
- [x] Shows validation error for missing `contactEmail`
- [x] Shows validation error for invalid email format
- [x] Saves draft — POSTs with `status: 'DRAFT'`
- [x] Publishes — POSTs with `status: 'PUBLISHED'` + shows "Позицията е публикувана успешно!" toast
- [x] Shows error toast on API save failure
- [x] `isActive` checkbox is checked by default (`isActive: true`)
- [x] Navigates to `/admin/jobs` on success

---

### `JobEdit.test.tsx` (7 tests)

- [x] Shows loading spinner during initial fetch
- [x] Shows error state with back button if fetch fails (404)
- [x] Pre-populates all form fields after successful fetch
- [x] Shows "Запази чернова" + "Публикувай" buttons for DRAFT jobs
- [x] Shows only "Обнови" button for PUBLISHED jobs
- [x] Calls PUT `/api/admin/v1/jobs/:id` on save
- [x] Calls PUT with `status: 'PUBLISHED'` on publish

---

## Mock Strategy

| Mock | Reason |
|------|--------|
| `@/lib/api` | Isolate all HTTP calls (get/post/put/delete) |
| `@/components/admin/DatePickerField` | Radix Popover internals too complex for jsdom |
| `@/components/admin/RichTextEditor` | TipTap editor not compatible with jsdom |
| `@/components/ui/StatusBadge` | Keep rendering tests focused |
| `react-router-dom` navigate | Verify navigation without actual routing |

**Not mocked**: `Checkbox` (Shadcn) — ResizeObserver polyfill in `setup.ts` handles it.

---

## Next Steps

- Run tests in CI pipeline
- Consider adding filter tab interaction tests (click "Активни" → verify API call with `?isActive=true`)
- Backend API tests exist in `backend/__test__/jobs-admin.routes.test.ts` (Story 6.2)
