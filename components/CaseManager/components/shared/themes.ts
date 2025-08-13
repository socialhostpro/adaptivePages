/**
 * Theme System - Color Palette and Design Tokens
 * Supports light and dark mode with consistent styling
 */

export const colors = {
  // Light mode colors
  light: {
    primary: 'blue-600',
    primaryHover: 'blue-700',
    primaryFocus: 'blue-500',
    secondary: 'gray-600',
    secondaryHover: 'gray-700',
    secondaryFocus: 'gray-500',
    success: 'green-600',
    successHover: 'green-700',
    successFocus: 'green-500',
    warning: 'yellow-600',
    warningHover: 'yellow-700',
    warningFocus: 'yellow-500',
    danger: 'red-600',
    dangerHover: 'red-700',
    dangerFocus: 'red-500',
    background: 'white',
    surface: 'gray-50',
    surfaceHover: 'gray-100',
    text: 'gray-900',
    textMuted: 'gray-500',
    textLight: 'gray-600',
    border: 'gray-300',
    borderHover: 'gray-400',
    borderFocus: 'blue-500',
    shadow: 'shadow-sm',
    shadowLg: 'shadow-lg'
  },
  // Dark mode colors
  dark: {
    primary: 'blue-500',
    primaryHover: 'blue-400',
    primaryFocus: 'blue-600',
    secondary: 'slate-400',
    secondaryHover: 'slate-300',
    secondaryFocus: 'slate-500',
    success: 'green-500',
    successHover: 'green-400',
    successFocus: 'green-600',
    warning: 'yellow-500',
    warningHover: 'yellow-400',
    warningFocus: 'yellow-600',
    danger: 'red-500',
    dangerHover: 'red-400',
    dangerFocus: 'red-600',
    background: 'slate-900',
    surface: 'slate-800',
    surfaceHover: 'slate-700',
    text: 'white',
    textMuted: 'slate-400',
    textLight: 'slate-300',
    border: 'slate-600',
    borderHover: 'slate-500',
    borderFocus: 'blue-400',
    shadow: 'shadow-sm',
    shadowLg: 'shadow-lg'
  }
} as const;

export const typography = {
  xs: 'text-xs',     // 12px
  sm: 'text-sm',     // 14px
  base: 'text-base', // 16px
  lg: 'text-lg',     // 18px
  xl: 'text-xl',     // 20px
  '2xl': 'text-2xl', // 24px
  '3xl': 'text-3xl'  // 30px
} as const;

export const spacing = {
  xs: 'p-1',      // 4px
  sm: 'p-2',      // 8px
  md: 'p-3',      // 12px
  lg: 'p-4',      // 16px
  xl: 'p-6',      // 24px
  '2xl': 'p-8'    // 32px
} as const;

export const borderRadius = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full'
} as const;

// Common class combinations for components
export const baseComponentClasses = {
  // Base classes for all interactive components
  base: 'transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
  
  // Dark mode support base
  darkMode: 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600',
  
  // Disabled state
  disabled: 'opacity-50 cursor-not-allowed',
  
  // Loading state
  loading: 'cursor-wait',
  
  // Focus ring colors
  focusRing: {
    primary: 'focus:ring-blue-500 dark:focus:ring-blue-400',
    secondary: 'focus:ring-gray-500 dark:focus:ring-slate-400',
    success: 'focus:ring-green-500 dark:focus:ring-green-400',
    warning: 'focus:ring-yellow-500 dark:focus:ring-yellow-400',
    danger: 'focus:ring-red-500 dark:focus:ring-red-400'
  }
} as const;

export type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type ThemeMode = 'light' | 'dark' | 'auto';
