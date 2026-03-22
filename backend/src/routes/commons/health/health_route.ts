import { Router, Request, Response } from 'express';
import { SESClient, GetSendQuotaCommand } from '@aws-sdk/client-ses';
import prisma from '../../../../prisma/prisma-client';
import cloudinary from '@config/cloudinary.config';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../../../../package.json') as { version: string };

const router = Router();

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API server. Add ?deep=true for dependency status.
 *     tags: [Health]
 *     parameters:
 *       - in: query
 *         name: deep
 *         schema:
 *           type: string
 *           enum: [true]
 *         description: Set to "true" for deep dependency check
 *     responses:
 *       200:
 *         description: Server is healthy
 *       503:
 *         description: One or more dependencies are unhealthy
 */
router.get('/', async (req: Request, res: Response) => {
    if (req.query.deep === 'true') {
        try {
            const [dbResult, cloudinaryResult, sesResult] = await Promise.allSettled([
                prisma.$queryRaw`SELECT 1`,
                cloudinary.api.ping(),
                (async () => {
                    const sesCheckClient = new SESClient({
                        region: process.env.AWS_SES_REGION ?? 'eu-central-1',
                        credentials: {
                            accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID ?? '',
                            secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY ?? '',
                        },
                    });
                    await sesCheckClient.send(new GetSendQuotaCommand({}));
                })(),
            ]);

            const database =
                dbResult.status === 'fulfilled' ? 'connected' : 'error: unavailable';
            const cloudinaryStatus =
                cloudinaryResult.status === 'fulfilled' ? 'connected' : 'error: unavailable';
            const ses =
                sesResult.status === 'fulfilled' ? 'connected' : 'error: unavailable';

            const connectedCount = [database, cloudinaryStatus, ses].filter(
                (s) => s === 'connected',
            ).length;
            const status =
                connectedCount === 3 ? 'ok' : connectedCount === 0 ? 'unhealthy' : 'degraded';
            const httpStatus = connectedCount === 3 ? 200 : 503;

            return res.status(httpStatus).json({
                status,
                database,
                cloudinary: cloudinaryStatus,
                ses,
            });
        } catch {
            return res.status(503).json({ status: 'unhealthy', error: 'Health check failed' });
        }
    }

    return res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version,
        uptime: Math.floor(process.uptime()),
    });
});

export default router;
