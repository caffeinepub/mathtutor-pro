import React, { useState } from 'react';
import { useActor } from '../../hooks/useActor';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock, Copy, Check, RefreshCw, User, AlertTriangle } from 'lucide-react';

interface StudentRecord {
  id: string;
  paymentId: number;
  name: string;
  email: string;
  phone: string;
  courseName: string;
  sessionType: string;
  hours: number;
  totalAmount: number;
  upiTransactionId: string;
  status: 'pending' | 'active' | 'rejected';
  accessCode?: string;
  uniqueCode?: string;
}

function generateUniqueCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'RE-';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function isIC0508Error(err: unknown): boolean {
  if (!err) return false;
  const msg = String((err as any)?.message || err).toLowerCase();
  return msg.includes('ic0508') || msg.includes('canister is stopped') || msg.includes('canister stopped');
}

export default function AdminStudents() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState<{ [key: string]: string }>({});
  const [showRejectInput, setShowRejectInput] = useState<{ [key: string]: boolean }>({});

  // Fetch all payments from backend
  const { data: payments = [], isLoading, refetch } = useQuery({
    queryKey: ['allPayments'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllPayments();
      } catch (err: unknown) {
        if (isIC0508Error(err)) {
          // Return empty array gracefully; health badge will show unavailable
          return [];
        }
        throw err;
      }
    },
    enabled: !!actor,
  });

  // Also get localStorage students as fallback
  const getLocalStudents = (): StudentRecord[] => {
    try {
      const raw = localStorage.getItem('rajats_equation_store');
      if (!raw) return [];
      const store = JSON.parse(raw);
      return (store.students || []).map((s: any) => ({
        id: s.id,
        paymentId: parseInt(s.id) || 0,
        name: s.name,
        email: s.email,
        phone: s.phone || '',
        courseName: s.courseName || s.course || '',
        sessionType: s.sessionType || '',
        hours: s.hours || 0,
        totalAmount: s.totalAmount || 0,
        upiTransactionId: s.upiTransactionId || '',
        status: s.status || 'pending',
        accessCode: s.accessCode,
        uniqueCode: s.uniqueCode || s.accessCode,
      }));
    } catch {
      return [];
    }
  };

  // Merge backend payments with localStorage
  const allStudents: StudentRecord[] = React.useMemo(() => {
    const backendStudents: StudentRecord[] = payments.map(p => ({
      id: String(p.id),
      paymentId: Number(p.id),
      name: p.fullName,
      email: p.email,
      phone: p.phone,
      courseName: p.courseName,
      sessionType: p.sessionType,
      hours: Number(p.hours),
      totalAmount: Number(p.totalAmount),
      upiTransactionId: p.upiTransactionId,
      status: p.status.__kind__ === 'approved' ? 'active' : p.status.__kind__ === 'rejected' ? 'rejected' : 'pending',
      accessCode: p.accessCode ?? undefined,
      uniqueCode: p.uniqueCode ?? undefined,
    }));

    const localStudents = getLocalStudents();

    // Merge: backend takes priority, add local-only ones
    const merged = [...backendStudents];
    for (const ls of localStudents) {
      if (!merged.find(s => s.email === ls.email)) {
        merged.push(ls);
      }
    }
    return merged;
  }, [payments]);

  const approveMutation = useMutation({
    mutationFn: async ({ paymentId, uniqueCode }: { paymentId: number; uniqueCode: string }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.approveUpiPayment(BigInt(paymentId), uniqueCode);
      return result;
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allPayments'] });
      // Also update localStorage
      updateLocalStudentStatus(variables.paymentId, 'active', variables.uniqueCode);
      setActionSuccess(`Student approved! Unique Code: ${variables.uniqueCode}`);
      setTimeout(() => setActionSuccess(null), 5000);
    },
    onError: (err: unknown) => {
      if (isIC0508Error(err)) {
        setActionError(
          'The backend service is temporarily unavailable. Please try again shortly or contact support.'
        );
      } else {
        setActionError(String((err as any)?.message || 'Failed to approve student'));
      }
      setTimeout(() => setActionError(null), 8000);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ paymentId, note }: { paymentId: number; note?: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.rejectUpiPayment(BigInt(paymentId), note || null);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allPayments'] });
      updateLocalStudentStatus(variables.paymentId, 'rejected');
      setActionSuccess('Student rejected.');
      setTimeout(() => setActionSuccess(null), 3000);
    },
    onError: (err: unknown) => {
      if (isIC0508Error(err)) {
        setActionError(
          'The backend service is temporarily unavailable. Please try again shortly or contact support.'
        );
      } else {
        setActionError(String((err as any)?.message || 'Failed to reject student'));
      }
      setTimeout(() => setActionError(null), 8000);
    },
  });

  function updateLocalStudentStatus(paymentId: number, status: string, uniqueCode?: string) {
    try {
      const raw = localStorage.getItem('rajats_equation_store');
      if (!raw) return;
      const store = JSON.parse(raw);
      const students = store.students || [];
      const idx = students.findIndex((s: any) => s.id === String(paymentId) || s.paymentId === paymentId);
      if (idx !== -1) {
        students[idx].status = status;
        if (uniqueCode) {
          students[idx].uniqueCode = uniqueCode;
          students[idx].accessCode = uniqueCode;
        }
        store.students = students;
        localStorage.setItem('rajats_equation_store', JSON.stringify(store));
      }
    } catch {
      // ignore
    }
  }

  function handleApprove(student: StudentRecord) {
    const code = generateUniqueCode();
    approveMutation.mutate({ paymentId: student.paymentId, uniqueCode: code });
  }

  function handleReject(student: StudentRecord) {
    const note = rejectNote[student.id] || '';
    rejectMutation.mutate({ paymentId: student.paymentId, note });
    setShowRejectInput(prev => ({ ...prev, [student.id]: false }));
  }

  function copyCode(code: string, id: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  const statusBadge = (status: string) => {
    if (status === 'active') return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle className="w-3 h-3" /> ACTIVE
      </span>
    );
    if (status === 'rejected') return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
        <XCircle className="w-3 h-3" /> REJECTED
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
        <Clock className="w-3 h-3" /> PENDING
      </span>
    );
  };

  const pending = allStudents.filter(s => s.status === 'pending');
  const active = allStudents.filter(s => s.status === 'active');
  const rejected = allStudents.filter(s => s.status === 'rejected');

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Students Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage student registrations and approvals</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{pending.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-green-600">{active.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{rejected.length}</p>
        </div>
      </div>

      {/* Alerts */}
      {actionError && (
        <div className="mb-4 flex items-start gap-2 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-4 py-3 text-sm">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}
      {actionSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 rounded-lg px-4 py-3 text-sm">
          {actionSuccess}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading students...</div>
      ) : allStudents.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No students registered yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allStudents.map(student => (
            <div key={student.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{student.name}</h3>
                    {statusBadge(student.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{student.email} · {student.phone}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {student.courseName} · {student.sessionType} · {student.hours}h · ₹{student.totalAmount}
                  </p>
                  {student.upiTransactionId && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      UPI Txn: <span className="font-mono">{student.upiTransactionId}</span>
                    </p>
                  )}

                  {/* Show unique code for active students */}
                  {student.status === 'active' && student.uniqueCode && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Unique Code:</span>
                      <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded border border-border text-foreground">
                        {student.uniqueCode}
                      </code>
                      <button
                        onClick={() => copyCode(student.uniqueCode!, student.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title="Copy code"
                      >
                        {copiedId === student.id ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  {student.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(student)}
                        disabled={approveMutation.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {approveMutation.isPending ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5" />
                        )}
                        {approveMutation.isPending ? 'Approving...' : 'Approve & Generate Code'}
                      </button>

                      {showRejectInput[student.id] ? (
                        <div className="flex flex-col gap-1.5">
                          <input
                            type="text"
                            placeholder="Rejection reason (optional)"
                            value={rejectNote[student.id] || ''}
                            onChange={e => setRejectNote(prev => ({ ...prev, [student.id]: e.target.value }))}
                            className="px-2 py-1.5 text-xs border border-border rounded-lg bg-background text-foreground"
                          />
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleReject(student)}
                              disabled={rejectMutation.isPending}
                              className="flex-1 px-2 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Reject'}
                            </button>
                            <button
                              onClick={() => setShowRejectInput(prev => ({ ...prev, [student.id]: false }))}
                              className="px-2 py-1.5 border border-border rounded-lg text-xs hover:bg-muted transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowRejectInput(prev => ({ ...prev, [student.id]: true }))}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      )}
                    </>
                  )}

                  {student.status === 'active' && (
                    <button
                      onClick={() => {
                        if (confirm('Revoke this student\'s access?')) {
                          rejectMutation.mutate({ paymentId: student.paymentId, note: 'Access revoked by admin' });
                        }
                      }}
                      disabled={rejectMutation.isPending}
                      className="px-3 py-1.5 border border-border text-muted-foreground rounded-lg text-sm hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      Revoke Access
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
