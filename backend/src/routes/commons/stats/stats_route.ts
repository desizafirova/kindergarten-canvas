/**
 * Stats API Routes
 * Provides content count statistics for the dashboard
 * All routes require JWT authentication
 */

import { Router, Request, Response } from 'express';
import auth from '@middlewares/auth/authenticate';
import prisma from '../../../../prisma/prisma-client';
import { NewsStatus } from '@prisma/client';

const router = Router();

/**
 * GET /api/v1/stats/content-counts
 * Returns draft and published counts for all 6 content types
 * @auth Required (JWT)
 * @returns {Object} Content counts for news, careers, events, deadlines, gallery, teachers
 */
router.get('/content-counts', auth('jwt-user'), async (req: Request, res: Response) => {
    try {
        // Query real news counts from database (Story 3.1)
        const [newsDraftCount, newsPublishedCount] = await Promise.all([
            prisma.newsItem.count({ where: { status: NewsStatus.DRAFT } }),
            prisma.newsItem.count({ where: { status: NewsStatus.PUBLISHED } }),
        ]);

        // Mock data for other content types - will be updated in future stories
        const counts = {
            news: { draft: newsDraftCount, published: newsPublishedCount },
            careers: { draft: 0, published: 0 },
            events: { draft: 0, published: 0 },
            deadlines: { draft: 0, published: 0 },
            gallery: { draft: 0, published: 0 },
            teachers: { draft: 0, published: 0 },
        };

        // Standard API response format
        res.status(200).json({
            success: true,
            content: counts,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to fetch content counts',
            },
        });
    }
});

export default router;
