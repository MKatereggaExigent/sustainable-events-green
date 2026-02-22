// Pre-Assessment Calculator Data and Utilities
// Industry-leading emission factors based on GHG Protocol, ISO 14064, and latest research

// ============================================
// EVENT PROFILE TYPES AND BENCHMARKS
// ============================================

export type EventFormat = 'in-person' | 'virtual' | 'hybrid';
export type EventType = 'conference' | 'corporate-meeting' | 'trade-show' | 'workshop' | 'gala' | 'product-launch' | 'training' | 'networking';
export type EventScale = 'small' | 'medium' | 'large' | 'mega';

export interface EventProfileData {
  eventType: EventType;
  eventFormat: EventFormat;
  expectedAttendees: number;
  durationDays: number;
  durationHoursPerDay: number;
  industry: string;
  isInternational: boolean;
}

// Industry benchmark data (tonnes CO2e per attendee)
export const EVENT_BENCHMARKS: Record<EventType, { average: number; best: number; worst: number }> = {
  'conference': { average: 1.8, best: 0.4, worst: 3.5 },
  'corporate-meeting': { average: 0.8, best: 0.2, worst: 1.8 },
  'trade-show': { average: 2.5, best: 0.8, worst: 5.0 },
  'workshop': { average: 0.5, best: 0.1, worst: 1.2 },
  'gala': { average: 1.2, best: 0.4, worst: 2.5 },
  'product-launch': { average: 1.5, best: 0.5, worst: 3.0 },
  'training': { average: 0.4, best: 0.1, worst: 1.0 },
  'networking': { average: 0.6, best: 0.2, worst: 1.4 },
};

// Format emission multipliers (virtual = baseline at 0.06)
export const FORMAT_MULTIPLIERS: Record<EventFormat, number> = {
  'virtual': 0.06,      // 94% less than in-person
  'hybrid': 0.33,       // 67% less than in-person (weighted average)
  'in-person': 1.0,     // Baseline
};

// Scale definitions
export const SCALE_THRESHOLDS: Record<EventScale, { min: number; max: number }> = {
  'small': { min: 1, max: 50 },
  'medium': { min: 51, max: 250 },
  'large': { min: 251, max: 1000 },
  'mega': { min: 1001, max: 100000 },
};

// ============================================
// ATTENDEE & TRAVEL INTELLIGENCE
// ============================================

export type TravelMode = 'air-short' | 'air-medium' | 'air-long' | 'train' | 'car' | 'bus' | 'local';
export type AttendeeRegion = 'local' | 'domestic' | 'continental' | 'international';

export interface AttendeeProfile {
  region: AttendeeRegion;
  percentage: number;
  avgDistanceKm: number;
  primaryTravelMode: TravelMode;
}

export interface AttendeeData {
  totalAttendees: number;
  profiles: AttendeeProfile[];
  virtualAttendeePercent: number;
  accommodationNights: number;
}

// Travel emission factors (kg CO2e per passenger-km)
export const TRAVEL_EMISSION_FACTORS: Record<TravelMode, number> = {
  'air-short': 0.255,    // Flights < 500km
  'air-medium': 0.195,   // Flights 500-1500km
  'air-long': 0.150,     // Flights > 1500km
  'train': 0.041,        // Average rail
  'car': 0.171,          // Average car (single occupancy)
  'bus': 0.089,          // Coach/bus
  'local': 0.020,        // Local transit/walking
};

// Accommodation emission factor (kg CO2e per night)
export const ACCOMMODATION_FACTOR = 21.2; // Average hotel night

// Regional distance estimates (km)
export const REGIONAL_DISTANCES: Record<AttendeeRegion, { min: number; max: number; typical: number }> = {
  'local': { min: 0, max: 50, typical: 25 },
  'domestic': { min: 50, max: 800, typical: 400 },
  'continental': { min: 800, max: 3000, typical: 1500 },
  'international': { min: 3000, max: 15000, typical: 8000 },
};

// ============================================
// VENUE SUSTAINABILITY SCORING
// ============================================

export type EnergySource = 'grid-standard' | 'grid-renewable' | 'onsite-solar' | 'onsite-wind' | 'mixed-renewable' | 'carbon-neutral';
export type VenueType = 'convention-center' | 'hotel' | 'corporate-office' | 'outdoor' | 'hybrid-space' | 'unique-venue';

export interface VenueData {
  venueType: VenueType;
  energySource: EnergySource;
  sqMeters: number;
  hasLeedCertification: boolean;
  hasWasteProgram: boolean;
  hasWaterConservation: boolean;
  distanceFromCityCenter: number;
  publicTransitAccess: 'excellent' | 'good' | 'limited' | 'none';
}

