import request from 'supertest';
import { describe, it, expect, beforeAll, beforeEach, afterAll, jest } from '@jest/globals';
import server from '../src/server/http_server';
import globalApiPath from '../src/utils/global_api_path/global_api_path';
import prisma from '../prisma/prisma-client';

// Mock the Cloudinary gallery upload service
jest.mock('../src/services/cloudinary/cloudinary_gallery_upload_service', () => ({
    __esModule: true,
    default: (jest.fn() as jest.Mock<any>).mockResolvedValue({
        success: true,
        data: {
            url: 'https://res.cloudinary.com/test/image/upload/v1/kindergarten-canvas/galleries/[TEST]photo.jpg',
            publicId: '[TEST]test-id',
        },
        error: null,
    }),
}));

const apiPath = globalApiPath();
let app: any;

describe('Gallery Images API (Story 7.3)', () => {
    let authToken: string;
    let testGalleryId: number;

    const cleanupTestData = async () => {
        await prisma.galleryImage.deleteMany({
            where: { imageUrl: { contains: '[TEST]' } },
        });
        await prisma.gallery.deleteMany({
            where: { title: { contains: '[TEST]' } },
        });
    };

    beforeAll(async () => {
        const silent = true;
        app = await server(silent);

        const loginResponse = await request(app)
            .post(`${apiPath}/client/auth/login`)
            .send({ email: 'admin@kindergarten.bg', password: 'Admin@123456' });

        if (loginResponse.body.success && loginResponse.body.content?.accessToken) {
            authToken = loginResponse.body.content.accessToken;
        } else {
            console.error('Login failed:', loginResponse.body);
            throw new Error('Failed to get auth token');
        }
    });

    afterAll(async () => {
        await cleanupTestData();
        await prisma.$disconnect();

        if (app) {
            await new Promise<void>((resolve) => {
                app.close(() => resolve());
            });
        }
    });

    beforeEach(async () => {
        await cleanupTestData();
        const gallery = await prisma.gallery.create({
            data: { title: '[TEST] Gallery for Images', status: 'DRAFT' },
        });
        testGalleryId = gallery.id;
    });

    // ─── POST /:id/images — AC3 ───────────────────────────────────────────────

    describe(`POST ${apiPath}/admin/v1/galleries/:id/images (AC3)`, () => {
        it('should upload image and return 201 with imageUrl, thumbnailUrl, displayOrder (AC3)', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/galleries/${testGalleryId}/images`)
                .set('Authorization', `Bearer ${authToken}`)
                .attach('image', Buffer.from('fake-image-data'), {
                    filename: '[TEST]photo.jpg',
                    contentType: 'image/jpeg',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.content).toHaveProperty('id');
            expect(response.body.content).toHaveProperty('imageUrl');
            expect(response.body.content).toHaveProperty('thumbnailUrl');
            expect(response.body.content.thumbnailUrl).toContain('w_150,h_150,c_fill');
            expect(response.body.content.displayOrder).toBe(0);
        });

        it('should set coverImageUrl on first image upload (AC3)', async () => {
            await request(app)
                .post(`${apiPath}/admin/v1/galleries/${testGalleryId}/images`)
                .set('Authorization', `Bearer ${authToken}`)
                .attach('image', Buffer.from('fake-image-data'), {
                    filename: '[TEST]photo.jpg',
                    contentType: 'image/jpeg',
                });

            const gallery = await prisma.gallery.findUnique({
                where: { id: testGalleryId },
                select: { coverImageUrl: true },
            });
            expect(gallery?.coverImageUrl).not.toBeNull();
            expect(gallery?.coverImageUrl).toContain('[TEST]');
        });

        it('should NOT change coverImageUrl when gallery already has one (AC3)', async () => {
            // Set an initial coverImageUrl
            await prisma.gallery.update({
                where: { id: testGalleryId },
                data: { coverImageUrl: 'https://example.com/existing-cover.jpg' },
            });

            await request(app)
                .post(`${apiPath}/admin/v1/galleries/${testGalleryId}/images`)
                .set('Authorization', `Bearer ${authToken}`)
                .attach('image', Buffer.from('fake-image-data'), {
                    filename: '[TEST]photo.jpg',
                    contentType: 'image/jpeg',
                });

            const gallery = await prisma.gallery.findUnique({
                where: { id: testGalleryId },
                select: { coverImageUrl: true },
            });
            expect(gallery?.coverImageUrl).toBe('https://example.com/existing-cover.jpg');
        });

        it('should return 404 when gallery not found (AC3)', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/galleries/999999/images`)
                .set('Authorization', `Bearer ${authToken}`)
                .attach('image', Buffer.from('fake-image-data'), {
                    filename: '[TEST]photo.jpg',
                    contentType: 'image/jpeg',
                });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Галерията не е намерена');
        });

        it('should return 400 when no file is attached (AC3)', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/galleries/${testGalleryId}/images`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Файлът е задължителен');
        });

        it('should return 401 when not authenticated (AC3)', async () => {
            const response = await request(app)
                .post(`${apiPath}/admin/v1/galleries/${testGalleryId}/images`)
                .attach('image', Buffer.from('fake-image-data'), {
                    filename: '[TEST]photo.jpg',
                    contentType: 'image/jpeg',
                });

            expect(response.status).toBe(401);
        });

        it('should assign incrementing displayOrder for subsequent uploads (AC3)', async () => {
            // Upload first image
            const first = await request(app)
                .post(`${apiPath}/admin/v1/galleries/${testGalleryId}/images`)
                .set('Authorization', `Bearer ${authToken}`)
                .attach('image', Buffer.from('fake-image-data'), {
                    filename: '[TEST]photo1.jpg',
                    contentType: 'image/jpeg',
                });
            expect(first.body.content.displayOrder).toBe(0);

            // Upload second image
            const second = await request(app)
                .post(`${apiPath}/admin/v1/galleries/${testGalleryId}/images`)
                .set('Authorization', `Bearer ${authToken}`)
                .attach('image', Buffer.from('fake-image-data'), {
                    filename: '[TEST]photo2.jpg',
                    contentType: 'image/jpeg',
                });
            expect(second.body.content.displayOrder).toBe(1);
        });
    });

    // ─── DELETE /:id/images/:imageId — AC5 ───────────────────────────────────

    describe(`DELETE ${apiPath}/admin/v1/galleries/:id/images/:imageId (AC5)`, () => {
        let testImageId: number;

        beforeEach(async () => {
            const image = await prisma.galleryImage.create({
                data: {
                    galleryId: testGalleryId,
                    imageUrl: 'https://res.cloudinary.com/test/image/upload/v1/[TEST]photo.jpg',
                    thumbnailUrl:
                        'https://res.cloudinary.com/test/image/upload/w_150,h_150,c_fill/v1/[TEST]photo.jpg',
                    displayOrder: 0,
                },
            });
            testImageId = image.id;
        });

        it('should delete image and return 200 with Bulgarian message (AC5)', async () => {
            const response = await request(app)
                .delete(`${apiPath}/admin/v1/galleries/${testGalleryId}/images/${testImageId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Снимката е изтрита успешно');
            expect(response.body.content).toBeNull();

            const deleted = await prisma.galleryImage.findUnique({ where: { id: testImageId } });
            expect(deleted).toBeNull();
        });

        it('should update coverImageUrl to next image when cover is deleted (AC5)', async () => {
            const coverUrl = 'https://res.cloudinary.com/test/image/upload/v1/[TEST]photo.jpg';
            await prisma.gallery.update({
                where: { id: testGalleryId },
                data: { coverImageUrl: coverUrl },
            });

            // Add a second image
            const secondImage = await prisma.galleryImage.create({
                data: {
                    galleryId: testGalleryId,
                    imageUrl: 'https://res.cloudinary.com/test/image/upload/v1/[TEST]photo2.jpg',
                    displayOrder: 1,
                },
            });

            await request(app)
                .delete(`${apiPath}/admin/v1/galleries/${testGalleryId}/images/${testImageId}`)
                .set('Authorization', `Bearer ${authToken}`);

            const gallery = await prisma.gallery.findUnique({
                where: { id: testGalleryId },
                select: { coverImageUrl: true },
            });
            expect(gallery?.coverImageUrl).toBe(secondImage.imageUrl);
        });

        it('should set coverImageUrl to null when last image is deleted (AC5)', async () => {
            await prisma.gallery.update({
                where: { id: testGalleryId },
                data: { coverImageUrl: 'https://res.cloudinary.com/test/image/upload/v1/[TEST]photo.jpg' },
            });

            await request(app)
                .delete(`${apiPath}/admin/v1/galleries/${testGalleryId}/images/${testImageId}`)
                .set('Authorization', `Bearer ${authToken}`);

            const gallery = await prisma.gallery.findUnique({
                where: { id: testGalleryId },
                select: { coverImageUrl: true },
            });
            expect(gallery?.coverImageUrl).toBeNull();
        });

        it('should return 404 when gallery not found (AC5)', async () => {
            const response = await request(app)
                .delete(`${apiPath}/admin/v1/galleries/999999/images/${testImageId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Галерията не е намерена');
        });

        it('should return 404 when image not found (AC5)', async () => {
            const response = await request(app)
                .delete(`${apiPath}/admin/v1/galleries/${testGalleryId}/images/999999`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Снимката не е намерена');
        });

        it('should return 401 when not authenticated (AC5)', async () => {
            const response = await request(app).delete(
                `${apiPath}/admin/v1/galleries/${testGalleryId}/images/${testImageId}`
            );
            expect(response.status).toBe(401);
        });
    });

    // ─── PUT /:id/images/reorder — AC7 ───────────────────────────────────────

    describe(`PUT ${apiPath}/admin/v1/galleries/:id/images/reorder (AC7)`, () => {
        let imageId1: number;
        let imageId2: number;
        let imageId3: number;

        beforeEach(async () => {
            const img1 = await prisma.galleryImage.create({
                data: {
                    galleryId: testGalleryId,
                    imageUrl: 'https://res.cloudinary.com/test/image/upload/v1/[TEST]img1.jpg',
                    displayOrder: 0,
                },
            });
            const img2 = await prisma.galleryImage.create({
                data: {
                    galleryId: testGalleryId,
                    imageUrl: 'https://res.cloudinary.com/test/image/upload/v1/[TEST]img2.jpg',
                    displayOrder: 1,
                },
            });
            const img3 = await prisma.galleryImage.create({
                data: {
                    galleryId: testGalleryId,
                    imageUrl: 'https://res.cloudinary.com/test/image/upload/v1/[TEST]img3.jpg',
                    displayOrder: 2,
                },
            });
            imageId1 = img1.id;
            imageId2 = img2.id;
            imageId3 = img3.id;
        });

        it('should reorder images atomically and return 200 sorted by displayOrder (AC7)', async () => {
            const response = await request(app)
                .put(`${apiPath}/admin/v1/galleries/${testGalleryId}/images/reorder`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    images: [
                        { id: imageId3, displayOrder: 0 },
                        { id: imageId1, displayOrder: 1 },
                        { id: imageId2, displayOrder: 2 },
                    ],
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.content)).toBe(true);

            const sorted = response.body.content;
            expect(sorted[0].displayOrder).toBe(0);
            expect(sorted[1].displayOrder).toBe(1);
            expect(sorted[2].displayOrder).toBe(2);
        });

        it('should update coverImageUrl to image with displayOrder=0 (AC7)', async () => {
            await request(app)
                .put(`${apiPath}/admin/v1/galleries/${testGalleryId}/images/reorder`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    images: [
                        { id: imageId3, displayOrder: 0 },
                        { id: imageId1, displayOrder: 1 },
                        { id: imageId2, displayOrder: 2 },
                    ],
                });

            const gallery = await prisma.gallery.findUnique({
                where: { id: testGalleryId },
                select: { coverImageUrl: true },
            });
            expect(gallery?.coverImageUrl).toContain('[TEST]img3');
        });

        it('should return 404 when gallery not found (AC7)', async () => {
            const response = await request(app)
                .put(`${apiPath}/admin/v1/galleries/999999/images/reorder`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    images: [{ id: imageId1, displayOrder: 0 }],
                });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Галерията не е намерена');
        });

        it('should return 400 when images array is empty (AC7)', async () => {
            const response = await request(app)
                .put(`${apiPath}/admin/v1/galleries/${testGalleryId}/images/reorder`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ images: [] });

            expect(response.status).toBe(400);
        });

        it('should return 401 when not authenticated (AC7)', async () => {
            const response = await request(app)
                .put(`${apiPath}/admin/v1/galleries/${testGalleryId}/images/reorder`)
                .send({ images: [{ id: imageId1, displayOrder: 0 }] });

            expect(response.status).toBe(401);
        });

        it('should return 400 when image IDs do not belong to the gallery (H2 — ownership validation)', async () => {
            // Create a second gallery and image that don't belong to testGalleryId
            const otherGallery = await prisma.gallery.create({
                data: { title: '[TEST] Other Gallery', status: 'DRAFT' },
            });
            const foreignImage = await prisma.galleryImage.create({
                data: {
                    galleryId: otherGallery.id,
                    imageUrl: 'https://res.cloudinary.com/test/image/upload/v1/[TEST]foreign.jpg',
                    displayOrder: 0,
                },
            });

            const response = await request(app)
                .put(`${apiPath}/admin/v1/galleries/${testGalleryId}/images/reorder`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    images: [
                        { id: imageId1, displayOrder: 0 },
                        { id: foreignImage.id, displayOrder: 1 }, // belongs to otherGallery
                    ],
                });

            expect(response.status).toBe(400);

            // Cleanup
            await prisma.galleryImage.deleteMany({ where: { galleryId: otherGallery.id } });
            await prisma.gallery.delete({ where: { id: otherGallery.id } });
        });
    });
});
