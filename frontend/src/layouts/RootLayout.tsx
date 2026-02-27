import React, { useEffect } from 'react';
import { Outlet } from '@tanstack/react-router';
import { getStore } from '../lib/store';

export default function RootLayout() {
  useEffect(() => {
    // Initialize store on first load (seeds default data if not present)
    getStore();
  }, []);

  return <Outlet />;
}
