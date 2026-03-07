import { Request, Response } from 'express';
import prisma from '../../../prisma/prisma-client';

/**
 * Get all published teachers
 * Public endpoint - no authentication required
 * Filters for PUBLISHED status only and sorts by displayOrder ASC, then lastName ASC
 */
export const getPublishedTeachers = async (req: Request, res: Response) => {
    try {
        const startTime = Date.now();

        const publishedTeachers = await prisma.teachers.findMany({
            where: {
                status: 'PUBLISHED',
            },
            orderBy: [
                { displayOrder: 'asc' }, // Admin-controlled order first
                { lastName: 'asc' },     // Alphabetical by last name second
            ],
            select: {
                id: true,
                firstName: true,
                lastName: true,
                position: true,
                bio: true,
                photoUrl: true,
                displayOrder: true,
            },
        });

        const duration = Date.now() - startTime;
        if (duration > 500) {
            console.warn(`⚠️ Public teachers list query took ${duration}ms (target: <500ms)`);
        }

        return res.status(200).json({
            status: 'success',
            data: {
                teachers: publishedTeachers,
            },
        });
    } catch (error) {
        console.error('Error fetching published teachers:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
