import React, { useEffect, useState } from 'react';
import { AlertCircle, TrendingUp, Users, Calendar } from 'lucide-react';
import { subscriptionApi, SubscriptionUsage } from '../../lib/api/subscription';
import { analyticsApi } from '../../lib/api/analytics';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const SubscriptionUsageBadge: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [usage, setUsage] = useState<SubscriptionUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchUsage = async () => {
      const result = await subscriptionApi.getUsage();
      if (result.data) {
        setUsage(result.data);
      }
      setLoading(false);
    };

    fetchUsage();
  }, [isAuthenticated]);

  if (!isAuthenticated || loading || !usage) {
    return null;
  }

  const { subscription, usage: usageData } = usage;
  const { events } = usageData;

  // Don't show for unlimited plans
  if (events.unlimited) {
    return null;
  }

  // Determine badge color based on usage
  const getStatusColor = () => {
    if (events.limitReached) return 'bg-red-100 text-red-800 border-red-300';
    if (events.approachingLimit) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  const getProgressColor = () => {
    if (events.limitReached) return 'bg-red-500';
    if (events.approachingLimit) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleUpgradeClick = (reason: 'limit_reached' | 'approaching_limit') => {
    // Track analytics event
    analyticsApi.trackUpgradeClick(subscription.planCode, reason);
    // Navigate to pricing
    navigate('/pricing');
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${getStatusColor()} transition-all duration-200`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4" />
            <h3 className="font-semibold text-sm">
              {subscription.planName} Plan
            </h3>
          </div>
          
          <div className="space-y-2">
            {/* Events Usage */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium">Events this month</span>
                <span className="font-bold">
                  {events.current}/{events.limit}
                </span>
              </div>
              <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${getProgressColor()} transition-all duration-300`}
                  style={{ width: `${Math.min(events.percentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Warning Messages */}
            {events.limitReached && (
              <div className="flex items-start gap-2 mt-3 p-2 bg-white/50 rounded">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold">Limit reached!</p>
                  <p className="mt-1">
                    You've used all {events.limit} events for this month.
                  </p>
                  <button
                    onClick={() => handleUpgradeClick('limit_reached')}
                    className="mt-2 text-xs font-semibold underline hover:no-underline flex items-center gap-1"
                  >
                    <TrendingUp className="w-3 h-3" />
                    Upgrade to create more events
                  </button>
                </div>
              </div>
            )}

            {events.approachingLimit && !events.limitReached && (
              <div className="flex items-start gap-2 mt-3 p-2 bg-white/50 rounded">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold">Approaching limit</p>
                  <p className="mt-1">
                    {events.remaining} event{events.remaining !== 1 ? 's' : ''} remaining this month.
                  </p>
                  <button
                    onClick={() => handleUpgradeClick('approaching_limit')}
                    className="mt-2 text-xs font-semibold underline hover:no-underline flex items-center gap-1"
                  >
                    <TrendingUp className="w-3 h-3" />
                    View upgrade options
                  </button>
                </div>
              </div>
            )}

            {!events.approachingLimit && !events.limitReached && (
              <p className="text-xs mt-2 opacity-75">
                {events.remaining} event{events.remaining !== 1 ? 's' : ''} remaining
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Reset Date */}
      <div className="mt-3 pt-3 border-t border-current/20">
        <p className="text-xs opacity-75">
          Resets on {new Date(usage.resetDate).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          })}
        </p>
      </div>
    </div>
  );
};

