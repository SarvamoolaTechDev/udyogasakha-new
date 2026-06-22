import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/user.dto';
import { AuditService } from '../audit/audit.service';
export declare class UsersService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    getMe(id: string): unknown;
    updateMe(id: string, dto: UpdateUserDto): unknown;
    findAll(search?: string, rawPage?: string, rawLimit?: string): unknown;
    findById(id: string): unknown;
}
