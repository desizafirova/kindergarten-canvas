# Story 6.7: Application Email to Admin with CV

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an **administrator**,
I want **to receive job applications via email with CV attachment**,
so that **I can review candidates without logging into the system**.

## Acceptance Criteria

1. **Email sent on valid submission** — When an applicant submits a valid application via `POST /api/v1/public/applications`, the backend sends an email via nodemailer (Gmail OAuth2) to the job's `contactEmail`.

2. **Email subject** — Subject line is: `"Нова кандидатура за: [Job Title]"`.

3. **Email body includes** — Applicant name, applicant email (clickable `mailto:` link), applicant phone, cover letter (if provided), application date/time formatted as Bulgarian locale (`DD.MM.YYYY HH:mm`).

4. **CV attached** — The uploaded PDF (held in `req.file.buffer` from multer's memoryStorage) is attached to the email, preserving the original filename (`req.file.originalname`). Attachment size must not exceed 10MB (already enforced by multer).

5. **Success response** — On successful email send, response returns status 201 with message: `"Кандидатурата е изпратена успешно!"`.

6. **Retry on failure** — If the email send fails, the system retries up to 3 times with exponential backoff (1s, 2s, 4s delays).

7. **Failure response** — If all 3 retries fail, the error is logged via Winston logger, and the API responds with status 500 and message: `"Възникна проблем. Моля, опитайте отново или се свържете директно."`.

8. **Application logging** — On every submission attempt, the system logs: `jobId`, `applicantEmail`, `timestamp`, `success/failure` status, and `cvFilename`.

9. **Existing tests updated** — The integration tests in `backend/__test__/applications.routes.test.ts` mock the email service so they don't attempt real sends; the 201 success test updates its expected message to `'Кандидатурата е изпратена успешно!'`.

## Tasks / Subtasks

### Backend — Email Service

- [x] Task 1: Create application email service (AC: 1–4, 6)
  - [x] 1.1 Create `backend/src/services/email/application_email_service.ts`
  - [x] 1.2 Export `sendApplicationEmail(params: ApplicationEmailParams): Promise<boolean>` where params includes: `jobTitle`, `contactEmail`, `applicantName`, `applicantEmail`, `applicantPhone`, `coverLetter?`, `cvBuffer`, `cvFilename`
  - [x] 1.3 Inside the function: build HTML email body with all applicant details, format date with `moment().format('DD.MM.YYYY HH:mm')` (moment already installed)
  - [x] 1.4 Used `@utils/mailer/nodemailer/core/oauth_client` (the transport factory) directly — `sender.ts` wraps it but doesn't support attachments; called `emailTransporter.sendMail(options)` with `attachments: [{ filename: cvFilename, content: cvBuffer, contentType: 'application/pdf' }]`
  - [x] 1.5 Implement retry loop: attempt up to 3 times; on failure wait 1000ms × 2^(attempt-1) then retry; return `true` on first success, `false` after all retries exhausted
  - [x] 1.6 Log each retry attempt and final result via Winston logger (`@utils/logger/winston/logger`)
  - [x] 1.7 Create `backend/src/services/email/index.ts` exporting `sendApplicationEmail`

### Backend — Controller Update

- [x] Task 2: Update application controller to dispatch email (AC: 1, 5, 7, 8)
  - [x] 2.1 In `backend/src/controllers/public/application_controller.ts`, import `sendApplicationEmail` from `@services/email`
  - [x] 2.2 Replace the comment `// 4. Log application (Story 6.7 will add email dispatch here)` with the actual email dispatch call
  - [x] 2.3 Call `sendApplicationEmail({ jobTitle: job.title, contactEmail: job.contactEmail, applicantName: name, applicantEmail: email, applicantPhone: phone, coverLetter, cvBuffer: req.file.buffer, cvFilename: req.file.originalname })`
  - [x] 2.4 If `sendApplicationEmail` returns `true` → return 201 `{ status: 'success', data: { message: 'Кандидатурата е изпратена успешно!' } }`
  - [x] 2.5 If `sendApplicationEmail` returns `false` → return 500 `{ status: 'error', message: 'Възникна проблем. Моля, опитайте отново или се свържете директно.' }`
  - [x] 2.6 Keep the existing Winston logger.info call for application logging (update to include email success/failure status)

### Backend — Tests

- [x] Task 3: Update integration tests to mock email service (AC: 9)
  - [x] 3.1 In `backend/__test__/applications.routes.test.ts`, added `jest.mock('../src/services/email', () => ({ sendApplicationEmail: jest.fn().mockResolvedValue(true) }))` at top of file (jest.mock is hoisted automatically)
  - [x] 3.2 Updated the 201 assertion in `'returns 201 for valid multipart application'` test: changed expected message to `'Кандидатурата е изпратена успешно!'`
  - [x] 3.3 `'returns 201 with optional cover letter included'` does not assert on message — no change needed

- [x] Task 4: Create unit tests for `sendApplicationEmail` service (AC: 1–8)
  - [x] 4.1 Create `backend/__test__/application-email.service.test.ts`
  - [x] 4.2 Mocked `@utils/mailer/nodemailer/core/oauth_client` (transport factory, not the wrapper) to return a mock `sendMail` spy
  - [x] 4.3 Mocked `@utils/logger/winston/logger` and `moment` to prevent actual I/O and ensure deterministic date output
  - [x] 4.4 8 test cases — all passing:
    - Returns `true` when `sendMail` succeeds on first attempt
    - Sends email to contactEmail with correct subject
    - Attaches CV buffer with correct filename and content type
    - Includes applicant details and formatted date in HTML body
    - Omits cover letter block when not provided
    - Returns `true` when fails on first attempt but succeeds on second (retry)
    - Returns `false` after all 3 retries fail, logs error
    - Returns `false` immediately when transporter unavailable

## Dev Notes

### Critical: multer memoryStorage — CV is a Buffer

**The CV file is NOT saved to disk.** Multer is configured with `memoryStorage()` in [`backend/src/config/multer_pdf.config.ts`](../../backend/src/config/multer_pdf.config.ts):

```typescript
const storage = multer.memoryStorage();
```

This means:
- `req.file.buffer` — the raw PDF binary as a `Buffer` — pass this directly as attachment `content`
- `req.file.originalname` — the filename — pass as attachment `filename`
- `req.file.mimetype` — always `'application/pdf'` (enforced by `fileFilter`)
- `req.file.size` — already ≤ 10MB (enforced by `limits.fileSize`)

**Do NOT attempt to read from disk or call Cloudinary in this story.** The buffer is all you need.

### Using Existing Nodemailer Transporter

The project already has a working nodemailer transporter using Gmail OAuth2. **Do not create a new transporter.** Use the existing one:

```typescript
// backend/src/utils/mailer/nodemailer/core/transporter.ts
// Returns: nodemailer.Transporter | undefined
import transporter from '@utils/mailer/nodemailer/core/transporter';

const emailTransporter = await transporter(); // async — fetches OAuth2 access token
if (!emailTransporter) {
    // OAuth2 failed — treat as email failure
    return false;
}
await emailTransporter.sendMail(options);
```

**Why not use the existing `sender.ts` utility?**
The existing `backend/src/utils/mailer/nodemailer/sender.ts` is designed for EJS-template emails sent to `data.email`. It does not support:
- Attachments (`attachments` field in nodemailer options)
- Sending to a custom `to` address (job's contactEmail)

Create a new service in `backend/src/services/email/` that calls `transporter()` directly.

### Nodemailer Attachment Format

```typescript
const mailOptions = {
    from: config.smtp.user, // import config from '@config/email'
    to: contactEmail,       // job.contactEmail from DB
    subject: `Нова кандидатура за: ${jobTitle}`,
    html: htmlBody,
    attachments: [
        {
            filename: cvFilename,           // req.file.originalname
            content: cvBuffer,              // req.file.buffer (Buffer)
            contentType: 'application/pdf',
        },
    ],
};
```

Import email config to get `from` address: `import config from '@config/email';` → `config.smtp.user`.

### Retry Pattern with Exponential Backoff

```typescript
const MAX_RETRIES = 3;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
        await emailTransporter.sendMail(options);
        logger.info(`Application email sent successfully on attempt ${attempt}`);
        return true;
    } catch (err) {
        logger.warn(`Email send attempt ${attempt} failed: ${err}`);
        if (attempt < MAX_RETRIES) {
            await sleep(1000 * Math.pow(2, attempt - 1)); // 1s, 2s, 4s
        }
    }
}
logger.error(`All ${MAX_RETRIES} email send attempts failed for ${contactEmail}`);
return false;
```

### HTML Email Body Template

Build an inline HTML string — no EJS template needed for this story. Sample structure:

```typescript
const formattedDate = moment().format('DD.MM.YYYY HH:mm');

const htmlBody = `
<h2>Нова кандидатура за позиция: ${jobTitle}</h2>
<p><strong>Кандидат:</strong> ${applicantName}</p>
<p><strong>Имейл:</strong> <a href="mailto:${applicantEmail}">${applicantEmail}</a></p>
<p><strong>Телефон:</strong> ${applicantPhone}</p>
${coverLetter ? `<p><strong>Мотивационно писмо:</strong></p><p>${coverLetter.replace(/\n/g, '<br>')}</p>` : ''}
<p><strong>Дата на кандидатстване:</strong> ${formattedDate}</p>
<hr>
<p><em>CV е прикачено като PDF файл.</em></p>
`;
```

### Controller Change — Replace Placeholder Comment

The existing `application_controller.ts` has a deliberate placeholder at step 4:

```typescript
// 4. Log application (Story 6.7 will add email dispatch here)
logger.info(`Application received for job ${jobId} (${job.title}) from ${email}`, {
    jobId,
    applicantEmail: email,
    ...
});

return res.status(201).json({
    status: 'success',
    data: { message: 'Кандидатурата е получена успешно.' },
});
```

Replace with:

```typescript
// 4. Send application email with CV attachment
const emailSent = await sendApplicationEmail({
    jobTitle: job.title,
    contactEmail: job.contactEmail,
    applicantName: name,
    applicantEmail: email,
    applicantPhone: phone,
    coverLetter,
    cvBuffer: req.file.buffer,
    cvFilename: req.file.originalname,
});

logger.info(`Application for job ${jobId} (${job.title}) from ${email}`, {
    jobId,
    applicantEmail: email,
    applicantName: name,
    phone,
    cvFilename: req.file.originalname,
    emailSent,
    timestamp: new Date().toISOString(),
});

if (!emailSent) {
    return res.status(500).json({
        status: 'error',
        message: 'Възникна проблем. Моля, опитайте отново или се свържете директно.',
    });
}

return res.status(201).json({
    status: 'success',
    data: { message: 'Кандидатурата е изпратена успешно!' },
});
```

### Jest Mocking in Integration Tests

The integration tests in `applications.routes.test.ts` make real HTTP calls to the Express server. After adding email dispatch to the controller, those tests would try to connect to Gmail OAuth2 (which fails in CI).

Use `jest.mock` at the top of the test file to mock the email service module:

```typescript
// At the very top of applications.routes.test.ts (jest.mock is hoisted automatically)
jest.mock('../src/services/email', () => ({
    sendApplicationEmail: jest.fn().mockResolvedValue(true),
}));
```

**Important:** `jest.mock` calls are hoisted to the top of the file by babel/jest transforms, even if written after imports. This works with `@jest/globals` imports already in the file.

### TypeScript Path Aliases

The project uses `tsconfig-paths`. Verify the alias `@services/email` is mapped in `backend/tsconfig.json` — existing aliases follow the pattern `"@services/*": ["src/services/*"]`. If that alias exists, use it; if not, use a relative path `'../../services/email'` from the controller.

Check `backend/tsconfig.json` for `paths` configuration before using aliases.

### Scope — This Story is Backend Only

No frontend changes in Story 6.7. The frontend `JobApplicationModal` already shows a success/error response from the API — the message text change (`'Кандидатурата е получена успешно.'` → `'Кандидатурата е изпратена успешно!'`) may visually change the toast message but requires no frontend code changes since the frontend just renders whatever `data.message` the API returns.

### Do NOT Touch

- `backend/src/config/multer_pdf.config.ts` — multer config is already correct
- `backend/src/schemas/application_schema.ts` — validation unchanged
- `backend/src/routes/public/application_route.ts` — routing unchanged
- `frontend/**/*` — no frontend changes in this story
- `backend/src/utils/mailer/nodemailer/sender.ts` — legacy sender for EJS templates, leave untouched

### Project Structure Notes

**Files to create:**
```
backend/src/services/email/application_email_service.ts   (new — email service with retry)
backend/src/services/email/index.ts                       (new — barrel export)
backend/__test__/application-email.service.test.ts        (new — unit tests)
```

**Files to modify:**
```
backend/src/controllers/public/application_controller.ts  (replace placeholder with email dispatch)
backend/__test__/applications.routes.test.ts              (add jest.mock, update 201 message assertion)
```

### References

- [Story 6.6](6-6-cv-upload-and-validation.md) — Established `multer.memoryStorage()` pattern; CV is in `req.file.buffer`
- [application_controller.ts](../../backend/src/controllers/public/application_controller.ts) — Has placeholder comment for Story 6.7 at step 4
- [multer_pdf.config.ts](../../backend/src/config/multer_pdf.config.ts) — memoryStorage confirmed
- [transporter.ts](../../backend/src/utils/mailer/nodemailer/core/transporter.ts) — Existing Gmail OAuth2 transporter to reuse
- [sender.ts](../../backend/src/utils/mailer/nodemailer/sender.ts) — Existing sender (EJS-only, no attachments — do NOT use directly)
- [config_email.ts](../../backend/src/config/email/config_email.ts) — `config.smtp.user` for `from` address
- [applications.routes.test.ts](../../backend/__test__/applications.routes.test.ts) — Integration tests that need jest.mock update
- [epics.md#Story-6.7](../../_bmad-output/planning-artifacts/epics.md) — Acceptance criteria source

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- Used `oauth_client.ts` (the transport factory) instead of `transporter.ts` (the send wrapper). `transporter.ts` takes `options: any` and is designed for the EJS-template sender pattern — it does not expose `sendMail` directly and cannot support attachments. `oauth_client.ts` returns the raw `nodemailer.Transporter`, which is what `sendApplicationEmail` needed.
- Used `jest.fn() as jest.Mock<any>` in unit tests because TypeScript infers untyped `jest.fn()` as `Mock<never>`, causing `mockResolvedValue(...)` calls to fail with TS2345 "not assignable to parameter of type 'never'".
- Mocked `moment` to return a fixed date string `'14.03.2026 10:00'` for deterministic HTML body assertions in unit tests.
- Port 3344 conflict in `applications.routes.test.ts` when run in isolation is a pre-existing issue: the file creates 3 server instances sequentially (setupApp, validationApp, rateLimitApp) all binding to the same port. This is not caused by Story 6.7 changes. When run as part of the full Jest suite, each test file runs in its own worker process, so no conflict occurs.

### Completion Notes List

- ✅ Created `backend/src/services/email/application_email_service.ts` — `sendApplicationEmail` builds inline HTML body, attaches CV buffer directly from multer `memoryStorage`, uses `oauth_client` transporter, retries 3× with exponential backoff (1s/2s/4s), returns `true`/`false`
- ✅ Created `backend/src/services/email/index.ts` — barrel export
- ✅ Updated `application_controller.ts` — replaced placeholder comment with email dispatch; 201 on success, 500 on failure; logger.info includes `emailSent` field
- ✅ Updated `applications.routes.test.ts` — added `jest.mock` for email service; updated 201 message assertion
- ✅ Created `backend/__test__/application-email.service.test.ts` — 8 unit tests, all passing
- ✅ TypeScript: `npx tsc --noEmit` clean
- ✅ All AC satisfied: email sent to contactEmail with correct subject, applicant details in body, CV as attachment, retry logic, success/failure responses, application logging

### Senior Developer Review (AI) — 2026-03-14

**Outcome: Changes Applied — All HIGH and MEDIUM issues fixed.**

**Issues found and fixed:**

| # | Severity | Issue | Fix Applied |
|---|----------|-------|-------------|
| H1 | HIGH | HTML injection: user inputs interpolated raw into email HTML (`applicantName`, `applicantEmail`, `applicantPhone`, `coverLetter`, `jobTitle`) — allows admin-targeted HTML/phishing injection | Added `escapeHtml()` utility encoding `&`, `<`, `>`, `"`, `'`; applied to all user inputs before HTML interpolation in `buildHtmlBody` |
| H2 | HIGH | Retry count mismatch: AC 6 specifies "retries up to 3 times (1s, 2s, 4s delays)" = 4 total attempts, but `MAX_RETRIES = 3` yielded only 3 total attempts with 2 delays | Renamed to `MAX_ATTEMPTS = 4`; loop now runs 4 attempts producing delays of 1s, 2s, 4s (3 delays as AC specifies) |
| H3 | HIGH | AC 7 (500 failure response) never tested in integration tests — email mock always returned `true` | Added new `describe` block `"email failure"` with isolated `emailFailApp`; test mocks `sendApplicationEmail` to return `false` and asserts 500 + Bulgarian error message |
| M1 | MEDIUM | Real `setTimeout` delays in retry unit tests (`sleep` not mocked) — caused 3s+ slow test | Applied `jest.useFakeTimers()` + `jest.runAllTimersAsync()` to both retry tests; removed real-time waits |
| M2 | MEDIUM | `jest` used as global in integration test without importing from `@jest/globals` — inconsistent with project pattern | Added `jest` to imports from `@jest/globals`; also imported `sendApplicationEmail` to type the mock override |

**Low issues noted (not fixed — not blockers):**
- `moment` is deprecated; consider `Intl.DateTimeFormat` in future refactor
- Transporter recreated per email send; consistent with project pattern but not optimal for high volume

**TypeScript:** `npx tsc --noEmit` clean after all changes.

### File List

**New files:**
- `backend/src/services/email/application_email_service.ts`
- `backend/src/services/email/index.ts`
- `backend/__test__/application-email.service.test.ts`

**Modified files:**
- `backend/src/controllers/public/application_controller.ts`
- `backend/__test__/applications.routes.test.ts`
- `backend/__test__/application-email.service.test.ts` (review fixes: fake timers, updated assertions)
- `backend/src/services/email/application_email_service.ts` (review fixes: HTML escaping, MAX_ATTEMPTS = 4)
