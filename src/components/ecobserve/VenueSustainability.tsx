import React, { useState, useMemo } from 'react';
import {
  Building2, Zap, Leaf, Droplets, Recycle, Train, MapPin,
  Award, ChevronRight, Star, TrendingDown, CheckCircle, XCircle, Info
} from 'lucide-react';
import {
  VenueData, VenueType, EnergySource, calculateVenueEmissions,
  ENERGY_EMISSION_FACTORS, VENUE_ENERGY_INTENSITY
} from '@/lib/preAssessmentData';
import { useSettings } from '@/contexts/SettingsContext';

interface VenueSustainabilityProps {
  sqMeters?: number;
  durationHours: number;
  onComplete: (data: VenueData) => void;
  onDataChange?: (data: VenueData) => void;
}

const VENUE_TYPES: { value: VenueType; label: string; icon: string; energyIntensity: string }[] = [
  { value: 'convention-center', label: 'Convention Center', icon: '🏛️', energyIntensity: 'High' },
  { value: 'hotel', label: 'Hotel/Conference Hotel', icon: '🏨', energyIntensity: 'Very High' },
  { value: 'corporate-office', label: 'Corporate Office', icon: '🏢', energyIntensity: 'Medium' },
  { value: 'outdoor', label: 'Outdoor Venue', icon: '🌳', energyIntensity: 'Low' },
  { value: 'hybrid-space', label: 'Hybrid/Co-working', icon: '💡', energyIntensity: 'Low' },
  { value: 'unique-venue', label: 'Unique/Museum', icon: '🎭', energyIntensity: 'Medium' },
];

const ENERGY_SOURCES: { value: EnergySource; label: string; factor: number; color: string }[] = [
  { value: 'grid-standard', label: 'Standard Grid', factor: ENERGY_EMISSION_FACTORS['grid-standard'], color: 'bg-gray-400' },
  { value: 'grid-renewable', label: 'Grid (Renewable)', factor: ENERGY_EMISSION_FACTORS['grid-renewable'], color: 'bg-emerald-400' },
  { value: 'onsite-solar', label: 'On-site Solar', factor: ENERGY_EMISSION_FACTORS['onsite-solar'], color: 'bg-amber-400' },
  { value: 'onsite-wind', label: 'On-site Wind', factor: ENERGY_EMISSION_FACTORS['onsite-wind'], color: 'bg-blue-400' },
  { value: 'mixed-renewable', label: 'Mixed Renewable', factor: ENERGY_EMISSION_FACTORS['mixed-renewable'], color: 'bg-teal-400' },
  { value: 'carbon-neutral', label: 'Carbon Neutral', factor: ENERGY_EMISSION_FACTORS['carbon-neutral'], color: 'bg-emerald-600' },
];

const TRANSIT_OPTIONS = [
  { value: 'excellent', label: 'Excellent', desc: 'Metro/subway within 5 min walk', score: 100 },
  { value: 'good', label: 'Good', desc: 'Bus/tram within 10 min', score: 75 },
  { value: 'limited', label: 'Limited', desc: 'Some transit options', score: 40 },
  { value: 'none', label: 'None', desc: 'Car required', score: 0 },
];

