# Story 7.4: Gallery List and Form

Status: done

## Story

As an **administrator**,
I want **to manage galleries through a list and form interface**,
so that **I can showcase kindergarten life through photos**.

## Acceptance Criteria

### AC1: Gallery List Page at `/admin/galleries`

```gherkin
Given I am logged in and navigate to `/admin/galleries`
When the page loads
Then I see all galleries displayed as a card/grid layout
And each card shows: cover image thumbnail, title, StatusBadge (DRAFT/PUBLISHED), image count (e.g., "12 снимки")
And each card has "Редактирай" (Edit) and "Изтрий" (Delete) buttons
And the page has a header with a prominent "Създай галерия" button
```

### AC2: Empty State

```gherkin
Given no galleries exist
When the list page loads
Then I see empty state text: "Няма добавени галерии. Създайте първата!"
And a "Създай галерия" button is displayed in the empty state
```

### AC3: Create Form at `/admin/galleries/create`

```gherkin
Given I navigate to `/admin/galleries/create`
When the form loads
Then I see a ContentFormShell layout with:
  - Breadcrumb: "Галерия > Създаване"
  - "Заглавие" text input (required)
  - "Описание" textarea (optional)
  - GalleryImageUploadZone for uploading multiple images
  - Action bar with "Запази чернова" and "Публикувай" buttons
```

### AC4: Edit Form at `/admin/galleries/:id/edit`

```gherkin
Given I navigate to `/admin/galleries/:id/edit` for an existing gallery
When the form loads
Then all fields (title, description) are pre-populated with existing data
And existing images are displayed in a GalleryImageGrid with hover-delete and drag-to-reorder
And I can add more images via GalleryImageUploadZone
And the action bar shows "Обнови" button (always saves current status) and "Запази чернова" / "Публикувай" depending on current status
```

### AC5: Publish Validation — Minimum 1 Image

```gherkin
Given I click "Публикувай" on a gallery with 0 images
When validation runs
Then an error toast displays: "Добавете поне една снимка преди публикуване"
And the gallery remains as DRAFT (no API call is made)
```

### AC6: Publish Success

```gherkin
Given I click "Публикувай" on a gallery that has at least 1 image
When the API call succeeds
Then a success toast displays: "Галерията е публикувана успешно!"
And the user is navigated to `/admin/galleries`
```

### AC7: Delete Confirmation Dialog

```gherkin
Given I click "Изтрий" on a gallery card
When the DeleteConfirmDialog opens
Then it shows the message:
  "Сигурни ли сте, че искате да изтриете тази галерия? Всички снимки ще бъдат изтрити."
And clicking confirm calls DELETE /api/admin/v1/galleries/:id
And on success the gallery is removed from the list with optimistic update
And a toast shows: "Галерията е изтрита успешно"
```

### AC8: Loading and Error States

```gherkin
Given the galleries API call is in-flight
When the list page is loading
Then skeleton placeholders are shown (3 rows)

Given the galleries API returns an error
When the error state is rendered
Then a Bulgarian error message is shown with a "Опитайте отново" retry button
```

## Tasks / Subtasks

### Types & Schema

- [x] Task 1: Extend `frontend/src/types/gallery.ts` with Gallery and GalleryDetail types (AC: 1, 3, 4)
  - [x] Add `Gallery` interface matching `GALLERY_LIST_SELECT` shape (id, title, description, coverImageUrl, status, publishedAt, createdAt, updatedAt, imageCount)
  - [x] Add `GalleryDetail` interface matching `GALLERY_DETAIL_SELECT` shape (same as Gallery minus imageCount, plus `images: GalleryImage[]`)

- [x] Task 2: Create `frontend/src/schemas/gallery-form.schema.ts` (AC: 3, 4)
  - [x] `galleryFormSchema`: title (required, min 1, max 200), description (nullable optional), status (enum DRAFT/PUBLISHED, default DRAFT)
  - [x] Export `GalleryFormData` type

### i18n

- [x] Task 3: Add `galleryList` and `galleryForm` to `frontend/src/lib/i18n/types.ts` (AC: 1–7)
  - [x] `galleryList`: title, subtitle, emptyState, createButton, filterAll, filterDrafts, filterPublished, deleteSuccess, deleteError, deleteConfirmMessage, loadError, retryButton, itemDeleted, imageCountSuffix
  - [x] `galleryForm`: title, createTitle, editTitle, titleLabel, titlePlaceholder, descriptionLabel, saveDraft, publish, update, noImagesError, errors (titleRequired, saveFailed, publishFailed, updateFailed), success (saved, published, updated), breadcrumb (gallery, create, edit)

