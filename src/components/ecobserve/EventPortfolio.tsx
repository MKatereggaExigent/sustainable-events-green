import React, { useState, useEffect } from 'react';
import { Calendar, Users, Leaf, Award, X, TrendingDown, RefreshCw } from 'lucide-react';
import { EventPortfolioItem, fetchEventPortfolio } from '@/lib/carbonData';
import { isAuthenticated } from '@/services/api';
import { useSettings } from '@/contexts/SettingsContext';

// Sample showcase data for unauthenticated users
const sampleShowcaseEvents: EventPortfolioItem[] = [
  {
    id: '1',
    name: 'TechSummit 2026',
    type: 'Conference',
    attendees: 500,
    greenScore: 82,
    carbonSaved: 2400,
    image: 'https://d64gsuwffb70l.cloudfront.net/698e531497195c23a2bf3a5d_1770935170810_9bb2a2c0.jpg',
    date: 'Jan 2026',
    highlights: ['100% renewable energy', 'Plant-based catering', 'Zero single-use plastics'],
  },
  {
    id: '2',
    name: 'GreenGala Awards',
    type: 'Gala',
    attendees: 300,
    greenScore: 91,
    carbonSaved: 1800,
    image: 'https://d64gsuwffb70l.cloudfront.net/698e531497195c23a2bf3a5d_1770935178323_820d0929.png',
    date: 'Dec 2025',
    highlights: ['Living plant decor', 'Local organic menu', 'Carbon offset program'],
  },
  {
    id: '3',
    name: 'Innovation Expo',
    type: 'Exhibition',
    attendees: 1200,
    greenScore: 74,
    carbonSaved: 5600,
    image: 'https://d64gsuwffb70l.cloudfront.net/698e531497195c23a2bf3a5d_1770935174723_29147074.jpg',
    date: 'Nov 2025',
    highlights: ['Shuttle bus service', 'Digital-only materials', 'Reusable booth structures'],
  },
  {
    id: '4',
    name: 'Wellness Retreat',
    type: 'Retreat',
    attendees: 80,
    greenScore: 95,
    carbonSaved: 450,
    image: 'https://d64gsuwffb70l.cloudfront.net/698e531497195c23a2bf3a5d_1770935174100_64e94e69.jpg',
    date: 'Oct 2025',
    highlights: ['Solar-powered venue', 'Farm-to-table dining', 'Zero waste achieved'],
  },
  {
    id: '5',
    name: 'Product Launch 2025',
    type: 'Launch Event',
    attendees: 250,
    greenScore: 78,
    carbonSaved: 1200,
    image: 'https://d64gsuwffb70l.cloudfront.net/698e531497195c23a2bf3a5d_1770935174762_bec7a0c0.jpg',
    date: 'Sep 2025',
    highlights: ['Hybrid format', 'Compostable packaging', 'EV shuttle service'],
  },
  {
    id: '6',
    name: 'Annual Fundraiser',
    type: 'Charity Event',
    attendees: 400,
    greenScore: 87,
    carbonSaved: 2100,
    image: 'https://d64gsuwffb70l.cloudfront.net/698e531497195c23a2bf3a5d_1770935236978_f4bb10b8.png',
    date: 'Aug 2025',
    highlights: ['Tree planting gifts', 'Local sourcing only', 'Renewable energy venue'],
  },
];

const EventPortfolio: React.FC = () => {
  const { convertValue, getUnit, maskValue } = useSettings();
  const [events, setEvents] = useState<EventPortfolioItem[]>(sampleShowcaseEvents);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventPortfolioItem | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // If authenticated, try to load user's events to add to the showcase
    if (isAuthenticated()) {
      setLoading(true);
      fetchEventPortfolio()
        .then((userEvents) => {
          if (userEvents.length > 0) {
            // Combine user events with sample events
            setEvents([...userEvents, ...sampleShowcaseEvents]);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, []);

  const types = ['all', ...new Set(events.map(e => e.type))];

  const filtered = filter === 'all'
    ? events
    : events.filter(e => e.type === filter);

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-4">
            <Award className="w-4 h-4" />
            Success Stories
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Event Portfolio
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Real events that made a real difference. Explore case studies from our community of sustainable event planners.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === type
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-teal-300'
              }`}
            >
              {type === 'all' ? 'All Events' : type}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((event) => (
            <div
              key={event.id}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all cursor-pointer"
              onClick={() => setSelectedEvent(event)}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-3 right-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    event.greenScore >= 90 ? 'bg-emerald-500 text-white' :
                    event.greenScore >= 75 ? 'bg-yellow-400 text-gray-900' :
                    'bg-gray-300 text-gray-700'
                  }`}>
                    Score: {event.greenScore}
                  </div>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium text-gray-700">
                    {event.type}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">
                  {event.name}
                </h3>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {event.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {event.attendees}
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl mb-4">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-700">
                    {maskValue(Math.round(convertValue(event.carbonSaved, 'weight')).toLocaleString())} {getUnit('weight')} CO₂ saved
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {event.highlights.slice(0, 2).map((h, i) => (
                    <span key={i} className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">
                      {h}
                    </span>
                  ))}
                  {event.highlights.length > 2 && (
                    <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs text-gray-500">
                      +{event.highlights.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Aggregate stats */}
        <div className="mt-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold">{maskValue(events.length)}</div>
              <div className="text-emerald-200 text-sm mt-1">Events Showcased</div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                {maskValue(events.reduce((a, e) => a + e.attendees, 0).toLocaleString())}
              </div>
              <div className="text-emerald-200 text-sm mt-1">Total Attendees</div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                {maskValue(Math.round(convertValue(events.reduce((a, e) => a + e.carbonSaved, 0), 'weight')).toLocaleString())}
              </div>
              <div className="text-emerald-200 text-sm mt-1">{getUnit('weight')} CO₂ Saved</div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                {maskValue(events.length > 0 ? Math.round(events.reduce((a, e) => a + e.greenScore, 0) / events.length) : 0)}
              </div>
              <div className="text-emerald-200 text-sm mt-1">Avg Green Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Event detail modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-56">
              <img src={selectedEvent.image} alt={selectedEvent.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/40 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="absolute bottom-4 left-6">
                <span className="px-3 py-1 bg-white/90 rounded-lg text-xs font-medium text-gray-700 mb-2 inline-block">
                  {selectedEvent.type}
                </span>
                <h3 className="text-2xl font-bold text-white">{selectedEvent.name}</h3>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Calendar className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <div className="text-sm font-semibold text-gray-900">{selectedEvent.date}</div>
                  <div className="text-xs text-gray-500">Date</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Users className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <div className="text-sm font-semibold text-gray-900">{selectedEvent.attendees}</div>
                  <div className="text-xs text-gray-500">Attendees</div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                  <Award className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                  <div className="text-sm font-semibold text-emerald-700">{selectedEvent.greenScore}/100</div>
                  <div className="text-xs text-emerald-600">Green Score</div>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold text-emerald-800">Carbon Savings</span>
                </div>
                <div className="text-3xl font-bold text-emerald-700">
                  {maskValue(Math.round(convertValue(selectedEvent.carbonSaved, 'weight')).toLocaleString())} {getUnit('weight')} CO₂
                </div>
                <p className="text-sm text-emerald-600 mt-1">
                  Equivalent to planting {maskValue(Math.round(selectedEvent.carbonSaved / 22))} trees
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Sustainability Highlights</h4>
                <div className="space-y-2">
                  {selectedEvent.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Leaf className="w-3 h-3 text-emerald-600" />
                      </div>
                      <span className="text-sm text-gray-700">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all"
              >
                Close Case Study
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default EventPortfolio;
