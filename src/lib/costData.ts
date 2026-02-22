// Cost savings calculation data and utilities
// Based on industry research from EPA, DOE, and sustainability consulting firms

import { EventInputs, FootprintResult } from './carbonData';

export interface CostInputs {
  venueCost: number;
  energyCost: number;
  cateringCost: number;
  transportCost: number;
  materialsCost: number;
  wasteDisposalCost: number;
  region: string;
  // Advanced inputs for more accurate calculations
  attendeeCount?: number;
  eventDurationHours?: number;
  sustainabilityLevel?: 'basic' | 'moderate' | 'advanced' | 'comprehensive';
}

export const defaultCostInputs: CostInputs = {
  venueCost: 5000,
  energyCost: 1500,
  cateringCost: 8000,
  transportCost: 3000,
  materialsCost: 2000,
  wasteDisposalCost: 500,
  region: 'us',
  attendeeCount: 100,
  eventDurationHours: 8,
  sustainabilityLevel: 'moderate',
};

export interface CostSavingsResult {
  traditionalTotal: number;
  sustainableTotal: number;
  totalSavings: number;
  savingsPercentage: number;
  roiPercentage: number;
  paybackMonths: number;
  netPresentValue: number;
  internalRateOfReturn: number;
  breakdown: {
    venue: { traditional: number; sustainable: number; savings: number; savingsPercent: number };
    energy: { traditional: number; sustainable: number; savings: number; savingsPercent: number };
    catering: { traditional: number; sustainable: number; savings: number; savingsPercent: number };
    transport: { traditional: number; sustainable: number; savings: number; savingsPercent: number };
    materials: { traditional: number; sustainable: number; savings: number; savingsPercent: number };
    waste: { traditional: number; sustainable: number; savings: number; savingsPercent: number };
  };
  carbonValueSaved: number;
  waterValueSaved: number;
  wasteValueSaved: number;
  brandValueImpact: number;
  riskMitigationValue: number;
  totalEconomicBenefit: number;
}

export interface TaxIncentive {
  id: string;
  name: string;
  description: string;
  region: string;
  category: 'energy' | 'waste' | 'carbon' | 'general';
  percentageCredit: number;
  maxCredit: number;
  estimatedValue: number;
  eligibilityCriteria: string[];
}

// ============================================
// INDUSTRY-STANDARD PRICING & FACTORS (2024)
// ============================================

// Carbon pricing (EU ETS average 2024: €80-90/tonne, US voluntary: $15-50/tonne)
const CARBON_PRICES: Record<string, number> = {
  us: 0.025,    // $25/tonne = $0.025/kg (voluntary market average)
  eu: 0.085,    // €85/tonne = €0.085/kg (EU ETS)
  uk: 0.075,    // £75/tonne (UK ETS)
  ca: 0.065,    // CAD 65/tonne (Canadian carbon tax)
  au: 0.030,    // AUD 30/tonne (safeguard mechanism)
};

// Water costs by region (per liter)
const WATER_COSTS: Record<string, number> = {
  us: 0.004,
  eu: 0.006,
  uk: 0.005,
  ca: 0.003,
  au: 0.008,  // Higher due to scarcity
};

// Waste disposal costs by region (per kg)
const WASTE_COSTS: Record<string, number> = {
  us: 0.12,
  eu: 0.18,   // Higher due to stricter regulations
  uk: 0.15,
  ca: 0.10,
  au: 0.14,
};

// Dynamic savings factors based on sustainability implementation level
// Source: Event Industry Council Sustainability Report, GMIC Green Meeting Guidelines
const SUSTAINABILITY_MULTIPLIERS = {
  basic: 0.4,       // Basic sustainability measures
  moderate: 0.7,    // Moderate implementation
  advanced: 0.9,    // Advanced implementation
  comprehensive: 1.0, // Full implementation
};

