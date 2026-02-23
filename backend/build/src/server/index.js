"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const ansi_colors_1 = __importDefault(require("ansi-colors"));
const _packagejson_1 = __importDefault(require("../../package.json"));
const http_server_1 = __importDefault(require("./http_server"));
const db_connection_1 = __importDefault(require("../database/db_connection"));
const logger_1 = __importDefault(require("../utils/logger/winston/logger"));
const startup = async (silent) => {
    if (!silent) {
        console.log(ansi_colors_1.default.bgWhite.black(`\n Starting ${_packagejson_1.default.name.toUpperCase()} `) +
            ansi_colors_1.default.bgMagenta.black(` v${_packagejson_1.default.version} `));
        console.log(ansi_colors_1.default.white(`-> Running in ${process.env.NODE_ENV} environment`));
        console.log(ansi_colors_1.default.white(`-> Started at ${(0, moment_1.default)().format('YYYY-MM-DD HH:mm')}`));
    }
    logger_1.default.info(`Api starting ${_packagejson_1.default.name.toUpperCase()} v${_packagejson_1.default.version}`);
    logger_1.default.info(`Api running in ${process.env.NODE_ENV} environment`);
    logger_1.default.info(`Api started at ${(0, moment_1.default)().format('YYYY-MM-DD HH:mm')}`);
    await runServer(silent);
    await checkDatabase(silent);
};
const runServer = async (silent) => {
    await (0, http_server_1.default)(silent);
};
const checkDatabase = async (silent) => {
    const res = await db_connection_1.default.checkConnection();
    if (res.success) {
        if (!silent)
            console.log(ansi_colors_1.default.white(`-> Connected on database`));
        logger_1.default.info(`Database connection has been established successfully.`);
    }
    else {
        if (!silent)
            console.log(ansi_colors_1.default.red(`-> Unable to connect to the database`));
        logger_1.default.error(`Unable to connect to the database: ${res.error}`);
    }
};
exports.default = startup;
//# sourceMappingURL=index.js.map