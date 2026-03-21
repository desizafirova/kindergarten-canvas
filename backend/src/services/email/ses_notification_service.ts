import { SESClient, SendEmailCommand, GetSendQuotaCommand } from '@aws-sdk/client-ses';
import logger from '@utils/logger/winston/logger';

export interface SesEmailParams {
    to: string;
    subject: string;
    html: string;
    text: string;
}

const sesClient = new SESClient({
    region: process.env.AWS_SES_REGION ?? 'eu-central-1',
    credentials: {
        accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY ?? '',
    },
});

const MAX_ATTEMPTS = 4; // 1 initial + 3 retries with delays of 1s, 2s, 4s
const MAX_PER_SECOND = 14; // SES sandbox rate limit

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const verifySesConnection = async (): Promise<void> => {
    try {
        const command = new GetSendQuotaCommand({});
        const result = await sesClient.send(command);
        logger.info('AWS SES connection verified', {
            max24HourSend: result.Max24HourSend,
            sentLast24Hours: result.SentLast24Hours,
        });
    } catch (err: unknown) {
        logger.error('AWS SES connection failed', {
            error: err instanceof Error ? err.message : String(err),
        });
    }
};

export const sendSesEmail = async (params: SesEmailParams): Promise<boolean> => {
    const { to, subject, html, text } = params;
    const recipientDomain = to.split('@')[1] ?? 'unknown';

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            const command = new SendEmailCommand({
                Source: process.env.AWS_SES_FROM_EMAIL,
                Destination: {
                    ToAddresses: [to],
                },
                Message: {
                    Subject: {
                        Data: subject,
                        Charset: 'UTF-8',
                    },
                    Body: {
                        Html: {
                            Data: html,
                            Charset: 'UTF-8',
                        },
                        Text: {
                            Data: text,
                            Charset: 'UTF-8',
                        },
                    },
                },
            });

            await sesClient.send(command);
            logger.info(`SES email sent successfully on attempt ${attempt}`, {
                attempt,
                recipientDomain,
            });
            return true;
        } catch (err) {
            logger.warn(`SES email send attempt ${attempt}/${MAX_ATTEMPTS} failed: ${err}`);
            if (attempt < MAX_ATTEMPTS) {
                await sleep(1000 * Math.pow(2, attempt - 1));
            }
        }
    }

    logger.error('SES email delivery failed after all attempts', {
        failedEmail: true,
        recipientDomain,
        subject,
        attempts: MAX_ATTEMPTS,
        timestamp: new Date().toISOString(),
    });
    return false;
};

export const sendBulkNotifications = async (
    recipients: string[],
    buildEmail: (to: string) => SesEmailParams,
): Promise<{ sent: number; failed: number }> => {
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < recipients.length; i += MAX_PER_SECOND) {
        const chunk = recipients.slice(i, i + MAX_PER_SECOND);
        const results = await Promise.all(chunk.map((to) => sendSesEmail(buildEmail(to))));
        sent += results.filter(Boolean).length;
        failed += results.filter((r) => !r).length;
        if (i + MAX_PER_SECOND < recipients.length) {
            await sleep(1000);
        }
    }

    logger.info('Bulk notification batch complete', {
        total: recipients.length,
        sent,
        failed,
    });

    return { sent, failed };
};