- [x] Task 4: Add Bulgarian translations in `frontend/src/lib/i18n/bg.ts` (AC: 1–7)
  - [x] `galleryList`: Галерии / Управлявайте галериите / Няма добавени галерии. Създайте първата! / Създай галерия / etc.
  - [x] `galleryForm`: Галерия / Създаване на галерия / Редактиране на галерия / Заглавие / etc.
  - [x] `imageCountSuffix`: ' снимки' (e.g., "12 снимки")

### Hook

- [x] Task 5: Create `frontend/src/hooks/useGalleries.ts` (AC: 1, 2, 8)
  - [x] `useGalleries(filter?)` hook: fetches `GET /api/admin/v1/galleries`, returns `{ data, loading, error, refetch, setData }`
  - [x] `GalleryError` class (mirrors `JobError` pattern with statusCode, isNetworkError, isAuthError)
  - [x] Named export `getGallery(id)` → `GET /api/admin/v1/galleries/:id` returning `GalleryDetail`
  - [x] Named export `createGallery(data)` → `POST /api/admin/v1/galleries`
  - [x] Named export `updateGallery(id, data)` → `PUT /api/admin/v1/galleries/:id`
  - [x] Named export `deleteGallery(id)` → `DELETE /api/admin/v1/galleries/:id`
  - [x] No client-side filter — pass `?status=` query to backend when filter !== 'ALL'

### Pages

- [x] Task 6: Create `frontend/src/pages/admin/GalleriesList.tsx` (AC: 1, 2, 7, 8)
  - [x] Card/grid layout (3–4 columns responsive grid using CSS grid/Tailwind)
  - [x] Each card: cover image `<img src={thumbnailUrl || coverImageUrl} />` (fallback: placeholder icon), title, `StatusBadge`, image count (`${imageCount}${t.galleryList.imageCountSuffix}`)
  - [x] "Редактирай" button → `navigate('/admin/galleries/:id/edit')`
  - [x] "Изтрий" button → opens `DeleteConfirmDialog`
  - [x] Optimistic delete (same pattern as `JobsList`)
  - [x] Loading state: 3 skeleton cards
  - [x] Error state with retry button
  - [x] Empty state (AC2): text + "Създай галерия" button
  - [x] Header "Галерии" + subtitle + "Създай галерия" button (top-right)
  - [x] ARIA live region for screen reader announcements (same pattern as JobsList)

- [x] Task 7: Create `frontend/src/pages/admin/GalleryCreate.tsx` (AC: 3)
  - [x] `ContentFormShell` with breadcrumb `[{ label: t.galleryForm.breadcrumb.gallery, href: '/admin/galleries' }, { label: t.galleryForm.breadcrumb.create }]`
  - [x] React Hook Form with `zodResolver(galleryFormSchema)`
  - [x] Title `<Input>` (required) with validation error display
  - [x] Description `<Textarea>` (optional) — import from `@/components/ui/textarea` (shadcn-ui)
  - [x] **Create-then-redirect flow** (see Dev Notes: "GalleryCreate — Create-then-Redirect"):
    - "Запази чернова": POST `{ title, description, status: 'DRAFT' }` → navigate to `/admin/galleries/:id/edit`
    - "Публикувай": POST `{ title, description, status: 'PUBLISHED' }` → navigate to `/admin/galleries/:id/edit`
    - Note: AC5 publish image validation (≥1 image) occurs on the **edit** page, not here
  - [x] Both buttons disabled while saving/loading

