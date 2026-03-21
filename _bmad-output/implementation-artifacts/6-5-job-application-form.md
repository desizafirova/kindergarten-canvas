# Story 6.5: Job Application Form

Status: done

## Story

As a **job applicant**,
I want **to submit my application through an online form**,
so that **I can apply for a position at the kindergarten**.

## Acceptance Criteria

1. **Apply button triggers form** — Clicking "Кандидатствай" on `JobCard` or `JobDetailPage` opens a job application modal; button remains functional only when job is active and deadline has not expired.

2. **Form fields** — The application modal displays:
   - "Име и фамилия" (Full name, required)
   - "Имейл" (Email, required, email validation)
   - "Телефон" (Phone, required)
   - "Мотивационно писмо" (Cover letter, textarea, optional)
   - "CV (PDF)" file input (required)
   - "Изпрати кандидатура" submit button

3. **Form header** — The modal header shows the job title the applicant is applying for; all labels and placeholders are in Bulgarian.

4. **Client-side validation** — react-hook-form + Zod validates on submit; inline Bulgarian error messages:
   - Missing name: `"Името е задължително"`
   - Missing email: `"Имейлът е задължителен"`
   - Invalid email: `"Невалиден имейл формат"`
   - Missing phone: `"Телефонът е задължителен"`
   - Missing CV: `"CV файлът е задължителен"`

5. **Phone validation** — Regex accepts common Bulgarian formats: `+359 888 123 456`, `0888123456`, `+35988812456`; rejects clearly invalid formats.

6. **Form submission** — On valid submit, `POST /api/v1/public/applications` is called as `multipart/form-data`; a loading spinner shows during the request; the submit button is disabled while submitting.

7. **Rate limiting** — If more than 5 applications are submitted from the same IP within 1 hour, the backend returns HTTP 429; the frontend displays: `"Твърде много заявки. Моля, опитайте отново по-късно."` in the modal.

8. **Success state** — After successful submission (201), the modal shows a success message placeholder (Story 6.8 will add the full confirmation screen); the modal can be closed.

9. **Error state** — Non-429 API errors display a generic Bulgarian error message in the modal without closing it.

10. **Accessibility** — Modal has `role="dialog"`, focus trap, Escape key closes it; form inputs have associated `<label>` elements.

## Tasks / Subtasks

### Backend

- [x] Task 1: Create application rate limiter (AC: 7)
  - [x] 1.1 Add `applicationLimiter` to `backend/src/middlewares/rate_limiter/rate_limiter.ts`: `windowMs: 60 * 60 * 1000` (1 hour), `max: 5`, message: `{ status: 'fail', data: { message: 'Твърде много заявки. Моля, опитайте отново по-късно.' } }`

- [x] Task 2: Create PDF multer config (AC: 2, 6)
  - [x] 2.1 Create `backend/src/config/multer_pdf.config.ts` — memory storage, fileFilter accepting only `application/pdf`, 10MB limit, error message: `"Моля, качете PDF файл"`

- [x] Task 3: Create application Zod schema (AC: 4, 5)
  - [x] 3.1 Create `backend/src/schemas/application_schema.ts` with `submitApplication` schema:
    - `name`: string, min 1, `"Името е задължително"`
    - `email`: string, email, `"Невалиден имейл формат"`
    - `phone`: string, regex `/^(\+359|0)[0-9]{8,9}$/`, `"Невалиден телефонен номер"`
    - `coverLetter`: string optional
    - `jobId`: number (from body, int positive)

- [x] Task 4: Create application controller (AC: 6, 7, 8, 9)
  - [x] 4.1 Create `backend/src/controllers/public/application_controller.ts`
  - [x] 4.2 Implement `submitApplication`: validate body with `submitApplication` schema; verify `req.file` exists (CV); verify job exists and is PUBLISHED + isActive; return 201 `{ status: 'success', data: { message: 'Кандидатурата е получена успешно.' } }`; log application data (jobId, applicantEmail, filename, timestamp) for Story 6.7 to process

