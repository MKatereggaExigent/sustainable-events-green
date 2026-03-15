import React, { useState, useEffect } from 'react';
import { Check, Sparkles, Crown, Rocket, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/ecobserve/Navbar';
import Footer from '@/components/ecobserve/Footer';

interface Plan {
  id: string;
  code: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  maxEvents: number;
  maxUsers: number;
}

const Pricing: React.FC = () => {
  const { user, subscriptionTier, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      // Determine API URL based on current domain
      const apiUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:8035'
        : `${window.location.protocol}//${window.location.hostname}`;

      const response = await fetch(`${apiUrl}/api/payments/plans`);
      const data = await response.json();
      if (data.success && data.data && data.data.length > 0) {
        setPlans(data.data);
      } else {
        // Fallback to hardcoded plans if API fails
        setPlans(getFallbackPlans());
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      // Use fallback plans
      setPlans(getFallbackPlans());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackPlans = (): Plan[] => {
    return [
      {
        id: '1',
        code: 'explorer',
        name: 'Explorer',
        description: 'Perfect for individuals and students exploring sustainability',
        amount: 0,
        currency: 'ZAR',
        interval: 'monthly',
        maxEvents: 3,
        maxUsers: 1,
        features: [
          'Event Footprint Calculator (3 events/month)',
          'Basic carbon, water, waste calculations',
          'Simple sustainability score',
          'Basic recommendations',
          'FAQ & Resources access',
        ],
      },
      {
        id: '2',
        code: 'planner_monthly',
        name: 'Planner',
        description: 'For professional event planners and agencies',
        amount: 499,
        currency: 'ZAR',
        interval: 'monthly',
        maxEvents: -1,
        maxUsers: 5,
        features: [
          'Unlimited event calculations',
          'Cost & Savings Calculator',
          'My Events (save & manage history)',
          'Smart AI Recommendations',
          'Green Score Card (shareable)',
          'Email support',
        ],
      },
      {
        id: '3',
        code: 'planner_yearly',
        name: 'Planner',
        description: 'For professional event planners and agencies',
        amount: 4990,
        currency: 'ZAR',
        interval: 'yearly',
        maxEvents: -1,
        maxUsers: 5,
        features: [
          'Unlimited event calculations',
          'Cost & Savings Calculator',
          'My Events (save & manage history)',
          'Smart AI Recommendations',
          'Green Score Card (shareable)',
          'Email support',
          'Save R1,000 annually',
        ],
      },
      {
        id: '4',
        code: 'impact_monthly',
        name: 'Impact Leader',
        description: 'For venues and organizations managing multiple events',
        amount: 1999,
        currency: 'ZAR',
        interval: 'monthly',
        maxEvents: -1,
        maxUsers: 20,
        features: [
          'Everything in Planner, plus:',
          'Impact Dashboard with analytics',
          'Team collaboration (up to 20 users)',
          'Advanced reporting & exports',
          'API access',
          'Priority support',
        ],
      },
      {
        id: '5',
        code: 'impact_yearly',
        name: 'Impact Leader',
        description: 'For venues and organizations managing multiple events',
        amount: 19990,
        currency: 'ZAR',
        interval: 'yearly',
        maxEvents: -1,
        maxUsers: 20,
        features: [
          'Everything in Planner, plus:',
          'Impact Dashboard with analytics',
          'Team collaboration (up to 20 users)',
          'Advanced reporting & exports',
          'API access',
          'Priority support',
          'Save R4,000 annually',
        ],
      },
      {
        id: '6',
        code: 'enterprise',
        name: 'Enterprise',
        description: 'Custom solutions for large organizations',
        amount: 0,
        currency: 'ZAR',
        interval: 'monthly',
        maxEvents: -1,
        maxUsers: -1,
        features: [
          'Everything in Impact Leader, plus:',
          'Unlimited users',
          'Custom integrations',
          'Dedicated account manager',
          'SLA guarantees',
          'Custom training & onboarding',
          'White-label options',
        ],
      },
    ];
  };

  const handleSelectPlan = async (planCode: string) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/pricing');
      return;
    }

    if (planCode === 'explorer') {
      // Free plan - no payment needed
      return;
    }

    if (planCode === 'enterprise') {
      // Contact sales
      window.location.href = 'mailto:sales@ecobserve.com?subject=Enterprise Plan Inquiry';
      return;
    }

    setProcessingPlan(planCode);

    try {
      const token = localStorage.getItem('access_token');
      // Determine API URL based on current domain
      const apiUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:8035'
        : `${window.location.protocol}//${window.location.hostname}`;

      const response = await fetch(`${apiUrl}/api/payments/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          planCode,
          email: user?.email,
        }),
      });

      const data = await response.json();

      if (data.success && data.data.authorizationUrl) {
        // Redirect to Paystack
        window.location.href = data.data.authorizationUrl;
      } else {
        alert('Failed to initialize payment. Please try again.');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setProcessingPlan(null);
    }
  };

  const getPlanIcon = (code: string) => {
    if (code.includes('explorer')) return Sparkles;
    if (code.includes('planner')) return Zap;
    if (code.includes('impact')) return Crown;
    return Rocket;
  };

  const getPlanColor = (code: string) => {
    if (code.includes('explorer')) return 'from-gray-500 to-gray-600';
    if (code.includes('planner')) return 'from-emerald-500 to-teal-500';
    if (code.includes('impact')) return 'from-purple-500 to-pink-500';
    return 'from-blue-500 to-cyan-500';
  };

  const isCurrentPlan = (code: string) => {
    if (code === 'explorer' && subscriptionTier === 'explorer') return true;
    if (code.includes('planner') && subscriptionTier === 'planner') return true;
    if (code.includes('impact') && subscriptionTier === 'impact') return true;
    if (code === 'enterprise' && subscriptionTier === 'enterprise') return true;
    return false;
  };

  const filteredPlans = plans.filter(plan => {
    if (plan.code === 'explorer' || plan.code === 'enterprise') return true;
    return plan.interval === billingCycle;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <Navbar onNavigate={(section) => navigate(`/#${section}`)} />
      
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">
              Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">Sustainability</span> Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start free, upgrade as you grow. All plans include our core carbon calculator.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-full p-1 shadow-md inline-flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-full transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPlans.map((plan) => {
              const Icon = getPlanIcon(plan.code);
              const isPopular = plan.code.includes('planner');
              const isCurrent = isCurrentPlan(plan.code);
              const isProcessing = processingPlan === plan.code;

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all hover:shadow-2xl ${
                    isPopular ? 'border-emerald-500 scale-105' : 'border-gray-200'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {isCurrent && (
                    <div className="absolute -top-4 right-4">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Current Plan
                      </span>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getPlanColor(plan.code)} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Plan Name */}
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

                    {/* Price */}
                    <div className="mb-6">
                      {plan.code === 'enterprise' ? (
                        <>
                          <div className="text-4xl font-bold">Custom</div>
                          <div className="text-gray-500 text-sm">Contact us for pricing</div>
                        </>
                      ) : plan.amount === 0 ? (
                        <div className="text-4xl font-bold">Free</div>
                      ) : (
                        <>
                          <div className="text-4xl font-bold">
                            R{plan.amount.toLocaleString()}
                          </div>
                          <div className="text-gray-500 text-sm">
                            per {plan.interval === 'yearly' ? 'year' : 'month'}
                          </div>
                          {plan.interval === 'yearly' && (
                            <div className="text-emerald-600 text-xs font-semibold mt-1">
                              Save R{plan.code.includes('planner') ? '1,000' : '4,000'} annually
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleSelectPlan(plan.code)}
                      disabled={isCurrent || isProcessing}
                      className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                        isCurrent
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : isPopular
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : isCurrent ? (
                        'Current Plan'
                      ) : plan.code === 'enterprise' ? (
                        <>
                          Contact Sales
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          {plan.amount === 0 ? 'Get Started' : 'Upgrade Now'}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Features */}
                    <div className="mt-6 space-y-3">
                      {plan.features.slice(0, 6).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                      {plan.features.length > 6 && (
                        <div className="text-sm text-gray-500 italic">
                          +{plan.features.length - 6} more features
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 mb-8">
              Have questions? Check out our{' '}
              <a href="/faq" className="text-emerald-600 hover:underline">
                comprehensive FAQ page
              </a>
              {' '}or contact us at{' '}
              <a href="mailto:support@ecobserve.com" className="text-emerald-600 hover:underline">
                support@ecobserve.com
              </a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Pricing;

