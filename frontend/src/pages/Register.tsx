import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { getStore, addStudent, addPayment } from '../lib/store';
import { CheckCircle, ArrowLeft, Loader2, Copy, Check, ExternalLink, Smartphone } from 'lucide-react';
import { Button } from '../components/ui/button';

const SESSION_TYPES = [
  { value: 'group', label: 'Group Session', description: 'Learn with peers, cost-effective' },
  { value: '1-on-1', label: '1-on-1 Session', description: 'Personalized attention' },
];

const UPI_ID = '9424135055@ptyes';
const PAYEE_NAME = "Rajat's Equation";

function buildUpiDeepLink(amount: number): string {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: PAYEE_NAME,
    cu: 'INR',
    tn: 'Registration - Rajats Equation',
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

export default function Register() {
  const navigate = useNavigate();
  const store = getStore();
  const courses = store.courses.filter((c) => c.active);

  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    courseId: '',
    sessionType: 'group',
    hours: 1,
    upiTransactionId: '',
  });

  const selectedCourse = courses.find((c) => c.id === form.courseId);
  const courseName = selectedCourse?.name || '';
  const pricePerHour = selectedCourse?.pricePerHour ?? 0;
  const totalAmount = pricePerHour * form.hours;

  const upiDeepLink = buildUpiDeepLink(totalAmount);
  const qrImageUrl = buildQrImageUrl(upiDeepLink);

  const handleCopyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } catch {
      // fallback
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.courseId) {
      setError('Please select a course.');
      return;
    }
    setStep('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!form.upiTransactionId.trim()) {
        setError('Please enter your UPI transaction ID.');
        return;
      }

      const studentId = `student-${Date.now()}`;

      // Create payment record
      addPayment({
        studentId,
        studentName: form.name,
        courseName,
        sessionType: form.sessionType,
        hours: form.hours,
        pricePerHour,
        amount: totalAmount,
        upiTransactionId: form.upiTransactionId.trim(),
        status: 'pending',
      });

      // Create student record
      addStudent({
        name: form.name,
        email: form.email,
        phone: form.phone,
        course: courseName,
        sessionType: form.sessionType,
        hours: form.hours,
        status: 'pending',
      });

      setStep('success');
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Registration Submitted!</h1>
            <p className="text-muted-foreground mt-2">
              Your registration and payment have been submitted. Please wait for admin approval.
            </p>
          </div>
          <div className="bg-muted rounded-xl p-4 text-sm text-left space-y-2">
            <p className="font-medium text-foreground">What happens next?</p>
            <ul className="space-y-1 text-muted-foreground list-disc list-inside">
              <li>Admin will verify your UPI transaction</li>
              <li>You'll receive an access code</li>
              <li>Use your email + access code to log in</li>
            </ul>
          </div>
          <div className="flex gap-3 justify-center">
            <Link
              to="/"
              className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-sm"
            >
              Go Home
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 flex items-center gap-3">
        <Link to="/" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2">
          <img src="/assets/generated/logo-mark.dim_128x128.png" alt="Logo" className="w-7 h-7 rounded" />
          <span className="font-bold text-foreground">Rajat's Equation</span>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4 py-8">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          <div className={`flex items-center gap-2 text-sm font-medium ${step === 'form' ? 'text-primary' : 'text-muted-foreground'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'form' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>1</span>
            Details
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className={`flex items-center gap-2 text-sm font-medium ${step === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'payment' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>2</span>
            Payment
          </div>
        </div>

        {step === 'form' && (
          <form onSubmit={handleFormSubmit} className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">Student Registration</h2>
              <p className="text-sm text-muted-foreground">Fill in your details to get started</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
                required
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                required
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Phone Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 XXXXX XXXXX"
                required
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Select Course</label>
              <select
                value={form.courseId}
                onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="">Choose a course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — ₹{c.pricePerHour}/hr
                  </option>
                ))}
              </select>
            </div>

            {selectedCourse && (
              <div className="bg-muted rounded-lg p-3 text-sm">
                <p className="font-medium text-foreground">Selected: <span className="font-medium text-foreground">{selectedCourse.name}</span></p>
                <p className="text-muted-foreground mt-0.5">{selectedCourse.description}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Session Type</label>
              <div className="grid grid-cols-2 gap-3">
                {SESSION_TYPES.map((st) => (
                  <button
                    key={st.value}
                    type="button"
                    onClick={() => setForm({ ...form, sessionType: st.value })}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      form.sessionType === st.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <p className="font-medium text-sm text-foreground">{st.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{st.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Number of Hours
              </label>
              <input
                type="number"
                min={1}
                max={1000}
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: Math.max(1, Number(e.target.value)) })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            {selectedCourse && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-bold text-primary text-base">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={!form.courseId}>
              Continue to Payment
            </Button>
          </form>
        )}

        {step === 'payment' && (
          <form onSubmit={handlePaymentSubmit} className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">Payment</h2>
              <p className="text-sm text-muted-foreground">Complete your payment via UPI</p>
            </div>

            {/* Order Summary */}
            <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
              <p className="font-medium text-foreground">Order Summary</p>
              <div className="flex justify-between text-muted-foreground">
                <span>Course</span>
                <span className="text-foreground">{selectedCourse?.name}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Session Type</span>
                <span className="text-foreground">{form.sessionType}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Hours</span>
                <span className="text-foreground">{form.hours}h × ₹{pricePerHour}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-border pt-2 mt-1">
                <span className="text-foreground">Total</span>
                <span className="text-primary">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* UPI QR Code — dynamically generated with correct deep link */}
            <div className="bg-white rounded-2xl border-2 border-border p-4 flex flex-col items-center">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                Scan with any UPI app
              </p>
              <img
                key={qrImageUrl}
                src={qrImageUrl}
                alt="UPI Payment QR Code"
                width={240}
                height={240}
                className="rounded-xl border border-gray-200"
                style={{ imageRendering: 'pixelated' }}
              />
              <div className="mt-3 px-4 py-1.5 bg-primary/10 rounded-full">
                <span className="text-primary font-bold text-lg">₹{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Smartphone className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Works with Google Pay, PhonePe, BHIM, Paytm & all UPI apps
                </p>
              </div>
            </div>

            {/* Fallback: Copy UPI ID + Open App */}
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

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                UPI Transaction ID
              </label>
              <input
                type="text"
                value={form.upiTransactionId}
                onChange={(e) => setForm({ ...form, upiTransactionId: e.target.value })}
                placeholder="Enter your UPI transaction ID"
                required
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('form')}
                className="flex-1"
              >
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Registration'
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
