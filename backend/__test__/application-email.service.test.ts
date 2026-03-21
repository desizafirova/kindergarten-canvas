import { describe, it, expect, jest, beforeEach } from '@jest/globals';

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
jest.mock('moment', () => {
    const m: any = () => ({ format: () => '14.03.2026 10:00' });
    return m;
});

import { sendApplicationEmail, ApplicationEmailParams } from '../src/services/email/application_email_service';
import logger from '../src/utils/logger/winston/logger';

const makeParams = (overrides: Partial<ApplicationEmailParams> = {}): ApplicationEmailParams => ({
    jobTitle: 'Учител',
    contactEmail: 'hr@kindergarten.bg',
    applicantName: 'Иван Иванов',
    applicantEmail: 'ivan@test.bg',
    applicantPhone: '0888123456',
    cvBuffer: Buffer.from('%PDF-1.4 test'),
    cvFilename: 'cv-ivan.pdf',
    ...overrides,
});

describe('sendApplicationEmail', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns true when sendMail succeeds on the first attempt', async () => {
        mockTransporter.mockResolvedValue({ sendMail: mockSendMail.mockResolvedValue({}) });

        const result = await sendApplicationEmail(makeParams());

        expect(result).toBe(true);
        expect(mockSendMail).toHaveBeenCalledTimes(1);
        expect(logger.info).toHaveBeenCalled();
    });

    it('sends email to the job contactEmail with correct subject', async () => {
        mockTransporter.mockResolvedValue({ sendMail: mockSendMail.mockResolvedValue({}) });

        await sendApplicationEmail(makeParams({ jobTitle: 'Готвач', contactEmail: 'hr@kindergarten.bg' }));

        const callArgs = mockSendMail.mock.calls[0][0] as any;
        expect(callArgs.to).toBe('hr@kindergarten.bg');
        expect(callArgs.subject).toBe('Нова кандидатура за: Готвач');
    });

    it('attaches the CV buffer with correct filename and content type', async () => {
        mockTransporter.mockResolvedValue({ sendMail: mockSendMail.mockResolvedValue({}) });

        const cvBuffer = Buffer.from('%PDF-1.4 specific content');
        await sendApplicationEmail(makeParams({ cvBuffer, cvFilename: 'моето-cv.pdf' }));

        const callArgs = mockSendMail.mock.calls[0][0] as any;
        expect(callArgs.attachments).toHaveLength(1);
        expect(callArgs.attachments[0].filename).toBe('моето-cv.pdf');
        expect(callArgs.attachments[0].content).toBe(cvBuffer);
        expect(callArgs.attachments[0].contentType).toBe('application/pdf');
    });

    it('includes applicant details and formatted date in the HTML body', async () => {
        mockTransporter.mockResolvedValue({ sendMail: mockSendMail.mockResolvedValue({}) });

        await sendApplicationEmail(
            makeParams({
                applicantName: 'Мария Петрова',
                applicantEmail: 'maria@test.bg',
                applicantPhone: '0899999999',
                coverLetter: 'Искам да работя при вас.',
            }),
        );

        const callArgs = mockSendMail.mock.calls[0][0] as any;
        expect(callArgs.html).toContain('Мария Петрова');
        expect(callArgs.html).toContain('maria@test.bg');
        expect(callArgs.html).toContain('0899999999');
        expect(callArgs.html).toContain('Искам да работя при вас.');
        expect(callArgs.html).toContain('14.03.2026 10:00');
    });

    it('omits cover letter block when coverLetter is not provided', async () => {
        mockTransporter.mockResolvedValue({ sendMail: mockSendMail.mockResolvedValue({}) });

        await sendApplicationEmail(makeParams({ coverLetter: undefined }));

        const callArgs = mockSendMail.mock.calls[0][0] as any;
        expect(callArgs.html).not.toContain('Мотивационно писмо');
    });

    it('returns true when sendMail fails on first attempt but succeeds on second (retry)', async () => {
        jest.useFakeTimers();
        mockTransporter.mockResolvedValue({
            sendMail: (mockSendMail as jest.Mock<any>)
                .mockRejectedValueOnce(new Error('SMTP timeout') as any)
                .mockResolvedValueOnce({} as any),
        });

        const resultPromise = sendApplicationEmail(makeParams());
        await jest.runAllTimersAsync();
        const result = await resultPromise;
        jest.useRealTimers();

        expect(result).toBe(true);
        expect(mockSendMail).toHaveBeenCalledTimes(2);
        expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('attempt 1/4 failed'));
    });

    it('returns false after all 4 attempts fail and logs an error', async () => {
        jest.useFakeTimers();
        mockTransporter.mockResolvedValue({
            sendMail: mockSendMail.mockRejectedValue(new Error('SMTP error') as any),
        });

        const resultPromise = sendApplicationEmail(makeParams());
        await jest.runAllTimersAsync();
        const result = await resultPromise;
        jest.useRealTimers();

        expect(result).toBe(false);
        expect(mockSendMail).toHaveBeenCalledTimes(4);
        expect(logger.error).toHaveBeenCalledWith(
            expect.stringContaining('All 4 email send attempts failed'),
            expect.any(Object),
        );
    });

    it('returns false immediately when transporter is unavailable', async () => {
        mockTransporter.mockResolvedValue(undefined as any);

        const result = await sendApplicationEmail(makeParams());

        expect(result).toBe(false);
        expect(mockSendMail).not.toHaveBeenCalled();
        expect(logger.error).toHaveBeenCalledWith(
            expect.stringContaining('transporter unavailable'),
        );
    });
});
