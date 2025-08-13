import React, { useState, useEffect, ReactNode } from 'react';

// =============================================================================
// PHASE 6: USER INTERACTION COMPONENTS (Part 2)
// =============================================================================
// Additional components for user interaction:
// - Filter & Sort Controls – For table/grid data
// - Tag / Badge Component – Status indicators, labels  
// - Pagination Controls – Consistent page navigation UI
// =============================================================================

// AI Agent Integration
interface AiCommand {
  type: 'filter' | 'sort' | 'pagination' | 'navigation';
  action: string;
  target?: string;
  data?: any;
}

interface AiAgentConfig {
  agentId: string;
  capabilities: string[];
  onCommand?: (command: AiCommand) => void;
}

const useAiAgent = (config: AiAgentConfig) => {
  const executeCommand = async (command: AiCommand) => {
    console.log(`[AI Agent ${config.agentId}] Executing:`, command);
    config.onCommand?.(command);
  };

  const handleVoiceCommand = (text: string) => {
    const lowerText = text.toLowerCase();
    
    // Filter commands
    if (lowerText.includes('clear filters')) {
      executeCommand({ type: 'filter', action: 'clear' });
    } else if (lowerText.includes('filter by')) {
      const criteria = lowerText.split('filter by ')[1];
      executeCommand({ type: 'filter', action: 'apply', data: { criteria } });
    }
    
    // Sort commands
    else if (lowerText.includes('sort by')) {
      const field = lowerText.split('sort by ')[1]?.split(' ')[0];
      executeCommand({ type: 'sort', action: 'apply', data: { field } });
    } else if (lowerText.includes('sort ascending')) {
      executeCommand({ type: 'sort', action: 'direction', data: { direction: 'asc' } });
    } else if (lowerText.includes('sort descending')) {
      executeCommand({ type: 'sort', action: 'direction', data: { direction: 'desc' } });
    }
    
    // Pagination commands
    else if (lowerText.includes('next page')) {
      executeCommand({ type: 'pagination', action: 'next' });
    } else if (lowerText.includes('previous page')) {
      executeCommand({ type: 'pagination', action: 'prev' });
    } else if (lowerText.includes('first page')) {
      executeCommand({ type: 'pagination', action: 'first' });
    } else if (lowerText.includes('last page')) {
      executeCommand({ type: 'pagination', action: 'last' });
    } else if (lowerText.includes('page size')) {
      const size = lowerText.split('page size ')[1]?.split(' ')[0];
      executeCommand({ type: 'pagination', action: 'size', data: { size: parseInt(size) } });
    }
  };

  return { executeCommand, handleVoiceCommand };
};

// =============================================================================
// FILTER & SORT CONTROLS
// =============================================================================

interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number' | 'boolean' | 'multiselect';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface SortOption {
  key: string;
  label: string;
}

interface FilterValue {
  [key: string]: any;
}

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

interface FilterSortControlsProps {
  filters: FilterOption[];
  sortOptions: SortOption[];
  onFilterChange: (filters: FilterValue) => void;
  onSortChange: (sort: SortConfig) => void;
  onClearFilters: () => void;
  initialFilters?: FilterValue;
  initialSort?: SortConfig;
  showClearButton?: boolean;
  compact?: boolean;
  aiAgentId?: string;
  className?: string;
}

