import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Menu, X, User, FolderOpen, DollarSign, LogOut, LayoutDashboard, Sparkles, Award, Calculator, HelpCircle, RotateCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTour } from '@/contexts/TourContext';
import BrandLogo from './BrandLogo';

interface NavbarProps {
  onNavigate: (section: string) => void;
  activeSection: string;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, activeSection }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { restartTour, hasCompletedTour } = useTour();
  const navigate = useNavigate();

  // Free features - accessible to everyone
  const freeLinks = [
    { id: 'hero', label: 'Home', icon: null },
    { id: 'portfolio', label: 'Success Stories', icon: null },
    { id: 'resources', label: 'Resources', icon: null },
  ];

  // Premium features - require authentication
  const premiumLinks = [
    { id: 'calculator', label: 'Event Footprint', icon: Calculator, premium: true },
    { id: 'costsavings', label: 'Cost & Savings', icon: DollarSign, premium: true },
    { id: 'dashboard', label: 'Impact', icon: LayoutDashboard, premium: true },
    { id: 'myevents', label: 'My Events', icon: FolderOpen, premium: true },
    { id: 'alternatives', label: 'Recommendations', icon: Sparkles, premium: true },
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
              {freeLinks.slice(0, 1).map((link) => (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`px-2 xl:px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition-all flex items-center gap-1 whitespace-nowrap ${
                    activeSection === link.id
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/50'
                  }`}
                >
                  {link.label}
                </button>
              ))}

              {/* Premium links - only show when authenticated */}
              {isAuthenticated && premiumLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  data-tour={`nav-${link.id}`}
                  className={`px-2 xl:px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition-all flex items-center gap-1 whitespace-nowrap ${
                    activeSection === link.id
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/50'
                  }`}
                >
                  {link.icon && <link.icon className="w-3 xl:w-3.5 h-3 xl:h-3.5 flex-shrink-0" />}
                  {link.label}
                </button>
              ))}

              {/* Remaining free links (Success Stories, Resources) */}
              {freeLinks.slice(1).map((link) => (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`px-2 xl:px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition-all flex items-center gap-1 whitespace-nowrap ${
                    activeSection === link.id
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/50'
                  }`}
                >
                  {link.label}
                </button>
              ))}
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
                    <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                        <p className="text-xs text-emerald-600">Premium Member</p>
                      </div>
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
              {freeLinks.slice(0, 1).map((link) => (
                <button
                  key={link.id}
                  onClick={() => { onNavigate(link.id); setMobileOpen(false); }}
                  className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeSection === link.id
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-600 hover:bg-emerald-50'
                  }`}
                >
                  {link.label}
                </button>
              ))}

              {/* Premium links - only show when authenticated */}
              {isAuthenticated && premiumLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => { onNavigate(link.id); setMobileOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    activeSection === link.id
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-600 hover:bg-emerald-50'
                  }`}
                >
                  {link.icon && <link.icon className="w-4 h-4" />}
                  {link.label}
                </button>
              ))}

              {/* Remaining free links (Success Stories, Resources) */}
              {freeLinks.slice(1).map((link) => (
                <button
                  key={link.id}
                  onClick={() => { onNavigate(link.id); setMobileOpen(false); }}
                  className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeSection === link.id
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-600 hover:bg-emerald-50'
                  }`}
                >
                  {link.label}
                </button>
              ))}

              {/* Auth button */}
              {isAuthenticated && user ? (
                <div className="pt-2 border-t border-gray-100 mt-2">
                  <div className="px-4 py-2 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                      <p className="text-xs text-emerald-600">Premium Member</p>
                    </div>
                  </div>
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
    </>
  );
};

export default Navbar;
