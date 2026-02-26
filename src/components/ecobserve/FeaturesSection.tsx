import React from 'react';
import {
  Calculator, BarChart3, Lightbulb, Share2, TreePine, Shield,
  Zap, Globe, Users, Leaf, Eye, Heart
} from 'lucide-react';
import BrandLogo from './BrandLogo';

interface FeaturesSectionProps {
  onNavigate: (section: string) => void;
}

const features = [
  {
    icon: Calculator,
    title: 'Carbon Calculator',
    description: 'Input venue, F&B, transport, and materials to get instant carbon, water, and waste footprint calculations.',
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    section: 'calculator',
  },
  {
    icon: BarChart3,
    title: 'Impact Dashboard',
    description: 'Visualize your environmental impact with interactive charts, industry comparisons, and trend analysis.',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    section: 'dashboard',
  },
  {
    icon: Lightbulb,
    title: 'Smart Alternatives',
    description: 'Get personalized sustainable alternatives with cost-impact trade-offs for every category.',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    section: 'alternatives',
  },
  {
    icon: Share2,
    title: 'Green Score Cards',
    description: 'Generate shareable green score certificates with custom branding for social media and stakeholders.',
    color: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-50',
    section: 'score',
  },
  {
    icon: TreePine,
    title: 'Carbon Offsetting',
    description: 'Connect with verified carbon offset programs and track your contribution to reforestation projects.',
    color: 'from-green-500 to-emerald-500',
    bg: 'bg-green-50',
    section: 'portfolio',
  },
  {
    icon: Shield,
    title: 'Certifications',
    description: 'Earn sustainability certifications and badges to showcase your commitment to green event planning.',
    color: 'from-indigo-500 to-blue-500',
    bg: 'bg-indigo-50',
    section: 'resources',
  },
];

const stats = [
  { icon: Globe, value: '50+', label: 'Countries' },
  { icon: Users, value: '4,800+', label: 'Active Planners' },
  { icon: TreePine, value: '12K+', label: 'Trees Planted' },
  { icon: Zap, value: '8.2M', label: 'kg CO₂ Offset' },
];

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onNavigate }) => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            Platform Features
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Sustainable Events
            </span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            From carbon calculation to social sharing, Eco<span className="italic font-light text-blue-400">b</span>Serve provides a complete toolkit for environmentally conscious event planning.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <button
                key={i}
                onClick={() => onNavigate(feature.section)}
                className="group text-left bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300"
              >
                <div className={`w-12 h-12 ${feature.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 bg-gradient-to-r ${feature.color} bg-clip-text`} style={{ color: feature.color.includes('emerald') ? '#10b981' : feature.color.includes('blue') ? '#3b82f6' : feature.color.includes('amber') ? '#f59e0b' : feature.color.includes('purple') ? '#8b5cf6' : feature.color.includes('green') ? '#22c55e' : '#6366f1' }} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* How it works */}
        <div className="bg-gradient-to-br from-gray-50 to-emerald-50/30 rounded-3xl p-8 sm:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">How It Works</h3>
            <p className="text-gray-600">Four simple steps to a sustainable event</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Input Details', desc: 'Enter your venue, catering, transport, and material choices', color: 'bg-emerald-500' },
              { step: '02', title: 'Get Insights', desc: 'See real-time carbon, water, and waste footprint calculations', color: 'bg-blue-500' },
              { step: '03', title: 'Apply Changes', desc: 'Choose from personalized sustainable alternatives', color: 'bg-amber-500' },
              { step: '04', title: 'Share & Certify', desc: 'Generate shareable green score cards and certificates', color: 'bg-purple-500' },
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-gray-300 to-transparent" />
                )}
                <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg shadow-lg`}>
                  {item.step}
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="text-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <Icon className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Core Values Banner */}
        <div className="mt-20 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 rounded-3xl p-8 md:p-12 text-white">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-3">
              Our Core Values: The <BrandLogo size="lg" variant="white" /> Promise
            </h3>
            <p className="text-emerald-100 max-w-2xl mx-auto">
              Every feature we build is guided by three principles that define who we are.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-lg mb-1">
                <span className="text-emerald-200">Eco</span>-Friendly
              </h4>
              <p className="text-emerald-100 text-sm">
                Genuine commitment to environmental sustainability in everything we do.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-lg mb-1">
                O<span className="italic font-light text-blue-300">b</span>servability
              </h4>
              <p className="text-blue-100 text-sm">
                Complete transparency and real-time insights into your environmental impact.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-lg mb-1">
                <span className="text-teal-200">Serve</span> with Care
              </h4>
              <p className="text-teal-100 text-sm">
                Personalized service delivering authentic care and tailored value for every client.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
