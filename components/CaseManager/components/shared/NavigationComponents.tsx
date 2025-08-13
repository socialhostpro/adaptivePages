/**
 * Navigation Components
 * Comprehensive navigation system with breadcrumbs, sidebars, tabs, mobile navigation, and search
 * Integrates with AI control system for programmatic navigation
 */
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from './utils';
import { NavigationItem, BreadcrumbItem, TabItem, SearchResult, FilterOption, NavigationConfig, BaseComponentProps } from './types';
import { Button } from './ButtonComponents';

// ===== BREADCRUMB NAVIGATION =====

export interface BreadcrumbProps extends BaseComponentProps {
  /** Breadcrumb items */
  items: BreadcrumbItem[];
  
  /** Separator character or component */
  separator?: string | React.ReactNode;
  
  /** Maximum items to show before collapsing */
  maxItems?: number;
  
  /** Show home icon */
  showHome?: boolean;
  
  /** Responsive behavior */
  responsive?: boolean;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = '/',
  maxItems = 5,
  showHome = true,
  responsive = true,
  className,
  ...props
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const displayItems = useMemo(() => {
    if (!isCollapsed && items.length > maxItems) {
      return [
        items[0],
        { id: 'ellipsis', label: '...', onClick: () => setIsCollapsed(true) },
        ...items.slice(-2)
      ];
    }
    return items;
  }, [items, maxItems, isCollapsed]);

  const handleItemClick = (item: BreadcrumbItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      window.location.href = item.href;
    }
  };

  return (
    <nav 
      className={cn(
        'flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400',
        responsive && 'flex-wrap',
        className
      )}
      aria-label="Breadcrumb"
      {...props}
    >
      {showHome && (
        <>
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            aria-label="Home"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </button>
          <span className="text-gray-300 dark:text-gray-600">{separator}</span>
        </>
      )}
      
      {displayItems.map((item, index) => (
        <React.Fragment key={item.id}>
          {index > 0 && (
            <span className="text-gray-300 dark:text-gray-600">{separator}</span>
          )}
          
          <div className="flex items-center">
            {item.icon && (
              <span className="mr-1.5 text-gray-400">{item.icon}</span>
            )}
            
            {item.current ? (
              <span 
                className="font-medium text-gray-900 dark:text-white"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <button
                onClick={() => handleItemClick(item)}
                className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                {item.label}
              </button>
            )}
          </div>
        </React.Fragment>
      ))}
    </nav>
  );
};

// ===== SIDEBAR NAVIGATION =====

export interface SidebarProps extends BaseComponentProps {
  /** Navigation configuration */
  config: NavigationConfig;
  
  /** Current active path */
  activePath?: string;
  
  /** Collapsed state */
  collapsed?: boolean;
  
  /** Collapse toggle handler */
  onToggleCollapse?: () => void;
  
  /** Mobile overlay mode */
  overlay?: boolean;
  
  /** Close handler for mobile */
  onClose?: () => void;
  
  /** Position */
  position?: 'left' | 'right';
  
  /** Width */
  width?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  config,
  activePath,
  collapsed = false,
  onToggleCollapse,
  overlay = false,
  onClose,
  position = 'left',
  width = '280px',
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
    
