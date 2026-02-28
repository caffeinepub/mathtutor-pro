import React from 'react';
import { Video, Calendar, Clock, ExternalLink, AlertCircle } from 'lucide-react';
import { useMyStudentSessions } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Session } from '../../backend';

function isUpcoming(session: Session): boolean {
  try {
    const sessionDate = new Date(`${session.date}T${session.time}`);
    return sessionDate >= new Date();
  } catch { return false; }
}

export default function MySessions() {
  const { identity } = useInternetIdentity();
  const principalObj = identity ? identity.getPrincipal() : null;
  const { data: sessions, isLoading, error } = useMyStudentSessions(principalObj);

  const sorted = [...(sessions ?? [])].sort((a, b) => {
    const da = new Date(`${a.date}T${a.time}`).getTime();
    const db = new Date(`${b.date}T${b.time}`).getTime();
    return db - da;
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Classes</h1>
        <p className="text-muted-foreground text-sm mt-1">All your tutoring sessions sorted by date</p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <AlertCircle className="h-4 w-4" />
          <span>Failed to load sessions. Please refresh.</span>
        </div>
      )}

      {!isLoading && !error && sorted.length === 0 && (
        <div className="text-center py-16">
          <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
          <h3 className="text-lg font-semibold text-foreground">No classes yet</h3>
          <p className="text-muted-foreground text-sm mt-1">Your tutor will schedule classes once your enrollment is confirmed.</p>
        </div>
      )}

      {!isLoading && !error && sorted.length > 0 && (
        <div className="space-y-3">
          {sorted.map(session => {
            const upcoming = isUpcoming(session);
            return (
              <div
                key={session.id.toString()}
                className={`bg-card border rounded-xl p-4 flex items-center justify-between gap-4 ${upcoming ? 'border-l-4 border-l-primary' : 'opacity-80'}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground">{session.topic ?? 'Tutoring Session'}</p>
                    <Badge variant={upcoming ? 'default' : 'secondary'} className="text-xs">
                      {upcoming ? 'Upcoming' : 'Past'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{session.date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{session.time}</span>
                    <span>{session.durationHours.toString()} hr{Number(session.durationHours) > 1 ? 's' : ''}</span>
                  </div>
                </div>
                {upcoming && session.meetLink ? (
                  <a href={session.meetLink} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="flex-shrink-0">
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Join
                    </Button>
                  </a>
                ) : upcoming && !session.meetLink ? (
                  <Badge variant="outline" className="flex-shrink-0">Link pending</Badge>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
