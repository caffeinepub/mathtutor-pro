import { useEffect } from 'react';
import { Link, useSearch } from '@tanstack/react-router';
import { CheckCircle } from 'lucide-react';
import { getStore, saveStore } from '../lib/store';

export default function PaymentSuccess() {
  const search = useSearch({ strict: false }) as { session_id?: string; payment_id?: string };

  useEffect(() => {
    try {
      const paymentId = search?.payment_id;
      if (!paymentId) return;

      const store = getStore();
      const paymentIndex = store.payments.findIndex((p) => p.id === paymentId);
      if (paymentIndex !== -1) {
        store.payments[paymentIndex].status = 'approved';

        const payment = store.payments[paymentIndex];
        const totalAmount = payment.amount ?? payment.totalAmount ?? (payment.hours * payment.pricePerHour);
        store.notifications.push({
          id: `notif_${Date.now()}`,
          title: 'Payment Approved',
          message: `Your payment of ₹${totalAmount} for ${payment.courseName} has been approved.`,
          type: 'success',
          readBy: [],
          createdAt: new Date().toISOString(),
        });

        saveStore(store);
      }
    } catch {
      // Silently ignore
    }
  }, [search?.payment_id]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">Payment Successful!</h1>
        <p className="text-muted-foreground mb-8">
          Your payment has been processed successfully. You will receive a confirmation shortly.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/student"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/student/payments"
            className="px-6 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors"
          >
            View Payments
          </Link>
        </div>
      </div>
    </div>
  );
}
