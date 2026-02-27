import React, { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { CheckCircle, Home, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getStore, saveStore } from '../lib/store';

export default function PaymentSuccess() {
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    // Process any pending payment completion
    const pendingPayment = sessionStorage.getItem('pendingPayment');
    if (pendingPayment) {
      try {
        const paymentData = JSON.parse(pendingPayment);
        const store = getStore();

        // Update payment status to completed
        const paymentIndex = store.payments.findIndex((p) => p.id === paymentData.id);
        if (paymentIndex >= 0) {
          store.payments[paymentIndex].status = 'completed';
        } else {
          // Add new payment record
          store.payments.push({
            id: paymentData.id || `pay_${Date.now()}`,
            studentId: paymentData.studentId || '',
            sessionId: paymentData.sessionId || '',
            amount: paymentData.amount || 0,
            status: 'completed',
            method: paymentData.method || 'online',
            createdAt: new Date().toISOString(),
          });
        }

        // Update session status to confirmed
        if (paymentData.sessionId) {
          const sessionIndex = store.sessions.findIndex((s) => s.id === paymentData.sessionId);
          if (sessionIndex >= 0) {
            store.sessions[sessionIndex].status = 'confirmed';
          }
        }

        // Notify admin
        const adminUser = store.users.find((u) => u.role === 'admin');
        if (adminUser) {
          store.notifications.push({
            id: `notif_${Date.now()}`,
            userId: adminUser.id,
            title: 'New Payment Received',
            message: `Payment of ₹${paymentData.amount?.toLocaleString('en-IN') || 0} received successfully.`,
            read: false,
            createdAt: new Date().toISOString(),
          });
        }

        saveStore(store);
        sessionStorage.removeItem('pendingPayment');
      } catch (e) {
        console.error('Failed to process payment:', e);
      }
    }
    setProcessed(true);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground text-sm">
              Your session has been booked and confirmed. You'll receive details shortly.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link to="/student/sessions">
              <Button className="w-full">
                <BookOpen className="w-4 h-4 mr-2" />
                View My Sessions
              </Button>
            </Link>
            <Link to="/student">
              <Button variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
