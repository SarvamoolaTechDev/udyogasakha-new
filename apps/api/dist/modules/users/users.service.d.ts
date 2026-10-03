import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/user.dto';
import { AuditService } from '../audit/audit.service';
import { EmailService } from '../../common/email/email.service';
import { IStorageService } from '../../common/storage/storage.interface';
import { SearchService } from '../search/search.service';
export declare class UsersService {
    private readonly prisma;
    private readonly audit;
    private readonly email;
    private readonly search;
    private readonly storage;
    constructor(prisma: PrismaService, audit: AuditService, email: EmailService, search: SearchService, storage: IStorageService);
    getMe(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        email: string;
        city: string;
        roles: import("@prisma/client/runtime/library").JsonValue;
    }>;
    updateMe(id: string, dto: UpdateUserDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        email: string;
        city: string;
        roles: import("@prisma/client/runtime/library").JsonValue;
    }>;
    findAll(search?: string, rawPage?: string, rawLimit?: string): Promise<import("../../common/pagination").Paginated<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        email: string;
        city: string;
        roles: import("@prisma/client/runtime/library").JsonValue;
    }>>;
    findById(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        email: string;
        city: string;
        roles: import("@prisma/client/runtime/library").JsonValue;
        profiles: {
            status: import(".prisma/client").$Enums.ProfileStatus;
            roleType: import(".prisma/client").$Enums.RoleType;
            submittedAt: Date;
        }[];
    }>;
    /**
     * Shared cleanup for both self-delete and admin-delete: removes blob-stored
     * documents and search-index entries before the DB cascade runs. Payments
     * are intentionally left untouched (userId becomes null — see schema).
     */
    private cleanupBeforeDelete;
    /**
     * Self-service account deletion. Requires password confirmation.
     * Sends a farewell email, cleans up blobs/search index, then hard-deletes
     * the user row — cascading to every related table except Payment (SetNull).
     */
    deleteMe(userId: string, password: string): Promise<{
        message: string;
    }>;
    /**
     * Admin-initiated account deletion. ADMIN role only (enforced at controller).
     * Confirmation (typing the target's email) is enforced client-side; the
     * server trusts the admin's role for this action.
     */
    deleteByAdmin(targetUserId: string, adminId: string): Promise<{
        message: string;
    }>;
}
