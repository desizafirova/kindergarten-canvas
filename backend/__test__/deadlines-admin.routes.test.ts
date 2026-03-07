import request from 'supertest';
import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import server from '../src/server/http_server';
import globalApiPath from '../src/utils/global_api_path/global_api_path';
import prisma from '../prisma/prisma-client';

const apiPath = globalApiPath();
let app: any;

describe('Deadlines Admin CRUD API', () => {
    let authToken: string;
    let testDeadlineId: number;

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
        await prisma.deadline.deleteMany({
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
        // Clean up test deadlines before each test
        await prisma.deadline.deleteMany({
            where: { title: { contains: '[TEST]' } },
        });
    });

    // ─── POST: Create Deadline ─────────────────────────────────────────────────

    describe(`POST ${apiPath}/admin/v1/admission-deadlines (AC5)`, () => {
        it('should create deadline with DRAFT status by default', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/admission-deadlines`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: '[TEST] Записване за учебната година',
                    deadlineDate: '2026-04-15T10:00:00.000Z',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.content.title).toBe('[TEST] Записване за учебната година');
            expect(response.body.content.status).toBe('DRAFT');
            expect(response.body.content.isUrgent).toBe(false);
            expect(response.body.content.id).toBeDefined();

            testDeadlineId = response.body.content.id;
        });

        it('should create deadline with all optional fields', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/admission-deadlines`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: '[TEST] Краен срок с всички полета',
                    deadlineDate: '2026-05-01T09:00:00.000Z',
                    description: '<p>Описание на срока</p>',
                    isUrgent: true,
                    status: 'PUBLISHED',
                });

            expect(response.status).toBe(201);
            expect(response.body.content.isUrgent).toBe(true);
            expect(response.body.content.status).toBe('PUBLISHED');
            expect(response.body.content.description).toBe('<p>Описание на срока</p>');
        });

        it('should set publishedAt when creating with PUBLISHED status', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/admission-deadlines`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: '[TEST] Публикуван срок',
                    deadlineDate: '2026-06-01T10:00:00.000Z',
                    status: 'PUBLISHED',
                });

            expect(response.status).toBe(201);
            expect(response.body.content.status).toBe('PUBLISHED');
            expect(response.body.content.publishedAt).not.toBeNull();
        });

        it('should NOT set publishedAt when creating with DRAFT status', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/admission-deadlines`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: '[TEST] Чернова срок',
                    deadlineDate: '2026-06-01T10:00:00.000Z',
                });

            expect(response.status).toBe(201);
            expect(response.body.content.status).toBe('DRAFT');
            expect(response.body.content.publishedAt).toBeNull();
        });

        it('should return 400 when title is missing', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/admission-deadlines`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ deadlineDate: '2026-04-15T10:00:00.000Z' });

            expect(response.status).toBe(400);
            expect(response.body[0].message).toBe('Заглавието е задължително');
        });

        it('should return 400 when deadlineDate is missing', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/admission-deadlines`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ title: '[TEST] Срок без дата' });

            expect(response.status).toBe(400);
            expect(response.body[0].message).toBe('Крайната дата е задължителна');
        });

        it('should return 401 if not authenticated (AC8)', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/admission-deadlines`)
                .send({ title: '[TEST] Срок', deadlineDate: '2026-04-15T10:00:00.000Z' });

            expect(response.status).toBe(401);
        });
    });

    // ─── GET: List Deadlines ───────────────────────────────────────────────────

    describe(`GET ${apiPath}/admin/v1/admission-deadlines (AC1, AC2, AC3)`, () => {
        beforeEach(async () => {
            // Create test deadlines with different statuses and dates
            await prisma.deadline.createMany({
                data: [
                    {
                        title: '[TEST] Бъдещ DRAFT срок',
                        deadlineDate: new Date('2030-06-01T10:00:00.000Z'),
                        status: 'DRAFT',
                    },
                    {
                        title: '[TEST] Бъдещ PUBLISHED срок',
                        deadlineDate: new Date('2030-07-01T10:00:00.000Z'),
                        status: 'PUBLISHED',
                    },
                    {
                        title: '[TEST] Минал срок',
                        deadlineDate: new Date('2020-01-01T10:00:00.000Z'),
                        status: 'PUBLISHED',
                    },
                ],
            });
        });

        it('should return all deadlines (DRAFT and PUBLISHED) with 200 (AC1)', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/admission-deadlines`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.content)).toBe(true);

            const testDeadlines = response.body.content.filter((d: any) => d.title.includes('[TEST]'));
            expect(testDeadlines.length).toBe(3); // all 3 test deadlines
        });

        it('should return deadlines sorted by deadlineDate ASC (nearest first) (AC1)', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/admission-deadlines`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            const testDeadlines = response.body.content.filter((d: any) => d.title.includes('[TEST]'));

            // Check ascending order
            for (let i = 0; i < testDeadlines.length - 1; i++) {
                const dateA = new Date(testDeadlines[i].deadlineDate).getTime();
                const dateB = new Date(testDeadlines[i + 1].deadlineDate).getTime();
                expect(dateA).toBeLessThanOrEqual(dateB);
            }
        });

        it('should filter by status=PUBLISHED (AC2)', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/admission-deadlines?status=PUBLISHED`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            const testDeadlines = response.body.content.filter((d: any) => d.title.includes('[TEST]'));
            testDeadlines.forEach((d: any) => {
                expect(d.status).toBe('PUBLISHED');
            });
            expect(testDeadlines.length).toBe(2); // 2 PUBLISHED test deadlines
        });

        it('should filter by status=DRAFT (AC2)', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/admission-deadlines?status=DRAFT`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            const testDeadlines = response.body.content.filter((d: any) => d.title.includes('[TEST]'));
            testDeadlines.forEach((d: any) => {
                expect(d.status).toBe('DRAFT');
            });
            expect(testDeadlines.length).toBe(1); // 1 DRAFT test deadline
        });

        it('should filter upcoming=true to return only future deadlines (AC3)', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/admission-deadlines?upcoming=true`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            const testDeadlines = response.body.content.filter((d: any) => d.title.includes('[TEST]'));

            // Should NOT include the past deadline
            const pastDeadline = testDeadlines.find((d: any) => d.title.includes('Минал'));
            expect(pastDeadline).toBeUndefined();

            // All returned deadlines should have deadlineDate >= now
            const now = new Date();
            testDeadlines.forEach((d: any) => {
                expect(new Date(d.deadlineDate).getTime()).toBeGreaterThanOrEqual(now.getTime() - 1000);
            });
        });

        it('should filter combined status=PUBLISHED&upcoming=true (AC2+AC3)', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/admission-deadlines?status=PUBLISHED&upcoming=true`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            const testDeadlines = response.body.content.filter((d: any) => d.title.includes('[TEST]'));
            // Only future PUBLISHED deadlines — the past PUBLISHED and the DRAFT should be excluded
            testDeadlines.forEach((d: any) => {
                expect(d.status).toBe('PUBLISHED');
                expect(new Date(d.deadlineDate).getTime()).toBeGreaterThan(Date.now() - 1000);
            });
            expect(testDeadlines.length).toBe(1); // only '[TEST] Бъдещ PUBLISHED срок'
        });

        it('should return 401 if not authenticated (AC8)', async () => {
            const response = await request(app).get(`${apiPath}/admin/v1/admission-deadlines`);
            expect(response.status).toBe(401);
        });
    });

    // ─── GET: Single Deadline ──────────────────────────────────────────────────

    describe(`GET ${apiPath}/admin/v1/admission-deadlines/:id (AC4)`, () => {
        beforeEach(async () => {
            const deadline = await prisma.deadline.create({
                data: {
                    title: '[TEST] Единичен краен срок',
                    deadlineDate: new Date('2026-08-01T10:00:00.000Z'),
                    status: 'DRAFT',
                },
            });
            testDeadlineId = deadline.id;
        });

        it('should return single deadline by ID with 200', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/admission-deadlines/${testDeadlineId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.content.id).toBe(testDeadlineId);
            expect(response.body.content.title).toBe('[TEST] Единичен краен срок');
        });

        it('should return 404 with Bulgarian message for non-existent ID', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/admission-deadlines/999999`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Срокът не е намерен');
        });

        it('should return 401 if not authenticated (AC8)', async () => {
            const response = await request(app).get(
                `${apiPath}/admin/v1/admission-deadlines/${testDeadlineId}`,
            );
            expect(response.status).toBe(401);
        });
    });

    // ─── PUT: Update Deadline ──────────────────────────────────────────────────

    describe(`PUT ${apiPath}/admin/v1/admission-deadlines/:id (AC6)`, () => {
        beforeEach(async () => {
            const deadline = await prisma.deadline.create({
                data: {
                    title: '[TEST] Срок за обновяване',
                    deadlineDate: new Date('2026-09-01T10:00:00.000Z'),
                    status: 'DRAFT',
                },
            });
            testDeadlineId = deadline.id;
        });

        it('should update deadline and refresh updatedAt', async () => {
            const response = await request(app)
                .put(`${apiPath}/admin/v1/admission-deadlines/${testDeadlineId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ title: '[TEST] Обновен краен срок', status: 'PUBLISHED' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.content.title).toBe('[TEST] Обновен краен срок');
            expect(response.body.content.status).toBe('PUBLISHED');
            expect(response.body.content.updatedAt).toBeDefined();
        });

        it('should update isUrgent flag', async () => {
            const response = await request(app)
                .put(`${apiPath}/admin/v1/admission-deadlines/${testDeadlineId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ isUrgent: true });

            expect(response.status).toBe(200);
            expect(response.body.content.isUrgent).toBe(true);
        });

        it('should clear publishedAt when transitioning from PUBLISHED to DRAFT', async () => {
            // First publish the deadline
            await request(app)
                .put(`${apiPath}/admin/v1/admission-deadlines/${testDeadlineId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ status: 'PUBLISHED' });

            // Verify publishedAt is set
            const publishedResponse = await request(app)
                .get(`${apiPath}/admin/v1/admission-deadlines/${testDeadlineId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(publishedResponse.body.content.publishedAt).not.toBeNull();

            // Transition back to DRAFT
            const draftResponse = await request(app)
                .put(`${apiPath}/admin/v1/admission-deadlines/${testDeadlineId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ status: 'DRAFT' });

            expect(draftResponse.status).toBe(200);
            expect(draftResponse.body.content.status).toBe('DRAFT');
            expect(draftResponse.body.content.publishedAt).toBeNull();
        });

        it('should return 404 for non-existent deadline', async () => {
            const response = await request(app)
                .put(`${apiPath}/admin/v1/admission-deadlines/999999`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ title: '[TEST] Не съществува' });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Срокът не е намерен');
        });

        it('should return 401 if not authenticated (AC8)', async () => {
            const response = await request(app)
                .put(`${apiPath}/admin/v1/admission-deadlines/${testDeadlineId}`)
                .send({ title: '[TEST] Обновен' });

            expect(response.status).toBe(401);
        });
    });

    // ─── DELETE: Delete Deadline ───────────────────────────────────────────────

    describe(`DELETE ${apiPath}/admin/v1/admission-deadlines/:id (AC7)`, () => {
        beforeEach(async () => {
            const deadline = await prisma.deadline.create({
                data: {
                    title: '[TEST] Срок за изтриване',
                    deadlineDate: new Date('2026-10-01T10:00:00.000Z'),
                    status: 'DRAFT',
                },
            });
            testDeadlineId = deadline.id;
        });

        it('should delete deadline with Bulgarian success message', async () => {
            const response = await request(app)
                .delete(`${apiPath}/admin/v1/admission-deadlines/${testDeadlineId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Срокът е изтрит успешно');
            expect(response.body.content).toBeNull();

            // Verify deletion
            const verifyResponse = await request(app)
                .get(`${apiPath}/admin/v1/admission-deadlines/${testDeadlineId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(verifyResponse.status).toBe(404);
        });

        it('should return 404 when deleting non-existent deadline', async () => {
            const response = await request(app)
                .delete(`${apiPath}/admin/v1/admission-deadlines/999999`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Срокът не е намерен');
        });

        it('should return 401 if not authenticated (AC8)', async () => {
            const response = await request(app).delete(
                `${apiPath}/admin/v1/admission-deadlines/${testDeadlineId}`,
            );
            expect(response.status).toBe(401);
        });
    });
});
