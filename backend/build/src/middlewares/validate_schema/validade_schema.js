"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const logger_1 = __importDefault(require("../../utils/logger/winston/logger"));
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            params: req.params,
            query: req.query,
            headers: req.headers,
        });
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            logger_1.default.info(`Zod validation error. ${error.message}`);
            return res.status(400).json(error.issues.map((issue) => ({
                success: false,
                error: 'VALIDATION_ERROR',
                message: issue.message,
            })));
        }
        else {
            logger_1.default.info(`Server Internal error.`);
            return res.status(500).json({
                error: {
                    code: 500,
                    error: 'SERVER_ERROR',
                    message: 'Internal Server Error',
                },
            });
        }
    }
};
exports.validate = validate;
//# sourceMappingURL=validade_schema.js.map