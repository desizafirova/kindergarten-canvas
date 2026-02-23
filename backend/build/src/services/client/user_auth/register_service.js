"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_msg_1 = __importDefault(require("../../../utils/http_messages/http_msg"));
const errorCod = 'ERROR_NOT_IMPLEMENTED';
const errorMsg = 'Self-registration is not supported. Admin users are created via seed script.';
exports.default = async (_data) => {
    return http_msg_1.default.http422(errorMsg, errorCod);
};
//# sourceMappingURL=register_service.js.map