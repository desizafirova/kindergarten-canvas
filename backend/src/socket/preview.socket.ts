import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { IncomingMessage } from 'http';

import config from '@config/app';
import logger from '@utils/logger/winston/logger';

interface PreviewUpdateData {
    newsId: string | null;
    title: string;
    content: string;
    imageUrl: string | null;
}

interface JWTPayload {
    userId: number;
    [key: string]: any;
}

export function initializePreviewSocket(httpServer: HTTPServer): SocketIOServer {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: config.cors.allowOrigin,
            credentials: true,
        },
    });

    // JWT Authentication Middleware - using Socket.io middleware
    io.use((socket, next) => {
        // Try to get token from auth payload (preferred for Socket.io v4)
        let token = socket.handshake.auth?.token;

        // Fallback: try to get from Authorization header (for polling transport)
        if (!token) {
            const authHeader = socket.handshake.headers.authorization;
            token = authHeader?.replace('Bearer ', '');
        }

        if (!token) {
            logger.warn('WebSocket connection attempt without token');
            return next(new Error('Authentication required'));
        }

        try {
            // Verify JWT token using admin secret
            const decoded = jwt.verify(token, config.jwt.secretAdmin) as JWTPayload;
            (socket as any).user = decoded;
            logger.info(`WebSocket authenticated: userId=${decoded.userId}`);
            next();
        } catch (error) {
            logger.error(`WebSocket authentication failed: ${error}`);
            next(new Error('Invalid token'));
        }
    });

    // Connection handler
    io.on('connection', (socket) => {
        logger.info(`WebSocket connected: ${socket.id}`);

        // Listen for preview updates from client
        socket.on('preview:update', (data: PreviewUpdateData) => {
            logger.debug(`Preview update received: ${socket.id}`);

            // Emit rendered preview back to client (pass through without escaping)
            socket.emit('preview:render', {
                newsId: data.newsId,
                renderedHtml: data.content,
            });
        });

        // Handle disconnection
        socket.on('disconnect', (reason) => {
            logger.info(`WebSocket disconnected: ${socket.id}, reason: ${reason}`);
        });

        // Handle errors
        socket.on('error', (error) => {
            logger.error(`WebSocket error for ${socket.id}: ${error}`);
        });
    });

    logger.info('WebSocket preview server initialized');
    return io;
}