- [x] Task 8: Create `frontend/src/pages/admin/GalleryEdit.tsx` (AC: 4, 5, 6)
  - [x] Load gallery by `:id` (parse from `useParams()`) via `getGallery(id)` on mount
  - [x] Pre-populate title and description fields via `reset({ title, description })` (React Hook Form)
  - [x] Maintain local `images: GalleryImage[]` state initialized from `gallery.images`
  - [x] Show existing images in `GalleryImageGrid`:
    - Props: `{ images, onDelete: handleDeleteImage, onReorder: handleReorderImages }`
    - **Note: `GalleryImageGrid` does NOT take `galleryId` prop** (removed in 7.3 code review M3). The parent manages API calls.
  - [x] Wire `GalleryImageGrid` callbacks using `useGalleryImages` hook:
    ```tsx
    const { deleteImage, reorderImages } = useGalleryImages();
    const handleDeleteImage = async (imageId: number) => {
      await deleteImage(galleryId, imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));
    };
    const handleReorderImages = (reordered: GalleryImage[]) => {
      setImages(reordered); // GalleryImageGrid handles debounced reorder API call internally
    };
    ```
  - [x] Show `GalleryImageUploadZone` below grid for uploading new images:
    - Props: `{ galleryId: galleryId, onImagesUploaded: (newImgs) => setImages(prev => [...prev, ...newImgs]) }`
  - [x] "Запази чернова": PUT `{ title, description, status: 'DRAFT' }` → toast success + stay on page
  - [x] "Публикувай" (AC5): if `images.length === 0` → toast error "Добавете поне една снимка преди публикуване", else PUT `{ title, description, status: 'PUBLISHED' }` → toast success + navigate to `/admin/galleries`
  - [x] "Обнови": PUT `{ title, description }` (no status change) → toast success + stay on page
  - [x] Action bar buttons: show "Запази чернова" + "Публикувай" when status is DRAFT; show "Обнови" + "Публикувай" when status is PUBLISHED
  - [x] Breadcrumb: `[{ label: t.galleryForm.breadcrumb.gallery, href: '/admin/galleries' }, { label: t.galleryForm.breadcrumb.edit }]`
  - [x] Loading skeleton while `getGallery` is in-flight; error state if 404

### Routes

- [x] Task 9: Add gallery routes to `frontend/src/App.tsx` (AC: 1, 3, 4)
  - [x] Import `GalleriesList`, `GalleryCreate`, `GalleryEdit` pages
  - [x] Add routes following the exact same ProtectedRoute + AdminLayout + ErrorBoundary pattern as jobs:
    - `/admin/galleries` → `GalleriesList`
    - `/admin/galleries/create` → `GalleryCreate`
    - `/admin/galleries/:id/edit` → `GalleryEdit`
  - [x] Routes must be added BEFORE the catch-all `*` route

### Tests

- [x] Task 10: Create `frontend/src/__tests__/GalleriesList.test.tsx` (AC: 1, 2, 7, 8)
  - [x] Mock `useGalleries` hook
  - [x] Test: renders gallery cards with title, image count, StatusBadge
  - [x] Test: shows empty state when no galleries
  - [x] Test: shows skeleton during loading
  - [x] Test: shows error state and retry button
  - [x] Test: clicking Delete opens confirmation dialog
  - [x] Test: confirming delete calls API and removes card

- [x] Task 11: Create `frontend/src/__tests__/GalleryCreate.test.tsx` (AC: 3)
  - [x] Mock `api.post` for gallery creation
  - [x] Test: form renders with title and description fields
  - [x] Test: title required — shows validation error when empty
  - [x] Test: "Запази чернова" creates gallery with DRAFT status and navigates to `/admin/galleries/:id/edit`
  - [x] Test: "Публикувай" creates gallery with PUBLISHED status and navigates to `/admin/galleries/:id/edit`

- [x] Task 12: Create `frontend/src/__tests__/GalleryEdit.test.tsx` (AC: 4, 5, 6)
  - [x] Mock `getGallery` to return a gallery with images
  - [x] Test: pre-populates title and description
  - [x] Test: renders GalleryImageGrid with existing images
  - [x] Test: "Публикувай" with 0 images shows error toast

- [x] Task 13: Create `frontend/src/__tests__/useGalleries.test.tsx` (AC: 1, 8)
  - [x] Test: fetches and returns galleries
  - [x] Test: handles loading/error states
  - [x] Follow `frontend/src/__tests__/useJobs.test.tsx` as reference

## Dev Notes

### Architecture: This Story in Context

Story 7.4 is a **pure frontend story** — all backend APIs are already implemented:
- Stories 7.1–7.2: Gallery + GalleryImage Prisma models and full CRUD API
- Story 7.3: Image upload, delete, and reorder endpoints

This story creates the admin UI to consume those APIs. No backend changes are needed.

### GalleryCreate — Create-then-Redirect (Definitive Pattern)

`GalleryImageUploadZone` requires a real `galleryId: number` prop — it cannot accept `null` or `undefined`. Since no galleryId exists until the gallery is POSTed, **do NOT attempt to implement deferred queue-based upload** on the create page.

