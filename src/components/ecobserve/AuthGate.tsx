import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGateProps {
  children: React.ReactNode;
  feature: string;
  description?: string;
}

/**
 * AuthGate wraps premium features and shows a login CTA for unauthenticated users.
 * Authenticated users see the children content directly.
 */
const AuthGate: React.FC<AuthGateProps> = ({ children, feature, description }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="py-16 px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Show premium feature upsell for unauthenticated users
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-gray-50 to-emerald-50/30">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
          {/* Premium badge */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">Premium Feature</span>
          </div>
          
          <div className="p-8 md:p-12 text-center">
            {/* Lock icon */}
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
              <Lock className="w-10 h-10 text-emerald-600" />
            </div>
            
            {/* Feature name */}
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              {feature}
            </h3>
            
            {/* Description */}
            <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto">
              {description || `Sign in to unlock ${feature} and get the most out of EcobServe's sustainability tools.`}
            </p>
            
            {/* Benefits */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {[
                { title: 'Save Money', desc: 'Calculate real cost savings from sustainable choices' },
                { title: 'Track Progress', desc: 'Monitor your events\' environmental impact over time' },
                { title: 'Get Certified', desc: 'Earn green scores and shareable certificates' },
              ].map((benefit, i) => (
                <div key={i} className="p-4 bg-emerald-50/50 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-1">{benefit.title}</h4>
                  <p className="text-sm text-gray-600">{benefit.desc}</p>
                </div>
              ))}
            </div>
            
            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
              >
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-3 border-2 border-emerald-600 text-emerald-700 rounded-xl font-semibold hover:bg-emerald-50 transition-all"
              >
                Sign In
              </button>
            </div>
            
            <p className="mt-6 text-sm text-gray-500">
              Already have an account? <button onClick={() => navigate('/login')} className="text-emerald-600 font-medium hover:underline">Sign in here</button>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthGate;

