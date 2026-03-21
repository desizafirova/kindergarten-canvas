import crypto from 'crypto';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../../../prisma/prisma-client';
import logger from '@utils/logger/winston/logger';
import { subscribeBodySchema } from '@schemas/subscription_schema';

const successHtml = `
<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Отписване от известия</title>
</head>
<body style="font-family: sans-serif; text-align: center; padding: 40px; color: #333;">
  <h1 style="color: #22c55e;">✓</h1>
  <h2>Успешно се отписахте от известията</h2>
  <p>Вече няма да получавате имейл известия от нас.</p>
</body>
</html>`;

const errorHtml = `
<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Грешка</title>
</head>
<body style="font-family: sans-serif; text-align: center; padding: 40px; color: #333;">
  <h1 style="color: #ef4444;">✗</h1>
  <h2>Невалиден или изтекъл линк</h2>
  <p>Линкът за отписване е невалиден или вече е използван.</p>
</body>
</html>`;

export const subscribe = async (req: Request, res: Response) => {
    try {
        const parseResult = subscribeBodySchema.safeParse(req.body);
        if (!parseResult.success) {
            const errors = parseResult.error.flatten().fieldErrors;
            return res.status(400).json({ status: 'fail', data: errors });
        }

        const { email, subscriptionTypes } = parseResult.data;

        const existing = await prisma.emailSubscriber.findUnique({ where: { email } });
        if (existing) {
            return res.status(200).json({
                status: 'success',
                data: { message: 'Вече сте абонирани' },
            });
        }

        const token = crypto.randomBytes(32).toString('hex');

        try {
            await prisma.emailSubscriber.create({
                data: { email, subscriptionTypes, unsubscribeToken: token },
            });
        } catch (createError: unknown) {
            // Handle concurrent duplicate insert (P2002 unique constraint)
            if (createError instanceof Prisma.PrismaClientKnownRequestError && createError.code === 'P2002') {
                return res.status(200).json({
                    status: 'success',
                    data: { message: 'Вече сте абонирани' },
                });
            }
            throw createError;
        }

        const emailDomain = email.split('@')[1] ?? 'unknown';
        logger.info('New subscriber', { emailDomain, subscriptionTypes });

        return res.status(201).json({
            status: 'success',
            data: { message: 'Успешно се абонирахте за известия!' },
        });
    } catch (error: unknown) {
        logger.error(`Subscription error: ${error}`);
        return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const unsubscribe = async (req: Request, res: Response) => {
    try {
        const token = req.query.token as string | undefined;

        if (!token || token.trim() === '') {
            res.setHeader('Content-Type', 'text/html');
            return res.status(400).send(errorHtml);
        }

        const subscriber = await prisma.emailSubscriber.findUnique({
            where: { unsubscribeToken: token },
        });

        if (!subscriber) {
            res.setHeader('Content-Type', 'text/html');
            return res.status(400).send(errorHtml);
        }

        // Idempotent: if already unsubscribed, return success without overwriting the original timestamp
        if (subscriber.isActive) {
            await prisma.emailSubscriber.update({
                where: { unsubscribeToken: token },
                data: { isActive: false, unsubscribedAt: new Date() },
            });
            logger.info('Subscriber unsubscribed', { subscriberId: subscriber.id });
        }

        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(successHtml);
    } catch (error: unknown) {
        logger.error(`Unsubscribe error: ${error}`);
        res.setHeader('Content-Type', 'text/html');
        return res.status(500).send('<h1>Грешка на сървъра</h1>');
    }
};
