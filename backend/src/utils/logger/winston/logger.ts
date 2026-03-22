import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import logsPath from 'app-root-path';

const path = logsPath.resolve('/logs/');
const isDevelopment = process.env.NODE_ENV === 'development';

const jsonFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
);

const logger = winston.createLogger({
    transports: [
        new DailyRotateFile({
            frequency: '24h',
            level: 'error',
            dirname: `${path}/`,
            filename: 'error-%DATE%.log',
            datePattern: 'YYYY-MM-DD-HH',
            handleExceptions: true,
            zippedArchive: false,
            maxSize: '5m',
            maxFiles: '7d',
            format: jsonFormat,
        }),
        new DailyRotateFile({
            frequency: '24h',
            level: 'info',
            dirname: `${path}/`,
            filename: 'info-%DATE%.log',
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '5m',
            maxFiles: '7d',
            format: jsonFormat,
        }),
        new winston.transports.Console({
            format: jsonFormat,
            level: isDevelopment ? 'debug' : 'info',
            handleExceptions: true,
        }),
    ],
    exitOnError: false,
});

export default logger;
