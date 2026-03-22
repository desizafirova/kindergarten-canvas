import * as dotenv from 'dotenv';
dotenv.config();

import envConfigs from './config_app';
import { IBaseConfig, IConfig, IEnvConfig, IProcessEnv } from './types';

const processEnv: IProcessEnv = process.env;
const nodeEnv: string = processEnv.NODE_ENV || 'development';

const validateEnvVariables = (env: IProcessEnv, isProd: boolean): void => {
    const errors: string[] = [];

    if (!env.JWT_SECRET_USER || env.JWT_SECRET_USER.length < 32) {
        errors.push('JWT_SECRET_USER must be set and at least 32 characters');
    }
    if (!env.JWT_SECRET_ADMIN || env.JWT_SECRET_ADMIN.length < 32) {
        errors.push('JWT_SECRET_ADMIN must be set and at least 32 characters');
    }

    // Always required (needed in development too)
    if (!env.DATABASE_URL) {
        errors.push('DATABASE_URL is required');
    }
    if (!env.CLOUDINARY_CLOUD_NAME) {
        errors.push('CLOUDINARY_CLOUD_NAME is required');
    }
    if (!env.CLOUDINARY_API_KEY) {
        errors.push('CLOUDINARY_API_KEY is required');
    }
    if (!env.CLOUDINARY_API_SECRET) {
        errors.push('CLOUDINARY_API_SECRET is required');
    }
    if (!env.AWS_SES_REGION) {
        errors.push('AWS_SES_REGION is required');
    }
    if (!env.AWS_SES_ACCESS_KEY_ID) {
        errors.push('AWS_SES_ACCESS_KEY_ID is required');
    }
    if (!env.AWS_SES_SECRET_ACCESS_KEY) {
        errors.push('AWS_SES_SECRET_ACCESS_KEY is required');
    }
    if (!env.AWS_SES_FROM_EMAIL) {
        errors.push('AWS_SES_FROM_EMAIL is required');
    }
    if (!env.JWT_REFRESH_EXPIRATION) {
        errors.push('JWT_REFRESH_EXPIRATION is required');
    }

    if (isProd) {
        if (!env.CORS_ALLOW_ORIGIN || env.CORS_ALLOW_ORIGIN === '*') {
            errors.push('CORS_ALLOW_ORIGIN must be set to a specific origin in production (not *)');
        }
        if (!env.FRONTEND_URL) {
            errors.push('FRONTEND_URL is required in production');
        }
    }

    if (errors.length > 0) {
        const errorMessage = `\n❌ Environment Configuration Error:\n${errors.map((e) => `   - ${e}`).join('\n')}\n\nPlease check your .env file. See .env.example for required variables.\n`;
        console.error(errorMessage);
        if (isProd) {
            process.exit(1);
        }
    }
};

const baseConfig: IBaseConfig = {
    nodeEnv,
    isTest: nodeEnv === 'test',
    isDev: nodeEnv === 'development',
    isStage: nodeEnv === 'staging',
    isProd: nodeEnv === 'production',
};

if (nodeEnv !== 'test') {
    validateEnvVariables(processEnv, baseConfig.isProd);
}

let envConfig: IEnvConfig;

switch (nodeEnv) {
    case 'test':
        envConfig = envConfigs.testConfig(processEnv);
        break;
    case 'development':
        envConfig = envConfigs.devConfig(processEnv);
        break;
    case 'staging':
        envConfig = envConfigs.stageConfig(processEnv);
        break;
    case 'production':
        envConfig = envConfigs.prodConfig(processEnv);
        break;
    default:
        envConfig = envConfigs.devConfig(processEnv);
}

const config: IConfig = { ...baseConfig, ...envConfig };

export = config;
