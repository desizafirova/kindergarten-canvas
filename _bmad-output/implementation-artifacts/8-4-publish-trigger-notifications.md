# Story 8.4: Publish Trigger Notifications

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **parent subscriber**,
I want **to receive email notifications when new content is published**,
so that **I stay informed about kindergarten news, events, and deadlines**.

## Acceptance Criteria

### AC1: News Publish Triggers Notification

```gherkin
Given a news item is published (status changes to PUBLISHED for the first time)
When the publish action completes successfully
Then the system triggers notification to all active subscribers with subscriptionType 'NEWS'
And emails are queued asynchronously (publish response is NOT blocked)
```

### AC2: Event Publish Triggers Notification

```gherkin
Given an event is published (status changes to PUBLISHED for the first time)
When the publish action completes successfully
Then the system triggers notification to all active subscribers with subscriptionType 'EVENTS'
And emails are sent asynchronously
```

### AC3: Deadline Publish Triggers Notification

```gherkin
Given a deadline is published (status changes to PUBLISHED for the first time)
When the publish action completes successfully
Then the system triggers notification to all active subscribers with subscriptionType 'DEADLINES'
And emails are sent asynchronously
```

### AC4: News Email Content

```gherkin
Given the notification email for news is composed
When it is sent to a subscriber
Then the subject is: "Ново в Детска Градина: [News Title]"
And the body includes:
  - News title as heading
  - First 200 characters of content (HTML stripped) as excerpt
  - "Прочетете повече" link to ${FRONTEND_URL}/news/${id}
  - Unsubscribe link in footer (using subscriber's unsubscribeToken)
```

### AC5: Event Email Content

```gherkin
Given the notification email for an event is composed
When it is sent to a subscriber
Then the subject is: "Предстоящо събитие: [Event Title]"
And the body includes:
  - Event title and date formatted as dd.MM.yyyy
  - Location (if present)
  - Description excerpt
  - "Вижте детайлите" link to ${FRONTEND_URL}/events/${id}
  - Unsubscribe link in footer
```

### AC6: Deadline Email Content

```gherkin
Given the notification email for a deadline is composed
When it is sent to a subscriber
Then the subject is: "Важен срок: [Deadline Title]"
And the body includes:
  - Deadline title and date formatted as dd.MM.yyyy
  - Visual urgency indicator "⚠️ СПЕШНО" if isUrgent=true
  - Description excerpt
  - "Вижте детайлите" link to ${FRONTEND_URL}/deadlines/${id}
  - Unsubscribe link in footer
```

### AC7: Only First Publish Triggers Notification

```gherkin
Given an item is already published (publishedAt is NOT null)
When it is updated (even with status=PUBLISHED)
Then NO notification is sent

Given a draft is saved
When the save completes (status remains DRAFT)
Then NO notification is sent
```

### AC8: Delivery Tracking Logging

```gherkin
Given notifications are sent after a publish
When the bulk send completes
Then the system logs: contentType, contentId, subscriberCount, sentCount, failedCount, timestamp
```

### AC9: Zero Subscribers Handling

```gherkin
Given no active subscribers exist for the content type
When a publish triggers a notification check
Then no emails are sent
And an info log is written: "Publish notification skipped: no <TYPE> subscribers"
```

## Tasks / Subtasks

### Task 1: Create `backend/src/services/email/publish_notification_service.ts` (AC: 1,2,3,4,5,6,7,8,9)

- [x] Import Prisma client: `import prisma from '../../../prisma/prisma-client';`
- [x] Import email functions from sibling modules (NOT from index.ts to avoid circular imports):
  ```typescript
  import { sendBulkNotifications } from './ses_notification_service';
  import {
    buildNewsNotificationEmail,
    buildEventNotificationEmail,
    buildDeadlineNotificationEmail,
  } from './notification_templates';
  import type { SesEmailParams } from './ses_notification_service';
  import logger from '@utils/logger/winston/logger';
  ```
