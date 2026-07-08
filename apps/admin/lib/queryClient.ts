import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 2 * 60 * 1000, // 2 min for admin
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true, // Admin benefits from tab focus refetch
    },
  },
});
