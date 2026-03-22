import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// ──────────────────────────────────────────────────────────────────────────────
// Declare mock variables BEFORE any imports (required for jest.mock hoisting)
// ──────────────────────────────────────────────────────────────────────────────
const mockNewsItemsFindMany = jest.fn() as jest.Mock<any>;
const mockEventFindMany = jest.fn() as jest.Mock<any>;
const mockDeadlineCount = jest.fn() as jest.Mock<any>;
const mockDeadlineFindFirst = jest.fn() as jest.Mock<any>;
const mockGalleryFindMany = jest.fn() as jest.Mock<any>;
const mockVerifySesConnection = jest.fn(() => Promise.resolve()) as jest.Mock<any>;

jest.mock('../prisma/prisma-client', () => ({
    __esModule: true,
    default: {
        news_items: { findMany: mockNewsItemsFindMany },
        event: { findMany: mockEventFindMany },
        deadline: { count: mockDeadlineCount, findFirst: mockDeadlineFindFirst },
        gallery: { findMany: mockGalleryFindMany },
    },
}));

jest.mock('../src/services/email/ses_notification_service', () => ({
    verifySesConnection: mockVerifySesConnection,
}));

jest.mock('../src/utils/logger/winston/logger', () => ({
    __esModule: true,
    default: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

import request from 'supertest';
import createApp from '../src/server/app';

const app = createApp();

describe('Public Homepage API — GET /api/v1/public/homepage', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Default mock data
        mockNewsItemsFindMany.mockResolvedValue([
            { id: 1, title: 'News One', content: '<p>First news content here</p>', publishedAt: new Date('2026-03-01T10:00:00Z') },
            { id: 2, title: 'News Two', content: '<p>Second news</p>', publishedAt: new Date('2026-02-28T10:00:00Z') },
            { id: 3, title: 'News Three', content: null, publishedAt: new Date('2026-02-27T10:00:00Z') },
        ]);

        mockEventFindMany.mockResolvedValue([
            { id: 10, title: 'Spring Event', eventDate: new Date('2026-04-15T00:00:00Z'), isImportant: false },
            { id: 11, title: 'Summer Event', eventDate: new Date('2026-06-01T00:00:00Z'), isImportant: true },
        ]);

        mockDeadlineCount.mockResolvedValue(3);
        mockDeadlineFindFirst.mockResolvedValue({ deadlineDate: new Date('2026-03-28T00:00:00Z') });

        mockGalleryFindMany.mockResolvedValue([
            { coverImageUrl: 'https://res.cloudinary.com/example/cover.jpg' },
        ]);
    });

    it('returns 200 with JSend success format', async () => {
        const response = await request(app).get('/api/v1/public/homepage');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data).toBeDefined();
    });

    it('returns correct data shape: latestNews, upcomingEvents, deadlinesSummary, latestGalleryCoverUrl', async () => {
        const response = await request(app).get('/api/v1/public/homepage');

        expect(response.status).toBe(200);
        const { data } = response.body;
        expect(data).toHaveProperty('latestNews');
        expect(data).toHaveProperty('upcomingEvents');
        expect(data).toHaveProperty('deadlinesSummary');
        expect(data).toHaveProperty('latestGalleryCoverUrl');
    });

    it('latestNews items contain excerpt field (NOT raw content)', async () => {
        const response = await request(app).get('/api/v1/public/homepage');

        expect(response.status).toBe(200);
        const { latestNews } = response.body.data;
        expect(Array.isArray(latestNews)).toBe(true);
        expect(latestNews.length).toBe(3);

        // excerpt should exist, content should NOT
        expect(latestNews[0]).toHaveProperty('excerpt');
        expect(latestNews[0]).not.toHaveProperty('content');

        // excerpt strips HTML tags
        expect(latestNews[0].excerpt).toBe('First news content here');
        expect(latestNews[1].excerpt).toBe('Second news');
        // null content becomes empty string
        expect(latestNews[2].excerpt).toBe('');
    });

    it('excerpt decodes HTML entities from TipTap content', async () => {
        mockNewsItemsFindMany.mockResolvedValue([
            { id: 1, title: 'News', content: '<p>Meeting at 3pm&nbsp;&mdash; don&#39;t miss it! &amp; bring lunch</p>', publishedAt: new Date('2026-03-01T10:00:00Z') },
        ]);

        const response = await request(app).get('/api/v1/public/homepage');

        expect(response.status).toBe(200);
        expect(response.body.data.latestNews[0].excerpt).toBe("Meeting at 3pm \u2014 don't miss it! & bring lunch");
    });

    it('deadlinesSummary contains activeCount and nearestDeadlineDate', async () => {
        const response = await request(app).get('/api/v1/public/homepage');

        expect(response.status).toBe(200);
        const { deadlinesSummary } = response.body.data;
        expect(deadlinesSummary).toHaveProperty('activeCount', 3);
        expect(deadlinesSummary).toHaveProperty('nearestDeadlineDate');
        expect(deadlinesSummary.nearestDeadlineDate).not.toBeNull();
    });

    it('deadlinesSummary.nearestDeadlineDate is null when no active deadlines', async () => {
        mockDeadlineCount.mockResolvedValue(0);
        mockDeadlineFindFirst.mockResolvedValue(null);

        const response = await request(app).get('/api/v1/public/homepage');

        expect(response.status).toBe(200);
        const { deadlinesSummary } = response.body.data;
        expect(deadlinesSummary.activeCount).toBe(0);
        expect(deadlinesSummary.nearestDeadlineDate).toBeNull();
    });

    it('latestGalleryCoverUrl contains the cover URL', async () => {
        const response = await request(app).get('/api/v1/public/homepage');

        expect(response.status).toBe(200);
        expect(response.body.data.latestGalleryCoverUrl).toBe(
            'https://res.cloudinary.com/example/cover.jpg',
        );
    });

    it('latestGalleryCoverUrl is null when no published gallery exists', async () => {
        mockGalleryFindMany.mockResolvedValue([]);

        const response = await request(app).get('/api/v1/public/homepage');

        expect(response.status).toBe(200);
        expect(response.body.data.latestGalleryCoverUrl).toBeNull();
    });

    it('response includes Cache-Control: public, max-age=60 header', async () => {
        const response = await request(app).get('/api/v1/public/homepage');

        expect(response.status).toBe(200);
        expect(response.headers['cache-control']).toBe('public, max-age=60');
    });

    it('returns 500 on database error', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        mockNewsItemsFindMany.mockRejectedValue(new Error('DB connection error'));

        const response = await request(app).get('/api/v1/public/homepage');

        expect(response.status).toBe(500);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toBe('Internal server error');
        expect(consoleSpy).toHaveBeenCalledWith('Error fetching homepage data:', expect.any(Error));
        consoleSpy.mockRestore();
    });
});
