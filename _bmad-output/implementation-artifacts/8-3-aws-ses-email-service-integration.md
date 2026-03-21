# Story 8.3: AWS SES Email Service Integration

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want **a centralized email service using AWS SES**,
so that **all notification emails are sent reliably**.

## Acceptance Criteria

### AC1: AWS SES Credentials Configuration

```gherkin
Given the backend needs to send emails
When the email service is configured
Then AWS SES credentials are loaded from environment variables:
  - AWS_SES_ACCESS_KEY_ID
  - AWS_SES_SECRET_ACCESS_KEY
  - AWS_SES_REGION
  - AWS_SES_FROM_EMAIL (verified sender email)
And backend/.env.example is updated to document these variables
```

### AC2: Startup Connection Verification

```gherkin
Given the email service is initialized
When the application starts
Then the service verifies AWS SES connection (e.g. GetSendQuotaCommand)
And logs success: "AWS SES connection verified" with quota details
And logs failure: "AWS SES connection failed: <error>" without crashing the app
```

### AC3: AWS SES v3 SDK Usage

```gherkin
Given an email needs to be sent
When the service sends the email
Then it uses @aws-sdk/client-ses (AWS SDK v3 modular package)
And the SendEmailCommand is used (not SES v2)
And the message supports HTML email content with inline styles
And the message includes a plain text fallback (Text.Data field)
```

### AC4: Retry with Exponential Backoff

```gherkin
Given email send fails
When the failure is detected
Then the service retries up to 3 times (4 total attempts: 1 initial + 3 retries)
And retry delays are: 1s, 2s, 4s (exponential backoff)
And after all retries fail, the error is logged with full details
And the failure is recorded in a failed_emails log entry
```

### AC5: Rate Limiting for Bulk Sends

```gherkin
Given rate limiting requirements
When sending bulk notification emails
Then emails are sent at max 14 per second (SES sandbox limit)
And a sendBulkNotifications(recipients, buildEmail) helper enforces this rate
And for individual single sends, no artificial delay is added
```

### AC6: TypeScript Template Functions

```gherkin
Given email templates
When notification emails are composed
Then templates are stored as TypeScript functions in notification_templates.ts
And each template function accepts typed parameters and returns { subject, html, text }
And all templates include an unsubscribe link in the footer using the unsubscribeToken
And templates support variable interpolation through function parameters
```

## Tasks / Subtasks

### Setup

- [x] Task 1: Install `@aws-sdk/client-ses` (AC: 3)
  - [x] From `backend/` directory, run: `npm install @aws-sdk/client-ses`
  - [x] Verify it appears in `backend/package.json` under `dependencies`
  - [x] Run `npx tsc --noEmit` to confirm no TypeScript conflicts after install

### Email Templates

- [x] Task 2: Create `backend/src/services/email/notification_templates.ts` (AC: 6)
  - [x] Define TypeScript interfaces for template parameter types:
    - [x] `NewsNotificationParams`: `{ title: string; excerpt: string; newsUrl: string; unsubscribeToken: string }`
    - [x] `EventNotificationParams`: `{ title: string; date: string; location?: string; description: string; eventUrl: string; unsubscribeToken: string }`
    - [x] `DeadlineNotificationParams`: `{ title: string; date: string; isUrgent: boolean; description: string; deadlineUrl: string; unsubscribeToken: string }`
  - [x] Implement `buildNewsNotificationEmail(params: NewsNotificationParams): EmailTemplate`:
    - [x] Subject: `"Ново в Детска Градина: ${params.title}"`
    - [x] HTML: heading (title), excerpt paragraph, "Прочетете повече" link to `newsUrl`, unsubscribe footer
    - [x] Text: plain text equivalent with the same content
  - [x] Implement `buildEventNotificationEmail(params: EventNotificationParams): EmailTemplate`:
    - [x] Subject: `"Предстоящо събитие: ${params.title}"`
    - [x] HTML: title heading, date formatted `dd.MM.yyyy`, location (if present), description, "Вижте детайлите" link, unsubscribe footer
    - [x] Text: plain text equivalent
  - [x] Implement `buildDeadlineNotificationEmail(params: DeadlineNotificationParams): EmailTemplate`:
    - [x] Subject: `"Важен срок: ${params.title}"`
    - [x] HTML: title heading, date, urgency indicator `⚠️ СПЕШНО` if `isUrgent=true`, description, "Вижте детайлите" link, unsubscribe footer
    - [x] Text: plain text equivalent
  - [x] Export `EmailTemplate` interface: `{ subject: string; html: string; text: string }`
  - [x] Unsubscribe footer pattern (use in all templates):
    ```
    const unsubscribeUrl = `${process.env.FRONTEND_URL}/unsubscribe?token=${params.unsubscribeToken}`;
    // HTML footer: <hr><p style="font-size:12px;color:#666;">За да спрете да получавате известия, <a href="${unsubscribeUrl}">натиснете тук</a>.</p>
    // Text footer: \n\n---\nЗа отписване: ${unsubscribeUrl}
    ```

