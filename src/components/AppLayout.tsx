import React, { useState, useRef, useMemo } from 'react';
import Navbar from './eventcarbon/Navbar';
import HeroSection from './eventcarbon/HeroSection';
import FeaturesSection from './eventcarbon/FeaturesSection';
import TestimonialsSection from './eventcarbon/TestimonialsSection';
import EventProfileAssessment from './eventcarbon/EventProfileAssessment';
import AttendeeTravel from './eventcarbon/AttendeeTravel';
import VenueSustainability from './eventcarbon/VenueSustainability';
import CateringMaterials from './eventcarbon/CateringMaterials';
import FormatOptimizer from './eventcarbon/FormatOptimizer';
import CarbonCalculator from './eventcarbon/CarbonCalculator';
import CostSavingsCalculator from './eventcarbon/CostSavingsCalculator';
import DashboardMetrics from './eventcarbon/DashboardMetrics';
import AlternativesSection from './eventcarbon/AlternativesSection';
import GreenScoreCard from './eventcarbon/GreenScoreCard';
import EventPortfolio from './eventcarbon/EventPortfolio';
import ResourceLibrary from './eventcarbon/ResourceLibrary';
import MyEvents from './eventcarbon/MyEvents';
import Footer from './eventcarbon/Footer';
import AIAssistant from './eventcarbon/AIAssistant';
import AuthGate from './eventcarbon/AuthGate';
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

  return (
    <div className="min-h-screen bg-white">
      <Navbar onNavigate={handleNavigate} activeSection={activeSection} />

      <div ref={heroRef}>
        <HeroSection onNavigate={handleNavigate} />
      </div>

      <div ref={featuresRef}>
        <FeaturesSection onNavigate={handleNavigate} />
      </div>

      <TestimonialsSection />

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
      <div ref={calculatorRef}>
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

      {/* Premium Feature: Cost & Savings Calculator */}
      <div ref={costsavingsRef}>
        <AuthGate
          feature="Cost & Savings Calculator"
          description="Discover the financial value of reducing carbon emissions, including cost savings, ROI comparisons, and potential tax incentives."
        >
          <CostSavingsCalculator
            carbonInputs={inputs}
            carbonResult={result}
          />
        </AuthGate>
      </div>

      {/* Premium Feature: Dashboard Metrics */}
      <div ref={dashboardRef}>
        <AuthGate
          feature="Impact Dashboard"
          description="Track your event's environmental impact with detailed metrics, visualizations, and progress tracking."
        >
          <DashboardMetrics
            result={result}
            inputs={inputs}
            onShare={handleShareResults}
            onSaveSuccess={handleSaveSuccess}
          />
        </AuthGate>
      </div>

      {/* Premium Feature: My Events */}
      <div ref={myeventsRef}>
        <AuthGate
          feature="My Events"
          description="Save, manage, and track all your events in one place. Compare performance over time."
        >
          <MyEvents
            key={myEventsKey}
            onLoadEvent={handleLoadEvent}
            onNavigate={handleNavigate}
          />
        </AuthGate>
      </div>

      {/* Premium Feature: Smart Recommendations */}
      <div ref={alternativesRef}>
        <AuthGate
          feature="Smart Recommendations"
          description="Get AI-powered recommendations for sustainable alternatives to reduce your event's carbon footprint."
        >
          <AlternativesSection alternatives={alternatives} />
        </AuthGate>
      </div>

      {/* Premium Feature: Green Score Card */}
      <div ref={scoreRef}>
        <AuthGate
          feature="Green Score Card"
          description="Generate shareable sustainability certificates to showcase your commitment to the environment."
        >
          <GreenScoreCard result={result} />
        </AuthGate>
      </div>

      {/* Free Feature: Event Portfolio (showcases success stories) */}
      <div ref={portfolioRef}>
        <EventPortfolio />
      </div>

      {/* Free Feature: Resource Library (educational content) */}
      <div ref={resourcesRef}>
        <ResourceLibrary />
      </div>

      <Footer onNavigate={handleNavigate} />

      <AIAssistant />
    </div>
  );
};

export default AppLayout;
