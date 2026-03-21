# Story 7.3: Multi-Image Upload for Gallery

Status: done

## Story

As an **administrator**,
I want **to upload multiple images at once to a gallery**,
so that **I can quickly add photos from kindergarten events**.

## Acceptance Criteria

### AC1: Multi-Image Upload Zone UI

```gherkin
Given I am editing a gallery
When the GalleryImageUploadZone is rendered
Then it supports multiple file selection (multiple=true on the file input)
And the drop zone text says: "Плъзнете снимки тук или кликнете за избор"
And accepted formats are: JPEG, PNG, GIF, WebP (each ≤10MB)
And drag-and-drop is supported (dropping multiple files triggers validation + upload)
```

### AC2: Parallel Upload with Per-Image Progress

```gherkin
Given I select multiple valid images (JPEG, PNG, GIF, WebP, each ≤10MB)
When the upload begins
Then all images upload concurrently with a max of 3 simultaneous uploads
And each image shows individual upload progress (0-100%) via Axios onUploadProgress
And after upload completes, each image appears as a thumbnail in a responsive grid below the drop zone
```

### AC3: POST /api/admin/v1/galleries/:id/images Endpoint

```gherkin
Given the admin is authenticated with a valid JWT
When POST /api/admin/v1/galleries/:id/images is called with a single image file field 'image'
Then the image is uploaded to Cloudinary folder 'kindergarten-canvas/galleries'
And a thumbnailUrl is derived by inserting 'w_150,h_150,c_fill/' into the Cloudinary URL after '/upload/'
And a GalleryImage record is created with: imageUrl, thumbnailUrl, altText (null), displayOrder (= current image count)
And the response is 201:
  { success: true, message: 'Successfully create', content: { id, imageUrl, thumbnailUrl, altText, displayOrder, createdAt } }
When the gallery has no coverImageUrl yet
Then the gallery's coverImageUrl is set to the newly uploaded image's URL
When the gallery already has a coverImageUrl
Then coverImageUrl is not changed
When the gallery id does not exist
Then the response is 404: { success: false, message: 'Галерията не е намерена' }
When the file is missing from the request
Then the response is 400: { success: false, message: 'Файлът е задължителен' }
```

### AC4: Partial Failure Handling

```gherkin
Given I select a batch of files containing some invalid files (wrong type or >10MB)
When the file list is processed
Then invalid files are rejected client-side before upload with Bulgarian error messages:
  - Wrong type: "Невалиден тип файл. Позволени са: JPEG, PNG, GIF, WebP"
  - Too large: "Файлът е твърде голям. Максимален размер: 10MB"
And valid files proceed to upload normally
And each invalid file shows its error inline next to its entry in the upload list
And the user can remove failed entries from the list
```

### AC5: DELETE /api/admin/v1/galleries/:id/images/:imageId Endpoint

```gherkin
Given the admin is authenticated
When DELETE /api/admin/v1/galleries/:id/images/:imageId is called with valid IDs
Then the GalleryImage record is removed from the database
And the response is 200:
  { success: true, message: 'Снимката е изтрита успешно', content: null }
When the deleted image was the gallery's coverImageUrl
Then gallery.coverImageUrl is updated to the imageUrl of the next image (lowest displayOrder among remaining) or null if no images remain
When the image does not exist or does not belong to the gallery
Then the response is 404: { success: false, message: 'Снимката не е намерена' }
```

### AC6: Hover Delete Button on Thumbnail Grid

```gherkin
Given I view the uploaded images thumbnail grid
When I hover over any image thumbnail
Then a delete button (×) appears overlaid on the thumbnail
And clicking it calls DELETE /api/admin/v1/galleries/:id/images/:imageId
And on success the thumbnail is removed from the grid
And a toast shows: "Снимката е изтрита успешно"
```

### AC7: PUT /api/admin/v1/galleries/:id/images/reorder Endpoint

