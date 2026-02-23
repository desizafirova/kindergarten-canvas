"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const app_root_path_1 = __importDefault(require("app-root-path"));
const path = app_root_path_1.default.resolve('/logs/');
const isDevelopment = process.env.NODE_ENV === 'development';
const custom = winston_1.default.format.combine(winston_1.default.format.json(), winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.printf((info) => `${info.timestamp} | ${info.level.toUpperCase()} | ${info.message}`));
const customInfo = winston_1.default.format.combine(winston_1.default.format.json(), winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.printf((info) => `${info.timestamp} | ${info.level.toUpperCase()} | ${info.message}`));
const logger = winston_1.default.createLogger({
    transports: [
        new winston_daily_rotate_file_1.default({
            frequency: '24h',
            level: 'error',
            dirname: `${path}/`,
            filename: 'error-%DATE%.log',
            datePattern: 'YYYY-MM-DD-HH',
            handleExceptions: true,
            zippedArchive: false,
            maxSize: '5m',
            maxFiles: '7d',
            format: custom,
        }),
        new winston_daily_rotate_file_1.default({
            frequency: '24h',
            level: 'info',
            dirname: `${path}/`,
            filename: 'info-%DATE%.log',
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '5m',
            maxFiles: '7d',
            format: customInfo,
        }),
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), custom),
            level: isDevelopment ? 'info' : 'error',
            handleExceptions: true,
        }),
    ],
    exitOnError: false,
});
exports.default = logger;
//# sourceMappingURL=logger.js.map