import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly svc;
    constructor(svc: AuditService);
    getRecent(page?: string, limit?: string): unknown;
    getForEntity(type: string, id: string, page?: string, limit?: string): unknown;
    getForActor(actorId: string, page?: string, limit?: string): unknown;
}
