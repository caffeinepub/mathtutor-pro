import { useState } from 'react';
import { useActor } from '../../hooks/useActor';
import { useListApprovals, useGetAllPayments } from '../../hooks/useQueries';
import { useGetSessionsForStudent, useAddSession, useDeleteSession } from '../../hooks/useSessions';
import { Principal } from '@dfinity/principal';
import {
  CalendarDays,
  Plus,
  Trash2,
  Loader2,
  User,
  Clock,
  Video,
  ChevronDown,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface StudentOption {
  principalStr: string;
  displayName: string;
  email?: string;
  isActive: boolean;
}

export default function ManageStudentSessions() {
  const { actor } = useActor();
  const { data: approvals = [], isLoading: approvalsLoading } = useListApprovals();
  const { data: allPayments = [], isLoading: paymentsLoading } = useGetAllPayments();

  const [selectedPrincipal, setSelectedPrincipal] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('1');
  const [meetLink, setMeetLink] = useState('');
  const [topic, setTopic] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Build student options from both approvals and payments
  // Approvals = Internet Identity users who logged in
  // Payments = students who registered and paid
  const studentOptions: StudentOption[] = [];

  // Add approved portal users
  for (const approval of approvals) {
    const principalStr = approval.principal.toString();
    // Try to find matching payment by looking for any payment
    const matchingPayment = allPayments.find(
      (p) => p.status.__kind__ === 'approved'
    );
    studentOptions.push({
      principalStr,
      displayName: `Student (${principalStr.slice(0, 8)}...)`,
      isActive: approval.status === 'approved',
    });
  }

  // If no approvals, show approved payment holders as options
  // (admin can manually enter principal or select from approved payments)
  const approvedPayments = allPayments.filter((p) => p.status.__kind__ === 'approved');

  const isLoading = approvalsLoading || paymentsLoading;

  const selectedPrincipalObj = selectedPrincipal
    ? (() => {
        try {
          return Principal.fromText(selectedPrincipal);
        } catch {
          return null;
        }
      })()
    : null;

  const { data: sessions = [], isLoading: sessionsLoading, refetch: refetchSessions } =
    useGetSessionsForStudent(selectedPrincipalObj);

  const addSessionMutation = useAddSession();
  const deleteSessionMutation = useDeleteSession();

  const handleAddSession = async () => {
    if (!selectedPrincipal || !date || !time || !meetLink) {
      toast.error('Please fill in all required fields');
      return;
    }

    let principalObj: Principal;
    try {
      principalObj = Principal.fromText(selectedPrincipal);
    } catch {
      toast.error('Invalid principal ID');
      return;
    }

    setIsAdding(true);
    try {
      await addSessionMutation.mutateAsync({
        studentPrincipal: principalObj,
        date,
        time,
        durationHours: BigInt(parseInt(duration) || 1),
        meetLink,
        topic: topic || null,
      });
      toast.success('Session added successfully!');
      setDate('');
      setTime('');
      setDuration('1');
      setMeetLink('');
      setTopic('');
      refetchSessions();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add session');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteSession = async (sessionId: bigint) => {
    try {
      await deleteSessionMutation.mutateAsync(sessionId);
      toast.success('Session deleted');
      refetchSessions();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete session');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-primary" />
          Manage Student Sessions
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Select a student and add or manage their sessions
        </p>
      </div>

      {/* Student Selector */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          Select Student
        </h2>

        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading students...
          </div>
        ) : (
          <div className="space-y-3">
            {/* Dropdown for portal users (Internet Identity) */}
            {approvals.length > 0 && (
              <div>
                <Label className="text-sm text-muted-foreground mb-1 block">
                  Portal Users (Internet Identity)
                </Label>
                <Select value={selectedPrincipal} onValueChange={setSelectedPrincipal}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student..." />
                  </SelectTrigger>
                  <SelectContent>
                    {approvals.map((approval) => {
                      const principalStr = approval.principal.toString();
                      return (
                        <SelectItem key={principalStr} value={principalStr}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs">{principalStr.slice(0, 16)}...</span>
                            <Badge
                              variant="outline"
                              className={
                                approval.status === 'approved'
                                  ? 'text-green-600 border-green-300 text-xs'
                                  : 'text-amber-600 border-amber-300 text-xs'
                              }
                            >
                              {approval.status}
                            </Badge>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Manual principal entry */}
            <div>
              <Label className="text-sm text-muted-foreground mb-1 block">
                Or enter Principal ID manually
              </Label>
              <Input
                placeholder="e.g. aaaaa-aa or full principal ID"
                value={selectedPrincipal}
                onChange={(e) => setSelectedPrincipal(e.target.value)}
                className="font-mono text-sm"
              />
            </div>

            {/* Approved payment students info */}
            {approvedPayments.length > 0 && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Active Students (Paid) — {approvedPayments.length} student(s)
                </p>
                <div className="space-y-1">
                  {approvedPayments.map((p) => (
                    <div key={String(p.id)} className="flex items-center justify-between text-xs">
                      <span className="text-foreground font-medium">{p.fullName}</span>
                      <span className="text-muted-foreground">{p.email} · {p.courseName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Session Form */}
      {selectedPrincipal && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            Add New Session
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Date <span className="text-destructive">*</span></Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Time <span className="text-destructive">*</span></Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Duration (hours)</Label>
              <Input
                type="number"
                min="1"
                max="8"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Google Meet Link <span className="text-destructive">*</span></Label>
              <Input
                placeholder="https://meet.google.com/..."
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Topic (optional)</Label>
              <Input
                placeholder="e.g. Quadratic Equations, Calculus..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleAddSession}
            disabled={isAdding || !date || !time || !meetLink}
            className="w-full md:w-auto"
          >
            {isAdding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Session
              </>
            )}
          </Button>
        </div>
      )}

      {/* Sessions List */}
      {selectedPrincipal && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Sessions for Selected Student</h2>
            <Badge variant="outline" className="ml-auto">{sessions.length}</Badge>
          </div>

          {sessionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>No sessions yet for this student</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {sessions.map((session) => (
                <div key={String(session.id)} className="p-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">{session.date} at {session.time}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {String(session.durationHours)}h
                      </span>
                      <a
                        href={session.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <Video className="h-3 w-3" />
                        Join Meet
                      </a>
                    </div>
                    {session.topic && (
                      <div className="text-sm text-muted-foreground">
                        Topic: {session.topic}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10 shrink-0"
                    onClick={() => handleDeleteSession(session.id)}
                    disabled={deleteSessionMutation.isPending}
                  >
                    {deleteSessionMutation.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
