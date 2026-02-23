"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_msg_1 = __importDefault(require("../../../utils/http_messages/http_msg"));
const news_get_one_dao_1 = __importDefault(require("../../../dao/news/news_get_one_dao"));
const errCode = 'ERROR_NEWS_NOT_FOUND';
const msgError = 'Новината не е намерена';
exports.default = async (id) => {
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
    const newsItem = await getOneNews(id, select);
    if (!newsItem.success || !newsItem.data) {
        return http_msg_1.default.http404(msgError, errCode);
    }
    return http_msg_1.default.http200(newsItem.data);
};
const getOneNews = async (id, select) => {
    const result = await (0, news_get_one_dao_1.default)(id, select);
    return { success: result.success, data: result.data, error: result.error };
};
//# sourceMappingURL=news_get_one_service.js.map