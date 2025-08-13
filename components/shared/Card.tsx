/**
 * Card Component - Standard card wrapper for widgets and content
 * Part of the AdaptivePages Shared Component System
 */

import React from 'react';

// Types
export interface CardProps {
  // Content
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  
  // Header actions
  headerActions?: React.ReactNode;
  icon?: React.ReactNode;
  
  // Layout
  variant?: 'default' | 'bordered' | 'shadow' | 'flat';
  size?: 'small' | 'medium' | 'large';
  padding?: 'none' | 'small' | 'medium' | 'large';
  
  // States
  loading?: boolean;
  disabled?: boolean;
  hoverable?: boolean;
  clickable?: boolean;
  
  // Styling
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  
  // Events
  onClick?: () => void;
  
  // AI Integration
  aiAgentId?: string;
  aiCommands?: {
    expand?: string;
    collapse?: string;
    refresh?: string;
  };
}

export function Card({
  title,
  subtitle,
  children,
  headerActions,
  icon,
  variant = 'default',
  size = 'medium',
  padding = 'medium',
  loading = false,
  disabled = false,
  hoverable = false,
  clickable = false,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  onClick,
  aiAgentId,
  aiCommands
}: CardProps) {
  
  // Variant styles
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    bordered: 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600',
    shadow: 'bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700',
    flat: 'bg-gray-50 dark:bg-gray-900'
  };

  // Size styles
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  // Padding styles
  const paddingClasses = {
    none: '',
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6'
  };

  const headerPaddingClasses = {
    none: '',
    small: 'px-3 pt-3',
    medium: 'px-4 pt-4',
    large: 'px-6 pt-6'
  };

  const bodyPaddingClasses = {
    none: '',
    small: 'px-3 pb-3',
    medium: 'px-4 pb-4',
    large: 'px-6 pb-6'
  };

  // Interactive styles
  const interactiveClasses = [
    hoverable && 'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200',
    clickable && 'cursor-pointer',
    disabled && 'opacity-50 cursor-not-allowed'
  ].filter(Boolean).join(' ');

  const hasHeader = title || subtitle || headerActions || icon;

  return (
    <div
      className={`card rounded-lg ${variantClasses[variant]} ${sizeClasses[size]} ${interactiveClasses} ${className}`}
      onClick={clickable && !disabled ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable && !disabled ? 0 : undefined}
      onKeyDown={clickable && !disabled ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
    >
      {hasHeader && (
        <div className={`card-header ${headerPaddingClasses[padding]} ${title && subtitle ? 'pb-2' : 'pb-0'} ${headerClassName}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {icon && (
                <div className="flex-shrink-0 mt-1">
                  {icon}
                </div>
              )}
              <div className="min-w-0 flex-1">
                {title && (
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {headerActions && (
              <div className="flex-shrink-0">
                {headerActions}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className={`card-body ${bodyPaddingClasses[padding]} ${bodyClassName} overflow-hidden`}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

// Specialized card variants
export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  color = 'blue',
  size = 'medium',
  onClick
}: StatCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    green: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    red: 'text-red-600 bg-red-50 dark:bg-red-900/20',
    yellow: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
    purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
    gray: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'
  };

  const iconSizes = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-10 h-10'
  };

  const valueSizes = {
    small: 'text-2xl',
    medium: 'text-3xl',
    large: 'text-4xl'
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '→';
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card
      variant="shadow"
      hoverable={!!onClick}
      clickable={!!onClick}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className={`${valueSizes[size]} font-bold text-gray-900 dark:text-white`}>
            {value}
          </p>
          {trend && (
            <div className={`flex items-center space-x-1 mt-2 text-sm ${getTrendColor(trend.direction)}`}>
              <span>{getTrendIcon(trend.direction)}</span>
              <span>{Math.abs(trend.value)}%</span>
              {trend.label && <span className="text-gray-500">({trend.label})</span>}
            </div>
          )}
        </div>
        {icon && (
          <div className={`flex-shrink-0 p-3 rounded-lg ${colorClasses[color]}`}>
            <div className={iconSizes[size]}>
              {icon}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// Image card variant
export interface ImageCardProps {
  title: string;
  description?: string;
  imageUrl: string;
  imageAlt?: string;
  actions?: React.ReactNode;
  aspectRatio?: 'square' | 'video' | 'wide';
  onClick?: () => void;
}

export function ImageCard({
  title,
  description,
  imageUrl,
  imageAlt,
  actions,
  aspectRatio = 'video',
  onClick
}: ImageCardProps) {
  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]'
  };

  return (
    <Card
      variant="shadow"
      padding="none"
      hoverable={!!onClick}
      clickable={!!onClick}
      onClick={onClick}
    >
      <div className={`${aspectRatioClasses[aspectRatio]} overflow-hidden rounded-t-lg`}>
        <img
          src={imageUrl}
          alt={imageAlt || title}
          className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {description}
          </p>
        )}
        {actions && (
          <div className="flex items-center justify-between">
            {actions}
          </div>
        )}
      </div>
    </Card>
  );
}
