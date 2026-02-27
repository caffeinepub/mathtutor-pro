import React, { useState } from 'react';
import { Link, Outlet, useRouter } from '@tanstack/react-router';
import { clearAuthState, getStore } from '../lib/store';
import { getAuthState } from '../lib/auth';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  CreditCard,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Video,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationBell from '../components/NotificationBell';

const navItems = [
  { label: 'Dashboard', path: '/student', icon: LayoutDashboard },
  { label: 'My Sessions', path: '/student/my-sessions', icon: Video },
  { label: 'My Materials', path: '/student/my-materials', icon: FileText },
  { label: 'Courses', path: '/student/courses', icon: BookOpen },
  { label: 'Sessions', path: '/student/sessions', icon: Calendar },
  { label: 'Payments', path: '/student/payments', icon: CreditCard },
  { label: 'Profile', path: '/student/profile', icon: User },
];

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const auth = getAuthState();

  // Get student from local store using userId from auth
  const store = getStore();
  const student = auth ? store.students.find(s => s.userId === auth.userId) : null;

  const handleLogout = () => {
    clearAuthState();
    router.navigate({ to: '/login' });
  };

  const currentPath = router.state.location.pathname;

  // Compute unread notification count
  const unreadCount = store.notifications.filter(n => {
    if (!student) return false;
    const isForMe = !n.targetStudentId || n.targetStudentId === student.id;
    const hasRead = Array.isArray(n.readBy) && n.readBy.includes(student.id);
    return isForMe && !hasRead;
  }).length;

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
            <Link to="/student" className="flex items-center gap-2">
              <img src="/assets/generated/logo-mark.dim_128x128.png" alt="Logo" className="h-8 w-8" />
              <div>
                <div className="font-bold text-sm text-foreground">Rajat's Equation</div>
                <div className="text-xs text-muted-foreground">Student Portal</div>
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
                item.path === '/student'
                  ? currentPath === '/student' || currentPath === '/student/'
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
                  {isActive && <ChevronRight className="h-3 w-3 opacity-60" />}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-border">
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
          {student && (
            <NotificationBell studentId={student.id} />
          )}
          {unreadCount > 0 && (
            <span className="text-xs bg-destructive text-destructive-foreground rounded-full px-1.5 py-0.5 -ml-3 -mt-3 self-start">
              {unreadCount}
            </span>
          )}
          <div className="text-sm text-muted-foreground">
            {student?.name ?? auth?.name ?? 'Student'}
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
