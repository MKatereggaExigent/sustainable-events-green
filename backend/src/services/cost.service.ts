import { query, transaction } from '../config/database';
import { invalidateCachePattern, getCache, setCache } from '../config/redis';
import { logger } from '../utils/logger';

export interface CostInput {
  venueCost: number;
  energyCost: number;
  cateringCost: number;
  transportCost: number;
  materialsCost: number;
  wasteDisposalCost: number;
  region: string;
}

export interface CostSavingsResult {
  traditionalTotal: number;
  sustainableTotal: number;
  totalSavings: number;
  savingsPercentage: number;
  roiPercentage: number;
  paybackMonths: number;
  carbonValueSaved: number;
  waterValueSaved: number;
  wasteValueSaved: number;
}

// Savings factors (multipliers for sustainable alternatives)
const SAVINGS_FACTORS = {
  venue: { renewable: 0.25, efficient: 0.15 },
  energy: { renewable: 0.30, led: 0.40 },
  catering: { vegan: 0.30, local: 0.20, organic: 0.10 },
  transport: { shuttle: 0.25, hybrid: 0.15 },
  materials: { digital: 0.80, recycled: 0.25 },
  waste: { compost: 0.40, recycle: 0.30 },
};

export function calculateCostSavings(inputs: CostInput): CostSavingsResult {
  const traditionalTotal = 
    inputs.venueCost + inputs.energyCost + inputs.cateringCost +
    inputs.transportCost + inputs.materialsCost + inputs.wasteDisposalCost;

  // Calculate sustainable costs with savings
  const sustainableVenue = inputs.venueCost * (1 - SAVINGS_FACTORS.venue.renewable);
  const sustainableEnergy = inputs.energyCost * (1 - SAVINGS_FACTORS.energy.renewable);
  const sustainableCatering = inputs.cateringCost * (1 - SAVINGS_FACTORS.catering.vegan);
  const sustainableTransport = inputs.transportCost * (1 - SAVINGS_FACTORS.transport.shuttle);
  const sustainableMaterials = inputs.materialsCost * (1 - SAVINGS_FACTORS.materials.digital);
  const sustainableWaste = inputs.wasteDisposalCost * (1 - SAVINGS_FACTORS.waste.compost);

  const sustainableTotal = 
    sustainableVenue + sustainableEnergy + sustainableCatering +
    sustainableTransport + sustainableMaterials + sustainableWaste;

  const totalSavings = traditionalTotal - sustainableTotal;
  const savingsPercentage = traditionalTotal > 0 ? (totalSavings / traditionalTotal) * 100 : 0;

  // Environmental value estimates
  const carbonValueSaved = (inputs.energyCost * 0.1) + (inputs.transportCost * 0.08);
  const waterValueSaved = inputs.cateringCost * 0.05;
  const wasteValueSaved = inputs.wasteDisposalCost * 0.3;

  // ROI calculation (assuming typical implementation cost is 10% of traditional)
  const implementationCost = traditionalTotal * 0.10;
  const roiPercentage = implementationCost > 0 ? ((totalSavings - implementationCost) / implementationCost) * 100 : 0;
  const paybackMonths = totalSavings > 0 ? Math.ceil((implementationCost / (totalSavings / 12))) : 0;

  return {
    traditionalTotal,
    sustainableTotal,
    totalSavings,
    savingsPercentage,
    roiPercentage,
    paybackMonths,
    carbonValueSaved,
    waterValueSaved,
    wasteValueSaved,
  };
}

export async function saveCostData(eventId: string, organizationId: string, input: CostInput) {
  const results = calculateCostSavings(input);

  await query(
    `INSERT INTO event_costs (
      event_id, venue_cost, energy_cost, catering_cost, transport_cost,
      materials_cost, waste_disposal_cost, region, traditional_total,
      sustainable_total, total_savings, savings_percentage, roi_percentage,
      payback_months, carbon_value_saved, water_value_saved, waste_value_saved
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    ON CONFLICT (event_id) DO UPDATE SET
      venue_cost = $2, energy_cost = $3, catering_cost = $4, transport_cost = $5,
      materials_cost = $6, waste_disposal_cost = $7, region = $8,
      traditional_total = $9, sustainable_total = $10, total_savings = $11,
      savings_percentage = $12, roi_percentage = $13, payback_months = $14,
      carbon_value_saved = $15, water_value_saved = $16, waste_value_saved = $17,
      updated_at = CURRENT_TIMESTAMP`,
    [
      eventId, input.venueCost, input.energyCost, input.cateringCost,
      input.transportCost, input.materialsCost, input.wasteDisposalCost,
      input.region, results.traditionalTotal, results.sustainableTotal,
      results.totalSavings, results.savingsPercentage, results.roiPercentage,
      results.paybackMonths, results.carbonValueSaved, results.waterValueSaved,
      results.wasteValueSaved,
    ]
  );

  await invalidateCachePattern(`events:${organizationId}:*`);
  return results;
}

export async function getCostData(eventId: string, organizationId: string) {
  const results = await query(
    `SELECT ec.* FROM event_costs ec
     JOIN events e ON ec.event_id = e.id
     WHERE ec.event_id = $1 AND e.organization_id = $2`,
    [eventId, organizationId]
  );
  return results[0] || null;
}

export async function getCostSummary(organizationId: string) {
  const cacheKey = `cost_summary:${organizationId}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const result = await query(
    `SELECT 
       COUNT(ec.id) as total_events,
       SUM(ec.total_savings) as total_savings,
       AVG(ec.savings_percentage) as avg_savings_percentage,
       SUM(ec.carbon_value_saved) as total_carbon_value,
       SUM(ec.water_value_saved) as total_water_value,
       SUM(ec.waste_value_saved) as total_waste_value
     FROM event_costs ec
     JOIN events e ON ec.event_id = e.id
     WHERE e.organization_id = $1`,
    [organizationId]
  );

  const summary = result[0] || {};
  await setCache(cacheKey, summary, 600);
  return summary;
}

