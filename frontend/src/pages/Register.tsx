import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { getStore, saveStore, type Payment, type Student } from '../lib/store';
import { BookOpen, CheckCircle, ArrowLeft, Clock } from 'lucide-react';

const SESSION_TYPES = [
  { value: 'online', label: 'Online (Google Meet)', price: 800 },
  { value: 'offline', label: 'Offline (In-Person)', price: 1000 },
  { value: 'hybrid', label: 'Hybrid', price: 900 },
];

export default function Register() {
  const store = getStore();
  const courses = store.courses || [];

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    courseId: '',
    sessionType: 'online',
    hours: 1,
    upiTransactionId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState('');

  const selectedCourse = courses.find((c: { id: string }) => c.id === form.courseId);
  const selectedSessionType = SESSION_TYPES.find(s => s.value === form.sessionType);
  const pricePerHour = selectedSessionType?.price || 800;
  const totalAmount = pricePerHour * form.hours;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Valid email is required';
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) newErrors.phone = 'Valid 10-digit phone is required';
    if (!form.courseId) newErrors.courseId = 'Please select a course';
    if (form.hours < 1 || form.hours > 1000) newErrors.hours = 'Hours must be between 1 and 1000';
    if (!form.upiTransactionId.trim()) newErrors.upiTransactionId = 'UPI Transaction ID is required';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setSubmitting(true);
    try {
      const freshStore = getStore();
      const id = `PAY-${Date.now()}`;
      const studentId = `STU-${Date.now()}`;
      const courseName = selectedCourse?.name || selectedCourse?.title || '';
      const now = new Date().toISOString();

      const payment: Payment = {
        id,
        studentId,
        studentName: form.fullName,
        courseName,
        sessionType: form.sessionType,
        hours: form.hours,
        pricePerHour,
        amount: totalAmount,
        totalAmount,
        upiTransactionId: form.upiTransactionId,
        status: 'pending',
        createdAt: now,
      };

      const student: Student = {
        id: studentId,
        userId: studentId,
        name: form.fullName,
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        course: courseName,
        sessionType: form.sessionType,
        accessCode: '',
        status: 'pending',
        registeredAt: now,
        enrolledCourses: [form.courseId],
      };

      freshStore.payments = [...(freshStore.payments || []), payment];
      freshStore.students = [...(freshStore.students || []), student];
      saveStore(freshStore);

      setPaymentId(id);
      setSuccess(true);
    } catch (err) {
      console.error('Registration error:', err);
      setErrors({ submit: 'Registration failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Registration Submitted!</h2>
          <p className="text-muted-foreground mb-6">
            Your payment is under review. Once approved by the admin, you'll receive your unique access code to log in.
          </p>
          <div className="bg-muted rounded-xl p-4 text-left mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment ID</span>
              <span className="font-mono font-medium text-foreground">{paymentId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Course</span>
              <span className="font-medium text-foreground">{selectedCourse?.name || selectedCourse?.title}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Hours</span>
              <span className="font-medium text-foreground">{form.hours}h</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Paid</span>
              <span className="font-medium text-foreground">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              <strong>Next Steps:</strong> The admin will verify your UPI payment and generate your access code. You can then log in using your email and the provided code.
            </p>
            <Link
              to="/"
              className="block w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground">The Rajat's Equation</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Student Registration</h1>
          <p className="text-muted-foreground">Register and pay via UPI to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-6">
          {/* Personal Info */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Full Name *</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  placeholder="Enter your full name"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email Address *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="10-digit mobile number"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Course Selection */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Course & Session Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Select Course *</label>
                <select
                  value={form.courseId}
                  onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- Select a course --</option>
                  {courses.map((c: { id: string; name?: string; title?: string }) => (
                    <option key={c.id} value={c.id}>{c.name || c.title}</option>
                  ))}
                </select>
                {errors.courseId && <p className="text-red-500 text-xs mt-1">{errors.courseId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Session Type *</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SESSION_TYPES.map(st => (
                    <label
                      key={st.value}
                      className={`flex flex-col p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        form.sessionType === st.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="sessionType"
                        value={st.value}
                        checked={form.sessionType === st.value}
                        onChange={e => setForm(f => ({ ...f, sessionType: e.target.value }))}
                        className="sr-only"
                      />
                      <span className="font-medium text-sm text-foreground">{st.label}</span>
                      <span className="text-xs text-muted-foreground mt-1">₹{st.price}/hour</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Number of Hours * <span className="text-muted-foreground font-normal">(1 – 1000)</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={form.hours}
                    onChange={e => {
                      const val = parseInt(e.target.value, 10);
                      setForm(f => ({ ...f, hours: isNaN(val) ? 1 : Math.min(1000, Math.max(1, val)) }));
                    }}
                    className="w-32 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">hours</span>
                </div>
                {errors.hours && <p className="text-red-500 text-xs mt-1">{errors.hours}</p>}
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          {form.courseId && (
            <div className="bg-muted/50 rounded-xl p-4">
              <h3 className="font-semibold text-foreground mb-3">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Course</span>
                  <span className="text-foreground">{selectedCourse?.name || selectedCourse?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Session Type</span>
                  <span className="text-foreground capitalize">{form.sessionType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hours</span>
                  <span className="text-foreground">{form.hours}h × ₹{pricePerHour}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-bold">
                  <span className="text-foreground">Total Amount</span>
                  <span className="text-primary text-lg">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* UPI Payment */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">UPI Payment</h2>
            <div className="flex flex-col items-center mb-4">
              <img
                src="/assets/generated/upi-qr-code.dim_300x300.png"
                alt="UPI QR Code"
                className="w-48 h-48 rounded-xl border border-border object-contain bg-white p-2"
              />
              <p className="text-sm text-muted-foreground mt-2">Scan to pay via UPI</p>
              <p className="text-sm font-medium text-foreground mt-1">UPI ID: rajatsequation@upi</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">UPI Transaction ID *</label>
              <input
                type="text"
                value={form.upiTransactionId}
                onChange={e => setForm(f => ({ ...f, upiTransactionId: e.target.value }))}
                placeholder="Enter your UPI transaction ID after payment"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.upiTransactionId && <p className="text-red-500 text-xs mt-1">{errors.upiTransactionId}</p>}
            </div>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {errors.submit}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Registration & Payment'
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
