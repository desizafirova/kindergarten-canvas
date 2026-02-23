"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const checkConnection = async () => {
    const prisma = new client_1.PrismaClient();
    const connection = await prisma
        .$connect()
        .then(() => {
        return { success: true, error: null };
    })
        .catch((err) => {
        return { success: false, error: err };
    })
        .finally(async () => {
        await prisma.$disconnect();
    });
    return connection;
};
exports.default = { checkConnection };
//# sourceMappingURL=db_connection.js.map