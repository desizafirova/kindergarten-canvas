import { Router, Request, Response } from 'express';
import auth, { AuthenticatedUser } from '@middlewares/auth/authenticate';
import { metricsStore } from '@utils/metrics/metrics_store';
import prisma from '../../../../prisma/prisma-client';

const router = Router();

router.get('/', auth('jwt-user'), async (req: Request, res: Response) => {
    const user = req.user as AuthenticatedUser;
    if (user.role !== 'DEVELOPER') {
        return res.status(403).json({
            status: 'fail',
            data: { message: 'Forbidden: DEVELOPER role required' },
        });
    }

    let activeDbConnections = 0;
    try {
        const result = await prisma.$queryRaw<{ count: bigint }[]>`
            SELECT count(*) FROM pg_stat_activity WHERE datname = current_database()
        `;
        activeDbConnections = Number(result[0]?.count ?? 0);
    } catch {
        activeDbConnections = -1;
    }

    const metrics = metricsStore.getMetrics();
    return res.status(200).json({
        status: 'success',
        data: {
            ...metrics,
            activeDbConnections,
        },
    });
});

export default router;