**Definitive implementation:**
1. GalleryCreate renders title + description form fields only (no functional upload zone)
2. "Запази чернова" → POST gallery → navigate to `/admin/galleries/:id/edit`
3. "Публикувай" → POST gallery with `status: 'PUBLISHED'` → navigate to `/admin/galleries/:id/edit`
4. AC5 image validation (≥1 image before publishing) is enforced on the **edit** page, not the create page
5. The edit page is the primary place where images are added and managed

**Note about AC3**: AC3 says the create form shows "ImageUploadZone for multiple images". This is satisfied by rendering the `GalleryImageUploadZone` component UI on the create page, even though it becomes functional only after redirect to the edit page. OR, simply omit the upload zone from the create page and let the redirect to edit page serve as the natural flow for image management — both interpretations are valid.

### API Endpoints Reference (All Existing)

```
GET    /api/admin/v1/galleries           → list (auth required)
GET    /api/admin/v1/galleries/:id       → detail with images (auth required)
POST   /api/admin/v1/galleries           → create { title, description?, status? }
PUT    /api/admin/v1/galleries/:id       → update { title?, description?, status? }
DELETE /api/admin/v1/galleries/:id       → delete (cascade removes images)

POST   /api/admin/v1/galleries/:id/images          → upload image (multipart, field: 'image')
DELETE /api/admin/v1/galleries/:id/images/:imageId → remove image
PUT    /api/admin/v1/galleries/:id/images/reorder  → reorder { images: [{id, displayOrder}] }
```

**Response format** (standard `httpMsg` pattern):
```json
{ "success": true, "message": "...", "content": { ...data } }
```
List response wraps array in `content`: `{ success: true, content: [...galleries] }`

**Gallery list item shape** (from `GALLERY_LIST_SELECT`):
```typescript
{
  id: number;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  imageCount: number;  // transformed from _count.images in gallery_get_all_service.ts
}
```

**Gallery detail shape** (from `GALLERY_DETAIL_SELECT`):
```typescript
{
  id: number;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  images: GalleryImage[];  // sorted by displayOrder ASC
}
```

### Component Reuse from Story 7.3

Both components from Story 7.3 are **ready to use**:

**GalleryImageUploadZone** (`frontend/src/components/admin/GalleryImageUploadZone.tsx`):
```typescript
// Props:
{ galleryId: number; onImagesUploaded: (images: GalleryImage[]) => void }
```
- Handles multi-file drag-and-drop, validation, concurrency (max 3), per-image progress
- Calls `POST /api/admin/v1/galleries/:id/images` for each file
- Calls `onImagesUploaded` with newly created `GalleryImage[]` on completion

**GalleryImageGrid** (`frontend/src/components/admin/GalleryImageGrid.tsx`):
```typescript
// Props (galleryId was REMOVED in 7.3 code review M3 fix):
{ images: GalleryImage[]; onDelete: (imageId: number) => void; onReorder: (images: GalleryImage[]) => void }
```
- Responsive 3–4 column grid
- Hover-overlay delete button (×) — calls `onDelete(imageId)` (parent handles the API call with galleryId)
- @dnd-kit drag-to-reorder (debounced 500ms) — calls `onReorder(reorderedImages)` (grid handles PUT internally via its own reorder mechanism, OR delegates to parent — check actual implementation)
- **IMPORTANT**: The parent component (GalleryEdit) must provide `onDelete` that calls `deleteImage(galleryId, imageId)` from `useGalleryImages` hook

**useGalleryImages** (`frontend/src/hooks/useGalleryImages.ts`):
```typescript
const { uploadImage, deleteImage, reorderImages } = useGalleryImages();
```
- `uploadImage(galleryId, file, onProgress)` → POST to images endpoint
- `deleteImage(galleryId, imageId)` → DELETE
- `reorderImages(galleryId, images)` → PUT reorder

### Pattern: useGalleries Hook (follow useJobs exactly)

```typescript
// frontend/src/hooks/useGalleries.ts — Structure to follow:
export type GalleryFilter = 'ALL' | 'DRAFT' | 'PUBLISHED';

export class GalleryError extends Error {
  statusCode?: number;
  isNetworkError: boolean;
  isAuthError: boolean;
  // ... same as JobError
}

interface UseGalleriesResult {
  data: Gallery[];
  loading: boolean;
  error: GalleryError | null;
  refetch: () => void;
  setData: React.Dispatch<React.SetStateAction<Gallery[]>>;
}

export function useGalleries(filter: GalleryFilter = 'ALL'): UseGalleriesResult { ... }

// Individual functions:
export async function getGallery(id: number): Promise<GalleryDetail> { ... }
export async function createGallery(data: Partial<GalleryFormData>): Promise<Gallery> { ... }
export async function updateGallery(id: number, data: Partial<GalleryFormData>): Promise<Gallery> { ... }
export async function deleteGallery(id: number): Promise<void> { ... }
```

