"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_msg_1 = __importDefault(require("../../../utils/http_messages/http_msg"));
const news_create_dao_1 = __importDefault(require("../../../dao/news/news_create_dao"));
const errCode = 'ERROR_NEWS_CREATE';
const msgError = 'Failed to create news item';
exports.default = async (newsData) => {
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
    const dataWithDefaults = Object.assign(Object.assign({}, newsData), { status: newsData.status || 'DRAFT' });
    const newsItem = await createNews(dataWithDefaults, select);
    if (!newsItem.success || !newsItem.data) {
        return http_msg_1.default.http422(msgError, errCode);
    }
    return http_msg_1.default.http201(newsItem.data);
};
const createNews = async (data, select) => {
    const result = await (0, news_create_dao_1.default)(data, select);
    return { success: result.success, data: result.data, error: result.error };
};
//# sourceMappingURL=news_create_service.js.map