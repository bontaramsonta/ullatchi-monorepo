import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Data never becomes stale, preventing automatic refetches
      gcTime: 1000 * 60 * 60 * 24, // 24 hours - keep data in cache longer
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnMount: false, // Don't refetch when component mounts if data exists
      refetchOnReconnect: false, // Don't refetch when network reconnects
      retry: 0, // No retries on failure to minimize API requests
    },
  },
});
