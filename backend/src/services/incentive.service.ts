import { query, transaction } from '../config/database';
import { getCache, setCache } from '../config/redis';
import { logger } from '../utils/logger';

export interface TaxIncentive {
  id: string;
  name: string;
  description: string;
  region: string;
  category: string;
  percentageCredit: number;
  maxCredit: number;
  eligibilityCriteria: string[];
  isActive: boolean;
}

export async function getAllIncentives(region?: string): Promise<TaxIncentive[]> {
  const cacheKey = `incentives:${region || 'all'}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  let sql = `SELECT id, name, description, region, category, 
             percentage_credit as "percentageCredit", max_credit as "maxCredit",
             eligibility_criteria as "eligibilityCriteria", is_active as "isActive"
             FROM tax_incentives WHERE is_active = true`;
  const params: any[] = [];

  if (region) {
    sql += ' AND region = $1';
    params.push(region);
  }

  sql += ' ORDER BY region, category, name';

  const incentives = await query<TaxIncentive>(sql, params);
  await setCache(cacheKey, incentives, 3600); // Cache for 1 hour
  return incentives;
}

export async function getIncentiveById(id: string): Promise<TaxIncentive | null> {
  const incentives = await query<TaxIncentive>(
    `SELECT id, name, description, region, category,
     percentage_credit as "percentageCredit", max_credit as "maxCredit",
     eligibility_criteria as "eligibilityCriteria", is_active as "isActive"
     FROM tax_incentives WHERE id = $1`,
    [id]
  );
  return incentives[0] || null;
}

export async function getIncentivesByRegion(region: string): Promise<TaxIncentive[]> {
  return getAllIncentives(region);
}

export async function applyIncentiveToEvent(
  eventId: string,
  incentiveId: string,
  estimatedValue: number
) {
  await query(
    `INSERT INTO event_tax_incentives (event_id, tax_incentive_id, estimated_value, status)
     VALUES ($1, $2, $3, 'potential')
     ON CONFLICT (event_id, tax_incentive_id) DO UPDATE SET
       estimated_value = $3, status = 'potential'`,
    [eventId, incentiveId, estimatedValue]
  );
}

export async function getEventIncentives(eventId: string, organizationId: string) {
  const results = await query(
    `SELECT eti.*, ti.name, ti.description, ti.category, ti.region,
            ti.percentage_credit as "percentageCredit", ti.max_credit as "maxCredit"
     FROM event_tax_incentives eti
     JOIN tax_incentives ti ON eti.tax_incentive_id = ti.id
     JOIN events e ON eti.event_id = e.id
     WHERE eti.event_id = $1 AND e.organization_id = $2`,
    [eventId, organizationId]
  );
  return results;
}

export async function updateIncentiveStatus(
  eventId: string,
  incentiveId: string,
  status: 'potential' | 'applied' | 'approved' | 'rejected'
) {
  const updates: Record<string, any> = { status };
  
  if (status === 'applied') {
    updates.applied_at = 'CURRENT_TIMESTAMP';
  } else if (status === 'approved') {
    updates.approved_at = 'CURRENT_TIMESTAMP';
  }

  await query(
    `UPDATE event_tax_incentives 
     SET status = $1, 
         applied_at = CASE WHEN $1 = 'applied' THEN CURRENT_TIMESTAMP ELSE applied_at END,
         approved_at = CASE WHEN $1 = 'approved' THEN CURRENT_TIMESTAMP ELSE approved_at END
     WHERE event_id = $2 AND tax_incentive_id = $3`,
    [status, eventId, incentiveId]
  );
}

export async function calculateEventIncentives(
  eventId: string,
  organizationId: string,
  region: string,
  totalCosts: number
) {
  // Get applicable incentives for the region
  const incentives = await getIncentivesByRegion(region);
  
  // Calculate estimated values and apply to event
  const results = [];
  
  for (const incentive of incentives) {
    const estimatedValue = Math.min(
      (totalCosts * incentive.percentageCredit) / 100,
      incentive.maxCredit
    );
    
    await applyIncentiveToEvent(eventId, incentive.id, estimatedValue);
    
    results.push({
      ...incentive,
      estimatedValue,
    });
  }

  return results;
}

export async function removeEventIncentive(eventId: string, incentiveId: string) {
  await query(
    'DELETE FROM event_tax_incentives WHERE event_id = $1 AND tax_incentive_id = $2',
    [eventId, incentiveId]
  );
}

