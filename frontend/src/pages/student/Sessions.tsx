import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { getStore, type Session } from '../../lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Video, Plus } from 'lucide-react';
import WhatsAppButton from '@/components/WhatsAppButton';

export default function StudentSessions() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  const store = getStore();

  const student = store.students.find((s) => s.userId === currentUser?.id);
  const sessions: Session[] = store.sessions.filter((s) => s.studentId === student?.id);

  const now = new Date();
  const upcomingSessions = sessions.filter(
    (s) =>
      (s.status === 'confirmed' || s.status === 'pending') && new Date(s.date) >= now
  );
  const pastSessions = sessions.filter(
    (s) => s.status === 'completed' || new Date(s.date) < now
  );

  const statusVariant = (
    status: string
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (status === 'confirmed') return 'default';
    if (status === 'pending') return 'secondary';
    if (status === 'completed') return 'outline';
    return 'destructive';
  };

  const getCourse = (courseId: string) =>
    store.courses.find((c) => c.id === courseId);

  const SessionCard = ({ session }: { session: Session }) => {
    const course = getCourse(session.courseId);
    return (
      <Card className="border-border hover:shadow-sm transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-foreground">
                    {session.courseName || course?.name || 'Unknown Course'}
                  </p>
                  <Badge
                    variant={statusVariant(session.status)}
                    className="text-xs capitalize"
                  >
                    {session.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {session.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {session.time} ({session.duration}min)
                  </span>
                  <span className="capitalize">{session.type}</span>
                </div>
                {session.meetLink && session.status === 'confirmed' && (
                  <a
                    href={session.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                  >
                    <Video className="w-3 h-3" />
                    Join Meet
                  </a>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-primary">
                ₹{session.price?.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Sessions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link to="/student/book">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" /> Book Session
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingSessions.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastSessions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-3 mt-4">
          {upcomingSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-muted rounded-full mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Upcoming Sessions
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Book a session to get started with your learning.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/student/book">
                  <Button size="sm">Book a Session</Button>
                </Link>
                <WhatsAppButton
                  label="Book via WhatsApp"
                  message="Hi, I want to book a session for mathematics coaching."
                  className="text-sm py-2 px-4"
                />
              </div>
            </div>
          ) : (
            upcomingSessions
              .slice()
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((session) => <SessionCard key={session.id} session={session} />)
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-3 mt-4">
          {pastSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-muted rounded-full mb-4">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Past Sessions</h3>
              <p className="text-muted-foreground text-sm">
                Your completed sessions will appear here.
              </p>
            </div>
          ) : (
            pastSessions
              .slice()
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((session) => <SessionCard key={session.id} session={session} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
