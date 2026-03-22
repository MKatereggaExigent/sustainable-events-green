import React, { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

interface DowngradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: string;
  targetPlan: {
    code: string;
    name: string;
    amount: number;
  };
  onConfirm: (reason: string) => Promise<void>;
}

const DowngradeModal: React.FC<DowngradeModalProps> = ({
  isOpen,
  onClose,
  currentTier,
  targetPlan,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (reason.trim().length < 10) {
      setError('Please provide a reason (minimum 10 characters)');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onConfirm(reason);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to downgrade subscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Warning Icon */}
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-yellow-600" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-2">Downgrade Subscription</h2>
        <p className="text-gray-600 text-center mb-6">
          You're about to downgrade from <span className="font-semibold">{currentTier}</span> to{' '}
          <span className="font-semibold">{targetPlan.name}</span>
        </p>

        {/* Warning Message */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Important:</strong> You have a maximum of 3 downgrades in a 12-month period.
            After downgrading, you'll lose access to premium features immediately.
          </p>
        </div>

        {/* Reason Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Please tell us why you're downgrading <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Budget constraints, not using all features, switching to competitor..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            rows={4}
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum 10 characters ({reason.length}/10)
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || reason.trim().length < 10}
            className="flex-1 px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Downgrade'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DowngradeModal;

