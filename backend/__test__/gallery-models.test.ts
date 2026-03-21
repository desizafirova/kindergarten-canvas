import { PrismaClient, GalleryStatus } from '@prisma/client';

const prisma = new PrismaClient();

describe('Gallery and GalleryImage Prisma Models', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Gallery Model', () => {
    it('should create a Gallery with all required fields', async () => {
      const gallery = await prisma.gallery.create({
        data: {
          title: 'Test Gallery',
          status: GalleryStatus.DRAFT,
        },
      });

      expect(gallery).toBeDefined();
      expect(gallery.id).toBeDefined();
      expect(gallery.title).toBe('Test Gallery');
      expect(gallery.status).toBe(GalleryStatus.DRAFT);
      expect(gallery.description).toBeNull();
      expect(gallery.coverImageUrl).toBeNull();
      expect(gallery.publishedAt).toBeNull();
      expect(gallery.createdAt).toBeDefined();
      expect(gallery.updatedAt).toBeDefined();

      // Cleanup
      await prisma.gallery.delete({ where: { id: gallery.id } });
    });

    it('should create a Gallery with all optional fields', async () => {
      const gallery = await prisma.gallery.create({
        data: {
          title: 'Complete Test Gallery',
          description: '<p>Rich text gallery description</p>',
          coverImageUrl: 'https://res.cloudinary.com/test/image/upload/cover.jpg',
          status: GalleryStatus.PUBLISHED,
          publishedAt: new Date(),
        },
      });

      expect(gallery.description).toBe('<p>Rich text gallery description</p>');
      expect(gallery.coverImageUrl).toBe('https://res.cloudinary.com/test/image/upload/cover.jpg');
      expect(gallery.status).toBe(GalleryStatus.PUBLISHED);
      expect(gallery.publishedAt).toBeDefined();

      // Cleanup
      await prisma.gallery.delete({ where: { id: gallery.id } });
    });

    it('should auto-update updatedAt on modification', async () => {
      const gallery = await prisma.gallery.create({
        data: {
          title: 'Update Test Gallery',
          status: GalleryStatus.DRAFT,
        },
      });

      const originalUpdatedAt = gallery.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 100));

      const updated = await prisma.gallery.update({
        where: { id: gallery.id },
        data: { title: 'Updated Gallery Title' },
      });

      expect(updated.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());

      // Cleanup
      await prisma.gallery.delete({ where: { id: gallery.id } });
    });
  });

  describe('GalleryImage Model', () => {
    it('should create a GalleryImage with all required fields', async () => {
      const gallery = await prisma.gallery.create({
        data: { title: 'Parent Gallery', status: GalleryStatus.DRAFT },
      });

      const image = await prisma.galleryImage.create({
        data: {
          galleryId: gallery.id,
          imageUrl: 'https://res.cloudinary.com/test/image/upload/photo.jpg',
        },
      });

      expect(image).toBeDefined();
      expect(image.id).toBeDefined();
      expect(image.galleryId).toBe(gallery.id);
      expect(image.imageUrl).toBe('https://res.cloudinary.com/test/image/upload/photo.jpg');
      expect(image.displayOrder).toBe(0); // Default value
      expect(image.thumbnailUrl).toBeNull();
      expect(image.altText).toBeNull();
      expect(image.createdAt).toBeDefined();

      // Cleanup (gallery cascade deletes images)
      await prisma.gallery.delete({ where: { id: gallery.id } });
    });

    it('should create a GalleryImage with all optional fields', async () => {
      const gallery = await prisma.gallery.create({
        data: { title: 'Parent Gallery Optional', status: GalleryStatus.DRAFT },
      });

      const image = await prisma.galleryImage.create({
        data: {
          galleryId: gallery.id,
          imageUrl: 'https://res.cloudinary.com/test/image/upload/photo.jpg',
          thumbnailUrl: 'https://res.cloudinary.com/test/image/upload/w_200/photo.jpg',
          altText: 'Children playing in the garden',
          displayOrder: 3,
        },
      });

      expect(image.thumbnailUrl).toBe('https://res.cloudinary.com/test/image/upload/w_200/photo.jpg');
      expect(image.altText).toBe('Children playing in the garden');
      expect(image.displayOrder).toBe(3);

      // Cleanup
      await prisma.gallery.delete({ where: { id: gallery.id } });
    });

    it('should cascade delete GalleryImages when Gallery is deleted', async () => {
      const gallery = await prisma.gallery.create({
        data: { title: 'Cascade Test Gallery', status: GalleryStatus.DRAFT },
      });

      const image = await prisma.galleryImage.create({
        data: {
          galleryId: gallery.id,
          imageUrl: 'https://res.cloudinary.com/test/image/upload/cascade.jpg',
        },
      });

      // Delete parent gallery — images should cascade delete
      await prisma.gallery.delete({ where: { id: gallery.id } });

      const orphan = await prisma.galleryImage.findUnique({ where: { id: image.id } });
      expect(orphan).toBeNull();
    });
  });

  describe('GalleryStatus Enum', () => {
    it('should enforce GalleryStatus enum values', async () => {
      const draft = await prisma.gallery.create({
        data: { title: 'Draft Gallery', status: GalleryStatus.DRAFT },
      });
      expect(draft.status).toBe('DRAFT');

      const published = await prisma.gallery.create({
        data: { title: 'Published Gallery', status: GalleryStatus.PUBLISHED },
      });
      expect(published.status).toBe('PUBLISHED');

      // Cleanup
      await prisma.gallery.delete({ where: { id: draft.id } });
      await prisma.gallery.delete({ where: { id: published.id } });
    });
  });
});
