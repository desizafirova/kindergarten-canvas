"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postman_to_openapi_1 = __importDefault(require("postman-to-openapi"));
const yamljs_1 = __importDefault(require("yamljs"));
const path_1 = __importDefault(require("path"));
const global_api_path_1 = __importDefault(require("../global_api_path/global_api_path"));
const logger_1 = __importDefault(require("../logger/winston/logger"));
const _packagejson_1 = require("../../../package.json");
const openApi = 'docs/openapi/swagger.yml';
const postmanCollection = 'docs/postman/postman_collection.json';
const url = `${(0, global_api_path_1.default)()}/`;
const servers = [{ url: `${url}`, description: 'Api Ver. 1' }];
exports.default = async () => {
    const generateOpenapi = await (0, postman_to_openapi_1.default)(postmanCollection, path_1.default.join(openApi), {
        defaultTag: 'General',
        info: {
            title: _packagejson_1.name,
            version: _packagejson_1.version,
            description: _packagejson_1.description,
            license: { name: _packagejson_1.license, url: _packagejson_1.author.url },
            contact: { name: _packagejson_1.author.name, email: _packagejson_1.author.email },
        },
        servers,
    })
        .then((data) => {
        return { success: true, data: data, error: null };
    })
        .catch((err) => {
        logger_1.default.error(`Swagger generation stopped due to some error'. ${err}`);
        return { success: false, data: null, error: err };
    });
    if (generateOpenapi.success) {
        const result = await yamljs_1.default.load(openApi);
        return result;
    }
};
//# sourceMappingURL=postman_to_swagger.js.map