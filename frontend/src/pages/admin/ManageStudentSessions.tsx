import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { useAddSession, useGetSessionsForStudent, useDeleteSession } from '../../hooks/useSessions';
import { UpiPayment } from '../../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2, Plus, Calendar, Clock, Link } from 'lucide-react';
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

export default function ManageStudentSessions() {
  const { data: students = [], isLoading: studentsLoading } = useApprovedStudents();
  const [selectedStudentId, setSelectedStudentId] = useState<bigint | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('1');
  const [meetLink, setMeetLink] = useState('');
  const [topic, setTopic] = useState('');

  const { data: sessions = [], isLoading: sessionsLoading } = useGetSessionsForStudent(selectedStudentId);
  const addSession = useAddSession();
  const deleteSession = useDeleteSession();

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) { toast.error('Please select a student'); return; }
    if (!date) { toast.error('Please enter a date'); return; }
    if (!time) { toast.error('Please enter a time'); return; }
    if (!meetLink) { toast.error('Please enter a Google Meet link'); return; }

    try {
      await addSession.mutateAsync({
        studentId: selectedStudentId,
        date,
        time,
        durationHours: BigInt(parseInt(duration) || 1),
        meetLink,
        topic: topic.trim() || null,
      });
      toast.success('Session added successfully!');
      setDate('');
      setTime('');
      setDuration('1');
      setMeetLink('');
      setTopic('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add session');
    }
  };

  const handleDelete = async (sessionId: bigint) => {
    if (!selectedStudentId) return;
    try {
      await deleteSession.mutateAsync({ sessionId, studentId: selectedStudentId });
      toast.success('Session deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete session');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manage Student Sessions</h1>
        <p className="text-muted-foreground mt-1">Add and manage sessions for individual students</p>
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
              onValueChange={(val) => setSelectedStudentId(BigInt(val))}
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
          {/* Add Session Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Session for {selectedStudent?.fullName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" /> Date *
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time" className="flex items-center gap-1">
                      <Clock className="h-4 w-4" /> Time *
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      value={time}
                      onChange={e => setTime(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (hours) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      max="8"
                      value={duration}
                      onChange={e => setDuration(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meetLink" className="flex items-center gap-1">
                      <Link className="h-4 w-4" /> Google Meet Link *
                    </Label>
                    <Input
                      id="meetLink"
                      type="url"
                      placeholder="https://meet.google.com/..."
                      value={meetLink}
                      onChange={e => setMeetLink(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="topic">Session Topic (optional)</Label>
                    <Input
                      id="topic"
                      type="text"
                      placeholder="e.g. Quadratic Equations"
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full md:w-auto"
                  disabled={addSession.isPending}
                >
                  {addSession.isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />Adding Session...</>
                  ) : (
                    <><Plus className="h-4 w-4 mr-2" />Add Session</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sessions List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Sessions for {selectedStudent?.fullName}
                <Badge variant="secondary" className="ml-2">{sessions.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading sessions...
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-muted-foreground py-4 text-center">No sessions added yet for this student.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Topic</TableHead>
                        <TableHead>Meet Link</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.map(session => (
                        <TableRow key={session.id.toString()}>
                          <TableCell className="font-medium">{session.date}</TableCell>
                          <TableCell>{session.time}</TableCell>
                          <TableCell>{session.durationHours.toString()}h</TableCell>
                          <TableCell>{session.topic ?? <span className="text-muted-foreground">—</span>}</TableCell>
                          <TableCell>
                            <a
                              href={session.meetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm"
                            >
                              Join
                            </a>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(session.id)}
                              disabled={deleteSession.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
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
