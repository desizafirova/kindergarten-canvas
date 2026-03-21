import { Request, Response } from 'express';
import prisma from '../../../prisma/prisma-client';

export const getPublicGalleries = async (req: Request, res: Response) => {
    try {
        const startTime = Date.now();

        const galleriesRaw = await prisma.gallery.findMany({
            where: {
                status: 'PUBLISHED',
                images: { some: {} }, // only galleries with ≥1 image
            },
            orderBy: [{ publishedAt: 'desc' }],
            select: {
                id: true,
                title: true,
                description: true,
                coverImageUrl: true,
                publishedAt: true,
                createdAt: true,
                updatedAt: true,
                _count: { select: { images: true } },
            },
        });

        const duration = Date.now() - startTime;
        if (duration > 500) {
            console.warn(`⚠️ Public galleries list query took ${duration}ms (target: <500ms)`);
        }

        const galleries = galleriesRaw.map(({ _count, ...rest }) => ({
            ...rest,
            imageCount: _count.images,
        }));

        return res.status(200).json({
            status: 'success',
            data: { galleries },
        });
    } catch (error) {
        console.error('Error fetching public galleries:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};

export const getPublicGallery = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(404).json({
                status: 'fail',
                data: { message: 'Галерията не е намерена' },
            });
        }

        const gallery = await prisma.gallery.findFirst({
            where: { id, status: 'PUBLISHED' },
            select: {
                id: true,
                title: true,
                description: true,
                coverImageUrl: true,
                publishedAt: true,
                createdAt: true,
                updatedAt: true,
                images: {
                    select: {
                        id: true,
                        imageUrl: true,
                        thumbnailUrl: true,
                        altText: true,
                        displayOrder: true,
                        createdAt: true,
                    },
                    orderBy: { displayOrder: 'asc' },
                },
            },
        });

        if (!gallery) {
            return res.status(404).json({
                status: 'fail',
                data: { message: 'Галерията не е намерена' },
            });
        }

        return res.status(200).json({
            status: 'success',
            data: { gallery },
        });
    } catch (error) {
        console.error('Error fetching public gallery:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
