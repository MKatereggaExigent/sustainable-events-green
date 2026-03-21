export const analyticsApi = {
  /**
   * Track when user clicks upgrade button
   */
  async trackUpgradeClick(
    fromPlan: string,
    reason: 'limit_reached' | 'approaching_limit' | 'feature_locked'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          eventType: 'upgrade_clicked',
          eventData: {
            fromPlan,
            reason,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        return { success: false, error: 'Failed to track event' };
      }

      return { success: true };
    } catch (error) {
      console.error('Analytics tracking error:', error);
      return { success: false, error: 'Network error' };
    }
  },
};

