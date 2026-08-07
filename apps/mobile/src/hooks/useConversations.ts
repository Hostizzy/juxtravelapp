import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
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

import { useIsFocused } from '@react-navigation/native';

export function useConversations(role: 'guest' | 'host', options?: { enabled?: boolean }) {
  const isFocused = useIsFocused();
  return useQuery({
    queryKey: CONVERSATION_KEYS.list(role),
    queryFn: () => apiGet<Conversation[]>(`/conversations/my?role=${role}`),
    refetchInterval: 15000, // 15s list poll interval (Item 22)
    staleTime: 5000,
    enabled: (options?.enabled ?? true) && isFocused,
  });
}

export function useMessages(conversationId: string, role: 'guest' | 'host') {
  return useQuery({
    queryKey: CONVERSATION_KEYS.messages(conversationId),
    queryFn: () =>
      apiGet<Message[]>(`/conversations/${conversationId}/messages?role=${role}`),
    enabled: !!conversationId,
    refetchInterval: 4000, // Poll every 4s while chat is open
    staleTime: 3000, // 3s staleTime to prevent empty renders during refetch
    placeholderData: keepPreviousData, // Retain previous messages while refetching
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
      apiPost<Message>(`/conversations/${conversationId}/messages?role=${role}`, { message }),
    onMutate: async (newMessageContent: string) => {
      await queryClient.cancelQueries({
        queryKey: CONVERSATION_KEYS.messages(conversationId),
      });

      const previousMessages = queryClient.getQueryData<Message[]>(
        CONVERSATION_KEYS.messages(conversationId),
      );

      if (previousMessages) {
        const optimisticMsg: Message = {
          id: `temp-${Date.now()}`,
          conversation_id: conversationId,
          sender_type: role,
          content: newMessageContent,
          read_by_guest: role === 'guest',
          read_by_host: role === 'host',
          created_at: new Date().toISOString(),
        };
        queryClient.setQueryData<Message[]>(
          CONVERSATION_KEYS.messages(conversationId),
          [...previousMessages, optimisticMsg],
        );
      }

      return { previousMessages };
    },
    onError: (_err, _newMessage, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          CONVERSATION_KEYS.messages(conversationId),
          context.previousMessages,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: CONVERSATION_KEYS.messages(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: ['conversations'],
      });
    },
  });
}
