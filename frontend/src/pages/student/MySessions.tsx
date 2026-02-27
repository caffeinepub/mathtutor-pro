import React from 'react';
import { useGetSessionsForStudent } from '../../hooks/useSessions';
import { useGetAttendanceForStudent } from '../../hooks/useAttendance';
import { getAuthState } from '../../lib/auth';
import { getStore } from '../../lib/store';
import { AttendanceStatus } from '../../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Video,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

function getStudentPaymentId(): bigint | null {
  const auth = getAuthState();
  if (!auth) return null;
  const store = getStore();
  const student = store.students.find(s => s.userId === auth.userId);
  if (!student?.accessCode) return null;
  const match = student.accessCode.match(/RJMATH-(\d+)/);
  if (!match) return null;
  return BigInt(parseInt(match[1], 10));
}

export default function MySessions() {
  const studentId = getStudentPaymentId();
  const { data: sessions = [], isLoading: sessionsLoading } = useGetSessionsForStudent(studentId);
  const { data: attendanceRecords = [], isLoading: attendanceLoading } =
    useGetAttendanceForStudent(studentId);

  const isLoading = sessionsLoading || attendanceLoading;

  const getAttendanceForSession = (sessionId: bigint) => {
    return attendanceRecords.find(a => a.sessionId === sessionId);
  };

  const sortedSessions = [...sessions].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`).getTime();
    const dateB = new Date(`${b.date}T${b.time}`).getTime();
    return dateB - dateA;
  });

  if (!studentId) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No access code linked to your account. Please contact your tutor.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Sessions</h1>
        <p className="text-muted-foreground mt-1">All your scheduled and past sessions</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : sortedSessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Sessions Yet</h3>
            <p className="text-muted-foreground">
              Your tutor hasn't scheduled any sessions for you yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sortedSessions.map(session => {
            const attendance = getAttendanceForSession(session.id);
            const sessionDate = new Date(`${session.date}T${session.time}`);
            const isPast = sessionDate < new Date();

            return (
              <Card key={session.id.toString()} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg">{session.topic ?? 'Session'}</CardTitle>
                    <div className="flex items-center gap-2 shrink-0">
                      {attendance ? (
                        attendance.status === AttendanceStatus.present ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Present
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Absent
                          </Badge>
                        )
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Not Marked
                        </Badge>
                      )}
                      {isPast ? (
                        <Badge variant="secondary">Past</Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          Upcoming
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{session.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{session.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {session.durationHours.toString()} hour
                        {session.durationHours > 1n ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <a href={session.meetLink} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="w-full md:w-auto gap-2">
                      <Video className="h-5 w-5" />
                      Join Session on Google Meet
                    </Button>
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
