"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_1 = __importDefault(require("../config/app"));
exports.default = async (tokenData) => {
    const token = jsonwebtoken_1.default.sign(tokenData, app_1.default.jwt.secretAdmin, {
        expiresIn: app_1.default.jwt.refreshExpiredIn,
    });
    return { success: true, data: token, error: null };
};
//# sourceMappingURL=generate_token_refresh.js.map