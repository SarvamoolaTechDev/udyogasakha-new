import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/user.dto';
import { AuditService } from '../audit/audit.service';
export declare class UsersService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    getMe(id: string): Promise<{
        id: string;
        email: string;
        phone: string;
        name: string;
        roles: import(".prisma/client").$Enums.UserRole[];
        city: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateMe(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        phone: string;
        name: string;
        roles: import(".prisma/client").$Enums.UserRole[];
        city: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(search?: string, rawPage?: string, rawLimit?: string): Promise<import("../../common/pagination").Paginated<{
        id: string;
        email: string;
        phone: string;
        name: string;
        roles: import(".prisma/client").$Enums.UserRole[];
        city: string;
        createdAt: Date;
        updatedAt: Date;
    }>>;
    findById(id: string): Promise<{
        id: string;
        email: string;
        phone: string;
        name: string;
        roles: import(".prisma/client").$Enums.UserRole[];
        city: string;
        createdAt: Date;
        updatedAt: Date;
        profiles: {
            status: import(".prisma/client").$Enums.ProfileStatus;
            roleType: import(".prisma/client").$Enums.RoleType;
            submittedAt: Date;
        }[];
    }>;
}
