import { useState } from 'react';
import { useGetAllPayments, useApproveUpiPayment, useRejectUpiPayment } from '../../hooks/useQueries';
import type { UpiPayment } from '../../backend';
import { CheckCircle, XCircle, Clock, AlertCircle, Loader2, Eye } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';

const IC0508 = 'IC0508';

function isCanisterStopped(err: unknown): boolean {
  const msg = String(err);
  return msg.includes(IC0508) || msg.toLowerCase().includes('canister stopped');
}

function showError(err: unknown): string {
  if (isCanisterStopped(err)) {
    return 'Backend is temporarily unavailable. Please try again later.';
  }
  return String(err);
}

function getStatusLabel(status: UpiPayment['status']): { label: string; color: string } {
  switch (status.__kind__) {
    case 'pending':
      return { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' };
    case 'approved':
      return { label: 'Approved', color: 'bg-green-100 text-green-700' };
    case 'rejected':
      return { label: 'Rejected', color: 'bg-red-100 text-red-700' };
    default:
      return { label: 'Unknown', color: 'bg-gray-100 text-gray-700' };
  }
}

export default function AdminPayments() {
  const { data: payments = [], isLoading, refetch } = useGetAllPayments();
  const approvePayment = useApproveUpiPayment();
  const rejectPayment = useRejectUpiPayment();

  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedPayment, setSelectedPayment] = useState<UpiPayment | null>(null);
  const [uniqueCode, setUniqueCode] = useState('');
  const [rejectionNote, setRejectionNote] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [successData, setSuccessData] = useState<{ fullName: string; accessCode: string; uniqueCode: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [viewPayment, setViewPayment] = useState<UpiPayment | null>(null);

  const filtered = payments.filter((p) => {
    if (filter === 'all') return true;
    return p.status.__kind__ === filter;
  });

  const handleApprove = async () => {
    if (!selectedPayment || !uniqueCode.trim()) return;
    setErrorMsg('');
    try {
      const result = await approvePayment.mutateAsync({
        paymentId: selectedPayment.id,
        uniqueCode: uniqueCode.trim(),
      });
      if (result.__kind__ === 'ok') {
        setSuccessData(result.ok);
        setSelectedPayment(null);
        setUniqueCode('');
        setActionType(null);
      } else {
        setErrorMsg(result.err);
      }
    } catch (err) {
      setErrorMsg(showError(err));
    }
  };

  const handleReject = async () => {
    if (!selectedPayment) return;
    setErrorMsg('');
    try {
      const result = await rejectPayment.mutateAsync({
        paymentId: selectedPayment.id,
        rejectionNote: rejectionNote.trim() || null,
      });
      if (result.__kind__ === 'ok') {
        setSelectedPayment(null);
        setRejectionNote('');
        setActionType(null);
        refetch();
      } else {
        setErrorMsg(result.err);
      }
    } catch (err) {
      setErrorMsg(showError(err));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Payments</h2>
          <p className="text-muted-foreground">Manage UPI payment requests</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No payments found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((payment) => {
            const { label, color } = getStatusLabel(payment.status);
            return (
              <Card key={String(payment.id)}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground">{payment.fullName}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
                          {label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{payment.email}</p>
                      <p className="text-sm text-muted-foreground">{payment.courseName}</p>
                      <p className="text-sm font-medium text-foreground mt-1">
                        ₹{Number(payment.totalAmount).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        UPI: {payment.upiTransactionId}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setViewPayment(payment)}
                      >
                        <Eye size={14} className="mr-1" />
                        View
                      </Button>
                      {payment.status.__kind__ === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setActionType('approve');
                              setErrorMsg('');
                            }}
                            disabled={approvePayment.isPending}
                          >
                            {approvePayment.isPending ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <>
                                <CheckCircle size={14} className="mr-1" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setActionType('reject');
                              setErrorMsg('');
                            }}
                          >
                            <XCircle size={14} className="mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Approve Dialog */}
      <Dialog
        open={actionType === 'approve' && !!selectedPayment}
        onOpenChange={(open) => {
          if (!open) {
            setActionType(null);
            setSelectedPayment(null);
            setUniqueCode('');
            setErrorMsg('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Approving payment for <strong>{selectedPayment?.fullName}</strong>. Enter a unique
              code for this student.
            </p>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Unique Code
              </label>
              <input
                type="text"
                value={uniqueCode}
                onChange={(e) => setUniqueCode(e.target.value)}
                placeholder="e.g. MATH2024-001"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {errorMsg && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-lg">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionType(null);
                setSelectedPayment(null);
                setUniqueCode('');
                setErrorMsg('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={!uniqueCode.trim() || approvePayment.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {approvePayment.isPending ? (
                <Loader2 size={14} className="animate-spin mr-1" />
              ) : null}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={actionType === 'reject' && !!selectedPayment}
        onOpenChange={(open) => {
          if (!open) {
            setActionType(null);
            setSelectedPayment(null);
            setRejectionNote('');
            setErrorMsg('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Rejecting payment for <strong>{selectedPayment?.fullName}</strong>.
            </p>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Rejection Note (optional)
              </label>
              <textarea
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                placeholder="Reason for rejection..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
            {errorMsg && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-lg">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionType(null);
                setSelectedPayment(null);
                setRejectionNote('');
                setErrorMsg('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectPayment.isPending}
            >
              {rejectPayment.isPending ? (
                <Loader2 size={14} className="animate-spin mr-1" />
              ) : null}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={!!successData} onOpenChange={() => setSuccessData(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle size={20} />
              Payment Approved!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Student credentials have been generated:
            </p>
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Student Name</p>
                <p className="font-medium text-foreground">{successData?.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Access Code</p>
                <p className="font-mono font-bold text-primary">{successData?.accessCode}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Unique Code</p>
                <p className="font-mono font-bold text-foreground">{successData?.uniqueCode}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Share the access code with the student so they can log in.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setSuccessData(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Payment Dialog */}
      <Dialog open={!!viewPayment} onOpenChange={() => setViewPayment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {viewPayment && (
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="font-medium">{viewPayment.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{viewPayment.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{viewPayment.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Course</p>
                  <p className="font-medium">{viewPayment.courseName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Session Type</p>
                  <p className="font-medium">{viewPayment.sessionType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Hours</p>
                  <p className="font-medium">{String(viewPayment.hours)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Price/Hour</p>
                  <p className="font-medium">₹{Number(viewPayment.pricePerHour)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Amount</p>
                  <p className="font-bold text-primary">₹{Number(viewPayment.totalAmount).toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">UPI Transaction ID</p>
                  <p className="font-mono font-medium">{viewPayment.upiTransactionId}</p>
                </div>
                {viewPayment.accessCode && (
                  <div>
                    <p className="text-xs text-muted-foreground">Access Code</p>
                    <p className="font-mono font-bold text-primary">{viewPayment.accessCode}</p>
                  </div>
                )}
                {viewPayment.uniqueCode && (
                  <div>
                    <p className="text-xs text-muted-foreground">Unique Code</p>
                    <p className="font-mono font-bold">{viewPayment.uniqueCode}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Status:</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusLabel(viewPayment.status).color}`}>
                  {getStatusLabel(viewPayment.status).label}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewPayment(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
