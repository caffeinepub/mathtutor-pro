import { useState, useMemo } from 'react';
import { getStore, updateStudentStatus } from '../../lib/store';
import type { Student } from '../../lib/store';
import { CheckCircle, XCircle, RotateCcw, Search, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';

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

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>(() => getStore().students);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || s.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [students, search, filter]);

  const handleApprove = async (student: Student) => {
    setLoadingId(student.id);
    setErrorMsg('');
    try {
      updateStudentStatus(student.id, 'approved');
      setStudents(getStore().students);
    } catch (err) {
      setErrorMsg(showError(err));
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (student: Student) => {
    setLoadingId(student.id);
    setErrorMsg('');
    try {
      updateStudentStatus(student.id, 'rejected');
      setStudents(getStore().students);
    } catch (err) {
      setErrorMsg(showError(err));
    } finally {
      setLoadingId(null);
    }
  };

  const handleRevoke = async (student: Student) => {
    setLoadingId(student.id);
    setErrorMsg('');
    try {
      updateStudentStatus(student.id, 'pending');
      setStudents(getStore().students);
    } catch (err) {
      setErrorMsg(showError(err));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Students</h2>
        <p className="text-muted-foreground">Manage student registrations</p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 px-4 py-3 rounded-lg">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No students found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((student) => (
            <Card key={student.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-foreground">{student.name}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          student.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : student.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {student.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                    <p className="text-sm text-muted-foreground">{student.phone}</p>
                    <p className="text-sm text-muted-foreground">{student.course}</p>
                    {student.accessCode && (
                      <p className="text-xs font-mono text-primary mt-1">
                        Code: {student.accessCode}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {student.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleApprove(student)}
                          disabled={loadingId === student.id}
                        >
                          {loadingId === student.id ? (
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
                          onClick={() => handleReject(student)}
                          disabled={loadingId === student.id}
                        >
                          <XCircle size={14} className="mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    {student.status === 'approved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRevoke(student)}
                        disabled={loadingId === student.id}
                      >
                        <RotateCcw size={14} className="mr-1" />
                        Revoke
                      </Button>
                    )}
                    {student.status === 'rejected' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApprove(student)}
                        disabled={loadingId === student.id}
                      >
                        <CheckCircle size={14} className="mr-1" />
                        Re-approve
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
