import { Request, Response, NextFunction } from 'express';
import { metricsStore } from '@utils/metrics/metrics_store';

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();
    res.on('finish', () => {
        metricsStore.record(Date.now() - start, res.statusCode);
    });
    next();
};
