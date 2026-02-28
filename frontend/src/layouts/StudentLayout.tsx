import React from 'react';
import { Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { LayoutDashboard, Calendar, FileText, BookOpen, CreditCard, User, LogOut, Menu, X } from 'lucide-react';
import { getAuthState, clearAuthState } from '../lib/auth';
import NotificationBell from '../components/NotificationBell';

const navItems = [
  { to: '/student', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/student/my-sessions', label: 'My Classes', icon: Calendar },
  { to: '/student/my-materials', label: 'My Materials', icon: FileText },
  { to: '/student/courses', label: 'Courses', icon: BookOpen },
  { to: '/student/payments', label: 'Payments', icon: CreditCard },
  { to: '/student/profile', label: 'Profile', icon: User },
];

export default function StudentLayout() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const auth = getAuthState();
  const studentId = auth?.userId || '';

  const handleLogout = () => {
    clearAuthState();
    navigate({ to: '/login' });
  };

  const currentPath = routerState.location.pathname;

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return currentPath === to;
    return currentPath.startsWith(to);
  };

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
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-card border-r border-border flex flex-col transition-transform duration-200 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/assets/generated/logo-mark.dim_128x128.png"
              alt="Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="font-bold text-sm text-foreground leading-tight">
              The Rajat's<br />Equation
            </span>
          </Link>
        </div>

        {/* Student info */}
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs text-muted-foreground">Logged in as</p>
          <p className="text-sm font-medium text-foreground truncate">{auth?.name || 'Student'}</p>
          <p className="text-xs text-muted-foreground truncate">{auth?.email || ''}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.to, item.exact)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
