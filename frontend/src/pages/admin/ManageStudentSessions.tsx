import { useState } from 'react';
import { getStore, saveStore, getApprovedStudents } from '../../lib/store';
import type { Student, Session } from '../../lib/store';
import { Plus, Trash2, Calendar, Clock, Video, ChevronDown } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';

export default function AdminManageStudentSessions() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAddSession, setShowAddSession] = useState(false);
  const [form, setForm] = useState({
    title: '',
    date: '',
    time: '',
    duration: 1,
    meetLink: '',
    topic: '',
  });

  const approvedStudents = getApprovedStudents();

  const getStudentSessions = (studentId: string): Session[] => {
    return getStore().sessions.filter((s) => s.studentId === studentId);
  };

  const handleAddSession = () => {
    if (!selectedStudent || !form.title || !form.date || !form.time) return;

    const store = getStore();
    const newSession: Session = {
      id: `session-${Date.now()}`,
      studentId: selectedStudent.id,
      title: form.title,
      date: form.date,
      time: form.time,
      duration: form.duration,
      meetLink: form.meetLink || undefined,
      topic: form.topic || undefined,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    };
    store.sessions.push(newSession);
    saveStore(store);

    setShowAddSession(false);
    setForm({ title: '', date: '', time: '', duration: 1, meetLink: '', topic: '' });
  };

  const handleDeleteSession = (sessionId: string) => {
    const store = getStore();
    store.sessions = store.sessions.filter((s) => s.id !== sessionId);
    saveStore(store);
  };

  const sessions = selectedStudent ? getStudentSessions(selectedStudent.id) : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Manage Student Classes</h2>
        <p className="text-muted-foreground">Assign and manage classes for individual students</p>
      </div>

      {/* Student Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Student</CardTitle>
        </CardHeader>
        <CardContent>
          {approvedStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No approved students yet.</p>
          ) : (
            <div className="relative">
              <select
                value={selectedStudent?.id ?? ''}
                onChange={(e) => {
                  const s = approvedStudents.find((st) => st.id === e.target.value) ?? null;
                  setSelectedStudent(s);
                }}
                className="w-full px-3 py-2 pr-8 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm appearance-none"
              >
                <option value="">Choose a student...</option>
                {approvedStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.email}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sessions for selected student */}
      {selectedStudent && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">
              Classes for {selectedStudent.name}
            </h3>
            <Button size="sm" onClick={() => setShowAddSession(true)}>
              <Plus size={14} className="mr-1" />
              Add Class
            </Button>
          </div>

          {sessions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">No classes assigned yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm">{session.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {session.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {session.time}
                          </span>
                          <span>{session.duration}h</span>
                        </div>
                        {session.meetLink && (
                          <a
                            href={session.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                          >
                            <Video size={11} />
                            Join Meeting
                          </a>
                        )}
                        {session.topic && (
                          <p className="text-xs text-muted-foreground mt-0.5">Topic: {session.topic}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          handleDeleteSession(session.id);
                          setSelectedStudent({ ...selectedStudent });
                        }}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Session Dialog */}
      <Dialog open={showAddSession} onOpenChange={setShowAddSession}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Class for {selectedStudent?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Calculus - Derivatives"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Time</label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Duration (hours)</label>
              <input
                type="number"
                min={1}
                max={8}
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Google Meet Link (optional)</label>
              <input
                type="url"
                value={form.meetLink}
                onChange={(e) => setForm({ ...form, meetLink: e.target.value })}
                placeholder="https://meet.google.com/..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Topic (optional)</label>
              <input
                type="text"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                placeholder="Session topic"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSession(false)}>Cancel</Button>
            <Button
              onClick={handleAddSession}
              disabled={!form.title || !form.date || !form.time}
            >
              Add Class
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
