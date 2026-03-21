import { Request, Response } from 'express';
import prisma from '../../../prisma/prisma-client';
import logger from '@utils/logger/winston/logger';
import { submitApplication } from '@schemas/application_schema';
import { sendApplicationEmail, sendConfirmationEmail } from '@services/email';

export const submitJobApplication = async (req: Request, res: Response) => {
    try {
        // 1. Validate body fields
        const parseResult = submitApplication.safeParse({ body: req.body });
        if (!parseResult.success) {
            const errors = parseResult.error.flatten().fieldErrors;
            return res.status(400).json({ status: 'fail', data: errors });
        }

        // 2. Verify CV file was uploaded
        if (!req.file) {
            return res.status(400).json({
                status: 'fail',
                data: { cv: ['CV файлът е задължителен'] },
            });
        }

        const { name, email, phone, coverLetter, jobId } = parseResult.data.body;

        // 3. Verify job exists, is accepting applications, and deadline has not passed
        const job = await prisma.job.findFirst({
            where: {
                id: jobId,
                status: 'PUBLISHED',
                isActive: true,
                OR: [
                    { applicationDeadline: null },
                    { applicationDeadline: { gte: new Date() } },
                ],
            },
            select: { id: true, title: true, contactEmail: true },
        });

        if (!job) {
            return res.status(404).json({
                status: 'fail',
                data: { message: 'Позицията не е намерена или не приема кандидатури.' },
            });
        }

        // 4. Send application email with CV attachment
        const emailSent = await sendApplicationEmail({
            jobTitle: job.title,
            contactEmail: job.contactEmail,
            applicantName: name,
            applicantEmail: email,
            applicantPhone: phone,
            coverLetter,
            cvBuffer: req.file.buffer,
            cvFilename: req.file.originalname,
        });

        logger.info(`Application for job ${jobId} (${job.title}) from ${email}`, {
            jobId,
            applicantEmail: email,
            applicantName: name,
            phone,
            cvFilename: req.file.originalname,
            cvSize: req.file.size,
            hasCoverLetter: !!coverLetter,
            emailSent,
            timestamp: new Date().toISOString(),
        });

        if (!emailSent) {
            return res.status(500).json({
                status: 'error',
                message: 'Възникна проблем. Моля, опитайте отново или се свържете директно.',
            });
        }

        // 5. Send confirmation email to applicant (non-blocking failure)
        const confirmationSent = await sendConfirmationEmail({
            jobTitle: job.title,
            applicantEmail: email,
            applicantName: name,
        }).catch((err) => {
            logger.warn(`Confirmation email dispatch threw: ${err}`);
            return false;
        });
        if (!confirmationSent) {
            logger.warn(`Confirmation email not sent to ${email} for job ${jobId}`);
        }

        return res.status(201).json({
            status: 'success',
            data: { message: 'Кандидатурата е изпратена успешно!' },
        });
    } catch (error: unknown) {
        logger.error(`Application submission error: ${error}`);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