// Category-specific potential savings (industry benchmarks)
// These represent maximum achievable savings with full implementation
const MAX_SAVINGS_POTENTIAL = {
  venue: {
    base: 0.15,      // Base efficiency improvements
    renewable: 0.25, // Renewable energy premium savings long-term
    smartTech: 0.12, // Smart building technology
    localSourcing: 0.08, // Local venue reduces logistics
  },
  energy: {
    ledLighting: 0.35,    // LED vs traditional lighting
    smartHVAC: 0.25,      // Smart climate control
    renewable: 0.40,      // Renewable energy offset
    offPeak: 0.15,        // Off-peak usage benefits
    naturalLight: 0.20,   // Daylight harvesting
  },
  catering: {
    vegan: 0.35,          // Plant-based meals (lower cost, lower emissions)
    vegetarian: 0.25,     // Vegetarian options
    localSeasonal: 0.20,  // Local & seasonal sourcing
    portionOptimization: 0.18, // Smart portioning reduces waste
    buffetToPlated: 0.12, // Controlled portions
  },
  transport: {
    publicTransit: 0.45,  // Public transport incentives
    shuttle: 0.30,        // Shared shuttle services
    virtualHybrid: 0.60,  // Hybrid event reduces travel
    carbonOffset: 0.15,   // Offset programs (cost, not true savings)
    evFleet: 0.25,        // Electric vehicle fleet
  },
  materials: {
    digital: 0.85,        // Full digital transformation
    minimalPrint: 0.55,   // Reduced printing
    recycledPaper: 0.20,  // Recycled materials
    reusableSignage: 0.40, // Reusable vs single-use
    noSwag: 0.70,         // Eliminating swag bags
  },
  waste: {
    zeroWaste: 0.75,      // Zero waste to landfill
    composting: 0.50,     // Composting program
    recycling: 0.35,      // Comprehensive recycling
    donationProgram: 0.25, // Food/material donation
    reusables: 0.45,      // Reusable serviceware
  },
};

// Brand value multiplier (studies show 66% of consumers willing to pay more for sustainable brands)
const BRAND_VALUE_MULTIPLIER = 0.03; // 3% of event costs as brand value

// Risk mitigation value (regulatory compliance, reputation protection)
const RISK_MITIGATION_MULTIPLIER = 0.02; // 2% of event costs

