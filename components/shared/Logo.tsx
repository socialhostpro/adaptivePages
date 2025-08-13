import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'auto';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md', 
  variant = 'auto',
  showText = true 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl', 
    xl: 'text-3xl'
  };

  // For now, using a simple SVG logo with adaptive colors
  // You can replace this with your actual logo images
  const getLogoColors = () => {
    if (variant === 'light') {
      return {
        primary: '#4F46E5', // Indigo
        secondary: '#6366F1'
      };
    } else if (variant === 'dark') {
      return {
        primary: '#A5B4FC', // Light indigo
        secondary: '#C7D2FE'
      };
    } else {
      // Auto mode - adapts to theme
      return {
        primary: 'currentColor',
        secondary: 'currentColor'
      };
    }
  };

  const colors = getLogoColors();

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo SVG */}
      <div className={`${sizeClasses[size]} flex-shrink-0`}>
        <svg 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={`w-full h-full ${variant === 'auto' ? 'text-indigo-600 dark:text-indigo-400' : ''}`}
        >
          {/* Background circle */}
          <circle 
            cx="16" 
            cy="16" 
            r="14" 
            fill={colors.primary}
            fillOpacity="0.1"
            stroke={colors.primary}
            strokeWidth="2"
          />
          
          {/* Letter "A" for AdaptivePages */}
          <path 
            d="M16 6L12 22H14.5L15.2 19.5H16.8L17.5 22H20L16 6ZM15.5 17L16 14.5L16.5 17H15.5Z" 
            fill={colors.primary}
          />
          
          {/* Decorative elements */}
          <circle cx="10" cy="12" r="1.5" fill={colors.secondary} fillOpacity="0.6" />
          <circle cx="22" cy="12" r="1.5" fill={colors.secondary} fillOpacity="0.6" />
          <circle cx="10" cy="20" r="1.5" fill={colors.secondary} fillOpacity="0.6" />
          <circle cx="22" cy="20" r="1.5" fill={colors.secondary} fillOpacity="0.6" />
        </svg>
      </div>

      {/* Logo Text */}
      {showText && (
        <span className={`font-bold ${textSizeClasses[size]} ${
          variant === 'auto' 
            ? 'text-gray-900 dark:text-white' 
            : variant === 'light' 
              ? 'text-gray-900' 
              : 'text-white'
        }`}>
          AdaptivePages
        </span>
      )}
    </div>
  );
};

export default Logo;
