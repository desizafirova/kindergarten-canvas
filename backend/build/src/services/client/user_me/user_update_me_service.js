"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_msg_1 = __importDefault(require("../../../utils/http_messages/http_msg"));
const user_update_dao_1 = __importDefault(require("../../../dao/users/user_update_dao"));
const generate_hash_password_1 = __importDefault(require("../../../functions/generate_hash_password"));
const user_get_one_dao_1 = __importDefault(require("../../../dao/users/user_get_one_dao"));
const errorCod = 'ERROR_USER_UPDATE_ME';
const errorMsg = 'Failed to update user';
exports.default = async (id, data) => {
    if (!checkRequiredDatas(id))
        return http_msg_1.default.http422(errorMsg, errorCod);
    const user = await getUser({ id });
    if (!user.success)
        return http_msg_1.default.http422(user.error || '', errorCod);
    const filtered = await filterDatas(data);
    if (!filtered.success)
        return http_msg_1.default.http422(errorMsg, errorCod);
    const updated = await updateUser(user.data.id, filtered.data);
    if (!updated.success)
        return http_msg_1.default.http422(errorMsg, errorCod);
    return http_msg_1.default.http200(updated.data);
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
const updateUser = async (id, datas) => {
    const select = {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
    };
    const result = await (0, user_update_dao_1.default)(id, datas, select);
    if (!result.success || !result.data)
        return { success: false, data: null };
    return { success: true, data: result.data };
};
const filterDatas = async (data) => {
    const dataFiltered = {};
    if (data.email)
        dataFiltered.email = data.email;
    if (data.password) {
        const resultHashPassword = await (0, generate_hash_password_1.default)(data.password);
        if (!resultHashPassword.success || !resultHashPassword.data) {
            return { success: false, data: null };
        }
        dataFiltered.password = resultHashPassword.data;
    }
    return { success: true, data: dataFiltered };
};
//# sourceMappingURL=user_update_me_service.js.map