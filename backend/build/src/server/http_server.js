"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const ansi_colors_1 = __importDefault(require("ansi-colors"));
const app_1 = __importDefault(require("./app"));
const app_2 = __importDefault(require("../config/app"));
const logger_1 = __importDefault(require("../utils/logger/winston/logger"));
exports.default = async (silent) => {
    const serverHost = app_2.default.app.host;
    const serverPort = app_2.default.app.port;
    let serverConnections;
    serverConnections = [];
    const server = createServer((0, app_1.default)());
    server.listen(serverPort);
    server.on('listening', () => onListening(serverHost, serverPort, silent));
    server.on('error', (error) => onError(error, serverHost, serverPort, server, serverConnections));
    server.on('connection', (connection) => {
        serverConnections.push(connection);
        connection.on('close', () => {
            serverConnections = serverConnections.filter((curr) => curr !== connection);
        });
    });
    if (app_2.default.debug.http_connection)
        getConnections(server);
    process.on('SIGTERM', () => shutDown(server, serverConnections));
    process.on('SIGINT', () => shutDown(server, serverConnections));
    return server;
};
const createServer = (app) => {
    let httpserver;
    let options;
    if (app_2.default.ssl.isHttps && app_2.default.isProd) {
        try {
            options = {
                key: fs_1.default.readFileSync(`${app_2.default.ssl.privateKey}`),
                cert: fs_1.default.readFileSync(`${app_2.default.ssl.certificate}`),
            };
        }
        catch (err) {
            logger_1.default.error(`Http server error - SSL certificate files is not found`);
            logger_1.default.error(`Http server error - Shutting down gracefully (SHUTDOWN)`);
            process.exit(0);
        }
        httpserver = https_1.default.createServer(options, app);
    }
    else {
        httpserver = http_1.default.createServer(app);
    }
    return httpserver;
};
const onListening = (host, port, silent) => {
    if (!silent) {
        if (app_2.default.ssl.isHttps && app_2.default.isProd) {
            console.log(ansi_colors_1.default.white(`-> Listening on https://${host}:${port} (SSL)`));
        }
        else {
            console.log(ansi_colors_1.default.white(`-> Listening on http://${host}:${port}`));
        }
    }
    logger_1.default.info(`Api status: Ready (listening on ${host}:${port})`);
};
const onError = (error, host, port, server, connections) => {
    if (error.syscall !== 'listen')
        throw error;
    switch (error.code) {
        case 'EACCES':
            console.log(`Http server error - Host ${host}:${port} requires elevated privileges (${error.code})`);
            logger_1.default.error(`Http server error - Host ${host}:${port} requires elevated privileges (${error.code})`);
            shutDown(server, connections);
            break;
        case 'EADDRINUSE':
            console.log(`Http server error - Host ${host}:${port} is already in use (${error.code})`);
            logger_1.default.error(`Http server error - Host ${host}:${port} is already in use (${error.code})`);
            shutDown(server, connections);
            break;
        case 'EADDRNOTAVAIL':
            console.log(`Http server error - Host ${host}:${port} not available (${error.code})`);
            logger_1.default.error(`Http server error - Host ${host}:${port} not available (${error.code})`);
            shutDown(server, connections);
            break;
        default:
            logger_1.default.error(`Http server error - Host ${host}:${port} not available (${error})`);
            throw error;
    }
};
const shutDown = (server, connections) => {
    console.log('Http server error - Received kill signal, shutting down gracefully (SHUTDOWN)');
    logger_1.default.error('Http server error - Received kill signal, shutting down gracefully (SHUTDOWN)');
    server.close(() => {
        console.log('Http server error - Closed out remaining connections (SHUTDOWN)');
        logger_1.default.error('Http server error - Closed out remaining connections (SHUTDOWN)');
        process.exit(0);
    });
    setTimeout(() => {
        console.log('Http server error - Could not close connections in time, forcefully shutting down (SHUTDOWN)');
        logger_1.default.error('Http server error - Could not close connections in time, forcefully shutting down (SHUTDOWN)');
        process.exit(1);
    }, 10000);
    connections.forEach((curr) => curr.end());
    setTimeout(() => connections.forEach((curr) => curr.destroy()), 5000);
};
const getConnections = (server) => {
    setInterval(() => server.getConnections((err, count) => {
        if (err)
            logger_1.default.error(`Http server connections logs error. ${err}`);
        if (!err)
            console.log(`${count} connections currently open`);
    }), 1000);
};
//# sourceMappingURL=http_server.js.map