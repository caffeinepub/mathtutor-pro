import React, { useState } from 'react';
import {
  Users, Search, CheckCircle, Clock, Mail, Phone, BookOpen,
  Calendar, CreditCard, Eye, Pencil, Loader2, X, Save
} from 'lucide-react';
import { useAllStudents, useUpdateStudent } from '../../hooks/useQueries';
import { Student, UpiPaymentStatus, StripeSessionStatus } from '../../backend';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

function getPaymentStatusLabel(student: Student): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
  const ps = student.paymentStatus;
  if (ps.__kind__ === 'upi') {
    const upi = ps.upi;
    if (upi.__kind__ === 'approved') return { label: 'Active / Booked', variant: 'default' };
    if (upi.__kind__ === 'pending') return { label: 'Pending Payment', variant: 'secondary' };
    if (upi.__kind__ === 'rejected') return { label: 'Rejected', variant: 'destructive' };
  }
  if (ps.__kind__ === 'stripe') {
    const stripe = ps.stripe;
    if (stripe.__kind__ === 'completed') return { label: 'Active / Booked', variant: 'default' };
    if (stripe.__kind__ === 'failed') return { label: 'Payment Failed', variant: 'destructive' };
  }
  return { label: 'Unknown', variant: 'outline' };
}

function isActiveStudent(student: Student): boolean {
  const ps = student.paymentStatus;
  if (ps.__kind__ === 'upi' && ps.upi.__kind__ === 'approved') return true;
  if (ps.__kind__ === 'stripe' && ps.stripe.__kind__ === 'completed') return true;
  return false;
}

function isPendingStudent(student: Student): boolean {
  const ps = student.paymentStatus;
  return ps.__kind__ === 'upi' && ps.upi.__kind__ === 'pending';
}

