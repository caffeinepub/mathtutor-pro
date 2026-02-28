import { useState, useEffect, useRef } from 'react';
import { useActor } from './useActor';

interface CanisterHealth {
  isOnline: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
}

const IC0508_ERROR = 'IC0508';

function isCanisterStoppedError(error: unknown): boolean {
  if (!error) return false;
  const msg = String(error);
  return msg.includes(IC0508_ERROR) || msg.toLowerCase().includes('canister stopped');
}

export function useCanisterHealth(): CanisterHealth {
  const { actor } = useActor();
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkHealth = async () => {
    if (!actor) return;
    setIsChecking(true);
    try {
      await actor.getProducts();
      setIsOnline(true);
    } catch (err) {
      if (isCanisterStoppedError(err)) {
        setIsOnline(false);
      } else {
        setIsOnline(true);
      }
    } finally {
      setIsChecking(false);
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    if (!actor) return;
    checkHealth();
    intervalRef.current = setInterval(checkHealth, 60_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actor]);

  return { isOnline, isChecking, lastChecked };
}
