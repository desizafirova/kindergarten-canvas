"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = void 0;
const zod_1 = require("zod");
exports.uploadFile = zod_1.z.object({
    file: zod_1.z.any().optional(),
});
//# sourceMappingURL=upload_schema.js.map