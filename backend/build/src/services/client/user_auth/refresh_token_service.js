"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const app_1 = __importDefault(require("../../../config/app"));
const error_constant_1 = __importDefault(require("../../../constants/error_constant"));
const http_msg_1 = __importDefault(require("../../../utils/http_messages/http_msg"));
const user_get_one_dao_1 = __importDefault(require("../../../dao/users/user_get_one_dao"));
const generate_token_access_1 = __importDefault(require("../../../functions/generate_token_access"));
exports.default = async (data) => {
    const invalidTokenMsg = error_constant_1.default.TOKEN_MSG.invalidRefreshToken;
    const sessionExpiredMsg = error_constant_1.default.TOKEN_MSG.sessionExpired;
    const errorCode = error_constant_1.default.ERROR_CODE.invalidToken;
    if (!data.refreshToken) {
        return http_msg_1.default.http401(invalidTokenMsg, errorCode);
    }
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(data.refreshToken, app_1.default.jwt.secretAdmin);
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.TokenExpiredError) {
            return http_msg_1.default.http401(sessionExpiredMsg, errorCode);
        }
        return http_msg_1.default.http401(invalidTokenMsg, errorCode);
    }
    if (decoded.type !== 'refresh') {
        return http_msg_1.default.http401(invalidTokenMsg, errorCode);
    }
    const user = await (0, user_get_one_dao_1.default)({ id: decoded.userId }, { id: true, email: true, role: true });
    if (!user.success || !user.data) {
        return http_msg_1.default.http401(invalidTokenMsg, errorCode);
    }
    const accessTokenPayload = {
        userId: user.data.id,
        email: user.data.email,
        role: user.data.role,
    };
    const accessTokenResult = await (0, generate_token_access_1.default)(accessTokenPayload);
    if (!accessTokenResult.success) {
        return http_msg_1.default.http401(invalidTokenMsg, errorCode);
    }
    return http_msg_1.default.http200({
        accessToken: accessTokenResult.data,
    });
};
//# sourceMappingURL=refresh_token_service.js.map