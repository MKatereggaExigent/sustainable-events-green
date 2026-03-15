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

  // Home Page Features
  {
    target: '[data-tour="features-section"]',
    content: (
      <div>
        <h4 className="font-semibold text-emerald-700 mb-1">Platform Features</h4>
        <p className="text-sm text-gray-600 mb-2">
          Scroll down to explore our six main features:
        </p>
        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
          <li><strong>Carbon Calculator</strong> - Measure event footprint</li>
          <li><strong>Impact Dashboard</strong> - Visualize environmental metrics</li>
          <li><strong>Smart Alternatives</strong> - Get sustainable recommendations</li>
          <li><strong>Cost & Savings</strong> - Calculate financial benefits</li>
          <li><strong>My Events</strong> - Save and compare events</li>
          <li><strong>Resources</strong> - Learn best practices</li>
        </ul>
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
        <p className="text-sm text-gray-600 mb-3">
          You can restart this tour anytime by clicking this button in the navigation bar.
        </p>
        <p className="text-xs text-gray-500 mb-2">
          💡 <strong>Explore More Features:</strong> Scroll down the page to discover:
        </p>
        <ul className="text-xs text-gray-500 space-y-1 text-left">
          <li>📊 <strong>Event Footprint Calculator</strong> - Measure carbon, water & waste</li>
          <li>💰 <strong>Cost & Savings</strong> - Calculate ROI and tax incentives</li>
          <li>📈 <strong>Impact Dashboard</strong> - Visualize environmental metrics</li>
          <li>💡 <strong>Smart Recommendations</strong> - Get sustainable alternatives</li>
          <li>📁 <strong>My Events</strong> - Save and compare your events</li>
          <li>🏆 <strong>Success Stories</strong> - Learn from real examples</li>
          <li>📚 <strong>Resources</strong> - Access guides and best practices</li>
        </ul>
        <p className="text-xs text-gray-500 mt-2">
          🔐 Log in to save events and access all premium features!
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

