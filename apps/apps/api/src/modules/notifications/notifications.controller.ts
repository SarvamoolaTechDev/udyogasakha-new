import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard, CurrentUser } from '../../common/guards/auth.guards';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get my notifications (paginated)' })
  @ApiQuery({ name: 'unread', required: false, type: Boolean, description: 'If true, return only unread' })
  @ApiQuery({ name: 'page',   required: false, type: Number })
  @ApiQuery({ name: 'limit',  required: false, type: Number })
  getAll(
    @CurrentUser('id') userId:  string,
    @Query('unread')   unread?: string,
    @Query('page')     page?:   string,
    @Query('limit')    limit?:  string,
  ) {
    return this.svc.getForUser(userId, unread === 'true', page, limit);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get count of unread notifications' })
  getUnreadCount(@CurrentUser('id') userId: string) {
    return this.svc.getUnreadCount(userId);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllRead(@CurrentUser('id') userId: string) {
    return this.svc.markAllRead(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a single notification as read' })
  markRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.svc.markRead(id, userId);
  }
}
