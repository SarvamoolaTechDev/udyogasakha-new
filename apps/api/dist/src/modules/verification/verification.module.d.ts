import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
declare class RequestVerificationDto {
    documentIds: string[];
}
declare class ReviewVerificationDto {
    reviewNote: string;
}
export declare class VerificationService {
    private readonly prisma;
    private readonly audit;
    private readonly notify;
    constructor(prisma: PrismaService, audit: AuditService, notify: NotificationsService);
    requestVerification(userId: string, dto: RequestVerificationDto): unknown;
    getMyRequests(userId: string): unknown;
    getPending(rawPage?: string, rawLimit?: string): unknown;
    approve(id: string, modId: string, dto: ReviewVerificationDto): unknown;
    reject(id: string, modId: string, dto: ReviewVerificationDto): unknown;
}
export declare class VerificationController {
    private readonly svc;
    constructor(svc: VerificationService);
    request(userId: string, dto: RequestVerificationDto): unknown;
    getMy(userId: string): unknown;
    getPending(page?: string, limit?: string): unknown;
    approve(id: string, modId: string, dto: ReviewVerificationDto): unknown;
    reject(id: string, modId: string, dto: ReviewVerificationDto): unknown;
}
export declare class VerificationModule {
}
export {};
