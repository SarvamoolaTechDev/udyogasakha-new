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
    submit(reporterId: string, dto: SubmitReportDto): unknown;
    getMyReports(reporterId: string): unknown;
    getPending(rawPage?: string, rawLimit?: string): unknown;
    resolve(id: string, modId: string, dto: ResolveReportDto): unknown;
    dismiss(id: string, modId: string, dto: ResolveReportDto): unknown;
}
export declare class ReportsController {
    private readonly svc;
    constructor(svc: ReportsService);
    submit(userId: string, dto: SubmitReportDto): unknown;
    getMy(userId: string): unknown;
    getPending(page?: string, limit?: string): unknown;
    resolve(id: string, modId: string, dto: ResolveReportDto): unknown;
    dismiss(id: string, modId: string, dto: ResolveReportDto): unknown;
}
export declare class ReportsModule {
}
export {};
