import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import express from 'express';
import passport from 'passport';
import favicon from 'serve-favicon';
import bodyParser from 'body-parser';

import xss from '@middlewares/xss/xss';
import morgan from '@middlewares/morgan/morgan';
import rateLimit from '@middlewares/rate_limiter/rate_limiter';
import { metricsMiddleware } from '@middlewares/metrics/metrics_middleware';
import handleError from '@middlewares/http_error_handler/error_handler';
import {
    localUserStrategy,
    jwtUserStrategy,
} from '@middlewares/auth/passport_strategies/passportStrategy';

import config from '@config/app';
import logger from '@utils/logger/winston/logger';
import { verifySesConnection } from '@services/email/ses_notification_service';
import routes from '@routes/index';
import routesUser from '@routes/client/v1';
import routesAdmin from '@routes/admin/v1';
import publicNewsRoutes from '@routes/public/news_route';
import publicTeacherRoutes from '@routes/public/teacher_route';
import publicEventRoutes from '@routes/public/event_route';
import publicDeadlineRoutes from '@routes/public/deadline_route';
import publicJobRoutes from '@routes/public/job_route';
import publicApplicationRoutes from '@routes/public/application_route';
import publicGalleryRoutes from '@routes/public/gallery_route';
import publicSubscriptionRoutes from '@routes/public/subscription_route';
import publicHomepageRoutes from '@routes/public/homepage_route';

const publicLogs = './logs';
const publicFavicon = './public/assets/images/favicons/favicon.ico';
const views = '../views';

export default () => {
    const app = express();
    const baseApiUrl = '/' + config.api.prefix.replace('/', '');
    const corsOptions = {
        origin: config.cors.allowOrigin,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    };

    app.use(helmet());

    app.use(cors(corsOptions));

    app.use(morgan.consoleLogger);
    app.use(morgan.fileLogger);

    app.use(bodyParser.json({ limit: config.api.jsonLimit }));
    app.use(bodyParser.urlencoded({ extended: config.api.extUrlencoded }));

    app.use(xss());
    app.use(rateLimit.limiter);
    app.use(metricsMiddleware);

    localUserStrategy(passport);
    jwtUserStrategy(passport);

    app.use(favicon(publicFavicon));
    app.use(express.static('public'));

    app.use(baseApiUrl + '/logs', express.static(publicLogs, { dotfiles: 'allow' }));
    app.use(baseApiUrl + '/', routes);
    app.use(baseApiUrl + '/client/', routesUser);
    app.use(baseApiUrl + '/admin/v1/', routesAdmin);
    app.use(baseApiUrl + '/v1/public/news', publicNewsRoutes); // Public routes - NO authentication
    app.use(baseApiUrl + '/v1/public/teachers', publicTeacherRoutes); // Public teachers - NO authentication
    app.use(baseApiUrl + '/v1/public/events', publicEventRoutes); // Public events - NO authentication
    app.use(baseApiUrl + '/v1/public/admission-deadlines', publicDeadlineRoutes); // Public deadlines - NO authentication
    app.use(baseApiUrl + '/v1/public/jobs', publicJobRoutes); // Public jobs - NO authentication
    app.use(baseApiUrl + '/v1/public/applications', publicApplicationRoutes); // Public applications - NO authentication
    app.use(baseApiUrl + '/v1/public/galleries', publicGalleryRoutes); // Public galleries - NO authentication
    app.use(baseApiUrl + '/v1/public', publicSubscriptionRoutes); // Public subscription routes (subscribe + unsubscribe) - NO authentication
    app.use(baseApiUrl + '/v1/public/homepage', publicHomepageRoutes); // Public homepage - NO authentication

    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, views));

    app.use(handleError);

    verifySesConnection().catch((err: any) =>
        logger.warn('SES startup check skipped', { error: err.message }),
    );

    return app;
};
