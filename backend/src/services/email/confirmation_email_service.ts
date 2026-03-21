import config from '@config/email';
import createTransporter from '@utils/mailer/nodemailer/core/oauth_client';
import logger from '@utils/logger/winston/logger';

export interface ConfirmationEmailParams {
    jobTitle: string;
    applicantEmail: string;
    applicantName: string;
}

const MAX_ATTEMPTS = 3; // 1 initial + 2 retries with delays 1s, 2s (AC 4)
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const escapeHtml = (str: string): string =>
    str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const buildConfirmationHtml = (params: ConfirmationEmailParams, fromEmail: string, kindergartenName: string): string => {
    const { jobTitle, applicantName } = params;

    const safeName = escapeHtml(applicantName);
    const safeTitle = escapeHtml(jobTitle);
    const safeFrom = escapeHtml(fromEmail);
    const safeKindergartenName = escapeHtml(kindergartenName);

    return `
<h2>Потвърждение за получена кандидатура</h2>
<p>Уважаем/а ${safeName},</p>
<p>Благодарим ви за кандидатурата за позицията <strong>${safeTitle}</strong>!</p>
<p>Вашето CV беше получено успешно.</p>
<p>Ще се свържем с вас, ако профилът ви отговаря на изискванията ни.</p>
<hr>
<p>С уважение,<br>${safeKindergartenName}</p>
<p>За контакт: <a href="mailto:${safeFrom}">${safeFrom}</a></p>
`;
};

export const sendConfirmationEmail = async (params: ConfirmationEmailParams): Promise<boolean> => {
    const { jobTitle, applicantEmail } = params;
    const kindergartenName = process.env.KINDERGARTEN_NAME ?? 'Детска Градина';
    const emailTransporter = await createTransporter();
    if (!emailTransporter) {
        logger.error('sendConfirmationEmail: nodemailer transporter unavailable');
        return false;
    }

    const fromEmail = config.smtp.user;
    const mailOptions = {
        from: fromEmail,
        to: applicantEmail,
        subject: `Потвърждение за кандидатура - ${kindergartenName}`,
        html: buildConfirmationHtml(params, fromEmail, kindergartenName),
    };

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            await emailTransporter.sendMail(mailOptions);
            logger.info(`Confirmation email sent successfully on attempt ${attempt}`, {
                applicantEmail,
                jobTitle,
            });
            return true;
        } catch (err) {
            logger.warn(`Confirmation email send attempt ${attempt}/${MAX_ATTEMPTS} failed: ${err}`);
            if (attempt < MAX_ATTEMPTS) {
                await sleep(1000 * Math.pow(2, attempt - 1));
            }
        }
    }

    logger.error(`All ${MAX_ATTEMPTS} confirmation email attempts failed for ${applicantEmail}`, {
        applicantEmail,
        jobTitle,
    });
    return false;
};
