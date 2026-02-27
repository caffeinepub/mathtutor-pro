import React, { useState } from 'react';
import { getStore, type Payment } from '../../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IndianRupee, Receipt, TrendingUp } from 'lucide-react';
import ReceiptModal from '../../components/ReceiptModal';

export default function StudentPayments() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  const store = getStore();

  const student = store.students.find((s) => s.userId === currentUser?.id);
  const payments = store.payments.filter((p) => p.studentId === student?.id);

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const totalPaid = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const statusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (status === 'completed') return 'default';
    if (status === 'pending') return 'secondary';
    return 'destructive';
  };

  const getSessionInfo = (sessionId: string) => {
    const session = store.sessions.find((s) => s.id === sessionId);
    if (!session) return 'N/A';
    return `${session.courseName} - ${session.date}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payment History</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {payments.length} payment{payments.length !== 1 ? 's' : ''} total
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Paid</p>
              <p className="text-xl font-bold text-foreground flex items-center gap-0.5">
                <IndianRupee className="w-4 h-4" />
                {totalPaid.toLocaleString('en-IN')}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Receipt className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-xl font-bold text-foreground">
                {payments.filter((p) => p.status === 'completed').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <IndianRupee className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-xl font-bold text-foreground">
                {payments.filter((p) => p.status === 'pending').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 bg-muted rounded-full mb-4">
            <IndianRupee className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Payments Yet</h3>
          <p className="text-muted-foreground text-sm">Your payment history will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments
            .slice()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((payment) => (
              <Card key={payment.id} className="border-border hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                        <IndianRupee className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {getSessionInfo(payment.sessionId)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.createdAt).toLocaleDateString()} • {payment.method}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <p className="font-bold text-primary flex items-center gap-0.5">
                          <IndianRupee className="w-3.5 h-3.5" />
                          {payment.amount.toLocaleString('en-IN')}
                        </p>
                        <Badge variant={statusVariant(payment.status)} className="text-xs">
                          {payment.status}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setSelectedPayment(payment); setReceiptOpen(true); }}
                      >
                        <Receipt className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      <ReceiptModal
        payment={selectedPayment}
        open={receiptOpen}
        onClose={() => { setReceiptOpen(false); setSelectedPayment(null); }}
      />
    </div>
  );
}
