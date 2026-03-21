import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('../src/utils/logger/winston/logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}));

import {
    buildNewsNotificationEmail,
    buildEventNotificationEmail,
    buildDeadlineNotificationEmail,
    NewsNotificationParams,
    EventNotificationParams,
    DeadlineNotificationParams,
} from '../src/services/email/notification_templates';

const FRONTEND_URL = 'http://localhost:5173';
const TOKEN = 'test-unsubscribe-token-123';

beforeEach(() => {
    process.env.FRONTEND_URL = FRONTEND_URL;
});

describe('buildNewsNotificationEmail', () => {
    const params: NewsNotificationParams = {
        title: 'Нова новина за деца',
        excerpt: 'Кратко резюме на новината.',
        newsUrl: 'http://localhost:5173/news/1',
        unsubscribeToken: TOKEN,
    };

    it('subject contains news title', () => {
        const { subject } = buildNewsNotificationEmail(params);
        expect(subject).toContain('Нова новина за деца');
    });

    it('HTML contains excerpt', () => {
        const { html } = buildNewsNotificationEmail(params);
        expect(html).toContain('Кратко резюме на новината.');
    });

    it('HTML contains unsubscribe link', () => {
        const { html } = buildNewsNotificationEmail(params);
        expect(html).toContain(`${FRONTEND_URL}/unsubscribe?token=${TOKEN}`);
    });

    it('returns { subject, html, text } with all fields present and non-empty', () => {
        const result = buildNewsNotificationEmail(params);
        expect(result.subject).toBeTruthy();
        expect(result.html).toBeTruthy();
        expect(result.text).toBeTruthy();
    });
});

describe('buildEventNotificationEmail', () => {
    const params: EventNotificationParams = {
        title: 'Коледно тържество',
        date: '24.12.2026',
        location: 'Аула на детската градина',
        description: 'Очакваме ви на коледното ни тържество.',
        eventUrl: 'http://localhost:5173/events/5',
        unsubscribeToken: TOKEN,
    };

    it('subject contains event title', () => {
        const { subject } = buildEventNotificationEmail(params);
        expect(subject).toContain('Коледно тържество');
    });

    it('HTML contains formatted date and location', () => {
        const { html } = buildEventNotificationEmail(params);
        expect(html).toContain('24.12.2026');
        expect(html).toContain('Аула на детската градина');
    });

    it('returns { subject, html, text } with all fields present and non-empty', () => {
        const result = buildEventNotificationEmail(params);
        expect(result.subject).toBeTruthy();
        expect(result.html).toBeTruthy();
        expect(result.text).toBeTruthy();
    });

    it('unsubscribe link in footer uses FRONTEND_URL env var and token', () => {
        const { html, text } = buildEventNotificationEmail(params);
        const expectedUrl = `${FRONTEND_URL}/unsubscribe?token=${TOKEN}`;
        expect(html).toContain(expectedUrl);
        expect(text).toContain(expectedUrl);
    });
});

describe('buildDeadlineNotificationEmail', () => {
    const baseParams: DeadlineNotificationParams = {
        title: 'Краен срок за записване',
        date: '15.01.2027',
        isUrgent: false,
        description: 'Последен ден за подаване на документи.',
        deadlineUrl: 'http://localhost:5173/deadlines/3',
        unsubscribeToken: TOKEN,
    };

    it('subject contains deadline title', () => {
        const { subject } = buildDeadlineNotificationEmail(baseParams);
        expect(subject).toContain('Краен срок за записване');
    });

    it('HTML contains urgency indicator when isUrgent=true', () => {
        const { html } = buildDeadlineNotificationEmail({ ...baseParams, isUrgent: true });
        expect(html).toContain('⚠️ СПЕШНО');
    });

    it('HTML does NOT contain urgency indicator when isUrgent=false', () => {
        const { html } = buildDeadlineNotificationEmail({ ...baseParams, isUrgent: false });
        expect(html).not.toContain('⚠️ СПЕШНО');
    });

    it('returns { subject, html, text } with all fields present and non-empty', () => {
        const result = buildDeadlineNotificationEmail(baseParams);
        expect(result.subject).toBeTruthy();
        expect(result.html).toBeTruthy();
        expect(result.text).toBeTruthy();
    });

    it('unsubscribe link in footer uses FRONTEND_URL env var and token', () => {
        const { html, text } = buildDeadlineNotificationEmail(baseParams);
        const expectedUrl = `${FRONTEND_URL}/unsubscribe?token=${TOKEN}`;
        expect(html).toContain(expectedUrl);
        expect(text).toContain(expectedUrl);
    });
});
