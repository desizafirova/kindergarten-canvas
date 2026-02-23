"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_msg_1 = __importDefault(require("../../../utils/http_messages/http_msg"));
const news_delete_dao_1 = __importDefault(require("../../../dao/news/news_delete_dao"));
const news_get_one_dao_1 = __importDefault(require("../../../dao/news/news_get_one_dao"));
const errCodeNotFound = 'ERROR_NEWS_NOT_FOUND';
const errCodeDelete = 'ERROR_NEWS_DELETE';
const msgNotFound = 'Новината не е намерена';
const msgError = 'Failed to delete news item';
const successMsg = 'Новината е изтрита успешно';
exports.default = async (id) => {
    const existingItem = await (0, news_get_one_dao_1.default)(id, { id: true });
    if (!existingItem.success || !existingItem.data) {
        return http_msg_1.default.http404(msgNotFound, errCodeNotFound);
    }
    const result = await deleteNews(id);
    if (!result.success) {
        return http_msg_1.default.http422(msgError, errCodeDelete);
    }
    return {
        httpStatusCode: 200,
        data: {
            success: true,
            message: successMsg,
            content: null,
        },
    };
};
const deleteNews = async (id) => {
    const result = await (0, news_delete_dao_1.default)(id);
    return { success: result.success, data: result.data, error: result.error };
};
//# sourceMappingURL=news_delete_service.js.map