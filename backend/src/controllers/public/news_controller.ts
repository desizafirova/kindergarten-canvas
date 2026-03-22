import { Request, Response } from 'express';
import prisma from '../../../prisma/prisma-client';

/**
 * Get all published news items with pagination
 * Public endpoint - no authentication required
 * Filters for PUBLISHED status only and sorts by publishedAt DESC
 */
export const getPublishedNews = async (req: Request, res: Response) => {
    try {
        const startTime = Date.now();

        const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
        const rawLimit = parseInt(String(req.query.limit ?? '10'), 10) || 10;
        const limit = Math.min(50, Math.max(1, rawLimit));
        const skip = (page - 1) * limit;

        const where = {
            status: 'PUBLISHED' as const,
            publishedAt: { not: null },
        };

        const [totalCount, publishedNews] = await Promise.all([
            prisma.news_items.count({ where }),
            prisma.news_items.findMany({
                where,
                orderBy: { publishedAt: 'desc' },
                skip,
                take: limit,
                select: {
                    id: true,
                    title: true,
                    content: true,
                    imageUrl: true,
                    publishedAt: true,
                },
            }),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        const duration = Date.now() - startTime;
        if (duration > 500) {
            console.warn(`⚠️ Public news list query took ${duration}ms (target: <500ms)`);
        }

        res.set('Cache-Control', 'public, max-age=60');
        return res.status(200).json({
            status: 'success',
            data: {
                news: publishedNews,
                totalCount,
                page,
                limit,
                totalPages,
            },
        });
    } catch (error) {
        console.error('Error fetching published news:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};

/**
 * Get a single published news item by ID
 * Public endpoint - no authentication required
 * Returns 404 for draft items or non-existent IDs
 */
export const getPublishedNewsById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const newsId = parseInt(id, 10);

        if (isNaN(newsId)) {
            return res.status(404).json({
                status: 'fail',
                data: {
                    message: 'News item not found',
                },
            });
        }

        const newsItem = await prisma.news_items.findUnique({
            where: {
                id: newsId,
            },
        });

        // Return 404 if not found OR not published
        if (!newsItem || newsItem.status !== 'PUBLISHED' || !newsItem.publishedAt) {
            return res.status(404).json({
                status: 'fail',
                data: {
                    message: 'News item not found',
                },
            });
        }

        res.set('Cache-Control', 'public, max-age=300');
        return res.status(200).json({
            status: 'success',
            data: {
                news: newsItem,
            },
        });
    } catch (error) {
        console.error('Error fetching published news by ID:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
