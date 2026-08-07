'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from '@/lib/adminFetch';

export function useAdminMessages(
  conversationId: string
) {
  return useQuery({
    queryKey: ['admin', 'messages', conversationId],
    queryFn: async () => {
      const res = await adminFetch(
        `/api/conversations/${conversationId}/messages`
      );
      return res.json();
    },
    refetchInterval: 5000, // Poll every 5s for new messages in admin chat view
    staleTime: 0,
  });
}

export function useAdminReply(
  conversationId: string
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (message: string) => {
      const res = await adminFetch(
        `/api/conversations/${conversationId}/reply`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({ message }),
        }
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['admin', 'messages', conversationId] 
      });
    },
  });
}
