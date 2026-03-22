import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Sparkles, ArrowRight, Crown, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import SubscriptionBadge from './SubscriptionBadge';

interface AuthGateProps {
  children: React.ReactNode;
  feature: string;
  description?: string;
  requiredTier?: 'explorer' | 'planner' | 'impact' | 'enterprise';
}

/**
 * AuthGate wraps premium features and shows appropriate CTAs based on:
 * 1. Unauthenticated users -> Login/Register
 * 2. Authenticated but insufficient tier -> Upgrade
 * 3. Sufficient tier -> Show content
 */
const AuthGate: React.FC<AuthGateProps> = ({
  children,
  feature,
  description,
  requiredTier = 'planner' // Default to planner tier
}) => {
  const { isAuthenticated, isLoading, subscriptionTier, canAccessFeature } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="py-16 px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  // Check if user has access to this feature
  if (isAuthenticated && canAccessFeature(requiredTier)) {
    return <>{children}</>;
  }

  // Get tier information for display
  const tierInfo = {
    explorer: { name: 'Explorer', price: 'Free', icon: Sparkles, color: 'emerald' },
    planner: { name: 'Planner', price: 'R499/mo', icon: Zap, color: 'emerald' },
    impact: { name: 'Impact Leader', price: 'R1,999/mo', icon: Crown, color: 'purple' },
    enterprise: { name: 'Enterprise', price: 'Custom', icon: Sparkles, color: 'blue' },
  };

  const requiredTierInfo = tierInfo[requiredTier as keyof typeof tierInfo] || tierInfo.planner;
  const TierIcon = requiredTierInfo.icon;

  // Show upgrade CTA for authenticated users with insufficient tier
  if (isAuthenticated) {
    return (
      <section className="py-16 px-4 bg-gradient-to-br from-purple-50 to-pink-50/30">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden">
            {/* Upgrade badge */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 flex items-center justify-center gap-2">
              <Crown className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">Upgrade Required</span>
            </div>

            <div className="p-8 md:p-12 text-center">
              {/* Current tier badge */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Your current plan:</p>
                <SubscriptionBadge tier={subscriptionTier} size="md" />
              </div>

              {/* Lock icon */}
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                <TierIcon className="w-10 h-10 text-purple-600" />
              </div>

              {/* Feature name */}
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                {feature}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-lg mb-6 max-w-xl mx-auto">
                {description || `This feature requires the ${requiredTierInfo.name} plan or higher.`}
              </p>

              {/* Required tier info */}
              <div className="inline-block bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-8">
                <p className="text-sm text-gray-600 mb-2">Available on:</p>
                <div className="flex items-center gap-3">
                  <TierIcon className="w-6 h-6 text-purple-600" />
                  <div className="text-left">
                    <p className="font-bold text-xl text-gray-900">{requiredTierInfo.name}</p>
                    <p className="text-sm text-purple-600">{requiredTierInfo.price}</p>
                  </div>
                </div>
              </div>

              {/* CTA button */}
              <button
                onClick={() => navigate('/pricing')}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-200 flex items-center justify-center gap-2 mx-auto"
              >
                <Crown className="w-5 h-5" />
                Upgrade Now
                <ArrowRight className="w-5 h-5" />
              </button>

              <p className="mt-6 text-sm text-gray-500">
                View all plans and features on our <button onClick={() => navigate('/pricing')} className="text-purple-600 font-medium hover:underline">pricing page</button>
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show login/register CTA for unauthenticated users
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-gray-50 to-emerald-50/30">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
          {/* Tier badge */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 flex items-center justify-center gap-2">
            <TierIcon className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">{requiredTierInfo.name} Tier Feature</span>
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
              {description || (<>Sign in to unlock {feature} and get the most out of Eco<span className="italic font-light text-blue-400">b</span>Serve's sustainability tools.</>)}
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

