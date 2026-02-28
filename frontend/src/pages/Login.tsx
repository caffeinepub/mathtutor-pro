import { useState, useEffect } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { storeAuthState, getAuthState } from '../lib/auth';
import { useQueryClient } from '@tanstack/react-query';
import { Shield, User, Copy, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';

type LoginMode = 'select' | 'student' | 'admin';
type AdminStep = 'login' | 'bootstrap' | 'access-denied';

export default function Login() {
  const navigate = useNavigate();
  const { login, clear, identity, isLoggingIn } = useInternetIdentity();
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<LoginMode>('select');
  const [adminStep, setAdminStep] = useState<AdminStep>('login');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Student login state
  const [studentEmail, setStudentEmail] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [studentError, setStudentError] = useState('');
  const [studentLoading, setStudentLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const auth = getAuthState();
    if (auth?.role === 'admin') {
      navigate({ to: '/admin' });
    } else if (auth?.role === 'student') {
      navigate({ to: '/student' });
    }
  }, [navigate]);

  // Handle admin II login result
  useEffect(() => {
    if (mode !== 'admin' || !identity || !actor) return;
    if (isProcessing) return;

    const handleAdminLogin = async () => {
      setIsProcessing(true);
      setError('');
      try {
        const isAdmin = await actor.isCallerAdmin();
        if (isAdmin) {
          storeAuthState({ role: 'admin', principalId: identity.getPrincipal().toString() });
          queryClient.clear();
          navigate({ to: '/admin' });
          return;
        }
        setAdminStep('bootstrap');
      } catch (err) {
        const msg = String(err);
        if (msg.includes('Unauthorized') || msg.includes('trap')) {
          setAdminStep('bootstrap');
        } else {
          setError('Failed to verify admin status. Please try again.');
        }
      } finally {
        setIsProcessing(false);
      }
    };

    handleAdminLogin();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity, actor, mode]);

  const handleAdminIILogin = async () => {
    setError('');
    try {
      if (identity) {
        await clear();
        queryClient.clear();
      }
      await login();
    } catch (err) {
      const msg = String(err);
      if (msg.includes('already authenticated')) {
        // Already logged in, the effect will handle it
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  const handleCopyPrincipal = () => {
    if (!identity) return;
    navigator.clipboard.writeText(identity.getPrincipal().toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError('');
    setStudentLoading(true);

    try {
      if (!actor) {
        setStudentError('Backend not available. Please try again.');
        return;
      }

      const email = studentEmail.trim().toLowerCase();
      const code = studentCode.trim();

      if (!email || !code) {
        setStudentError('Please enter both email and access code.');
        return;
      }

      // Look up payment by access code
      const payment = await actor.findUpiPaymentByAccessCode(code);
      if (!payment) {
        setStudentError('Invalid access code. Please check and try again.');
        return;
      }

      if (payment.email.toLowerCase() !== email) {
        setStudentError('Email does not match the access code.');
        return;
      }

      // Check payment status
      const status = payment.status;
      if (status.__kind__ !== 'approved') {
        setStudentError('Your payment has not been approved yet. Please contact support.');
        return;
      }

      // Store auth state
      storeAuthState({
        role: 'student',
        studentId: String(payment.id),
        email: payment.email,
        name: payment.fullName,
      });
      queryClient.clear();
      navigate({ to: '/student' });
    } catch {
      setStudentError('Login failed. Please try again.');
    } finally {
      setStudentLoading(false);
    }
  };

  // ─── Mode: Select ──────────────────────────────────────────────────────────

  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <img
              src="/assets/generated/logo-mark.dim_128x128.png"
              alt="Logo"
              className="w-16 h-16 mx-auto mb-4 rounded-xl"
            />
            <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground mt-1">Choose how you'd like to sign in</p>
          </div>

          <div className="grid gap-4">
            <button
              onClick={() => setMode('student')}
              className="flex items-center gap-4 p-5 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <User size={24} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Student Login</p>
                <p className="text-sm text-muted-foreground">Sign in with your email & access code</p>
              </div>
            </button>

            <button
              onClick={() => setMode('admin')}
              className="flex items-center gap-4 p-5 rounded-xl border-2 border-border hover:border-gold hover:bg-gold/5 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                <Shield size={24} className="text-gold" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Admin Login</p>
                <p className="text-sm text-muted-foreground">Sign in with Internet Identity</p>
              </div>
            </button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            New student?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Register here
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ─── Mode: Student ─────────────────────────────────────────────────────────

  if (mode === 'student') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <User size={28} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Student Login</h1>
            <p className="text-muted-foreground mt-1">Enter your email and access code</p>
          </div>

          <form onSubmit={handleStudentLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email Address</label>
              <input
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Access Code</label>
              <input
                type="text"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                placeholder="RJMATH-001"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            {studentError && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-lg">
                <AlertCircle size={16} />
                <span>{studentError}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={studentLoading}>
              {studentLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <button
            onClick={() => setMode('select')}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to login options
          </button>
        </div>
      </div>
    );
  }

  // ─── Mode: Admin ───────────────────────────────────────────────────────────

  // Admin: Bootstrap step
  if (adminStep === 'bootstrap' && identity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
              <Shield size={28} className="text-gold" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Register as Admin</h1>
            <p className="text-muted-foreground mt-1">
              Your principal ID is not yet registered as admin.
            </p>
          </div>

          <div className="bg-muted rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium text-foreground">Your Principal ID:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-background rounded-lg px-3 py-2 border border-border break-all font-mono text-foreground">
                {identity.getPrincipal().toString()}
              </code>
              <button
                onClick={handleCopyPrincipal}
                className="p-2 rounded-lg border border-border hover:bg-background transition-colors flex-shrink-0"
                title="Copy principal ID"
              >
                {copied ? (
                  <CheckCircle size={16} className="text-green-500" />
                ) : (
                  <Copy size={16} className="text-muted-foreground" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Copy this principal ID and use it to register as the first admin via the canister
              management interface, or share it with an existing admin.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-lg">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleAdminIILogin}
              variant="outline"
              className="w-full"
              disabled={isLoggingIn || isProcessing}
            >
              {isLoggingIn || isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Checking...
                </>
              ) : (
                'Try Again with Different Account'
              )}
            </Button>
            <button
              onClick={() => {
                setMode('select');
                setAdminStep('login');
              }}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to login options
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin: Access denied
  if (adminStep === 'access-denied') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle size={28} className="text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">
            Your principal is not registered as an admin. Please contact the system administrator.
          </p>
          <Button
            onClick={() => {
              setMode('select');
              setAdminStep('login');
            }}
            variant="outline"
            className="w-full"
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  // Admin: Login step
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
            <Shield size={28} className="text-gold" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
          <p className="text-muted-foreground mt-1">Sign in with Internet Identity</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-lg">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <Button
          onClick={handleAdminIILogin}
          className="w-full bg-gold text-navy hover:bg-gold/90"
          disabled={isLoggingIn || isProcessing}
        >
          {isLoggingIn || isProcessing ? (
            <>
              <Loader2 size={16} className="animate-spin mr-2" />
              {isLoggingIn ? 'Opening Internet Identity...' : 'Verifying...'}
            </>
          ) : (
            'Login with Internet Identity'
          )}
        </Button>

        <button
          onClick={() => setMode('select')}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to login options
        </button>
      </div>
    </div>
  );
}
