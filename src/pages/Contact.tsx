import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Briefcase, Users, Globe } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', category: 'general', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mb-6">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Get in Touch</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions? We're here to help. Reach out to our team and we'll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Information Cards */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Email Us</h3>
            </div>
            <div className="space-y-2 text-gray-600">
              <p><strong>General:</strong> <a href="mailto:info@ecobserve.com" className="text-blue-600 hover:text-blue-700">info@ecobserve.com</a></p>
              <p><strong>Support:</strong> <a href="mailto:support@ecobserve.com" className="text-blue-600 hover:text-blue-700">support@ecobserve.com</a></p>
              <p><strong>Sales:</strong> <a href="mailto:sales@ecobserve.com" className="text-blue-600 hover:text-blue-700">sales@ecobserve.com</a></p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Phone className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Call Us</h3>
            </div>
            <div className="space-y-2 text-gray-600">
              <p><a href="tel:+15551234567" className="text-emerald-600 hover:text-emerald-700">+1 (555) 123-4567</a></p>
              <p className="text-sm">Monday - Friday</p>
              <p className="text-sm">9:00 AM - 6:00 PM PST</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Visit Us</h3>
            </div>
            <div className="text-gray-600">
              <p>123 Green Street</p>
              <p>San Francisco, CA 94102</p>
              <p>United States</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
            
            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
                ✓ Thank you! Your message has been sent successfully. We'll get back to you soon.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="sales">Sales & Pricing</option>
                  <option value="partnership">Partnership Opportunity</option>
                  <option value="press">Press & Media</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Additional Information */}
          <div className="space-y-6">
            {/* Response Times */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Response Times</h2>
              </div>
              <div className="space-y-3 text-gray-700">
                <div className="flex justify-between items-center">
                  <span>Explorer (Free):</span>
                  <span className="font-semibold">48 hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Planner:</span>
                  <span className="font-semibold">24 hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Impact Leader:</span>
                  <span className="font-semibold">12 hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Enterprise:</span>
                  <span className="font-semibold text-emerald-600">4 hours (SLA)</span>
                </div>
              </div>
            </div>

            {/* Department Contacts */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Department Contacts</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Sales & Enterprise</h3>
                    <p className="text-sm text-gray-600">sales@ecobserve.com</p>
                    <p className="text-sm text-gray-600">+1 (555) 123-4569</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-emerald-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Partnerships</h3>
                    <p className="text-sm text-gray-600">partnerships@ecobserve.com</p>
                    <p className="text-sm text-gray-600">+1 (555) 123-4571</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-purple-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Press & Media</h3>
                    <p className="text-sm text-gray-600">press@ecobserve.com</p>
                    <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Global Offices */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">Global Offices</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-semibold mb-1">🇺🇸 San Francisco (HQ)</h3>
                  <p className="text-blue-100">123 Green Street, CA 94102</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">🇺🇸 New York</h3>
                  <p className="text-blue-100">456 Sustainability Ave, NY 10001</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">🇬🇧 London</h3>
                  <p className="text-blue-100">789 Eco Lane, EC1A 1BB</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">🇿🇦 Cape Town</h3>
                  <p className="text-blue-100">321 Green Point, 8001</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
