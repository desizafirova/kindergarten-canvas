import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import rateLimit from '@middlewares/rate_limiter/rate_limiter';
import uploadPdf from '@config/multer_pdf.config';
import { submitJobApplication } from '@controllers/public/application_controller';

const router = Router();

// POST /api/v1/public/applications - Submit job application (no authentication)
router.post(
    '/',
    rateLimit.applicationLimiter,
    uploadPdf.single('cv'),
    submitJobApplication,
);

// Multer error handler: convert file-type/size errors to clean 400 responses
router.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError || (err instanceof Error && err.message === 'Моля, качете PDF файл')) {
        return res.status(400).json({
            status: 'fail',
            data: { cv: [(err as Error).message] },
        });
    }
    next(err);
});

export default router;
