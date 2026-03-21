import { query } from '../config/database';
import { logger } from '../utils/logger';

interface TaxIncentiveInput {
  eventId: number;
  organizationId: number;
  carbonReductionKg: number;
  investmentAmountZar: number;
  taxYear?: string;
}

interface TaxIncentiveResult {
  section12lDeduction: number;
  section12bAllowance: number;
  totalTaxBenefit: number;
  breakdown: {
    energyEfficiencyAllowance: number;
    renewableEnergyDeduction: number;
    carbonTaxSavings: number;
  };
  recommendations: string[];
}

/**
 * Calculate South African tax incentives for carbon reduction
 * Based on:
 * - Section 12L: Energy Efficiency Tax Incentive
 * - Section 12B: Accelerated Depreciation for Renewable Energy
 * - Carbon Tax Act savings
 */
export async function calculateTaxIncentives(input: TaxIncentiveInput): Promise<TaxIncentiveResult> {
  try {
    const carbonReductionTons = input.carbonReductionKg / 1000;
    
    // Section 12L: Energy Efficiency Tax Incentive
    // R0.95 per kWh saved (converted from carbon reduction)
    // Assume 0.95 kg CO2 per kWh (Eskom grid average)
    const kWhSaved = input.carbonReductionKg / 0.95;
    const section12lDeduction = kWhSaved * 0.95; // R0.95 per kWh

    // Section 12B: Accelerated Depreciation (50% in year 1, 30% year 2, 20% year 3)
    // Applies to renewable energy equipment
    const renewableInvestment = input.investmentAmountZar * 0.3; // Assume 30% is renewable
    const section12bAllowance = renewableInvestment * 0.50; // First year 50%

    // Carbon Tax Savings
    // South Africa Carbon Tax: R144 per ton CO2e (2024 rate, increases annually)
    const carbonTaxRate = 159; // R159 per ton (2026 estimated rate)
    const carbonTaxSavings = carbonReductionTons * carbonTaxRate;

    // Total Tax Benefit
    const totalTaxBenefit = section12lDeduction + section12bAllowance + carbonTaxSavings;

    // Breakdown
    const breakdown = {
      energyEfficiencyAllowance: section12lDeduction,
      renewableEnergyDeduction: section12bAllowance,
      carbonTaxSavings: carbonTaxSavings
    };

    // Recommendations
    const recommendations = generateRecommendations(input, carbonReductionTons);

    // Save to database
    await query(
      `INSERT INTO event_tax_calculations (
        event_id, organization_id, carbon_reduction_kg, investment_amount_zar,
        section_12l_deduction, section_12b_allowance, total_tax_benefit, tax_year, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        input.eventId,
        input.organizationId,
        input.carbonReductionKg,
        input.investmentAmountZar,
        section12lDeduction,
        section12bAllowance,
        totalTaxBenefit,
        input.taxYear || getCurrentTaxYear(),
        JSON.stringify({ breakdown, recommendations })
      ]
    );

    logger.info(`Tax incentive calculated for event ${input.eventId}: R${totalTaxBenefit.toFixed(2)}`);

    return {
      section12lDeduction,
      section12bAllowance,
      totalTaxBenefit,
      breakdown,
      recommendations
    };

  } catch (error) {
    logger.error('Failed to calculate tax incentives:', error);
    throw new Error('Tax incentive calculation failed');
  }
}

/**
 * Generate tax optimization recommendations
 */
function generateRecommendations(input: TaxIncentiveInput, carbonReductionTons: number): string[] {
  const recommendations: string[] = [];

  if (carbonReductionTons >= 1) {
    recommendations.push(
      'Qualify for Section 12L Energy Efficiency Tax Incentive - submit application to SANEDI'
    );
  }

  if (input.investmentAmountZar >= 50000) {
    recommendations.push(
      'Consider investing in renewable energy equipment to maximize Section 12B accelerated depreciation'
    );
  }

  if (carbonReductionTons >= 5) {
    recommendations.push(
      'Significant carbon reduction achieved - consider registering for voluntary carbon credits'
    );
  }

  recommendations.push(
    'Maintain detailed records of energy consumption and carbon reduction for SARS audit purposes'
  );

  recommendations.push(
    'Consult with a tax professional to optimize your carbon tax liability and claim all eligible deductions'
  );

  return recommendations;
}

/**
 * Get current South African tax year (March to February)
 */
function getCurrentTaxYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  
  if (month >= 3) {
    return `${year}/${year + 1}`;
  } else {
    return `${year - 1}/${year}`;
  }
}

/**
 * Get tax incentive calculation by event ID
 */
export async function getTaxIncentiveByEventId(eventId: number): Promise<any> {
  const result = await query(
    'SELECT * FROM event_tax_calculations WHERE event_id = $1 ORDER BY created_at DESC LIMIT 1',
    [eventId]
  );
  return result[0] || null;
}

/**
 * Get all tax incentives for an organization
 */
export async function getTaxIncentivesByOrganization(organizationId: number, taxYear?: string): Promise<any[]> {
  let sql = 'SELECT * FROM event_tax_calculations WHERE organization_id = $1';
  const params: any[] = [organizationId];

  if (taxYear) {
    sql += ' AND tax_year = $2';
    params.push(taxYear);
  }

  sql += ' ORDER BY created_at DESC';

  return await query(sql, params);
}