```gherkin
Given the admin is authenticated
When PUT /api/admin/v1/galleries/:id/images/reorder is called with body:
  { images: [{ id: 3, displayOrder: 0 }, { id: 1, displayOrder: 1 }, { id: 7, displayOrder: 2 }] }
Then all GalleryImage displayOrder values are updated atomically in a single Prisma transaction
And the gallery's coverImageUrl is updated to the imageUrl of the image with displayOrder: 0
And the response is 200:
  { success: true, message: 'Success', content: [updated images array sorted by displayOrder ASC] }
When the gallery id does not exist
Then the response is 404
```

### AC8: Drag-and-Drop Reorder in UI

```gherkin
Given I view the image thumbnail grid with multiple images
When I drag an image thumbnail to a new position
Then the grid reorders visually in real-time
And after dropping, PUT /api/admin/v1/galleries/:id/images/reorder is called with the new order (debounced 500ms)
And a success toast shows: "Редът на снимките е запазен"
```

## Tasks / Subtasks

### Backend

- [x] Task 1: Update gallery_constants.ts — add GALLERY_IMAGE_SELECT (AC: 3, 5, 7)
  - [x] Add `GALLERY_IMAGE_SELECT = { id: true, imageUrl: true, thumbnailUrl: true, altText: true, displayOrder: true, createdAt: true }` to existing file

- [x] Task 2: Update gallery_schema.ts — add three new Zod schemas (AC: 3, 5, 7)
  - [x] `addGalleryImage`: validates `params.id` only (file validated by multer + controller)
  - [x] `deleteGalleryImage`: validates `params.id` + `params.imageId` both as `.transform(Number).pipe(z.number().int().positive())`
  - [x] `reorderGalleryImages`: validates `params.id` + `body.images` array of `{ id: number, displayOrder: number }`

- [x] Task 3: Create new DAO files for GalleryImage operations (AC: 3, 5, 7)
  - [x] `backend/src/dao/gallery/gallery_image_create_dao.ts` — `prisma.galleryImage.create()`
  - [x] `backend/src/dao/gallery/gallery_image_delete_dao.ts` — `prisma.galleryImage.delete()`
  - [x] `backend/src/dao/gallery/gallery_image_reorder_dao.ts` — `prisma.$transaction([...updates])`

- [x] Task 4: Create Cloudinary gallery upload service (AC: 3)
  - [x] `backend/src/services/cloudinary/cloudinary_gallery_upload_service.ts`
  - [x] Same pattern as `cloudinary_upload_service.ts` but with `folder: 'kindergarten-canvas/galleries'`

- [x] Task 5: Create new gallery image services (AC: 3, 5, 7, 8)
  - [x] `backend/src/services/admin/gallery/gallery_image_upload_service.ts`
    - Validates gallery exists (404 if not)
    - Validates `req.file` present (400 if missing)
    - Calls `cloudinaryGalleryUploadService(req.file.buffer, req.file.originalname, req.file.mimetype)`
    - Derives `thumbnailUrl = imageUrl.replace('/upload/', '/upload/w_150,h_150,c_fill/')`
    - Counts existing images to set `displayOrder = count`
    - Creates GalleryImage via `gallery_image_create_dao`
    - If `gallery.coverImageUrl` is null → updates gallery via `gallery_update_dao`
    - Returns 201
  - [x] `backend/src/services/admin/gallery/gallery_image_delete_service.ts`
    - Validates gallery exists (404 if not)
    - Validates image exists AND `imageId.galleryId === galleryId` (404 if not)
    - Deletes via `gallery_image_delete_dao`
    - If deleted image was coverImageUrl → fetch next image by displayOrder ASC → update gallery.coverImageUrl
    - Returns 200 with `message: 'Снимката е изтрита успешно'`
  - [x] `backend/src/services/admin/gallery/gallery_image_reorder_service.ts`
    - Validates gallery exists (404 if not)
    - Calls `gallery_image_reorder_dao` with images array
    - Finds the image with `displayOrder: 0` in the request → fetches its imageUrl → updates `gallery.coverImageUrl`
    - Returns 200 with reordered images

