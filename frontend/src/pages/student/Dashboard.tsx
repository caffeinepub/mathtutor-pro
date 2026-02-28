import React from 'react';
import { BookOpen, Video, Calendar, ExternalLink, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useMyEnrollment, useMyStudentSessions } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@tanstack/react-router';

function formatDate(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getPaymentBadge(student: any): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
  const ps = student.paymentStatus;
  if (ps.__kind === 'upi') {
    if (ps.upi.__kind === 'approved') return { label: 'Active', variant: 'default' };
    if (ps.upi.__kind === 'pending') return { label: 'Payment Pending', variant: 'secondary' };
    if (ps.upi.__kind === 'rejected') return { label: 'Payment Rejected', variant: 'destructive' };
  }
  if (ps.__kind === 'stripe') {
    if (ps.stripe.__kind === 'completed') return { label: 'Active', variant: 'default' };
    if (ps.stripe.__kind === 'failed') return { label: 'Payment Failed', variant: 'destructive' };
  }
  return { label: 'Unknown', variant: 'outline' };
}

export default function StudentDashboard() {
  const { identity } = useInternetIdentity();
  const principalObj = identity ? identity.getPrincipal() : null;

  const { data: enrollment, isLoading: enrollmentLoading, error: enrollmentError } = useMyEnrollment();
  const { data: sessions, isLoading: sessionsLoading } = useMyStudentSessions(principalObj);

  const now = new Date();
  const upcomingSessions = (sessions ?? [])
    .filter(s => {
      try {
        const sessionDate = new Date(`${s.date}T${s.time}`);
        return sessionDate >= now;
      } catch { return false; }
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const userName = enrollment?.fullName ?? identity?.getPrincipal().toString().slice(0, 8) ?? 'Student';

  return (
    <div className="p-6 space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">Welcome back, {enrollment?.fullName ?? 'Student'}! 👋</h1>
        <p className="text-primary-foreground/80 mt-1 text-sm">
          {enrollment ? `Enrolled in ${enrollment.course}` : 'Complete your registration to get started'}
        </p>
      </div>

      {/* Enrollment Card */}
      <div className="bg-card border rounded-xl p-5">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4" /> My Enrollment
        </h2>

        {enrollmentLoading && (
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        )}

        {enrollmentError && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>Failed to load enrollment data</span>
          </div>
        )}

        {!enrollmentLoading && !enrollmentError && !enrollment && (
          <div className="text-center py-6">
            <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground text-sm mb-4">You haven't enrolled in any course yet.</p>
            <Link to="/register">
              <Button>
                Browse & Register for a Course <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}

        {!enrollmentLoading && !enrollmentError && enrollment && (() => {
          const badge = getPaymentBadge(enrollment);
          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="font-semibold text-lg text-foreground">{enrollment.course}</p>
                  <p className="text-sm text-muted-foreground">{enrollment.sessionType} · {enrollment.hours.toString()} hours</p>
                </div>
                <Badge variant={badge.variant}>{badge.label}</Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Enrolled On</p>
                  <p className="font-medium">{formatDate(enrollment.enrollmentDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Session Type</p>
                  <p className="font-medium">{enrollment.sessionType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Hours</p>
                  <p className="font-medium">{enrollment.hours.toString()} hrs</p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-card border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Video className="h-4 w-4" /> Upcoming Sessions
          </h2>
          <Link to="/student/sessions">
            <Button variant="ghost" size="sm" className="text-xs">View All</Button>
          </Link>
        </div>

        {sessionsLoading && (
          <div className="space-y-2">
            {[1, 2].map(i => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        )}

        {!sessionsLoading && upcomingSessions.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No upcoming sessions scheduled yet.</p>
            <p className="text-xs mt-1">Your tutor will assign sessions soon.</p>
          </div>
        )}

        {!sessionsLoading && upcomingSessions.length > 0 && (
          <div className="space-y-3">
            {upcomingSessions.map(session => (
              <div key={session.id.toString()} className="border rounded-lg p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-sm">{session.topic ?? 'Session'}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{session.date}</span>
                    <span>{session.time}</span>
                    <span>{session.durationHours.toString()}h</span>
                  </div>
                </div>
                {session.meetLink && (
                  <a href={session.meetLink} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="flex-shrink-0">
                      <ExternalLink className="h-3.5 w-3.5 mr-1" /> Join
                    </Button>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/student/courses">
          <div className="bg-card border rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer">
            <BookOpen className="h-6 w-6 text-primary mb-2" />
            <p className="font-medium text-sm">My Courses</p>
            <p className="text-xs text-muted-foreground">View enrolled & available courses</p>
          </div>
        </Link>
        <Link to="/student/sessions">
          <div className="bg-card border rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer">
            <Video className="h-6 w-6 text-primary mb-2" />
            <p className="font-medium text-sm">My Sessions</p>
            <p className="text-xs text-muted-foreground">View all scheduled sessions</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
