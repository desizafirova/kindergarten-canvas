# Story 6.6: CV Upload and Validation

Status: done

## Story

As a **job applicant**,
I want **to upload my CV using a drag-and-drop area with clear visual feedback**,
so that **I can confidently attach my qualifications to my job application**.

## Acceptance Criteria

1. **Click-to-upload** — Clicking anywhere in the CV upload area opens the file browser; the hidden `<input>` has `accept=".pdf"`.

2. **Valid PDF drag-drop accepted** — Dragging a PDF file ≤ 10MB onto the upload area accepts it; the filename displays alongside a checkmark icon; a "Премахни" button appears.

3. **Non-PDF rejected immediately** — Dropping or selecting a file that is not a PDF shows: `"Моля, качете PDF файл"` and the file is not added to the form.

4. **Oversized PDF rejected immediately** — Dropping or selecting a PDF > 10MB shows: `"Файлът е твърде голям. Максимален размер: 10MB"` and the file is not added.

5. **Remove file** — Clicking "Премахни" clears the selected file, hides the filename row, and restores the drop zone so a different file can be selected.

6. **Form submission** — On valid submit the single `File` object is appended to `FormData` and sent to `POST /api/v1/public/applications` as `multipart/form-data`.

7. **Disabled during submission** — The drop zone and Remove button are disabled (non-interactive) while the form is submitting.

8. **Drag visual feedback** — While a file is dragged over the drop zone, the border and background change to indicate it is a valid drop target.

## Tasks / Subtasks

### Frontend — i18n

- [x] Task 1: Add new i18n keys (AC: 2, 5)
  - [x] 1.1 Add `cvDropZoneText: string` and `cvRemoveButton: string` to the `applicationForm` block in `frontend/src/lib/i18n/types.ts`
  - [x] 1.2 Add Bulgarian values to `frontend/src/lib/i18n/bg.ts`:
    - `cvDropZoneText: 'Натиснете или плъзнете PDF файл тук'`
    - `cvRemoveButton: 'Премахни'`

### Frontend — Schema Update

- [x] Task 2: Change `cv` field in application schema from `FileList` to `File` (AC: 3, 4, 6)
  - [x] 2.1 Update `frontend/src/schemas/application-form.schema.ts`:
    - Replace `z.instanceof(FileList).refine(files => files.length > 0, ...)...refine(files => files[0]?.type...)...refine(files => files[0]?.size...)`
    - With: `z.instanceof(File, { message: 'CV файлът е задължителен' }).refine(file => file.type === 'application/pdf', 'Моля, качете PDF файл').refine(file => file.size <= 10 * 1024 * 1024, 'Файлът е твърде голям. Максимален размер: 10MB')`
    - `ApplicationFormData.cv` type changes from `FileList` to `File`

### Frontend — CvUploadField Component

- [x] Task 3: Create `CvUploadField` component (AC: 1–8)
  - [x] 3.1 Create `frontend/src/components/public/CvUploadField.tsx`
  - [x] 3.2 Props: `{ control: Control<ApplicationFormData>; isSubmitting: boolean }`
  - [x] 3.3 Internally use `useController({ name: 'cv', control })` for RHF integration
  - [x] 3.4 Hidden `<input type="file" id="app-cv" accept=".pdf" className="sr-only">` — preserves `getByLabelText(/CV/)` in tests
  - [x] 3.5 `handleInputChange`: reads `e.target.files?.[0]`, calls `validateAndSetFile`
  - [x] 3.6 `handleDrop`: reads `e.dataTransfer.files[0]`, calls `validateAndSetFile`
  - [x] 3.7 `validateAndSetFile(file)`: checks MIME + size immediately; on valid → `setSelectedFile(file)` + `field.onChange(file)` + clear error; on invalid → `setLocalError(message)` + `setSelectedFile(null)` + `field.onChange(null)`
  - [x] 3.8 `handleRemove`: clears `selectedFile`, calls `field.onChange(null)`, resets `inputRef.current.value = ''`, clears `localError`
  - [x] 3.9 Drop zone div: `onDragOver`, `onDragLeave` (set `isDragging` state), `onDrop`; `onClick` calls `inputRef.current?.click()`; `onKeyDown` handles Enter/Space for keyboard accessibility; `role="button"` + `tabIndex={0}`
  - [x] 3.10 Drag-over visual: apply `border-primary bg-primary/5` when `isDragging`, default `border-gray-300 hover:border-primary/50 hover:bg-gray-50` otherwise
  - [x] 3.11 Selected file display row: filename + `✓` checkmark + "Премахни" button (styled `text-red-500 hover:text-red-700`)
  - [x] 3.12 Error display: `localError ?? fieldState.error?.message` shown below zone in `text-red-500 text-xs mt-1`
  - [x] 3.13 All user-visible strings sourced from `t.applicationForm.*`