function formatDate(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── View Detail Modal ────────────────────────────────────────────────────────
function StudentDetailModal({ student, open, onClose, onEdit }: {
  student: Student | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
}) {
  if (!student) return null;
  const statusInfo = getPaymentStatusLabel(student);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
          <DialogDescription>Full enrollment information for {student.fullName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-lg">{student.fullName}</span>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{student.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium">{student.phone}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Course</p>
              <p className="font-medium">{student.course}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Session Type</p>
              <p className="font-medium">{student.sessionType}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Hours</p>
              <p className="font-medium">{student.hours.toString()} hrs</p>
            </div>
            <div>
              <p className="text-muted-foreground">Enrollment Date</p>
              <p className="font-medium">{formatDate(student.enrollmentDate)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Active Status</p>
              <p className="font-medium">{student.isActive ? 'Active' : 'Inactive'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Transaction ID</p>
              <p className="font-medium font-mono text-xs break-all">{student.transactionId || '—'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Principal</p>
              <p className="font-medium font-mono text-xs break-all">{student.principal.toString()}</p>
            </div>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Student
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Student Modal ───────────────────────────────────────────────────────
interface EditForm {
  fullName: string;
  email: string;
  phone: string;
  course: string;
  sessionType: string;
  hours: string;
  transactionId: string;
  enrollmentDate: string; // ISO date string YYYY-MM-DD
  isActive: boolean;
  paymentKind: 'upi_pending' | 'upi_approved' | 'upi_rejected' | 'stripe_completed' | 'stripe_failed';
  upiApprovedCode: string;
  upiRejectedNote: string;
}

function toEditForm(student: Student): EditForm {
  const ps = student.paymentStatus;
  let paymentKind: EditForm['paymentKind'] = 'upi_pending';
  let upiApprovedCode = '';
  let upiRejectedNote = '';

  if (ps.__kind__ === 'upi') {
    if (ps.upi.__kind__ === 'approved') {
      paymentKind = 'upi_approved';
      upiApprovedCode = ps.upi.approved;
    } else if (ps.upi.__kind__ === 'rejected') {
      paymentKind = 'upi_rejected';
      upiRejectedNote = ps.upi.rejected ?? '';
    } else {
      paymentKind = 'upi_pending';
    }
  } else if (ps.__kind__ === 'stripe') {
    paymentKind = ps.stripe.__kind__ === 'completed' ? 'stripe_completed' : 'stripe_failed';
  }

  const ms = Number(student.enrollmentDate) / 1_000_000;
  const dateStr = new Date(ms).toISOString().split('T')[0];

  return {
    fullName: student.fullName,
    email: student.email,
    phone: student.phone,
    course: student.course,
    sessionType: student.sessionType,
    hours: student.hours.toString(),
    transactionId: student.transactionId,
    enrollmentDate: dateStr,
    isActive: student.isActive,
    paymentKind,
    upiApprovedCode,
    upiRejectedNote,
  };
}

function buildPaymentStatus(form: EditForm): { __kind__: 'upi'; upi: UpiPaymentStatus } | { __kind__: 'stripe'; stripe: StripeSessionStatus } {
  switch (form.paymentKind) {
    case 'upi_pending':
      return { __kind__: 'upi', upi: { __kind__: 'pending', pending: null } };
    case 'upi_approved':
      return { __kind__: 'upi', upi: { __kind__: 'approved', approved: form.upiApprovedCode } };
    case 'upi_rejected':
      return { __kind__: 'upi', upi: { __kind__: 'rejected', rejected: form.upiRejectedNote || null } };
    case 'stripe_completed':
      return { __kind__: 'stripe', stripe: { __kind__: 'completed', completed: { response: '', userPrincipal: undefined } } };
    case 'stripe_failed':
      return { __kind__: 'stripe', stripe: { __kind__: 'failed', failed: { error: '' } } };
  }
}

function EditStudentModal({ student, open, onClose }: {
  student: Student | null;
  open: boolean;
  onClose: () => void;
}) {
  const updateStudent = useUpdateStudent();
  const [form, setForm] = useState<EditForm | null>(null);

  // Sync form when student changes
  React.useEffect(() => {
    if (student) setForm(toEditForm(student));
  }, [student]);

  if (!student || !form) return null;

  const set = (patch: Partial<EditForm>) => setForm(f => f ? { ...f, ...patch } : f);

  const handleSave = async () => {
    if (!form.fullName.trim()) { toast.error('Full name is required'); return; }
    if (!form.email.trim()) { toast.error('Email is required'); return; }
    if (!form.phone.trim()) { toast.error('Phone is required'); return; }
    if (!form.course.trim()) { toast.error('Course is required'); return; }
    if (!form.sessionType.trim()) { toast.error('Session type is required'); return; }

    const enrollmentMs = form.enrollmentDate
      ? new Date(form.enrollmentDate).getTime() * 1_000_000
      : Number(student.enrollmentDate);

    try {
      await updateStudent.mutateAsync({
        principal: student.principal,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        course: form.course.trim(),
        sessionType: form.sessionType.trim(),
        hours: BigInt(parseInt(form.hours) || 0),
        paymentStatus: buildPaymentStatus(form),
        transactionId: form.transactionId.trim(),
        enrollmentDate: BigInt(enrollmentMs),
        isActive: form.isActive,
      });
      toast.success('Student updated successfully!');
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to update student');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Edit Student
          </DialogTitle>
          <DialogDescription>Update enrollment details for {student.fullName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Personal Info */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-fullName">Full Name *</Label>
                <Input
                  id="edit-fullName"
                  value={form.fullName}
                  onChange={e => set({ fullName: e.target.value })}
                  placeholder="Student full name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={form.email}
                  onChange={e => set({ email: e.target.value })}
                  placeholder="student@email.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-phone">Phone *</Label>
                <Input
                  id="edit-phone"
                  value={form.phone}
                  onChange={e => set({ phone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-enrollmentDate">Enrollment Date</Label>
                <Input
                  id="edit-enrollmentDate"
                  type="date"
                  value={form.enrollmentDate}
                  onChange={e => set({ enrollmentDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Course Info */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Course Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-course">Course *</Label>
                <Input
                  id="edit-course"
                  value={form.course}
                  onChange={e => set({ course: e.target.value })}
                  placeholder="e.g. Mathematics"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-sessionType">Session Type *</Label>
                <Input
                  id="edit-sessionType"
                  value={form.sessionType}
                  onChange={e => set({ sessionType: e.target.value })}
                  placeholder="e.g. Online / Offline"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-hours">Hours</Label>
                <Input
                  id="edit-hours"
                  type="number"
                  min="0"
                  value={form.hours}
                  onChange={e => set({ hours: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-transactionId">Transaction ID</Label>
                <Input
                  id="edit-transactionId"
                  value={form.transactionId}
                  onChange={e => set({ transactionId: e.target.value })}
                  placeholder="UPI / Stripe transaction ID"
                />
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Payment & Enrollment Status</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Payment Status</Label>
                <Select value={form.paymentKind} onValueChange={v => set({ paymentKind: v as EditForm['paymentKind'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upi_pending">UPI — Pending</SelectItem>
                    <SelectItem value="upi_approved">UPI — Approved / Active</SelectItem>
                    <SelectItem value="upi_rejected">UPI — Rejected</SelectItem>
                    <SelectItem value="stripe_completed">Stripe — Completed</SelectItem>
                    <SelectItem value="stripe_failed">Stripe — Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.paymentKind === 'upi_approved' && (
                <div className="space-y-1.5">
                  <Label htmlFor="edit-upiCode">Access Code (UPI Approved)</Label>
                  <Input
                    id="edit-upiCode"
                    value={form.upiApprovedCode}
                    onChange={e => set({ upiApprovedCode: e.target.value })}
                    placeholder="e.g. RJMATH-001"
                  />
                </div>
              )}

              {form.paymentKind === 'upi_rejected' && (
                <div className="space-y-1.5">
                  <Label htmlFor="edit-rejNote">Rejection Note</Label>
                  <Input
                    id="edit-rejNote"
                    value={form.upiRejectedNote}
                    onChange={e => set({ upiRejectedNote: e.target.value })}
                    placeholder="Reason for rejection (optional)"
                  />
                </div>
              )}

              <div className="flex items-center gap-3 pt-1">
                <Checkbox
                  id="edit-isActive"
                  checked={form.isActive}
                  onCheckedChange={checked => set({ isActive: !!checked })}
                />
                <Label htmlFor="edit-isActive" className="cursor-pointer">
                  Student is Active
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" onClick={onClose} disabled={updateStudent.isPending}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateStudent.isPending}>
            {updateStudent.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
            ) : (
              <><Save className="h-4 w-4 mr-2" />Save Changes</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminStudents() {
  const { data: students, isLoading, error } = useAllStudents();
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const filtered = (students ?? []).filter(s =>
    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.course.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search)
  );

  const activeCount = (students ?? []).filter(isActiveStudent).length;
  const pendingCount = (students ?? []).filter(isPendingStudent).length;

  const openDetail = (student: Student) => {
    setSelectedStudent(student);
    setDetailOpen(true);
  };

  const openEdit = (student: Student) => {
    setSelectedStudent(student);
    setDetailOpen(false);
    setEditOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground text-sm mt-1">All registered students and their enrollment details</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-card border rounded-lg px-4 py-2 text-center">
            <p className="text-2xl font-bold text-primary">{students?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="bg-card border rounded-lg px-4 py-2 text-center">
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="bg-card border rounded-lg px-4 py-2 text-center">
            <p className="text-2xl font-bold text-amber-500">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, course, or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive text-sm">
          Failed to load students. Please refresh the page.
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && filtered.length === 0 && (
        <div className="text-center py-16">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground">
            {search ? 'No students match your search' : 'No students registered yet'}
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            {search ? 'Try a different search term.' : 'Students will appear here after they complete registration.'}
          </p>
        </div>
      )}

      {/* Students list */}
      {!isLoading && !error && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map(student => {
            const statusInfo = getPaymentStatusLabel(student);
            const active = isActiveStudent(student);
            return (
              <div
                key={student.principal.toString()}
                className={`bg-card border rounded-xl p-4 flex items-start justify-between gap-4 transition-shadow hover:shadow-md ${active ? 'border-l-4 border-l-green-500' : ''}`}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                    {active ? <CheckCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">{student.fullName}</span>
                      <Badge variant={statusInfo.variant} className="text-xs">{statusInfo.label}</Badge>
                      {!student.isActive && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">Inactive</Badge>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{student.email}</span>
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{student.phone}</span>
                      <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{student.course}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(student.enrollmentDate)}</span>
                      <span className="flex items-center gap-1"><CreditCard className="h-3 w-3" />{student.sessionType} · {student.hours.toString()} hrs</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDetail(student)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(student)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Detail Modal */}
      <StudentDetailModal
        student={selectedStudent}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEdit={() => openEdit(selectedStudent!)}
      />

      {/* Edit Modal */}
      <EditStudentModal
        student={selectedStudent}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </div>
  );
}
