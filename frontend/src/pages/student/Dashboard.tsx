import React from 'react';
import { Link } from '@tanstack/react-router';
import { getAuthState } from '../../lib/auth';
import { getStore } from '../../lib/store';
import { useGetSessionsForStudent } from '../../hooks/useSessions';
import { useGetMaterialsForStudent } from '../../hooks/useMaterials';
import { useGetAttendanceForStudent, useGetAttendanceSummary } from '../../hooks/useAttendance';
import { AttendanceStatus } from '../../backend';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Video,
  BookOpen,
  ClipboardList,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Link as LinkIcon,
  AlertCircle,
} from 'lucide-react';

function getStudentPaymentId(): bigint | null {
  const store = getStore();
  const auth = getAuthState();
  if (!auth) return null;
  const student = store.students.find(s => s.userId === auth.userId);
  if (!student?.accessCode) return null;
  const match = student.accessCode.match(/RJMATH-(\d+)/);
  if (!match) return null;
  return BigInt(parseInt(match[1], 10));
}

export default function StudentDashboard() {
  const auth = getAuthState();
  const store = getStore();
  const student = auth ? store.students.find(s => s.userId === auth.userId) : null;
  const studentId = getStudentPaymentId();

  const { data: sessions = [], isLoading: sessionsLoading } = useGetSessionsForStudent(studentId);
  const { data: materials = [], isLoading: materialsLoading } = useGetMaterialsForStudent(studentId);
  const { data: attendanceRecords = [] } = useGetAttendanceForStudent(studentId);
  const { data: summary, isLoading: summaryLoading } = useGetAttendanceSummary(studentId);

  if (!student) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Please log in to view your dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (student.status === 'pending') {
    return (
      <div className="p-6">
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-4">⏳</div>
            <h2 className="text-xl font-bold mb-2">Application Under Review</h2>
            <p className="text-muted-foreground">
              Your registration is pending admin approval. You'll be notified once approved.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (student.status === 'rejected') {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-bold mb-2">Application Not Approved</h2>
            <p className="text-muted-foreground">
              Your registration was not approved. Please contact support for more information.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getAttendanceForSession = (sessionId: bigint) => {
    return attendanceRecords.find(a => a.sessionId === sessionId);
  };

  const upcomingSessions = sessions
    .filter(s => new Date(`${s.date}T${s.time}`) >= new Date())
    .sort(
      (a, b) =>
        new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
    )
    .slice(0, 3);

  const recentMaterials = [...materials]
    .sort((a, b) => Number(b.uploadedAt) - Number(a.uploadedAt))
    .slice(0, 3);

  const downloadFile = (fileData: Uint8Array, title: string) => {
    const blob = new Blob([new Uint8Array(fileData.buffer as ArrayBuffer)]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = title;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold mb-1">Welcome back, {student.name}! 👋</h1>
        <p className="opacity-90">Here's your learning overview</p>
        {student.accessCode && (
          <div className="mt-3 inline-flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5 text-sm">
            <span className="font-mono font-bold">{student.accessCode}</span>
          </div>
        )}
      </div>

      {/* Attendance Summary Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          My Attendance Summary
        </h2>
        {summaryLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <Card className="text-center">
              <CardContent className="pt-6 pb-4">
                <div className="text-3xl font-bold text-foreground">
                  {summary ? summary.totalSessions.toString() : '0'}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Total Sessions</div>
              </CardContent>
            </Card>
            <Card className="text-center border-green-200">
              <CardContent className="pt-6 pb-4">
                <div className="text-3xl font-bold text-green-600">
                  {summary ? summary.presentCount.toString() : '0'}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Present</div>
              </CardContent>
            </Card>
            <Card className="text-center border-red-200">
              <CardContent className="pt-6 pb-4">
                <div className="text-3xl font-bold text-red-500">
                  {summary ? summary.absentCount.toString() : '0'}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Absent</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* My Sessions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Video className="h-5 w-5" />
            My Sessions
          </h2>
          <Link to="/student/my-sessions">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>

        {sessionsLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading sessions...
          </div>
        ) : !studentId ? (
          <Card>
            <CardContent className="py-6 text-center text-muted-foreground text-sm">
              No access code linked. Contact your tutor.
            </CardContent>
          </Card>
        ) : upcomingSessions.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-muted-foreground text-sm">
              No upcoming sessions scheduled.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingSessions.map(session => {
              const attendance = getAttendanceForSession(session.id);
              return (
                <Card key={session.id.toString()}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="font-medium">{session.topic ?? 'Session'}</div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {session.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {session.time}
                          </span>
                          <span>{session.durationHours.toString()}h</span>
                        </div>
                      </div>
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
                        ) : null}
                        <a href={session.meetLink} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" className="gap-1">
                            <Video className="h-3.5 w-3.5" />
                            Join
                          </Button>
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* My Materials */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            My Materials
          </h2>
          <Link to="/student/my-materials">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>

        {materialsLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading materials...
          </div>
        ) : !studentId ? (
          <Card>
            <CardContent className="py-6 text-center text-muted-foreground text-sm">
              No access code linked. Contact your tutor.
            </CardContent>
          </Card>
        ) : recentMaterials.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-muted-foreground text-sm">
              No materials assigned yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {recentMaterials.map(material => (
              <Card key={material.id.toString()}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="font-medium text-sm">{material.title}</div>
                    {material.fileLink ? (
                      <Badge variant="outline" className="gap-1 text-xs shrink-0">
                        <LinkIcon className="h-2.5 w-2.5" />
                        Link
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1 text-xs shrink-0">
                        <Download className="h-2.5 w-2.5" />
                        File
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">{material.relatedCourse}</div>
                  {material.fileLink ? (
                    <a href={material.fileLink} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="w-full gap-1">
                        <LinkIcon className="h-3.5 w-3.5" />
                        View
                      </Button>
                    </a>
                  ) : material.fileData ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full gap-1"
                      onClick={() => downloadFile(material.fileData!, material.title)}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
