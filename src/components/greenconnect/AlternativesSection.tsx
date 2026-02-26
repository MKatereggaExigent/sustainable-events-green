import React, { useState, useMemo } from 'react';
import { Lightbulb, ArrowRight, TrendingDown, DollarSign, Zap, Filter, Check, ChevronDown } from 'lucide-react';
import { Alternative } from '@/lib/carbonData';

interface AlternativesSectionProps {
  alternatives: Alternative[];
}

const difficultyColors = {
  easy: { bg: 'bg-green-100', text: 'text-green-700', label: 'Easy' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Medium' },
  hard: { bg: 'bg-red-100', text: 'text-red-700', label: 'Hard' },
};

const costIcons = {
  lower: { icon: DollarSign, color: 'text-green-600', label: 'Lower cost' },
  same: { icon: DollarSign, color: 'text-gray-500', label: 'Same cost' },
  higher: { icon: DollarSign, color: 'text-red-500', label: 'Higher cost' },
};

const AlternativesSection: React.FC<AlternativesSectionProps> = ({ alternatives }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [appliedAlts, setAppliedAlts] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(alternatives.map(a => a.category));
    return ['all', ...Array.from(cats)];
  }, [alternatives]);

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return alternatives;
    return alternatives.filter(a => a.category === activeFilter);
  }, [alternatives, activeFilter]);

  const totalSavings = useMemo(() => {
    let total = 0;
    appliedAlts.forEach(id => {
      const alt = alternatives.find(a => a.id === id);
      if (alt) total += alt.savings;
    });
    return total;
  }, [appliedAlts, alternatives]);

  const toggleApply = (id: string) => {
    setAppliedAlts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="py-24 bg-gradient-to-b from-emerald-50/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">
            <Lightbulb className="w-4 h-4" />
            Smart Suggestions
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Sustainable Alternatives
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Based on your event inputs, here are personalized recommendations to reduce your environmental impact.
          </p>
        </div>

        {/* Applied savings banner */}
        {appliedAlts.size > 0 && (
          <div className="mb-8 p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold">{appliedAlts.size} alternative{appliedAlts.size > 1 ? 's' : ''} applied</div>
                <div className="text-emerald-100 text-sm">Combined impact reduction potential: up to {totalSavings}%</div>
              </div>
            </div>
            <button
              onClick={() => setAppliedAlts(new Set())}
              className="px-4 py-2 bg-white/20 rounded-xl text-sm font-medium hover:bg-white/30 transition-colors"
            >
              Reset All
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <Filter className="w-4 h-4 text-gray-400" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeFilter === cat
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300 hover:text-emerald-700'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        {/* Alternatives grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((alt) => {
            const isApplied = appliedAlts.has(alt.id);
            const isExpanded = expandedId === alt.id;
            const difficulty = difficultyColors[alt.difficulty];
            const cost = costIcons[alt.cost];

            return (
              <div
                key={alt.id}
                className={`bg-white rounded-2xl border-2 transition-all overflow-hidden ${
                  isApplied
                    ? 'border-emerald-400 shadow-lg shadow-emerald-100'
                    : 'border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200'
                }`}
              >
                <div className="p-5">
                  {/* Category badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{alt.category}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${difficulty.bg} ${difficulty.text}`}>
                        {difficulty.label}
                      </span>
                    </div>
                  </div>

                  {/* Current vs Suggestion */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-red-400 rounded-full" />
                      </div>
                      <span className="text-sm text-gray-500 line-through">{alt.current}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ArrowRight className="w-3 h-3 text-emerald-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{alt.suggestion}</span>
                    </div>
                  </div>

                  {/* Impact */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-semibold text-emerald-600">{alt.impact}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <cost.icon className={`w-3.5 h-3.5 ${cost.color}`} />
                      <span className={`text-xs font-medium ${cost.color}`}>{cost.label}</span>
                    </div>
                  </div>

                  {/* Expand */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : alt.id)}
                    className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-3"
                  >
                    <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    {isExpanded ? 'Less details' : 'More details'}
                  </button>

                  {isExpanded && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-xl text-xs text-gray-600 space-y-2">
                      <p>Implementing this change can reduce your {alt.category.toLowerCase()} impact by up to <strong>{alt.savings}%</strong>.</p>
                      <p>Difficulty level: <strong>{alt.difficulty}</strong> — {alt.difficulty === 'easy' ? 'Can be done with minimal planning changes.' : alt.difficulty === 'medium' ? 'Requires some advance coordination.' : 'Needs significant planning and investment.'}</p>
                      <p>Cost impact: <strong>{alt.cost}</strong> compared to current approach.</p>
                    </div>
                  )}

                  {/* Apply button */}
                  <button
                    onClick={() => toggleApply(alt.id)}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                      isApplied
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Applied
                      </>
                    ) : (
                      'Apply This Alternative'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No alternatives found for this category. Try a different filter.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default AlternativesSection;
