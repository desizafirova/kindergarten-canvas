"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../../../utils/logger/winston/logger"));
const userWelcome = (req, res) => {
    try {
        res.render('templates/email/client/user_welcome', {});
    }
    catch (err) {
        logger_1.default.error(`Template view error. ${err.message}`);
    }
};
const userEmailVerify = (req, res) => {
    try {
        res.render('templates/email/client/user_email_verify', {});
    }
    catch (err) {
        logger_1.default.error(`Template view error. ${err.message}`);
    }
};
const userPasswordRequest = (req, res) => {
    try {
        res.render('templates/email/client/user_password_request', {});
    }
    catch (err) {
        logger_1.default.error(`Template view error. ${err.message}`);
    }
};
const userPasswordReseted = (req, res) => {
    try {
        res.render('templates/email/client/user_password_reseted', {});
    }
    catch (err) {
        logger_1.default.error(`Template view error. ${err.message}`);
    }
};
exports.default = {
    userWelcome,
    userEmailVerify,
    userPasswordRequest,
    userPasswordReseted,
};
//# sourceMappingURL=templates_emails_controller.js.map