import { apiService } from '../lib/api';

export interface ConversationSummary {
  id: string;
  booking_id: string;
  guest_id: string;
  host_id: string;
  property_id: string;
  created_at: string;
  last_message?: string;
  last_message_at?: string;
  guest?: { id: string; name: string } | null;
  host?: { id: string; name: string } | null;
  property?: { id: string; name: string; photos?: string[] } | null;
  unreadCount?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  sender_type: 'guest' | 'host' | 'admin' | 'system';
  content: string;
  created_at: string;
  sender?: { id: string; name: string } | null;
}

export interface ConversationDetail {
  conversation: ConversationSummary;
  messages: Message[];
}

export const conversationService = {
  getMyConversations: (token: string, role: 'guest' | 'host') =>
    apiService.get<ConversationSummary[]>(`/conversations/my?role=${role}`, token),

  getConversation: (id: string, token: string) =>
    apiService.get<ConversationDetail>(`/conversations/${id}`, token),

  sendMessage: (id: string, message: string, token: string) =>
    apiService.post<Message>(
      `/conversations/${id}/messages`,
      { message },
      token,
    ),
};
