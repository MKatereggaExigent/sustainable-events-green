import React, { useState, useMemo } from 'react';
import {
  ClipboardList, Users, Calendar, Building2, Globe, Zap,
  TrendingUp, AlertTriangle, CheckCircle, ChevronRight, BarChart3,
  Sparkles, Target
} from 'lucide-react';
import {
  EventType, EventFormat, EventProfileData, EVENT_TYPES, INDUSTRIES,
  EVENT_BENCHMARKS, FORMAT_MULTIPLIERS, getEventScale, INDUSTRY_MULTIPLIERS
} from '@/lib/preAssessmentData';
import { useSettings } from '@/contexts/SettingsContext';

interface EventProfileAssessmentProps {
  onComplete: (data: EventProfileData) => void;
  onDataChange?: (data: EventProfileData) => void;
}

const EventProfileAssessment: React.FC<EventProfileAssessmentProps> = ({ onComplete, onDataChange }) => {
  const { convertValue, getUnit, maskValue } = useSettings();
  const [data, setData] = useState<EventProfileData>({
    eventType: 'conference',
    eventFormat: 'in-person',
    expectedAttendees: 100,
    durationDays: 1,
    durationHoursPerDay: 8,
    industry: 'technology',
    isInternational: false,
  });

  const updateData = (updates: Partial<EventProfileData>) => {
    const newData = { ...data, ...updates };
    setData(newData);
    onDataChange?.(newData);
  };

  const assessment = useMemo(() => {
    const benchmark = EVENT_BENCHMARKS[data.eventType];
    const formatMultiplier = FORMAT_MULTIPLIERS[data.eventFormat];
    const industryMultiplier = INDUSTRY_MULTIPLIERS[data.industry] || 1.0;
    const internationalMultiplier = data.isInternational ? 1.5 : 1.0;
    
    const baseEmissionPerAttendee = benchmark.average * formatMultiplier * industryMultiplier * internationalMultiplier;
    const bestCaseEmission = benchmark.best * formatMultiplier;
    const worstCaseEmission = benchmark.worst * formatMultiplier * industryMultiplier * internationalMultiplier;
    
    const totalEmissions = baseEmissionPerAttendee * data.expectedAttendees * 1000; // Convert to kg
    const scale = getEventScale(data.expectedAttendees);
    
    // Calculate percentile (where this event falls in industry)
    const percentile = Math.round(100 - ((baseEmissionPerAttendee - benchmark.best) / (benchmark.worst - benchmark.best)) * 100);
    
    // Risk factors
    const risks: string[] = [];
    if (data.isInternational) risks.push('International travel significantly increases emissions');
    if (data.eventFormat === 'in-person' && data.expectedAttendees > 500) risks.push('Large in-person events have substantial carbon footprints');
    if (data.durationDays > 3) risks.push('Multi-day events require accommodation, increasing impact');
    
    // Opportunities
    const opportunities: string[] = [];
    if (data.eventFormat === 'in-person') opportunities.push('Consider hybrid format to reduce travel by 40-60%');
    if (industryMultiplier > 1.0) opportunities.push('Your industry has above-average impact - sustainability can differentiate');
    opportunities.push(`${scale} events have ${scale === 'small' ? 'great' : scale === 'mega' ? 'significant' : 'good'} optimization potential`);
    
    return {
      totalEmissionsKg: Math.round(totalEmissions),
      emissionPerAttendee: Math.round(baseEmissionPerAttendee * 1000), // kg
      bestCaseKg: Math.round(bestCaseEmission * data.expectedAttendees * 1000),
      worstCaseKg: Math.round(worstCaseEmission * data.expectedAttendees * 1000),
      percentile: Math.max(0, Math.min(100, percentile)),
      scale,
      risks,
      opportunities,
      industryBenchmark: benchmark.average * 1000,
    };
  }, [data]);

  const getPercentileColor = (p: number) => {
    if (p >= 75) return 'text-emerald-600';
    if (p >= 50) return 'text-blue-600';
    if (p >= 25) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Smart Pre-Assessment
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Event Profile Assessment
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Start with your event basics. Our intelligent system will predict your carbon footprint 
            and compare it against industry benchmarks before you dive into detailed calculations.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-indigo-600" />
              Tell Us About Your Event
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                <select
                  value={data.eventType}
                  onChange={(e) => updateData({ eventType: e.target.value as EventType })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                >
                  {EVENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {EVENT_TYPES.find(t => t.value === data.eventType)?.description}
                </p>
              </div>

              {/* Event Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['in-person', 'hybrid', 'virtual'] as EventFormat[]).map((format) => (
                    <button
                      key={format}
                      onClick={() => updateData({ eventFormat: format })}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        data.eventFormat === format
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {format.charAt(0).toUpperCase() + format.slice(1).replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Expected Attendees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Expected Attendees
                </label>
                <input
                  type="number"
                  value={data.expectedAttendees}
                  onChange={(e) => updateData({ expectedAttendees: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="100000"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Scale: <span className="font-medium capitalize">{assessment.scale}</span> event
                </p>
              </div>

              {/* Duration Days */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Duration (Days)
                </label>
                <input
                  type="number"
                  value={data.durationDays}
                  onChange={(e) => updateData({ durationDays: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="14"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Hours Per Day */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hours Per Day</label>
                <input
                  type="number"
                  value={data.durationHoursPerDay}
                  onChange={(e) => updateData({ durationHoursPerDay: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="24"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Industry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  Industry
                </label>
                <select
                  value={data.industry}
                  onChange={(e) => updateData({ industry: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind.charAt(0).toUpperCase() + ind.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* International */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.isInternational}
                    onChange={(e) => updateData({ isInternational: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    <Globe className="w-4 h-4 inline mr-1" />
                    International event (attendees from multiple countries)
                  </span>
                </label>
              </div>
            </div>

            {/* Risk Factors and Opportunities */}
            <div className="mt-6 grid md:grid-cols-2 gap-4">
              {assessment.risks.length > 0 && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Risk Factors
                  </h4>
                  <ul className="space-y-1">
                    {assessment.risks.map((risk, i) => (
                      <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                        <span className="text-amber-400 mt-1">•</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <h4 className="font-medium text-emerald-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Opportunities
                </h4>
                <ul className="space-y-1">
                  {assessment.opportunities.map((opp, i) => (
                    <li key={i} className="text-sm text-emerald-700 flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">•</span>
                      {opp}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {/* Preview panel placeholder - will be continued */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Quick Estimate
            </h3>
            <div className="text-4xl font-bold mb-2">
              {maskValue((convertValue(assessment.totalEmissionsKg, 'weight') / 1000).toFixed(1))}
              <span className="text-lg font-normal opacity-80 ml-1">tonnes CO₂e</span>
            </div>
            <p className="text-sm opacity-80 mb-4">
              {maskValue(Math.round(convertValue(assessment.emissionPerAttendee, 'weight')))} {getUnit('weight')} per attendee
            </p>
            <div className="bg-white/10 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Industry Percentile</span>
                <span className={`font-bold ${assessment.percentile >= 50 ? 'text-emerald-300' : 'text-amber-300'}`}>
                  Top {maskValue(100 - assessment.percentile)}%
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-emerald-400 h-2 rounded-full transition-all"
                  style={{ width: `${assessment.percentile}%` }}
                />
              </div>
            </div>
            <button
              onClick={() => onComplete(data)}
              className="w-full py-3 bg-white text-indigo-700 rounded-xl font-semibold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
            >
              Continue to Detailed Analysis
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventProfileAssessment;

