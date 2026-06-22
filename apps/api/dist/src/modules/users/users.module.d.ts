import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/user.dto';
export declare class UsersController {
    private readonly svc;
    constructor(svc: UsersService);
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
    findAll(search?: string, page?: string, limit?: string): Promise<import("../../common/pagination").Paginated<{
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
export declare class UsersModule {
}
