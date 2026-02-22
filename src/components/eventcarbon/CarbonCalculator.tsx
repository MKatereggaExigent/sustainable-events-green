import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Building2, UtensilsCrossed, Car, Package, ChevronRight, ChevronLeft,
  Zap, TreePine, Droplets, Trash2, Check, TrendingDown, TrendingUp,
  DollarSign, Award, Target, Lightbulb, BarChart3, PieChart as PieChartIcon,
  AlertTriangle, CheckCircle2, Info, Sparkles, Leaf, Globe, Users,
  Calendar, Coins, ArrowRight, Scale, Factory, RefreshCw, Shield
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { EventInputs, defaultInputs, calculateFootprint } from '@/lib/carbonData';

interface CarbonCalculatorProps {
  onComplete: (inputs: EventInputs) => void;
  inputs: EventInputs;
  setInputs: React.Dispatch<React.SetStateAction<EventInputs>>;
}

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];

// Industry benchmarks per category (kg CO2e for 100 attendees, 1 day event)
const INDUSTRY_BENCHMARKS = {
  venue: { indoor: 150, outdoor: 50, hybrid: 100, virtual: 10 },
  fnb: { vegan: 150, vegetarian: 250, mixed: 450, meat_heavy: 700 },
  transport: { public: 125, mixed: 375, car: 525, flight: 1275 },
  materials: { none: 0, minimal: 50, standard: 150, premium: 300 },
};

// Carbon credit pricing (per tonne CO2e)
const CARBON_CREDIT_PRICE = 35; // Gold Standard average

