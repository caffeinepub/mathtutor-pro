import React, { useEffect } from 'react';
import { Outlet } from '@tanstack/react-router';
import { initializeStore } from '../lib/store';

export default function RootLayout() {
  useEffect(() => {
    try {
      initializeStore();
    } catch {
      // silently fail
    }
  }, []);

  return <Outlet />;
}