- [x] Implement `formatDateBg(date: Date): string` helper — no external lib needed:
  ```typescript
  const formatDateBg = (date: Date): string => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${d}.${m}.${date.getFullYear()}`;
  };
  ```
- [x] Implement `makeExcerpt(html: string, maxLen = 200): string` helper:
  ```typescript
  const makeExcerpt = (html: string, maxLen = 200): string => {
    const plain = html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
    return plain.length > maxLen ? plain.substring(0, maxLen) + '...' : plain;
  };
  ```
- [x] Implement private `getActiveSubscribers(subscriptionType: string)`:
  ```typescript
  const getActiveSubscribers = async (subscriptionType: string) =>
    prisma.emailSubscriber.findMany({
      where: { isActive: true, subscriptionTypes: { has: subscriptionType } },
      select: { email: true, unsubscribeToken: true },
    });
  ```
- [x] Implement `notifyNewsPublished(news: { id: number; title: string; content: string }): Promise<void>`:
  - [x] Get `baseUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173'`
  - [x] Call `getActiveSubscribers('NEWS')`
  - [x] If `subscriberCount === 0` → log info and return early (AC9)
  - [x] Build `newsUrl = \`${baseUrl}/news/${news.id}\``
  - [x] Build `excerpt = makeExcerpt(news.content)` (strip HTML, max 200 chars)
  - [x] Build a `tokenMap = new Map<string, string>()` from `subscribers` mapping `email → unsubscribeToken` for O(1) lookup
  - [x] Call `sendBulkNotifications(subscribers.map(s => s.email), (to) => buildNewsNotificationEmail({ title: news.title, excerpt, newsUrl, unsubscribeToken: tokenMap.get(to) ?? '' }))`
  - [x] Log delivery stats (AC8):
    ```typescript
    logger.info('Publish notification sent', {
      contentType: 'NEWS',
      contentId: news.id,
      subscriberCount,
      sentCount: result.sent,
      failedCount: result.failed,
      timestamp: new Date().toISOString(),
    });
    ```
- [x] Implement `notifyEventPublished(event: { id: number; title: string; eventDate: Date; location?: string | null; description?: string | null }): Promise<void>`:
  - [x] Get `getActiveSubscribers('EVENTS')`
  - [x] If `subscriberCount === 0` → log info and return (AC9)
  - [x] Build `eventUrl = \`${baseUrl}/events/${event.id}\``
  - [x] Build `date = formatDateBg(event.eventDate)` (dd.MM.yyyy)
  - [x] Build `description = makeExcerpt(event.description ?? '', 200)`
  - [x] Build `tokenMap` from subscribers
  - [x] Call `sendBulkNotifications(emails, (to) => buildEventNotificationEmail({ title, date, location: event.location ?? undefined, description, eventUrl, unsubscribeToken: tokenMap.get(to) ?? '' }))`
  - [x] Log delivery stats with `contentType: 'EVENTS'`
- [x] Implement `notifyDeadlinePublished(deadline: { id: number; title: string; deadlineDate: Date; isUrgent: boolean; description?: string | null }): Promise<void>`:
  - [x] Get `getActiveSubscribers('DEADLINES')`
  - [x] If `subscriberCount === 0` → log info and return (AC9)
  - [x] Build `deadlineUrl = \`${baseUrl}/deadlines/${deadline.id}\``
  - [x] Build `date = formatDateBg(deadline.deadlineDate)`
  - [x] Build `description = makeExcerpt(deadline.description ?? '', 200)`
  - [x] Build `tokenMap`
  - [x] Call `sendBulkNotifications(emails, (to) => buildDeadlineNotificationEmail({ title, date, isUrgent: deadline.isUrgent, description, deadlineUrl, unsubscribeToken: tokenMap.get(to) ?? '' }))`
  - [x] Log delivery stats with `contentType: 'DEADLINES'`
- [x] Export all three functions

### Task 2: Update `backend/src/services/email/index.ts` (AC: 1,2,3)

