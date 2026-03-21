/**
 * Recommendations Service
 * Generates basic sustainability recommendations for Explorer tier users
 */

export interface BasicRecommendation {
  id: string;
  category: 'Venue' | 'Food & Beverage' | 'Transport' | 'Materials' | 'Waste';
  title: string;
  description: string;
  impactKgCO2: number;
  costImpact: 'saves_money' | 'neutral' | 'small_cost';
  difficulty: 'easy' | 'medium';
  priority: number; // 1-5, higher = more important
}

export interface EventInputs {
  venue: {
    type: string;
    energySource: string;
    size: number;
    hours: number;
  };
  fnb: {
    guests: number;
    mealType: string;
    servingware: string;
  };
  transport: {
    transportMode: string;
    avgDistance: number;
    guests: number;
  };
  materials: {
    printedMaterials: boolean;
    swagBags: boolean;
    digitalAlternatives: boolean;
  };
}

/**
 * Generate basic recommendations for Explorer tier users
 * Returns top 5 actionable, easy-to-implement sustainability tips
 */
export function generateBasicRecommendations(inputs: EventInputs): BasicRecommendation[] {
  const recommendations: BasicRecommendation[] = [];

  // VENUE RECOMMENDATIONS
  if (inputs.venue.energySource === 'grid') {
    recommendations.push({
      id: 'venue_renewable',
      category: 'Venue',
      title: 'Choose a renewable energy venue',
      description: 'Select a venue powered by solar, wind, or other renewable sources. Many modern conference centers now offer green energy options.',
      impactKgCO2: Math.round(inputs.venue.size * inputs.venue.hours * 0.5 * 0.85),
      costImpact: 'neutral',
      difficulty: 'medium',
      priority: 4,
    });
  }

  if (inputs.venue.type === 'indoor' && inputs.venue.hours > 4) {
    recommendations.push({
      id: 'venue_natural_light',
      category: 'Venue',
      title: 'Use natural lighting and ventilation',
      description: 'Choose a venue with large windows and natural airflow to reduce HVAC and lighting energy consumption.',
      impactKgCO2: Math.round(inputs.venue.size * inputs.venue.hours * 0.3),
      costImpact: 'saves_money',
      difficulty: 'easy',
      priority: 3,
    });
  }

  // FOOD & BEVERAGE RECOMMENDATIONS
  if (inputs.fnb.mealType === 'meat_heavy' || inputs.fnb.mealType === 'mixed') {
    recommendations.push({
      id: 'fnb_plant_based',
      category: 'Food & Beverage',
      title: 'Offer plant-based menu options',
      description: 'Replace at least 50% of meat dishes with delicious plant-based alternatives. This is the single biggest impact you can make on food emissions.',
      impactKgCO2: Math.round(inputs.fnb.guests * 3.5 * 0.6),
      costImpact: 'saves_money',
      difficulty: 'easy',
      priority: 5, // Highest priority
    });
  }

  if (inputs.fnb.servingware === 'disposable') {
    recommendations.push({
      id: 'fnb_reusable',
      category: 'Food & Beverage',
      title: 'Switch to reusable or compostable servingware',
      description: 'Eliminate single-use plastics by using reusable plates/cutlery or certified compostable alternatives.',
      impactKgCO2: Math.round(inputs.fnb.guests * 0.5),
      costImpact: 'small_cost',
      difficulty: 'easy',
      priority: 4,
    });
  }

  // TRANSPORT RECOMMENDATIONS
  if (inputs.transport.transportMode === 'car' && inputs.transport.guests > 20) {
    recommendations.push({
      id: 'transport_shuttle',
      category: 'Transport',
      title: 'Provide shuttle service from transit hubs',
      description: 'Organize shared shuttle buses from major train/bus stations to reduce individual car trips.',
      impactKgCO2: Math.round(inputs.transport.guests * inputs.transport.avgDistance * 0.12 * 0.5),
      costImpact: 'small_cost',
      difficulty: 'medium',
      priority: 3,
    });
  }

  if (inputs.transport.avgDistance > 50) {
    recommendations.push({
      id: 'transport_virtual',
      category: 'Transport',
      title: 'Offer virtual attendance option',
      description: 'Allow remote attendees to join virtually, especially those traveling long distances. This can cut transport emissions by 30-50%.',
      impactKgCO2: Math.round(inputs.transport.guests * 0.3 * inputs.transport.avgDistance * 0.12),
      costImpact: 'neutral',
      difficulty: 'easy',
      priority: 4,
    });
  }

  // MATERIALS RECOMMENDATIONS
  if (inputs.materials.printedMaterials) {
    recommendations.push({
      id: 'materials_digital',
      category: 'Materials',
      title: 'Go digital with event materials',
      description: 'Replace printed programs, schedules, and handouts with a mobile event app or QR codes.',
      impactKgCO2: Math.round(inputs.fnb.guests * 0.8),
      costImpact: 'saves_money',
      difficulty: 'easy',
      priority: 3,
    });
  }

  if (inputs.materials.swagBags) {
    recommendations.push({
      id: 'materials_no_swag',
      category: 'Materials',
      title: 'Skip physical swag bags',
      description: 'Replace physical swag with digital perks, discount codes, or charitable donations in attendees\' names.',
      impactKgCO2: Math.round(inputs.fnb.guests * 2),
      costImpact: 'saves_money',
      difficulty: 'easy',
      priority: 2,
    });
  }

  // Sort by priority (highest first) and return top 5
  return recommendations
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5);
}

