import { Request, Response } from 'express';
import prisma from '../../../prisma/prisma-client';

export const getPublicJobs = async (req: Request, res: Response) => {
    try {
        const startTime = Date.now();

        const jobs = await prisma.job.findMany({
            where: {
                status: 'PUBLISHED',
                isActive: true,
            },
            orderBy: [{ createdAt: 'desc' }],
            select: {
                id: true,
                title: true,
                description: true,
                requirements: true,
                applicationDeadline: true,
                isActive: true,
                publishedAt: true,
                createdAt: true,
            },
        });

        const duration = Date.now() - startTime;
        if (duration > 500) {
            console.warn(`⚠️ Public jobs list query took ${duration}ms (target: <500ms)`);
        }

        return res.status(200).json({
            status: 'success',
            data: { jobs },
        });
    } catch (error) {
        console.error('Error fetching published jobs:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};

export const getPublicJob = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(404).json({
                status: 'fail',
                data: { message: 'Позицията не е намерена' },
            });
        }

        const job = await prisma.job.findFirst({
            where: {
                id,
                status: 'PUBLISHED',
                isActive: true,
            },
            select: {
                id: true,
                title: true,
                description: true,
                requirements: true,
                applicationDeadline: true,
                isActive: true,
                publishedAt: true,
                createdAt: true,
            },
        });

        if (!job) {
            return res.status(404).json({
                status: 'fail',
                data: { message: 'Позицията не е намерена' },
            });
        }

        return res.status(200).json({
            status: 'success',
            data: { job },
        });
    } catch (error) {
        console.error('Error fetching published job:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
