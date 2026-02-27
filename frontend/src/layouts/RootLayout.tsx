import React, { useEffect } from 'react';
import { Outlet } from '@tanstack/react-router';
import { getStore } from '../lib/store';

export default function RootLayout() {
  useEffect(() => {
    // Initialize store on first load — this also migrates any stale admin
    // credentials to the current canonical values (admin@mathtutor.com / Admin@123)
    getStore();
  }, []);

  return <Outlet />;
}
