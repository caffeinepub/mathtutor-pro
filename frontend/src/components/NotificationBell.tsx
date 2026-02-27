import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { getStore, saveStore, markNotificationRead, type Notification } from '../lib/store';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NotificationBellProps {
  studentId: string;
}

export default function NotificationBell({ studentId }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    getStore().notifications.filter(
      (n) => !n.targetStudentId || n.targetStudentId === studentId
    )
  );

  const unreadCount = notifications.filter((n) => !n.readBy.includes(studentId)).length;

  const markAllRead = () => {
    const store = getStore();
    notifications.forEach((n) => {
      if (!n.readBy.includes(studentId)) {
        const idx = store.notifications.findIndex((sn) => sn.id === n.id);
        if (idx >= 0 && !store.notifications[idx].readBy.includes(studentId)) {
          store.notifications[idx].readBy.push(studentId);
        }
      }
    });
    saveStore(store);
    setNotifications(
      store.notifications.filter(
        (n) => !n.targetStudentId || n.targetStudentId === studentId
      )
    );
  };

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setNotifications(
        getStore().notifications.filter(
          (n) => !n.targetStudentId || n.targetStudentId === studentId
        )
      );
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 text-xs px-1 py-0 min-w-[18px] h-[18px] flex items-center justify-center"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications
                .slice()
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((n) => {
                  const isUnread = !n.readBy.includes(studentId);
                  return (
                    <div
                      key={n.id}
                      className={`px-4 py-3 ${isUnread ? 'bg-primary/5' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        {isUnread && (
                          <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                        )}
                        <div className={isUnread ? '' : 'pl-4'}>
                          <p className="text-sm font-medium text-foreground">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
