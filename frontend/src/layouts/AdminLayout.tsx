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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';

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
