import React, { useState } from 'react';
import { Link, Outlet, useRouter } from '@tanstack/react-router';
import { getAuthState, clearAuthState } from '../lib/store';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  CreditCard,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Video,
  FileText,
  ClipboardList,
  Wifi,
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { useCanisterHealth } from '../hooks/useCanisterHealth';

function usePendingCount() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['pendingPayments'],
    queryFn: async () => {
      if (!actor) return 0;
      try {
        const pending = await actor.getPendingPayments();
        return pending.length;
      } catch {
        return 0;
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Students', path: '/admin/students', icon: Users },
  { label: 'Courses', path: '/admin/courses', icon: BookOpen },
  { label: 'Sessions', path: '/admin/manage-sessions', icon: Video },
  { label: 'Materials', path: '/admin/manage-materials', icon: FileText },
  { label: 'Attendance', path: '/admin/attendance', icon: ClipboardList },
  { label: 'Payments', path: '/admin/payments', icon: CreditCard, badge: true },
  { label: 'Notifications', path: '/admin/notifications', icon: Bell },
];

function HealthBadge() {
  const { isOnline, isChecking, lastChecked } = useCanisterHealth();

  const lastCheckedText = lastChecked
    ? `Last checked: ${lastChecked.toLocaleTimeString()}`
    : 'Checking…';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-default select-none transition-colors ${
              isChecking
                ? 'bg-muted text-muted-foreground'
                : isOnline
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {isChecking ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : isOnline ? (
              <Wifi className="w-3 h-3" />
            ) : (
              <WifiOff className="w-3 h-3" />
            )}
            <span>{isChecking ? 'Checking…' : isOnline ? 'Online' : 'Service Unavailable'}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          <p>{isOnline ? 'Backend canister is reachable' : 'Backend canister may be stopped or unreachable'}</p>
          <p className="text-muted-foreground mt-0.5">{lastCheckedText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { data: pendingCount = 0 } = usePendingCount();

  const handleLogout = () => {
    clearAuthState();
    router.navigate({ to: '/login' });
  };

  const currentPath = router.state.location.pathname;
  const auth = getAuthState();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-30 transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2">
              <img src="/assets/generated/logo-mark.dim_128x128.png" alt="Logo" className="h-8 w-8 rounded" />
              <div>
                <div className="font-bold text-sm text-foreground">Rajat's Equation</div>
                <div className="text-xs text-muted-foreground">Admin Panel</div>
              </div>
            </Link>
            <button
              className="lg:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Health Status */}
          <div className="px-4 py-2 border-b border-border">
            <HealthBadge />
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive =
                item.path === '/admin'
                  ? currentPath === '/admin' || currentPath === '/admin/'
                  : currentPath.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && pendingCount > 0 && (
                    <Badge variant="destructive" className="text-xs px-1.5 py-0.5 min-w-[20px] text-center">
                      {pendingCount}
                    </Badge>
                  )}
                  {isActive && <ChevronRight className="h-3 w-3 opacity-60" />}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-border">
            <div className="px-3 py-2 text-xs text-muted-foreground mb-1">
              {auth?.name ?? 'Admin'}
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-4 sticky top-0 z-10">
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <div className="text-sm text-muted-foreground">
            Admin: {auth?.name ?? 'Admin'}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