### Frontend — Update JobApplicationModal

- [x] Task 4: Wire `CvUploadField` into `JobApplicationModal` (AC: 1–8)
  - [x] 4.1 Add `control` to `useForm` destructure in `frontend/src/components/public/JobApplicationModal.tsx`
  - [x] 4.2 Import `CvUploadField` from `@/components/public/CvUploadField`
  - [x] 4.3 Replace the entire CV upload `<div className="mb-6">` block with `CvUploadField`; label has `htmlFor="app-cv"` for label association
  - [x] 4.4 Update `onSubmit`: change `formData.append('cv', data.cv[0])` → `formData.append('cv', data.cv)` (data.cv is now a `File` not `FileList`)

### Tests

- [x] Task 5: Create `CvUploadField` unit tests (AC: 1–8)
  - [x] 5.1 Create `frontend/src/__tests__/CvUploadField.test.tsx`
  - [x] 5.2 Use a `WrapperForm` test component that provides `control` from `useForm`; mock `@/lib/i18n` and `@/schemas/application-form.schema`
  - [x] 5.3 Test cases:
    - Renders the drop zone with `t.applicationForm.cvDropZoneText` text
    - Clicking drop zone triggers hidden input click (spy on `inputRef.current.click`)
    - Selecting valid PDF via input change → shows filename + checkmark + "Премахни" button
    - Selecting non-PDF via input change → shows "Моля, качете PDF файл", drop zone stays visible
    - Selecting PDF > 10MB via input change → shows "Файлът е твърде голям. Максимален размер: 10MB"
    - Dropping valid PDF via `fireEvent.drop` with `{ dataTransfer: { files: [file] } }` → shows filename
    - Dropping non-PDF → shows "Моля, качете PDF файл"
    - Clicking "Премахни" → filename hidden, drop zone restored
    - `isDragging` class applied on `dragover`, removed on `dragleave`
    - Drop zone has `role="button"` and `tabIndex={0}`

- [x] Task 6: Update `JobApplicationModal` tests (AC: 3, 4, 6)
  - [x] 6.1 Update schema mock in `frontend/src/__tests__/JobApplicationModal.test.tsx`:
    - Changed `cv: z.any().refine((files: any) => files?.length > 0, ...)` → `cv: z.any().refine((file: unknown) => file != null, ...)`
  - [x] 6.2 Update i18n mock to include new keys (`cvDropZoneText`, `cvRemoveButton`)
  - [x] 6.3 `fireChangeWithFile(cvInput, ...)` still works — `getByLabelText(/CV \(PDF\)/)` finds the hidden `<input id="app-cv">` which triggers `handleInputChange` in `CvUploadField`
  - [x] 6.4 Fixed pre-existing ambiguous "Затвори" button selector using `getAllByRole(...).at(-1)!`; all 15 tests pass

## Dev Notes

### Scope Boundary with Story 6.5

Story 6.5 created a basic `<input type="file" accept=".pdf">` directly in `JobApplicationModal` and noted: *"Story 6.6 will replace this with drag-drop, visual feedback (filename + checkmark + Remove button)."*

Story 6.6 is **frontend-only**. The backend multer configuration (`multer_pdf.config.ts`) and Zod schema (`application_schema.ts`) already handle PDF-only and 10MB enforcement server-side — **do not touch them**.

### Key Schema Change: FileList → File

The current `application-form.schema.ts` uses `z.instanceof(FileList)`. Story 6.6 changes this to `z.instanceof(File)` because:

1. `CvUploadField` manages file state internally and calls `field.onChange(file: File | null)` — no `FileList` intermediary.
2. `DataTransfer` API (needed to create a `FileList` programmatically in drag-drop handlers) is unreliable in JSDOM tests.
3. `File` is always available in JSDOM — simpler, testable.

The existing test mock in `JobApplicationModal.test.tsx` mocks the schema with `z.any()`, so the change is transparent to those tests — only the refine condition needs updating (`file != null` instead of `files?.length > 0`).

### CvUploadField — Full Implementation

