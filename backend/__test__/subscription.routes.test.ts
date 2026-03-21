import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import server from '../src/server/http_server';
import globalApiPath from '../src/utils/global_api_path/global_api_path';
import prisma from '../prisma/prisma-client';

const apiPath = globalApiPath();

// Unique email domain for test data identification and cleanup
const TEST_DOMAIN = 'story82test.example.com';

const cleanupTestSubscribers = async () => {
    await prisma.emailSubscriber.deleteMany({
        where: { email: { contains: TEST_DOMAIN } },
    });
};

describe('Parent Subscription Management API', () => {
    let app: any;

    beforeAll(async () => {
        app = await server(true);
        await cleanupTestSubscribers();
    });

    afterAll(async () => {
        await cleanupTestSubscribers();
        await prisma.$disconnect();
        if (app) {
            await new Promise<void>((resolve) => app.close(() => resolve()));
        }
    });

    // ─── POST /subscribe — AC1: valid new subscriber ──────────────────────────
    it(`POST ${apiPath}/v1/public/subscribe — returns 201 for valid new subscriber (AC1)`, async () => {
        const response = await request(app)
            .post(`${apiPath}/v1/public/subscribe`)
            .send({ email: `new-sub@${TEST_DOMAIN}`, subscriptionTypes: ['NEWS', 'EVENTS'] });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
        expect(response.body.data.message).toBe('Успешно се абонирахте за известия!');

        // Verify DB: isActive=true, unsubscribedAt=null, 64-char token
        const subscriber = await prisma.emailSubscriber.findUnique({
            where: { email: `new-sub@${TEST_DOMAIN}` },
        });
        expect(subscriber).not.toBeNull();
        expect(subscriber?.isActive).toBe(true);
        expect(subscriber?.unsubscribedAt).toBeNull();
        expect(subscriber?.unsubscribeToken).toHaveLength(64);
    });

    // ─── POST /subscribe — AC2: duplicate email ───────────────────────────────
    // Reuses the subscriber created by AC1 test — no extra API request
    it(`POST ${apiPath}/v1/public/subscribe — returns 200 for already-subscribed email (AC2)`, async () => {
        // This uses the email created in the AC1 test above
        const response = await request(app)
            .post(`${apiPath}/v1/public/subscribe`)
            .send({ email: `new-sub@${TEST_DOMAIN}`, subscriptionTypes: ['NEWS'] });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.message).toBe('Вече сте абонирани');

        // Verify: record was NOT duplicated
        const count = await prisma.emailSubscriber.count({
            where: { email: `new-sub@${TEST_DOMAIN}` },
        });
        expect(count).toBe(1);
    });

    // ─── POST /subscribe — AC3: invalid email ────────────────────────────────
    it(`POST ${apiPath}/v1/public/subscribe — returns 400 for invalid email (AC3)`, async () => {
        const response = await request(app)
            .post(`${apiPath}/v1/public/subscribe`)
            .send({ email: 'not-an-email', subscriptionTypes: ['NEWS'] });

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('fail');
        expect(response.body.data.email).toBeDefined();
        expect(response.body.data.email[0]).toBe('Невалиден имейл адрес');
    });

    // ─── POST /subscribe — AC7: empty subscriptionTypes ──────────────────────
    it(`POST ${apiPath}/v1/public/subscribe — returns 400 for empty subscriptionTypes (AC7)`, async () => {
        const response = await request(app)
            .post(`${apiPath}/v1/public/subscribe`)
            .send({ email: `valid@${TEST_DOMAIN}`, subscriptionTypes: [] });

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('fail');
        expect(response.body.data.subscriptionTypes).toBeDefined();
    });

    // ─── POST /subscribe — AC7: missing subscriptionTypes field ─────────────
    it(`POST ${apiPath}/v1/public/subscribe — returns 400 when subscriptionTypes is missing (AC7)`, async () => {
        const response = await request(app)
            .post(`${apiPath}/v1/public/subscribe`)
            .send({ email: `valid3@${TEST_DOMAIN}` });

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('fail');
        expect(response.body.data.subscriptionTypes).toBeDefined();
    });

    // ─── POST /subscribe — AC7: invalid subscriptionType value ───────────────
    it(`POST ${apiPath}/v1/public/subscribe — returns 400 for invalid subscriptionType (AC7)`, async () => {
        const response = await request(app)
            .post(`${apiPath}/v1/public/subscribe`)
            .send({ email: `valid2@${TEST_DOMAIN}`, subscriptionTypes: ['NEWS', 'INVALID'] });

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('fail');
        expect(response.body.data.subscriptionTypes).toBeDefined();
    });

    // ─── GET /unsubscribe — setup via prisma (no rate-limit consumption) ─────

    describe(`GET ${apiPath}/v1/public/unsubscribe`, () => {
        const TEST_UNSUB_TOKEN = 'story82testunsubscribetoken0000000000000000000000000000000000000';

        beforeAll(async () => {
            // Create subscriber directly via prisma to avoid consuming rate-limit slots
            await prisma.emailSubscriber.upsert({
                where: { email: `unsub@${TEST_DOMAIN}` },
                create: {
                    email: `unsub@${TEST_DOMAIN}`,
                    subscriptionTypes: ['NEWS'],
                    unsubscribeToken: TEST_UNSUB_TOKEN,
                },
                update: {
                    isActive: true,
                    unsubscribedAt: null,
                    unsubscribeToken: TEST_UNSUB_TOKEN,
                },
            });
        });

        it('returns 200 HTML with success text for valid token and updates DB (AC4)', async () => {
            const response = await request(app)
                .get(`${apiPath}/v1/public/unsubscribe`)
                .query({ token: TEST_UNSUB_TOKEN });

            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toMatch(/text\/html/);
            expect(response.text).toContain('Успешно се отписахте от известията');

            // Verify DB: isActive=false, unsubscribedAt set (AC4)
            const subscriber = await prisma.emailSubscriber.findUnique({
                where: { unsubscribeToken: TEST_UNSUB_TOKEN },
            });
            expect(subscriber?.isActive).toBe(false);
            expect(subscriber?.unsubscribedAt).not.toBeNull();
        });

        it('returns 400 HTML for invalid token (AC5)', async () => {
            const response = await request(app)
                .get(`${apiPath}/v1/public/unsubscribe`)
                .query({ token: 'invalid-token-does-not-exist' });

            expect(response.status).toBe(400);
            expect(response.headers['content-type']).toMatch(/text\/html/);
            expect(response.text).toContain('Невалиден или изтекъл линк');
        });

        it('returns 400 HTML for missing token (AC5)', async () => {
            const response = await request(app).get(`${apiPath}/v1/public/unsubscribe`);

            expect(response.status).toBe(400);
            expect(response.headers['content-type']).toMatch(/text\/html/);
            expect(response.text).toContain('Невалиден или изтекъл линк');
        });
    });

    // ─── GET /api/admin/v1/subscribers ────────────────────────────────────────

    describe(`GET ${apiPath}/admin/v1/subscribers`, () => {
        let authToken: string;

        beforeAll(async () => {
            const loginResponse = await request(app)
                .post(`${apiPath}/client/auth/login`)
                .send({ email: 'admin@kindergarten.bg', password: 'Admin@123456' });

            authToken = loginResponse.body.content?.accessToken;
        });

        it('returns 200 with counts (no emails) for authenticated admin (AC6)', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/subscribers`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('success');
            expect(response.body.data.counts).toBeDefined();
            expect(typeof response.body.data.counts.NEWS).toBe('number');
            expect(typeof response.body.data.counts.EVENTS).toBe('number');
            expect(typeof response.body.data.counts.DEADLINES).toBe('number');
            expect(typeof response.body.data.counts.total).toBe('number');

            // Privacy protection: no email addresses in response (AC6)
            const responseStr = JSON.stringify(response.body);
            expect(responseStr).not.toMatch(/@/);
        });

        it('returns 401 without auth token', async () => {
            const response = await request(app).get(`${apiPath}/admin/v1/subscribers`);
            expect(response.status).toBe(401);
        });
    });
});
