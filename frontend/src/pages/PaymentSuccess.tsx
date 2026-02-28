import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { CheckCircle, Home, BookOpen } from 'lucide-react';
import { getStore, addNotification } from '../lib/store';
import { getAuthState } from '../lib/auth';

export default function PaymentSuccess() {
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    if (processed) return;
    setProcessed(true);

    try {
      const auth = getAuthState();
      const store = getStore();
      const studentId = auth?.studentId;

      if (studentId) {
        // Find the most recent pending payment for this student
        const payment = [...store.payments]
          .filter((p) => p.studentId === studentId && p.status === 'pending')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

        if (payment) {
          addNotification({
            title: 'Payment Submitted',
            message: `Your payment of ₹${payment.amount.toLocaleString()} for ${payment.courseName} has been submitted and is pending approval.`,
            type: 'success',
            targetStudentId: studentId,
            readBy: [],
          });
        }
      }
    } catch {
      // ignore notification errors
    }
  }, [processed]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle size={40} className="text-green-600" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground">Payment Submitted!</h1>
          <p className="text-muted-foreground mt-2">
            Your payment has been submitted successfully. Please wait for admin approval.
            You'll receive your access code once approved.
          </p>
        </div>

        <div className="bg-muted rounded-xl p-4 text-sm text-left space-y-2">
          <p className="font-medium text-foreground">What happens next?</p>
          <ul className="space-y-1 text-muted-foreground list-disc list-inside">
            <li>Admin will verify your UPI transaction</li>
            <li>You'll receive an access code via email</li>
            <li>Use the access code to log in to your student portal</li>
          </ul>
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-sm"
          >
            <Home size={16} />
            Home
          </Link>
          <Link
            to="/register"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm"
          >
            <BookOpen size={16} />
            Register Another
          </Link>
        </div>
      </div>
    </div>
  );
}
