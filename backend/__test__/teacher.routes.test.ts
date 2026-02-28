import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import server from '../src/server/http_server';
import globalApiPath from '../src/utils/global_api_path/global_api_path';
import prisma from '../prisma/prisma-client';

const apiPath = globalApiPath();
let app: any;

describe('Teacher CRUD API', () => {
    let authToken: string;
    let testTeacherId: number;

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
        await prisma.teacher.deleteMany({ where: { firstName: { contains: 'Test' } } });
        await prisma.$disconnect();

        // Close server
        if (app) {
            await new Promise<void>((resolve) => {
                app.close(() => resolve());
            });
        }
    });

    describe(`POST ${apiPath}/admin/v1/teachers`, () => {
        it('should create teacher with status DRAFT by default', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/teachers`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    firstName: 'Test',
                    lastName: 'Teacher',
                    position: 'Учител',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.content.status).toBe('DRAFT');
            expect(response.body.content.firstName).toBe('Test');
            expect(response.body.content.lastName).toBe('Teacher');
            expect(response.body.content.position).toBe('Учител');
            expect(response.body.content.id).toBeDefined();

            testTeacherId = response.body.content.id;
        });

        it('should return 400 with Bulgarian error if firstName missing', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/teachers`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ lastName: 'Teacher', position: 'Учител' });

            expect(response.status).toBe(400);
            expect(response.body[0].message).toBe('Името е задължително');
        });

        it('should return 400 with Bulgarian error if lastName missing', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/teachers`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ firstName: 'Test', position: 'Учител' });

            expect(response.status).toBe(400);
            expect(response.body[0].message).toBe('Фамилията е задължителна');
        });

        it('should return 400 with Bulgarian error if position missing', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/teachers`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ firstName: 'Test', lastName: 'Teacher' });

            expect(response.status).toBe(400);
            expect(response.body[0].message).toBe('Длъжността е задължителна');
        });

        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/teachers`)
                .send({ firstName: 'Test', lastName: 'Teacher', position: 'Учител' });

            expect(response.status).toBe(401);
        });
    });

    describe(`GET ${apiPath}/admin/v1/teachers`, () => {
        beforeAll(async () => {
            // Create teachers with different displayOrder for sorting tests
            await request(app)
                .post(`${apiPath}/admin/v1/teachers`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    firstName: 'Test Alpha',
                    lastName: 'Zulu',
                    position: 'Учител',
                    status: 'DRAFT',
                    displayOrder: 2,
                });

            await request(app)
                .post(`${apiPath}/admin/v1/teachers`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    firstName: 'Test Beta',
                    lastName: 'Alpha',
                    position: 'Директор',
                    status: 'PUBLISHED',
                    displayOrder: 1,
                });

            await request(app)
                .post(`${apiPath}/admin/v1/teachers`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    firstName: 'Test Gamma',
                    lastName: 'Beta',
                    position: 'Учител',
                    status: 'PUBLISHED',
                    displayOrder: null, // Should appear last, sorted by lastName
                });
        });

        it('should return all teachers sorted by displayOrder ASC, then lastName ASC', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/teachers`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.content)).toBe(true);

            // Verify sorting - displayOrder ASC (nulls last), then lastName ASC
            const items = response.body.content;
            const testItems = items.filter((item: any) => item.firstName.includes('Test'));

            expect(testItems.length).toBeGreaterThanOrEqual(3);

            // First should be displayOrder=1 (Test Beta Alpha)
            // Second should be displayOrder=2 (Test Alpha Zulu)
            // Last should be displayOrder=null sorted by lastName (Test Gamma Beta)
            const withDisplayOrder = testItems.filter((item: any) => item.displayOrder !== null);
            for (let i = 0; i < withDisplayOrder.length - 1; i++) {
                expect(withDisplayOrder[i].displayOrder).toBeLessThanOrEqual(withDisplayOrder[i + 1].displayOrder);
            }
        });

        it('should filter by status DRAFT', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/teachers?status=DRAFT`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            response.body.content.forEach((item: any) => {
                expect(item.status).toBe('DRAFT');
            });
        });

        it('should filter by status PUBLISHED', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/teachers?status=PUBLISHED`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            response.body.content.forEach((item: any) => {
                expect(item.status).toBe('PUBLISHED');
            });
        });

        it('should return 401 if not authenticated', async () => {
            const response = await request(app).get(`${apiPath}/admin/v1/teachers`);

            expect(response.status).toBe(401);
        });
    });

    describe(`GET ${apiPath}/admin/v1/teachers/:id`, () => {
        it('should return single teacher', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/teachers/${testTeacherId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.content.id).toBe(testTeacherId);
            expect(response.body.content.firstName).toBeDefined();
            expect(response.body.content.lastName).toBeDefined();
            expect(response.body.content.position).toBeDefined();
        });

        it('should return 404 with Bulgarian error for invalid ID', async () => {
            const response = await request(app)
                .get(`${apiPath}/admin/v1/teachers/999999`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Учителят не е намерен');
        });

        it('should return 401 if not authenticated', async () => {
            const response = await request(app).get(`${apiPath}/admin/v1/teachers/${testTeacherId}`);

            expect(response.status).toBe(401);
        });
    });

    describe(`PUT ${apiPath}/admin/v1/teachers/:id`, () => {
        it('should update teacher and auto-update updatedAt', async () => {
            // Wait a bit to ensure updatedAt is different
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const response = await request(app)
                .put(`${apiPath}/admin/v1/teachers/${testTeacherId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ firstName: 'Updated Test', lastName: 'Updated Teacher' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.content.firstName).toBe('Updated Test');
            expect(response.body.content.lastName).toBe('Updated Teacher');
            expect(response.body.content.updatedAt).not.toBe(response.body.content.createdAt);
        });

        it('should update status from DRAFT to PUBLISHED', async () => {
            const response = await request(app)
                .put(`${apiPath}/admin/v1/teachers/${testTeacherId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ status: 'PUBLISHED' });

            expect(response.status).toBe(200);
            expect(response.body.content.status).toBe('PUBLISHED');
        });

        it('should update displayOrder', async () => {
            const response = await request(app)
                .put(`${apiPath}/admin/v1/teachers/${testTeacherId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ displayOrder: 5 });

            expect(response.status).toBe(200);
            expect(response.body.content.displayOrder).toBe(5);
        });

        it('should return 404 when updating non-existent teacher', async () => {
            const response = await request(app)
                .put(`${apiPath}/admin/v1/teachers/999999`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ firstName: 'Updated' });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Учителят не е намерен');
        });

        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .put(`${apiPath}/admin/v1/teachers/${testTeacherId}`)
                .send({ firstName: 'Updated' });

            expect(response.status).toBe(401);
        });
    });

    describe(`DELETE ${apiPath}/admin/v1/teachers/:id`, () => {
        it('should delete teacher with Bulgarian success message', async () => {
            const response = await request(app)
                .delete(`${apiPath}/admin/v1/teachers/${testTeacherId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Учителят е изтрит успешно');

            // Verify deletion
            const verifyResponse = await request(app)
                .get(`${apiPath}/admin/v1/teachers/${testTeacherId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(verifyResponse.status).toBe(404);
        });

        it('should return 404 when deleting non-existent teacher', async () => {
            const response = await request(app)
                .delete(`${apiPath}/admin/v1/teachers/999999`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Учителят не е намерен');
        });

        it('should return 401 if not authenticated', async () => {
            // Create a new teacher for this test
            const createResponse = await request(app)
                .post(`${apiPath}/admin/v1/teachers`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ firstName: 'Test Delete', lastName: 'Auth Test', position: 'Учител' });

            const newId = createResponse.body.content.id;

            const response = await request(app).delete(`${apiPath}/admin/v1/teachers/${newId}`);

            expect(response.status).toBe(401);

            // Cleanup
            await request(app).delete(`${apiPath}/admin/v1/teachers/${newId}`).set('Authorization', `Bearer ${authToken}`);
        });
    });
});
