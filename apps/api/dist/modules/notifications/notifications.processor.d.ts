import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../common/email/email.service';
export declare class NotificationsProcessor {
    private readonly prisma;
    private readonly email;
    private readonly logger;
    constructor(prisma: PrismaService, email: EmailService);
    /**
     * Write the in-app notification row to the database.
     * Runs asynchronously — the HTTP response has already been sent.
     */
    handleInApp(job: Job<{
        userId: string;
        subject: string;
        body: string;
        link: string | null;
    }>): Promise<void>;
    /**
     * Sends the email via Azure Communication Service.
     * If ACS isn't configured, EmailService logs it instead — see EmailService
     * for that fallback behaviour.
     */
    handleEmail(job: Job<{
        to: string;
        subject: string;
        body: string;
    }>): Promise<void>;
    /**
     * SMS stub — logs to console.
     * Replace the logger.log() call with your MSG91 / Twilio client when ready.
     */
    handleSms(job: Job<{
        to: string;
        body: string;
    }>): Promise<void>;
}