- [x] Add exports for new notification functions:
  ```typescript
  export { notifyNewsPublished, notifyEventPublished, notifyDeadlinePublished } from './publish_notification_service';
  ```
- [x] **Preserve ALL existing exports** — do NOT modify any other lines

### Task 3: Modify `backend/src/services/admin/news/news_update_service.ts` (AC: 1,7)

- [x] **Read the file first** to understand current structure before editing
- [x] Add import at top: `import newsGetOneDAO from '@dao/news/news_get_one_dao';`
- [x] Add import for notification: `import { notifyNewsPublished } from '@services/email';`
- [x] Add import for logger: `import logger from '@utils/logger/winston/logger';`
- [x] Before calling `updateNews(id, newsData, select)`, pre-fetch the existing record:
  ```typescript
  const existing = await newsGetOneDAO(id, { id: true, publishedAt: true, status: true });
  const isFirstPublish =
    newsData.status === 'PUBLISHED' &&
    (existing.data as any)?.publishedAt === null;
  ```
  - [x] Note: if `existing.data` is null (not found), still proceed to update (the existing behavior). Do NOT add a 404 check — that would be a behaviour change out of scope.
- [x] After `if (!newsItem.success || !newsItem.data)` check, before the return, add the fire-and-forget:
  ```typescript
  if (isFirstPublish && newsItem.data) {
    const item = newsItem.data as any;
    notifyNewsPublished({ id: item.id, title: item.title, content: item.content }).catch(
      (err: unknown) =>
        logger.error('News publish notification error', {
          error: err instanceof Error ? err.message : String(err),
        }),
    );
  }
  ```
- [x] Verify: the `catch` ensures notification errors do NOT propagate and block the HTTP response (AC1)

### Task 4: Modify `backend/src/services/admin/event/event_update_service.ts` (AC: 2,7)

- [x] **Read the file first** before editing
- [x] Add import for notification: `import { notifyEventPublished } from '@services/email';`
- [x] Add import for logger: `import logger from '@utils/logger/winston/logger';`
- [x] Modify the existing fetch to also include `publishedAt`:
  ```typescript
  // Change from:
  const existing = await eventGetOneDAO(id, { id: true });
  // To:
  const existing = await eventGetOneDAO(id, { id: true, publishedAt: true });
  ```
- [x] Fix the `publishedAt` auto-set logic so it only triggers on FIRST publish (currently overwrites on every publish to PUBLISHED):
  ```typescript
  // Change from:
  if (eventData.status === 'PUBLISHED') updateData.publishedAt = new Date();
  // To:
  if (eventData.status === 'PUBLISHED' && !(existing.data as any)?.publishedAt) {
    updateData.publishedAt = new Date();
  }
  ```
  - [x] Note: The fix to `publishedAt` logic also has the side effect of correctly preventing repeat `publishedAt` overwrite. This is a correctness fix aligned with "only first publish" semantics.
- [x] Detect first publish BEFORE the update:
  ```typescript
  const isFirstPublish =
    eventData.status === 'PUBLISHED' &&
    !(existing.data as any)?.publishedAt;
  ```
- [x] After `return httpMsg.http200(result.data)` → BEFORE the return, add fire-and-forget:
  ```typescript
  if (isFirstPublish) {
    const item = result.data as any;
    notifyEventPublished({
      id: item.id,
      title: item.title,
      eventDate: item.eventDate,
      location: item.location,
      description: item.description,
    }).catch((err: unknown) =>
      logger.error('Event publish notification error', {
        error: err instanceof Error ? err.message : String(err),
      }),
    );
  }
  ```

### Task 5: Modify `backend/src/services/admin/deadline/deadline_update_service.ts` (AC: 3,7)

- [x] **Read the file first** before editing
- [x] Add import for notification: `import { notifyDeadlinePublished } from '@services/email';`
- [x] Add import for logger (if not already present): `import logger from '@utils/logger/winston/logger';`
- [x] Detect first publish BEFORE the update (existing `publishedAt` logic already correctly checks `!existing.data.publishedAt`):
  ```typescript
  const isFirstPublish = deadlineData.status === 'PUBLISHED' && !existing.data.publishedAt;
  ```
