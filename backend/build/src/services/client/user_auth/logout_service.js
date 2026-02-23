"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_msg_1 = __importDefault(require("../../../utils/http_messages/http_msg"));
exports.default = async (_data) => {
    return http_msg_1.default.http200({ message: 'Logged out successfully' });
};
//# sourceMappingURL=logout_service.js.map