import { Outlet } from '@tanstack/react-router';
import { useEffect } from 'react';
import { initializeStore } from '../lib/store';

export default function RootLayout() {
  useEffect(() => {
    try {
      initializeStore();
    } catch {
      // ignore store initialization errors
    }
  }, []);

  return <Outlet />;
}
