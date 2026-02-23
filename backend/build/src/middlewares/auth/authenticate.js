"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const http_msg_1 = __importDefault(require("../../utils/http_messages/http_msg"));
const error_constant_1 = __importDefault(require("../../constants/error_constant"));
const errorCode = 'ERROR_AUTH';
const auth = (platform) => (req, res, next) => {
    passport_1.default.authenticate(platform, { session: false }, (err, user) => {
        if (err) {
            const result = http_msg_1.default.http422(err, errorCode);
            return res.status(result.httpStatusCode).json(result.data);
        }
        if (!user || Object.keys(user).length === 0) {
            const result = http_msg_1.default.http401(error_constant_1.default.TOKEN_MSG.unauthorizedAccess, errorCode);
            return res.status(result.httpStatusCode).json(result.data);
        }
        req.user = user;
        next();
    })(req, res, next);
};
exports.default = auth;
//# sourceMappingURL=authenticate.js.map