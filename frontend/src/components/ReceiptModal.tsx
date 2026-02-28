import type { Payment } from '../lib/store';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface ReceiptModalProps {
  payment: Payment | null;
  onClose: () => void;
}

export default function ReceiptModal({ payment, onClose }: ReceiptModalProps) {
  if (!payment) return null;

  const totalAmount = payment.amount ?? (payment.hours * payment.pricePerHour);
  const isApproved = payment.status === 'approved';
  const paymentDate = payment.createdAt || new Date().toISOString();

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  return (
    <Dialog open={!!payment} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Payment Receipt</span>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X size={18} />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Banner */}
          <div
            className={`rounded-lg px-4 py-3 text-center font-semibold text-sm ${
              isApproved
                ? 'bg-green-100 text-green-700'
                : payment.status === 'pending'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {isApproved ? '✓ Payment Approved' : payment.status === 'pending' ? '⏳ Pending Approval' : '✗ Payment Rejected'}
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Student</span>
              <span className="font-medium text-foreground">{payment.studentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Course</span>
              <span className="font-medium text-foreground">{payment.courseName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Session Type</span>
              <span className="font-medium text-foreground">{payment.sessionType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hours</span>
              <span className="font-medium text-foreground">{payment.hours}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price/Hour</span>
              <span className="font-medium text-foreground">₹{payment.pricePerHour}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 mt-2">
              <span className="font-semibold text-foreground">Total Amount</span>
              <span className="font-bold text-primary text-base">₹{totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">UPI Transaction ID</span>
              <span className="font-mono text-xs text-foreground">{payment.upiTransactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium text-foreground">{formatDate(paymentDate)}</span>
            </div>
            {payment.accessCode && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Access Code</span>
                <span className="font-mono font-bold text-primary">{payment.accessCode}</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
