import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// ──────────────────────────────────────────────────────────────────────────────
// Declare mock variables BEFORE any imports (required for jest.mock hoisting)
// ──────────────────────────────────────────────────────────────────────────────
const mockEventFindUnique = jest.fn() as jest.Mock<any>;
const mockVerifySesConnection = jest.fn(() => Promise.resolve()) as jest.Mock<any>;

jest.mock('../prisma/prisma-client', () => ({
    __esModule: true,
    default: {
        event: { findUnique: mockEventFindUnique },
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

const mockPublishedEvent = {
    id: 1,
    title: 'Spring Festival',
    description: '<p>A wonderful spring event</p>',
    eventDate: new Date('2026-04-15T10:00:00Z'),
    eventEndDate: null,
    location: 'School Hall',
    isImportant: false,
    imageUrl: null,
    status: 'PUBLISHED',
    publishedAt: new Date('2026-03-01T10:00:00Z'),
};

describe('Public Events Detail API — GET /api/v1/public/events/:id', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns 200 with event data for a published event', async () => {
        mockEventFindUnique.mockResolvedValue(mockPublishedEvent);

        const response = await request(app).get('/api/v1/public/events/1');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data).toHaveProperty('event');
        expect(response.body.data.event.id).toBe(1);
        expect(response.body.data.event.title).toBe('Spring Festival');
        expect(response.body.data.event).not.toHaveProperty('status');
    });

    it('sets Cache-Control: public, max-age=300 header', async () => {
        mockEventFindUnique.mockResolvedValue(mockPublishedEvent);

        const response = await request(app).get('/api/v1/public/events/1');

        expect(response.status).toBe(200);
        expect(response.headers['cache-control']).toBe('public, max-age=300');
    });

    it('returns 404 when event not found (findUnique returns null)', async () => {
        mockEventFindUnique.mockResolvedValue(null);

        const response = await request(app).get('/api/v1/public/events/999');

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('fail');
        expect(response.body.data.message).toBe('Събитието не е намерено');
    });

    it('returns 404 for non-numeric id (NaN)', async () => {
        const response = await request(app).get('/api/v1/public/events/abc');

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('fail');
        expect(response.body.data.message).toBe('Събитието не е намерено');
    });

    it('returns 404 for a DRAFT event', async () => {
        mockEventFindUnique.mockResolvedValue({ ...mockPublishedEvent, id: 2, status: 'DRAFT' });

        const response = await request(app).get('/api/v1/public/events/2');

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('fail');
        expect(response.body.data.message).toBe('Събитието не е намерено');
    });

    it('returns 500 when prisma throws an error', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        mockEventFindUnique.mockRejectedValue(new Error('DB connection error'));

        const response = await request(app).get('/api/v1/public/events/1');

        expect(response.status).toBe(500);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toBe('Internal server error');
        consoleSpy.mockRestore();
    });
});
