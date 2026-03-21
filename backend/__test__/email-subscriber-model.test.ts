import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const baseToken = () => `token-${Date.now()}-${Math.random().toString(36).slice(2)}`;

describe('EmailSubscriber model', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  afterEach(async () => {
    await prisma.emailSubscriber.deleteMany({
      where: { email: { in: ['parent@example.com', 'active@example.com', 'all@example.com', 'empty@example.com', 'update@example.com', 'dup@example.com'] } },
    });
  });

  it('creates subscriber with required fields and correct defaults', async () => {
    const subscriber = await prisma.emailSubscriber.create({
      data: {
        email: 'parent@example.com',
        subscriptionTypes: ['NEWS', 'EVENTS'],
        unsubscribeToken: baseToken(),
      },
    });

    expect(subscriber.id).toBeDefined();
    expect(subscriber.isActive).toBe(true);
    expect(subscriber.unsubscribedAt).toBeNull();
    expect(subscriber.subscribedAt).toBeInstanceOf(Date);
    expect(subscriber.subscriptionTypes).toEqual(['NEWS', 'EVENTS']);
  });

  it('enforces unique constraint on email (Prisma P2002)', async () => {
    await prisma.emailSubscriber.create({
      data: { email: 'dup@example.com', subscriptionTypes: ['NEWS'], unsubscribeToken: baseToken() },
    });

    await expect(
      prisma.emailSubscriber.create({
        data: { email: 'dup@example.com', subscriptionTypes: ['EVENTS'], unsubscribeToken: baseToken() },
      })
    ).rejects.toMatchObject({ code: 'P2002' });
  });

  it('enforces unique constraint on unsubscribeToken (Prisma P2002)', async () => {
    const sharedToken = baseToken();
    await prisma.emailSubscriber.create({
      data: { email: 'parent@example.com', subscriptionTypes: ['NEWS'], unsubscribeToken: sharedToken },
    });

    await expect(
      prisma.emailSubscriber.create({
        data: { email: 'active@example.com', subscriptionTypes: ['NEWS'], unsubscribeToken: sharedToken },
      })
    ).rejects.toMatchObject({ code: 'P2002' });
  });

  it('accepts null unsubscribedAt (subscriber remains active)', async () => {
    const subscriber = await prisma.emailSubscriber.create({
      data: { email: 'active@example.com', subscriptionTypes: ['DEADLINES'], unsubscribeToken: baseToken() },
    });

    expect(subscriber.unsubscribedAt).toBeNull();
    expect(subscriber.isActive).toBe(true);
  });

  it('accepts all three subscriptionTypes in array', async () => {
    const subscriber = await prisma.emailSubscriber.create({
      data: { email: 'all@example.com', subscriptionTypes: ['NEWS', 'EVENTS', 'DEADLINES'], unsubscribeToken: baseToken() },
    });

    expect(subscriber.subscriptionTypes).toHaveLength(3);
    expect(subscriber.subscriptionTypes).toContain('NEWS');
    expect(subscriber.subscriptionTypes).toContain('EVENTS');
    expect(subscriber.subscriptionTypes).toContain('DEADLINES');
  });

  it('accepts empty subscriptionTypes array', async () => {
    const subscriber = await prisma.emailSubscriber.create({
      data: { email: 'empty@example.com', subscriptionTypes: [], unsubscribeToken: baseToken() },
    });

    expect(subscriber.subscriptionTypes).toEqual([]);
  });

  it('findMany with isActive filter returns only active subscribers', async () => {
    const token1 = baseToken();
    const token2 = baseToken();

    await prisma.emailSubscriber.create({
      data: { email: 'parent@example.com', subscriptionTypes: ['NEWS'], unsubscribeToken: token1, isActive: true },
    });
    await prisma.emailSubscriber.create({
      data: { email: 'update@example.com', subscriptionTypes: ['NEWS'], unsubscribeToken: token2, isActive: false },
    });

    const active = await prisma.emailSubscriber.findMany({
      where: { isActive: true, subscriptionTypes: { has: 'NEWS' } },
      select: { email: true, unsubscribeToken: true },
    });

    const emails = active.map((s) => s.email);
    expect(emails).toContain('parent@example.com');
    expect(emails).not.toContain('update@example.com');
  });

  it('updates isActive to false and sets unsubscribedAt on unsubscribe', async () => {
    const subscriber = await prisma.emailSubscriber.create({
      data: { email: 'update@example.com', subscriptionTypes: ['NEWS'], unsubscribeToken: baseToken() },
    });

    expect(subscriber.isActive).toBe(true);
    expect(subscriber.unsubscribedAt).toBeNull();

    const unsubscribedAt = new Date();
    const updated = await prisma.emailSubscriber.update({
      where: { id: subscriber.id },
      data: { isActive: false, unsubscribedAt },
    });

    expect(updated.isActive).toBe(false);
    expect(updated.unsubscribedAt).toBeInstanceOf(Date);
  });
});
