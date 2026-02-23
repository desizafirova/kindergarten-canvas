"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const login_service_1 = __importDefault(require("./login_service"));
const logout_service_1 = __importDefault(require("./logout_service"));
const refresh_token_service_1 = __importDefault(require("./refresh_token_service"));
const register_service_1 = __importDefault(require("./register_service"));
const register_confirm_service_1 = __importDefault(require("./register_confirm_service"));
const request_password_service_1 = __importDefault(require("./request_password_service"));
const reset_password_service_1 = __importDefault(require("./reset_password_service"));
exports.default = {
    login: login_service_1.default,
    logout: logout_service_1.default,
    refresh: refresh_token_service_1.default,
    register: register_service_1.default,
    registerConfirm: register_confirm_service_1.default,
    forgotPasswordRequest: request_password_service_1.default,
    forgotPasswordReset: reset_password_service_1.default,
};
//# sourceMappingURL=index.js.map