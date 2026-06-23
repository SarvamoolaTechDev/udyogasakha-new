import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/user.dto';
export declare class UsersController {
    private readonly svc;
    constructor(svc: UsersService);
    getMe(id: string): Promise<{
        name: string;
        id: string;
        email: string;
        phone: string;
        roles: import(".prisma/client").$Enums.UserRole[];
        city: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateMe(id: string, dto: UpdateUserDto): Promise<{
        name: string;
        id: string;
        email: string;
        phone: string;
        roles: import(".prisma/client").$Enums.UserRole[];
        city: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(search?: string, page?: string, limit?: string): Promise<import("../../common/pagination").Paginated<{
        name: string;
        id: string;
        email: string;
        phone: string;
        roles: import(".prisma/client").$Enums.UserRole[];
        city: string;
        createdAt: Date;
        updatedAt: Date;
    }>>;
    findById(id: string): Promise<{
        name: string;
        id: string;
        email: string;
        phone: string;
        roles: import(".prisma/client").$Enums.UserRole[];
        city: string;
        createdAt: Date;
        updatedAt: Date;
        profiles: {
            roleType: import(".prisma/client").$Enums.RoleType;
            status: import(".prisma/client").$Enums.ProfileStatus;
            submittedAt: Date;
        }[];
    }>;
}
export declare class UsersModule {
}
