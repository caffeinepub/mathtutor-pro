import React, { useState } from 'react';
import { getStore, saveStore, type Payment } from '../../lib/store';
import { CheckCircle, XCircle, Clock, Eye, RefreshCw, Copy, Check, AlertTriangle } from 'lucide-react';

function generateAccessCode(paymentId: string): string {
  const num = parseInt(paymentId.replace(/\D/g, ''), 10) || Math.floor(Math.random() * 900) + 100;
  const padded = String(num % 1000).padStart(3, '0');
  return `RJMATH-${padded}`;
}

function generateUniqueCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function isIC0508Error(err: unknown): boolean {
  if (!err) return false;
  const msg = String((err as any)?.message || err).toLowerCase();
  return msg.includes('ic0508') || msg.includes('canister is stopped') || msg.includes('canister stopped');
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>(() => {
    try {
      return getStore().payments || [];
    } catch {
      return [];
    }
  });
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectionNote, setRejectionNote] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<Payment | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    accessCode: string;
    uniqueCode: string;
    studentName: string;
    studentEmail: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<'accessCode' | 'uniqueCode' | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const refreshPayments = () => {
    try {
      setPayments(getStore().payments || []);
    } catch {
      setPayments([]);
    }
  };

  const filteredPayments = payments.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const copyToClipboard = async (text: string, field: 'accessCode' | 'uniqueCode') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const showError = (err: unknown) => {
    if (isIC0508Error(err)) {
      setActionError(
        'The backend service is temporarily unavailable. Please try again shortly or contact support.'
      );
    } else {
      setActionError(
        String((err as any)?.message || 'An unexpected error occurred. Please try again.')
      );
    }
    setTimeout(() => setActionError(null), 8000);
  };

  const handleApprove = async (payment: Payment) => {
    setApproving(payment.id);
    setActionError(null);
    try {
      const accessCode = generateAccessCode(payment.id);
      const uniqueCode = generateUniqueCode();

      const store = getStore();

      // Update payment record with both accessCode and uniqueCode
      const paymentIndex = store.payments.findIndex(p => p.id === payment.id);
      if (paymentIndex !== -1) {
        store.payments[paymentIndex] = {
          ...store.payments[paymentIndex],
          status: 'approved',
          accessCode,
          uniqueCode,
        };
      }

      // Update student record if exists — set status to approved and store both codes
      const studentIndex = store.students.findIndex(s => s.id === payment.studentId);
      if (studentIndex !== -1) {
        store.students[studentIndex] = {
          ...store.students[studentIndex],
          status: 'approved',
          accessCode,
          uniqueCode,
        };
      }

      saveStore(store);

      // Get student email for display
      const student = store.students.find(s => s.id === payment.studentId);
      const studentEmail = student?.email || '';

      setSuccessInfo({ accessCode, uniqueCode, studentName: payment.studentName, studentEmail });
      refreshPayments();
    } catch (err: unknown) {
      showError(err);
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (payment: Payment) => {
    setRejecting(payment.id);
    setActionError(null);
    try {
      const store = getStore();
      const paymentIndex = store.payments.findIndex(p => p.id === payment.id);
      if (paymentIndex !== -1) {
        store.payments[paymentIndex] = {
          ...store.payments[paymentIndex],
          status: 'rejected',
        };
        saveStore(store);
      }
      setShowRejectModal(null);
      setRejectionNote('');
      refreshPayments();
    } catch (err: unknown) {
      showError(err);
    } finally {
      setRejecting(null);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'approved':
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payment Management</h1>
          <p className="text-muted-foreground mt-1">Review and approve student UPI payments</p>
        </div>
        <button
          onClick={refreshPayments}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Error Banner */}
      {actionError && (
        <div className="mb-5 flex items-start gap-2 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-4 py-3 text-sm">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {(['pending', 'approved', 'rejected'] as const).map(status => {
          const count = payments.filter(p => p.status === status).length;
          const colors = {
            pending: 'bg-yellow-50 border-yellow-200 text-yellow-700',
            approved: 'bg-green-50 border-green-200 text-green-700',
            rejected: 'bg-red-50 border-red-200 text-red-700',
          };
          return (
            <div key={status} className={`rounded-xl border p-4 ${colors[status]}`}>
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-sm capitalize font-medium">{status} Payments</div>
            </div>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Payments Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No {filter !== 'all' ? filter : ''} payments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Course</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Hours</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">UPI Txn ID</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Access Code</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPayments.map(payment => {
                  const totalAmt = payment.amount ?? payment.totalAmount ?? (payment.hours * payment.pricePerHour);
                  return (
                    <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{payment.studentName}</div>
                        <div className="text-xs text-muted-foreground">{payment.id}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-foreground">{payment.courseName}</div>
                        <div className="text-xs text-muted-foreground">{payment.sessionType}</div>
                      </td>
                      <td className="px-4 py-3 text-foreground">{payment.hours}h</td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        ₹{totalAmt.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                          {payment.upiTransactionId}
                        </span>
                      </td>
                      <td className="px-4 py-3">{statusBadge(payment.status)}</td>
                      <td className="px-4 py-3">
                        {payment.accessCode ? (
                          <span className="font-mono text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200">
                            {payment.accessCode}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedPayment(payment)}
                            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {payment.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(payment)}
                                disabled={approving === payment.id}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-colors disabled:opacity-50"
                              >
                                {approving === payment.id ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-3 h-3" />
                                )}
                                {approving === payment.id ? 'Approving...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => setShowRejectModal(payment)}
                                disabled={rejecting === payment.id}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors disabled:opacity-50"
                              >
                                <XCircle className="w-3 h-3" />
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Payment Details</h2>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-muted-foreground hover:text-foreground transition-colors text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-sm">
              {([
                ['Student', selectedPayment.studentName],
                ['Course', selectedPayment.courseName],
                ['Session Type', selectedPayment.sessionType],
                ['Hours', `${selectedPayment.hours}h`],
                ['Price/Hour', `₹${selectedPayment.pricePerHour}`],
                ['Total Amount', `₹${(selectedPayment.amount ?? selectedPayment.totalAmount ?? (selectedPayment.hours * selectedPayment.pricePerHour)).toLocaleString()}`],
                ['UPI Transaction ID', selectedPayment.upiTransactionId],
                ['Status', selectedPayment.status],
                ...(selectedPayment.accessCode ? [['Access Code', selectedPayment.accessCode]] : []),
                ...(selectedPayment.uniqueCode ? [['Unique Login Code', selectedPayment.uniqueCode]] : []),
                ['Date', selectedPayment.createdAt ? new Date(selectedPayment.createdAt).toLocaleDateString() : 'N/A'],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-foreground text-right max-w-[60%] break-all">{value}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSelectedPayment(null)}
              className="mt-6 w-full py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-foreground mb-2">Reject Payment</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Are you sure you want to reject the payment from <strong>{showRejectModal.studentName}</strong>?
            </p>
            <textarea
              value={rejectionNote}
              onChange={e => setRejectionNote(e.target.value)}
              placeholder="Optional rejection note..."
              className="w-full border border-border rounded-lg p-3 text-sm bg-background text-foreground resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowRejectModal(null); setRejectionNote(''); }}
                className="flex-1 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                disabled={rejecting === showRejectModal.id}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                {rejecting === showRejectModal.id ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal — shows generated credentials */}
      {successInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl shadow-xl max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-1">Payment Approved!</h2>
            <p className="text-muted-foreground text-sm mb-5">
              Credentials generated for <strong>{successInfo.studentName}</strong>
              {successInfo.studentEmail && (
                <span className="block text-xs mt-0.5">{successInfo.studentEmail}</span>
              )}
            </p>

            <div className="bg-muted rounded-xl p-4 space-y-4 text-left mb-5">
              {/* Access Code */}
              <div>
                <div className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">
                  Access Code
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xl text-primary flex-1">
                    {successInfo.accessCode}
                  </span>
                  <button
                    onClick={() => copyToClipboard(successInfo.accessCode, 'accessCode')}
                    className="p-2 rounded-lg hover:bg-background transition-colors text-muted-foreground hover:text-foreground"
                    title="Copy access code"
                  >
                    {copiedField === 'accessCode' ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Unique Login Code */}
              <div>
                <div className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">
                  Unique Login Code
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xl text-amber-600 flex-1">
                    {successInfo.uniqueCode}
                  </span>
                  <button
                    onClick={() => copyToClipboard(successInfo.uniqueCode, 'uniqueCode')}
                    className="p-2 rounded-lg hover:bg-background transition-colors text-muted-foreground hover:text-foreground"
                    title="Copy unique code"
                  >
                    {copiedField === 'uniqueCode' ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-amber-600 mt-1.5 font-medium">
                  ⚠️ Share this unique code with the student — they need it to log in.
                </p>
              </div>
            </div>

            <button
              onClick={() => setSuccessInfo(null)}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
