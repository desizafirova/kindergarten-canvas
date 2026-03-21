import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Declare typed mocks before any module mock calls (required pattern for this repo)
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
jest.mock('../prisma/prisma-client', () => ({
    __esModule: true,
    default: { emailSubscriber: { findMany: mockFindMany } },
}));
jest.mock('../src/utils/logger/winston/logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}));

import { notifyNewsPublished, notifyEventPublished, notifyDeadlinePublished } from '../src/services/email/publish_notification_service';
import logger from '../src/utils/logger/winston/logger';

describe('notifyNewsPublished', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('queries correct subscriber type (NEWS)', async () => {
        mockFindMany.mockResolvedValue([{ email: 'a@x.com', unsubscribeToken: 'tok1' }]);
        mockSendBulkNotifications.mockResolvedValue({ sent: 1, failed: 0 });
        mockBuildNewsNotificationEmail.mockReturnValue({ subject: 'S', html: 'H', text: 'T' });

        await notifyNewsPublished({ id: 1, title: 'Test', content: '<p>Hello</p>' });

        expect(mockFindMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { isActive: true, subscriptionTypes: { has: 'NEWS' } },
            }),
        );
    });

    it('calls sendBulkNotifications with correct emails', async () => {
        mockFindMany.mockResolvedValue([{ email: 'sub@a.com', unsubscribeToken: 'tkn' }]);
        mockSendBulkNotifications.mockResolvedValue({ sent: 1, failed: 0 });
        mockBuildNewsNotificationEmail.mockReturnValue({ subject: 'S', html: 'H', text: 'T' });

        await notifyNewsPublished({ id: 5, title: 'Hello', content: '<b>World</b>' });

        expect(mockSendBulkNotifications).toHaveBeenCalledWith(['sub@a.com'], expect.any(Function));
    });

    it('strips HTML for excerpt before passing to template builder', async () => {
        mockFindMany.mockResolvedValue([{ email: 'sub@test.com', unsubscribeToken: 'tok' }]);
        mockSendBulkNotifications.mockResolvedValue({ sent: 1, failed: 0 });
        mockBuildNewsNotificationEmail.mockReturnValue({ subject: 'S', html: 'H', text: 'T' });

        await notifyNewsPublished({ id: 1, title: 'T', content: '<p><b>Hello</b> World</p>' });

        // Capture the buildEmail callback and invoke it
        const buildEmailCallback = mockSendBulkNotifications.mock.calls[0][1] as (to: string) => any;
        buildEmailCallback('sub@test.com');

        expect(mockBuildNewsNotificationEmail).toHaveBeenCalledWith(
            expect.objectContaining({ excerpt: 'Hello World' }),
        );
    });

    it('logs delivery stats after sending', async () => {
        mockFindMany.mockResolvedValue([{ email: 'x@y.com', unsubscribeToken: 'tok' }]);
        mockSendBulkNotifications.mockResolvedValue({ sent: 1, failed: 0 });
        mockBuildNewsNotificationEmail.mockReturnValue({ subject: 'S', html: 'H', text: 'T' });

        await notifyNewsPublished({ id: 3, title: 'T', content: 'C' });

        expect(logger.info).toHaveBeenCalledWith(
            'Publish notification sent',
            expect.objectContaining({
                contentType: 'NEWS',
                contentId: 3,
                subscriberCount: 1,
                sentCount: 1,
                failedCount: 0,
            }),
        );
    });

    it('skips sending when no subscribers exist (AC9)', async () => {
        mockFindMany.mockResolvedValue([]);

        await notifyNewsPublished({ id: 1, title: 'T', content: 'C' });

        expect(mockSendBulkNotifications).not.toHaveBeenCalled();
        expect(logger.info).toHaveBeenCalledWith(
            expect.stringContaining('skipped'),
            expect.anything(),
        );
    });
});

