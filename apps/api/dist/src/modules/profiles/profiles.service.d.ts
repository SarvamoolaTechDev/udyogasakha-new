import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UpsertProfileDto, AddExperienceDto } from './dto/profile.dto';
export declare class ProfilesService {
    private readonly prisma;
    private readonly audit;
    private readonly notify;
    constructor(prisma: PrismaService, audit: AuditService, notify: NotificationsService);
    upsert(userId: string, dto: UpsertProfileDto): unknown;
    getMyProfiles(userId: string): unknown;
    getMyByRole(userId: string, roleType: string): unknown;
    addExperience(userId: string, roleType: string, dto: AddExperienceDto): unknown;
    deleteExperience(userId: string, entryId: string): unknown;
    getPending(rawPage?: string, rawLimit?: string): unknown;
    getApproved(rawPage?: string, rawLimit?: string): unknown;
    getRejected(rawPage?: string, rawLimit?: string): unknown;
    approve(id: string, modId: string): unknown;
    reject(id: string, modId: string, reason: string): unknown;
    reactivate(id: string): unknown;
}
