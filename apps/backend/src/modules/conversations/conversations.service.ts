import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { ConversationRow, MessageRow } from './conversations.types';

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Auto-create a conversation when a booking is confirmed.
   * Called by BookingsService after inserting the booking row.
   */
  async createForBooking(
    bookingId: string,
    guestId: string,
    hostId: string,
    propertyId: string,
    propertyName: string,
  ): Promise<void> {
    // Idempotent — skip if one already exists for this booking
    const { data: existing } = await this.supabaseService.admin
      .from('conversations')
      .select('id')
      .eq('booking_id', bookingId)
      .maybeSingle();

    if (existing) return;

    const { data: conv, error: convError } = await this.supabaseService.admin
      .from('conversations')
      .insert({ booking_id: bookingId, guest_id: guestId, host_id: hostId, property_id: propertyId })
      .select('id')
      .single();

    if (convError || !conv) {
      this.logger.error('Failed to create conversation for booking', convError);
      return;
    }

    // Insert welcome system message
    const { error: msgError } = await this.supabaseService.admin
      .from('messages')
      .insert({
        conversation_id: conv.id,
        sender_id: null,
        sender_type: 'system',
        content: `Booking confirmed for ${propertyName}! You can now chat directly with your host.`,
        read_by_guest: false,
        read_by_host: false,
      });

    if (msgError) {
      this.logger.error('Failed to insert system message', msgError);
    }
  }

  /**
   * Get all conversations for a user (guest or host).
   * Returns conversations enriched with last message + other party name + unread count.
   */
  async getMyConversations(
    userId: string,
    role: 'guest' | 'host',
  ): Promise<ConversationRow[]> {
    const column = role === 'guest' ? 'guest_id' : 'host_id';

    const { data: conversations, error } = await this.supabaseService.admin
      .from('conversations')
      .select('*')
      .eq(column, userId)
      .order('last_message_at', { ascending: false });

    if (error || !conversations) {
      this.logger.error('Fetch conversations failed', error);
      return [];
    }

    if (conversations.length === 0) return [];

    const propertyIds = [...new Set(conversations.map(c => c.property_id))];
    const guestIds = [...new Set(conversations.map(c => c.guest_id))];
    const hostIds = [...new Set(conversations.map(c => c.host_id))];
    const userIds = [...new Set([...guestIds, ...hostIds])];

    const [{ data: properties }, { data: users }] = await Promise.all([
      this.supabaseService.admin
        .from('properties')
        .select('id, name, photos')
        .in('id', propertyIds),
      this.supabaseService.admin
        .from('users')
        .select('id, name')
        .in('id', userIds),
    ]);

    const propertyMap = new Map((properties ?? []).map(p => [p.id, p]));
    const userMap = new Map((users ?? []).map(u => [u.id, u]));

    // Get unread counts per conversation
    const conversationIds = conversations.map(c => c.id);
    const readColumn = role === 'guest' ? 'read_by_guest' : 'read_by_host';
    const { data: unreadMessages } = await this.supabaseService.admin
      .from('messages')
      .select('conversation_id')
      .in('conversation_id', conversationIds)
      .eq(readColumn, false)
      .neq('sender_type', role);

    const unreadCountMap = new Map<string, number>();
    (unreadMessages ?? []).forEach(m => {
      unreadCountMap.set(
        m.conversation_id,
        (unreadCountMap.get(m.conversation_id) ?? 0) + 1,
      );
    });

    return conversations.map(conv => ({
      ...conv,
      property: propertyMap.get(conv.property_id) ?? null,
      guest: userMap.get(conv.guest_id) ?? null,
      host: userMap.get(conv.host_id) ?? null,
      unreadCount: unreadCountMap.get(conv.id) ?? 0,
    }));
  }

  /**
   * Get all conversations for admin list.
   */
  async getAllConversations(): Promise<ConversationRow[]> {
    const { data: conversations, error } = await this.supabaseService.admin
      .from('conversations')
      .select('*')
      .order('last_message_at', { ascending: false });

    if (error || !conversations) {
      this.logger.error('Fetch all conversations failed', error);
      return [];
    }

    if (conversations.length === 0) return [];

    const propertyIds = [...new Set(conversations.map(c => c.property_id))];
    const userIds = [...new Set([
      ...conversations.map(c => c.guest_id),
      ...conversations.map(c => c.host_id),
    ])];

    const [{ data: properties }, { data: users }] = await Promise.all([
      this.supabaseService.admin
        .from('properties')
        .select('id, name')
        .in('id', propertyIds),
      this.supabaseService.admin
        .from('users')
        .select('id, name, phone')
        .in('id', userIds),
    ]);

    const propertyMap = new Map((properties ?? []).map(p => [p.id, p]));
    const userMap = new Map((users ?? []).map(u => [u.id, u]));

    const conversationIds = conversations.map(c => c.id);
    const { data: messageCounts } = await this.supabaseService.admin
      .from('messages')
      .select('conversation_id')
      .in('conversation_id', conversationIds);

    const countMap = new Map<string, number>();
    (messageCounts ?? []).forEach(m => {
      countMap.set(
        m.conversation_id,
        (countMap.get(m.conversation_id) ?? 0) + 1,
      );
    });

    return conversations.map(conv => ({
      ...conv,
      property: propertyMap.get(conv.property_id) ?? null,
      guest: userMap.get(conv.guest_id) ?? null,
      host: userMap.get(conv.host_id) ?? null,
      messageCount: countMap.get(conv.id) ?? 0,
    }));
  }

  /**
   * Get a single conversation with full details (for admin).
   */
  async getConversationDetail(conversationId: string) {
    const { data: conv, error } = await this.supabaseService.admin
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error || !conv) return null;

    const [{ data: property }, { data: guest }, { data: host }] = await Promise.all([
      this.supabaseService.admin
        .from('properties')
        .select('id, name, photos')
        .eq('id', conv.property_id)
        .single(),
      this.supabaseService.admin
        .from('users')
        .select('id, name')
        .eq('id', conv.guest_id)
        .single(),
      this.supabaseService.admin
        .from('users')
        .select('id, name')
        .eq('id', conv.host_id)
        .single(),
    ]);

    return {
      ...conv,
      property: property ?? null,
      guest: guest ?? null,
      host: host ?? null,
    };
  }

  /**
   * Get a single conversation with full message history (for guest/host client).
   * Validates that the requesting user is a participant.
   */
  async getConversation(
    conversationId: string,
    userId: string,
  ): Promise<{ conversation: ConversationRow; messages: MessageRow[] }> {
    const { data: conv, error: convError } = await this.supabaseService.admin
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (convError || !conv) {
      throw new NotFoundException('Conversation not found');
    }

    // Security: only participants or admin can view
    if (conv.guest_id !== userId && conv.host_id !== userId) {
      throw new ForbiddenException('Not a participant in this conversation');
    }

    const [property, guest, host, messages] = await Promise.all([
      this.supabaseService.admin
        .from('properties')
        .select('id, name, photos')
        .eq('id', conv.property_id)
        .single()
        .then(r => r.data),
      this.supabaseService.admin
        .from('users')
        .select('id, name')
        .eq('id', conv.guest_id)
        .single()
        .then(r => r.data),
      this.supabaseService.admin
        .from('users')
        .select('id, name')
        .eq('id', conv.host_id)
        .single()
        .then(r => r.data),
      this.getConversationMessages(conversationId),
    ]);

    // Mark messages as read for this participant
    const isGuest = conv.guest_id === userId;
    const readColumn = isGuest ? 'read_by_guest' : 'read_by_host';
    const otherRole = isGuest ? 'host' : 'guest';
    
    await this.supabaseService.admin
      .from('messages')
      .update({ [readColumn]: true })
      .eq('conversation_id', conversationId)
      .neq('sender_type', isGuest ? 'guest' : 'host');

    return {
      conversation: {
        ...conv,
        property: property ?? null,
        guest: guest ?? null,
        host: host ?? null,
      },
      messages,
    };
  }

  /**
   * Get messages of a conversation and merge sender details in JS.
   */
  async getConversationMessages(conversationId: string): Promise<MessageRow[]> {
    const { data: messages, error } = await this.supabaseService.admin
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error || !messages) {
      this.logger.error('Failed to fetch messages', error);
      return [];
    }

    // Fetch conversation to get guest/host IDs
    const { data: conv } = await this.supabaseService.admin
      .from('conversations')
      .select('guest_id, host_id')
      .eq('id', conversationId)
      .single();

    if (!conv) return messages as unknown as MessageRow[];

    // Fetch the names of guest and host
    const { data: users } = await this.supabaseService.admin
      .from('users')
      .select('id, name')
      .in('id', [conv.guest_id, conv.host_id]);

    const userMap = new Map((users ?? []).map(u => [u.id, u]));

    return messages.map(m => ({
      ...m,
      sender: m.sender_id ? (userMap.get(m.sender_id) ?? null) : null,
    })) as unknown as MessageRow[];
  }

  /**
   * Send a message to a conversation.
   * Validates that the sender is a participant.
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
  ): Promise<MessageRow> {
    const { data: conv, error: convError } = await this.supabaseService.admin
      .from('conversations')
      .select('id, guest_id, host_id')
      .eq('id', conversationId)
      .single();

    if (convError || !conv) {
      throw new NotFoundException('Conversation not found');
    }

    const isGuest = conv.guest_id === senderId;
    const isHost = conv.host_id === senderId;

    if (!isGuest && !isHost) {
      throw new ForbiddenException('Not a participant in this conversation');
    }

    const senderType = isGuest ? 'guest' : 'host';

    const { data: msg, error: msgError } = await this.supabaseService.admin
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        sender_type: senderType,
        content,
        read_by_guest: isGuest,
        read_by_host: isHost,
      })
      .select('*')
      .single();

    if (msgError || !msg) {
      this.logger.error('Failed to send message', msgError);
      throw new Error('Failed to send message');
    }

    // Update conversation metadata
    await this.supabaseService.admin
      .from('conversations')
      .update({
        last_message: content,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    const { data: user } = await this.supabaseService.admin
      .from('users')
      .select('id, name')
      .eq('id', senderId)
      .single();

    return {
      ...msg,
      sender: user ?? null,
    } as unknown as MessageRow;
  }

  /**
   * Query conversation by guest and property (Mobile Task 6).
   */
  async getConversationByGuestAndProperty(
    guestId: string,
    propertyId: string,
  ) {
    const { data } = await this.supabaseService.admin
      .from('conversations')
      .select('*')
      .eq('guest_id', guestId)
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return data;
  }

  /**
   * Query conversation by booking and validate user is participant (Mobile Task 6).
   */
  async getConversationByBooking(bookingId: string, userId: string) {
    const { data, error } = await this.supabaseService.admin
      .from('conversations')
      .select('*')
      .eq('booking_id', bookingId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Conversation not found');
    }

    if (data.guest_id !== userId && data.host_id !== userId) {
      throw new ForbiddenException('Not a participant in this conversation');
    }

    return data;
  }

  /**
   * Send support reply as JuxTravel Admin (Admin Task 2).
   */
  async sendAdminMessage(
    conversationId: string,
    message: string,
  ) {
    const { data, error } = await this.supabaseService.admin
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: null,
        sender_type: 'admin',
        content: message,
        read_by_guest: false,
        read_by_host: false,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Failed to send admin message', error);
      throw new Error('Failed to send message');
    }

    await this.supabaseService.admin
      .from('conversations')
      .update({
        last_message: message,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    return data;
  }

  /**
   * Mark all unread messages in a conversation as read for a user.
   */
  async markAsRead(conversationId: string, userId: string): Promise<{ success: boolean }> {
    const { data: conv } = await this.supabaseService.admin
      .from('conversations')
      .select('guest_id, host_id')
      .eq('id', conversationId)
      .maybeSingle();

    if (!conv) {
      return { success: false };
    }

    const isGuest = conv.guest_id === userId;
    const isHost = conv.host_id === userId;
    if (!isGuest && !isHost) {
      return { success: false };
    }

    const readColumn = isGuest ? 'read_by_guest' : 'read_by_host';
    const senderTypeToExclude = isGuest ? 'guest' : 'host';

    try {
      await this.supabaseService.admin
        .from('messages')
        .update({ [readColumn]: true, is_read: true, read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_type', senderTypeToExclude);
    } catch {
      await this.supabaseService.admin
        .from('messages')
        .update({ [readColumn]: true })
        .eq('conversation_id', conversationId)
        .neq('sender_type', senderTypeToExclude);
    }

    this.logger.log(`[MSG] Marked as read for user ${userId} in conversation ${conversationId}`);
    return { success: true };
  }
}
