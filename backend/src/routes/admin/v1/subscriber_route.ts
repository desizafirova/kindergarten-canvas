import { Router } from 'express';
import auth from '@middlewares/auth/authenticate';
import { getSubscriberCounts } from '@controllers/admin/subscription_controller';

const router = Router();

// GET /api/admin/v1/subscribers - Get subscriber counts (JWT-protected)
router.get('/', auth('jwt-user'), getSubscriberCounts);

export default router;
