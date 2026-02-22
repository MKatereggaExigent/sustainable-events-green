import React, { useState, useMemo } from 'react';
import {
  Users, Plane, Train, Car, Bus, MapPin, Globe, Home,
  ChevronRight, TrendingDown, Zap, PieChart, AlertCircle, Lightbulb
} from 'lucide-react';
import {
  AttendeeData, AttendeeProfile, AttendeeRegion, TravelMode,
  calculateTravelEmissions, TRAVEL_EMISSION_FACTORS, REGIONAL_DISTANCES,
  ACCOMMODATION_FACTOR
} from '@/lib/preAssessmentData';

interface AttendeeTravelProps {
  totalAttendees: number;
  durationDays: number;
  onComplete: (data: AttendeeData) => void;
  onDataChange?: (data: AttendeeData) => void;
}

const REGIONS: { value: AttendeeRegion; label: string; icon: React.ElementType; description: string }[] = [
  { value: 'local', label: 'Local', icon: Home, description: '< 50 km' },
  { value: 'domestic', label: 'Domestic', icon: MapPin, description: '50-800 km' },
  { value: 'continental', label: 'Continental', icon: Globe, description: '800-3000 km' },
  { value: 'international', label: 'International', icon: Plane, description: '> 3000 km' },
];

const TRAVEL_MODES: { value: TravelMode; label: string; icon: React.ElementType; factor: number }[] = [
  { value: 'local', label: 'Walking/Transit', icon: MapPin, factor: TRAVEL_EMISSION_FACTORS['local'] },
  { value: 'bus', label: 'Bus/Coach', icon: Bus, factor: TRAVEL_EMISSION_FACTORS['bus'] },
  { value: 'train', label: 'Train/Rail', icon: Train, factor: TRAVEL_EMISSION_FACTORS['train'] },
  { value: 'car', label: 'Car (Solo)', icon: Car, factor: TRAVEL_EMISSION_FACTORS['car'] },
  { value: 'air-short', label: 'Flight (Short)', icon: Plane, factor: TRAVEL_EMISSION_FACTORS['air-short'] },
  { value: 'air-medium', label: 'Flight (Medium)', icon: Plane, factor: TRAVEL_EMISSION_FACTORS['air-medium'] },
  { value: 'air-long', label: 'Flight (Long)', icon: Plane, factor: TRAVEL_EMISSION_FACTORS['air-long'] },
];

