import { Request, Response } from 'express';
import prisma from '../../../prisma/prisma-client';

export const getPublicDeadlines = async (req: Request, res: Response) => {
    try {
        const startTime = Date.now();

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today

        const publishedDeadlines = await prisma.deadline.findMany({
            where: {
                status: 'PUBLISHED',
                deadlineDate: { gte: today }, // Future deadlines only
            },
            orderBy: [{ deadlineDate: 'asc' }],
            select: {
                id: true,
                title: true,
                description: true,
                deadlineDate: true,
                isUrgent: true,
                publishedAt: true,
            },
        });

        const duration = Date.now() - startTime;
        if (duration > 500) {
            console.warn(`⚠️ Public deadlines list query took ${duration}ms (target: <500ms)`);
        }

        return res.status(200).json({
            status: 'success',
            data: { deadlines: publishedDeadlines },
        });
    } catch (error) {
        console.error('Error fetching published deadlines:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
