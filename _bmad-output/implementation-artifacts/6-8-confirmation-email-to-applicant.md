# Story 6.8: Confirmation Email to Applicant

Status: done

## Story

As a **job applicant**,
I want **to receive a confirmation email after applying**,
so that **I know my application was received**.

## Acceptance Criteria

1. **Confirmation sent after admin email succeeds** — When `sendApplicationEmail` returns `true`, the backend immediately sends a confirmation email to the applicant's email address (`applicantEmail`).

2. **Email subject** — Subject line is: `"Потвърждение за кандидатура - [KINDERGARTEN_NAME]"` where `[KINDERGARTEN_NAME]` resolves from `process.env.KINDERGARTEN_NAME` with fallback `'Детска Градина'`.

3. **Email body includes (in Bulgarian)** — All fields HTML-escaped (same pattern as Story 6.7):
   - Thank you message: `"Благодарим ви за кандидатурата!"`
   - Job title they applied for
   - Confirmation that CV was received
   - Message that they will be contacted if shortlisted
   - Kindergarten contact information (from email: `config.smtp.user`)

4. **Retry on failure** — If the confirmation send fails, the system retries up to 2 additional times (3 total attempts: initial + 2 retries with delays 1s, 2s — `MAX_ATTEMPTS = 3`).

5. **Confirmation failure does NOT block success** — Whether the confirmation email succeeds or fails, the API still returns 201 `"Кандидатурата е изпратена успешно!"` as long as the admin email succeeded. Confirmation failure is only logged.

6. **Confirmation failure logged** — If all attempts fail, the error is logged via Winston logger with `applicantEmail` and `jobTitle` context.

7. **Integration tests updated** — `applications.routes.test.ts` mocks `sendConfirmationEmail` (returns `true`) so tests don't hit real SMTP. The existing 201 success assertion is not changed.

8. **Success screen updated (frontend)** — When `isSuccess === true`, the `JobApplicationModal` displays:
   - Main message: `"Кандидатурата е изпратена успешно!"` (already translated)
   - Subtext: `"Ще получите потвърждение на имейла си."`
   - A `"Обратно към позициите"` link (navigates to `/jobs` via React Router `<Link>` and closes the modal)

## Tasks / Subtasks

### Backend — Confirmation Email Service

- [x] Task 1: Create confirmation email service (AC: 1–6)
  - [x] 1.1 Create `backend/src/services/email/confirmation_email_service.ts`
  - [x] 1.2 Export `sendConfirmationEmail(params: ConfirmationEmailParams): Promise<boolean>` where params includes: `jobTitle: string`, `applicantEmail: string`, `applicantName: string`
  - [x] 1.3 Resolve kindergarten name: `const kindergartenName = process.env.KINDERGARTEN_NAME || 'Детска Градина';`
  - [x] 1.4 Build inline HTML body — no EJS template (same pattern as `application_email_service.ts`); HTML-escape all user inputs with the same `escapeHtml()` helper (copy or extract to shared utility)
  - [x] 1.5 HTML body template:
    ```
    <h2>Потвърждение за получена кандидатура</h2>
    <p>Уважаем/а ${safeName},</p>
    <p>Благодарим ви за кандидатурата за позицията <strong>${safeTitle}</strong>!</p>
    <p>Вашето CV беше получено успешно.</p>
    <p>Ще се свържем с вас, ако профилът ви отговаря на изискванията ни.</p>
    <hr>
    <p>С уважение,<br>${kindergartenName}</p>
    <p>За контакт: <a href="mailto:${fromEmail}">${fromEmail}</a></p>
    ```
  - [x] 1.6 Use `createTransporter` from `@utils/mailer/nodemailer/core/oauth_client` (same as Story 6.7)
  - [x] 1.7 `MAX_ATTEMPTS = 3` (initial + 2 retries with delays 1s, 2s — `sleep(1000 * Math.pow(2, attempt - 1))`)
  - [x] 1.8 Return `true` on first success, `false` after all attempts fail
  - [x] 1.9 Log each attempt and final result via Winston logger

- [x] Task 2: Update email service barrel export (AC: 1)
  - [x] 2.1 Add to `backend/src/services/email/index.ts`: `export { sendConfirmationEmail } from './confirmation_email_service';` and `export type { ConfirmationEmailParams } from './confirmation_email_service';`

### Backend — Controller Update

