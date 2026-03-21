# Story 7.5: Public Gallery Display

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **website visitor**,
I want **to browse photo galleries on the kindergarten website**,
so that **I can see the kindergarten environment and activities**.

## Acceptance Criteria

### AC1: Public Gallery List API — `GET /api/v1/public/galleries`

```gherkin
Given a request to GET /api/v1/public/galleries
When the handler runs
Then it returns only PUBLISHED galleries that have at least 1 image
And galleries are sorted by publishedAt descending (newest first)
And each gallery includes: id, title, description, coverImageUrl, imageCount, publishedAt, createdAt, updatedAt
And response format is: { status: 'success', data: { galleries: [...] } }
And response time is < 500ms (warn in console if exceeded)
```

### AC2: Public Gallery Detail API — `GET /api/v1/public/galleries/:id`

```gherkin
Given a request to GET /api/v1/public/galleries/:id for a PUBLISHED gallery with images
When the handler runs
Then it returns 200 with gallery and all images sorted by displayOrder ascending
And response format is: { status: 'success', data: { gallery: { ...fields, images: [...] } } }

Given a request to GET /api/v1/public/galleries/:id for a DRAFT gallery
When the handler runs
Then it returns 404 with: { status: 'fail', data: { message: 'Галерията не е намерена' } }

Given a request to GET /api/v1/public/galleries/:id with invalid id (NaN)
When the handler runs
Then it returns 404 with: { status: 'fail', data: { message: 'Галерията не е намерена' } }
```

### AC3: Public Gallery List Page at `/galleries`

```gherkin
Given I navigate to /galleries
When the page loads
Then I see a grid of gallery cards (responsive: 1 → 2 → 3 columns)
And each card shows: cover image (or placeholder icon), gallery title, image count (e.g., "12 снимки")
And there is a page heading "Фотогалерии"

Given no PUBLISHED galleries exist with images
When the page loads
Then I see: "Галерията скоро ще бъде обновена."
```

### AC4: Loading and Error States

```gherkin
Given the gallery list API call is in-flight
When the page renders
Then a loading text "Зареждане..." is shown under the page heading

Given the gallery list API returns an error
When the error state renders
Then a Bulgarian error message is shown: "Грешка при зареждане на галериите"
```

### AC5: Gallery Detail Page at `/galleries/:id`

```gherkin
Given I click on a gallery card (or navigate to /galleries/:id)
When the page loads
Then I see the gallery title as a heading
And all gallery images are displayed in a responsive grid (2–4 columns)
And below the image grid I see a "← Назад към галериите" link back to /galleries

Given the gallery :id does not exist or is DRAFT
When the page loads
Then I see a "not found" message: "Галерията не е намерена"
```

### AC6: Lightbox Viewer

```gherkin
Given I am on the gallery detail page with images
When I click on any image
Then a lightbox modal opens showing the full image
And arrow buttons (← →) allow navigation to previous/next images
And left/right arrow keys also navigate between images
And pressing Escape or clicking the × button closes the lightbox
And focus is trapped within the lightbox while open (accessibility)
And a counter shows current position: "3 / 12"
```

### AC7: Route Registration

```gherkin
Given I navigate to /galleries
Then the GalleriesPage component renders wrapped in PublicLayout + ErrorBoundary

Given I navigate to /galleries/:id
Then the GalleryDetailPage component renders wrapped in PublicLayout + ErrorBoundary
```

## Tasks / Subtasks

### Backend

- [x] Task 1: Create `backend/src/controllers/public/gallery_controller.ts` (AC: 1, 2)
  - [x] Export `getPublicGalleries`: query PUBLISHED galleries with `images: { some: {} }` filter, select id/title/description/coverImageUrl/publishedAt/createdAt/updatedAt/`_count.images`, transform `_count.images` → `imageCount`, sort by publishedAt DESC, log warning if >500ms, return `{ status: 'success', data: { galleries } }`
  - [x] Export `getPublicGallery`: parse `req.params.id` as int (NaN → 404), query PUBLISHED gallery by id with images sorted by displayOrder ASC using `GALLERY_DETAIL_SELECT` + status filter, not found/DRAFT → 404 `{ status: 'fail', data: { message: 'Галерията не е намерена' } }`, return `{ status: 'success', data: { gallery } }`

