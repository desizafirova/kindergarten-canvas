"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_client_1 = __importDefault(require("../../../prisma/prisma-client"));
const logger_1 = __importDefault(require("../../utils/logger/winston/logger"));
const msgError = 'Failed to update a user.';
exports.default = async (id, data, select) => {
    const where = { id };
    const result = await prisma_client_1.default.user
        .update({
        where,
        data,
        select,
    })
        .then((res) => ({ success: true, data: res, error: null }))
        .catch((error) => {
        logger_1.default.error(`${msgError} ${error}`);
        return { success: false, data: null, error: msgError };
    });
    return result;
};
//# sourceMappingURL=user_update_dao.js.map