// Carbon calculation factors and data

export interface VenueData {
  type: string;
  size: string;
  duration: number;
  energySource: string;
}

export interface FnBData {
  guests: number;
  mealType: string;
  beverages: string;
  catering: string;
}

export interface TransportData {
  attendees: number;
  avgDistance: number;
  transportMode: string;
  shuttleService: boolean;
}

export interface MaterialsData {
  printedMaterials: string;
  decorations: string;
  swagBags: boolean;
  digitalAlternatives: boolean;
}

export interface EventInputs {
  venue: VenueData;
  fnb: FnBData;
  transport: TransportData;
  materials: MaterialsData;
}

export interface FootprintResult {
  carbonKg: number;
  waterLiters: number;
  wasteKg: number;
  greenScore: number;
  breakdown: {
    venue: number;
    fnb: number;
    transport: number;
    materials: number;
  };
}

export const defaultInputs: EventInputs = {
  venue: { type: 'indoor', size: 'medium', duration: 1, energySource: 'grid' },
  fnb: { guests: 100, mealType: 'mixed', beverages: 'standard', catering: 'traditional' },
  transport: { attendees: 100, avgDistance: 25, transportMode: 'mixed', shuttleService: false },
  materials: { printedMaterials: 'standard', decorations: 'standard', swagBags: true, digitalAlternatives: false },
};

// Carbon factors (kg CO2e)
const venueFactors: Record<string, number> = {
  indoor: 150, outdoor: 50, hybrid: 100, virtual: 10,
};
const sizeFactors: Record<string, number> = {
  small: 0.5, medium: 1, large: 2, 'extra-large': 3.5,
};
const energyFactors: Record<string, number> = {
  grid: 1, renewable: 0.15, hybrid_energy: 0.5, solar: 0.1,
};
const mealFactors: Record<string, number> = {
  vegan: 1.5, vegetarian: 2.5, mixed: 4.5, meat_heavy: 7,
};
const beverageFactors: Record<string, number> = {
  water_only: 0.2, standard: 1.5, premium: 3, alcohol_heavy: 5,
};
const transportFactors: Record<string, number> = {
  public: 0.05, mixed: 0.15, car: 0.21, flight: 0.255,
};
const materialFactors: Record<string, number> = {
  none: 0, minimal: 5, standard: 15, premium: 30,
};
const decorFactors: Record<string, number> = {
  none: 0, minimal: 10, standard: 30, elaborate: 60,
};

export function calculateFootprint(inputs: EventInputs): FootprintResult {
  // Venue carbon
  const venueCO2 = (venueFactors[inputs.venue.type] || 100) *
    (sizeFactors[inputs.venue.size] || 1) *
    inputs.venue.duration *
    (energyFactors[inputs.venue.energySource] || 1);

  // F&B carbon
  const fnbCO2 = inputs.fnb.guests *
    ((mealFactors[inputs.fnb.mealType] || 4) + (beverageFactors[inputs.fnb.beverages] || 1.5));

  // Transport carbon
  const transportCO2 = inputs.transport.attendees *
    inputs.transport.avgDistance *
    (transportFactors[inputs.transport.transportMode] || 0.15) *
    (inputs.transport.shuttleService ? 0.6 : 1);

  // Materials carbon
  const materialsCO2 = (materialFactors[inputs.materials.printedMaterials] || 15) *
    (inputs.fnb.guests / 10) +
    (decorFactors[inputs.materials.decorations] || 30) +
    (inputs.materials.swagBags ? inputs.fnb.guests * 2 : 0) -
    (inputs.materials.digitalAlternatives ? inputs.fnb.guests * 0.5 : 0);

  const totalCO2 = venueCO2 + fnbCO2 + transportCO2 + Math.max(0, materialsCO2);

  // Water (liters) - rough estimates
  const waterLiters = inputs.fnb.guests * 80 + venueCO2 * 2 + Math.max(0, materialsCO2) * 5;

  // Waste (kg)
  const wasteKg = inputs.fnb.guests * 1.5 +
    (inputs.materials.swagBags ? inputs.fnb.guests * 0.3 : 0) +
    (decorFactors[inputs.materials.decorations] || 30) * 0.5;

  // Green score (0-100, higher is better)
  const maxCO2 = inputs.fnb.guests * 20; // worst case scenario
  const greenScore = Math.max(0, Math.min(100, Math.round(100 - (totalCO2 / Math.max(maxCO2, 1)) * 100)));

  return {
    carbonKg: Math.round(totalCO2),
    waterLiters: Math.round(waterLiters),
    wasteKg: Math.round(wasteKg),
    greenScore,
    breakdown: {
      venue: Math.round(venueCO2),
      fnb: Math.round(fnbCO2),
      transport: Math.round(transportCO2),
      materials: Math.round(Math.max(0, materialsCO2)),
    },
  };
}

export interface Alternative {
  id: string;
  category: string;
  current: string;
  suggestion: string;
  impact: string;
  savings: number;
  cost: 'lower' | 'same' | 'higher';
  difficulty: 'easy' | 'medium' | 'hard';
}

