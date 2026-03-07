import { PrismaClient, EventStatus, DeadlineStatus } from '@prisma/client';

const prisma = new PrismaClient();

describe('Event and Deadline Prisma Models', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Event Model', () => {
    it('should create an Event with all required fields', async () => {
      const event = await prisma.event.create({
        data: {
          title: 'Test Event',
          eventDate: new Date('2026-04-15T10:00:00Z'),
          status: EventStatus.DRAFT,
        },
      });

      expect(event).toBeDefined();
      expect(event.id).toBeDefined();
      expect(event.title).toBe('Test Event');
      expect(event.status).toBe(EventStatus.DRAFT);
      expect(event.isImportant).toBe(false); // Default value
      expect(event.createdAt).toBeDefined();
      expect(event.updatedAt).toBeDefined();

      // Cleanup
      await prisma.event.delete({ where: { id: event.id } });
    });

    it('should create an Event with all optional fields', async () => {
      const event = await prisma.event.create({
        data: {
          title: 'Complete Test Event',
          description: '<p>Rich text description from TipTap</p>',
          eventDate: new Date('2026-05-20T14:00:00Z'),
          eventEndDate: new Date('2026-05-20T18:00:00Z'),
          location: 'Test Location',
          isImportant: true,
          imageUrl: 'https://example.com/image.jpg',
          status: EventStatus.PUBLISHED,
          publishedAt: new Date(),
        },
      });

      expect(event.description).toBe('<p>Rich text description from TipTap</p>');
      expect(event.eventEndDate).toBeDefined();
      expect(event.location).toBe('Test Location');
      expect(event.isImportant).toBe(true);
      expect(event.imageUrl).toBe('https://example.com/image.jpg');
      expect(event.publishedAt).toBeDefined();

      // Cleanup
      await prisma.event.delete({ where: { id: event.id } });
    });

    it('should auto-update updatedAt on modification', async () => {
      const event = await prisma.event.create({
        data: {
          title: 'Update Test Event',
          eventDate: new Date('2026-06-01T10:00:00Z'),
          status: EventStatus.DRAFT,
        },
      });

      const originalUpdatedAt = event.updatedAt;

      // Wait a moment to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 100));

      const updated = await prisma.event.update({
        where: { id: event.id },
        data: { title: 'Updated Event Title' },
      });

      expect(updated.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());

      // Cleanup
      await prisma.event.delete({ where: { id: event.id } });
    });
  });

  describe('Deadline Model', () => {
    it('should create a Deadline with all required fields', async () => {
      const deadline = await prisma.deadline.create({
        data: {
          title: 'Test Deadline',
          deadlineDate: new Date('2026-05-01T23:59:59Z'),
          status: DeadlineStatus.DRAFT,
        },
      });

      expect(deadline).toBeDefined();
      expect(deadline.id).toBeDefined();
      expect(deadline.title).toBe('Test Deadline');
      expect(deadline.status).toBe(DeadlineStatus.DRAFT);
      expect(deadline.isUrgent).toBe(false); // Default value
      expect(deadline.createdAt).toBeDefined();
      expect(deadline.updatedAt).toBeDefined();

      // Cleanup
      await prisma.deadline.delete({ where: { id: deadline.id } });
    });

    it('should create a Deadline with all optional fields', async () => {
      const deadline = await prisma.deadline.create({
        data: {
          title: 'Complete Test Deadline',
          description: '<p>Important deadline description</p>',
          deadlineDate: new Date('2026-06-15T23:59:59Z'),
          isUrgent: true,
          status: DeadlineStatus.PUBLISHED,
          publishedAt: new Date(),
        },
      });

      expect(deadline.description).toBe('<p>Important deadline description</p>');
      expect(deadline.isUrgent).toBe(true);
      expect(deadline.publishedAt).toBeDefined();

      // Cleanup
      await prisma.deadline.delete({ where: { id: deadline.id } });
    });

    it('should auto-update updatedAt on modification', async () => {
      const deadline = await prisma.deadline.create({
        data: {
          title: 'Update Test Deadline',
          deadlineDate: new Date('2026-07-01T23:59:59Z'),
          status: DeadlineStatus.DRAFT,
        },
      });

      const originalUpdatedAt = deadline.updatedAt;

      // Wait a moment to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 100));

      const updated = await prisma.deadline.update({
        where: { id: deadline.id },
        data: { title: 'Updated Deadline Title' },
      });

      expect(updated.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());

      // Cleanup
      await prisma.deadline.delete({ where: { id: deadline.id } });
    });
  });

  describe('Event and Deadline Status Enums', () => {
    it('should enforce EventStatus enum values', async () => {
      const draftEvent = await prisma.event.create({
        data: {
          title: 'Draft Event',
          eventDate: new Date('2026-08-01T10:00:00Z'),
          status: EventStatus.DRAFT,
        },
      });

      expect(draftEvent.status).toBe('DRAFT');

      const publishedEvent = await prisma.event.create({
        data: {
          title: 'Published Event',
          eventDate: new Date('2026-08-02T10:00:00Z'),
          status: EventStatus.PUBLISHED,
        },
      });

      expect(publishedEvent.status).toBe('PUBLISHED');

      // Cleanup
      await prisma.event.delete({ where: { id: draftEvent.id } });
      await prisma.event.delete({ where: { id: publishedEvent.id } });
    });

    it('should enforce DeadlineStatus enum values', async () => {
      const draftDeadline = await prisma.deadline.create({
        data: {
          title: 'Draft Deadline',
          deadlineDate: new Date('2026-08-15T23:59:59Z'),
          status: DeadlineStatus.DRAFT,
        },
      });

      expect(draftDeadline.status).toBe('DRAFT');

      const publishedDeadline = await prisma.deadline.create({
        data: {
          title: 'Published Deadline',
          deadlineDate: new Date('2026-08-20T23:59:59Z'),
          status: DeadlineStatus.PUBLISHED,
        },
      });

      expect(publishedDeadline.status).toBe('PUBLISHED');

      // Cleanup
      await prisma.deadline.delete({ where: { id: draftDeadline.id } });
      await prisma.deadline.delete({ where: { id: publishedDeadline.id } });
    });
  });
});
