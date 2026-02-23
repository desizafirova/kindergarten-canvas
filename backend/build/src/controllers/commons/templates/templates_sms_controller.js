"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logs_infos_1 = __importDefault(require("../../../services/commons/logs_infos"));
const logger_1 = __importDefault(require("../../../utils/logger/winston/logger"));
const welcomeUser = (req, res, next) => {
    logs_infos_1.default
        .listar()
        .then(() => {
        try {
            res.render('email/welcome_user/', {});
        }
        catch (err) {
            logger_1.default.error(`Erro ao listar os arquivos de logs de API. ${err.message}`);
        }
    })
        .catch((err) => next(err));
};
exports.default = {
    welcomeUser,
};
//# sourceMappingURL=templates_sms_controller.js.map