import React, { useState, useEffect } from 'react';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';
import { useAuth } from '../../contexts/AuthContext';
import { subscriptionApi } from '../../lib/api/subscription';

/**
 * Simplified onboarding tour for Explorer (Free) tier users
 * Focuses on: Calculator, Resources, and Upgrade path
 */
export const ExplorerOnboarding: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [run, setRun] = useState(false);
  const [isExplorerUser, setIsExplorerUser] = useState(false);

  useEffect(() => {
    const checkAndStartTour = async () => {
      if (!isAuthenticated) return;

      // Check if user has completed onboarding
      const completed = localStorage.getItem('explorer_onboarding_completed');
      if (completed) return;

      // Check if user is on Explorer plan
      const result = await subscriptionApi.getUsage();
      if (result.data?.subscription.planCode === 'explorer') {
        setIsExplorerUser(true);
        // Start tour after 1 second delay
        setTimeout(() => setRun(true), 1000);
      }
    };

    checkAndStartTour();
  }, [isAuthenticated]);

  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="text-center">
          <h3 className="text-xl font-bold text-emerald-700 mb-2">
            Welcome to EcobServe Explorer! 🌱
          </h3>
          <p className="text-gray-600 mb-3">
            You're on the <strong>free Explorer plan</strong>. Let's show you what you can do!
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-left">
            <p className="font-semibold text-green-800 mb-1">Your Explorer Plan includes:</p>
            <ul className="text-green-700 space-y-1 text-xs">
              <li>✅ 3 events per month</li>
              <li>✅ Carbon footprint calculator</li>
              <li>✅ Sustainability scoring</li>
              <li>✅ Basic recommendations</li>
              <li>✅ Resource library access</li>
            </ul>
          </div>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="calculator"]',
      content: (
        <div>
          <h4 className="font-semibold text-emerald-700 mb-2">Event Footprint Calculator</h4>
          <p className="text-sm text-gray-600 mb-2">
            This is your main tool! Calculate the environmental impact of your events.
          </p>
          <p className="text-xs text-gray-500">
            Enter details about venue, food & beverage, transport, and materials to get instant sustainability metrics.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="resources"]',
      content: (
        <div>
          <h4 className="font-semibold text-emerald-700 mb-2">Resource Library</h4>
          <p className="text-sm text-gray-600 mb-2">
            Access guides, templates, and best practices for sustainable events.
          </p>
          <p className="text-xs text-gray-500">
            Learn from industry experts and get actionable tips.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="faq"]',
      content: (
        <div>
          <h4 className="font-semibold text-emerald-700 mb-2">FAQ & Support</h4>
          <p className="text-sm text-gray-600">
            Have questions? Check our comprehensive FAQ section for answers.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: 'body',
      content: (
        <div className="text-center">
          <h3 className="text-xl font-bold text-emerald-700 mb-2">
            Ready to Get Started! 🚀
          </h3>
          <p className="text-gray-600 mb-3">
            You can create up to <strong>3 events this month</strong> with your Explorer plan.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <p className="font-semibold text-blue-800 mb-1">💡 Want more?</p>
            <p className="text-blue-700 text-xs">
              Upgrade to <strong>Planner</strong> for unlimited events, cost savings calculator, 
              AI recommendations, and more!
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Click "Pricing" in the menu to see all plans
          </p>
        </div>
      ),
      placement: 'center',
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      localStorage.setItem('explorer_onboarding_completed', 'true');
    }
  };

  if (!isAuthenticated || !isExplorerUser) {
    return null;
  }

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#10b981',
          zIndex: 10000,
        },
        buttonNext: {
          backgroundColor: '#10b981',
          borderRadius: '6px',
          padding: '8px 16px',
        },
        buttonBack: {
          color: '#6b7280',
        },
        buttonSkip: {
          color: '#9ca3af',
        },
      }}
    />
  );
};

