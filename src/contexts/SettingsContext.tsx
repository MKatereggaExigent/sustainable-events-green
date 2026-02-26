import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settingsApi, UserSettings, Currency } from '../services/api';
import { useAuth } from './AuthContext';

// Metric system conversion factors
export const METRIC_CONVERSIONS = {
  // Weight: base unit is kg
  weight: {
    metric: { unit: 'kg', factor: 1, label: 'Kilograms' },
    imperial: { unit: 'lbs', factor: 2.20462, label: 'Pounds' },
    uk: { unit: 'kg', factor: 1, label: 'Kilograms' },
  },
  // Distance: base unit is km
  distance: {
    metric: { unit: 'km', factor: 1, label: 'Kilometers' },
    imperial: { unit: 'mi', factor: 0.621371, label: 'Miles' },
    uk: { unit: 'mi', factor: 0.621371, label: 'Miles' },
  },
  // Volume: base unit is liters
  volume: {
    metric: { unit: 'L', factor: 1, label: 'Liters' },
    imperial: { unit: 'gal', factor: 0.264172, label: 'Gallons' },
    uk: { unit: 'L', factor: 1, label: 'Liters' },
  },
  // Area: base unit is m²
  area: {
    metric: { unit: 'm²', factor: 1, label: 'Square Meters' },
    imperial: { unit: 'ft²', factor: 10.7639, label: 'Square Feet' },
    uk: { unit: 'm²', factor: 1, label: 'Square Meters' },
  },
  // Temperature: base unit is °C
  temperature: {
    metric: { unit: '°C', factor: 1, label: 'Celsius' },
    imperial: { unit: '°F', factor: 1.8, offset: 32, label: 'Fahrenheit' },
    uk: { unit: '°C', factor: 1, label: 'Celsius' },
  },
};

interface SettingsContextType {
  settings: UserSettings | null;
  currencies: Currency[];
  isLoading: boolean;
  error: string | null;
  updateSettings: (data: Partial<Pick<UserSettings, 'metricSystem' | 'currencyCode' | 'hideValues'>>) => Promise<void>;
  convertValue: (value: number, type: keyof typeof METRIC_CONVERSIONS) => number;
  getUnit: (type: keyof typeof METRIC_CONVERSIONS) => string;
  formatCurrency: (amount: number) => string;
  maskValue: (value: string | number) => string;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedSettings, setHasLoadedSettings] = useState(false);

  // Load currencies on mount (public endpoint)
  useEffect(() => {
    settingsApi.getCurrencies().then((result) => {
      if (result.data) {
        setCurrencies(result.data);
      }
    }).catch(() => {
      // Silently fail - currencies will be empty
    });
  }, []);

  // Load user settings when authenticated - only once per auth state change
  useEffect(() => {
    // Reset when user logs out
    if (!isAuthenticated) {
      setSettings(null);
      setHasLoadedSettings(false);
      return;
    }

    // Don't reload if already loaded for this auth session
    if (hasLoadedSettings) {
      return;
    }

    const loadSettings = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await settingsApi.getSettings();
        if (result.data) {
          setSettings(result.data);
        } else if (result.error) {
          setError(result.error);
          // Set default settings on error to prevent UI issues
          setSettings({
            metricSystem: 'metric',
            currencyCode: 'USD',
            hideValues: false,
            exchangeRate: 1,
          });
        }
      } catch (err) {
        setError('Failed to load settings');
        // Set default settings on error
        setSettings({
          metricSystem: 'metric',
          currencyCode: 'USD',
          hideValues: false,
          exchangeRate: 1,
        });
      } finally {
        setIsLoading(false);
        setHasLoadedSettings(true);
      }
    };

    loadSettings();
  }, [isAuthenticated, hasLoadedSettings]);

  // Manual refresh function
  const refreshSettings = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const result = await settingsApi.getSettings();
      if (result.data) {
        setSettings(result.data);
      }
    } catch (err) {
      // Silently fail on refresh
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const updateSettings = async (data: Partial<Pick<UserSettings, 'metricSystem' | 'currencyCode' | 'hideValues'>>) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await settingsApi.updateSettings(data);
      if (result.data) {
        setSettings(result.data);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Convert value based on metric system
  const convertValue = (value: number, type: keyof typeof METRIC_CONVERSIONS): number => {
    const system = settings?.metricSystem || 'metric';
    const conversion = METRIC_CONVERSIONS[type][system];
    
    if (type === 'temperature' && 'offset' in conversion) {
      return value * conversion.factor + (conversion.offset || 0);
    }
    
    return value * conversion.factor;
  };

  // Get unit label for current metric system
  const getUnit = (type: keyof typeof METRIC_CONVERSIONS): string => {
    const system = settings?.metricSystem || 'metric';
    return METRIC_CONVERSIONS[type][system].unit;
  };

  // Format currency with conversion
  const formatCurrency = (amount: number): string => {
    const currencyCode = settings?.currencyCode || 'USD';
    const exchangeRate = settings?.exchangeRate || 1;
    const convertedAmount = amount * exchangeRate;
    
    const currency = currencies.find(c => c.code === currencyCode);
    const decimals = currency?.decimalPlaces ?? 2;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(convertedAmount);
  };

  // Mask value when hideValues is true
  const maskValue = (value: string | number): string => {
    if (settings?.hideValues) {
      return '***';
    }
    return String(value);
  };

  const value: SettingsContextType = {
    settings,
    currencies,
    isLoading,
    error,
    updateSettings,
    convertValue,
    getUnit,
    formatCurrency,
    maskValue,
    refreshSettings,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

