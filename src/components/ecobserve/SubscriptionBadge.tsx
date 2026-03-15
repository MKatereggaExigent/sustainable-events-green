import React from 'react';
import { Sparkles, Zap, Crown, Rocket } from 'lucide-react';

interface SubscriptionBadgeProps {
  tier: 'explorer' | 'planner' | 'impact' | 'enterprise';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({ 
  tier, 
  size = 'md',
  showIcon = true 
}) => {
  const config = {
    explorer: {
      label: 'Explorer',
      icon: Sparkles,
      gradient: 'from-gray-500 to-gray-600',
      bg: 'bg-gray-100',
      text: 'text-gray-700',
    },
    planner: {
      label: 'Planner',
      icon: Zap,
      gradient: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
    },
    impact: {
      label: 'Impact Leader',
      icon: Crown,
      gradient: 'from-purple-500 to-pink-500',
      bg: 'bg-purple-100',
      text: 'text-purple-700',
    },
    enterprise: {
      label: 'Enterprise',
      icon: Rocket,
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-100',
      text: 'text-blue-700',
    },
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const tierConfig = config[tier];
  const Icon = tierConfig.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 ${tierConfig.bg} ${tierConfig.text} rounded-full font-semibold ${sizeClasses[size]}`}>
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{tierConfig.label}</span>
    </div>
  );
};

export default SubscriptionBadge;

