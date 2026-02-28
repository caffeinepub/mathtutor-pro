import { Link } from '@tanstack/react-router';
import { Calendar, FileText, Video, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { getAuthState } from '../../lib/auth';

interface LocalSession {
  id: string;
  studentId: string;
  date: string;
  time: string;
  duration: number;
  meetLink?: string;
  topic?: string;
  createdAt: string;
}

interface LocalMaterial {
  id: string;
  studentId: string;
  title: string;
  description?: string;
  fileUrl?: string;
  course: string;
  uploadedAt: string;
}

function getStudentData(studentId: string) {
  try {
    const raw = localStorage.getItem('rajats_equation_store');
    if (!raw) return { sessions: [], materials: [] };
    const store = JSON.parse(raw);

    const sessions: LocalSession[] = (store.sessions || []).filter(
      (s: LocalSession) => s.studentId === studentId
    );

    const materials: LocalMaterial[] = (store.materials || []).filter(
      (m: LocalMaterial) => m.studentId === studentId
    );

    return { sessions, materials };
  } catch {
    return { sessions: [], materials: [] };
  }
}

export default function StudentDashboard() {
  const auth = getAuthState();

  if (!auth) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Please log in to view your dashboard.
      </div>
    );
  }

  const studentId = auth.studentId || '';
  const { sessions, materials } = getStudentData(studentId);
  const now = new Date();

  const upcomingSessions = sessions
    .filter((s) => new Date(`${s.date}T${s.time}`) >= now)
    .sort(
      (a, b) =>
        new Date(`${a.date}T${a.time}`).getTime() -
        new Date(`${b.date}T${b.time}`).getTime()
    )
    .slice(0, 3);

  const recentMaterials = [...materials]
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, 3);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 mb-6 text-primary-foreground">
        <h1 className="text-2xl font-bold mb-1">Welcome back, {auth.name || 'Student'}! 👋</h1>
        <p className="text-primary-foreground/80 text-sm">
          Here's an overview of your learning journey.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Calendar className="w-6 h-6 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">{sessions.length}</p>
          <p className="text-xs text-muted-foreground">Total Classes</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Clock className="w-6 h-6 text-blue-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">{upcomingSessions.length}</p>
          <p className="text-xs text-muted-foreground">Upcoming</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <FileText className="w-6 h-6 text-green-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">{materials.length}</p>
          <p className="text-xs text-muted-foreground">Materials</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <BookOpen className="w-6 h-6 text-purple-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">
            {sessions.filter((s) => new Date(`${s.date}T${s.time}`) < now).length}
          </p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Classes */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> Upcoming Classes
            </h2>
            <Link
              to="/student/my-sessions"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {upcomingSessions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No upcoming classes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {session.topic || 'Class'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(session.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}{' '}
                      at {session.time} · {session.duration}h
                    </p>
                  </div>
                  {session.meetLink && (
                    <a
                      href={session.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
                    >
                      <Video className="w-3 h-3" /> Join
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Materials */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Recent Materials
            </h2>
            <Link
              to="/student/my-materials"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentMaterials.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No materials yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentMaterials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{material.title}</p>
                    {material.course && (
                      <p className="text-xs text-muted-foreground">{material.course}</p>
                    )}
                  </div>
                  {material.fileUrl && (
                    <a
                      href={material.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-xs text-primary hover:underline"
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
    </div>
  );
}