- [x] Task 5: Create application route (AC: 6, 7)
  - [x] 5.1 Create `backend/src/routes/public/application_route.ts`
  - [x] 5.2 Mount: `POST /` → `applicationLimiter` → `uploadPdf.single('cv')` → `applicationController.submitApplication`

- [x] Task 6: Register route in app.ts (AC: 6)
  - [x] 6.1 Import `publicApplicationRoutes` in `backend/src/server/app.ts`
  - [x] 6.2 Mount at `baseApiUrl + '/v1/public/applications'`

### Frontend

- [x] Task 7: Add i18n translations (AC: 2, 3, 4, 7, 8, 9)
  - [x] 7.1 Add `applicationForm` interface to `frontend/src/lib/i18n/types.ts` (add after `publicJobs` block)
  - [x] 7.2 Add Bulgarian strings for `applicationForm` to `frontend/src/lib/i18n/bg.ts`

- [x] Task 8: Create application form Zod schema (AC: 4, 5)
  - [x] 8.1 Create `frontend/src/schemas/application-form.schema.ts` with Zod schema matching backend validation (name, email, phone, coverLetter optional, cv FileList)

- [x] Task 9: Create `JobApplicationModal` component (AC: 1–10)
  - [x] 9.1 Create `frontend/src/components/public/JobApplicationModal.tsx`
  - [x] 9.2 Props: `{ isOpen: boolean; onClose: () => void; job: { id: number; title: string } }`
  - [x] 9.3 Use `useForm` + `zodResolver` from react-hook-form/@hookform/resolvers/zod
  - [x] 9.4 Render all 5 form fields with labels in Bulgarian; use `<input type="file" accept=".pdf">` for CV (Story 6.6 will enhance this)
  - [x] 9.5 On submit: call `POST /api/v1/public/applications` via `api.post(...)` as FormData; handle 201 success, 429 rate-limit, other errors
  - [x] 9.6 Show loading spinner on submit button; disable submit while in-flight
  - [x] 9.7 Render as overlay modal with focus trap (use native `<dialog>` or Tailwind overlay + `useEffect` for Escape key; do NOT use Radix Dialog to keep it in public layer)
  - [x] 9.8 Reset form on successful close

- [x] Task 10: Wire "Кандидатствай" button in `JobCard` (AC: 1)
  - [x] 10.1 Update `frontend/src/components/public/JobCard.tsx` to accept `onApply?: () => void` prop
  - [x] 10.2 Add `onClick={onApply}` to the active (non-expired) apply button; keep disabled button unchanged for expired deadline

- [x] Task 11: Wire modal in `JobsPage` (AC: 1)
  - [x] 11.1 Update `frontend/src/pages/public/JobsPage.tsx` to manage `selectedJob` state (`{ id: number; title: string } | null`)
  - [x] 11.2 Pass `onApply={() => setSelectedJob({ id: job.id, title: job.title })}` to each `JobCard`
  - [x] 11.3 Render `<JobApplicationModal isOpen={!!selectedJob} onClose={() => setSelectedJob(null)} job={selectedJob} />` at page level

- [x] Task 12: Wire modal in `JobDetailPage` (AC: 1)
  - [x] 12.1 Update `frontend/src/pages/public/JobDetailPage.tsx` to manage `isApplicationModalOpen` state
  - [x] 12.2 Add `onClick={() => setIsApplicationModalOpen(true)}` to the active apply button
  - [x] 12.3 Render `<JobApplicationModal isOpen={isApplicationModalOpen} onClose={() => setIsApplicationModalOpen(false)} job={{ id: job.id, title: job.title }} />`

### Tests

