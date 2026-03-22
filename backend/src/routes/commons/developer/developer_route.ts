import { Router, Request, Response } from 'express';
import auth, { AuthenticatedUser } from '@middlewares/auth/authenticate';
import { metricsStore } from '@utils/metrics/metrics_store';
import { errorLogBuffer } from '@utils/logger/error_log_buffer';

const router = Router();

const ENV_VARS_TO_CHECK = [
    'DATABASE_URL',
    'JWT_SECRET_USER',
    'JWT_SECRET_ADMIN',
    'JWT_SECRET_APP',
    'JWT_REFRESH_EXPIRATION',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'AWS_SES_REGION',
    'AWS_SES_ACCESS_KEY_ID',
    'AWS_SES_SECRET_ACCESS_KEY',
    'AWS_SES_FROM_EMAIL',
    'FRONTEND_URL',
    'CORS_ALLOW_ORIGIN',
    'NODE_ENV',
];

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../../../../package.json') as { version: string };

router.get('/', auth('jwt-user'), async (req: Request, res: Response) => {
    try {
        const user = req.user as AuthenticatedUser;
        if (user.role !== 'DEVELOPER') {
            return res.status(403).json({
                status: 'fail',
                data: { message: 'Forbidden: DEVELOPER role required' },
            });
        }

        const envConfig = ENV_VARS_TO_CHECK.map((name) => ({
            name,
            status: process.env[name] ? 'configured' : 'missing',
        }));

        const metrics = metricsStore.getMetrics();
        const recentErrors = errorLogBuffer.getRecent();

        return res.status(200).json({
            status: 'success',
            data: {
                health: {
                    status: 'ok',
                    uptime: Math.floor(process.uptime()),
                    version,
                },
                metrics,
                envConfig,
                recentErrors,
            },
        });
    } catch {
        return res.status(500).json({
            status: 'error',
            data: { message: 'Internal server error' },
        });
    }
});

export default router;
