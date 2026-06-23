import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ReportSubjectType } from '@prisma/client';
declare class SubmitReportDto {
    subjectType: ReportSubjectType;
    subjectId: string;
    reason: string;
    detail?: string;
}
declare class ResolveReportDto {
    resolution: string;
}
export declare class ReportsService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    submit(reporterId: string, dto: SubmitReportDto): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ReportStatus;
        reason: string;
        subjectType: import(".prisma/client").$Enums.ReportSubjectType;
        subjectId: string;
        detail: string | null;
        resolution: string | null;
        resolvedAt: Date | null;
        reporterId: string;
        resolvedBy: string | null;
    }>;
    getMyReports(reporterId: string): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ReportStatus;
        reason: string;
        subjectType: import(".prisma/client").$Enums.ReportSubjectType;
        subjectId: string;
        detail: string | null;
        resolution: string | null;
        resolvedAt: Date | null;
        reporterId: string;
        resolvedBy: string | null;
    }[]>;
    getPending(rawPage?: string, rawLimit?: string): Promise<import("../../common/pagination").Paginated<{
        reporter: {
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ReportStatus;
        reason: string;
        subjectType: import(".prisma/client").$Enums.ReportSubjectType;
        subjectId: string;
        detail: string | null;
        resolution: string | null;
        resolvedAt: Date | null;
        reporterId: string;
        resolvedBy: string | null;
    }>>;
    resolve(id: string, modId: string, dto: ResolveReportDto): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ReportStatus;
        reason: string;
        subjectType: import(".prisma/client").$Enums.ReportSubjectType;
        subjectId: string;
        detail: string | null;
        resolution: string | null;
        resolvedAt: Date | null;
        reporterId: string;
        resolvedBy: string | null;
    }>;
    dismiss(id: string, modId: string, dto: ResolveReportDto): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ReportStatus;
        reason: string;
        subjectType: import(".prisma/client").$Enums.ReportSubjectType;
        subjectId: string;
        detail: string | null;
        resolution: string | null;
        resolvedAt: Date | null;
        reporterId: string;
        resolvedBy: string | null;
    }>;
}
export declare class ReportsController {
    private readonly svc;
    constructor(svc: ReportsService);
    submit(userId: string, dto: SubmitReportDto): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ReportStatus;
        reason: string;
        subjectType: import(".prisma/client").$Enums.ReportSubjectType;
        subjectId: string;
        detail: string | null;
        resolution: string | null;
        resolvedAt: Date | null;
        reporterId: string;
        resolvedBy: string | null;
    }>;
    getMy(userId: string): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ReportStatus;
        reason: string;
        subjectType: import(".prisma/client").$Enums.ReportSubjectType;
        subjectId: string;
        detail: string | null;
        resolution: string | null;
        resolvedAt: Date | null;
        reporterId: string;
        resolvedBy: string | null;
    }[]>;
    getPending(page?: string, limit?: string): Promise<import("../../common/pagination").Paginated<{
        reporter: {
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ReportStatus;
        reason: string;
        subjectType: import(".prisma/client").$Enums.ReportSubjectType;
        subjectId: string;
        detail: string | null;
        resolution: string | null;
        resolvedAt: Date | null;
        reporterId: string;
        resolvedBy: string | null;
    }>>;
    resolve(id: string, modId: string, dto: ResolveReportDto): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ReportStatus;
        reason: string;
        subjectType: import(".prisma/client").$Enums.ReportSubjectType;
        subjectId: string;
        detail: string | null;
        resolution: string | null;
        resolvedAt: Date | null;
        reporterId: string;
        resolvedBy: string | null;
    }>;
    dismiss(id: string, modId: string, dto: ResolveReportDto): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ReportStatus;
        reason: string;
        subjectType: import(".prisma/client").$Enums.ReportSubjectType;
        subjectId: string;
        detail: string | null;
        resolution: string | null;
        resolvedAt: Date | null;
        reporterId: string;
        resolvedBy: string | null;
    }>;
}
export declare class ReportsModule {
}
export {};
