import { useState } from 'react';
import { getStore, addPayment } from '../../lib/store';
import { getAuthState } from '../../lib/auth';
import { CheckCircle, Clock, BookOpen, Copy, Check, ExternalLink, Smartphone } from 'lucide-react';

const SESSION_TYPES = [
  { value: 'online', label: 'Online (Google Meet)', price: 800 },
  { value: 'offline', label: 'Offline (In-Person)', price: 1000 },
  { value: 'hybrid', label: 'Hybrid', price: 900 },
];

// UPI payment details
const UPI_ID = '9424135055@ptyes';
const PAYEE_NAME = "Rajat's Equation";

function buildUpiDeepLink(amount: number): string {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: PAYEE_NAME,
    cu: 'INR',
    tn: 'Session Booking - Rajats Equation',
  });
  if (amount > 0) {
    params.set('am', amount.toFixed(2));
  }
  return `upi://pay?${params.toString()}`;
}

function buildQrImageUrl(upiLink: string): string {
  const encoded = encodeURIComponent(upiLink);
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encoded}&size=300x300&ecc=H&margin=10&color=000000&bgcolor=ffffff`;
}

export default function Book() {
  const store = getStore();
  const courses = store.courses.filter((c) => c.active);

  const [form, setForm] = useState({
    courseId: '',
    sessionType: 'online',
    hours: 1,
    preferredDate: '',
    preferredTime: '',
    upiTransactionId: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const auth = getAuthState();
  const selectedCourse = courses.find((c) => c.id === form.courseId);
  const selectedSessionType = SESSION_TYPES.find((s) => s.value === form.sessionType);
  const pricePerHour = selectedSessionType?.price ?? 800;
  const totalAmount = pricePerHour * form.hours;

  const upiDeepLink = buildUpiDeepLink(form.courseId ? totalAmount : 0);
  const qrImageUrl = buildQrImageUrl(upiDeepLink);

  const handleCopyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } catch {
      // fallback: select text
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(upiDeepLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // fallback
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
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
      const studentId = auth?.studentId || '';
      const freshStore = getStore();
      const student = freshStore.students.find((s) => s.id === studentId);
      const courseName = selectedCourse?.name || '';

      const payment = addPayment({
        studentId,
        studentName: student?.name || auth?.name || 'Student',
        courseName,
        sessionType: form.sessionType,
        hours: form.hours,
        pricePerHour,
        amount: totalAmount,
        upiTransactionId: form.upiTransactionId,
        status: 'pending',
      });

      setPaymentId(payment.id);
      setSuccess(true);
    } catch {
      setErrors({ submit: 'Booking failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Booking Submitted!</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Your session booking and payment are under review. The admin will confirm your session shortly.
          </p>
          <div className="bg-muted rounded-xl p-4 text-left space-y-2 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment ID</span>
              <span className="font-mono font-medium text-foreground">{paymentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Course</span>
              <span className="font-medium text-foreground">{selectedCourse?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hours</span>
              <span className="font-medium text-foreground">{form.hours}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium text-foreground">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
          <button
            onClick={() => {
              setSuccess(false);
              setForm({
                courseId: '',
                sessionType: 'online',
                hours: 1,
                preferredDate: '',
                preferredTime: '',
                upiTransactionId: '',
                notes: '',
              });
              setErrors({});
            }}
            className="w-full py-2 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            Book Another Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          Book a Session
        </h1>
        <p className="text-muted-foreground mt-1">Select your course, session type, and pay via UPI</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-6">
        {/* Course Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Select Course *</label>
          <select
            value={form.courseId}
            onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">-- Select a course --</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — ₹{c.pricePerHour}/hr
              </option>
            ))}
          </select>
          {errors.courseId && <p className="text-destructive text-xs mt-1">{errors.courseId}</p>}
        </div>

        {/* Session Type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Session Type *</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SESSION_TYPES.map((st) => (
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
                  onChange={(e) => setForm((f) => ({ ...f, sessionType: e.target.value }))}
                  className="sr-only"
                />
                <span className="font-medium text-sm text-foreground">{st.label}</span>
                <span className="text-xs text-muted-foreground mt-1">₹{st.price}/hour</span>
              </label>
            ))}
          </div>
        </div>

        {/* Hours */}
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
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setForm((f) => ({ ...f, hours: isNaN(val) ? 1 : Math.min(1000, Math.max(1, val)) }));
              }}
              className="w-32 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">hours</span>
          </div>
          {errors.hours && <p className="text-destructive text-xs mt-1">{errors.hours}</p>}
        </div>

        {/* Preferred Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Preferred Date</label>
            <input
              type="date"
              value={form.preferredDate}
              onChange={(e) => setForm((f) => ({ ...f, preferredDate: e.target.value }))}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Preferred Time</label>
            <input
              type="time"
              value={form.preferredTime}
              onChange={(e) => setForm((f) => ({ ...f, preferredTime: e.target.value }))}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Additional Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Any specific topics or requirements..."
            rows={3}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* Payment Summary */}
        {form.courseId && (
          <div className="bg-muted/50 rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-3">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Course</span>
                <span className="text-foreground">{selectedCourse?.name}</span>
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
          <h2 className="text-base font-semibold text-foreground mb-3">UPI Payment</h2>

          {/* QR Code Section */}
          <div className="bg-white rounded-2xl border-2 border-border p-4 flex flex-col items-center mb-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Scan with any UPI app
            </p>

            {/* Dynamic QR Code via API — encodes proper UPI deep link */}
            <div className="relative">
              <img
                key={qrImageUrl}
                src={qrImageUrl}
                alt="UPI Payment QR Code"
                width={260}
                height={260}
                className="rounded-xl border border-gray-200"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            {/* Amount badge */}
            {form.courseId && (
              <div className="mt-3 px-4 py-1.5 bg-primary/10 rounded-full">
                <span className="text-primary font-bold text-lg">₹{totalAmount.toLocaleString()}</span>
              </div>
            )}

            {/* Supported apps */}
            <div className="flex items-center gap-2 mt-3">
              <Smartphone className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Works with Google Pay, PhonePe, BHIM, Paytm & all UPI apps
              </p>
            </div>
          </div>

          {/* Fallback Section */}
          <div className="bg-muted/40 rounded-xl border border-border p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Can't scan? Use these instead:
            </p>

            {/* Copy UPI ID */}
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono text-foreground select-all">
                {UPI_ID}
              </div>
              <button
                type="button"
                onClick={handleCopyUpiId}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                  copiedUpi
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'bg-background border-border text-foreground hover:bg-muted'
                }`}
              >
                {copiedUpi ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy UPI ID
                  </>
                )}
              </button>
            </div>

            {/* Open in UPI App */}
            <div className="flex items-center gap-2">
              <a
                href={upiDeepLink}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open Payment App
              </a>
              <button
                type="button"
                onClick={handleCopyLink}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                  copiedLink
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'bg-background border-border text-foreground hover:bg-muted'
                }`}
                title="Copy payment link"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Link
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Tap "Open Payment App" on your mobile to launch your UPI app directly with payment details pre-filled.
            </p>
          </div>

          {/* Transaction ID Input */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-1">UPI Transaction ID *</label>
            <input
              type="text"
              value={form.upiTransactionId}
              onChange={(e) => setForm((f) => ({ ...f, upiTransactionId: e.target.value }))}
              placeholder="Enter your UPI transaction ID after payment"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.upiTransactionId && (
              <p className="text-destructive text-xs mt-1">{errors.upiTransactionId}</p>
            )}
          </div>
        </div>

        {errors.submit && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-destructive text-sm">
            {errors.submit}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Booking'
          )}
        </button>
      </form>
    </div>
  );
}
