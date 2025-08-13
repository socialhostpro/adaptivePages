/**
 * Mobile Navigation and Search Components
 * Mobile-optimized navigation with search and filtering capabilities
 * Part of Phase 3: Navigation Components
 */
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from './utils';
import { NavigationItem, SearchResult, FilterOption, BaseComponentProps } from './types';
import { Button } from './ButtonComponents';

// ===== MOBILE NAVIGATION =====

export interface MobileNavigationProps extends BaseComponentProps {
  /** Navigation items */
  items: NavigationItem[];
  
  /** Brand configuration */
  brand?: {
    name: string;
    logo?: string | React.ReactNode;
    href?: string;
  };
  
  /** User menu items */
  userMenu?: NavigationItem[];
  
  /** Current active path */
  activePath?: string;
  
  /** Open state */
  isOpen?: boolean;
  
  /** Open/close handler */
  onToggle?: () => void;
  
  /** Close handler */
  onClose?: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  items,
  brand,
  userMenu,
  activePath,
  isOpen = false,
  onToggle,
  onClose,
  className,
  ...props
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemClick = (item: NavigationItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      window.location.href = item.href;
    }
    
    // Close mobile menu after navigation
    if (onClose) {
      onClose();
    }
  };

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const isActive = activePath === item.href || item.active;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);

    return (
      <div key={item.id} className={cn(level > 0 && 'ml-4')}>
        <button
          onClick={() => hasChildren ? toggleExpanded(item.id) : handleItemClick(item)}
          disabled={item.disabled}
          className={cn(
            'flex items-center justify-between w-full px-4 py-3 text-left text-base font-medium rounded-lg transition-colors',
            isActive
              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
            item.disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="flex items-center">
            {item.icon && (
              <span className="mr-3 text-lg">
                {typeof item.icon === 'string' ? (
                  <i className={item.icon} />
                ) : (
                  item.icon
                )}
              </span>
            )}
            <span>{item.label}</span>
            {item.badge && (
              <span className={cn(
                'ml-2 px-2 py-0.5 text-xs rounded-full',
                item.badgeVariant === 'primary' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                item.badgeVariant === 'success' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                item.badgeVariant === 'warning' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                item.badgeVariant === 'danger' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                !item.badgeVariant && 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              )}>
                {item.badge}
              </span>
            )}
          </div>
          
          {hasChildren && (
            <svg
              className={cn('w-5 h-5 transition-transform', isExpanded && 'rotate-90')}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        
        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-2">
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="md"
        onClick={onToggle}
        className="lg:hidden"
        aria-label="Toggle mobile menu"
        aria-expanded={isOpen}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-80 max-w-sm bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          className
        )}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {brand && (
            <div className="flex items-center">
              {brand.logo && (
                <div className="flex-shrink-0 mr-3">
                  {typeof brand.logo === 'string' ? (
                    <img src={brand.logo} alt={brand.name} className="h-8 w-8" />
                  ) : (
                    brand.logo
                  )}
                </div>
              )}
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {brand.name}
              </span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close mobile menu"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-2">
            {items.map(item => renderNavigationItem(item))}
          </div>
        </nav>

        {/* User Menu */}
        {userMenu && userMenu.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="space-y-2">
              {userMenu.map(item => renderNavigationItem(item))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// ===== SEARCH COMPONENT =====

export interface SearchProps extends BaseComponentProps {
  /** Search placeholder */
  placeholder?: string;
  
  /** Search value */
  value?: string;
  
  /** Search change handler */
  onChange?: (value: string) => void;
  
  /** Search submit handler */
  onSearch?: (query: string) => void;
  
  /** Search results */
  results?: SearchResult[];
  
  /** Results loading state */
  loading?: boolean;
  
  /** Show search results */
  showResults?: boolean;
  
  /** Result click handler */
  onResultClick?: (result: SearchResult) => void;
  
  /** Clear search handler */
  onClear?: () => void;
  
  /** Maximum results to show */
  maxResults?: number;
  
  /** Show search categories */
  showCategories?: boolean;
  
  /** Search icon position */
  iconPosition?: 'left' | 'right';
  
  /** Auto focus */
  autoFocus?: boolean;
}

export const Search: React.FC<SearchProps> = ({
  placeholder = 'Search...',
  value = '',
  onChange,
  onSearch,
  results = [],
  loading = false,
  showResults = true,
  onResultClick,
  onClear,
  maxResults = 10,
  showCategories = true,
  iconPosition = 'left',
  autoFocus = false,
  className,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchValue = onChange ? value : internalValue;
  const displayResults = results.slice(0, maxResults);

  // Group results by category
  const groupedResults = useMemo(() => {
    if (!showCategories) return { '': displayResults };
    
    return displayResults.reduce((groups: Record<string, SearchResult[]>, result) => {
      const category = result.category || 'Other';
      if (!groups[category]) groups[category] = [];
      groups[category].push(result);
      return groups;
    }, {} as Record<string, SearchResult[]>);
  }, [displayResults, showCategories]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue);
    } else {
      setInternalValue(newValue);
    }
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && displayResults[selectedIndex]) {
        handleResultClick(displayResults[selectedIndex]);
      } else if (onSearch) {
        onSearch(searchValue);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, displayResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result);
    } else if (result.url) {
      window.location.href = result.url;
    }
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleClear = () => {
    if (onChange) {
      onChange('');
    } else {
      setInternalValue('');
    }
    if (onClear) {
      onClear();
    }
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchValue);
    }
  };

  return (
    <div
      ref={searchRef}
      className={cn('relative w-full', className)}
      {...props}
    >
      <form onSubmit={handleSubmit} className="relative">
        {/* Search Icon - Left */}
        {iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* Search Input */}
        <input
          ref={inputRef}
          type="text"
          value={searchValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
            iconPosition === 'left' && 'pl-10',
            iconPosition === 'right' && 'pr-10',
            (searchValue || loading) && 'pr-16'
          )}
          aria-expanded={isOpen ? 'true' : 'false'}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls="search-results"
          role="combobox"
          aria-label={placeholder}
        />

        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg className="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}

        {/* Clear Button */}
        {searchValue && !loading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="Clear search"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}

        {/* Search Icon - Right */}
        {iconPosition === 'right' && !searchValue && !loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </form>

      {/* Search Results */}
      {isOpen && showResults && searchValue && (
        <div 
          id="search-results"
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-auto"
        >
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              Searching...
            </div>
          ) : displayResults.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              No results found for "{searchValue}"
            </div>
          ) : (
            <div role="listbox" aria-label="Search results">
              {Object.entries(groupedResults).map(([category, categoryResults]) => (
                <div key={category}>
                  {showCategories && category && (
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-gray-700">
                      {category}
                    </div>
                  )}
                  {(categoryResults as SearchResult[]).map((result, index) => {
                    const globalIndex = displayResults.indexOf(result);
                    const isSelected = selectedIndex === globalIndex;
                    
                    return (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className={cn(
                          'w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none',
                          isSelected && 'bg-gray-100 dark:bg-gray-700'
                        )}
                        role="option"
                        aria-selected={isSelected ? 'true' : 'false'}
                      >
                        <div className="flex items-center">
                          {result.icon && (
                            <span className="mr-3 text-gray-400">
                              {result.icon}
                            </span>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {result.title}
                            </div>
                            {result.description && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {result.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ===== FILTER COMPONENT =====

export interface FilterProps extends BaseComponentProps {
  /** Filter options */
  options: FilterOption[];
  
  /** Selected values */
  selectedValues?: any[];
  
  /** Selection change handler */
  onSelectionChange?: (values: any[]) => void;
  
  /** Filter title */
  title?: string;
  
  /** Multiple selection */
  multiple?: boolean;
  
  /** Searchable options */
  searchable?: boolean;
  
  /** Clear all handler */
  onClearAll?: () => void;
  
  /** Show option counts */
  showCounts?: boolean;
  
  /** Collapsible */
  collapsible?: boolean;
  
  /** Default collapsed state */
  defaultCollapsed?: boolean;
}

export const Filter: React.FC<FilterProps> = ({
  options,
  selectedValues = [],
  onSelectionChange,
  title,
  multiple = true,
  searchable = false,
  onClearAll,
  showCounts = true,
  collapsible = false,
  defaultCollapsed = false,
  className,
  ...props
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  const handleOptionToggle = (option: FilterOption) => {
    if (!onSelectionChange) return;

    let newValues: any[];
    if (multiple) {
      const isSelected = selectedValues.includes(option.value);
      newValues = isSelected
        ? selectedValues.filter(value => value !== option.value)
        : [...selectedValues, option.value];
    } else {
      newValues = selectedValues.includes(option.value) ? [] : [option.value];
    }
    
    onSelectionChange(newValues);
  };

  const handleClearAll = () => {
    if (onSelectionChange) {
      onSelectionChange([]);
    }
    if (onClearAll) {
      onClearAll();
    }
  };

  const selectedCount = selectedValues.length;

  return (
    <div className={cn('space-y-3', className)} {...props}>
      {/* Filter Header */}
      {(title || onClearAll) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {collapsible && title ? (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="flex items-center text-sm font-medium text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg
                  className={cn('w-4 h-4 mr-2 transition-transform', isCollapsed && '-rotate-90')}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                {title}
                {selectedCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                    {selectedCount}
                  </span>
                )}
              </button>
            ) : title ? (
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {title}
                {selectedCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                    {selectedCount}
                  </span>
                )}
              </h3>
            ) : null}
          </div>
          
          {onClearAll && selectedCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-xs"
            >
              Clear all
            </Button>
          )}
        </div>
      )}

      {/* Filter Content */}
      {(!collapsible || !isCollapsed) && (
        <>
          {/* Search */}
          {searchable && (
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search filters..."
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}

          {/* Filter Options */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredOptions.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              
              return (
                <label
                  key={option.id}
                  className="flex items-center space-x-3 cursor-pointer group"
                >
                  <input
                    type={multiple ? 'checkbox' : 'radio'}
                    checked={isSelected}
                    onChange={() => handleOptionToggle(option)}
                    disabled={option.selected !== undefined ? !option.selected : false}
                    className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
                  />
                  
                  <div className="flex items-center flex-1 min-w-0">
                    {option.icon && (
                      <span className="mr-2 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                        {option.icon}
                      </span>
                    )}
                    
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white truncate">
                      {option.label}
                    </span>
                    
                    {showCounts && option.count !== undefined && (
                      <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                        {option.count}
                      </span>
                    )}
                  </div>
                  
                  {option.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {option.description}
                    </div>
                  )}
                </label>
              );
            })}
            
            {filteredOptions.length === 0 && searchQuery && (
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No filters found for "{searchQuery}"
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
