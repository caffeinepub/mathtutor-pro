import React, { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getUserByEmail, getStudentByEmail, storeAuthState } from '../lib/store';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState<'admin' | 'student'>('student');
  const [email, setEmail] = useState('');
  const [credential, setCredential] = useState('');
  const [showCredential, setShowCredential] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (role === 'admin') {
        const user = getUserByEmail(email);
        if (!user || user.role !== 'admin') {
          setError('Invalid email or password.');
          return;
        }
        if (user.password !== credential) {
          setError('Invalid email or password.');
          return;
        }
        storeAuthState({
          isAuthenticated: true,
          role: 'admin',
          userId: user.id,
          email: user.email,
        });
        navigate({ to: '/admin' });
      } else {
        // Student login: email + access code
        const student = getStudentByEmail(email);

        if (!student) {
          setError('No account found with this email. Please register first.');
          return;
        }

        if (student.status === 'pending') {
          setError('Your registration is pending approval. Please wait for admin approval.');
          return;
        }

        if (student.status === 'rejected') {
          setError('Your registration was rejected. Please contact the admin for more information.');
          return;
        }

        if (student.status === 'approved') {
          // Compare access code (case-insensitive)
          const enteredCode = credential.trim().toUpperCase();
          const storedCode = (student.accessCode || '').trim().toUpperCase();

          if (!storedCode) {
            setError('Your access code has not been generated yet. Please contact the admin.');
            return;
          }

          if (enteredCode !== storedCode) {
            setError('Invalid access code. Please check your RJMATH-XXX code and try again.');
            return;
          }

          storeAuthState({
            isAuthenticated: true,
            role: 'student',
            userId: student.userId,
            email: student.email,
          });
          navigate({ to: '/student' });
        } else {
          setError('Invalid credentials. Please try again.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <img
          src="/assets/generated/rajats-equation-logo.dim_400x300.png"
          alt="Rajat's Equation"
          className="h-20 mx-auto mb-2 object-contain"
        />
      </div>

      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-sky-900">Welcome Back</CardTitle>
          <CardDescription className="text-base text-slate-500">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {/* Role Selector */}
          <div className="flex rounded-xl overflow-hidden border border-sky-200 mb-6">
            <button
              type="button"
              onClick={() => { setRole('student'); setError(''); setCredential(''); }}
              className={`flex-1 py-3 text-base font-semibold transition-colors ${
                role === 'student'
                  ? 'bg-sky-600 text-white'
                  : 'bg-white text-sky-700 hover:bg-sky-50'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => { setRole('admin'); setError(''); setCredential(''); }}
              className={`flex-1 py-3 text-base font-semibold transition-colors ${
                role === 'admin'
                  ? 'bg-sky-600 text-white'
                  : 'bg-white text-sky-700 hover:bg-sky-50'
              }`}
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium text-slate-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="h-12 text-base border-sky-200 focus:border-sky-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="credential" className="text-base font-medium text-slate-700">
                {role === 'student' ? 'Access Code (RJMATH-XXX)' : 'Password'}
              </Label>
              <div className="relative">
                <Input
                  id="credential"
                  type={showCredential ? 'text' : 'password'}
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  placeholder={role === 'student' ? 'Enter your RJMATH-XXX code' : 'Enter your password'}
                  required
                  className="h-12 text-base border-sky-200 focus:border-sky-500 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowCredential(!showCredential)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCredential ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {role === 'student' && (
                <p className="text-sm text-slate-500">
                  Your access code is provided by the admin after approval (e.g., RJMATH-001)
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold bg-sky-600 hover:bg-sky-700 text-white"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn size={18} />
                  Sign In
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-sky-600 font-semibold hover:underline">
                Register here
              </Link>
            </p>
          </div>

          {role === 'student' && (
            <div className="mt-4 p-3 bg-sky-50 rounded-lg border border-sky-100">
              <p className="text-sm text-sky-700 text-center">
                📋 After registering, wait for admin approval. Your access code will be shared with you.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="mt-6 text-sm text-slate-400">
        © {new Date().getFullYear()} Rajat's Equation. All rights reserved.
      </p>
    </div>
  );
}
