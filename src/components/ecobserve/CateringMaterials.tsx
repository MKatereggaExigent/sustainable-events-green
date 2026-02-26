import React, { useState, useMemo } from 'react';
import {
  Utensils, Leaf, Package, Recycle, Gift, TreeDeciduous, MapPin,
  ChevronRight, TrendingDown, Info, Sparkles, BarChart3
} from 'lucide-react';
import {
  CateringData, MealType, MaterialLevel, MaterialsData,
  calculateCateringEmissions, calculateMaterialsEmissions,
  MEAL_EMISSION_FACTORS, MATERIAL_WASTE_FACTORS
} from '@/lib/preAssessmentData';
import { useSettings } from '@/contexts/SettingsContext';

interface CateringMaterialsProps {
  attendees: number;
  durationDays: number;
  onComplete: (data: { catering: CateringData; materialsLevel: MaterialLevel; hasSwagBags: boolean }) => void;
  onDataChange?: (data: { catering: CateringData; materialsLevel: MaterialLevel; hasSwagBags: boolean }) => void;
}

const MEAL_TYPES: { value: MealType; label: string; emissions: number; icon: string; color: string }[] = [
  { value: 'full-meat', label: 'Full Meat Menu', emissions: MEAL_EMISSION_FACTORS['full-meat'], icon: '🥩', color: 'bg-red-100 border-red-300' },
  { value: 'mixed-meat-veg', label: 'Mixed Menu', emissions: MEAL_EMISSION_FACTORS['mixed-meat-veg'], icon: '🍽️', color: 'bg-amber-100 border-amber-300' },
  { value: 'pescatarian', label: 'Pescatarian', emissions: MEAL_EMISSION_FACTORS['pescatarian'], icon: '🐟', color: 'bg-blue-100 border-blue-300' },
  { value: 'vegetarian', label: 'Vegetarian', emissions: MEAL_EMISSION_FACTORS['vegetarian'], icon: '🥗', color: 'bg-green-100 border-green-300' },
  { value: 'vegan', label: 'Vegan', emissions: MEAL_EMISSION_FACTORS['vegan'], icon: '🌱', color: 'bg-emerald-100 border-emerald-300' },
  { value: 'local-organic', label: 'Local & Organic', emissions: MEAL_EMISSION_FACTORS['local-organic'], icon: '🌿', color: 'bg-teal-100 border-teal-300' },
];

const MATERIALS_LEVELS: { value: MaterialLevel; label: string; description: string; reduction: number }[] = [
  { value: 'standard', label: 'Standard', description: 'Traditional printed materials, branded items', reduction: 0 },
  { value: 'reduced', label: 'Reduced', description: 'Some digital alternatives, minimal printing', reduction: 0.35 },
  { value: 'digital-first', label: 'Digital-First', description: 'Event app, QR codes, limited printed essentials', reduction: 0.65 },
  { value: 'zero-waste', label: 'Zero-Waste', description: 'Fully digital, sustainable swag only', reduction: 0.85 },
];