export const FilterSortControls: React.FC<FilterSortControlsProps> = ({
  filters,
  sortOptions,
  onFilterChange,
  onSortChange,
  onClearFilters,
  initialFilters = {},
  initialSort = { field: '', direction: 'asc' },
  showClearButton = true,
  compact = false,
  aiAgentId,
  className = ''
}) => {
  const [currentFilters, setCurrentFilters] = useState<FilterValue>(initialFilters);
  const [currentSort, setCurrentSort] = useState<SortConfig>(initialSort);
  const [isExpanded, setIsExpanded] = useState(!compact);

  const { handleVoiceCommand } = useAiAgent({
    agentId: aiAgentId || 'filter-sort-controls',
    capabilities: ['filter', 'sort', 'voice'],
  });

  // Voice command listener
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'F') {
        const command = prompt('Voice command for Filter & Sort:');
        if (command) handleVoiceCommand(command);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleVoiceCommand]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...currentFilters, [key]: value };
    if (value === '' || value === null || value === undefined) {
      delete newFilters[key];
    }
    setCurrentFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (field: string) => {
    const newDirection = currentSort.field === field && currentSort.direction === 'asc' ? 'desc' : 'asc';
    const newSort = { field, direction: newDirection };
    setCurrentSort(newSort);
    onSortChange(newSort);
  };

  const handleClearFilters = () => {
    setCurrentFilters({});
    setCurrentSort({ field: '', direction: 'asc' });
    onClearFilters();
  };

  const hasActiveFilters = Object.keys(currentFilters).length > 0 || currentSort.field !== '';

  const renderFilterInput = (filter: FilterOption) => {
    const value = currentFilters[filter.key] || '';

    switch (filter.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            placeholder={filter.placeholder || `Filter by ${filter.label.toLowerCase()}`}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            title={`Filter by ${filter.label}`}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All {filter.label}</option>
            {filter.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            placeholder={filter.placeholder || `Filter by ${filter.label.toLowerCase()}`}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'boolean':
        return (
          <select
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            title={`Filter by ${filter.label}`}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Filters & Sort
          </h3>
          {hasActiveFilters && (
            <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full">
              {Object.keys(currentFilters).length + (currentSort.field ? 1 : 0)} active
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {showClearButton && hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              Clear All
            </button>
          )}
          {compact && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              title={isExpanded ? 'Collapse filters' : 'Expand filters'}
            >
              <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Controls */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Sort Controls */}
          {sortOptions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <div className="flex items-center space-x-2">
                <select
                  value={currentSort.field}
                  onChange={(e) => handleSortChange(e.target.value)}
                  title="Sort field"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No sorting</option>
                  {sortOptions.map(option => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                {currentSort.field && (
                  <button
                    onClick={() => handleSortChange(currentSort.field)}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                    title={`Sort ${currentSort.direction === 'asc' ? 'descending' : 'ascending'}`}
                  >
                    <svg className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${currentSort.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Filter Controls */}
          {filters.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filters.map(filter => (
                <div key={filter.key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {filter.label}
                  </label>
                  {renderFilterInput(filter)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// TAG / BADGE COMPONENT
// =============================================================================

interface TagProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  rounded?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  icon?: ReactNode;
  onClick?: () => void;
  className?: string;
  aiAgentId?: string;
}

export const Tag: React.FC<TagProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  rounded = true,
  removable = false,
  onRemove,
  icon,
  onClick,
  className = '',
  aiAgentId
}) => {
  const { handleVoiceCommand } = useAiAgent({
    agentId: aiAgentId || 'tag',
    capabilities: ['interaction', 'voice'],
  });

  // Voice command listener
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        const command = prompt('Voice command for Tag:');
        if (command) handleVoiceCommand(command);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleVoiceCommand]);

  const baseClasses = `inline-flex items-center font-medium transition-colors ${
    rounded ? 'rounded-full' : 'rounded'
  } ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`;

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-sm'
  };

  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    secondary: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    info: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400'
  };

  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {icon && (
        <span className="mr-1">
          {icon}
        </span>
      )}
      {children}
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-1 p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full"
          title="Remove tag"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </Component>
  );
};

// Badge Component (Similar to Tag but with different styling)
interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  pulse = false,
  className = ''
}) => {
  const sizeClasses = {
    xs: dot ? 'w-2 h-2' : 'px-1.5 py-0.5 text-xs',
    sm: dot ? 'w-2.5 h-2.5' : 'px-2 py-0.5 text-xs',
    md: dot ? 'w-3 h-3' : 'px-2.5 py-1 text-sm',
    lg: dot ? 'w-4 h-4' : 'px-3 py-1.5 text-sm'
  };

  const variantClasses = {
    default: 'bg-gray-500',
    primary: 'bg-blue-500',
    secondary: 'bg-purple-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-indigo-500'
  };

  if (dot) {
    return (
      <span
        className={`inline-block rounded-full ${variantClasses[variant]} ${sizeClasses[size]} ${
          pulse ? 'animate-pulse' : ''
        } ${className}`}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center font-medium text-white rounded-full ${
        variantClasses[variant]
      } ${sizeClasses[size]} ${pulse ? 'animate-pulse' : ''} ${className}`}
    >
      {children}
    </span>
  );
};

// =============================================================================
// PAGINATION CONTROLS
// =============================================================================

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showItemsInfo?: boolean;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
  aiAgentId?: string;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSizeSelector = true,
  showItemsInfo = true,
  showFirstLast = true,
  maxVisiblePages = 7,
  aiAgentId,
  className = ''
}) => {
  const { handleVoiceCommand } = useAiAgent({
    agentId: aiAgentId || 'pagination',
    capabilities: ['pagination', 'voice'],
  });

  // Voice command listener
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        const command = prompt('Voice command for Pagination:');
        if (command) handleVoiceCommand(command);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleVoiceCommand]);

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to display
  const getVisiblePages = () => {
    const pages = [];
    let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();
  const showEllipsisStart = visiblePages[0] > 2;
  const showEllipsisEnd = visiblePages[visiblePages.length - 1] < totalPages - 1;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 ${className}`}>
      {/* Items Info */}
      {showItemsInfo && (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Showing <span className="font-medium">{startItem}</span> to{' '}
          <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{totalItems}</span> results
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center space-x-2">
        {/* First & Previous */}
        {showFirstLast && (
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="px-2 py-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="First page"
          >
            ⟪
          </button>
        )}
        
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous page"
        >
          ‹ Previous
        </button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {/* First page if not visible */}
          {showEllipsisStart && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                1
              </button>
              <span className="px-1 text-gray-500">…</span>
            </>
          )}

          {/* Visible page numbers */}
          {visiblePages.map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                page === currentPage
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {page}
            </button>
          ))}

          {/* Last page if not visible */}
          {showEllipsisEnd && (
            <>
              <span className="px-1 text-gray-500">…</span>
              <button
                onClick={() => handlePageChange(totalPages)}
                className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        {/* Next & Last */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next page"
        >
          Next ›
        </button>

        {showFirstLast && (
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Last page"
          >
            ⟫
          </button>
        )}
      </div>

      {/* Page Size Selector */}
      {showPageSizeSelector && onPageSizeChange && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">Show:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            title="Items per page"
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-700 dark:text-gray-300">per page</span>
        </div>
      )}
    </div>
  );
};

export default {
  FilterSortControls,
  Tag,
  Badge,
  Pagination
};
