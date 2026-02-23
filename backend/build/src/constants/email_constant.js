"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const global_http_url_1 = __importDefault(require("../utils/global_http_url/global_http_url"));
const IS_NOTIFICATE = {
    welcome: true,
    emailVerify: true,
    passwordRequest: false,
    passwordReset: false,
};
const TEMPLATE_PATH = {
    client: 'src/views/templates/email/client',
    admin: 'src/views/templates/email/admin',
};
const TEMPLATE_FILE = {
    welcome: 'user_welcome.ejs',
    emailVerify: 'user_email_verify.ejs',
    passwordRequest: 'user_password_request',
    passwordReset: 'user_password_reseted',
};
const TEMPLATE_SUBJECT = {
    welcome: 'Welcome',
    emailVerify: 'Registration confirmation',
    passwordRequest: 'Password recovery request',
    passwordReset: 'Password reset confirmation',
};
const WELCOME_REDIRECT = `${(0, global_http_url_1.default)()}/welcome.html`;
const REGISTRATION_REDIRECT = `${(0, global_http_url_1.default)()}/api/v1/auth/register/confirmation`;
exports.default = {
    IS_NOTIFICATE,
    TEMPLATE_PATH,
    TEMPLATE_FILE,
    TEMPLATE_SUBJECT,
    WELCOME_REDIRECT,
    REGISTRATION_REDIRECT,
};
//# sourceMappingURL=email_constant.js.map