### SES Service

- [x] Task 3: Create `backend/src/services/email/ses_notification_service.ts` (AC: 1, 2, 3, 4, 5)
  - [x] Import `SESClient`, `SendEmailCommand` from `@aws-sdk/client-ses`
  - [x] Import `logger` from `@utils/logger/winston/logger`
  - [x] Define `SesEmailParams` interface: `{ to: string; subject: string; html: string; text: string }`
  - [x] Initialize SES client:
    ```typescript
    const sesClient = new SESClient({
      region: process.env.AWS_SES_REGION ?? 'eu-central-1',
      credentials: {
        accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY ?? '',
      },
    });
    ```
  - [x] Implement `verifySesConnection(): Promise<void>`:
    - [x] Use `GetSendQuotaCommand` from `@aws-sdk/client-ses`
    - [x] On success: `logger.info('AWS SES connection verified', { max24HourSend, sentLast24Hours })`
    - [x] On failure: `logger.error('AWS SES connection failed', { error: err.message })` — do NOT throw (app continues)
  - [x] Implement `sendSesEmail(params: SesEmailParams): Promise<boolean>` with retry logic:
    - [x] `MAX_ATTEMPTS = 4` (1 initial + 3 retries)
    - [x] Loop attempts 1..MAX_ATTEMPTS:
      - [x] Build `SendEmailCommand` with `Source: process.env.AWS_SES_FROM_EMAIL`, `Destination.ToAddresses: [params.to]`, `Message.Subject.Data: params.subject`, `Message.Body.Html.Data: params.html`, `Message.Body.Text.Data: params.text`
      - [x] On success: `logger.info('SES email sent', { attempt, to: recipientDomain })` — log domain only (e.g. `params.to.split('@')[1]`), return `true`
      - [x] On failure (not last attempt): `logger.warn(...)`, `await sleep(1000 * Math.pow(2, attempt - 1))`
    - [x] After all attempts fail: log to failed emails (see below), return `false`
  - [x] Implement failed email recording (AC4):
    ```typescript
    // After all retries exhausted:
    logger.error('SES email delivery failed after all attempts', {
      failedEmail: true,        // tag for filtering in log aggregators
      recipientDomain: params.to.split('@')[1],
      subject: params.subject,
      attempts: MAX_ATTEMPTS,
      timestamp: new Date().toISOString(),
    });
    ```
    - [x] **Note**: No DB migration needed — failure is recorded in Winston logs with `failedEmail: true` tag; Story 8.4 can query these if needed
  - [x] Implement `sendBulkNotifications(recipients: string[], buildEmail: (to: string) => SesEmailParams): Promise<{ sent: number; failed: number }>` (AC5):
    - [x] `MAX_PER_SECOND = 14`
    - [x] Process recipients in chunks of 14, with a 1-second pause between chunks:
      ```typescript
      for (let i = 0; i < recipients.length; i += MAX_PER_SECOND) {
        const chunk = recipients.slice(i, i + MAX_PER_SECOND);
        await Promise.all(chunk.map(async (to) => {
          const ok = await sendSesEmail(buildEmail(to));
          ok ? sent++ : failed++;
        }));
        if (i + MAX_PER_SECOND < recipients.length) {
          await sleep(1000); // respect 14/sec SES sandbox rate
        }
      }
      ```
    - [x] Return `{ sent, failed }` counts
    - [x] Log summary: `logger.info('Bulk notification batch complete', { total: recipients.length, sent, failed })`

