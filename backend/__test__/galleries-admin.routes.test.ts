import request from 'supertest';
import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import server from '../src/server/http_server';
import globalApiPath from '../src/utils/global_api_path/global_api_path';
import prisma from '../prisma/prisma-client';

const apiPath = globalApiPath();
let app: any;

describe('Galleries Admin CRUD API', () => {
    let authToken: string;
    let testGalleryId: number;

    const cleanupTestGalleries = async () => {
        await prisma.gallery.deleteMany({
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
        await cleanupTestGalleries();
        await prisma.$disconnect();

        if (app) {
            await new Promise<void>((resolve) => {
                app.close(() => resolve());
            });
        }
    });

    beforeEach(async () => {
        await cleanupTestGalleries();
    });

    // ─── POST: Create Gallery ──────────────────────────────────────────────────

    describe(`POST ${apiPath}/admin/v1/galleries (AC4)`, () => {
        it('should create gallery with DRAFT status and publishedAt=null by default (AC4)', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/galleries`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ title: '[TEST] Лятно тържество 2024' });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.content.title).toBe('[TEST] Лятно тържество 2024');
            expect(response.body.content.status).toBe('DRAFT');
            expect(response.body.content.publishedAt).toBeNull();
            expect(response.body.content.id).toBeDefined();
            expect(Array.isArray(response.body.content.images)).toBe(true);
            expect(response.body.content.images.length).toBe(0);

            testGalleryId = response.body.content.id;
        });

        it('should create gallery with PUBLISHED status and set publishedAt (AC4, AC5)', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/galleries`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ title: '[TEST] Публикувана галерия', status: 'PUBLISHED' });

            expect(response.status).toBe(201);
            expect(response.body.content.status).toBe('PUBLISHED');
            expect(response.body.content.publishedAt).not.toBeNull();
        });

        it('should return 400 when title is missing (AC4)', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/galleries`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ description: 'Описание без заглавие' });

            expect(response.status).toBe(400);
            expect(response.body[0].message).toBe('Заглавието е задължително');
        });

        it('should create gallery with optional description (M3)', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/galleries`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: '[TEST] Есенно тържество',
                    description: 'Снимки от есенното тържество',
                });

            expect(response.status).toBe(201);
            expect(response.body.content.description).toBe('Снимки от есенното тържество');
        });

        it('should return 401 if not authenticated (AC7)', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/galleries`)
                .send({ title: '[TEST] Неавторизирана галерия' });

            expect(response.status).toBe(401);
        });
    });

    // ─── GET: List Galleries ───────────────────────────────────────────────────

    describe(`GET ${apiPath}/admin/v1/galleries (AC1, AC2)`, () => {
        beforeEach(async () => {
            // Use staggered createdAt timestamps so DESC sorting is deterministic
            const now = Date.now();
            await prisma.gallery.createMany({
                data: [
                    {
                        title: '[TEST] DRAFT галерия',
                        status: 'DRAFT',
                        createdAt: new Date(now - 2000),
                    },
                    {
                        title: '[TEST] PUBLISHED галерия 1',
                        status: 'PUBLISHED',
                        publishedAt: new Date(now - 1000),
                        createdAt: new Date(now - 1000),
                    },
                    {
                        title: '[TEST] PUBLISHED галерия 2',
                        status: 'PUBLISHED',
                        publishedAt: new Date(now),
                        createdAt: new Date(now),
                    },
                ],
            });
        });

        it('should return all galleries (DRAFT and PUBLISHED) with 200 (AC1)', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/galleries`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.content)).toBe(true);

            const testGalleries = response.body.content.filter((g: any) =>
                g.title.includes('[TEST]')
            );
            expect(testGalleries.length).toBe(3);

            // AC1: verify all required fields are present, including imageCount
            const gallery = testGalleries[0];
            expect(gallery).toHaveProperty('id');
            expect(gallery).toHaveProperty('title');
            expect(gallery).toHaveProperty('description');
            expect(gallery).toHaveProperty('coverImageUrl');
            expect(gallery).toHaveProperty('status');
            expect(gallery).toHaveProperty('publishedAt');
            expect(gallery).toHaveProperty('createdAt');
            expect(gallery).toHaveProperty('updatedAt');
            expect(gallery).toHaveProperty('imageCount');
            expect(gallery).not.toHaveProperty('_count'); // _count must be transformed away
        });

        it('should return galleries sorted by createdAt DESC (newest first) (AC1)', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/galleries`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            const testGalleries = response.body.content.filter((g: any) =>
                g.title.includes('[TEST]')
            );

            for (let i = 0; i < testGalleries.length - 1; i++) {
                const dateA = new Date(testGalleries[i].createdAt).getTime();
                const dateB = new Date(testGalleries[i + 1].createdAt).getTime();
                expect(dateA).toBeGreaterThanOrEqual(dateB);
            }
        });

        it('should filter by status=PUBLISHED (AC2)', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/galleries?status=PUBLISHED`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            const testGalleries = response.body.content.filter((g: any) =>
                g.title.includes('[TEST]')
            );
            testGalleries.forEach((g: any) => {
                expect(g.status).toBe('PUBLISHED');
            });
            expect(testGalleries.length).toBe(2);
        });

        it('should filter by status=DRAFT (AC2)', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/galleries?status=DRAFT`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            const testGalleries = response.body.content.filter((g: any) =>
                g.title.includes('[TEST]')
            );
            testGalleries.forEach((g: any) => {
                expect(g.status).toBe('DRAFT');
            });
            expect(testGalleries.length).toBe(1);
        });

        it('should return 401 if not authenticated (AC7)', async () => {
            const response = await request(app).get(`${apiPath}/admin/v1/galleries`);
            expect(response.status).toBe(401);
        });
    });

    // ─── GET: Single Gallery ───────────────────────────────────────────────────

    describe(`GET ${apiPath}/admin/v1/galleries/:id (AC3)`, () => {
        beforeEach(async () => {
            const gallery = await prisma.gallery.create({
                data: {
                    title: '[TEST] Единична галерия',
                    status: 'DRAFT',
                },
            });
            testGalleryId = gallery.id;
        });

        it('should return single gallery by ID with images array (AC3)', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/galleries/${testGalleryId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.content.id).toBe(testGalleryId);
            expect(response.body.content.title).toBe('[TEST] Единична галерия');
            expect(Array.isArray(response.body.content.images)).toBe(true);
        });

        it('should return 404 with Bulgarian message for non-existent ID (AC3)', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/galleries/999999`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Галерията не е намерена');
        });

        it('should return 400 for non-numeric ID (AC3)', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/galleries/abc`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(400);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        it('should return 401 if not authenticated (AC7)', async () => {
            const response = await request(app).get(
                `${apiPath}/admin/v1/galleries/${testGalleryId}`
            );
            expect(response.status).toBe(401);
        });
    });

    // ─── PUT: Update Gallery ───────────────────────────────────────────────────

    describe(`PUT ${apiPath}/admin/v1/galleries/:id (AC5)`, () => {
        let originalUpdatedAt: Date;

        beforeEach(async () => {
            const gallery = await prisma.gallery.create({
                data: {
                    title: '[TEST] Галерия за обновяване',
                    status: 'DRAFT',
                },
            });
            testGalleryId = gallery.id;
            originalUpdatedAt = gallery.updatedAt;
        });

        it('should update gallery and refresh updatedAt (AC5)', async () => {
            // Small delay to ensure updatedAt timestamp differs from creation time
            await new Promise((resolve) => setTimeout(resolve, 10));

            const response = await request(app)
                .put(`${apiPath}/admin/v1/galleries/${testGalleryId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ title: '[TEST] Обновена галерия' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.content.title).toBe('[TEST] Обновена галерия');
            // AC5: verify updatedAt was actually refreshed
            const newUpdatedAt = new Date(response.body.content.updatedAt).getTime();
            expect(newUpdatedAt).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
        });

        it('should set publishedAt when status changes DRAFT→PUBLISHED (AC5)', async () => {
            const response = await request(app)
                .put(`${apiPath}/admin/v1/galleries/${testGalleryId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ status: 'PUBLISHED' });

            expect(response.status).toBe(200);
            expect(response.body.content.status).toBe('PUBLISHED');
            expect(response.body.content.publishedAt).not.toBeNull();
        });

        it('should clear publishedAt when status changes PUBLISHED→DRAFT (AC5)', async () => {
            // First publish
            await prisma.gallery.update({
                where: { id: testGalleryId },
                data: { status: 'PUBLISHED', publishedAt: new Date() },
            });

            const response = await request(app)
                .put(`${apiPath}/admin/v1/galleries/${testGalleryId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ status: 'DRAFT' });

            expect(response.status).toBe(200);
            expect(response.body.content.status).toBe('DRAFT');
            expect(response.body.content.publishedAt).toBeNull();
        });

        it('should return 404 for non-existent gallery (AC5)', async () => {
            const response = await request(app)
                .put(`${apiPath}/admin/v1/galleries/999999`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ title: '[TEST] Не съществува' });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Галерията не е намерена');
        });

        it('should return 400 for non-numeric ID (H2)', async () => {
            const response = await request(app)
                .put(`${apiPath}/admin/v1/galleries/abc`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ title: '[TEST] Обновена' });

            expect(response.status).toBe(400);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should return 401 if not authenticated (AC7)', async () => {
            const response = await request(app)
                .put(`${apiPath}/admin/v1/galleries/${testGalleryId}`)
                .send({ title: '[TEST] Обновена' });

            expect(response.status).toBe(401);
        });
    });

    // ─── DELETE: Delete Gallery ────────────────────────────────────────────────

    describe(`DELETE ${apiPath}/admin/v1/galleries/:id (AC6)`, () => {
        beforeEach(async () => {
            const gallery = await prisma.gallery.create({
                data: {
                    title: '[TEST] Галерия за изтриване',
                    status: 'DRAFT',
                },
            });
            testGalleryId = gallery.id;
        });

        it('should delete gallery with Bulgarian success message (AC6)', async () => {
            const response = await request(app)
                .delete(`${apiPath}/admin/v1/galleries/${testGalleryId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Галерията е изтрита успешно');
            expect(response.body.content).toBeNull();

            // Verify deletion
            const verifyResponse = await request(app)
                .get(`${apiPath}/admin/v1/galleries/${testGalleryId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(verifyResponse.status).toBe(404);
        });

        it('should return 404 when deleting non-existent gallery (AC6)', async () => {
            const response = await request(app)
                .delete(`${apiPath}/admin/v1/galleries/999999`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Галерията не е намерена');
        });

        it('should return 400 for non-numeric ID (H2)', async () => {
            const response = await request(app)
                .delete(`${apiPath}/admin/v1/galleries/abc`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(400);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should cascade delete GalleryImages when gallery is deleted (AC6)', async () => {
            // Create a GalleryImage associated with the test gallery
            await prisma.galleryImage.create({
                data: {
                    galleryId: testGalleryId,
                    imageUrl: 'https://example.com/test-image.jpg',
                },
            });

            // Verify image exists before deletion
            const imagesBefore = await prisma.galleryImage.findMany({
                where: { galleryId: testGalleryId },
            });
            expect(imagesBefore.length).toBe(1);

            // Delete the gallery
            const response = await request(app)
                .delete(`${apiPath}/admin/v1/galleries/${testGalleryId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);

            // Verify GalleryImages were cascade-deleted
            const imagesAfter = await prisma.galleryImage.findMany({
                where: { galleryId: testGalleryId },
            });
            expect(imagesAfter.length).toBe(0);
        });

        it('should return 401 if not authenticated (AC7)', async () => {
            const response = await request(app).delete(
                `${apiPath}/admin/v1/galleries/${testGalleryId}`
            );
            expect(response.status).toBe(401);
        });
    });
});
