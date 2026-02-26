import React, { useState, useMemo } from 'react';
import {
  Users, Monitor, Building, Shuffle, TrendingDown, DollarSign,
  Heart, Globe2, Handshake, ChevronRight, Award, Sparkles, Target, BarChart3
} from 'lucide-react';
import { EventFormat, compareFormats, FormatComparisonResult } from '@/lib/preAssessmentData';

interface FormatOptimizerProps {
  attendees: number;
  avgTravelDistance: number;
  durationDays: number;
  onComplete: (selectedFormat: EventFormat, hybridRatio?: number) => void;
  onDataChange?: (format: EventFormat, hybridRatio: number) => void;
}

const FORMAT_ICONS: Record<EventFormat, React.ElementType> = {
  'in-person': Building,
  'virtual': Monitor,
  'hybrid': Shuffle,
};

const FORMAT_COLORS: Record<EventFormat, { bg: string; text: string; gradient: string }> = {
  'in-person': { bg: 'bg-purple-100', text: 'text-purple-700', gradient: 'from-purple-600 to-indigo-600' },
  'virtual': { bg: 'bg-cyan-100', text: 'text-cyan-700', gradient: 'from-cyan-600 to-blue-600' },
  'hybrid': { bg: 'bg-emerald-100', text: 'text-emerald-700', gradient: 'from-emerald-600 to-teal-600' },
};

