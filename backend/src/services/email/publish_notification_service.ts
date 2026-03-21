import prisma from '../../../prisma/prisma-client';
import { sendBulkNotifications } from './ses_notification_service';
import {
    buildNewsNotificationEmail,
    buildEventNotificationEmail,
    buildDeadlineNotificationEmail,
} from './notification_templates';
import type { SesEmailParams } from './ses_notification_service';
import logger from '@utils/logger/winston/logger';

const baseUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';

const formatDateBg = (date: Date): string => {
    const d = date.getUTCDate().toString().padStart(2, '0');
    const m = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    return `${d}.${m}.${date.getUTCFullYear()}`;
};

const makeExcerpt = (html: string, maxLen = 200): string => {
    const plain = html
        .replace(/<[^>]*>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&[^;]+;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    return plain.length > maxLen ? plain.substring(0, maxLen) + '...' : plain;
};

const getActiveSubscribers = async (subscriptionType: string) =>
    prisma.emailSubscriber.findMany({
        where: { isActive: true, subscriptionTypes: { has: subscriptionType } },
        select: { email: true, unsubscribeToken: true },
    });

export const notifyNewsPublished = async (news: { id: number; title: string; content: string }): Promise<void> => {
    const subscribers = await getActiveSubscribers('NEWS');
    const subscriberCount = subscribers.length;

    if (subscriberCount === 0) {
        logger.info('Publish notification skipped: no NEWS subscribers', { contentType: 'NEWS', contentId: news.id });
        return;
    }

    const newsUrl = `${baseUrl}/news/${news.id}`;
    const excerpt = makeExcerpt(news.content);
    const tokenMap = new Map(subscribers.map((s) => [s.email, s.unsubscribeToken]));

    const result = await sendBulkNotifications(
        subscribers.map((s) => s.email),
        (to): SesEmailParams => {
            const emailTemplate = buildNewsNotificationEmail({
                title: news.title,
                excerpt,
                newsUrl,
                unsubscribeToken: tokenMap.get(to) ?? '',
            });
            return { to, ...emailTemplate };
        },
    );

    logger.info('Publish notification sent', {
        contentType: 'NEWS',
        contentId: news.id,
        subscriberCount,
        sentCount: result.sent,
        failedCount: result.failed,
        timestamp: new Date().toISOString(),
    });
};

export const notifyEventPublished = async (event: {
    id: number;
    title: string;
    eventDate: Date;
    location?: string | null;
    description?: string | null;
}): Promise<void> => {
    const subscribers = await getActiveSubscribers('EVENTS');
    const subscriberCount = subscribers.length;

    if (subscriberCount === 0) {
        logger.info('Publish notification skipped: no EVENTS subscribers', { contentType: 'EVENTS', contentId: event.id });
        return;
    }

    const eventUrl = `${baseUrl}/events/${event.id}`;
    const date = formatDateBg(event.eventDate);
    const description = makeExcerpt(event.description ?? '', 200);
    const tokenMap = new Map(subscribers.map((s) => [s.email, s.unsubscribeToken]));

    const result = await sendBulkNotifications(
        subscribers.map((s) => s.email),
        (to): SesEmailParams => {
            const emailTemplate = buildEventNotificationEmail({
                title: event.title,
                date,
                location: event.location ?? undefined,
                description,
                eventUrl,
                unsubscribeToken: tokenMap.get(to) ?? '',
            });
            return { to, ...emailTemplate };
        },
    );

    logger.info('Publish notification sent', {
        contentType: 'EVENTS',
        contentId: event.id,
        subscriberCount,
        sentCount: result.sent,
        failedCount: result.failed,
        timestamp: new Date().toISOString(),
    });
};

export const notifyDeadlinePublished = async (deadline: {
    id: number;
    title: string;
    deadlineDate: Date;
    isUrgent: boolean;
    description?: string | null;
}): Promise<void> => {
    const subscribers = await getActiveSubscribers('DEADLINES');
    const subscriberCount = subscribers.length;

    if (subscriberCount === 0) {
        logger.info('Publish notification skipped: no DEADLINES subscribers', { contentType: 'DEADLINES', contentId: deadline.id });
        return;
    }

    const deadlineUrl = `${baseUrl}/deadlines/${deadline.id}`;
    const date = formatDateBg(deadline.deadlineDate);
    const description = makeExcerpt(deadline.description ?? '', 200);
    const tokenMap = new Map(subscribers.map((s) => [s.email, s.unsubscribeToken]));

    const result = await sendBulkNotifications(
        subscribers.map((s) => s.email),
        (to): SesEmailParams => {
            const emailTemplate = buildDeadlineNotificationEmail({
                title: deadline.title,
                date,
                isUrgent: deadline.isUrgent,
                description,
                deadlineUrl,
                unsubscribeToken: tokenMap.get(to) ?? '',
            });
            return { to, ...emailTemplate };
        },
    );

    logger.info('Publish notification sent', {
        contentType: 'DEADLINES',
        contentId: deadline.id,
        subscriberCount,
        sentCount: result.sent,
        failedCount: result.failed,
        timestamp: new Date().toISOString(),
    });
};
