"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const morgan_1 = __importDefault(require("morgan"));
const app_1 = __importDefault(require("../../config/app"));
const logger_1 = __importDefault(require("../../utils/logger/winston/logger"));
const stream = {
    write: (message) => logger_1.default.info(message.trim()),
};
const skip = () => {
    return !app_1.default.debug.http_request;
};
const consoleLogger = (0, morgan_1.default)('dev');
const fileLogger = (0, morgan_1.default)('HTTP request from :remote-addr :method :url :status :res[content-length] - :response-time ms', { stream, skip });
exports.default = {
    consoleLogger,
    fileLogger,
};
//# sourceMappingURL=morgan.js.map