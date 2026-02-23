"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const config_app_1 = __importDefault(require("./config_app"));
const processEnv = process.env;
const nodeEnv = processEnv.NODE_ENV || 'development';
const validateEnvVariables = (env, isProd) => {
    const errors = [];
    if (!env.JWT_SECRET_USER || env.JWT_SECRET_USER.length < 32) {
        errors.push('JWT_SECRET_USER must be set and at least 32 characters');
    }
    if (!env.JWT_SECRET_ADMIN || env.JWT_SECRET_ADMIN.length < 32) {
        errors.push('JWT_SECRET_ADMIN must be set and at least 32 characters');
    }
    if (isProd) {
        if (!env.DATABASE_URL) {
            errors.push('DATABASE_URL is required in production');
        }
        if (!env.CORS_ALLOW_ORIGIN || env.CORS_ALLOW_ORIGIN === '*') {
            errors.push('CORS_ALLOW_ORIGIN must be set to a specific origin in production (not *)');
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
const baseConfig = {
    nodeEnv,
    isTest: nodeEnv === 'test',
    isDev: nodeEnv === 'development',
    isStage: nodeEnv === 'staging',
    isProd: nodeEnv === 'production',
};
if (nodeEnv !== 'test') {
    validateEnvVariables(processEnv, baseConfig.isProd);
}
let envConfig;
switch (nodeEnv) {
    case 'test':
        envConfig = config_app_1.default.testConfig(processEnv);
        break;
    case 'development':
        envConfig = config_app_1.default.devConfig(processEnv);
        break;
    case 'staging':
        envConfig = config_app_1.default.stageConfig(processEnv);
        break;
    case 'production':
        envConfig = config_app_1.default.prodConfig(processEnv);
        break;
    default:
        envConfig = config_app_1.default.devConfig(processEnv);
}
const config = Object.assign(Object.assign({}, baseConfig), envConfig);
module.exports = config;
//# sourceMappingURL=index.js.map