import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { parsePage, paginate } from '../../common/pagination';
import { UpdateUserDto } from './dto/user.dto';
import { AuditService } from '../audit/audit.service';

const SAFE_SELECT = {
  id: true, email: true, name: true, phone: true,
  city: true, roles: true, createdAt: true, updatedAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit:  AuditService,
  ) {}

  async getMe(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: SAFE_SELECT });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateMe(id: string, dto: UpdateUserDto) {
    const before = await this.prisma.user.findUnique({ where: { id }, select: SAFE_SELECT });
    const after  = await this.prisma.user.update({ where: { id }, data: dto, select: SAFE_SELECT });

    await this.audit.log({
      entityType: 'user', entityId: id, action: 'PROFILE_UPDATED', actorId: id,
      oldState: { name: before?.name, phone: before?.phone, city: before?.city },
      newState: { name: after.name,   phone: after.phone,   city: after.city   },
    });

    return after;
  }

  async findAll(search?: string, rawPage?: string, rawLimit?: string) {
    const p = parsePage(rawPage, rawLimit);
    const where = search ? {
      OR: [
        { name:  { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};
    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({ where, select: SAFE_SELECT, orderBy: { createdAt: 'desc' }, skip: p.skip, take: p.limit }),
      this.prisma.user.count({ where }),
    ]);
    return paginate(data, total, p);
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where:  { id },
      select: { ...SAFE_SELECT, profiles: { select: { roleType: true, status: true, submittedAt: true } } },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
