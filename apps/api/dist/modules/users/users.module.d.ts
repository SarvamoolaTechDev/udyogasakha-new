import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/user.dto';
declare class DeleteAccountDto {
    password: string;
}
export declare class UsersController {
    private readonly svc;
    constructor(svc: UsersService);
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
    deleteMe(id: string, dto: DeleteAccountDto): Promise<{
        message: string;
    }>;
    deleteByAdmin(id: string, adminId: string): Promise<{
        message: string;
    }>;
    findAll(search?: string, page?: string, limit?: string): Promise<import("../../common/pagination").Paginated<{
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
}
export declare class UsersModule {
}
export {};
