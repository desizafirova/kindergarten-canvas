import { Request, Response } from 'express';
import prisma from '../../../prisma/prisma-client';
import { getExcerpt } from '../../utils/text/strip_html';

/**
 * Get aggregated homepage data in a single API call.
 * Public endpoint - no authentication required.
 * Returns: latest 3 news, upcoming 3 events, deadlines summary, latest gallery cover.
 */
export const getHomepageData = async (req: Request, res: Response) => {
    try {
        const startTime = Date.now();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const deadlineWhere = { status: 'PUBLISHED' as const, deadlineDate: { gte: today } };

        const [latestNewsRaw, upcomingEvents, activeDeadlineCount, nearestDeadline, latestGalleryRaw] =
            await Promise.all([
                // Query 1: latest 3 published news
                prisma.news_items.findMany({
                    where: {
                        status: 'PUBLISHED',
                        publishedAt: { not: null },
                    },
                    orderBy: { publishedAt: 'desc' },
                    take: 3,
                    select: {
                        id: true,
                        title: true,
                        content: true,
                        publishedAt: true,
                    },
                }),

                // Query 2: upcoming 3 events
                prisma.event.findMany({
                    where: {
                        status: 'PUBLISHED',
                        eventDate: { gte: today },
                    },
                    orderBy: { eventDate: 'asc' },
                    take: 3,
                    select: {
                        id: true,
                        title: true,
                        eventDate: true,
                        isImportant: true,
                    },
                }),

                // Query 3a: count of active deadlines (efficient — no full fetch)
                prisma.deadline.count({ where: deadlineWhere }),

                // Query 3b: nearest deadline date only
                prisma.deadline.findFirst({
                    where: deadlineWhere,
                    orderBy: { deadlineDate: 'asc' },
                    select: { deadlineDate: true },
                }),

                // Query 4: latest published gallery
                prisma.gallery.findMany({
                    where: { status: 'PUBLISHED' },
                    orderBy: { publishedAt: 'desc' },
                    take: 1,
                    select: { coverImageUrl: true },
                }),
            ]);

        const duration = Date.now() - startTime;
        if (duration > 500) {
            console.warn(`⚠️ Homepage aggregated query took ${duration}ms (target: <500ms)`);
        }

        // Transform news: replace raw content with excerpt
        const latestNews = latestNewsRaw.map(({ content, ...rest }) => ({
            ...rest,
            excerpt: getExcerpt(content),
        }));

        // Transform deadlines into summary
        const deadlinesSummary = {
            activeCount: activeDeadlineCount,
            nearestDeadlineDate: nearestDeadline?.deadlineDate ?? null,
        };

        // Extract latest gallery cover URL
        const latestGalleryCoverUrl = latestGalleryRaw[0]?.coverImageUrl ?? null;

        res.set('Cache-Control', 'public, max-age=60');
        return res.status(200).json({
            status: 'success',
            data: {
                latestNews,
                upcomingEvents,
                deadlinesSummary,
                latestGalleryCoverUrl,
            },
        });
    } catch (error) {
        console.error('Error fetching homepage data:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
