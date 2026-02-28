import React from 'react';
import { BookOpen, CheckCircle, Clock, ArrowRight, AlertCircle } from 'lucide-react';
import { useMyEnrollment } from '../../hooks/useQueries';
import { Student } from '../../backend';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@tanstack/react-router';

function formatDate(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getPaymentBadge(student: Student): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
  const ps = student.paymentStatus;
  if (ps.__kind__ === 'upi') {
    if (ps.upi.__kind__ === 'approved') return { label: 'Active', variant: 'default' };
    if (ps.upi.__kind__ === 'pending') return { label: 'Payment Pending', variant: 'secondary' };
    if (ps.upi.__kind__ === 'rejected') return { label: 'Payment Rejected', variant: 'destructive' };
  }
  if (ps.__kind__ === 'stripe') {
    if (ps.stripe.__kind__ === 'completed') return { label: 'Active', variant: 'default' };
    if (ps.stripe.__kind__ === 'failed') return { label: 'Payment Failed', variant: 'destructive' };
  }
  return { label: 'Unknown', variant: 'outline' };
}

function isUpiPending(student: Student): boolean {
  const ps = student.paymentStatus;
  return ps.__kind__ === 'upi' && ps.upi.__kind__ === 'pending';
}

// Static available courses catalog
const AVAILABLE_COURSES = [
  {
    name: 'Mathematics Foundation',
    description: 'Build a strong foundation in mathematics covering algebra, geometry, and arithmetic.',
    level: 'Beginner',
    pricePerHour: 500,
  },
  {
    name: 'Advanced Mathematics',
    description: 'Deep dive into calculus, trigonometry, and advanced algebra for competitive exams.',
    level: 'Advanced',
    pricePerHour: 700,
  },
  {
    name: 'JEE Mathematics',
    description: 'Comprehensive JEE preparation covering all mathematics topics with practice problems.',
    level: 'Competitive',
    pricePerHour: 800,
  },
  {
    name: 'NEET Mathematics',
    description: 'Focused mathematics preparation for NEET aspirants.',
    level: 'Competitive',
    pricePerHour: 750,
  },
  {
    name: 'Board Exam Preparation',
    description: 'Targeted preparation for Class 10 and Class 12 board examinations.',
    level: 'Intermediate',
    pricePerHour: 600,
  },
];

export default function StudentCourses() {
  const { data: enrollment, isLoading: enrollmentLoading, error: enrollmentError } = useMyEnrollment();

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Courses</h1>
        <p className="text-muted-foreground text-sm mt-1">Your enrolled course and available courses to purchase</p>
      </div>

      {/* My Enrolled Course */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" /> My Enrolled Course
        </h2>

        {enrollmentLoading && (
          <Skeleton className="h-32 w-full rounded-xl" />
        )}

        {enrollmentError && (
          <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <AlertCircle className="h-4 w-4" />
            <span>Failed to load enrollment data. Please refresh.</span>
          </div>
        )}

        {!enrollmentLoading && !enrollmentError && !enrollment && (
          <div className="bg-muted/50 border border-dashed rounded-xl p-8 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="font-medium text-foreground">No course enrolled yet</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Browse the available courses below and register to get started.</p>
            <Link to="/register">
              <Button>
                Register for a Course <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}

        {!enrollmentLoading && !enrollmentError && enrollment && (() => {
          const badge = getPaymentBadge(enrollment);
          const pending = isUpiPending(enrollment);
          return (
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-xl p-6">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-bold text-foreground">{enrollment.course}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">{enrollment.sessionType} sessions</p>
                </div>
                <Badge variant={badge.variant} className="text-sm px-3 py-1">{badge.label}</Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <div className="bg-background/60 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Session Type</p>
                  <p className="font-semibold text-sm mt-0.5">{enrollment.sessionType}</p>
                </div>
                <div className="bg-background/60 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Total Hours</p>
                  <p className="font-semibold text-sm mt-0.5">{enrollment.hours.toString()} hrs</p>
                </div>
                <div className="bg-background/60 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Enrolled On</p>
                  <p className="font-semibold text-sm mt-0.5">{formatDate(enrollment.enrollmentDate)}</p>
                </div>
                <div className="bg-background/60 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className={`font-semibold text-sm mt-0.5 ${badge.variant === 'default' ? 'text-green-600' : badge.variant === 'secondary' ? 'text-amber-600' : 'text-red-600'}`}>
                    {badge.label}
                  </p>
                </div>
              </div>
              {pending && (
                <div className="mt-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
                  <Clock className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Your payment is under review. You'll be activated once the admin approves your payment.
                  </p>
                </div>
              )}
            </div>
          );
        })()}
      </section>

      {/* Available Courses */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" /> Available Courses
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Explore all available courses. Click "Enroll Now" to register and pay.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AVAILABLE_COURSES.map(course => (
            <div key={course.name} className="bg-card border rounded-xl p-5 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <Badge variant="outline" className="text-xs">{course.level}</Badge>
              </div>
              <h3 className="font-semibold text-foreground mb-2">{course.name}</h3>
              <p className="text-sm text-muted-foreground flex-1 mb-4">{course.description}</p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-primary">₹{course.pricePerHour}/hr</p>
                <Link to="/register">
                  <Button size="sm">
                    Enroll Now <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
