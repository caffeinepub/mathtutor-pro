import React, { useState } from 'react';
import { useActor } from '../../hooks/useActor';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Video, Calendar, Clock, User, BookOpen, RefreshCw } from 'lucide-react';
import { Principal } from '@dfinity/principal';

interface ApprovedStudent {
  paymentId: number;
  name: string;
  email: string;
  principalId?: string;
}

interface LocalSession {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  date: string;
  time: string;
  durationHours: number;
  meetLink: string;
  topic?: string;
  createdAt: string;
}

function getLocalSessions(): LocalSession[] {
  try {
    const raw = localStorage.getItem('rajats_equation_store');
    if (!raw) return [];
    const store = JSON.parse(raw);
    return store.adminSessions || [];
  } catch {
    return [];
  }
}

function saveLocalSession(session: LocalSession) {
  try {
    const raw = localStorage.getItem('rajats_equation_store');
    const store = raw ? JSON.parse(raw) : {};
    const sessions: LocalSession[] = store.adminSessions || [];
    sessions.push(session);
    store.adminSessions = sessions;
    localStorage.setItem('rajats_equation_store', JSON.stringify(store));
  } catch {
    // ignore
  }
}

function deleteLocalSession(id: string) {
  try {
    const raw = localStorage.getItem('rajats_equation_store');
    if (!raw) return;
    const store = JSON.parse(raw);
    store.adminSessions = (store.adminSessions || []).filter((s: LocalSession) => s.id !== id);
    localStorage.setItem('rajats_equation_store', JSON.stringify(store));
  } catch {
    // ignore
  }
}

export default function AdminSessions() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('1');
  const [meetLink, setMeetLink] = useState('');
  const [topic, setTopic] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [localSessions, setLocalSessions] = useState<LocalSession[]>(getLocalSessions);
  const [filterStudentId, setFilterStudentId] = useState('');

  // Fetch all payments to get approved students
  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['allPayments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPayments();
    },
    enabled: !!actor,
  });

  const approvedStudents: ApprovedStudent[] = React.useMemo(() => {
    const fromBackend = payments
      .filter(p => p.status.__kind__ === 'approved')
      .map(p => ({
        paymentId: Number(p.id),
        name: p.fullName,
        email: p.email,
      }));

    // Also check localStorage
    try {
      const raw = localStorage.getItem('rajats_equation_store');
      if (raw) {
        const store = JSON.parse(raw);
        const localActive = (store.students || [])
          .filter((s: any) => s.status === 'active')
          .map((s: any) => ({
            paymentId: parseInt(s.id) || 0,
            name: s.name,
            email: s.email,
          }));
        for (const ls of localActive) {
          if (!fromBackend.find(s => s.email === ls.email)) {
            fromBackend.push(ls);
          }
        }
      }
    } catch {
      // ignore
    }

    return fromBackend;
  }, [payments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedStudentId) {
      setErrorMsg('Please select a student.');
      return;
    }
    if (!date || !time || !meetLink) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setSaving(true);
    try {
      const student = approvedStudents.find(s => String(s.paymentId) === selectedStudentId || s.email === selectedStudentId);
      if (!student) {
        setErrorMsg('Student not found.');
        setSaving(false);
        return;
      }

      // Try backend first if we have a principal
      let savedToBackend = false;
      if (actor && student.principalId) {
        try {
          const principal = Principal.fromText(student.principalId);
          await actor.addSession(
            principal,
            date,
            time,
            BigInt(parseInt(duration)),
            meetLink,
            topic.trim() || null
          );
          savedToBackend = true;
          queryClient.invalidateQueries({ queryKey: ['sessions'] });
        } catch (err) {
          // Fall through to localStorage
        }
      }

      // Always save to localStorage for display
      const newSession: LocalSession = {
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        studentId: String(student.paymentId),
        studentName: student.name,
        studentEmail: student.email,
        date,
        time,
        durationHours: parseInt(duration),
        meetLink,
        topic: topic.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      saveLocalSession(newSession);
      setLocalSessions(getLocalSessions());

      setSuccessMsg(`Class created for ${student.name}!${savedToBackend ? ' (saved to backend)' : ''}`);
      setDate('');
      setTime('');
      setDuration('1');
      setMeetLink('');
      setTopic('');
      setSelectedStudentId('');
    } catch (err: any) {
      setErrorMsg(String(err?.message || 'Failed to save class. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this class?')) return;
    deleteLocalSession(id);
    setLocalSessions(getLocalSessions());
  };

  const displayedSessions = filterStudentId
    ? localSessions.filter(s => String(s.studentId) === filterStudentId || s.studentEmail === filterStudentId)
    : localSessions;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Sessions (Classes)</h1>
        <p className="text-muted-foreground text-sm mt-1">Create and manage classes for individual students</p>
      </div>

      {/* Create Class Form */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Create Class for Student
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student Select */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Select Student <span className="text-destructive">*</span>
            </label>
            {paymentsLoading ? (
              <div className="text-sm text-muted-foreground">Loading students...</div>
            ) : approvedStudents.length === 0 ? (
              <div className="text-sm text-muted-foreground bg-muted rounded-lg px-3 py-2">
                No approved students yet. Approve students from the Students section first.
              </div>
            ) : (
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                <option value="">-- Select a student --</option>
                {approvedStudents.map(s => (
                  <option key={s.email} value={String(s.paymentId) || s.email}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Date <span className="text-destructive">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                required
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Time <span className="text-destructive">*</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                required
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Duration (hours) <span className="text-destructive">*</span>
              </label>
              <select
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                {[1, 1.5, 2, 2.5, 3, 4].map(h => (
                  <option key={h} value={String(h)}>{h} hour{h !== 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            {/* Meet Link */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Google Meet Link <span className="text-destructive">*</span>
              </label>
              <input
                type="url"
                value={meetLink}
                onChange={e => setMeetLink(e.target.value)}
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                required
              />
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Class Topic <span className="text-muted-foreground text-xs">(optional)</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. Quadratic Equations, Trigonometry..."
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {errorMsg && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-3 py-2.5 text-sm">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 rounded-lg px-3 py-2.5 text-sm">
              {successMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Create Class'}
          </button>
        </form>
      </div>

      {/* Sessions List */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            All Classes ({localSessions.length})
          </h2>
          <div className="flex items-center gap-2">
            <select
              value={filterStudentId}
              onChange={e => setFilterStudentId(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none"
            >
              <option value="">All Students</option>
              {approvedStudents.map(s => (
                <option key={s.email} value={String(s.paymentId) || s.email}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {displayedSessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No classes created yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...displayedSessions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(session => (
              <div key={session.id} className="flex items-start justify-between gap-4 p-4 rounded-lg border border-border bg-background">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-medium text-sm text-foreground">{session.studentName}</span>
                    <span className="text-xs text-muted-foreground">({session.studentEmail})</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {session.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {session.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {session.durationHours}h
                    </span>
                  </div>
                  {session.topic && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> {session.topic}
                    </p>
                  )}
                  <a
                    href={session.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                  >
                    <Video className="w-3 h-3" /> {session.meetLink}
                  </a>
                </div>
                <button
                  onClick={() => handleDelete(session.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  title="Delete class"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
