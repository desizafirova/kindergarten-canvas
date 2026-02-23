"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refreshToken = exports.forgotPasswordRequest = exports.login = exports.registerConfirmation = exports.register = void 0;
const zod_1 = require("zod");
exports.register = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email({
            message: 'Write a correct email address',
        }),
        name: zod_1.z
            .string()
            .min(3, {
            message: 'Name too short',
        })
            .max(32, {
            message: 'Name too long',
        }),
        phone: zod_1.z
            .string()
            .min(11, {
            message: 'Phone too short',
        })
            .max(15, {
            message: 'Phone too long',
        }),
        password: zod_1.z
            .string()
            .min(4, {
            message: 'Password too short',
        })
            .max(16, {
            message: 'Password too long',
        }),
    }),
});
exports.registerConfirmation = zod_1.z.object({
    query: zod_1.z.object({
        email: zod_1.z.string().email({
            message: 'Write a correct email address',
        }),
        token: zod_1.z.string({
            required_error: 'Token is required',
            invalid_type_error: 'Incorrect token',
        }),
    }),
});
exports.login = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email({
            message: 'Write a correct email address',
        }),
        password: zod_1.z
            .string()
            .min(4, {
            message: 'Password too short',
        })
            .max(16, {
            message: 'Password too long',
        }),
    }),
});
exports.forgotPasswordRequest = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email({
            message: 'Write a correct email address',
        }),
    }),
});
exports.refreshToken = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string({
            required_error: 'Refresh token is required',
            invalid_type_error: 'Invalid refresh token format',
        }),
    }),
});
exports.logout = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string().optional(),
    }),
});
//# sourceMappingURL=auth_schema.js.map