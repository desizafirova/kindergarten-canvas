"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const serve_favicon_1 = __importDefault(require("serve-favicon"));
const body_parser_1 = __importDefault(require("body-parser"));
const xss_1 = __importDefault(require("../middlewares/xss/xss"));
const morgan_1 = __importDefault(require("../middlewares/morgan/morgan"));
const rate_limiter_1 = __importDefault(require("../middlewares/rate_limiter/rate_limiter"));
const error_handler_1 = __importDefault(require("../middlewares/http_error_handler/error_handler"));
const passportStrategy_1 = require("../middlewares/auth/passport_strategies/passportStrategy");
const app_1 = __importDefault(require("../config/app"));
const index_1 = __importDefault(require("../routes/index"));
const v1_1 = __importDefault(require("../routes/client/v1"));
const v1_2 = __importDefault(require("../routes/admin/v1"));
const publicLogs = './logs';
const publicFavicon = './public/assets/images/favicons/favicon.ico';
const views = '../views';
exports.default = () => {
    const app = (0, express_1.default)();
    const baseApiUrl = '/' + app_1.default.api.prefix.replace('/', '');
    const corsOptions = {
        origin: app_1.default.cors.allowOrigin,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    };
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)(corsOptions));
    app.use(morgan_1.default.consoleLogger);
    app.use(morgan_1.default.fileLogger);
    app.use(body_parser_1.default.json({ limit: app_1.default.api.jsonLimit }));
    app.use(body_parser_1.default.urlencoded({ extended: app_1.default.api.extUrlencoded }));
    app.use((0, xss_1.default)());
    app.use(rate_limiter_1.default.limiter);
    (0, passportStrategy_1.localUserStrategy)(passport_1.default);
    (0, passportStrategy_1.jwtUserStrategy)(passport_1.default);
    app.use((0, serve_favicon_1.default)(publicFavicon));
    app.use(express_1.default.static('public'));
    app.use(baseApiUrl + '/logs', express_1.default.static(publicLogs, { dotfiles: 'allow' }));
    app.use(baseApiUrl + '/', index_1.default);
    app.use(baseApiUrl + '/client/', v1_1.default);
    app.use(baseApiUrl + '/admin/', v1_2.default);
    app.set('view engine', 'ejs');
    app.set('views', path_1.default.join(__dirname, views));
    app.use(error_handler_1.default);
    return app;
};
//# sourceMappingURL=app.js.map