Query string for filter:
```typescript
const buildQueryString = (filter: GalleryFilter): string => {
  if (filter === 'DRAFT') return '?status=DRAFT';
  if (filter === 'PUBLISHED') return '?status=PUBLISHED';
  return ''; // ALL
};
```

### Pattern: Gallery Card Component

The GalleriesList uses a card grid layout (not a table row like JobsList). Suggested structure:

```tsx
// Each gallery card:
<div className="relative rounded-lg border border-gray-200 overflow-hidden bg-white hover:shadow-md transition-shadow">
  {/* Cover image */}
  <div className="aspect-video bg-gray-100 relative">
    {gallery.coverImageUrl ? (
      <img src={gallery.coverImageUrl} alt={gallery.title} className="w-full h-full object-cover" />
    ) : (
      <div className="flex items-center justify-center h-full">
        <ImageIcon className="h-12 w-12 text-gray-300" />
      </div>
    )}
  </div>
  {/* Card content */}
  <div className="p-4">
    <div className="flex items-start justify-between gap-2 mb-2">
      <h3 className="font-semibold text-gray-900 truncate">{gallery.title}</h3>
      <StatusBadge status={gallery.status} />
    </div>
    <p className="text-sm text-gray-500 mb-4">
      {gallery.imageCount}{t.galleryList.imageCountSuffix}
    </p>
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => onEdit(gallery.id)}>
        {t.buttons.edit}
      </Button>
      <Button variant="outline" size="sm" onClick={() => onDelete(gallery.id)}>
        {t.buttons.delete}
      </Button>
    </div>
  </div>
</div>
```

### Pattern: ContentFormShell (JobCreate reference)

`ContentFormShell` already exists and is used by all admin forms. It wraps content in a shell with breadcrumbs and an action bar:

```tsx
<ContentFormShell breadcrumbItems={breadcrumbItems} actionButtons={actionButtons}>
  {/* form content */}
</ContentFormShell>
```

Breadcrumb items format:
```typescript
const breadcrumbItems = [
  { label: t.galleryForm.breadcrumb.gallery, href: '/admin/galleries' },
  { label: t.galleryForm.breadcrumb.create }, // no href = current page
];
```

### Pattern: DeleteConfirmDialog

Already exists in `frontend/src/components/admin/DeleteConfirmDialog.tsx`. Used in JobsList:
```tsx
<DeleteConfirmDialog
  open={deleteDialogOpen}
  onOpenChange={setDeleteDialogOpen}
  itemTitle={galleryToDelete?.title || ''}
  isDeleting={isDeleting}
  onConfirm={handleConfirmDelete}
  message={t.galleryList.deleteConfirmMessage}
/>
```

### Pattern: StatusBadge

Used in existing admin lists (News, Teachers, Jobs). Import from:
```typescript
import { StatusBadge } from '@/components/admin/StatusBadge';
// Props: { status: 'DRAFT' | 'PUBLISHED' }
```

### i18n: Required Translations

Add to `frontend/src/lib/i18n/types.ts` and `bg.ts`:

**types.ts additions:**
```typescript
galleryList: {
  title: string;
  subtitle: string;
  emptyState: string;
  createButton: string;
  filterAll: string;
  filterDrafts: string;
  filterPublished: string;
  deleteSuccess: string;
  deleteError: string;
  deleteConfirmMessage: string;
  loadError: string;
  retryButton: string;
  itemDeleted: string;
  imageCountSuffix: string;
};
galleryForm: {
  title: string;
  createTitle: string;
  editTitle: string;
  titleLabel: string;
  titlePlaceholder: string;
  descriptionLabel: string;
  saveDraft: string;
  publish: string;
  update: string;
  noImagesError: string;
  errors: {
    titleRequired: string;
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
    gallery: string;
    create: string;
    edit: string;
  };
};
```

