import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { getStore } from '@/lib/store';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '', role: 'student' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const store = getStore();

      if (formData.role === 'admin') {
        // Admin login
        const admin = store.users.find(
          (u) =>
            u.email.toLowerCase() === formData.email.toLowerCase() &&
            u.password === formData.password &&
            u.role === 'admin'
        );
        if (!admin) {
          setError('Invalid admin credentials.');
          setIsLoading(false);
          return;
        }
        localStorage.setItem('currentUser', JSON.stringify(admin));
        toast.success(`Welcome back, ${admin.name}!`);
        navigate({ to: '/admin' });
      } else {
        // Student login
        const user = store.users.find(
          (u) =>
            u.email.toLowerCase() === formData.email.toLowerCase() &&
            u.password === formData.password &&
            u.role === 'student'
        );
        if (!user) {
          setError('Invalid email or password.');
          setIsLoading(false);
          return;
        }

        // Check student status
        const student = store.students.find((s) => s.userId === user.id);
        if (!student) {
          setError('Student record not found. Please contact admin.');
          setIsLoading(false);
          return;
        }
        if (student.status === 'pending') {
          setError('Your account is pending admin approval. Please wait.');
          setIsLoading(false);
          return;
        }
        if (student.status === 'rejected') {
          setError('Your account has been rejected. Please contact admin.');
          setIsLoading(false);
          return;
        }

        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('currentStudent', JSON.stringify(student));
        toast.success(`Welcome back, ${user.name}!`);
        navigate({ to: '/student' });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/assets/generated/rajats-equation-logo.dim_400x300.png"
            alt="The Rajat's Equation"
            className="h-20 w-auto object-contain"
          />
        </div>

        <Card className="shadow-lg border-border">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <LogIn className="w-6 h-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role selector */}
              <div className="space-y-1">
                <Label htmlFor="role">Login As</Label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Register here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
