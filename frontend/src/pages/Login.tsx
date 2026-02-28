import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { storeAuthState } from '../lib/auth';
import { Shield, Loader2, CheckCircle, Clock } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, clear, loginStatus, identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  // Admin login state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  // Student II state
  const [approvalStatus, setApprovalStatus] = useState<'idle' | 'checking' | 'approved' | 'pending' | 'error'>('idle');
  const [approvalError, setApprovalError] = useState('');

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  // When II identity is available and actor is ready, check approval
  useEffect(() => {
    if (!isAuthenticated || actorFetching || !actor) return;
    if (approvalStatus !== 'idle') return;

    setApprovalStatus('checking');
    actor.isCallerApproved()
      .then((approved) => {
        if (approved) {
          setApprovalStatus('approved');
          storeAuthState({
            userId: identity!.getPrincipal().toString(),
            role: 'student',
            name: 'Student',
          });
          navigate({ to: '/student' });
        } else {
          setApprovalStatus('pending');
        }
      })
      .catch((err) => {
        console.error('Approval check failed:', err);
        setApprovalStatus('error');
        setApprovalError('Failed to check approval status. Please try again.');
      });
  }, [isAuthenticated, actorFetching, actor, approvalStatus, identity, navigate]);

  const handleStudentLogin = async () => {
    if (isAuthenticated) {
      // Already logged in but not approved — log out and try again
      await clear();
      setApprovalStatus('idle');
      setApprovalError('');
      return;
    }
    try {
      setApprovalStatus('idle');
      setApprovalError('');
      await login();
    } catch (err: any) {
      console.error('II login error:', err);
      setApprovalError('Login failed. Please try again.');
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setAdminLoading(true);
    try {
      const ADMIN_EMAIL = 'mrjain950761@gmail.com';
      const ADMIN_PASSWORD = 'Admin@123';
      if (adminEmail === ADMIN_EMAIL && adminPassword === ADMIN_PASSWORD) {
        storeAuthState({ userId: 'admin', role: 'admin', name: 'Admin' });
        navigate({ to: '/admin' });
      } else {
        setAdminError('Invalid email or password.');
      }
    } catch {
      setAdminError('Login failed. Please try again.');
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <img src="/assets/generated/logo-mark.dim_128x128.png" alt="Logo" className="h-14 w-14 rounded-xl" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">The Rajat's Equation</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Student Login */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Student Login</h2>
          </div>

          {!isAuthenticated && approvalStatus === 'idle' && (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Students log in securely using Internet Identity — no password required.
              </p>
              <button
                onClick={handleStudentLogin}
                disabled={isLoggingIn || isInitializing}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 px-4 font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    Login with Internet Identity
                  </>
                )}
              </button>
            </>
          )}

          {(approvalStatus === 'checking' || (isAuthenticated && actorFetching)) && (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Checking your approval status…</p>
            </div>
          )}

          {approvalStatus === 'approved' && (
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <p className="text-sm text-muted-foreground">Approved! Redirecting to dashboard…</p>
            </div>
          )}

          {approvalStatus === 'pending' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Account Pending Approval</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                    Your account is pending admin approval. Please wait for confirmation after your payment is verified.
                  </p>
                </div>
              </div>
              <button
                onClick={async () => {
                  await clear();
                  setApprovalStatus('idle');
                  setApprovalError('');
                }}
                className="w-full text-sm text-muted-foreground hover:text-foreground underline transition-colors"
              >
                Sign out and try a different account
              </button>
            </div>
          )}

          {approvalStatus === 'error' && (
            <div className="space-y-4">
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
                <p className="text-sm text-destructive">{approvalError}</p>
              </div>
              <button
                onClick={async () => {
                  await clear();
                  setApprovalStatus('idle');
                  setApprovalError('');
                }}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 px-4 font-medium hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Admin Login */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Admin Login</h2>
          <form onSubmit={handleAdminLogin} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            {adminError && (
              <p className="text-xs text-destructive">{adminError}</p>
            )}
            <button
              type="submit"
              disabled={adminLoading}
              className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground rounded-xl py-2.5 px-4 font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              {adminLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {adminLoading ? 'Signing in…' : 'Sign In as Admin'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          <a href="/" className="hover:underline">← Back to Home</a>
        </p>
      </div>
    </div>
  );
}
