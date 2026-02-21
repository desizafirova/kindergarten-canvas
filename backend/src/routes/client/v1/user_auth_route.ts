import { Router } from 'express';

import auth from '@middlewares/auth/authenticate';
import rateLimit from '@middlewares/rate_limiter/rate_limiter';
import ctrlUserAuth from '@controllers/client/users_auth_controller';

import { login, refreshToken, logout } from '@schemas/auth_schema';
import { validate } from '@middlewares/validate_schema/validade_schema';

const router = Router();

// User Login (with rate limiting: 5 attempts per 15 minutes per IP)
router.post('/login', rateLimit.loginLimiter, validate(login), auth('login-user'), ctrlUserAuth.login);

// Token Refresh
router.post('/refresh', validate(refreshToken), ctrlUserAuth.refresh);

// User Logout (changed from GET to POST)
router.post('/logout', validate(logout), auth('jwt-user'), ctrlUserAuth.logout);

export default router;
