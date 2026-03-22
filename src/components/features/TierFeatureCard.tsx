import React from 'react';
import { Lock, Check, Crown, Sparkles, Zap, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface TierFeatureCardProps {
  title: string;
  description: string;
  requiredTier: 'explorer' | 'planner' | 'impact' | 'enterprise';
  icon?: React.ElementType;
  features?: string[];
}

const TierFeatureCard: React.FC<TierFeatureCardProps> = ({
  title,
  description,
  requiredTier,
  icon: Icon,
  features = [],
}) => {
  const { subscriptionTier, canAccessFeature } = useAuth();
  const navigate = useNavigate();

  const hasAccess = canAccessFeature(requiredTier);

  const tierConfig = {
    explorer: {
      name: 'Explorer',
      icon: Sparkles,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
    },
    planner: {
      name: 'Planner',
      icon: Zap,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
    impact: {
      name: 'Impact Leader',
      icon: Crown,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    enterprise: {
      name: 'Enterprise',
      icon: Rocket,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
  };

  const config = tierConfig[requiredTier];
  const TierIcon = config.icon;
  const FeatureIcon = Icon || TierIcon;

  return (
    <div
      className={`relative bg-white rounded-2xl border-2 ${
        hasAccess ? config.borderColor : 'border-gray-200'
      } p-6 transition-all hover:shadow-lg ${!hasAccess ? 'opacity-75' : ''}`}
    >
      {/* Tier Badge */}
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full ${config.bgColor} flex items-center gap-1.5`}>
        <TierIcon className="w-3.5 h-3.5" />
        <span className="text-xs font-semibold">{config.name}</span>
      </div>

      {/* Lock Icon for inaccessible features */}
      {!hasAccess && (
        <div className="absolute top-4 left-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <Lock className="w-4 h-4 text-gray-400" />
        </div>
      )}

      {/* Feature Icon */}
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center mb-4 ${!hasAccess ? 'mt-8' : ''}`}>
        <FeatureIcon className="w-7 h-7 text-white" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4">{description}</p>

      {/* Features List */}
      {features.length > 0 && (
        <ul className="space-y-2 mb-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}

      {/* CTA Button */}
      {!hasAccess && (
        <button
          onClick={() => navigate('/pricing')}
          className={`w-full mt-4 px-4 py-2.5 bg-gradient-to-r ${config.color} text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2`}
        >
          <Crown className="w-4 h-4" />
          Upgrade to {config.name}
        </button>
      )}

      {hasAccess && (
        <div className="mt-4 px-4 py-2 bg-emerald-50 rounded-lg flex items-center gap-2 text-emerald-700">
          <Check className="w-4 h-4" />
          <span className="text-sm font-semibold">Available in your plan</span>
        </div>
      )}
    </div>
  );
};

export default TierFeatureCard;

