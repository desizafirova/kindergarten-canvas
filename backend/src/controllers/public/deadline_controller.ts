import { Request, Response } from 'express';
import prisma from '../../../prisma/prisma-client';

export const getPublicDeadlineById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(404).json({
                status: 'fail',
                data: { message: 'Срокът не е намерен' },
            });
        }

        const deadlineRecord = await prisma.deadline.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                description: true,
                deadlineDate: true,
                isUrgent: true,
                status: true,
                publishedAt: true,
            },
        });

        if (!deadlineRecord || deadlineRecord.status !== 'PUBLISHED') {
            return res.status(404).json({
                status: 'fail',
                data: { message: 'Срокът не е намерен' },
            });
        }

        const { status: _status, ...deadline } = deadlineRecord;

        res.set('Cache-Control', 'public, max-age=300');
        return res.status(200).json({
            status: 'success',
            data: { deadline },
        });
    } catch (error) {
        console.error('Error fetching published deadline by ID:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};

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

        res.set('Cache-Control', 'public, max-age=60');
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