const AttendeeTravel: React.FC<AttendeeTravelProps> = ({
  totalAttendees,
  durationDays,
  onComplete,
  onDataChange
}) => {
  const [data, setData] = useState<AttendeeData>({
    totalAttendees,
    profiles: [
      { region: 'local', percentage: 30, avgDistanceKm: 25, primaryTravelMode: 'local' },
      { region: 'domestic', percentage: 50, avgDistanceKm: 400, primaryTravelMode: 'air-short' },
      { region: 'continental', percentage: 15, avgDistanceKm: 1500, primaryTravelMode: 'air-medium' },
      { region: 'international', percentage: 5, avgDistanceKm: 8000, primaryTravelMode: 'air-long' },
    ],
    virtualAttendeePercent: 0,
    accommodationNights: durationDays > 1 ? durationDays - 1 : 0,
  });

  const updateProfile = (index: number, updates: Partial<AttendeeProfile>) => {
    const newProfiles = [...data.profiles];
    newProfiles[index] = { ...newProfiles[index], ...updates };
    const newData = { ...data, profiles: newProfiles };
    setData(newData);
    onDataChange?.(newData);
  };

  const updateData = (updates: Partial<AttendeeData>) => {
    const newData = { ...data, ...updates };
    setData(newData);
    onDataChange?.(newData);
  };

  const analysis = useMemo(() => {
    const travelEmissions = calculateTravelEmissions(data);
    const inPersonCount = data.totalAttendees * (1 - data.virtualAttendeePercent / 100);
    
    // Calculate emissions by region
    const byRegion = data.profiles.map(p => {
      const attendeesInGroup = inPersonCount * (p.percentage / 100);
      const emissions = attendeesInGroup * p.avgDistanceKm * 2 * TRAVEL_EMISSION_FACTORS[p.primaryTravelMode];
      return { region: p.region, emissions, percentage: p.percentage };
    });

    // Calculate accommodation emissions
    const accommodationEmissions = inPersonCount * data.accommodationNights * ACCOMMODATION_FACTOR;

    // Find biggest contributor
    const sortedRegions = [...byRegion].sort((a, b) => b.emissions - a.emissions);
    const biggestContributor = sortedRegions[0];

    // Recommendations
    const recommendations: string[] = [];
    if (data.virtualAttendeePercent < 20) {
      recommendations.push(`Adding ${20 - data.virtualAttendeePercent}% virtual attendees could save ${Math.round(travelEmissions * 0.2)} kg CO₂e`);
    }
    if (biggestContributor.emissions > travelEmissions * 0.5) {
      recommendations.push(`${biggestContributor.region} travel accounts for ${Math.round(biggestContributor.emissions / travelEmissions * 100)}% of emissions`);
    }
    const airTravelers = data.profiles.filter(p => p.primaryTravelMode.includes('air')).reduce((sum, p) => sum + p.percentage, 0);
    if (airTravelers > 50) {
      recommendations.push('Consider rail alternatives for short-haul travelers to cut emissions by 85%');
    }

    return {
      totalEmissions: Math.round(travelEmissions),
      emissionsPerAttendee: Math.round(travelEmissions / data.totalAttendees),
      byRegion,
      accommodationEmissions: Math.round(accommodationEmissions),
      biggestContributor,
      recommendations,
      virtualSavings: Math.round(travelEmissions * (data.virtualAttendeePercent / 100) / (1 - data.virtualAttendeePercent / 100)),
    };
  }, [data]);

  // Ensure percentages sum to 100
  const totalPercentage = data.profiles.reduce((sum, p) => sum + p.percentage, 0);
  const isValidDistribution = Math.abs(totalPercentage - 100) < 1;

  return (
    <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <Plane className="w-4 h-4" />
            Travel Intelligence
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Attendee & Travel Analysis
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Travel typically accounts for <strong>70-80%</strong> of event emissions. 
            Understand your attendee demographics to optimize your event's carbon footprint.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Input Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Virtual Attendees Slider */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Virtual Attendance Option
              </h3>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={data.virtualAttendeePercent}
                  onChange={(e) => updateData({ virtualAttendeePercent: parseInt(e.target.value) })}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-2xl font-bold text-blue-600 w-20 text-right">
                  {data.virtualAttendeePercent}%
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {Math.round(data.totalAttendees * data.virtualAttendeePercent / 100)} virtual, {Math.round(data.totalAttendees * (1 - data.virtualAttendeePercent / 100))} in-person
              </p>
            </div>

            {/* Regional Distribution */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Attendee Distribution by Region
                {!isValidDistribution && (
                  <span className="text-amber-600 text-sm font-normal ml-2">
                    (Total: {totalPercentage}% - should be 100%)
                  </span>
                )}
              </h3>
              <div className="space-y-4">
                {data.profiles.map((profile, index) => {
                  const regionInfo = REGIONS.find(r => r.value === profile.region)!;
                  const Icon = regionInfo.icon;
                  return (
                    <div key={profile.region} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{regionInfo.label}</div>
                          <div className="text-xs text-gray-500">{regionInfo.description}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-gray-500">% of Attendees</label>
                          <input
                            type="number"
                            value={profile.percentage}
                            onChange={(e) => updateProfile(index, { percentage: parseInt(e.target.value) || 0 })}
                            min="0"
                            max="100"
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Avg Distance (km)</label>
                          <input
                            type="number"
                            value={profile.avgDistanceKm}
                            onChange={(e) => updateProfile(index, { avgDistanceKm: parseInt(e.target.value) || 0 })}
                            min="0"
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Primary Travel</label>
                          <select
                            value={profile.primaryTravelMode}
                            onChange={(e) => updateProfile(index, { primaryTravelMode: e.target.value as TravelMode })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                          >
                            {TRAVEL_MODES.map(m => (
                              <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Accommodation */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Accommodation Nights</h3>
              <input
                type="number"
                value={data.accommodationNights}
                onChange={(e) => updateData({ accommodationNights: parseInt(e.target.value) || 0 })}
                min="0"
                max="14"
                className="w-full px-4 py-3 rounded-xl border border-gray-200"
              />
              <p className="text-sm text-gray-500 mt-2">
                Hotel stays add ~{ACCOMMODATION_FACTOR} kg CO₂e per night per person
              </p>
            </div>
          </div>

          {/* Analysis Sidebar */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Travel Impact
              </h3>
              <div className="text-4xl font-bold mb-1">
                {(analysis.totalEmissions / 1000).toFixed(1)}
                <span className="text-lg font-normal opacity-80 ml-1">t CO₂e</span>
              </div>
              <p className="text-blue-200 text-sm mb-4">
                {analysis.emissionsPerAttendee} kg per attendee
              </p>

              {/* Breakdown bars */}
              <div className="space-y-2 mb-4">
                {analysis.byRegion.map((r) => (
                  <div key={r.region}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="capitalize">{r.region}</span>
                      <span>{Math.round(r.emissions)} kg</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className="bg-white h-2 rounded-full"
                        style={{ width: `${Math.min(100, (r.emissions / analysis.totalEmissions) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white/10 rounded-xl p-3 text-sm">
                <div className="flex justify-between">
                  <span>Accommodation</span>
                  <span className="font-medium">{analysis.accommodationEmissions} kg</span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Optimization Tips
              </h3>
              <ul className="space-y-3">
                {analysis.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <TrendingDown className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => onComplete(data)}
              disabled={!isValidDistribution}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Venue Analysis
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AttendeeTravel;

