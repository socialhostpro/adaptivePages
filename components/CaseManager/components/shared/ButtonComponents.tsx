/**
 * Button Components - Phase 2 of Shared Component System
 * Includes Button, IconButton, ButtonGroup, and DropdownButton
 */
import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { ButtonProps, ButtonGroupProps, DropdownButtonProps, DropdownItem } from './types';
import { 
  cn, 
  getVariantClasses, 
  getOutlineVariantClasses, 
  getGhostVariantClasses,
  getFocusRingClasses,
  getButtonSizeClasses,
  isDarkMode 
} from './utils';
import { baseComponentClasses, ColorVariant } from './themes';

/**
 * Primary Button Component
 * Supports multiple variants, sizes, and states with full dark mode support
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  styleVariant = 'solid',
  type = 'button',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  onClick,
  theme,
  'aria-label': ariaLabel,
  'data-testid': testId,
  ...props
}, ref) => {
  const isDark = isDarkMode(theme);
  
  // Base button classes
  const baseClasses = cn(
    'inline-flex items-center justify-center font-medium rounded-md',
    'transition-all duration-200 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    baseComponentClasses.base,
    getFocusRingClasses(variant as ColorVariant),
    getButtonSizeClasses(size as 'xs' | 'sm' | 'md' | 'lg')
  );
  
  // Variant-specific classes
  let variantClasses = '';
  switch (styleVariant) {
    case 'solid':
      variantClasses = getVariantClasses(variant as ColorVariant, isDark);
      break;
    case 'outline':
      variantClasses = cn(
        'border',
        getOutlineVariantClasses(variant as ColorVariant, isDark),
        'bg-transparent'
      );
      break;
    case 'ghost':
      variantClasses = cn(
        getGhostVariantClasses(variant as ColorVariant, isDark),
        'bg-transparent border-transparent'
      );
      break;
    case 'link':
      variantClasses = cn(
        getGhostVariantClasses(variant as ColorVariant, isDark),
        'bg-transparent border-none underline-offset-4 hover:underline p-0'
      );
      break;
  }
  
  // State classes
  const stateClasses = cn({
    [baseComponentClasses.disabled]: disabled,
    [baseComponentClasses.loading]: loading,
    'w-full': fullWidth
  });
  
  // Cursor classes based on state
  const cursorClass = loading ? 'cursor-wait' : disabled ? 'cursor-not-allowed' : '';
  
  const buttonClasses = cn(
    baseClasses,
    variantClasses,
    stateClasses,
    cursorClass,
    className
  );
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    onClick?.(event);
  };
  
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      aria-label={ariaLabel}
      data-testid={testId}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="mr-2">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="ml-2">{icon}</span>
          )}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

/**
 * Icon Button - Button with icon only
 */
export const IconButton = forwardRef<HTMLButtonElement, ButtonProps>(({
  icon,
  'aria-label': ariaLabel,
  size = 'md',
  styleVariant = 'ghost',
  className,
  ...props
}, ref) => {
  const iconSizeClasses = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };
  
  return (
    <Button
      ref={ref}
      className={cn('rounded-md', iconSizeClasses[size as keyof typeof iconSizeClasses], className)}
      styleVariant={styleVariant}
      size={size}
      aria-label={ariaLabel || 'Icon button'}
      {...props}
    >
      {icon}
    </Button>
  );
});

IconButton.displayName = 'IconButton';

