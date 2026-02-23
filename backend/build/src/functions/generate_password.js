"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generate_hash_password_1 = __importDefault(require("./generate_hash_password"));
exports.default = async () => {
    const passwordLength = 8;
    const password = Math.random().toString(36).slice(-passwordLength);
    const resultHashPassword = await (0, generate_hash_password_1.default)(password);
    if (!resultHashPassword.success || !resultHashPassword.data) {
        return { success: false, data: null, error: 'Eror to hash password' };
    }
    return { success: true, data: resultHashPassword.data, error: null };
};
//# sourceMappingURL=generate_password.js.map