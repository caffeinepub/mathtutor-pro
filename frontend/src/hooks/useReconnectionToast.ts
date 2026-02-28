import { useEffect, useRef } from 'react';
import { useCanisterHealth } from './useCanisterHealth';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useReconnectionToast() {
  const { isOnline, wasOffline } = useCanisterHealth();
  const queryClient = useQueryClient();
  const hasShownRef = useRef(false);

  useEffect(() => {
    if (wasOffline && isOnline && !hasShownRef.current) {
      hasShownRef.current = true;
      toast.success('Backend reconnected! Refreshing data...', {
        duration: 4000,
      });
      // Invalidate all queries so fresh data is fetched
      queryClient.invalidateQueries();
      // Reset flag after a short delay so it can fire again if needed
      setTimeout(() => {
        hasShownRef.current = false;
      }, 10000);
    }
  }, [wasOffline, isOnline, queryClient]);

  return { isOnline, wasOffline };
}