/**
 * Button Group - Container for grouped buttons
 */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(({
  children,
  className,
  orientation = 'horizontal',
  connected = false,
  size = 'md',
  'data-testid': testId,
  ...props
}, ref) => {
  const groupClasses = cn(
    'inline-flex',
    {
      'flex-row': orientation === 'horizontal',
      'flex-col': orientation === 'vertical',
      'divide-x divide-gray-300 dark:divide-slate-600': connected && orientation === 'horizontal',
      'divide-y divide-gray-300 dark:divide-slate-600': connected && orientation === 'vertical',
      'space-x-1': !connected && orientation === 'horizontal',
      'space-y-1': !connected && orientation === 'vertical'
    },
    className
  );
  
  // Clone children to apply group styling
  const enhancedChildren = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child) && child.type === Button) {
      const isFirst = index === 0;
      const isLast = index === React.Children.count(children) - 1;
      
      if (connected) {
        const roundedClasses = orientation === 'horizontal' 
          ? cn({
              'rounded-l-md rounded-r-none': isFirst,
              'rounded-none': !isFirst && !isLast,
              'rounded-r-md rounded-l-none': isLast,
              'rounded-md': isFirst && isLast
            })
          : cn({
              'rounded-t-md rounded-b-none': isFirst,
              'rounded-none': !isFirst && !isLast,
              'rounded-b-md rounded-t-none': isLast,
              'rounded-md': isFirst && isLast
            });
        
        return React.cloneElement(child, {
          ...child.props,
          size,
          className: cn(child.props.className, roundedClasses)
        });
      }
      
      return React.cloneElement(child, {
        ...child.props,
        size
      });
    }
    
    return child;
  });
  
  return (
    <div
      ref={ref}
      className={groupClasses}
      data-testid={testId}
      {...props}
    >
      {enhancedChildren}
    </div>
  );
});

ButtonGroup.displayName = 'ButtonGroup';

/**
 * Dropdown Button - Button with dropdown menu
 */
export const DropdownButton = forwardRef<HTMLButtonElement, DropdownButtonProps>(({
  children,
  items,
  placement = 'bottom-start',
  showArrow = true,
  open: controlledOpen,
  onOpenChange,
  className,
  disabled,
  ...props
}, ref) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  
  const handleToggle = () => {
    const newOpen = !isOpen;
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };
  
  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;
    
    item.onClick?.();
    
    // Close dropdown after item click
    if (controlledOpen === undefined) {
      setInternalOpen(false);
    }
    onOpenChange?.(false);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (controlledOpen === undefined) {
          setInternalOpen(false);
        }
        onOpenChange?.(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [controlledOpen, onOpenChange]);
  
  const placementClasses = {
    'bottom-start': 'top-full left-0 mt-1',
    'bottom-end': 'top-full right-0 mt-1',
    'top-start': 'bottom-full left-0 mb-1',
    'top-end': 'bottom-full right-0 mb-1'
  };
  
  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <Button
        ref={ref}
        className={cn('', className)}
        onClick={handleToggle}
        disabled={disabled}
        icon={showArrow ? (
          <svg
            className={cn("ml-1 h-4 w-4 transition-transform", {
              "rotate-180": isOpen
            })}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        ) : undefined}
        iconPosition="right"
        {...props}
      >
        {children}
      </Button>
      
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 min-w-48 py-1',
            'bg-white dark:bg-slate-800',
            'border border-gray-300 dark:border-slate-600',
            'rounded-md shadow-lg',
            'focus:outline-none',
            placementClasses[placement]
          )}
        >
          {items.map((item, index) => (
            <React.Fragment key={item.key}>
              <button
                className={cn(
                  'w-full px-4 py-2 text-left text-sm',
                  'hover:bg-gray-50 dark:hover:bg-slate-700',
                  'focus:bg-gray-50 dark:focus:bg-slate-700',
                  'focus:outline-none',
                  'flex items-center',
                  {
                    'text-gray-400 dark:text-slate-500 cursor-not-allowed': item.disabled,
                    'text-gray-900 dark:text-white': !item.disabled
                  }
                )}
                disabled={item.disabled}
                onClick={() => handleItemClick(item)}
              >
                {item.icon && (
                  <span className="mr-2 flex-shrink-0">{item.icon}</span>
                )}
                {item.label}
              </button>
              {item.divider && index < items.length - 1 && (
                <div className="my-1 border-t border-gray-300 dark:border-slate-600" />
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
});

DropdownButton.displayName = 'DropdownButton';
