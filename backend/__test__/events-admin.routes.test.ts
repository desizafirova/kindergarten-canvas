import request from 'supertest';
import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import server from '../src/server/http_server';
import globalApiPath from '../src/utils/global_api_path/global_api_path';
import prisma from '../prisma/prisma-client';

const apiPath = globalApiPath();
let app: any;

describe('Events Admin CRUD API', () => {
    let authToken: string;
    let testEventId: number;

    beforeAll(async () => {
        const silent = true;
        app = await server(silent);

        // Login and get auth token
        const loginResponse = await request(app)
            .post(`${apiPath}/client/auth/login`)
            .send({ email: 'admin@kindergarten.bg', password: 'Admin@123456' });

        if (loginResponse.body.success && loginResponse.body.content?.accessToken) {
            authToken = loginResponse.body.content.accessToken;
        } else {
            console.error('Login failed:', loginResponse.body);
            throw new Error('Failed to get auth token - check test user credentials');
        }
    });

    afterAll(async () => {
        // Cleanup test data
        await prisma.event.deleteMany({
            where: { title: { contains: '[TEST]' } },
        });
        await prisma.$disconnect();

        if (app) {
            await new Promise<void>((resolve) => {
                app.close(() => resolve());
            });
        }
    });

    beforeEach(async () => {
        // Clean up test events before each test
        await prisma.event.deleteMany({
            where: { title: { contains: '[TEST]' } },
        });
    });

    // ─── POST: Create Event ────────────────────────────────────────────────────

    describe(`POST ${apiPath}/admin/v1/events (AC5)`, () => {
        it('should create event with DRAFT status by default', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/events`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: '[TEST] Пролетен концерт',
                    eventDate: '2026-04-15T10:00:00.000Z',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.content.title).toBe('[TEST] Пролетен концерт');
            expect(response.body.content.status).toBe('DRAFT');
            expect(response.body.content.isImportant).toBe(false);
            expect(response.body.content.id).toBeDefined();

            testEventId = response.body.content.id;
        });

        it('should create event with all optional fields', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/events`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: '[TEST] Детски празник',
                    eventDate: '2026-05-01T09:00:00.000Z',
                    eventEndDate: '2026-05-01T12:00:00.000Z',
                    location: 'Зала 1',
                    description: '<p>Описание на събитието</p>',
                    isImportant: true,
                    status: 'PUBLISHED',
                });

            expect(response.status).toBe(201);
            expect(response.body.content.isImportant).toBe(true);
            expect(response.body.content.status).toBe('PUBLISHED');
            expect(response.body.content.location).toBe('Зала 1');
        });

        it('should set publishedAt when creating with PUBLISHED status', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/events`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: '[TEST] Публикувано събитие',
                    eventDate: '2026-06-01T10:00:00.000Z',
                    status: 'PUBLISHED',
                });

            expect(response.status).toBe(201);
            expect(response.body.content.status).toBe('PUBLISHED');
            expect(response.body.content.publishedAt).not.toBeNull();
        });

        it('should NOT set publishedAt when creating with DRAFT status', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/events`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: '[TEST] Чернова събитие',
                    eventDate: '2026-06-01T10:00:00.000Z',
                });

            expect(response.status).toBe(201);
            expect(response.body.content.status).toBe('DRAFT');
            expect(response.body.content.publishedAt).toBeNull();
        });

        it('should return 400 when title is missing', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/events`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ eventDate: '2026-04-15T10:00:00.000Z' });

            expect(response.status).toBe(400);
            expect(response.body[0].message).toBe('Заглавието е задължително');
        });

        it('should return 400 when eventDate is missing', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/events`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ title: '[TEST] Събитие' });

            expect(response.status).toBe(400);
            expect(response.body[0].message).toBe('Датата е задължителна');
        });

        it('should return 401 if not authenticated (AC8)', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/events`)
                .send({ title: '[TEST] Събитие', eventDate: '2026-04-15T10:00:00.000Z' });

            expect(response.status).toBe(401);
        });
    });

    // ─── GET: List Events ──────────────────────────────────────────────────────

    describe(`GET ${apiPath}/admin/v1/events (AC1, AC2, AC3)`, () => {
        beforeEach(async () => {
            // Create test events with different statuses and dates
            await prisma.event.createMany({
                data: [
                    {
                        title: '[TEST] Бъдещо DRAFT',
                        eventDate: new Date('2030-06-01T10:00:00.000Z'),
                        status: 'DRAFT',
                    },
                    {
                        title: '[TEST] Бъдещо PUBLISHED',
                        eventDate: new Date('2030-07-01T10:00:00.000Z'),
                        status: 'PUBLISHED',
                    },
                    {
                        title: '[TEST] Минало събитие',
                        eventDate: new Date('2020-01-01T10:00:00.000Z'),
                        status: 'PUBLISHED',
                    },
                ],
            });
        });

        it('should return all events (DRAFT and PUBLISHED) with 200 (AC1)', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/events`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.content)).toBe(true);

            const testEvents = response.body.content.filter((e: any) => e.title.includes('[TEST]'));
            expect(testEvents.length).toBe(3); // all 3 test events
        });

        it('should return events sorted by eventDate ASC (upcoming first) (AC1)', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/events`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            const testEvents = response.body.content.filter((e: any) => e.title.includes('[TEST]'));

            // Check ascending order
            for (let i = 0; i < testEvents.length - 1; i++) {
                const dateA = new Date(testEvents[i].eventDate).getTime();
                const dateB = new Date(testEvents[i + 1].eventDate).getTime();
                expect(dateA).toBeLessThanOrEqual(dateB);
            }
        });

        it('should filter by status=PUBLISHED (AC2)', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/events?status=PUBLISHED`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            const testEvents = response.body.content.filter((e: any) => e.title.includes('[TEST]'));
            testEvents.forEach((e: any) => {
                expect(e.status).toBe('PUBLISHED');
            });
            expect(testEvents.length).toBe(2); // 2 PUBLISHED test events
        });

        it('should filter by status=DRAFT (AC2)', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/events?status=DRAFT`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            const testEvents = response.body.content.filter((e: any) => e.title.includes('[TEST]'));
            testEvents.forEach((e: any) => {
                expect(e.status).toBe('DRAFT');
            });
            expect(testEvents.length).toBe(1); // 1 DRAFT test event
        });

        it('should filter upcoming=true to return only future events (AC3)', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/events?upcoming=true`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            const testEvents = response.body.content.filter((e: any) => e.title.includes('[TEST]'));

            // Should NOT include the past event
            const pastEvent = testEvents.find((e: any) => e.title.includes('Минало'));
            expect(pastEvent).toBeUndefined();

            // All returned events should have eventDate >= now
            const now = new Date();
            testEvents.forEach((e: any) => {
                expect(new Date(e.eventDate).getTime()).toBeGreaterThanOrEqual(now.getTime() - 1000);
            });
        });

        it('should filter combined status=PUBLISHED&upcoming=true (AC2+AC3)', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/events?status=PUBLISHED&upcoming=true`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            const testEvents = response.body.content.filter((e: any) => e.title.includes('[TEST]'));
            // Only future PUBLISHED events — the past PUBLISHED and the DRAFT should be excluded
            testEvents.forEach((e: any) => {
                expect(e.status).toBe('PUBLISHED');
                expect(new Date(e.eventDate).getTime()).toBeGreaterThan(Date.now() - 1000);
            });
            expect(testEvents.length).toBe(1); // only '[TEST] Бъдещо PUBLISHED'
        });

        it('should return 401 if not authenticated (AC8)', async () => {
            const response = await request(app).get(`${apiPath}/admin/v1/events`);
            expect(response.status).toBe(401);
        });
    });

    // ─── GET: Single Event ─────────────────────────────────────────────────────

    describe(`GET ${apiPath}/admin/v1/events/:id (AC4)`, () => {
        beforeEach(async () => {
            const event = await prisma.event.create({
                data: {
                    title: '[TEST] Единично събитие',
                    eventDate: new Date('2026-08-01T10:00:00.000Z'),
                    status: 'DRAFT',
                },
            });
            testEventId = event.id;
        });

        it('should return single event by ID with 200', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/events/${testEventId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.content.id).toBe(testEventId);
            expect(response.body.content.title).toBe('[TEST] Единично събитие');
        });

        it('should return 404 with Bulgarian message for non-existent ID', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/events/999999`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Събитието не е намерено');
        });

        it('should return 401 if not authenticated (AC8)', async () => {
            const response = await request(app).get(`${apiPath}/admin/v1/events/${testEventId}`);
            expect(response.status).toBe(401);
        });
    });

    // ─── PUT: Update Event ─────────────────────────────────────────────────────

    describe(`PUT ${apiPath}/admin/v1/events/:id (AC6)`, () => {
        beforeEach(async () => {
            const event = await prisma.event.create({
                data: {
                    title: '[TEST] Събитие за обновяване',
                    eventDate: new Date('2026-09-01T10:00:00.000Z'),
                    status: 'DRAFT',
                },
            });
            testEventId = event.id;
        });

        it('should update event and refresh updatedAt', async () => {
            // Wait to ensure updatedAt changes
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const response = await request(app)
                .put(`${apiPath}/admin/v1/events/${testEventId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ title: '[TEST] Обновено събитие', status: 'PUBLISHED' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.content.title).toBe('[TEST] Обновено събитие');
            expect(response.body.content.status).toBe('PUBLISHED');
            expect(response.body.content.updatedAt).not.toBe(response.body.content.createdAt);
        });

        it('should update isImportant flag', async () => {
            const response = await request(app)
                .put(`${apiPath}/admin/v1/events/${testEventId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ isImportant: true });

            expect(response.status).toBe(200);
            expect(response.body.content.isImportant).toBe(true);
        });

        it('should return 404 for non-existent event', async () => {
            const response = await request(app)
                .put(`${apiPath}/admin/v1/events/999999`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ title: '[TEST] Не съществува' });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Събитието не е намерено');
        });

        it('should return 401 if not authenticated (AC8)', async () => {
            const response = await request(app)
                .put(`${apiPath}/admin/v1/events/${testEventId}`)
                .send({ title: '[TEST] Обновено' });

            expect(response.status).toBe(401);
        });
    });

    // ─── DELETE: Delete Event ──────────────────────────────────────────────────

    describe(`DELETE ${apiPath}/admin/v1/events/:id (AC7)`, () => {
        beforeEach(async () => {
            const event = await prisma.event.create({
                data: {
                    title: '[TEST] Събитие за изтриване',
                    eventDate: new Date('2026-10-01T10:00:00.000Z'),
                    status: 'DRAFT',
                },
            });
            testEventId = event.id;
        });

        it('should delete event with Bulgarian success message', async () => {
            const response = await request(app)
                .delete(`${apiPath}/admin/v1/events/${testEventId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Събитието е изтрито успешно');
            expect(response.body.content).toBeNull();

            // Verify deletion
            const verifyResponse = await request(app)
                .get(`${apiPath}/admin/v1/events/${testEventId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(verifyResponse.status).toBe(404);
        });

        it('should return 404 when deleting non-existent event', async () => {
            const response = await request(app)
                .delete(`${apiPath}/admin/v1/events/999999`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Събитието не е намерено');
        });

        it('should return 401 if not authenticated (AC8)', async () => {
            const response = await request(app).delete(`${apiPath}/admin/v1/events/${testEventId}`);
            expect(response.status).toBe(401);
        });
    });
});
