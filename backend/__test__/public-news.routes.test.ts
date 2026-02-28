import request from 'supertest';
import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import server from '../src/server/http_server';
import prisma from '../prisma/prisma-client';

let app: any;

describe('Public News API Endpoints', () => {
  // Start server before all tests
  beforeAll(async () => {
    const silent = true;
    app = await server(silent);
  });

  // Clean up test data after all tests
  afterAll(async () => {
    await prisma.newsItem.deleteMany({
      where: {
        title: {
          contains: '[TEST]',
        },
      },
    });
    await prisma.$disconnect();
  });

  // Clean up before each test
  beforeEach(async () => {
    await prisma.newsItem.deleteMany({
      where: {
        title: {
          contains: '[TEST]',
        },
      },
    });
  });

  describe('GET /api/v1/public/news', () => {
    it('should return 200 and only published news items', async () => {
      // Arrange: Create test data
      const publishedNews = await prisma.newsItem.create({
        data: {
          title: '[TEST] Published News',
          content: '<p>Published content</p>',
          status: 'PUBLISHED',
          publishedAt: new Date('2026-02-27T10:00:00Z'),
        },
      });

      const draftNews = await prisma.newsItem.create({
        data: {
          title: '[TEST] Draft News',
          content: '<p>Draft content</p>',
          status: 'DRAFT',
          publishedAt: null,
        },
      });

      // Act
      const response = await request(app).get('/api/v1/public/news');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.news).toBeDefined();
      expect(Array.isArray(response.body.data.news)).toBe(true);

      // Should only include published news
      const newsIds = response.body.data.news.map((n: any) => n.id);
      expect(newsIds).toContain(publishedNews.id);
      expect(newsIds).not.toContain(draftNews.id);
    });

    it('should exclude draft items from the list', async () => {
      // Arrange
      await prisma.newsItem.create({
        data: {
          title: '[TEST] Published 1',
          content: '<p>Content 1</p>',
          status: 'PUBLISHED',
          publishedAt: new Date('2026-02-27T10:00:00Z'),
        },
      });

      await prisma.newsItem.create({
        data: {
          title: '[TEST] Draft 1',
          content: '<p>Draft content</p>',
          status: 'DRAFT',
          publishedAt: null,
        },
      });

      // Act
      const response = await request(app).get('/api/v1/public/news');

      // Assert
      expect(response.status).toBe(200);
      const draftItems = response.body.data.news.filter(
        (n: any) => n.status === 'DRAFT'
      );
      expect(draftItems.length).toBe(0);
    });

    it('should sort results by publishedAt DESC (newest first)', async () => {
      // Arrange: Create news items with different published dates
      const older = await prisma.newsItem.create({
        data: {
          title: '[TEST] Older News',
          content: '<p>Older content</p>',
          status: 'PUBLISHED',
          publishedAt: new Date('2026-02-25T10:00:00Z'),
        },
      });

      const newer = await prisma.newsItem.create({
        data: {
          title: '[TEST] Newer News',
          content: '<p>Newer content</p>',
          status: 'PUBLISHED',
          publishedAt: new Date('2026-02-27T10:00:00Z'),
        },
      });

      const newest = await prisma.newsItem.create({
        data: {
          title: '[TEST] Newest News',
          content: '<p>Newest content</p>',
          status: 'PUBLISHED',
          publishedAt: new Date('2026-02-28T10:00:00Z'),
        },
      });

      // Act
      const response = await request(app).get('/api/v1/public/news');

      // Assert
      expect(response.status).toBe(200);
      const news = response.body.data.news;
      expect(news.length).toBeGreaterThanOrEqual(3);

      // Check order: newest first
      const testNews = news.filter((n: any) => n.title.includes('[TEST]'));
      expect(testNews[0].id).toBe(newest.id);
      expect(testNews[1].id).toBe(newer.id);
      expect(testNews[2].id).toBe(older.id);
    });

    it('should return JSend success format', async () => {
      // Act
      const response = await request(app).get('/api/v1/public/news');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('news');
    });

    it('should respond in less than 500ms', async () => {
      // Arrange: Create some test data
      await prisma.newsItem.create({
        data: {
          title: '[TEST] Performance Test',
          content: '<p>Content</p>',
          status: 'PUBLISHED',
          publishedAt: new Date(),
        },
      });

      // Act
      const startTime = Date.now();
      const response = await request(app).get('/api/v1/public/news');
      const duration = Date.now() - startTime;

      // Assert
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(500);
    });
  });

  describe('GET /api/v1/public/news/:id', () => {
    it('should return 200 and the single published news item', async () => {
      // Arrange
      const publishedNews = await prisma.newsItem.create({
        data: {
          title: '[TEST] Published Detail',
          content: '<p>Published detail content</p>',
          status: 'PUBLISHED',
          publishedAt: new Date('2026-02-27T10:00:00Z'),
        },
      });

      // Act
      const response = await request(app).get(
        `/api/v1/public/news/${publishedNews.id}`
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.news).toBeDefined();
      expect(response.body.data.news.id).toBe(publishedNews.id);
      expect(response.body.data.news.title).toBe('[TEST] Published Detail');
    });

    it('should return 404 for draft items', async () => {
      // Arrange
      const draftNews = await prisma.newsItem.create({
        data: {
          title: '[TEST] Draft Detail',
          content: '<p>Draft content</p>',
          status: 'DRAFT',
          publishedAt: null,
        },
      });

      // Act
      const response = await request(app).get(
        `/api/v1/public/news/${draftNews.id}`
      );

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.data.message).toContain('not found');
    });

    it('should return 404 for invalid ID', async () => {
      // Act
      const response = await request(app).get('/api/v1/public/news/999999');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
    });
  });
});
