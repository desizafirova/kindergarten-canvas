import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

import logger from '@utils/logger/winston/logger';
import { errorLogBuffer } from '@utils/logger/error_log_buffer';

const getRequestContext = (req: Request) => ({
    method: req.method,
    url: req.originalUrl || req.url,
    userId: (req.user as any)?.id ?? null,
    userAgent: req.get('user-agent') ?? 'unknown',
    ip: req.ip,
});

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    // Handle Multer errors (file upload)
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            logger.warn('File upload error', { ...getRequestContext(req), code: err.code });
            return res.status(400).json({
                success: false,
                message: 'Файлът е твърде голям. Максимален размер: 10MB',
                error: 'ERROR_FILE_SIZE_EXCEEDED',
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            logger.warn('File upload error', { ...getRequestContext(req), code: err.code });
            return res.status(400).json({
                success: false,
                message: 'Невалидно поле за файл',
                error: 'ERROR_UNEXPECTED_FILE',
            });
        }
        // Generic multer error
        logger.warn('File upload error', { ...getRequestContext(req), code: err.code });
        return res.status(400).json({
            success: false,
            message: 'Грешка при качване на файл',
            error: 'ERROR_FILE_UPLOAD',
        });
    }

    // Handle multer fileFilter errors (custom error thrown from fileFilter)
    if (err.message && err.message.includes('Невалиден тип файл')) {
        logger.warn('File upload error', { ...getRequestContext(req), code: 'INVALID_FILE_TYPE' });
        return res.status(400).json({
            success: false,
            message: err.message,
            error: 'ERROR_INVALID_FILE_TYPE',
        });
    }

    if (err.error === 'ValidationError') {
        logger.warn('Validation error', { ...getRequestContext(req), message: err.message });
        return res.status(400).json({
            error: {
                code: 400,
                error: 'VALIDATION_ERROR',
                message: err.message,
            },
        });
    }

    if (err.error === 'UnauthorizedError') {
        logger.warn('Authentication error', { ...getRequestContext(req), error: err.error });
        return res.status(401).json({
            error: {
                code: 401,
                error: 'JWT_AUTHENTICATION_ERROR',
                message: 'Unauthorized. Access denied!',
            },
        });
    }

    if (err.error === 'JsonWebTokenError') {
        logger.warn('Authentication error', { ...getRequestContext(req), error: err.error });
        return res.status(401).json({
            error: {
                code: 401,
                error: 'JWT_AUTHENTICATION_ERROR',
                message: 'Jwt token error. Access denied!',
            },
        });
    }

    if (err.error === 'TokenExpiredError') {
        logger.warn('Authentication error', { ...getRequestContext(req), error: err.error });
        return res.status(401).json({
            error: {
                code: 401,
                error: 'JWT_AUTHENTICATION_ERROR',
                message: 'Jwt token expired. Access denied!',
            },
        });
    }

    if (err.error === 'NotFound') {
        logger.info('Resource not found', getRequestContext(req));
        return res.status(404).json({
            error: {
                code: 404,
                error: 'NOT_FOUND',
                message: 'The requested resource could not be found.',
            },
        });
    }

    if (err.error === 'Unprocessable') {
        logger.warn('Unprocessable entity', { ...getRequestContext(req), message: err.message });
        return res.status(422).json({
            error: {
                code: 422,
                error: 'UNPROCESSABLE_ENTITY',
                message:
                    'Unprocessable Entity error occurs when a request to the API can not be processed.',
            },
        });
    }

    // default to 500 server error
    logger.error('Unhandled server error', {
        ...getRequestContext(req),
        error: err?.message ?? 'Unknown error',
        stack: err?.stack ?? 'No stack trace available',
        errorType: err?.constructor?.name ?? 'UnknownError',
    });
    errorLogBuffer.add({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: err?.message ?? 'Unknown error',
        method: req.method,
        url: req.originalUrl || req.url,
        userId: (req.user as any)?.id ?? null,
        errorType: err?.constructor?.name ?? 'UnknownError',
    });
    return res.status(500).json({
        error: {
            code: 500,
            error: 'SERVER_ERROR',
            message: 'Internal Server Error',
        },
    });
};

export default errorHandler;
