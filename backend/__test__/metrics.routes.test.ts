import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// ──────────────────────────────────────────────────────────────────────────────
// Declare mock variables BEFORE any imports (required for jest.mock hoisting)
// ──────────────────────────────────────────────────────────────────────────────
const mockPrismaQueryRaw = jest.fn() as jest.Mock<any>;
const mockVerifySesConnection = jest.fn(() => Promise.resolve()) as jest.Mock<any>;
const mockMetricsStoreGetMetrics = jest.fn() as jest.Mock<any>;
const mockMetricsStoreRecord = jest.fn() as jest.Mock<any>;
const mockPassportAuthenticate = jest.fn() as jest.Mock<any>;

jest.mock('../prisma/prisma-client', () => ({
    __esModule: true,
    default: {
        $queryRaw: mockPrismaQueryRaw,
    },
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

jest.mock('passport', () => ({
    authenticate: mockPassportAuthenticate,
    use: jest.fn(),
    initialize: jest.fn(() => (_req: any, _res: any, next: any) => next()),
    serializeUser: jest.fn(),
    deserializeUser: jest.fn(),
}));

import request from 'supertest';
import createApp from '../src/server/app';

const app = createApp();

const DEFAULT_METRICS = {
    requestCountLastHour: 42,
    requestCountLast24h: 350,
    averageResponseTimeMs: 123,
    errorRate: 0.02,
};

describe('Metrics API — GET /api/v1/metrics', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockMetricsStoreGetMetrics.mockReturnValue(DEFAULT_METRICS);
        mockPrismaQueryRaw.mockResolvedValue([{ count: BigInt(5) }]);
        // Default: authenticated as DEVELOPER
        mockPassportAuthenticate.mockImplementation(
            (_strategy: any, _options: any, callback: any) => {
                return (_req: any, _res: any, _next: any) => {
                    callback(null, { id: 1, email: 'dev@test.com', role: 'DEVELOPER' });
                };
            },
        );
    });

    it('returns 401 when no/invalid JWT is provided', async () => {
        mockPassportAuthenticate.mockImplementation(
            (_strategy: any, _options: any, callback: any) => {
                return (_req: any, _res: any, _next: any) => {
                    callback(null, null); // no user → 401
                };
            },
        );

        const response = await request(app).get('/api/v1/metrics');

        expect(response.status).toBe(401);
    });

    it('returns 403 for ADMIN role with correct error body', async () => {
        mockPassportAuthenticate.mockImplementation(
            (_strategy: any, _options: any, callback: any) => {
                return (_req: any, _res: any, _next: any) => {
                    callback(null, { id: 2, email: 'admin@test.com', role: 'ADMIN' });
                };
            },
        );

        const response = await request(app)
            .get('/api/v1/metrics')
            .set('Authorization', 'Bearer fake-admin-token');

        expect(response.status).toBe(403);
        expect(response.body).toEqual({
            status: 'fail',
            data: { message: 'Forbidden: DEVELOPER role required' },
        });
    });

    it('returns 200 with metrics data for DEVELOPER role', async () => {
        const response = await request(app)
            .get('/api/v1/metrics')
            .set('Authorization', 'Bearer fake-developer-token');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data).toMatchObject({
            requestCountLastHour: 42,
            requestCountLast24h: 350,
            averageResponseTimeMs: 123,
            errorRate: 0.02,
            activeDbConnections: 5,
        });
    });

    it('returns 200 with activeDbConnections: -1 when DB connection query fails', async () => {
        mockPrismaQueryRaw.mockRejectedValue(new Error('DB connection failed'));

        const response = await request(app)
            .get('/api/v1/metrics')
            .set('Authorization', 'Bearer fake-developer-token');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.activeDbConnections).toBe(-1);
    });
});
