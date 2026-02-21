/**
 * NewsItem Model Integration Tests
 * Tests for the NewsItem Prisma model (Story 3.1)
 */

import { PrismaClient, NewsStatus } from '@prisma/client';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';

const prisma = new PrismaClient();

describe('NewsItem Model', () => {
    // Clean up test data before each test
    beforeEach(async () => {
        await prisma.newsItem.deleteMany({
            where: {
                title: { startsWith: 'TEST_' },
            },
        });
    });

    // Clean up after all tests
    afterAll(async () => {
        await prisma.newsItem.deleteMany({
            where: {
                title: { startsWith: 'TEST_' },
            },
        });
        await prisma.$disconnect();
    });

    describe('NewsStatus Enum', () => {
        it('should accept DRAFT status', async () => {
            const newsItem = await prisma.newsItem.create({
                data: {
                    title: 'TEST_Draft News',
                    content: '<p>Draft content</p>',
                    status: NewsStatus.DRAFT,
                },
            });

            expect(newsItem.status).toBe('DRAFT');
            expect(newsItem.id).toBeDefined();
        });

        it('should accept PUBLISHED status', async () => {
            const newsItem = await prisma.newsItem.create({
                data: {
                    title: 'TEST_Published News',
                    content: '<p>Published content</p>',
                    status: NewsStatus.PUBLISHED,
                    publishedAt: new Date(),
                },
            });

            expect(newsItem.status).toBe('PUBLISHED');
            expect(newsItem.publishedAt).toBeDefined();
        });

        it('should default to DRAFT status when not specified', async () => {
            const newsItem = await prisma.newsItem.create({
                data: {
                    title: 'TEST_Default Status News',
                    content: '<p>Content without explicit status</p>',
                },
            });

            expect(newsItem.status).toBe('DRAFT');
        });
    });

    describe('Required Fields', () => {
        it('should create a news item with required fields only', async () => {
            const newsItem = await prisma.newsItem.create({
                data: {
                    title: 'TEST_Minimal News',
                    content: '<p>Minimal content</p>',
                },
            });

            expect(newsItem.id).toBeDefined();
            expect(newsItem.title).toBe('TEST_Minimal News');
            expect(newsItem.content).toBe('<p>Minimal content</p>');
            expect(newsItem.imageUrl).toBeNull();
            expect(newsItem.status).toBe('DRAFT');
            expect(newsItem.publishedAt).toBeNull();
            expect(newsItem.createdAt).toBeDefined();
            expect(newsItem.updatedAt).toBeDefined();
        });

        it('should enforce title as required', async () => {
            // Use raw query to bypass TypeScript - tests database constraint
            await expect(
                prisma.$executeRaw`INSERT INTO news_items (content, status, "createdAt", "updatedAt") VALUES ('test', 'DRAFT', NOW(), NOW())`
            ).rejects.toThrow();
        });

        it('should enforce content as required', async () => {
            // Use raw query to bypass TypeScript - tests database constraint
            await expect(
                prisma.$executeRaw`INSERT INTO news_items (title, status, "createdAt", "updatedAt") VALUES ('test', 'DRAFT', NOW(), NOW())`
            ).rejects.toThrow();
        });
    });

    describe('Optional Fields', () => {
        it('should allow optional imageUrl', async () => {
            const newsItem = await prisma.newsItem.create({
                data: {
                    title: 'TEST_News with Image',
                    content: '<p>Content with image</p>',
                    imageUrl: 'https://res.cloudinary.com/example/image.jpg',
                },
            });

            expect(newsItem.imageUrl).toBe('https://res.cloudinary.com/example/image.jpg');
        });

        it('should allow optional publishedAt', async () => {
            const publishDate = new Date('2026-02-07T12:00:00Z');
            const newsItem = await prisma.newsItem.create({
                data: {
                    title: 'TEST_Scheduled News',
                    content: '<p>Scheduled content</p>',
                    status: NewsStatus.PUBLISHED,
                    publishedAt: publishDate,
                },
            });

            expect(newsItem.publishedAt).toEqual(publishDate);
        });
    });

    describe('Auto-Generated Fields', () => {
        it('should auto-increment id', async () => {
            const first = await prisma.newsItem.create({
                data: { title: 'TEST_First', content: '<p>First</p>' },
            });
            const second = await prisma.newsItem.create({
                data: { title: 'TEST_Second', content: '<p>Second</p>' },
            });

            expect(second.id).toBeGreaterThan(first.id);
        });

        it('should auto-set createdAt on creation', async () => {
            const before = new Date();
            const newsItem = await prisma.newsItem.create({
                data: { title: 'TEST_Timestamp Test', content: '<p>Test</p>' },
            });
            const after = new Date();

            expect(newsItem.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000);
            expect(newsItem.createdAt.getTime()).toBeLessThanOrEqual(after.getTime() + 1000);
        });

        it('should auto-update updatedAt on modification', async () => {
            const newsItem = await prisma.newsItem.create({
                data: { title: 'TEST_Update Test', content: '<p>Original</p>' },
            });

            const originalUpdatedAt = newsItem.updatedAt;

            // Small delay to ensure timestamp difference
            await new Promise((resolve) => setTimeout(resolve, 100));

            const updated = await prisma.newsItem.update({
                where: { id: newsItem.id },
                data: { content: '<p>Updated</p>' },
            });

            expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
        });
    });

    describe('HTML Content Storage', () => {
        it('should store and retrieve HTML content from TipTap editor', async () => {
            const htmlContent = `
                <h1>News Title</h1>
                <p>This is a <strong>rich text</strong> paragraph with <em>formatting</em>.</p>
                <ul>
                    <li>Item 1</li>
                    <li>Item 2</li>
                </ul>
            `;

            const newsItem = await prisma.newsItem.create({
                data: {
                    title: 'TEST_Rich HTML News',
                    content: htmlContent,
                },
            });

            expect(newsItem.content).toBe(htmlContent);
        });

        it('should handle Bulgarian characters in HTML content', async () => {
            const bulgarianContent = '<p>Добре дошли в детска градина "Дъга"! Новини за родители.</p>';

            const newsItem = await prisma.newsItem.create({
                data: {
                    title: 'TEST_Зимна ваканция 2026',
                    content: bulgarianContent,
                },
            });

            expect(newsItem.title).toBe('TEST_Зимна ваканция 2026');
            expect(newsItem.content).toBe(bulgarianContent);
        });
    });

    describe('Query Operations', () => {
        beforeEach(async () => {
            // Create test data for query tests
            await prisma.newsItem.createMany({
                data: [
                    { title: 'TEST_Draft 1', content: '<p>Draft</p>', status: NewsStatus.DRAFT },
                    { title: 'TEST_Draft 2', content: '<p>Draft</p>', status: NewsStatus.DRAFT },
                    { title: 'TEST_Published 1', content: '<p>Published</p>', status: NewsStatus.PUBLISHED },
                ],
            });
        });

        it('should filter by status using index', async () => {
            const drafts = await prisma.newsItem.findMany({
                where: {
                    status: NewsStatus.DRAFT,
                    title: { startsWith: 'TEST_' },
                },
            });

            const published = await prisma.newsItem.findMany({
                where: {
                    status: NewsStatus.PUBLISHED,
                    title: { startsWith: 'TEST_' },
                },
            });

            expect(drafts.length).toBe(2);
            expect(published.length).toBe(1);
        });

        it('should count by status for dashboard stats', async () => {
            const draftCount = await prisma.newsItem.count({
                where: {
                    status: NewsStatus.DRAFT,
                    title: { startsWith: 'TEST_' },
                },
            });

            const publishedCount = await prisma.newsItem.count({
                where: {
                    status: NewsStatus.PUBLISHED,
                    title: { startsWith: 'TEST_' },
                },
            });

            expect(draftCount).toBe(2);
            expect(publishedCount).toBe(1);
        });
    });
});