export function calculateCostSavings(
  carbonInputs: EventInputs,
  carbonResult: FootprintResult,
  costInputs: CostInputs
): CostSavingsResult {
  const region = costInputs.region || 'us';
  const sustainabilityMultiplier = SUSTAINABILITY_MULTIPLIERS[costInputs.sustainabilityLevel || 'moderate'];
  const attendees = costInputs.attendeeCount || carbonInputs.venue.attendees || 100;
  const duration = costInputs.eventDurationHours || (carbonInputs.venue.duration * 8) || 8;

  // Calculate total traditional costs
  const totalTraditional = costInputs.venueCost + costInputs.energyCost +
    costInputs.cateringCost + costInputs.transportCost +
    costInputs.materialsCost + costInputs.wasteDisposalCost;

  // ============================================
  // VENUE SAVINGS CALCULATION
  // ============================================
  let venueReduction = MAX_SAVINGS_POTENTIAL.venue.base;

  if (carbonInputs.venue.energySource === 'renewable' || carbonInputs.venue.energySource === 'solar') {
    venueReduction += MAX_SAVINGS_POTENTIAL.venue.renewable;
  }
  if (carbonInputs.venue.type === 'outdoor') {
    venueReduction += MAX_SAVINGS_POTENTIAL.venue.localSourcing;
  }
  // Scale by sustainability level
  venueReduction = Math.min(venueReduction * sustainabilityMultiplier, 0.40);

  // ============================================
  // ENERGY SAVINGS CALCULATION
  // ============================================
  let energyReduction = 0;

  // Base efficiency improvements scale with cost (higher costs = more room for savings)
  const energyCostPerAttendee = costInputs.energyCost / attendees;
  if (energyCostPerAttendee > 15) {
    energyReduction += MAX_SAVINGS_POTENTIAL.energy.ledLighting;
  } else if (energyCostPerAttendee > 8) {
    energyReduction += MAX_SAVINGS_POTENTIAL.energy.ledLighting * 0.6;
  } else {
    energyReduction += MAX_SAVINGS_POTENTIAL.energy.ledLighting * 0.3;
  }

  if (carbonInputs.venue.energySource === 'renewable') {
    energyReduction += MAX_SAVINGS_POTENTIAL.energy.renewable;
  } else if (carbonInputs.venue.energySource === 'solar') {
    energyReduction += MAX_SAVINGS_POTENTIAL.energy.renewable * 0.8;
  }

  // Smart HVAC savings based on venue size
  if (carbonInputs.venue.size === 'large' || carbonInputs.venue.size === 'arena') {
    energyReduction += MAX_SAVINGS_POTENTIAL.energy.smartHVAC;
  }

  energyReduction = Math.min(energyReduction * sustainabilityMultiplier, 0.65);

  // ============================================
  // CATERING SAVINGS CALCULATION
  // ============================================
  let cateringReduction = 0;

  // Meal type impact
  if (carbonInputs.fnb.mealType === 'vegan') {
    cateringReduction += MAX_SAVINGS_POTENTIAL.catering.vegan;
  } else if (carbonInputs.fnb.mealType === 'vegetarian') {
    cateringReduction += MAX_SAVINGS_POTENTIAL.catering.vegetarian;
  }

  // Local sourcing (estimate based on sustainable practices)
  if (carbonInputs.fnb.localSourcing) {
    cateringReduction += MAX_SAVINGS_POTENTIAL.catering.localSeasonal;
  }

  // Beverage optimization
  const bevCount = (carbonInputs.fnb.water ? 1 : 0) + (carbonInputs.fnb.coffee ? 1 : 0) +
                   (carbonInputs.fnb.softDrinks ? 1 : 0) + (carbonInputs.fnb.alcohol ? 1 : 0);
  if (bevCount <= 2) {
    cateringReduction += MAX_SAVINGS_POTENTIAL.catering.portionOptimization * 0.5;
  }

  // Scale by catering cost per person (higher = more savings potential)
  const cateringPerPerson = costInputs.cateringCost / attendees;
  const cateringScaleFactor = Math.min(cateringPerPerson / 50, 1.5); // $50/person as baseline
  cateringReduction = Math.min(cateringReduction * sustainabilityMultiplier * cateringScaleFactor, 0.45);

  // ============================================
  // TRANSPORT SAVINGS CALCULATION
  // ============================================
  let transportReduction = 0;

  if (carbonInputs.transport.transportMode === 'public') {
    transportReduction += MAX_SAVINGS_POTENTIAL.transport.publicTransit;
  } else if (carbonInputs.transport.transportMode === 'carpool') {
    transportReduction += MAX_SAVINGS_POTENTIAL.transport.shuttle * 0.8;
  }

  if (carbonInputs.transport.shuttleService) {
    transportReduction += MAX_SAVINGS_POTENTIAL.transport.shuttle;
  }

  // Distance factor - longer distances have more savings potential
  const avgDistanceKm = carbonInputs.transport.avgDistanceKm || 50;
  const distanceMultiplier = Math.min(avgDistanceKm / 100, 1.3);

  transportReduction = Math.min(transportReduction * sustainabilityMultiplier * distanceMultiplier, 0.55);

  // ============================================
  // MATERIALS SAVINGS CALCULATION
  // ============================================
  let materialsReduction = 0;

  if (carbonInputs.materials.digitalAlternatives) {
    materialsReduction += MAX_SAVINGS_POTENTIAL.materials.digital;
  } else if (carbonInputs.materials.printedMaterials === 'minimal') {
    materialsReduction += MAX_SAVINGS_POTENTIAL.materials.minimalPrint;
  } else if (carbonInputs.materials.printedMaterials === 'moderate') {
    materialsReduction += MAX_SAVINGS_POTENTIAL.materials.minimalPrint * 0.5;
  }

  if (!carbonInputs.materials.swagBags) {
    materialsReduction += MAX_SAVINGS_POTENTIAL.materials.noSwag * 0.7;
  }

  // Higher material costs = more savings potential
  const materialsPerPerson = costInputs.materialsCost / attendees;
  const materialsScaleFactor = Math.min(materialsPerPerson / 20, 1.4);

  materialsReduction = Math.min(materialsReduction * sustainabilityMultiplier * materialsScaleFactor, 0.80);

  // ============================================
  // WASTE SAVINGS CALCULATION
  // ============================================
  let wasteReduction = MAX_SAVINGS_POTENTIAL.waste.recycling * 0.5; // Base recycling

  if (carbonInputs.materials.digitalAlternatives && !carbonInputs.materials.swagBags) {
    wasteReduction += MAX_SAVINGS_POTENTIAL.waste.zeroWaste * 0.6;
  }

  if (carbonInputs.fnb.mealType === 'vegan' || carbonInputs.fnb.mealType === 'vegetarian') {
    wasteReduction += MAX_SAVINGS_POTENTIAL.waste.composting * 0.4;
  }

  // Waste cost scale factor
  const wastePerPerson = costInputs.wasteDisposalCost / attendees;
  const wasteScaleFactor = Math.min(wastePerPerson / 5, 1.5);

  wasteReduction = Math.min(wasteReduction * sustainabilityMultiplier * wasteScaleFactor, 0.70);

  // ============================================
  // CALCULATE BREAKDOWN
  // ============================================
  const breakdown = {
    venue: {
      traditional: costInputs.venueCost,
      sustainable: Math.round(costInputs.venueCost * (1 - venueReduction)),
      savings: Math.round(costInputs.venueCost * venueReduction),
      savingsPercent: Math.round(venueReduction * 100),
    },
    energy: {
      traditional: costInputs.energyCost,
      sustainable: Math.round(costInputs.energyCost * (1 - energyReduction)),
      savings: Math.round(costInputs.energyCost * energyReduction),
      savingsPercent: Math.round(energyReduction * 100),
    },
    catering: {
      traditional: costInputs.cateringCost,
      sustainable: Math.round(costInputs.cateringCost * (1 - cateringReduction)),
      savings: Math.round(costInputs.cateringCost * cateringReduction),
      savingsPercent: Math.round(cateringReduction * 100),
    },
    transport: {
      traditional: costInputs.transportCost,
      sustainable: Math.round(costInputs.transportCost * (1 - transportReduction)),
      savings: Math.round(costInputs.transportCost * transportReduction),
      savingsPercent: Math.round(transportReduction * 100),
    },
    materials: {
      traditional: costInputs.materialsCost,
      sustainable: Math.round(costInputs.materialsCost * (1 - materialsReduction)),
      savings: Math.round(costInputs.materialsCost * materialsReduction),
      savingsPercent: Math.round(materialsReduction * 100),
    },
    waste: {
      traditional: costInputs.wasteDisposalCost,
      sustainable: Math.round(costInputs.wasteDisposalCost * (1 - wasteReduction)),
      savings: Math.round(costInputs.wasteDisposalCost * wasteReduction),
      savingsPercent: Math.round(wasteReduction * 100),
    },
  };

  const traditionalTotal = Object.values(breakdown).reduce((sum, cat) => sum + cat.traditional, 0);
  const sustainableTotal = Object.values(breakdown).reduce((sum, cat) => sum + cat.sustainable, 0);
  const totalSavings = traditionalTotal - sustainableTotal;

  // ============================================
  // ENVIRONMENTAL VALUE CALCULATIONS
  // ============================================
  const carbonPrice = CARBON_PRICES[region] || CARBON_PRICES.us;
  const waterCost = WATER_COSTS[region] || WATER_COSTS.us;
  const wasteCost = WASTE_COSTS[region] || WASTE_COSTS.us;

  // Carbon value includes social cost of carbon ($51/tonne EPA) + market price
  const socialCostOfCarbon = 0.051; // $51/tonne
  const carbonValueSaved = Math.round(carbonResult.carbonKg * (carbonPrice + socialCostOfCarbon));
  const waterValueSaved = Math.round(carbonResult.waterLiters * waterCost);
  const wasteValueSaved = Math.round(carbonResult.wasteKg * wasteCost);

  // ============================================
  // BRAND & RISK VALUE
  // ============================================
  const brandValueImpact = Math.round(totalTraditional * BRAND_VALUE_MULTIPLIER * (carbonResult.greenScore / 100));
  const riskMitigationValue = Math.round(totalTraditional * RISK_MITIGATION_MULTIPLIER);

  // ============================================
  // TOTAL ECONOMIC BENEFIT
  // ============================================
  const totalEconomicBenefit = totalSavings + carbonValueSaved + waterValueSaved +
    wasteValueSaved + brandValueImpact + riskMitigationValue;

  // ============================================
  // FINANCIAL METRICS
  // ============================================
  const savingsPercentage = traditionalTotal > 0 ? Math.round((totalSavings / traditionalTotal) * 100) : 0;

  // ROI = (Total Economic Benefit / Implementation Cost) * 100
  // Assume implementation cost is 10% of sustainable total
  const implementationCost = sustainableTotal * 0.10;
  const roiPercentage = implementationCost > 0
    ? Math.round((totalEconomicBenefit / implementationCost) * 100)
    : 0;

  // Payback period in months
  const monthlyBenefit = totalEconomicBenefit / 12;
  const paybackMonths = monthlyBenefit > 0
    ? Math.max(1, Math.round(implementationCost / monthlyBenefit))
    : 0;

  // Net Present Value (5% discount rate, 3-year horizon)
  const discountRate = 0.05;
  const years = 3;
  let npv = -implementationCost;
  for (let i = 1; i <= years; i++) {
    npv += totalEconomicBenefit / Math.pow(1 + discountRate, i);
  }
  const netPresentValue = Math.round(npv);

  // Internal Rate of Return (simplified approximation)
  const internalRateOfReturn = implementationCost > 0
    ? Math.round(((totalEconomicBenefit / implementationCost) - 1) * 100)
    : 0;

  return {
    traditionalTotal,
    sustainableTotal,
    totalSavings,
    savingsPercentage,
    roiPercentage,
    paybackMonths,
    netPresentValue,
    internalRateOfReturn,
    breakdown,
    carbonValueSaved,
    waterValueSaved,
    wasteValueSaved,
    brandValueImpact,
    riskMitigationValue,
    totalEconomicBenefit,
  };
}

