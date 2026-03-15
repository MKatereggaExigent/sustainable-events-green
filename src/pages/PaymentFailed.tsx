import React from 'react';
import { XCircle, ArrowRight, RefreshCw, HelpCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/ecobserve/Navbar';

const PaymentFailed: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const error = searchParams.get('error');
  const reference = searchParams.get('reference');

  const getErrorMessage = () => {
    switch (error) {
      case 'no_reference':
        return 'Payment reference not found. Please try again.';
      case 'verification_failed':
        return 'We could not verify your payment. Please contact support.';
      default:
        return 'Your payment was not successful. Please try again or use a different payment method.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <Navbar onNavigate={(section) => navigate(`/#${section}`)} />
      
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Error Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
            {/* Error Icon */}
            <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-white" />
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold mb-4 text-gray-900">
              Payment Failed
            </h1>

            <p className="text-xl text-gray-600 mb-8">
              {getErrorMessage()}
            </p>

            {/* Reference if available */}
            {reference && (
              <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                <p className="text-sm text-gray-600 mb-2">Transaction Reference:</p>
                <p className="font-mono font-semibold text-gray-900">{reference}</p>
              </div>
            )}

            {/* Common Reasons */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 text-left">
              <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Common Reasons for Payment Failure
              </h3>
              <ul className="space-y-2 text-sm text-amber-800">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>Insufficient funds in your account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>Incorrect card details or expired card</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>Transaction declined by your bank</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>Network or connection issues</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/pricing')}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                Back to Home
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Support */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-600 mb-4">
                If you continue to experience issues, please contact our support team.
              </p>
              <a
                href="mailto:support@ecobserve.com"
                className="text-emerald-600 hover:underline font-semibold"
              >
                support@ecobserve.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;

