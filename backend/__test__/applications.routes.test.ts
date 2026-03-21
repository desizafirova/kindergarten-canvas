import request from 'supertest';
import { describe, it, expect, jest, beforeAll, afterAll } from '@jest/globals';
import server from '../src/server/http_server';
import globalApiPath from '../src/utils/global_api_path/global_api_path';
import prisma from '../prisma/prisma-client';
import { sendApplicationEmail, sendConfirmationEmail } from '../src/services/email';

jest.mock('../src/services/email', () => ({
    sendApplicationEmail: (jest.fn() as jest.Mock<any>).mockResolvedValue(true),
    sendConfirmationEmail: (jest.fn() as jest.Mock<any>).mockResolvedValue(true),
}));

const apiPath = globalApiPath();

describe('Job Application Public API', () => {
    let testJobId: number;
    let setupApp: any;

    const cleanupTestJobs = async () => {
        await prisma.job.deleteMany({
            where: { title: { contains: '[TEST-APP]' } },
        });
    };

    const attachValidPdf = (req: request.Test) =>
        req.attach('cv', Buffer.from('%PDF-1.4 test content'), {
            filename: 'test-cv.pdf',
            contentType: 'application/pdf',
        });

    // Shared setup: create the test job in the database once
    beforeAll(async () => {
        setupApp = await server(true);

        await cleanupTestJobs();

        const loginResponse = await request(setupApp)
            .post(`${apiPath}/client/auth/login`)
            .send({ email: 'admin@kindergarten.bg', password: 'Admin@123456' });

        const authToken = loginResponse.body.content?.accessToken;

        const jobRes = await request(setupApp)
            .post(`${apiPath}/admin/v1/jobs`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                title: '[TEST-APP] Application Test Position',
                description: '<p>Test description</p>',
                contactEmail: 'hr@test.bg',
                isActive: true,
            });

        const createdJobId = jobRes.body.data?.job?.id;

        // Publish it
        await request(setupApp)
            .put(`${apiPath}/admin/v1/jobs/${createdJobId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                title: '[TEST-APP] Application Test Position',
                description: '<p>Test description</p>',
                contactEmail: 'hr@test.bg',
                isActive: true,
                status: 'PUBLISHED',
            });

        testJobId = createdJobId;
    });

    afterAll(async () => {
        await cleanupTestJobs();
        await prisma.$disconnect();

        if (setupApp) {
            await new Promise<void>((resolve) => setupApp.close(() => resolve()));
        }
    });

    // ─── Input validation tests ────────────────────────────────────────────────
    // Uses a fresh app instance to avoid exhausting the 5-req/hr applicationLimiter
    // before reaching the cv-missing and 404 tests.

    describe(`POST ${apiPath}/v1/public/applications — input validation`, () => {
        let validationApp: any;

        beforeAll(async () => {
            validationApp = await server(true); // fresh in-memory rate limiter state
        });

        afterAll(async () => {
            if (validationApp) {
                await new Promise<void>((resolve) => validationApp.close(() => resolve()));
            }
        });

        it('returns 201 for valid multipart application', async () => {
            const req = request(validationApp)
                .post(`${apiPath}/v1/public/applications`)
                .field('name', 'Test Applicant')
                .field('email', 'applicant@test.bg')
                .field('phone', '0888123456')
                .field('jobId', String(testJobId));

            const response = await attachValidPdf(req);

            expect(response.status).toBe(201);
            expect(response.body.status).toBe('success');
            expect(response.body.data.message).toBe('Кандидатурата е изпратена успешно!');
            expect(sendConfirmationEmail).toHaveBeenCalledTimes(1);
        });

        it('returns 201 with optional cover letter included', async () => {
            const req = request(validationApp)
                .post(`${apiPath}/v1/public/applications`)
                .field('name', 'Test Applicant')
                .field('email', 'applicant@test.bg')
                .field('phone', '0888123456')
                .field('coverLetter', 'Много искам да работя тук!')
                .field('jobId', String(testJobId));

            const response = await attachValidPdf(req);

            expect(response.status).toBe(201);
        });

        it('returns 400 when name is missing', async () => {
            const req = request(validationApp)
                .post(`${apiPath}/v1/public/applications`)
                .field('email', 'applicant@test.bg')
                .field('phone', '0888123456')
                .field('jobId', String(testJobId));

            const response = await attachValidPdf(req);

            expect(response.status).toBe(400);
            expect(response.body.status).toBe('fail');
        });

        it('returns 400 for invalid email format', async () => {
            const req = request(validationApp)
                .post(`${apiPath}/v1/public/applications`)
                .field('name', 'Test Applicant')
                .field('email', 'not-an-email')
                .field('phone', '0888123456')
                .field('jobId', String(testJobId));

            const response = await attachValidPdf(req);

            expect(response.status).toBe(400);
            expect(response.body.status).toBe('fail');
        });

        it('returns 400 when phone is missing', async () => {
            const req = request(validationApp)
                .post(`${apiPath}/v1/public/applications`)
                .field('name', 'Test Applicant')
                .field('email', 'applicant@test.bg')
                .field('jobId', String(testJobId));

            const response = await attachValidPdf(req);

            expect(response.status).toBe(400);
        });

        it('returns 400 when cv file is missing', async () => {
            const response = await request(validationApp)
                .post(`${apiPath}/v1/public/applications`)
                .field('name', 'Test Applicant')
                .field('email', 'applicant@test.bg')
                .field('phone', '0888123456')
                .field('jobId', String(testJobId));

            expect(response.status).toBe(400);
            expect(response.body.data?.cv).toBeDefined();
        });

        it('returns 404 if jobId references non-existent job', async () => {
            const req = request(validationApp)
                .post(`${apiPath}/v1/public/applications`)
                .field('name', 'Test Applicant')
                .field('email', 'applicant@test.bg')
                .field('phone', '0888123456')
                .field('jobId', '999999');

            const response = await attachValidPdf(req);

            expect(response.status).toBe(404);
            expect(response.body.status).toBe('fail');
        });
    });

    // ─── Email failure path test ───────────────────────────────────────────────
    // Uses a separate fresh app instance to isolate from rate limit consumption.

    describe(`POST ${apiPath}/v1/public/applications — email failure`, () => {
        let emailFailApp: any;

        beforeAll(async () => {
            emailFailApp = await server(true);
        });

        afterAll(async () => {
            if (emailFailApp) {
                await new Promise<void>((resolve) => emailFailApp.close(() => resolve()));
            }
        });

        it('returns 201 even when confirmation email fails (AC 5)', async () => {
            (sendConfirmationEmail as jest.Mock<any>).mockResolvedValueOnce(false);

            const req = request(emailFailApp)
                .post(`${apiPath}/v1/public/applications`)
                .field('name', 'Test Applicant')
                .field('email', 'applicant@test.bg')
                .field('phone', '0888123456')
                .field('jobId', String(testJobId));

            const response = await attachValidPdf(req);

            expect(response.status).toBe(201);
            expect(response.body.status).toBe('success');
        });

        it('returns 500 when email service fails to send', async () => {
            (sendApplicationEmail as jest.Mock<any>).mockResolvedValueOnce(false);

            const req = request(emailFailApp)
                .post(`${apiPath}/v1/public/applications`)
                .field('name', 'Test Applicant')
                .field('email', 'applicant@test.bg')
                .field('phone', '0888123456')
                .field('jobId', String(testJobId));

            const response = await attachValidPdf(req);

            expect(response.status).toBe(500);
            expect(response.body.status).toBe('error');
            expect(response.body.message).toBe(
                'Възникна проблем. Моля, опитайте отново или се свържете директно.',
            );
        });
    });

    // ─── Rate limiting test ────────────────────────────────────────────────────
    // Uses a separate fresh app instance so the 5-req/hr limit is not pre-consumed
    // by the validation tests above.

    describe(`POST ${apiPath}/v1/public/applications — rate limiting`, () => {
        let rateLimitApp: any;

        beforeAll(async () => {
            rateLimitApp = await server(true); // fresh in-memory rate limiter state
        });

        afterAll(async () => {
            if (rateLimitApp) {
                await new Promise<void>((resolve) => rateLimitApp.close(() => resolve()));
            }
        });

        it('returns 429 after 5 requests from same IP within window', async () => {
            // Send 5 valid requests to exhaust the applicationLimiter (5/hr/IP)
            for (let i = 0; i < 5; i++) {
                const req = request(rateLimitApp)
                    .post(`${apiPath}/v1/public/applications`)
                    .field('name', 'Rate Limit Test')
                    .field('email', `rl${i}@test.bg`)
                    .field('phone', '0888123456')
                    .field('jobId', String(testJobId));
                await attachValidPdf(req);
            }

            // 6th request should be rate-limited
            const req = request(rateLimitApp)
                .post(`${apiPath}/v1/public/applications`)
                .field('name', 'Rate Limit Test')
                .field('email', 'rl6@test.bg')
                .field('phone', '0888123456')
                .field('jobId', String(testJobId));
            const response = await attachValidPdf(req);

            expect(response.status).toBe(429);
        });
    });
});
