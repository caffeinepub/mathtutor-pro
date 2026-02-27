import React, { useState } from 'react';
import { getStore, getAuthState, type Payment } from '../../lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IndianRupee, Receipt, TrendingUp, CreditCard } from 'lucide-react';
import ReceiptModal from '../../components/ReceiptModal';

export default function StudentPayments() {
  const auth = getAuthState();
  const store = getStore();

  const student = store.students.find((s) => s.userId === auth.userId);
  const payments = student
    ? store.payments.filter((p) => p.studentId === student.id)
    : [];

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

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Payment History</h1>
      <p className="text-slate-500 mb-6">Track all your session payments.</p>

      {/* Summary */}
      {payments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
      )}

      {payments.length === 0 ? (
        <div className="text-center py-16 bg-sky-50 rounded-2xl border border-sky-100">
          <CreditCard size={56} className="mx-auto text-sky-300 mb-4" />
          <h2 className="text-xl font-semibold text-slate-700 mb-2">No Payments Yet</h2>
          <p className="text-slate-500">Your payment history will appear here after booking sessions.</p>
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
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                        <IndianRupee className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {payment.courseName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate capitalize">
                          {payment.sessionType} · {payment.hours} hour{payment.hours !== 1 ? 's' : ''} · ₹{payment.pricePerHour}/hr
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.createdAt).toLocaleDateString()}
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
                        className="shrink-0"
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
