import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../lib/api';

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'guest' | 'host' | 'admin' | 'system';
  sender_id?: string;
  content: string;
  read_by_guest: boolean;
  read_by_host: boolean;
  created_at: string;
  sender?: { name?: string };
}

export interface Conversation {
  id: string;
  booking_id: string;
  guest_id: string;
  host_id: string;
  property_id: string;
  last_message: string;
  last_message_at: string;
  unreadCount: number;
  property?: { name: string; photos: string[] };
  guest?: { name: string };
  host?: { name: string };
}

export const CONVERSATION_KEYS = {
  all: ['conversations'] as const,
  list: (role: string) => ['conversations', role] as const,
  messages: (id: string) => ['conversations', 'messages', id] as const,
  byBooking: (bookingId: string) => ['conversations', 'booking', bookingId] as const,
};

export function useConversations(role: 'guest' | 'host') {
  return useQuery({
    queryKey: CONVERSATION_KEYS.list(role),
    queryFn: () => apiGet<Conversation[]>(`/conversations/my?role=${role}`),
    refetchInterval: 3000, // Poll every 3s (was 10s)
    staleTime: 0, // Always fresh
  });
}

export function useMessages(conversationId: string, role: 'guest' | 'host') {
  return useQuery({
    queryKey: CONVERSATION_KEYS.messages(conversationId),
    queryFn: () =>
      apiGet<Message[]>(`/conversations/${conversationId}/messages?role=${role}`),
    enabled: !!conversationId,
    refetchInterval: 4000, // Poll every 4s while chat is open (replaces manual setInterval)
    staleTime: 0, // Always consider messages stale so they refetch frequently
  });
}

export function useConversationByBooking(bookingId: string) {
  return useQuery({
    queryKey: CONVERSATION_KEYS.byBooking(bookingId),
    queryFn: () => apiGet<Conversation>(`/conversations/by-booking/${bookingId}`),
    enabled: !!bookingId,
  });
}

export function useSendMessage(conversationId: string, role: 'guest' | 'host') {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (message: string) =>
      apiPost(`/conversations/${conversationId}/messages?role=${role}`, { message }),
    onSuccess: () => {
      // Immediately refetch messages after sending
      queryClient.invalidateQueries({
        queryKey: CONVERSATION_KEYS.messages(conversationId),
      });
      // Also update conversations list (last_message changed)
      queryClient.invalidateQueries({
        queryKey: ['conversations'],
      });
    },
  });
}
