"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_msg_1 = __importDefault(require("../../../utils/http_messages/http_msg"));
const user_get_one_dao_1 = __importDefault(require("../../../dao/users/user_get_one_dao"));
const errorCod = 'ERROR_USER_FIND_ME';
const errorMsg = 'Failed to show user';
exports.default = async (id) => {
    if (!checkRequiredDatas(id))
        return http_msg_1.default.http422(errorMsg, errorCod);
    const user = await getUser({ id });
    if (!user.success)
        return http_msg_1.default.http422(user.error || '', errorCod);
    return http_msg_1.default.http200(user.data);
};
const checkRequiredDatas = (id) => {
    if (!id)
        return false;
    return true;
};
const getUser = async (where) => {
    const select = {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
    };
    const result = await (0, user_get_one_dao_1.default)(where, select);
    if (!result.success || !result.data)
        return { success: false, data: null, error: errorMsg };
    return { success: true, data: result.data, error: null };
};
//# sourceMappingURL=user_show_me_service.js.map