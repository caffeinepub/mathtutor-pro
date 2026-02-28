import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useRouterState } from '@tanstack/react-router';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  FileText,
  Bell,
  CreditCard,
  LogOut,
  Menu,
  X,
  GraduationCap,
  ClipboardList,
  BookMarked,
} from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { clearAuthState, clearCachedCredentials } from '../lib/auth';
import { useQueryClient } from '@tanstack/react-query';
import { useCanisterHealth } from '../hooks/useCanisterHealth';
import { useReconnectionToast } from '../hooks/useReconnectionToast';
import BackendUnavailableScreen from '../components/BackendUnavailableScreen';
import { getStore } from '../lib/store';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/students', label: 'Students', icon: Users },
  { path: '/admin/courses', label: 'Courses', icon: BookOpen },
  { path: '/admin/sessions', label: 'Sessions', icon: Calendar },
  { path: '/admin/materials', label: 'Materials', icon: FileText },
  { path: '/admin/notifications', label: 'Notifications', icon: Bell },
  { path: '/admin/payments', label: 'Payments', icon: CreditCard },
  { path: '/admin/manage-sessions', label: 'Manage Classes', icon: ClipboardList },
  { path: '/admin/manage-materials', label: 'Manage Materials', icon: BookMarked },
  { path: '/admin/attendance', label: 'Attendance', icon: ClipboardList },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { isOnline, isChecking, isPending, checkHealth } = useCanisterHealth();

  // Show reconnection toast when backend recovers
  useReconnectionToast();

  const currentPath = routerState.location.pathname;

  const handleLogout = async () => {
    try {
      await clear();
    } catch {
      // ignore
    }
    clearAuthState();
    clearCachedCredentials();
    queryClient.clear();
    navigate({ to: '/login' });
  };

  // Count pending payments for badge
  let pendingCount = 0;
  try {
    const store = getStore();
    pendingCount = store.payments.filter(p => p.status === 'pending').length;
  } catch {
    // ignore
  }

  // Show loading screen while initial health check is pending
  // Show backend unavailable screen only after health check definitively returns offline
  if (isPending || (!isOnline && isChecking)) {
    return (
      <BackendUnavailableScreen
        onCheckAgain={checkHealth}
        isChecking={isChecking}
        isPending={true}
      />
    );
  }

  if (!isOnline) {
    return (
      <BackendUnavailableScreen
        onCheckAgain={checkHealth}
        isChecking={isChecking}
        isPending={false}
      />
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-card border-r border-border flex flex-col transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-bold text-sm text-foreground leading-tight">Rajat's Equation</p>
            <p className="text-xs text-muted-foreground">Admin Portal</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors relative ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
                {item.path === '/admin/payments' && pendingCount > 0 && (
                  <span className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-4 shrink-0">
          <button
            className="lg:hidden p-2 rounded-md hover:bg-accent"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex-1" />
          {/* Health indicator */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Online
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
