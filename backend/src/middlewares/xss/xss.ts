import { NextFunction, Request, Response } from 'express';
import { inHTMLData } from 'xss-filters';

/* istanbul ignore next */
const clean = <T>(data: T | string = ''): T => {
    let isObject = false;
    if (typeof data === 'object') {
        data = JSON.stringify(data);
        isObject = true;
    }

    data = inHTMLData(data as string).trim();
    if (isObject) data = JSON.parse(data);

    return data as T;
};

/* istanbul ignore next */
const cleanObject = (obj: any, skipFields: string[] = []): any => {
    if (typeof obj !== 'object' || obj === null) {
        return clean(obj);
    }

    const cleaned: any = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
        if (skipFields.includes(key)) {
            // Skip XSS filtering for specified fields (e.g., rich text editor content)
            cleaned[key] = obj[key];
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            cleaned[key] = cleanObject(obj[key], skipFields);
        } else {
            cleaned[key] = clean(obj[key]);
        }
    }

    return cleaned;
};

const middleware = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Skip XSS filtering for 'content' field (rich text editor HTML is already sanitized by DOMPurify on frontend)
        // Skip numeric fields that should not be converted to strings
        const skipFields = ['content', 'displayOrder'];

        if (req.body) req.body = cleanObject(req.body, skipFields);
        if (req.query) req.query = cleanObject(req.query, skipFields);
        if (req.params) req.params = cleanObject(req.params, skipFields);
        next();
    };
};

export default middleware;
