import React, { useState, useEffect } from 'react';
import { Check, Sparkles, Crown, Rocket, Zap, ArrowRight, Loader2, TrendingDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/ecobserve/Navbar';
import Footer from '@/components/ecobserve/Footer';
import DowngradeModal from '@/components/ecobserve/DowngradeModal';

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
  const { user, subscriptionTier, isAuthenticated, refreshSubscription } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [downgradeModal, setDowngradeModal] = useState<{ isOpen: boolean; plan: Plan | null }>({
    isOpen: false,
    plan: null,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      // Use relative API path (works with nginx proxy in production)
      const API_URL = import.meta.env.VITE_API_URL || '/api';

      const response = await fetch(`${API_URL}/payments/plans`);
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
      // 1. Explorer (Free) - Lead generation tier
      {
        id: '1',
        code: 'explorer',
        name: 'Explorer',
        description: 'Perfect for students and individuals testing sustainability',
        amount: 0,
        currency: 'ZAR',
        interval: 'monthly',
        maxEvents: 1,
        maxUsers: 1,
        features: [
          'Pre-Assessment Wizard',
          'Event Footprint Calculator (1 event/month)',
          'Basic carbon, water, waste calculations',
          'Simple sustainability score',
          'View calculation results',
        ],
      },
      // 2. Planner - Professional tier (R499/month, 6 events/year)
      {
        id: '2',
        code: 'planner',
        name: 'Planner',
        description: 'Perfect for professional event planners who need advanced sustainability tools and AI-powered recommendations',
        amount: 499,
        currency: 'ZAR',
        interval: 'monthly',
        maxEvents: 6,
        maxUsers: 3,
        features: [
          'Everything in Explorer',
          '6 event calculations per year',
          'Cost & Savings Calculator with ROI',
          'Save & manage events (My Events)',
          'Smart AI-powered recommendations (GPT)',
          'Green Score Card certificates',
          'Tax Incentive Calculator (SA)',
          'Carbon Offset Marketplace',
          'Supplier Carbon Tracking',
          'Benchmark Comparison',
          'Priority email support',
        ],
      },
      // 3. Impact Leader - Corporate tier
      {
        id: '3',
        code: 'impact_leader',
        name: 'Impact Leader',
        description: 'For large agencies and corporate teams',
        amount: 1999,
        currency: 'ZAR',
        interval: 'monthly',
        maxEvents: -1,
        maxUsers: -1,
        features: [
          'Everything in Planner',
          'Impact Dashboard with visual analytics',
          'Industry benchmarking',
          'Portfolio sustainability tracking',
          'UN SDG alignment reporting',
          'Unlimited team members',
          'Custom branded reports',
          'Advanced data export (CSV, Excel)',
          'Priority support',
          'Multi-location tracking',
          'Custom event categories',
        ],
      },
      // 4. Enterprise Custom - Contact sales
      {
        id: '4',
        code: 'enterprise',
        name: 'Enterprise',
        description: 'Custom solution for large organizations',
        amount: 0,
        currency: 'ZAR',
        interval: 'yearly',
        maxEvents: -1,
        maxUsers: -1,
        features: [
          'Everything in Impact Leader',
          'API integrations',
          'Dedicated onboarding & training',
          'Custom feature development',
          'SLA guarantees (99.9% uptime)',
          'On-premise deployment option',
          'Compliance certifications',
          'Carbon offset marketplace',
          'Quarterly business reviews',
          'Contact for pricing',
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

    // Check if this is a downgrade
    const tierHierarchy: Record<string, number> = {
      explorer: 0,
      planner: 1,
      impact: 2,
      enterprise: 3,
    };

    const currentTierLevel = tierHierarchy[subscriptionTier] || 0;
    const targetTierLevel = tierHierarchy[planCode === 'impact_leader' ? 'impact' : planCode] || 0;

    if (targetTierLevel < currentTierLevel) {
      // This is a downgrade - show modal
      const plan = plans.find(p => p.code === planCode);
      if (plan) {
        setDowngradeModal({ isOpen: true, plan });
      }
      return;
    }

    setProcessingPlan(planCode);

    try {
      const token = localStorage.getItem('accessToken');
      const API_URL = import.meta.env.VITE_API_URL || '/api';

      console.log('Initializing payment:', { planCode, email: user?.email });

      const response = await fetch(`${API_URL}/payments/initialize`, {
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

      console.log('Payment response status:', response.status);
      const data = await response.json();
      console.log('Payment response data:', data);

      if (data.success && data.data.authorizationUrl) {
        // Redirect to Paystack
        console.log('Redirecting to:', data.data.authorizationUrl);
        window.location.href = data.data.authorizationUrl;
      } else {
        console.error('Payment initialization failed:', data);
        alert(`Failed to initialize payment: ${data.error || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setProcessingPlan(null);
    }
  };

  const handleDowngrade = async (reason: string) => {
    if (!downgradeModal.plan) return;

    try {
      const token = localStorage.getItem('accessToken');
      const API_URL = import.meta.env.VITE_API_URL || '/api';

      const response = await fetch(`${API_URL}/payments/subscription/downgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          planCode: downgradeModal.plan.code,
          reason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Subscription downgraded successfully!');
        await refreshSubscription();
        setDowngradeModal({ isOpen: false, plan: null });
      } else {
        throw new Error(data.error || 'Failed to downgrade subscription');
      }
    } catch (error: any) {
      throw error;
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

  // Show all plans (no filtering needed since we don't have monthly/yearly variants)
  const filteredPlans = plans;

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

          {/* Current Subscription Banner */}
          {isAuthenticated && (
            <div className="mb-8 max-w-2xl mx-auto">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-90 mb-1">Your Current Plan</p>
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold">
                        {subscriptionTier === 'explorer' && 'Explorer'}
                        {subscriptionTier === 'planner' && 'Planner'}
                        {subscriptionTier === 'impact' && 'Impact Leader'}
                        {subscriptionTier === 'enterprise' && 'Enterprise'}
                      </h3>
                      {subscriptionTier === 'explorer' && <Sparkles className="w-6 h-6" />}
                      {subscriptionTier === 'planner' && <Zap className="w-6 h-6" />}
                      {subscriptionTier === 'impact' && <Crown className="w-6 h-6" />}
                      {subscriptionTier === 'enterprise' && <Rocket className="w-6 h-6" />}
                    </div>
                  </div>
                  {subscriptionTier !== 'enterprise' && (
                    <button
                      onClick={() => {
                        const nextTier = subscriptionTier === 'explorer' ? 'planner' : 'impact_leader';
                        const element = document.getElementById(`plan-${nextTier}`);
                        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className="px-4 py-2 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center gap-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Upgrade
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

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
                  id={`plan-${plan.code}`}
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
                      ) : (() => {
                          const tierHierarchy: Record<string, number> = {
                            explorer: 0,
                            planner: 1,
                            impact: 2,
                            enterprise: 3,
                          };
                          const currentTierLevel = tierHierarchy[subscriptionTier] || 0;
                          const targetTierLevel = tierHierarchy[plan.code === 'impact_leader' ? 'impact' : plan.code] || 0;
                          const isDowngrade = targetTierLevel < currentTierLevel;

                          return isDowngrade ? (
                            <>
                              <TrendingDown className="w-4 h-4" />
                              Downgrade
                            </>
                          ) : (
                            <>
                              {plan.amount === 0 ? 'Get Started' : 'Upgrade Now'}
                              <ArrowRight className="w-4 h-4" />
                            </>
                          );
                        })()
                      }
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

      {/* Downgrade Modal */}
      {downgradeModal.plan && (
        <DowngradeModal
          isOpen={downgradeModal.isOpen}
          onClose={() => setDowngradeModal({ isOpen: false, plan: null })}
          currentTier={subscriptionTier}
          targetPlan={downgradeModal.plan}
          onConfirm={handleDowngrade}
        />
      )}
    </div>
  );
};

export default Pricing;

