import { X, Download } from 'lucide-react';
import { type Payment } from '../lib/store';

interface ReceiptModalProps {
  payment: Payment;
  onClose: () => void;
}

export default function ReceiptModal({ payment, onClose }: ReceiptModalProps) {
  const totalAmount = payment.amount ?? payment.totalAmount ?? (payment.hours * payment.pricePerHour);

  const statusLabel =
    payment.status === 'approved' || payment.status === 'completed'
      ? 'Payment Approved'
      : payment.status === 'rejected'
      ? 'Payment Rejected'
      : 'Payment Pending';

  const paymentDate = payment.createdAt || payment.date || new Date().toISOString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Payment Receipt</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Download className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-foreground">₹{totalAmount}</h3>
            <p className="text-sm text-muted-foreground mt-1">{statusLabel}</p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Receipt ID</span>
              <span className="font-medium text-foreground">{payment.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Student Name</span>
              <span className="font-medium text-foreground">{payment.studentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Course</span>
              <span className="font-medium text-foreground">{payment.courseName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Session Type</span>
              <span className="font-medium text-foreground capitalize">{payment.sessionType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hours</span>
              <span className="font-medium text-foreground">{payment.hours} hrs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price/Hour</span>
              <span className="font-medium text-foreground">₹{payment.pricePerHour}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">UPI Transaction ID</span>
              <span className="font-medium text-foreground font-mono text-xs">{payment.upiTransactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium text-foreground">
                {new Date(paymentDate).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border">
          <button
            onClick={onClose}
            className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
