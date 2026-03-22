import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// ──────────────────────────────────────────────────────────────────────────────
// Declare mock variables BEFORE any imports (required for jest.mock hoisting)
// ──────────────────────────────────────────────────────────────────────────────
const mockDeadlineFindUnique = jest.fn() as jest.Mock<any>;
const mockVerifySesConnection = jest.fn(() => Promise.resolve()) as jest.Mock<any>;

jest.mock('../prisma/prisma-client', () => ({
    __esModule: true,
    default: {
        deadline: { findUnique: mockDeadlineFindUnique },
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

const mockPublishedDeadline = {
    id: 1,
    title: 'Application Deadline',
    description: '<p>Submit your application before this date</p>',
    deadlineDate: new Date('2026-04-30T00:00:00Z'),
    isUrgent: false,
    status: 'PUBLISHED',
    publishedAt: new Date('2026-03-01T10:00:00Z'),
};

describe('Public Deadlines Detail API — GET /api/v1/public/admission-deadlines/:id', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns 200 with deadline data for a published deadline', async () => {
        mockDeadlineFindUnique.mockResolvedValue(mockPublishedDeadline);

        const response = await request(app).get('/api/v1/public/admission-deadlines/1');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data).toHaveProperty('deadline');
        expect(response.body.data.deadline.id).toBe(1);
        expect(response.body.data.deadline.title).toBe('Application Deadline');
        expect(response.body.data.deadline).not.toHaveProperty('status');
    });

    it('sets Cache-Control: public, max-age=300 header', async () => {
        mockDeadlineFindUnique.mockResolvedValue(mockPublishedDeadline);

        const response = await request(app).get('/api/v1/public/admission-deadlines/1');

        expect(response.status).toBe(200);
        expect(response.headers['cache-control']).toBe('public, max-age=300');
    });

    it('returns 404 when deadline not found (findUnique returns null)', async () => {
        mockDeadlineFindUnique.mockResolvedValue(null);

        const response = await request(app).get('/api/v1/public/admission-deadlines/999');

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('fail');
        expect(response.body.data.message).toBe('Срокът не е намерен');
    });

    it('returns 404 for non-numeric id (NaN)', async () => {
        const response = await request(app).get('/api/v1/public/admission-deadlines/abc');

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('fail');
        expect(response.body.data.message).toBe('Срокът не е намерен');
    });

    it('returns 404 for a DRAFT deadline', async () => {
        mockDeadlineFindUnique.mockResolvedValue({ ...mockPublishedDeadline, id: 2, status: 'DRAFT' });

        const response = await request(app).get('/api/v1/public/admission-deadlines/2');

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('fail');
        expect(response.body.data.message).toBe('Срокът не е намерен');
    });

    it('returns 500 when prisma throws an error', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        mockDeadlineFindUnique.mockRejectedValue(new Error('DB connection error'));

        const response = await request(app).get('/api/v1/public/admission-deadlines/1');

        expect(response.status).toBe(500);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toBe('Internal server error');
        consoleSpy.mockRestore();
    });
});
