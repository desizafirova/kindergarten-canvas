import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// ──────────────────────────────────────────────────────────────────────────────
// Declare mock variables BEFORE any imports (required for jest.mock hoisting)
// ──────────────────────────────────────────────────────────────────────────────
const mockLoggerError = jest.fn() as jest.Mock<any>;
const mockLoggerWarn = jest.fn() as jest.Mock<any>;
const mockLoggerInfo = jest.fn() as jest.Mock<any>;
const mockVerifySesConnection = jest.fn(() => Promise.resolve()) as jest.Mock<any>;
const mockMetricsStoreRecord = jest.fn() as jest.Mock<any>;
const mockMetricsStoreGetMetrics = jest.fn() as jest.Mock<any>;

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
    verifySesConnection: mockVerifySesConnection,
}));

jest.mock('../src/utils/metrics/metrics_store', () => ({
    metricsStore: {
        record: mockMetricsStoreRecord,
        getMetrics: mockMetricsStoreGetMetrics,
    },
}));

jest.mock('../src/config/cloudinary.config', () => ({
    __esModule: true,
    default: {
        api: { ping: jest.fn() },
        config: jest.fn(),
    },
}));

jest.mock('@aws-sdk/client-ses', () => ({
    SESClient: jest.fn().mockImplementation(() => ({ send: jest.fn() })),
    GetSendQuotaCommand: jest.fn(),
}));

jest.mock('../prisma/prisma-client', () => ({
    __esModule: true,
    default: { $queryRaw: jest.fn() },
}));

import express from 'express';
import request from 'supertest';
import multer from 'multer';
import handleError from '../src/middlewares/http_error_handler/error_handler';

// ──────────────────────────────────────────────────────────────────────────────
// Test app that throws specific errors for testing
// ──────────────────────────────────────────────────────────────────────────────
const buildTestApp = () => {
    const app = express();

    app.get('/test-500', (_req, _res, next) => {
        next(new Error('Test error for logging'));
    });

    app.get('/test-auth-unauthorized', (_req, _res, next) => {
        next({ error: 'UnauthorizedError' });
    });

    app.get('/test-auth-jwt', (_req, _res, next) => {
        next({ error: 'JsonWebTokenError' });
    });

    app.get('/test-auth-expired', (_req, _res, next) => {
        next({ error: 'TokenExpiredError' });
    });

    app.get('/test-not-found', (_req, _res, next) => {
        next({ error: 'NotFound' });
    });

    app.get('/test-validation', (_req, _res, next) => {
        next({ error: 'ValidationError', message: 'Field is required' });
    });

    app.get('/test-multer-size', (_req, _res, next) => {
        const err = new multer.MulterError('LIMIT_FILE_SIZE');
        next(err);
    });

    app.get('/test-multer-unexpected', (_req, _res, next) => {
        const err = new multer.MulterError('LIMIT_UNEXPECTED_FILE');
        next(err);
    });

    app.get('/test-multer-generic', (_req, _res, next) => {
        const err = new multer.MulterError('LIMIT_FIELD_COUNT');
        next(err);
    });

    app.get('/test-multer-filetype', (_req, _res, next) => {
        next(new Error('Невалиден тип файл: само JPG, PNG и WebP са позволени'));
    });

    app.get('/test-unprocessable', (_req, _res, next) => {
        next({ error: 'Unprocessable' });
    });

    app.use(handleError);
    return app;
};

const testApp = buildTestApp();