const FormatOptimizer: React.FC<FormatOptimizerProps> = ({
  attendees,
  avgTravelDistance,
  durationDays,
  onComplete,
  onDataChange
}) => {
  const [selectedFormat, setSelectedFormat] = useState<EventFormat>('hybrid');
  const [hybridRatio, setHybridRatio] = useState(50); // % in-person

  const comparison = useMemo(() => {
    return compareFormats(attendees, avgTravelDistance, durationDays);
  }, [attendees, avgTravelDistance, durationDays]);

  const handleFormatSelect = (format: EventFormat) => {
    setSelectedFormat(format);
    onDataChange?.(format, hybridRatio);
  };

  const getScoreBar = (score: number, color: string) => (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-sm font-medium w-8">{score}</span>
    </div>
  );

  const getRecommendedFormat = (): FormatComparisonResult => {
    // Simple scoring: balance carbon, cost, and engagement
    const scored = comparison.map(f => ({
      ...f,
      totalScore: (100 - (f.estimatedCarbonPerAttendee / 20)) + (100 - f.costIndex * 100) + f.engagementScore + f.accessibilityScore
    }));
    return scored.sort((a, b) => b.totalScore - a.totalScore)[0];
  };

  const recommended = getRecommendedFormat();

  return (
    <section className="py-16 bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
            <Shuffle className="w-4 h-4" />
            Format Decision Tool
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Event Format Optimizer
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Compare in-person, virtual, and hybrid formats to find the optimal balance of
            <strong> carbon impact</strong>, <strong>cost</strong>, and <strong>engagement</strong> for your event.
          </p>
        </div>

        {/* Recommended Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full shadow-lg">
            <Award className="w-5 h-5" />
            <span className="font-medium">Recommended: {recommended.format.charAt(0).toUpperCase() + recommended.format.slice(1).replace('-', ' ')}</span>
          </div>
        </div>

        {/* Format Comparison Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {comparison.map((format) => {
            const Icon = FORMAT_ICONS[format.format];
            const colors = FORMAT_COLORS[format.format];
            const isSelected = selectedFormat === format.format;
            const isRecommended = format.format === recommended.format;

            return (
              <div
                key={format.format}
                onClick={() => handleFormatSelect(format.format)}
                className={`relative bg-white rounded-2xl shadow-lg border-2 p-6 cursor-pointer transition-all ${
                  isSelected ? `border-${colors.text.replace('text-', '')} shadow-xl scale-105` : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                {isRecommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full">
                      Best Match
                    </span>
                  </div>
                )}

                <div className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={`w-7 h-7 ${colors.text}`} />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 capitalize">
                  {format.format.replace('-', ' ')}
                </h3>

                {/* Carbon */}
                <div className="mb-4">
                  <div className="text-3xl font-bold text-gray-900">
                    {(format.estimatedCarbonKg / 1000).toFixed(1)}
                    <span className="text-sm font-normal text-gray-500 ml-1">t CO₂e</span>
                  </div>
                  <p className="text-sm text-gray-500">{format.estimatedCarbonPerAttendee} kg per attendee</p>
                </div>

                {/* Scores */}
                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> Engagement</span>
                    </div>
                    {getScoreBar(format.engagementScore, 'bg-pink-500')}
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span className="flex items-center gap-1"><Globe2 className="w-3 h-3" /> Accessibility</span>
                    </div>
                    {getScoreBar(format.accessibilityScore, 'bg-blue-500')}
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span className="flex items-center gap-1"><Handshake className="w-3 h-3" /> Networking</span>
                    </div>
                    {getScoreBar(format.networkingScore, 'bg-amber-500')}
                  </div>
                </div>

                {/* Cost Index */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" /> Cost Index
                  </span>
                  <span className={`font-bold ${format.costIndex <= 0.5 ? 'text-emerald-600' : format.costIndex <= 0.8 ? 'text-amber-600' : 'text-gray-900'}`}>
                    {Math.round(format.costIndex * 100)}%
                  </span>
                </div>

                {/* Recommendation */}
                <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                  {format.recommendationReason}
                </p>
              </div>
            );
          })}
        </div>

        {/* Hybrid Ratio Slider - only show when hybrid is selected */}
        {selectedFormat === 'hybrid' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8 max-w-2xl mx-auto">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shuffle className="w-5 h-5 text-emerald-600" />
              Customize Hybrid Ratio
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  Virtual: {100 - hybridRatio}%
                </span>
                <span className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  In-Person: {hybridRatio}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={hybridRatio}
                onChange={(e) => {
                  setHybridRatio(parseInt(e.target.value));
                  onDataChange?.('hybrid', parseInt(e.target.value));
                }}
                className="w-full h-3 bg-gradient-to-r from-cyan-400 via-emerald-400 to-purple-400 rounded-lg appearance-none cursor-pointer"
              />
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-cyan-50 rounded-xl p-3">
                  <div className="text-2xl font-bold text-cyan-700">
                    {Math.round(attendees * (100 - hybridRatio) / 100)}
                  </div>
                  <div className="text-xs text-cyan-600">Virtual Attendees</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-3">
                  <div className="text-2xl font-bold text-purple-700">
                    {Math.round(attendees * hybridRatio / 100)}
                  </div>
                  <div className="text-xs text-purple-600">In-Person Attendees</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected Format Summary & Continue */}
        <div className="max-w-2xl mx-auto">
          <div className={`bg-gradient-to-r ${FORMAT_COLORS[selectedFormat].gradient} rounded-2xl p-6 text-white`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {React.createElement(FORMAT_ICONS[selectedFormat], { className: 'w-8 h-8' })}
                <div>
                  <h3 className="text-xl font-bold capitalize">{selectedFormat.replace('-', ' ')} Event</h3>
                  <p className="text-white/80 text-sm">Selected Format</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {(comparison.find(c => c.format === selectedFormat)?.estimatedCarbonKg || 0) / 1000 < 10
                    ? ((comparison.find(c => c.format === selectedFormat)?.estimatedCarbonKg || 0) / 1000).toFixed(1)
                    : Math.round((comparison.find(c => c.format === selectedFormat)?.estimatedCarbonKg || 0) / 1000)}
                  <span className="text-lg font-normal opacity-80 ml-1">t CO₂e</span>
                </div>
              </div>
            </div>

            {selectedFormat !== 'in-person' && (
              <div className="bg-white/10 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" />
                  <span>
                    <strong>
                      {Math.round(((comparison.find(c => c.format === 'in-person')?.estimatedCarbonKg || 0) -
                        (comparison.find(c => c.format === selectedFormat)?.estimatedCarbonKg || 0)) /
                        (comparison.find(c => c.format === 'in-person')?.estimatedCarbonKg || 1) * 100)}%
                    </strong> less carbon than in-person
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => onComplete(selectedFormat, selectedFormat === 'hybrid' ? hybridRatio : undefined)}
              className="w-full py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <Target className="w-5 h-5" />
              Continue with {selectedFormat.charAt(0).toUpperCase() + selectedFormat.slice(1).replace('-', ' ')} Format
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FormatOptimizer;