```tsx
// frontend/src/components/public/CvUploadField.tsx
import { useRef, useState, DragEvent } from 'react';
import { useController, Control } from 'react-hook-form';
import { useTranslation } from '@/lib/i18n';
import { ApplicationFormData } from '@/schemas/application-form.schema';

interface CvUploadFieldProps {
  control: Control<ApplicationFormData>;
  isSubmitting: boolean;
}

export function CvUploadField({ control, isSubmitting }: CvUploadFieldProps) {
  const t = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { field, fieldState } = useController({
    name: 'cv',
    control,
  });

  const validateAndSetFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      setLocalError('Моля, качете PDF файл');
      setSelectedFile(null);
      field.onChange(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setLocalError('Файлът е твърде голям. Максимален размер: 10MB');
      setSelectedFile(null);
      field.onChange(null);
      return;
    }
    setLocalError(null);
    setSelectedFile(file);
    field.onChange(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isSubmitting) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (isSubmitting) return;
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetFile(file);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setLocalError(null);
    field.onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  const displayError = localError ?? fieldState.error?.message;

  return (
    <div>
      {/* Hidden file input — id="app-cv" preserves label association for tests */}
      <input
        ref={inputRef}
        id="app-cv"
        type="file"
        accept=".pdf"
        className="sr-only"
        onChange={handleInputChange}
        disabled={isSubmitting}
        tabIndex={-1}
        aria-hidden="true"
      />

      {selectedFile ? (
        /* Selected file display */
        <div className="flex items-center gap-2 p-3 border border-green-300 bg-green-50 rounded">
          <span className="text-green-600 text-sm font-bold" aria-hidden="true">✓</span>
          <span className="text-sm text-gray-700 flex-1 truncate">{selectedFile.name}</span>
          <button
            type="button"
            onClick={handleRemove}
            disabled={isSubmitting}
            className="text-sm text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
          >
            {t.applicationForm.cvRemoveButton}
          </button>
        </div>
      ) : (
        /* Drop zone */
        <div
          role="button"
          tabIndex={isSubmitting ? -1 : 0}
          onClick={() => !isSubmitting && inputRef.current?.click()}
          onKeyDown={handleKeyDown}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={[
            'flex flex-col items-center justify-center p-6 border-2 border-dashed rounded transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50',
            isSubmitting ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
          ].join(' ')}
          aria-label={t.applicationForm.cvDropZoneText}
        >
          <svg
            className="w-8 h-8 text-gray-400 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          <p className="text-sm text-gray-600 text-center">
            {t.applicationForm.cvDropZoneText}
          </p>
          <p className="text-xs text-gray-400 mt-1">{t.applicationForm.cvHelp}</p>
        </div>
      )}

      {displayError && (
        <p className="text-red-500 text-xs mt-1">{displayError}</p>
      )}
    </div>
  );
}
```

### Updated application-form.schema.ts

```typescript
import { z } from 'zod';

export const applicationFormSchema = z.object({
  name: z.string().min(1, 'Името е задължително'),
  email: z
    .string()
    .min(1, 'Имейлът е задължителен')
    .email('Невалиден имейл формат'),
  phone: z
    .string()
    .min(1, 'Телефонът е задължителен')
    .regex(/^(\+359|0)(\s?[0-9]){8,9}$/, 'Невалиден телефонен номер'),
  coverLetter: z.string().optional(),
  cv: z
    .instanceof(File, { message: 'CV файлът е задължителен' })
    .refine(
      (file) => file.type === 'application/pdf',
      'Моля, качете PDF файл',
    )
    .refine(
      (file) => file.size <= 10 * 1024 * 1024,
      'Файлът е твърде голям. Максимален размер: 10MB',
    ),
});

export type ApplicationFormData = z.infer<typeof applicationFormSchema>;
```

### JobApplicationModal Changes (diff-style)

**Add `control` to useForm destructure:**
```tsx
const {
  register,
  handleSubmit,
  reset,
  formState: { errors, isSubmitting },
  setError,
  clearErrors,
  control,  // <-- ADD THIS
} = useForm<ApplicationFormData>({ resolver: zodResolver(applicationFormSchema) });
```

**Import CvUploadField:**
```tsx
import { CvUploadField } from './CvUploadField';
```

**Replace CV upload section (entire `<div className="mb-6">` block):**
```tsx
{/* CV Upload — enhanced by Story 6.6 */}
<div className="mb-6">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    {t.applicationForm.cvLabel} *
  </label>
  <CvUploadField control={control} isSubmitting={isSubmitting} />
</div>
```

**Update onSubmit — change one line:**
```typescript
// BEFORE (Story 6.5):
formData.append('cv', data.cv[0]);
// AFTER (Story 6.6):
formData.append('cv', data.cv);
```

### Updated JobApplicationModal Test Mock

