/**
 * DataTable Component - Advanced data table with sorting, filtering, pagination, and bulk actions
 * Part of the AdaptivePages Shared Component System
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';

// Mock AI hook for now - will be replaced with actual import
const useAiAgent = (config: any) => ({
  executeCommand: async (command: any) => console.log('AI Command:', command),
  trackActivity: (action: string, data: any) => console.log('AI Activity:', action, data)
});

// Types
export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex: keyof T;
  width?: number | string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'date' | 'number';
  filterOptions?: Array<{ label: string; value: any }>;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface TableAction<T = any> {
  key: string;
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick: (selectedRows: T[]) => void;
  disabled?: (selectedRows: T[]) => boolean;
}

export interface DataTableProps<T = any> {
  // Data
  data: T[];
  columns: TableColumn<T>[];
  
  // Selection
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedRowKeys: string[], selectedRows: T[]) => void;
  rowKey?: keyof T | ((record: T) => string);
  
  // Actions
  bulkActions?: TableAction<T>[];
  rowActions?: Array<{
    key: string;
    label: string;
    onClick: (record: T) => void;
    icon?: string;
  }>;
  
  // Pagination
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    onPageChange: (page: number, pageSize: number) => void;
  };
  
  // Styling
  size?: 'small' | 'medium' | 'large';
  bordered?: boolean;
  striped?: boolean;
  hover?: boolean;
  loading?: boolean;
  
  // AI Integration
  aiAgentId?: string;
  aiCommands?: {
    sort?: string;
    filter?: string;
    select?: string;
    export?: string;
  };
  
  // Callbacks
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, any>) => void;
  onRowClick?: (record: T, index: number) => void;
  
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  rowKey = 'id',
  bulkActions = [],
  rowActions = [],
  pagination,
  size = 'medium',
  bordered = false,
  striped = false,
  hover = true,
  loading = false,
  aiAgentId,
  aiCommands,
  onSort,
  onFilter,
  onRowClick,
  className = ''
}: DataTableProps<T>) {
  // State
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [localSelectedRows, setLocalSelectedRows] = useState<string[]>(selectedRows);

  // AI Integration
  const { executeCommand, trackActivity } = useAiAgent({
    agentId: aiAgentId || 'data-table',
    capabilities: ['sort', 'filter', 'select', 'export']
  });

  // Get row key
  const getRowKey = useCallback((record: T): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return String(record[rowKey]);
  }, [rowKey]);

  // Handle selection
  const handleRowSelection = useCallback((recordKey: string, checked: boolean) => {
    const newSelection = checked
      ? [...localSelectedRows, recordKey]
      : localSelectedRows.filter(key => key !== recordKey);
    
    setLocalSelectedRows(newSelection);
    
    if (onSelectionChange) {
      const selectedRecords = data.filter(record => 
        newSelection.includes(getRowKey(record))
      );
      onSelectionChange(newSelection, selectedRecords);
    }

    trackActivity?.('selection_change', {
      recordKey,
      checked,
      totalSelected: newSelection.length
    });
  }, [localSelectedRows, data, onSelectionChange, getRowKey, trackActivity]);

  // Handle select all
  const handleSelectAll = useCallback((checked: boolean) => {
    const newSelection = checked ? data.map(getRowKey) : [];
    setLocalSelectedRows(newSelection);
    
    if (onSelectionChange) {
      const selectedRecords = checked ? data : [];
      onSelectionChange(newSelection, selectedRecords);
    }

    trackActivity?.('select_all', { checked, count: newSelection.length });
  }, [data, onSelectionChange, getRowKey, trackActivity]);

  // Handle sorting
  const handleSort = useCallback((column: string) => {
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
    
    onSort?.(column, newDirection);
    trackActivity?.('sort', { column, direction: newDirection });
  }, [sortColumn, sortDirection, onSort, trackActivity]);

  // Handle filtering
  const handleFilter = useCallback((columnKey: string, value: any) => {
    const newFilters = { ...filters, [columnKey]: value };
    setFilters(newFilters);
    
    onFilter?.(newFilters);
    trackActivity?.('filter', { column: columnKey, value });
  }, [filters, onFilter, trackActivity]);

  // AI Command Handlers
  useEffect(() => {
    if (!aiAgentId) return;

    const handleAiCommand = async (command: any) => {
      switch (command.action) {
        case 'sort':
          if (command.column) {
            handleSort(command.column);
          }
          break;
        case 'filter':
          if (command.column && command.value !== undefined) {
            handleFilter(command.column, command.value);
          }
          break;
        case 'select_all':
          handleSelectAll(true);
          break;
        case 'clear_selection':
          handleSelectAll(false);
          break;
        case 'toggle_filters':
          setShowFilters(!showFilters);
          break;
      }
    };

    executeCommand({
      type: 'table',
      handler: handleAiCommand
    });
  }, [aiAgentId, executeCommand, handleSort, handleFilter, handleSelectAll, showFilters]);

  // Processed data (for local sorting/filtering if needed)
  const processedData = useMemo(() => {
    let result = [...data];
    
    // Apply local sorting if no external sort handler
    if (!onSort && sortColumn) {
      const column = columns.find(col => col.key === sortColumn);
      if (column) {
        result.sort((a, b) => {
          const aVal = a[column.dataIndex];
          const bVal = b[column.dataIndex];
          
          if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        });
      }
    }
    
    return result;
  }, [data, sortColumn, sortDirection, columns, onSort]);

  // Size classes
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const cellPaddingClasses = {
    small: 'px-3 py-2',
    medium: 'px-4 py-3',
    large: 'px-6 py-4'
  };

  const isAllSelected = localSelectedRows.length === data.length && data.length > 0;
  const isIndeterminate = localSelectedRows.length > 0 && localSelectedRows.length < data.length;

  return (
    <div className={`data-table ${className}`}>
      {/* Table Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {selectable && localSelectedRows.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {localSelectedRows.length} selected
              </span>
              {bulkActions.map((action) => (
                <button
                  key={action.key}
                  onClick={() => {
                    const selectedRecords = data.filter(record => 
                      localSelectedRows.includes(getRowKey(record))
                    );
                    action.onClick(selectedRecords);
                  }}
                  disabled={action.disabled?.(data.filter(record => 
                    localSelectedRows.includes(getRowKey(record))
                  ))}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    action.variant === 'danger'
                      ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
                      : action.variant === 'primary'
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {action.icon && <span className="mr-1">{action.icon}</span>}
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            🔍 Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {columns.filter(col => col.filterable).map((column) => (
              <div key={column.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {column.title}
                </label>
                {column.filterType === 'select' ? (
                  <select
                    value={filters[column.key] || ''}
                    onChange={(e) => handleFilter(column.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All</option>
                    {column.filterOptions?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={column.filterType || 'text'}
                    value={filters[column.key] || ''}
                    onChange={(e) => handleFilter(column.key, e.target.value)}
                    placeholder={`Filter ${column.title}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className={`w-full ${bordered ? 'border border-gray-200 dark:border-gray-700' : ''} ${sizeClasses[size]}`}>
          {/* Table Header */}
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {selectable && (
                <th className={`${cellPaddingClasses[size]} text-left`}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`${cellPaddingClasses[size]} font-medium text-gray-900 dark:text-white ${
                    column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                  } ${column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''}`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <span className={`text-xs ${sortColumn === column.key && sortDirection === 'asc' ? 'text-blue-600' : 'text-gray-400'}`}>
                          ▲
                        </span>
                        <span className={`text-xs ${sortColumn === column.key && sortDirection === 'desc' ? 'text-blue-600' : 'text-gray-400'}`}>
                          ▼
                        </span>
                      </div>
                    )}
                  </div>
                </th>
              ))}
              
              {rowActions.length > 0 && (
                <th className={`${cellPaddingClasses[size]} text-right`}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          
          {/* Table Body */}
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (rowActions.length > 0 ? 1 : 0)} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : processedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (rowActions.length > 0 ? 1 : 0)} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No data available
                </td>
              </tr>
            ) : (
              processedData.map((record, index) => {
                const recordKey = getRowKey(record);
                const isSelected = localSelectedRows.includes(recordKey);
                
                return (
                  <tr
                    key={recordKey}
                    className={`${striped && index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : ''} ${
                      hover ? 'hover:bg-gray-50 dark:hover:bg-gray-800' : ''
                    } ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''} ${
                      onRowClick ? 'cursor-pointer' : ''
                    } transition-colors`}
                    onClick={() => onRowClick?.(record, index)}
                  >
                    {selectable && (
                      <td className={cellPaddingClasses[size]}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleRowSelection(recordKey, e.target.checked);
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`${cellPaddingClasses[size]} text-gray-900 dark:text-white ${
                          column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {column.render
                          ? column.render(record[column.dataIndex], record, index)
                          : String(record[column.dataIndex] || '')
                        }
                      </td>
                    ))}
                    
                    {rowActions.length > 0 && (
                      <td className={`${cellPaddingClasses[size]} text-right`}>
                        <div className="flex items-center justify-end space-x-1">
                          {rowActions.map((action) => (
                            <button
                              key={action.key}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(record);
                              }}
                              className="px-2 py-1 text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title={action.label}
                            >
                              {action.icon || action.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {((pagination.current - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.current * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          
          <div className="flex items-center space-x-2">
            {pagination.showSizeChanger && (
              <select
                value={pagination.pageSize}
                onChange={(e) => pagination.onPageChange(1, parseInt(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
            )}
            
            <button
              onClick={() => pagination.onPageChange(pagination.current - 1, pagination.pageSize)}
              disabled={pagination.current <= 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              Previous
            </button>
            
            <span className="px-3 py-1 text-sm">
              Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            
            <button
              onClick={() => pagination.onPageChange(pagination.current + 1, pagination.pageSize)}
              disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