**bg.ts additions:**
```typescript
galleryList: {
  title: 'Галерии',
  subtitle: 'Управлявайте фотогалериите',
  emptyState: 'Няма добавени галерии. Създайте първата!',
  createButton: 'Създай галерия',
  filterAll: 'Всички',
  filterDrafts: 'Чернови',
  filterPublished: 'Публикувани',
  deleteSuccess: 'Галерията е изтрита успешно',
  deleteError: 'Грешка при изтриване на галерията',
  deleteConfirmMessage: 'Сигурни ли сте, че искате да изтриете тази галерия? Всички снимки ще бъдат изтрити.',
  loadError: 'Грешка при зареждане на галериите',
  retryButton: 'Опитайте отново',
  itemDeleted: 'Галерията е премахната от списъка',
  imageCountSuffix: ' снимки',
},
galleryForm: {
  title: 'Галерии',
  createTitle: 'Създаване на галерия',
  editTitle: 'Редактиране на галерия',
  titleLabel: 'Заглавие',
  titlePlaceholder: 'Въведете заглавие на галерията...',
  descriptionLabel: 'Описание (по избор)',
  saveDraft: 'Запази чернова',
  publish: 'Публикувай',
  update: 'Обнови',
  noImagesError: 'Добавете поне една снимка преди публикуване',
  errors: {
    titleRequired: 'Заглавието е задължително',
    saveFailed: 'Грешка при запазване',
    publishFailed: 'Грешка при публикуване',
    updateFailed: 'Грешка при обновяване',
  },
  success: {
    saved: 'Галерията е запазена успешно',
    published: 'Галерията е публикувана успешно!',
    updated: 'Галерията е обновена успешно',
  },
  breadcrumb: {
    gallery: 'Галерия',
    create: 'Създаване',
    edit: 'Редактиране',
  },
},
```

### App.tsx Route Additions

Add after the last jobs route and before the catch-all, following exact same pattern:

```tsx
// Imports to add:
import GalleriesList from "./pages/admin/GalleriesList";
import GalleryCreate from "./pages/admin/GalleryCreate";
import GalleryEdit from "./pages/admin/GalleryEdit";

// Routes to add (after /admin/jobs/:id/edit):
<Route
  path="/admin/galleries"
  element={
    <ProtectedRoute>
      <AdminLayout>
        <ErrorBoundary>
          <GalleriesList />
        </ErrorBoundary>
      </AdminLayout>
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/galleries/create"
  element={
    <ProtectedRoute>
      <AdminLayout>
        <ErrorBoundary>
          <GalleryCreate />
        </ErrorBoundary>
      </AdminLayout>
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/galleries/:id/edit"
  element={
    <ProtectedRoute>
      <AdminLayout>
        <ErrorBoundary>
          <GalleryEdit />
        </ErrorBoundary>
      </AdminLayout>
    </ProtectedRoute>
  }
/>
```

### Key File Paths

| File | Action | Notes |
|------|--------|-------|
| [frontend/src/types/gallery.ts](frontend/src/types/gallery.ts) | Extend | Add `Gallery` and `GalleryDetail` interfaces |
| `frontend/src/schemas/gallery-form.schema.ts` | **NEW** | Zod schema for gallery form |
| [frontend/src/lib/i18n/types.ts](frontend/src/lib/i18n/types.ts) | Extend | Add `galleryList` and `galleryForm` types |
| [frontend/src/lib/i18n/bg.ts](frontend/src/lib/i18n/bg.ts) | Extend | Add Bulgarian translations |
| `frontend/src/hooks/useGalleries.ts` | **NEW** | CRUD hook (mirrors useJobs.ts exactly) |
| `frontend/src/pages/admin/GalleriesList.tsx` | **NEW** | Card grid list page |
| `frontend/src/pages/admin/GalleryCreate.tsx` | **NEW** | Create form page |
| `frontend/src/pages/admin/GalleryEdit.tsx` | **NEW** | Edit form page |
| [frontend/src/App.tsx](frontend/src/App.tsx) | Extend | Add 3 gallery admin routes |
| `frontend/src/__tests__/GalleriesList.test.tsx` | **NEW** | List page tests |
| `frontend/src/__tests__/GalleryCreate.test.tsx` | **NEW** | Create page tests |
| `frontend/src/__tests__/GalleryEdit.test.tsx` | **NEW** | Edit page tests |
| `frontend/src/__tests__/useGalleries.test.tsx` | **NEW** | Hook tests |
| **REFERENCE** [frontend/src/pages/admin/JobsList.tsx](frontend/src/pages/admin/JobsList.tsx) | Read only | List page pattern |
| **REFERENCE** [frontend/src/pages/admin/JobCreate.tsx](frontend/src/pages/admin/JobCreate.tsx) | Read only | Form page pattern |
| **REFERENCE** [frontend/src/hooks/useJobs.ts](frontend/src/hooks/useJobs.ts) | Read only | Hook pattern |
| **REFERENCE** [frontend/src/components/admin/GalleryImageUploadZone.tsx](frontend/src/components/admin/GalleryImageUploadZone.tsx) | Use existing | Multi-image upload component |
| **REFERENCE** [frontend/src/components/admin/GalleryImageGrid.tsx](frontend/src/components/admin/GalleryImageGrid.tsx) | Use existing | Image grid with delete+reorder |
| **REFERENCE** [frontend/src/hooks/useGalleryImages.ts](frontend/src/hooks/useGalleryImages.ts) | Use existing | uploadImage, deleteImage, reorderImages |

