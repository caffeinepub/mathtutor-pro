import { useState } from 'react';
import { getStore, addSession, deleteSession } from '../../lib/store';
import type { Session } from '../../lib/store';
import { Plus, Trash2, Calendar, Clock, Video } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';

export default function AdminSessions() {
  const [sessions, setSessions] = useState<Session[]>(() => getStore().sessions);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    title: '',
    studentId: '',
    date: '',
    time: '',
    duration: 1,
    meetLink: '',
    topic: '',
    status: 'scheduled' as Session['status'],
  });

  const students = getStore().students.filter((s) => s.status === 'approved');

  const handleAdd = () => {
    if (!form.title || !form.studentId || !form.date || !form.time) return;
    addSession({
      title: form.title,
      studentId: form.studentId,
      date: form.date,
      time: form.time,
      duration: form.duration,
      meetLink: form.meetLink || undefined,
      topic: form.topic || undefined,
      status: form.status,
    });
    setSessions(getStore().sessions);
    setShowAdd(false);
    setForm({
      title: '',
      studentId: '',
      date: '',
      time: '',
      duration: 1,
      meetLink: '',
      topic: '',
      status: 'scheduled',
    });
  };

  const handleDelete = (id: string) => {
    deleteSession(id);
    setSessions(getStore().sessions);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Sessions</h2>
          <p className="text-muted-foreground">Manage tutoring sessions</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus size={16} className="mr-2" />
          Add Session
        </Button>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No sessions yet. Add your first session.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const student = getStore().students.find((s) => s.id === session.studentId);
            return (
              <Card key={session.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground">{session.title}</p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            session.status === 'scheduled'
                              ? 'bg-blue-100 text-blue-700'
                              : session.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {session.status}
                        </span>
                      </div>
                      {student && (
                        <p className="text-sm text-muted-foreground">
                          Student: {student.name}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {session.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
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
                          <Video size={12} />
                          Join Meeting
                        </a>
                      )}
                      {session.topic && (
                        <p className="text-xs text-muted-foreground mt-1">Topic: {session.topic}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(session.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Session Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Session title"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Student</label>
              <select
                value={form.studentId}
                onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="">Select student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
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
              <label className="block text-sm font-medium text-foreground mb-1">
                Google Meet Link (optional)
              </label>
              <input
                type="url"
                value={form.meetLink}
                onChange={(e) => setForm({ ...form, meetLink: e.target.value })}
                placeholder="https://meet.google.com/..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Topic (optional)
              </label>
              <input
                type="text"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                placeholder="Session topic"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Session['status'] })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!form.title || !form.studentId || !form.date || !form.time}
            >
              Add Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
