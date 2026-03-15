import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, setAccessToken, setOrganizationId, getAccessToken, isAuthenticated as checkAuth } from '../services/api';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  subscriptionTier: 'explorer' | 'planner' | 'impact' | 'enterprise';
  subscriptionExpiresAt: string | null;
}

interface Subscription {
  id: string;
  planCode: string;
  planName: string;
  status: 'active' | 'cancelled' | 'expired';
  nextPaymentDate: string | null;
  features: string[];
  maxEvents: number;
  maxUsers: number;
}

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  subscription: Subscription | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  subscriptionTier: 'explorer' | 'planner' | 'impact' | 'enterprise';
  hasFeature: (feature: string) => boolean;
  canAccessFeature: (requiredTier: 'explorer' | 'planner' | 'impact' | 'enterprise') => boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, firstName?: string, lastName?: string, organizationName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchOrganization: (orgId: string) => void;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Tier hierarchy for access control
const TIER_HIERARCHY = {
  explorer: 0,
  planner: 1,
  impact: 2,
  enterprise: 3,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!getAccessToken()) {
      setIsLoading(false);
      return;
    }

    try {
      const result = await authApi.me();
      if (result.data?.user) {
        setUser(result.data.user);
        if (result.data.organization) {
          setOrganization(result.data.organization);
        }
      } else {
        setUser(null);
        setOrganization(null);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshSubscription = useCallback(async () => {
    if (!organization?.id) return;

    try {
      // Determine API URL based on current domain
      const apiUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:8035'
        : typeof window !== 'undefined'
          ? `${window.location.protocol}//${window.location.hostname}`
          : 'http://localhost:8035';

      const response = await fetch(`${apiUrl}/api/payments/subscription`, {
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setSubscription(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
    }
  }, [organization?.id]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (organization?.id) {
      refreshSubscription();
    }
  }, [organization?.id, refreshSubscription]);

  const login = async (email: string, password: string) => {
    const result = await authApi.login(email, password);

    if (result.error) {
      return { success: false, error: result.error };
    }

    if (result.data) {
      setUser(result.data.user);
      if (result.data.organization) {
        setOrganization(result.data.organization);
      }
      return { success: true };
    }

    return { success: false, error: 'Login failed' };
  };

  const register = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    organizationName?: string
  ) => {
    const result = await authApi.register(email, password, firstName, lastName, organizationName);
    
    if (result.error) {
      return { success: false, error: result.error };
    }

    if (result.data) {
      setUser(result.data.user);
      if (result.data.organization) {
        setOrganization(result.data.organization);
      }
      return { success: true };
    }

    return { success: false, error: 'Registration failed' };
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setOrganization(null);
    setAccessToken(null);
    setOrganizationId(null);
  };

  const switchOrganization = (orgId: string) => {
    setOrganizationId(orgId);
    // Reload page to refresh all data with new org context
    window.location.reload();
  };

  // Get current subscription tier
  const subscriptionTier = organization?.subscriptionTier || 'explorer';

  // Check if user has access to a specific feature
  const hasFeature = useCallback((feature: string): boolean => {
    if (!subscription) return false;
    return subscription.features.includes(feature);
  }, [subscription]);

  // Check if user can access a feature based on tier hierarchy
  const canAccessFeature = useCallback((requiredTier: 'explorer' | 'planner' | 'impact' | 'enterprise'): boolean => {
    const currentTierLevel = TIER_HIERARCHY[subscriptionTier];
    const requiredTierLevel = TIER_HIERARCHY[requiredTier];
    return currentTierLevel >= requiredTierLevel;
  }, [subscriptionTier]);

  const value: AuthContextType = {
    user,
    organization,
    subscription,
    isAuthenticated: checkAuth() && !!user,
    isLoading,
    subscriptionTier,
    hasFeature,
    canAccessFeature,
    login,
    register,
    logout,
    switchOrganization,
    refreshSubscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

