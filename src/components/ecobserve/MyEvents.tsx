import React, { useState, useEffect } from 'react';
import { eventsApi, isAuthenticated } from '@/services/api';
import { EventInputs, FootprintResult, calculateFootprint } from '@/lib/carbonData';
import {
  FolderOpen, Trash2, Upload, BarChart3, Calendar, Leaf, Award,
  RefreshCw, AlertCircle, X, ArrowLeftRight, TreePine, Droplets, LogIn
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '@/contexts/SettingsContext';

interface SavedEvent {
  id: string;
  event_name: string;
  venue_inputs: any;
  fnb_inputs: any;
  transport_inputs: any;
  materials_inputs: any;
  carbon_kg: number;
  water_liters: number;
  waste_kg: number;
  green_score: number;
  breakdown: any;
  created_at: string;
}

interface MyEventsProps {
  onLoadEvent: (inputs: EventInputs) => void;
  onNavigate: (section: string) => void;
}

const MyEvents: React.FC<MyEventsProps> = ({ onLoadEvent, onNavigate }) => {
  const { convertValue, getUnit, maskValue } = useSettings();
  const [events, setEvents] = useState<SavedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const fetchEvents = async () => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await eventsApi.getAll();

      if (result.error) {
        setError('Failed to load events. Please try again.');
        console.error(result.error);
      } else {
        // Map API response to SavedEvent format
        const mappedEvents: SavedEvent[] = (result.data?.events || []).map((e: any) => ({
          id: e.id,
          event_name: e.name,
          venue_inputs: e.carbon_data?.venue_inputs || {},
          fnb_inputs: e.carbon_data?.fnb_inputs || {},
          transport_inputs: e.carbon_data?.transport_inputs || {},
          materials_inputs: e.carbon_data?.materials_inputs || {},
          carbon_kg: e.carbon_data?.carbon_kg || 0,
          water_liters: e.carbon_data?.water_liters || 0,
          waste_kg: e.carbon_data?.waste_kg || 0,
          green_score: e.green_score || 0,
          breakdown: e.carbon_data?.breakdown || {},
          created_at: e.created_at,
        }));
        setEvents(mappedEvents);
      }
    } catch (err) {
      setError('Failed to load events. Please try again.');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const result = await eventsApi.delete(id);
      if (result.error) {
        setError('Failed to delete event.');
      } else {
        setEvents(prev => prev.filter(e => e.id !== id));
        setCompareIds(prev => prev.filter(cid => cid !== id));
      }
    } catch (err) {
      setError('Failed to delete event.');
    }
    setDeleteConfirm(null);
  };

  const handleLoad = (event: SavedEvent) => {
    const inputs: EventInputs = {
      venue: event.venue_inputs,
      fnb: event.fnb_inputs,
      transport: event.transport_inputs,
      materials: event.materials_inputs,
    };
    onLoadEvent(inputs);
    onNavigate('calculator');
  };

  const toggleCompare = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(cid => cid !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const compareEvents = events.filter(e => compareIds.includes(e.id));

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'Platinum';
    if (score >= 75) return 'Gold';
    if (score >= 60) return 'Silver';
    return 'Bronze';
  };

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-100 text-violet-700 rounded-full text-sm font-medium mb-4">
              <FolderOpen className="w-4 h-4" />
              Saved Events
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">My Events</h2>
            <p className="text-gray-600">View, compare, and manage your saved event calculations.</p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            {compareIds.length >= 2 && (
              <button
                onClick={() => setShowCompare(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors shadow-md"
              >
                <ArrowLeftRight className="w-4 h-4" />
                Compare ({compareIds.length})
              </button>
            )}
            <button
              onClick={fetchEvents}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <RefreshCw className="w-8 h-8 text-emerald-500 mx-auto mb-3 animate-spin" />
            <p className="text-gray-500">Loading your saved events...</p>
          </div>
        )}

        {/* Empty state - Not authenticated */}
        {!loading && !isAuthenticated() && (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <LogIn className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sign in to view your events</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Create an account or sign in to save and manage your event calculations.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                to="/login"
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-6 py-3 bg-white text-emerald-600 border-2 border-emerald-200 rounded-xl font-semibold hover:bg-emerald-50 transition-all"
              >
                Create Account
              </Link>
            </div>
          </div>
        )}

        {/* Empty state - Authenticated but no events */}
        {!loading && isAuthenticated() && events.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <FolderOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No saved events yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Use the Carbon Calculator to create an event calculation, then save it from the Dashboard to see it here.
            </p>
            <button
              onClick={() => onNavigate('calculator')}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md"
            >
              Go to Calculator
            </button>
          </div>
        )}

        {/* Events grid */}
        {!loading && events.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => {
              const isSelected = compareIds.includes(event.id);
              return (
                <div
                  key={event.id}
                  className={`bg-white rounded-2xl border-2 shadow-sm hover:shadow-lg transition-all overflow-hidden ${
                    isSelected ? 'border-violet-400 shadow-violet-100' : 'border-gray-100'
                  }`}
                >
                  {/* Header bar */}
                  <div className="bg-gradient-to-r from-gray-900 to-emerald-900 p-5 relative">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white truncate pr-4">{event.event_name}</h3>
                        <div className="flex items-center gap-2 mt-1 text-gray-400 text-xs">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(event.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getScoreColor(event.green_score)}`}>
                        {getScoreBadge(event.green_score)}
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Score */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                          <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" strokeWidth="5" />
                          <circle cx="32" cy="32" r="28" fill="none" stroke={event.green_score >= 70 ? '#10b981' : event.green_score >= 40 ? '#f59e0b' : '#ef4444'} strokeWidth="5"
                            strokeDasharray={`${(event.green_score / 100) * 176} 176`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-900">{event.green_score}</span>
                        </div>
                      </div>
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <div className="text-center">
                          <TreePine className="w-4 h-4 text-red-400 mx-auto mb-0.5" />
                          <div className="text-xs font-bold text-gray-900">{maskValue(Math.round(convertValue(event.carbon_kg, 'weight')).toLocaleString())}</div>
                          <div className="text-[10px] text-gray-400">{getUnit('weight')} CO₂</div>
                        </div>
                        <div className="text-center">
                          <Droplets className="w-4 h-4 text-blue-400 mx-auto mb-0.5" />
                          <div className="text-xs font-bold text-gray-900">{maskValue(Math.round(convertValue(event.water_liters, 'volume')).toLocaleString())}</div>
                          <div className="text-[10px] text-gray-400">{getUnit('volume')}</div>
                        </div>
                        <div className="text-center">
                          <Trash2 className="w-4 h-4 text-amber-400 mx-auto mb-0.5" />
                          <div className="text-xs font-bold text-gray-900">{maskValue(Math.round(convertValue(event.waste_kg, 'weight')))}</div>
                          <div className="text-[10px] text-gray-400">{getUnit('weight')} waste</div>
                        </div>
                      </div>
                    </div>

                    {/* Breakdown bar */}
                    {event.breakdown && (
                      <div className="mb-4">
                        <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
                          {['venue', 'fnb', 'transport', 'materials'].map((key, i) => {
                            const total = Object.values(event.breakdown as Record<string, number>).reduce((a: number, b: number) => a + b, 0);
                            const val = (event.breakdown as any)[key] || 0;
                            const pct = total > 0 ? (val / total) * 100 : 25;
                            const colors = ['bg-emerald-500', 'bg-amber-500', 'bg-blue-500', 'bg-purple-500'];
                            return <div key={key} className={`${colors[i]}`} style={{ width: `${pct}%` }} />;
                          })}
                        </div>
                        <div className="flex justify-between mt-1 text-[10px] text-gray-400">
                          <span>Venue</span><span>F&B</span><span>Transport</span><span>Materials</span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLoad(event)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition-colors border border-emerald-200"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Load
                      </button>
                      <button
                        onClick={() => toggleCompare(event.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-colors border ${
                          isSelected
                            ? 'bg-violet-500 text-white border-violet-500'
                            : 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100'
                        }`}
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                        {isSelected ? 'Selected' : 'Compare'}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(event.id)}
                        className="flex items-center justify-center p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors border border-red-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary stats */}
        {!loading && events.length > 0 && (
          <div className="mt-10 bg-gradient-to-r from-violet-600 to-purple-600 rounded-3xl p-8 text-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold">{maskValue(events.length)}</div>
                <div className="text-violet-200 text-sm mt-1">Events Saved</div>
              </div>
              <div>
                <div className="text-3xl font-bold">
                  {maskValue(Math.round(convertValue(events.reduce((a, e) => a + e.carbon_kg, 0), 'weight')).toLocaleString())}
                </div>
                <div className="text-violet-200 text-sm mt-1">Total {getUnit('weight')} CO₂</div>
              </div>
              <div>
                <div className="text-3xl font-bold">
                  {maskValue(events.length > 0 ? Math.round(events.reduce((a, e) => a + e.green_score, 0) / events.length) : 0)}
                </div>
                <div className="text-violet-200 text-sm mt-1">Avg Green Score</div>
              </div>
              <div>
                <div className="text-3xl font-bold">
                  {maskValue(events.length > 0 ? Math.max(...events.map(e => e.green_score)) : 0)}
                </div>
                <div className="text-violet-200 text-sm mt-1">Best Score</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Delete Event?</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compare modal */}
      {showCompare && compareEvents.length >= 2 && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowCompare(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-violet-600" />
                <h3 className="text-lg font-bold text-gray-900">Event Comparison</h3>
              </div>
              <button onClick={() => setShowCompare(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-sm font-semibold text-gray-500 pb-3 pr-4">Metric</th>
                      {compareEvents.map(e => (
                        <th key={e.id} className="text-center text-sm font-semibold text-gray-900 pb-3 px-4 min-w-[140px]">
                          {e.event_name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[
                      { label: 'Green Score', key: 'green_score', unit: '/100', best: 'max', convType: null },
                      { label: 'Carbon', key: 'carbon_kg', unit: ` ${getUnit('weight')} CO₂`, best: 'min', convType: 'weight' as const },
                      { label: 'Water', key: 'water_liters', unit: ` ${getUnit('volume')}`, best: 'min', convType: 'volume' as const },
                      { label: 'Waste', key: 'waste_kg', unit: ` ${getUnit('weight')}`, best: 'min', convType: 'weight' as const },
                    ].map(metric => {
                      const values = compareEvents.map(e => (e as any)[metric.key] as number);
                      const bestVal = metric.best === 'max' ? Math.max(...values) : Math.min(...values);
                      return (
                        <tr key={metric.key}>
                          <td className="py-3 pr-4 text-sm font-medium text-gray-700">{metric.label}</td>
                          {compareEvents.map(e => {
                            const val = (e as any)[metric.key] as number;
                            const isBest = val === bestVal;
                            const displayVal = metric.convType ? Math.round(convertValue(val, metric.convType)) : val;
                            return (
                              <td key={e.id} className="py-3 px-4 text-center">
                                <span className={`text-sm font-bold ${isBest ? 'text-emerald-600' : 'text-gray-900'}`}>
                                  {maskValue(displayVal.toLocaleString())}{metric.unit}
                                </span>
                                {isBest && <span className="ml-1.5 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">Best</span>}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                    <tr>
                      <td className="py-3 pr-4 text-sm font-medium text-gray-700">Date</td>
                      {compareEvents.map(e => (
                        <td key={e.id} className="py-3 px-4 text-center text-sm text-gray-500">
                          {new Date(e.created_at).toLocaleDateString()}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100">
              <button onClick={() => setShowCompare(false)} className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 transition-all">
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MyEvents;
