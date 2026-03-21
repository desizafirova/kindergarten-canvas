export interface EmailTemplate {
    subject: string;
    html: string;
    text: string;
}

export interface NewsNotificationParams {
    title: string;
    excerpt: string;
    newsUrl: string;
    unsubscribeToken: string;
}

export interface EventNotificationParams {
    title: string;
    date: string;
    location?: string;
    description: string;
    eventUrl: string;
    unsubscribeToken: string;
}

export interface DeadlineNotificationParams {
    title: string;
    date: string;
    isUrgent: boolean;
    description: string;
    deadlineUrl: string;
    unsubscribeToken: string;
}

const escapeHtml = (str: string): string =>
    str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const buildUnsubscribeFooterHtml = (unsubscribeToken: string): string => {
    const baseUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
    const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;
    return `<hr><p style="font-size:12px;color:#666;">За да спрете да получавате известия, <a href="${unsubscribeUrl}">натиснете тук</a>.</p>`;
};

const buildUnsubscribeFooterText = (unsubscribeToken: string): string => {
    const baseUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
    const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;
    return `\n\n---\nЗа отписване: ${unsubscribeUrl}`;
};

export const buildNewsNotificationEmail = (params: NewsNotificationParams): EmailTemplate => {
    const { title, excerpt, newsUrl, unsubscribeToken } = params;

    const subject = `Ново в Детска Градина: ${title}`;

    const html = `<h2>${escapeHtml(title)}</h2>
<p>${escapeHtml(excerpt)}</p>
<p><a href="${escapeHtml(newsUrl)}">Прочетете повече</a></p>
${buildUnsubscribeFooterHtml(unsubscribeToken)}`;

    const text = `${title}\n\n${excerpt}\n\nПрочетете повече: ${newsUrl}${buildUnsubscribeFooterText(unsubscribeToken)}`;

    return { subject, html, text };
};

export const buildEventNotificationEmail = (params: EventNotificationParams): EmailTemplate => {
    const { title, date, location, description, eventUrl, unsubscribeToken } = params;

    const subject = `Предстоящо събитие: ${title}`;

    const locationHtml = location ? `<p><strong>Място:</strong> ${escapeHtml(location)}</p>` : '';
    const locationText = location ? `\nМясто: ${location}` : '';

    const html = `<h2>${escapeHtml(title)}</h2>
<p><strong>Дата:</strong> ${escapeHtml(date)}</p>
${locationHtml}<p>${escapeHtml(description)}</p>
<p><a href="${escapeHtml(eventUrl)}">Вижте детайлите</a></p>
${buildUnsubscribeFooterHtml(unsubscribeToken)}`;

    const text = `${title}\n\nДата: ${date}${locationText}\n\n${description}\n\nВижте детайлите: ${eventUrl}${buildUnsubscribeFooterText(unsubscribeToken)}`;

    return { subject, html, text };
};

export const buildDeadlineNotificationEmail = (params: DeadlineNotificationParams): EmailTemplate => {
    const { title, date, isUrgent, description, deadlineUrl, unsubscribeToken } = params;

    const subject = `Важен срок: ${title}`;

    const urgencyHtml = isUrgent ? `<p><strong>⚠️ СПЕШНО</strong></p>` : '';
    const urgencyText = isUrgent ? `\n⚠️ СПЕШНО` : '';

    const html = `<h2>${escapeHtml(title)}</h2>
<p><strong>Дата:</strong> ${escapeHtml(date)}</p>
${urgencyHtml}<p>${escapeHtml(description)}</p>
<p><a href="${escapeHtml(deadlineUrl)}">Вижте детайлите</a></p>
${buildUnsubscribeFooterHtml(unsubscribeToken)}`;

    const text = `${title}\n\nДата: ${date}${urgencyText}\n\n${description}\n\nВижте детайлите: ${deadlineUrl}${buildUnsubscribeFooterText(unsubscribeToken)}`;

    return { subject, html, text };
};
