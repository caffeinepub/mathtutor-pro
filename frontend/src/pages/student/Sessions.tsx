import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getStore, getAuthState } from '../../lib/store';
import { Calendar, Video, Clock, MessageCircle, BookOpen } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export default function StudentSessions() {
  const auth = getAuthState();
  const store = getStore();
  const student = store.students.find((s) => s.userId === auth.userId);
  const sessions = student
    ? store.sessions.filter((s) => s.studentId === student.id)
    : [];

  const upcoming = sessions.filter((s) => s.status === 'scheduled');
  const past = sessions.filter((s) => s.status === 'completed' || s.status === 'cancelled');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-sky-100 text-sky-700 border-sky-300">Scheduled</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 border-green-300">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700 border-red-300">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const SessionCard = ({ session }: { session: typeof sessions[0] }) => (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-sky-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">{session.courseName}</h3>
          <p className="text-sm text-slate-500 capitalize">{session.sessionType} session</p>
        </div>
        {getStatusBadge(session.status)}
      </div>
      <div className="flex flex-wrap gap-3 text-sm text-slate-600 mb-3">
        <span className="flex items-center gap-1.5">
          <Calendar size={14} className="text-sky-500" />
          {new Date(session.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={14} className="text-sky-500" />
          {session.time}
        </span>
      </div>
      {session.meetLink && session.status === 'scheduled' && (
        <a href={session.meetLink} target="_blank" rel="noopener noreferrer">
          <Button className="w-full bg-sky-600 hover:bg-sky-700 text-white h-11 font-semibold">
            <Video size={16} className="mr-2" />
            Join Google Meet
          </Button>
        </a>
      )}
    </div>
  );

  const EmptyState = ({ type }: { type: 'upcoming' | 'past' }) => (
    <div className="text-center py-12 bg-sky-50 rounded-2xl border border-sky-100">
      <Calendar size={48} className="mx-auto text-sky-300 mb-3" />
      <h3 className="text-lg font-semibold text-slate-700 mb-2">
        {type === 'upcoming' ? 'No Upcoming Sessions' : 'No Past Sessions'}
      </h3>
      <p className="text-slate-500 mb-5 max-w-xs mx-auto">
        {type === 'upcoming'
          ? 'Book a session to get started with your learning journey.'
          : 'Your completed sessions will appear here.'}
      </p>
      {type === 'upcoming' && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/student/book">
            <Button className="bg-sky-600 hover:bg-sky-700 text-white h-11 px-5 font-semibold">
              <BookOpen size={16} className="mr-2" />
              Book a Session
            </Button>
          </Link>
          <Button
            variant="outline"
            className="border-green-400 text-green-700 hover:bg-green-50 h-11 px-5 font-semibold"
            onClick={() => window.open('https://wa.me/919424135055?text=Hi! I want to book a session.', '_blank')}
          >
            <MessageCircle size={16} className="mr-2" />
            WhatsApp Us
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">My Sessions</h1>
      <p className="text-slate-500 mb-6">View your upcoming and past learning sessions.</p>

      <Tabs defaultValue="upcoming">
        <TabsList className="mb-5 bg-sky-50 border border-sky-100">
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-sky-600 data-[state=active]:text-white font-medium">
            Upcoming ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="data-[state=active]:bg-sky-600 data-[state=active]:text-white font-medium">
            Past ({past.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcoming.length === 0 ? (
            <EmptyState type="upcoming" />
          ) : (
            <div className="space-y-4">
              {upcoming.map((s) => <SessionCard key={s.id} session={s} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {past.length === 0 ? (
            <EmptyState type="past" />
          ) : (
            <div className="space-y-4">
              {past.map((s) => <SessionCard key={s.id} session={s} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
