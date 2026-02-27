import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, BookOpen, CheckCircle, IndianRupee, ChevronRight } from 'lucide-react';
import { getStore, saveStore, type Session } from '../../lib/store';
import WhatsAppButton from '@/components/WhatsAppButton';

const SESSION_TYPES = [
  { id: 'individual', label: 'Individual', description: 'One-on-one session', multiplier: 1.5 },
  { id: 'group', label: 'Group', description: 'Small group session', multiplier: 1.0 },
];

const DURATIONS = [
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '02:00 PM', '03:00 PM',
  '04:00 PM', '05:00 PM', '06:00 PM',
  '07:00 PM',
];

export default function BookSession() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<string>('group');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  const store = getStore();
  const student = store.students.find((s) => s.userId === currentUser?.id);
  const enrolledCourseIds: string[] = student?.enrolledCourses || [];
  const availableCourses = store.courses.filter(
    (c) => c.isActive !== false && enrolledCourseIds.includes(c.id)
  );

  const sessionType = SESSION_TYPES.find((t) => t.id === selectedType);
  const basePrice = selectedCourse?.price || 0;
  const totalPrice = Math.round(
    (basePrice / 4) * (selectedDuration / 60) * (sessionType?.multiplier || 1)
  );

  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const handleBooking = async () => {
    if (!selectedCourse || !selectedDate || !selectedTime) {
      toast.error('Please complete all required fields.');
      return;
    }
    if (!student) {
      toast.error('Student record not found. Please contact admin.');
      return;
    }

    setIsProcessing(true);
    try {
      const newSession: Session = {
        id: `session_${Date.now()}`,
        studentId: student.id,
        courseId: selectedCourse.id,
        courseName: selectedCourse.name,
        type: selectedType,
        date: selectedDate,
        time: selectedTime,
        duration: selectedDuration,
        status: 'pending',
        price: totalPrice,
        createdAt: new Date().toISOString(),
      };

      const updatedStore = getStore();
      updatedStore.sessions = [...(updatedStore.sessions || []), newSession];
      saveStore(updatedStore);

      toast.success('Session booked successfully! Awaiting confirmation.');
      navigate({ to: '/student/sessions' });
    } catch (err) {
      toast.error('Booking failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Book a Session</h1>
        <p className="text-muted-foreground text-sm mt-1">Schedule your next learning session</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors
                ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
            >
              {step > s ? <CheckCircle className="w-4 h-4" /> : s}
            </div>
            {s < 3 && (
              <div
                className={`flex-1 h-0.5 transition-colors ${step > s ? 'bg-primary' : 'bg-muted'}`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground -mt-2">
        <span>Select Course</span>
        <span>Pick Date &amp; Time</span>
        <span>Confirm</span>
      </div>

      {/* Step 1: Course & Type Selection */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Choose Course &amp; Session Type</h2>

          {availableCourses.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-8 text-center">
                <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm mb-4">
                  You're not enrolled in any courses yet.
                </p>
                <WhatsAppButton
                  label="Contact to Enroll"
                  message="Hi, I want to enroll in a course and book a session."
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {availableCourses.map((course) => (
                <Card
                  key={course.id}
                  className={`cursor-pointer border-2 transition-all hover:shadow-md ${
                    selectedCourse?.id === course.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedCourse(course)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`p-2 rounded-lg ${
                            selectedCourse?.id === course.id ? 'bg-primary/20' : 'bg-muted'
                          }`}
                        >
                          <BookOpen
                            className={`w-4 h-4 ${
                              selectedCourse?.id === course.id
                                ? 'text-primary'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm text-foreground">{course.name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {course.description}
                          </p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-primary font-medium">
                            <IndianRupee className="w-3 h-3" />
                            <span>{course.price?.toLocaleString('en-IN')}/month</span>
                          </div>
                        </div>
                      </div>
                      {selectedCourse?.id === course.id && (
                        <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                      )}
                    </div>
                    {/* WhatsApp CTA per course */}
                    <div
                      className="mt-3 pt-3 border-t border-border"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <WhatsAppButton
                        label="Book Demo for this Course"
                        message={`Hi, I want to book a demo session for ${course.name}.`}
                        className="text-xs py-1.5 px-3 w-full justify-center"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Session type */}
          {availableCourses.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Session Type</h3>
              <div className="grid grid-cols-2 gap-3">
                {SESSION_TYPES.map((type) => (
                  <Card
                    key={type.id}
                    className={`cursor-pointer border-2 transition-all ${
                      selectedType === type.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <CardContent className="p-3 text-center">
                      <div className="font-semibold text-sm text-foreground">{type.label}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                      {type.multiplier > 1 && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {type.multiplier}x rate
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {availableCourses.length > 0 && (
            <Button
              className="w-full"
              disabled={!selectedCourse}
              onClick={() => setStep(2)}
            >
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      )}

      {/* Step 2: Date & Time */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Select Date &amp; Time</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Date</label>
            <input
              type="date"
              min={getTomorrowDate()}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Duration</label>
            <div className="flex gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setSelectedDuration(d.value)}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                    selectedDuration === d.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Time Slot</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  className={`py-2 px-2 rounded-lg border text-xs font-medium transition-colors ${
                    selectedTime === slot
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              className="flex-1"
              disabled={!selectedDate || !selectedTime}
              onClick={() => setStep(3)}
            >
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Confirm Booking</h2>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Course', value: selectedCourse?.name },
                { label: 'Session Type', value: sessionType?.label },
                { label: 'Date', value: selectedDate },
                { label: 'Time', value: selectedTime },
                { label: 'Duration', value: `${selectedDuration} minutes` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-foreground">{value}</span>
                </div>
              ))}
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-semibold text-foreground">Estimated Price</span>
                <span className="font-bold text-primary flex items-center gap-0.5">
                  <IndianRupee className="w-4 h-4" />
                  {totalPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-muted/30">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-3">
                Prefer to confirm via WhatsApp? Contact us directly to book your session.
              </p>
              <WhatsAppButton
                label="Confirm via WhatsApp"
                message={`Hi, I want to book a ${sessionType?.label} session for ${selectedCourse?.name} on ${selectedDate} at ${selectedTime} for ${selectedDuration} minutes.`}
                className="w-full justify-center"
              />
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button className="flex-1" disabled={isProcessing} onClick={handleBooking}>
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Booking...
                </span>
              ) : (
                'Confirm Booking'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
