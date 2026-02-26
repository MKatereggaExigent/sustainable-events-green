import React, { useState, useRef } from 'react';
import { Share2, Download, Copy, Check, Leaf, Award, Twitter, Linkedin, Mail, X } from 'lucide-react';
import { FootprintResult } from '@/lib/carbonData';
import BrandLogo, { getBrandName, getBrandNameForFile } from './BrandLogo';

interface GreenScoreCardProps {
  result: FootprintResult;
}

const GreenScoreCard: React.FC<GreenScoreCardProps> = ({ result }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [eventName, setEventName] = useState('My Sustainable Event');
  const [organizerName, setOrganizerName] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);

  const getScoreLabel = (score: number) => {
    if (score >= 90) return { label: 'Platinum', color: 'from-emerald-400 to-teal-300' };
    if (score >= 75) return { label: 'Gold', color: 'from-yellow-400 to-amber-300' };
    if (score >= 60) return { label: 'Silver', color: 'from-gray-300 to-gray-200' };
    return { label: 'Bronze', color: 'from-amber-600 to-amber-500' };
  };

  const scoreInfo = getScoreLabel(result.greenScore);

  const shareText = `${eventName} achieved a Green Score of ${result.greenScore}/100 on EcobServe! Carbon: ${result.carbonKg}kg CO₂ | Water: ${result.waterLiters}L | Waste: ${result.wasteKg}kg #SustainableEvents #EcobServe`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const certificate = `
╔══════════════════════════════════════════════╗
║                                              ║
║           🌿 EcobServe Certificate 🌿        ║
║                                              ║
║   ${scoreInfo.label.toUpperCase()} GREEN SCORE: ${result.greenScore}/100${' '.repeat(Math.max(0, 20 - scoreInfo.label.length - String(result.greenScore).length))}║
║                                              ║
║   Event: ${eventName}${' '.repeat(Math.max(0, 35 - eventName.length))}║
║   ${organizerName ? `Organized by: ${organizerName}` : ''}${' '.repeat(Math.max(0, organizerName ? 35 - organizerName.length - 14 : 44))}║
║   Date: ${new Date().toLocaleDateString()}${' '.repeat(Math.max(0, 35 - new Date().toLocaleDateString().length))}║
║                                              ║
║   Environmental Impact:                      ║
║   • Carbon: ${result.carbonKg} kg CO₂${' '.repeat(Math.max(0, 30 - String(result.carbonKg).length))}║
║   • Water: ${result.waterLiters} liters${' '.repeat(Math.max(0, 30 - String(result.waterLiters).length))}║
║   • Waste: ${result.wasteKg} kg${' '.repeat(Math.max(0, 33 - String(result.wasteKg).length))}║
║                                              ║
║   Verified by EcobServe Platform             ║
║                                              ║
╚══════════════════════════════════════════════╝
    `.trim();

    const blob = new Blob([certificate], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${getBrandNameForFile()}-certificate-${eventName.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white to-emerald-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
            <Award className="w-4 h-4" />
            Shareable Certificate
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Your Green Score Card
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Showcase your commitment to sustainability. Customize and share your event's green score with stakeholders and social media.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Card preview */}
          <div className="flex justify-center">
            <div ref={cardRef} className="w-full max-w-md">
              <div className="bg-gradient-to-br from-gray-900 via-emerald-900 to-teal-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400 rounded-full blur-3xl" />
                </div>

                <div className="relative">
                  {/* Logo */}
                  <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-lg flex items-center justify-center">
                      <Leaf className="w-4 h-4 text-white" />
                    </div>
                    <BrandLogo size="lg" variant="white" />
                    <div className="ml-auto">
                      <span className={`px-3 py-1 bg-gradient-to-r ${scoreInfo.color} rounded-full text-xs font-bold text-gray-900`}>
                        {scoreInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Event name */}
                  <h3 className="text-2xl font-bold text-white mb-1">{eventName || 'Your Event Name'}</h3>
                  {organizerName && <p className="text-emerald-300 text-sm mb-6">by {organizerName}</p>}
                  {!organizerName && <div className="mb-6" />}

                  {/* Score */}
                  <div className="flex items-center gap-6 mb-8">
                    <div className="relative w-28 h-28">
                      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                        <circle
                          cx="50" cy="50" r="42" fill="none"
                          stroke="url(#scoreGradient)" strokeWidth="8"
                          strokeDasharray={`${(result.greenScore / 100) * 264} 264`}
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#34d399" />
                            <stop offset="100%" stopColor="#2dd4bf" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-white">{result.greenScore}</span>
                        <span className="text-emerald-400 text-xs">/100</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-emerald-400 text-xs">Carbon</div>
                        <div className="text-white font-semibold">{result.carbonKg.toLocaleString()} kg CO₂</div>
                      </div>
                      <div>
                        <div className="text-blue-400 text-xs">Water</div>
                        <div className="text-white font-semibold">{result.waterLiters.toLocaleString()} L</div>
                      </div>
                      <div>
                        <div className="text-amber-400 text-xs">Waste</div>
                        <div className="text-white font-semibold">{result.wasteKg.toLocaleString()} kg</div>
                      </div>
                    </div>
                  </div>

                  {/* Breakdown bar */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-400 mb-2">Carbon Breakdown</div>
                    <div className="flex h-3 rounded-full overflow-hidden bg-gray-800">
                      {Object.entries(result.breakdown).map(([key, value], i) => {
                        const total = Object.values(result.breakdown).reduce((a, b) => a + b, 0);
                        const pct = total > 0 ? (value / total) * 100 : 25;
                        const colors = ['bg-emerald-500', 'bg-amber-500', 'bg-blue-500', 'bg-purple-500'];
                        return (
                          <div
                            key={key}
                            className={`${colors[i]} transition-all`}
                            style={{ width: `${pct}%` }}
                          />
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-1.5 text-[10px] text-gray-500">
                      <span>Venue</span>
                      <span>F&B</span>
                      <span>Transport</span>
                      <span>Materials</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="text-gray-500 text-xs">Verified {new Date().toLocaleDateString()}</span>
                    <span className="text-gray-500 text-xs">{getBrandNameForFile()}.app</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customization panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Customize Your Card</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter your event name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organizer Name</label>
                  <input
                    type="text"
                    value={organizerName}
                    onChange={(e) => setOrganizerName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Your name or organization"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-200"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-white text-gray-700 rounded-2xl font-semibold border-2 border-gray-200 hover:border-emerald-300 hover:text-emerald-700 transition-all"
              >
                <Download className="w-5 h-5" />
                Certificate
              </button>
            </div>

            {/* Score explanation */}
            <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
              <h4 className="font-semibold text-emerald-800 mb-3">About Your {scoreInfo.label} Score</h4>
              <div className="space-y-2 text-sm text-emerald-700">
                <p>Your Green Score of <strong>{result.greenScore}/100</strong> places your event in the <strong>{scoreInfo.label}</strong> tier.</p>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {[
                    { tier: 'Platinum', range: '90-100', color: 'bg-emerald-200' },
                    { tier: 'Gold', range: '75-89', color: 'bg-yellow-200' },
                    { tier: 'Silver', range: '60-74', color: 'bg-gray-200' },
                    { tier: 'Bronze', range: '0-59', color: 'bg-amber-200' },
                  ].map((t) => (
                    <div key={t.tier} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${t.color}`}>
                      <span className="text-xs font-medium text-gray-800">{t.tier}: {t.range}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Share Your Green Score</h3>
              <button onClick={() => setShowShareModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Share text preview */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm text-gray-700">
              {shareText}
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors mb-4"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>

            {/* Social buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-sky-50 text-sky-600 rounded-xl text-sm font-medium hover:bg-sky-100 transition-colors"
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </button>
              <button
                onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://${getBrandNameForFile()}.app`)}`, '_blank')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </button>
              <button
                onClick={() => window.open(`mailto:?subject=Green Score - ${eventName}&body=${encodeURIComponent(shareText)}`, '_blank')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Email
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default GreenScoreCard;
