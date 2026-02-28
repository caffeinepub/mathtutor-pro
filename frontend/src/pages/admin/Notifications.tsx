import { useState } from 'react';
import { Bell, Send, Trash2 } from 'lucide-react';
import { getStore, saveStore, type Notification } from '../../lib/store';

export default function AdminNotifications() {
  const [store, setStore] = useState(() => getStore());
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'info' as Notification['type'],
    targetStudentId: '',
  });

  const refresh = () => setStore(getStore());

  const handleSend = () => {
    if (!form.title || !form.message) return;

    const currentStore = getStore();
    const newNotifications: Notification[] = [];

    if (!form.targetStudentId) {
      // Broadcast to all
      newNotifications.push({
        id: `notif_${Date.now()}_all`,
        title: form.title,
        message: form.message,
        type: form.type,
        readBy: [],
        createdAt: new Date().toISOString(),
      });
    } else {
      // Send to specific student
      newNotifications.push({
        id: `notif_${Date.now()}`,
        title: form.title,
        message: form.message,
        type: form.type,
        targetStudentId: form.targetStudentId,
        readBy: [],
        createdAt: new Date().toISOString(),
      });
    }

    currentStore.notifications = [...currentStore.notifications, ...newNotifications];
    saveStore(currentStore);
    setForm({ title: '', message: '', type: 'info', targetStudentId: '' });
    refresh();
  };

  const handleDelete = (notifId: string) => {
    const currentStore = getStore();
    currentStore.notifications = currentStore.notifications.filter((n) => n.id !== notifId);
    saveStore(currentStore);
    refresh();
  };

  const approvedStudents = store.students.filter((s) => s.status === 'approved');

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground text-sm mt-1">Send notifications to students</p>
      </div>

      {/* Send Form */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6">
        <h2 className="font-bold text-foreground mb-4">Send Notification</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Notification title"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Message</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Notification message"
              rows={3}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Notification['type'] }))}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Target Student</label>
              <select
                value={form.targetStudentId}
                onChange={(e) => setForm((f) => ({ ...f, targetStudentId: e.target.value }))}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">All Students</option>
                {approvedStudents.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={!form.title || !form.message}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            Send Notification
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {store.notifications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No notifications sent yet.</p>
          </div>
        ) : (
          [...store.notifications]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((notif) => (
              <div key={notif.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-4">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                  notif.type === 'success' ? 'bg-green-500' :
                  notif.type === 'warning' ? 'bg-amber-500' :
                  notif.type === 'error' ? 'bg-red-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{notif.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {new Date(notif.createdAt).toLocaleDateString('en-IN')}
                    </span>
                    {notif.targetStudentId ? (
                      <span className="text-xs text-primary">
                        → {store.students.find((s) => s.id === notif.targetStudentId)?.name || 'Student'}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Broadcast</span>
                    )}
                    <span className="text-xs text-muted-foreground">{notif.readBy.length} read</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(notif.id)}
                  className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
