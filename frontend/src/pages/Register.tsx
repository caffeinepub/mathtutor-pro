import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { getStore, saveStore, getCourses } from '@/lib/store';

const COURSE_NAMES = [
  'JEE Mains',
  'JEE Advanced',
  'Board Exams (Class 10 & 12)',
  'Foundation Course (Class 6–8 Math Thinking)',
  'Math Olympiad',
];

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: '',
    sessionType: 'group' as 'group' | 'one-on-one',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Invalid email address';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, '')))
      newErrors.phone = 'Enter a valid 10-digit phone number';
    if (!formData.course) newErrors.course = 'Please select a course';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const store = getStore();

      // Check for duplicate email
      const existingUser = store.users.find(
        (u) => u.email.toLowerCase() === formData.email.toLowerCase()
      );
      if (existingUser) {
        setErrors({ email: 'An account with this email already exists' });
        setIsLoading(false);
        return;
      }

      // Create new user
      const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newUser = {
        id: newUserId,
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: 'student' as const,
        createdAt: new Date().toISOString(),
      };

      // Create pending student record matching the new Student interface
      const newStudentId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newStudent = {
        id: newStudentId,
        userId: newUserId,
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        course: formData.course,
        sessionType: formData.sessionType,
        status: 'pending' as const,
        accessCode: '',
        enrolledCourses: [] as string[],
        registeredAt: new Date().toISOString(),
      };

      // Persist both records
      store.users = [...store.users, newUser];
      store.students = [...store.students, newStudent];
      saveStore(store);

      toast.success('Registration successful! Please wait for admin approval before logging in.');
      navigate({ to: '/login' });
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/assets/generated/rajats-equation-logo.dim_400x300.png"
            alt="The Rajat's Equation"
            className="h-20 w-auto object-contain"
          />
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-sky-100 rounded-full">
                <UserPlus className="w-6 h-6 text-sky-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-sky-900">Create Account</CardTitle>
            <CardDescription className="text-base text-slate-500">Register as a new student</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-base font-medium text-slate-700">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`h-12 text-base border-sky-200 focus:border-sky-500 ${errors.name ? 'border-destructive' : ''}`}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-base font-medium text-slate-700">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`h-12 text-base border-sky-200 focus:border-sky-500 ${errors.email ? 'border-destructive' : ''}`}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-base font-medium text-slate-700">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter your 10-digit phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`h-12 text-base border-sky-200 focus:border-sky-500 ${errors.phone ? 'border-destructive' : ''}`}
                />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>

              {/* Course */}
              <div className="space-y-1.5">
                <Label className="text-base font-medium text-slate-700">Course Interested In</Label>
                <Select
                  value={formData.course}
                  onValueChange={(v) => { setFormData((p) => ({ ...p, course: v })); if (errors.course) setErrors((p) => ({ ...p, course: '' })); }}
                >
                  <SelectTrigger className={`h-12 text-base border-sky-200 focus:border-sky-500 ${errors.course ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Select a course..." />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSE_NAMES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.course && <p className="text-xs text-destructive">{errors.course}</p>}
              </div>

              {/* Session Type */}
              <div className="space-y-1.5">
                <Label className="text-base font-medium text-slate-700">Preferred Session Type</Label>
                <div className="flex rounded-xl overflow-hidden border border-sky-200">
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, sessionType: 'group' }))}
                    className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                      formData.sessionType === 'group'
                        ? 'bg-sky-600 text-white'
                        : 'bg-white text-sky-700 hover:bg-sky-50'
                    }`}
                  >
                    Group Class
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, sessionType: 'one-on-one' }))}
                    className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                      formData.sessionType === 'one-on-one'
                        ? 'bg-sky-600 text-white'
                        : 'bg-white text-sky-700 hover:bg-sky-50'
                    }`}
                  >
                    One-on-One
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-base font-medium text-slate-700">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password (min 6 characters)"
                    value={formData.password}
                    onChange={handleChange}
                    className={`h-12 text-base border-sky-200 focus:border-sky-500 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-base font-medium text-slate-700">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`h-12 text-base border-sky-200 focus:border-sky-500 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-sky-600 hover:bg-sky-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Registering...
                  </span>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-sky-600 hover:underline font-medium">
                Sign in
              </Link>
            </div>

            <div className="mt-3 p-3 bg-sky-50 rounded-lg text-xs text-sky-700 text-center border border-sky-100">
              After registration, your account will be reviewed by the admin. You'll receive an access code once approved.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
