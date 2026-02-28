import { useState } from 'react';
import { User, Mail, Phone, BookOpen, Copy, Check, Shield } from 'lucide-react';
import { getStore } from '../../lib/store';
import { getAuthState } from '../../lib/auth';

export default function StudentProfile() {
  const auth = getAuthState();
  const store = getStore();

  const student = auth?.studentId
    ? store.students.find((s) => s.id === auth.studentId)
    : null;

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!student?.accessCode) return;
    navigator.clipboard.writeText(student.accessCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!student) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>Student profile not found.</p>
      </div>
    );
  }

  // Find the course matching the student's enrolled course name
  const enrolledCourse = store.courses.find((c) => c.name === student.course);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Your account information</p>
      </div>

      {/* Avatar + Name */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">
              {student.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{student.name}</h2>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                student.status === 'approved'
                  ? 'bg-green-100 text-green-700'
                  : student.status === 'pending'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {student.status}
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-4 space-y-4">
        <h3 className="font-bold text-foreground">Contact Information</h3>
        <div className="flex items-center gap-3 text-sm">
          <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-foreground">{student.email}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-foreground">{student.phone}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <User className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-foreground capitalize">{student.sessionType} sessions</span>
        </div>
      </div>

      {/* Access Code */}
      {student.status === 'approved' && student.accessCode && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">Access Code</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xl font-bold text-primary bg-primary/10 px-4 py-2 rounded-lg flex-1 text-center">
              {student.accessCode}
            </span>
            <button
              onClick={handleCopy}
              className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Use this code to log in to your account.
          </p>
        </div>
      )}

      {/* Enrolled Course */}
      {enrolledCourse && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">Enrolled Course</h3>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground">{enrolledCourse.name}</span>
            <span className="text-xs text-muted-foreground">₹{enrolledCourse.pricePerHour}/hr</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{enrolledCourse.description}</p>
        </div>
      )}
    </div>
  );
}
