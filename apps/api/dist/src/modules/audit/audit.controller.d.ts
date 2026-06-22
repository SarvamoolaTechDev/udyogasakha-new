import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly svc;
    constructor(svc: AuditService);
    getRecent(page?: string, limit?: string): Promise<import("../../common/pagination").Paginated<{
        id: string;
        entityType: string;
        entityId: string;
        action: string;
        actorId: string | null;
        actorEmail: string | null;
        oldState: import("@prisma/client/runtime/library").JsonValue | null;
        newState: import("@prisma/client/runtime/library").JsonValue | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        ts: Date;
    }>>;
    getForEntity(type: string, id: string, page?: string, limit?: string): Promise<import("../../common/pagination").Paginated<{
        id: string;
        entityType: string;
        entityId: string;
        action: string;
        actorId: string | null;
        actorEmail: string | null;
        oldState: import("@prisma/client/runtime/library").JsonValue | null;
        newState: import("@prisma/client/runtime/library").JsonValue | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        ts: Date;
    }>>;
    getForActor(actorId: string, page?: string, limit?: string): Promise<import("../../common/pagination").Paginated<{
        id: string;
        entityType: string;
        entityId: string;
        action: string;
        actorId: string | null;
        actorEmail: string | null;
        oldState: import("@prisma/client/runtime/library").JsonValue | null;
        newState: import("@prisma/client/runtime/library").JsonValue | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        ts: Date;
    }>>;
}
