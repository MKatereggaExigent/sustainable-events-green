import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Menu, X, User, FolderOpen, DollarSign, LogOut, LayoutDashboard, Sparkles, Award, Calculator, HelpCircle, RotateCcw, Settings as SettingsIcon, CreditCard, Crown, ChevronDown, BookOpen, TrendingUp, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTour } from '@/contexts/TourContext';
import BrandLogo from './BrandLogo';
import Settings from './Settings';
import SubscriptionBadge from './SubscriptionBadge';

// Navbar v1.2 - Fixed icon rendering and dropdown hover (Build: 2026-03-16)

interface NavbarProps {
  onNavigate: (section: string) => void;
  activeSection?: string;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, activeSection }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCalculatorsDropdown, setShowCalculatorsDropdown] = useState(false);
  const [showResultsDropdown, setShowResultsDropdown] = useState(false);
  const [showInfoDropdown, setShowInfoDropdown] = useState(false);
  const { user, isAuthenticated, logout, isLoading, subscriptionTier } = useAuth();
  const { restartTour, hasCompletedTour } = useTour();
  const navigate = useNavigate();

  // Grouped navigation items
  const calculatorLinks = [
    { id: 'calculator', label: 'Event Footprint', icon: Calculator, premium: true },
    { id: 'costsavings', label: 'Cost & Savings', icon: DollarSign, premium: true },
  ];

  const resultsLinks = [
    { id: 'dashboard', label: 'Impact', icon: LayoutDashboard, premium: true },
    { id: 'alternatives', label: 'Recommendations', icon: Sparkles, premium: true },
  ];

  const infoLinks = [
    { id: 'portfolio', label: 'Success Stories', icon: Award },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'faq', label: 'FAQs', icon: HelpCircle, isRoute: true },
  ];

  // Standalone links
  const standaloneLinks = [
    { id: 'hero', label: 'Home', icon: null },
    { id: 'myevents', label: 'My Events', icon: FolderOpen, premium: true },
    { id: 'pricing', label: 'Pricing', icon: CreditCard, isRoute: true },
  ];

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-emerald-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => onNavigate('hero')}
              className="flex items-center gap-2 group"
              data-tour="navbar-logo"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:shadow-emerald-300 transition-shadow">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <BrandLogo size="md" variant="gradient" />
            </button>

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-0.5 xl:gap-1">
              {/* Home link */}
              <button
                onClick={() => onNavigate('hero')}
                className={`px-2 xl:px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition-all flex items-center gap-1 whitespace-nowrap ${
                  activeSection === 'hero'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/50'
                }`}
              >
                Home
              </button>

              {/* Calculators Dropdown - only show when authenticated */}
              {isAuthenticated && (
                <div
                  className="relative group"
                  onMouseEnter={() => setShowCalculatorsDropdown(true)}
                  onMouseLeave={() => setShowCalculatorsDropdown(false)}
                >
                  <button
                    onClick={() => setShowCalculatorsDropdown(!showCalculatorsDropdown)}
                    className={`px-2 xl:px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition-all flex items-center gap-1 whitespace-nowrap ${
                      calculatorLinks.some(link => link.id === activeSection) || showCalculatorsDropdown
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/50'
                    }`}
                  >
                    <Calculator className="w-3 xl:w-3.5 h-3 xl:h-3.5 flex-shrink-0" />
                    Calculators
                    <ChevronDown className={`w-3 h-3 transition-transform ${showCalculatorsDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showCalculatorsDropdown && (
                    <div className="absolute top-full left-0 pt-2 w-48 z-50">
                      <div className="bg-white rounded-lg shadow-xl border border-gray-100 py-2">
                        {calculatorLinks.map((link) => {
                          const Icon = link.icon;
                          return (
                            <button
                              key={link.id}
                              onClick={() => { onNavigate(link.id); setShowCalculatorsDropdown(false); }}
                              data-tour={`nav-${link.id}`}
                              className={`w-full text-left px-4 py-2 text-sm transition-all flex items-center gap-2 ${
                                activeSection === link.id
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                              }`}
                            >
                              {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                              {link.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Results Dropdown - only show when authenticated */}
              {isAuthenticated && (
                <div
                  className="relative group"
                  onMouseEnter={() => setShowResultsDropdown(true)}
                  onMouseLeave={() => setShowResultsDropdown(false)}
                >
                  <button
                    onClick={() => setShowResultsDropdown(!showResultsDropdown)}
                    className={`px-2 xl:px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition-all flex items-center gap-1 whitespace-nowrap ${
                      resultsLinks.some(link => link.id === activeSection) || showResultsDropdown
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/50'
                    }`}
                  >
                    <TrendingUp className="w-3 xl:w-3.5 h-3 xl:h-3.5 flex-shrink-0" />
                    Results
                    <ChevronDown className={`w-3 h-3 transition-transform ${showResultsDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showResultsDropdown && (
                    <div className="absolute top-full left-0 pt-2 w-48 z-50">
                      <div className="bg-white rounded-lg shadow-xl border border-gray-100 py-2">
                        {resultsLinks.map((link) => {
                          const Icon = link.icon;
                          return (
                            <button
                              key={link.id}
                              onClick={() => { onNavigate(link.id); setShowResultsDropdown(false); }}
                              data-tour={`nav-${link.id}`}
                              className={`w-full text-left px-4 py-2 text-sm transition-all flex items-center gap-2 ${
                                activeSection === link.id
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                              }`}
                            >
                              {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                              {link.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* My Events - only show when authenticated */}
              {isAuthenticated && (
                <button
                  onClick={() => onNavigate('myevents')}
                  data-tour="nav-myevents"
                  className={`px-2 xl:px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition-all flex items-center gap-1 whitespace-nowrap ${
                    activeSection === 'myevents'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/50'
                  }`}
                >
                  <FolderOpen className="w-3 xl:w-3.5 h-3 xl:h-3.5 flex-shrink-0" />
                  My Events
                </button>
              )}

              {/* Information Dropdown */}
              <div
                className="relative group"
                onMouseEnter={() => setShowInfoDropdown(true)}
                onMouseLeave={() => setShowInfoDropdown(false)}
              >
                <button
                  onClick={() => setShowInfoDropdown(!showInfoDropdown)}
                  className={`px-2 xl:px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition-all flex items-center gap-1 whitespace-nowrap ${
                    infoLinks.some(link => link.id === activeSection) || showInfoDropdown
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/50'
                  }`}
                >
                  <Info className="w-3 xl:w-3.5 h-3 xl:h-3.5 flex-shrink-0" />
                  Information
                  <ChevronDown className={`w-3 h-3 transition-transform ${showInfoDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showInfoDropdown && (
                  <div className="absolute top-full left-0 pt-2 w-48 z-50">
                    <div className="bg-white rounded-lg shadow-xl border border-gray-100 py-2">
                      {infoLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                          <button
                            key={link.id}
                            data-tour={link.id === 'faq' ? 'faq' : undefined}
                            onClick={() => {
                              if (link.isRoute) {
                                navigate(`/${link.id}`);
                              } else {
                                onNavigate(link.id);
                              }
                              setShowInfoDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-all flex items-center gap-2 ${
                              activeSection === link.id
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                            {link.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Pricing link */}
              <button
                onClick={() => navigate('/pricing')}
                className={`px-2 xl:px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition-all flex items-center gap-1 whitespace-nowrap ${
                  activeSection === 'pricing'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/50'
                }`}
              >
                <CreditCard className="w-3 xl:w-3.5 h-3 xl:h-3.5 flex-shrink-0" />
                Pricing
              </button>
            </div>

            {/* Right side - Tour Button & Auth */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Tour Button */}
              <button
                onClick={restartTour}
                data-tour="tour-button"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-600 hover:bg-emerald-50 transition-all border border-emerald-200 hover:border-emerald-300"
                title={hasCompletedTour ? "Take the tour again" : "Start product tour"}
              >
                {hasCompletedTour ? (
                  <RotateCcw className="w-3.5 h-3.5" />
                ) : (
                  <HelpCircle className="w-3.5 h-3.5" />
                )}
                <span className="hidden xl:inline">{hasCompletedTour ? "Restart Tour" : "Take Tour"}</span>
              </button>

              {isLoading ? (
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
              ) : isAuthenticated && user ? (
                <>
                  {/* Current Tier Badge - Always visible */}
                  <div className="hidden md:block">
                    <SubscriptionBadge tier={subscriptionTier} size="sm" />
                  </div>

                  {/* Upgrade button for non-enterprise users */}
                  {subscriptionTier !== 'enterprise' && (
                    <button
                      onClick={() => navigate('/pricing')}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
                      title="Upgrade your subscription"
                    >
                      <Crown className="w-3.5 h-3.5" />
                      <span className="hidden xl:inline">Upgrade</span>
                    </button>
                  )}

                  <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-emerald-50 transition-all"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[120px] truncate">{user.firstName || user.email?.split('@')[0]}</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                        <div className="mt-2">
                          <SubscriptionBadge tier={subscriptionTier} size="sm" />
                        </div>
                      </div>
                      <button
                        onClick={() => { navigate('/pricing'); setShowUserMenu(false); }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-emerald-50 flex items-center gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        Manage Subscription
                      </button>
                      <button
                        onClick={() => { setShowSettings(true); setShowUserMenu(false); }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-emerald-50 flex items-center gap-2"
                      >
                        <SettingsIcon className="w-4 h-4" />
                        Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                  </div>
                </>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-300"
                >
                  <User className="w-4 h-4" />
                  Sign In
                </button>
              )}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-emerald-50"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-emerald-100 shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {/* Home link */}
              <button
                onClick={() => { onNavigate('hero'); setMobileOpen(false); }}
                className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeSection === 'hero'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-emerald-50'
                }`}
              >
                Home
              </button>

              {/* Calculators Section - only show when authenticated */}
              {isAuthenticated && (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Calculators
                  </div>
                  {calculatorLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <button
                        key={link.id}
                        onClick={() => { onNavigate(link.id); setMobileOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                          activeSection === link.id
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'text-gray-600 hover:bg-emerald-50'
                        }`}
                      >
                        {Icon && <Icon className="w-4 h-4" />}
                        {link.label}
                      </button>
                    );
                  })}
                </>
              )}

              {/* Results Section - only show when authenticated */}
              {isAuthenticated && (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">
                    Results
                  </div>
                  {resultsLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <button
                        key={link.id}
                        onClick={() => { onNavigate(link.id); setMobileOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                          activeSection === link.id
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'text-gray-600 hover:bg-emerald-50'
                        }`}
                      >
                        {Icon && <Icon className="w-4 h-4" />}
                        {link.label}
                      </button>
                    );
                  })}
                </>
              )}

              {/* My Events - only show when authenticated */}
              {isAuthenticated && (
                <button
                  onClick={() => { onNavigate('myevents'); setMobileOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    activeSection === 'myevents'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-600 hover:bg-emerald-50'
                  }`}
                >
                  <FolderOpen className="w-4 h-4" />
                  My Events
                </button>
              )}

              {/* Information Section */}
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">
                Information
              </div>
              {infoLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      if (link.isRoute) {
                        navigate(`/${link.id}`);
                      } else {
                        onNavigate(link.id);
                      }
                      setMobileOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      activeSection === link.id
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-600 hover:bg-emerald-50'
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {link.label}
                  </button>
                );
              })}

              {/* Pricing link */}
              <button
                onClick={() => { navigate('/pricing'); setMobileOpen(false); }}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeSection === 'pricing'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-emerald-50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Pricing
              </button>

              {/* Auth button */}
              {isAuthenticated && user ? (
                <div className="pt-2 border-t border-gray-100 mt-2">
                  <div className="px-4 py-2 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                      <div className="mt-1">
                        <SubscriptionBadge tier={subscriptionTier} size="sm" />
                      </div>
                    </div>
                  </div>
                  {subscriptionTier !== 'enterprise' && (
                    <button
                      onClick={() => { navigate('/pricing'); setMobileOpen(false); }}
                      className="w-full mx-4 mb-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Crown className="w-4 h-4" />
                      Upgrade Plan
                    </button>
                  )}
                  <button
                    onClick={() => { setShowSettings(true); setMobileOpen(false); }}
                    className="w-full mt-2 px-4 py-2.5 text-gray-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-emerald-50"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    Settings
                  </button>
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="w-full mt-2 px-4 py-2.5 text-red-600 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { navigate('/login'); setMobileOpen(false); }}
                  className="w-full mt-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-semibold"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto">
              <Settings onClose={() => setShowSettings(false)} />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
