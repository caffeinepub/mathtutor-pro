import { useState, useEffect, useCallback } from 'react';
import { useActor } from './useActor';

export interface CanisterHealthState {
  isOnline: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
}

function isIC0508Error(err: unknown): boolean {
  if (!err) return false;
  const msg = String((err as any)?.message || err).toLowerCase();
  return msg.includes('ic0508') || msg.includes('canister is stopped') || msg.includes('canister stopped');
}

export function useCanisterHealth(): CanisterHealthState {
  const { actor, isFetching: actorFetching } = useActor();
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    if (!actor) return;
    setIsChecking(true);
    try {
      // Use a lightweight query to check canister availability
      await actor.getProducts();
      setIsOnline(true);
    } catch (err: unknown) {
      if (isIC0508Error(err)) {
        setIsOnline(false);
      } else {
        // Other errors (network, auth) don't necessarily mean canister is stopped
        setIsOnline(true);
      }
    } finally {
      setIsChecking(false);
      setLastChecked(new Date());
    }
  }, [actor]);

  useEffect(() => {
    if (!actor || actorFetching) return;

    // Check immediately on mount
    checkHealth();

    // Re-check every 60 seconds
    const interval = setInterval(checkHealth, 60_000);
    return () => clearInterval(interval);
  }, [actor, actorFetching, checkHealth]);

  return { isOnline, isChecking, lastChecked };
}
