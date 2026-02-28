import React from 'react';
import { Users, BookOpen, Video, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useAllStudents, useGetAllPayments } from '../../hooks/useQueries';
import { Student } from '../../backend';
import { Skeleton } from '@/components/ui/skeleton';

function isActiveStudent(student: Student): boolean {
  const ps = student.paymentStatus;
  if (ps.__kind__ === 'upi' && ps.upi.__kind__ === 'approved') return true;
  if (ps.__kind__ === 'stripe' && ps.stripe.__kind__ === 'completed') return true;
  return false;
}

function isPendingStudent(student: Student): boolean {
  const ps = student.paymentStatus;
  return ps.__kind__ === 'upi' && ps.upi.__kind__ === 'pending';
}

function getPaymentStatusLabel(student: Student): { label: string; color: string } {
  const ps = student.paymentStatus;
  if (ps.__kind__ === 'upi') {
    if (ps.upi.__kind__ === 'approved') return { label: 'Active', color: 'text-green-600' };
    if (ps.upi.__kind__ === 'pending') return { label: 'Pending', color: 'text-amber-500' };
    if (ps.upi.__kind__ === 'rejected') return { label: 'Rejected', color: 'text-red-500' };
  }
  if (ps.__kind__ === 'stripe') {
    if (ps.stripe.__kind__ === 'completed') return { label: 'Active', color: 'text-green-600' };
    if (ps.stripe.__kind__ === 'failed') return { label: 'Failed', color: 'text-red-500' };
  }
  return { label: 'Unknown', color: 'text-muted-foreground' };
}

function formatDate(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminDashboard() {
  const { data: students, isLoading: studentsLoading } = useAllStudents();
  const { data: payments, isLoading: paymentsLoading } = useGetAllPayments();

  const totalStudents = students?.length ?? 0;
  const activeStudents = (students ?? []).filter(isActiveStudent).length;
  const pendingStudents = (students ?? []).filter(isPendingStudent).length;

  const totalPayments = payments?.length ?? 0;
  const approvedPayments = (payments ?? []).filter(p => p.status.__kind__ === 'approved').length;

  // Recent students (last 5 by enrollment date)
  const recentStudents = [...(students ?? [])]
    .sort((a, b) => Number(b.enrollmentDate) - Number(a.enrollmentDate))
    .slice(0, 5);

  const stats = [
    {
      label: 'Total Students',
      value: totalStudents,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950',
      loading: studentsLoading,
    },
    {
      label: 'Active / Booked',
      value: activeStudents,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-950',
      loading: studentsLoading,
    },
    {
      label: 'Pending Payment',
      value: pendingStudents,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950',
      loading: studentsLoading,
    },
    {
      label: 'Total Payments',
      value: totalPayments,
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950',
      loading: paymentsLoading,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your tutoring business</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-card border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            {stat.loading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            )}
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Students */}
      <div className="bg-card border rounded-xl p-5">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Users className="h-4 w-4" /> Recent Registrations
        </h2>
        {studentsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : recentStudents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No students registered yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentStudents.map(student => {
              const statusInfo = getPaymentStatusLabel(student);
              return (
                <div key={student.principal.toString()} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      {student.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">{student.fullName}</p>
                      <p className="text-xs text-muted-foreground">{student.course} · {student.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-medium ${statusInfo.color}`}>{statusInfo.label}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(student.enrollmentDate)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Payment Overview
          </h2>
          {paymentsLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Submitted</span>
                <span className="font-medium">{totalPayments}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Approved</span>
                <span className="font-medium text-green-600">{approvedPayments}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pending Review</span>
                <span className="font-medium text-amber-500">{totalPayments - approvedPayments}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-card border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Video className="h-4 w-4" /> Student Summary
          </h2>
          {studentsLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Registered</span>
                <span className="font-medium">{totalStudents}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active / Booked</span>
                <span className="font-medium text-green-600">{activeStudents}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Awaiting Approval</span>
                <span className="font-medium text-amber-500">{pendingStudents}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