const VenueSustainability: React.FC<VenueSustainabilityProps> = ({
  sqMeters = 500,
  durationHours,
  onComplete,
  onDataChange
}) => {
  const { convertValue, getUnit, maskValue } = useSettings();
  const [data, setData] = useState<VenueData>({
    venueType: 'convention-center',
    energySource: 'grid-standard',
    sqMeters: sqMeters,
    hasLeedCertification: false,
    hasWasteProgram: false,
    hasWaterConservation: false,
    distanceFromCityCenter: 5,
    publicTransitAccess: 'good',
  });

  const updateData = (updates: Partial<VenueData>) => {
    const newData = { ...data, ...updates };
    setData(newData);
    onDataChange?.(newData);
  };

  const analysis = useMemo(() => {
    const baseEmissions = calculateVenueEmissions(data, durationHours);
    
    // Calculate sustainability score (0-100)
    let score = 50; // Base score
    
    // Energy source impact (up to 30 points)
    const energyFactor = ENERGY_EMISSION_FACTORS[data.energySource];
    score += Math.round((1 - energyFactor / 0.42) * 30);
    
    // Certifications (up to 15 points)
    if (data.hasLeedCertification) score += 10;
    if (data.hasWasteProgram) score += 3;
    if (data.hasWaterConservation) score += 2;
    
    // Transit access (up to 10 points)
    const transitScore = TRANSIT_OPTIONS.find(t => t.value === data.publicTransitAccess)?.score || 0;
    score += Math.round(transitScore / 10);
    
    // Venue type (up to 5 points)
    if (data.venueType === 'outdoor') score += 5;
    if (data.venueType === 'hybrid-space') score += 3;
    
    score = Math.min(100, Math.max(0, score));
    
    // Grade
    let grade = 'F';
    if (score >= 90) grade = 'A+';
    else if (score >= 80) grade = 'A';
    else if (score >= 70) grade = 'B';
    else if (score >= 60) grade = 'C';
    else if (score >= 50) grade = 'D';
    
    // Potential savings
    const bestCaseEmissions = calculateVenueEmissions({
      ...data,
      energySource: 'carbon-neutral',
      hasLeedCertification: true,
      hasWaterConservation: true,
    }, durationHours);
    
    return {
      emissions: Math.round(baseEmissions),
      emissionsPerSqm: Math.round(baseEmissions / data.sqMeters * 100) / 100,
      score,
      grade,
      potentialSavings: Math.round(baseEmissions - bestCaseEmissions),
      bestCaseEmissions: Math.round(bestCaseEmissions),
    };
  }, [data, durationHours]);

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-emerald-600 bg-emerald-100';
    if (grade === 'B') return 'text-blue-600 bg-blue-100';
    if (grade === 'C') return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <section className="py-16 bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
            <Building2 className="w-4 h-4" />
            Venue Analysis
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Venue Sustainability Scorecard
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Evaluate your venue's environmental impact. Compare energy sources, certifications, 
            and accessibility to optimize your event's sustainability profile.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Input Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Venue Type Selection */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                Venue Type
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {VENUE_TYPES.map((venue) => (
                  <button
                    key={venue.value}
                    onClick={() => updateData({ venueType: venue.value })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      data.venueType === venue.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-200'
                    }`}
                  >
                    <div className="text-2xl mb-1">{venue.icon}</div>
                    <div className="font-medium text-gray-900 text-sm">{venue.label}</div>
                    <div className="text-xs text-gray-500">Energy: {venue.energyIntensity}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Venue Size */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                Venue Size & Location
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue Size (m²)
                  </label>
                  <input
                    type="number"
                    value={data.sqMeters}
                    onChange={(e) => updateData({ sqMeters: parseInt(e.target.value) || 100 })}
                    min="50"
                    max="50000"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ~{Math.round(data.sqMeters / (data.sqMeters > 1000 ? 3 : 5))} attendees capacity
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distance from City Center (km)
                  </label>
                  <input
                    type="number"
                    value={data.distanceFromCityCenter}
                    onChange={(e) => updateData({ distanceFromCityCenter: parseFloat(e.target.value) || 0 })}
                    min="0"
                    max="100"
                    step="0.5"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Energy Source */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-600" />
                Energy Source
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ENERGY_SOURCES.map((source) => (
                  <button
                    key={source.value}
                    onClick={() => updateData({ energySource: source.value })}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      data.energySource === source.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-200'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${source.color} mb-2`} />
                    <div className="font-medium text-gray-900 text-sm">{source.label}</div>
                    <div className="text-xs text-gray-500">{source.factor} kg/kWh</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Public Transit */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Train className="w-5 h-5 text-emerald-600" />
                Public Transit Access
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {TRANSIT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateData({ publicTransitAccess: option.value })}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      data.publicTransitAccess === option.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-200'
                    }`}
                  >
                    <div className="font-medium text-gray-900 text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                Sustainability Certifications & Programs
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={data.hasLeedCertification}
                    onChange={(e) => updateData({ hasLeedCertification: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-emerald-500" />
                      LEED or Green Building Certified
                    </div>
                    <p className="text-xs text-gray-500">LEED, BREEAM, Green Globe, or equivalent</p>
                  </div>
                  <span className="text-xs text-emerald-600 font-medium">+10 pts</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={data.hasWasteProgram}
                    onChange={(e) => updateData({ hasWasteProgram: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      <Recycle className="w-4 h-4 text-blue-500" />
                      Waste Diversion Program
                    </div>
                    <p className="text-xs text-gray-500">Recycling, composting, zero-waste initiatives</p>
                  </div>
                  <span className="text-xs text-emerald-600 font-medium">+3 pts</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={data.hasWaterConservation}
                    onChange={(e) => updateData({ hasWaterConservation: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-cyan-500" />
                      Water Conservation
                    </div>
                    <p className="text-xs text-gray-500">Low-flow fixtures, rainwater harvesting</p>
                  </div>
                  <span className="text-xs text-emerald-600 font-medium">+2 pts</span>
                </label>
              </div>
            </div>
          </div>
          {/* Score Card - placeholder for now */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-6 text-white h-fit">
            <div className="text-center mb-4">
              <div className={`inline-flex w-20 h-20 items-center justify-center rounded-full text-3xl font-bold ${getGradeColor(analysis.grade)}`}>
                {analysis.grade}
              </div>
            </div>
            <h3 className="text-center font-semibold mb-2">Sustainability Score</h3>
            <div className="text-center text-4xl font-bold mb-4">{maskValue(analysis.score)}/100</div>
            <div className="bg-white/10 rounded-xl p-4 mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Venue Emissions</span>
                <span className="font-bold">{maskValue(Math.round(convertValue(analysis.emissions, 'weight')))} {getUnit('weight')} CO₂e</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Best Case</span>
                <span className="text-emerald-300">{maskValue(Math.round(convertValue(analysis.bestCaseEmissions, 'weight')))} {getUnit('weight')}</span>
              </div>
            </div>
            <button
              onClick={() => onComplete(data)}
              className="w-full py-3 bg-white text-emerald-700 rounded-xl font-semibold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VenueSustainability;

