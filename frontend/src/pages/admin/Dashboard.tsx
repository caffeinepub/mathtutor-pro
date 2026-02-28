import React from 'react';
import { Link } from '@tanstack/react-router';
import { useActor } from '../../hooks/useActor';
import { useQuery } from '@tanstack/react-query';
import { Users, Calendar, FileText, CreditCard, Clock, CheckCircle, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const { actor } = useActor();

  const { data: payments = [] } = useQuery({
    queryKey: ['allPayments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPayments();
    },
    enabled: !!actor,
  });

  // Get local sessions and materials
  const getLocalCounts = () => {
    try {
      const raw = localStorage.getItem('rajats_equation_store');
      if (!raw) return { sessions: 0, materials: 0 };
      const store = JSON.parse(raw);
      return {
        sessions: (store.adminSessions || []).length,
        materials: (store.adminMaterials || []).length,
      };
    } catch {
      return { sessions: 0, materials: 0 };
    }
  };

  const { sessions: sessionCount, materials: materialCount } = getLocalCounts();

  const totalStudents = payments.length;
  const activeStudents = payments.filter(p => p.status.__kind__ === 'approved').length;
  const pendingStudents = payments.filter(p => p.status.__kind__ === 'pending').length;
  const approvedPayments = payments.filter(p => p.status.__kind__ === 'approved').length;

  const recentStudents = [...payments]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 5);

  const getLocalSessions = () => {
    try {
      const raw = localStorage.getItem('rajats_equation_store');
      if (!raw) return [];
      const store = JSON.parse(raw);
      return (store.adminSessions || [])
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
    } catch {
      return [];
    }
  };

  const recentSessions = getLocalSessions();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of The Rajat's Equation platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 col-span-1">
          <Users className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
          <p className="text-xs text-muted-foreground">Total Students</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 col-span-1">
          <CheckCircle className="w-5 h-5 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{activeStudents}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 col-span-1">
          <Clock className="w-5 h-5 text-yellow-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{pendingStudents}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 col-span-1">
          <Calendar className="w-5 h-5 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{sessionCount}</p>
          <p className="text-xs text-muted-foreground">Classes</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 col-span-1">
          <FileText className="w-5 h-5 text-purple-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{materialCount}</p>
          <p className="text-xs text-muted-foreground">Materials</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 col-span-1">
          <CreditCard className="w-5 h-5 text-emerald-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{approvedPayments}</p>
          <p className="text-xs text-muted-foreground">Approved</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Recent Students
            </h2>
            <Link to="/admin/students" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentStudents.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">No students yet.</div>
          ) : (
            <div className="space-y-2">
              {recentStudents.map(p => (
                <div key={String(p.id)} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                  </div>
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                    p.status.__kind__ === 'approved'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : p.status.__kind__ === 'rejected'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {p.status.__kind__ === 'approved' ? 'ACTIVE' : p.status.__kind__ === 'rejected' ? 'REJECTED' : 'PENDING'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Classes */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> Recent Classes
            </h2>
            <Link to="/admin/sessions" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentSessions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">No classes created yet.</div>
          ) : (
            <div className="space-y-2">
              {recentSessions.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {s.topic || 'Class'} — {s.studentName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.date} at {s.time} · {s.durationHours}h
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
