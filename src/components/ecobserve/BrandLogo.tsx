import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'white' | 'gradient';
  className?: string;
}

/**
 * EcobServe Brand Logo Component
 * 
 * The name combines three concepts:
 * - Eco: Eco-friendly, environmental sustainability
 * - b: (subtle) hints at "observe" - Observability of environmental impact
 * - Serve: Service-oriented platform for event planning
 * 
 * The "b" is styled to be faint/italic to emphasize the connection between
 * Eco and Serve while maintaining the observability aspect.
 */
const BrandLogo: React.FC<BrandLogoProps> = ({ 
  size = 'md', 
  variant = 'default',
  className = '' 
}) => {
  // Slightly smaller font sizes to give more space next to navigation
  const sizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  const variantClasses = {
    default: 'text-gray-900',
    white: 'text-white',
    gradient: 'bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent',
  };

  // Navy/pastel blue color for the "b" to emphasize observability
  const bVariantClasses = {
    default: 'text-blue-400',
    white: 'text-blue-300/70',
    gradient: 'text-blue-500',
  };

  return (
    <span className={`font-bold ${sizeClasses[size]} ${className}`}>
      <span className={variantClasses[variant]}>Eco</span>
      <span
        className={`italic font-light opacity-70 ${bVariantClasses[variant]}`}
      >
        b
      </span>
      <span className={variantClasses[variant]}>Serve</span>
    </span>
  );
};

/**
 * Returns the brand name as a plain string for contexts where 
 * React components can't be used (e.g., meta tags, certificates, etc.)
 */
export const getBrandName = (): string => 'EcobServe';

/**
 * Returns brand name for file names (lowercase, no special formatting)
 */
export const getBrandNameForFile = (): string => 'ecobserve';

export default BrandLogo;