- [x] After the successful update (`return httpMsg.http200(result.data)`), add fire-and-forget BEFORE the return:
  ```typescript
  if (isFirstPublish) {
    const item = result.data as any;
    notifyDeadlinePublished({
      id: item.id,
      title: item.title,
      deadlineDate: item.deadlineDate,
      isUrgent: item.isUrgent,
      description: item.description,
    }).catch((err: unknown) =>
      logger.error('Deadline publish notification error', {
        error: err instanceof Error ? err.message : String(err),
      }),
    );
  }
  ```

### Task 6: Create `backend/__test__/publish-notification.service.test.ts` (AC: 1,2,3,7,8,9)

- [x] **Follow exact mock pattern from `ses-notification-service.test.ts`** — declare variables and jest.mock calls BEFORE imports
- [x] Set up mocks:
  ```typescript
  const mockSendBulkNotifications = jest.fn() as jest.Mock<any>;
  const mockBuildNewsNotificationEmail = jest.fn() as jest.Mock<any>;
  const mockBuildEventNotificationEmail = jest.fn() as jest.Mock<any>;
  const mockBuildDeadlineNotificationEmail = jest.fn() as jest.Mock<any>;
  const mockFindMany = jest.fn() as jest.Mock<any>;

  jest.mock('../src/services/email/ses_notification_service', () => ({
    sendBulkNotifications: mockSendBulkNotifications,
  }));
  jest.mock('../src/services/email/notification_templates', () => ({
    buildNewsNotificationEmail: mockBuildNewsNotificationEmail,
    buildEventNotificationEmail: mockBuildEventNotificationEmail,
    buildDeadlineNotificationEmail: mockBuildDeadlineNotificationEmail,
  }));
  jest.mock('../src/prisma/prisma-client', () => ({
    default: { emailSubscriber: { findMany: mockFindMany } },
  }));
  jest.mock('../src/utils/logger/winston/logger', () => ({
    info: jest.fn(), warn: jest.fn(), error: jest.fn(),
  }));

  import { notifyNewsPublished, notifyEventPublished, notifyDeadlinePublished } from '../src/services/email/publish_notification_service';
  import logger from '../src/utils/logger/winston/logger';
  ```
- [x] `beforeEach(() => { jest.clearAllMocks(); })` to reset between tests
- [x] **Test: `notifyNewsPublished` — queries correct subscriber type**
  - Setup: `mockFindMany.mockResolvedValue([{ email: 'a@x.com', unsubscribeToken: 'tok1' }])`
  - Call `notifyNewsPublished({ id: 1, title: 'Test', content: '<p>Hello</p>' })`
  - Assert: `mockFindMany` called with `where: { isActive: true, subscriptionTypes: { has: 'NEWS' } }`
- [x] **Test: `notifyNewsPublished` — calls sendBulkNotifications with correct emails**
  - Setup: `mockFindMany.mockResolvedValue([{ email: 'sub@a.com', unsubscribeToken: 'tkn' }])`
  - Setup: `mockSendBulkNotifications.mockResolvedValue({ sent: 1, failed: 0 })`
  - Setup: `mockBuildNewsNotificationEmail.mockReturnValue({ subject: 'S', html: 'H', text: 'T' })`
  - Call `await notifyNewsPublished({ id: 5, title: 'Hello', content: '<b>World</b>' })`
  - Assert: `mockSendBulkNotifications` called with `['sub@a.com', expect.any(Function)]`
- [x] **Test: `notifyNewsPublished` — HTML is stripped for excerpt**
  - Setup: 1 subscriber, `mockSendBulkNotifications.mockResolvedValue({ sent: 1, failed: 0 })`
  - Call with `content: '<p><b>Hello</b> World</p>'`
  - Capture the `buildEmail` callback from `mockSendBulkNotifications.mock.calls[0][1]`
  - Call the callback with `'sub@test.com'`
  - Assert: `mockBuildNewsNotificationEmail` called with `expect.objectContaining({ excerpt: 'Hello World' })`
