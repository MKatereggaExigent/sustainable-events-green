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
}

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, firstName?: string, lastName?: string, organizationName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchOrganization: (orgId: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
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

  useEffect(() => {
    loadUser();
  }, [loadUser]);

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

  const value: AuthContextType = {
    user,
    organization,
    isAuthenticated: checkAuth() && !!user,
    isLoading,
    login,
    register,
    logout,
    switchOrganization,
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

