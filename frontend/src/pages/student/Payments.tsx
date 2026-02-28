import { useState } from 'react';
import { getStore } from '../../lib/store';
import { getAuthState } from '../../lib/auth';
import type { Payment } from '../../lib/store';
import ReceiptModal from '../../components/ReceiptModal';
import { CreditCard, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function StudentPayments() {
  const auth = getAuthState();
  const store = getStore();

  const studentId = auth?.studentId || '';
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const payments = store.payments
    .filter((p) => p.studentId === studentId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const approvedPayments = payments.filter((p) => p.status === 'approved');
  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const totalSpent = approvedPayments.reduce((sum, p) => sum + p.amount, 0);

  const statusIcon = (status: Payment['status']) => {
    if (status === 'approved') return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (status === 'rejected') return <XCircle className="w-4 h-4 text-red-600" />;
    return <Clock className="w-4 h-4 text-amber-600" />;
  };

  const statusLabel = (status: Payment['status']) => {
    if (status === 'approved') return 'Approved';
    if (status === 'rejected') return 'Rejected';
    return 'Pending';
  };

  const statusClass = (status: Payment['status']) => {
    if (status === 'approved') return 'bg-green-100 text-green-700';
    if (status === 'rejected') return 'bg-red-100 text-red-700';
    return 'bg-amber-100 text-amber-700';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Payments</h1>
        <p className="text-muted-foreground text-sm mt-1">Your payment history</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground mb-1">Total Spent</div>
          <div className="text-xl font-bold text-foreground">₹{totalSpent.toLocaleString('en-IN')}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground mb-1">Approved</div>
          <div className="text-xl font-bold text-green-600">{approvedPayments.length}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground mb-1">Pending</div>
          <div className="text-xl font-bold text-amber-600">{pendingPayments.length}</div>
        </div>
      </div>

      {/* Payments List */}
      {payments.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No payments yet</p>
          <p className="text-sm mt-1">Your payment history will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <div key={payment.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {payment.courseName}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 flex items-center gap-1 ${statusClass(payment.status)}`}
                    >
                      {statusIcon(payment.status)}
                      {statusLabel(payment.status)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">
                    {payment.sessionType} · {payment.hours}h
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    UPI: {payment.upiTransactionId}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold text-foreground">
                    ₹{payment.amount.toLocaleString()}
                  </div>
                  <button
                    onClick={() => setSelectedPayment(payment)}
                    className="text-xs text-primary hover:underline mt-1"
                  >
                    View Receipt
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPayment && (
        <ReceiptModal payment={selectedPayment} onClose={() => setSelectedPayment(null)} />
      )}
    </div>
  );
}
