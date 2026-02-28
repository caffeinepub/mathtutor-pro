import { Outlet, useNavigate, Link, useRouterState } from '@tanstack/react-router';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BookOpen,
  FileText,
  Bell,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Calendar,
  ClipboardList,
  BookMarked,
  Activity,
} from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { clearAuthState } from '../lib/auth';
import { useQueryClient } from '@tanstack/react-query';
import { useCanisterHealth } from '../hooks/useCanisterHealth';
import { useGetPendingPayments } from '../hooks/useQueries';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/students', label: 'Students', icon: Users },
  { path: '/admin/payments', label: 'Payments', icon: CreditCard },
  { path: '/admin/sessions', label: 'Sessions', icon: Calendar },
  { path: '/admin/courses', label: 'Courses', icon: BookOpen },
  { path: '/admin/materials', label: 'Materials', icon: FileText },
  { path: '/admin/notifications', label: 'Notifications', icon: Bell },
  { path: '/admin/manage-sessions', label: 'Manage Classes', icon: ClipboardList },
  { path: '/admin/manage-materials', label: 'Manage Materials', icon: BookMarked },
  { path: '/admin/attendance', label: 'Attendance', icon: GraduationCap },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { isOnline } = useCanisterHealth();
  const { data: pendingPayments } = useGetPendingPayments();

  const pendingCount = pendingPayments?.length ?? 0;
  const currentPath = routerState.location.pathname;

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
              <p className="text-xs text-white/60">Admin Portal</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/60 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Health indicator */}
        <div className="px-4 py-2 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs">
            <Activity size={12} className={isOnline ? 'text-green-400' : 'text-red-400'} />
            <span className={isOnline ? 'text-green-400' : 'text-red-400'}>
              {isOnline ? 'Backend Online' : 'Backend Offline'}
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
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
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors relative ${
                  isActive
                    ? 'bg-gold text-navy font-semibold'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.label === 'Payments' && pendingCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
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
              n.path === '/admin'
                ? currentPath === '/admin' || currentPath === '/admin/'
                : currentPath.startsWith(n.path)
            )?.label ?? 'Admin Portal'}
          </h1>
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <span>Admin</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
