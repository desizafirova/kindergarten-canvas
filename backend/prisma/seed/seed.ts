import { PrismaClient, Role, EventStatus, DeadlineStatus } from '@prisma/client';
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
      updatedAt: new Date(),
    },
  });

  console.log(`Admin user created/verified: ${admin.email} (id: ${admin.id})`);

  // Seed sample events
  console.log('Seeding events...');
  await prisma.event.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'Открит урок по рисуване',
        description: '<p>Каним родителите на открит урок по рисуване с децата от подготвителната група.</p>',
        eventDate: new Date('2026-04-15T10:00:00Z'),
        eventEndDate: new Date('2026-04-15T11:30:00Z'),
        location: 'Основна зала',
        isImportant: true,
        status: EventStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      {
        title: 'Летен празник 2026',
        description: '<p>Празник на приключилата учебна година с игри, танци и забавления.</p>',
        eventDate: new Date('2026-06-20T14:00:00Z'),
        eventEndDate: new Date('2026-06-20T18:00:00Z'),
        location: 'Двор на детската градина',
        isImportant: true,
        status: EventStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      {
        title: 'Екскурзия до зоопарка',
        description: '<p>Планирана екскурзия до столичния зоопарк за децата от старша група.</p>',
        eventDate: new Date('2026-05-10T09:00:00Z'),
        eventEndDate: new Date('2026-05-10T16:00:00Z'),
        location: 'София, Зоологическа градина',
        isImportant: false,
        status: EventStatus.DRAFT,
      },
    ],
  });
  console.log('Events seeded successfully');

  // Seed sample deadlines
  console.log('Seeding deadlines...');
  await prisma.deadline.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'Краен срок за записване',
        description: '<p>Последен ден за подаване на документи за записване в детската градина за учебна 2026/2027 година.</p>',
        deadlineDate: new Date('2026-05-01T23:59:59Z'),
        isUrgent: true,
        status: DeadlineStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      {
        title: 'Заплащане на месечна такса',
        description: '<p>Крайна дата за заплащане на месечната такса за месец април.</p>',
        deadlineDate: new Date('2026-04-05T23:59:59Z'),
        isUrgent: false,
        status: DeadlineStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      {
        title: 'Медицински прегледи',
        description: '<p>Краен срок за предаване на медицински бележки за деца от ясли.</p>',
        deadlineDate: new Date('2026-09-15T23:59:59Z'),
        isUrgent: false,
        status: DeadlineStatus.DRAFT,
      },
    ],
  });
  console.log('Deadlines seeded successfully');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
