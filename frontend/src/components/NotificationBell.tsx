import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getStore, saveStore, markNotificationRead, type Notification } from '../lib/store';

interface NotificationBellProps {
  studentId: string;
}

export default function NotificationBell({ studentId }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const store = getStore();

  const notifications = store.notifications.filter(
    (n) => !n.targetStudentId || n.targetStudentId === studentId
  );

  const unread = notifications.filter((n) => !n.readBy.includes(studentId));

  const handleMarkRead = (notifId: string) => {
    markNotificationRead(notifId, studentId);
  };

  const handleMarkAllRead = () => {
    const store2 = getStore();
    store2.notifications = store2.notifications.map((n) => {
      if (n.targetStudentId && n.targetStudentId !== studentId) return n;
      if (n.readBy.includes(studentId)) return n;
      return { ...n, readBy: [...n.readBy, studentId] };
    });
    saveStore(store2);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-1 rounded-lg hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unread.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-bold">
              {unread.length > 9 ? '9+' : unread.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="font-semibold text-sm text-foreground">Notifications</span>
          {unread.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notifications
              .slice()
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((n) => {
                const isRead = n.readBy.includes(studentId);
                return (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 transition-colors ${!isRead ? 'bg-primary/5' : ''}`}
                    onClick={() => !isRead && handleMarkRead(n.id)}
                  >
                    <div className="flex items-start gap-2">
                      {!isRead && (
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                      <div className={!isRead ? '' : 'pl-4'}>
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(n.createdAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
