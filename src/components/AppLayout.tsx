import React, { useState, useRef, useMemo, useEffect } from 'react';
import Navbar from './ecobserve/Navbar';
import HeroSection from './ecobserve/HeroSection';
import FeaturesSection from './ecobserve/FeaturesSection';
import TestimonialsSection from './ecobserve/TestimonialsSection';
import EventProfileAssessment from './ecobserve/EventProfileAssessment';
import AttendeeTravel from './ecobserve/AttendeeTravel';
import VenueSustainability from './ecobserve/VenueSustainability';
import CateringMaterials from './ecobserve/CateringMaterials';
import FormatOptimizer from './ecobserve/FormatOptimizer';
import CarbonCalculator from './ecobserve/CarbonCalculator';
import CostSavingsCalculator from './ecobserve/CostSavingsCalculator';
import DashboardMetrics from './ecobserve/DashboardMetrics';
import AlternativesSection from './ecobserve/AlternativesSection';
import BasicRecommendations from './ecobserve/BasicRecommendations';
import GreenScoreCard from './ecobserve/GreenScoreCard';
import EventPortfolio from './ecobserve/EventPortfolio';
import ResourceLibrary from './ecobserve/ResourceLibrary';
import MyEvents from './ecobserve/MyEvents';
import Footer from './ecobserve/Footer';
import AIAssistant from './ecobserve/AIAssistant';
import AuthGate from './ecobserve/AuthGate';
import { SubscriptionUsageBadge } from './subscription/SubscriptionUsageBadge';
import { ExplorerOnboarding } from './onboarding/ExplorerOnboarding';
import { EventInputs, defaultInputs, calculateFootprint, getAlternatives } from '@/lib/carbonData';
import { EventProfileData, AttendeeData, VenueData, CateringData, MaterialLevel, EventFormat } from '@/lib/preAssessmentData';

