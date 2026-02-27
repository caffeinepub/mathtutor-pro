import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { useMarkAttendance, useGetAttendanceForStudent } from '../../hooks/useAttendance';
import { useGetSessionsForStudent } from '../../hooks/useSessions';
import { UpiPayment, AttendanceStatus } from '../../backend';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, XCircle, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';

function useApprovedStudents() {
  const { actor, isFetching } = useActor();
  return useQuery<UpiPayment[]>({
    queryKey: ['approvedStudents'],
    queryFn: async () => {
      if (!actor) return [];
      const payments = await actor.getAllPayments();
      return payments.filter(p => p.status.__kind__ === 'approved');
    },
    enabled: !!actor && !isFetching,
  });
}

export default function AttendanceManagement() {
  const { data: students = [], isLoading: studentsLoading } = useApprovedStudents();
  const [selectedStudentId, setSelectedStudentId] = useState<bigint | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<bigint | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>(AttendanceStatus.present);

  const { data: sessions = [], isLoading: sessionsLoading } = useGetSessionsForStudent(selectedStudentId);
  const { data: attendanceRecords = [], isLoading: attendanceLoading } = useGetAttendanceForStudent(selectedStudentId);
  const markAttendance = useMarkAttendance();

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const handleStudentChange = (val: string) => {
    setSelectedStudentId(BigInt(val));
    setSelectedSessionId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) { toast.error('Please select a student'); return; }
    if (!selectedSessionId) { toast.error('Please select a session'); return; }

    try {
      await markAttendance.mutateAsync({
        studentId: selectedStudentId,
        sessionId: selectedSessionId,
        status: attendanceStatus,
      });
      toast.success(`Attendance marked as ${attendanceStatus === AttendanceStatus.present ? 'Present' : 'Absent'}`);
      setSelectedSessionId(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to mark attendance');
    }
  };

  const getAttendanceForSession = (sessionId: bigint) => {
    return attendanceRecords.find(a => a.sessionId === sessionId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Attendance Management</h1>
        <p className="text-muted-foreground mt-1">Mark and track student attendance per session</p>
      </div>

      {/* Student Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Student</CardTitle>
        </CardHeader>
        <CardContent>
          {studentsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading students...
            </div>
          ) : students.length === 0 ? (
            <p className="text-muted-foreground">No approved students found.</p>
          ) : (
            <Select
              value={selectedStudentId?.toString() ?? ''}
              onValueChange={handleStudentChange}
            >
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Choose a student..." />
              </SelectTrigger>
              <SelectContent>
                {students.map(s => (
                  <SelectItem key={s.id.toString()} value={s.id.toString()}>
                    {s.fullName} — {s.email} ({s.accessCode ?? `ID: ${s.id}`})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedStudentId && (
        <>
          {/* Mark Attendance Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Mark Attendance for {selectedStudent?.fullName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading sessions...
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-muted-foreground">
                  No sessions found for this student. Add sessions first.
                </p>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Select Session *</Label>
                      <Select
                        value={selectedSessionId?.toString() ?? ''}
                        onValueChange={(val) => setSelectedSessionId(BigInt(val))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a session..." />
                        </SelectTrigger>
                        <SelectContent>
                          {sessions.map(s => (
                            <SelectItem key={s.id.toString()} value={s.id.toString()}>
                              {s.date} {s.time} {s.topic ? `— ${s.topic}` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Attendance Status *</Label>
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant={attendanceStatus === AttendanceStatus.present ? 'default' : 'outline'}
                          size="lg"
                          onClick={() => setAttendanceStatus(AttendanceStatus.present)}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Present
                        </Button>
                        <Button
                          type="button"
                          variant={attendanceStatus === AttendanceStatus.absent ? 'destructive' : 'outline'}
                          size="lg"
                          onClick={() => setAttendanceStatus(AttendanceStatus.absent)}
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Absent
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full md:w-auto"
                    disabled={markAttendance.isPending || !selectedSessionId}
                  >
                    {markAttendance.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Marking...
                      </>
                    ) : (
                      <>
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Mark Attendance
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Attendance Records Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Attendance Records for {selectedStudent?.fullName}
                <Badge variant="secondary" className="ml-2">
                  {attendanceRecords.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {attendanceLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading attendance...
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-muted-foreground py-4 text-center">
                  No sessions found for this student.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Topic</TableHead>
                        <TableHead>Attendance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.map(session => {
                        const record = getAttendanceForSession(session.id);
                        return (
                          <TableRow key={session.id.toString()}>
                            <TableCell className="font-medium">{session.date}</TableCell>
                            <TableCell>{session.time}</TableCell>
                            <TableCell>
                              {session.topic ?? (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {record ? (
                                record.status === AttendanceStatus.present ? (
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
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
