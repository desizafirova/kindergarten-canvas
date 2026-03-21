import { Request, Response } from 'express';
import prisma from '../../../prisma/prisma-client';
import logger from '@utils/logger/winston/logger';

export const getSubscriberCounts = async (req: Request, res: Response) => {
    try {
        const [newsCount, eventsCount, deadlinesCount, totalCount] = await Promise.all([
            prisma.emailSubscriber.count({
                where: { isActive: true, subscriptionTypes: { has: 'NEWS' } },
            }),
            prisma.emailSubscriber.count({
                where: { isActive: true, subscriptionTypes: { has: 'EVENTS' } },
            }),
            prisma.emailSubscriber.count({
                where: { isActive: true, subscriptionTypes: { has: 'DEADLINES' } },
            }),
            prisma.emailSubscriber.count({ where: { isActive: true } }),
        ]);

        return res.status(200).json({
            status: 'success',
            data: {
                counts: {
                    NEWS: newsCount,
                    EVENTS: eventsCount,
                    DEADLINES: deadlinesCount,
                    total: totalCount,
                },
            },
        });
    } catch (error: unknown) {
        logger.error(`Get subscriber counts error: ${error}`);
        return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
