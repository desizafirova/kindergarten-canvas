import request from 'supertest';
import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import server from '../src/server/http_server';
import prisma from '../prisma/prisma-client';

let app: any;

describe('Public Galleries API Endpoints', () => {
    let testGalleryId: number;
    let testGalleryWithImagesId: number;

    const cleanupTestGalleries = async () => {
        // Delete images first (foreign key constraint)
        const testGalleries = await prisma.gallery.findMany({
            where: { title: { contains: '[TEST]' } },
            select: { id: true },
        });
        const ids = testGalleries.map((g) => g.id);
        if (ids.length > 0) {
            await prisma.galleryImage.deleteMany({ where: { galleryId: { in: ids } } });
        }
        await prisma.gallery.deleteMany({ where: { title: { contains: '[TEST]' } } });
    };

    beforeAll(async () => {
        const silent = true;
        app = await server(silent);
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

    // ─── GET: List Public Galleries ────────────────────────────────────────────

    describe('GET /api/v1/public/galleries (AC1)', () => {
        beforeEach(async () => {
            // Create a PUBLISHED gallery with images
            const published = await prisma.gallery.create({
                data: {
                    title: '[TEST] Published Gallery With Images',
                    status: 'PUBLISHED',
                    publishedAt: new Date('2026-03-01T10:00:00Z'),
                },
            });
            testGalleryWithImagesId = published.id;
            await prisma.galleryImage.create({
                data: {
                    galleryId: published.id,
                    imageUrl: 'https://example.com/image1.jpg',
                    displayOrder: 1,
                },
            });

            // Create a PUBLISHED gallery WITHOUT images (should be excluded)
            await prisma.gallery.create({
                data: {
                    title: '[TEST] Published Gallery No Images',
                    status: 'PUBLISHED',
                    publishedAt: new Date('2026-03-02T10:00:00Z'),
                },
            });

            // Create a DRAFT gallery with images (should be excluded)
            const draft = await prisma.gallery.create({
                data: {
                    title: '[TEST] Draft Gallery',
                    status: 'DRAFT',
                },
            });
            await prisma.galleryImage.create({
                data: {
                    galleryId: draft.id,
                    imageUrl: 'https://example.com/draft.jpg',
                    displayOrder: 1,
                },
            });
        });

        it('should return 200 and only PUBLISHED galleries with at least 1 image', async () => {
            const response = await request(app).get('/api/v1/public/galleries');

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('success');
            expect(Array.isArray(response.body.data.galleries)).toBe(true);

            const testGalleries = response.body.data.galleries.filter((g: any) =>
                g.title.includes('[TEST]')
            );

            // Only the PUBLISHED gallery with images should appear
            expect(testGalleries.length).toBe(1);
            expect(testGalleries[0].title).toBe('[TEST] Published Gallery With Images');
        });

        it('should include imageCount (not _count) in response', async () => {
            const response = await request(app).get('/api/v1/public/galleries');

            const testGalleries = response.body.data.galleries.filter((g: any) =>
                g.title.includes('[TEST]')
            );
            expect(testGalleries[0].imageCount).toBe(1);
            expect(testGalleries[0]._count).toBeUndefined();
        });

        it('should include required fields: id, title, description, coverImageUrl, imageCount, publishedAt, createdAt, updatedAt', async () => {
            const response = await request(app).get('/api/v1/public/galleries');

            const testGalleries = response.body.data.galleries.filter((g: any) =>
                g.title.includes('[TEST]')
            );
            const gallery = testGalleries[0];

            expect(gallery).toHaveProperty('id');
            expect(gallery).toHaveProperty('title');
            expect(gallery).toHaveProperty('description');
            expect(gallery).toHaveProperty('coverImageUrl');
            expect(gallery).toHaveProperty('imageCount');
            expect(gallery).toHaveProperty('publishedAt');
            expect(gallery).toHaveProperty('createdAt');
            expect(gallery).toHaveProperty('updatedAt');
        });

        it('should return empty array when no PUBLISHED galleries with images exist', async () => {
            await cleanupTestGalleries();

            const response = await request(app).get('/api/v1/public/galleries');

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('success');

            const testGalleries = response.body.data.galleries.filter((g: any) =>
                g.title.includes('[TEST]')
            );
            expect(testGalleries.length).toBe(0);
        });
    });

    // ─── GET: Single Public Gallery ───────────────────────────────────────────

    describe('GET /api/v1/public/galleries/:id (AC2)', () => {
        beforeEach(async () => {
            const gallery = await prisma.gallery.create({
                data: {
                    title: '[TEST] Single Gallery',
                    description: 'Test description',
                    status: 'PUBLISHED',
                    publishedAt: new Date(),
                },
            });
            testGalleryId = gallery.id;
            await prisma.galleryImage.create({
                data: {
                    galleryId: gallery.id,
                    imageUrl: 'https://example.com/photo1.jpg',
                    altText: 'Photo 1',
                    displayOrder: 1,
                },
            });
            await prisma.galleryImage.create({
                data: {
                    galleryId: gallery.id,
                    imageUrl: 'https://example.com/photo2.jpg',
                    altText: 'Photo 2',
                    displayOrder: 2,
                },
            });
        });

        it('should return 200 with gallery and images sorted by displayOrder ASC', async () => {
            const response = await request(app).get(`/api/v1/public/galleries/${testGalleryId}`);

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('success');
            expect(response.body.data.gallery.id).toBe(testGalleryId);
            expect(response.body.data.gallery.title).toBe('[TEST] Single Gallery');
            expect(Array.isArray(response.body.data.gallery.images)).toBe(true);
            expect(response.body.data.gallery.images.length).toBe(2);
            expect(response.body.data.gallery.images[0].displayOrder).toBe(1);
            expect(response.body.data.gallery.images[1].displayOrder).toBe(2);
        });

        it('should return 404 for a DRAFT gallery', async () => {
            const draft = await prisma.gallery.create({
                data: {
                    title: '[TEST] Draft For 404',
                    status: 'DRAFT',
                },
            });

            const response = await request(app).get(`/api/v1/public/galleries/${draft.id}`);

            expect(response.status).toBe(404);
            expect(response.body.status).toBe('fail');
            expect(response.body.data.message).toBe('Галерията не е намерена');
        });

        it('should return 404 for non-existent id', async () => {
            const response = await request(app).get('/api/v1/public/galleries/999999');

            expect(response.status).toBe(404);
            expect(response.body.status).toBe('fail');
            expect(response.body.data.message).toBe('Галерията не е намерена');
        });

        it('should return 404 for NaN id (non-numeric)', async () => {
            const response = await request(app).get('/api/v1/public/galleries/abc');

            expect(response.status).toBe(404);
            expect(response.body.status).toBe('fail');
            expect(response.body.data.message).toBe('Галерията не е намерена');
        });
    });
});