// Energy source emission factors (kg CO2e per kWh)
export const ENERGY_EMISSION_FACTORS: Record<EnergySource, number> = {
  'grid-standard': 0.42,
  'grid-renewable': 0.10,
  'onsite-solar': 0.05,
  'onsite-wind': 0.03,
  'mixed-renewable': 0.15,
  'carbon-neutral': 0.01,
};

// Venue type energy intensity (kWh per sqm per hour)
export const VENUE_ENERGY_INTENSITY: Record<VenueType, number> = {
  'convention-center': 0.08,
  'hotel': 0.12,
  'corporate-office': 0.06,
  'outdoor': 0.02,
  'hybrid-space': 0.05,
  'unique-venue': 0.07,
};

// ============================================
// CATERING & MATERIALS
// ============================================

export type MealType = 'full-meat' | 'mixed-meat-veg' | 'pescatarian' | 'vegetarian' | 'vegan' | 'local-organic';
export type BeverageOption = 'standard' | 'local-craft' | 'organic' | 'minimal';
export type MaterialLevel = 'standard' | 'reduced' | 'digital-first' | 'zero-waste';

export interface CateringData {
  mealsPerDay: number;
  mealType: MealType;
  beverageOption: BeverageOption;
  localSourcingPercent: number;
  organicPercent: number;
}

export interface MaterialsData {
  printedMaterials: MaterialLevel;
  swagBags: boolean;
  exhibitorMaterials: boolean;
  decorationLevel: 'minimal' | 'moderate' | 'extensive';
  wasteManagement: 'standard' | 'recycling' | 'composting' | 'zero-waste';
}

// Meal emission factors (kg CO2e per meal)
export const MEAL_EMISSION_FACTORS: Record<MealType, number> = {
  'full-meat': 7.2,
  'mixed-meat-veg': 5.5,
  'pescatarian': 4.0,
  'vegetarian': 2.5,
  'vegan': 1.5,
  'local-organic': 2.0,
};

// Material waste factors (kg per attendee)
export const MATERIAL_WASTE_FACTORS: Record<MaterialLevel, number> = {
  'standard': 3.5,
  'reduced': 2.0,
  'digital-first': 0.8,
  'zero-waste': 0.2,
};

// ============================================
// VIRTUAL/HYBRID EVENT FACTORS
// ============================================

export interface VirtualEventData {
  streamingHours: number;
  platformType: 'basic' | 'standard' | 'premium' | 'enterprise';
  recordingStorage: boolean;
  interactiveFeatures: boolean;
}

// Digital emission factors
export const STREAMING_EMISSION_FACTOR = 0.036; // kg CO2e per viewer-hour
export const DEVICE_EMISSION_FACTOR = 0.015;    // kg CO2e per attendee-hour

// ============================================
// PRE-ASSESSMENT RESULT INTERFACES
// ============================================

export interface PreAssessmentResult {
  estimatedCarbonKg: number;
  estimatedCarbonPerAttendee: number;
  industryComparison: 'excellent' | 'good' | 'average' | 'below-average' | 'poor';
  percentileBenchmark: number;
  breakdownByCategory: {
    travel: number;
    venue: number;
    catering: number;
    materials: number;
    digital: number;
    accommodation: number;
  };
  recommendations: string[];
  potentialSavings: {
    category: string;
    action: string;
    savingsKg: number;
    savingsPercent: number;
  }[];
  riskFactors: string[];
  opportunityScore: number; // 0-100
}

// ============================================
// CALCULATION FUNCTIONS
// ============================================

export function getEventScale(attendees: number): EventScale {
  if (attendees <= 50) return 'small';
  if (attendees <= 250) return 'medium';
  if (attendees <= 1000) return 'large';
  return 'mega';
}

export function calculateTravelEmissions(data: AttendeeData): number {
  let totalEmissions = 0;
  const inPersonAttendees = data.totalAttendees * (1 - data.virtualAttendeePercent / 100);

  for (const profile of data.profiles) {
    const attendeesInGroup = inPersonAttendees * (profile.percentage / 100);
    const distanceKm = profile.avgDistanceKm;
    const emissionFactor = TRAVEL_EMISSION_FACTORS[profile.primaryTravelMode];

    // Round trip emissions
    totalEmissions += attendeesInGroup * distanceKm * 2 * emissionFactor;
  }

  // Add accommodation emissions
  const accommodationEmissions = inPersonAttendees * data.accommodationNights * ACCOMMODATION_FACTOR;

  return totalEmissions + accommodationEmissions;
}

