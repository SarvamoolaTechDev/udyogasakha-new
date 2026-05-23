import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { parsePage, paginate } from '../../common/pagination';

export interface AuditLogParams {
  entityType: string;       // 'listing' | 'profile' | 'user' | 'auth'
  entityId:   string;       // UUID of the affected record
  action:     string;       // 'APPROVED' | 'REJECTED' | 'CREATED' | 'LOGIN' | 'REACTIVATED' etc.
  actorId?:   string;       // Who performed the action (undefined = system)
  actorEmail?: string;      // Denormalised email for human-readable audit views
  oldState?:  Record<string, any>;
  newState?:  Record<string, any>;
  metadata?:  Record<string, any>; // IP, rejection reason, etc.
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Append an immutable audit entry.
   * Failures are caught and logged — a failed audit write must never
   * cause the originating operation to fail.
   */
  async log(params: AuditLogParams): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          entityType: params.entityType,
          entityId:   params.entityId,
          action:     params.action,
          actorId:    params.actorId    ?? null,
          actorEmail: params.actorEmail ?? null,
          oldState:   params.oldState   ?? undefined,
          newState:   params.newState   ?? undefined,
          metadata:   params.metadata   ?? undefined,
        },
      });
    } catch (err) {
      // Log the failure but never propagate — audit must not break core flows
      this.logger.error(
        `Audit log write failed: ${params.entityType}/${params.entityId} ${params.action}`,
        err instanceof Error ? err.stack : String(err),
      );
    }
  }

  // ── Read endpoints — moderator / admin only ─────────────────────────────

  /**
   * All audit entries for a specific entity (e.g. all events on listing X).
   * Returns newest-first, paginated.
   */
  async getForEntity(entityType: string, entityId: string, rawPage?: string, rawLimit?: string) {
    const p = parsePage(rawPage, rawLimit, 100);
    const where = { entityType, entityId };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({ where, orderBy: { ts: 'desc' }, skip: p.skip, take: p.limit }),
      this.prisma.auditLog.count({ where }),
    ]);
    return paginate(data, total, p);
  }

  /**
   * All audit entries performed by a specific actor (e.g. all actions by moderator X).
   * Returns newest-first, paginated.
   */
  async getForActor(actorId: string, rawPage?: string, rawLimit?: string) {
    const p = parsePage(rawPage, rawLimit, 100);
    const where = { actorId };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({ where, orderBy: { ts: 'desc' }, skip: p.skip, take: p.limit }),
      this.prisma.auditLog.count({ where }),
    ]);
    return paginate(data, total, p);
  }

  /**
   * Recent platform-wide audit entries, useful for the admin dashboard.
   */
  async getRecent(rawPage?: string, rawLimit?: string) {
    const p = parsePage(rawPage, rawLimit, 50);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({ orderBy: { ts: 'desc' }, skip: p.skip, take: p.limit }),
      this.prisma.auditLog.count(),
    ]);
    return paginate(data, total, p);
  }
}