// Import API for fetching incentives from backend
import { incentivesApi } from '../services/api';

// Fallback tax incentives (used when API is unavailable or user is not authenticated)
const FALLBACK_INCENTIVES: Omit<TaxIncentive, 'estimatedValue'>[] = [
  {
    id: 'us-renewable-credit',
    name: 'Renewable Energy Tax Credit',
    description: 'Federal tax credit for using renewable energy at events',
    region: 'us',
    category: 'energy',
    percentageCredit: 30,
    maxCredit: 10000,
    eligibilityCriteria: ['Use 80%+ renewable energy', 'Events over 100 attendees'],
  },
  {
    id: 'us-carbon-offset',
    name: 'Carbon Offset Deduction',
    description: 'Deduction for verified carbon offset purchases',
    region: 'us',
    category: 'carbon',
    percentageCredit: 15,
    maxCredit: 5000,
    eligibilityCriteria: ['Purchase verified carbon offsets', 'Document emissions reduced'],
  },
  {
    id: 'eu-green-event',
    name: 'EU Green Event Certification Grant',
    description: 'Grant for events meeting EU sustainability standards',
    region: 'eu',
    category: 'general',
    percentageCredit: 25,
    maxCredit: 15000,
    eligibilityCriteria: ['Meet EU Ecolabel standards', 'Complete certification process'],
  },
  {
    id: 'uk-energy-savings',
    name: 'UK Energy Savings Opportunity Scheme',
    description: 'Compliance credit for energy-efficient events',
    region: 'uk',
    category: 'energy',
    percentageCredit: 20,
    maxCredit: 8000,
    eligibilityCriteria: ['Submit energy audit', 'Implement efficiency measures'],
  },
  {
    id: 'ca-green-business',
    name: 'Canada Green Business Credit',
    description: 'Federal credit for sustainable business practices',
    region: 'ca',
    category: 'general',
    percentageCredit: 15,
    maxCredit: 7500,
    eligibilityCriteria: ['Register as green business', 'Annual sustainability reporting'],
  },
];

