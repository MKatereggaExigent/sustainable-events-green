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

// Tour steps definition
const tourSteps: Step[] = [
  {
    target: 'body',
    content: (
      <div className="text-center">
        <h3 className="text-xl font-bold text-emerald-700 mb-2">Welcome to EcobServe! 🌿</h3>
        <p className="text-gray-600">
          Let us show you how to measure and reduce your event's environmental impact.
          This quick tour will help you get started.
        </p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="navbar-logo"]',
    content: (
      <div>
        <h4 className="font-semibold text-emerald-700 mb-1">EcobServe Logo</h4>
        <p className="text-sm text-gray-600">Click here anytime to return to the home page.</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="nav-calculator"]',
    content: (
      <div>
        <h4 className="font-semibold text-emerald-700 mb-1">Event Footprint Calculator</h4>
        <p className="text-sm text-gray-600">
          Calculate your event's complete carbon footprint including venue, transportation, 
          food & beverage, and materials.
        </p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="nav-costsavings"]',
    content: (
      <div>
        <h4 className="font-semibold text-emerald-700 mb-1">Cost & Savings Calculator</h4>
        <p className="text-sm text-gray-600">
          Discover the financial benefits of sustainable choices - from ROI analysis 
          to tax incentives and brand value impact.
        </p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="nav-dashboard"]',
    content: (
      <div>
        <h4 className="font-semibold text-emerald-700 mb-1">Environmental Impact Dashboard</h4>
        <p className="text-sm text-gray-600">
          Visualize your impact with detailed metrics, industry benchmarks, 
          UN SDG alignment, and reduction roadmaps.
        </p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="nav-myevents"]',
    content: (
      <div>
        <h4 className="font-semibold text-emerald-700 mb-1">My Events</h4>
        <p className="text-sm text-gray-600">
          Save and manage all your events in one place. Track progress over time 
          and compare performance across events.
        </p>
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
          Ready to begin? Click here to start calculating your event's environmental footprint!
        </p>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '[data-tour="tour-button"]',
    content: (
      <div className="text-center">
        <h4 className="font-semibold text-emerald-700 mb-1">Take the Tour Again</h4>
        <p className="text-sm text-gray-600">
          You can restart this tour anytime by clicking this button in the navigation bar.
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
  const tourStartTime = useRef<number>(0);
  const hasShownAutoTour = useRef(false);

  // Load preferences on mount or auth change
  useEffect(() => {
    const loadPreferences = async () => {
      if (userIsAuthenticated && isAuthenticated()) {
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
        }
      } else {
        // Use local storage for anonymous users
        const local = getLocalTourPrefs();
        setTourEnabledState(local.tourEnabled);
        setHasCompletedTour(local.hasCompletedTour);
      }
    };

    loadPreferences();
  }, [userIsAuthenticated]);

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

      if (userIsAuthenticated && isAuthenticated()) {
        try {
          await tourApi.skipTour(tourSteps[index]?.target?.toString());
        } catch (error) {
          console.error('Failed to record tour skip:', error);
        }
      } else {
        const local = getLocalTourPrefs();
        setLocalTourPrefs({ timesSkipped: local.timesSkipped + 1 });
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

