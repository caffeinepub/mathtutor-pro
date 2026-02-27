import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  getCourses,
  getStudentByUserId,
  createSession,
  createPayment,
  getAuthState,
  Course,
} from '../../lib/store';
import { BookOpen, Calendar, CheckCircle, Users, User, MessageCircle, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';

type Step = 1 | 2 | 3;

export default function StudentBook() {
  const navigate = useNavigate();
  const auth = getAuthState();
  const student = auth.userId ? getStudentByUserId(auth.userId) : null;

  const [step, setStep] = useState<Step>(1);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [sessionType, setSessionType] = useState<'group' | 'one-on-one'>('group');
  const [hours, setHours] = useState<number>(1);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [upiTxnId, setUpiTxnId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const courses = getCourses().filter((c) => c.isActive);

  const pricePerHour = selectedCourse
    ? sessionType === 'group'
      ? selectedCourse.groupPricePerHour
      : selectedCourse.oneOnOnePricePerHour
    : 0;

  const totalAmount = pricePerHour * hours;

  if (!student) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500">Student profile not found. Please contact admin.</p>
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
      // Create session record
      createSession({
        courseId: selectedCourse.id,
        courseName: selectedCourse.name,
        studentId: student.id,
        studentName: student.name,
        date,
        time,
        sessionType,
        status: 'scheduled',
      });

      // Create payment record
      createPayment({
        studentId: student.id,
        studentName: student.name,
        courseId: selectedCourse.id,
        courseName: selectedCourse.name,
        sessionType,
        hours,
        pricePerHour,
        amount: totalAmount,
        status: 'pending',
        upiTransactionId: upiTxnId,
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
          <h1 className="text-2xl font-bold text-slate-800">Book a Session</h1>
          <p className="text-slate-500 mt-1">Step 1 of 3 — Choose your course</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-sky-400 hover:shadow-md transition-all cursor-pointer"
              onClick={() => handleCourseSelect(course)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-slate-800 text-lg">{course.name}</h3>
                <Badge variant="outline" className="text-sky-600 border-sky-200 bg-sky-50 text-xs ml-2">
                  {course.level}
                </Badge>
              </div>
              <p className="text-slate-500 text-sm mb-4">{course.description}</p>
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
                className="w-full mt-4 bg-sky-600 hover:bg-sky-700 text-white h-11 font-semibold"
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
          <button onClick={() => setStep(1)} className="text-sky-600 hover:underline text-sm mb-2 flex items-center gap-1">
            ← Back to courses
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Book a Session</h1>
          <p className="text-slate-500 mt-1">Step 2 of 3 — Enter booking details</p>
        </div>

        {/* Selected Course Summary */}
        <div className="bg-sky-50 rounded-xl border border-sky-200 p-4 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={18} className="text-sky-600" />
            <span className="font-semibold text-sky-800">{selectedCourse?.name}</span>
          </div>
          <p className="text-sm text-sky-600">{selectedCourse?.level}</p>
        </div>

        <form onSubmit={handleBookingSubmit} className="space-y-5">
          {/* Session Type */}
          <div className="space-y-2">
            <Label className="text-base font-medium text-slate-700">Session Type</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSessionType('group')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  sessionType === 'group'
                    ? 'border-sky-500 bg-sky-50'
                    : 'border-slate-200 bg-white hover:border-sky-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Users size={18} className="text-sky-600" />
                  <span className="font-semibold text-slate-800">Group Class</span>
                </div>
                <span className="text-sky-700 font-bold">₹{selectedCourse?.groupPricePerHour}/hr</span>
              </button>
              <button
                type="button"
                onClick={() => setSessionType('one-on-one')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  sessionType === 'one-on-one'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-slate-200 bg-white hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <User size={18} className="text-purple-600" />
                  <span className="font-semibold text-slate-800">One-on-One</span>
                </div>
                <span className="text-purple-700 font-bold">₹{selectedCourse?.oneOnOnePricePerHour}/hr</span>
              </button>
            </div>
          </div>

          {/* Number of Hours */}
          <div className="space-y-2">
            <Label htmlFor="hours" className="text-base font-medium text-slate-700">
              Number of Hours
            </Label>
            <Input
              id="hours"
              type="number"
              min={1}
              value={hours}
              onChange={(e) => setHours(Math.max(1, parseInt(e.target.value) || 1))}
              className="h-12 text-base border-sky-200 focus:border-sky-500"
              required
            />
          </div>

          {/* Total Amount Display */}
          <div className="bg-gradient-to-r from-sky-50 to-sky-100 rounded-xl border border-sky-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sky-600 font-medium">Total Amount</p>
                <p className="text-xs text-sky-500 mt-0.5">
                  ₹{pricePerHour}/hr × {hours} hour{hours !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <IndianRupee size={22} className="text-sky-700" />
                <span className="text-3xl font-bold text-sky-700">{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-base font-medium text-slate-700">
              Preferred Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="h-12 text-base border-sky-200 focus:border-sky-500"
              required
            />
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label htmlFor="time" className="text-base font-medium text-slate-700">
              Preferred Time
            </Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="h-12 text-base border-sky-200 focus:border-sky-500"
              required
            />
          </div>

          {/* UPI Payment */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
            <h3 className="font-semibold text-slate-800">Payment via UPI</h3>
            <div className="flex justify-center">
              <img
                src="/assets/generated/upi-qr-code.dim_300x300.png"
                alt="UPI QR Code"
                className="w-40 h-40 object-contain rounded-lg border border-slate-200"
              />
            </div>
            <p className="text-sm text-slate-600 text-center">
              Scan the QR code and pay <strong>₹{totalAmount.toLocaleString('en-IN')}</strong>
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="upiTxnId" className="text-base font-medium text-slate-700">
                UPI Transaction ID
              </Label>
              <Input
                id="upiTxnId"
                value={upiTxnId}
                onChange={(e) => setUpiTxnId(e.target.value)}
                placeholder="Enter your UPI transaction ID"
                className="h-12 text-base border-sky-200 focus:border-sky-500"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-13 text-base font-semibold bg-sky-600 hover:bg-sky-700 text-white"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
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
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Booking Confirmed!</h2>
        <p className="text-slate-600 mb-2">
          Your session for <strong>{selectedCourse?.name}</strong> has been booked.
        </p>
        <p className="text-slate-500 text-sm mb-6">
          Admin will review your payment and confirm the session. You'll see it in your sessions page.
        </p>
        <div className="bg-white rounded-xl border border-green-200 p-4 mb-6 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Course</span>
            <span className="font-medium text-slate-800">{selectedCourse?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Session Type</span>
            <span className="font-medium text-slate-800 capitalize">{sessionType}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Hours</span>
            <span className="font-medium text-slate-800">{hours}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Total Paid</span>
            <span className="font-bold text-sky-700">₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Button
            className="w-full bg-sky-600 hover:bg-sky-700 text-white h-12 font-semibold"
            onClick={() => navigate({ to: '/student/sessions' })}
          >
            View My Sessions
          </Button>
          <Button
            variant="outline"
            className="w-full border-sky-200 text-sky-700 h-12 font-semibold"
            onClick={() => { setStep(1); setSelectedCourse(null); setHours(1); setDate(''); setTime(''); setUpiTxnId(''); }}
          >
            Book Another Session
          </Button>
        </div>
      </div>
    </div>
  );
}
