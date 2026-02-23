"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_msg_1 = __importDefault(require("../../../utils/http_messages/http_msg"));
const user_get_one_dao_1 = __importDefault(require("../../../dao/users/user_get_one_dao"));
const prisma_client_1 = __importDefault(require("../../../../prisma/prisma-client"));
const logger_1 = __importDefault(require("../../../utils/logger/winston/logger"));
const errorCod = 'ERROR_USER_DELETE_ME';
const errorMsg = 'Failed to delete user';
exports.default = async (id) => {
    if (!checkRequiredDatas(id))
        return http_msg_1.default.http422(errorMsg, errorCod);
    const user = await getUser({ id });
    if (!user.success)
        return http_msg_1.default.http422(user.error || '', errorCod);
    const deleted = await deleteUser(user.data.id);
    if (!deleted.success)
        return http_msg_1.default.http422(errorMsg, errorCod);
    return http_msg_1.default.http204(null);
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
    };
    const result = await (0, user_get_one_dao_1.default)(where, select);
    if (!result.success || !result.data)
        return { success: false, data: null, error: errorMsg };
    return { success: true, data: result.data, error: null };
};
const deleteUser = async (id) => {
    try {
        await prisma_client_1.default.user.delete({
            where: { id },
        });
        return { success: true };
    }
    catch (error) {
        logger_1.default.error(`${errorMsg} ${error}`);
        return { success: false };
    }
};
//# sourceMappingURL=user_delete_me_service.js.map