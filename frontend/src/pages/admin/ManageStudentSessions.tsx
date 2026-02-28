import React, { useState } from 'react';
import { Plus, Trash2, Video, Calendar, Clock, User, Link as LinkIcon, Loader2, Search } from 'lucide-react';
import { useAllStudents, useGetSessionsForStudent, useAddSession, useDeleteSession } from '../../hooks/useQueries';
import { Student } from '../../backend';
import { Principal } from '@dfinity/principal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

function getPaymentStatusLabel(student: Student): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
  const ps = student.paymentStatus;
  if (ps.__kind__ === 'upi') {
    if (ps.upi.__kind__ === 'approved') return { label: 'Active', variant: 'default' };
    if (ps.upi.__kind__ === 'pending') return { label: 'Pending', variant: 'secondary' };
    if (ps.upi.__kind__ === 'rejected') return { label: 'Rejected', variant: 'destructive' };
  }
  if (ps.__kind__ === 'stripe') {
    if (ps.stripe.__kind__ === 'completed') return { label: 'Active', variant: 'default' };
    if (ps.stripe.__kind__ === 'failed') return { label: 'Failed', variant: 'destructive' };
  }
  return { label: 'Unknown', variant: 'outline' };
}

export default function ManageStudentSessions() {
  const { data: allStudents, isLoading: studentsLoading } = useAllStudents();

  const [selectedPrincipal, setSelectedPrincipal] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState('');
  const [form, setForm] = useState({
    date: '',
    time: '',
    durationHours: '1',
    meetLink: '',
    topic: '',
  });

  const principalObj = selectedPrincipal ? (() => {
    try { return Principal.fromText(selectedPrincipal); } catch { return null; }
  })() : null;

  const { data: sessions, isLoading: sessionsLoading } = useGetSessionsForStudent(principalObj);
  const addSession = useAddSession();
  const deleteSession = useDeleteSession();

  const allStudentsList = allStudents ?? [];
  const filteredStudents = allStudentsList.filter(s =>
    s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.course.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const selectedStudent = allStudentsList.find(s => s.principal.toString() === selectedPrincipal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!principalObj) { toast.error('Please select a student'); return; }
    if (!form.date) { toast.error('Please enter a date'); return; }
    if (!form.time) { toast.error('Please enter a time'); return; }
    if (!form.meetLink) { toast.error('Please enter a Google Meet link'); return; }

    try {
      await addSession.mutateAsync({
        studentPrincipal: principalObj,
        date: form.date,
        time: form.time,
        durationHours: BigInt(parseInt(form.durationHours) || 1),
        meetLink: form.meetLink,
        topic: form.topic || undefined,
      });
      toast.success('Session added successfully!');
      setForm({ date: '', time: '', durationHours: '1', meetLink: '', topic: '' });
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to add session');
    }
  };

  const handleDelete = async (sessionId: bigint) => {
    try {
      await deleteSession.mutateAsync(sessionId);
      toast.success('Session deleted');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to delete session');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manage Student Sessions</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Select any registered student and assign Google Meet sessions — sessions appear only on that student's dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Add Session Form */}
        <div className="bg-card border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add New Session
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student selector */}
            <div className="space-y-1.5">
              <Label>Select Student *</Label>
              {studentsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={selectedPrincipal} onValueChange={setSelectedPrincipal}>
                  <SelectTrigger>
                    <SelectValue placeholder={allStudentsList.length === 0 ? 'No students registered yet' : 'Choose a student...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {allStudentsList.map(s => {
                      const statusInfo = getPaymentStatusLabel(s);
                      return (
                        <SelectItem key={s.principal.toString()} value={s.principal.toString()}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{s.fullName}</span>
                            <span className="text-muted-foreground text-xs">— {s.course}</span>
                            <Badge variant={statusInfo.variant} className="text-xs ml-1">{statusInfo.label}</Badge>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
              {allStudentsList.length === 0 && !studentsLoading && (
                <p className="text-xs text-amber-600">No students registered yet.</p>
              )}
              {selectedStudent && (
                <p className="text-xs text-muted-foreground">
                  Selected: <span className="font-medium text-foreground">{selectedStudent.fullName}</span> — {selectedStudent.email}
                </p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                required
              />
            </div>

            {/* Time */}
            <div className="space-y-1.5">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                required
              />
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <Label htmlFor="duration">Duration (hours) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="8"
                value={form.durationHours}
                onChange={e => setForm(f => ({ ...f, durationHours: e.target.value }))}
                required
              />
            </div>

            {/* Google Meet Link */}
            <div className="space-y-1.5">
              <Label htmlFor="meetLink">Google Meet Link *</Label>
              <Input
                id="meetLink"
                type="url"
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                value={form.meetLink}
                onChange={e => setForm(f => ({ ...f, meetLink: e.target.value }))}
                required
              />
            </div>

            {/* Topic */}
            <div className="space-y-1.5">
              <Label htmlFor="topic">Topic (optional)</Label>
              <Input
                id="topic"
                placeholder="e.g. Algebra - Chapter 3"
                value={form.topic}
                onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
              />
            </div>

            <Button type="submit" className="w-full" disabled={addSession.isPending || !selectedPrincipal}>
              {addSession.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Adding Session...</>
              ) : (
                <><Plus className="h-4 w-4 mr-2" />Add Session</>
              )}
            </Button>
          </form>
        </div>

        {/* Right: Sessions for selected student */}
        <div className="bg-card border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Video className="h-4 w-4" />
            {selectedStudent ? `Sessions for ${selectedStudent.fullName}` : 'Select a student to view sessions'}
          </h2>

          {!selectedPrincipal && (
            <div className="text-center py-10 text-muted-foreground">
              <User className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Select a student from the form to view their sessions</p>
            </div>
          )}

          {selectedPrincipal && sessionsLoading && (
            <div className="space-y-2">
              {[1, 2].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          )}

          {selectedPrincipal && !sessionsLoading && (sessions ?? []).length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No sessions assigned to this student yet</p>
              <p className="text-xs mt-1">Use the form on the left to add a session</p>
            </div>
          )}

          {selectedPrincipal && !sessionsLoading && (sessions ?? []).length > 0 && (
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {[...(sessions ?? [])].sort((a, b) => a.date.localeCompare(b.date)).map(session => (
                <div key={session.id.toString()} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{session.topic ?? 'Session'}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{session.date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{session.time}</span>
                        <span>{session.durationHours.toString()}h</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(session.id)}
                      disabled={deleteSession.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {session.meetLink && (
                    <a
                      href={session.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline truncate"
                    >
                      <LinkIcon className="h-3 w-3 flex-shrink-0" />
                      {session.meetLink}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All students reference panel */}
      <div className="bg-card border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <User className="h-4 w-4" /> All Students ({allStudentsList.length})
          </h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={studentSearch}
              onChange={e => setStudentSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>
        {studentsLoading ? (
          <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : filteredStudents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {studentSearch ? 'No students match your search.' : 'No students registered yet.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {filteredStudents.map(s => {
              const statusInfo = getPaymentStatusLabel(s);
              return (
                <div
                  key={s.principal.toString()}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${selectedPrincipal === s.principal.toString() ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                  onClick={() => setSelectedPrincipal(s.principal.toString())}
                >
                  <p className="font-medium text-sm truncate">{s.fullName}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.course}</p>
                  <Badge variant={statusInfo.variant} className="text-xs mt-1">{statusInfo.label}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
