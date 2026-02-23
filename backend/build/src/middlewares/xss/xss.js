"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xss_filters_1 = require("xss-filters");
const clean = (data = '') => {
    let isObject = false;
    if (typeof data === 'object') {
        data = JSON.stringify(data);
        isObject = true;
    }
    data = (0, xss_filters_1.inHTMLData)(data).trim();
    if (isObject)
        data = JSON.parse(data);
    return data;
};
const middleware = () => {
    return (req, res, next) => {
        if (req.body)
            req.body = clean(req.body);
        if (req.query)
            req.query = clean(req.query);
        if (req.params)
            req.params = clean(req.params);
        next();
    };
};
exports.default = middleware;
//# sourceMappingURL=xss.js.map