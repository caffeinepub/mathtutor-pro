import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  getStudents,
  updateStudent,
  generateNextAccessCode,
  Student,
} from '../../lib/store';
import {
  CheckCircle,
  XCircle,
  Search,
  User,
  Mail,
  Phone,
  BookOpen,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>(() => getStudents());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [approvedCode, setApprovedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const refresh = () => setStudents(getStudents());

  const filtered = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleApprove = (student: Student) => {
    const code = generateNextAccessCode();
    updateStudent(student.id, { status: 'approved', accessCode: code });
    setApprovedCode(code);
    setSelectedStudent({ ...student, status: 'approved', accessCode: code });
    refresh();
    toast.success(`${student.name} approved! Access code: ${code}`);
  };

  const handleReject = (student: Student) => {
    updateStudent(student.id, { status: 'rejected' });
    refresh();
    toast.error(`${student.name}'s registration rejected.`);
    if (selectedStudent?.id === student.id) {
      setSelectedStudent({ ...student, status: 'rejected' });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      toast.success('Access code copied!');
    });
  };

  const statusCounts = {
    all: students.length,
    pending: students.filter((s) => s.status === 'pending').length,
    approved: students.filter((s) => s.status === 'approved').length,
    rejected: students.filter((s) => s.status === 'rejected').length,
  };

  const getStatusBadge = (status: Student['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Rejected</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Student Management</h1>
        <p className="text-slate-500 mt-1">Approve or reject student registrations and manage access codes.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`p-4 rounded-xl border text-left transition-all ${
              statusFilter === s
                ? 'bg-sky-600 text-white border-sky-600'
                : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300'
            }`}
          >
            <div className="text-2xl font-bold">{statusCounts[s]}</div>
            <div className="text-sm capitalize mt-1 opacity-80">{s === 'all' ? 'Total Students' : `${s}`}</div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="pl-10 h-11 border-slate-200"
        />
      </div>

      {/* Student List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <User size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg">No students found</p>
          </div>
        ) : (
          filtered.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center gap-4 hover:border-sky-300 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-800">{student.name}</span>
                  {getStatusBadge(student.status)}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><Mail size={13} />{student.email}</span>
                  <span className="flex items-center gap-1"><Phone size={13} />{student.phone}</span>
                  <span className="flex items-center gap-1"><BookOpen size={13} />{student.course}</span>
                  <span className="capitalize">{student.sessionType}</span>
                </div>
                {student.status === 'approved' && student.accessCode && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-slate-400">Access Code:</span>
                    <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded text-sm">
                      {student.accessCode}
                    </span>
                    <button
                      onClick={() => copyCode(student.accessCode)}
                      className="text-slate-400 hover:text-sky-600 transition-colors"
                      title="Copy access code"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setSelectedStudent(student); setApprovedCode(null); setCopiedCode(false); }}
                  className="border-slate-200 text-slate-600"
                >
                  View Details
                </Button>
                {student.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(student)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle size={15} className="mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(student)}
                    >
                      <XCircle size={15} className="mr-1" />
                      Reject
                    </Button>
                  </>
                )}
                {student.status === 'approved' && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(student)}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Student Detail Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={(open) => { if (!open) { setSelectedStudent(null); setApprovedCode(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>View and manage student registration</DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Name</p>
                  <p className="font-semibold text-slate-800">{selectedStudent.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Status</p>
                  {getStatusBadge(selectedStudent.status)}
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Email</p>
                  <p className="text-slate-700">{selectedStudent.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Phone</p>
                  <p className="text-slate-700">{selectedStudent.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Course</p>
                  <p className="text-slate-700">{selectedStudent.course}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Session Type</p>
                  <p className="text-slate-700 capitalize">{selectedStudent.sessionType}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Registered</p>
                  <p className="text-slate-700">{new Date(selectedStudent.registeredAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Access Code Display */}
              {selectedStudent.status === 'approved' && selectedStudent.accessCode && (
                <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 text-center">
                  <p className="text-sm text-green-700 font-medium mb-2">✅ Student Access Code</p>
                  <p className="text-3xl font-bold font-mono text-green-800 tracking-widest mb-3">
                    {selectedStudent.accessCode}
                  </p>
                  <Button
                    onClick={() => copyCode(selectedStudent.accessCode)}
                    variant="outline"
                    className="border-green-400 text-green-700 hover:bg-green-100"
                  >
                    {copiedCode ? (
                      <><Check size={15} className="mr-1" /> Copied!</>
                    ) : (
                      <><Copy size={15} className="mr-1" /> Copy Code</>
                    )}
                  </Button>
                  <p className="text-xs text-green-600 mt-2">
                    Share this code with the student. They use it to log in.
                  </p>
                </div>
              )}

              {/* Newly approved code highlight */}
              {approvedCode && selectedStudent.status === 'approved' && (
                <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 text-center">
                  <p className="text-sm text-sky-700">
                    🎉 Access code generated and student approved!
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {selectedStudent.status === 'pending' && (
                  <>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleApprove(selectedStudent)}
                    >
                      <CheckCircle size={16} className="mr-1" />
                      Approve & Generate Code
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleReject(selectedStudent)}
                    >
                      <XCircle size={16} className="mr-1" />
                      Reject
                    </Button>
                  </>
                )}
                {selectedStudent.status === 'approved' && (
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleReject(selectedStudent)}
                  >
                    Revoke Approval
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
