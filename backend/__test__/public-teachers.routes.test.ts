import request from 'supertest';
import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import server from '../src/server/http_server';
import prisma from '../prisma/prisma-client';

let app: any;

describe('Public Teachers API Endpoints', () => {
  // Start server before all tests
  beforeAll(async () => {
    const silent = true;
    app = await server(silent);
  });

  // Clean up test data after all tests
  afterAll(async () => {
    await prisma.teacher.deleteMany({
      where: {
        firstName: {
          contains: '[TEST]',
        },
      },
    });
    await prisma.$disconnect();
  });

  // Clean up before each test
  beforeEach(async () => {
    await prisma.teacher.deleteMany({
      where: {
        firstName: {
          contains: '[TEST]',
        },
      },
    });
  });

  describe('GET /api/v1/public/teachers', () => {
    it('should return 200 and only published teachers', async () => {
      // Arrange: Create test data
      const publishedTeacher = await prisma.teacher.create({
        data: {
          firstName: '[TEST] Мария',
          lastName: 'Петрова',
          position: 'Учител',
          bio: '<p>Биография на учителя</p>',
          photoUrl: 'https://res.cloudinary.com/example/teacher.jpg',
          status: 'PUBLISHED',
          displayOrder: 1,
        },
      });

      const draftTeacher = await prisma.teacher.create({
        data: {
          firstName: '[TEST] Иван',
          lastName: 'Стефанов',
          position: 'Директор',
          bio: '<p>Биография на директора</p>',
          status: 'DRAFT',
          displayOrder: 2,
        },
      });

      // Act
      const response = await request(app).get('/api/v1/public/teachers');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.teachers).toBeDefined();
      expect(Array.isArray(response.body.data.teachers)).toBe(true);

      // Should only include published teachers
      const teacherIds = response.body.data.teachers.map((t: any) => t.id);
      expect(teacherIds).toContain(publishedTeacher.id);
      expect(teacherIds).not.toContain(draftTeacher.id);
    });

    it('should exclude draft teachers from the list', async () => {
      // Arrange
      await prisma.teacher.create({
        data: {
          firstName: '[TEST] Анна',
          lastName: 'Георгиева',
          position: 'Учител',
          status: 'PUBLISHED',
          displayOrder: 1,
        },
      });

      await prisma.teacher.create({
        data: {
          firstName: '[TEST] Петър',
          lastName: 'Димитров',
          position: 'Помощник-възпитател',
          status: 'DRAFT',
          displayOrder: 2,
        },
      });

      // Act
      const response = await request(app).get('/api/v1/public/teachers');

      // Assert
      expect(response.status).toBe(200);
      const draftTeachers = response.body.data.teachers.filter(
        (t: any) => t.firstName.includes('Петър')
      );
      expect(draftTeachers.length).toBe(0);
    });

    it('should sort results by displayOrder ASC, then lastName ASC', async () => {
      // Arrange: Create teachers with different displayOrder and lastNames
      const teacher1 = await prisma.teacher.create({
        data: {
          firstName: '[TEST] Анна',
          lastName: 'Георгиева',
          position: 'Учител',
          status: 'PUBLISHED',
          displayOrder: 3,
        },
      });

      const teacher2 = await prisma.teacher.create({
        data: {
          firstName: '[TEST] Мария',
          lastName: 'Петрова',
          position: 'Учител',
          status: 'PUBLISHED',
          displayOrder: 1,
        },
      });

      const teacher3 = await prisma.teacher.create({
        data: {
          firstName: '[TEST] Иван',
          lastName: 'Атанасов',
          position: 'Директор',
          status: 'PUBLISHED',
          displayOrder: 3, // Same as teacher1, should sort by lastName
        },
      });

      // Act
      const response = await request(app).get('/api/v1/public/teachers');

      // Assert
      expect(response.status).toBe(200);
      const teachers = response.body.data.teachers;
      expect(teachers.length).toBeGreaterThanOrEqual(3);

      // Check order: displayOrder 1 first, then displayOrder 3 sorted by lastName (Atanasov before Georgieva)
      const testTeachers = teachers.filter((t: any) => t.firstName.includes('[TEST]'));
      expect(testTeachers[0].id).toBe(teacher2.id); // displayOrder 1
      expect(testTeachers[1].id).toBe(teacher3.id); // displayOrder 3, lastName Atanasov
      expect(testTeachers[2].id).toBe(teacher1.id); // displayOrder 3, lastName Georgieva
    });

    it('should return JSend success format', async () => {
      // Act
      const response = await request(app).get('/api/v1/public/teachers');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('teachers');
    });

    it('should exclude internal fields from response', async () => {
      // Arrange
      await prisma.teacher.create({
        data: {
          firstName: '[TEST] Мария',
          lastName: 'Петрова',
          position: 'Учител',
          status: 'PUBLISHED',
          displayOrder: 1,
        },
      });

      // Act
      const response = await request(app).get('/api/v1/public/teachers');

      // Assert
      expect(response.status).toBe(200);
      const teacher = response.body.data.teachers.find((t: any) =>
        t.firstName.includes('[TEST]')
      );

      expect(teacher).toHaveProperty('id');
      expect(teacher).toHaveProperty('firstName');
      expect(teacher).toHaveProperty('lastName');
      expect(teacher).toHaveProperty('position');
      expect(teacher).toHaveProperty('bio');
      expect(teacher).toHaveProperty('photoUrl');
      expect(teacher).toHaveProperty('displayOrder');

      // Should NOT expose internal fields
      expect(teacher).not.toHaveProperty('status');
      expect(teacher).not.toHaveProperty('createdAt');
      expect(teacher).not.toHaveProperty('updatedAt');
    });

    it('should respond in less than 500ms', async () => {
      // Arrange: Create some test data
      await prisma.teacher.create({
        data: {
          firstName: '[TEST] Мария',
          lastName: 'Петрова',
          position: 'Учител',
          status: 'PUBLISHED',
          displayOrder: 1,
        },
      });

      // Act
      const startTime = Date.now();
      const response = await request(app).get('/api/v1/public/teachers');
      const duration = Date.now() - startTime;

      // Assert
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(500);
    });

    it('should return empty array when no published teachers exist', async () => {
      // Arrange: Only create draft teacher
      await prisma.teacher.create({
        data: {
          firstName: '[TEST] Иван',
          lastName: 'Стефанов',
          position: 'Директор',
          status: 'DRAFT',
        },
      });

      // Act
      const response = await request(app).get('/api/v1/public/teachers');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      const testTeachers = response.body.data.teachers.filter((t: any) =>
        t.firstName.includes('[TEST]')
      );
      expect(testTeachers.length).toBe(0);
    });

    it('should not require authentication', async () => {
      // Act - Make request without any auth headers
      const response = await request(app).get('/api/v1/public/teachers');

      // Assert - Should succeed without authentication
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });
  });
});
