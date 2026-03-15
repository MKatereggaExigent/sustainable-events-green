import React, { useState } from 'react';
import { BookOpen, HelpCircle } from 'lucide-react';
import Glossary from './Glossary';

interface GlossaryButtonProps {
  variant?: 'button' | 'icon' | 'inline';
  initialFilter?: 'calculator' | 'recommendation' | 'metrics' | 'general' | 'all';
  className?: string;
}

const GlossaryButton: React.FC<GlossaryButtonProps> = ({ 
  variant = 'button', 
  initialFilter = 'all',
  className = '' 
}) => {
  const [showGlossary, setShowGlossary] = useState(false);

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={() => setShowGlossary(true)}
          className={`p-2 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors ${className}`}
          title="View Glossary"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {showGlossary && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Glossary onClose={() => setShowGlossary(false)} initialFilter={initialFilter} />
          </div>
        )}
      </>
    );
  }

  if (variant === 'inline') {
    return (
      <>
        <button
          onClick={() => setShowGlossary(true)}
          className={`inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium ${className}`}
        >
          <BookOpen className="w-4 h-4" />
          View Glossary
        </button>

        {showGlossary && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Glossary onClose={() => setShowGlossary(false)} initialFilter={initialFilter} />
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowGlossary(true)}
        className={`flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-md ${className}`}
      >
        <BookOpen className="w-5 h-5" />
        <span className="font-medium">Glossary</span>
      </button>

      {showGlossary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Glossary onClose={() => setShowGlossary(false)} initialFilter={initialFilter} />
        </div>
      )}
    </>
  );
};

export default GlossaryButton;

