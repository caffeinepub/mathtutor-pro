import React, { useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { clearAuthState, getAuthState } from '../lib/auth';
import NotificationBell from '../components/NotificationBell';
import {
  LayoutDashboard,
  BookOpen,
  Video,
  FileText,
  CreditCard,
  User,
  LogOut,
  Menu,
  X,
  GraduationCap,
} from 'lucide-react';

const navItems = [
  { path: '/student', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/student/courses', label: 'My Course', icon: BookOpen },
  { path: '/student/sessions', label: 'My Classes', icon: Video },
  { path: '/student/my-sessions', label: 'My Sessions', icon: Video },
  { path: '/student/materials', label: 'My Materials', icon: FileText },
  { path: '/student/my-materials', label: 'Materials', icon: FileText },
  { path: '/student/payments', label: 'Payments', icon: CreditCard },
  { path: '/student/profile', label: 'Profile', icon: User },
];

// Deduplicate nav items by path
const uniqueNavItems = navItems.filter(
  (item, index, self) => self.findIndex((i) => i.path === item.path) === index
);

export default function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clear, identity } = useInternetIdentity();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const authState = getAuthState();
  const studentId = authState?.userId || '';
  const studentName = authState?.name || 'Student';

  // If no auth state, redirect to login
  useEffect(() => {
    if (!authState || authState.role !== 'student') {
      navigate({ to: '/login' });
    }
  }, [authState, navigate]);

  const handleLogout = async () => {
    try {
      await clear();
    } catch (e) {
      // ignore
    }
    clearAuthState();
    navigate({ to: '/login' });
  };

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  // Simplified nav: only show key items
  const displayNav = [
    { path: '/student', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/student/courses', label: 'My Course', icon: BookOpen },
    { path: '/student/my-sessions', label: 'My Classes', icon: Video },
    { path: '/student/my-materials', label: 'My Materials', icon: FileText },
    { path: '/student/payments', label: 'Payments', icon: CreditCard },
    { path: '/student/profile', label: 'Profile', icon: User },
  ];

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
        className={`fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-30 transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">Rajat's Equation</p>
              <p className="text-xs text-muted-foreground">Student Portal</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {displayNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User + Logout */}
          <div className="p-3 border-t border-border space-y-2">
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{studentName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {identity ? identity.getPrincipal().toString().slice(0, 16) + '…' : 'Student'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1 lg:flex-none" />
          <div className="flex items-center gap-2">
            <NotificationBell studentId={studentId} />
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
