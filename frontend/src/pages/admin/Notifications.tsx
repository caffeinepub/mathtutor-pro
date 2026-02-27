import React, { useState } from 'react';
import { toast } from 'sonner';
import { getStore, saveStore, type Notification } from '../../lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Bell, Send, Users, User } from 'lucide-react';

export default function AdminNotifications() {
  const [form, setForm] = useState({
    target: 'all',
    studentId: '',
    title: '',
    message: '',
  });
  const [isSending, setIsSending] = useState(false);
  const [sentNotifications, setSentNotifications] = useState<Notification[]>(() =>
    getStore().notifications
  );

  const store = getStore();
  const students = store.students.filter((s) => s.status === 'approved');

  const handleSend = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Please fill in title and message');
      return;
    }
    if (form.target === 'specific' && !form.studentId) {
      toast.error('Please select a student');
      return;
    }

    setIsSending(true);
    try {
      const currentStore = getStore();
      const newNotifications: Notification[] = [];

      if (form.target === 'all') {
        for (const student of students) {
          const user = currentStore.users.find((u) => u.id === student.userId);
          if (user) {
            newNotifications.push({
              id: `notif_${Date.now()}_${student.id}`,
              userId: user.id,
              title: form.title.trim(),
              message: form.message.trim(),
              read: false,
              createdAt: new Date().toISOString(),
            });
          }
        }
      } else {
        const student = currentStore.students.find((s) => s.id === form.studentId);
        if (student) {
          const user = currentStore.users.find((u) => u.id === student.userId);
          if (user) {
            newNotifications.push({
              id: `notif_${Date.now()}`,
              userId: user.id,
              title: form.title.trim(),
              message: form.message.trim(),
              read: false,
              createdAt: new Date().toISOString(),
            });
          }
        }
      }

      currentStore.notifications = [...currentStore.notifications, ...newNotifications];
      saveStore(currentStore);
      setSentNotifications(currentStore.notifications);
      setForm({ target: 'all', studentId: '', title: '', message: '' });
      toast.success(`Notification sent to ${newNotifications.length} recipient(s)`);
    } catch (err) {
      toast.error('Failed to send notification');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground text-sm mt-1">Send in-app notifications to students</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Compose */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Send className="w-4 h-4 text-primary" />
              Compose Notification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Send To</Label>
              <div className="flex gap-2">
                <button
                  onClick={() => setForm((p) => ({ ...p, target: 'all', studentId: '' }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                    form.target === 'all'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  <Users className="w-4 h-4" /> All Students
                </button>
                <button
                  onClick={() => setForm((p) => ({ ...p, target: 'specific' }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                    form.target === 'specific'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  <User className="w-4 h-4" /> Specific
                </button>
              </div>
            </div>

            {form.target === 'specific' && (
              <div className="space-y-1">
                <Label>Select Student</Label>
                <select
                  value={form.studentId}
                  onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Choose a student...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="notif-title">Title</Label>
              <Input
                id="notif-title"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Notification title"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="notif-msg">Message</Label>
              <Textarea
                id="notif-msg"
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                placeholder="Write your message here..."
                rows={4}
              />
            </div>

            <Button onClick={handleSend} disabled={isSending} className="w-full">
              {isSending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </span>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" /> Send Notification
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Recent notifications */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sentNotifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No notifications sent yet
              </p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {sentNotifications
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  )
                  .slice(0, 20)
                  .map((n) => (
                    <div key={n.id} className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        <Badge
                          variant={n.read ? 'outline' : 'default'}
                          className="text-xs shrink-0"
                        >
                          {n.read ? 'Read' : 'Unread'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