### Previous Story Learnings (7.3)

- **GalleryImageUploadZone props**: `{ galleryId: number; onImagesUploaded: (images: GalleryImage[]) => void }` — requires a real galleryId, cannot pass null/undefined
- **GalleryImageGrid props**: `{ galleryId: number; images: GalleryImage[]; onDelete: (imageId: number) => void; onReorder: (images: GalleryImage[]) => void }` — note: no galleryId in GalleryImageGrid per code review (M3 fix — galleryId was removed from props as it was unused there; the hook handles it)
- **@dnd-kit already installed**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` are in `frontend/package.json`
- **Prisma model names**: `prisma.gallery` and `prisma.galleryImage` (camelCase)
- **httpMsg response format**: `{ success: true, message: '...', content: data }` — `content` holds the actual payload
- **Admin route prefix**: `/api/admin/v1/galleries/...`
- **coverImageUrl**: denormalized, maintained by application code (auto-set on first image upload, updated on delete/reorder)
- **XSS skipFields already updated**: `altText` and `images` added in 7.3 — no XSS changes needed for 7.4
- **Jest mock for default exports**: `{ __esModule: true, default: jest.fn()... }` pattern

### Git Intelligence (Recent Patterns)

Recent commits are all story-level commits pre-7.4 (7.1–7.3 implementation). The pattern for test file location in this project is `frontend/src/__tests__/` (NOT co-located), despite the architecture doc saying co-located — the actual tests in 7.3 are in `frontend/src/__tests__/`. Follow the **actual project pattern**, not the architecture doc's future recommendation.

### Project Structure Notes

- All new frontend pages follow `PascalCase` naming in `frontend/src/pages/admin/`
- Hook follows `camelCase` naming in `frontend/src/hooks/` — note: list pages use plural ("Galleries**List**") vs singular ("Gallery**Create**")
- Test files follow the `frontend/src/__tests__/` directory pattern (not co-located)
- No new backend files required for this story

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 7, Story 7.4] — Full acceptance criteria
- [Source: _bmad-output/implementation-artifacts/7-3-multi-image-upload-for-gallery.md#Dev Notes] — All 7.3 patterns, component props, hook signatures
- [Source: backend/src/constants/gallery_constants.ts] — GALLERY_LIST_SELECT and GALLERY_DETAIL_SELECT shapes
- [Source: backend/src/services/admin/gallery/gallery_get_all_service.ts] — imageCount transformation (from _count.images)
- [Source: frontend/src/pages/admin/JobsList.tsx] — List page pattern (card layout, delete dialog, optimistic updates)
- [Source: frontend/src/pages/admin/JobCreate.tsx] — Form page pattern (ContentFormShell, RHF + Zod, save/publish actions)
- [Source: frontend/src/hooks/useJobs.ts] — Hook pattern to mirror exactly
- [Source: frontend/src/App.tsx] — Routing pattern (ProtectedRoute + AdminLayout + ErrorBoundary)
- [Source: frontend/src/lib/i18n/bg.ts] — Translation key naming convention
- [Source: frontend/src/lib/i18n/types.ts] — Translation type definitions to extend

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- Fixed `StatusBadge` import path: `@/components/admin/StatusBadge` → `@/components/ui/StatusBadge` (correct location in project)
- Fixed `GalleryEdit.test.tsx` mock for `useGalleryImages` default export: used `{ default: vi.fn(() => ({...})) }` pattern to properly mock the hook

### Completion Notes List

- All 13 tasks/subtasks implemented and tested
- **Types** (`gallery.ts`): Added `Gallery` and `GalleryDetail` interfaces matching backend select shapes
- **Schema** (`gallery-form.schema.ts`): Zod schema with title (required, max 200), description (nullable optional), status enum
- **i18n**: Added `galleryList` and `galleryForm` type definitions and Bulgarian translations
- **Hook** (`useGalleries.ts`): Full CRUD hook mirroring `useJobs.ts` exactly — `useGalleries()` hook + `getGallery`, `createGallery`, `updateGallery`, `deleteGallery` exports
- **GalleriesList**: Card/grid layout, cover image with fallback, StatusBadge, image count, optimistic delete, loading/error/empty states, ARIA live region
- **GalleryCreate**: Create-then-redirect flow (POST → navigate to edit), RHF + Zod, both buttons disabled while saving
- **GalleryEdit**: Loads gallery on mount, pre-populates form, shows GalleryImageGrid + GalleryImageUploadZone, AC5 publish validation (≥1 image), DRAFT/PUBLISHED action bar logic
- **Routes**: 3 gallery admin routes added to App.tsx before catch-all, using ProtectedRoute + AdminLayout + ErrorBoundary pattern
- **Tests**: 29 tests across 4 files — all pass. No regressions on existing tests (13 pre-existing failures unrelated to gallery)

### File List

- `frontend/src/types/gallery.ts` (modified)
- `frontend/src/schemas/gallery-form.schema.ts` (new)
- `frontend/src/lib/i18n/types.ts` (modified)
- `frontend/src/lib/i18n/bg.ts` (modified)
- `frontend/src/hooks/useGalleries.ts` (new)
- `frontend/src/pages/admin/GalleriesList.tsx` (new)
- `frontend/src/pages/admin/GalleryCreate.tsx` (new)
- `frontend/src/pages/admin/GalleryEdit.tsx` (new)
- `frontend/src/App.tsx` (modified)
- `frontend/src/__tests__/GalleriesList.test.tsx` (new)
- `frontend/src/__tests__/GalleryCreate.test.tsx` (new)
- `frontend/src/__tests__/GalleryEdit.test.tsx` (new)
- `frontend/src/__tests__/useGalleries.test.tsx` (new)

## Senior Developer Review (AI)

**Reviewer:** claude-opus-4-6 | **Date:** 2026-03-15

**Outcome:** Changes Requested → Fixed → APPROVED

### Issues Found and Fixed

| Severity | Issue | Fix Applied |
|----------|-------|-------------|
| HIGH | `useGalleries` CRUD functions (`getGallery`, `createGallery`, `updateGallery`, `deleteGallery`) caught their own thrown `GalleryError` and replaced the error message with a generic fallback | Added `if (err instanceof GalleryError) throw err;` guard at the top of each catch block |
| MEDIUM | `GalleryEdit` showed a permanent loading skeleton when `galleryId` was `0` or `NaN` because `setLoadingGallery(false)` was never called in the early-return path | Added `setLoadingGallery(false)` + `setLoadError(...)` before the early return on invalid ID |
| MEDIUM | `GalleryEdit` tests were thin — only 4 tests, missing: save/publish/update success, error handling, loading state, 404 error, action bar button visibility by status, image upload callback | Added 7 new tests covering all missing scenarios |
| MEDIUM | `GalleriesList` had hardcoded Bulgarian `aria-label="Списък с галерии"` instead of i18n | Added `listAriaLabel` key to `types.ts` and `bg.ts`, updated component to use `t.galleryList.listAriaLabel` |
| MEDIUM | `gallery-form.schema.ts` used hardcoded validation messages that could diverge from i18n | Added comment documenting messages mirror `galleryForm.errors` translations (matches project-wide pattern) |
| MEDIUM | `GalleryCreate` tests missing button disabled-state verification | Added test asserting both buttons are disabled while a save is in-flight |

### Low Issues (Not Fixed — Acceptable)

- `useCallback` wrappers in `GalleryCreate` are ineffective due to `handleSubmit()` wrapping, but follow established project pattern
- GalleriesList delete test uses fragile text-matching for dialog confirm button (project-wide pattern in JobsList tests)

## Change Log

- 2026-03-15: Story 7.4 implemented — Gallery admin UI (types, schema, i18n, hook, list page, create page, edit page, routes, and tests). 29 tests passing.
- 2026-03-15: Code review (AI) — 1 High + 5 Medium issues found and fixed. Status updated to done.
