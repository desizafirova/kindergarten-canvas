"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_auth_1 = __importDefault(require("../../services/client/user_auth"));
const logger_1 = __importDefault(require("../../utils/logger/winston/logger"));
const login = (req, res, next) => {
    user_auth_1.default
        .login(req.body)
        .then((result) => res.status(result.httpStatusCode).json(result.data))
        .catch((err) => {
        logger_1.default.error(`Login error. ${err.message}`);
        next(err);
    });
};
const logout = (req, res, next) => {
    user_auth_1.default
        .logout(req.body)
        .then((result) => res.status(result.httpStatusCode).json(result.data))
        .catch((err) => {
        logger_1.default.error(`Logout error. ${err.message}`);
        next(err);
    });
};
const refresh = (req, res, next) => {
    user_auth_1.default
        .refresh(req.body)
        .then((result) => res.status(result.httpStatusCode).json(result.data))
        .catch((err) => {
        logger_1.default.error(`Token refresh error. ${err.message}`);
        next(err);
    });
};
const register = (req, res, next) => {
    user_auth_1.default
        .register(req.body)
        .then((result) => res.status(result.httpStatusCode).json(result.data))
        .catch((err) => {
        logger_1.default.error(`Register error. ${err.message}`);
        next(err);
    });
};
const registerConfirm = (req, res, next) => {
    user_auth_1.default
        .registerConfirm(req.query)
        .then((result) => res.status(result.httpStatusCode).json(result.data))
        .catch((err) => {
        logger_1.default.error(`Register confirmation error. ${err.message}`);
        next(err);
    });
};
const forgotPasswordRequest = (req, res, next) => {
    user_auth_1.default
        .forgotPasswordRequest(req.body)
        .then((result) => res.status(result.httpStatusCode).json(result.data))
        .catch((err) => {
        logger_1.default.error(`Password reset request error. ${err.message}`);
        next(err);
    });
};
const forgotPasswordReset = (req, res, next) => {
    user_auth_1.default
        .forgotPasswordReset(req.body)
        .then((result) => res.status(result.httpStatusCode).json(result.data))
        .catch((err) => {
        logger_1.default.error(`Password reset error. ${err.message}`);
        next(err);
    });
};
exports.default = {
    login,
    logout,
    refresh,
    register,
    registerConfirm,
    forgotPasswordRequest,
    forgotPasswordReset,
};
//# sourceMappingURL=users_auth_controller.js.map