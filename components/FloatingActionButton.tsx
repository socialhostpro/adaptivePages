import React from 'react';

interface FloatingActionButtonProps {
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  'aria-label'?: string;
  variant?: 'default' | 'sparkles' | 'settings' | 'close';
  children?: React.ReactNode;
}

export function FloatingActionButton({ 
  onClick, 
  size = 'md', 
  className = '', 
  'aria-label': ariaLabel = 'Floating action button',
  variant = 'default',
  children
}: FloatingActionButtonProps) {
  const sizeMap = {
    sm: { width: 60, height: 60, radius: 30, iconScale: 0.6 },
    md: { width: 80, height: 80, radius: 40, iconScale: 0.8 },
    lg: { width: 100, height: 100, radius: 50, iconScale: 1.0 }
  };

  const { width, height, radius, iconScale } = sizeMap[size];
  const centerX = width / 2;
  const centerY = height / 2;

  // Render custom icon based on variant
  const renderIcon = () => {
    if (children) {
      return (
        <foreignObject x={centerX - (20 * iconScale)} y={centerY - (20 * iconScale)} width={40 * iconScale} height={40 * iconScale}>
          <div className="flex items-center justify-center w-full h-full text-white">
            {children}
          </div>
        </foreignObject>
      );
    }

    switch (variant) {
      case 'sparkles':
        return (
          <g fill="white">
            <circle cx={centerX - (15 * iconScale)} cy={centerY - (15 * iconScale)} r={2 * iconScale} />
            <circle cx={centerX + (12 * iconScale)} cy={centerY - (18 * iconScale)} r={1.5 * iconScale} />
            <circle cx={centerX + (18 * iconScale)} cy={centerY + (10 * iconScale)} r={2.5 * iconScale} />
            <circle cx={centerX - (20 * iconScale)} cy={centerY + (15 * iconScale)} r={1.8 * iconScale} />
            <polygon points={`${centerX},${centerY - (8 * iconScale)} ${centerX + (3 * iconScale)},${centerY + (2 * iconScale)} ${centerX},${centerY + (8 * iconScale)} ${centerX - (3 * iconScale)},${centerY + (2 * iconScale)}`} />
          </g>
        );
      
      case 'settings':
        return (
          <g fill="white" stroke="white" strokeWidth={1.5 * iconScale}>
            <circle cx={centerX} cy={centerY} r={8 * iconScale} fill="none" />
            <circle cx={centerX} cy={centerY} r={3 * iconScale} />
            <line x1={centerX} y1={centerY - (20 * iconScale)} x2={centerX} y2={centerY - (14 * iconScale)} />
            <line x1={centerX + (17 * iconScale)} y1={centerY - (10 * iconScale)} x2={centerX + (12 * iconScale)} y2={centerY - (7 * iconScale)} />
            <line x1={centerX + (17 * iconScale)} y1={centerY + (10 * iconScale)} x2={centerX + (12 * iconScale)} y2={centerY + (7 * iconScale)} />
            <line x1={centerX} y1={centerY + (20 * iconScale)} x2={centerX} y2={centerY + (14 * iconScale)} />
            <line x1={centerX - (17 * iconScale)} y1={centerY + (10 * iconScale)} x2={centerX - (12 * iconScale)} y2={centerY + (7 * iconScale)} />
            <line x1={centerX - (17 * iconScale)} y1={centerY - (10 * iconScale)} x2={centerX - (12 * iconScale)} y2={centerY - (7 * iconScale)} />
          </g>
        );

      case 'close':
        return (
          <g stroke="white" strokeWidth={6 * iconScale} strokeLinecap="round">
            <line x1={centerX - (15 * iconScale)} y1={centerY - (15 * iconScale)} x2={centerX + (15 * iconScale)} y2={centerY + (15 * iconScale)} />
            <line x1={centerX + (15 * iconScale)} y1={centerY - (15 * iconScale)} x2={centerX - (15 * iconScale)} y2={centerY + (15 * iconScale)} />
          </g>
        );

      default: // Plus icon
        return (
          <g stroke="white" strokeWidth={8 * iconScale} strokeLinecap="round">
            <line x1={centerX - (25 * iconScale)} y1={centerY} x2={centerX + (25 * iconScale)} y2={centerY} />
            <line x1={centerX} y1={centerY - (25 * iconScale)} x2={centerX} y2={centerY + (25 * iconScale)} />
          </g>
        );
    }
  };

  return (
    <button
      onClick={onClick}
      className={`relative transition-transform duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800 rounded-full ${className}`}
      data-size={size}
      aria-label={ariaLabel}
    >
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        width={width} 
        height={height}
        className="drop-shadow-lg"
      >
        <defs>
          <filter id={`shadow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation={size === 'sm' ? "8" : size === 'md' ? "12" : "15"}/>
            <feOffset dx="0" dy={size === 'sm' ? "8" : size === 'md' ? "12" : "20"} result="offsetblur"/>
            <feFlood floodColor="#000" floodOpacity="0.3"/>
            <feComposite in2="offsetblur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <linearGradient id={`buttonGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#66BB6A" stopOpacity={1} />
            <stop offset="100%" stopColor="#4CAF50" stopOpacity={1} />
          </linearGradient>
        </defs>

        {/* Main button circle with gradient */}
        <circle 
          cx={centerX} 
          cy={centerY} 
          r={radius} 
          fill={`url(#buttonGradient-${size})`} 
          filter={`url(#shadow-${size})`}
          className="transition-all duration-200"
        />

        {/* Plus sign icon inside the button */}
        {renderIcon()}

        {/* Subtle reflections/highlights for depth */}
        <circle 
          cx={centerX - (15 * iconScale)} 
          cy={centerY - (15 * iconScale)} 
          r={15 * iconScale} 
          fill="white" 
          opacity="0.25"
        />
        <circle 
          cx={centerX + (12 * iconScale)} 
          cy={centerY + (12 * iconScale)} 
          r={8 * iconScale} 
          fill="white" 
          opacity="0.15"
        />

        {/* Additional rim highlight for polish */}
        <circle 
          cx={centerX} 
          cy={centerY} 
          r={radius - 2} 
          fill="none" 
          stroke="white" 
          strokeWidth="1" 
          opacity="0.2"
        />
      </svg>
    </button>
  );
}

export default FloatingActionButton;
