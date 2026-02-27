import React, { useState } from 'react';
import { toast } from 'sonner';
import { getStore, saveStore } from '../../lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Users, CheckCircle, XCircle, Eye, BookOpen, Phone, Mail } from 'lucide-react';

export default function AdminStudents() {
  const [students, setStudents] = useState(() => getStore().students);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const store = getStore();
  const courses = store.courses;

  const refreshStudents = () => {
    setStudents(getStore().students);
  };

  const filteredStudents = students.filter((s) => {
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleApprove = (studentId: string) => {
    const currentStore = getStore();
    const student = currentStore.students.find((s) => s.id === studentId);
    if (!student) return;

    // Generate access code
    const accessCode = `RE-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    currentStore.students = currentStore.students.map((s) =>
      s.id === studentId ? { ...s, status: 'approved' as const, accessCode } : s
    );

    // Notify student
    const user = currentStore.users.find((u) => u.id === student.userId);
    if (user) {
      currentStore.notifications.push({
        id: `notif_${Date.now()}`,
        userId: user.id,
        title: 'Account Approved!',
        message: `Your account has been approved. Your access code is: ${accessCode}. You can now log in and access all features.`,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    saveStore(currentStore);
    refreshStudents();
    toast.success(`${student.name}'s account approved`);
  };

  const handleReject = (studentId: string) => {
    const currentStore = getStore();
    const student = currentStore.students.find((s) => s.id === studentId);
    if (!student) return;

    currentStore.students = currentStore.students.map((s) =>
      s.id === studentId ? { ...s, status: 'rejected' as const } : s
    );

    // Notify student
    const user = currentStore.users.find((u) => u.id === student.userId);
    if (user) {
      currentStore.notifications.push({
        id: `notif_${Date.now()}`,
        userId: user.id,
        title: 'Account Status Update',
        message: 'Your account application has been reviewed. Please contact admin for more information.',
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    saveStore(currentStore);
    refreshStudents();
    toast.success(`${student.name}'s account rejected`);
  };

  const handleEnrollCourse = (studentId: string, courseId: string) => {
    const currentStore = getStore();
    const student = currentStore.students.find((s) => s.id === studentId);
    if (!student) return;

    if (student.enrolledCourses.includes(courseId)) {
      // Unenroll
      currentStore.students = currentStore.students.map((s) =>
        s.id === studentId
          ? { ...s, enrolledCourses: s.enrolledCourses.filter((c) => c !== courseId) }
          : s
      );
    } else {
      // Enroll
      currentStore.students = currentStore.students.map((s) =>
        s.id === studentId
          ? { ...s, enrolledCourses: [...s.enrolledCourses, courseId] }
          : s
      );
    }

    saveStore(currentStore);
    refreshStudents();
    // Update selected student view
    const updated = getStore().students.find((s) => s.id === studentId);
    if (updated) setSelectedStudent(updated);
    toast.success('Course enrollment updated');
  };

  const statusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (status === 'approved') return 'default';
    if (status === 'pending') return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Students</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {students.length} student{students.length !== 1 ? 's' : ''} registered
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
                statusFilter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 bg-muted rounded-full mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Students Found</h3>
          <p className="text-muted-foreground text-sm">
            {search || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'No students have registered yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStudents
            .slice()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((student) => (
              <Card key={student.id} className="border-border hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{student.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={statusVariant(student.status)} className="text-xs capitalize">
                            {student.status}
                          </Badge>
                          {student.enrolledCourses.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {student.enrolledCourses.length} course{student.enrolledCourses.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {student.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(student.id)}
                            className="text-xs"
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(student.id)}
                            className="text-xs text-destructive hover:bg-destructive/10"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setSelectedStudent(student); setDetailOpen(true); }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Student Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {selectedStudent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{selectedStudent.name}</p>
                  <Badge variant={statusVariant(selectedStudent.status)} className="text-xs capitalize mt-1">
                    {selectedStudent.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{selectedStudent.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{selectedStudent.phone}</span>
                </div>
                {selectedStudent.accessCode && (
                  <div className="p-2 bg-muted rounded text-xs font-mono">
                    Access Code: {selectedStudent.accessCode}
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Course Enrollment
                </p>
                <div className="space-y-2">
                  {courses.map((course) => {
                    const enrolled = selectedStudent.enrolledCourses.includes(course.id);
                    return (
                      <div key={course.id} className="flex items-center justify-between gap-2 p-2 bg-muted/30 rounded">
                        <span className="text-sm text-foreground truncate">{course.name}</span>
                        <Button
                          size="sm"
                          variant={enrolled ? 'default' : 'outline'}
                          onClick={() => handleEnrollCourse(selectedStudent.id, course.id)}
                          className="text-xs shrink-0"
                        >
                          {enrolled ? 'Enrolled ✓' : 'Enroll'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