// Fetch tax incentives from API
export async function fetchTaxIncentives(region?: string): Promise<TaxIncentive[]> {
  try {
    const result = await incentivesApi.getAll(region);
    if (result.data?.incentives) {
      return result.data.incentives.map((inc: any) => ({
        ...inc,
        estimatedValue: 0, // Will be calculated based on event data
      }));
    }
  } catch (error) {
    console.error('Failed to fetch incentives from API:', error);
  }
  // Fallback to local data
  return getApplicableTaxIncentives(region || 'us', { carbonKg: 0, waterLiters: 0, wasteKg: 0, greenScore: 50, breakdown: { venue: 0, fnb: 0, transport: 0, materials: 0 } });
}

// Local calculation (for demo/preview mode when not authenticated)
export function getApplicableTaxIncentives(
  region: string,
  carbonResult: FootprintResult
): TaxIncentive[] {
  const regionIncentives = FALLBACK_INCENTIVES.filter(
    (inc) => inc.region === region || inc.region === 'global'
  );

  return regionIncentives.map((incentive) => {
    // Estimate value based on carbon savings and green score
    const baseValue = carbonResult.greenScore >= 80
      ? incentive.maxCredit
      : carbonResult.greenScore >= 60
        ? incentive.maxCredit * 0.7
        : incentive.maxCredit * 0.4;

    return {
      ...incentive,
      estimatedValue: Math.round(Math.min(baseValue, incentive.maxCredit)),
    };
  });
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const REGION_OPTIONS = [
  { value: 'us', label: 'United States', currency: 'USD' },
  { value: 'eu', label: 'European Union', currency: 'EUR' },
  { value: 'uk', label: 'United Kingdom', currency: 'GBP' },
  { value: 'ca', label: 'Canada', currency: 'CAD' },
  { value: 'au', label: 'Australia', currency: 'AUD' },
];

