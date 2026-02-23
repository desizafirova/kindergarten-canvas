"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_msg_1 = __importDefault(require("../../../utils/http_messages/http_msg"));
const news_get_all_dao_1 = __importDefault(require("../../../dao/news/news_get_all_dao"));
const errCode = 'ERROR_NEWS_GET_ALL';
const msgError = 'Failed to get all news';
exports.default = async (statusFilter) => {
    const where = statusFilter ? { status: statusFilter } : {};
    const select = {
        id: true,
        title: true,
        content: true,
        imageUrl: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
    };
    const orderBy = { createdAt: 'desc' };
    const news = await getAllNews(where, select, orderBy);
    if (!news.success || !news.data) {
        return http_msg_1.default.http422(msgError, errCode);
    }
    return http_msg_1.default.http200(news.data);
};
const getAllNews = async (where, select, orderBy) => {
    const result = await (0, news_get_all_dao_1.default)(where, select, orderBy);
    return { success: result.success, data: result.data, error: result.error };
};
//# sourceMappingURL=news_get_all_service.js.map