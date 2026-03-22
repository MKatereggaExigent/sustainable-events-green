import React, { useState } from 'react';
import { Cookie, Check, X, Settings, Info, Mail } from 'lucide-react';
import Navbar from '@/components/ecobserve/Navbar';
import Footer from '@/components/ecobserve/Footer';

const Cookies: React.FC = () => {
  const [preferences, setPreferences] = useState({
    essential: true, // Always true, cannot be disabled
    analytics: true,
    marketing: false,
    preferences: true,
  });

  const handleToggle = (category: keyof typeof preferences) => {
    if (category === 'essential') return; // Cannot disable essential cookies
    setPreferences(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const handleSavePreferences = () => {
    // Save to localStorage
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    alert('Cookie preferences saved successfully!');
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookiePreferences', JSON.stringify(allAccepted));
    alert('All cookies accepted!');
  };

  const handleRejectNonEssential = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    setPreferences(essentialOnly);
    localStorage.setItem('cookiePreferences', JSON.stringify(essentialOnly));
    alert('Non-essential cookies rejected!');
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar onNavigate={() => {}} activeSection="" />
      <div className="bg-gradient-to-br from-gray-50 to-orange-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl mb-6">
            <Cookie className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Settings</h1>
          <p className="text-gray-600">Manage your cookie preferences and learn how we use cookies</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 space-y-8">
          {/* Introduction */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Info className="w-6 h-6 text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-900">What Are Cookies?</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences, analyzing how you use our service, and personalizing content.
            </p>
          </section>

          {/* Cookie Categories */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-900">Manage Your Preferences</h2>
            </div>

            <div className="space-y-6">
              {/* Essential Cookies */}
              <div className="border border-gray-200 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Essential Cookies</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Required for the platform to function properly. These cookies enable core functionality such as security, authentication, and accessibility. They cannot be disabled.
                    </p>
                    <div className="text-sm text-gray-500">
                      <strong>Examples:</strong> Session management, authentication tokens, security features
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="w-12 h-6 bg-emerald-500 rounded-full flex items-center justify-end px-1 cursor-not-allowed">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Always On</p>
                  </div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="border border-gray-200 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Cookies</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Help us understand how visitors interact with our platform by collecting and reporting information anonymously. This helps us improve our service.
                    </p>
                    <div className="text-sm text-gray-500">
                      <strong>Examples:</strong> Google Analytics, usage statistics, performance monitoring
                    </div>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => handleToggle('analytics')}
                      className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                        preferences.analytics ? 'bg-emerald-500 justify-end' : 'bg-gray-300 justify-start'
                      } px-1`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="border border-gray-200 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Marketing Cookies</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Used to track visitors across websites to display relevant advertisements and measure campaign effectiveness.
                    </p>
                    <div className="text-sm text-gray-500">
                      <strong>Examples:</strong> Ad targeting, conversion tracking, retargeting
                    </div>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => handleToggle('marketing')}
                      className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                        preferences.marketing ? 'bg-emerald-500 justify-end' : 'bg-gray-300 justify-start'
                      } px-1`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Preference Cookies */}
              <div className="border border-gray-200 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Preference Cookies</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Remember your settings and preferences to provide a personalized experience, such as language selection and display preferences.
                    </p>
                    <div className="text-sm text-gray-500">
                      <strong>Examples:</strong> Language settings, theme preferences, dashboard layout
                    </div>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => handleToggle('preferences')}
                      className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                        preferences.preferences ? 'bg-emerald-500 justify-end' : 'bg-gray-300 justify-start'
                      } px-1`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mt-8">
              <button
                onClick={handleSavePreferences}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg"
              >
                <Check className="w-5 h-5 inline mr-2" />
                Save Preferences
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all"
              >
                Accept All
              </button>
              <button
                onClick={handleRejectNonEssential}
                className="px-6 py-3 bg-gray-200 text-gray-900 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                <X className="w-5 h-5 inline mr-2" />
                Reject Non-Essential
              </button>
            </div>
          </section>

          {/* Third-Party Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use the following third-party services that may set cookies:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Google Analytics:</strong> Website analytics and usage tracking</li>
              <li><strong>Stripe:</strong> Payment processing and fraud prevention</li>
              <li><strong>Supabase:</strong> Authentication and database services</li>
              <li><strong>OpenAI:</strong> AI-powered recommendations</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              These third parties have their own privacy policies. We recommend reviewing them to understand how they use cookies.
            </p>
          </section>

          {/* How to Control Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Control Cookies in Your Browser</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Most web browsers allow you to control cookies through their settings. You can:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>View what cookies are stored and delete them individually</li>
              <li>Block third-party cookies</li>
              <li>Block cookies from specific websites</li>
              <li>Block all cookies</li>
              <li>Delete all cookies when you close your browser</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Please note that deleting or blocking cookies may impact your experience on our platform and prevent you from using certain features.
            </p>
            <div className="mt-4 p-4 bg-orange-50 rounded-xl">
              <p className="text-sm text-gray-700">
                <strong>Browser Help:</strong> For instructions on managing cookies in your specific browser, visit your browser's help section or support website.
              </p>
            </div>
          </section>

          {/* Cookie Retention */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookie Retention</h2>
            <div className="space-y-3">
              <p className="text-gray-700 leading-relaxed">
                <strong>Session Cookies:</strong> Temporary cookies that are deleted when you close your browser.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>Persistent Cookies:</strong> Remain on your device for a set period or until you delete them. We use persistent cookies for:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Authentication (up to 30 days)</li>
                <li>Preferences (up to 1 year)</li>
                <li>Analytics (up to 2 years)</li>
              </ul>
            </div>
          </section>

          {/* Updates to Cookie Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Cookie Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our business operations. We will notify you of any significant changes by posting a notice on our website or sending you an email.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-orange-50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-900">Questions About Cookies?</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about our use of cookies, please contact us:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> <a href="mailto:privacy@ecobserve.com" className="text-orange-600 hover:text-orange-700">privacy@ecobserve.com</a></p>
              <p><strong>General Inquiries:</strong> <a href="mailto:info@ecobserve.com" className="text-orange-600 hover:text-orange-700">info@ecobserve.com</a></p>
              <p><strong>Address:</strong> 123 Green Street, San Francisco, CA 94102</p>
            </div>
            <div className="mt-4 pt-4 border-t border-orange-200">
              <p className="text-sm text-gray-600">
                For more information about how we handle your personal data, please see our{' '}
                <a href="/privacy" className="text-orange-600 hover:text-orange-700 font-medium">Privacy Policy</a>.
              </p>
            </div>
          </section>
        </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cookies;
