import { Request, Response } from 'express';
import prisma from '../../../prisma/prisma-client';

/**
 * Get all published news items
 * Public endpoint - no authentication required
 * Filters for PUBLISHED status only and sorts by publishedAt DESC
 */
export const getPublishedNews = async (req: Request, res: Response) => {
    try {
        const startTime = Date.now();

        const publishedNews = await prisma.newsItem.findMany({
            where: {
                status: 'PUBLISHED',
                publishedAt: {
                    not: null,
                },
            },
            orderBy: {
                publishedAt: 'desc', // Newest first
            },
            select: {
                id: true,
                title: true,
                content: true,
                imageUrl: true,
                publishedAt: true,
            },
            take: 100, // Reasonable limit to ensure response time < 500ms
        });

        const duration = Date.now() - startTime;
        if (duration > 500) {
            console.warn(`⚠️ Public news list query took ${duration}ms (target: <500ms)`);
        }

        return res.status(200).json({
            status: 'success',
            data: {
                news: publishedNews,
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

        const newsItem = await prisma.newsItem.findUnique({
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