- [x] Task 6: Update gallery_controller.ts — add three new controller methods (AC: 3, 5, 7)
  - [x] `addImage(req, res, next)` — calls `galleryImageUploadService(req.params.id, req.file)`
  - [x] `removeImage(req, res, next)` — calls `galleryImageDeleteService(req.params.id, req.params.imageId)`
  - [x] `reorderImages(req, res, next)` — calls `galleryImageReorderService(req.params.id, req.body.images)`
  - [x] Controller pattern: `const result = await service(...); res.status(result.httpStatusCode).json(result.data);`

- [x] Task 7: Update gallery_route.ts — add three new routes (AC: 3, 5, 7)
  - [x] `POST /:id/images` — `auth('jwt-user'), validate(schemas.addGalleryImage), upload.single('image'), ctrl.addImage`
  - [x] `DELETE /:id/images/:imageId` — `auth('jwt-user'), validate(schemas.deleteGalleryImage), ctrl.removeImage`
  - [x] `PUT /:id/images/reorder` — `auth('jwt-user'), validate(schemas.reorderGalleryImages), ctrl.reorderImages`
  - [x] **IMPORTANT**: Register PUT `/reorder` BEFORE DELETE `/:imageId` to avoid Express routing ambiguity

- [x] Task 8: Update XSS middleware skipFields (AC: 3)
  - [x] Add `'altText'` and `'images'` to `skipFields` array in `backend/src/middlewares/xss/xss.ts` (altText noted in Story 7.2; images needed to preserve numeric id/displayOrder in nested array items)

- [x] Task 9: Backend tests (AC: 3, 5, 7)
  - [x] Create `backend/__test__/gallery-images.routes.test.ts`
  - [x] Mock `cloudinary_gallery_upload_service` with Jest
  - [x] Test POST /:id/images: valid image → 201, gallery not found → 404, no file → 400
  - [x] Test POST /:id/images: coverImageUrl auto-set on first image upload
  - [x] Test DELETE /:id/images/:imageId: valid → 200, not found → 404, coverImageUrl cascade update
  - [x] Test PUT /:id/images/reorder: valid → 200 + displayOrder updated, gallery not found → 404

### Review Follow-ups (AI)

- [ ] [AI-Review][MEDIUM] No Cloudinary resource cleanup on image delete — orphaned files accumulate in Cloudinary. Requires adding `publicId` column to `GalleryImage` Prisma model and calling `cloudinary.uploader.destroy(publicId)` in `gallery_image_delete_service.ts`. [backend/src/services/admin/gallery/gallery_image_delete_service.ts:31]

### Frontend

- [x] Task 10: Create GalleryImageUploadZone component (AC: 1, 2, 4)
  - [x] `frontend/src/components/admin/GalleryImageUploadZone.tsx`
  - [x] Props: `{ galleryId: number; onImagesUploaded: (images: GalleryImage[]) => void }`
  - [x] Internal state: `items: UploadItem[]` — track per-file: `{ id, file, progress, status, error, result }`
  - [x] File input with `multiple` attribute + drag-and-drop handlers
  - [x] Client-side validation per file before queuing (type + size, Bulgarian error messages)
  - [x] Concurrency limiter: max 3 simultaneous Axios POST calls
  - [x] Axios `onUploadProgress` callback → updates individual item progress
  - [x] Render items as thumbnail cards with progress bar (uploading) or error message (failed)

- [x] Task 11: Create GalleryImageGrid component (AC: 6, 8)
  - [x] `frontend/src/components/admin/GalleryImageGrid.tsx`
  - [x] Props: `{ galleryId: number; images: GalleryImage[]; onDelete: (imageId: number) => void; onReorder: (images: GalleryImage[]) => void }`
  - [x] Renders existing images in a responsive grid (3-4 columns)
  - [x] Hover overlay with × delete button per thumbnail
  - [x] Drag-and-drop reorder using `@dnd-kit/sortable` with `rectSortingStrategy`
  - [x] On reorder: update local state immediately + call `onReorder` (debounced 500ms)

