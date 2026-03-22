import React from 'react';
import { Heart, Eye, Users, Globe, Award, TrendingUp, Target, Sparkles } from 'lucide-react';
import Navbar from '@/components/ecobserve/Navbar';
import Footer from '@/components/ecobserve/Footer';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar onNavigate={() => {}} activeSection="" />
      <div className="bg-gradient-to-br from-gray-50 to-emerald-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl mb-6">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">About EcobServe</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The leading platform for measuring and reducing the environmental impact of events worldwide
          </p>
        </div>

        {/* Content */}
        <div className="space-y-16">
          {/* Mission */}
          <section className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-8 h-8 text-emerald-600" />
              <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">
              To empower event planners worldwide to measure, reduce, and showcase their environmental impact through innovative technology and authentic care.
            </p>
          </section>

          {/* Our Story */}
          <section className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-8 h-8 text-emerald-600" />
              <h2 className="text-3xl font-bold text-gray-900">Our Story</h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                EcobServe was founded in 2024 in response to the growing need for accessible, accurate sustainability measurement tools in the events industry. We recognized that event planners wanted to make environmentally conscious decisions but lacked the data and tools to do so effectively.
              </p>
              <p>
                Our name combines three powerful concepts:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong>Eco:</strong> Eco-friendly environmental sustainability</li>
                <li><strong>b (observe):</strong> Observability of environmental impact through data and analytics</li>
                <li><strong>Serve:</strong> Service-oriented platform delivering personalized value</li>
              </ul>
            </div>
          </section>

          {/* Our Values */}
          <section className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Authentic Care */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-4">
                  <Heart className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Authentic Care 🌿</h3>
                <p className="text-gray-600">
                  We genuinely care about the planet and provide tools that make a real difference. Every feature is designed with environmental impact in mind, not just greenwashing.
                </p>
              </div>

              {/* Observable Impact */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                  <Eye className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Observable Impact 📊</h3>
                <p className="text-gray-600">
                  We believe in transparency and data-driven decision making. All our calculations use verified emission factors from DEFRA, EPA, and other authoritative sources.
                </p>
              </div>

              {/* Personalized Service */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-2xl mb-4">
                  <Users className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Personalized Service 💚</h3>
                <p className="text-gray-600">
                  Every event is unique. Our AI-powered recommendations and flexible platform adapt to your specific needs, event type, and sustainability goals.
                </p>
              </div>
            </div>
          </section>

          {/* Our Impact */}
          <section className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-xl p-8 md:p-12 text-white">
            <div className="flex items-center gap-3 mb-8 justify-center">
              <TrendingUp className="w-8 h-8" />
              <h2 className="text-3xl font-bold">Our Impact (as of March 2026)</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">15,000+</div>
                <div className="text-emerald-100">Events Tracked Globally</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">2.5M kg</div>
                <div className="text-emerald-100">CO₂e Measured & Reduced</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">5,000+</div>
                <div className="text-emerald-100">Active Event Planners</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">45+</div>
                <div className="text-emerald-100">Countries Represented</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">95%</div>
                <div className="text-emerald-100">Customer Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">12,000+</div>
                <div className="text-emerald-100">Trees Planted</div>
              </div>
            </div>
          </section>

          {/* Global Presence */}
          <section className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-8 h-8 text-emerald-600" />
              <h2 className="text-3xl font-bold text-gray-900">Global Presence</h2>
            </div>
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                <strong>Headquarters:</strong> 123 Green Street, San Francisco, CA 94102, USA
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-gray-700">
              <div>
                <h3 className="font-semibold mb-2">🌎 North America</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>San Francisco (HQ)</li>
                  <li>New York</li>
                  <li>Toronto</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🌍 Europe</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>London</li>
                  <li>Amsterdam</li>
                  <li>Berlin</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🌍 Africa</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Cape Town</li>
                  <li>Johannesburg</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🌏 Asia-Pacific</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Singapore</li>
                  <li>Sydney</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Partnerships */}
          <section className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Strategic Partnerships</h2>
            <div className="grid md:grid-cols-2 gap-6 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg mb-3">Certification Partners</h3>
                <ul className="space-y-2">
                  <li>• Gold Standard Foundation</li>
                  <li>• Verra (VCS Registry)</li>
                  <li>• B Corp Certified Suppliers Network</li>
                  <li>• UN Sustainable Development Goals Alliance</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3">Industry Partners</h3>
                <ul className="space-y-2">
                  <li>• Events Industry Council (EIC)</li>
                  <li>• Meeting Professionals International (MPI)</li>
                  <li>• Green Business Certification Inc. (GBCI)</li>
                  <li>• International Association of Exhibitions and Events (IAEE)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Certifications & Recognition */}
          <section className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-8 h-8 text-emerald-600" />
              <h2 className="text-3xl font-bold text-gray-900">Certifications & Recognition</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 text-gray-900">Certifications</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ B Corp Certified (pending)</li>
                  <li>✓ ISO 27001 Information Security</li>
                  <li>✓ SOC 2 Type II Compliance</li>
                  <li>✓ GDPR Compliant</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3 text-gray-900">Awards</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>🏆 2025 Green Tech Innovation Award</li>
                  <li>🏆 Best Sustainability Platform - Event Tech Awards 2025</li>
                  <li>🏆 Top 50 Climate Solutions - Global Climate Action 2025</li>
                  <li>🏆 Best New Event Technology - MPI Awards 2025</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Team */}
          <section className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-8 h-8 text-emerald-600" />
              <h2 className="text-3xl font-bold text-gray-900">Our Team</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">
              A diverse group of sustainability experts, software engineers, event professionals, and environmental scientists passionate about making events more sustainable. We're united by our commitment to authentic environmental impact and data-driven solutions.
            </p>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl shadow-xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Join Us in Making Events Sustainable</h2>
            <p className="text-xl mb-8 text-emerald-50">
              Start measuring and reducing your event's environmental impact today
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="/"
                className="px-8 py-4 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-all shadow-lg"
              >
                Start Free Calculator
              </a>
              <a
                href="/contact"
                className="px-8 py-4 bg-emerald-700 text-white rounded-xl font-semibold hover:bg-emerald-800 transition-all"
              >
                Contact Us
              </a>
            </div>
          </section>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;

