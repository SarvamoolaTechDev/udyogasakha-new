import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/user.dto';
export declare class UsersController {
    private readonly svc;
    constructor(svc: UsersService);
    getMe(id: string): unknown;
    updateMe(id: string, dto: UpdateUserDto): unknown;
    findAll(search?: string, page?: string, limit?: string): unknown;
    findById(id: string): unknown;
}
export declare class UsersModule {
}
