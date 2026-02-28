import { useState } from 'react';
import { useActor } from '../../hooks/useActor';
import { useListApprovals, useGetAllPayments } from '../../hooks/useQueries';
import { ApprovalStatus, UserApprovalInfo, UpiPayment } from '../../backend';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function isIC0508Error(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes('IC0508') || msg.toLowerCase().includes('canister stopped');
}

export default function AdminStudents() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [backendError, setBackendError] = useState('');

  const { data: approvals = [], isLoading: approvalsLoading, refetch: refetchApprovals } = useListApprovals();
  const { data: allPayments = [], isLoading: paymentsLoading } = useGetAllPayments();

  const isLoading = approvalsLoading || paymentsLoading;

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (principal: any) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setApproval(principal, ApprovalStatus.approved);
    },
    onSuccess: () => {
      setBackendError('');
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
    onError: (err) => {
      if (isIC0508Error(err)) {
        setBackendError('Backend is temporarily unavailable. Please try again in a moment.');
      } else {
        setBackendError('Failed to approve student. Please try again.');
      }
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async (principal: any) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setApproval(principal, ApprovalStatus.rejected);
    },
    onSuccess: () => {
      setBackendError('');
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
    onError: (err) => {
      if (isIC0508Error(err)) {
        setBackendError('Backend is temporarily unavailable. Please try again in a moment.');
      } else {
        setBackendError('Failed to reject student. Please try again.');
      }
    },
  });

  // Revoke mutation
  const revokeMutation = useMutation({
    mutationFn: async (principal: any) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setApproval(principal, ApprovalStatus.pending);
    },
    onSuccess: () => {
      setBackendError('');
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
    onError: (err) => {
      if (isIC0508Error(err)) {
        setBackendError('Backend is temporarily unavailable. Please try again in a moment.');
      } else {
        setBackendError('Failed to revoke approval. Please try again.');
      }
    },
  });

  // Build a map of principal → payment info for quick lookup
  const paymentsByPrincipal = new Map<string, UpiPayment[]>();
  for (const payment of allPayments) {
    // We can't directly map principal to payment since payments use email
    // We'll show payment info separately
  }

  // Get approved payments (students who paid)
  const approvedPayments = allPayments.filter(
    (p) => p.status.__kind__ === 'approved'
  );
  const pendingPayments = allPayments.filter(
    (p) => p.status.__kind__ === 'pending'
  );

  // Combine approvals with payment data
  // Each approval entry has a principal; we show their approval status
  // Payment data shows who has paid (by email/name)
  const filteredApprovals = approvals.filter((a) => {
    const principalStr = a.principal.toString();
    return principalStr.toLowerCase().includes(search.toLowerCase());
  });

  // Also show payment records that aren't in approvals yet
  const filteredPayments = allPayments.filter((p) => {
    const searchLower = search.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(searchLower) ||
      p.email.toLowerCase().includes(searchLower) ||
      p.courseName.toLowerCase().includes(searchLower)
    );
  });

  const getApprovalStatusBadge = (status: ApprovalStatus) => {
    switch (status) {
      case ApprovalStatus.approved:
        return <Badge className="bg-green-100 text-green-800 border-green-200">✓ Approved</Badge>;
      case ApprovalStatus.rejected:
        return <Badge variant="destructive">✗ Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-amber-600 border-amber-300">⏳ Pending</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: UpiPayment['status']) => {
    if (status.__kind__ === 'approved') {
      return <Badge className="bg-green-100 text-green-800 border-green-200">💰 Paid</Badge>;
    }
    if (status.__kind__ === 'rejected') {
      return <Badge variant="destructive">✗ Rejected</Badge>;
    }
    return <Badge variant="outline" className="text-amber-600 border-amber-300">⏳ Pending</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Students
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage all registered students and their access
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetchApprovals()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Backend Error */}
      {backendError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm text-destructive">
          {backendError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-2xl font-bold text-foreground">{allPayments.length}</div>
          <div className="text-sm text-muted-foreground">Total Registered</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-2xl font-bold text-green-600">{approvedPayments.length}</div>
          <div className="text-sm text-muted-foreground">Paid / Active</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-2xl font-bold text-amber-600">{pendingPayments.length}</div>
          <div className="text-sm text-muted-foreground">Payment Pending</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-2xl font-bold text-primary">{approvals.filter(a => a.status === ApprovalStatus.approved).length}</div>
          <div className="text-sm text-muted-foreground">Portal Approved</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Payments Table (All Registered Students) */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">All Registered Students (Payment Records)</h2>
          <Badge variant="outline" className="ml-auto">{filteredPayments.length}</Badge>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No students registered yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium text-muted-foreground">Student</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Course</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Payment Status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Access Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPayments.map((payment) => (
                  <tr key={String(payment.id)} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="font-medium text-foreground">{payment.fullName}</div>
                      <div className="text-xs text-muted-foreground">{payment.email}</div>
                      <div className="text-xs text-muted-foreground">{payment.phone}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-foreground">{payment.courseName}</div>
                      <div className="text-xs text-muted-foreground">{payment.sessionType} · {String(payment.hours)}h</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-foreground">₹{String(payment.totalAmount)}</div>
                      <div className="text-xs text-muted-foreground">UPI: {payment.upiTransactionId}</div>
                    </td>
                    <td className="p-3">
                      {getPaymentStatusBadge(payment.status)}
                    </td>
                    <td className="p-3">
                      {payment.accessCode ? (
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{payment.accessCode}</code>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Portal Access Table (Internet Identity users) */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Portal Access (Internet Identity Users)</h2>
          <Badge variant="outline" className="ml-auto">{filteredApprovals.length}</Badge>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredApprovals.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No portal users yet</p>
            <p className="text-xs mt-1">Students who log in via Internet Identity will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium text-muted-foreground">Principal ID</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Portal Status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredApprovals.map((approval) => {
                  const principalStr = approval.principal.toString();
                  const isApproving = approveMutation.isPending && approveMutation.variables?.toString() === principalStr;
                  const isRejecting = rejectMutation.isPending && rejectMutation.variables?.toString() === principalStr;
                  const isRevoking = revokeMutation.isPending && revokeMutation.variables?.toString() === principalStr;

                  return (
                    <tr key={principalStr} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono break-all">
                          {principalStr}
                        </code>
                      </td>
                      <td className="p-3">
                        {getApprovalStatusBadge(approval.status)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {approval.status !== ApprovalStatus.approved && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-300 hover:bg-green-50"
                              onClick={() => approveMutation.mutate(approval.principal)}
                              disabled={isApproving || isRejecting || isRevoking}
                            >
                              {isApproving ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              )}
                              Approve
                            </Button>
                          )}
                          {approval.status !== ApprovalStatus.rejected && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive border-destructive/30 hover:bg-destructive/10"
                              onClick={() => rejectMutation.mutate(approval.principal)}
                              disabled={isApproving || isRejecting || isRevoking}
                            >
                              {isRejecting ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : (
                                <XCircle className="h-3 w-3 mr-1" />
                              )}
                              Reject
                            </Button>
                          )}
                          {approval.status === ApprovalStatus.approved && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-amber-600 border-amber-300 hover:bg-amber-50"
                              onClick={() => revokeMutation.mutate(approval.principal)}
                              disabled={isApproving || isRejecting || isRevoking}
                            >
                              {isRevoking ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : (
                                <Clock className="h-3 w-3 mr-1" />
                              )}
                              Revoke
                            </Button>
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
    </div>
  );
}
