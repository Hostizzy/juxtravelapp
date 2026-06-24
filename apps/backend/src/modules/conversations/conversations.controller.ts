import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/current-user.decorator';
import { ConversationRow, MessageRow } from './conversations.types';

@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
  ) {}

  /**
   * GET /conversations/my
   * Returns all conversations the current user participates in (enriched).
   */
  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyConversations(
    @CurrentUser() payload: JwtPayload,
    @Query('role') role: 'guest' | 'host',
  ): Promise<ConversationRow[]> {
    return this.conversationsService.getMyConversations(payload.sub, role);
  }

  /**
   * GET /conversations/by-property/:propertyId
   * Lookup if conversation exists for guest + property combo (pre-booking interest).
   */
  @Get('by-property/:propertyId')
  @UseGuards(JwtAuthGuard)
  async getByProperty(
    @CurrentUser() payload: JwtPayload,
    @Param('propertyId') propertyId: string,
  ) {
    return this.conversationsService.getConversationByGuestAndProperty(
      payload.sub,
      propertyId,
    );
  }

  /**
   * GET /conversations/by-booking/:bookingId
   * Lookup conversation by booking ID.
   */
  @Get('by-booking/:bookingId')
  @UseGuards(JwtAuthGuard)
  async getByBooking(
    @Param('bookingId') bookingId: string,
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.conversationsService.getConversationByBooking(
      bookingId,
      payload.sub,
    );
  }

  /**
   * GET /conversations/admin/all
   * Returns all conversations across system for admin dashboard.
   */
  @Get('admin/all')
  async getAllForAdmin(): Promise<ConversationRow[]> {
    return this.conversationsService.getAllConversations();
  }

  /**
   * GET /conversations/:id/detail
   * Returns full conversation metadata (for admin).
   */
  @Get(':id/detail')
  async getDetail(@Param('id') id: string) {
    return this.conversationsService.getConversationDetail(id);
  }

  /**
   * GET /conversations/:id/messages
   * Returns conversation messages list (for admin details and chat threads).
   */
  @Get(':id/messages')
  async getMessages(
    @Param('id') id: string,
    @Query('role') role?: string,
  ) {
    return this.conversationsService.getConversationMessages(id);
  }

  /**
   * POST /conversations/:id/admin-reply
   * Sends support message from admin dashboard.
   */
  @Post(':id/admin-reply')
  async adminReply(
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.conversationsService.sendAdminMessage(id, dto.message);
  }

  /**
   * GET /conversations/:id
   * Returns conversation + full message history.
   * Validates that requester is a participant.
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getConversation(
    @Param('id') id: string,
    @CurrentUser() payload: JwtPayload,
  ): Promise<{ conversation: ConversationRow; messages: MessageRow[] }> {
    return this.conversationsService.getConversation(id, payload.sub);
  }

  /**
   * POST /conversations/:id/messages
   * Send a new message in a conversation.
   */
  @Post(':id/messages')
  @UseGuards(JwtAuthGuard)
  async sendMessage(
    @Param('id') id: string,
    @CurrentUser() payload: JwtPayload,
    @Body() dto: SendMessageDto,
  ): Promise<MessageRow> {
    return this.conversationsService.sendMessage(
      id,
      payload.sub,
      dto.message,
    );
  }
}
