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
        email: string;
        phone: string;
        roles: import(".prisma/client").$Enums.UserRole[];
        city: string;
        updatedAt: Date;
    }>;
    updateMe(id: string, dto: UpdateUserDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        email: string;
        phone: string;
        roles: import(".prisma/client").$Enums.UserRole[];
        city: string;
        updatedAt: Date;
    }>;
    findAll(search?: string, rawPage?: string, rawLimit?: string): Promise<import("../../common/pagination").Paginated<{
        name: string;
        id: string;
        createdAt: Date;
        email: string;
        phone: string;
        roles: import(".prisma/client").$Enums.UserRole[];
        city: string;
        updatedAt: Date;
    }>>;
    findById(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        email: string;
        phone: string;
        roles: import(".prisma/client").$Enums.UserRole[];
        city: string;
        updatedAt: Date;
        profiles: {
            roleType: import(".prisma/client").$Enums.RoleType;
            status: import(".prisma/client").$Enums.ProfileStatus;
            submittedAt: Date;
        }[];
    }>;
}
