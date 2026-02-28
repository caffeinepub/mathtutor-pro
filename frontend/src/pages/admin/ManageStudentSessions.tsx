import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Clock, Link2, BookOpen, User, Video, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getStore, saveStore, getApprovedStudents, Student, Session } from '../../lib/store';

export default function ManageStudentSessions() {
  const [approvedStudents, setApprovedStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    date: '',
    time: '',
    durationHours: '1',
    meetLink: '',
    topic: '',
  });

  const loadData = () => {
    const students = getApprovedStudents();
    setApprovedStudents(students);
    if (selectedStudentId) {
      loadSessionsForStudent(selectedStudentId);
    }
  };

  const loadSessionsForStudent = (studentId: string) => {
    const store = getStore();
    const studentSessions = store.sessions.filter((s) => s.studentId === studentId);
    studentSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setSessions(studentSessions);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      loadSessionsForStudent(selectedStudentId);
    } else {
      setSessions([]);
    }
  }, [selectedStudentId]);

  const handleStudentChange = (value: string) => {
    setSelectedStudentId(value);
    setShowForm(false);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleFormChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedStudentId) {
      setErrorMsg('Please select a student first.');
      return;
    }
    if (!form.date || !form.time || !form.meetLink) {
      setErrorMsg('Date, time, and Google Meet link are required.');
      return;
    }

    const durationNum = parseInt(form.durationHours, 10);
    if (isNaN(durationNum) || durationNum < 1) {
      setErrorMsg('Duration must be at least 1 hour.');
      return;
    }

    setSaving(true);
    try {
      const store = getStore();
      const selectedStudent = approvedStudents.find((s) => s.id === selectedStudentId);

      const newSession: Session = {
        id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        studentId: selectedStudentId,
        studentEmail: selectedStudent?.email,
        studentName: selectedStudent?.name,
        date: form.date,
        time: form.time,
        durationHours: durationNum,
        meetLink: form.meetLink,
        topic: form.topic.trim() || undefined,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
      };

      store.sessions.push(newSession);
      saveStore(store);

      // Reset form
      setForm({ date: '', time: '', durationHours: '1', meetLink: '', topic: '' });
      setShowForm(false);
      setSuccessMsg(`Class added successfully for ${selectedStudent?.name}!`);
      loadSessionsForStudent(selectedStudentId);
    } catch (err) {
      setErrorMsg('Failed to save session. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (sessionId: string) => {
    const store = getStore();
    store.sessions = store.sessions.filter((s) => s.id !== sessionId);
    saveStore(store);
    loadSessionsForStudent(selectedStudentId);
  };

  const selectedStudent = approvedStudents.find((s) => s.id === selectedStudentId);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sessions (Classes)</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Assign Google Meet classes to individual students
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Step 1: Select Student */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Step 1: Select Student
          </CardTitle>
        </CardHeader>
        <CardContent>
          {approvedStudents.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <User className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No approved students yet.</p>
              <p className="text-xs mt-1">Approve students from the Students section first.</p>
            </div>
          ) : (
            <Select value={selectedStudentId} onValueChange={handleStudentChange}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Choose a student..." />
              </SelectTrigger>
              <SelectContent>
                {approvedStudents.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{student.name}</span>
                      <span className="text-xs text-muted-foreground">{student.email} · {student.course}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Add Class */}
      {selectedStudentId && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Video className="w-4 h-4 text-primary" />
                Step 2: Add Class for {selectedStudent?.name}
              </CardTitle>
              {!showForm && (
                <Button size="sm" onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Class
                </Button>
              )}
            </div>
          </CardHeader>
          {showForm && (
            <CardContent>
              {successMsg && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3">
                  {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="mb-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-3">
                  {errorMsg}
                </div>
              )}
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="session-date">
                      <Calendar className="w-3.5 h-3.5 inline mr-1" />
                      Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="session-date"
                      type="date"
                      value={form.date}
                      onChange={(e) => handleFormChange('date', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session-time">
                      <Clock className="w-3.5 h-3.5 inline mr-1" />
                      Time <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="session-time"
                      type="time"
                      value={form.time}
                      onChange={(e) => handleFormChange('time', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session-duration">
                      Duration (hours) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="session-duration"
                      type="number"
                      min="1"
                      max="8"
                      value={form.durationHours}
                      onChange={(e) => handleFormChange('durationHours', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session-meet">
                      <Link2 className="w-3.5 h-3.5 inline mr-1" />
                      Google Meet Link <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="session-meet"
                      type="url"
                      placeholder="https://meet.google.com/xxx-xxxx-xxx"
                      value={form.meetLink}
                      onChange={(e) => handleFormChange('meetLink', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-topic">
                    <BookOpen className="w-3.5 h-3.5 inline mr-1" />
                    Class Topic (optional)
                  </Label>
                  <Input
                    id="session-topic"
                    type="text"
                    placeholder="e.g. Quadratic Equations, Calculus Introduction..."
                    value={form.topic}
                    onChange={(e) => handleFormChange('topic', e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Class'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setErrorMsg('');
                      setForm({ date: '', time: '', durationHours: '1', meetLink: '', topic: '' });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>
      )}

      {/* Success message outside form */}
      {!showForm && successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3">
          {successMsg}
        </div>
      )}

      {/* Sessions List */}
      {selectedStudentId && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Classes for {selectedStudent?.name}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({sessions.length} total)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Video className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No classes assigned yet.</p>
                <p className="text-xs mt-1">Click "Add Class" above to schedule a class.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-start justify-between p-4 bg-muted/30 rounded-lg border border-border/50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">
                          {session.topic || 'Class Session'}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            session.status === 'scheduled'
                              ? 'bg-blue-100 text-blue-700'
                              : session.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {session.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(session.date).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {session.time}
                        </span>
                        <span>{session.durationHours}h</span>
                      </div>
                      <a
                        href={session.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline mt-1 flex items-center gap-1"
                      >
                        <Link2 className="w-3 h-3" />
                        {session.meetLink}
                      </a>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(session.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
