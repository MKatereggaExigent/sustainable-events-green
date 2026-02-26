import { query } from '../config/database';
import { logger } from '../utils/logger';

export interface TourPreferences {
  id: string;
  userId: string;
  hasCompletedTour: boolean;
  completedAt: Date | null;
  tourEnabled: boolean;
  showTourOnNewFeatures: boolean;
  completedSteps: string[];
  lastSeenStep: string | null;
  timesStarted: number;
  timesCompleted: number;
  timesSkipped: number;
  totalTimeSeconds: number;
  createdAt: Date;
  updatedAt: Date;
}

interface DbRow {
  id: string;
  user_id: string;
  has_completed_tour: boolean;
  completed_at: Date | null;
  tour_enabled: boolean;
  show_tour_on_new_features: boolean;
  completed_steps: string[];
  last_seen_step: string | null;
  times_started: number;
  times_completed: number;
  times_skipped: number;
  total_time_seconds: number;
  created_at: Date;
  updated_at: Date;
}

function mapDbToPreferences(row: DbRow): TourPreferences {
  return {
    id: row.id,
    userId: row.user_id,
    hasCompletedTour: row.has_completed_tour,
    completedAt: row.completed_at,
    tourEnabled: row.tour_enabled,
    showTourOnNewFeatures: row.show_tour_on_new_features,
    completedSteps: row.completed_steps || [],
    lastSeenStep: row.last_seen_step,
    timesStarted: row.times_started,
    timesCompleted: row.times_completed,
    timesSkipped: row.times_skipped,
    totalTimeSeconds: row.total_time_seconds,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getTourPreferences(userId: string): Promise<TourPreferences | null> {
  try {
    const rows = await query<DbRow>(
      'SELECT * FROM user_tour_preferences WHERE user_id = $1',
      [userId]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    return mapDbToPreferences(rows[0]);
  } catch (error) {
    logger.error('Error getting tour preferences:', error);
    throw error;
  }
}

export async function createTourPreferences(userId: string): Promise<TourPreferences> {
  try {
    const rows = await query<DbRow>(
      `INSERT INTO user_tour_preferences (user_id) 
       VALUES ($1) 
       RETURNING *`,
      [userId]
    );
    
    return mapDbToPreferences(rows[0]);
  } catch (error) {
    logger.error('Error creating tour preferences:', error);
    throw error;
  }
}

export async function getOrCreateTourPreferences(userId: string): Promise<TourPreferences> {
  let prefs = await getTourPreferences(userId);
  if (!prefs) {
    prefs = await createTourPreferences(userId);
  }
  return prefs;
}

export async function updateTourPreferences(
  userId: string,
  updates: Partial<{
    hasCompletedTour: boolean;
    tourEnabled: boolean;
    showTourOnNewFeatures: boolean;
    completedSteps: string[];
    lastSeenStep: string;
    timesStarted: number;
    timesCompleted: number;
    timesSkipped: number;
    totalTimeSeconds: number;
  }>
): Promise<TourPreferences> {
  try {
    // Build dynamic update query
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.hasCompletedTour !== undefined) {
      setClauses.push(`has_completed_tour = $${paramIndex++}`);
      values.push(updates.hasCompletedTour);
      if (updates.hasCompletedTour) {
        setClauses.push(`completed_at = CURRENT_TIMESTAMP`);
      }
    }
    if (updates.tourEnabled !== undefined) {
      setClauses.push(`tour_enabled = $${paramIndex++}`);
      values.push(updates.tourEnabled);
    }
    if (updates.showTourOnNewFeatures !== undefined) {
      setClauses.push(`show_tour_on_new_features = $${paramIndex++}`);
      values.push(updates.showTourOnNewFeatures);
    }
    if (updates.completedSteps !== undefined) {
      setClauses.push(`completed_steps = $${paramIndex++}`);
      values.push(JSON.stringify(updates.completedSteps));
    }
    if (updates.lastSeenStep !== undefined) {
      setClauses.push(`last_seen_step = $${paramIndex++}`);
      values.push(updates.lastSeenStep);
    }
    if (updates.timesStarted !== undefined) {
      setClauses.push(`times_started = $${paramIndex++}`);
      values.push(updates.timesStarted);
    }
    if (updates.timesCompleted !== undefined) {
      setClauses.push(`times_completed = $${paramIndex++}`);
      values.push(updates.timesCompleted);
    }
    if (updates.timesSkipped !== undefined) {
      setClauses.push(`times_skipped = $${paramIndex++}`);
      values.push(updates.timesSkipped);
    }
    if (updates.totalTimeSeconds !== undefined) {
      setClauses.push(`total_time_seconds = $${paramIndex++}`);
      values.push(updates.totalTimeSeconds);
    }

    values.push(userId);

    const rows = await query<DbRow>(
      `UPDATE user_tour_preferences 
       SET ${setClauses.join(', ')}
       WHERE user_id = $${paramIndex}
       RETURNING *`,
      values
    );

    if (rows.length === 0) {
      // Create if doesn't exist
      return createTourPreferences(userId);
    }

    return mapDbToPreferences(rows[0]);
  } catch (error) {
    logger.error('Error updating tour preferences:', error);
    throw error;
  }
}

