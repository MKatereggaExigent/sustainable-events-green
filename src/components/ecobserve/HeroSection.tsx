import React, { useState, useEffect } from 'react';
import { ArrowRight, TreePine, Droplets, Recycle, Compass, Leaf, Eye, Users } from 'lucide-react';
import { useTour } from '@/contexts/TourContext';
import BrandLogo from './BrandLogo';

interface HeroSectionProps {
  onNavigate: (section: string) => void;
}

const AnimatedCounter: React.FC<{ target: number; suffix: string; label: string }> = ({ target, suffix, label }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <div className="text-center">
      <div className="text-3xl sm:text-4xl font-bold text-white">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-emerald-200 text-sm mt-1">{label}</div>
    </div>
  );
};

const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const { startTour } = useTour();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://d64gsuwffb70l.cloudfront.net/698e531497195c23a2bf3a5d_1770935156344_b28d905b.jpg"
          alt="Sustainable event"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-emerald-900/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 via-transparent to-transparent" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-emerald-400/30 rounded-full animate-pulse"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-300 text-sm font-medium">
                2,847 events made sustainable this month
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Plan Events That{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Leave No Trace
              </span>
            </h1>

            <p className="text-lg text-gray-300 max-w-xl leading-relaxed">
              Measure, reduce, and showcase your event's environmental impact. 
              Calculate carbon, water, and waste footprints in real-time — then share 
              your green score with the world.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => onNavigate('calculator')}
                data-tour="hero-cta"
                className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-semibold text-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
              >
                Start Calculating
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={startTour}
                className="flex items-center gap-3 px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-2xl font-medium hover:bg-white/20 transition-all"
              >
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Compass className="w-4 h-4 text-white" />
                </div>
                Take a Tour
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <TreePine className="w-4 h-4 text-emerald-400" />
                <span>12,000+ trees planted</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span>5M liters water saved</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Recycle className="w-4 h-4 text-amber-400" />
                <span>Zero waste certified</span>
              </div>
            </div>
          </div>

          {/* Right - Globe */}
          <div className="hidden lg:flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl scale-110" />
              <img
                src="https://d64gsuwffb70l.cloudfront.net/698e531497195c23a2bf3a5d_1770935260319_eefe6a9f.png"
                alt="Earth sustainability visualization"
                className="relative w-96 h-96 object-contain drop-shadow-2xl animate-[spin_60s_linear_infinite]"
              />
              {/* Floating stat cards */}
              <div className="absolute -top-4 -right-4 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="text-2xl font-bold text-emerald-600">-47%</div>
                <div className="text-xs text-gray-500">Avg carbon reduction</div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                <div className="text-2xl font-bold text-blue-600">8.2M</div>
                <div className="text-xs text-gray-500">kg CO₂ offset</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-16 bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <AnimatedCounter target={15420} suffix="+" label="Events Tracked" />
            <AnimatedCounter target={8200} suffix="t" label="CO₂ Offset" />
            <AnimatedCounter target={4800} suffix="+" label="Planners Active" />
            <AnimatedCounter target={92} suffix="%" label="Avg Satisfaction" />
          </div>
        </div>

        {/* About / Brand Story Section */}
        <div className="mt-20 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Why <BrandLogo size="lg" variant="white" />?
            </h2>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Our name embodies our mission — three powerful concepts united to deliver authentic care and personalized value for sustainable event planning.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Eco */}
            <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-6 text-center hover:bg-white/10 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                <Leaf className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                <span className="text-emerald-400">Eco</span>
              </h3>
              <p className="text-emerald-300 text-sm font-medium mb-3">Eco-Friendly</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Authentic environmental care at the heart of every event. We help you minimize your carbon, water, and waste footprint with genuine commitment to our planet.
              </p>
            </div>

            {/* b (Observe) */}
            <div className="bg-white/5 border border-blue-500/20 rounded-2xl p-6 text-center hover:bg-white/10 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
                <Eye className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                <span className="italic font-light text-blue-300">b</span>
              </h3>
              <p className="text-blue-300 text-sm font-medium mb-3">Observability</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Complete visibility into your environmental impact. Track, measure, and analyze sustainability metrics with precision — because what gets measured gets improved.
              </p>
            </div>

            {/* Serve */}
            <div className="bg-white/5 border border-teal-500/20 rounded-2xl p-6 text-center hover:bg-white/10 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/20">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                <span className="text-teal-400">Serve</span>
              </h3>
              <p className="text-teal-300 text-sm font-medium mb-3">Service</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Personalized service tailored to your unique needs. We empower event planners with smart tools and actionable insights for sustainable success.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-gray-300 text-sm">
              Built with <span className="text-red-400">♥</span> to provide <span className="text-emerald-400 font-medium">authentic care</span> and <span className="text-teal-400 font-medium">personalized value</span> for every event.
            </p>
          </div>
        </div>
      </div>

    </section>
  );
};

export default HeroSection;