- [x] **Test: `notifyNewsPublished` — logs delivery stats**
  - Setup: `mockFindMany.mockResolvedValue([{ email: 'x@y.com', unsubscribeToken: 'tok' }])`; `mockSendBulkNotifications.mockResolvedValue({ sent: 1, failed: 0 })`
  - Call `await notifyNewsPublished({ id: 3, title: 'T', content: 'C' })`
  - Assert: `logger.info` called with `'Publish notification sent'` and `expect.objectContaining({ contentType: 'NEWS', contentId: 3, subscriberCount: 1, sentCount: 1, failedCount: 0 })`
- [x] **Test: `notifyNewsPublished` — skips when no subscribers (AC9)**
  - Setup: `mockFindMany.mockResolvedValue([])`
  - Call `await notifyNewsPublished({ id: 1, title: 'T', content: 'C' })`
  - Assert: `mockSendBulkNotifications` NOT called
  - Assert: `logger.info` called with message containing 'skipped'
- [x] **Test: `notifyEventPublished` — queries 'EVENTS' subscription type**
  - Setup: `mockFindMany.mockResolvedValue([{ email: 'e@v.com', unsubscribeToken: 'etok' }])`; `mockSendBulkNotifications.mockResolvedValue({ sent: 1, failed: 0 })`
  - Call `await notifyEventPublished({ id: 2, title: 'Fest', eventDate: new Date('2026-05-01'), location: 'Sofia', description: 'Fun event' })`
  - Assert: `mockFindMany` called with `where: { isActive: true, subscriptionTypes: { has: 'EVENTS' } }`
- [x] **Test: `notifyEventPublished` — formats date as dd.MM.yyyy**
  - Setup: 1 subscriber, sendBulkNotifications mocked
  - Call with `eventDate: new Date('2026-05-01T00:00:00')`
  - Capture `buildEmail` callback, call it with subscriber email
  - Assert: `mockBuildEventNotificationEmail` called with `expect.objectContaining({ date: '01.05.2026' })`
- [x] **Test: `notifyDeadlinePublished` — queries 'DEADLINES' subscription type**
  - Similar pattern to event test; assert `subscriptionTypes: { has: 'DEADLINES' }`
- [x] **Test: `notifyDeadlinePublished` — includes isUrgent flag**
  - Call with `isUrgent: true`
  - Assert: template builder called with `expect.objectContaining({ isUrgent: true })`

## Dev Notes

### Architecture: Where Notification Hooks Into Existing Code

**NO new routes, controllers, or Prisma migrations.** All changes are in the service layer.

The notification trigger hooks into the three existing admin update services at the service layer (not controller layer), keeping concerns separated:

```
Admin PUT /news/:id → news_controller → news_update_service (MODIFIED) → newsUpdateDAO
                                              ↓ (fire-and-forget after successful update)
                                       publish_notification_service.notifyNewsPublished()
                                              ↓
                                       Prisma: emailSubscriber.findMany(...)
                                              ↓
                                       sendBulkNotifications() [from ses_notification_service]
                                              ↓
                                       buildNewsNotificationEmail() × N subscribers
                                              ↓
                                       AWS SES → subscriber email addresses
```

### Fire-and-Forget Pattern (Critical for AC1)

The notification must NOT block the HTTP response. Use `.catch()` to prevent unhandled rejections:

```typescript
// Correct: fire-and-forget
notifyNewsPublished({ id, title, content }).catch((err: unknown) =>
  logger.error('News publish notification error', {
    error: err instanceof Error ? err.message : String(err),
  }),
);
return httpMsg.http200(newsItem.data);
```

**DO NOT `await`** the notification function in the update services.

### First-Publish Detection Logic

The "only first publish" requirement (AC7) is implemented by checking `publishedAt` BEFORE the update:

