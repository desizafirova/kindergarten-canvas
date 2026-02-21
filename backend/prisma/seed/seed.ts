import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Get admin credentials from environment variables
  const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@kindergarten.bg';
  const password = process.env.DEFAULT_ADMIN_PASSWORD;
  const saltRounds = parseInt(process.env.BCRYPT_SALTROUNDS || '12');

  // SECURITY: Require password to be set via environment variable
  if (!password) {
    console.error('ERROR: DEFAULT_ADMIN_PASSWORD environment variable is required.');
    console.error('Please set it in your .env file before running the seed script.');
    console.error('Example: DEFAULT_ADMIN_PASSWORD=your-secure-password-here');
    process.exit(1);
  }

  // Validate password strength (minimum 8 characters)
  if (password.length < 8) {
    console.error('ERROR: DEFAULT_ADMIN_PASSWORD must be at least 8 characters long.');
    process.exit(1);
  }

  // Hash password with bcrypt
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Upsert admin user (create if not exists, do nothing if exists)
  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      role: Role.ADMIN,
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
