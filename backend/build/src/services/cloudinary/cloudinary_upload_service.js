"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_config_1 = __importDefault(require("../../config/cloudinary.config"));
const logger_1 = __importDefault(require("../../utils/logger/winston/logger"));
exports.default = async (fileBuffer, filename) => {
    try {
        const fileStr = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;
        const result = await cloudinary_config_1.default.uploader.upload(fileStr, {
            folder: 'kindergarten-canvas/news',
            resource_type: 'image',
            use_filename: true,
            unique_filename: true,
            overwrite: false,
            transformation: [
                { quality: 'auto', fetch_format: 'auto' }
            ]
        });
        return {
            success: true,
            data: {
                url: result.secure_url,
                publicId: result.public_id
            },
            error: null
        };
    }
    catch (error) {
        logger_1.default.error(`Cloudinary upload failed: ${error.message}`);
        return {
            success: false,
            data: null,
            error: error.message || 'Upload failed'
        };
    }
};
//# sourceMappingURL=cloudinary_upload_service.js.map