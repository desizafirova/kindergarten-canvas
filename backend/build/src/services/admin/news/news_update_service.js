"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_msg_1 = __importDefault(require("../../../utils/http_messages/http_msg"));
const news_update_dao_1 = __importDefault(require("../../../dao/news/news_update_dao"));
const errCode = 'ERROR_NEWS_UPDATE';
const msgError = 'Failed to update news item';
exports.default = async (id, newsData) => {
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
    const newsItem = await updateNews(id, newsData, select);
    if (!newsItem.success || !newsItem.data) {
        return http_msg_1.default.http422(msgError, errCode);
    }
    return http_msg_1.default.http200(newsItem.data);
};
const updateNews = async (id, data, select) => {
    const result = await (0, news_update_dao_1.default)(id, data, select);
    return { success: result.success, data: result.data, error: result.error };
};
//# sourceMappingURL=news_update_service.js.map