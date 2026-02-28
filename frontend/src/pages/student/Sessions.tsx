import React, { useState, useEffect } from 'react';
import { Video, Calendar, Clock, ExternalLink, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getStore, getAuthState, Session } from '../../lib/store';

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
      if (!auth || !auth.userId) {
        setLoading(false);
        return;
      }
      const store = getStore();
      const studentSessions = store.sessions.filter((s) => s.studentId === auth.userId);
      const now = new Date();

      const upcoming = studentSessions
        .filter((s) => {
          const sessionDate = new Date(`${s.date}T${s.time}`);
          return sessionDate >= now && s.status !== 'cancelled';
        })
        .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

      const past = studentSessions
        .filter((s) => {
          const sessionDate = new Date(`${s.date}T${s.time}`);
          return sessionDate < now || s.status === 'completed';
        })
        .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());

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
                {session.topic || 'Class Session'}
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
              <span>{session.durationHours} hour{session.durationHours !== 1 ? 's' : ''}</span>
            </div>
          </div>
          {!isPast && session.meetLink ? (
            <a href={session.meetLink} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="shrink-0">
                <Video className="w-3.5 h-3.5 mr-1" />
                Join
              </Button>
            </a>
          ) : session.meetLink ? (
            <a
              href={session.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Link
            </a>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Classes</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your scheduled and past Google Meet classes
        </p>
      </div>

      {/* Upcoming */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Video className="w-5 h-5 text-primary" />
          Upcoming Classes
          <span className="text-sm font-normal text-muted-foreground">({upcomingSessions.length})</span>
        </h2>
        {upcomingSessions.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <Video className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-muted-foreground text-sm">No upcoming classes scheduled.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your admin will schedule classes for you soon.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingSessions.map((s) => (
              <SessionCard key={s.id} session={s} isPast={false} />
            ))}
          </div>
        )}
      </section>

      {/* Past */}
      {pastSessions.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-muted-foreground" />
            Past Classes
            <span className="text-sm font-normal text-muted-foreground">({pastSessions.length})</span>
          </h2>
          <div className="space-y-3">
            {pastSessions.map((s) => (
              <SessionCard key={s.id} session={s} isPast={true} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