- [x] Task 2: Create `backend/src/routes/public/gallery_route.ts` (AC: 1, 2)
  - [x] `GET /` → `getPublicGalleries`
  - [x] `GET /:id` → `getPublicGallery`

- [x] Task 3: Register public gallery routes in `backend/src/server/app.ts` (AC: 1, 2)
  - [x] Add: `import publicGalleryRoutes from '@routes/public/gallery_route';`
  - [x] Add: `app.use(baseApiUrl + '/v1/public/galleries', publicGalleryRoutes);`
  - [x] Place after existing public route registrations (after `publicApplicationRoutes` line)

### Frontend — i18n

- [x] Task 4: Add `publicGallery` to `frontend/src/lib/i18n/types.ts` (AC: 3, 4, 5, 6)
  - [x] Add interface property:
    ```typescript
    publicGallery: {
      sectionTitle: string;      // "Фотогалерии"
      emptyState: string;        // "Галерията скоро ще бъде обновена."
      loading: string;           // "Зареждане..."
      error: string;             // "Грешка при зареждане на галериите"
      imageCount: string;        // suffix: " снимки"
      notFound: string;          // "Галерията не е намерена"
      backToList: string;        // "← Назад към галериите"
      lightboxClose: string;     // "Затвори"
      lightboxPrev: string;      // "Предишна снимка"
      lightboxNext: string;      // "Следваща снимка"
      detailLoading: string;     // "Зареждане на галерията..."
      detailError: string;       // "Грешка при зареждане на галерията"
    };
    ```

- [x] Task 5: Add Bulgarian translations to `frontend/src/lib/i18n/bg.ts` (AC: 3, 4, 5, 6)
  - [x] Add `publicGallery` object with all keys defined in Task 4

### Frontend — Types

- [x] Task 6: Add public gallery types to `frontend/src/types/gallery.ts` (AC: 3, 5)
  - [x] Add `PublicGallery` interface:
    ```typescript
    export interface PublicGallery {
      id: number;
      title: string;
      description: string | null;
      coverImageUrl: string | null;
      imageCount: number;
      publishedAt: string | null;
      createdAt: string;
      updatedAt: string;
    }
    ```
  - [x] Add `PublicGalleryDetail` interface (reuse `GalleryImage` type already in file):
    ```typescript
    export interface PublicGalleryDetail {
      id: number;
      title: string;
      description: string | null;
      coverImageUrl: string | null;
      publishedAt: string | null;
      createdAt: string;
      updatedAt: string;
      images: GalleryImage[];
    }
    ```

### Frontend — Components

- [x] Task 7: Create `frontend/src/components/public/GalleryCard.tsx` (AC: 3)
  - [x] Props: `{ gallery: PublicGallery; onClick: () => void }`
  - [x] Export `PublicGallery` type re-export (or import from types/gallery)
  - [x] Shows: cover image (`<img loading="lazy" />`) or placeholder `<ImageIcon>` from lucide-react
  - [x] Shows: title, image count (e.g. `${gallery.imageCount}${t.publicGallery.imageCount}`)
  - [x] Entire card is clickable → calls `onClick`
  - [x] Card style: rounded, shadow, aspect-video cover image, hover opacity/shadow effect

- [x] Task 8: Create `frontend/src/components/public/GalleryLightbox.tsx` (AC: 6)
  - [x] Props: `{ images: GalleryImage[]; initialIndex: number; onClose: () => void }`
  - [x] Uses `@radix-ui/react-dialog` (already installed) for accessible modal
  - [x] Shows current image full-size with `object-contain`
  - [x] Shows image counter: `{currentIndex + 1} / {images.length}`
  - [x] "×" button (top-right) closes lightbox — uses `t.publicGallery.lightboxClose` as aria-label
  - [x] "←" prev button — disabled when at index 0; aria-label: `t.publicGallery.lightboxPrev`
  - [x] "→" next button — disabled when at last index; aria-label: `t.publicGallery.lightboxNext`
  - [x] `useEffect` for keyboard handler (ArrowLeft/ArrowRight only — Escape handled by Radix)
  - [x] Focus trap: Radix Dialog handles focus trap automatically — no extra implementation needed
  - [x] Dark overlay background (bg-black/90)
  - [x] Shows `altText` if present, or gallery title as fallback for `<img alt>`

