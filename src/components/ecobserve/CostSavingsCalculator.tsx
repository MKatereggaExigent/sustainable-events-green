import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  DollarSign, TrendingDown, TrendingUp, Leaf, Zap, Building2,
  PiggyBank, Receipt, Calculator, ChevronRight, BadgePercent,
  Lightbulb, BarChart3, ArrowRight, Sparkles, Target, Shield,
  Award, Clock, Globe, CheckCircle2, Info, ArrowUpRight,
  TrendingDown as TrendingDownIcon, Percent, Banknote, Wallet,
  Recycle, Droplets, Scale, Flame, ArrowDown, Minus
} from 'lucide-react';
import { EventInputs, FootprintResult } from '@/lib/carbonData';
import {
  CostInputs,
  defaultCostInputs,
  calculateCostSavings,
  CostSavingsResult,
  TaxIncentive,
  getApplicableTaxIncentives,
  REGION_OPTIONS
} from '@/lib/costData';
import { useSettings } from '@/contexts/SettingsContext';

interface CostSavingsCalculatorProps {
  carbonInputs: EventInputs;
  carbonResult: FootprintResult;
}

// Animated counter hook for smooth number transitions
const useAnimatedValue = (value: number, duration: number = 800) => {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
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

// Progress bar component with animation
const AnimatedProgressBar: React.FC<{
  percentage: number;
  color: string;
  delay?: number;
}> = ({ percentage, color, delay = 0 }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(percentage), delay);
    return () => clearTimeout(timer);
  }, [percentage, delay]);

  return (
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
};

