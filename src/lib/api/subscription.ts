import { apiClient } from './client';

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
    return apiClient.get<SubscriptionUsage>('/subscription/usage');
  },
};

