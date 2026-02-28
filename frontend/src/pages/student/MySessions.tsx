import { Calendar, Clock, Video, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { getAuthState } from '../../lib/auth';
import { getStore } from '../../lib/store';
import type { Session } from '../../lib/store';

function getAttendanceStatus(sessionId: string): 'present' | 'absent' | null {
  try {
    const raw = localStorage.getItem('rajats_equation_store');
    if (!raw) return null;
    const store = JSON.parse(raw);
    const attendance = store.attendance || [];
    const record = attendance.find((a: { sessionId: string; status: string }) => a.sessionId === sessionId);
    return record ? record.status : null;
  } catch {
    return null;
  }
}

export default function MySessions() {
  const auth = getAuthState();

  if (!auth) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p>Please log in to view your classes.</p>
      </div>
    );
  }

  const studentId = auth.studentId || '';
  const store = getStore();
  const sessions: Session[] = store.sessions.filter((s) => s.studentId === studentId);
  const now = new Date();

  const upcoming = sessions
    .filter((s) => new Date(`${s.date}T${s.time}`) >= now)
    .sort(
      (a, b) =>
        new Date(`${a.date}T${a.time}`).getTime() -
        new Date(`${b.date}T${b.time}`).getTime()
    );

  const past = sessions
    .filter((s) => new Date(`${s.date}T${s.time}`) < now)
    .sort(
      (a, b) =>
        new Date(`${b.date}T${b.time}`).getTime() -
        new Date(`${a.date}T${a.time}`).getTime()
    );

  const renderSession = (session: Session, isPast: boolean) => {
    const attendance = getAttendanceStatus(session.id);
    return (
      <div key={session.id} className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {isPast ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  Past
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  Upcoming
                </span>
              )}
              {attendance === 'present' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <CheckCircle className="w-3 h-3" /> Present
                </span>
              )}
              {attendance === 'absent' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  <XCircle className="w-3 h-3" /> Absent
                </span>
              )}
              {isPast && !attendance && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                  Not Marked
                </span>
              )}
            </div>

            {session.title && (
              <h3 className="font-semibold text-foreground mb-1">{session.title}</h3>
            )}
            {session.topic && (
              <p className="text-sm text-muted-foreground mb-1">{session.topic}</p>
            )}

            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(session.date).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {session.time}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {session.duration} hour{session.duration !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {session.meetLink && (
            <a
              href={session.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Video className="w-3.5 h-3.5" /> Join
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Classes</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {sessions.length} class{sessions.length !== 1 ? 'es' : ''} assigned to you
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No classes yet</p>
          <p className="text-sm mt-1">Your classes will appear here once the admin schedules them.</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Upcoming ({upcoming.length})
              </h2>
              <div className="space-y-3">{upcoming.map((s) => renderSession(s, false))}</div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Past ({past.length})
              </h2>
              <div className="space-y-3">{past.map((s) => renderSession(s, true))}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
