import { useState, useEffect, useRef } from 'react';
import { useActor } from './useActor';

interface CanisterHealthState {
  isOnline: boolean;
  isChecking: boolean;
  isPending: boolean; // true until the first health check completes
  lastChecked: Date | null;
  wasOffline: boolean; // true when backend just recovered (offline -> online transition)
}

export function useCanisterHealth() {
  const { actor, isFetching: actorFetching } = useActor();
  const [state, setState] = useState<CanisterHealthState>({
    isOnline: true,
    isChecking: false,
    isPending: true, // start as pending until first check completes
    lastChecked: null,
    wasOffline: false,
  });

  const prevOnlineRef = useRef<boolean | null>(null);
  const hasCheckedRef = useRef(false);

  const checkHealth = async () => {
    if (!actor) return;

    setState(prev => ({ ...prev, isChecking: true, wasOffline: false }));

    try {
      await actor.getProducts();
      hasCheckedRef.current = true;
      setState(prev => {
        const wasOffline = prevOnlineRef.current === false;
        prevOnlineRef.current = true;
        return {
          isOnline: true,
          isChecking: false,
          isPending: false,
          lastChecked: new Date(),
          wasOffline,
        };
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const isOffline =
        errMsg.includes('IC0508') ||
        errMsg.includes('canister stopped') ||
        errMsg.includes('Failed to fetch') ||
        errMsg.includes('NetworkError') ||
        errMsg.includes('network error');

      hasCheckedRef.current = true;
      setState(prev => {
        prevOnlineRef.current = isOffline ? false : true;
        return {
          ...prev,
          isOnline: !isOffline,
          isChecking: false,
          isPending: false,
          lastChecked: new Date(),
          wasOffline: false,
        };
      });
    }
  };

  useEffect(() => {
    // While actor is still being fetched, keep isPending true
    if (actorFetching) {
      setState(prev => ({ ...prev, isPending: true }));
      return;
    }

    if (!actor) return;

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [actor, actorFetching]);

  return { ...state, checkHealth };
}
