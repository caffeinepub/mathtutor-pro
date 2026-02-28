import { useState, useEffect } from 'react';
import { Video, Calendar, Clock } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { getStore } from '../../lib/store';
import { getAuthState } from '../../lib/auth';
import type { Session } from '../../lib/store';

export default function StudentSessions() {
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [pastSessions, setPastSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    setLoading(true);
    try {
      const auth = getAuthState();
      if (!auth || !auth.studentId) {
        setLoading(false);
        return;
      }
      const store = getStore();
      const studentSessions = store.sessions.filter((s) => s.studentId === auth.studentId);
      const now = new Date();

      const upcoming = studentSessions
        .filter((s) => {
          const sessionDate = new Date(`${s.date}T${s.time}`);
          return sessionDate >= now && s.status !== 'cancelled';
        })
        .sort(
          (a, b) =>
            new Date(`${a.date}T${a.time}`).getTime() -
            new Date(`${b.date}T${b.time}`).getTime()
        );

      const past = studentSessions
        .filter((s) => {
          const sessionDate = new Date(`${s.date}T${s.time}`);
          return sessionDate < now || s.status === 'completed';
        })
        .sort(
          (a, b) =>
            new Date(`${b.date}T${b.time}`).getTime() -
            new Date(`${a.date}T${a.time}`).getTime()
        );

      setUpcomingSessions(upcoming);
      setPastSessions(past);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="text-muted-foreground">Loading sessions...</div>
      </div>
    );
  }

  const SessionCard = ({ session, isPast }: { session: Session; isPast: boolean }) => (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground">
                {session.title || session.topic || 'Class Session'}
              </h3>
              <Badge
                variant={isPast ? 'secondary' : 'default'}
                className={isPast ? '' : 'bg-blue-100 text-blue-700 border-blue-200'}
              >
                {isPast ? 'Completed' : 'Upcoming'}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(session.date).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {session.time}
              </span>
              <span>{session.duration} hour{session.duration !== 1 ? 's' : ''}</span>
            </div>
            {session.topic && session.title !== session.topic && (
              <p className="text-xs text-muted-foreground mt-1">Topic: {session.topic}</p>
            )}
          </div>
          {session.meetLink && !isPast && (
            <a
              href={session.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Video className="w-3.5 h-3.5" />
              Join
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const totalSessions = upcomingSessions.length + pastSessions.length;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Sessions</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {totalSessions} session{totalSessions !== 1 ? 's' : ''} total
        </p>
      </div>

      {totalSessions === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No sessions yet</p>
          <p className="text-sm mt-1">Your sessions will appear here once scheduled.</p>
        </div>
      ) : (
        <>
          {upcomingSessions.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Upcoming ({upcomingSessions.length})
              </h2>
              <div className="space-y-3">
                {upcomingSessions.map((s) => (
                  <SessionCard key={s.id} session={s} isPast={false} />
                ))}
              </div>
            </div>
          )}

          {pastSessions.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Past ({pastSessions.length})
              </h2>
              <div className="space-y-3">
                {pastSessions.map((s) => (
                  <SessionCard key={s.id} session={s} isPast={true} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
