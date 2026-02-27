import { Link } from '@tanstack/react-router';
import { XCircle } from 'lucide-react';

export default function PaymentFailure() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-navy mb-3">Payment Failed</h1>
        <p className="text-slate-500 mb-8">Your payment could not be processed. Please try again or contact support.</p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/student/book"
            className="px-6 py-3 bg-navy text-white font-semibold rounded-xl hover:bg-navy/90 transition-all"
          >
            Try Again
          </Link>
          <Link
            to="/student"
            className="px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