export function getAlternatives(inputs: EventInputs): Alternative[] {
  const alts: Alternative[] = [];

  // Venue alternatives
  if (inputs.venue.energySource === 'grid') {
    alts.push({
      id: 'v1', category: 'Venue', current: 'Grid electricity',
      suggestion: 'Switch to renewable energy venue', impact: '-85% venue carbon',
      savings: 85, cost: 'same', difficulty: 'medium',
    });
  }
  if (inputs.venue.type === 'indoor') {
    alts.push({
      id: 'v2', category: 'Venue', current: 'Indoor venue',
      suggestion: 'Consider outdoor or hybrid venue', impact: '-50% venue energy',
      savings: 50, cost: 'lower', difficulty: 'medium',
    });
  }
  alts.push({
    id: 'v3', category: 'Venue', current: 'Standard HVAC',
    suggestion: 'Use natural ventilation + smart thermostats', impact: '-30% energy use',
    savings: 30, cost: 'lower', difficulty: 'easy',
  });

  // F&B alternatives
  if (inputs.fnb.mealType !== 'vegan') {
    alts.push({
      id: 'f1', category: 'Food & Beverage', current: `${inputs.fnb.mealType} menu`,
      suggestion: 'Offer plant-based menu options', impact: '-60% food carbon',
      savings: 60, cost: 'lower', difficulty: 'easy',
    });
  }
  alts.push({
    id: 'f2', category: 'Food & Beverage', current: 'Standard catering',
    suggestion: 'Source from local farms (< 50 miles)', impact: '-40% food transport',
    savings: 40, cost: 'same', difficulty: 'medium',
  });
  alts.push({
    id: 'f3', category: 'Food & Beverage', current: 'Single-use servingware',
    suggestion: 'Use compostable or reusable servingware', impact: '-90% F&B waste',
    savings: 90, cost: 'higher', difficulty: 'easy',
  });

  // Transport alternatives
  if (inputs.transport.transportMode !== 'public') {
    alts.push({
      id: 't1', category: 'Transport', current: `${inputs.transport.transportMode} transport`,
      suggestion: 'Provide shuttle buses from transit hubs', impact: '-55% transport carbon',
      savings: 55, cost: 'higher', difficulty: 'medium',
    });
  }
  alts.push({
    id: 't2', category: 'Transport', current: 'No carpooling',
    suggestion: 'Set up carpooling platform for attendees', impact: '-35% transport carbon',
    savings: 35, cost: 'lower', difficulty: 'easy',
  });
  alts.push({
    id: 't3', category: 'Transport', current: 'Standard parking',
    suggestion: 'Offer EV charging stations + bike parking', impact: '-20% transport carbon',
    savings: 20, cost: 'higher', difficulty: 'hard',
  });

  // Materials alternatives
  if (!inputs.materials.digitalAlternatives) {
    alts.push({
      id: 'm1', category: 'Materials', current: 'Printed materials',
      suggestion: 'Go fully digital: QR codes, event app', impact: '-95% paper waste',
      savings: 95, cost: 'lower', difficulty: 'easy',
    });
  }
  if (inputs.materials.swagBags) {
    alts.push({
      id: 'm2', category: 'Materials', current: 'Traditional swag bags',
      suggestion: 'Digital gift cards or tree-planting donations', impact: '-100% swag waste',
      savings: 100, cost: 'lower', difficulty: 'easy',
    });
  }
  alts.push({
    id: 'm3', category: 'Materials', current: 'Standard decorations',
    suggestion: 'Rent decorations or use living plants', impact: '-70% decor waste',
    savings: 70, cost: 'same', difficulty: 'medium',
  });

  return alts;
}

// Event Portfolio and Resources interfaces
export interface EventPortfolioItem {
  id: string;
  name: string;
  type: string;
  attendees: number;
  greenScore: number;
  carbonSaved: number;
  image?: string;
  date: string;
  highlights: string[];
}

export interface Resource {
  id: string;
  title: string;
  category: string;
  readTime: string;
  image?: string;
  description: string;
}

// API functions for portfolio and resources (fetched from backend when authenticated)
import { eventsApi } from '../services/api';

export async function fetchEventPortfolio(): Promise<EventPortfolioItem[]> {
  const result = await eventsApi.getAll();
  if (result.data?.events) {
    return result.data.events.map((event: any) => ({
      id: event.id,
      name: event.name,
      type: event.event_type || 'Event',
      attendees: event.attendee_count || 0,
      greenScore: event.green_score || 0,
      carbonSaved: Math.round((event.carbon_kg || 0) * 0.3), // estimated savings
      date: event.start_date ? new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'TBD',
      highlights: event.highlights || [],
    }));
  }
  return [];
}

// Static resources (could be moved to CMS or database later)
export const defaultResources: Resource[] = [
  {
    id: '1',
    title: 'Zero Waste Event Planning Guide',
    category: 'Guide',
    readTime: '12 min',
    image: 'https://d64gsuwffb70l.cloudfront.net/698e531497195c23a2bf3a5d_1770935285763_72d50369.png',
    description: 'Complete guide to eliminating waste from your events with practical checklists and vendor recommendations.',
  },
  {
    id: '2',
    title: 'Sustainable Catering Handbook',
    category: 'Handbook',
    readTime: '8 min',
    image: 'https://d64gsuwffb70l.cloudfront.net/698e531497195c23a2bf3a5d_1770935280797_bbd1ff37.jpg',
    description: 'How to source local, organic, and plant-forward menus that delight guests while reducing carbon footprint.',
  },
  {
    id: '3',
    title: 'Green Venue Certification',
    category: 'Certification',
    readTime: '15 min',
    image: 'https://d64gsuwffb70l.cloudfront.net/698e531497195c23a2bf3a5d_1770935280070_de31d4fd.jpg',
    description: 'Step-by-step pathway to getting your venue certified as a sustainable event space.',
  },
  {
    id: '4',
    title: 'Carbon Offset Best Practices',
    category: 'Guide',
    readTime: '10 min',
    image: 'https://d64gsuwffb70l.cloudfront.net/698e531497195c23a2bf3a5d_1770935298836_22620d01.png',
    description: 'Navigate the carbon offset market with confidence. Learn which programs deliver real impact.',
  },
];
