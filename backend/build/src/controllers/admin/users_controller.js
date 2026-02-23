"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_me_1 = __importDefault(require("../../services/client/user_me"));
const logger_1 = __importDefault(require("../../utils/logger/winston/logger"));
const showAll = (req, res, next) => {
    user_me_1.default
        .showAll()
        .then((result) => res.status(result.httpStatusCode).json(result.data))
        .catch((err) => {
        logger_1.default.error(`Erro de listagem de usuários. ${err.message}`);
        next(err);
    });
};
exports.default = {
    showAll,
};
//# sourceMappingURL=users_controller.js.map