"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_1 = __importDefault(require("../../../middlewares/auth/authenticate"));
const prisma_client_1 = __importDefault(require("../../../../prisma/prisma-client"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.get('/content-counts', (0, authenticate_1.default)('jwt-user'), async (req, res) => {
    try {
        const [newsDraftCount, newsPublishedCount] = await Promise.all([
            prisma_client_1.default.newsItem.count({ where: { status: client_1.NewsStatus.DRAFT } }),
            prisma_client_1.default.newsItem.count({ where: { status: client_1.NewsStatus.PUBLISHED } }),
        ]);
        const counts = {
            news: { draft: newsDraftCount, published: newsPublishedCount },
            careers: { draft: 0, published: 0 },
            events: { draft: 0, published: 0 },
            deadlines: { draft: 0, published: 0 },
            gallery: { draft: 0, published: 0 },
            teachers: { draft: 0, published: 0 },
        };
        res.status(200).json({
            success: true,
            content: counts,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to fetch content counts',
            },
        });
    }
});
exports.default = router;
//# sourceMappingURL=stats_route.js.map