export function calculateVenueEmissions(data: VenueData, durationHours: number): number {
  const energyIntensity = VENUE_ENERGY_INTENSITY[data.venueType];
  const emissionFactor = ENERGY_EMISSION_FACTORS[data.energySource];

  let baseEmissions = data.sqMeters * energyIntensity * durationHours * emissionFactor;

  // Apply reductions for certifications
  if (data.hasLeedCertification) baseEmissions *= 0.75;
  if (data.hasWaterConservation) baseEmissions *= 0.95;

  return baseEmissions;
}

export function calculateCateringEmissions(data: CateringData, attendees: number, days: number): number {
  const baseMealEmissions = MEAL_EMISSION_FACTORS[data.mealType];
  const totalMeals = attendees * data.mealsPerDay * days;

  let emissions = totalMeals * baseMealEmissions;

  // Apply local sourcing reduction (up to 20% reduction)
  emissions *= (1 - (data.localSourcingPercent / 100) * 0.20);

  // Apply organic reduction (up to 10% reduction)
  emissions *= (1 - (data.organicPercent / 100) * 0.10);

  return emissions;
}

export function calculateMaterialsEmissions(data: MaterialsData, attendees: number): number {
  const baseWaste = MATERIAL_WASTE_FACTORS[data.printedMaterials];
  let wasteKg = attendees * baseWaste;

  // Add swag bag impact
  if (data.swagBags) wasteKg += attendees * 1.5;

  // Add exhibitor materials
  if (data.exhibitorMaterials) wasteKg += attendees * 2.0;

  // Decoration impact
  const decorationMultipliers = { 'minimal': 0.5, 'moderate': 1.0, 'extensive': 2.0 };
  wasteKg *= decorationMultipliers[data.decorationLevel];

  // Waste management efficiency
  const wasteReductions = { 'standard': 0, 'recycling': 0.3, 'composting': 0.5, 'zero-waste': 0.8 };
  const reduction = wasteReductions[data.wasteManagement];

  // Convert waste to CO2e (approx 2.5 kg CO2e per kg waste)
  return wasteKg * 2.5 * (1 - reduction);
}

export function calculateDigitalEmissions(data: VirtualEventData, attendees: number): number {
  const streamingEmissions = attendees * data.streamingHours * STREAMING_EMISSION_FACTOR;
  const deviceEmissions = attendees * data.streamingHours * DEVICE_EMISSION_FACTOR;

  const platformMultipliers = { 'basic': 0.8, 'standard': 1.0, 'premium': 1.3, 'enterprise': 1.5 };
  let totalDigital = (streamingEmissions + deviceEmissions) * platformMultipliers[data.platformType];

  if (data.recordingStorage) totalDigital *= 1.1;
  if (data.interactiveFeatures) totalDigital *= 1.15;

  return totalDigital;
}

export interface FormatComparisonResult {
  format: EventFormat;
  estimatedCarbonKg: number;
  estimatedCarbonPerAttendee: number;
  costIndex: number; // 1.0 = in-person baseline
  engagementScore: number; // 0-100
  accessibilityScore: number; // 0-100
  networkingScore: number; // 0-100
  recommendationReason: string;
}

