import React from 'react';
import { 
  Calculator, 
  BarChart3, 
  Lightbulb, 
  Share2, 
  DollarSign,
  Award,
  TrendingUp,
  Users,
  FileText,
  Globe,
  Zap,
  Crown,
  Rocket,
  Target,
  PieChart,
  Building2,
  Shield
} from 'lucide-react';
import TierFeatureCard from './TierFeatureCard';

const AllFeaturesShowcase: React.FC = () => {
  const explorerFeatures = [
    {
      title: 'Event Footprint Calculator',
      description: 'Calculate carbon, water, and waste footprint for your events with our easy-to-use calculator.',
      icon: Calculator,
      features: ['1 event per month', 'Basic carbon calculations', 'Simple sustainability score'],
    },
  ];

  const plannerFeatures = [
    {
      title: 'Cost & Savings Calculator',
      description: 'Analyze cost implications and ROI of sustainable choices for your events.',
      icon: DollarSign,
      features: ['6 events per year', 'ROI analysis', 'Cost-benefit comparisons'],
    },
    {
      title: 'Smart AI Recommendations',
      description: 'Get GPT-powered personalized recommendations to reduce your event\'s environmental impact.',
      icon: Lightbulb,
      features: ['AI-powered suggestions', 'Alternative options', 'Impact predictions'],
    },
    {
      title: 'Green Score Certificates',
      description: 'Generate professional sustainability certificates to showcase your commitment.',
      icon: Award,
      features: ['PDF certificates', 'Custom branding', 'Social media sharing'],
    },
    {
      title: 'Tax Incentive Calculator',
      description: 'Calculate South African tax benefits for your sustainable event investments.',
      icon: FileText,
      features: ['SA tax calculations', 'Incentive tracking', 'Compliance reports'],
    },
    {
      title: 'Carbon Offset Marketplace',
      description: 'Browse and purchase verified carbon offsets from trusted South African projects.',
      icon: Globe,
      features: ['Verified projects', 'Purchase tracking', 'Impact certificates'],
    },
    {
      title: 'Supplier Carbon Tracking',
      description: 'Find and track eco-friendly suppliers with sustainability ratings.',
      icon: Building2,
      features: ['Supplier database', 'Carbon scores', 'Certification tracking'],
    },
  ];

  const impactLeaderFeatures = [
    {
      title: 'Impact Dashboard',
      description: 'Comprehensive visual analytics dashboard with trends, benchmarks, and performance metrics.',
      icon: BarChart3,
      features: ['Visual analytics', 'Trend analysis', 'Custom date ranges'],
    },
    {
      title: 'Industry Benchmarking',
      description: 'Compare your sustainability performance against industry standards and competitors.',
      icon: TrendingUp,
      features: ['Industry comparisons', 'Performance rankings', 'Best practice insights'],
    },
    {
      title: 'Portfolio Tracking',
      description: 'Track sustainability metrics across multiple events and locations.',
      icon: PieChart,
      features: ['Multi-event tracking', 'Portfolio analytics', 'Aggregate reporting'],
    },
    {
      title: 'UN SDG Alignment',
      description: 'Align your events with UN Sustainable Development Goals and generate compliance reports.',
      icon: Target,
      features: ['SDG mapping', 'Alignment scores', 'Impact reporting'],
    },
    {
      title: 'Custom Branded Reports',
      description: 'Generate professional reports with your company branding for stakeholders.',
      icon: FileText,
      features: ['Custom branding', 'Executive summaries', 'PDF/Excel export'],
    },
    {
      title: 'Unlimited Team Members',
      description: 'Collaborate with unlimited team members across your organization.',
      icon: Users,
      features: ['Unlimited users', 'Role-based access', 'Team collaboration'],
    },
  ];

  const enterpriseFeatures = [
    {
      title: 'API Integrations',
      description: 'Integrate EcobServe with your existing systems via our comprehensive API.',
      icon: Zap,
      features: ['REST API access', 'Webhooks', 'Custom integrations'],
    },
    {
      title: 'Dedicated Onboarding',
      description: 'Get personalized onboarding and training for your entire organization.',
      icon: Users,
      features: ['Personal onboarding', 'Team training', 'Best practices workshop'],
    },
    {
      title: 'Custom Feature Development',
      description: 'Request custom features tailored to your organization\'s specific needs.',
      icon: Rocket,
      features: ['Custom development', 'Priority roadmap', 'Dedicated support'],
    },
    {
      title: 'SLA Guarantees',
      description: '99.9% uptime guarantee with priority support and dedicated account manager.',
      icon: Shield,
      features: ['99.9% uptime SLA', '24/7 support', 'Dedicated account manager'],
    },
  ];

  return (
    <div className="py-16 bg-gradient-to-br from-gray-50 to-emerald-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            All Features by <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Subscription Tier</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Explore all the features available across our subscription tiers. Upgrade anytime to unlock more powerful tools.
          </p>
        </div>

        {/* Explorer Features */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-gray-600" />
            </span>
            Explorer Tier (Free)
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {explorerFeatures.map((feature, index) => (
              <TierFeatureCard key={index} {...feature} requiredTier="explorer" />
            ))}
          </div>
        </div>

        {/* Planner Features */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-600" />
            </span>
            Planner Tier (R499/month)
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plannerFeatures.map((feature, index) => (
              <TierFeatureCard key={index} {...feature} requiredTier="planner" />
            ))}
          </div>
        </div>

        {/* Impact Leader Features */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-purple-600" />
            </span>
            Impact Leader Tier (R1,999/month)
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {impactLeaderFeatures.map((feature, index) => (
              <TierFeatureCard key={index} {...feature} requiredTier="impact" />
            ))}
          </div>
        </div>

        {/* Enterprise Features */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Rocket className="w-5 h-5 text-blue-600" />
            </span>
            Enterprise Tier (Custom Pricing)
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enterpriseFeatures.map((feature, index) => (
              <TierFeatureCard key={index} {...feature} requiredTier="enterprise" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllFeaturesShowcase;

