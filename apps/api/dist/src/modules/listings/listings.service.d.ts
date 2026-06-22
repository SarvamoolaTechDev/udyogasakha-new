import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateListingDto } from './dto/listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
export declare class ListingsService {
    private readonly prisma;
    private readonly audit;
    private readonly notify;
    constructor(prisma: PrismaService, audit: AuditService, notify: NotificationsService);
    create(dto: CreateListingDto, userId: string): unknown;
    findAll(filters: {
        search?: string;
        role?: string;
        market?: string;
        mode?: string;
        paid?: string;
        cert?: string;
        page?: number;
        limit?: number;
    }): unknown;
    findById(id: string): unknown;
    findSimilar(id: string, role: string, limit?: number): unknown;
    findPending(rawPage?: string, rawLimit?: string): unknown;
    approve(id: string, moderatorId: string): unknown;
    update(id: string, userId: string, dto: UpdateListingDto): unknown;
    reject(id: string, moderatorId: string, reason: string): unknown;
}