describe('notifyEventPublished', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('queries correct subscriber type (EVENTS)', async () => {
        mockFindMany.mockResolvedValue([{ email: 'e@v.com', unsubscribeToken: 'etok' }]);
        mockSendBulkNotifications.mockResolvedValue({ sent: 1, failed: 0 });
        mockBuildEventNotificationEmail.mockReturnValue({ subject: 'S', html: 'H', text: 'T' });

        await notifyEventPublished({
            id: 2,
            title: 'Fest',
            eventDate: new Date('2026-05-01'),
            location: 'Sofia',
            description: 'Fun event',
        });

        expect(mockFindMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { isActive: true, subscriptionTypes: { has: 'EVENTS' } },
            }),
        );
    });

    it('formats date as dd.MM.yyyy', async () => {
        mockFindMany.mockResolvedValue([{ email: 'e@v.com', unsubscribeToken: 'etok' }]);
        mockSendBulkNotifications.mockResolvedValue({ sent: 1, failed: 0 });
        mockBuildEventNotificationEmail.mockReturnValue({ subject: 'S', html: 'H', text: 'T' });

        await notifyEventPublished({
            id: 2,
            title: 'Fest',
            eventDate: new Date('2026-05-01T00:00:00Z'),
            description: 'Fun',
        });

        const buildEmailCallback = mockSendBulkNotifications.mock.calls[0][1] as (to: string) => any;
        buildEmailCallback('e@v.com');

        expect(mockBuildEventNotificationEmail).toHaveBeenCalledWith(
            expect.objectContaining({ date: '01.05.2026' }),
        );
    });

    it('skips sending when no EVENTS subscribers', async () => {
        mockFindMany.mockResolvedValue([]);

        await notifyEventPublished({ id: 1, title: 'T', eventDate: new Date(), description: 'D' });

        expect(mockSendBulkNotifications).not.toHaveBeenCalled();
        expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('skipped'), expect.anything());
    });
});

describe('notifyDeadlinePublished', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('queries correct subscriber type (DEADLINES)', async () => {
        mockFindMany.mockResolvedValue([{ email: 'd@l.com', unsubscribeToken: 'dtok' }]);
        mockSendBulkNotifications.mockResolvedValue({ sent: 1, failed: 0 });
        mockBuildDeadlineNotificationEmail.mockReturnValue({ subject: 'S', html: 'H', text: 'T' });

        await notifyDeadlinePublished({
            id: 3,
            title: 'Enrollment',
            deadlineDate: new Date('2026-06-01'),
            isUrgent: false,
            description: 'Sign up by deadline',
        });

        expect(mockFindMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { isActive: true, subscriptionTypes: { has: 'DEADLINES' } },
            }),
        );
    });

    it('passes isUrgent flag to template builder', async () => {
        mockFindMany.mockResolvedValue([{ email: 'd@l.com', unsubscribeToken: 'dtok' }]);
        mockSendBulkNotifications.mockResolvedValue({ sent: 1, failed: 0 });
        mockBuildDeadlineNotificationEmail.mockReturnValue({ subject: 'S', html: 'H', text: 'T' });

        await notifyDeadlinePublished({
            id: 3,
            title: 'Urgent',
            deadlineDate: new Date('2026-06-01'),
            isUrgent: true,
            description: 'Very urgent',
        });

        const buildEmailCallback = mockSendBulkNotifications.mock.calls[0][1] as (to: string) => any;
        buildEmailCallback('d@l.com');

        expect(mockBuildDeadlineNotificationEmail).toHaveBeenCalledWith(
            expect.objectContaining({ isUrgent: true }),
        );
    });

    it('skips sending when no DEADLINES subscribers', async () => {
        mockFindMany.mockResolvedValue([]);

        await notifyDeadlinePublished({
            id: 1,
            title: 'T',
            deadlineDate: new Date(),
            isUrgent: false,
        });

        expect(mockSendBulkNotifications).not.toHaveBeenCalled();
        expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('skipped'), expect.anything());
    });
});
