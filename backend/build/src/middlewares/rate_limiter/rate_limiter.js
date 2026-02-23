"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const app_1 = __importDefault(require("../../config/app"));
const error_constant_1 = __importDefault(require("../../constants/error_constant"));
const standardHeaders = true;
const legacyHeaders = false;
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(app_1.default.ratelimiter.window) * 60 * 1000,
    max: parseInt(app_1.default.ratelimiter.max),
    message: { status: 'error', message: 'Too many requests, please try again later' },
    standardHeaders,
    legacyHeaders,
});
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: error_constant_1.default.LOGIN_MSG.rateLimitExceeded,
        error: error_constant_1.default.ERROR_CODE.rateLimitExceeded,
    },
    standardHeaders,
    legacyHeaders,
    skipSuccessfulRequests: true,
});
exports.default = { limiter, loginLimiter };
//# sourceMappingURL=rate_limiter.js.map