### Environment Variables

- [x] Task 4: Update `backend/.env.example` (AC: 1)
  - [x] **Replace** the existing `# EMAIL - AWS SES` block (lines 56–63) with:
    ```
    # EMAIL - AWS SES (Epic 8: Email Notification System)
    # Get these from your AWS IAM console (create a user with SES send permissions)
    # AWS region where your SES identity is verified (e.g. eu-central-1, us-east-1)
    AWS_SES_REGION='eu-central-1'
    # IAM user credentials with ses:SendEmail permission
    AWS_SES_ACCESS_KEY_ID='your-aws-access-key-id'
    AWS_SES_SECRET_ACCESS_KEY='your-aws-secret-access-key'
    # The FROM address — must be a verified identity in SES
    AWS_SES_FROM_EMAIL='noreply@your-kindergarten-domain.bg'
    ```
  - [x] Keep `KINDERGARTEN_NAME` variable below — it is still used by `confirmation_email_service.ts`
  - [x] **Do NOT remove** `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_SERVICE`, `EMAIL_OAUTH_*` variables — they are used by the existing `oauth_client.ts` (nodemailer for job applications)

### Wiring

- [x] Task 5: Call `verifySesConnection()` at application startup in `backend/src/server/app.ts` (AC: 2)
  - [x] Add import: `import { verifySesConnection } from '@services/email/ses_notification_service';`
  - [x] Call `verifySesConnection()` after the app is configured (near end of `app.ts` initialization block, NOT inside route handlers)
  - [x] Wrap in a try-catch with `logger.warn` so startup is never blocked by SES verification failure
  - [x] **Read `app.ts` before editing** to find the correct placement (after Cloudinary config or at bottom of initialization)

### Exports

- [x] Task 6: Update `backend/src/services/email/index.ts` (AC: 3, 6)
  - [x] Add exports for the new SES service:
    ```typescript
    export { sendSesEmail, sendBulkNotifications, verifySesConnection } from './ses_notification_service';
    export type { SesEmailParams } from './ses_notification_service';
    export { buildNewsNotificationEmail, buildEventNotificationEmail, buildDeadlineNotificationEmail } from './notification_templates';
    export type { EmailTemplate, NewsNotificationParams, EventNotificationParams, DeadlineNotificationParams } from './notification_templates';
    ```
  - [x] **Preserve existing exports** for `sendApplicationEmail` and `sendConfirmationEmail` — do NOT modify those lines

### Tests

- [x] Task 7: Create `backend/__test__/ses-notification-service.test.ts` (AC: 1, 3, 4, 5)
  - [x] Follow pattern of `backend/__test__/application-email.service.test.ts` exactly
  - [x] Mock `@aws-sdk/client-ses` at module level:
    ```typescript
    const mockSend = jest.fn() as jest.Mock<any>;
    jest.mock('@aws-sdk/client-ses', () => ({
      SESClient: jest.fn(() => ({ send: mockSend })),
      SendEmailCommand: jest.fn((input) => ({ input })),
      GetSendQuotaCommand: jest.fn(() => ({})),
    }));
    jest.mock('../src/utils/logger/winston/logger', () => ({
      info: jest.fn(), warn: jest.fn(), error: jest.fn(),
    }));
    ```
  - [x] Test: `sendSesEmail` returns `true` when SES send succeeds on first attempt
  - [x] Test: `sendSesEmail` sends to correct `to` address with correct `subject`
  - [x] Test: `sendSesEmail` passes both HTML and plain text body fields in the command
  - [x] Test: `sendSesEmail` retries on failure — succeeds on 2nd attempt, returns `true`, calls `logger.warn` once
  - [x] Test: `sendSesEmail` returns `false` after all 4 attempts fail; calls `logger.error` with `failedEmail: true`
  - [x] Test: `sendBulkNotifications` returns correct `{ sent, failed }` counts for mixed results
  - [x] Test: `verifySesConnection` logs success when `GetSendQuotaCommand` resolves
  - [x] Test: `verifySesConnection` logs error (without throwing) when `GetSendQuotaCommand` rejects

