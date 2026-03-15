import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, ArrowRight, Download, Share2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/ecobserve/Navbar';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshSubscription } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [transaction, setTransaction] = useState<any>(null);
  const reference = searchParams.get('reference');

  useEffect(() => {
    if (reference) {
      verifyPayment();
    }
  }, [reference]);

  const verifyPayment = async () => {
    try {
      const token = localStorage.getItem('access_token');
      // Determine API URL based on current domain
      const apiUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:8035'
        : `${window.location.protocol}//${window.location.hostname}`;

      const response = await fetch(
        `${apiUrl}/api/payments/verify/${reference}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setTransaction(data.data);
        // Refresh subscription data
        await refreshSubscription();
      }
    } catch (error) {
      console.error('Payment verification error:', error);
    } finally {
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <Navbar onNavigate={(section) => navigate(`/#${section}`)} />
      
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
            {/* Success Icon */}
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold mb-4">
              Payment Successful! 🎉
            </h1>

            <p className="text-xl text-gray-600 mb-8">
              Welcome to your new subscription plan. You now have access to all premium features!
            </p>

            {/* Transaction Details */}
            {transaction && (
              <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
                <h3 className="font-semibold text-gray-900 mb-4">Transaction Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-mono font-semibold">{transaction.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold">
                      {transaction.currency} {(transaction.amount / 100).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-emerald-600 font-semibold capitalize">{transaction.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                Start Using Features
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => navigate('/pricing')}
                className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                View All Plans
              </button>
            </div>

            {/* Next Steps */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">What's Next?</h3>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div className="p-4 bg-emerald-50 rounded-xl">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <p className="text-gray-700">Explore all premium features</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <p className="text-gray-700">Calculate your first event</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <p className="text-gray-700">Invite your team members</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;

