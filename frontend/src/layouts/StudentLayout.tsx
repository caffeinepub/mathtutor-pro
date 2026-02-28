import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useRouterState } from '@tanstack/react-router';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  FileText,
  CreditCard,
  LogOut,
  Menu,
  X,
  GraduationCap,
  User,
  ClipboardList,
  BookMarked,
} from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { clearAuthState, clearCachedCredentials, getAuthState } from '../lib/auth';
import { useQueryClient } from '@tanstack/react-query';
import { useCanisterHealth } from '../hooks/useCanisterHealth';
import { useReconnectionToast } from '../hooks/useReconnectionToast';
import OfflineBanner from '../components/OfflineBanner';

const navItems = [
  { path: '/student', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/student/courses', label: 'My Courses', icon: BookOpen },
  { path: '/student/sessions', label: 'Sessions', icon: Calendar },
  { path: '/student/my-sessions', label: 'My Classes', icon: ClipboardList },
  { path: '/student/materials', label: 'Materials', icon: FileText },
  { path: '/student/my-materials', label: 'My Materials', icon: BookMarked },
  { path: '/student/payments', label: 'Payments', icon: CreditCard },
  { path: '/student/profile', label: 'Profile', icon: User },
];

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  // isPending: true while the initial health check hasn't completed yet
  // Only show offline banner after the check has definitively returned offline
  const { isOnline, isPending } = useCanisterHealth();

  // Show reconnection toast when backend recovers
  useReconnectionToast();

  const auth = getAuthState();
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

  const displayName =
    auth?.name ||
    auth?.email ||
    (identity ? identity.getPrincipal().toString().slice(0, 12) + '…' : 'Student');

  // Only show offline banner when health check has definitively returned offline
  const showOfflineBanner = !isPending && !isOnline;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Offline banner at very top — only shown after definitive offline detection */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <OfflineBanner isOnline={!showOfflineBanner} />
      </div>

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
        } ${showOfflineBanner ? 'pt-9' : ''}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-bold text-sm text-foreground leading-tight">Rajat's Equation</p>
            <p className="text-xs text-muted-foreground">Student Portal</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive =
              item.path === '/student'
                ? currentPath === '/student' || currentPath === '/student/'
                : currentPath.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="px-3 py-4 border-t border-border">
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-medium text-foreground truncate">{displayName}</p>
            {auth?.studentId && (
              <p className="text-xs text-muted-foreground truncate">{auth.studentId}</p>
            )}
          </div>
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
      <div className={`flex-1 flex flex-col overflow-hidden ${showOfflineBanner ? 'pt-9' : ''}`}>
        {/* Top bar */}
        <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-4 shrink-0">
          <button
            className="lg:hidden p-2 rounded-md hover:bg-accent"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex-1" />
          {/* Online/offline indicator — only show definitive state */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className={`w-2 h-2 rounded-full ${
                isPending ? 'bg-muted-foreground animate-pulse' :
                isOnline ? 'bg-green-500' : 'bg-amber-500'
              }`}
            />
            {isPending ? 'Connecting…' : isOnline ? 'Online' : 'Cached'}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
