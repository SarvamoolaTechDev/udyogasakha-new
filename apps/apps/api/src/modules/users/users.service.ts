import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { parsePage, paginate } from '../../common/pagination';
import { UpdateUserDto } from './dto/user.dto';

// Fields safe to return — passwordHash is explicitly excluded
const SAFE_SELECT = {
  id:        true,
  email:     true,
  name:      true,
  phone:     true,
  city:      true,
  roles:     true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: SAFE_SELECT });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateMe(id: string, dto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data:  dto,
      select: SAFE_SELECT,
    });
  }

  /**
   * Admin-only: paginated list of all users with optional search.
   * Never returns passwordHash.
   */
  async findAll(search?: string, rawPage?: string, rawLimit?: string) {
    const p     = parsePage(rawPage, rawLimit);
    const where = search
      ? {
          OR: [
            { name:  { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({ where, select: SAFE_SELECT, orderBy: { createdAt: 'desc' }, skip: p.skip, take: p.limit }),
      this.prisma.user.count({ where }),
    ]);

    return paginate(data, total, p);
  }

  /**
   * Admin-only: fetch a single user by ID — for moderator profile review context.
   */
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where:   { id },
      select:  { ...SAFE_SELECT, profiles: { select: { roleType: true, status: true, submittedAt: true } } },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