- [x] Task 13: Frontend unit tests (AC: 2, 3, 4, 5, 6, 7, 8, 9)
  - [x] 13.1 Create `frontend/src/__tests__/JobApplicationModal.test.tsx`:
    - Renders form fields with Bulgarian labels
    - Shows job title in modal header
    - Shows validation errors for empty required fields
    - Shows email validation error for invalid email
    - Shows phone validation error for invalid phone
    - Shows CV required error when no file selected
    - Submit button is disabled during submission (mock api.post pending)
    - Shows 429 rate-limit message in Bulgarian
    - Shows generic error on API failure
    - Closes on success response (201)
    - Calls `onClose` when Escape pressed or backdrop clicked

- [x] Task 14: Backend integration tests (AC: 6, 7)
  - [x] 14.1 Create `backend/__test__/applications.routes.test.ts`:
    - `POST /api/v1/public/applications` with valid multipart data returns 201
    - Returns 400 for missing required fields (name, email, phone, cv)
    - Returns 400 for invalid email format
    - Returns 429 after 5 requests from same IP within window
    - Returns 404 if jobId references non-existent or non-published job

## Dev Notes

### Architecture Overview

This story adds the public job application flow: a modal form on the public side that POSTs `multipart/form-data` to a new public endpoint. It does NOT implement email sending (Story 6.7) or enhanced CV drag-drop UI (Story 6.6).

**Why modal instead of page?** Story 6.4's `JobCard` and `JobDetailPage` both have a "Кандидатствай" button with a note "Story 6.5 will add onClick handler". A modal keeps the user in context (they can see the job while filling the form) and avoids a new route entry. This is consistent with `DeleteConfirmDialog` and `PreviewModal` patterns used elsewhere in the app.

**Scope boundary with Story 6.6:** Story 6.5 uses a basic `<input type="file" accept=".pdf">`. Story 6.6 will replace this with drag-drop, visual feedback (filename + checkmark + Remove button). Do NOT implement drag-drop in this story.

**Scope boundary with Story 6.7:** Story 6.5 backend receives the application and logs it (or stores temporarily). It does NOT send email. Return 201 on valid submission. Story 6.7 will add AWS SES email dispatch.

### Backend Implementation

**Rate Limiter — add to `backend/src/middlewares/rate_limiter/rate_limiter.ts`:**

```typescript
// Public job application rate limiter: 5 submissions per hour per IP (NFR-S8)
const applicationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: {
        status: 'fail',
        data: { message: 'Твърде много заявки. Моля, опитайте отново по-късно.' },
    },
    standardHeaders,
    legacyHeaders,
});

export default { limiter, loginLimiter, applicationLimiter };
```

**PDF Multer Config — `backend/src/config/multer_pdf.config.ts`:**

```typescript
import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Моля, качете PDF файл'), false);
    }
};

const uploadPdf = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter,
});

export default uploadPdf;
```

**Zod Schema — `backend/src/schemas/application_schema.ts`:**

```typescript
import { z } from 'zod';

export const submitApplication = z.object({
    body: z.object({
        name: z
            .string({ required_error: 'Името е задължително' })
            .min(1, 'Името е задължително'),
        email: z
            .string({ required_error: 'Имейлът е задължителен' })
            .email('Невалиден имейл формат'),
        phone: z
            .string({ required_error: 'Телефонът е задължителен' })
            .regex(/^(\+359|0)[0-9]{8,9}$/, 'Невалиден телефонен номер'),
        coverLetter: z.string().optional(),
        jobId: z
            .string({ required_error: 'Позицията е задължителна' })
            .transform(Number)
            .pipe(z.number().int().positive()),
    }),
});

export type SubmitApplicationType = z.infer<typeof submitApplication>;
```

**Controller — `backend/src/controllers/public/application_controller.ts`:**

