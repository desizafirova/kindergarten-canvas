"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_upload_service_1 = __importDefault(require("../../services/cloudinary/cloudinary_upload_service"));
const http_msg_1 = __importDefault(require("../../utils/http_messages/http_msg"));
const logger_1 = __importDefault(require("../../utils/logger/winston/logger"));
const uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            const error = http_msg_1.default.http422('Моля, изберете файл за качване', 'ERROR_NO_FILE');
            return res.status(error.httpStatusCode).json(error.data);
        }
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedMimeTypes.includes(req.file.mimetype)) {
            const error = http_msg_1.default.http422('Невалиден тип файл. Позволени са: JPEG, PNG, GIF, WebP', 'ERROR_INVALID_FILE_TYPE');
            return res.status(error.httpStatusCode).json(error.data);
        }
        const maxSize = 10 * 1024 * 1024;
        if (req.file.size > maxSize) {
            const error = http_msg_1.default.http422('Файлът е твърде голям. Максимален размер: 10MB', 'ERROR_FILE_SIZE_EXCEEDED');
            return res.status(error.httpStatusCode).json(error.data);
        }
        const result = await (0, cloudinary_upload_service_1.default)(req.file.buffer, req.file.originalname);
        if (!result.success || !result.data) {
            throw http_msg_1.default.http422('Грешка при качване на изображението. Моля, опитайте отново.', 'ERROR_UPLOAD_FAILED');
        }
        return res.status(200).json(http_msg_1.default.http200(result.data).data);
    }
    catch (error) {
        logger_1.default.error(`Upload controller error: ${error.message}`);
        next(error);
    }
};
exports.default = {
    uploadImage,
};
//# sourceMappingURL=upload_controller.js.map