"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../../utils/logger/winston/logger"));
const http_msg_1 = __importDefault(require("../../utils/http_messages/http_msg"));
const _packagejson_1 = __importDefault(require("../../../package.json"));
const lblErr = 'API Info error';
exports.default = async () => {
    try {
        const data = {
            name: _packagejson_1.default.name,
            description: _packagejson_1.default.description,
            version: _packagejson_1.default.version,
        };
        return http_msg_1.default.http200(data);
    }
    catch (err) {
        logger_1.default.error(`Erro ao carregar informações de API. ${err.message}`);
        return http_msg_1.default.http422('Erro ao carregar informações', lblErr);
    }
};
//# sourceMappingURL=api_info_service.js.map