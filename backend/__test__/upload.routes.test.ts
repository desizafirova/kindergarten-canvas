import request from 'supertest';
import path from 'path';
import server from '../src/server/http_server';
import prisma from '../prisma/prisma-client';

describe('Image Upload API', () => {
    let app: any;
    let authToken: string;

    beforeAll(async () => {
        jest.setTimeout(60000);

        // Start server in silent mode
        const silent = true;
        app = await server(silent);

        // Login and get auth token
        const loginResponse = await request(app)
            .post('/api/client/v1/auth/login')
            .send({ email: 'admin@kindergarten.bg', password: 'Admin@123456' });

        if (loginResponse.body.content && loginResponse.body.content.token) {
            authToken = loginResponse.body.content.token;
        } else {
            console.error('Login failed:', loginResponse.body);
            throw new Error('Failed to get auth token for tests');
        }
    });

    afterAll(async () => {
        await prisma.$disconnect();
        if (app && app.close) {
            app.close();
        }
    });

    describe('POST /api/admin/v1/upload', () => {
        it('should upload valid JPEG image and return Cloudinary URL', async () => {
            const response = await request(app)
                .post('/api/admin/v1/upload')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('file', path.join(__dirname, 'fixtures/test-image.jpg'));

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.content.url).toMatch(/https:\/\/res\.cloudinary\.com/);
            expect(response.body.content.publicId).toBeDefined();
        }, 15000); // Increased timeout for Cloudinary upload

        it('should upload valid PNG image', async () => {
            const response = await request(app)
                .post('/api/admin/v1/upload')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('file', path.join(__dirname, 'fixtures/test-image.png'));

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        }, 15000);

        it('should reject invalid file type with Bulgarian error', async () => {
            const response = await request(app)
                .post('/api/admin/v1/upload')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('file', path.join(__dirname, 'fixtures/test-file.txt'));

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('Невалиден тип файл');
        });

        it('should reject upload without file', async () => {
            const response = await request(app)
                .post('/api/admin/v1/upload')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Моля, изберете файл за качване');
        });

        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .post('/api/admin/v1/upload')
                .attach('file', path.join(__dirname, 'fixtures/test-image.jpg'));

            expect(response.status).toBe(401);
        });

        it('should return accessible Cloudinary CDN URL', async () => {
            const uploadResponse = await request(app)
                .post('/api/admin/v1/upload')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('file', path.join(__dirname, 'fixtures/test-image.jpg'));

            expect(uploadResponse.status).toBe(200);
            const imageUrl = uploadResponse.body.content.url;

            // Verify URL format is valid Cloudinary CDN URL
            expect(imageUrl).toMatch(/^https:\/\/res\.cloudinary\.com\//);
            expect(uploadResponse.body.content.publicId).toBeDefined();
            expect(uploadResponse.body.content.publicId).toContain('kindergarten-canvas/news');
        }, 15000);
    });
});