- [x] Task 8: Create `backend/__test__/notification-templates.test.ts` (AC: 6)
  - [x] Follow pattern of `application-email.service.test.ts` for mock setup
  - [x] Test: `buildNewsNotificationEmail` — subject contains news title, HTML contains excerpt, HTML contains unsubscribe link
  - [x] Test: `buildEventNotificationEmail` — subject contains event title, HTML contains formatted date and location
  - [x] Test: `buildDeadlineNotificationEmail` — subject contains deadline title; when `isUrgent=true` HTML contains urgency indicator
  - [x] Test: all template functions return `{ subject, html, text }` (all three fields present and non-empty)
  - [x] Test: unsubscribe link in footer uses `FRONTEND_URL` env var + `/unsubscribe?token=<token>`

## Dev Notes

### What This Story Does and Does NOT Change

**This story is backend-only. No frontend changes. No Prisma migrations.**

**Parallel email architecture after this story:**
| Service | Transport | Used For |
|---------|-----------|----------|
| `application_email_service.ts` | Nodemailer + Google OAuth2 | Job application CV delivery to admin |
| `confirmation_email_service.ts` | Nodemailer + Google OAuth2 | Job application confirmation to applicant |
| `ses_notification_service.ts` (**NEW**) | AWS SES v3 SDK | Parent subscriber notifications (Story 8.4) |

**DO NOT modify** `application_email_service.ts`, `confirmation_email_service.ts`, `oauth_client.ts`, or `config/email/`. Those remain unchanged.

### AWS SDK v3 Package

The `@aws-sdk/client-ses` package is the v3 modular SDK. It is NOT in `package.json` yet — install it first.

Key imports:
```typescript
import { SESClient, SendEmailCommand, GetSendQuotaCommand } from '@aws-sdk/client-ses';
import type { SendEmailCommandInput } from '@aws-sdk/client-ses';
```

**`SendEmailCommand` input structure:**
```typescript
const command = new SendEmailCommand({
  Source: process.env.AWS_SES_FROM_EMAIL,
  Destination: {
    ToAddresses: [to],
  },
  Message: {
    Subject: {
      Data: subject,
      Charset: 'UTF-8',
    },
    Body: {
      Html: {
        Data: html,
        Charset: 'UTF-8',
      },
      Text: {
        Data: text,
        Charset: 'UTF-8',
      },
    },
  },
});
await sesClient.send(command);
```

### Existing Retry Pattern (from application_email_service.ts)

```typescript
// Same pattern already used in the codebase — follow it exactly:
const MAX_ATTEMPTS = 4; // 1 initial + 3 retries
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  try {
    await sesClient.send(command);
    logger.info(`SES email sent successfully on attempt ${attempt}`, { ... });
    return true;
  } catch (err) {
    logger.warn(`SES email send attempt ${attempt}/${MAX_ATTEMPTS} failed: ${err}`);
    if (attempt < MAX_ATTEMPTS) {
      await sleep(1000 * Math.pow(2, attempt - 1)); // 1s, 2s, 4s
    }
  }
}
```

**Note**: `application_email_service.ts` uses `MAX_ATTEMPTS = 4` (1+3 retries). `confirmation_email_service.ts` uses `MAX_ATTEMPTS = 3` (1+2 retries). Story 8.3 AC specifies 3 retries (4 total) — follow `application_email_service.ts` pattern.

