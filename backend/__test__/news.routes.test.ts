import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import server from '../src/server/http_server';
import globalApiPath from '../src/utils/global_api_path/global_api_path';
import prisma from '../prisma/prisma-client';

const apiPath = globalApiPath();
let app: any;

describe('News CRUD API', () => {
    let authToken: string;
    let testNewsId: number;

    beforeAll(async () => {
        // Start server silently for testing
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
        await prisma.newsItem.deleteMany({ where: { title: { contains: 'Test News' } } });
        await prisma.$disconnect();

        // Close server
        if (app) {
            await new Promise<void>((resolve) => {
                app.close(() => resolve());
            });
        }
    });

    describe(`POST ${apiPath}/admin/news`, () => {
        it('should create news item with status DRAFT by default', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/news`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Test News Item',
                    content: '<p>Test content for news</p>',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.content.status).toBe('DRAFT');
            expect(response.body.content.title).toBe('Test News Item');
            // Content is HTML-escaped by XSS middleware
            expect(response.body.content.content).toBe('&lt;p>Test content for news&lt;/p>');
            expect(response.body.content.id).toBeDefined();

            testNewsId = response.body.content.id;
        });

        it('should return 400 with Bulgarian error if title missing', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/news`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ content: '<p>Test content</p>' });

            expect(response.status).toBe(400);
            expect(response.body[0].message).toBe('Заглавието е задължително');
        });

        it('should return 400 with Bulgarian error if content missing', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/news`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ title: 'Test Title' });

            expect(response.status).toBe(400);
            expect(response.body[0].message).toBe('Съдържанието е задължително');
        });

        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/news`)
                .send({ title: 'Test', content: '<p>Test</p>' });

            expect(response.status).toBe(401);
        });
    });

    describe(`GET ${apiPath}/admin/news`, () => {
        beforeAll(async () => {
            // Create a few more test news items
            await request(app)
                .post(`${apiPath}/admin/news`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Test News Draft',
                    content: '<p>Draft content</p>',
                    status: 'DRAFT',
                });

            await request(app)
                .post(`${apiPath}/admin/news`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Test News Published',
                    content: '<p>Published content</p>',
                    status: 'PUBLISHED',
                });
        });

        it('should return all news items sorted by createdAt DESC', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/news`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.content)).toBe(true);

            // Verify sorting - newest first
            const items = response.body.content;
            for (let i = 0; i < items.length - 1; i++) {
                const current = new Date(items[i].createdAt);
                const next = new Date(items[i + 1].createdAt);
                expect(current >= next).toBe(true);
            }
        });

        it('should filter by status DRAFT', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/news?status=DRAFT`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            response.body.content.forEach((item: any) => {
                expect(item.status).toBe('DRAFT');
            });
        });

        it('should filter by status PUBLISHED', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/news?status=PUBLISHED`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            response.body.content.forEach((item: any) => {
                expect(item.status).toBe('PUBLISHED');
            });
        });

        it('should return 401 if not authenticated', async () => {
            const response = await request(app).get(`${apiPath}/admin/news`);

            expect(response.status).toBe(401);
        });
    });

    describe(`GET ${apiPath}/admin/news/:id`, () => {
        it('should return single news item', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/news/${testNewsId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.content.id).toBe(testNewsId);
            expect(response.body.content.title).toBeDefined();
        });

        it('should return 404 with Bulgarian error for invalid ID', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/news/999999`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Новината не е намерена');
        });

        it('should return 401 if not authenticated', async () => {
            const response = await request(app).get(`${apiPath}/admin/news/${testNewsId}`);

            expect(response.status).toBe(401);
        });
    });

    describe(`PUT ${apiPath}/admin/news/:id`, () => {
        it('should update news item and auto-update updatedAt', async () => {
            // Wait a bit to ensure updatedAt is different
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const response = await request(app)
                .put(`${apiPath}/admin/news/${testNewsId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ title: 'Updated Test News Title' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.content.title).toBe('Updated Test News Title');
            expect(response.body.content.updatedAt).not.toBe(response.body.content.createdAt);
        });

        it('should update status from DRAFT to PUBLISHED', async () => {
            const response = await request(app)
                .put(`${apiPath}/admin/news/${testNewsId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ status: 'PUBLISHED' });

            expect(response.status).toBe(200);
            expect(response.body.content.status).toBe('PUBLISHED');
        });

        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .put(`${apiPath}/admin/news/${testNewsId}`)
                .send({ title: 'Updated' });

            expect(response.status).toBe(401);
        });
    });

    describe(`DELETE ${apiPath}/admin/news/:id`, () => {
        it('should delete news item with Bulgarian success message', async () => {
            const response = await request(app)
                .delete(`${apiPath}/admin/news/${testNewsId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Новината е изтрита успешно');

            // Verify deletion
            const verifyResponse = await request(app)
                .get(`${apiPath}/admin/news/${testNewsId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(verifyResponse.status).toBe(404);
        });

        it('should return 401 if not authenticated', async () => {
            // Create a new item for this test
            const createResponse = await request(app)
                .post(`${apiPath}/admin/news`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ title: 'Test Delete Auth', content: '<p>Test</p>' });

            const newId = createResponse.body.content.id;

            const response = await request(app).delete(`${apiPath}/admin/news/${newId}`);

            expect(response.status).toBe(401);

            // Cleanup
            await request(app).delete(`${apiPath}/admin/news/${newId}`).set('Authorization', `Bearer ${authToken}`);
        });
    });
});
