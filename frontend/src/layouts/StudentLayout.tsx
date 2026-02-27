import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from '@tanstack/react-router';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  FileText,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronRight,
  CreditCard,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getStore } from '@/lib/store';

const navItems = [
  { path: '/student', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/student/courses', label: 'My Courses', icon: BookOpen },
  { path: '/student/sessions', label: 'Sessions', icon: Calendar },
  { path: '/student/book', label: 'Book Session', icon: Calendar },
  { path: '/student/materials', label: 'Study Materials', icon: FileText },
  { path: '/student/payments', label: 'Payments', icon: CreditCard },
  { path: '/student/profile', label: 'Profile', icon: User },
];

export default function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  const store = getStore();
  const notifications = store.notifications?.filter(
    (n: any) => n.userId === currentUser?.id && !n.read
  ) || [];

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentStudent');
    toast.success('Logged out successfully');
    navigate({ to: '/login' });
  };

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 flex flex-col transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Sidebar Header with Logo */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/rajats-equation-logo.dim_400x300.png"
              alt="The Rajat's Equation"
              className="h-10 w-auto object-contain"
            />
          </div>
          <button
            className="lg:hidden p-1 rounded text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Student name */}
        <div className="px-4 py-2 border-b border-border">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Student Portal
          </span>
          {currentUser && (
            <p className="text-xs text-foreground font-medium mt-0.5 truncate">{currentUser.name}</p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.label === 'Notifications' && notifications.length > 0 && (
                  <Badge variant={active ? 'secondary' : 'default'} className="text-xs px-1.5 py-0">
                    {notifications.length}
                  </Badge>
                )}
                {active && <ChevronRight className="w-3 h-3 opacity-60" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
          <button
            className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-foreground">
              {navItems.find((n) => isActive(n.path, n.exact))?.label ?? 'Student Portal'}
            </h1>
          </div>
          {notifications.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {notifications.length} new
            </Badge>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