const CateringMaterials: React.FC<CateringMaterialsProps> = ({
  attendees,
  durationDays,
  onComplete,
  onDataChange
}) => {
  const { convertValue, getUnit, maskValue } = useSettings();
  const [catering, setCatering] = useState<CateringData>({
    mealType: 'mixed-meat-veg',
    mealsPerDay: 2,
    localSourcingPercent: 30,
    organicPercent: 20,
    beverageOption: 'standard',
  });
  const [materialsLevel, setMaterialsLevel] = useState<MaterialLevel>('reduced');
  const [hasSwagBags, setHasSwagBags] = useState(true);

  const updateCatering = (updates: Partial<CateringData>) => {
    const newCatering = { ...catering, ...updates };
    setCatering(newCatering);
    onDataChange?.({ catering: newCatering, materialsLevel, hasSwagBags });
  };

  const updateMaterials = (level: MaterialLevel) => {
    setMaterialsLevel(level);
    onDataChange?.({ catering, materialsLevel: level, hasSwagBags });
  };

  // Helper to calculate materials emissions
  const getMaterialsEmissions = (level: MaterialLevel, swagBags: boolean) => {
    const materialsData: MaterialsData = {
      printedMaterials: level,
      swagBags: swagBags,
      exhibitorMaterials: false,
      decorationLevel: 'moderate',
      wasteManagement: level === 'zero-waste' ? 'zero-waste' : 'recycling',
    };
    return calculateMaterialsEmissions(materialsData, attendees);
  };

  const analysis = useMemo(() => {
    const cateringEmissions = calculateCateringEmissions(catering, attendees, durationDays);
    const materialsEmissions = getMaterialsEmissions(materialsLevel, hasSwagBags);
    const totalEmissions = cateringEmissions + materialsEmissions;

    // Calculate potential savings by switching to best options
    const bestCatering = calculateCateringEmissions(
      { ...catering, mealType: 'local-organic', localSourcingPercent: 80, organicPercent: 60 },
      attendees, durationDays
    );
    const bestMaterials = getMaterialsEmissions('zero-waste', false);

    // Compare meal types
    const mealComparison = MEAL_TYPES.map(m => ({
      type: m.label,
      emissions: m.emissions * catering.mealsPerDay * attendees * durationDays,
      current: m.value === catering.mealType,
    }));

    return {
      cateringEmissions: Math.round(cateringEmissions),
      materialsEmissions: Math.round(materialsEmissions),
      totalEmissions: Math.round(totalEmissions),
      perAttendee: Math.round(totalEmissions / attendees * 10) / 10,
      potentialCateringSavings: Math.round(cateringEmissions - bestCatering),
      potentialMaterialsSavings: Math.round(materialsEmissions - bestMaterials),
      mealComparison,
      localImpact: Math.round(cateringEmissions * (catering.localSourcingPercent / 100) * 0.2),
    };
  }, [catering, materialsLevel, hasSwagBags, attendees, durationDays]);

  return (
    <section className="py-16 bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">
            <Utensils className="w-4 h-4" />
            Food & Materials
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Catering & Materials Impact
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Food choices and event materials can account for <strong>10-20%</strong> of total emissions.
            Optimize your menu and materials strategy for maximum sustainability.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Input Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Meal Type Selection */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-amber-600" />
                Primary Menu Type
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {MEAL_TYPES.map((meal) => (
                  <button
                    key={meal.value}
                    onClick={() => updateCatering({ mealType: meal.value })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      catering.mealType === meal.value
                        ? `${meal.color} border-2`
                        : 'border-gray-200 hover:border-amber-200'
                    }`}
                  >
                    <div className="text-2xl mb-1">{meal.icon}</div>
                    <div className="font-medium text-gray-900 text-sm">{meal.label}</div>
                    <div className="text-xs text-gray-500">{meal.emissions} kg/meal</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Meals & Sourcing */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-600" />
                Meals & Sourcing
              </h3>
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meals Per Day</label>
                    <select
                      value={catering.mealsPerDay}
                      onChange={(e) => updateCatering({ mealsPerDay: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200"
                    >
                      {[1, 2, 3, 4].map(n => (
                        <option key={n} value={n}>{n} meal{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Local Sourcing Slider */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <TreeDeciduous className="w-4 h-4 text-emerald-500" />
                      Local Sourcing (within 150km)
                    </label>
                    <span className="text-sm font-bold text-emerald-600">{catering.localSourcingPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={catering.localSourcingPercent}
                    onChange={(e) => updateCatering({ localSourcingPercent: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Standard Supply Chain</span>
                    <span>Fully Local</span>
                  </div>
                </div>

                {/* Organic Slider */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-green-500" />
                      Organic & Sustainable
                    </label>
                    <span className="text-sm font-bold text-green-600">{catering.organicPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={catering.organicPercent}
                    onChange={(e) => updateCatering({ organicPercent: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                </div>
              </div>
            </div>

            {/* Materials Level */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-600" />
                Event Materials Strategy
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {MATERIALS_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => updateMaterials(level.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      materialsLevel === level.value
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-amber-200'
                    }`}
                  >
                    <div className="font-medium text-gray-900 text-sm">{level.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{level.description}</div>
                    <div className="text-xs text-emerald-600 font-medium mt-2">
                      -{Math.round(level.reduction * 100)}% materials
                    </div>
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-3 mt-4 p-3 rounded-xl bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasSwagBags}
                  onChange={(e) => setHasSwagBags(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-amber-600"
                />
                <div>
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    <Gift className="w-4 h-4 text-amber-500" />
                    Include Swag Bags / Giveaways
                  </div>
                  <p className="text-xs text-gray-500">Adds ~1.5 kg CO₂e per attendee</p>
                </div>
              </label>
            </div>
          </div>

          {/* Analysis Sidebar */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Total Impact
              </h3>
              <div className="text-4xl font-bold mb-1">
                {maskValue(Math.round(convertValue(analysis.totalEmissions, 'weight')))}
                <span className="text-lg font-normal opacity-80 ml-1">{getUnit('weight')} CO₂e</span>
              </div>
              <p className="text-amber-200 text-sm mb-4">{maskValue(Math.round(convertValue(analysis.perAttendee, 'weight')))} {getUnit('weight')} per attendee</p>

              <div className="space-y-2 mb-4">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="flex justify-between text-sm">
                    <span>Catering</span>
                    <span className="font-medium">{maskValue(Math.round(convertValue(analysis.cateringEmissions, 'weight')))} {getUnit('weight')}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-white h-1.5 rounded-full"
                      style={{ width: `${(analysis.cateringEmissions / analysis.totalEmissions) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="flex justify-between text-sm">
                    <span>Materials</span>
                    <span className="font-medium">{maskValue(Math.round(convertValue(analysis.materialsEmissions, 'weight')))} {getUnit('weight')}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-white h-1.5 rounded-full"
                      style={{ width: `${(analysis.materialsEmissions / analysis.totalEmissions) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {analysis.potentialCateringSavings > 0 && (
                <div className="bg-white/10 rounded-xl p-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingDown className="w-4 h-4" />
                    <span>Potential savings: <strong>{maskValue(Math.round(convertValue(analysis.potentialCateringSavings + analysis.potentialMaterialsSavings, 'weight')))} {getUnit('weight')}</strong></span>
                  </div>
                </div>
              )}

              <button
                onClick={() => onComplete({ catering, materialsLevel, hasSwagBags })}
                className="w-full py-3 bg-white text-amber-700 rounded-xl font-semibold hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
              >
                Continue to Format Comparison
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Meal Type Comparison */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Menu Comparison
              </h3>
              <div className="space-y-2">
                {analysis.mealComparison.map((meal) => (
                  <div
                    key={meal.type}
                    className={`flex items-center justify-between p-2 rounded-lg ${meal.current ? 'bg-amber-50' : ''}`}
                  >
                    <span className="text-sm text-gray-700">{meal.type}</span>
                    <span className={`text-sm font-medium ${meal.current ? 'text-amber-700' : 'text-gray-500'}`}>
                      {maskValue(Math.round(convertValue(meal.emissions, 'weight')))} {getUnit('weight')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CateringMaterials;

