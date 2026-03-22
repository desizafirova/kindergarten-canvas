import { Request, Response } from 'express';
import prisma from '../../../prisma/prisma-client';

export const getPublicEventById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(404).json({
                status: 'fail',
                data: { message: 'Събитието не е намерено' },
            });
        }

        const eventRecord = await prisma.event.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                description: true,
                eventDate: true,
                eventEndDate: true,
                location: true,
                isImportant: true,
                imageUrl: true,
                status: true,
                publishedAt: true,
            },
        });

        if (!eventRecord || eventRecord.status !== 'PUBLISHED') {
            return res.status(404).json({
                status: 'fail',
                data: { message: 'Събитието не е намерено' },
            });
        }

        const { status: _status, ...event } = eventRecord;

        res.set('Cache-Control', 'public, max-age=300');
        return res.status(200).json({
            status: 'success',
            data: { event },
        });
    } catch (error) {
        console.error('Error fetching published event by ID:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};

export const getPublicEvents = async (req: Request, res: Response) => {
    try {
        const startTime = Date.now();
        const includePast = req.query.includePast === 'true';

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today

        const publishedEvents = await prisma.event.findMany({
            where: {
                status: 'PUBLISHED',
                ...(!includePast && { eventDate: { gte: today } }),
            },
            orderBy: [{ eventDate: 'asc' }],
            select: {
                id: true,
                title: true,
                description: true,
                eventDate: true,
                eventEndDate: true,
                location: true,
                isImportant: true,
                imageUrl: true,
                publishedAt: true,
            },
        });

        const duration = Date.now() - startTime;
        if (duration > 500) {
            console.warn(`⚠️ Public events list query took ${duration}ms (target: <500ms)`);
        }

        res.set('Cache-Control', 'public, max-age=60');
        return res.status(200).json({
            status: 'success',
            data: { events: publishedEvents },
        });
    } catch (error) {
        console.error('Error fetching published events:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
