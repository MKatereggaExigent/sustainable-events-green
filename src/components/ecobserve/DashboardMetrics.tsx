import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, AreaChart, Area, LineChart, Line } from 'recharts';
import {
  TrendingDown, TrendingUp, Award, Target, BarChart3, Share2, Download, TreePine, Car, Home, Plane,
  Droplets, Trash2, Save, Check, Loader2, Users, Zap, Leaf, Globe, DollarSign,
  AlertTriangle, CheckCircle2, ArrowRight, Sparkles, Building2, Factory, Lightbulb,
  Scale, Percent, Calendar, RefreshCw, Shield, Heart, BookOpen, Coins
} from 'lucide-react';
import { FootprintResult, EventInputs } from '@/lib/carbonData';
import { eventsApi, isAuthenticated } from '@/services/api';

interface DashboardMetricsProps {
  result: FootprintResult;
  inputs: EventInputs;
  onShare: () => void;
  onSaveSuccess: () => void;
}

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];

// Animated counter hook
const useAnimatedValue = (value: number, duration: number = 1000) => {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (endValue - startValue) * easeOutQuart;

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = endValue;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return displayValue;
};

// Industry benchmarks per attendee (kg CO2e)
const INDUSTRY_BENCHMARKS = {
  conference: { average: 85, best: 25, worst: 180 },
  tradeShow: { average: 120, best: 40, worst: 250 },
  wedding: { average: 65, best: 20, worst: 150 },
  corporate: { average: 75, best: 22, worst: 160 },
  festival: { average: 95, best: 30, worst: 200 },
};

// Carbon credit pricing (per tonne)
const CARBON_CREDIT_PRICES = {
  voluntary: 15, // Basic voluntary offsets
  goldStandard: 35, // Gold Standard certified
  verified: 25, // VCS verified
  premium: 50, // Premium nature-based
};