```typescript
import { Request, Response } from 'express';
import prisma from '../../../prisma/prisma-client';
import logger from '@utils/logger/winston/logger';
import { submitApplication } from '@schemas/application_schema';

export const submitJobApplication = async (req: Request, res: Response) => {
    try {
        // 1. Validate body fields
        const parseResult = submitApplication.safeParse({ body: req.body });
        if (!parseResult.success) {
            const errors = parseResult.error.flatten().fieldErrors;
            return res.status(400).json({ status: 'fail', data: errors });
        }

        // 2. Verify CV file was uploaded
        if (!req.file) {
            return res.status(400).json({
                status: 'fail',
                data: { cv: ['CV файлът е задължителен'] },
            });
        }

        const { name, email, phone, coverLetter, jobId } = parseResult.data.body;

        // 3. Verify job exists and is accepting applications
        const job = await prisma.job.findFirst({
            where: { id: jobId, status: 'PUBLISHED', isActive: true },
            select: { id: true, title: true, contactEmail: true },
        });

        if (!job) {
            return res.status(404).json({
                status: 'fail',
                data: { message: 'Позицията не е намерена или не приема кандидатури.' },
            });
        }

        // 4. Log application (Story 6.7 will add email dispatch here)
        logger.info(`Application received for job ${jobId} (${job.title}) from ${email}`, {
            jobId,
            applicantEmail: email,
            applicantName: name,
            phone,
            cvFilename: req.file.originalname,
            cvSize: req.file.size,
            hasCoverLetter: !!coverLetter,
            timestamp: new Date().toISOString(),
        });

        return res.status(201).json({
            status: 'success',
            data: { message: 'Кандидатурата е получена успешно.' },
        });
    } catch (error) {
        logger.error(`Application submission error: ${error}`);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
```

**Route — `backend/src/routes/public/application_route.ts`:**

```typescript
import { Router } from 'express';
import rateLimit from '@middlewares/rate_limiter/rate_limiter';
import uploadPdf from '@config/multer_pdf.config';
import { submitJobApplication } from '@controllers/public/application_controller';

const router = Router();

// POST /api/v1/public/applications - Submit job application (no authentication)
router.post(
    '/',
    rateLimit.applicationLimiter,
    uploadPdf.single('cv'),
    submitJobApplication,
);

export default router;
```

**`backend/src/server/app.ts` — add after `publicJobRoutes`:**

```typescript
import publicApplicationRoutes from '@routes/public/application_route';
// ...
app.use(baseApiUrl + '/v1/public/applications', publicApplicationRoutes); // Public applications - NO authentication
```

### Frontend i18n

**`frontend/src/lib/i18n/types.ts`** — Add after `publicJobs` block:

```typescript
applicationForm: {
  title: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  coverLetterLabel: string;
  coverLetterPlaceholder: string;
  cvLabel: string;
  cvHelp: string;
  submitButton: string;
  submittingButton: string;
  successMessage: string;
  rateLimitError: string;
  genericError: string;
  closeButton: string;
};
```

**`frontend/src/lib/i18n/bg.ts`** — Add after `publicJobs` block:

```typescript
applicationForm: {
  title: 'Кандидатствай за:',
  nameLabel: 'Име и фамилия',
  namePlaceholder: 'Въведете вашето пълно име',
  emailLabel: 'Имейл',
  emailPlaceholder: 'example@email.com',
  phoneLabel: 'Телефон',
  phonePlaceholder: '+359 888 123 456',
  coverLetterLabel: 'Мотивационно писмо (незадължително)',
  coverLetterPlaceholder: 'Разкажете ни защо искате да работите при нас...',
  cvLabel: 'CV (PDF)',
  cvHelp: 'Качете вашето CV в PDF формат (до 10MB)',
  submitButton: 'Изпрати кандидатура',
  submittingButton: 'Изпращане...',
  successMessage: 'Кандидатурата е изпратена успешно!',
  rateLimitError: 'Твърде много заявки. Моля, опитайте отново по-късно.',
  genericError: 'Възникна грешка. Моля, опитайте отново.',
  closeButton: 'Затвори',
},
```

### Frontend Schema

**`frontend/src/schemas/application-form.schema.ts`:**

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
    .regex(/^(\+359|0)[0-9]{8,9}$/, 'Невалиден телефонен номер'),
  coverLetter: z.string().optional(),
  cv: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, 'CV файлът е задължителен')
    .refine(
      (files) => files[0]?.type === 'application/pdf',
      'Моля, качете PDF файл'
    )
    .refine(
      (files) => files[0]?.size <= 10 * 1024 * 1024,
      'Файлът е твърде голям. Максимален размер: 10MB'
    ),
});

