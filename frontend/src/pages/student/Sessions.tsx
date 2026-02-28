import React from 'react';
import { Calendar, Clock, Video, WifiOff } from 'lucide-react';
import { getAuthState } from '../../lib/auth';
import { getStore } from '../../lib/store';
import { useCanisterHealth } from '../../hooks/useCanisterHealth';

export default function StudentSessions() {
  const auth = getAuthState();
  const { isOnline } = useCanisterHealth();

  let sessions: Array<{
    id: string;
    date: string;
    time: string;
    duration: number;
    title: string;
    meetLink?: string;
    topic?: string;
  }> = [];

  try {
    const store = getStore();
    const studentId = auth?.studentId;
    if (studentId) {
      sessions = store.sessions
        .filter(s => s.studentId === studentId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map(s => ({
          id: s.id,
          date: s.date,
          time: s.time || '',
          duration: s.duration || 1,
          title: s.title || s.topic || 'Class',
          meetLink: s.meetLink,
          topic: s.topic,
        }));
    }
  } catch {
    // ignore
  }

  const upcoming = sessions.filter(
    s => new Date(`${s.date}T${s.time || '00:00'}`) >= new Date()
  );
  const past = sessions.filter(
    s => new Date(`${s.date}T${s.time || '00:00'}`) < new Date()
  );

  const SessionCard = ({ session }: { session: typeof sessions[0] }) => (
    <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Calendar className="h-6 w-6 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground">{session.title}</p>
        {session.topic && session.topic !== session.title && (
          <p className="text-sm text-muted-foreground">{session.topic}</p>
        )}
        <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {session.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {session.time} · {session.duration}h
          </span>
        </div>
      </div>
      {session.meetLink && (
        <a
          href={session.meetLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
        >
          <Video className="h-3 w-3" />
          Join
        </a>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Sessions</h1>
        {!isOnline && (
          <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-full">
            <WifiOff className="h-3 w-3" />
            Cached
          </span>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No sessions scheduled yet.</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Upcoming ({upcoming.length})
              </h2>
              {upcoming.map(s => <SessionCard key={s.id} session={s} />)}
            </div>
          )}
          {past.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Past ({past.length})
              </h2>
              {past.map(s => <SessionCard key={s.id} session={s} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
