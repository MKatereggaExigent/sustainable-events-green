import React, { useEffect, useState } from 'react';
import { Lightbulb, TrendingDown, DollarSign, Zap, Leaf, Car, Package, Trash2, Building2 } from 'lucide-react';
import { EventInputs } from '@/lib/carbonData';

interface BasicRecommendation {
  id: string;
  category: 'Venue' | 'Food & Beverage' | 'Transport' | 'Materials' | 'Waste';
  title: string;
  description: string;
  impactKgCO2: number;
  costImpact: 'saves_money' | 'neutral' | 'small_cost';
  difficulty: 'easy' | 'medium';
  priority: number;
}

interface BasicRecommendationsProps {
  inputs: EventInputs;
}

const categoryIcons = {
  'Venue': Building2,
  'Food & Beverage': Leaf,
  'Transport': Car,
  'Materials': Package,
  'Waste': Trash2,
};

const costLabels = {
  'saves_money': { label: 'Saves Money', color: 'text-green-600', bg: 'bg-green-50' },
  'neutral': { label: 'Cost Neutral', color: 'text-gray-600', bg: 'bg-gray-50' },
  'small_cost': { label: 'Small Cost', color: 'text-amber-600', bg: 'bg-amber-50' },
};

const difficultyLabels = {
  'easy': { label: 'Easy', color: 'text-green-600', bg: 'bg-green-50' },
  'medium': { label: 'Medium', color: 'text-amber-600', bg: 'bg-amber-50' },
};

const BasicRecommendations: React.FC<BasicRecommendationsProps> = ({ inputs }) => {
  const [recommendations, setRecommendations] = useState<BasicRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSavings, setTotalSavings] = useState(0);

  useEffect(() => {
    generateRecommendations();
  }, [inputs]);

  const generateRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/recommendations/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(inputs),
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.data.recommendations);
        setTotalSavings(data.data.totalPotentialSavingsKgCO2);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-amber-50/50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-amber-50/50 to-white" data-tour="recommendations">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">
            <Lightbulb className="w-4 h-4" />
            Basic Recommendations
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Quick Sustainability Wins
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-4">
            Based on your event inputs, here are the top {recommendations.length} actionable steps to reduce your environmental impact.
          </p>
          {totalSavings > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
              <TrendingDown className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">
                Potential savings: <span className="text-lg">{totalSavings.toLocaleString()}</span> kg CO₂e
              </span>
            </div>
          )}
        </div>

        {/* Recommendations Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {recommendations.map((rec, index) => {
            const Icon = categoryIcons[rec.category];
            const costInfo = costLabels[rec.costImpact];
            const difficultyInfo = difficultyLabels[rec.difficulty];

            return (
              <div
                key={rec.id}
                className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  {/* Priority Badge */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {index + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{rec.category}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{rec.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{rec.description}</p>

                    {/* Metrics */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg">
                        <TrendingDown className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-semibold text-emerald-700">
                          -{rec.impactKgCO2.toLocaleString()} kg CO₂
                        </span>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 ${costInfo.bg} rounded-lg`}>
                        <DollarSign className={`w-4 h-4 ${costInfo.color}`} />
                        <span className={`text-sm font-medium ${costInfo.color}`}>{costInfo.label}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 ${difficultyInfo.bg} rounded-lg`}>
                        <Zap className={`w-4 h-4 ${difficultyInfo.color}`} />
                        <span className={`text-sm font-medium ${difficultyInfo.color}`}>{difficultyInfo.label}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BasicRecommendations;