| Service | Pre-fetch for publishedAt? | First-publish detection |
|---------|--------------------------|------------------------|
| `news_update_service.ts` | **NEW**: add pre-fetch via `newsGetOneDAO` | `status === 'PUBLISHED' && existing.publishedAt === null` |
| `event_update_service.ts` | **MODIFY**: add `publishedAt` to existing select | `status === 'PUBLISHED' && !existing.publishedAt` |
| `deadline_update_service.ts` | Already pre-fetches with publishedAt | Already checks `!existing.data.publishedAt` — just add trigger |

**Event service fix**: The current `event_update_service.ts` sets `publishedAt = new Date()` every time `status === 'PUBLISHED'` (even if already published). This bug is fixed in this story: only set `publishedAt` on first publish. This aligns with the deadline service behavior.

### Notification Service: Key Implementation Details

**Prisma query for subscribers** (confirmed working from Story 8.1 tests):
```typescript
prisma.emailSubscriber.findMany({
  where: { isActive: true, subscriptionTypes: { has: 'NEWS' } },
  select: { email: true, unsubscribeToken: true },
})
```
The `has` operator works with PostgreSQL arrays in Prisma.

**Token map for O(1) per-recipient lookup:**
```typescript
const tokenMap = new Map(subscribers.map(s => [s.email, s.unsubscribeToken]));
// Usage in sendBulkNotifications callback:
(to) => buildNewsNotificationEmail({
  title: news.title,
  excerpt,
  newsUrl,
  unsubscribeToken: tokenMap.get(to) ?? '',
})
```
This avoids O(n²) `subscribers.find()` inside the bulk send loop.

**Imports in publish_notification_service.ts** — import from sibling files directly, NOT from `@services/email` index, to avoid circular dependency:
```typescript
import { sendBulkNotifications } from './ses_notification_service';
import { buildNewsNotificationEmail, ... } from './notification_templates';
```

### Date Formatting — No External Package Needed

`date-fns` is NOT in `backend/package.json`. Use the inline helper:
```typescript
const formatDateBg = (date: Date): string => {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${d}.${m}.${date.getFullYear()}`;
};
```

### HTML Stripping for News Excerpt

News `content` field contains TipTap-generated HTML (from Story 3.5). Strip HTML with:
```typescript
const makeExcerpt = (html: string, maxLen = 200): string => {
  const plain = html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
  return plain.length > maxLen ? plain.substring(0, maxLen) + '...' : plain;
};
```
This handles `&amp;`, `&lt;`, etc. by converting them to spaces.

### Public URL Patterns

Based on existing frontend routes (confirmed from previous stories):
| Content Type | URL Pattern |
|---|---|
| News | `${FRONTEND_URL}/news/${id}` |
| Event | `${FRONTEND_URL}/events/${id}` |
| Deadline | `${FRONTEND_URL}/deadlines/${id}` |

`FRONTEND_URL` is in `.env.example` as `http://localhost:5173` and must be set in production.

### Email Templates (Already Built in Story 8.3)

The templates are ready in `backend/src/services/email/notification_templates.ts`. Do NOT recreate them. Key interfaces:
```typescript
// NewsNotificationParams: { title, excerpt, newsUrl, unsubscribeToken }
// EventNotificationParams: { title, date, location?, description, eventUrl, unsubscribeToken }
// DeadlineNotificationParams: { title, date, isUrgent, description, deadlineUrl, unsubscribeToken }
```

### Test Pattern: Mock Declaration Order (Critical)

From Story 8.3 debug notes: `jest.config.ts` has `transform: {}`. Variables and `jest.mock` calls must be declared BEFORE any `import` statements. Jest hoists `jest.mock` but the variable declarations must appear before the hoisted mock factories execute.

**Correct order:**
```typescript
// 1. Variable declarations
const mockSendBulkNotifications = jest.fn() as jest.Mock<any>;
// ...

// 2. jest.mock calls (hoisted by Jest before imports)
jest.mock('../src/services/email/ses_notification_service', () => ({
  sendBulkNotifications: mockSendBulkNotifications,
}));
// ...

// 3. Imports (after mock setup)
import { notifyNewsPublished } from '../src/services/email/publish_notification_service';
```

