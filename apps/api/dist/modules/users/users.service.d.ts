import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/user.dto';
import { AuditService } from '../audit/audit.service';
export declare class UsersService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    getMe(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        email: string;
        city: string;
        roles: import(".prisma/client").$Enums.UserRole[];
    }>;
    updateMe(id: string, dto: UpdateUserDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        email: string;
        city: string;
        roles: import(".prisma/client").$Enums.UserRole[];
    }>;
    findAll(search?: string, rawPage?: string, rawLimit?: string): Promise<import("../../common/pagination").Paginated<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        email: string;
        city: string;
        roles: import(".prisma/client").$Enums.UserRole[];
    }>>;
    findById(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        email: string;
        city: string;
        roles: import(".prisma/client").$Enums.UserRole[];
        profiles: {
            status: import(".prisma/client").$Enums.ProfileStatus;
            roleType: import(".prisma/client").$Enums.RoleType;
            submittedAt: Date;
        }[];
    }>;
}