export function compareFormats(
  attendees: number,
  avgTravelDistance: number,
  durationDays: number
): FormatComparisonResult[] {
  const inPersonTravel = attendees * avgTravelDistance * 2 * 0.195; // avg air medium
  const inPersonAccom = attendees * durationDays * ACCOMMODATION_FACTOR;
  const inPersonVenue = 500 * 0.08 * durationDays * 8 * 0.42; // avg venue
  const inPersonCatering = attendees * 2 * durationDays * 5.5;
  const inPersonTotal = inPersonTravel + inPersonAccom + inPersonVenue + inPersonCatering;

  // Virtual event calculation
  const virtualHours = durationDays * 6;
  const virtualEmissions = attendees * virtualHours * (STREAMING_EMISSION_FACTOR + DEVICE_EMISSION_FACTOR);

  // Hybrid (50% virtual, 50% in-person with shorter travel)
  const hybridInPerson = attendees * 0.5;
  const hybridVirtual = attendees * 0.5;
  const hybridTotal = (
    hybridInPerson * avgTravelDistance * 2 * 0.195 +
    hybridInPerson * durationDays * ACCOMMODATION_FACTOR +
    inPersonVenue * 0.7 +
    hybridInPerson * 2 * durationDays * 5.5 +
    hybridVirtual * virtualHours * (STREAMING_EMISSION_FACTOR + DEVICE_EMISSION_FACTOR)
  );

  return [
    {
      format: 'in-person',
      estimatedCarbonKg: Math.round(inPersonTotal),
      estimatedCarbonPerAttendee: Math.round(inPersonTotal / attendees * 10) / 10,
      costIndex: 1.0,
      engagementScore: 95,
      accessibilityScore: 60,
      networkingScore: 98,
      recommendationReason: 'Best for high-value networking and immersive experiences'
    },
    {
      format: 'virtual',
      estimatedCarbonKg: Math.round(virtualEmissions),
      estimatedCarbonPerAttendee: Math.round(virtualEmissions / attendees * 10) / 10,
      costIndex: 0.35,
      engagementScore: 70,
      accessibilityScore: 95,
      networkingScore: 55,
      recommendationReason: 'Maximum reach and sustainability, ideal for information sharing'
    },
    {
      format: 'hybrid',
      estimatedCarbonKg: Math.round(hybridTotal),
      estimatedCarbonPerAttendee: Math.round(hybridTotal / attendees * 10) / 10,
      costIndex: 0.75,
      engagementScore: 85,
      accessibilityScore: 85,
      networkingScore: 80,
      recommendationReason: 'Balanced approach combining reach with valuable in-person interactions'
    }
  ];
}

export function generateRecommendations(
  emissions: { travel: number; venue: number; catering: number; materials: number },
  eventType: EventType,
  format: EventFormat
): { category: string; action: string; savingsKg: number; savingsPercent: number }[] {
  const recommendations: { category: string; action: string; savingsKg: number; savingsPercent: number }[] = [];

  // Travel recommendations (usually 70-80% of emissions)
  if (emissions.travel > 0) {
    recommendations.push({
      category: 'Travel',
      action: 'Offer virtual attendance option for remote attendees',
      savingsKg: Math.round(emissions.travel * 0.3),
      savingsPercent: 30
    });
    recommendations.push({
      category: 'Travel',
      action: 'Provide shuttle service from major transit hubs',
      savingsKg: Math.round(emissions.travel * 0.15),
      savingsPercent: 15
    });
  }

  // Venue recommendations
  if (emissions.venue > 0) {
    recommendations.push({
      category: 'Venue',
      action: 'Choose a LEED-certified or renewable-powered venue',
      savingsKg: Math.round(emissions.venue * 0.35),
      savingsPercent: 35
    });
  }

  // Catering recommendations
  if (emissions.catering > 0) {
    recommendations.push({
      category: 'Catering',
      action: 'Switch to plant-forward menu with local sourcing',
      savingsKg: Math.round(emissions.catering * 0.45),
      savingsPercent: 45
    });
  }

  // Materials recommendations
  if (emissions.materials > 0) {
    recommendations.push({
      category: 'Materials',
      action: 'Go digital-first with event app and QR codes',
      savingsKg: Math.round(emissions.materials * 0.65),
      savingsPercent: 65
    });
  }

  return recommendations.sort((a, b) => b.savingsKg - a.savingsKg);
}

// Industry-specific multipliers
export const INDUSTRY_MULTIPLIERS: Record<string, number> = {
  'technology': 0.9,
  'finance': 1.1,
  'healthcare': 0.95,
  'manufacturing': 1.2,
  'retail': 1.0,
  'education': 0.85,
  'government': 0.95,
  'nonprofit': 0.80,
  'entertainment': 1.15,
  'other': 1.0
};

export const INDUSTRIES = [
  'technology', 'finance', 'healthcare', 'manufacturing',
  'retail', 'education', 'government', 'nonprofit', 'entertainment', 'other'
];

export const EVENT_TYPES: { value: EventType; label: string; description: string }[] = [
  { value: 'conference', label: 'Conference', description: 'Multi-day industry gathering with keynotes and sessions' },
  { value: 'corporate-meeting', label: 'Corporate Meeting', description: 'Internal company meetings and town halls' },
  { value: 'trade-show', label: 'Trade Show', description: 'Exhibition with vendor booths and demos' },
  { value: 'workshop', label: 'Workshop/Training', description: 'Hands-on learning and skill development' },
  { value: 'gala', label: 'Gala/Awards', description: 'Formal dinner and ceremony events' },
  { value: 'product-launch', label: 'Product Launch', description: 'New product or service announcements' },
  { value: 'training', label: 'Training Session', description: 'Employee education and certification' },
  { value: 'networking', label: 'Networking Event', description: 'Professional connection and social events' },
];