// Animated counter hook
const useAnimatedValue = (value: number, duration: number = 600) => {
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

const steps = [
  { id: 0, label: 'Venue', icon: Building2, color: 'emerald' },
  { id: 1, label: 'Food & Beverage', icon: UtensilsCrossed, color: 'amber' },
  { id: 2, label: 'Transport', icon: Car, color: 'blue' },
  { id: 3, label: 'Materials', icon: Package, color: 'purple' },
];

const SelectButton: React.FC<{
  selected: boolean;
  onClick: () => void;
  label: string;
  description?: string;
}> = ({ selected, onClick, label, description }) => (
  <button
    onClick={onClick}
    className={`relative p-4 rounded-xl border-2 text-left transition-all ${
      selected
        ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100'
        : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30'
    }`}
  >
    {selected && (
      <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
        <Check className="w-3 h-3 text-white" />
      </div>
    )}
    <div className="font-medium text-gray-900 text-sm">{label}</div>
    {description && <div className="text-xs text-gray-500 mt-1">{description}</div>}
  </button>
);

const CarbonCalculator: React.FC<CarbonCalculatorProps> = ({ onComplete, inputs, setInputs }) => {
  const [step, setStep] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState<'pie' | 'bar'>('pie');
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const result = useMemo(() => calculateFootprint(inputs), [inputs]);

  // Visibility animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Animated values
  const animatedCarbon = useAnimatedValue(result.carbonKg);
  const animatedWater = useAnimatedValue(result.waterLiters);
  const animatedWaste = useAnimatedValue(result.wasteKg);
  const animatedScore = useAnimatedValue(result.greenScore);

  // Business calculations
  const carbonTonnes = result.carbonKg / 1000;
  const offsetCost = carbonTonnes * CARBON_CREDIT_PRICE;
  const perAttendeeCarbon = result.carbonKg / (inputs.fnb.guests || 100);

  // Industry benchmark comparison
  const industryAvg = useMemo(() => {
    const avgVenue = INDUSTRY_BENCHMARKS.venue.indoor;
    const avgFnb = INDUSTRY_BENCHMARKS.fnb.mixed;
    const avgTransport = INDUSTRY_BENCHMARKS.transport.mixed;
    const avgMaterials = INDUSTRY_BENCHMARKS.materials.standard;
    const guestMultiplier = inputs.fnb.guests / 100;
    return Math.round((avgVenue + avgFnb + avgTransport + avgMaterials) * guestMultiplier * inputs.venue.duration);
  }, [inputs.fnb.guests, inputs.venue.duration]);

  const percentBelowAvg = useMemo(() => {
    if (result.carbonKg >= industryAvg) return 0;
    return Math.round(((industryAvg - result.carbonKg) / industryAvg) * 100);
  }, [result.carbonKg, industryAvg]);

  // Pie chart data
  const pieData = useMemo(() => [
    { name: 'Venue', value: result.breakdown.venue, color: COLORS[0] },
    { name: 'Food & Bev', value: result.breakdown.fnb, color: COLORS[1] },
    { name: 'Transport', value: result.breakdown.transport, color: COLORS[2] },
    { name: 'Materials', value: result.breakdown.materials, color: COLORS[3] },
  ], [result.breakdown]);

  // Smart recommendations based on current selections
  const recommendations = useMemo(() => {
    const tips: { tip: string; savings: number; category: string; icon: typeof Leaf }[] = [];

    if (inputs.venue.energySource === 'grid') {
      tips.push({ tip: 'Switch to renewable energy venue', savings: Math.round(result.breakdown.venue * 0.85), category: 'Venue', icon: Zap });
    }
    if (inputs.fnb.mealType === 'meat_heavy' || inputs.fnb.mealType === 'mixed') {
      tips.push({ tip: 'Offer plant-based menu options', savings: Math.round(result.breakdown.fnb * 0.5), category: 'F&B', icon: Leaf });
    }
    if (inputs.transport.transportMode === 'car' || inputs.transport.transportMode === 'flight') {
      tips.push({ tip: 'Provide shuttle service from transit hubs', savings: Math.round(result.breakdown.transport * 0.4), category: 'Transport', icon: Car });
    }
    if (!inputs.transport.shuttleService && inputs.transport.transportMode !== 'public') {
      tips.push({ tip: 'Enable shuttle service option', savings: Math.round(result.breakdown.transport * 0.4), category: 'Transport', icon: Users });
    }
    if (inputs.materials.printedMaterials !== 'none' && !inputs.materials.digitalAlternatives) {
      tips.push({ tip: 'Go digital - use event app & QR codes', savings: Math.round(result.breakdown.materials * 0.8), category: 'Materials', icon: RefreshCw });
    }
    if (inputs.materials.swagBags) {
      tips.push({ tip: 'Replace physical swag with digital rewards', savings: Math.round(inputs.fnb.guests * 2), category: 'Materials', icon: Package });
    }

    return tips.sort((a, b) => b.savings - a.savings).slice(0, 3);
  }, [inputs, result.breakdown]);

  const totalPotentialSavings = useMemo(() => {
    return recommendations.reduce((sum, r) => sum + r.savings, 0);
  }, [recommendations]);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else onComplete(inputs);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Venue Type</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'indoor', label: 'Indoor', desc: 'Convention center, hotel' },
                  { value: 'outdoor', label: 'Outdoor', desc: 'Park, garden, rooftop' },
                  { value: 'hybrid', label: 'Hybrid', desc: 'Indoor + outdoor areas' },
                  { value: 'virtual', label: 'Virtual', desc: 'Fully online event' },
                ].map((opt) => (
                  <SelectButton
                    key={opt.value}
                    selected={inputs.venue.type === opt.value}
                    onClick={() => setInputs(prev => ({ ...prev, venue: { ...prev.venue, type: opt.value } }))}
                    label={opt.label}
                    description={opt.desc}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Venue Size</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { value: 'small', label: 'Small', desc: '<100' },
                  { value: 'medium', label: 'Medium', desc: '100-300' },
                  { value: 'large', label: 'Large', desc: '300-1000' },
                  { value: 'extra-large', label: 'XL', desc: '1000+' },
                ].map((opt) => (
                  <SelectButton
                    key={opt.value}
                    selected={inputs.venue.size === opt.value}
                    onClick={() => setInputs(prev => ({ ...prev, venue: { ...prev.venue, size: opt.value } }))}
                    label={opt.label}
                    description={opt.desc}
                  />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (days)</label>
                <input
                  type="range"
                  min={1}
                  max={7}
                  value={inputs.venue.duration}
                  onChange={(e) => setInputs(prev => ({ ...prev, venue: { ...prev.venue, duration: Number(e.target.value) } }))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 day</span>
                  <span className="font-semibold text-emerald-600">{inputs.venue.duration} {inputs.venue.duration === 1 ? 'day' : 'days'}</span>
                  <span>7 days</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Energy Source</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'grid', label: 'Grid' },
                    { value: 'renewable', label: 'Renewable' },
                    { value: 'hybrid_energy', label: 'Hybrid' },
                    { value: 'solar', label: 'Solar' },
                  ].map((opt) => (
                    <SelectButton
                      key={opt.value}
                      selected={inputs.venue.energySource === opt.value}
                      onClick={() => setInputs(prev => ({ ...prev, venue: { ...prev.venue, energySource: opt.value } }))}
                      label={opt.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Guests</label>
              <input
                type="range"
                min={10}
                max={2000}
                step={10}
                value={inputs.fnb.guests}
                onChange={(e) => setInputs(prev => ({ ...prev, fnb: { ...prev.fnb, guests: Number(e.target.value) } }))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10</span>
                <span className="font-semibold text-emerald-600 text-base">{inputs.fnb.guests} guests</span>
                <span>2,000</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Menu Type</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'vegan', label: 'Vegan', desc: '100% plant-based' },
                  { value: 'vegetarian', label: 'Vegetarian', desc: 'No meat, includes dairy' },
                  { value: 'mixed', label: 'Mixed', desc: 'Meat and plant options' },
                  { value: 'meat_heavy', label: 'Meat-Heavy', desc: 'Primarily meat dishes' },
                ].map((opt) => (
                  <SelectButton
                    key={opt.value}
                    selected={inputs.fnb.mealType === opt.value}
                    onClick={() => setInputs(prev => ({ ...prev, fnb: { ...prev.fnb, mealType: opt.value } }))}
                    label={opt.label}
                    description={opt.desc}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Beverages</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { value: 'water_only', label: 'Water Only' },
                  { value: 'standard', label: 'Standard' },
                  { value: 'premium', label: 'Premium' },
                  { value: 'alcohol_heavy', label: 'Full Bar' },
                ].map((opt) => (
                  <SelectButton
                    key={opt.value}
                    selected={inputs.fnb.beverages === opt.value}
                    onClick={() => setInputs(prev => ({ ...prev, fnb: { ...prev.fnb, beverages: opt.value } }))}
                    label={opt.label}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Expected Attendees</label>
              <input
                type="range"
                min={10}
                max={2000}
                step={10}
                value={inputs.transport.attendees}
                onChange={(e) => setInputs(prev => ({ ...prev, transport: { ...prev.transport, attendees: Number(e.target.value) } }))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10</span>
                <span className="font-semibold text-emerald-600 text-base">{inputs.transport.attendees} attendees</span>
                <span>2,000</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Average Travel Distance (km)</label>
              <input
                type="range"
                min={5}
                max={500}
                step={5}
                value={inputs.transport.avgDistance}
                onChange={(e) => setInputs(prev => ({ ...prev, transport: { ...prev.transport, avgDistance: Number(e.target.value) } }))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5 km</span>
                <span className="font-semibold text-emerald-600 text-base">{inputs.transport.avgDistance} km</span>
                <span>500 km</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Primary Transport Mode</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'public', label: 'Public Transit', desc: 'Bus, train, metro' },
                  { value: 'mixed', label: 'Mixed', desc: 'Combination of modes' },
                  { value: 'car', label: 'Personal Cars', desc: 'Individual driving' },
                  { value: 'flight', label: 'Air Travel', desc: 'Domestic/international' },
                ].map((opt) => (
                  <SelectButton
                    key={opt.value}
                    selected={inputs.transport.transportMode === opt.value}
                    onClick={() => setInputs(prev => ({ ...prev, transport: { ...prev.transport, transportMode: opt.value } }))}
                    label={opt.label}
                    description={opt.desc}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <button
                onClick={() => setInputs(prev => ({ ...prev, transport: { ...prev.transport, shuttleService: !prev.transport.shuttleService } }))}
                className={`w-12 h-7 rounded-full transition-all relative ${
                  inputs.transport.shuttleService ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${
                  inputs.transport.shuttleService ? 'left-5' : 'left-0.5'
                }`} />
              </button>
              <div>
                <div className="text-sm font-medium text-gray-900">Shuttle Service</div>
                <div className="text-xs text-gray-500">Reduces transport emissions by ~40%</div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Printed Materials</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'none', label: 'None', desc: 'Fully digital' },
                  { value: 'minimal', label: 'Minimal', desc: 'Name badges only' },
                  { value: 'standard', label: 'Standard', desc: 'Programs, brochures' },
                  { value: 'premium', label: 'Premium', desc: 'Full print package' },
                ].map((opt) => (
                  <SelectButton
                    key={opt.value}
                    selected={inputs.materials.printedMaterials === opt.value}
                    onClick={() => setInputs(prev => ({ ...prev, materials: { ...prev.materials, printedMaterials: opt.value } }))}
                    label={opt.label}
                    description={opt.desc}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Decorations</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'none', label: 'None', desc: 'Venue as-is' },
                  { value: 'minimal', label: 'Minimal', desc: 'Simple arrangements' },
                  { value: 'standard', label: 'Standard', desc: 'Full event styling' },
                  { value: 'elaborate', label: 'Elaborate', desc: 'Premium production' },
                ].map((opt) => (
                  <SelectButton
                    key={opt.value}
                    selected={inputs.materials.decorations === opt.value}
                    onClick={() => setInputs(prev => ({ ...prev, materials: { ...prev.materials, decorations: opt.value } }))}
                    label={opt.label}
                    description={opt.desc}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <button
                  onClick={() => setInputs(prev => ({ ...prev, materials: { ...prev.materials, swagBags: !prev.materials.swagBags } }))}
                  className={`w-12 h-7 rounded-full transition-all relative flex-shrink-0 ${
                    inputs.materials.swagBags ? 'bg-amber-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${
                    inputs.materials.swagBags ? 'left-5' : 'left-0.5'
                  }`} />
                </button>
                <div>
                  <div className="text-sm font-medium text-gray-900">Physical Swag Bags</div>
                  <div className="text-xs text-gray-500">Branded merchandise for attendees</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <button
                  onClick={() => setInputs(prev => ({ ...prev, materials: { ...prev.materials, digitalAlternatives: !prev.materials.digitalAlternatives } }))}
                  className={`w-12 h-7 rounded-full transition-all relative flex-shrink-0 ${
                    inputs.materials.digitalAlternatives ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${
                    inputs.materials.digitalAlternatives ? 'left-5' : 'left-0.5'
                  }`} />
                </button>
                <div>
                  <div className="text-sm font-medium text-gray-900">Digital Alternatives</div>
                  <div className="text-xs text-gray-500">Event app, QR codes, e-tickets</div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section ref={sectionRef} className="py-24 bg-gradient-to-b from-gray-50 via-white to-emerald-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header with animation */}
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-full text-sm font-medium mb-4 shadow-sm">
            <Sparkles className="w-4 h-4 animate-pulse" />
            Real-time Business Intelligence Calculator
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Calculate Your Event's{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Carbon Footprint
            </span>
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            Get instant environmental impact metrics, cost estimates, industry benchmarks, and actionable reduction strategies — all updating in real-time as you configure your event.
          </p>

          {/* Quick Stats Banner */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
              <Target className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-gray-600">Industry Benchmarking</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-gray-600">Offset Cost Estimation</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
              <Lightbulb className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-gray-600">Smart Recommendations</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Calculator form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Step indicators */}
              <div className="flex border-b border-gray-100">
                {steps.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setStep(i)}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 px-3 text-sm font-medium transition-all border-b-2 ${
                        step === i
                          ? 'border-emerald-500 text-emerald-700 bg-emerald-50/50'
                          : step > i
                          ? 'border-emerald-300 text-emerald-600 bg-emerald-50/30'
                          : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                        step === i
                          ? 'bg-emerald-500 text-white'
                          : step > i
                          ? 'bg-emerald-200 text-emerald-700'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {step > i ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                      </div>
                      <span className="hidden sm:inline">{s.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Form content */}
              <div className="p-6 sm:p-8 min-h-[420px]">
                {renderStep()}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between px-6 sm:px-8 py-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={handleBack}
                  disabled={step === 0}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    step === 0
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <div className="text-sm text-gray-400">Step {step + 1} of 4</div>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md shadow-emerald-200"
                >
                  {step === 3 ? 'Calculate' : 'Next'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Live preview with Business Insights */}
          <div className={`space-y-4 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Hero Impact Card */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500/10 rounded-full blur-xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Live Carbon Footprint</h3>
                  <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 rounded-full text-xs text-emerald-400">
                    <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} />
                    Real-time
                  </div>
                </div>
                <div className="text-4xl font-bold mb-1">
                  {Math.round(animatedCarbon).toLocaleString()}
                  <span className="text-lg font-normal text-slate-400 ml-2">kg CO₂e</span>
                </div>
                <div className="text-slate-400 text-sm mb-4">
                  {carbonTonnes.toFixed(2)} tonnes carbon equivalent
                </div>

                {/* Per-attendee metric */}
                <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl mb-3">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <div className="flex-1">
                    <div className="text-sm text-slate-400">Per Attendee</div>
                    <div className="text-lg font-semibold">{perAttendeeCarbon.toFixed(1)} kg CO₂</div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${perAttendeeCarbon < 8 ? 'bg-emerald-500/20 text-emerald-400' : perAttendeeCarbon < 12 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                    {perAttendeeCarbon < 8 ? 'Excellent' : perAttendeeCarbon < 12 ? 'Average' : 'High'}
                  </div>
                </div>

                {/* Industry Benchmark Comparison */}
                <div className="p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">vs Industry Average</span>
                    <span className={`text-sm font-semibold ${percentBelowAvg > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {percentBelowAvg > 0 ? `${percentBelowAvg}% below` : `${Math.abs(Math.round(((result.carbonKg - industryAvg) / industryAvg) * 100))}% above`}
                    </span>
                  </div>
                  <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="absolute h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, (result.carbonKg / industryAvg) * 100)}%` }}
                    />
                    <div
                      className="absolute h-full w-0.5 bg-white/50"
                      style={{ left: '100%', transform: 'translateX(-100%)' }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-slate-500">
                    <span>Your Event: {result.carbonKg.toLocaleString()} kg</span>
                    <span>Avg: {industryAvg.toLocaleString()} kg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Carbon Offset Cost Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">Carbon Offset Cost</h3>
                  <p className="text-xs text-gray-500">Gold Standard Credits</p>
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-bold text-gray-900">${Math.round(offsetCost).toLocaleString()}</span>
                <span className="text-sm text-gray-500">to offset</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <div className="text-gray-500">Per Attendee</div>
                  <div className="font-semibold text-gray-700">${(offsetCost / (inputs.fnb.guests || 100)).toFixed(2)}</div>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <div className="text-gray-500">Per Day</div>
                  <div className="font-semibold text-gray-700">${(offsetCost / (inputs.venue.duration || 1)).toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Green Score with Animation */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-lg p-5 text-white relative overflow-hidden">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
              <h3 className="text-sm font-semibold text-emerald-200 uppercase tracking-wide mb-3">Sustainability Score</h3>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
                    <circle
                      cx="40" cy="40" r="35" fill="none" stroke="white" strokeWidth="6"
                      strokeDasharray={`${(animatedScore / 100) * 220} 220`}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{Math.round(animatedScore)}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-lg font-semibold">
                    {result.greenScore >= 80 ? '🏆 Excellent' : result.greenScore >= 60 ? '✅ Good' : result.greenScore >= 40 ? '⚠️ Fair' : '🔴 Needs Work'}
                  </div>
                  <div className="text-emerald-200 text-sm mb-2">
                    {result.greenScore >= 80 ? 'Top 10% sustainable events' : result.greenScore >= 60 ? 'Above industry average' : 'Room for improvement'}
                  </div>
                  {totalPotentialSavings > 0 && (
                    <div className="text-xs bg-white/20 rounded-full px-3 py-1 inline-flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +{Math.round((totalPotentialSavings / result.carbonKg) * 100)}% potential improvement
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Breakdown Chart */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Emission Breakdown</h3>
                <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                  <button
                    onClick={() => setShowBreakdown('pie')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${showBreakdown === 'pie' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                  >
                    <PieChartIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setShowBreakdown('bar')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${showBreakdown === 'bar' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  {showBreakdown === 'pie' ? (
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={55}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`${value.toLocaleString()} kg`, '']}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                    </PieChart>
                  ) : (
                    <BarChart data={pieData} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(value: number) => [`${value.toLocaleString()} kg CO₂`, '']}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {pieData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600">{item.name}</span>
                    <span className="text-gray-400 ml-auto">{Math.round((item.value / result.carbonKg) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Recommendations */}
            {recommendations.length > 0 && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg border border-amber-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm font-semibold text-gray-700">Quick Wins</h3>
                  <span className="ml-auto text-xs text-amber-600 font-medium">
                    Save {totalPotentialSavings.toLocaleString()} kg CO₂
                  </span>
                </div>
                <div className="space-y-2">
                  {recommendations.map((rec, i) => {
                    const RecIcon = rec.icon;
                    return (
                      <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-amber-100 hover:border-amber-200 transition-colors">
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <RecIcon className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-800">{rec.tip}</div>
                          <div className="text-xs text-gray-500">{rec.category}</div>
                        </div>
                        <div className="text-xs font-semibold text-emerald-600 whitespace-nowrap">
                          -{rec.savings.toLocaleString()} kg
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Environmental Equivalents */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-500" />
                Environmental Impact
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50 rounded-xl text-center">
                  <TreePine className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <div className="text-lg font-bold text-gray-900">{Math.round(result.carbonKg / 22)}</div>
                  <div className="text-xs text-gray-500">Trees to offset</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl text-center">
                  <Car className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <div className="text-lg font-bold text-gray-900">{Math.round(result.carbonKg / 0.21 / 1000)}k</div>
                  <div className="text-xs text-gray-500">km driving</div>
                </div>
                <div className="p-3 bg-cyan-50 rounded-xl text-center">
                  <Droplets className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
                  <div className="text-lg font-bold text-gray-900">{Math.round(animatedWater).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">L water used</div>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl text-center">
                  <Trash2 className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                  <div className="text-lg font-bold text-gray-900">{Math.round(animatedWaste)}</div>
                  <div className="text-xs text-gray-500">kg waste</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarbonCalculator;
