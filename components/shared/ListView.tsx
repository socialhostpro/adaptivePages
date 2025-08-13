/**
 * ListView Component - Generic list with optional avatars/icons
 * Part of the AdaptivePages Shared Component System
 */

import React, { useState, useCallback } from 'react';

// Types
export interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  avatar?: string;
  icon?: React.ReactNode;
  badge?: {
    text: string;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  };
  metadata?: Array<{
    label: string;
    value: string;
  }>;
  actions?: Array<{
    label: string;
    icon?: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
  href?: string;
  disabled?: boolean;
}

export interface ListViewProps {
  // Data
  items: ListItem[];
  
  // Layout
  variant?: 'default' | 'compact' | 'detailed';
  size?: 'small' | 'medium' | 'large';
  divided?: boolean;
  selectable?: boolean;
  
  // Selection
  selectedItems?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  
  // Events
  onItemClick?: (item: ListItem) => void;
  
  // States
  loading?: boolean;
  empty?: {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  
  // Styling
  className?: string;
  
  // AI Integration
  aiAgentId?: string;
}

export function ListView({
  items,
  variant = 'default',
  size = 'medium',
  divided = true,
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  onItemClick,
  loading = false,
  empty,
  className = '',
  aiAgentId
}: ListViewProps) {
  const [localSelectedItems, setLocalSelectedItems] = useState<string[]>(selectedItems);

  // Handle selection
  const handleItemSelection = useCallback((itemId: string, checked: boolean) => {
    const newSelection = checked
      ? [...localSelectedItems, itemId]
      : localSelectedItems.filter(id => id !== itemId);
    
    setLocalSelectedItems(newSelection);
    onSelectionChange?.(newSelection);
  }, [localSelectedItems, onSelectionChange]);

  const handleSelectAll = useCallback((checked: boolean) => {
    const newSelection = checked ? items.map(item => item.id) : [];
    setLocalSelectedItems(newSelection);
    onSelectionChange?.(newSelection);
  }, [items, onSelectionChange]);

  // Size classes
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const paddingClasses = {
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6'
  };

  const avatarSizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12'
  };

  // Badge styles
  const getBadgeClasses = (variant: string = 'primary') => {
    const variants = {
      primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      danger: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    return variants[variant as keyof typeof variants] || variants.primary;
  };

  const isAllSelected = localSelectedItems.length === items.length && items.length > 0;
  const isIndeterminate = localSelectedItems.length > 0 && localSelectedItems.length < items.length;

  if (loading) {
    return (
      <div className={`list-view ${className} ${sizeClasses[size]}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (items.length === 0 && empty) {
    return (
      <div className={`list-view ${className} ${sizeClasses[size]}`}>
        <div className="text-center py-12">
          {empty.icon && (
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 text-gray-400">
                {empty.icon}
              </div>
            </div>
          )}
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {empty.title}
          </h3>
          {empty.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              {empty.description}
            </p>
          )}
          {empty.action && (
            <button
              onClick={empty.action.onClick}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {empty.action.label}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`list-view ${className} ${sizeClasses[size]}`}>
      {/* Selection Header */}
      {selectable && (
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={(input) => {
                if (input) input.indeterminate = isIndeterminate;
              }}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              aria-label="Select all items"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {localSelectedItems.length > 0 
                ? `${localSelectedItems.length} selected`
                : 'Select all'
              }
            </span>
          </div>
          {localSelectedItems.length > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleSelectAll(false)}
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* List Items */}
      <div className={`bg-white dark:bg-gray-900 ${divided ? 'divide-y divide-gray-200 dark:divide-gray-700' : ''}`}>
        {items.map((item, index) => {
          const isSelected = localSelectedItems.includes(item.id);
          const isClickable = !!(onItemClick || item.href);
          
          const ItemWrapper = item.href ? 'a' : 'div';
          const wrapperProps = item.href 
            ? { href: item.href, target: '_blank', rel: 'noopener noreferrer' }
            : {};

          return (
            <ItemWrapper
              key={item.id}
              {...wrapperProps}
              className={`${paddingClasses[size]} flex items-center space-x-4 ${
                isClickable && !item.disabled ? 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer' : ''
              } ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''} ${
                item.disabled ? 'opacity-50 cursor-not-allowed' : ''
              } transition-colors duration-150`}
              onClick={!item.disabled && onItemClick ? () => onItemClick(item) : undefined}
            >
              {/* Selection Checkbox */}
              {selectable && (
                <div className="flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleItemSelection(item.id, e.target.checked);
                    }}
                    disabled={item.disabled}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    aria-label={`Select ${item.title}`}
                  />
                </div>
              )}

              {/* Avatar or Icon */}
              <div className="flex-shrink-0">
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt={`${item.title} avatar`}
                    className={`${avatarSizeClasses[size]} rounded-full object-cover`}
                  />
                ) : item.icon ? (
                  <div className={`${avatarSizeClasses[size]} flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400`}>
                    {item.icon}
                  </div>
                ) : (
                  <div className={`${avatarSizeClasses[size]} rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium`}>
                    {item.title.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.title}
                      </h3>
                      {item.badge && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getBadgeClasses(item.badge.variant)}`}>
                          {item.badge.text}
                        </span>
                      )}
                    </div>
                    
                    {item.subtitle && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {item.subtitle}
                      </p>
                    )}
                    
                    {variant === 'detailed' && item.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    
                    {item.metadata && item.metadata.length > 0 && (
                      <div className="flex items-center space-x-4 mt-2">
                        {item.metadata.map((meta, metaIndex) => (
                          <div key={metaIndex} className="text-xs text-gray-500 dark:text-gray-500">
                            <span className="font-medium">{meta.label}:</span> {meta.value}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {item.actions && item.actions.length > 0 && (
                    <div className="flex-shrink-0 flex items-center space-x-1 ml-4">
                      {item.actions.map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick();
                          }}
                          disabled={item.disabled}
                          className={`p-2 rounded-md text-sm transition-colors ${
                            action.variant === 'danger'
                              ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                              : action.variant === 'primary'
                              ? 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20'
                              : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          title={action.label}
                        >
                          {action.icon || action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ItemWrapper>
          );
        })}
      </div>
    </div>
  );
}

// Specialized list variants
export interface ContactListProps {
  contacts: Array<{
    id: string;
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;
    company?: string;
    role?: string;
    status?: 'online' | 'offline' | 'away';
  }>;
  onContactClick?: (contact: any) => void;
  selectable?: boolean;
}

export function ContactList({ contacts, onContactClick, selectable = false }: ContactListProps) {
  const items: ListItem[] = contacts.map(contact => ({
    id: contact.id,
    title: contact.name,
    subtitle: contact.email,
    description: contact.company ? `${contact.role || 'Contact'} at ${contact.company}` : contact.role,
    avatar: contact.avatar,
    badge: contact.status ? {
      text: contact.status,
      variant: contact.status === 'online' ? 'success' : contact.status === 'away' ? 'warning' : 'secondary'
    } : undefined,
    metadata: [
      ...(contact.phone ? [{ label: 'Phone', value: contact.phone }] : []),
      ...(contact.company ? [{ label: 'Company', value: contact.company }] : [])
    ].slice(0, 2) // Limit to 2 metadata items
  }));

  return (
    <ListView
      items={items}
      variant="detailed"
      selectable={selectable}
      onItemClick={onContactClick}
      empty={{
        title: 'No contacts found',
        description: 'Add some contacts to get started',
        icon: <span className="text-4xl">👥</span>
      }}
    />
  );
}