- [x] Task 12: Check/install @dnd-kit packages (AC: 8)
  - [x] Check `frontend/package.json` for `@dnd-kit/core` and `@dnd-kit/sortable`
  - [x] Installed: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`

- [x] Task 13: Create useGalleryImages hook (AC: 3, 5, 7)
  - [x] `frontend/src/hooks/useGalleryImages.ts`
  - [x] `uploadImage(galleryId, file, onProgress): Promise<GalleryImage>` — POST with FormData
  - [x] `deleteImage(galleryId, imageId): Promise<void>` — DELETE
  - [x] `reorderImages(galleryId, images): Promise<void>` — PUT with images array

- [x] Task 14: Frontend tests (AC: 1, 2, 4, 6)
  - [x] `frontend/src/__tests__/GalleryImageUploadZone.test.tsx`
  - [x] `frontend/src/__tests__/GalleryImageGrid.test.tsx`

## Dev Notes

### Architecture Overview: Story in Context

Story 7.3 extends the gallery infrastructure established in Story 7.2. The `Gallery` and `GalleryImage` Prisma models are fully set up. The existing `gallery_route.ts`, `gallery_controller.ts`, `gallery_schema.ts`, and `gallery_constants.ts` only cover Gallery CRUD — this story adds image sub-resource management.

The `ImageUploadZone` in `frontend/src/components/admin/ImageUploadZone.tsx` handles **single-file** uploads for news/teacher cover images. Do **NOT** modify it — create a separate `GalleryImageUploadZone` component for multi-image behavior.

### Backend: Middleware Ordering on Upload Route

When combining multer with the `validate()` Zod middleware, order matters:

```typescript
// CORRECT ORDER for image upload route:
router.post(
  '/:id/images',
  auth('jwt-user'),
  validate(schemas.addGalleryImage),  // validates params.id (query params available before body parsing)
  upload.single('image'),              // multer parses multipart body → populates req.file
  ctrl.addImage                        // controller accesses req.file + req.params
);
```

`validate()` runs before multer because it only needs `req.params` (which Express provides from routing, not body parsing). Multer runs after and populates `req.file`.

### Backend: Route Order — Critical!

Register routes in this order in `gallery_route.ts` to prevent Express routing conflicts:

```typescript
router.post('/:id/images', ...);
router.put('/:id/images/reorder', ...);   // BEFORE delete — "reorder" won't be confused with :imageId
router.delete('/:id/images/:imageId', ...);
```

Since `validate()` uses `.pipe(z.number().int().positive())` on `:imageId`, a request to `DELETE /:id/images/reorder` would fail Zod validation (good safety net), but correct route order prevents this edge case entirely.

### Backend: Cloudinary Gallery Upload Service

Create a separate service file for gallery uploads (folder differs from news):

```typescript
// backend/src/services/cloudinary/cloudinary_gallery_upload_service.ts
// Copy structure from cloudinary_upload_service.ts, change:
folder: 'kindergarten-canvas/galleries'
```

**Thumbnail URL derivation** (no extra Cloudinary API call needed):
```typescript
const thumbnailUrl = uploadResult.data.url.replace('/upload/', '/upload/w_150,h_150,c_fill/');
```

This leverages Cloudinary's on-the-fly URL transformations — the thumbnail is generated on first access and cached at CDN edge. Costs no extra Cloudinary credits.

### Backend: displayOrder Assignment Logic

```typescript
// In gallery_image_upload_service.ts — determine displayOrder for new image:
const existingCount = await prisma.galleryImage.count({ where: { galleryId } });
const displayOrder = existingCount; // 0-based: first image = 0, second = 1, etc.
```

Call `prisma.galleryImage.count()` directly in the service (not via a DAO) since it's a simple aggregation. Import `prisma` from `'@prisma/prisma-client'` or the established path `'../../../prisma/prisma-client'` (check actual alias in tsconfig.json).

### Backend: coverImageUrl Update Logic

`Gallery.coverImageUrl` is a denormalized field managed by the application (not a DB trigger):

**On upload (AC3/AC8):**
```typescript
// After creating GalleryImage, check if gallery needs coverImageUrl set:
const gallery = await galleryGetOneDAO(galleryId, { id: true, coverImageUrl: true });
if (!gallery.data?.coverImageUrl) {
  await galleryUpdateDAO(galleryId, { coverImageUrl: newImage.imageUrl }, { id: true });
}
```

**On delete (AC5):**
```typescript
// After deleting image, check if it was the cover:
if (gallery.data?.coverImageUrl === deletedImage.imageUrl) {
  const nextImage = await prisma.galleryImage.findFirst({
    where: { galleryId, id: { not: imageId } },
    orderBy: { displayOrder: 'asc' },
    select: { imageUrl: true },
  });
  await galleryUpdateDAO(galleryId, { coverImageUrl: nextImage?.imageUrl ?? null }, { id: true });
}
```

**On reorder (AC7):**
```typescript
// After transaction, update cover to the image that now has displayOrder=0:
const imageWithOrder0 = requestBody.images.find(i => i.displayOrder === 0);
if (imageWithOrder0) {
  const image = await prisma.galleryImage.findUnique({
    where: { id: imageWithOrder0.id },
    select: { imageUrl: true },
  });
  await galleryUpdateDAO(galleryId, { coverImageUrl: image?.imageUrl ?? null }, { id: true });
}
```

### Backend: Prisma Transaction for Reorder DAO

```typescript
// backend/src/dao/gallery/gallery_image_reorder_dao.ts
import prisma from '../../../prisma/prisma-client';
import logger from '@utils/logger/winston/logger';

