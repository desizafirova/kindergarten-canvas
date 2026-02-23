"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
exports.default = async (plainPassword, hashPassword) => {
    if (!bcryptjs_1.default.compareSync(plainPassword, hashPassword)) {
        return {
            success: false,
            data: null,
            error: 'Error to check password. Invalid credentials.',
        };
    }
    return { success: true, data: plainPassword, error: null };
};
//# sourceMappingURL=check_password.js.map