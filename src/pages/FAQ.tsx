import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, HelpCircle, Calculator, DollarSign, BarChart3, Calendar, Lightbulb, Award, Shield, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/ecobserve/Navbar';
import Footer from '@/components/ecobserve/Footer';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  // Getting Started
  {
    category: 'Getting Started',
    question: 'What is EcobServe and how does it work?',
    answer: 'EcobServe is a comprehensive sustainability platform for event planners. It helps you measure, reduce, and offset the environmental impact of your events. The platform provides carbon footprint calculations, cost-benefit analysis, sustainable recommendations, impact tracking, and certification support. Simply input your event details, and we\'ll provide actionable insights to make your event more sustainable while potentially saving costs.'
  },
  {
    category: 'Getting Started',
    question: 'Do I need to create an account to use EcobServe?',
    answer: 'No! You can explore our Carbon Calculator, view Success Stories, and access Resources without an account. However, creating a free account unlocks premium features like saving multiple events, tracking progress over time, accessing the full Impact Dashboard, receiving personalized recommendations, and exporting detailed reports.'
  },
  {
    category: 'Getting Started',
    question: 'What types of events can I calculate?',
    answer: 'EcobServe supports all event types including conferences, corporate meetings, trade shows, workshops, galas, product launches, training sessions, networking events, and more. Events can be in-person, virtual, or hybrid. Our calculator adapts to events of any size, from small 10-person meetings to mega events with thousands of attendees.'
  },
  {
    category: 'Getting Started',
    question: 'How long does it take to calculate my event\'s footprint?',
    answer: 'The basic carbon footprint calculation takes just 3-5 minutes. You\'ll go through 4 simple steps: Venue details, Food & Beverage choices, Transportation patterns, and Materials usage. Results are displayed in real-time as you input data, and you can save your progress at any time.'
  },

  // Carbon Calculator
  {
    category: 'Carbon Calculator',
    question: 'How accurate are the carbon footprint calculations?',
    answer: 'Our calculations are based on industry-leading emission factors from the GHG Protocol, ISO 14064 standards, EPA data, and peer-reviewed research. We use location-specific factors where available and regularly update our database. For most events, accuracy is within ±15% of professional carbon audits. For higher precision, we recommend our Premium tier which includes custom emission factors and third-party verification.'
  },
  {
    category: 'Carbon Calculator',
    question: 'What is included in the carbon footprint calculation?',
    answer: 'We calculate emissions across four main categories: 1) Venue (energy for heating, cooling, lighting based on venue type, size, and energy source), 2) Food & Beverage (production, processing, and transport of meals and drinks), 3) Transportation (attendee travel to/from the event including flights, cars, and public transit), and 4) Materials (printed materials, decorations, swag bags, and waste). This covers Scope 1, 2, and 3 emissions.'
  },
  {
    category: 'Carbon Calculator',
    question: 'What is a "good" carbon footprint for my event?',
    answer: 'It depends on your event type and size. Industry benchmarks: Small workshops (0.1-0.5 tonnes CO2e per attendee), Corporate meetings (0.2-0.8 tonnes), Conferences (0.4-1.8 tonnes), Trade shows (0.8-2.5 tonnes). Our Green Score rates your event from 0-100: Bronze (0-49), Silver (50-69), Gold (70-84), Platinum (85-100). We compare your event against similar events in your industry to show where you stand.'
  },
  {
    category: 'Carbon Calculator',
    question: 'Can I calculate virtual or hybrid events?',
    answer: 'Yes! Virtual events have significantly lower emissions (typically 94% less than in-person), primarily from streaming data and device energy use. Hybrid events combine both in-person and virtual components. Our calculator accounts for streaming hours, platform type, number of virtual vs. in-person attendees, and recording storage to provide accurate hybrid event calculations.'
  },
  {
    category: 'Carbon Calculator',
    question: 'What is CO2 equivalent (CO2e)?',
    answer: 'CO2e is a standardized unit that expresses the impact of all greenhouse gases in terms of the amount of CO2 that would have the same global warming potential. For example, methane has 25 times the warming potential of CO2, so 1 kg of methane = 25 kg CO2e. This allows us to combine different gases (CO2, methane, nitrous oxide) into a single, comparable metric.'
  },

  // Cost & Savings
  {
    category: 'Cost & Savings',
    question: 'How can sustainable events save money?',
    answer: 'Sustainable practices often reduce costs through: 1) Energy efficiency (LED lighting, smart HVAC saves 20-40% on energy), 2) Waste reduction (digital materials instead of printing saves 60-80%), 3) Local sourcing (reduces transport costs by 20-40%), 4) Tax incentives and rebates (varies by region, typically 10-30% of green investments), 5) Reduced waste disposal fees (composting and recycling saves 30-50%), and 6) Long-term brand value and customer loyalty.'
  },
  {
    category: 'Cost & Savings',
    question: 'What are the typical cost savings percentages?',
    answer: 'Based on industry data: Venue costs can be reduced by 15-40% through energy efficiency and renewable energy. Catering costs can decrease by 20-35% with plant-based menus and local sourcing. Transportation costs can drop by 25-55% with shuttle services and virtual options. Materials costs can be cut by 60-80% by going digital. Overall, events implementing comprehensive sustainability measures see 20-45% total cost reduction while improving their environmental impact.'
  },
  {
    category: 'Cost & Savings',
    question: 'What tax incentives are available for sustainable events?',
    answer: 'Tax incentives vary by region but commonly include: Federal tax credits for renewable energy use (26-30% in the US), State and local rebates for energy-efficient equipment (10-25%), Green building certifications (LEED venues may qualify for property tax reductions), Carbon offset tax deductions (varies by jurisdiction), and Sustainable business incentives (grants and low-interest loans). Our platform identifies applicable incentives based on your event location.'
  },
  {
    category: 'Cost & Savings',
    question: 'How do I calculate ROI for sustainability investments?',
    answer: 'Our Cost & Savings Calculator provides detailed ROI analysis including: 1) Direct cost savings (energy, materials, waste), 2) Tax incentives and rebates, 3) Carbon credit value, 4) Brand value impact (estimated at 2-5% of event budget for green events), 5) Risk mitigation value (avoiding future carbon taxes and regulations), and 6) Payback period. Most sustainability investments have payback periods of 1-3 years with ongoing savings thereafter.'
  },

  // Impact Dashboard & Metrics
  {
    category: 'Impact Dashboard',
    question: 'What metrics does the Impact Dashboard track?',
    answer: 'The dashboard tracks: Carbon emissions (total kg CO2e and per-attendee), Water footprint (liters used), Waste generation (kg produced and % diverted from landfill), Energy consumption (kWh), Green Score (0-100 rating), Industry benchmarking (percentile ranking), UN SDG alignment (which Sustainable Development Goals your event supports), Trend analysis (improvement over time), and Cost savings achieved. All metrics are visualized with interactive charts.'
  },
  {
    category: 'Impact Dashboard',
    question: 'How do I compare my event to industry benchmarks?',
    answer: 'Our platform automatically compares your event against thousands of similar events in our database. We match by event type, size, format, and industry. You\'ll see your percentile ranking (e.g., "Your event is in the top 25% for sustainability"), specific category comparisons (venue, food, transport, materials), and best-in-class examples. This helps identify where you\'re excelling and where there\'s room for improvement.'
  },
  {
    category: 'Impact Dashboard',
    question: 'What are the UN Sustainable Development Goals (SDGs)?',
    answer: 'The UN SDGs are 17 global goals adopted by all United Nations members to achieve a better future by 2030. Sustainable events typically align with: SDG 7 (Affordable and Clean Energy), SDG 11 (Sustainable Cities), SDG 12 (Responsible Consumption), SDG 13 (Climate Action), and SDG 15 (Life on Land). Our dashboard shows which SDGs your event supports and how strongly, helping you communicate your impact to stakeholders.'
  },
  {
    category: 'Impact Dashboard',
    question: 'Can I export reports from the dashboard?',
    answer: 'Yes! Authenticated users can export comprehensive reports in PDF, Excel, or CSV formats. Reports include: Executive summary with key metrics, Detailed emission breakdown by category, Benchmark comparisons, Cost savings analysis, Recommendations implemented, UN SDG alignment, and Certification-ready documentation. Reports are customizable with your branding and can be shared with stakeholders, sponsors, or used for sustainability reporting.'
  },

  // My Events & Event Management
  {
    category: 'My Events',
    question: 'How many events can I save?',
    answer: 'Free accounts can save up to 5 events. Premium accounts have unlimited event storage. Saved events include all input data, calculations, recommendations, and historical snapshots. You can organize events by date, type, or custom tags, and compare multiple events side-by-side to track improvement over time.'
  },
  {
    category: 'My Events',
    question: 'Can I duplicate or template events?',
    answer: 'Yes! You can save any event as a template and use it as a starting point for future events. This is perfect for recurring events (annual conferences, monthly meetings) or similar event types. Simply duplicate an existing event, update the specific details, and recalculate. This saves time and ensures consistency in your sustainability approach.'
  },
  {
    category: 'My Events',
    question: 'How do I track progress across multiple events?',
    answer: 'The My Events section provides trend analysis showing: Carbon emissions over time (total and per-attendee), Cost savings accumulated, Green Score progression, Category-specific improvements (venue, food, transport, materials), and Year-over-year comparisons. Visual charts make it easy to demonstrate continuous improvement to stakeholders and identify successful strategies to replicate.'
  },

  // Recommendations & Alternatives
  {
    category: 'Recommendations',
    question: 'How are sustainable recommendations generated?',
    answer: 'Our AI-powered recommendation engine analyzes your event inputs and identifies opportunities for improvement. Recommendations are prioritized by: 1) Carbon reduction potential (kg CO2e saved), 2) Cost impact (savings or additional cost), 3) Implementation difficulty (easy, medium, hard), and 4) Relevance to your event type. Each recommendation includes specific actions, expected savings, and implementation steps.'
  },
  {
    category: 'Recommendations',
    question: 'What types of recommendations will I receive?',
    answer: 'Recommendations span all categories: Venue (switch to renewable energy, use natural ventilation, choose LEED-certified venues), Food & Beverage (plant-based menus, local sourcing, eliminate single-use plastics), Transportation (shuttle services, virtual attendance options, carbon offsets for flights), Materials (digital alternatives, recycled materials, reusable decorations), and Waste (composting programs, donation partnerships, zero-waste goals).'
  },
  {
    category: 'Recommendations',
    question: 'Can I apply recommendations with one click?',
    answer: 'Yes! For many recommendations, you can click "Apply" to automatically update your event configuration and see the new impact calculations. This lets you experiment with different scenarios and see real-time results. Some recommendations require manual implementation (like contacting vendors), and we provide detailed guidance and resources for those.'
  },
  {
    category: 'Recommendations',
    question: 'How do I know which recommendations to prioritize?',
    answer: 'We provide a priority score based on: Impact (high-impact changes that significantly reduce emissions), Cost (recommendations that save money are prioritized), Ease (quick wins that are easy to implement), and Relevance (specific to your event type and current configuration). Start with "Quick Wins" - high-impact, low-cost, easy-to-implement changes - then move to more comprehensive strategies.'
  },

  // Carbon Offsetting & Certification
  {
    category: 'Carbon Offsetting',
    question: 'What is carbon offsetting and should I do it?',
    answer: 'Carbon offsetting means compensating for unavoidable emissions by funding projects that reduce or remove CO2 from the atmosphere (reforestation, renewable energy, methane capture). Best practice: First reduce emissions as much as possible through sustainable practices, then offset remaining emissions. We recommend offsetting only after achieving at least 50% reduction from baseline. Quality offsets are verified by Gold Standard or Verified Carbon Standard (VCS).'
  },
  {
    category: 'Carbon Offsetting',
    question: 'How much do carbon offsets cost?',
    answer: 'Carbon offset prices vary by project type and quality: Basic offsets: $10-20 per tonne CO2e, Standard verified offsets: $25-40 per tonne, Premium Gold Standard offsets: $40-60 per tonne, High-impact projects (direct air capture): $100-300 per tonne. For a typical 100-person conference with 5 tonnes CO2e, offsetting costs $125-300. Our platform calculates exact offset costs based on your event footprint and preferred offset type.'
  },
  {
    category: 'Carbon Offsetting',
    question: 'What certifications can I earn for sustainable events?',
    answer: 'EcobServe helps you achieve: ISO 20121 (Event Sustainability Management), LEED certification (for venues), Carbon Neutral certification (PAS 2060 standard), Green Seal certification, and industry-specific certifications (MPI Sustainable Event Standards, APEX/ASTM standards). Our reports provide the documentation needed for certification applications, and we guide you through the requirements.'
  },

  // Technical & Data
  {
    category: 'Technical',
    question: 'How is my data stored and protected?',
    answer: 'All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We use secure cloud infrastructure with regular backups, multi-factor authentication, and role-based access control. We never sell your data to third parties. Event data is private by default - you control what you share. We comply with GDPR, CCPA, and other data protection regulations. See our Privacy Policy for full details.'
  },
  {
    category: 'Technical',
    question: 'Can I integrate EcobServe with other tools?',
    answer: 'Yes! We offer API access for Premium and Enterprise accounts. Integrate with: Event management platforms (Cvent, Eventbrite), Project management tools (Asana, Monday.com), Sustainability reporting platforms (Watershed, Persefoni), and Accounting software (QuickBooks, Xero). Our API provides programmatic access to calculations, recommendations, and reporting. Contact us for API documentation.'
  },
  {
    category: 'Technical',
    question: 'What currencies and units does EcobServe support?',
    answer: 'We support 100+ currencies with real-time exchange rates and both metric and imperial units. You can set your preferences in Settings: Distance (km/miles), Weight (kg/lbs), Volume (liters/gallons), Temperature (°C/°F), and Currency (USD, EUR, GBP, CAD, AUD, and 95+ others). All calculations and reports automatically use your preferred units.'
  },

  // Pricing & Plans
  {
    category: 'Pricing',
    question: 'Is EcobServe free to use?',
    answer: 'Yes! Our Free tier includes: Carbon Calculator access, Basic Impact Dashboard, Up to 5 saved events, Success Stories and Resources, and Community support. Premium features ($29/month or $290/year) include: Unlimited events, Advanced analytics and trends, Custom branding on reports, Priority support, API access, and Team collaboration. Enterprise plans offer custom pricing for organizations with advanced needs.'
  },
  {
    category: 'Pricing',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, and bank transfers for Enterprise accounts. All payments are processed securely through Stripe. You can upgrade, downgrade, or cancel anytime - no long-term contracts required. Annual plans receive a 17% discount compared to monthly billing.'
  },

  // Support & Resources
  {
    category: 'Support',
    question: 'What support options are available?',
    answer: 'Free users: Email support (48-hour response), Knowledge base, Video tutorials, and Community forum. Premium users: Priority email support (24-hour response), Live chat during business hours, and Monthly webinars. Enterprise users: Dedicated account manager, Phone support, Custom training sessions, and On-site consultation. All users can access our comprehensive Resource Library with guides, templates, and best practices.'
  },
  {
    category: 'Support',
    question: 'Do you offer training or consulting services?',
    answer: 'Yes! We offer: 1) Free webinars (monthly, covering platform features and sustainability best practices), 2) Custom training sessions for teams (Premium/Enterprise), 3) Sustainability consulting (event audits, strategy development, certification support), and 4) On-site support for large events. Contact our team to discuss your specific needs and pricing.'
  },
  {
    category: 'Support',
    question: 'Where can I learn more about event sustainability?',
    answer: 'Our Resource Library includes: Comprehensive guides (carbon calculation methodology, sustainable catering, green venues), Templates (sustainability policies, vendor questionnaires, attendee communications), Case studies (real-world success stories), Industry reports (latest research and trends), Checklists (pre-event, during-event, post-event sustainability actions), and Video tutorials. All resources are free and regularly updated.'
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Questions', icon: HelpCircle },
  { id: 'Getting Started', label: 'Getting Started', icon: Globe },
  { id: 'Carbon Calculator', label: 'Carbon Calculator', icon: Calculator },
  { id: 'Cost & Savings', label: 'Cost & Savings', icon: DollarSign },
  { id: 'Impact Dashboard', label: 'Impact Dashboard', icon: BarChart3 },
  { id: 'My Events', label: 'My Events', icon: Calendar },
  { id: 'Recommendations', label: 'Recommendations', icon: Lightbulb },
  { id: 'Carbon Offsetting', label: 'Carbon Offsetting', icon: Award },
  { id: 'Technical', label: 'Technical', icon: Shield },
  { id: 'Pricing', label: 'Pricing', icon: DollarSign },
  { id: 'Support', label: 'Support', icon: HelpCircle },
];

const FAQPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

  const filteredFAQs = FAQ_DATA.filter(faq => {
    const matchesSearch = searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const expandAll = () => {
    setExpandedItems(new Set(filteredFAQs.map((_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Navbar onNavigate={(section) => navigate('/')} activeSection="" />

      {/* Hero Section */}
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-6 shadow-lg shadow-emerald-200">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Everything you need to know about Eco<span className="italic font-light text-blue-400">b</span>Serve and sustainable event planning
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-gray-900 placeholder-gray-400 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Categories</h3>
              <div className="space-y-1">
                {CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  const count = category.id === 'all'
                    ? FAQ_DATA.length
                    : FAQ_DATA.filter(faq => faq.category === category.id).length;

                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        selectedCategory === category.id
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 text-left">{category.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        selectedCategory === category.id
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* FAQ List */}
          <div className="flex-1">
            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredFAQs.length}</span> {filteredFAQs.length === 1 ? 'question' : 'questions'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={expandAll}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Expand All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={collapseAll}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* FAQ Items */}
            {filteredFAQs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No questions found</h3>
                <p className="text-gray-600">Try adjusting your search or category filter</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFAQs.map((faq, index) => {
                  const isExpanded = expandedItems.has(index);

                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md"
                    >
                      <button
                        onClick={() => toggleItem(index)}
                        className="w-full flex items-start gap-4 p-6 text-left"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                              {faq.category}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {faq.question}
                          </h3>
                        </div>
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isExpanded ? 'bg-emerald-100' : 'bg-gray-100'
                        }`}>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-6 pb-6">
                          <div className="pl-0 border-l-4 border-emerald-200 pl-4">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Still have questions?
          </h2>
          <p className="text-emerald-50 text-lg mb-8">
            Our team is here to help you create sustainable, impactful events
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-all shadow-lg"
            >
              Start Calculating
            </button>
            <a
              href="mailto:support@ecobserve.com"
              className="px-8 py-3 bg-emerald-700 text-white rounded-xl font-semibold hover:bg-emerald-800 transition-all shadow-lg"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FAQPage;
