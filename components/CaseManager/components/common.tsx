import React from 'react';
import { STATUS_COLORS } from '../types';

interface StatusBadgeProps {
  status: string;
  type: 'case' | 'task' | 'docket' | 'billing' | 'priority' | 'document';
  className?: string;
}

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const colorClass = STATUS_COLORS[type]?.[status as keyof typeof STATUS_COLORS[typeof type]] || 
                     'bg-gray-100 text-gray-800';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className || ''}`}
    >
      {status}
    </span>
  );
}

interface PermissionGateProps {
  permission: string;
  userRole: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  tooltip?: string;
}

export function PermissionGate({ 
  permission, 
  userRole, 
  children, 
  fallback = null,
  tooltip 
}: PermissionGateProps) {
  // This would use your actual permission checking logic
  const hasPermission = true; // Replace with actual permission check
  
  if (!hasPermission) {
    return fallback;
  }
  
  return <>{children}</>;
}

interface CurrencyDisplayProps {
  amount: number;
  currency?: string;
  className?: string;
}

export function CurrencyDisplay({ 
  amount, 
  currency = 'USD', 
  className 
}: CurrencyDisplayProps) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  });

  return (
    <span className={className}>
      {formatter.format(amount)}
    </span>
  );
}

interface DateDisplayProps {
  date: string;
  format?: 'short' | 'long' | 'time';
  className?: string;
}

export function DateDisplay({ 
  date, 
  format = 'short', 
  className 
}: DateDisplayProps) {
  const dateObj = new Date(date);
  let formatted: string;

  switch (format) {
    case 'long':
      formatted = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      break;
    case 'time':
      formatted = dateObj.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      break;
    default:
      formatted = dateObj.toLocaleDateString('en-US');
  }

  return (
    <span className={className} title={dateObj.toISOString()}>
      {formatted}
    </span>
  );
}
