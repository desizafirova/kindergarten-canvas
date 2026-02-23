"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const devConfig = (env) => {
    return {
        database: {
            url: env.DATABASE_URL ||
                'postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public',
        },
    };
};
const stageConfig = (env) => {
    return {
        database: {
            url: env.DATABASE_URL ||
                'postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public',
        },
    };
};
const prodConfig = (env) => {
    return {
        database: {
            url: env.DATABASE_URL ||
                'postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public',
        },
    };
};
exports.default = { devConfig, stageConfig, prodConfig };
//# sourceMappingURL=config_database.js.map