**Prisma mock path** in test files: `'../src/prisma/prisma-client'`
This must match the path that the `publish_notification_service.ts` resolves to when Jest runs from `backend/`.

**Logger mock path**: `'../src/utils/logger/winston/logger'`

### Module Path Aliases Used

From `backend/tsconfig.json`:
- `@dao/news/news_get_one_dao` → `src/dao/news/news_get_one_dao`
- `@services/email` → `src/services/email/index.ts`
- `@utils/logger/winston/logger` → `src/utils/logger/winston/logger`

### Key Files Overview

| File | Action | Notes |
|------|--------|-------|
| `backend/src/services/email/publish_notification_service.ts` | **NEW** | Core notification service: query subscribers, call sendBulkNotifications, log stats |
| `backend/src/services/email/index.ts` | **MODIFY** | Add exports for 3 new notification functions |
| `backend/src/services/admin/news/news_update_service.ts` | **MODIFY** | Add pre-fetch, detect first publish, fire-and-forget notification |
| `backend/src/services/admin/event/event_update_service.ts` | **MODIFY** | Add `publishedAt` to fetch select, fix publishedAt logic, fire-and-forget |
| `backend/src/services/admin/deadline/deadline_update_service.ts` | **MODIFY** | Add fire-and-forget notification (publishedAt logic already correct) |
| `backend/__test__/publish-notification.service.test.ts` | **NEW** | Unit tests with mocked Prisma, SES, templates |
| **REFERENCE** `backend/src/services/email/ses_notification_service.ts` | Read only | `sendBulkNotifications` interface |
| **REFERENCE** `backend/src/services/email/notification_templates.ts` | Read only | Template builder interfaces |
| **REFERENCE** `backend/__test__/ses-notification-service.test.ts` | Read only | Mock pattern to follow exactly |
| **REFERENCE** `backend/src/services/admin/deadline/deadline_update_service.ts` | Read only | `publishedAt` first-publish pattern to mirror |

### Project Structure Notes

- No new directories needed
- No Prisma migrations — `email_subscribers` table is live from Story 8.1
- No frontend changes
- No new routes or controllers
- The `ses_notification_service.ts` and `notification_templates.ts` created in Story 8.3 are used as-is — DO NOT modify them
- The existing nodemailer services (`application_email_service.ts`, `confirmation_email_service.ts`) are completely unaffected

### Story 8.3 Learnings (Direct Previous Story)

From Story 8.3 completion notes and debug log:
- **Import from sibling files in publish_notification_service.ts**: Use relative imports (`./ses_notification_service`) not `@services/email` to avoid circular dependencies since `index.ts` will export this new service
- **Rate limit**: `sendBulkNotifications` already enforces 14 emails/second (SES sandbox limit) — no additional throttling needed in the notification service
- **Failed email logging**: `sendBulkNotifications` already handles retry and failure logging internally — the notification service just logs the summary counts
- **Timer mock for tests**: If testing retry delays, use `jest.spyOn(global, 'setTimeout').mockImplementation((fn) => { fn(); return null; })` (NOT `jest.runAllTimersAsync` which is unavailable). For Story 8.4 tests, there are no retry delays in the notification service itself, so no timer mocking needed.
- **`jest.mock` hoisting**: Declare mock variable refs BEFORE imports; Jest hoists `jest.mock` factory calls above imports
- **Logger import alias**: `'../src/utils/logger/winston/logger'` (with `src/` segment, relative from `__test__/`)

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 8, Story 8.4] — Acceptance criteria and specifications
- [Source: _bmad-output/implementation-artifacts/8-3-aws-ses-email-service-integration.md] — SES service interface, notification template interfaces, Forward Context section for Story 8.4 usage pattern
- [Source: backend/src/services/email/ses_notification_service.ts] — `sendBulkNotifications` signature: `(recipients: string[], buildEmail: (to: string) => SesEmailParams) => Promise<{ sent: number; failed: number }>`
- [Source: backend/src/services/email/notification_templates.ts] — Template builder function signatures and parameter interfaces
- [Source: backend/src/services/admin/deadline/deadline_update_service.ts] — First-publish detection pattern (`!existing.data.publishedAt`)
- [Source: backend/src/services/admin/event/event_update_service.ts] — Existing event update structure to modify (add publishedAt to pre-fetch, fix publishedAt overwrite bug)
- [Source: backend/src/services/admin/news/news_update_service.ts] — Current structure (no pre-fetch); needs newsGetOneDAO added
- [Source: backend/prisma/schema.prisma — EmailSubscriber model] — `subscriptionTypes String[]`; `subscriptionTypes: { has: 'NEWS' }` is valid Prisma filter
- [Source: backend/__test__/ses-notification-service.test.ts] — Jest mock pattern with variable declarations before imports

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- Prisma mock required `__esModule: true` in mock factory for TypeScript default import interop to work correctly. Story notes had `'../src/prisma/prisma-client'` as the mock path, but actual path from `__test__/` is `'../prisma/prisma-client'` (prisma-client.ts lives at `backend/prisma/`, not `backend/src/prisma/`).

