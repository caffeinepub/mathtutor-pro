import { useState } from 'react';
import { CheckCircle, XCircle, CreditCard, Clock, TrendingUp } from 'lucide-react';
import { getStore, saveStore, type Payment } from '../../lib/store';
import ReceiptModal from '../../components/ReceiptModal';

export default function AdminPayments() {
  const [store, setStore] = useState(() => getStore());
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const refresh = () => setStore(getStore());

  const approvedPayments = store.payments.filter(
    (p) => p.status === 'approved' || p.status === 'completed'
  );
  const pendingPayments = store.payments.filter((p) => p.status === 'pending');

  const handleApprove = (paymentId: string) => {
    const currentStore = getStore();
    const idx = currentStore.payments.findIndex((p) => p.id === paymentId);
    if (idx === -1) return;
    currentStore.payments[idx].status = 'approved';

    const payment = currentStore.payments[idx];
    const totalAmount = payment.amount ?? payment.totalAmount ?? (payment.hours * payment.pricePerHour);
    currentStore.notifications.push({
      id: `notif_${Date.now()}`,
      title: 'Payment Approved',
      message: `Your payment of ₹${totalAmount} for ${payment.courseName} has been approved.`,
      type: 'success',
      targetStudentId: payment.studentId,
      readBy: [],
      createdAt: new Date().toISOString(),
    });

    saveStore(currentStore);
    refresh();
  };

  const handleReject = (paymentId: string) => {
    const currentStore = getStore();
    const idx = currentStore.payments.findIndex((p) => p.id === paymentId);
    if (idx === -1) return;
    currentStore.payments[idx].status = 'rejected';
    saveStore(currentStore);
    refresh();
  };

  const totalRevenue = approvedPayments.reduce((sum, p) => {
    const amt = p.amount ?? p.totalAmount ?? (p.hours * p.pricePerHour);
    return sum + amt;
  }, 0);

  const filtered = store.payments.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'approved') return p.status === 'approved' || p.status === 'completed';
    return p.status === filter;
  });

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Payments</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage student payments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-xs text-muted-foreground">Total Revenue</span>
          </div>
          <div className="text-xl font-bold text-foreground">₹{totalRevenue.toLocaleString('en-IN')}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{approvedPayments.length} approved</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-xs text-muted-foreground">Pending</span>
          </div>
          <div className="text-xl font-bold text-foreground">{pendingPayments.length}</div>
          <div className="text-xs text-muted-foreground mt-0.5">awaiting review</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
          <div className="text-xl font-bold text-foreground">{store.payments.length}</div>
          <div className="text-xs text-muted-foreground mt-0.5">all payments</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'border border-border hover:bg-muted'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Payments List */}
      <div className="space-y-3">
        {sorted.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No payments found.</p>
          </div>
        ) : (
          sorted.map((payment) => {
            const totalAmount = payment.amount ?? payment.totalAmount ?? (payment.hours * payment.pricePerHour);
            return (
              <div key={payment.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-foreground">{payment.studentName}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        payment.status === 'approved' || payment.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : payment.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{payment.courseName} · {payment.sessionType}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {payment.hours}h × ₹{payment.pricePerHour}/hr · UPI: {payment.upiTransactionId}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(payment.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-foreground">₹{totalAmount}</div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="text-xs px-2 py-1 border border-border rounded-lg hover:bg-muted transition-colors"
                      >
                        Receipt
                      </button>
                      {payment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(payment.id)}
                            className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(payment.id)}
                            className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedPayment && (
        <ReceiptModal payment={selectedPayment} onClose={() => setSelectedPayment(null)} />
      )}
    </div>
  );
}
