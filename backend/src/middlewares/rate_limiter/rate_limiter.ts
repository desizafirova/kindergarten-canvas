import rateLimit from 'express-rate-limit';

import config from '@config/app';
import constError from '@constants/error_constant';

const standardHeaders = true;
const legacyHeaders = false;

// General rate limiter for all routes
const limiter = rateLimit({
    windowMs: parseInt(config.ratelimiter.window) * 60 * 1000, // 15 minutes
    max: parseInt(config.ratelimiter.max),
    message: { status: 'error', message: 'Too many requests, please try again later' },
    standardHeaders,
    legacyHeaders,
});

// Stricter rate limiter for login attempts (5 attempts per 15 minutes per IP)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: {
        success: false,
        message: constError.LOGIN_MSG.rateLimitExceeded,
        error: constError.ERROR_CODE.rateLimitExceeded,
    },
    standardHeaders,
    legacyHeaders,
    skipSuccessfulRequests: true, // Don't count successful logins towards the limit
});

export default { limiter, loginLimiter };
