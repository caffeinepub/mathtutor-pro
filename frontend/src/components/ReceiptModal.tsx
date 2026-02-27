import React from 'react';
import { getStore, type Payment, type Student, type Session, type Course } from '../lib/store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { IndianRupee, Calendar, Clock, BookOpen, User, Users } from 'lucide-react';

interface ReceiptModalProps {
  payment: Payment | null;
  open: boolean;
  onClose: () => void;
}

export default function ReceiptModal({ payment, open, onClose }: ReceiptModalProps) {
  if (!payment) return null;

  const store = getStore();
  const student = store.students.find((s: Student) => s.id === payment.studentId);

  const statusColor = {
    completed: 'default',
    pending: 'secondary',
    failed: 'destructive',
  } as const;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-primary" />
            Payment Receipt
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Receipt header */}
          <div className="text-center py-3 bg-muted/30 rounded-lg">
            <img
              src="/assets/generated/rajats-equation-logo.dim_400x300.png"
              alt="The Rajat's Equation"
              className="h-10 w-auto object-contain mx-auto mb-2"
            />
            <p className="text-xs text-muted-foreground">Receipt #{payment.id.slice(-8).toUpperCase()}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          <Separator />

          {/* Student info */}
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Student:</span>
            <span className="font-medium text-foreground">
              {payment.studentName || student?.name || 'Unknown'}
            </span>
          </div>

          {/* Course info */}
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Course:</span>
            <span className="font-medium text-foreground">{payment.courseName}</span>
          </div>

          {/* Session type */}
          <div className="flex items-center gap-2 text-sm">
            {payment.sessionType === 'group' ? (
              <Users className="w-4 h-4 text-muted-foreground" />
            ) : (
              <User className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="text-muted-foreground">Session Type:</span>
            <span className="font-medium text-foreground capitalize">{payment.sessionType}</span>
          </div>

          {/* Hours */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Hours:</span>
            <span className="font-medium text-foreground">{payment.hours} hour{payment.hours !== 1 ? 's' : ''}</span>
          </div>

          {/* Rate */}
          <div className="flex items-center gap-2 text-sm">
            <IndianRupee className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Rate:</span>
            <span className="font-medium text-foreground">₹{payment.pricePerHour}/hr</span>
          </div>

          {payment.upiTransactionId && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">UPI Txn ID:</span>
              <span className="font-medium text-foreground font-mono text-xs">{payment.upiTransactionId}</span>
            </div>
          )}

          <Separator />

          {/* Payment details */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={statusColor[payment.status] || 'secondary'} className="text-xs">
                {payment.status}
              </Badge>
            </div>
            <div className="flex justify-between text-base font-bold">
              <span className="text-foreground">Total Amount</span>
              <span className="text-primary flex items-center gap-0.5">
                <IndianRupee className="w-4 h-4" />
                {payment.amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