### Frontend — Pages

- [x] Task 9: Create `frontend/src/pages/public/GalleriesPage.tsx` (AC: 3, 4, 7)
  - [x] Follows **exact pattern** of `EventsPage.tsx` (AbortController, loading/error/empty states)
  - [x] Fetches from `GET /api/v1/public/galleries` — response: `response.data.data.galleries`
  - [x] Uses `useNavigate` to handle card click → `navigate(\`/galleries/\${gallery.id}\`)`
  - [x] Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
  - [x] Renders `GalleryCard` for each gallery with `onClick={() => navigate(\`/galleries/\${gallery.id}\`)}`
  - [x] Loading state: shows `t.publicGallery.loading`
  - [x] Error state: shows `t.publicGallery.error`
  - [x] Empty state: shows `t.publicGallery.emptyState`
  - [x] Page heading: `t.publicGallery.sectionTitle` ("Фотогалерии")

- [x] Task 10: Create `frontend/src/pages/public/GalleryDetailPage.tsx` (AC: 5, 6, 7)
  - [x] Uses `useParams()` to get `id` → parse as int
  - [x] Fetches from `GET /api/v1/public/galleries/:id` on mount using AbortController
  - [x] Response: `response.data.data.gallery` (type: `PublicGalleryDetail`)
  - [x] Loading state: shows `t.publicGallery.detailLoading`
  - [x] Error/404 state: shows `t.publicGallery.notFound` (treat all errors as not found)
  - [x] "← Назад към галериите" link using `<Link to="/galleries">` (react-router-dom)
  - [x] Gallery title as `<h1>`, optional description below
  - [x] Image grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2`
  - [x] Each image: `<img>` with `cursor-pointer`, `aspect-square object-cover`, `loading="lazy"`; onClick sets `lightboxIndex` state
  - [x] Renders `GalleryLightbox` when `lightboxIndex !== null`
  - [x] `onClose={() => setLightboxIndex(null)}`

### Frontend — Routes

- [x] Task 11: Add public gallery routes to `frontend/src/App.tsx` (AC: 7)
  - [x] Import `GalleriesPage` and `GalleryDetailPage`
  - [x] Add routes in the public routes section (after `/jobs/:id` route, before `/menu`):
    ```tsx
    <Route path="/galleries" element={<ErrorBoundary><PublicLayout><GalleriesPage /></PublicLayout></ErrorBoundary>} />
    <Route path="/galleries/:id" element={<ErrorBoundary><PublicLayout><GalleryDetailPage /></PublicLayout></ErrorBoundary>} />
    ```

### Tests — Backend

- [x] Task 12: Create `backend/__test__/galleries-public.routes.test.ts` (AC: 1, 2)
  - [x] Follow pattern of `backend/__test__/jobs-admin.routes.test.ts`
  - [x] Mock Prisma client
  - [x] Test: GET /api/v1/public/galleries — returns only PUBLISHED galleries with images, imageCount transformed
  - [x] Test: GET /api/v1/public/galleries — empty array when no published galleries
  - [x] Test: GET /api/v1/public/galleries/:id — returns gallery with images for valid PUBLISHED id
  - [x] Test: GET /api/v1/public/galleries/:id — returns 404 for DRAFT gallery
  - [x] Test: GET /api/v1/public/galleries/:id — returns 404 for non-existent id
  - [x] Test: GET /api/v1/public/galleries/abc — returns 404 for NaN id

### Tests — Frontend

- [x] Task 13: Create `frontend/src/__tests__/GalleriesPage.test.tsx` (AC: 3, 4)
  - [x] Follow pattern of `EventsPage.test.tsx` exactly
  - [x] Mock `@/lib/api` and `@/lib/i18n`
  - [x] Test: fetches and displays gallery cards on mount
  - [x] Test: shows loading state while fetching
  - [x] Test: shows empty state when no galleries returned
  - [x] Test: shows error state on API failure
  - [x] Test: does not show error for cancelled requests

- [x] Task 14: Create `frontend/src/__tests__/GalleryCard.test.tsx` (AC: 3)
  - [x] Test: renders cover image when coverImageUrl present
  - [x] Test: renders placeholder icon when no coverImageUrl
  - [x] Test: renders title and image count
  - [x] Test: calls onClick when card is clicked

- [x] Task 15: Create `frontend/src/__tests__/GalleryDetailPage.test.tsx` (AC: 5, 6)
  - [x] Mock `@/lib/api`, `@/lib/i18n`, `react-router-dom` (useParams)
  - [x] Test: fetches and displays gallery title and images
  - [x] Test: shows loading state
  - [x] Test: shows not-found state on 404 error
  - [x] Test: clicking image opens lightbox
  - [x] Test: "← Назад към галериите" link present

## Dev Notes

### Architecture: What This Story Does

Story 7.5 is a **full-stack story** requiring:

1. **New backend public API** (2 endpoints, no authentication)
2. **New frontend public pages** (GalleriesPage + GalleryDetailPage + GalleryLightbox)

All admin gallery infrastructure (7.1–7.4) is already complete.

### Backend: Public Controller Pattern

Follow `backend/src/controllers/public/job_controller.ts` — **direct Prisma queries, no service layer** for public controllers:

```typescript
// backend/src/controllers/public/gallery_controller.ts
import { Request, Response } from 'express';
import prisma from '../../../prisma/prisma-client';

