import React from 'react';
import { User, Mail, Phone, BookOpen, Key, WifiOff } from 'lucide-react';
import { getAuthState } from '../../lib/auth';
import { getStore } from '../../lib/store';
import { useCanisterHealth } from '../../hooks/useCanisterHealth';

export default function StudentProfile() {
  const auth = getAuthState();
  const { isOnline } = useCanisterHealth();

  let student: {
    name: string;
    email: string;
    phone: string;
    course: string;
    sessionType: string;
    hours: number;
    accessCode?: string;
    uniqueCode?: string;
    createdAt: string;
  } | null = null;

  let pricePerHour = 0;

  try {
    const store = getStore();
    const studentId = auth?.studentId;
    if (studentId) {
      const found = store.students.find(s => s.id === studentId);
      if (found) {
        student = {
          name: found.name,
          email: found.email,
          phone: found.phone || '',
          course: found.course || '',
          sessionType: found.sessionType || '',
          hours: found.hours || 0,
          accessCode: found.accessCode,
          uniqueCode: found.uniqueCode,
          createdAt: found.createdAt || '',
        };
        // Look up price from the matching course
        const matchedCourse = store.courses.find(c => c.name === found.course);
        if (matchedCourse) {
          pricePerHour = matchedCourse.pricePerHour;
        }
      }
    }
  } catch {
    // ignore
  }

  // Fallback to auth state if store doesn't have the student
  if (!student && auth) {
    student = {
      name: auth.name || 'Student',
      email: auth.email || '',
      phone: '',
      course: '',
      sessionType: '',
      hours: 0,
      accessCode: auth.accessCode,
      uniqueCode: auth.uniqueCode,
      createdAt: '',
    };
  }

  const InfoRow = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: React.ElementType;
    label: string;
    value: string;
  }) => (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value || '—'}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">My Profile</h1>
        {!isOnline && (
          <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-full">
            <WifiOff className="h-3 w-3" />
            Cached
          </span>
        )}
      </div>

      {!student ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <User className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Profile not found.</p>
        </div>
      ) : (
        <>
          {/* Avatar */}
          <div className="rounded-xl border border-border bg-card p-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{student.name}</h2>
              <p className="text-sm text-muted-foreground">{student.course || 'Student'}</p>
              {student.createdAt && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Joined {new Date(student.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Personal Info
            </h3>
            <InfoRow icon={User} label="Full Name" value={student.name} />
            <InfoRow icon={Mail} label="Email" value={student.email} />
            <InfoRow icon={Phone} label="Phone" value={student.phone} />
          </div>

          {/* Course info */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Enrollment
            </h3>
            <InfoRow icon={BookOpen} label="Course" value={student.course} />
            <InfoRow icon={BookOpen} label="Session Type" value={student.sessionType} />
            {student.hours > 0 && (
              <InfoRow icon={BookOpen} label="Hours" value={`${student.hours}h`} />
            )}
            {pricePerHour > 0 && (
              <InfoRow
                icon={BookOpen}
                label="Rate"
                value={`₹${pricePerHour}/hr`}
              />
            )}
          </div>

          {/* Access codes */}
          {(student.accessCode || student.uniqueCode) && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Access Credentials
              </h3>
              {student.accessCode && (
                <InfoRow icon={Key} label="Access Code" value={student.accessCode} />
              )}
              {student.uniqueCode && (
                <InfoRow icon={Key} label="Unique Code" value={student.uniqueCode} />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
