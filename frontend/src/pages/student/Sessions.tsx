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

export default function StudentSessions() {
  const { identity } = useInternetIdentity();
  const principalObj = identity ? identity.getPrincipal() : null;
  const { data: sessions, isLoading, error } = useMyStudentSessions(principalObj);

  const upcoming = (sessions ?? []).filter(isUpcoming).sort((a, b) => a.date.localeCompare(b.date));
  const past = (sessions ?? []).filter(s => !isUpcoming(s)).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Sessions</h1>
        <p className="text-muted-foreground text-sm mt-1">All your scheduled and past tutoring sessions</p>
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

      {!isLoading && !error && (sessions ?? []).length === 0 && (
        <div className="text-center py-16">
          <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
          <h3 className="text-lg font-semibold text-foreground">No sessions yet</h3>
          <p className="text-muted-foreground text-sm mt-1">Your tutor will assign sessions once your enrollment is confirmed.</p>
        </div>
      )}

      {!isLoading && !error && (sessions ?? []).length > 0 && (
        <>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> Upcoming Sessions
                <Badge variant="default" className="ml-1">{upcoming.length}</Badge>
              </h2>
              <div className="space-y-3">
                {upcoming.map(session => (
                  <div key={session.id.toString()} className="bg-card border-l-4 border-l-primary border rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{session.topic ?? 'Tutoring Session'}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{session.date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{session.time}</span>
                        <span>{session.durationHours.toString()} hr{Number(session.durationHours) > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    {session.meetLink ? (
                      <a href={session.meetLink} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="flex-shrink-0">
                          <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Join Meeting
                        </Button>
                      </a>
                    ) : (
                      <Badge variant="outline" className="flex-shrink-0">Link pending</Badge>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Past */}
          {past.length > 0 && (
            <section>
              <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" /> Past Sessions
                <Badge variant="secondary" className="ml-1">{past.length}</Badge>
              </h2>
              <div className="space-y-3">
                {past.map(session => (
                  <div key={session.id.toString()} className="bg-card border rounded-xl p-4 flex items-center justify-between gap-4 opacity-75">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{session.topic ?? 'Tutoring Session'}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{session.date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{session.time}</span>
                        <span>{session.durationHours.toString()} hr{Number(session.durationHours) > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