```typescript
// Update the schema mock (ONE line change):
// BEFORE:
cv: z.any().refine((files: any) => files?.length > 0, 'CV файлът е задължителен'),
// AFTER:
cv: z.any().refine((file: any) => file != null, 'CV файлът е задължителен'),

// Update i18n mock — add two keys to applicationForm object:
cvDropZoneText: 'Натиснете или плъзнете PDF файл тук',
cvRemoveButton: 'Премахни',
```

All 15 existing `JobApplicationModal` tests continue passing without logic changes because:
- `getByLabelText(/CV \(PDF\)/)` still finds the hidden `<input id="app-cv">` (the label still wraps the same id)
- `fireChangeWithFile(cvInput, file)` still triggers `handleInputChange` via the change event on the hidden input
- Validation on submit still works with the updated `z.any().refine(file => file != null, ...)` mock

### CvUploadField Test Patterns

```typescript
// frontend/src/__tests__/CvUploadField.test.tsx

// Setup mocks (same vi.hoisted pattern as other public component tests)
vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    applicationForm: {
      cvLabel: 'CV (PDF)',
      cvHelp: 'Качете вашето CV в PDF формат (до 10MB)',
      cvDropZoneText: 'Натиснете или плъзнете PDF файл тук',
      cvRemoveButton: 'Премахни',
    },
  }),
}));

vi.mock('@/schemas/application-form.schema', async () => {
  const { z } = await import('zod');
  const applicationFormSchema = z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    coverLetter: z.string().optional(),
    cv: z.any().refine((file: any) => file != null, 'CV файлът е задължителен'),
  });
  return { applicationFormSchema };
});

// Test wrapper that provides RHF control
function WrapperForm() {
  const { control } = useForm<any>({ defaultValues: { cv: null } });
  return <CvUploadField control={control} isSubmitting={false} />;
}

// Helper — reuse from JobApplicationModal.test.tsx pattern
function createMockFile(name: string, type: string, size = 1024): File {
  const file = new File(['content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

function fireChangeOnHiddenInput(file: File) {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  Object.defineProperty(input, 'files', {
    value: { 0: file, length: 1, item: () => file },
    configurable: true,
  });
  fireEvent.change(input);
}

// Test cases:
// 1. Renders drop zone with text
// 2. Drop zone has role="button" and tabIndex=0
// 3. Valid PDF change → filename + checkmark + Премахни button visible
// 4. Non-PDF change → "Моля, качете PDF файл" error shown, drop zone stays
// 5. PDF > 10MB → "Файлът е твърде голям. Максимален размер: 10MB"
// 6. Drop valid PDF via fireEvent.drop({ dataTransfer: { files: [file] } }) → filename shown
// 7. Drop non-PDF → error shown
// 8. Click Премахни → filename hidden, drop zone restored
// 9. isDragging class on dragover, removed on dragleave
```

### Project Structure Notes

**Files to create:**
```
frontend/src/components/public/CvUploadField.tsx     (new — drag-drop CV upload widget)
frontend/src/__tests__/CvUploadField.test.tsx         (new — unit tests)
```

**Files to modify:**
```
frontend/src/schemas/application-form.schema.ts      (cv: FileList → File-based)
frontend/src/lib/i18n/types.ts                       (add cvDropZoneText, cvRemoveButton)
frontend/src/lib/i18n/bg.ts                          (add Bulgarian values for new keys)
frontend/src/components/public/JobApplicationModal.tsx (add control, swap CV section with CvUploadField, fix onSubmit)
frontend/src/__tests__/JobApplicationModal.test.tsx  (update schema mock + i18n mock)
```

**Do NOT touch:**
- `backend/src/config/multer_pdf.config.ts` — already handles PDF/10MB server-side
- `backend/src/schemas/application_schema.ts` — backend validation unchanged
- `backend/src/controllers/public/application_controller.ts` — unchanged
- `backend/__test__/applications.routes.test.ts` — unchanged
- `frontend/src/schemas/job-form.schema.ts` — different feature
- Any admin files (`JobsList`, `JobCreate`, `JobEdit`, `useJobs`, `JobListRow`)

### References

