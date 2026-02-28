import { Outlet, useNavigate, Link, useRouterState } from '@tanstack/react-router';
import { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  FileText,
  CreditCard,
  PlusCircle,
  User,
  LogOut,
  Menu,
  X,
  Video,
  BookMarked,
} from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { clearAuthState, getAuthState } from '../lib/auth';
import { useQueryClient } from '@tanstack/react-query';
import NotificationBell from '../components/NotificationBell';

const navItems = [
  { path: '/student', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/student/courses', label: 'Courses', icon: BookOpen },
  { path: '/student/sessions', label: 'Sessions', icon: Calendar },
  { path: '/student/my-sessions', label: 'My Classes', icon: Video },
  { path: '/student/materials', label: 'Materials', icon: FileText },
  { path: '/student/my-materials', label: 'My Materials', icon: BookMarked },
  { path: '/student/payments', label: 'Payments', icon: CreditCard },
  { path: '/student/book', label: 'Book Session', icon: PlusCircle },
  { path: '/student/profile', label: 'Profile', icon: User },
];

export default function StudentLayout() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const authState = getAuthState();
  const studentId = authState?.studentId ?? null;
  const currentPath = routerState.location.pathname;

  // Redirect if not authenticated
  if (!authState || authState.role !== 'student') {
    navigate({ to: '/login' });
    return null;
  }

  const handleLogout = async () => {
    try {
      await clear();
    } catch {
      // ignore II errors
    }
    clearAuthState();
    queryClient.clear();
    navigate({ to: '/login' });
  };

  const principalStr = identity?.getPrincipal().toString();
  const principalDisplay = principalStr ? principalStr.slice(0, 12) + '...' : '';

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
        className={`fixed top-0 left-0 h-full w-64 bg-navy text-white z-30 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <img src="/assets/generated/logo-mark.dim_128x128.png" alt="Logo" className="w-8 h-8 rounded" />
            <div>
              <p className="font-bold text-sm leading-tight">Rajat's Equation</p>
              <p className="text-xs text-white/60">Student Portal</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/60 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-xs text-white/60">Logged in as</p>
          <p className="text-sm font-medium text-white truncate">
            {authState.name ?? principalDisplay}
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
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
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-gold text-navy font-semibold'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/10 hover:text-white w-full transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-card border-b border-border px-4 py-3 flex items-center gap-4 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <Menu size={22} />
          </button>
          <h1 className="font-semibold text-foreground text-sm">
            {navItems.find((n) =>
              n.path === '/student'
                ? currentPath === '/student' || currentPath === '/student/'
                : currentPath.startsWith(n.path)
            )?.label ?? 'Student Portal'}
          </h1>
          <div className="ml-auto flex items-center gap-3">
            {studentId && <NotificationBell studentId={studentId} />}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
