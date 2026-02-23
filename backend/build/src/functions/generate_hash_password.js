"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const app_1 = __importDefault(require("../config/app"));
exports.default = async (password) => {
    const saltRounds = app_1.default.bcrypt.saltRounds;
    const hashPassword = bcryptjs_1.default.hashSync(password, saltRounds);
    return { success: true, data: hashPassword, error: null };
};
//# sourceMappingURL=generate_hash_password.js.map