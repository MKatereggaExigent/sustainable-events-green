// API Client for GreenConnect Backend

// Use relative path for production (nginx will proxy), absolute for local dev
const API_URL = import.meta.env.VITE_API_URL || '/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

let accessToken: string | null = null;
let organizationId: string | null = null;

// Token management
export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
}

export function getAccessToken(): string | null {
  if (!accessToken) {
    accessToken = localStorage.getItem('accessToken');
  }
  return accessToken;
}

export function setOrganizationId(orgId: string | null) {
  organizationId = orgId;
  if (orgId) {
    localStorage.setItem('organizationId', orgId);
  } else {
    localStorage.removeItem('organizationId');
  }
}

export function getOrganizationId(): string | null {
  if (!organizationId) {
    organizationId = localStorage.getItem('organizationId');
  }
  return organizationId;
}

// Base fetch with auth
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAccessToken();
  const orgId = getOrganizationId();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  if (orgId) {
    (headers as Record<string, string>)['X-Organization-Id'] = orgId;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle token refresh
      if (response.status === 401 && token) {
        const refreshed = await refreshToken();
        if (refreshed) {
          return apiFetch<T>(endpoint, options);
        }
        clearAuth();
      }
      return { error: data.error || 'Request failed' };
    }

    return { data };
  } catch (error) {
    console.error('API Error:', error);
    return { error: 'Network error. Please check your connection.' };
  }
}

// Auth API
export const authApi = {
  async register(email: string, password: string, firstName?: string, lastName?: string, organizationName?: string) {
    const result = await apiFetch<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName, organizationName }),
    });
    if (result.data) {
      setAccessToken(result.data.accessToken);
      if (result.data.organization) {
        setOrganizationId(result.data.organization.id);
      }
    }
    return result;
  },

  async login(email: string, password: string) {
    const result = await apiFetch<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (result.data) {
      setAccessToken(result.data.accessToken);
      if (result.data.organization) {
        setOrganizationId(result.data.organization.id);
      }
    }
    return result;
  },

  async logout() {
    const result = await apiFetch('/auth/logout', { method: 'POST' });
    clearAuth();
    return result;
  },

  async me() {
    return apiFetch<any>('/auth/me');
  },
};

async function refreshToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (response.ok) {
      const data = await response.json();
      setAccessToken(data.accessToken);
      return true;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }
  return false;
}

function clearAuth() {
  setAccessToken(null);
  setOrganizationId(null);
}

// Events API
export const eventsApi = {
  getAll: (filters?: { status?: string; limit?: number }) => 
    apiFetch<{ events: any[] }>(`/events?${new URLSearchParams(filters as any)}`),
  
  getById: (id: string) => apiFetch<{ event: any }>(`/events/${id}`),
  
  create: (data: any) => apiFetch<{ event: any }>('/events', { method: 'POST', body: JSON.stringify(data) }),
  
  update: (id: string, data: any) => apiFetch<{ event: any }>(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  delete: (id: string) => apiFetch(`/events/${id}`, { method: 'DELETE' }),
  
  saveCarbonData: (id: string, data: any) => apiFetch(`/events/${id}/carbon`, { method: 'POST', body: JSON.stringify(data) }),
};

// Costs API
export const costsApi = {
  calculate: (data: any) => apiFetch<{ results: any }>('/costs/calculate', { method: 'POST', body: JSON.stringify(data) }),
  
  save: (eventId: string, data: any) => apiFetch<{ results: any }>(`/costs/${eventId}`, { method: 'POST', body: JSON.stringify(data) }),
  
  get: (eventId: string) => apiFetch<{ costData: any }>(`/costs/${eventId}`),
  
  getSummary: () => apiFetch<{ summary: any }>('/costs/summary'),
};

// Incentives API
export const incentivesApi = {
  getAll: (region?: string) => apiFetch<{ incentives: any[] }>(`/incentives${region ? `?region=${region}` : ''}`),
  
  getByRegion: (region: string) => apiFetch<{ incentives: any[] }>(`/incentives/region/${region}`),
  
  getForEvent: (eventId: string) => apiFetch<{ incentives: any[] }>(`/incentives/event/${eventId}`),
  
  calculate: (eventId: string, region: string, totalCosts: number) => 
    apiFetch<{ incentives: any[] }>(`/incentives/event/${eventId}/calculate`, {
      method: 'POST', body: JSON.stringify({ region, totalCosts }),
    }),
};

// Organizations API
export const organizationsApi = {
  getMine: () => apiFetch<{ organizations: any[] }>('/organizations/mine'),

  getCurrent: () => apiFetch<{ organization: any }>('/organizations/current'),

  create: (data: { name: string; slug?: string }) =>
    apiFetch<{ organization: any }>('/organizations', { method: 'POST', body: JSON.stringify(data) }),

  update: (data: any) => apiFetch<{ organization: any }>('/organizations/current', { method: 'PUT', body: JSON.stringify(data) }),

  getMembers: () => apiFetch<{ members: any[] }>('/organizations/members'),
};

// Tour API
export interface TourPreferences {
  id: string;
  userId: string;
  hasCompletedTour: boolean;
  completedAt: string | null;
  tourEnabled: boolean;
  showTourOnNewFeatures: boolean;
  completedSteps: string[];
  lastSeenStep: string | null;
  timesStarted: number;
  timesCompleted: number;
  timesSkipped: number;
  totalTimeSeconds: number;
  createdAt: string;
  updatedAt: string;
}

export const tourApi = {
  getPreferences: () => apiFetch<{ preferences: TourPreferences }>('/tour/preferences'),

  updatePreferences: (data: Partial<TourPreferences>) =>
    apiFetch<{ preferences: TourPreferences }>('/tour/preferences', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  startTour: () => apiFetch<{ preferences: TourPreferences }>('/tour/start', { method: 'POST' }),

  completeTour: (timeSpent?: number) =>
    apiFetch<{ preferences: TourPreferences }>('/tour/complete', {
      method: 'POST',
      body: JSON.stringify({ timeSpent })
    }),

  skipTour: (lastSeenStep?: string) =>
    apiFetch<{ preferences: TourPreferences }>('/tour/skip', {
      method: 'POST',
      body: JSON.stringify({ lastSeenStep })
    }),
};

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

