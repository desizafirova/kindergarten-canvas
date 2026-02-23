"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_msg_1 = __importDefault(require("../../../utils/http_messages/http_msg"));
const errorCod = 'ERROR_NOT_IMPLEMENTED';
const errorMsg = 'Email verification is not supported in this project.';
exports.default = async (_data) => {
    return http_msg_1.default.http422(errorMsg, errorCod);
};
//# sourceMappingURL=register_confirm_service.js.map