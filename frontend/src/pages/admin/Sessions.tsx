import React, { useState } from 'react';
import { toast } from 'sonner';
import { getStore, saveStore, type Session } from '../../lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar, Clock, Video, User, BookOpen, Plus } from 'lucide-react';

const STATUS_OPTIONS = ['pending', 'confirmed', 'completed', 'cancelled'] as const;

export default function AdminSessions() {
  const [sessions, setSessions] = useState<Session[]>(() => getStore().sessions);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [editForm, setEditForm] = useState({ meetLink: '', status: 'pending', notes: '' });
  const [editOpen, setEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const store = getStore();
  const students = store.students;
  const courses = store.courses;

  const refreshSessions = () => {
    setSessions(getStore().sessions);
  };

  const filteredSessions =
    statusFilter === 'all'
      ? sessions
      : sessions.filter((s) => s.status === statusFilter);

  const openEdit = (session: Session) => {
    setEditingSession(session);
    setEditForm({
      meetLink: session.meetLink || '',
      status: session.status,
      notes: '',
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingSession) return;
    setIsSubmitting(true);
    try {
      const currentStore = getStore();
      currentStore.sessions = currentStore.sessions.map((s) =>
        s.id === editingSession.id
          ? {
              ...s,
              meetLink: editForm.meetLink || undefined,
              status: editForm.status as Session['status'],
            }
          : s
      );

      // Notify student if status changed to confirmed
      if (editForm.status === 'confirmed' && editingSession.status !== 'confirmed') {
        const student = currentStore.students.find((s) => s.id === editingSession.studentId);
        if (student) {
          const user = currentStore.users.find((u) => u.id === student.userId);
          if (user) {
            currentStore.notifications.push({
              id: `notif_${Date.now()}`,
              userId: user.id,
              title: 'Session Confirmed!',
              message: `Your session for ${editingSession.courseName} on ${editingSession.date} at ${editingSession.time} has been confirmed.${editForm.meetLink ? ` Meet link: ${editForm.meetLink}` : ''}`,
              read: false,
              createdAt: new Date().toISOString(),
            });
          }
        }
      }

      saveStore(currentStore);
      refreshSessions();
      setEditOpen(false);
      toast.success('Session updated successfully');
    } catch (err) {
      toast.error('Failed to update session');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStudentName = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    return student?.name || 'Unknown Student';
  };

  const statusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (status === 'confirmed') return 'default';
    if (status === 'pending') return 'secondary';
    if (status === 'completed') return 'outline';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sessions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} total
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', ...STATUS_OPTIONS].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
              statusFilter === status
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {filteredSessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 bg-muted rounded-full mb-4">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Sessions Found</h3>
          <p className="text-muted-foreground text-sm">
            {statusFilter === 'all' ? 'No sessions booked yet.' : `No ${statusFilter} sessions.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSessions
            .slice()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((session) => (
              <Card key={session.id} className="border-border hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                        <Calendar className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground">{session.courseName}</p>
                          <Badge variant={statusVariant(session.status)} className="text-xs capitalize">
                            {session.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {getStudentName(session.studentId)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {session.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {session.time} ({session.duration}min)
                          </span>
                        </div>
                        {session.meetLink && (
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
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right text-xs text-muted-foreground">
                        <p className="font-medium text-foreground">₹{session.price?.toLocaleString('en-IN')}</p>
                        <p className="capitalize">{session.type}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => openEdit(session)}>
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {editingSession && (
              <div className="p-3 bg-muted/30 rounded-lg text-sm">
                <p className="font-medium text-foreground">{editingSession.courseName}</p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  {editingSession.date} at {editingSession.time} • {editingSession.duration}min
                </p>
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="meet-link">Google Meet Link</Label>
              <Input
                id="meet-link"
                value={editForm.meetLink}
                onChange={(e) => setEditForm((p) => ({ ...p, meetLink: e.target.value }))}
                placeholder="https://meet.google.com/..."
              />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s} className="capitalize">{s}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : 'Update Session'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
