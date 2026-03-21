import moment from 'moment';
import config from '@config/email';
import createTransporter from '@utils/mailer/nodemailer/core/oauth_client';
import logger from '@utils/logger/winston/logger';

export interface ApplicationEmailParams {
    jobTitle: string;
    contactEmail: string;
    applicantName: string;
    applicantEmail: string;
    applicantPhone: string;
    coverLetter?: string;
    cvBuffer: Buffer;
    cvFilename: string;
}

const MAX_ATTEMPTS = 4; // 1 initial + 3 retries with delays of 1s, 2s, 4s (AC 6)
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const escapeHtml = (str: string): string =>
    str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const buildHtmlBody = (params: ApplicationEmailParams): string => {
    const { jobTitle, applicantName, applicantEmail, applicantPhone, coverLetter } = params;
    const formattedDate = moment().format('DD.MM.YYYY HH:mm');

    const safeName = escapeHtml(applicantName);
    const safeEmail = escapeHtml(applicantEmail);
    const safePhone = escapeHtml(applicantPhone);
    const safeTitle = escapeHtml(jobTitle);
    const safeCoverLetter = coverLetter
        ? escapeHtml(coverLetter).replace(/\n/g, '<br>')
        : null;

    return `
<h2>Нова кандидатура за позиция: ${safeTitle}</h2>
<p><strong>Кандидат:</strong> ${safeName}</p>
<p><strong>Имейл:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
<p><strong>Телефон:</strong> ${safePhone}</p>
${safeCoverLetter ? `<p><strong>Мотивационно писмо:</strong></p><p>${safeCoverLetter}</p>` : ''}
<p><strong>Дата на кандидатстване:</strong> ${formattedDate}</p>
<hr>
<p><em>CV е прикачено като PDF файл.</em></p>
`;
};

export const sendApplicationEmail = async (params: ApplicationEmailParams): Promise<boolean> => {
    const { jobTitle, contactEmail, cvBuffer, cvFilename } = params;

    const emailTransporter = await createTransporter();
    if (!emailTransporter) {
        logger.error('sendApplicationEmail: nodemailer transporter unavailable');
        return false;
    }

    const mailOptions = {
        from: config.smtp.user,
        to: contactEmail,
        subject: `Нова кандидатура за: ${jobTitle}`,
        html: buildHtmlBody(params),
        attachments: [
            {
                filename: cvFilename,
                content: cvBuffer,
                contentType: 'application/pdf',
            },
        ],
    };

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            await emailTransporter.sendMail(mailOptions);
            logger.info(`Application email sent successfully on attempt ${attempt}`, {
                contactEmail,
                jobTitle,
            });
            return true;
        } catch (err) {
            logger.warn(`Email send attempt ${attempt}/${MAX_ATTEMPTS} failed: ${err}`);
            if (attempt < MAX_ATTEMPTS) {
                await sleep(1000 * Math.pow(2, attempt - 1));
            }
        }
    }

    logger.error(`All ${MAX_ATTEMPTS} email send attempts failed for ${contactEmail}`, {
        jobTitle,
        contactEmail,
    });
    return false;
};
