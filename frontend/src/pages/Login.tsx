import { useState, useEffect } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { storeAuthState } from '../lib/auth';
import { BookOpen, LogIn, Loader2, GraduationCap, Shield } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, clear, loginStatus, identity, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [loginMode, setLoginMode] = useState<'student' | 'admin'>('student');
  const [error, setError] = useState('');

  const isLoggingIn = loginStatus === 'logging-in';

  // If already authenticated, redirect based on stored role
  useEffect(() => {
    if (identity) {
      const stored = localStorage.getItem('rajats_equation_auth');
      if (stored) {
        try {
          const auth = JSON.parse(stored);
          if (auth.role === 'admin') {
            navigate({ to: '/admin' });
            return;
          }
          if (auth.role === 'student') {
            navigate({ to: '/student' });
            return;
          }
        } catch {
          // ignore
        }
      }
    }
  }, [identity, navigate]);

  const handleStudentLogin = async () => {
    setError('');
    try {
      await login();
      // After login, store student auth state and navigate
      const principal = identity?.getPrincipal().toString();
      storeAuthState({
        role: 'student',
        studentId: principal || '',
        email: '',
        name: '',
      });
      navigate({ to: '/student' });
    } catch (err: any) {
      if (err?.message === 'User is already authenticated') {
        // Already logged in, just navigate
        const principal = identity?.getPrincipal().toString();
        storeAuthState({
          role: 'student',
          studentId: principal || '',
          email: '',
          name: '',
        });
        navigate({ to: '/student' });
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  const handleAdminLogin = async () => {
    setError('');
    try {
      await login();
      const principal = identity?.getPrincipal().toString();
      storeAuthState({
        role: 'admin',
        studentId: principal || '',
        email: '',
        name: '',
      });
      navigate({ to: '/admin' });
    } catch (err: any) {
      if (err?.message === 'User is already authenticated') {
        const principal = identity?.getPrincipal().toString();
        storeAuthState({
          role: 'admin',
          studentId: principal || '',
          email: '',
          name: '',
        });
        navigate({ to: '/admin' });
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <img
              src="/assets/generated/rajats-equation-logo.dim_400x300.png"
              alt="Rajat's Equation"
              className="h-16 object-contain"
            />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground mt-1">Sign in to continue</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex rounded-xl overflow-hidden border border-border mb-6">
          <button
            onClick={() => { setLoginMode('student'); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              loginMode === 'student'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:bg-muted'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            Student
          </button>
          <button
            onClick={() => { setLoginMode('admin'); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              loginMode === 'admin'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:bg-muted'
            }`}
          >
            <Shield className="h-4 w-4" />
            Admin
          </button>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
          {loginMode === 'student' ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Student Portal</h2>
                <p className="text-muted-foreground text-sm mt-2">
                  Sign in with your Internet Identity to access your sessions, materials, and more.
                </p>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <button
                onClick={handleStudentLogin}
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-6 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Sign in with Internet Identity
                  </>
                )}
              </button>

              <p className="text-center text-sm text-muted-foreground">
                New student?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Register here
                </Link>
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-navy" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Admin Portal</h2>
                <p className="text-muted-foreground text-sm mt-2">
                  Sign in with your Internet Identity to access the admin dashboard.
                </p>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <button
                onClick={handleAdminLogin}
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-2 bg-navy text-white py-3 px-6 rounded-xl font-medium hover:bg-navy/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Sign in with Internet Identity
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link to="/" className="hover:text-foreground transition-colors">
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}