const AppLayout: React.FC = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [inputs, setInputs] = useState<EventInputs>(defaultInputs);
  const [myEventsKey, setMyEventsKey] = useState(0);

  // Pre-assessment state
  const [eventProfile, setEventProfile] = useState<EventProfileData | null>(null);
  const [attendeeData, setAttendeeData] = useState<AttendeeData | null>(null);
  const [venueData, setVenueData] = useState<VenueData | null>(null);
  const [cateringData, setCateringData] = useState<{ catering: CateringData; materialsLevel: MaterialLevel; hasSwagBags: boolean } | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<EventFormat>('hybrid');
  const [preAssessmentStep, setPreAssessmentStep] = useState(0);

  // Section refs
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const preAssessmentRef = useRef<HTMLDivElement>(null);
  const calculatorRef = useRef<HTMLDivElement>(null);
  const costsavingsRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const myeventsRef = useRef<HTMLDivElement>(null);
  const alternativesRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLDivElement>(null);
  const portfolioRef = useRef<HTMLDivElement>(null);
  const resourcesRef = useRef<HTMLDivElement>(null);

  const refsMap = useRef<Record<string, React.RefObject<HTMLDivElement>>>({
    hero: heroRef,
    features: featuresRef,
    preassessment: preAssessmentRef,
    calculator: calculatorRef,
    costsavings: costsavingsRef,
    dashboard: dashboardRef,
    myevents: myeventsRef,
    alternatives: alternativesRef,
    score: scoreRef,
    portfolio: portfolioRef,
    resources: resourcesRef,
  });

  const handleNavigate = (section: string) => {
    setActiveSection(section);

    // Clear hash from URL if navigating to hero (home)
    if (section === 'hero' && window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }

    const ref = refsMap.current[section];
    if (ref?.current) {
      const offset = 80;
      const top = ref.current.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const result = useMemo(() => calculateFootprint(inputs), [inputs]);
  const alternatives = useMemo(() => getAlternatives(inputs), [inputs]);

  const handleCalculatorComplete = () => {
    setTimeout(() => handleNavigate('dashboard'), 100);
  };

  const handleShareResults = () => {
    handleNavigate('score');
  };

  const handleLoadEvent = (loadedInputs: EventInputs) => {
    setInputs(loadedInputs);
  };

  const handleSaveSuccess = () => {
    // Force MyEvents to re-fetch by changing key
    setMyEventsKey(prev => prev + 1);
  };

  // Clear hash from URL on initial load
  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Explorer Onboarding Tour */}
      <ExplorerOnboarding />

      <Navbar onNavigate={handleNavigate} activeSection={activeSection} />

      <div ref={heroRef}>
        <HeroSection onNavigate={handleNavigate} />
      </div>

      <div ref={featuresRef}>
        <FeaturesSection onNavigate={handleNavigate} />
      </div>

      <TestimonialsSection />

      {/* Subscription Usage Badge - Shows event limits */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SubscriptionUsageBadge />
      </div>

      {/* Premium Feature: Pre-Assessment Suite */}
      <div ref={preAssessmentRef}>
        <AuthGate
          feature="Smart Event Assessment"
          description="Our intelligent pre-assessment suite analyzes your event profile, attendee travel, venue sustainability, catering impact, and format options to predict your carbon footprint before detailed calculations."
        >
          {/* Step 1: Event Profile Assessment */}
          {preAssessmentStep >= 0 && (
            <EventProfileAssessment
              onComplete={(data) => {
                setEventProfile(data);
                setPreAssessmentStep(1);
              }}
              onDataChange={setEventProfile}
            />
          )}

          {/* Step 2: Attendee & Travel Intelligence */}
          {preAssessmentStep >= 1 && eventProfile && (
            <AttendeeTravel
              totalAttendees={eventProfile.expectedAttendees}
              durationDays={eventProfile.durationDays}
              onComplete={(data) => {
                setAttendeeData(data);
                setPreAssessmentStep(2);
              }}
              onDataChange={setAttendeeData}
            />
          )}

          {/* Step 3: Venue Sustainability Scorecard */}
          {preAssessmentStep >= 2 && eventProfile && (
            <VenueSustainability
              durationHours={eventProfile.durationDays * eventProfile.durationHoursPerDay}
              onComplete={(data) => {
                setVenueData(data);
                setPreAssessmentStep(3);
              }}
              onDataChange={setVenueData}
            />
          )}

          {/* Step 4: Catering & Materials Impact */}
          {preAssessmentStep >= 3 && eventProfile && (
            <CateringMaterials
              attendees={eventProfile.expectedAttendees}
              durationDays={eventProfile.durationDays}
              onComplete={(data) => {
                setCateringData(data);
                setPreAssessmentStep(4);
              }}
              onDataChange={setCateringData}
            />
          )}

          {/* Step 5: Format Optimizer */}
          {preAssessmentStep >= 4 && eventProfile && attendeeData && (
            <FormatOptimizer
              attendees={eventProfile.expectedAttendees}
              avgTravelDistance={
                attendeeData.profiles.reduce((sum, p) => sum + p.avgDistanceKm * (p.percentage / 100), 0)
              }
              durationDays={eventProfile.durationDays}
              onComplete={(format) => {
                setSelectedFormat(format);
                setPreAssessmentStep(5);
                handleNavigate('calculator');
              }}
            />
          )}
        </AuthGate>
      </div>

      {/* Premium Feature: Event Footprint Calculator */}
      <div ref={calculatorRef} data-tour="calculator">
        <AuthGate
          feature="Event Footprint Calculator"
          description="Calculate your event's complete environmental footprint including carbon emissions, water usage, and waste generation."
        >
          <CarbonCalculator
            onComplete={handleCalculatorComplete}
            inputs={inputs}
            setInputs={setInputs}
          />
        </AuthGate>
      </div>

      {/* Free Feature: Basic Recommendations - Available to Explorer */}
      <BasicRecommendations inputs={inputs} />

      {/* Premium Feature: Cost & Savings Calculator - Requires Planner */}
      <div ref={costsavingsRef}>
        <AuthGate
          feature="Cost & Savings Calculator"
          description="Discover the financial value of reducing carbon emissions, including cost savings, ROI comparisons, and potential tax incentives."
          requiredTier="planner"
        >
          <CostSavingsCalculator
            carbonInputs={inputs}
            carbonResult={result}
          />
        </AuthGate>
      </div>

      {/* Premium Feature: Dashboard Metrics - Requires Impact Leader */}
      <div ref={dashboardRef}>
        <AuthGate
          feature="Impact Dashboard"
          description="Track your event's environmental impact with detailed metrics, visualizations, and progress tracking."
          requiredTier="impact"
        >
          <DashboardMetrics
            result={result}
            inputs={inputs}
            onShare={handleShareResults}
            onSaveSuccess={handleSaveSuccess}
          />
        </AuthGate>
      </div>

      {/* Premium Feature: My Events - Requires Planner */}
      <div ref={myeventsRef}>
        <AuthGate
          feature="My Events"
          description="Save, manage, and track all your events in one place. Compare performance over time."
          requiredTier="planner"
        >
          <MyEvents
            key={myEventsKey}
            onLoadEvent={handleLoadEvent}
            onNavigate={handleNavigate}
          />
        </AuthGate>
      </div>

      {/* Premium Feature: Smart Recommendations - Requires Planner */}
      <div ref={alternativesRef}>
        <AuthGate
          feature="Smart Recommendations"
          description="Get AI-powered recommendations for sustainable alternatives to reduce your event's carbon footprint."
          requiredTier="planner"
        >
          <AlternativesSection alternatives={alternatives} />
        </AuthGate>
      </div>

      {/* Premium Feature: Green Score Card - Requires Planner */}
      <div ref={scoreRef}>
        <AuthGate
          feature="Green Score Card"
          description="Generate shareable sustainability certificates to showcase your commitment to the environment."
          requiredTier="planner"
        >
          <GreenScoreCard result={result} />
        </AuthGate>
      </div>

      {/* Free Feature: Event Portfolio (showcases success stories) */}
      <div ref={portfolioRef}>
        <EventPortfolio />
      </div>

      {/* Free Feature: Resource Library (educational content) */}
      <div ref={resourcesRef} data-tour="resources">
        <ResourceLibrary />
      </div>

      <Footer onNavigate={handleNavigate} />

      <AIAssistant />
    </div>
  );
};

export default AppLayout;
