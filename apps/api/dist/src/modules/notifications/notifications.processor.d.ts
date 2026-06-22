import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
export declare class NotificationsProcessor {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    /**
     * Write the in-app notification row to the database.
     * Runs asynchronously — the HTTP response has already been sent.
     */
    handleInApp(job: Job<{
        userId: string;
        subject: string;
        body: string;
        link: string | null;
    }>): any;
    /**
     * Email stub — logs to console.
     * Replace the logger.log() call with your SMTP/SES client when ready.
     */
    handleEmail(job: Job<{
        to: string;
        subject: string;
        body: string;
    }>): any;
    /**
     * SMS stub — logs to console.
     * Replace the logger.log() call with your MSG91 / Twilio client when ready.
     */
    handleSms(job: Job<{
        to: string;
        body: string;
    }>): any;
}
