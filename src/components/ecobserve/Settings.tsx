import React, { useState } from 'react';
import { Settings as SettingsIcon, Eye, EyeOff, Scale, DollarSign, Check, Loader2, ChevronDown, Search } from 'lucide-react';
import { useSettings, METRIC_CONVERSIONS } from '../../contexts/SettingsContext';

interface SettingsProps {
  onClose?: () => void;
}

const metricSystems = [
  { id: 'metric', label: 'Metric (SI)', description: 'kg, km, liters — EU, Asia, Africa, Latin America' },
  { id: 'imperial', label: 'Imperial (US)', description: 'lbs, miles, gallons — United States' },
  { id: 'uk', label: 'UK Mixed', description: 'kg, miles, liters — United Kingdom' },
] as const;

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const { settings, currencies, isLoading, updateSettings } = useSettings();
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  const [savingMetric, setSavingMetric] = useState(false);
  const [savingCurrency, setSavingCurrency] = useState(false);
  const [savingHide, setSavingHide] = useState(false);

  const filteredCurrencies = currencies.filter(
    (c) =>
      c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
      c.name.toLowerCase().includes(currencySearch.toLowerCase())
  );

  const currentCurrency = currencies.find((c) => c.code === settings?.currencyCode);

  const handleMetricChange = async (system: 'metric' | 'imperial' | 'uk') => {
    if (system === settings?.metricSystem) return;
    setSavingMetric(true);
    await updateSettings({ metricSystem: system });
    setSavingMetric(false);
  };

  const handleCurrencyChange = async (code: string) => {
    if (code === settings?.currencyCode) {
      setShowCurrencyDropdown(false);
      return;
    }
    setSavingCurrency(true);
    await updateSettings({ currencyCode: code });
    setSavingCurrency(false);
    setShowCurrencyDropdown(false);
    setCurrencySearch('');
  };

  const handleHideToggle = async () => {
    setSavingHide(true);
    await updateSettings({ hideValues: !settings?.hideValues });
    setSavingHide(false);
  };

  if (!settings) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-w-md w-full">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-5 h-5" />
          <h3 className="font-semibold text-lg">Settings</h3>
        </div>
        <p className="text-emerald-100 text-sm mt-1">Customize your experience</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Metric System */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Scale className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">Measurement System</label>
            {savingMetric && <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />}
          </div>
          <div className="space-y-2">
            {metricSystems.map((system) => (
              <button
                key={system.id}
                onClick={() => handleMetricChange(system.id)}
                disabled={savingMetric}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                  settings.metricSystem === system.id
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-left">
                  <p className="font-medium text-gray-900">{system.label}</p>
                  <p className="text-xs text-gray-500">{system.description}</p>
                </div>
                {settings.metricSystem === system.id && (
                  <Check className="w-5 h-5 text-emerald-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Currency */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">Currency</label>
            {savingCurrency && <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-emerald-300 transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{currentCurrency?.symbol || '$'}</span>
                <span className="font-medium text-gray-900">{settings.currencyCode}</span>
                <span className="text-gray-500 text-sm">— {currentCurrency?.name}</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showCurrencyDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showCurrencyDropdown && (
              <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-64 overflow-hidden">
                <div className="p-2 border-b border-gray-100">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={currencySearch}
                      onChange={(e) => setCurrencySearch(e.target.value)}
                      placeholder="Search currencies..."
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredCurrencies.map((currency) => (
                    <button
                      key={currency.code}
                      onClick={() => handleCurrencyChange(currency.code)}
                      className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-emerald-50 transition-colors ${
                        settings.currencyCode === currency.code ? 'bg-emerald-50' : ''
                      }`}
                    >
                      <span className="text-lg w-6">{currency.symbol}</span>
                      <span className="font-medium text-gray-900">{currency.code}</span>
                      <span className="text-gray-500 text-sm truncate">{currency.name}</span>
                      {settings.currencyCode === currency.code && (
                        <Check className="w-4 h-4 text-emerald-500 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {settings.exchangeRate !== 1 && (
            <p className="text-xs text-gray-500 mt-2">
              Exchange rate: 1 USD = {settings.exchangeRate.toFixed(4)} {settings.currencyCode}
            </p>
          )}
        </div>

        {/* Hide Values Toggle */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            {settings.hideValues ? (
              <EyeOff className="w-4 h-4 text-gray-500" />
            ) : (
              <Eye className="w-4 h-4 text-gray-500" />
            )}
            <label className="text-sm font-medium text-gray-700">Privacy Mode</label>
            {savingHide && <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />}
          </div>
          <button
            onClick={handleHideToggle}
            disabled={savingHide}
            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
              settings.hideValues
                ? 'border-amber-500 bg-amber-50'
                : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
            }`}
          >
            <div className="text-left">
              <p className="font-medium text-gray-900">
                {settings.hideValues ? 'Values Hidden' : 'Values Visible'}
              </p>
              <p className="text-xs text-gray-500">
                {settings.hideValues
                  ? 'All numerical values are masked with ***'
                  : 'Click to hide all carbon, money, and other values'}
              </p>
            </div>
            <div
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                settings.hideValues ? 'bg-amber-500' : 'bg-gray-200'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                  settings.hideValues ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </div>
          </button>
          {settings.hideValues && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Privacy Mode Active:</strong> All numerical values including carbon footprint,
                costs, and metrics will appear as <span className="font-mono bg-amber-100 px-1 rounded">***</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;