### Startup Verification in app.ts

Read `backend/src/server/app.ts` before editing. The existing file mounts routes and configures middleware. `verifySesConnection()` should be called **after** express setup, like so:

```typescript
// At the bottom of app.ts initialization (not inside route handlers):
import { verifySesConnection } from '@services/email/ses_notification_service';

// After app is configured:
verifySesConnection().catch((err) =>
  logger.warn('SES startup check skipped', { error: err.message })
);
```

Do not await it in a way that blocks server startup.

### SES Sandbox vs Production

In **sandbox mode** (default for new AWS accounts):
- Can only send to verified email addresses
- Rate limit: 1 email/sec (some sources say up to 14/sec depending on region)
- The story AC specifies 14/sec — implement this as the rate limit constant

To move to production, submit an SES "Request Production Access" form in AWS Console. The implementation works the same in both modes; only quota changes.

### Failed Email Logging

No `failed_emails` DB table is created in this story. The AC requires the failure to be "recorded in a failed_emails log/table". Implementation: log with a `failedEmail: true` field using Winston, which writes to the daily rotate log file. Example:

```typescript
logger.error('SES email delivery failed after all attempts', {
  failedEmail: true,
  recipientDomain: to.split('@')[1], // PII-safe: domain only, not full email
  subject: subject,
  attempts: MAX_ATTEMPTS,
  timestamp: new Date().toISOString(),
});
```

This approach:
- Satisfies the AC (failure is recorded)
- Avoids a new Prisma migration
- Is searchable via log aggregation (`grep failedEmail`)
- Protects PII (logs domain, not full email address)

Story 8.4 can extend this to a DB table if needed.

### Module Path Aliases

The backend uses TypeScript path aliases. Use:
- `@services/email/ses_notification_service` (maps to `src/services/email/ses_notification_service`)
- `@utils/logger/winston/logger` (maps to `src/utils/logger/winston/logger`)

Check `backend/tsconfig.json` `paths` section to confirm alias mappings before using them.

### Test Pattern Reference

Follow `backend/__test__/application-email.service.test.ts` exactly:
1. `jest.fn()` mock for the send function — declared before jest.mock calls
2. `jest.mock('@aws-sdk/client-ses', ...)` at module level — mocks SESClient constructor and commands
3. `jest.mock('../src/utils/logger/winston/logger', ...)` — mock logger
4. `beforeEach(() => { jest.clearAllMocks(); })` — reset between tests
5. For retry tests: use `jest.useFakeTimers()` + `jest.runAllTimersAsync()` to fast-forward delays
6. Restore with `jest.useRealTimers()` after retry tests

**Import path** in test files: `'../src/services/email/ses_notification_service'` (relative to `__test__/`).

### Story 8.2 Learnings (Direct Previous Story)

From `8-2-parent-subscription-management-api.md` completion notes:
- **Rate limiter singleton warning**: `express-rate-limit` instances are module-level singletons in Jest — be aware when writing SES tests that mock module state doesn't leak between tests
- **`jest.mock` hoisting**: `jest.config.ts` has `transform: {}` which disables ts-jest transforms. This means `jest.mock` must be declared at the very top of the test file BEFORE any imports. Follow `application-email.service.test.ts` exactly for mock declaration order
- **TypeScript check**: Run `npx tsc --noEmit` at the end to confirm no type errors
- **No middleware changes**: This story does not touch `xss.ts`, `rate_limiter.ts`, or any public/admin routes

### Story 8.1 Learnings

From `8-1-email-subscriber-model.md`:
- **Test file location**: `backend/__test__/` (double underscore, NOT `__tests__`) — confirmed backend test directory
- **Logger import in tests**: `'../src/utils/logger/winston/logger'` (with `src/` segment)
- **Controller/service import path**: uses `@utils/logger/winston/logger` path alias

### Key File Paths