const msgError = 'Failed to reorder gallery images.';

export default async (images: { id: number; displayOrder: number }[], select: object) => {
  return prisma
    .$transaction(
      images.map(({ id, displayOrder }) =>
        prisma.galleryImage.update({
          where: { id },
          data: { displayOrder },
          select: select as any,
        })
      )
    )
    .then((res: any) => ({ success: true, data: res, error: null }))
    .catch((error: any) => {
      logger.error(`${msgError} ${error}`);
      return { success: false, data: null, error: msgError };
    });
};
```

### Backend: Full Zod Schema Additions

```typescript
// Add to backend/src/schemas/gallery_schema.ts:

export const addGalleryImage = z.object({
  params: z.object({
    id: z.string().transform(Number).pipe(z.number().int().positive()),
  }),
  // No body schema — file is handled by multer, controller validates req.file
});

export const deleteGalleryImage = z.object({
  params: z.object({
    id: z.string().transform(Number).pipe(z.number().int().positive()),
    imageId: z.string().transform(Number).pipe(z.number().int().positive()),
  }),
});

export const reorderGalleryImages = z.object({
  params: z.object({
    id: z.string().transform(Number).pipe(z.number().int().positive()),
  }),
  body: z.object({
    images: z
      .array(
        z.object({
          id: z.number().int().positive(),
          displayOrder: z.number().int().min(0),
        })
      )
      .min(1, 'Необходимо е поне едно изображение'),
  }),
});

export type AddGalleryImageType = z.infer<typeof addGalleryImage>;
export type DeleteGalleryImageType = z.infer<typeof deleteGalleryImage>;
export type ReorderGalleryImagesType = z.infer<typeof reorderGalleryImages>;
```

### Backend: XSS Middleware Update

File: `backend/src/middlewares/xss/xss.ts` (line ~44)

```typescript
// Current:
const skipFields = ['content', 'bio', 'description', 'displayOrder', 'isImportant', 'isUrgent', 'requirements', 'isActive'];

// Add 'altText':
const skipFields = ['content', 'bio', 'description', 'displayOrder', 'isImportant', 'isUrgent', 'requirements', 'isActive', 'altText'];
```

This was explicitly noted as a TODO in Story 7.2 dev notes.

### Backend: Test Pattern for File Upload

Use supertest's `.attach()` method with a mocked Cloudinary service:

```typescript
// At top of test file:
jest.mock('../../src/services/cloudinary/cloudinary_gallery_upload_service', () =>
  jest.fn().mockResolvedValue({
    success: true,
    data: { url: 'https://res.cloudinary.com/test/image/upload/v1/kindergarten-canvas/galleries/test.jpg', publicId: 'test-id' },
    error: null,
  })
);

