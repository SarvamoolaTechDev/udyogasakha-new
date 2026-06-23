import { PrismaService } from '../../prisma/prisma.service';
export interface AuditLogParams {
    entityType: string;
    entityId: string;
    action: string;
    actorId?: string;
    actorEmail?: string;
    oldState?: Record<string, any>;
    newState?: Record<string, any>;
    metadata?: Record<string, any>;
}
export declare class AuditService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    /**
     * Append an immutable audit entry.
     * Failures are caught and logged — a failed audit write must never
     * cause the originating operation to fail.
     */
    log(params: AuditLogParams): Promise<void>;
    /**
     * All audit entries for a specific entity (e.g. all events on listing X).
     * Returns newest-first, paginated.
     */
    getForEntity(entityType: string, entityId: string, rawPage?: string, rawLimit?: string): Promise<import("../../common/pagination").Paginated<{
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
    /**
     * All audit entries performed by a specific actor (e.g. all actions by moderator X).
     * Returns newest-first, paginated.
     */
    getForActor(actorId: string, rawPage?: string, rawLimit?: string): Promise<import("../../common/pagination").Paginated<{
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
    /**
     * Recent platform-wide audit entries, useful for the admin dashboard.
     */
    getRecent(rawPage?: string, rawLimit?: string): Promise<import("../../common/pagination").Paginated<{
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
