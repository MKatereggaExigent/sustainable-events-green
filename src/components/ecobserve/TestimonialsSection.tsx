import React, { useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Chen',
    role: 'Head of Events, TechCorp',
    avatar: 'SC',
    rating: 5,
    text: 'EcobServe completely transformed how we plan our annual conference. We reduced our carbon footprint by 62% and our attendees loved the transparency. The green score card became a badge of honor for our brand.',
    company: 'TechCorp',
    savings: '62% carbon reduction',
  },
  {
    id: 2,
    name: 'Marcus Johnson',
    role: 'Sustainability Director, GreenEvents Co',
    avatar: 'MJ',
    rating: 5,
    text: 'The real-time calculator is a game-changer. Being able to see the impact of each decision as we plan has made sustainability a core part of our process, not an afterthought. Our clients are impressed every time.',
    company: 'GreenEvents Co',
    savings: '45% waste reduction',
  },
  {
    id: 3,
    name: 'Elena Rodriguez',
    role: 'Event Manager, Global Summits',
    avatar: 'ER',
    rating: 5,
    text: 'We used EcobServe for our international summit with 2,000 attendees. The alternative suggestions alone saved us $15,000 while cutting emissions by 40%. The shareable green score was perfect for our ESG reporting.',
    company: 'Global Summits',
    savings: '$15K saved + 40% less CO₂',
  },
  {
    id: 4,
    name: 'David Park',
    role: 'CEO, Eco Celebrations',
    avatar: 'DP',
    rating: 5,
    text: 'Our wedding planning business has seen a 3x increase in bookings since we started sharing EcobServe green scores on social media. Couples love knowing their special day is also kind to the planet.',
    company: 'Eco Celebrations',
    savings: '3x booking increase',
  },
  {
    id: 5,
    name: 'Amara Okafor',
    role: 'VP Operations, ConferenceHub',
    avatar: 'AO',
    rating: 5,
    text: 'The AI assistant helped us identify sustainable vendors we never knew existed. EcobServe is now mandatory for all our event planning workflows. It pays for itself in cost savings alone.',
    company: 'ConferenceHub',
    savings: '28% cost savings',
  },
];

const trustedLogos = [
  'Google', 'Microsoft', 'Salesforce', 'Spotify', 'Airbnb', 'Stripe', 'Shopify', 'Slack',
];

const TestimonialsSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const next = () => setActiveIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trusted by */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-8">
            Trusted by leading organizations worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {trustedLogos.map((logo) => (
              <div
                key={logo}
                className="text-gray-300 font-bold text-xl md:text-2xl hover:text-gray-400 transition-colors cursor-default select-none"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>

        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-100 text-rose-700 rounded-full text-sm font-medium mb-4">
            <Star className="w-4 h-4" />
            Testimonials
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Loved by Event Planners
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            See how organizations worldwide are using Eco<span className="italic font-light opacity-50">b</span>Serve to create sustainable, impactful events.
          </p>
        </div>

        {/* Featured testimonial */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 relative">
            <Quote className="absolute top-6 left-6 w-12 h-12 text-emerald-100" />
            
            <div className="relative">
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8 italic">
                "{testimonials[activeIndex].text}"
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                    {testimonials[activeIndex].avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonials[activeIndex].name}</div>
                    <div className="text-sm text-gray-500">{testimonials[activeIndex].role}</div>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="hidden sm:block">
                  <div className="px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-200">
                    <div className="text-xs text-emerald-600 font-medium">Impact</div>
                    <div className="text-sm font-bold text-emerald-700">{testimonials[activeIndex].savings}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i === activeIndex ? 'bg-emerald-500 w-8' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={next}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mini testimonial cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {testimonials.filter((_, i) => i !== activeIndex).slice(0, 3).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveIndex(testimonials.findIndex(x => x.id === t.id))}
              className="text-left bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all"
            >
              <div className="flex gap-0.5 mb-3">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-gray-600 line-clamp-3 mb-3">"{t.text}"</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.company}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