export const getPublicGalleries = async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();

    const galleriesRaw = await prisma.gallery.findMany({
      where: {
        status: 'PUBLISHED',
        images: { some: {} }, // only galleries with ≥1 image
      },
      orderBy: [{ publishedAt: 'desc' }],
      select: {
        id: true,
        title: true,
        description: true,
        coverImageUrl: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { images: true } },
      },
    });

    const duration = Date.now() - startTime;
    if (duration > 500) {
      console.warn(`⚠️ Public galleries list query took ${duration}ms (target: <500ms)`);
    }

    const galleries = galleriesRaw.map((g) => ({
      ...g,
      imageCount: g._count.images,
      _count: undefined, // omit internal Prisma field
    }));

    return res.status(200).json({
      status: 'success',
      data: { galleries },
    });
  } catch (error) {
    console.error('Error fetching public galleries:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const getPublicGallery = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(404).json({
        status: 'fail',
        data: { message: 'Галерията не е намерена' },
      });
    }

    const gallery = await prisma.gallery.findFirst({
      where: { id, status: 'PUBLISHED' },
      select: {
        id: true,
        title: true,
        description: true,
        coverImageUrl: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        images: {
          select: {
            id: true,
            imageUrl: true,
            thumbnailUrl: true,
            altText: true,
            displayOrder: true,
            createdAt: true,
          },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!gallery) {
      return res.status(404).json({
        status: 'fail',
        data: { message: 'Галерията не е намерена' },
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { gallery },
    });
  } catch (error) {
    console.error('Error fetching public gallery:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};
```

**Note:** Using `findFirst` with `status: 'PUBLISHED'` filter (not `findUnique`) ensures DRAFT galleries return null → 404.

### Backend: Route File Pattern

Follow `backend/src/routes/public/job_route.ts`:

```typescript
// backend/src/routes/public/gallery_route.ts
import { Router } from 'express';
import { getPublicGalleries, getPublicGallery } from '../../controllers/public/gallery_controller';

const router = Router();

// GET /api/v1/public/galleries - List published galleries with ≥1 image (no auth)
router.get('/', getPublicGalleries);

// GET /api/v1/public/galleries/:id - Get single published gallery (no auth)
router.get('/:id', getPublicGallery);

export default router;
```

### Backend: app.ts Registration

In `backend/src/server/app.ts`, add after the `publicApplicationRoutes` line:

```typescript
import publicGalleryRoutes from '@routes/public/gallery_route';
// ...
app.use(baseApiUrl + '/v1/public/galleries', publicGalleryRoutes); // Public galleries - NO authentication
```

### Frontend: Existing Type Extensions in `gallery.ts`

The file `frontend/src/types/gallery.ts` already has `Gallery`, `GalleryDetail`, and `GalleryImage` interfaces. Add `PublicGallery` and `PublicGalleryDetail` at the bottom.

`GalleryImage` is already defined as:
```typescript
export interface GalleryImage {
  id: number;
  imageUrl: string;
  thumbnailUrl: string | null;
  altText: string | null;
  displayOrder: number;
  createdAt: string;
}
```
`PublicGalleryDetail.images` should use this existing type.

### Frontend: GalleriesPage Pattern (exact EventsPage mirror)

```typescript
// frontend/src/pages/public/GalleriesPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { useTranslation } from '@/lib/i18n';
import { GalleryCard } from '@/components/public/GalleryCard';
import type { PublicGallery } from '@/types/gallery';

export function GalleriesPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const [galleries, setGalleries] = useState<PublicGallery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();
    const fetchGalleries = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const response = await api.get('/api/v1/public/galleries', {
          signal: abortController.signal,
        });
        if (response.data.status === 'success') {
          setGalleries(response.data.data.galleries);
        } else {
          setIsError(true);
        }
      } catch (error: unknown) {
        const err = error as { name?: string; code?: string };
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGalleries();
    return () => abortController.abort();
  }, []);

  if (isLoading) { /* ... loading state */ }
  if (isError)   { /* ... error state */ }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.publicGallery.sectionTitle}</h1>
        {galleries.length === 0 ? (
          <p className="text-gray-600">{t.publicGallery.emptyState}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleries.map((gallery) => (
              <GalleryCard
                key={gallery.id}
                gallery={gallery}
                onClick={() => navigate(`/galleries/${gallery.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
```

### Frontend: GalleryLightbox — Using Radix Dialog

`@radix-ui/react-dialog` (already installed) provides accessible modal with focus trapping built-in. Use it for the lightbox:

```typescript
// frontend/src/components/public/GalleryLightbox.tsx
import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { GalleryImage } from '@/types/gallery';
import { useTranslation } from '@/lib/i18n';

interface Props {
  images: GalleryImage[];
  initialIndex: number;
  onClose: () => void;
}

export function GalleryLightbox({ images, initialIndex, onClose }: Props) {
  const t = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const next = () => setCurrentIndex((i) => Math.min(images.length - 1, i + 1));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentIndex, onClose]);

  const image = images[currentIndex];

  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/90 z-50" />
        <Dialog.Content
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          aria-label={image.altText || 'Gallery image'}
        >
          {/* Close button */}
          <Dialog.Close
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            aria-label={t.publicGallery.lightboxClose}
          >
            <X className="h-8 w-8" />
          </Dialog.Close>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Prev */}
          <button
            onClick={prev}
            disabled={currentIndex === 0}
            className="absolute left-4 text-white hover:text-gray-300 disabled:opacity-30"
            aria-label={t.publicGallery.lightboxPrev}
          >
            <ChevronLeft className="h-10 w-10" />
          </button>

          {/* Image */}
          <img
            src={image.imageUrl}
            alt={image.altText || ''}
            className="max-h-[85vh] max-w-[90vw] object-contain"
          />

          {/* Next */}
          <button
            onClick={next}
            disabled={currentIndex === images.length - 1}
            className="absolute right-4 text-white hover:text-gray-300 disabled:opacity-30"
            aria-label={t.publicGallery.lightboxNext}
          >
            <ChevronRight className="h-10 w-10" />
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

**Note**: `Dialog.Root open` + `onOpenChange` handles Escape key natively (Radix default) — however we also add our own keydown handler for ArrowLeft/ArrowRight. The `onClose` from `onOpenChange` will fire on Escape (Radix default). **Remove Escape from custom handler** to avoid double-firing — let Radix handle it:
```typescript
// Only handle arrow keys in custom handler:
if (e.key === 'ArrowLeft') prev();
else if (e.key === 'ArrowRight') next();
// Do NOT handle Escape — Radix Dialog handles it via onOpenChange
```

### Frontend: App.tsx Route Pattern

Public routes use `<ErrorBoundary><PublicLayout><Page /></PublicLayout></ErrorBoundary>` wrapping. Follow the `/jobs` and `/jobs/:id` routes exactly:

```tsx
<Route path="/galleries" element={<ErrorBoundary><PublicLayout><GalleriesPage /></PublicLayout></ErrorBoundary>} />
<Route path="/galleries/:id" element={<ErrorBoundary><PublicLayout><GalleryDetailPage /></PublicLayout></ErrorBoundary>} />
```

Place after the `/jobs/:id` route (line 69 in current App.tsx), before the `/menu` route.

### Frontend: i18n Complete Values

**types.ts addition** — add after `publicJobs` section:
```typescript
publicGallery: {
  sectionTitle: string;
  emptyState: string;
  loading: string;
  error: string;
  imageCount: string;
  notFound: string;
  backToList: string;
  lightboxClose: string;
  lightboxPrev: string;
  lightboxNext: string;
  detailLoading: string;
  detailError: string;
};
```

**bg.ts addition** — add after `publicJobs` section:
```typescript
publicGallery: {
  sectionTitle: 'Фотогалерии',
  emptyState: 'Галерията скоро ще бъде обновена.',
  loading: 'Зареждане...',
  error: 'Грешка при зареждане на галериите',
  imageCount: ' снимки',
  notFound: 'Галерията не е намерена',
  backToList: '← Назад към галериите',
  lightboxClose: 'Затвори',
  lightboxPrev: 'Предишна снимка',
  lightboxNext: 'Следваща снимка',
  detailLoading: 'Зареждане на галерията...',
  detailError: 'Грешка при зареждане на галерията',
},
```

### Key File Paths

| File | Action | Notes |
|------|--------|-------|
| `backend/src/controllers/public/gallery_controller.ts` | **NEW** | Public gallery controller (2 handlers) |
| `backend/src/routes/public/gallery_route.ts` | **NEW** | Public gallery route (2 endpoints) |
| [backend/src/server/app.ts](backend/src/server/app.ts) | Extend | Register `/v1/public/galleries` route |
| [frontend/src/lib/i18n/types.ts](frontend/src/lib/i18n/types.ts) | Extend | Add `publicGallery` type |
| [frontend/src/lib/i18n/bg.ts](frontend/src/lib/i18n/bg.ts) | Extend | Add Bulgarian translations |
| [frontend/src/types/gallery.ts](frontend/src/types/gallery.ts) | Extend | Add `PublicGallery` + `PublicGalleryDetail` interfaces |
| `frontend/src/components/public/GalleryCard.tsx` | **NEW** | Public gallery card component |
| `frontend/src/components/public/GalleryLightbox.tsx` | **NEW** | Lightbox modal with keyboard nav |
| `frontend/src/pages/public/GalleriesPage.tsx` | **NEW** | Public gallery list page |
| `frontend/src/pages/public/GalleryDetailPage.tsx` | **NEW** | Public gallery detail page |
| [frontend/src/App.tsx](frontend/src/App.tsx) | Extend | Add `/galleries` and `/galleries/:id` routes |
| `backend/__test__/galleries-public.routes.test.ts` | **NEW** | Backend API tests |
| `frontend/src/__tests__/GalleriesPage.test.tsx` | **NEW** | Frontend page tests |
| `frontend/src/__tests__/GalleryCard.test.tsx` | **NEW** | Component tests |
| `frontend/src/__tests__/GalleryDetailPage.test.tsx` | **NEW** | Detail page + lightbox tests |
| **REFERENCE** [backend/src/controllers/public/job_controller.ts](backend/src/controllers/public/job_controller.ts) | Read only | Public controller pattern |
| **REFERENCE** [backend/src/routes/public/job_route.ts](backend/src/routes/public/job_route.ts) | Read only | Public route pattern |
| **REFERENCE** [frontend/src/pages/public/EventsPage.tsx](frontend/src/pages/public/EventsPage.tsx) | Read only | Public page pattern |
| **REFERENCE** [frontend/src/__tests__/EventsPage.test.tsx](frontend/src/__tests__/EventsPage.test.tsx) | Read only | Public page test pattern |
| **REFERENCE** [frontend/src/components/public/EventCard.tsx](frontend/src/components/public/EventCard.tsx) | Read only | Public card component pattern |
| **REFERENCE** [backend/src/constants/gallery_constants.ts](backend/src/constants/gallery_constants.ts) | Read only | GALLERY_DETAIL_SELECT shape |
| **REFERENCE** [frontend/src/types/gallery.ts](frontend/src/types/gallery.ts) | Read only | Existing Gallery types |

### Previous Story Learnings (7.4)

- **XSS skipFields**: `altText` and `images` already added in 7.3 — no XSS changes needed for 7.5
- **Test file location**: Use `frontend/src/__tests__/` (NOT co-located), despite architecture doc saying co-located
- **Vitest mock pattern**: `vi.hoisted(() => ({ mockGet: vi.fn() }))` + `vi.mock('@/lib/api', () => ({ default: { get: mockGet } }))` — this is the established pattern for API mocking in frontend tests
- **StatusBadge import**: Located at `@/components/ui/StatusBadge` (not `@/components/admin/StatusBadge`)
- **`httpMsg` response format** (admin): `{ success: true, message: '...', content: data }` — but **public routes** use JSend: `{ status: 'success', data: { ... } }` (see job_controller.ts)
- **Gallery imageCount**: transformed from `_count.images` in the controller — NOT stored in DB
- **GalleryImage type** is already exported from `frontend/src/types/gallery.ts` — reuse it in `PublicGalleryDetail`
- **No `galleryId` prop in GalleryImageGrid** — removed in 7.3 code review. Public `GalleryLightbox` is a new component with different props; no confusion with admin component.

### Git Intelligence (Recent Patterns)

Last 5 commits focus on admin UI and stories through Epic 7. No public gallery commits yet — this is the first public-facing gallery feature.

**Established patterns in public pages**:
- `EventsPage.tsx` / `JobsPage.tsx` — self-contained `useEffect` with AbortController, no custom hook
- Public components (`EventCard.tsx`, `JobCard.tsx`) — export their types inline (e.g., `export interface PublicEvent`)
- Public tests (`EventsPage.test.tsx`) — `vi.hoisted` pattern, minimal mock setup

### Project Structure Notes

- **Public pages**: `frontend/src/pages/public/` with `PascalCase` naming
- **Public components**: `frontend/src/components/public/` with `PascalCase` naming
- **No custom hook required** for public gallery pages — follow EventsPage/JobsPage pattern of inline useEffect
- **No backend service layer** for public controller — follow job_controller.ts (direct Prisma)
- **Test files**: `frontend/src/__tests__/` directory (not co-located)
- **Backend tests**: `backend/__test__/` directory (note: double underscore in folder name, not `__tests__`)

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 7, Story 7.5] — Full acceptance criteria
- [Source: _bmad-output/implementation-artifacts/7-4-gallery-list-and-form.md#Dev Notes] — All gallery patterns, API shapes, component props
- [Source: backend/src/controllers/public/job_controller.ts] — Public controller pattern to follow exactly
- [Source: backend/src/routes/public/job_route.ts] — Public route pattern
- [Source: frontend/src/pages/public/EventsPage.tsx] — Public page pattern to follow exactly
- [Source: frontend/src/__tests__/EventsPage.test.tsx] — Frontend test pattern
- [Source: frontend/src/components/public/EventCard.tsx] — Public card component pattern
- [Source: backend/src/server/app.ts] — Where to register public gallery route
- [Source: backend/src/constants/gallery_constants.ts] — GALLERY_IMAGE_SELECT, GALLERY_LIST_SELECT, GALLERY_DETAIL_SELECT shapes
- [Source: frontend/src/types/gallery.ts] — Existing Gallery, GalleryDetail, GalleryImage types to extend
- [Source: frontend/src/lib/i18n/types.ts] — Translation type definitions to extend (add after publicJobs)
- [Source: frontend/src/lib/i18n/bg.ts] — Translation values to extend (add after publicJobs)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None — implementation was clean with no unexpected issues.

### Completion Notes List

- Implemented full-stack Story 7.5: 2 backend public API endpoints + 4 new frontend components/pages + route registration
- Backend: `getPublicGalleries` uses `_count.images` with `images: { some: {} }` filter and transforms to `imageCount`; `getPublicGallery` uses `findFirst` with `status: 'PUBLISHED'` to auto-return null for DRAFT galleries
- Frontend: GalleryLightbox uses Radix Dialog for accessible focus trapping; keyboard handler only handles ArrowLeft/ArrowRight (Radix handles Escape via `onOpenChange`)
- Added `Dialog.Title` with `sr-only` class to fix Radix accessibility warning about missing title
- All 14 new frontend tests pass; TypeScript compiles clean for both frontend and backend
- Pre-existing test failures (NewsDetailPage, TeachersPage, AutoSaveIndicator, etc.) confirmed as not introduced by this story

### File List

backend/src/controllers/public/gallery_controller.ts
backend/src/routes/public/gallery_route.ts
backend/src/server/app.ts
backend/__test__/galleries-public.routes.test.ts
frontend/src/lib/i18n/types.ts
frontend/src/lib/i18n/bg.ts
frontend/src/types/gallery.ts
frontend/src/components/public/GalleryCard.tsx
frontend/src/components/public/GalleryLightbox.tsx
frontend/src/pages/public/GalleriesPage.tsx
frontend/src/pages/public/GalleryDetailPage.tsx
frontend/src/App.tsx
frontend/src/__tests__/GalleriesPage.test.tsx
frontend/src/__tests__/GalleryCard.test.tsx
frontend/src/__tests__/GalleryDetailPage.test.tsx

## Senior Developer Review (AI)

**Reviewer:** claude-opus-4-6 on 2026-03-17
**Result:** APPROVED with fixes applied

### Issues Fixed (5)

- **[HIGH] `isLoading` initialized to `false`** in GalleriesPage and GalleryDetailPage — caused flash of empty state / "not found" before loading kicks in. Fixed both to `useState(true)`. [GalleriesPage.tsx:12, GalleryDetailPage.tsx:13]
- **[MEDIUM] `catch (error: any)` type bypass** in GalleriesPage and GalleryDetailPage. Changed to `error: unknown` with explicit cast. [GalleriesPage.tsx:30, GalleryDetailPage.tsx:32]
- **[MEDIUM] NaN guard missing in GalleryDetailPage** — sent HTTP request to `/api/v1/public/galleries/NaN` when id is non-numeric. Added early return. [GalleryDetailPage.tsx:23]
- **[MEDIUM] `_count: undefined` code smell** in gallery_controller. Changed to destructuring pattern `({ _count, ...rest })`. [gallery_controller.ts:31]
- **[MEDIUM] Missing lightbox keyboard nav tests** — AC6 keyboard navigation (ArrowLeft/ArrowRight) and button disabled states had zero test coverage. Added 4 tests. [GalleryDetailPage.test.tsx]

### Remaining (LOW — no action needed)

- **[LOW] Missing `useEffect` deps** in GalleryLightbox (`prev`, `next` not in dep array) — functionally safe due to functional state updates; lint warning only.

## Change Log

- 2026-03-16: Story 7.5 implemented — public gallery list + detail API, GalleriesPage, GalleryDetailPage, GalleryCard, GalleryLightbox with keyboard nav and accessible Radix Dialog, all i18n keys, routes, and 14 frontend tests. Backend integration test created. (claude-sonnet-4-6)
- 2026-03-17: Code review — fixed isLoading initialization (flash bug), error: any→unknown, NaN guard, _count destructuring, added 4 lightbox keyboard nav tests. Status → done. (claude-opus-4-6)