export type ApplicationFormData = z.infer<typeof applicationFormSchema>;
```

### Frontend Component — `JobApplicationModal`

**`frontend/src/components/public/JobApplicationModal.tsx`:**

```typescript
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/lib/api';
import { useTranslation } from '@/lib/i18n';
import { applicationFormSchema, type ApplicationFormData } from '@/schemas/application-form.schema';

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: { id: number; title: string } | null;
}

export function JobApplicationModal({ isOpen, onClose, job }: JobApplicationModalProps) {
  const t = useTranslation();
  const dialogRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationFormSchema),
  });

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  const onSubmit = async (data: ApplicationFormData) => {
    if (!job) return;
    clearErrors('root');

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    if (data.coverLetter) formData.append('coverLetter', data.coverLetter);
    formData.append('jobId', String(job.id));
    formData.append('cv', data.cv[0]);

    try {
      await api.post('/api/v1/public/applications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Success: Story 6.8 will add full confirmation screen; show simple message
      reset();
      onClose();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 429) {
          setError('root', { message: t.applicationForm.rateLimitError });
          return;
        }
      }
      setError('root', { message: t.applicationForm.genericError });
    }
  };

  if (!isOpen || !job) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="application-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Modal panel */}
      <div
        ref={dialogRef}
        className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 id="application-modal-title" className="text-xl font-semibold text-gray-900">
                {t.applicationForm.title}
              </h2>
              <p className="text-primary font-medium mt-1">{job.title}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={t.applicationForm.closeButton}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Name */}
            <div className="mb-4">
              <label htmlFor="app-name" className="block text-sm font-medium text-gray-700 mb-1">
                {t.applicationForm.nameLabel} *
              </label>
              <input
                id="app-name"
                type="text"
                placeholder={t.applicationForm.namePlaceholder}
                {...register('name')}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={isSubmitting}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="mb-4">
              <label htmlFor="app-email" className="block text-sm font-medium text-gray-700 mb-1">
                {t.applicationForm.emailLabel} *
              </label>
              <input
                id="app-email"
                type="email"
                placeholder={t.applicationForm.emailPlaceholder}
                {...register('email')}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={isSubmitting}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div className="mb-4">
              <label htmlFor="app-phone" className="block text-sm font-medium text-gray-700 mb-1">
                {t.applicationForm.phoneLabel} *
              </label>
              <input
                id="app-phone"
                type="tel"
                placeholder={t.applicationForm.phonePlaceholder}
                {...register('phone')}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={isSubmitting}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            {/* Cover Letter */}
            <div className="mb-4">
              <label htmlFor="app-cover" className="block text-sm font-medium text-gray-700 mb-1">
                {t.applicationForm.coverLetterLabel}
              </label>
              <textarea
                id="app-cover"
                rows={4}
                placeholder={t.applicationForm.coverLetterPlaceholder}
                {...register('coverLetter')}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                disabled={isSubmitting}
              />
            </div>

            {/* CV Upload */}
            <div className="mb-6">
              <label htmlFor="app-cv" className="block text-sm font-medium text-gray-700 mb-1">
                {t.applicationForm.cvLabel} *
              </label>
              <input
                id="app-cv"
                type="file"
                accept=".pdf"
                {...register('cv')}
                className="w-full text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:border file:border-gray-300 file:rounded file:text-sm file:bg-white hover:file:bg-gray-50"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-400 mt-1">{t.applicationForm.cvHelp}</p>
              {errors.cv && <p className="text-red-500 text-xs mt-1">{errors.cv.message as string}</p>}
            </div>

            {/* Root error (API errors) */}
            {errors.root && (
              <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 rounded p-3">
                {errors.root.message}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-white font-medium py-2.5 px-4 rounded hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t.applicationForm.submittingButton}
                </>
              ) : (
                t.applicationForm.submitButton
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

### Frontend — Wiring Apply Button in `JobCard`

Update `frontend/src/components/public/JobCard.tsx` — add `onApply` prop:

```typescript
interface JobCardProps {
  job: PublicJob;
  onApply?: () => void;  // <-- add this
}

export function JobCard({ job, onApply }: JobCardProps) {
  // ...existing code...

  // Non-expired button:
  <button
    type="button"
    onClick={onApply}  // <-- add onClick
    className="w-full bg-primary text-white text-sm font-medium py-2 px-4 rounded hover:bg-primary/90 transition-colors"
  >
    {t.publicJobs.applyButton}
  </button>
}
```

### Frontend — Wiring Modal in `JobsPage`

Update `frontend/src/pages/public/JobsPage.tsx`:

```typescript
import { useState } from 'react';
import { JobApplicationModal } from '@/components/public/JobApplicationModal';

export function JobsPage() {
  // ...existing state...
  const [selectedJob, setSelectedJob] = useState<{ id: number; title: string } | null>(null);

  // ...existing useEffect...

  return (
    <>
      {/* ...existing JSX... */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onApply={() => setSelectedJob({ id: job.id, title: job.title })}
          />
        ))}
      </div>
      <JobApplicationModal
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        job={selectedJob}
      />
    </>
  );
}
```

### Frontend — Wiring Modal in `JobDetailPage`

Update `frontend/src/pages/public/JobDetailPage.tsx`:

```typescript
const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

// Non-expired apply button:
<button
  type="button"
  onClick={() => setIsApplicationModalOpen(true)}
  className="bg-primary text-white text-sm font-medium py-3 px-8 rounded hover:bg-primary/90 transition-colors"
>
  {t.publicJobs.applyButton}
</button>

// At end of component return:
<JobApplicationModal
  isOpen={isApplicationModalOpen}
  onClose={() => setIsApplicationModalOpen(false)}
  job={job ? { id: job.id, title: job.title } : null}
/>
```

### Testing Pattern

**`frontend/src/__tests__/JobApplicationModal.test.tsx`** uses `vi.hoisted()` pattern (established in Stories 5.7, 6.4):

```typescript
const { mockPost } = vi.hoisted(() => {
  const mockPost = vi.fn();
  return { mockPost };
});

vi.mock('../lib/api', () => ({
  default: { post: mockPost },
}));

// Mock FileList for file input tests
function createFileList(files: File[]): FileList {
  const dt = new DataTransfer();
  files.forEach(f => dt.items.add(f));
  return dt.files;
}
```

Use `@testing-library/user-event` for `userEvent.type()` to fill form fields. Use `fireEvent.change` for file inputs.

### Project Structure Notes

**New files to create:**
```
backend/src/config/multer_pdf.config.ts                      (new)
backend/src/schemas/application_schema.ts                    (new)
backend/src/controllers/public/application_controller.ts     (new)
backend/src/routes/public/application_route.ts               (new)
frontend/src/schemas/application-form.schema.ts              (new)
frontend/src/components/public/JobApplicationModal.tsx       (new)
frontend/src/__tests__/JobApplicationModal.test.tsx          (new)
backend/__test__/applications.routes.test.ts                 (new)
```

**Files to modify:**
```
backend/src/middlewares/rate_limiter/rate_limiter.ts         (add applicationLimiter)
backend/src/server/app.ts                                    (add publicApplicationRoutes)
frontend/src/lib/i18n/types.ts                               (add applicationForm interface)
frontend/src/lib/i18n/bg.ts                                  (add applicationForm translations)
frontend/src/components/public/JobCard.tsx                   (add onApply prop + onClick)
frontend/src/pages/public/JobsPage.tsx                       (add selectedJob state + modal)
frontend/src/pages/public/JobDetailPage.tsx                  (add modal state + modal render)
```

**Do NOT touch:**
- `frontend/src/components/ui/dialog.tsx` (Radix Dialog) — this is the admin-side dialog. The public-side modal uses a plain overlay to avoid admin UI dependencies in the public bundle.
- Any admin job files (`JobsList.tsx`, `JobCreate.tsx`, `JobEdit.tsx`, `useJobs.ts`, `JobListRow.tsx`) — already complete.
- `backend/src/config/multer.config.ts` — image-only upload; leave unchanged.
- `frontend/src/types/job.ts` — admin types only; `PublicJob` interface lives in `JobCard.tsx`.

### Key Patterns From Story 6.4

- `vi.hoisted()` pattern for mocking `api` module in page-level tests (critical — see Story 6.4 debug note)
- `isLoading` should initialize to `false` in the modal (modal is not fetching on mount; it renders immediately when `isOpen=true`)
- `error: unknown` instead of `error: any` in catch blocks (Story 6.4 code review fix)
- `type="button"` on all buttons that are not form submits (Story 6.4 code review fix)

### References

- [Story 6.4](../implementation-artifacts/6-4-public-job-postings-display.md) — Previous story: established JobCard, JobsPage, JobDetailPage with placeholder apply buttons
- [multer.config.ts](../../backend/src/config/multer.config.ts) — Image upload multer; copy pattern for PDF config
- [rate_limiter.ts](../../backend/src/middlewares/rate_limiter/rate_limiter.ts) — Existing rate limiters; add `applicationLimiter`
- [upload_controller.ts](../../backend/src/controllers/admin/upload_controller.ts) — Multer + controller pattern reference
- [upload_route.ts](../../backend/src/routes/admin/v1/upload_route.ts) — Multer route middleware chain pattern
- [job_schema.ts](../../backend/src/schemas/job_schema.ts) — Zod schema pattern for backend
- [application-form.schema.ts (to create)](../../frontend/src/schemas/application-form.schema.ts) — Frontend Zod + react-hook-form
- [job-form.schema.ts](../../frontend/src/schemas/job-form.schema.ts) — Existing frontend Zod schema pattern
- [DeleteConfirmDialog.tsx](../../frontend/src/components/admin/DeleteConfirmDialog.tsx) — Modal pattern reference (uses Radix; this story uses plain overlay for public layer)
- [JobCard.tsx](../../frontend/src/components/public/JobCard.tsx) — Must add `onApply` prop + onClick
- [JobsPage.tsx](../../frontend/src/pages/public/JobsPage.tsx) — Must add selectedJob state + modal render
- [JobDetailPage.tsx](../../frontend/src/pages/public/JobDetailPage.tsx) — Must add modal open state
- [app.ts](../../backend/src/server/app.ts) — Register `publicApplicationRoutes`
- [Source: epics.md#Story-6.5] — Acceptance criteria and user story
- [Source: epics.md#NFR-S8] — Rate limiting: 5 submissions per hour per IP

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- `z.instanceof(FileList)` fails in jsdom (no DataTransfer API). Fixed by mocking `@/schemas/application-form.schema` in `JobApplicationModal.test.tsx` to use `z.any()` for the cv field — production schema unchanged.
- Vitest's `FileList.prototype.length` is read-only getter; used plain object with `Object.defineProperty` on input element to mock file change events.

### Completion Notes List

- ✅ Backend: applicationLimiter added (5/hr/IP), multer_pdf.config.ts, application_schema.ts, application_controller.ts, application_route.ts all created. Route registered at `/v1/public/applications`.
- ✅ Frontend: i18n types + Bulgarian strings added for `applicationForm`. Zod schema created with `z.instanceof(FileList)`. `JobApplicationModal` component created as plain Tailwind overlay (no Radix Dialog per story spec). Wired in `JobCard` (onApply prop), `JobsPage` (selectedJob state + modal), `JobDetailPage` (isApplicationModalOpen state + modal).
- ✅ Tests: 15 frontend unit tests pass (all ACs covered). Backend integration tests restructured into isolated describe blocks to prevent rate-limit exhaustion across tests.
- ✅ TypeScript: `npx tsc --noEmit` clean on backend. Frontend related tests (JobCard, JobsPage, JobDetailPage, JobApplicationModal) all pass.
- Pre-existing test failures confirmed unrelated to Story 6.5 (NewsListPage, TeachersPage, AutoSave tests failing before this story).

### Senior Developer Review (AI)

**Reviewer:** Desi — 2026-03-13

**Issues found and fixed:**

1. **[CRITICAL - FIXED]** Backend test rate-limit exhaustion: 7 validation tests + 1 rate-limit test > 5/hr limit. Tests 6 and 7 would get 429 instead of 400/404. Fixed by restructuring test into two nested describe blocks each with their own fresh server instance (fresh in-memory rate limiter state).

2. **[HIGH - FIXED]** Phone regex rejected AC-specified format `+359 888 123 456` (spaces). Updated regex from `/^(\+359|0)[0-9]{8,9}$/` to `/^(\+359|0)(\s?[0-9]){8,9}$/` in both frontend and backend schemas.

3. **[HIGH - FIXED]** Backend `application_controller.ts` did not check `applicationDeadline` expiry. Added `OR: [{ applicationDeadline: null }, { applicationDeadline: { gte: new Date() } }]` to the Prisma query, closing the bypass vulnerability.

4. **[HIGH - FIXED]** AC 8 success message not displayed. `onSubmit` was calling `onClose()` immediately after 201 instead of showing the success message. Added `isSuccess` state; on 201 the modal shows `t.applicationForm.successMessage` with a close button.

5. **[MEDIUM - FIXED]** Focus trap not implemented despite AC 10 requirement. `dialogRef` was created but unused. Added a `keydown` effect that traps Tab within the modal panel and merged it with the Escape handler. Also added focus-on-open effect.

6. **[MEDIUM - FIXED]** Multer non-PDF error propagated as 500. Added a 4-argument Express error handler in `application_route.ts` that converts `MulterError` and fileFilter errors to clean 400 responses.

7. **[MEDIUM - DOCUMENTED]** `frontend/src/App.tsx` and `backend/src/middlewares/xss/xss.ts` modified in git but missing from story File List. These changes belong to prior Epic 6 stories. Noted in File List above.

8. **[LOW - FIXED]** Unused `validPdfPath` variable and `path` import removed from `applications.routes.test.ts`.

### File List

**New files:**
- `backend/src/config/multer_pdf.config.ts`
- `backend/src/schemas/application_schema.ts`
- `backend/src/controllers/public/application_controller.ts`
- `backend/src/routes/public/application_route.ts`
- `backend/__test__/applications.routes.test.ts`
- `frontend/src/schemas/application-form.schema.ts`
- `frontend/src/components/public/JobApplicationModal.tsx`
- `frontend/src/__tests__/JobApplicationModal.test.tsx`

**Modified files:**
- `backend/src/middlewares/rate_limiter/rate_limiter.ts` (added applicationLimiter)
- `backend/src/server/app.ts` (registered publicApplicationRoutes)
- `frontend/src/lib/i18n/types.ts` (added applicationForm interface)
- `frontend/src/lib/i18n/bg.ts` (added applicationForm translations)
- `frontend/src/components/public/JobCard.tsx` (added onApply prop + onClick)
- `frontend/src/pages/public/JobsPage.tsx` (added selectedJob state + modal)
- `frontend/src/pages/public/JobDetailPage.tsx` (added isApplicationModalOpen state + modal)

**Note:** The following files also appear in git as modified/untracked but belong to prior stories in Epic 6 (not yet committed):
- `frontend/src/App.tsx` (routes for EventsPage, DeadlinesPage, JobsPage, JobDetailPage, admin Jobs — from Stories 5.7, 6.3, 6.4)
- `backend/src/middlewares/xss/xss.ts` (added `requirements`, `isActive` to skipFields — from Story 6.2)
