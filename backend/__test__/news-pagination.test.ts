import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// ──────────────────────────────────────────────────────────────────────────────
// Declare mock variables BEFORE any imports (required for jest.mock hoisting)
// ──────────────────────────────────────────────────────────────────────────────
const mockNewsItemsFindMany = jest.fn() as jest.Mock<any>;
const mockNewsItemsCount = jest.fn() as jest.Mock<any>;
const mockNewsItemsFindUnique = jest.fn() as jest.Mock<any>;
const mockVerifySesConnection = jest.fn(() => Promise.resolve()) as jest.Mock<any>;

jest.mock('../prisma/prisma-client', () => ({
    __esModule: true,
    default: {
        news_items: {
            findMany: mockNewsItemsFindMany,
            count: mockNewsItemsCount,
            findUnique: mockNewsItemsFindUnique,
        },
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

const makeNewsItem = (id: number) => ({
    id,
    title: `News ${id}`,
    content: `<p>Content for news ${id}</p>`,
    imageUrl: null,
    publishedAt: new Date(`2026-03-${String(id).padStart(2, '0')}T10:00:00Z`),
});

describe('Public News API — Pagination', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/v1/public/news (no params) — default pagination', () => {
        it('returns default page=1, limit=10, and pagination metadata', async () => {
            const mockItems = Array.from({ length: 10 }, (_, i) => makeNewsItem(i + 1));
            mockNewsItemsCount.mockResolvedValue(25);
            mockNewsItemsFindMany.mockResolvedValue(mockItems);

            const response = await request(app).get('/api/v1/public/news');

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('success');

            const { data } = response.body;
            expect(Array.isArray(data.news)).toBe(true);
            expect(data.news.length).toBe(10);
            expect(data.totalCount).toBe(25);
            expect(data.page).toBe(1);
            expect(data.limit).toBe(10);
            expect(data.totalPages).toBe(3); // ceil(25/10)
        });

        it('calls prisma with correct default skip=0, take=10', async () => {
            mockNewsItemsCount.mockResolvedValue(5);
            mockNewsItemsFindMany.mockResolvedValue(Array.from({ length: 5 }, (_, i) => makeNewsItem(i + 1)));

            await request(app).get('/api/v1/public/news');

            expect(mockNewsItemsFindMany).toHaveBeenCalledWith(
                expect.objectContaining({ skip: 0, take: 10 }),
            );
        });
    });

    describe('GET /api/v1/public/news?page=2&limit=5 — custom pagination', () => {
        it('returns page=2 metadata and correct skip/take', async () => {
            const mockItems = Array.from({ length: 5 }, (_, i) => makeNewsItem(i + 6));
            mockNewsItemsCount.mockResolvedValue(12);
            mockNewsItemsFindMany.mockResolvedValue(mockItems);

            const response = await request(app).get('/api/v1/public/news?page=2&limit=5');

            expect(response.status).toBe(200);
            const { data } = response.body;
            expect(data.page).toBe(2);
            expect(data.limit).toBe(5);
            expect(data.totalCount).toBe(12);
            expect(data.totalPages).toBe(3); // ceil(12/5)
        });

        it('calls prisma with correct skip=5, take=5 for page=2&limit=5', async () => {
            mockNewsItemsCount.mockResolvedValue(12);
            mockNewsItemsFindMany.mockResolvedValue([]);

            await request(app).get('/api/v1/public/news?page=2&limit=5');

            expect(mockNewsItemsFindMany).toHaveBeenCalledWith(
                expect.objectContaining({ skip: 5, take: 5 }),
            );
        });
    });

    describe('GET /api/v1/public/news?limit=999 — limit clamping', () => {
        it('clamps limit to 50 when ?limit=999', async () => {
            mockNewsItemsCount.mockResolvedValue(100);
            mockNewsItemsFindMany.mockResolvedValue([]);

            const response = await request(app).get('/api/v1/public/news?limit=999');

            expect(response.status).toBe(200);
            expect(response.body.data.limit).toBe(50);
        });

        it('calls prisma with take=50 when limit is over max', async () => {
            mockNewsItemsCount.mockResolvedValue(100);
            mockNewsItemsFindMany.mockResolvedValue([]);

            await request(app).get('/api/v1/public/news?limit=999');

            expect(mockNewsItemsFindMany).toHaveBeenCalledWith(
                expect.objectContaining({ take: 50 }),
            );
        });
    });

    describe('Cache-Control header', () => {
        it('response includes Cache-Control: public, max-age=60', async () => {
            mockNewsItemsCount.mockResolvedValue(0);
            mockNewsItemsFindMany.mockResolvedValue([]);

            const response = await request(app).get('/api/v1/public/news');

            expect(response.status).toBe(200);
            expect(response.headers['cache-control']).toBe('public, max-age=60');
        });
    });

    describe('Runs count and findMany in parallel', () => {
        it('calls both prisma.news_items.count and prisma.news_items.findMany', async () => {
            mockNewsItemsCount.mockResolvedValue(3);
            mockNewsItemsFindMany.mockResolvedValue(Array.from({ length: 3 }, (_, i) => makeNewsItem(i + 1)));

            await request(app).get('/api/v1/public/news');

            expect(mockNewsItemsCount).toHaveBeenCalledTimes(1);
            expect(mockNewsItemsFindMany).toHaveBeenCalledTimes(1);
        });
    });

    describe('Empty results edge case', () => {
        it('returns totalPages=0 and empty array when no news published', async () => {
            mockNewsItemsCount.mockResolvedValue(0);
            mockNewsItemsFindMany.mockResolvedValue([]);

            const response = await request(app).get('/api/v1/public/news');

            expect(response.status).toBe(200);
            const { data } = response.body;
            expect(data.news).toEqual([]);
            expect(data.totalCount).toBe(0);
            expect(data.totalPages).toBe(0);
            expect(data.page).toBe(1);
        });
    });

    describe('Single-item Cache-Control header (max-age=300)', () => {
        it('GET /api/v1/public/news/:id returns Cache-Control: public, max-age=300', async () => {
            mockNewsItemsFindUnique.mockResolvedValue({
                id: 1,
                title: 'Test News',
                content: '<p>Content</p>',
                imageUrl: null,
                status: 'PUBLISHED',
                publishedAt: new Date('2026-03-01T10:00:00Z'),
            });

            const response = await request(app).get('/api/v1/public/news/1');

            expect(response.status).toBe(200);
            expect(response.headers['cache-control']).toBe('public, max-age=300');
        });
    });
});
