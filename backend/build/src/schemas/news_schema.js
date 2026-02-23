"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewsList = exports.getNewsById = exports.updateNews = exports.createNews = void 0;
const zod_1 = require("zod");
exports.createNews = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z
            .string({
            required_error: 'Заглавието е задължително',
        })
            .min(1, 'Заглавието е задължително'),
        content: zod_1.z
            .string({
            required_error: 'Съдържанието е задължително',
        })
            .min(1, 'Съдържанието е задължително'),
        imageUrl: zod_1.z.string().url().optional(),
        status: zod_1.z.enum(['DRAFT', 'PUBLISHED']).optional(),
    }),
});
exports.updateNews = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().transform(Number),
    }),
    body: zod_1.z.object({
        title: zod_1.z.string().min(1).optional(),
        content: zod_1.z.string().min(1).optional(),
        imageUrl: zod_1.z.string().url().optional().nullable(),
        status: zod_1.z.enum(['DRAFT', 'PUBLISHED']).optional(),
        publishedAt: zod_1.z.string().datetime().optional().nullable(),
    }),
});
exports.getNewsById = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().transform(Number),
    }),
});
exports.getNewsList = zod_1.z.object({
    query: zod_1.z.object({
        status: zod_1.z.enum(['DRAFT', 'PUBLISHED']).optional(),
    }),
});
//# sourceMappingURL=news_schema.js.map