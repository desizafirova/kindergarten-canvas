"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const news_1 = __importDefault(require("../../services/admin/news"));
const logger_1 = __importDefault(require("../../utils/logger/winston/logger"));
const getAll = (req, res, next) => {
    const { status } = req.query;
    news_1.default
        .getAll(status)
        .then((result) => res.status(result.httpStatusCode).json(result.data))
        .catch((err) => {
        logger_1.default.error(`Error listing news items. ${err.message}`);
        next(err);
    });
};
const getOne = (req, res, next) => {
    const { id } = req.params;
    news_1.default
        .getOne(Number(id))
        .then((result) => res.status(result.httpStatusCode).json(result.data))
        .catch((err) => {
        logger_1.default.error(`Error getting news item. ${err.message}`);
        next(err);
    });
};
const create = (req, res, next) => {
    news_1.default
        .create(req.body)
        .then((result) => res.status(result.httpStatusCode).json(result.data))
        .catch((err) => {
        logger_1.default.error(`Error creating news item. ${err.message}`);
        next(err);
    });
};
const update = (req, res, next) => {
    const { id } = req.params;
    news_1.default
        .update(Number(id), req.body)
        .then((result) => res.status(result.httpStatusCode).json(result.data))
        .catch((err) => {
        logger_1.default.error(`Error updating news item. ${err.message}`);
        next(err);
    });
};
const remove = (req, res, next) => {
    const { id } = req.params;
    news_1.default
        .remove(Number(id))
        .then((result) => res.status(result.httpStatusCode).json(result.data))
        .catch((err) => {
        logger_1.default.error(`Error deleting news item. ${err.message}`);
        next(err);
    });
};
exports.default = {
    getAll,
    getOne,
    create,
    update,
    remove,
};
//# sourceMappingURL=news_controller.js.map