// In test:
const response = await request(app)
  .post(`/api/admin/v1/galleries/${galleryId}/images`)
  .set('Authorization', `Bearer ${authToken}`)
  .attach('image', Buffer.from('fake-image-data'), {
    filename: '[TEST]photo.jpg',
    contentType: 'image/jpeg',
  });

expect(response.status).toBe(201);
expect(response.body.content).toHaveProperty('imageUrl');
expect(response.body.content).toHaveProperty('thumbnailUrl');
expect(response.body.content.thumbnailUrl).toContain('w_150,h_150,c_fill');
```

Cleanup: `prisma.galleryImage.deleteMany({ where: { imageUrl: { contains: '[TEST]' } } })`

### Frontend: UploadItem State Structure

```typescript
interface UploadItem {
  id: string;              // crypto.randomUUID()
  file: File;
  progress: number;        // 0-100
  status: 'pending' | 'uploading' | 'done' | 'error';
  error: string | null;
  result: GalleryImage | null;
}
```

### Frontend: Concurrency Limiter

```typescript
// Max 3 concurrent uploads utility:
const uploadWithConcurrency = async (
  items: UploadItem[],
  uploadFn: (item: UploadItem) => Promise<void>,
  maxConcurrent = 3
) => {
  const queue = [...items];
  const workers = Array.from({ length: Math.min(maxConcurrent, items.length) }, async () => {
    while (queue.length > 0) {
      const item = queue.shift()!;
      await uploadFn(item);
    }
  });
  await Promise.all(workers);
};
```

### Frontend: Axios Upload with Progress

```typescript
// In useGalleryImages.ts:
const uploadImage = async (
  galleryId: number,
  file: File,
  onProgress: (pct: number) => void
): Promise<GalleryImage> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post(`/api/admin/v1/galleries/${galleryId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      const pct = Math.round((progressEvent.loaded * 100) / (progressEvent.total ?? 1));
      onProgress(pct);
    },
  });

  return response.data.content as GalleryImage;
};
```

### Frontend: @dnd-kit Sortable Grid

Check first: `cat frontend/package.json | grep dnd-kit`

If not installed: `cd frontend && npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`

Basic sortable grid structure:
```tsx
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Each item wraps with useSortable:
const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: image.id });
const style = { transform: CSS.Transform.toString(transform), transition };

// Wrap grid in:
<DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
  <SortableContext items={images.map(i => i.id)} strategy={rectSortingStrategy}>
    {/* thumbnails */}
  </SortableContext>
</DndContext>
```

On `handleDragEnd`, use `arrayMove` from `@dnd-kit/sortable` to reorder the local array, then call the debounced reorder API.

### Frontend: GalleryImage Type

Add to `frontend/src/types/` (check if `job.ts` pattern applies):

```typescript
// frontend/src/types/gallery.ts (create if not exists)
export interface GalleryImage {
  id: number;
  imageUrl: string;
  thumbnailUrl: string | null;
  altText: string | null;
  displayOrder: number;
  createdAt: string;
}
```

### Key File Paths

| File | Path |
|------|------|
| Gallery route (extend) | [backend/src/routes/admin/v1/gallery_route.ts](backend/src/routes/admin/v1/gallery_route.ts) |
| Gallery controller (extend) | [backend/src/controllers/admin/gallery_controller.ts](backend/src/controllers/admin/gallery_controller.ts) |
| Gallery schema (extend) | [backend/src/schemas/gallery_schema.ts](backend/src/schemas/gallery_schema.ts) |
| Gallery constants (extend) | [backend/src/constants/gallery_constants.ts](backend/src/constants/gallery_constants.ts) |
| XSS middleware (extend skipFields) | [backend/src/middlewares/xss/xss.ts](backend/src/middlewares/xss/xss.ts) |
| Multer config (reference) | [backend/src/config/multer.config.ts](backend/src/config/multer.config.ts) |
| Cloudinary news service (reference) | [backend/src/services/cloudinary/cloudinary_upload_service.ts](backend/src/services/cloudinary/cloudinary_upload_service.ts) |
| **NEW** Cloudinary gallery service | `backend/src/services/cloudinary/cloudinary_gallery_upload_service.ts` |
| **NEW** Image create DAO | `backend/src/dao/gallery/gallery_image_create_dao.ts` |
| **NEW** Image delete DAO | `backend/src/dao/gallery/gallery_image_delete_dao.ts` |
| **NEW** Image reorder DAO | `backend/src/dao/gallery/gallery_image_reorder_dao.ts` |
| **NEW** Image upload service | `backend/src/services/admin/gallery/gallery_image_upload_service.ts` |
| **NEW** Image delete service | `backend/src/services/admin/gallery/gallery_image_delete_service.ts` |
| **NEW** Image reorder service | `backend/src/services/admin/gallery/gallery_image_reorder_service.ts` |
| **NEW** Upload zone component | `frontend/src/components/admin/GalleryImageUploadZone.tsx` |
| **NEW** Image grid component | `frontend/src/components/admin/GalleryImageGrid.tsx` |
| **NEW** Gallery images hook | `frontend/src/hooks/useGalleryImages.ts` |
| **NEW** Gallery type | `frontend/src/types/gallery.ts` |
| Single-image upload (reference) | [frontend/src/components/admin/ImageUploadZone.tsx](frontend/src/components/admin/ImageUploadZone.tsx) |
| Story 7.2 dev notes (reference) | [_bmad-output/implementation-artifacts/7-2-gallery-crud-api-endpoints.md](_bmad-output/implementation-artifacts/7-2-gallery-crud-api-endpoints.md) |

### Previous Story Learnings (7.2)

- **Prisma model names**: `prisma.gallery` and `prisma.galleryImage` (camelCase model name, NOT table name)
- **Import path from dao/gallery/**: `'../../../prisma/prisma-client'` (3 levels up — verified in 7.2)
- **httpMsg response format**: `{ success: true, message: '...', content: data }` — NOT JSend. Controller does `res.status(result.httpStatusCode).json(result.data)`
- **Zod ID params**: Always use `.transform(Number).pipe(z.number().int().positive())` to prevent NaN on non-numeric IDs
- **XSS skipFields**: `altText` must be added — explicitly called out in 7.2 dev notes as pending for 7.3
- **Admin route prefix**: `/api/admin/v1/galleries/...` (NOT `/api/v1/galleries`)
- **`??` not `||`** for defaults: established pattern from 6.2 L1 fix
- **Separate existence check** before update/delete: distinguish 404 (not found) from 422 (DB error) — 6.2 M2 fix pattern, applied in gallery_update_service.ts and gallery_delete_service.ts
- **`upload.single('file')`** is the multer field name in the existing upload controller; this story uses `upload.single('image')` as the new field name (different endpoint, different field)
- **Gallery-specific**: `coverImageUrl` is denormalized and must be maintained by application code — Story 7.2 noted this for 7.3

### Project Structure Notes

- All new backend files follow established `{resource}_{action}_dao.ts` / `{resource}_{action}_service.ts` naming
- New DAOs go in `backend/src/dao/gallery/` alongside existing gallery DAOs
- New services go in `backend/src/services/admin/gallery/` alongside existing gallery services
- Update `backend/src/services/admin/gallery/index.ts` if it exists (re-export new services)
- Frontend components follow existing PascalCase naming in `frontend/src/components/admin/`
- Hook follows existing `useJobs.ts` / `useGalleryImages.ts` naming convention in `frontend/src/hooks/`

### References

- [Source: backend/prisma/schema.prisma lines 100-128] — Gallery and GalleryImage model definitions
- [Source: _bmad-output/implementation-artifacts/7-2-gallery-crud-api-endpoints.md#Dev Notes] — All 7.2 patterns and established code
- [Source: backend/src/services/cloudinary/cloudinary_upload_service.ts] — Cloudinary upload pattern
- [Source: backend/src/config/multer.config.ts] — Multer memory storage + file filter pattern
- [Source: frontend/src/components/admin/ImageUploadZone.tsx] — Single-file upload UX reference
- [Source: backend/src/middlewares/xss/xss.ts line ~44] — skipFields location for altText addition
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 7, Story 7.3] — Full acceptance criteria

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- Fixed prisma import path in services: services are at `src/services/admin/gallery/` requiring `../../../../prisma/prisma-client` (4 levels up), not 3
- XSS middleware converts numeric values in nested body arrays to strings; fixed by adding `'images'` to skipFields so the images array is passed through to Zod validation intact
- Jest mock for default-export Cloudinary service requires `{ __esModule: true, default: jest.fn()... }` pattern (not bare `jest.fn()`)

### Completion Notes List

- Implemented all 3 backend API endpoints: POST /:id/images (201), DELETE /:id/images/:imageId (200), PUT /:id/images/reorder (200)
- All endpoints enforce JWT auth, Zod validation, gallery-existence checks (404), and coverImageUrl cascade management
- Cloudinary gallery upload service created for `kindergarten-canvas/galleries` folder with thumbnail URL derivation via `/upload/w_150,h_150,c_fill/` transform
- GalleryImageUploadZone component: multi-file drag-and-drop, client-side validation (type + size), concurrency limiter (max 3), per-file progress via Axios onUploadProgress
- GalleryImageGrid component: responsive 3-4 column grid, hover delete overlay (AC6), drag-and-drop reorder with @dnd-kit/sortable + 500ms debounce (AC8)
- useGalleryImages hook: uploadImage, deleteImage, reorderImages API functions
- 18 backend integration tests pass (AC3, AC5, AC7); 11 frontend unit tests pass (AC1, AC2, AC4, AC6)
- Added `'altText'` and `'images'` to XSS skipFields; `'images'` required to prevent numeric ID values in nested array from being coerced to strings

### File List

backend/src/constants/gallery_constants.ts
backend/src/schemas/gallery_schema.ts
backend/src/dao/gallery/gallery_image_create_dao.ts
backend/src/dao/gallery/gallery_image_delete_dao.ts
backend/src/dao/gallery/gallery_image_reorder_dao.ts
backend/src/services/cloudinary/cloudinary_gallery_upload_service.ts
backend/src/services/admin/gallery/gallery_image_upload_service.ts
backend/src/services/admin/gallery/gallery_image_delete_service.ts
backend/src/services/admin/gallery/gallery_image_reorder_service.ts
backend/src/services/admin/gallery/index.ts
backend/src/controllers/admin/gallery_controller.ts
backend/src/routes/admin/v1/gallery_route.ts
backend/src/routes/admin/v1/index.ts
backend/src/middlewares/xss/xss.ts
backend/__test__/gallery-images.routes.test.ts
frontend/src/types/gallery.ts
frontend/src/components/admin/GalleryImageUploadZone.tsx
frontend/src/components/admin/GalleryImageGrid.tsx
frontend/src/hooks/useGalleryImages.ts
frontend/src/__tests__/GalleryImageUploadZone.test.tsx
frontend/src/__tests__/GalleryImageGrid.test.tsx
frontend/package.json
frontend/package-lock.json

## Change Log

| Date | Change |
|------|--------|
| 2026-03-15 | Story 7.3 implemented — 3 gallery image API endpoints (POST upload, DELETE remove, PUT reorder), GalleryImageUploadZone component with multi-file drag-and-drop + concurrency limiter, GalleryImageGrid component with hover-delete and @dnd-kit drag-and-drop reorder, useGalleryImages hook, 18 backend + 11 frontend tests all passing |
| 2026-03-15 | Code review (AI) — fixed H1: race condition in displayOrder (atomic Prisma transaction), H2: reorder ownership validation (cross-gallery IDs rejected with 400), M2: removed duplicate upload logic (GalleryImageUploadZone now uses useGalleryImages hook), M3: removed unused galleryId prop from GalleryImageGrid, M4: added index.ts to File List, L1: debounce cleanup on unmount. Added M1 action item: Cloudinary cleanup on image delete (requires schema change). |