const CostSavingsCalculator: React.FC<CostSavingsCalculatorProps> = ({
  carbonInputs,
  carbonResult
}) => {
  const { formatCurrency, maskValue } = useSettings();
  const [costInputs, setCostInputs] = useState<CostInputs>(defaultCostInputs);
  const [activeTab, setActiveTab] = useState<'calculator' | 'incentives' | 'comparison'>('calculator');
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Intersection observer for fade-in animation
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

  const savingsResult = useMemo(
    () => calculateCostSavings(carbonInputs, carbonResult, costInputs),
    [carbonInputs, carbonResult, costInputs]
  );

  const taxIncentives = useMemo(
    () => getApplicableTaxIncentives(costInputs.region, carbonResult),
    [costInputs.region, carbonResult]
  );

  const totalIncentives = taxIncentives.reduce((sum, inc) => sum + inc.estimatedValue, 0);

  // Animated values
  const animatedTotalBenefit = useAnimatedValue(savingsResult.totalEconomicBenefit);
  const animatedSavings = useAnimatedValue(savingsResult.totalSavings);
  const animatedROI = useAnimatedValue(savingsResult.roiPercentage);
  const animatedIncentives = useAnimatedValue(totalIncentives);

  return (
    <section
      ref={sectionRef}
      className="py-20 lg:py-28 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-emerald-100/10 to-teal-100/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header with animation */}
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-sm border border-emerald-200/50 text-emerald-700 rounded-full text-sm font-semibold mb-6 shadow-sm">
            <DollarSign className="w-4 h-4" />
            Financial Impact Analysis
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-emerald-800 to-teal-800 bg-clip-text text-transparent">
              Sustainability Cost & Savings
            </span>
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
            Discover the financial value of reducing carbon, waste, and energy use —
            including <span className="text-emerald-600 font-semibold">real cost savings</span> and
            <span className="text-amber-600 font-semibold"> potential tax incentives</span>.
          </p>
        </div>

        {/* Quick Stats Bar */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {[
            { label: 'Total Benefit', value: maskValue(formatCurrency(Math.round(animatedTotalBenefit))), icon: Target, color: 'emerald', gradient: 'from-emerald-500 to-teal-500' },
            { label: 'Direct Savings', value: maskValue(formatCurrency(Math.round(animatedSavings))), icon: PiggyBank, color: 'blue', gradient: 'from-blue-500 to-cyan-500' },
            { label: 'ROI', value: `${maskValue(Math.round(animatedROI))}%`, icon: TrendingUp, color: 'purple', gradient: 'from-purple-500 to-pink-500' },
            { label: 'Tax Credits', value: maskValue(formatCurrency(Math.round(animatedIncentives))), icon: BadgePercent, color: 'amber', gradient: 'from-amber-500 to-orange-500' },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-${stat.color}-100 mb-3`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
              </div>
              <div className="text-xs sm:text-sm text-gray-500 font-medium mb-1">{stat.label}</div>
              <div className={`text-xl sm:text-2xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation - Premium Style */}
        <div className={`flex justify-center mb-10 px-2 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 shadow-lg border border-gray-100">
            {[
              { id: 'calculator', label: 'Cost Calculator', mobileLabel: 'Calculator', icon: Calculator, description: 'Input costs & see savings' },
              { id: 'incentives', label: 'Tax Incentives', mobileLabel: 'Incentives', icon: BadgePercent, description: 'Available credits' },
              { id: 'comparison', label: 'ROI Comparison', mobileLabel: 'ROI', icon: BarChart3, description: 'Traditional vs sustainable' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`relative flex items-center gap-2 px-4 sm:px-8 py-3 sm:py-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? 'text-white shadow-lg'
                      : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/50'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl" />
                  )}
                  <span className="relative flex items-center gap-2">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.mobileLabel}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Calculator Tab */}
        {activeTab === 'calculator' && (
          <div className={`grid lg:grid-cols-5 gap-6 lg:gap-8 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {/* Left: Input Form - Takes 3 columns */}
            <div className="lg:col-span-3">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/80 overflow-hidden">
                {/* Form Header */}
                <div className="bg-gradient-to-r from-gray-50 to-emerald-50/30 px-6 sm:px-8 py-5 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <Receipt className="w-5 h-5 text-white" />
                    </div>
                    Enter Your Event Costs
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 ml-13">Input your current event expenses to calculate potential savings</p>
                </div>

                <div className="p-6 sm:p-8">
                  {/* Cost Input Cards */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { key: 'venueCost', label: 'Venue Rental', icon: Building2, color: 'purple', placeholder: '5000' },
                      { key: 'energyCost', label: 'Energy & Utilities', icon: Zap, color: 'amber', placeholder: '1500' },
                      { key: 'cateringCost', label: 'Catering', icon: Leaf, color: 'green', placeholder: '8000' },
                      { key: 'transportCost', label: 'Transport & Logistics', icon: Globe, color: 'blue', placeholder: '3000' },
                      { key: 'materialsCost', label: 'Materials & Printing', icon: Receipt, color: 'pink', placeholder: '2000' },
                      { key: 'wasteDisposalCost', label: 'Waste Disposal', icon: TrendingDownIcon, color: 'orange', placeholder: '500' },
                    ].map((field, index) => {
                      const Icon = field.icon;
                      const value = costInputs[field.key as keyof CostInputs] as number;
                      const saving = savingsResult.breakdown[field.key.replace('Cost', '') as keyof typeof savingsResult.breakdown];
                      return (
                        <div
                          key={field.key}
                          className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 p-4 hover:shadow-lg hover:border-emerald-200 transition-all duration-300"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div className={`w-8 h-8 rounded-lg bg-${field.color}-100 flex items-center justify-center`}>
                              <Icon className={`w-4 h-4 text-${field.color}-600`} />
                            </div>
                            <label className="text-sm font-semibold text-gray-700">{field.label}</label>
                          </div>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                            <input
                              type="number"
                              value={value}
                              onChange={(e) => setCostInputs(prev => ({ ...prev, [field.key]: Number(e.target.value) }))}
                              className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-lg font-semibold text-gray-900"
                              placeholder={field.placeholder}
                            />
                          </div>
                          {saving && value > 0 && (
                            <div className="mt-2 flex items-center justify-between text-xs">
                              <span className="text-gray-500">Potential savings</span>
                              <span className="font-bold text-emerald-600 flex items-center gap-1">
                                <TrendingDown className="w-3 h-3" />
                                {maskValue(formatCurrency(saving.savings))} ({maskValue(saving.savingsPercent)}%)
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Advanced Settings - Collapsible Style */}
                  <div className="mt-8 bg-gradient-to-r from-slate-50 to-emerald-50/30 rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
                        <Calculator className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Event Configuration</h4>
                        <p className="text-xs text-gray-500">Adjust settings for more accurate calculations</p>
                      </div>
                    </div>
                    <div className="p-5 grid sm:grid-cols-2 gap-4">
                      {/* Attendee Count */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <Target className="w-4 h-4 text-blue-500" />
                          Attendees
                        </label>
                        <input
                          type="number"
                          value={costInputs.attendeeCount || 100}
                          onChange={(e) => setCostInputs(prev => ({ ...prev, attendeeCount: Number(e.target.value) }))}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-semibold"
                          placeholder="100"
                          min="1"
                        />
                      </div>

                      {/* Event Duration */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <Clock className="w-4 h-4 text-purple-500" />
                          Duration (hours)
                        </label>
                        <input
                          type="number"
                          value={costInputs.eventDurationHours || 8}
                          onChange={(e) => setCostInputs(prev => ({ ...prev, eventDurationHours: Number(e.target.value) }))}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-semibold"
                          placeholder="8"
                          min="1"
                        />
                      </div>

                      {/* Region Selector */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <Globe className="w-4 h-4 text-emerald-500" />
                          Region
                        </label>
                        <select
                          value={costInputs.region}
                          onChange={(e) => setCostInputs(prev => ({ ...prev, region: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-semibold"
                        >
                          {REGION_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Sustainability Level */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <Award className="w-4 h-4 text-amber-500" />
                          Sustainability Level
                        </label>
                        <select
                          value={costInputs.sustainabilityLevel || 'moderate'}
                          onChange={(e) => setCostInputs(prev => ({ ...prev, sustainabilityLevel: e.target.value as any }))}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-semibold"
                        >
                          <option value="basic">🌱 Basic</option>
                          <option value="moderate">🌿 Moderate</option>
                          <option value="advanced">🌳 Advanced</option>
                          <option value="comprehensive">🏆 Comprehensive</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Savings Summary - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-5">
              {/* Total Economic Benefit Card - Hero */}
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 rounded-3xl shadow-2xl shadow-emerald-500/20 p-6 sm:p-8 text-white">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] opacity-30" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-amber-300" />
                    </div>
                    <h3 className="text-sm font-bold text-emerald-100 uppercase tracking-wider">
                      Total Economic Benefit
                    </h3>
                  </div>
                  <div className="text-4xl sm:text-5xl font-black mb-3 tracking-tight">
                    {maskValue(formatCurrency(Math.round(animatedTotalBenefit)))}
                  </div>
                  <div className="flex items-center gap-2 text-emerald-100 text-sm mb-4">
                    <TrendingUp className="w-4 h-4" />
                    <span>Direct savings + environmental value + brand impact</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/20">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                      <div className="text-xs text-emerald-200 mb-1">Direct Savings</div>
                      <div className="text-lg font-bold">{maskValue(formatCurrency(savingsResult.totalSavings))}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                      <div className="text-xs text-emerald-200 mb-1">Indirect Value</div>
                      <div className="text-lg font-bold">{maskValue(formatCurrency(savingsResult.totalEconomicBenefit - savingsResult.totalSavings))}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Metrics Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'ROI', value: `${maskValue(savingsResult.roiPercentage)}%`, icon: Percent, color: 'emerald', description: 'Return on Investment' },
                  { label: 'NPV', value: maskValue(formatCurrency(savingsResult.netPresentValue)), icon: Banknote, color: 'blue', description: '3-Year Net Present Value' },
                  { label: 'IRR', value: `${maskValue(savingsResult.internalRateOfReturn)}%`, icon: TrendingUp, color: 'purple', description: 'Internal Rate of Return' },
                  { label: 'Payback', value: `${maskValue(savingsResult.paybackMonths)} mo`, icon: Clock, color: 'amber', description: 'Payback Period' },
                ].map((metric, index) => (
                  <div
                    key={metric.label}
                    className="group bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 p-4 hover:shadow-lg hover:border-emerald-200 transition-all duration-300"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-lg bg-${metric.color}-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <metric.icon className={`w-4 h-4 text-${metric.color}-600`} />
                      </div>
                      <span className="text-xs font-semibold text-gray-500 uppercase">{metric.label}</span>
                    </div>
                    <div className={`text-2xl font-bold text-${metric.color}-600 mb-1`}>{metric.value}</div>
                    <div className="text-xs text-gray-400">{metric.description}</div>
                  </div>
                ))}
              </div>

              {/* Value Breakdown - Stacked Cards */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-500" />
                    Value Breakdown
                  </h3>
                </div>
                <div className="p-5 space-y-4">
                  {[
                    { label: 'Carbon Value', value: savingsResult.carbonValueSaved, icon: Leaf, color: 'green', percent: Math.round((savingsResult.carbonValueSaved / savingsResult.totalEconomicBenefit) * 100) },
                    { label: 'Water & Waste', value: savingsResult.waterValueSaved + savingsResult.wasteValueSaved, icon: Zap, color: 'blue', percent: Math.round(((savingsResult.waterValueSaved + savingsResult.wasteValueSaved) / savingsResult.totalEconomicBenefit) * 100) },
                    { label: 'Brand & Risk', value: savingsResult.brandValueImpact + savingsResult.riskMitigationValue, icon: Shield, color: 'purple', percent: Math.round(((savingsResult.brandValueImpact + savingsResult.riskMitigationValue) / savingsResult.totalEconomicBenefit) * 100) },
                  ].map((item, index) => (
                    <div key={item.label} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-${item.color}-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                            <item.icon className={`w-4 h-4 text-${item.color}-600`} />
                          </div>
                          <span className="font-semibold text-gray-700">{item.label}</span>
                        </div>
                        <span className="text-lg font-bold text-gray-900">{maskValue(formatCurrency(item.value))}</span>
                      </div>
                      <AnimatedProgressBar percentage={item.percent || 0} color={`bg-${item.color}-500`} delay={index * 100} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax Incentives Preview - CTA */}
              <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5 group hover:shadow-lg transition-all duration-300">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-200/30 rounded-full blur-2xl" />
                <div className="relative flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <BadgePercent className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-amber-900 mb-1">Tax Incentives Available</h3>
                    <div className="text-3xl font-black text-amber-700 mb-2">{maskValue(formatCurrency(Math.round(animatedIncentives)))}</div>
                    <button
                      onClick={() => setActiveTab('incentives')}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 group-hover:gap-3 transition-all duration-300"
                    >
                      View {taxIncentives.length} available incentives
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tax Incentives Tab - Redesigned */}
        {activeTab === 'incentives' && (
          <div className={`transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {/* Header Card */}
            <div className="bg-gradient-to-br from-amber-500 via-amber-400 to-orange-500 rounded-3xl shadow-2xl shadow-amber-500/20 p-6 sm:p-8 mb-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMikiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] opacity-30" />
              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <BadgePercent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Tax Incentives & Credits</h3>
                      <p className="text-amber-100 text-sm">Based on your sustainability initiatives</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 text-center">
                    <div className="text-4xl font-black text-white">{maskValue(formatCurrency(totalIncentives))}</div>
                    <div className="text-amber-100 text-sm mt-1">Total Estimated Credits</div>
                  </div>
                  <select
                    value={costInputs.region}
                    onChange={(e) => setCostInputs(prev => ({ ...prev, region: e.target.value }))}
                    className="px-4 py-3 rounded-xl border-2 border-white/30 bg-white/20 backdrop-blur-sm text-white font-semibold focus:ring-2 focus:ring-white/50 focus:border-white/50"
                  >
                    {REGION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="text-gray-900">{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Incentive Cards Grid */}
            {taxIncentives.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {taxIncentives.map((incentive, index) => {
                  const categoryConfig = {
                    energy: { bg: 'from-blue-500 to-cyan-500', light: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Zap },
                    carbon: { bg: 'from-emerald-500 to-green-500', light: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: Leaf },
                    waste: { bg: 'from-amber-500 to-orange-500', light: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Recycle },
                    water: { bg: 'from-purple-500 to-pink-500', light: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: Zap },
                  };
                  const config = categoryConfig[incentive.category as keyof typeof categoryConfig] || categoryConfig.carbon;
                  const Icon = config.icon;

                  return (
                    <div
                      key={incentive.id}
                      className={`group bg-white rounded-2xl border ${config.border} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Card Header */}
                      <div className={`bg-gradient-to-r ${config.bg} p-4 text-white`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="w-5 h-5" />
                            <span className="text-sm font-semibold uppercase tracking-wide opacity-90">
                              {incentive.category}
                            </span>
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                            <span className="text-lg font-bold">{maskValue(formatCurrency(incentive.estimatedValue))}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5">
                        <h4 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-emerald-600 transition-colors duration-300">
                          {incentive.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{incentive.description}</p>

                        {/* Eligibility Checklist */}
                        <div className={`${config.light} rounded-xl p-4`}>
                          <div className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            Eligibility Criteria
                          </div>
                          <ul className="space-y-2">
                            {incentive.eligibilityCriteria.map((criteria, idx) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                <CheckCircle2 className={`w-4 h-4 ${config.text} flex-shrink-0 mt-0.5`} />
                                {criteria}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <BadgePercent className="w-10 h-10 text-gray-300" />
                </div>
                <h4 className="text-lg font-semibold text-gray-700 mb-2">No Incentives Found</h4>
                <p className="text-gray-500 max-w-md mx-auto">
                  No tax incentives found for this region. Try selecting a different region or increase your sustainability measures.
                </p>
              </div>
            )}

            {/* Summary Card */}
            <div className="mt-8 bg-gradient-to-br from-emerald-500 via-emerald-400 to-teal-500 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -left-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-7 h-7 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-1">Total Potential Incentives</h4>
                    <p className="text-emerald-100 text-sm">
                      Based on your event's green score of <span className="font-bold text-white">{carbonResult.greenScore}/100</span>
                    </p>
                    <p className="text-emerald-200 text-xs mt-1">
                      💡 Higher sustainability measures = higher incentives!
                    </p>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-5 text-center">
                  <div className="text-4xl sm:text-5xl font-black">{maskValue(formatCurrency(totalIncentives))}</div>
                  <div className="text-emerald-100 text-sm mt-1">estimated annual value</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ROI Comparison Tab - Redesigned */}
        {activeTab === 'comparison' && (
          <div className={`transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {/* Header Section */}
            <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 mb-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-50" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <Scale className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Cost Comparison Analysis</h3>
                    <p className="text-slate-400 text-sm">Traditional vs Sustainable approach</p>
                  </div>
                </div>

                {/* Comparison Cards */}
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Traditional */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-500/20 flex items-center justify-center">
                        <Flame className="w-4 h-4 text-gray-400" />
                      </div>
                      <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Traditional</span>
                    </div>
                    <div className="text-3xl font-black text-white mb-1">
                      {maskValue(formatCurrency(savingsResult.traditionalTotal))}
                    </div>
                    <div className="text-sm text-gray-500">Base event costs</div>
                  </div>

                  {/* Sustainable */}
                  <div className="bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-5 hover:bg-emerald-500/20 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Leaf className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-sm font-semibold text-emerald-400 uppercase tracking-wide">Sustainable</span>
                    </div>
                    <div className="text-3xl font-black text-emerald-400 mb-1">
                      {maskValue(formatCurrency(savingsResult.sustainableTotal))}
                    </div>
                    <div className="text-sm text-emerald-500/70">With green initiatives</div>
                  </div>

                  {/* Savings */}
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-5 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                          <PiggyBank className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-emerald-100 uppercase tracking-wide">You Save</span>
                      </div>
                      <div className="text-3xl font-black text-white mb-1">
                        {maskValue(formatCurrency(savingsResult.totalSavings))}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-emerald-100">
                        <ArrowDown className="w-4 h-4" />
                        {maskValue(Math.round((savingsResult.totalSavings / savingsResult.traditionalTotal) * 100))}% reduction
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-500" />
                  Category Breakdown
                </h4>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-300" /> Traditional
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-emerald-500" /> Sustainable
                  </span>
                </div>
              </div>

              <div className="space-y-5">
                {Object.entries(savingsResult.breakdown).map(([category, values], index) => {
                  const categoryIcons: Record<string, any> = {
                    venue: Building2,
                    energy: Zap,
                    catering: Leaf,
                    transport: Globe,
                    materials: Receipt,
                    wasteDisposal: Recycle,
                  };
                  const Icon = categoryIcons[category] || Leaf;
                  const maxValue = savingsResult.traditionalTotal;

                  return (
                    <div
                      key={category}
                      className="group bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-emerald-200 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Icon className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <div className="text-xs text-gray-500">Cost reduction analysis</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1">
                            <TrendingDown className="w-4 h-4" />
                            {maskValue(values.savingsPercent)}%
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-emerald-600">{maskValue(formatCurrency(values.savings))}</div>
                            <div className="text-xs text-gray-500">saved</div>
                          </div>
                        </div>
                      </div>

                      {/* Animated comparison bars */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-20">Traditional</span>
                          <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-gray-400 to-gray-300 rounded-lg flex items-center justify-end px-3 transition-all duration-1000 ease-out"
                              style={{ width: `${Math.max((values.traditional / maxValue) * 100, 15)}%` }}
                            >
                              <span className="text-xs font-semibold text-white drop-shadow-sm">
                                {maskValue(formatCurrency(values.traditional))}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-20">Sustainable</span>
                          <div className="flex-1 h-8 bg-emerald-50 rounded-lg overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-lg flex items-center justify-end px-3 transition-all duration-1000 ease-out"
                              style={{ width: `${Math.max((values.sustainable / maxValue) * 100, 10)}%` }}
                            >
                              <span className="text-xs font-semibold text-white drop-shadow-sm">
                                {maskValue(formatCurrency(values.sustainable))}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Financial Summary */}
            <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 rounded-3xl shadow-2xl shadow-emerald-500/20 p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] opacity-30" />
              <div className="relative">
                <div className="text-center mb-6">
                  <h4 className="text-xl font-bold text-white mb-1">Financial Impact Summary</h4>
                  <p className="text-emerald-100 text-sm">Your complete sustainability ROI breakdown</p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total ROI', value: `${maskValue(savingsResult.roiPercentage)}%`, icon: Percent, color: 'bg-white/20' },
                    { label: 'NPV (3-Year)', value: maskValue(formatCurrency(savingsResult.netPresentValue)), icon: TrendingUp, color: 'bg-white/20' },
                    { label: 'Economic Benefit', value: maskValue(formatCurrency(savingsResult.totalEconomicBenefit)), icon: DollarSign, color: 'bg-white/20' },
                    { label: 'With Incentives', value: maskValue(formatCurrency(savingsResult.totalEconomicBenefit + totalIncentives)), icon: Sparkles, color: 'bg-amber-400/30' },
                  ].map((metric, index) => (
                    <div
                      key={metric.label}
                      className={`${metric.color} backdrop-blur-sm rounded-2xl p-5 text-center hover:bg-white/30 transition-all duration-300 group`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                        <metric.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-white mb-1">{metric.value}</div>
                      <div className="text-sm text-emerald-100">{metric.label}</div>
                    </div>
                  ))}
                </div>

                {/* Call to Action */}
                <div className="mt-6 pt-6 border-t border-white/20 text-center">
                  <p className="text-emerald-100 mb-3">
                    🌱 Going sustainable saves you <span className="font-bold text-white">{maskValue(formatCurrency(savingsResult.totalSavings))}</span> per event
                  </p>
                  <button
                    onClick={() => setActiveTab('calculator')}
                    className="inline-flex items-center gap-2 bg-white text-emerald-600 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    <Calculator className="w-5 h-5" />
                    Adjust Your Calculations
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CostSavingsCalculator;
