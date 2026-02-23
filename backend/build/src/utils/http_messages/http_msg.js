"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    http200(data) {
        const params = {
            success: true,
            message: 'Success',
            content: data || null,
        };
        return { httpStatusCode: 200, data: params };
    },
    http201(data) {
        const params = {
            success: true,
            message: 'Successfully create',
            content: data || null,
        };
        return { httpStatusCode: 201, data: params };
    },
    http204(data) {
        const params = {
            success: true,
            message: 'Successfully delete',
            content: data || null,
        };
        return { httpStatusCode: 204, data: params };
    },
    http401(customMsg, error) {
        const params = {
            success: false,
            message: customMsg || 'Невалиден имейл или парола',
            error: error || null,
        };
        return { httpStatusCode: 401, data: params };
    },
    http404(customMsg, error) {
        const params = {
            success: false,
            message: customMsg || 'Не е намерено',
            error: error || null,
        };
        return { httpStatusCode: 404, data: params };
    },
    http422(customMsg, error) {
        const params = {
            success: false,
            message: customMsg || 'Falha',
            error: error || null,
        };
        return { httpStatusCode: 422, data: params };
    },
    http429(customMsg, error) {
        const params = {
            success: false,
            message: customMsg || 'Твърде много опити. Опитайте отново след 15 минути.',
            error: error || null,
        };
        return { httpStatusCode: 429, data: params };
    },
};
//# sourceMappingURL=http_msg.js.map