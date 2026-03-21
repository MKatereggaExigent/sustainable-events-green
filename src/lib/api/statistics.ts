import { apiClient } from './client';

export interface PlatformStatistics {
  eventsTracked: number;
  co2OffsetKg: number;
  plannersActive: number;
  avgSatisfaction: number;
  countries: number;
  treesPlanted: number;
  waterSavedLiters: number;
  eventsThisMonth: number;
}

/**
 * Get platform-wide statistics
 */
export async function getPlatformStatistics(): Promise<PlatformStatistics> {
  try {
    const response = await apiClient.get<{ success: boolean; data: PlatformStatistics }>('/statistics');
    
    if (response.data.success) {
      return response.data.data;
    }
    
    // Return zeros if API fails
    return getDefaultStatistics();
  } catch (error) {
    console.error('Failed to fetch platform statistics:', error);
    return getDefaultStatistics();
  }
}

/**
 * Get default statistics (all zeros for fresh installation)
 */
function getDefaultStatistics(): PlatformStatistics {
  return {
    eventsTracked: 0,
    co2OffsetKg: 0,
    plannersActive: 0,
    avgSatisfaction: 0,
    countries: 0,
    treesPlanted: 0,
    waterSavedLiters: 0,
    eventsThisMonth: 0,
  };
}

