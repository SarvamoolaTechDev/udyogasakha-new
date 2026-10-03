import { Inject, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ForbiddenException as _unused } from '@nestjs/common'; 
import { PrismaService } from '../../prisma/prisma.service';
import { parsePage, paginate } from '../../common/pagination';
import { UpdateUserDto } from './dto/user.dto';
import { AuditService } from '../audit/audit.service';
import { EmailService } from '../../common/email/email.service';
import { IStorageService, STORAGE_SERVICE } from '../../common/storage/storage.interface';
import { SearchService } from '../search/search.service';
import * as bcrypt from 'bcrypt';

const SAFE_SELECT = {
  id: true, email: true, name: true, phone: true,
  city: true, roles: true, createdAt: true, updatedAt: true,
} as const;



@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit:  AuditService,
    private readonly email:  EmailService,
    private readonly search: SearchService,
    @Inject(STORAGE_SERVICE) private readonly storage: IStorageService,
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

  /**
   * Shared cleanup for both self-delete and admin-delete: removes blob-stored
   * documents and search-index entries before the DB cascade runs. Payments
   * are intentionally left untouched (userId becomes null — see schema).
   */
  private async cleanupBeforeDelete(userId: string) {
    const [candidateDocs, userDocs, approvedProfiles] = await Promise.all([
      this.prisma.candidateDocument.findMany({
        where: { profile: { userId } },
        select: { storageKey: true },
      }),
      this.prisma.userDocument.findMany({
        where: { userId },
        select: { storageKey: true },
      }),
      this.prisma.candidateProfile.findMany({
        where: { userId, status: 'APPROVED' },
        select: { id: true },
      }),
    ]);

    for (const doc of [...candidateDocs, ...userDocs]) {
      await this.storage.delete(doc.storageKey).catch(() => {});
    }
    for (const p of approvedProfiles) {
      await this.search.removeProfile(p.id).catch(() => {});
    }
  }

  /**
   * Self-service account deletion. Requires password confirmation.
   * Sends a farewell email, cleans up blobs/search index, then hard-deletes
   * the user row — cascading to every related table except Payment (SetNull).
   */
  async deleteMe(userId: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new BadRequestException('Incorrect password');

    await this.cleanupBeforeDelete(userId);
    await this.email.sendAccountDeletedEmail(user.email, user.name);

    await this.audit.log({
      entityType: 'user', entityId: userId, action: 'ACCOUNT_SELF_DELETED', actorId: userId,
      actorEmail: user.email, oldState: { email: user.email, name: user.name },
    });

    await this.prisma.user.delete({ where: { id: userId } });

    return { message: 'Account deleted' };
  }

  /**
   * Admin-initiated account deletion. ADMIN role only (enforced at controller).
   * Confirmation (typing the target's email) is enforced client-side; the
   * server trusts the admin's role for this action.
   */
  async deleteByAdmin(targetUserId: string, adminId: string) {

    const [user, admin] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: targetUserId } }),
      this.prisma.user.findUnique({ where: { id: adminId }, select: { email: true } }),
    ]);
    
    if (!user) throw new NotFoundException('User not found');

    await this.cleanupBeforeDelete(targetUserId);
    await this.email.sendAccountDeletedEmail(user.email, user.name);

    // Audit log written BEFORE delete — the row won't exist afterward
    await this.audit.log({
      entityType: 'user', entityId: targetUserId, action: 'ACCOUNT_DELETED_BY_ADMIN',
      actorId: adminId, actorEmail: admin?.email,
      oldState: { email: user.email, name: user.name, phone: user.phone },
    });

    await this.prisma.user.delete({ where: { id: targetUserId } });

    return { message: 'Account deleted' };
  }
}
