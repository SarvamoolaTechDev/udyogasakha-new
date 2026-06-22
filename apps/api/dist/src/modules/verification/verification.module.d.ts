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
    requestVerification(userId: string, dto: RequestVerificationDto): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.VerificationStatus;
        reviewedAt: Date | null;
        userId: string;
        documentIds: string[];
        reviewNote: string | null;
        reviewerId: string | null;
    }>;
    getMyRequests(userId: string): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.VerificationStatus;
        reviewedAt: Date | null;
        userId: string;
        documentIds: string[];
        reviewNote: string | null;
        reviewerId: string | null;
    }[]>;
    getPending(rawPage?: string, rawLimit?: string): Promise<import("../../common/pagination").Paginated<{
        user: {
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.VerificationStatus;
        reviewedAt: Date | null;
        userId: string;
        documentIds: string[];
        reviewNote: string | null;
        reviewerId: string | null;
    }>>;
    approve(id: string, modId: string, dto: ReviewVerificationDto): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.VerificationStatus;
        reviewedAt: Date | null;
        userId: string;
        documentIds: string[];
        reviewNote: string | null;
        reviewerId: string | null;
    }>;
    reject(id: string, modId: string, dto: ReviewVerificationDto): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.VerificationStatus;
        reviewedAt: Date | null;
        userId: string;
        documentIds: string[];
        reviewNote: string | null;
        reviewerId: string | null;
    }>;
}
export declare class VerificationController {
    private readonly svc;
    constructor(svc: VerificationService);
    request(userId: string, dto: RequestVerificationDto): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.VerificationStatus;
        reviewedAt: Date | null;
        userId: string;
        documentIds: string[];
        reviewNote: string | null;
        reviewerId: string | null;
    }>;
    getMy(userId: string): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.VerificationStatus;
        reviewedAt: Date | null;
        userId: string;
        documentIds: string[];
        reviewNote: string | null;
        reviewerId: string | null;
    }[]>;
    getPending(page?: string, limit?: string): Promise<import("../../common/pagination").Paginated<{
        user: {
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.VerificationStatus;
        reviewedAt: Date | null;
        userId: string;
        documentIds: string[];
        reviewNote: string | null;
        reviewerId: string | null;
    }>>;
    approve(id: string, modId: string, dto: ReviewVerificationDto): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.VerificationStatus;
        reviewedAt: Date | null;
        userId: string;
        documentIds: string[];
        reviewNote: string | null;
        reviewerId: string | null;
    }>;
    reject(id: string, modId: string, dto: ReviewVerificationDto): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.VerificationStatus;
        reviewedAt: Date | null;
        userId: string;
        documentIds: string[];
        reviewNote: string | null;
        reviewerId: string | null;
    }>;
}
export declare class VerificationModule {
}
export {};
