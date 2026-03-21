const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface SubscriptionUsage {
  subscription: {
    planCode: string;
    planName: string;
    maxEvents: number;
    maxUsers: number;
    features: string[];
    amount: number;
    currency: string;
    interval: string;
    status: string;
    nextPaymentDate: string | null;
  };
  usage: {
    events: {
      current: number;
      limit: number;
      unlimited: boolean;
      percentage: number;
      remaining: number;
      approachingLimit: boolean;
      limitReached: boolean;
    };
    users: {
      current: number;
      limit: number;
      unlimited: boolean;
      percentage: number;
      remaining: number;
      approachingLimit: boolean;
      limitReached: boolean;
    };
  };
  resetDate: string;
}

export const subscriptionApi = {
  /**
   * Get current subscription usage statistics
   */
  async getUsage(): Promise<{ data?: SubscriptionUsage; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/subscription/usage`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        return { error: 'Failed to fetch subscription usage' };
      }

      const result = await response.json();

      if (result.success && result.data) {
        return { data: result.data };
      }

      return { error: 'Invalid response format' };
    } catch (error) {
      console.error('Subscription API error:', error);
      return { error: 'Network error' };
    }
  },
};

