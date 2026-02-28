import React, { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useActor } from '../hooks/useActor';
import { storeAuthState } from '../lib/auth';
import { getStore } from '../lib/store';

export default function Login() {
  const navigate = useNavigate();
  const { actor } = useActor();

  const [mode, setMode] = useState<'student' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [uniqueCode, setUniqueCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email.trim() || !uniqueCode.trim()) {
        setError('Please enter your email and unique code.');
        setLoading(false);
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();
      const normalizedCode = uniqueCode.trim();

      // First try backend authentication
      if (actor) {
        try {
          const isValid = await actor.authenticateStudent(normalizedEmail, normalizedCode);
          if (isValid) {
            // Find the payment record to get student info
            const payment = await actor.findByEmailQuery(normalizedEmail);
            if (payment) {
              storeAuthState({
                role: 'student',
                userId: String(payment.id),
                email: payment.email,
                name: payment.fullName,
              });
              navigate({ to: '/student' });
              return;
            }
          }
        } catch (backendErr: any) {
          const msg = String(backendErr?.message || backendErr || '');
          if (
            msg.includes('No payment found') ||
            msg.includes('No unique code') ||
            msg.includes('Unique code does not match')
          ) {
            // Don't return yet — fall through to localStorage check
          } else if (msg.includes('Unauthorized')) {
            // Actor not authenticated — fall through to localStorage
          }
          // Fall through to localStorage fallback for all backend errors
        }
      }

      // Fallback: check localStorage store
      // Check students array — match by email + uniqueCode (or accessCode) with approved status
      try {
        const store = getStore();
        const students = store.students || [];
        const student = students.find(
          (s) =>
            s.email?.toLowerCase() === normalizedEmail &&
            (s.uniqueCode === normalizedCode || s.accessCode === normalizedCode) &&
            s.status === 'approved'
        );
        if (student) {
          storeAuthState({
            role: 'student',
            userId: student.id,
            email: student.email,
            name: student.name,
          });
          navigate({ to: '/student' });
          return;
        }

        // Also check payments array for uniqueCode match (in case student record wasn't updated)
        const payments = store.payments || [];
        const matchedPayment = payments.find(
          (p) =>
            p.studentName && // has a name
            p.status === 'approved' &&
            p.uniqueCode === normalizedCode
        );
        if (matchedPayment) {
          // Find the corresponding student
          const matchedStudent = students.find(s => s.id === matchedPayment.studentId);
          if (matchedStudent && matchedStudent.email.toLowerCase() === normalizedEmail) {
            storeAuthState({
              role: 'student',
              userId: matchedStudent.id,
              email: matchedStudent.email,
              name: matchedStudent.name,
            });
            navigate({ to: '/student' });
            return;
          }
        }
      } catch {
        // ignore store errors
      }

      setError('Invalid email or unique code. Please check your credentials.');
    } catch (err: any) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const ADMIN_EMAIL = 'admin@mathtutor.com';
      const ADMIN_PASSWORD = 'Admin@123';

      // First try backend adminLogin
      if (actor) {
        try {
          const isValid = await actor.adminLogin(email.trim().toLowerCase(), password);
          if (isValid) {
            storeAuthState({
              role: 'admin',
              userId: 'admin',
              email: ADMIN_EMAIL,
              name: 'Admin',
            });
            navigate({ to: '/admin' });
            return;
          }
        } catch {
          // Fall through to local check
        }
      }

      // Local hardcoded admin credentials check
      if (
        email.trim().toLowerCase() === ADMIN_EMAIL &&
        password === ADMIN_PASSWORD
      ) {
        storeAuthState({
          role: 'admin',
          userId: 'admin',
          email: ADMIN_EMAIL,
          name: 'Admin',
        });
        navigate({ to: '/admin' });
        return;
      }

      // Also check localStorage store admins array
      try {
        const store = getStore();
        const admins: any[] = (store as any).admins || [];
        const admin = admins.find(
          (a: any) =>
            a.email?.toLowerCase() === email.trim().toLowerCase() &&
            a.password === password
        );
        if (admin) {
          storeAuthState({
            role: 'admin',
            userId: admin.id,
            email: admin.email,
            name: admin.name,
          });
          navigate({ to: '/admin' });
          return;
        }
      } catch {
        // ignore
      }

      setError('Invalid admin credentials.');
    } catch (err: any) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <img
              src="/assets/generated/rajats-equation-logo.dim_400x300.png"
              alt="Rajat's Equation"
              className="h-16 mx-auto mb-3 object-contain"
            />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex rounded-lg border border-border overflow-hidden mb-6">
          <button
            onClick={() => { setMode('student'); setError(''); }}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              mode === 'student'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:bg-muted'
            }`}
          >
            Student Login
          </button>
          <button
            onClick={() => { setMode('admin'); setError(''); }}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              mode === 'admin'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:bg-muted'
            }`}
          >
            Admin Login
          </button>
        </div>

        {/* Form */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          {mode === 'student' ? (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Unique Login Code
                </label>
                <input
                  type="text"
                  value={uniqueCode}
                  onChange={e => setUniqueCode(e.target.value.toUpperCase())}
                  placeholder="Enter your unique code (e.g. AB12CD34)"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm font-mono"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your unique login code is provided by the admin after payment approval.
                </p>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-3 py-2.5 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@mathtutor.com"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                  required
                />
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-3 py-2.5 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In as Admin'}
              </button>
            </form>
          )}
        </div>

        {/* Register link */}
        {mode === 'student' && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Register here
            </Link>
          </p>
        )}

        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} The Rajat's Equation. All rights reserved.
        </p>
      </div>
    </div>
  );
}
