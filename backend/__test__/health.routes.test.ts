import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// ──────────────────────────────────────────────────────────────────────────────
// Declare mock variables BEFORE any imports (required for jest.mock hoisting)
// ──────────────────────────────────────────────────────────────────────────────
const mockPrismaQueryRaw = jest.fn() as jest.Mock<any>;
const mockCloudinaryPing = jest.fn() as jest.Mock<any>;
const mockSesClientSend = jest.fn() as jest.Mock<any>;
const mockVerifySesConnection = jest.fn(() => Promise.resolve()) as jest.Mock<any>;
const mockMetricsStoreRecord = jest.fn() as jest.Mock<any>;
const mockMetricsStoreGetMetrics = jest.fn() as jest.Mock<any>;

jest.mock('../prisma/prisma-client', () => ({
    __esModule: true,
    default: {
        $queryRaw: mockPrismaQueryRaw,
    },
}));

jest.mock('../src/config/cloudinary.config', () => ({
    __esModule: true,
    default: {
        api: { ping: mockCloudinaryPing },
        config: jest.fn(),
    },
}));

jest.mock('@aws-sdk/client-ses', () => ({
    SESClient: jest.fn().mockImplementation(() => ({ send: mockSesClientSend })),
    GetSendQuotaCommand: jest.fn(),
}));

jest.mock('../src/services/email/ses_notification_service', () => ({
    verifySesConnection: mockVerifySesConnection,
}));

jest.mock('../src/utils/logger/winston/logger', () => ({
    __esModule: true,
    default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock('../src/utils/metrics/metrics_store', () => ({
    metricsStore: {
        record: mockMetricsStoreRecord,
        getMetrics: mockMetricsStoreGetMetrics,
    },
}));

import request from 'supertest';
import createApp from '../src/server/app';

const app = createApp();

describe('Health Check API — GET /api/v1/health', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Basic health check (no deep param)', () => {
        it('returns 200 with status ok, timestamp, version, and uptime', async () => {
            const response = await request(app).get('/api/v1/health');

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('ok');
            expect(typeof response.body.timestamp).toBe('string');
            expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
            expect(response.body.version).toBe('1.0.0');
            expect(typeof response.body.uptime).toBe('number');
            expect(response.body.uptime).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Deep health check (?deep=true)', () => {
        it('returns 200 with all connected when all dependencies healthy', async () => {
            mockPrismaQueryRaw.mockResolvedValue([{ '?column?': 1 }]);
            mockCloudinaryPing.mockResolvedValue({ status: 'ok' });
            mockSesClientSend.mockResolvedValue({});

            const response = await request(app).get('/api/v1/health?deep=true');

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('ok');
            expect(response.body.database).toBe('connected');
            expect(response.body.cloudinary).toBe('connected');
            expect(response.body.ses).toBe('connected');
        });

        it('returns 503 with degraded status when database fails', async () => {
            mockPrismaQueryRaw.mockRejectedValue(new Error('connection refused'));
            mockCloudinaryPing.mockResolvedValue({ status: 'ok' });
            mockSesClientSend.mockResolvedValue({});

            const response = await request(app).get('/api/v1/health?deep=true');

            expect(response.status).toBe(503);
            expect(response.body.status).toBe('degraded');
            expect(response.body.database).toContain('error:');
        });

        it('returns 503 with unhealthy status when cloudinary fails', async () => {
            mockPrismaQueryRaw.mockResolvedValue([{ '?column?': 1 }]);
            mockCloudinaryPing.mockRejectedValue(new Error('invalid credentials'));
            mockSesClientSend.mockResolvedValue({});

            const response = await request(app).get('/api/v1/health?deep=true');

            expect(response.status).toBe(503);
            expect(response.body.status).toBe('degraded');
            expect(response.body.cloudinary).toContain('error:');
        });

        it('returns 503 with unhealthy status when ses fails', async () => {
            mockPrismaQueryRaw.mockResolvedValue([{ '?column?': 1 }]);
            mockCloudinaryPing.mockResolvedValue({ status: 'ok' });
            mockSesClientSend.mockRejectedValue(new Error('credentials expired'));

            const response = await request(app).get('/api/v1/health?deep=true');

            expect(response.status).toBe(503);
            expect(response.body.status).toBe('degraded');
            expect(response.body.ses).toContain('error:');
        });

        it('returns 503 with unhealthy status when all dependencies fail', async () => {
            mockPrismaQueryRaw.mockRejectedValue(new Error('connection refused'));
            mockCloudinaryPing.mockRejectedValue(new Error('invalid credentials'));
            mockSesClientSend.mockRejectedValue(new Error('credentials expired'));

            const response = await request(app).get('/api/v1/health?deep=true');

            expect(response.status).toBe(503);
            expect(response.body.status).toBe('unhealthy');
            expect(response.body.database).toContain('error:');
            expect(response.body.cloudinary).toContain('error:');
            expect(response.body.ses).toContain('error:');
        });
    });
});
