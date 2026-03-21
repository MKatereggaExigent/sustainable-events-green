// Use relative path for production (nginx will proxy), absolute for local dev
const API_URL = import.meta.env.VITE_API_URL || '/api';

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
    const response = await fetch(`${API_URL}/statistics`);

    if (!response.ok) {
      console.warn('Failed to fetch statistics, using defaults');
      return getDefaultStatistics();
    }

    const data = await response.json();

    if (data.success && data.data) {
      return data.data;
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

