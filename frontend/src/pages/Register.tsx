import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { CheckCircle, ArrowRight, ArrowLeft, Copy, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useSubmitUpiPayment, useFinishStudentRegistration } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const COURSES = [
  { name: 'Mathematics Foundation', pricePerHour: 500 },
  { name: 'Advanced Mathematics', pricePerHour: 700 },
  { name: 'JEE Mathematics', pricePerHour: 800 },
  { name: 'NEET Mathematics', pricePerHour: 750 },
  { name: 'Board Exam Preparation', pricePerHour: 600 },
];

const SESSION_TYPES = ['Online', 'Offline', 'Hybrid'];

const UPI_ID = '9424135055@ptyes';
const UPI_NAME = "Rajat's Equation";

type Step = 'personal' | 'course' | 'payment' | 'success';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  course: string;
  sessionType: string;
  hours: number;
  transactionId: string;
}

export default function Register() {
  const navigate = useNavigate();
  const { identity, login, loginStatus } = useInternetIdentity();
  const submitPayment = useSubmitUpiPayment();
  const finishRegistration = useFinishStudentRegistration();

  const [step, setStep] = useState<Step>('personal');
  const [form, setForm] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    course: COURSES[0].name,
    sessionType: SESSION_TYPES[0],
    hours: 4,
    transactionId: '',
  });
  const [copied, setCopied] = useState(false);
  const [qrUrl, setQrUrl] = useState('');

  const selectedCourse = COURSES.find(c => c.name === form.course) ?? COURSES[0];
  const totalAmount = selectedCourse.pricePerHour * form.hours;

  useEffect(() => {
    if (step === 'payment') {
      const upiLink = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(UPI_NAME)}&am=${totalAmount}&cu=INR`;
      const qr = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&ecc=H&data=${encodeURIComponent(upiLink)}`;
      setQrUrl(qr);
    }
  }, [step, totalAmount]);

  const handlePersonalNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setStep('course');
  };

  const handleCourseNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.course || !form.sessionType || form.hours < 1) {
      toast.error('Please fill in all course details');
      return;
    }
    setStep('payment');
  };

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.transactionId.trim()) {
      toast.error('Please enter your UPI transaction ID');
      return;
    }

    if (!identity) {
      toast.error('Please sign in to complete registration');
      return;
    }

    try {
      // Submit UPI payment record
      const paymentResult = await submitPayment.mutateAsync({
        courseName: form.course,
        sessionType: form.sessionType,
        pricePerHour: BigInt(selectedCourse.pricePerHour),
        hours: BigInt(form.hours),
        totalAmount: BigInt(totalAmount),
        upiTransactionId: form.transactionId,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
      });

      if (paymentResult.__kind__ === 'err') {
        toast.error(paymentResult.err);
        return;
      }

      // Also register the student in the students table
      await finishRegistration.mutateAsync({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        course: form.course,
        sessionType: form.sessionType,
        hours: BigInt(form.hours),
        paymentType: {
          __kind__: 'upi',
          upi: { __kind__: 'pending', pending: null },
        },
        transactionId: form.transactionId,
      });

      setStep('success');
    } catch (err: any) {
      toast.error(err?.message ?? 'Registration failed. Please try again.');
    }
  };

  const isSubmitting = submitPayment.isPending || finishRegistration.isPending;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/assets/generated/rajats-equation-logo.dim_400x300.png" alt="Rajat's Equation" className="h-10 object-contain" />
        </div>
        <div className="flex items-center gap-2">
          {!identity ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => login()}
              disabled={loginStatus === 'logging-in'}
            >
              {loginStatus === 'logging-in' ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Signing in...</> : 'Sign In'}
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">Signed in</span>
          )}
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center p-6">
        <div className="w-full max-w-lg">
          {/* Progress */}
          {step !== 'success' && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                {(['personal', 'course', 'payment'] as const).map((s, i) => {
                  const steps = ['personal', 'course', 'payment'];
                  const currentIdx = steps.indexOf(step);
                  const isCompleted = currentIdx > i;
                  const isCurrent = step === s;
                  return (
                    <div key={s} className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                        isCurrent ? 'bg-primary text-primary-foreground' :
                        isCompleted ? 'bg-green-500 text-white' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {isCompleted ? <CheckCircle className="h-4 w-4" /> : i + 1}
                      </div>
                      <span className="text-xs text-muted-foreground hidden sm:block capitalize">
                        {s === 'personal' ? 'Personal Info' : s === 'course' ? 'Course Details' : 'Payment'}
                      </span>
                      {i < 2 && <div className="w-8 sm:w-16 h-0.5 bg-muted mx-1" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 1: Personal Info */}
          {step === 'personal' && (
            <div className="bg-card border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-1">Personal Information</h2>
              <p className="text-muted-foreground text-sm mb-6">Tell us about yourself</p>
              <form onSubmit={handlePersonalNext} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={form.fullName}
                    onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Continue <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </form>
            </div>
          )}

          {/* Step 2: Course Details */}
          {step === 'course' && (
            <div className="bg-card border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-1">Course Details</h2>
              <p className="text-muted-foreground text-sm mb-6">Select your course and session preferences</p>
              <form onSubmit={handleCourseNext} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Select Course *</Label>
                  <div className="space-y-2">
                    {COURSES.map(course => (
                      <label
                        key={course.name}
                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${form.course === course.name ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="course"
                            value={course.name}
                            checked={form.course === course.name}
                            onChange={e => setForm(f => ({ ...f, course: e.target.value }))}
                            className="accent-primary"
                          />
                          <span className="font-medium text-sm">{course.name}</span>
                        </div>
                        <span className="text-sm text-primary font-semibold">₹{course.pricePerHour}/hr</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Session Type *</Label>
                  <div className="flex gap-2">
                    {SESSION_TYPES.map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, sessionType: type }))}
                        className={`flex-1 py-2 px-3 border rounded-lg text-sm font-medium transition-colors ${form.sessionType === type ? 'border-primary bg-primary text-primary-foreground' : 'hover:border-primary/50'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="hours">Number of Hours *</Label>
                  <Input
                    id="hours"
                    type="number"
                    min="1"
                    max="100"
                    value={form.hours}
                    onChange={e => setForm(f => ({ ...f, hours: parseInt(e.target.value) || 1 }))}
                    required
                  />
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price per hour</span>
                    <span>₹{selectedCourse.pricePerHour}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Hours</span>
                    <span>{form.hours}</span>
                  </div>
                  <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                    <span>Total Amount</span>
                    <span className="text-primary">₹{totalAmount}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep('personal')} className="flex-1">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                  </Button>
                  <Button type="submit" className="flex-1">
                    Continue <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 'payment' && (
            <div className="bg-card border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-1">Payment</h2>
              <p className="text-muted-foreground text-sm mb-6">Pay via UPI and enter your transaction ID</p>

              {!identity && (
                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Sign in required</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">You need to sign in to complete registration.</p>
                    <Button size="sm" className="mt-2" onClick={() => login()} disabled={loginStatus === 'logging-in'}>
                      {loginStatus === 'logging-in' ? 'Signing in...' : 'Sign In Now'}
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Amount summary */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">Amount to Pay</p>
                  <p className="text-3xl font-bold text-primary mt-1">₹{totalAmount}</p>
                  <p className="text-xs text-muted-foreground mt-1">{form.course} · {form.hours} hrs · {form.sessionType}</p>
                </div>

                {/* QR Code */}
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground mb-3">Scan QR Code to Pay</p>
                  {qrUrl && (
                    <div className="inline-block border-4 border-white rounded-xl shadow-md">
                      <img src={qrUrl} alt="UPI QR Code" className="w-48 h-48 rounded-lg" />
                    </div>
                  )}
                </div>

                {/* UPI ID */}
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">UPI ID</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-medium text-sm">{UPI_ID}</span>
                    <Button variant="outline" size="sm" onClick={handleCopyUpiId}>
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>

                {/* Open Payment App */}
                <a
                  href={`upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(UPI_NAME)}&am=${totalAmount}&cu=INR`}
                  className="block"
                >
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" /> Open Payment App
                  </Button>
                </a>

                {/* Transaction ID form */}
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="transactionId">UPI Transaction ID *</Label>
                    <Input
                      id="transactionId"
                      placeholder="Enter your UPI transaction ID"
                      value={form.transactionId}
                      onChange={e => setForm(f => ({ ...f, transactionId: e.target.value }))}
                      required
                    />
                    <p className="text-xs text-muted-foreground">Enter the transaction ID from your UPI payment app after completing the payment.</p>
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep('course')} className="flex-1" disabled={isSubmitting}>
                      <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isSubmitting || !identity}>
                      {isSubmitting ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</>
                      ) : (
                        <>Submit Registration <ArrowRight className="h-4 w-4 ml-2" /></>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="bg-card border rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Registration Submitted!</h2>
              <p className="text-muted-foreground mb-6">
                Your registration has been submitted successfully. The admin will review your payment and activate your account shortly.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 text-left mb-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{form.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Course</span>
                  <span className="font-medium">{form.course}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-medium text-primary">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-medium font-mono text-xs">{form.transactionId}</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button onClick={() => navigate({ to: '/student' })}>
                  Go to Student Dashboard <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button variant="outline" onClick={() => navigate({ to: '/' })}>
                  Back to Home
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
