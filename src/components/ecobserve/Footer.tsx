import React from 'react';
import { Leaf, Twitter, Linkedin, Github, Instagram, Mail, MapPin, Phone, ArrowUp } from 'lucide-react';
import BrandLogo, { getBrandName } from './BrandLogo';

interface FooterProps {
  onNavigate: (section: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* CTA Banner */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Ready to make your events sustainable?</h3>
              <p className="text-gray-400">Start calculating your environmental impact today — it's free.</p>
            </div>
            <button
              onClick={() => onNavigate('calculator')}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20 whitespace-nowrap"
            >
              Start Free Calculator
            </button>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <BrandLogo size="md" variant="white" />
            </div>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              The leading platform for measuring and reducing the environmental impact of events worldwide.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-2 py-1 bg-emerald-900/50 text-emerald-400 text-xs rounded-full">Eco-Friendly</span>
              <span className="px-2 py-1 bg-blue-900/50 text-blue-400 text-xs rounded-full">Observability</span>
              <span className="px-2 py-1 bg-teal-900/50 text-teal-400 text-xs rounded-full">Service</span>
            </div>
            <div className="flex gap-3">
              {[
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Linkedin, href: '#', label: 'LinkedIn' },
                { icon: Github, href: '#', label: 'GitHub' },
                { icon: Instagram, href: '#', label: 'Instagram' },
              ].map((social) => (
                <button
                  key={social.label}
                  onClick={() => window.open(social.href, '_blank')}
                  className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3">
              {[
                { label: 'Event Footprint', section: 'calculator' },
                { label: 'Impact', section: 'dashboard' },
                { label: 'Recommendations', section: 'alternatives' },
                { label: 'Green Score', section: 'score' },
                { label: 'Success Stories', section: 'portfolio' },
              ].map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => onNavigate(link.section)}
                    className="text-gray-400 text-sm hover:text-emerald-400 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-3">
              {['Guides', 'Blog', 'Case Studies', 'API Docs', 'Certifications'].map((link) => (
                <li key={link}>
                  <button
                    onClick={() => onNavigate('resources')}
                    className="text-gray-400 text-sm hover:text-emerald-400 transition-colors"
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {['About Us', 'Careers', 'Press', 'Partners', 'Contact'].map((link) => (
                <li key={link}>
                  <button
                    onClick={() => alert(`${link} page coming soon!`)}
                    className="text-gray-400 text-sm hover:text-emerald-400 transition-colors"
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Mail className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                hello@ecobserve.app
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Phone className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                +1 (555) 123-4567
              </li>
              <li className="flex items-start gap-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                123 Green Street, San Francisco, CA 94102
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-gray-500 text-sm text-center sm:text-left">
              &copy; {new Date().getFullYear()} {getBrandName()}. All rights reserved.
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
              {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map((link) => (
                <button
                  key={link}
                  onClick={() => alert(`${link} page coming soon!`)}
                  className="text-gray-500 text-xs sm:text-sm hover:text-emerald-400 transition-colors"
                >
                  {link}
                </button>
              ))}
              <button
                onClick={scrollToTop}
                className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-colors"
                aria-label="Back to top"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
