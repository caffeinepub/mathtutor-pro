import React from 'react';
import { WifiOff } from 'lucide-react';

interface OfflineBannerProps {
  isOnline: boolean;
}

export default function OfflineBanner({ isOnline }: OfflineBannerProps) {
  if (isOnline) return null;

  return (
    <div className="w-full bg-amber-500/90 text-white px-4 py-2 flex items-center gap-2 text-sm z-50">
      <WifiOff className="h-4 w-4 shrink-0" />
      <span>
        You're currently offline. Showing cached data — some features may be limited.
      </span>
    </div>
  );
}
