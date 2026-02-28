import React from 'react';
import { Link } from '@tanstack/react-router';
import { Calendar, FileText, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { getAuthState } from '../../lib/auth';
import { getStore } from '../../lib/store';
import { useCanisterHealth } from '../../hooks/useCanisterHealth';

export default function StudentDashboard() {
  const auth = getAuthState();
  const { isOnline } = useCanisterHealth();

  let studentName = auth?.name || 'Student';
  let upcomingSessions: Array<{
    id: string;
    date: string;
    time: string;
    duration: number;
    title: string;
    meetLink?: string;
  }> = [];
  let recentMaterials: Array<{
    id: string;
    title: string;
    course: string;
    fileUrl?: string;
    uploadedAt: string;
  }> = [];
  let totalSessions = 0;
  let totalMaterials = 0;
  let enrolledCourse = '';

  try {
    const store = getStore();
    const studentId = auth?.studentId;

    if (studentId) {
      const student = store.students.find(s => s.id === studentId);
      if (student) {
        studentName = student.name;
        enrolledCourse = student.course || '';
      }

      const sessions = store.sessions
        .filter(s => s.studentId === studentId)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      totalSessions = sessions.length;
      upcomingSessions = sessions
        .filter(s => new Date(`${s.date}T${s.time || '00:00'}`) >= new Date())
        .slice(0, 3)
        .map(s => ({
          id: s.id,
          date: s.date,
          time: s.time || '',
          duration: s.duration || 1,
          title: s.title || s.topic || enrolledCourse || 'Class',
          meetLink: s.meetLink,
        }));

      const materials = store.materials
        .filter(m => m.studentId === studentId)
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

      totalMaterials = materials.length;
      recentMaterials = materials.slice(0, 3).map(m => ({
        id: m.id,
        title: m.title,
        course: m.course || enrolledCourse,
        fileUrl: m.fileUrl,
        uploadedAt: m.uploadedAt,
      }));
    }
  } catch {
    // ignore store errors
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-primary text-primary-foreground p-6">
        <h1 className="text-xl font-bold">
          {greeting()}, {studentName}! 👋
        </h1>
        <p className="text-primary-foreground/80 text-sm mt-1">
          {enrolledCourse ? `Enrolled in: ${enrolledCourse}` : 'Welcome to your learning portal'}
        </p>
        {!isOnline && (
          <p className="text-primary-foreground/70 text-xs mt-2">
            📶 Viewing cached data — connect to internet for latest updates
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Calendar className="h-4 w-4" />
            Total Classes
          </div>
          <p className="text-2xl font-bold text-foreground">{totalSessions}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <FileText className="h-4 w-4" />
            Materials
          </div>
          <p className="text-2xl font-bold text-foreground">{totalMaterials}</p>
        </div>
      </div>

      {/* Upcoming sessions */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Upcoming Classes
          </h2>
          <Link to="/student/my-sessions" className="text-xs text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {upcomingSessions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No upcoming classes scheduled.
          </p>
        ) : (
          <div className="space-y-3">
            {upcomingSessions.map(session => (
              <div key={session.id} className="flex items-start gap-3 p-3 rounded-lg bg-accent/30">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{session.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {session.date} at {session.time}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {session.duration}h
                  </p>
                </div>
                {session.meetLink && (
                  <a
                    href={session.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline shrink-0"
                  >
                    Join
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent materials */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Recent Materials
          </h2>
          <Link to="/student/my-materials" className="text-xs text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {recentMaterials.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No materials uploaded yet.
          </p>
        ) : (
          <div className="space-y-3">
            {recentMaterials.map(mat => (
              <div key={mat.id} className="flex items-start gap-3 p-3 rounded-lg bg-accent/30">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{mat.title}</p>
                  <p className="text-xs text-muted-foreground">{mat.course}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(mat.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                {mat.fileUrl && (
                  <a
                    href={mat.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline shrink-0"
                  >
                    View
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