describe('Error Handler Middleware — Winston Logging', () => {
    beforeEach(() => {
        mockLoggerError.mockClear();
        mockLoggerWarn.mockClear();
        mockLoggerInfo.mockClear();
    });

    describe('500 Internal Server Error', () => {
        it('returns 500 and calls logger.error with request context', async () => {
            const res = await request(testApp).get('/test-500');

            expect(res.status).toBe(500);
            expect(res.body).toEqual({
                error: { code: 500, error: 'SERVER_ERROR', message: 'Internal Server Error' },
            });
            expect(mockLoggerError).toHaveBeenCalledWith(
                'Unhandled server error',
                expect.objectContaining({
                    error: 'Test error for logging',
                    stack: expect.stringContaining('Error: Test error for logging'),
                    method: 'GET',
                    url: '/test-500',
                }),
            );
        });

        it('does NOT expose stack trace or internal error in response body', async () => {
            const res = await request(testApp).get('/test-500');

            expect(res.body.error.message).toBe('Internal Server Error');
            expect(JSON.stringify(res.body)).not.toContain('Test error for logging');
            expect(JSON.stringify(res.body)).not.toContain('stack');
        });
    });

    describe('401 JWT Authentication Errors', () => {
        it('returns 401 for UnauthorizedError and calls logger.warn', async () => {
            const res = await request(testApp).get('/test-auth-unauthorized');

            expect(res.status).toBe(401);
            expect(mockLoggerWarn).toHaveBeenCalledWith(
                'Authentication error',
                expect.objectContaining({ method: 'GET', url: '/test-auth-unauthorized' }),
            );
            expect(mockLoggerError).not.toHaveBeenCalled();
        });

        it('returns 401 for JsonWebTokenError and calls logger.warn', async () => {
            const res = await request(testApp).get('/test-auth-jwt');

            expect(res.status).toBe(401);
            expect(mockLoggerWarn).toHaveBeenCalledWith(
                'Authentication error',
                expect.objectContaining({ method: 'GET', url: '/test-auth-jwt' }),
            );
        });

        it('returns 401 for TokenExpiredError and calls logger.warn', async () => {
            const res = await request(testApp).get('/test-auth-expired');

            expect(res.status).toBe(401);
            expect(mockLoggerWarn).toHaveBeenCalledWith(
                'Authentication error',
                expect.objectContaining({ method: 'GET', url: '/test-auth-expired' }),
            );
        });
    });

    describe('404 Not Found', () => {
        it('returns 404 and calls logger.info', async () => {
            const res = await request(testApp).get('/test-not-found');

            expect(res.status).toBe(404);
            expect(mockLoggerInfo).toHaveBeenCalledWith(
                'Resource not found',
                expect.objectContaining({ method: 'GET', url: '/test-not-found' }),
            );
            expect(mockLoggerError).not.toHaveBeenCalled();
            expect(mockLoggerWarn).not.toHaveBeenCalled();
        });
    });

    describe('400 Validation Error', () => {
        it('returns 400 and calls logger.warn with message', async () => {
            const res = await request(testApp).get('/test-validation');

            expect(res.status).toBe(400);
            expect(mockLoggerWarn).toHaveBeenCalledWith(
                'Validation error',
                expect.objectContaining({
                    method: 'GET',
                    url: '/test-validation',
                    message: 'Field is required',
                }),
            );
        });
    });

    describe('400 Multer File Upload Error', () => {
        it('returns 400 for LIMIT_FILE_SIZE and calls logger.warn', async () => {
            const res = await request(testApp).get('/test-multer-size');

            expect(res.status).toBe(400);
            expect(mockLoggerWarn).toHaveBeenCalledWith(
                'File upload error',
                expect.objectContaining({
                    method: 'GET',
                    url: '/test-multer-size',
                    code: 'LIMIT_FILE_SIZE',
                }),
            );
            expect(mockLoggerError).not.toHaveBeenCalled();
        });

        it('returns 400 for LIMIT_UNEXPECTED_FILE and calls logger.warn', async () => {
            const res = await request(testApp).get('/test-multer-unexpected');

            expect(res.status).toBe(400);
            expect(mockLoggerWarn).toHaveBeenCalledWith(
                'File upload error',
                expect.objectContaining({
                    code: 'LIMIT_UNEXPECTED_FILE',
                }),
            );
        });

        it('returns 400 for generic multer error and calls logger.warn', async () => {
            const res = await request(testApp).get('/test-multer-generic');

            expect(res.status).toBe(400);
            expect(mockLoggerWarn).toHaveBeenCalledWith(
                'File upload error',
                expect.objectContaining({ code: 'LIMIT_FIELD_COUNT' }),
            );
        });

        it('returns 400 for invalid file type and calls logger.warn', async () => {
            const res = await request(testApp).get('/test-multer-filetype');

            expect(res.status).toBe(400);
            expect(mockLoggerWarn).toHaveBeenCalledWith(
                'File upload error',
                expect.objectContaining({ code: 'INVALID_FILE_TYPE' }),
            );
        });
    });

    describe('422 Unprocessable Entity', () => {
        it('returns 422 and calls logger.warn', async () => {
            const res = await request(testApp).get('/test-unprocessable');

            expect(res.status).toBe(422);
            expect(mockLoggerWarn).toHaveBeenCalledWith(
                'Unprocessable entity',
                expect.objectContaining({ method: 'GET', url: '/test-unprocessable' }),
            );
            expect(mockLoggerError).not.toHaveBeenCalled();
        });
    });
});

describe('Winston Logger — Configuration Unit Tests', () => {
    // Use jest.requireActual to load the real logger, bypassing the file-level mock
    const realLogger = (jest.requireActual('../src/utils/logger/winston/logger') as any).default;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const winston = require('winston');

    it('logger module loads with transports configured', () => {
        expect(realLogger).toBeDefined();
        expect(realLogger.transports).toBeDefined();
        expect(Array.isArray(realLogger.transports)).toBe(true);
        expect(realLogger.transports.length).toBeGreaterThan(0);
    });

    it('logger has a Console transport for stdout output', () => {
        const consoleTransport = realLogger.transports.find(
            (t: any) => t instanceof winston.transports.Console,
        );
        expect(consoleTransport).toBeDefined();
    });

    it('logger respects level hierarchy (error < warn < info < debug)', () => {
        // Winston default levels: error=0, warn=1, info=2, http=3, verbose=4, debug=5
        const levels = winston.config.npm.levels;
        expect(levels.error).toBeLessThan(levels.warn);
        expect(levels.warn).toBeLessThan(levels.info);
        expect(levels.info).toBeLessThan(levels.debug);
    });

    it('console transport suppresses debug in non-development environment', () => {
        // In non-dev environments, console transport level should be 'info'
        // meaning debug messages are suppressed
        const consoleTransport = realLogger.transports.find(
            (t: any) => t instanceof winston.transports.Console,
        );
        const nodeEnv = process.env.NODE_ENV;
        if (nodeEnv !== 'development') {
            expect(consoleTransport.level).toBe('info');
        } else {
            expect(consoleTransport.level).toBe('debug');
        }
    });
});
