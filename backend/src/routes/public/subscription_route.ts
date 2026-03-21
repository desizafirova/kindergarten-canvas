import { Router } from 'express';
import rateLimit from '@middlewares/rate_limiter/rate_limiter';
import { subscribe, unsubscribe } from '@controllers/public/subscription_controller';

const router = Router();

// POST /api/v1/public/subscribe - Subscribe to notifications
router.post('/subscribe', rateLimit.subscriptionLimiter, subscribe);

// GET /api/v1/public/unsubscribe - Unsubscribe via token link (browser GET)
router.get('/unsubscribe', unsubscribe);

export default router;
