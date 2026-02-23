"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const default_route_1 = __importDefault(require("./default_route"));
const info_route_1 = __importDefault(require("./commons/infos/info_route"));
const logs_route_1 = __importDefault(require("./commons/logs/logs_route"));
const health_route_1 = __importDefault(require("./commons/health/health_route"));
const docs_route_1 = __importDefault(require("./commons/docs/docs_route"));
const emails_route_1 = __importDefault(require("./commons/templates/emails_route"));
const sms_route_1 = __importDefault(require("./commons/templates/sms_route"));
const stats_route_1 = __importDefault(require("./commons/stats/stats_route"));
const app_1 = __importDefault(require("../config/app"));
const router = (0, express_1.Router)();
const defaultRoutes = [
    {
        path: '/',
        route: default_route_1.default,
    },
    {
        path: '/info',
        route: info_route_1.default,
    },
    {
        path: '/logs',
        route: logs_route_1.default,
    },
    {
        path: '/v1/health',
        route: health_route_1.default,
    },
    {
        path: '/v1/stats',
        route: stats_route_1.default,
    },
];
defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});
const devRoutes = [
    {
        path: '/docs',
        route: docs_route_1.default,
    },
    {
        path: '/templates/email',
        route: emails_route_1.default,
    },
    {
        path: '/templates/sms',
        route: sms_route_1.default,
    },
];
if (!app_1.default.isProd) {
    devRoutes.forEach((route) => {
        router.use(route.path, route.route);
    });
}
exports.default = router;
//# sourceMappingURL=index.js.map