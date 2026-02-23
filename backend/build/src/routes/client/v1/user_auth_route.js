"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_1 = __importDefault(require("../../../middlewares/auth/authenticate"));
const rate_limiter_1 = __importDefault(require("../../../middlewares/rate_limiter/rate_limiter"));
const users_auth_controller_1 = __importDefault(require("../../../controllers/client/users_auth_controller"));
const auth_schema_1 = require("../../../schemas/auth_schema");
const validade_schema_1 = require("../../../middlewares/validate_schema/validade_schema");
const router = (0, express_1.Router)();
router.post('/login', rate_limiter_1.default.loginLimiter, (0, validade_schema_1.validate)(auth_schema_1.login), (0, authenticate_1.default)('login-user'), users_auth_controller_1.default.login);
router.post('/refresh', (0, validade_schema_1.validate)(auth_schema_1.refreshToken), users_auth_controller_1.default.refresh);
router.post('/logout', (0, validade_schema_1.validate)(auth_schema_1.logout), (0, authenticate_1.default)('jwt-user'), users_auth_controller_1.default.logout);
exports.default = router;
//# sourceMappingURL=user_auth_route.js.map