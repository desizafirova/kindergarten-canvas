"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@kindergarten.bg';
    const password = process.env.DEFAULT_ADMIN_PASSWORD;
    const saltRounds = parseInt(process.env.BCRYPT_SALTROUNDS || '12');
    if (!password) {
        console.error('ERROR: DEFAULT_ADMIN_PASSWORD environment variable is required.');
        console.error('Please set it in your .env file before running the seed script.');
        console.error('Example: DEFAULT_ADMIN_PASSWORD=your-secure-password-here');
        process.exit(1);
    }
    if (password.length < 8) {
        console.error('ERROR: DEFAULT_ADMIN_PASSWORD must be at least 8 characters long.');
        process.exit(1);
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, saltRounds);
    const admin = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            password: hashedPassword,
            role: client_1.Role.ADMIN,
        },
    });
    console.log(`Admin user created/verified: ${admin.email} (id: ${admin.id})`);
}
main()
    .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map