// UN SDG Goals relevant to sustainable events
const SDG_GOALS = [
  { id: 6, name: 'Clean Water', icon: Droplets, color: 'bg-cyan-500', relevant: true },
  { id: 7, name: 'Clean Energy', icon: Zap, color: 'bg-amber-500', relevant: true },
  { id: 11, name: 'Sustainable Cities', icon: Building2, color: 'bg-orange-500', relevant: true },
  { id: 12, name: 'Responsible Consumption', icon: RefreshCw, color: 'bg-yellow-600', relevant: true },
  { id: 13, name: 'Climate Action', icon: Globe, color: 'bg-emerald-600', relevant: true },
  { id: 15, name: 'Life on Land', icon: TreePine, color: 'bg-green-600', relevant: true },
];

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ result, inputs, onShare, onSaveSuccess }) => {
  const [activeChart, setActiveChart] = useState<'pie' | 'bar'>('pie');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [eventName, setEventName] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!eventName.trim()) {
      setSaveError('Please enter an event name.');
      return;
    }

    if (!isAuthenticated()) {
      setSaveError('Please log in to save events.');
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      // Create event first
      const eventResult = await eventsApi.create({
        name: eventName.trim(),
        event_type: 'general',
        attendee_count: inputs.fnb.guests,
        green_score: result.greenScore,
      });

      if (eventResult.error) {
        setSaveError(eventResult.error);
        setSaving(false);
        return;
      }

      // Save carbon data to the event
      const carbonResult = await eventsApi.saveCarbonData(eventResult.data.event.id, {
        venue_inputs: inputs.venue,
        fnb_inputs: inputs.fnb,
        transport_inputs: inputs.transport,
        materials_inputs: inputs.materials,
        carbon_kg: result.carbonKg,
        water_liters: result.waterLiters,
        waste_kg: result.wasteKg,
        green_score: result.greenScore,
        breakdown: result.breakdown,
      });

      setSaving(false);
      if (carbonResult.error) {
        setSaveError('Failed to save carbon data. Please try again.');
        console.error(carbonResult.error);
      } else {
        setSaved(true);
        setShowSaveModal(false);
        setEventName('');
        onSaveSuccess();
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      setSaving(false);
      setSaveError('Failed to save. Please try again.');
      console.error(error);
    }
  };

  // Visibility animation
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Business calculations
  const attendeeCount = inputs.fnb.guests || 100;

  // Per-attendee metrics
  const perAttendee = useMemo(() => ({
    carbon: result.carbonKg / attendeeCount,
    water: result.waterLiters / attendeeCount,
    waste: result.wasteKg / attendeeCount,
  }), [result, attendeeCount]);

  // Industry benchmarking
  const benchmark = INDUSTRY_BENCHMARKS.conference;
  const percentile = useMemo(() => {
    const carbonPerPerson = perAttendee.carbon;
    if (carbonPerPerson <= benchmark.best) return 95;
    if (carbonPerPerson >= benchmark.worst) return 5;
    // Linear interpolation
    const range = benchmark.worst - benchmark.best;
    const position = carbonPerPerson - benchmark.best;
    return Math.round(95 - (position / range) * 90);
  }, [perAttendee.carbon, benchmark]);

  // Carbon credit valuation
  const carbonTonnes = result.carbonKg / 1000;
  const offsetCosts = useMemo(() => ({
    voluntary: carbonTonnes * CARBON_CREDIT_PRICES.voluntary,
    goldStandard: carbonTonnes * CARBON_CREDIT_PRICES.goldStandard,
    verified: carbonTonnes * CARBON_CREDIT_PRICES.verified,
    premium: carbonTonnes * CARBON_CREDIT_PRICES.premium,
  }), [carbonTonnes]);

  // Yearly projection (4 events)
  const yearlyProjection = useMemo(() => {
    const eventsPerYear = 4;
    return {
      carbon: result.carbonKg * eventsPerYear,
      water: result.waterLiters * eventsPerYear,
      waste: result.wasteKg * eventsPerYear,
      offsetCost: offsetCosts.goldStandard * eventsPerYear,
    };
  }, [result, offsetCosts]);

  // Action priority items
  const actionPriorities = useMemo(() => {
    const items = [
      {
        category: 'Transport',
        impact: result.breakdown.transport,
        effort: 2,
        potential: Math.round(result.breakdown.transport * 0.6),
        action: 'Switch to shuttle service or virtual options',
        icon: Car
      },
      {
        category: 'Venue',
        impact: result.breakdown.venue,
        effort: 3,
        potential: Math.round(result.breakdown.venue * 0.85),
        action: 'Choose renewable energy or outdoor venue',
        icon: Building2
      },
      {
        category: 'Food & Beverage',
        impact: result.breakdown.fnb,
        effort: 1,
        potential: Math.round(result.breakdown.fnb * 0.5),
        action: 'Offer plant-based menu options',
        icon: Leaf
      },
      {
        category: 'Materials',
        impact: result.breakdown.materials,
        effort: 1,
        potential: Math.round(result.breakdown.materials * 0.9),
        action: 'Go digital and eliminate printed materials',
        icon: RefreshCw
      },
    ];
    return items.sort((a, b) => (b.potential / b.effort) - (a.potential / a.effort));
  }, [result.breakdown]);

  // Animated values
  const animatedCarbon = useAnimatedValue(result.carbonKg);
  const animatedWater = useAnimatedValue(result.waterLiters);
  const animatedWaste = useAnimatedValue(result.wasteKg);
  const animatedScore = useAnimatedValue(result.greenScore);
  const animatedPercentile = useAnimatedValue(percentile);

  const pieData = [
    { name: 'Venue', value: result.breakdown.venue, color: COLORS[0] },
    { name: 'Food & Bev', value: result.breakdown.fnb, color: COLORS[1] },
    { name: 'Transport', value: result.breakdown.transport, color: COLORS[2] },
    { name: 'Materials', value: result.breakdown.materials, color: COLORS[3] },
  ];

  const barData = [
    { name: 'Your Event', carbon: result.carbonKg, fill: '#10b981' },
    { name: 'Industry Avg', carbon: Math.round(attendeeCount * benchmark.average), fill: '#94a3b8' },
    { name: 'Best Practice', carbon: Math.round(attendeeCount * benchmark.best), fill: '#06b6d4' },
  ];

  const radialData = [
    { name: 'Score', value: result.greenScore, fill: result.greenScore >= 70 ? '#10b981' : result.greenScore >= 40 ? '#f59e0b' : '#ef4444' },
  ];

  const reductionPotential = Math.round(result.carbonKg * 0.47);

  // Yearly trend projection data
  const trendData = [
    { month: 'Current', carbon: result.carbonKg, optimized: result.carbonKg },
    { month: 'Q2', carbon: result.carbonKg * 0.9, optimized: result.carbonKg * 0.7 },
    { month: 'Q3', carbon: result.carbonKg * 0.85, optimized: result.carbonKg * 0.5 },
    { month: 'Q4', carbon: result.carbonKg * 0.8, optimized: result.carbonKg * 0.35 },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-20 lg:py-28 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20 relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-100/10 to-emerald-100/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header with animation */}
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 backdrop-blur-sm border border-blue-200/50 text-blue-700 rounded-full text-sm font-semibold mb-6 shadow-sm">
            <BarChart3 className="w-4 h-4" />
            Environmental Impact Analysis
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-emerald-800 bg-clip-text text-transparent">
              Your Environmental Impact
            </span>
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
            Comprehensive analysis of your event's environmental footprint with
            <span className="text-blue-600 font-semibold"> business insights</span>,
            <span className="text-emerald-600 font-semibold"> industry benchmarks</span>, and
            <span className="text-purple-600 font-semibold"> actionable recommendations</span>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className={`flex flex-wrap justify-center gap-3 mb-10 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <button
            onClick={() => setShowSaveModal(true)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${
              saved
                ? 'bg-emerald-500 text-white'
                : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-violet-200'
            }`}
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save Event'}
          </button>
          <button
            onClick={onShare}
            className="flex items-center gap-2 px-5 py-3 bg-white/80 backdrop-blur-sm text-emerald-700 rounded-xl text-sm font-semibold hover:bg-emerald-50 transition-all border border-emerald-200 shadow-md"
          >
            <Share2 className="w-4 h-4" />
            Share Report
          </button>
          <button
            onClick={() => {
              const text = `EcobServe Report\n\nCarbon: ${result.carbonKg} kg CO₂\nWater: ${result.waterLiters} L\nWaste: ${result.wasteKg} kg\nGreen Score: ${result.greenScore}/100\n\nPer Attendee:\nCarbon: ${perAttendee.carbon.toFixed(1)} kg\nWater: ${perAttendee.water.toFixed(0)} L\nWaste: ${perAttendee.waste.toFixed(1)} kg\n\nIndustry Percentile: ${percentile}%\nOffset Cost: $${offsetCosts.goldStandard.toFixed(2)}`;
              const blob = new Blob([text], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'environmental-impact-report.txt';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-2 px-5 py-3 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all border border-gray-200 shadow-md"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>

        {/* Hero Metrics Cards - Total Impact */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {[
            { label: 'Total Carbon', value: Math.round(animatedCarbon).toLocaleString(), unit: 'kg CO₂', icon: Factory, gradient: 'from-red-500 to-rose-500', bg: 'bg-red-50', border: 'border-red-200' },
            { label: 'Water Usage', value: Math.round(animatedWater).toLocaleString(), unit: 'liters', icon: Droplets, gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', border: 'border-blue-200' },
            { label: 'Waste Output', value: Math.round(animatedWaste).toLocaleString(), unit: 'kg', icon: Trash2, gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', border: 'border-amber-200' },
            { label: 'Green Score', value: Math.round(animatedScore), unit: '/100', icon: Award, gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
          ].map((metric, i) => (
            <div
              key={i}
              className={`group relative ${metric.bg} rounded-2xl p-5 border ${metric.border} hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{metric.label}</span>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${metric.gradient} flex items-center justify-center`}>
                    <metric.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className={`text-2xl sm:text-3xl font-black bg-gradient-to-r ${metric.gradient} bg-clip-text text-transparent`}>
                  {metric.value}
                </div>
                <div className="text-xs text-gray-500 mt-1">{metric.unit}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Per-Attendee Metrics - Business Insight */}
        <div className={`bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 mb-8 relative overflow-hidden transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-50" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Per-Attendee Impact</h3>
                <p className="text-slate-400 text-sm">Based on {attendeeCount} attendees • Industry benchmark comparison</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Carbon/Person', value: perAttendee.carbon.toFixed(1), unit: 'kg CO₂', benchmark: benchmark.average, isBetter: perAttendee.carbon < benchmark.average, icon: Factory },
                { label: 'Water/Person', value: perAttendee.water.toFixed(0), unit: 'liters', benchmark: 75, isBetter: perAttendee.water < 75, icon: Droplets },
                { label: 'Waste/Person', value: perAttendee.waste.toFixed(1), unit: 'kg', benchmark: 2.5, isBetter: perAttendee.waste < 2.5, icon: Trash2 },
                { label: 'Industry Rank', value: Math.round(animatedPercentile), unit: '%ile', benchmark: 50, isBetter: percentile > 50, icon: TrendingUp },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <item.icon className="w-5 h-5 text-slate-400" />
                    {item.isBetter ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                        <TrendingDown className="w-3 h-3" /> Better
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold text-amber-400">
                        <TrendingUp className="w-3 h-3" /> Above avg
                      </span>
                    )}
                  </div>
                  <div className="text-3xl font-black text-white mb-1">{item.value}</div>
                  <div className="text-xs text-slate-400">{item.unit}</div>
                  <div className="text-xs text-slate-500 mt-2">Benchmark: {item.benchmark}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts grid - Enhanced */}
        <div className={`grid lg:grid-cols-2 gap-6 mb-8 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Carbon Breakdown</h3>
              </div>
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button onClick={() => setActiveChart('pie')} className={`px-4 py-2 rounded-md text-xs font-semibold transition-all ${activeChart === 'pie' ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Pie</button>
                <button onClick={() => setActiveChart('bar')} className={`px-4 py-2 rounded-md text-xs font-semibold transition-all ${activeChart === 'bar' ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Bar</button>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {activeChart === 'pie' ? (
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, index) => (<Cell key={index} fill={entry.color} stroke="white" strokeWidth={2} />))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value} kg CO₂`, '']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                ) : (
                  <BarChart data={pieData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value: number) => [`${value} kg CO₂`, '']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {pieData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {pieData.map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full text-sm">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-700 font-medium">{item.name}:</span>
                  <span className="text-gray-900 font-bold">{item.value} kg</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Industry Comparison</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#6b7280' }} width={90} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value: number) => [`${value.toLocaleString()} kg CO₂`, '']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="carbon" radius={[0, 8, 8, 0]} barSize={28}>
                    {barData.map((entry, index) => (<Cell key={index} fill={entry.fill} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-700">
                  {barData[1].carbon > result.carbonKg ? `${Math.round(((barData[1].carbon - result.carbonKg) / barData[1].carbon) * 100)}% below industry average` : 'At industry average'}
                </span>
              </div>
              <p className="text-xs text-emerald-600">Top {100 - percentile}% of sustainable events in this category.</p>
            </div>
          </div>
        </div>

        {/* Carbon Credit Valuation - NEW Business Insight */}
        <div className={`bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-3xl shadow-xl border border-amber-200 p-6 sm:p-8 mb-8 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Carbon Offset Valuation</h3>
                <p className="text-sm text-gray-500">{carbonTonnes.toFixed(2)} tonnes CO₂ • Choose your offset quality</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-xl border border-amber-200">
              <Globe className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-700">Market Prices 2026</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { tier: 'Voluntary', price: CARBON_CREDIT_PRICES.voluntary, cost: offsetCosts.voluntary, desc: 'Basic certified offsets', icon: Leaf, gradient: 'from-gray-100 to-slate-100', border: 'border-gray-300', text: 'text-gray-700' },
              { tier: 'VCS Verified', price: CARBON_CREDIT_PRICES.verified, cost: offsetCosts.verified, desc: 'Verra Carbon Standard', icon: Shield, gradient: 'from-blue-100 to-indigo-100', border: 'border-blue-300', text: 'text-blue-700' },
              { tier: 'Gold Standard', price: CARBON_CREDIT_PRICES.goldStandard, cost: offsetCosts.goldStandard, desc: 'Best value • Recommended', icon: Award, gradient: 'from-amber-100 to-yellow-100', border: 'border-amber-400', text: 'text-amber-700', recommended: true },
              { tier: 'Premium Nature', price: CARBON_CREDIT_PRICES.premium, cost: offsetCosts.premium, desc: 'Biodiversity co-benefits', icon: TreePine, gradient: 'from-emerald-100 to-green-100', border: 'border-emerald-400', text: 'text-emerald-700' },
            ].map((item, i) => (
              <div key={i} className={`relative bg-gradient-to-br ${item.gradient} rounded-2xl p-5 border-2 ${item.border} hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${item.recommended ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}>
                {item.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full shadow-md">
                    RECOMMENDED
                  </div>
                )}
                <div className="flex items-center justify-between mb-3">
                  <item.icon className={`w-6 h-6 ${item.text}`} />
                  <span className="text-xs font-semibold text-gray-500">${item.price}/tonne</span>
                </div>
                <div className={`text-2xl sm:text-3xl font-black ${item.text} mb-1`}>${item.cost.toFixed(2)}</div>
                <div className="text-xs font-semibold text-gray-700">{item.tier}</div>
                <div className="text-xs text-gray-500 mt-1">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SDG Alignment - NEW Business Insight */}
        <div className={`bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 mb-8 transition-all duration-700 delay-[600ms] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">UN SDG Alignment</h3>
                <p className="text-sm text-gray-500">Sustainable Development Goals your event supports</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-200">
              <Heart className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">{SDG_GOALS.filter(g => g.relevant).length} Goals Aligned</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {SDG_GOALS.map((goal) => (
              <div key={goal.id} className={`group relative ${goal.color} rounded-2xl p-4 text-white hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl cursor-default`}>
                <div className="absolute top-2 right-2 text-white/60 text-xs font-bold">SDG {goal.id}</div>
                <goal.icon className="w-8 h-8 mb-2 opacity-90" />
                <div className="text-sm font-bold leading-tight">{goal.name}</div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-2xl transition-all duration-300" />
              </div>
            ))}
          </div>
        </div>

        {/* Action Priority Matrix - NEW Business Insight */}
        <div className={`bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 rounded-3xl shadow-xl border border-violet-200 p-6 sm:p-8 mb-8 transition-all duration-700 delay-[700ms] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Action Priority Matrix</h3>
                <p className="text-sm text-gray-500">Ranked by impact-to-effort ratio • Quick wins first</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-xl border border-violet-200">
              <Target className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-semibold text-violet-700">Save up to {actionPriorities.reduce((sum, a) => sum + a.potential, 0).toLocaleString()} kg CO₂</span>
            </div>
          </div>

          <div className="space-y-4">
            {actionPriorities.map((item, i) => (
              <div key={i} className={`bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 ${i === 0 ? 'ring-2 ring-violet-400 ring-offset-2' : ''}`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${i === 0 ? 'from-violet-500 to-purple-500' : 'from-gray-100 to-gray-200'} flex items-center justify-center shadow-md`}>
                      <item.icon className={`w-6 h-6 ${i === 0 ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900">{item.category}</span>
                        {i === 0 && <span className="px-2 py-0.5 bg-violet-500 text-white text-xs font-bold rounded-full">QUICK WIN</span>}
                      </div>
                      <p className="text-sm text-gray-600">{item.action}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 sm:gap-8">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Current</div>
                      <div className="text-lg font-bold text-gray-700">{item.impact} kg</div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-violet-400" />
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Savings</div>
                      <div className="text-lg font-bold text-emerald-600">-{item.potential} kg</div>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3].map((level) => (
                        <div key={level} className={`w-2 h-6 rounded-full ${level <= item.effort ? 'bg-amber-400' : 'bg-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Yearly Projection & Trend - NEW Business Insight */}
        <div className={`grid lg:grid-cols-2 gap-6 mb-8 transition-all duration-700 delay-[800ms] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Yearly Projection</h3>
                <p className="text-xs text-gray-500">Based on 4 similar events per year</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Annual Carbon', value: (yearlyProjection.carbon / 1000).toFixed(1), unit: 'tonnes CO₂', color: 'text-red-600', bg: 'bg-red-50' },
                { label: 'Annual Water', value: (yearlyProjection.water / 1000).toFixed(1), unit: 'kL water', color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Annual Waste', value: yearlyProjection.waste.toLocaleString(), unit: 'kg waste', color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Annual Offset Cost', value: `$${yearlyProjection.offsetCost.toFixed(0)}`, unit: 'Gold Standard', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              ].map((item, i) => (
                <div key={i} className={`${item.bg} rounded-xl p-4`}>
                  <div className="text-xs text-gray-500 font-medium mb-1">{item.label}</div>
                  <div className={`text-xl font-black ${item.color}`}>{item.value}</div>
                  <div className="text-xs text-gray-500">{item.unit}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Reduction Roadmap</h3>
                <p className="text-xs text-gray-500">Quarterly improvement trajectory</p>
              </div>
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="carbonGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="optimizedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="carbon" stroke="#94a3b8" fill="url(#carbonGradient)" strokeWidth={2} name="Baseline" />
                  <Area type="monotone" dataKey="optimized" stroke="#10b981" fill="url(#optimizedGradient)" strokeWidth={2} name="Optimized" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center gap-2 text-xs"><div className="w-3 h-3 rounded-full bg-gray-400" /><span className="text-gray-600">Baseline</span></div>
              <div className="flex items-center gap-2 text-xs"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-gray-600">With Optimizations</span></div>
            </div>
          </div>
        </div>

        {/* Bottom row - Enhanced */}
        <div className={`grid lg:grid-cols-3 gap-6 transition-all duration-700 delay-[900ms] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Green Score */}
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] opacity-50" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-6 h-6 text-emerald-200" />
                <h3 className="text-lg font-bold">Sustainability Score</h3>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={radialData} startAngle={180} endAngle={0}>
                    <RadialBar background={{ fill: 'rgba(255,255,255,0.2)' }} dataKey="value" cornerRadius={10} fill="#34d399" />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center -mt-10">
                <div className="text-5xl font-black">{Math.round(animatedScore)}</div>
                <div className="text-emerald-200 text-sm mt-1 font-medium">out of 100 • {result.greenScore >= 80 ? 'Excellent' : result.greenScore >= 60 ? 'Good' : 'Fair'}</div>
              </div>
            </div>
          </div>

          {/* Reduction Potential */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Reduction Potential</h3>
            </div>
            <div className="text-center py-3">
              <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">-{reductionPotential.toLocaleString()} kg</div>
              <div className="text-sm text-gray-500 mb-4">CO₂ you can save with optimizations</div>
            </div>
            <div className="space-y-3">
              {actionPriorities.slice(0, 4).map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-700 font-semibold">{item.category}</span>
                    <span className="text-emerald-600 font-bold">-{item.potential} kg</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${i === 0 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : i === 1 ? 'bg-gradient-to-r from-blue-400 to-blue-500' : i === 2 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-purple-400 to-purple-500'}`}
                      style={{ width: `${Math.min((item.potential / result.carbonKg) * 100 * 2, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Impact Equivalence */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Impact Equivalence</h3>
            </div>
            <div className="space-y-3">
              {[
                { Icon: TreePine, label: 'Trees to offset', value: Math.round(result.carbonKg / 22), unit: 'trees/year', gradient: 'from-emerald-500 to-green-500' },
                { Icon: Car, label: 'Car distance', value: Math.round(result.carbonKg / 0.21).toLocaleString(), unit: 'km driven', gradient: 'from-blue-500 to-cyan-500' },
                { Icon: Plane, label: 'Flights', value: Math.round(result.carbonKg / 900), unit: 'round trips', gradient: 'from-purple-500 to-violet-500' },
                { Icon: Home, label: 'Home energy', value: Math.round(result.carbonKg / 4000 * 12), unit: 'months', gradient: 'from-amber-500 to-orange-500' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-md`}>
                    <item.Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">{item.label}</div>
                    <div className="text-sm font-bold text-gray-900">{item.value} <span className="font-normal text-gray-500">{item.unit}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowSaveModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Save className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Save Event</h3>
                <p className="text-sm text-gray-500">Store this calculation for future reference</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Name</label>
              <input
                type="text"
                value={eventName}
                onChange={e => { setEventName(e.target.value); setSaveError(null); }}
                placeholder="e.g., TechSummit 2026"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                autoFocus
              />
              {saveError && <p className="text-red-500 text-xs mt-1.5">{saveError}</p>}
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6 grid grid-cols-2 gap-3">
              <div><span className="text-xs text-gray-500">Carbon</span><div className="text-sm font-bold text-gray-900">{result.carbonKg.toLocaleString()} kg</div></div>
              <div><span className="text-xs text-gray-500">Water</span><div className="text-sm font-bold text-gray-900">{result.waterLiters.toLocaleString()} L</div></div>
              <div><span className="text-xs text-gray-500">Waste</span><div className="text-sm font-bold text-gray-900">{result.wasteKg.toLocaleString()} kg</div></div>
              <div><span className="text-xs text-gray-500">Green Score</span><div className="text-sm font-bold text-emerald-600">{result.greenScore}/100</div></div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowSaveModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-violet-700 hover:to-purple-700 transition-all disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default DashboardMetrics;
