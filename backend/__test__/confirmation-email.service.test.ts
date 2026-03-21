import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Declare typed mocks before any module mock calls
const mockSendMail = jest.fn() as jest.Mock<any>;
const mockTransporter = jest.fn() as jest.Mock<any>;

jest.mock('../src/utils/mailer/nodemailer/core/oauth_client', () => mockTransporter);
jest.mock('../src/utils/logger/winston/logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}));
jest.mock('../src/config/email', () => ({
    smtp: { user: 'test@kindergarten.bg' },
}));

import { sendConfirmationEmail, ConfirmationEmailParams } from '../src/services/email/confirmation_email_service';
import logger from '../src/utils/logger/winston/logger';

const makeParams = (overrides: Partial<ConfirmationEmailParams> = {}): ConfirmationEmailParams => ({
    jobTitle: 'Учител',
    applicantEmail: 'applicant@test.bg',
    applicantName: 'Иван Иванов',
    ...overrides,
});

// Make setTimeout invoke its callback immediately to avoid real delays in retry tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let setTimeoutSpy: any;

describe('sendConfirmationEmail', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation((fn: any) => {
            fn();
            return 0 as any;
        });
    });

    afterEach(() => {
        setTimeoutSpy.mockRestore();
    });

    it('returns true when sendMail succeeds on the first attempt', async () => {
        mockTransporter.mockResolvedValue({ sendMail: mockSendMail.mockResolvedValue({}) });

        const result = await sendConfirmationEmail(makeParams());

        expect(result).toBe(true);
        expect(mockSendMail).toHaveBeenCalledTimes(1);
        expect(logger.info).toHaveBeenCalled();
    });

    it('sends email to applicantEmail with correct subject including kindergarten name', async () => {
        mockTransporter.mockResolvedValue({ sendMail: mockSendMail.mockResolvedValue({}) });
        process.env.KINDERGARTEN_NAME = 'Тест Градина';

        await sendConfirmationEmail(makeParams({ jobTitle: 'Готвач' }));

        const callArgs = mockSendMail.mock.calls[0][0] as any;
        expect(callArgs.to).toBe('applicant@test.bg');
        expect(callArgs.subject).toBe('Потвърждение за кандидатура - Тест Градина');

        delete process.env.KINDERGARTEN_NAME;
    });

    it('includes applicant name and job title in HTML body (HTML-escaped)', async () => {
        mockTransporter.mockResolvedValue({ sendMail: mockSendMail.mockResolvedValue({}) });

        await sendConfirmationEmail(
            makeParams({
                applicantName: 'Мария <Петрова>',
                jobTitle: 'Учител & Педагог',
            }),
        );

        const callArgs = mockSendMail.mock.calls[0][0] as any;
        expect(callArgs.html).toContain('Мария &lt;Петрова&gt;');
        expect(callArgs.html).toContain('Учител &amp; Педагог');
        expect(callArgs.html).toContain('Потвърждение за получена кандидатура');
        expect(callArgs.html).toContain('Вашето CV беше получено успешно.');
    });

    it('returns true when fails first attempt but succeeds second (retry)', async () => {
        mockTransporter.mockResolvedValue({
            sendMail: (mockSendMail as jest.Mock<any>)
                .mockRejectedValueOnce(new Error('SMTP timeout') as any)
                .mockResolvedValueOnce({} as any),
        });

        const result = await sendConfirmationEmail(makeParams());

        expect(result).toBe(true);
        expect(mockSendMail).toHaveBeenCalledTimes(2);
        expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('attempt 1/3 failed'));
    });

    it('returns false after all 3 attempts fail and logs error with applicantEmail context', async () => {
        mockTransporter.mockResolvedValue({
            sendMail: mockSendMail.mockRejectedValue(new Error('SMTP error') as any),
        });

        const result = await sendConfirmationEmail(makeParams({ applicantEmail: 'fail@test.bg' }));

        expect(result).toBe(false);
        expect(mockSendMail).toHaveBeenCalledTimes(3);
        expect(logger.error).toHaveBeenCalledWith(
            expect.stringContaining('All 3 confirmation email attempts failed for fail@test.bg'),
            expect.objectContaining({ applicantEmail: 'fail@test.bg' }),
        );
    });

    it('returns false immediately when transporter is unavailable', async () => {
        mockTransporter.mockResolvedValue(undefined as any);

        const result = await sendConfirmationEmail(makeParams());

        expect(result).toBe(false);
        expect(mockSendMail).not.toHaveBeenCalled();
        expect(logger.error).toHaveBeenCalledWith(
            expect.stringContaining('transporter unavailable'),
        );
    });

    it('uses fallback kindergarten name when KINDERGARTEN_NAME env is not set', async () => {
        mockTransporter.mockResolvedValue({ sendMail: mockSendMail.mockResolvedValue({}) });
        delete process.env.KINDERGARTEN_NAME;

        await sendConfirmationEmail(makeParams());

        const callArgs = mockSendMail.mock.calls[0][0] as any;
        expect(callArgs.subject).toBe('Потвърждение за кандидатура - Детска Градина');
        expect(callArgs.html).toContain('Детска Градина');
    });
});