- [Story 6.5](6-5-job-application-form.md) — Created `JobApplicationModal` with basic `<input type="file">` that this story replaces; also established multer_pdf.config.ts (DO NOT change backend)
- [JobApplicationModal.tsx](../../frontend/src/components/public/JobApplicationModal.tsx) — Modify this file: add `control`, swap CV section, fix `onSubmit`
- [application-form.schema.ts](../../frontend/src/schemas/application-form.schema.ts) — Update `cv` field from FileList to File
- [JobApplicationModal.test.tsx](../../frontend/src/__tests__/JobApplicationModal.test.tsx) — Update schema mock + i18n mock
- [i18n/types.ts](../../frontend/src/lib/i18n/types.ts) — Add `cvDropZoneText` + `cvRemoveButton` to `applicationForm`
- [i18n/bg.ts](../../frontend/src/lib/i18n/bg.ts) — Add Bulgarian strings
- [Source: epics.md#Story-6.6] — Acceptance criteria and user story

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- `z.instanceof(FileList)` replaced with `z.instanceof(File)` — avoids needing `DataTransfer` API in drag-drop handler code paths, which is unavailable in JSDOM test environment. Production behavior is identical (still validates PDF MIME type and 10MB size limit).
- `aria-hidden="true"` was initially added to hidden file input but removed to allow `getByLabelText(/CV \(PDF\)/)` to work in RTL tests. `tabIndex={-1}` keeps it out of keyboard tab order; `sr-only` CSS keeps it visually hidden.
- Pre-existing ambiguous button issue (`getByRole('button', { name: 'Затвори' })`) in `JobApplicationModal.test.tsx` was discovered and fixed by using `getAllByRole(...).at(-1)!` to select the success screen "Затвори" button specifically.
- `CvUploadField` "Remove button is disabled when submitting" test required a `ControllableWrapper` pattern (rerender same component instance) to preserve `selectedFile` local state across re-renders.

### Completion Notes List

- ✅ i18n: Added `cvDropZoneText`, `cvRemoveButton`, `cvInvalidType`, `cvFileTooLarge` to `types.ts` and `bg.ts`
- ✅ Schema: `application-form.schema.ts` updated — `cv` field now uses `z.instanceof(File)` with MIME + size refines; `ApplicationFormData.cv` type is `File`
- ✅ Component: `CvUploadField.tsx` created — hidden file input + drag-drop zone + file display row + immediate client-side validation (via i18n keys) + Remove button + keyboard accessibility (`role="button"`, `tabIndex`, `onKeyDown`)
- ✅ Integration: `JobApplicationModal.tsx` updated — `control` extracted from `useForm`, `CvUploadField` wired in, `formData.append('cv', data.cv)` for single File
- ✅ Tests: `CvUploadField.test.tsx` — 15 tests covering drag-drop, click, validation, remove, drag-over styling, keyboard (Enter/Space), drop-ignored-during-submit; all pass
- ✅ Tests: `JobApplicationModal.test.tsx` — all 15 tests pass after schema mock and i18n mock updates
- ✅ TypeScript: `npx tsc --noEmit` clean
- ✅ No regressions in Epic 6 test suite
- Pre-existing test failures in Teacher/NewsEdit suites confirmed unrelated to Story 6.6

### Senior Developer Review (AI) — 2026-03-14

**Issues Fixed (5):**
- [HIGH] Task 5 subtasks 5.1–5.3 were marked [ ] despite being implemented — corrected to [x]
- [HIGH] `validateAndSetFile` had hardcoded Bulgarian strings instead of i18n — added `cvInvalidType`/`cvFileTooLarge` keys to types.ts + bg.ts; component now uses `t.applicationForm.*`
- [MEDIUM] `handleDragLeave` set `isDragging=false` on child-element mouse transitions causing visual flicker — fixed with `e.currentTarget.contains(e.relatedTarget)` guard
- [MEDIUM] No test for keyboard accessibility (Enter/Space triggers file input) — 2 tests added
- [MEDIUM] No test for drop ignored during submission — 1 test added

**Action Items (2 LOW, deferred):**
- `ControllableWrapper` test creates new `useForm` on rerender — acceptable risk, tests pass
- No test for `handleInputChange` with null/empty files — guard exists in code

### File List

**New files:**
- `frontend/src/components/public/CvUploadField.tsx`
- `frontend/src/__tests__/CvUploadField.test.tsx`

**Modified files:**
- `frontend/src/schemas/application-form.schema.ts` (cv: FileList → File)
- `frontend/src/lib/i18n/types.ts` (added cvDropZoneText, cvRemoveButton, cvInvalidType, cvFileTooLarge to applicationForm)
- `frontend/src/lib/i18n/bg.ts` (added Bulgarian values for new keys)
- `frontend/src/components/public/JobApplicationModal.tsx` (control, CvUploadField import, CV section swap, onSubmit fix)
- `frontend/src/__tests__/JobApplicationModal.test.tsx` (schema mock, i18n mock, Затвори button fix)