- [x] Task 3: Update application controller to dispatch confirmation email (AC: 1, 5)
  - [x] 3.1 In `backend/src/controllers/public/application_controller.ts`, import `sendConfirmationEmail` from `@services/email`
  - [x] 3.2 After `if (!emailSent) { return 500... }` block (i.e., only when `emailSent === true`), fire confirmation email **without awaiting its result blocking the 201 response**. The confirmation must be attempted but failures must not block the response. Correct approach: await it (it's fast), but if it returns false or throws, log and continue:
    ```typescript
    // 5. Send confirmation email to applicant (non-blocking failure)
    const confirmationSent = await sendConfirmationEmail({
      jobTitle: job.title,
      applicantEmail: email,
      applicantName: name,
    }).catch((err) => {
      logger.warn(`Confirmation email dispatch threw: ${err}`);
      return false;
    });
    if (!confirmationSent) {
      logger.warn(`Confirmation email not sent to ${email} for job ${jobId}`);
    }
    ```
  - [x] 3.3 Return 201 regardless of `confirmationSent` result

### Backend — Tests

- [x] Task 4: Update integration tests to mock confirmation email service (AC: 7)
  - [x] 4.1 In `backend/__test__/applications.routes.test.ts`, extend existing `jest.mock` for `'../src/services/email'` to also mock `sendConfirmationEmail`:
    ```typescript
    jest.mock('../src/services/email', () => ({
      sendApplicationEmail: jest.fn().mockResolvedValue(true),
      sendConfirmationEmail: jest.fn().mockResolvedValue(true),
    }));
    ```
  - [x] 4.2 No changes needed to assertions — 201 message unchanged

- [x] Task 5: Create unit tests for `sendConfirmationEmail` service (AC: 1–6)
  - [x] 5.1 Create `backend/__test__/confirmation-email.service.test.ts`
  - [x] 5.2 Mock `@utils/mailer/nodemailer/core/oauth_client`, `@utils/logger/winston/logger`, and `@config/email` (same pattern as `application-email.service.test.ts`)
  - [x] 5.3 Use `jest.spyOn(global, 'setTimeout')` to make timers immediate (avoids real delays; `jest.runAllTimersAsync` not available in `@jest/globals` for this Jest version)
  - [x] 5.4 Test cases (minimum 6):
    - Returns `true` when `sendMail` succeeds on first attempt
    - Sends email to `applicantEmail` with correct subject including kindergarten name
    - Includes applicant name and job title in HTML body (HTML-escaped)
    - Returns `true` when fails first attempt but succeeds second (retry)
    - Returns `false` after all 3 attempts fail, logs error with `applicantEmail` context
    - Returns `false` immediately when transporter unavailable

### Frontend — Success Screen Update

- [x] Task 6: Add translation keys for success subtext and back-to-jobs link (AC: 8)
  - [x] 6.1 In `frontend/src/lib/i18n/types.ts`, add to `applicationForm` interface:
    ```typescript
    successSubtext: string;
    backToJobsLink: string;
    ```
  - [x] 6.2 In `frontend/src/lib/i18n/bg.ts`, add to `applicationForm`:
    ```typescript
    successSubtext: 'Ще получите потвърждение на имейла си.',
    backToJobsLink: 'Обратно към позициите',
    ```

- [x] Task 7: Update `JobApplicationModal` success screen (AC: 8)
  - [x] 7.1 In `frontend/src/components/public/JobApplicationModal.tsx`, add import for React Router `Link`: `import { Link } from 'react-router-dom';`
  - [x] 7.2 Update the `isSuccess` block (currently lines 150–161) to:
    ```tsx
    <div className="text-center py-4">
      <p className="text-green-600 text-base font-medium mb-2">
        {t.applicationForm.successMessage}
      </p>
      <p className="text-gray-500 text-sm mb-6">
        {t.applicationForm.successSubtext}
      </p>
      <Link
        to="/jobs"
        onClick={onClose}
        className="bg-primary text-white font-medium py-2.5 px-6 rounded hover:bg-primary/90 transition-colors"
      >
        {t.applicationForm.backToJobsLink}
      </Link>
    </div>
    ```
  - [x] 7.3 Verify `react-router-dom` is already imported/available in the frontend (it is — established in earlier stories)

## Dev Notes

### Pattern: Follow Story 6.7 Exactly

Story 6.7 established the confirmed working pattern. Story 6.8 follows it identically:
- Same transporter: `createTransporter` from `@utils/mailer/nodemailer/core/oauth_client`
- Same `from` address: `config.smtp.user` (import `config` from `@config/email`)
- Same `escapeHtml()` helper — copy it into `confirmation_email_service.ts` (no shared utility exists yet; don't create one just for this story)
- Same retry loop structure with `sleep` and `Math.pow` backoff

**Only difference:** `MAX_ATTEMPTS = 3` (vs `MAX_ATTEMPTS = 4` in Story 6.7 per AC 4 vs 6.7's "3 retries").

### Confirmation Email Must NOT Block 201 Response

The core architectural constraint: confirmation failure does not affect the user experience. The controller flow is:

```
1. Validate body → 400 if invalid
2. Verify CV present → 400 if missing
3. Lookup job → 404 if not found/inactive
4. sendApplicationEmail() → 500 if returns false (after 4 attempts)
5. sendConfirmationEmail() → LOG ONLY if returns false (2 attempts)
6. return 201 always (if we reach step 5)
```

### TypeScript Path Aliases

From Story 6.7 dev notes — the alias `@services/email` is confirmed mapped in `backend/tsconfig.json`. Use it consistently:
```typescript
import { sendApplicationEmail, sendConfirmationEmail } from '@services/email';
```

### Kindergarten Name Resolution

No `KINDERGARTEN_NAME` env var exists yet in `.env.example` or any config. Use `process.env.KINDERGARTEN_NAME` directly with a sensible fallback — do **not** add it to the `IEnvConfig` interface (that would require updating all 4 environment configs). Simple inline resolution is sufficient:

```typescript
const kindergartenName = process.env.KINDERGARTEN_NAME ?? 'Детска Градина';
```

Add `KINDERGARTEN_NAME=''` to `backend/.env.example` with a comment so future devs can customize it.

### HTML Escaping — Copy from Story 6.7

The `escapeHtml` helper from `application_email_service.ts`:

```typescript
const escapeHtml = (str: string): string =>
    str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
```

Apply to `applicantName` and `jobTitle` before interpolating into HTML body.

### Frontend: react-router-dom Link Import

`Link` from `react-router-dom` is available — the project already uses React Router v6 throughout (established in Epic 1). The public routes are configured in `frontend/src/App.tsx` — the `/jobs` route is already registered (Story 6.4).

`JobApplicationModal` does not currently import from `react-router-dom`. Add the import:
```typescript
import { Link } from 'react-router-dom';
```

The `onClick={onClose}` on the Link ensures the modal closes when navigating away (prevents stale modal state if the user hits Back and comes back to the jobs page).

### Fake Timers in Tests

Lesson from Story 6.7 code review (M1 issue): always use fake timers for retry unit tests to avoid slow tests:

```typescript
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

// In retry test:
const promise = sendConfirmationEmail(params);
await jest.runAllTimersAsync();
const result = await promise;
```

### Mock Pattern for jest in Integration Tests

From Story 6.7 patterns — `jest` must be imported from `@jest/globals` (not used as global) in integration test files. The existing `applications.routes.test.ts` already has this import. Just extend the existing `jest.mock` call to include `sendConfirmationEmail`.

### Scope

**Backend only changes:**
- `backend/src/services/email/confirmation_email_service.ts` (new)
- `backend/src/services/email/index.ts` (add export)
- `backend/src/controllers/public/application_controller.ts` (add confirmation dispatch)
- `backend/__test__/applications.routes.test.ts` (extend mock)
- `backend/__test__/confirmation-email.service.test.ts` (new)
- `backend/.env.example` (add `KINDERGARTEN_NAME=''` comment line)

**Frontend changes:**
- `frontend/src/lib/i18n/types.ts` (add 2 keys to interface)
- `frontend/src/lib/i18n/bg.ts` (add 2 translations)
- `frontend/src/components/public/JobApplicationModal.tsx` (update success screen)

**Do NOT touch:**
- `backend/src/config/multer_pdf.config.ts`
- `backend/src/schemas/application_schema.ts`
- `backend/src/routes/public/application_route.ts`
- `backend/src/utils/mailer/nodemailer/sender.ts`
- `frontend/src/components/public/CvUploadField.tsx`

### Project Structure Notes

**Alignment with unified project structure:**
- New service file follows `backend/src/services/{domain}/{service_name}.ts` pattern (same as `application_email_service.ts`)
- Barrel export in `index.ts` follows project convention
- Test file follows `backend/__test__/{service-name}.test.ts` pattern

**File locations:**
```
backend/src/services/email/confirmation_email_service.ts   (new)
backend/src/services/email/index.ts                        (modify — add export)
backend/src/controllers/public/application_controller.ts   (modify — add step 5)
backend/__test__/applications.routes.test.ts               (modify — extend mock)
backend/__test__/confirmation-email.service.test.ts        (new)
backend/.env.example                                       (modify — add KINDERGARTEN_NAME comment)
frontend/src/lib/i18n/types.ts                             (modify — add 2 keys)
frontend/src/lib/i18n/bg.ts                                (modify — add 2 translations)
frontend/src/components/public/JobApplicationModal.tsx     (modify — update success screen)
```

### References

- [Story 6.7](6-7-application-email-to-admin-with-cv.md) — Established email service pattern; `escapeHtml`, `MAX_ATTEMPTS`, fake timers lesson
- [application_email_service.ts](../../backend/src/services/email/application_email_service.ts) — Model for `confirmation_email_service.ts`
- [application_controller.ts](../../backend/src/controllers/public/application_controller.ts) — File to modify for step 5
- [email/index.ts](../../backend/src/services/email/index.ts) — Barrel to update
- [oauth_client.ts](../../backend/src/utils/mailer/nodemailer/core/oauth_client.ts) — Transporter factory to reuse
- [config_email.ts](../../backend/src/config/email/config_email.ts) — `config.smtp.user` for `from` address
- [JobApplicationModal.tsx](../../frontend/src/components/public/JobApplicationModal.tsx) — Success screen to update (lines 150–161)
- [bg.ts](../../frontend/src/lib/i18n/bg.ts) — Add `successSubtext` and `backToJobsLink`
- [types.ts](../../frontend/src/lib/i18n/types.ts) — Add type definitions
- [applications.routes.test.ts](../../backend/__test__/applications.routes.test.ts) — Extend mock
- [application-email.service.test.ts](../../backend/__test__/application-email.service.test.ts) — Model for new unit test file

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- **Integration test port conflict (pre-existing)**: `applications.routes.test.ts` creates multiple HTTP server instances all binding to port 3344, causing EADDRINUSE on the second `server(true)` call. This is a design issue inherited from Story 6.7 — the test file architecture uses separate server instances per describe block for rate limiter isolation but the `http_server.ts` always binds to the configured port. Pre-existing; not introduced by Story 6.8 changes.
- **`jest.runAllTimersAsync` not in `@jest/globals` types**: The `@jest/globals` package's type definitions don't include `runAllTimersAsync`. Used `jest.spyOn(global, 'setTimeout').mockImplementation` pattern instead to make timers immediate — all 7 unit tests pass.
- **`jest.SpyInstance` not exported from `@jest/globals`**: Used `any` type for the spy variable to work around missing type export.

### Completion Notes List

- ✅ Created `confirmation_email_service.ts` following Story 6.7 pattern exactly: same transporter, same escapeHtml helper, same retry loop, MAX_ATTEMPTS=3 (AC 4: 1 initial + 2 retries)
- ✅ Email subject includes `process.env.KINDERGARTEN_NAME` with fallback to `'Детска Градина'`
- ✅ HTML body includes all required Bulgarian content: thank you message, job title, CV confirmation, shortlisting message, kindergarten contact
- ✅ Controller step 5 dispatches confirmation email after admin email succeeds; failures are caught and logged, 201 response is unaffected
- ✅ Integration test mock extended with `sendConfirmationEmail` + fixed pre-existing `jest.Mock<any>` typing issues on lines 9 and 208
- ✅ Unit test suite: 7 tests covering all 6 required cases plus fallback name test; all pass
- ✅ Frontend: `types.ts` and `bg.ts` updated with `successSubtext` and `backToJobsLink` translation keys
- ✅ Frontend: `JobApplicationModal` success screen updated with subtext paragraph and `<Link to="/jobs">` replacing the close button
- ✅ `backend/.env.example` updated with `KINDERGARTEN_NAME=''` comment
- ✅ Backend TypeScript: `npx tsc --noEmit` passes clean
- ✅ Frontend TypeScript: `npx tsc --noEmit` passes clean

### File List

- `backend/src/services/email/confirmation_email_service.ts` (new)
- `backend/src/services/email/index.ts` (modified — added exports)
- `backend/src/controllers/public/application_controller.ts` (modified — added step 5)
- `backend/__test__/applications.routes.test.ts` (modified — extended mock + fixed pre-existing type errors)
- `backend/__test__/confirmation-email.service.test.ts` (new)
- `backend/.env.example` (modified — added KINDERGARTEN_NAME)
- `frontend/src/lib/i18n/types.ts` (modified — added successSubtext and backToJobsLink)
- `frontend/src/lib/i18n/bg.ts` (modified — added translations)
- `frontend/src/components/public/JobApplicationModal.tsx` (modified — updated success screen)

## Change Log

- 2026-03-14: Implemented Story 6.8 — confirmation email to applicant after successful job application. Added `confirmation_email_service.ts` (MAX_ATTEMPTS=3, Bulgarian email body, KINDERGARTEN_NAME env), wired into `application_controller.ts` as non-blocking step 5, updated email barrel export, extended integration test mocks, created 7-test unit suite, added `successSubtext`/`backToJobsLink` translations, updated `JobApplicationModal` success screen with email confirmation subtext and "Обратно към позициите" link.
- 2026-03-14: Code review (AI) — 1 High, 3 Medium, 1 Low issues found and fixed. Fixed: (H1) added `sendConfirmationEmail` import + call assertion in integration test; (M1) deduplicated `kindergartenName` env resolution — resolved once in `sendConfirmationEmail` and passed to `buildConfirmationHtml`; (M2) added `inline-block` class to success screen `<Link>` to fix vertical padding rendering; (M3) added AC 5 integration test verifying confirmation failure still returns 201. Low (L1 duplicated `escapeHtml`) left as future tech debt per story scope constraints.
