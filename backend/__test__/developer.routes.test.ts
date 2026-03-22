import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// ──────────────────────────────────────────────────────────────────────────────
// Declare mock variables BEFORE any imports (required for jest.mock hoisting)
// ──────────────────────────────────────────────────────────────────────────────
const mockLoggerError = jest.fn();
const mockLoggerWarn = jest.fn();
const mockLoggerInfo = jest.fn();

const mockMetricsStoreRecord = jest.fn() as jest.Mock<any>;
const mockMetricsStoreGetMetrics = jest.fn(() => ({
    requestCountLastHour: 5,
    requestCountLast24h: 42,
    averageResponseTimeMs: 120,
    errorRate: 0.0238,
})) as jest.Mock<any>;

const mockErrorLogBufferGetRecent = jest.fn(() => []) as jest.Mock<any>;
const mockErrorLogBufferAdd = jest.fn() as jest.Mock<any>;

// Role used in passport mock — mutated per test
let mockUserRole: 'DEVELOPER' | 'ADMIN' | null = 'DEVELOPER';

jest.mock('../src/utils/logger/winston/logger', () => ({
    __esModule: true,
    default: {
        error: mockLoggerError,
        warn: mockLoggerWarn,
        info: mockLoggerInfo,
        debug: jest.fn(),
    },
}));

jest.mock('../src/services/email/ses_notification_service', () => ({
    verifySesConnection: jest.fn(() => Promise.resolve()),
}));

jest.mock('../src/utils/metrics/metrics_store', () => ({
    metricsStore: {
        record: mockMetricsStoreRecord,
        getMetrics: mockMetricsStoreGetMetrics,
    },
}));

jest.mock('../src/utils/logger/error_log_buffer', () => ({
    errorLogBuffer: {
        getRecent: mockErrorLogBufferGetRecent,
        add: mockErrorLogBufferAdd,
    },
}));

jest.mock('passport', () => ({
    authenticate:
        (_strategy: string, _options: unknown, callback: Function) =>
        (_req: unknown, _res: unknown, _next: unknown) => {
            if (mockUserRole === null) {
                return callback(null, null); // unauthenticated
            }
            return callback(null, { id: 1, email: 'dev@test.com', role: mockUserRole });
        },
    use: jest.fn(),
    initialize: jest.fn(() => (_req: unknown, _res: unknown, next: Function) => next()),
}));

// ──────────────────────────────────────────────────────────────────────────────
// Imports — ONLY after all jest.mock() calls
// ──────────────────────────────────────────────────────────────────────────────
import request from 'supertest';
import createApp from '../src/server/app';

const app = createApp();

describe('Developer API — GET /api/v1/admin/developer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset getMetrics to default mock
        mockMetricsStoreGetMetrics.mockReturnValue({
            requestCountLastHour: 5,
            requestCountLast24h: 42,
            averageResponseTimeMs: 120,
            errorRate: 0.0238,
        });
        mockErrorLogBufferGetRecent.mockReturnValue([]);
        mockUserRole = 'DEVELOPER';
    });

    it('returns 401 when no auth token provided', async () => {
        mockUserRole = null;
        const response = await request(app).get('/api/v1/admin/developer');
        expect(response.status).toBe(401);
    });

    it('returns 403 Forbidden when authenticated as ADMIN role', async () => {
        mockUserRole = 'ADMIN';
        const response = await request(app)
            .get('/api/v1/admin/developer')
            .set('Authorization', 'Bearer fake-admin-token');

        expect(response.status).toBe(403);
        expect(response.body.status).toBe('fail');
        expect(response.body.data.message).toContain('DEVELOPER role required');
    });

    it('returns 200 with correct shape when authenticated as DEVELOPER role', async () => {
        mockUserRole = 'DEVELOPER';
        const response = await request(app)
            .get('/api/v1/admin/developer')
            .set('Authorization', 'Bearer fake-developer-token');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data).toBeDefined();
        expect(response.body.data.health).toBeDefined();
        expect(response.body.data.metrics).toBeDefined();
        expect(response.body.data.envConfig).toBeDefined();
        expect(response.body.data.recentErrors).toBeDefined();
    });

    it('envConfig is an array where each entry has name and status fields only (no value field)', async () => {
        mockUserRole = 'DEVELOPER';
        const response = await request(app)
            .get('/api/v1/admin/developer')
            .set('Authorization', 'Bearer fake-developer-token');

        expect(response.status).toBe(200);
        const { envConfig } = response.body.data;
        expect(Array.isArray(envConfig)).toBe(true);
        expect(envConfig.length).toBeGreaterThan(0);

        for (const entry of envConfig) {
            expect(entry).toHaveProperty('name');
            expect(entry).toHaveProperty('status');
            // CRITICAL: value must never be exposed
            expect(entry).not.toHaveProperty('value');
            expect(['configured', 'missing']).toContain(entry.status);
        }
    });

    it('recentErrors is an array (may be empty)', async () => {
        mockUserRole = 'DEVELOPER';
        const response = await request(app)
            .get('/api/v1/admin/developer')
            .set('Authorization', 'Bearer fake-developer-token');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.data.recentErrors)).toBe(true);
    });

    it('metrics has required fields', async () => {
        mockUserRole = 'DEVELOPER';
        const response = await request(app)
            .get('/api/v1/admin/developer')
            .set('Authorization', 'Bearer fake-developer-token');

        expect(response.status).toBe(200);
        const { metrics } = response.body.data;
        expect(metrics).toHaveProperty('requestCountLastHour');
        expect(metrics).toHaveProperty('requestCountLast24h');
        expect(metrics).toHaveProperty('averageResponseTimeMs');
        expect(metrics).toHaveProperty('errorRate');
    });

    it('recentErrors contains entries when error log buffer has entries', async () => {
        mockUserRole = 'DEVELOPER';
        const sampleError = {
            timestamp: '2026-03-22T10:00:00.000Z',
            level: 'error',
            message: 'Test error',
            method: 'GET',
            url: '/api/test',
            userId: null,
            errorType: 'Error',
        };
        mockErrorLogBufferGetRecent.mockReturnValue([sampleError]);

        const response = await request(app)
            .get('/api/v1/admin/developer')
            .set('Authorization', 'Bearer fake-developer-token');

        expect(response.status).toBe(200);
        expect(response.body.data.recentErrors).toHaveLength(1);
        expect(response.body.data.recentErrors[0].message).toBe('Test error');
    });
});
