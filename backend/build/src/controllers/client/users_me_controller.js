"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_me_1 = __importDefault(require("../../services/client/user_me"));
const logger_1 = __importDefault(require("../../utils/logger/winston/logger"));
const showMe = (req, res, next) => {
    const user = req.user;
    user_me_1.default
        .showMe(user.id)
        .then((result) => res.status(result.httpStatusCode).json(result.data))
        .catch((err) => {
        logger_1.default.error(`Erro de visualização de dados de usuário. ${err.message}`);
        next(err);
    });
};
const updateMe = (req, res, next) => {
    const user = req.user;
    user_me_1.default
        .updateMe(user.id, req.body)
        .then((result) => res.status(result.httpStatusCode).json(result.data))
        .catch((err) => {
        logger_1.default.error(`Erro de atualização de dados de usuário. ${err.message}`);
        next(err);
    });
};
const deleteMe = (req, res, next) => {
    const user = req.user;
    user_me_1.default
        .deleteMe(user.id)
        .then((result) => res.status(result.httpStatusCode).json(result.data))
        .catch((err) => {
        logger_1.default.error(`Erro de exclusão de dados de usuário. ${err.message}`);
        next(err);
    });
};
exports.default = {
    showMe,
    updateMe,
    deleteMe,
};
//# sourceMappingURL=users_me_controller.js.map