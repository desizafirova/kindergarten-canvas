"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../../utils/logger/winston/logger"));
const http_msg_1 = __importDefault(require("../../utils/http_messages/http_msg"));
const app_1 = __importDefault(require("../../config/app"));
const lblErr = 'Root error';
exports.default = async () => {
    try {
        const baseApiUrl = app_1.default.api.prefix;
        const route = '/' + baseApiUrl + '/info';
        return http_msg_1.default.http200(route);
    }
    catch (err) {
        logger_1.default.error(`Erro ao redicionar a url. ${err.message}`);
        return http_msg_1.default.http422('Erro ao tentar redirecionar.', lblErr);
    }
};
//# sourceMappingURL=api_root_service.js.map