    // Close mobile overlay after navigation
    if (overlay && onClose) {
      onClose();
    }
  };

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const isActive = activePath === item.href || item.active;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);

    return (
      <li key={item.id}>
        <div
          className={cn(
            'flex items-center justify-between rounded-lg transition-all duration-200',
            level === 0 ? 'px-3 py-2' : 'px-3 py-1.5 ml-4',
            isActive
              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
            item.disabled && 'opacity-50 cursor-not-allowed',
            collapsed && level === 0 && 'justify-center px-2'
          )}
        >
          <button
            onClick={() => hasChildren ? toggleExpanded(item.id) : handleItemClick(item)}
            disabled={item.disabled}
            className={cn(
              'flex items-center flex-1 text-left',
              collapsed && level === 0 && 'justify-center'
            )}
          >
            {item.icon && (
              <span className={cn('text-lg', !collapsed && 'mr-3')}>
                {typeof item.icon === 'string' ? (
                  <i className={item.icon} />
                ) : (
                  item.icon
                )}
              </span>
            )}
            
            {!collapsed && (
              <>
                <span className="font-medium truncate">{item.label}</span>
                {item.badge && (
                  <span className={cn(
                    'ml-auto px-2 py-0.5 text-xs rounded-full',
                    item.badgeVariant === 'primary' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                    item.badgeVariant === 'success' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                    item.badgeVariant === 'warning' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                    item.badgeVariant === 'danger' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                    !item.badgeVariant && 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  )}>
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </button>
          
          {hasChildren && !collapsed && (
            <button
              onClick={() => toggleExpanded(item.id)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg
                className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-90')}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        
        {hasChildren && isExpanded && !collapsed && (
          <ul className="mt-1 space-y-1">
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {overlay && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 z-50 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300',
          position === 'left' ? 'left-0' : 'right-0',
          collapsed ? 'w-16' : '',
          overlay ? 'lg:translate-x-0' : 'translate-x-0',
          overlay && position === 'left' && '-translate-x-full lg:translate-x-0',
          overlay && position === 'right' && 'translate-x-full lg:translate-x-0',
          className
        )}
        style={{ width: collapsed ? '64px' : width }}
        {...props}
      >
        {/* Brand */}
        {config.brand && (
          <div className={cn(
            'flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700',
            collapsed && 'justify-center px-2'
          )}>
            {config.brand.logo && (
              <div className="flex-shrink-0">
                {typeof config.brand.logo === 'string' ? (
                  <img src={config.brand.logo} alt={config.brand.name} className="h-8 w-8" />
                ) : (
                  config.brand.logo
                )}
              </div>
            )}
            {!collapsed && (
              <span className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">
                {config.brand.name}
              </span>
            )}
          </div>
        )}
        
        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          <ul className="space-y-2">
            {config.items.map(item => renderNavigationItem(item))}
          </ul>
          
          {config.secondaryItems && config.secondaryItems.length > 0 && (
            <>
              <div className="my-6 border-t border-gray-200 dark:border-gray-700" />
              <ul className="space-y-2">
                {config.secondaryItems.map(item => renderNavigationItem(item))}
              </ul>
            </>
          )}
        </nav>
        
        {/* Collapse Toggle */}
        {config.collapsible && onToggleCollapse && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="w-full"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg
                className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {!collapsed && <span className="ml-2">Collapse</span>}
            </Button>
          </div>
        )}
      </aside>
    </>
  );
};

// ===== TAB NAVIGATION =====

export interface TabsProps extends BaseComponentProps {
  /** Tab items */
  items: TabItem[];
  
  /** Active tab ID */
  activeTab?: string;
  
  /** Tab change handler */
  onTabChange?: (tabId: string) => void;
  
  /** Tab close handler */
  onTabClose?: (tabId: string) => void;
  
  /** Tab variant */
  variant?: 'default' | 'pills' | 'underline' | 'cards';
  
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  
  /** Allow tab scrolling */
  scrollable?: boolean;
  
  /** Add new tab handler */
  onAddTab?: () => void;
  
  /** Full width tabs */
  fullWidth?: boolean;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeTab,
  onTabChange,
  onTabClose,
  variant = 'default',
  orientation = 'horizontal',
  scrollable = true,
  onAddTab,
  fullWidth = false,
  className,
  children,
  ...props
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(items[0]?.id || '');
  const tabsRef = useRef<HTMLDivElement>(null);
  
  const currentActiveTab = activeTab || internalActiveTab;
  const activeTabData = items.find(item => item.id === currentActiveTab);

  const handleTabClick = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    } else {
      setInternalActiveTab(tabId);
    }
    
    const tab = items.find(item => item.id === tabId);
    if (tab?.onClick) {
      tab.onClick();
    }
  };

  const handleTabClose = (tabId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onTabClose) {
      onTabClose(tabId);
    }
  };

  const tabListClasses = cn(
    'flex',
    orientation === 'vertical' ? 'flex-col space-y-1' : 'space-x-1',
    variant === 'default' && 'border-b border-gray-200 dark:border-gray-700',
    variant === 'underline' && 'border-b border-gray-200 dark:border-gray-700',
    scrollable && orientation === 'horizontal' && 'overflow-x-auto',
    fullWidth && 'w-full'
  );

  const getTabClasses = (item: TabItem, isActive: boolean) => cn(
    'flex items-center px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    
    // Variant styles
    variant === 'default' && 'border-b-2 -mb-px',
    variant === 'default' && isActive && 'border-blue-500 text-blue-600 dark:text-blue-400',
    variant === 'default' && !isActive && 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
    
    variant === 'pills' && 'rounded-md',
    variant === 'pills' && isActive && 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
    variant === 'pills' && !isActive && 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
    
    variant === 'underline' && 'border-b-2 -mb-px',
    variant === 'underline' && isActive && 'border-blue-500 text-blue-600 dark:text-blue-400',
    variant === 'underline' && !isActive && 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
    
    variant === 'cards' && 'rounded-t-lg border border-b-0',
    variant === 'cards' && isActive && 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white',
    variant === 'cards' && !isActive && 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700',
    
    item.disabled && 'opacity-50 cursor-not-allowed',
    fullWidth && 'flex-1 justify-center'
  );

  return (
    <div 
      className={cn(
        'w-full',
        orientation === 'vertical' && 'flex',
        className
      )}
      {...props}
    >
      {/* Tab List */}
      <div 
        ref={tabsRef}
        className={cn(
          tabListClasses,
          orientation === 'vertical' && 'w-48 mr-6'
        )}
        role="tablist"
        aria-orientation={orientation}
      >
        {items.map((item) => {
          const isActive = item.id === currentActiveTab;
          
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isActive ? 'true' : 'false'}
              aria-controls={`tabpanel-${item.id}`}
              disabled={item.disabled}
              className={getTabClasses(item, isActive)}
              onClick={() => handleTabClick(item.id)}
            >
              {item.icon && (
                <span className="mr-2">{item.icon}</span>
              )}
              
              <span className="truncate">{item.label}</span>
              
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
              
              {item.closeable && (
                <button
                  onClick={(e) => handleTabClose(item.id, e)}
                  className="ml-2 p-0.5 rounded-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  aria-label={`Close ${item.label} tab`}
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </button>
          );
        })}
        
        {onAddTab && (
          <button
            onClick={onAddTab}
            className="flex items-center px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            aria-label="Add new tab"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Tab Panels */}
      <div className={cn(
        'flex-1',
        variant === 'cards' && 'border border-gray-200 dark:border-gray-700 rounded-b-lg bg-white dark:bg-gray-900'
      )}>
        {activeTabData && (
          <div
            role="tabpanel"
            id={`tabpanel-${activeTabData.id}`}
            aria-labelledby={`tab-${activeTabData.id}`}
            className={cn(
              'focus:outline-none',
              variant === 'cards' && 'p-4'
            )}
          >
            {activeTabData.content || children}
          </div>
        )}
      </div>
    </div>
  );
};

// Export navigation hook for AI integration
export const useNavigation = () => {
  const navigate = (path: string) => {
    window.location.href = path;
  };

  const openTab = (tabId: string) => {
    // Implementation for programmatic tab opening
    const event = new CustomEvent('ai-open-tab', { detail: { tabId } });
    window.dispatchEvent(event);
  };

  const closeTab = (tabId: string) => {
    // Implementation for programmatic tab closing  
    const event = new CustomEvent('ai-close-tab', { detail: { tabId } });
    window.dispatchEvent(event);
  };

  return {
    navigate,
    openTab,
    closeTab
  };
};
