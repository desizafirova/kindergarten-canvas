"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_msg_1 = __importDefault(require("../../../utils/http_messages/http_msg"));
const user_get_all_dao_1 = __importDefault(require("../../../dao/users/user_get_all_dao"));
const errCode = 'ERROR_USERS_GET_ALL';
const msgError = 'Failed to get all users';
exports.default = async () => {
    const where = {};
    const select = {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        accountType: true,
        isDisabled: true,
        isDeleted: true,
        isRegistered: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
    };
    const users = await getAllUsers(where, select);
    return http_msg_1.default.http200(users.data);
};
const getAllUsers = async (where, select) => {
    const result = await (0, user_get_all_dao_1.default)(where, select);
    if (!result.success || !result.data)
        http_msg_1.default.http422(msgError, errCode);
    return { success: result.success, data: result.data, error: result.error };
};
//# sourceMappingURL=show_all_service.js.map