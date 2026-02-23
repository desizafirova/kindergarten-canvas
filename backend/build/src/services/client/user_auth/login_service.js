"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_constant_1 = __importDefault(require("../../../constants/error_constant"));
const http_msg_1 = __importDefault(require("../../../utils/http_messages/http_msg"));
const user_get_one_dao_1 = __importDefault(require("../../../dao/users/user_get_one_dao"));
const check_password_1 = __importDefault(require("../../../functions/check_password"));
const generate_token_access_1 = __importDefault(require("../../../functions/generate_token_access"));
const generate_token_refresh_1 = __importDefault(require("../../../functions/generate_token_refresh"));
exports.default = async (data) => {
    const errorMsg = error_constant_1.default.LOGIN_MSG.failToLogin;
    const errorCode = error_constant_1.default.ERROR_CODE.login;
    if (!checkRequiredDatas(data)) {
        return http_msg_1.default.http422(errorMsg, errorCode);
    }
    const user = await getUser({ email: data.email });
    if (!user.success || !user.data) {
        return http_msg_1.default.http401(errorMsg, errorCode);
    }
    const checkedPassword = await checkPassword(data.password, user.data.password);
    if (!checkedPassword) {
        return http_msg_1.default.http401(errorMsg, errorCode);
    }
    const tokens = await generateTokens(user.data);
    if (!tokens.success) {
        return http_msg_1.default.http401(errorMsg, errorCode);
    }
    const response = {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
            id: user.data.id,
            email: user.data.email,
            role: user.data.role,
        },
    };
    return http_msg_1.default.http200(response);
};
const checkRequiredDatas = (datas) => {
    if (!datas.email)
        return false;
    if (!datas.password)
        return false;
    return true;
};
const getUser = async (where) => {
    const select = {
        id: true,
        email: true,
        password: true,
        role: true,
    };
    const result = await (0, user_get_one_dao_1.default)(where, select);
    if (!result.success || !result.data) {
        return { success: false, data: null, error: error_constant_1.default.LOGIN_MSG.failToLogin };
    }
    if (!result.data.password) {
        return { success: false, data: null, error: error_constant_1.default.LOGIN_MSG.failToLogin };
    }
    return { success: true, data: result.data, error: null };
};
const checkPassword = async (plainPassword, hashPassword) => {
    const result = await (0, check_password_1.default)(plainPassword, hashPassword);
    if (!result.success)
        return false;
    return true;
};
const generateTokens = async (userData) => {
    const accessTokenPayload = {
        userId: userData.id,
        email: userData.email,
        role: userData.role,
    };
    const refreshTokenPayload = {
        userId: userData.id,
        type: 'refresh',
    };
    const accessTokenResult = await (0, generate_token_access_1.default)(accessTokenPayload);
    if (!accessTokenResult.success) {
        return { success: false, accessToken: null, refreshToken: null };
    }
    const refreshTokenResult = await (0, generate_token_refresh_1.default)(refreshTokenPayload);
    if (!refreshTokenResult.success) {
        return { success: false, accessToken: null, refreshToken: null };
    }
    return {
        success: true,
        accessToken: accessTokenResult.data,
        refreshToken: refreshTokenResult.data,
    };
};
//# sourceMappingURL=login_service.js.map