import request from 'supertest';
import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import server from '../src/server/http_server';
import globalApiPath from '../src/utils/global_api_path/global_api_path';
import prisma from '../prisma/prisma-client';

const apiPath = globalApiPath();
let app: any;

describe('Jobs Admin CRUD API', () => {
    let authToken: string;
    let testJobId: number;

    const cleanupTestJobs = async () => {
        await prisma.job.deleteMany({
            where: { title: { contains: '[TEST]' } },
        });
    };

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
        await cleanupTestJobs();
        await prisma.$disconnect();

        if (app) {
            await new Promise<void>((resolve) => {
                app.close(() => resolve());
            });
        }
    });

    beforeEach(async () => {
        await cleanupTestJobs();
    });

    // ─── POST: Create Job ──────────────────────────────────────────────────────

    describe(`POST ${apiPath}/admin/v1/jobs (AC5)`, () => {
        it('should create job with DRAFT status and isActive=true by default', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/jobs`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: '[TEST] Junior Developer',
                    description: '<p>Търсим junior developer за нашия екип.</p>',
                    contactEmail: 'hr@kindergarten.bg',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.content.title).toBe('[TEST] Junior Developer');
            expect(response.body.content.status).toBe('DRAFT');
            expect(response.body.content.isActive).toBe(true);
            expect(response.body.content.publishedAt).toBeNull();
            expect(response.body.content.id).toBeDefined();

            testJobId = response.body.content.id;
        });

        it('should create job with PUBLISHED status and set publishedAt (AC5, AC6)', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/jobs`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: '[TEST] Senior Developer',
                    description: '<p>Търсим senior developer.</p>',
                    contactEmail: 'hr@kindergarten.bg',
                    status: 'PUBLISHED',
                });

            expect(response.status).toBe(201);
            expect(response.body.content.status).toBe('PUBLISHED');
            expect(response.body.content.publishedAt).not.toBeNull();
            expect(response.body.content.isActive).toBe(true);
        });

        it('should return 400 when title is missing (AC5)', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/jobs`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    description: '<p>Описание</p>',
                    contactEmail: 'hr@kindergarten.bg',
                });

            expect(response.status).toBe(400);
            expect(response.body[0].message).toBe('Заглавието е задължително');
        });

        it('should return 400 when description is missing (AC5)', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/jobs`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: '[TEST] Позиция',
                    contactEmail: 'hr@kindergarten.bg',
                });

            expect(response.status).toBe(400);
            expect(response.body[0].message).toBe('Описанието е задължително');
        });

        it('should return 400 when contactEmail is missing (AC5)', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/jobs`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: '[TEST] Позиция',
                    description: '<p>Описание</p>',
                });

            expect(response.status).toBe(400);
            expect(response.body[0].message).toBe('Имейлът за контакт е задължителен');
        });

        it('should return 400 when contactEmail is invalid (AC5)', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/jobs`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: '[TEST] Позиция',
                    description: '<p>Описание</p>',
                    contactEmail: 'not-an-email',
                });

            expect(response.status).toBe(400);
            expect(response.body[0].message).toBe('Невалиден имейл формат');
        });

        it('should create job with optional fields (requirements, applicationDeadline) (M3)', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/jobs`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: '[TEST] Позиция с допълнителни полета',
                    description: '<p>Описание</p>',
                    contactEmail: 'hr@kindergarten.bg',
                    requirements: '<p>TypeScript, Node.js</p>',
                    applicationDeadline: '2026-12-31T23:59:59.000Z',
                });

            expect(response.status).toBe(201);
            expect(response.body.content.requirements).toBe('<p>TypeScript, Node.js</p>');
            expect(response.body.content.applicationDeadline).not.toBeNull();
        });

        it('should return 401 if not authenticated (AC8)', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/jobs`)
                .send({
                    title: '[TEST] Позиция',
                    description: '<p>Описание</p>',
                    contactEmail: 'hr@kindergarten.bg',
                });

            expect(response.status).toBe(401);
        });
    });

    // ─── GET: List Jobs ────────────────────────────────────────────────────────

    describe(`GET ${apiPath}/admin/v1/jobs (AC1, AC2, AC3)`, () => {
        beforeEach(async () => {
            await prisma.job.createMany({
                data: [
                    {
                        title: '[TEST] DRAFT позиция',
                        description: '<p>Описание</p>',
                        contactEmail: 'hr1@kindergarten.bg',
                        status: 'DRAFT',
                        isActive: true,
                    },
                    {
                        title: '[TEST] PUBLISHED активна',
                        description: '<p>Описание</p>',
                        contactEmail: 'hr2@kindergarten.bg',
                        status: 'PUBLISHED',
                        isActive: true,
                        publishedAt: new Date(),
                    },
                    {
                        title: '[TEST] PUBLISHED неактивна',
                        description: '<p>Описание</p>',
                        contactEmail: 'hr3@kindergarten.bg',
                        status: 'PUBLISHED',
                        isActive: false,
                        publishedAt: new Date(),
                    },
                ],
            });
        });

        it('should return all jobs (DRAFT and PUBLISHED) with 200 (AC1)', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/jobs`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.content)).toBe(true);

            const testJobs = response.body.content.filter((j: any) => j.title.includes('[TEST]'));
            expect(testJobs.length).toBe(3);

            // AC1: verify all required fields are present
            const job = testJobs[0];
            expect(job).toHaveProperty('id');
            expect(job).toHaveProperty('title');
            expect(job).toHaveProperty('description');
            expect(job).toHaveProperty('requirements');
            expect(job).toHaveProperty('contactEmail');
            expect(job).toHaveProperty('applicationDeadline');
            expect(job).toHaveProperty('isActive');
            expect(job).toHaveProperty('status');
            expect(job).toHaveProperty('publishedAt');
            expect(job).toHaveProperty('createdAt');
            expect(job).toHaveProperty('updatedAt');
        });

        it('should return jobs sorted by createdAt DESC (newest first) (AC1)', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/jobs`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            const testJobs = response.body.content.filter((j: any) => j.title.includes('[TEST]'));

            for (let i = 0; i < testJobs.length - 1; i++) {
                const dateA = new Date(testJobs[i].createdAt).getTime();
                const dateB = new Date(testJobs[i + 1].createdAt).getTime();
                expect(dateA).toBeGreaterThanOrEqual(dateB);
            }
        });

        it('should filter by status=PUBLISHED (AC2)', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/jobs?status=PUBLISHED`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            const testJobs = response.body.content.filter((j: any) => j.title.includes('[TEST]'));
            testJobs.forEach((j: any) => {
                expect(j.status).toBe('PUBLISHED');
            });
            expect(testJobs.length).toBe(2);
        });

        it('should filter by status=DRAFT (AC2)', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/jobs?status=DRAFT`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            const testJobs = response.body.content.filter((j: any) => j.title.includes('[TEST]'));
            testJobs.forEach((j: any) => {
                expect(j.status).toBe('DRAFT');
            });
            expect(testJobs.length).toBe(1);
        });

        it('should filter by isActive=false (AC3)', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/jobs?isActive=false`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            const testJobs = response.body.content.filter((j: any) => j.title.includes('[TEST]'));
            testJobs.forEach((j: any) => {
                expect(j.isActive).toBe(false);
            });
            expect(testJobs.length).toBe(1);
        });

        it('should filter combined status=PUBLISHED&isActive=true (AC2+AC3)', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/jobs?status=PUBLISHED&isActive=true`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            const testJobs = response.body.content.filter((j: any) => j.title.includes('[TEST]'));
            testJobs.forEach((j: any) => {
                expect(j.status).toBe('PUBLISHED');
                expect(j.isActive).toBe(true);
            });
            expect(testJobs.length).toBe(1);
        });

        it('should return 401 if not authenticated (AC8)', async () => {
            const response = await request(app).get(`${apiPath}/admin/v1/jobs`);
            expect(response.status).toBe(401);
        });
    });

    // ─── GET: Single Job ───────────────────────────────────────────────────────

    describe(`GET ${apiPath}/admin/v1/jobs/:id (AC4)`, () => {
        beforeEach(async () => {
            const job = await prisma.job.create({
                data: {
                    title: '[TEST] Единична позиция',
                    description: '<p>Описание</p>',
                    contactEmail: 'hr@kindergarten.bg',
                    status: 'DRAFT',
                },
            });
            testJobId = job.id;
        });

        it('should return single job by ID with 200 (AC4)', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/jobs/${testJobId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.content.id).toBe(testJobId);
            expect(response.body.content.title).toBe('[TEST] Единична позиция');
        });

        it('should return 404 with Bulgarian message for non-existent ID (AC4)', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/jobs/999999`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Позицията не е намерена');
        });

        it('should return 400 for non-numeric ID (AC4)', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/jobs/abc`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(400);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        it('should return 401 if not authenticated (AC8)', async () => {
            const response = await request(app).get(`${apiPath}/admin/v1/jobs/${testJobId}`);
            expect(response.status).toBe(401);
        });
    });

    // ─── PUT: Update Job ───────────────────────────────────────────────────────

    describe(`PUT ${apiPath}/admin/v1/jobs/:id (AC6)`, () => {
        beforeEach(async () => {
            const job = await prisma.job.create({
                data: {
                    title: '[TEST] Позиция за обновяване',
                    description: '<p>Описание</p>',
                    contactEmail: 'hr@kindergarten.bg',
                    status: 'DRAFT',
                },
            });
            testJobId = job.id;
        });

        it('should update job and refresh updatedAt (AC6)', async () => {
            const response = await request(app)
                .put(`${apiPath}/admin/v1/jobs/${testJobId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ title: '[TEST] Обновена позиция' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.content.title).toBe('[TEST] Обновена позиция');
            expect(response.body.content.updatedAt).not.toBe(response.body.content.createdAt);
        });

        it('should set publishedAt when status changes DRAFT→PUBLISHED (AC6)', async () => {
            const response = await request(app)
                .put(`${apiPath}/admin/v1/jobs/${testJobId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ status: 'PUBLISHED' });

            expect(response.status).toBe(200);
            expect(response.body.content.status).toBe('PUBLISHED');
            expect(response.body.content.publishedAt).not.toBeNull();
        });

        it('should clear publishedAt when status changes PUBLISHED→DRAFT (AC6)', async () => {
            // First publish
            await prisma.job.update({
                where: { id: testJobId },
                data: { status: 'PUBLISHED', publishedAt: new Date() },
            });

            const response = await request(app)
                .put(`${apiPath}/admin/v1/jobs/${testJobId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ status: 'DRAFT' });

            expect(response.status).toBe(200);
            expect(response.body.content.status).toBe('DRAFT');
            expect(response.body.content.publishedAt).toBeNull();
        });

        it('should return 404 for non-existent job (AC6)', async () => {
            const response = await request(app)
                .put(`${apiPath}/admin/v1/jobs/999999`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ title: '[TEST] Не съществува' });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Позицията не е намерена');
        });

        it('should return 400 for non-numeric ID (H2)', async () => {
            const response = await request(app)
                .put(`${apiPath}/admin/v1/jobs/abc`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ title: '[TEST] Обновена' });

            expect(response.status).toBe(400);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should return 401 if not authenticated (AC8)', async () => {
            const response = await request(app)
                .put(`${apiPath}/admin/v1/jobs/${testJobId}`)
                .send({ title: '[TEST] Обновена' });

            expect(response.status).toBe(401);
        });
    });

    // ─── DELETE: Delete Job ────────────────────────────────────────────────────

    describe(`DELETE ${apiPath}/admin/v1/jobs/:id (AC7)`, () => {
        beforeEach(async () => {
            const job = await prisma.job.create({
                data: {
                    title: '[TEST] Позиция за изтриване',
                    description: '<p>Описание</p>',
                    contactEmail: 'hr@kindergarten.bg',
                    status: 'DRAFT',
                },
            });
            testJobId = job.id;
        });

        it('should delete job with Bulgarian success message (AC7)', async () => {
            const response = await request(app)
                .delete(`${apiPath}/admin/v1/jobs/${testJobId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Позицията е изтрита успешно');
            expect(response.body.content).toBeNull();

            // Verify deletion
            const verifyResponse = await request(app)
                .get(`${apiPath}/admin/v1/jobs/${testJobId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(verifyResponse.status).toBe(404);
        });

        it('should return 404 when deleting non-existent job (AC7)', async () => {
            const response = await request(app)
                .delete(`${apiPath}/admin/v1/jobs/999999`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Позицията не е намерена');
        });

        it('should return 400 for non-numeric ID (H2)', async () => {
            const response = await request(app)
                .delete(`${apiPath}/admin/v1/jobs/abc`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(400);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should return 401 if not authenticated (AC8)', async () => {
            const response = await request(app).delete(`${apiPath}/admin/v1/jobs/${testJobId}`);
            expect(response.status).toBe(401);
        });
    });
});
