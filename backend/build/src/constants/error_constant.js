"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ERROR_CODE = {
    register: 'ERROR_USER_REGISTER',
    registerConfirm: 'ERROR_USER_SIGNUP_CONFIRMATION',
    login: 'ERROR_AUTH',
    requestPassword: 'ERROR_USER_REQUEST_PASSWORD',
    resetPassword: 'ERROR_USER_RESET_PASSWORD',
    rateLimitExceeded: 'RATE_LIMIT_EXCEEDED',
    invalidToken: 'ERROR_INVALID_TOKEN',
};
const REGISTER_ERROR_MSG = {
    failToRegister: 'Регистрацията не е позволена',
    failToDeleted: 'Failed to register a deleted user',
    failToDisabled: 'Failed to register a disabled user',
    AlreadyRegistered: 'Failed to register an already registered user',
};
const REGISTER_CONFIRM_MSG = {
    failToConfirm: 'Failed to confirm registration',
};
const LOGIN_MSG = {
    failToLogin: 'Невалиден имейл или парола',
    rateLimitExceeded: 'Твърде много опити. Опитайте отново след 15 минути.',
};
const REQUEST_PASSWORD_MSG = {
    failToRequest: 'Failed to request password',
};
const RESET_PASSWORD_MSG = {
    failToRequest: 'Failed to reset password',
};
const TOKEN_MSG = {
    invalidRefreshToken: 'Невалиден или изтекъл токен',
    tokenExpired: 'Токенът е изтекъл',
    sessionExpired: 'Сесията е изтекла. Моля, влезте отново.',
    unauthorizedAccess: 'Неоторизиран достъп',
};
exports.default = {
    ERROR_CODE,
    REGISTER_ERROR_MSG,
    REGISTER_CONFIRM_MSG,
    LOGIN_MSG,
    REQUEST_PASSWORD_MSG,
    RESET_PASSWORD_MSG,
    TOKEN_MSG,
};
//# sourceMappingURL=error_constant.js.map