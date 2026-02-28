import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  getCourses,
  createSession,
  createPayment,
  getAuthState,
  getStore,
  type Course,
} from '../../lib/store';
import { BookOpen, Calendar, CheckCircle, Users, User, MessageCircle, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';

type Step = 1 | 2 | 3;

export default function StudentBook() {
  const navigate = useNavigate();
  const auth = getAuthState();
  const store = getStore();
  const student = auth ? store.students.find((s) => s.id === auth.userId || s.userId === auth.userId) : null;

  const [step, setStep] = useState<Step>(1);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [sessionType, setSessionType] = useState<'group' | 'one-on-one'>('group');
  const [hours, setHours] = useState<number>(1);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [upiTxnId, setUpiTxnId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const courses = getCourses().filter((c) => c.active || c.isActive);

  const pricePerHour = selectedCourse
    ? sessionType === 'group'
      ? selectedCourse.groupPricePerHour
      : selectedCourse.oneOnOnePricePerHour
    : 0;

  const totalAmount = pricePerHour * hours;

  if (!student) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Student profile not found. Please contact admin.</p>
      </div>
    );
  }

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setStep(2);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    setIsSubmitting(true);

    try {
      const courseName = selectedCourse.name || selectedCourse.title || '';

      createSession({
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        date,
        time,
        durationHours: hours,
        duration: `${hours}h`,
        meetLink: '',
        topic: courseName,
        courseName,
        courseId: selectedCourse.id,
        sessionType,
        status: 'scheduled',
      });

      createPayment({
        studentId: student.id,
        studentName: student.name,
        courseName,
        sessionType,
        hours,
        pricePerHour,
        amount: totalAmount,
        totalAmount,
        upiTransactionId: upiTxnId,
        status: 'pending',
      });

      toast.success('Session booked successfully! Admin will confirm shortly.');
      setStep(3);
    } catch {
      toast.error('Failed to book session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: Course Selection
  if (step === 1) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Book a Session</h1>
          <p className="text-muted-foreground mt-1">Step 1 of 3 — Choose your course</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-card rounded-2xl border border-border p-5 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
              onClick={() => handleCourseSelect(course)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-foreground text-lg">{course.name || course.title}</h3>
                <Badge variant="outline" className="text-xs ml-2 shrink-0">
                  {course.level}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm mb-4">{course.description}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-sky-50 rounded-lg px-3 py-2">
                  <span className="flex items-center gap-1.5 text-sm text-slate-600">
                    <Users size={14} className="text-sky-500" />
                    Group Class
                  </span>
                  <span className="font-bold text-sky-700">₹{course.groupPricePerHour}/hr</span>
                </div>
                <div className="flex items-center justify-between bg-purple-50 rounded-lg px-3 py-2">
                  <span className="flex items-center gap-1.5 text-sm text-slate-600">
                    <User size={14} className="text-purple-500" />
                    One-on-One
                  </span>
                  <span className="font-bold text-purple-700">₹{course.oneOnOnePricePerHour}/hr</span>
                </div>
              </div>
              <Button
                className="w-full mt-4 bg-primary hover:opacity-90 text-primary-foreground h-11 font-semibold"
                onClick={(e) => { e.stopPropagation(); handleCourseSelect(course); }}
              >
                Select This Course
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200 text-center">
          <p className="text-green-700 font-medium mb-2">Need help choosing?</p>
          <Button
            variant="outline"
            className="border-green-400 text-green-700 hover:bg-green-100"
            onClick={() => window.open('https://wa.me/919424135055?text=Hi! I need help choosing the right course.', '_blank')}
          >
            <MessageCircle size={16} className="mr-2" />
            Ask on WhatsApp
          </Button>
        </div>
      </div>
    );
  }

  // Step 2: Booking Details
  if (step === 2) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <button onClick={() => setStep(1)} className="text-primary hover:underline text-sm mb-2 flex items-center gap-1">
            ← Back to courses
          </button>
          <h1 className="text-2xl font-bold text-foreground">Book a Session</h1>
          <p className="text-muted-foreground mt-1">Step 2 of 3 — Enter booking details</p>
        </div>

        <div className="bg-primary/5 rounded-xl border border-primary/20 p-4 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={18} className="text-primary" />
            <span className="font-semibold text-foreground">{selectedCourse?.name || selectedCourse?.title}</span>
          </div>
          <p className="text-sm text-muted-foreground">{selectedCourse?.level}</p>
        </div>

        <form onSubmit={handleBookingSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-base font-medium text-foreground">Session Type</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSessionType('group')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  sessionType === 'group'
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Users size={18} className="text-sky-600" />
                  <span className="font-semibold text-foreground">Group Class</span>
                </div>
                <span className="text-sky-700 font-bold">₹{selectedCourse?.groupPricePerHour}/hr</span>
              </button>
              <button
                type="button"
                onClick={() => setSessionType('one-on-one')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  sessionType === 'one-on-one'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-border bg-card hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <User size={18} className="text-purple-600" />
                  <span className="font-semibold text-foreground">One-on-One</span>
                </div>
                <span className="text-purple-700 font-bold">₹{selectedCourse?.oneOnOnePricePerHour}/hr</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hours" className="text-base font-medium text-foreground">
              Number of Hours
            </Label>
            <Input
              id="hours"
              type="number"
              min={1}
              value={hours}
              onChange={(e) => setHours(Math.max(1, parseInt(e.target.value) || 1))}
              className="h-12 text-base"
              required
            />
          </div>

          <div className="bg-muted/50 rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Amount</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ₹{pricePerHour}/hr × {hours} hour{hours !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <IndianRupee size={22} className="text-primary" />
                <span className="text-3xl font-bold text-primary">{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-base font-medium text-foreground">
              Preferred Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="h-12 text-base"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time" className="text-base font-medium text-foreground">
              Preferred Time
            </Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="h-12 text-base"
              required
            />
          </div>

          <div className="bg-muted/30 rounded-xl border border-border p-4 space-y-3">
            <h3 className="font-semibold text-foreground">Payment via UPI</h3>
            <div className="flex justify-center">
              <img
                src="/assets/generated/upi-qr-code.dim_300x300.png"
                alt="UPI QR Code"
                className="w-40 h-40 object-contain rounded-lg border border-border"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Scan the QR code and pay <strong>₹{totalAmount.toLocaleString('en-IN')}</strong>
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="upiTxnId" className="text-base font-medium text-foreground">
                UPI Transaction ID
              </Label>
              <Input
                id="upiTxnId"
                value={upiTxnId}
                onChange={(e) => setUpiTxnId(e.target.value)}
                placeholder="Enter your UPI transaction ID"
                className="h-12 text-base"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 text-base font-semibold"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                Booking...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Calendar size={18} />
                Confirm Booking — ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            )}
          </Button>
        </form>
      </div>
    );
  }

  // Step 3: Confirmation
  return (
    <div className="p-6 max-w-lg mx-auto text-center">
      <div className="bg-green-50 rounded-2xl border border-green-200 p-8">
        <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h2>
        <p className="text-muted-foreground mb-2">
          Your session for <strong>{selectedCourse?.name || selectedCourse?.title}</strong> has been booked.
        </p>
        <p className="text-muted-foreground text-sm mb-6">
          Admin will review your payment and confirm the session. You'll see it in your sessions page.
        </p>
        <div className="bg-white rounded-xl border border-green-200 p-4 mb-6 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Course</span>
            <span className="font-medium text-foreground">{selectedCourse?.name || selectedCourse?.title}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Session Type</span>
            <span className="font-medium text-foreground capitalize">{sessionType}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Hours</span>
            <span className="font-medium text-foreground">{hours}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Paid</span>
            <span className="font-bold text-primary">₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Button
            className="w-full h-12 font-semibold"
            onClick={() => navigate({ to: '/student/sessions' })}
          >
            View My Sessions
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 font-semibold"
            onClick={() => { setStep(1); setSelectedCourse(null); setHours(1); setDate(''); setTime(''); setUpiTxnId(''); }}
          >
            Book Another Session
          </Button>
        </div>
      </div>
    </div>
  );
}
