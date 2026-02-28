import React from 'react';
import { ServerCrash, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackendUnavailableScreenProps {
  onCheckAgain: () => void;
  isChecking: boolean;
  isPending?: boolean; // true while the initial health check is still in progress
}

export default function BackendUnavailableScreen({
  onCheckAgain,
  isChecking,
  isPending = false,
}: BackendUnavailableScreenProps) {
  // While the initial health check is still pending, show a neutral loading state
  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background px-6 text-center">
        <div className="mb-6 rounded-full bg-muted p-6">
          <Loader2 className="h-14 w-14 text-muted-foreground animate-spin" />
        </div>
        <h1 className="text-xl font-semibold text-foreground mb-2">Connecting to backend…</h1>
        <p className="text-muted-foreground max-w-md text-sm">
          Please wait while we establish a connection to the server.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-6 text-center">
      <div className="mb-6 rounded-full bg-destructive/10 p-6">
        <ServerCrash className="h-14 w-14 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Backend Unavailable</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        The admin panel requires a live connection to the backend canister. The backend appears to
        be temporarily offline. Please try again in a moment.
      </p>
      <Button onClick={onCheckAgain} disabled={isChecking} className="gap-2">
        {isChecking ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            Checking…
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4" />
            Check Again
          </>
        )}
      </Button>
      <p className="mt-4 text-xs text-muted-foreground">
        Internet Computer canisters run 24/7 — this is likely a temporary interruption.
      </p>
    </div>
  );
}
