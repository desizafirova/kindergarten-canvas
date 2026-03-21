import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Declare typed mocks before any module mock calls
const mockSend = jest.fn() as jest.Mock<any>;

jest.mock('@aws-sdk/client-ses', () => ({
    SESClient: jest.fn(() => ({ send: mockSend })),
    SendEmailCommand: jest.fn((input: any) => ({ input })),
    GetSendQuotaCommand: jest.fn(() => ({})),
}));
jest.mock('../src/utils/logger/winston/logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}));

import { sendSesEmail, sendBulkNotifications, verifySesConnection, SesEmailParams } from '../src/services/email/ses_notification_service';
import logger from '../src/utils/logger/winston/logger';

const makeParams = (overrides: Partial<SesEmailParams> = {}): SesEmailParams => ({
    to: 'parent@example.bg',
    subject: 'Тест тема',
    html: '<p>HTML съдържание</p>',
    text: 'Plain text съдържание',
    ...overrides,
});

// Make setTimeout execute its callback immediately (eliminates retry delays in tests)
const makeSleepInstant = () =>
    jest.spyOn(global, 'setTimeout').mockImplementation((fn: any) => {
        fn();
        return null as any;
    });

describe('sendSesEmail', () => {
    let restoreTimeout: ReturnType<typeof jest.spyOn> | undefined;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        restoreTimeout?.mockRestore();
        restoreTimeout = undefined;
    });

    it('returns true when SES send succeeds on first attempt', async () => {
        mockSend.mockResolvedValueOnce({});

        const result = await sendSesEmail(makeParams());

        expect(result).toBe(true);
        expect(mockSend).toHaveBeenCalledTimes(1);
        expect(logger.info).toHaveBeenCalled();
    });

    it('sends to correct to address with correct subject', async () => {
        mockSend.mockResolvedValueOnce({});

        await sendSesEmail(makeParams({ to: 'test@school.bg', subject: 'Важно съобщение' }));

        const callArg = mockSend.mock.calls[0][0] as any;
        expect(callArg.input.Destination.ToAddresses).toContain('test@school.bg');
        expect(callArg.input.Message.Subject.Data).toBe('Важно съобщение');
    });

    it('passes both HTML and plain text body fields in the command', async () => {
        mockSend.mockResolvedValueOnce({});

        await sendSesEmail(makeParams({ html: '<b>Заглавие</b>', text: 'Заглавие' }));

        const callArg = mockSend.mock.calls[0][0] as any;
        expect(callArg.input.Message.Body.Html.Data).toBe('<b>Заглавие</b>');
        expect(callArg.input.Message.Body.Text.Data).toBe('Заглавие');
    });

    it('retries on failure and succeeds on 2nd attempt, returns true, calls logger.warn once', async () => {
        restoreTimeout = makeSleepInstant();
        mockSend
            .mockRejectedValueOnce(new Error('SES timeout') as any)
            .mockResolvedValueOnce({} as any);

        const result = await sendSesEmail(makeParams());

        expect(result).toBe(true);
        expect(mockSend).toHaveBeenCalledTimes(2);
        expect(logger.warn).toHaveBeenCalledTimes(1);
        expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('attempt 1/4 failed'));
    });

    it('returns false after all 4 attempts fail and calls logger.error with failedEmail: true', async () => {
        restoreTimeout = makeSleepInstant();
        mockSend.mockRejectedValue(new Error('SES error') as any);

        const result = await sendSesEmail(makeParams());

        expect(result).toBe(false);
        expect(mockSend).toHaveBeenCalledTimes(4);
        expect(logger.error).toHaveBeenCalledWith(
            'SES email delivery failed after all attempts',
            expect.objectContaining({ failedEmail: true }),
        );
    });
});

describe('sendBulkNotifications', () => {
    let restoreTimeout: ReturnType<typeof jest.spyOn> | undefined;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        restoreTimeout?.mockRestore();
        restoreTimeout = undefined;
    });

    it('returns correct { sent, failed } counts for mixed results', async () => {
        restoreTimeout = makeSleepInstant();
        // First call succeeds, subsequent calls fail (all retries exhausted)
        mockSend
            .mockResolvedValueOnce({} as any)
            .mockRejectedValue(new Error('fail') as any);

        const recipients = ['a@test.bg', 'b@test.bg', 'c@test.bg'];
        const buildEmail = (to: string): SesEmailParams => makeParams({ to });

        const result = await sendBulkNotifications(recipients, buildEmail);

        expect(result.sent + result.failed).toBe(3);
        expect(result.sent).toBe(1);
        expect(result.failed).toBe(2);
        expect(logger.info).toHaveBeenCalledWith(
            'Bulk notification batch complete',
            expect.objectContaining({ total: 3, sent: 1, failed: 2 }),
        );
    });

    it('returns { sent: 0, failed: 0 } for empty recipients list', async () => {
        const result = await sendBulkNotifications([], () => makeParams());

        expect(result).toEqual({ sent: 0, failed: 0 });
        expect(mockSend).not.toHaveBeenCalled();
        expect(logger.info).toHaveBeenCalledWith(
            'Bulk notification batch complete',
            expect.objectContaining({ total: 0, sent: 0, failed: 0 }),
        );
    });
});

describe('verifySesConnection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('logs success when GetSendQuotaCommand resolves', async () => {
        mockSend.mockResolvedValueOnce({ Max24HourSend: 200, SentLast24Hours: 5 });

        await verifySesConnection();

        expect(logger.info).toHaveBeenCalledWith(
            'AWS SES connection verified',
            expect.objectContaining({ max24HourSend: 200, sentLast24Hours: 5 }),
        );
        expect(logger.error).not.toHaveBeenCalled();
    });

    it('logs error without throwing when GetSendQuotaCommand rejects', async () => {
        mockSend.mockRejectedValueOnce(new Error('InvalidClientTokenId') as any);

        await expect(verifySesConnection()).resolves.toBeUndefined();

        expect(logger.error).toHaveBeenCalledWith(
            'AWS SES connection failed',
            expect.objectContaining({ error: 'InvalidClientTokenId' }),
        );
        expect(logger.info).not.toHaveBeenCalled();
    });
});