| File | Action | Notes |
|------|--------|-------|
| `backend/src/services/email/ses_notification_service.ts` | **NEW** | AWS SES client, sendSesEmail, sendBulkNotifications, verifySesConnection |
| `backend/src/services/email/notification_templates.ts` | **NEW** | TypeScript template functions for news/event/deadline notifications |
| `backend/src/services/email/index.ts` | **MODIFY** | Add exports for new SES service and templates |
| `backend/src/server/app.ts` | **MODIFY** | Call verifySesConnection() at startup |
| `backend/.env.example` | **MODIFY** | Replace old EMAIL_* block with AWS_SES_* variables |
| `backend/__test__/ses-notification-service.test.ts` | **NEW** | Unit tests for SES service with mocked SDK |
| `backend/__test__/notification-templates.test.ts` | **NEW** | Unit tests for template functions |
| `backend/package.json` | **MODIFY** | Add @aws-sdk/client-ses dependency |
| **REFERENCE** `backend/__test__/application-email.service.test.ts` | Read only | Jest mock pattern with fake timers for retry tests |
| **REFERENCE** `backend/src/services/email/application_email_service.ts` | Read only | Retry loop pattern to mirror exactly |
| **REFERENCE** `backend/src/server/app.ts` | Read only | Startup wiring placement |

### Project Structure Notes

- No new directories needed — new files go into existing `backend/src/services/email/` and `backend/__test__/`
- No Prisma migration — `email_subscribers` table is already live from Story 8.1
- No frontend changes
- No new admin/public routes
- Existing nodemailer email services are completely unaffected

### Forward Context: Story 8.4

Story 8.4 (Publish Trigger Notifications) will:
1. Import `sendBulkNotifications` from `@services/email/ses_notification_service`
2. Import `buildNewsNotificationEmail`, `buildEventNotificationEmail`, `buildDeadlineNotificationEmail` from `@services/email/notification_templates`
3. Query `prisma.emailSubscriber.findMany({ where: { isActive: true, subscriptionTypes: { has: contentType } } })` to get recipients
4. Call `sendBulkNotifications(emails, (to) => buildNewsNotificationEmail({ ..., unsubscribeToken }))` when content is published

