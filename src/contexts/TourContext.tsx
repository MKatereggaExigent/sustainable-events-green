import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import Joyride, { Step, CallBackProps, STATUS, EVENTS, ACTIONS } from 'react-joyride';
import { useAuth } from './AuthContext';
import { tourApi, TourPreferences, isAuthenticated } from '../services/api';

interface TourContextType {
  isRunning: boolean;
  startTour: () => void;
  stopTour: () => void;
  restartTour: () => void;
  tourEnabled: boolean;
  setTourEnabled: (enabled: boolean) => void;
  hasCompletedTour: boolean;
  currentStep: number;
  totalSteps: number;
}

const TourContext = createContext<TourContextType | null>(null);

// Local storage key for anonymous users
const TOUR_LOCAL_KEY = 'ecobserve_tour_preferences';

interface LocalTourPrefs {
  hasCompletedTour: boolean;
  tourEnabled: boolean;
  timesSkipped: number;
}

function getLocalTourPrefs(): LocalTourPrefs {
  try {
    const stored = localStorage.getItem(TOUR_LOCAL_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return { hasCompletedTour: false, tourEnabled: true, timesSkipped: 0 };
}

function setLocalTourPrefs(prefs: Partial<LocalTourPrefs>) {
  const current = getLocalTourPrefs();
  localStorage.setItem(TOUR_LOCAL_KEY, JSON.stringify({ ...current, ...prefs }));
}

// Tour steps definition - Comprehensive tour covering all features
const tourSteps: Step[] = [
  // Welcome & Introduction
  {
    target: 'body',
    content: (
      <div className="text-center">
        <h3 className="text-xl font-bold text-emerald-700 mb-2">Welcome to Eco<span className="italic font-light text-blue-400">b</span>Serve! 🌿</h3>
        <p className="text-gray-600 mb-3">
          Let us show you how to measure and reduce your event's environmental impact.
          This comprehensive tour will guide you through all our features.
        </p>
        <div className="flex justify-center gap-2 text-xs">
          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">🌱 Eco-Friendly</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">📊 Observability</span>
          <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full">💚 Service</span>
        </div>
        <p className="text-xs text-gray-500 mt-3">You can skip or stop the tour at any time</p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },

  // Navigation
  {
    target: '[data-tour="navbar-logo"]',
    content: (
      <div>
        <h4 className="font-semibold text-emerald-700 mb-1">Eco<span className="italic font-light text-blue-400">b</span>Serve Logo</h4>
        <p className="text-sm text-gray-600">Click here anytime to return to the home page and see all features at a glance.</p>
      </div>
    ),
    placement: 'bottom',
  },

  // Home Page Features
  {
    target: '[data-tour="features-section"]',
    content: (
      <div>
        <h4 className="font-semibold text-emerald-700 mb-1">Core Features</h4>
        <p className="text-sm text-gray-600">
          Explore our six main features: Carbon Calculator, Impact Dashboard, Smart Alternatives,
          Green Score Cards, Carbon Offsetting, and Certifications.
        </p>
      </div>
    ),
    placement: 'top',
  },

  {
    target: '[data-tour="hero-cta"]',
    content: (
      <div>
        <h4 className="font-semibold text-emerald-700 mb-1">Start Calculating</h4>
        <p className="text-sm text-gray-600">
          Click here to begin calculating your event's environmental footprint.
          You'll input details about venue, catering, transport, and materials.
        </p>
      </div>
    ),
    placement: 'top',
  },

  // Event Footprint Calculator
  {
    target: '[data-tour="calculator-section"]',
    content: (
      <div>
        <h4 className="font-semibold text-emerald-700 mb-1">Event Footprint Calculator</h4>
        <p className="text-sm text-gray-600">
          Calculate your event's complete carbon, water, and waste footprint.
          Get real-time metrics as you configure your event details.
        </p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
  },

  {
    target: '[data-tour="calculator-inputs"]',
    content: (
      <div>
        <h4 className="font-semibold text-emerald-700 mb-1">Event Configuration</h4>
        <p className="text-sm text-gray-600">
          Input your event details across four categories: Venue, Food & Beverage,
          Transportation, and Materials. Each choice impacts your footprint.
        </p>
      </div>
    ),
    placement: 'right',
  },

  {
    target: '[data-tour="calculator-results"]',
    content: (
      <div>
        <h4 className="font-semibold text-emerald-700 mb-1">Real-Time Results</h4>
        <p className="text-sm text-gray-600">
          See instant calculations of carbon emissions, water usage, and waste generation.
          Compare against industry benchmarks and get actionable insights.
        </p>
      </div>
    ),
    placement: 'left',
  },

  // Cost & Savings
  {
    target: '[data-tour="costsavings-section"]',
    content: (
      <div>
        <h4 className="font-semibold text-emerald-700 mb-1">Cost & Savings Calculator</h4>
        <p className="text-sm text-gray-600">
          Discover the financial benefits of sustainable choices. Calculate ROI,
          tax incentives, and long-term brand value impact.
        </p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
  },

  {
    target: '[data-tour="costsavings-inputs"]',
    content: (
      <div>
        <h4 className="font-semibold text-emerald-700 mb-1">Cost Inputs</h4>
        <p className="text-sm text-gray-600">
          Enter your event costs across different categories to see potential savings
          from sustainable alternatives and available tax incentives.
        </p>
      </div>
    ),
    placement: 'right',
  },

  {
    target: '[data-tour="costsavings-roi"]',
    content: (
      <div>
        <h4 className="font-semibold text-emerald-700 mb-1">ROI Analysis</h4>
        <p className="text-sm text-gray-600">
          View your return on investment, total economic benefits, and payback period
          for sustainable choices. See how green events save money!
        </p>
      </div>
    ),
    placement: 'left',
  },

  // Impact Dashboard
  {
    target: '[data-tour="dashboard-section"]',
    content: (
      <div>
        <h4 className="font-semibold text-emerald-700 mb-1">Environmental Impact Dashboard</h4>
        <p className="text-sm text-gray-600">
          Visualize your impact with interactive charts, industry comparisons,
          UN SDG alignment, and detailed reduction roadmaps.
        </p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
  },

  {
    target: '[data-tour="dashboard-metrics"]',
    content: (
      <div>
        <h4 className="font-semibold text-emerald-700 mb-1">Key Metrics</h4>
        <p className="text-sm text-gray-600">
          Track total carbon, water, waste, and energy metrics. See per-attendee
          breakdowns and compare against industry benchmarks.
        </p>
      </div>
    ),
    placement: 'bottom',
  },

  {
    target: '[data-tour="dashboard-charts"]',
    content: (
      <div>
        <h4 className="font-semibold text-emerald-700 mb-1">Visual Analytics</h4>
        <p className="text-sm text-gray-600">
          Interactive charts show your impact breakdown, trends over time,
          and comparisons with similar events in your industry.
        </p>
      </div>
    ),
    placement: 'top',
  },

  // Recommendations
  {
    target: '[data-tour="alternatives-section"]',
    content: (
      <div>
        <h4 className="font-semibold text-emerald-700 mb-1">Sustainable Recommendations</h4>
        <p className="text-sm text-gray-600">
          Get personalized sustainable alternatives for every category.
          See cost-impact trade-offs and implementation difficulty.
        </p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
  },

  {
    target: '[data-tour="alternatives-cards"]',
    content: (
      <div>
        <h4 className="font-semibold text-emerald-700 mb-1">Smart Alternatives</h4>
        <p className="text-sm text-gray-600">
          Each recommendation shows potential carbon reduction, cost impact,
          and implementation steps. Apply changes with one click!
        </p>
      </div>
    ),
    placement: 'bottom',
  },

  // My Events
  {
    target: '[data-tour="myevents-section"]',
    content: (
      <div>
        <h4 className="font-semibold text-emerald-700 mb-1">My Events</h4>
        <p className="text-sm text-gray-600">
          Save and manage all your events in one place. Track progress over time,
          compare performance, and export reports.
        </p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
  },

  {
    target: '[data-tour="myevents-list"]',
    content: (
      <div>
        <h4 className="font-semibold text-emerald-700 mb-1">Event Management</h4>
        <p className="text-sm text-gray-600">
          View all your saved events, filter by date or impact, and track your
          sustainability journey across multiple events.
        </p>
      </div>
    ),
    placement: 'bottom',
  },

  // Success Stories
  {
    target: '[data-tour="portfolio-section"]',
    content: (
      <div>
        <h4 className="font-semibold text-emerald-700 mb-1">Success Stories</h4>
        <p className="text-sm text-gray-600">
          See real-world examples of sustainable events. Learn from others'
          experiences and get inspired for your own events.
        </p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
  },

  // Resources
  {
    target: '[data-tour="resources-section"]',
    content: (
      <div>
        <h4 className="font-semibold text-emerald-700 mb-1">Resource Library</h4>
        <p className="text-sm text-gray-600">
          Access guides, templates, checklists, and best practices for sustainable
          event planning. Download resources and stay updated.
        </p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
  },

  // Settings & Customization
  {
    target: '[data-tour="settings-button"]',
    content: (
      <div>
        <h4 className="font-semibold text-emerald-700 mb-1">Settings</h4>
        <p className="text-sm text-gray-600">
          Customize your experience: choose metric/imperial units, select from 100+ currencies,
          enable privacy mode, and pick from 9 beautiful themes.
        </p>
      </div>
    ),
    placement: 'bottom',
  },

  // Glossary
  {
    target: '[data-tour="glossary-link"]',
    content: (
      <div>
        <h4 className="font-semibold text-emerald-700 mb-1">Sustainability Glossary</h4>
        <p className="text-sm text-gray-600">
          Not sure about a term? Click "View Glossary" links throughout the app
          to access definitions of sustainability and environmental terms.
        </p>
      </div>
    ),
    placement: 'top',
  },

  // Tour Completion
  {
    target: '[data-tour="tour-button"]',
    content: (
      <div className="text-center">
        <h4 className="font-semibold text-emerald-700 mb-1">Tour Complete! 🎉</h4>
        <p className="text-sm text-gray-600 mb-2">
          You can restart this tour anytime by clicking this button in the navigation bar.
        </p>
        <p className="text-xs text-gray-500">
          💡 Tip: Log in to save your events, access premium features, and track your
          sustainability journey over time!
        </p>
      </div>
    ),
    placement: 'bottom',
  },
];

// Custom tooltip styles
const tourStyles = {
  options: {
    primaryColor: '#10b981',
    zIndex: 10000,
    arrowColor: '#fff',
    backgroundColor: '#fff',
    overlayColor: 'rgba(0, 0, 0, 0.5)',
    textColor: '#374151',
  },
  tooltip: {
    borderRadius: 12,
    padding: 20,
  },
  buttonNext: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: '8px 16px',
  },
  buttonBack: {
    color: '#6b7280',
    marginRight: 10,
  },
  buttonSkip: {
    color: '#9ca3af',
  },
};

export function TourProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated: userIsAuthenticated } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tourEnabled, setTourEnabledState] = useState(true);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);
  const [preferences, setPreferences] = useState<TourPreferences | null>(null);
  const [hasLoadedPreferences, setHasLoadedPreferences] = useState(false);
  const tourStartTime = useRef<number>(0);
  const hasShownAutoTour = useRef(false);

  // Load preferences on mount or auth change - only once per auth session
  useEffect(() => {
    // Reset when user logs out
    if (!userIsAuthenticated) {
      setHasLoadedPreferences(false);
      // Use local storage for anonymous users
      const local = getLocalTourPrefs();
      setTourEnabledState(local.tourEnabled);
      setHasCompletedTour(local.hasCompletedTour);
      return;
    }

    // Don't reload if already loaded for this auth session
    if (hasLoadedPreferences) {
      return;
    }

    const loadPreferences = async () => {
      if (isAuthenticated()) {
        try {
          const result = await tourApi.getPreferences();
          if (result.data?.preferences) {
            setPreferences(result.data.preferences);
            setTourEnabledState(result.data.preferences.tourEnabled);
            setHasCompletedTour(result.data.preferences.hasCompletedTour);
          }
        } catch (error) {
          console.error('Failed to load tour preferences:', error);
          // Fall back to local storage
          const local = getLocalTourPrefs();
          setTourEnabledState(local.tourEnabled);
          setHasCompletedTour(local.hasCompletedTour);
        } finally {
          setHasLoadedPreferences(true);
        }
      }
    };

    loadPreferences();
  }, [userIsAuthenticated, hasLoadedPreferences]);

  // Auto-start tour for new users (only once per session)
  useEffect(() => {
    if (!hasCompletedTour && tourEnabled && !hasShownAutoTour.current && !isRunning) {
      // Delay auto-start to let the page fully render
      const timer = setTimeout(() => {
        if (!hasShownAutoTour.current) {
          hasShownAutoTour.current = true;
          setIsRunning(true);
          tourStartTime.current = Date.now();
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedTour, tourEnabled, isRunning]);

  const startTour = useCallback(() => {
    setIsRunning(true);
    setCurrentStep(0);
    tourStartTime.current = Date.now();

    // Track tour start
    if (userIsAuthenticated && isAuthenticated()) {
      tourApi.startTour().catch(console.error);
    }
  }, [userIsAuthenticated]);

  const stopTour = useCallback(() => {
    setIsRunning(false);
  }, []);

  const restartTour = useCallback(() => {
    setCurrentStep(0);
    setIsRunning(true);
    tourStartTime.current = Date.now();

    if (userIsAuthenticated && isAuthenticated()) {
      tourApi.startTour().catch(console.error);
    }
  }, [userIsAuthenticated]);

  const setTourEnabled = useCallback(async (enabled: boolean) => {
    setTourEnabledState(enabled);

    if (userIsAuthenticated && isAuthenticated()) {
      try {
        await tourApi.updatePreferences({ tourEnabled: enabled });
      } catch (error) {
        console.error('Failed to update tour preferences:', error);
      }
    } else {
      setLocalTourPrefs({ tourEnabled: enabled });
    }
  }, [userIsAuthenticated]);

  const handleJoyrideCallback = useCallback(async (data: CallBackProps) => {
    const { status, action, index, type } = data;

    // Update current step
    if (type === EVENTS.STEP_AFTER && action === ACTIONS.NEXT) {
      setCurrentStep(index + 1);
    } else if (type === EVENTS.STEP_AFTER && action === ACTIONS.PREV) {
      setCurrentStep(index - 1);
    }

    // Handle tour completion
    if (status === STATUS.FINISHED) {
      setIsRunning(false);
      setHasCompletedTour(true);

      const timeSpent = Math.round((Date.now() - tourStartTime.current) / 1000);

      if (userIsAuthenticated && isAuthenticated()) {
        try {
          await tourApi.completeTour(timeSpent);
        } catch (error) {
          console.error('Failed to record tour completion:', error);
        }
      } else {
        setLocalTourPrefs({ hasCompletedTour: true });
      }
    }

    // Handle tour skip
    if (status === STATUS.SKIPPED || (action === ACTIONS.CLOSE && status !== STATUS.FINISHED)) {
      setIsRunning(false);
      setHasCompletedTour(true); // Mark as completed even if skipped to prevent re-showing

      if (userIsAuthenticated && isAuthenticated()) {
        try {
          await tourApi.skipTour(tourSteps[index]?.target?.toString());
        } catch (error) {
          console.error('Failed to record tour skip:', error);
        }
      } else {
        const local = getLocalTourPrefs();
        setLocalTourPrefs({
          timesSkipped: local.timesSkipped + 1,
          hasCompletedTour: true // Prevent tour from showing again
        });
      }
    }
  }, [userIsAuthenticated]);

  const value: TourContextType = {
    isRunning,
    startTour,
    stopTour,
    restartTour,
    tourEnabled,
    setTourEnabled,
    hasCompletedTour,
    currentStep,
    totalSteps: tourSteps.length,
  };

  return (
    <TourContext.Provider value={value}>
      {children}
      <Joyride
        steps={tourSteps}
        run={isRunning}
        stepIndex={currentStep}
        continuous
        showProgress
        showSkipButton
        scrollToFirstStep
        spotlightClicks
        disableOverlayClose
        callback={handleJoyrideCallback}
        styles={tourStyles}
        locale={{
          back: 'Back',
          close: 'Close',
          last: 'Finish',
          next: 'Next',
          skip: 'Skip Tour',
        }}
      />
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}