### Completion Notes List

- Implemented `publish_notification_service.ts` with `notifyNewsPublished`, `notifyEventPublished`, `notifyDeadlinePublished` — all use fire-and-forget pattern (not awaited in update services).
- Used sibling imports (not `@services/email` index) to avoid circular dependency.
- Fixed `event_update_service.ts` bug: `publishedAt` was being overwritten on every publish; now only set on first publish (aligns with deadline service behaviour).
- `news_update_service.ts` pre-fetches existing record via `newsGetOneDAO` to detect first publish (`publishedAt === null`).
- All 11 new unit tests pass. `application-email.service.test.ts` failure is pre-existing (unrelated `runAllTimersAsync` issue).

### Senior Developer Review (AI)

**Reviewer:** claude-opus-4-6 | **Date:** 2026-03-21

**Outcome: CHANGES MADE — 6 issues fixed, 1 High resolved, 4 Medium resolved, 2 Low resolved**

Issues found and fixed:
- **[H1] AC7 negative case untested**: Added `backend/__test__/update-service-notifications.test.ts` with 9 new tests covering re-publish (no notification), first-publish (notification sent), draft save (no notification) for all three update services.
- **[M2] `makeExcerpt` entity decoding**: Fixed — now decodes common HTML entities (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`) correctly before stripping, and collapses internal whitespace. "Tom &amp; Jerry" now correctly excerpts as "Tom & Jerry".
- **[M3] Inconsistent first-publish null check**: Fixed — `news_update_service.ts` now uses falsy `!` check (matching event and deadline services), instead of `=== null`.
- **[M4] Unnecessary DB query on every news update**: Fixed — `newsGetOneDAO` pre-fetch is now gated behind `if (newsData.status === 'PUBLISHED')`, eliminating the extra query for draft saves and non-publish updates.
- **[L1] Duplicate `baseUrl` resolution**: Fixed — extracted to module-level constant in `publish_notification_service.ts`.
- **[L2] `formatDateBg` used local timezone**: Fixed — changed to `getUTCDate()`, `getUTCMonth()`, `getUTCFullYear()`. Updated date format test to use UTC date string (`2026-05-01T00:00:00Z`).

All 19 tests pass (11 original + 8 new integration tests).

### File List

- `backend/src/services/email/publish_notification_service.ts` (NEW)
- `backend/src/services/email/index.ts` (MODIFIED)
- `backend/src/services/admin/news/news_update_service.ts` (MODIFIED)
- `backend/src/services/admin/event/event_update_service.ts` (MODIFIED)
- `backend/src/services/admin/deadline/deadline_update_service.ts` (MODIFIED)
- `backend/__test__/publish-notification.service.test.ts` (NEW, MODIFIED by review)
- `backend/__test__/update-service-notifications.test.ts` (NEW by review)
