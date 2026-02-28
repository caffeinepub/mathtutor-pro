import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useActor } from '../hooks/useActor';
import { CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';

const COURSES = [
  { id: 'jee-maths', name: 'JEE Mathematics', price: 800 },
  { id: 'neet-maths', name: 'NEET Mathematics', price: 700 },
  { id: 'class-11-12', name: 'Class 11-12 Mathematics', price: 600 },
  { id: 'class-9-10', name: 'Class 9-10 Mathematics', price: 500 },
  { id: 'foundation', name: 'Foundation Mathematics', price: 400 },
];

const SESSION_TYPES = [
  { id: 'individual', name: 'Individual (1-on-1)', multiplier: 1.0 },
  { id: 'group', name: 'Group Session', multiplier: 0.7 },
];

const HOURS_OPTIONS = [5, 10, 15, 20, 30];

export default function Register() {
  const { actor } = useActor();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentId, setPaymentId] = useState<number | null>(null);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [sessionType, setSessionType] = useState('individual');
  const [hours, setHours] = useState(10);
  const [upiTransactionId, setUpiTransactionId] = useState('');

  const course = COURSES.find(c => c.id === selectedCourse);
  const sessionTypeObj = SESSION_TYPES.find(s => s.id === sessionType);
  const pricePerHour = course ? Math.round(course.price * (sessionTypeObj?.multiplier || 1)) : 0;
  const totalAmount = pricePerHour * hours;

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) {
      setError('Please select a course.');
      return;
    }
    setError('');
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!upiTransactionId.trim()) {
      setError('Please enter your UPI transaction ID.');
      return;
    }

    setSubmitting(true);
    try {
      let pid: number | null = null;

      if (actor) {
        try {
          const result = await actor.submitUpiPayment(
            course?.name || selectedCourse,
            sessionType,
            BigInt(pricePerHour),
            BigInt(hours),
            BigInt(totalAmount),
            upiTransactionId.trim(),
            fullName.trim(),
            email.trim().toLowerCase(),
            phone.trim()
          );
          pid = Number(result);
          setPaymentId(pid);
        } catch (backendErr: any) {
          // Fall through to localStorage
        }
      }

      // Always save to localStorage as well
      const raw = localStorage.getItem('rajats_equation_store');
      const store = raw ? JSON.parse(raw) : { students: [], sessions: [], materials: [], payments: [], notifications: [], attendance: [] };
      const newId = pid ? String(pid) : `student_${Date.now()}`;
      const newStudent = {
        id: newId,
        userId: newId,
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        courseName: course?.name || selectedCourse,
        course: course?.name || selectedCourse,
        sessionType,
        hours,
        pricePerHour,
        totalAmount,
        upiTransactionId: upiTransactionId.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      store.students = store.students || [];
      // Avoid duplicates
      if (!store.students.find((s: any) => s.email === newStudent.email)) {
        store.students.push(newStudent);
      }
      localStorage.setItem('rajats_equation_store', JSON.stringify(store));

      setStep(4);
    } catch (err: any) {
      setError(String(err?.message || 'Registration failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 4) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-card border border-border rounded-2xl p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Registration Submitted!</h1>
            <p className="text-muted-foreground mb-6">
              Your registration and payment details have been submitted successfully.
              The admin will review your payment and approve your account.
            </p>
            <div className="bg-muted rounded-xl p-4 text-left mb-6 space-y-2">
              <h3 className="font-semibold text-foreground text-sm">What happens next?</h3>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Admin reviews your UPI payment</li>
                <li>Admin approves your account and generates a Unique Code</li>
                <li>You'll receive your Unique Code to log in</li>
                <li>Log in using your Email + Unique Code</li>
              </ol>
            </div>
            <Link
              to="/login"
              className="block w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <Link to="/">
            <img
              src="/assets/generated/rajats-equation-logo.dim_400x300.png"
              alt="Rajat's Equation"
              className="h-14 mx-auto mb-3 object-contain"
            />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Student Registration</h1>
          <p className="text-muted-foreground text-sm mt-1">Step {step} of 3</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                s <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground mb-4">Personal Information</h2>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  required
                />
              </div>
              {error && <div className="text-destructive text-sm">{error}</div>}
              <button type="submit" className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Step 2: Course Selection */}
          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground mb-4">Course & Session Details</h2>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Select Course</label>
                <div className="space-y-2">
                  {COURSES.map(c => (
                    <label key={c.id} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedCourse === c.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                    }`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="course"
                          value={c.id}
                          checked={selectedCourse === c.id}
                          onChange={() => setSelectedCourse(c.id)}
                          className="text-primary"
                        />
                        <span className="text-sm font-medium text-foreground">{c.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">₹{c.price}/hr</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Session Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {SESSION_TYPES.map(st => (
                    <label key={st.id} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      sessionType === st.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                    }`}>
                      <input
                        type="radio"
                        name="sessionType"
                        value={st.id}
                        checked={sessionType === st.id}
                        onChange={() => setSessionType(st.id)}
                        className="text-primary"
                      />
                      <span className="text-sm text-foreground">{st.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Number of Hours</label>
                <div className="flex flex-wrap gap-2">
                  {HOURS_OPTIONS.map(h => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHours(h)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        hours === h ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'
                      }`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
              </div>

              {selectedCourse && (
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-sm font-medium text-foreground">Summary</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {course?.name} · {sessionTypeObj?.name} · {hours} hours
                  </p>
                  <p className="text-lg font-bold text-foreground mt-1">₹{totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">₹{pricePerHour}/hour × {hours} hours</p>
                </div>
              )}

              {error && <div className="text-destructive text-sm">{error}</div>}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground mb-4">Payment via UPI</h2>

              <div className="bg-muted rounded-xl p-4 text-center">
                <img
                  src="/assets/generated/upi-qr-code.dim_300x300.png"
                  alt="UPI QR Code"
                  className="w-40 h-40 mx-auto mb-2 object-contain"
                />
                <p className="text-sm font-medium text-foreground">Scan to pay ₹{totalAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">UPI ID: rajatsequation@upi</p>
              </div>

              <div className="bg-muted rounded-xl p-3">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Amount:</span> ₹{totalAmount.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Course:</span> {course?.name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  UPI Transaction ID <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={upiTransactionId}
                  onChange={e => setUpiTransactionId(e.target.value)}
                  placeholder="Enter your UPI transaction ID"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  required
                />
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-3 py-2.5 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Registration'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Already registered?{' '}
          <Link to="/login" className="text-primary hover:underline">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