The interface and function signatures created in this story must align with Story 8.4's usage pattern.

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 8, Story 8.3] — Acceptance criteria and specifications
- [Source: _bmad-output/planning-artifacts/architecture.md — Email Notifications section] — AWS SES as designated email provider; `backend/src/services/email.service.ts` location reference; env var names; error handling requirements
- [Source: backend/src/services/email/application_email_service.ts] — Retry loop pattern (MAX_ATTEMPTS=4, exponential backoff, sleep function) to follow exactly
- [Source: backend/__test__/application-email.service.test.ts] — Jest mock structure for email service tests; fake timer usage pattern
- [Source: _bmad-output/implementation-artifacts/8-1-email-subscriber-model.md#Forward Context] — Confirms AWS SES var names and `.env.example` update scope
- [Source: _bmad-output/implementation-artifacts/8-2-parent-subscription-management-api.md#Debug Log] — jest.mock hoisting limitation (transform: {} in jest.config), logger import path, test file location convention
- [Source: backend/package.json] — `@aws-sdk/client-ses` NOT present; `nodemailer` and `googleapis` present for existing services

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- **Timer mock approach**: `jest.runAllTimersAsync()` is not available on the `jest` object from `@jest/globals` in this project (same issue exists in reference test `application-email.service.test.ts`). Solved by using `jest.spyOn(global, 'setTimeout').mockImplementation((fn) => { fn(); return null; })` to make retry delays instant. Uses `ReturnType<typeof jest.spyOn>` for type-safe spy reference.
- **Self-referencing import**: Initial draft of `ses_notification_service.ts` accidentally imported its own type — removed the circular import immediately.

### Completion Notes List

- Installed `@aws-sdk/client-ses@^3.1013.0` in `backend/`
- Created `ses_notification_service.ts` with AWS SES v3 SDK: `SESClient`, `SendEmailCommand`, `GetSendQuotaCommand`, `MAX_ATTEMPTS=4`, exponential backoff retry (1s/2s/4s), `MAX_PER_SECOND=14` bulk rate limiting, PII-safe domain-only logging
- Created `notification_templates.ts` with 3 typed template builder functions for news/event/deadline notifications — all include Bulgarian text, unsubscribe footer using `FRONTEND_URL` env var
- Updated `backend/.env.example`: added `AWS_SES_*` block, kept existing `EMAIL_*` nodemailer variables
- Wired `verifySesConnection()` in `app.ts` with non-blocking `.catch()` — startup never blocked by SES failure
- Added 8 new exports to `services/email/index.ts`, preserving existing nodemailer exports
- 21 new unit tests passing (13 template tests, 8 SES service tests)

### File List

- `backend/src/services/email/ses_notification_service.ts` — NEW
- `backend/src/services/email/notification_templates.ts` — NEW
- `backend/src/services/email/index.ts` — MODIFIED (added SES + template exports)
- `backend/src/server/app.ts` — MODIFIED (import logger + verifySesConnection, call at startup)
- `backend/.env.example` — MODIFIED (added AWS_SES_* block, relabeled EMAIL_* block)
- `backend/__test__/ses-notification-service.test.ts` — NEW (updated in review: added empty-recipients edge case test)
- `backend/__test__/notification-templates.test.ts` — NEW
- `backend/package.json` — MODIFIED (@aws-sdk/client-ses added)
- `backend/package-lock.json` — MODIFIED (lockfile updated)

### Senior Developer Review (AI)

**Reviewer:** AI Code Review | **Date:** 2026-03-20 | **Outcome:** Approved with fixes applied

**Issues Fixed (6):**

- [H1-FIXED] **XSS vulnerability in notification_templates.ts** — Added `escapeHtml()` function (mirrors pattern from `application_email_service.ts`). All user-supplied parameters (title, excerpt, description, location, URLs) now escaped before HTML template injection. Unsubscribe token in URLs now also `encodeURIComponent`-encoded. [`notification_templates.ts:32-46`]
- [H2-FIXED] **Race condition in sendBulkNotifications counter increment** — Replaced mutable `sent++`/`failed++` inside concurrent `Promise.all` with collect-then-count pattern using `results.filter(Boolean).length`. [`ses_notification_service.ts:99-103`]
- [H3-FIXED] **Null dereference on malformed email (missing `@`)** — Added `?? 'unknown'` fallback for `recipientDomain`. [`ses_notification_service.ts:39`]
- [M1-FIXED] **`process.env.FRONTEND_URL` undefined → broken unsubscribe links** — Added `?? 'http://localhost:5173'` fallback in both footer builders. [`notification_templates.ts:49,55`]
- [M2-FIXED] **`err: any` in verifySesConnection catch clause** — Changed to `err: unknown` with `instanceof Error` narrowing. [`ses_notification_service.ts:32-35`]
- [M3-FIXED] **Missing edge case test: empty recipients array** — Added test asserting `{ sent: 0, failed: 0 }` and no SES calls. [`ses-notification-service.test.ts`]

**Not Fixed (Low — acceptable):**
- [L1] Dangling `verifySesConnection()` promise in `app.ts` at startup — intentional design per story spec; the `.catch` prevents crashes.
- [L2] Unnecessary logger mock in `notification-templates.test.ts` — harmless dead code, not worth the churn.

**Test Result:** 22/22 passing after fixes (was 21/21 before).

### Change Log

- 2026-03-20: Implemented Story 8.3 — AWS SES email service integration. Added SES client with retry/backoff, notification template functions, startup connection verification, and full unit test coverage (21 tests).
- 2026-03-20: Code review — Fixed XSS vulnerability (HTML escaping), race condition in bulk counter, null-safety on domain extraction, FRONTEND_URL fallback, `err: any` type unsafe narrowing, empty-recipients edge case test. 22 tests passing.
