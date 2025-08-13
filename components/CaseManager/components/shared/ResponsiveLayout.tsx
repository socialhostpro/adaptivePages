/**
 * Responsive Layout System - Device-Specific Views
 * Provides optimized layouts for desktop, tablet, and mobile with JSON-driven features
 */
import React, { ReactNode, useEffect, useState } from 'react';
import { cn } from './utils';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type ViewMode = 'fullscreen' | 'modal' | 'embedded';
export type MobileLayout = 'traditional' | 'app' | 'bottom-nav';

export interface ResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
  viewMode?: ViewMode;
  mobileLayout?: MobileLayout;
  desktopSidebar?: boolean;
  tabletOptimized?: boolean;
  enableGestures?: boolean;
  jsonConfig?: LayoutConfig;
}

export interface LayoutConfig {
  breakpoints: {
    mobile: number;    // < 768px
    tablet: number;    // 768px - 1024px  
    desktop: number;   // > 1024px
  };
  layouts: {
    mobile: MobileLayoutConfig;
    tablet: TabletLayoutConfig;
    desktop: DesktopLayoutConfig;
  };
  features: FeatureConfig[];
}

export interface MobileLayoutConfig {
  type: 'traditional' | 'app' | 'bottom-nav';
  header: {
    fixed: boolean;
    height: string;
    showTitle: boolean;
    actions: string[];
  };
  navigation: {
    type: 'bottom-tabs' | 'hamburger' | 'slide-out';
    position: 'bottom' | 'top' | 'left' | 'right';
    items: NavigationItem[];
  };
  content: {
    padding: string;
    scrollable: boolean;
    pullToRefresh: boolean;
  };
  gestures: {
    swipeNavigation: boolean;
    pullToRefresh: boolean;
    longPress: boolean;
  };
}

export interface TabletLayoutConfig {
  orientation: 'auto' | 'landscape' | 'portrait';
  sidebar: {
    enabled: boolean;
    width: string;
    collapsible: boolean;
    position: 'left' | 'right';
  };
  grid: {
    columns: number;
    gap: string;
    responsive: boolean;
  };
  tables: {
    horizontalScroll: boolean;
    stickyHeaders: boolean;
    compactMode: boolean;
  };
}

export interface DesktopLayoutConfig {
  layout: 'standard' | 'wide' | 'split' | 'dashboard';
  sidebar: {
    enabled: boolean;
    width: string;
    collapsible: boolean;
  };
  header: {
    height: string;
    sticky: boolean;
  };
  content: {
    maxWidth: string;
    centered: boolean;
  };
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: string | number;
  children?: NavigationItem[];
}

export interface FeatureConfig {
  id: string;
  name: string;
  type: 'page' | 'modal' | 'drawer' | 'inline';
  route?: string;
  components: ComponentConfig[];
  layout: {
    mobile: any;
    tablet: any;
    desktop: any;
  };
  permissions?: string[];
  enabled: boolean;
}

export interface ComponentConfig {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: ComponentConfig[];
  conditions?: ConditionConfig[];
  layout: {
    grid?: {
      col: number;
      row: number;
      span?: number;
    };
    responsive?: {
      mobile?: any;
      tablet?: any;
      desktop?: any;
    };
  };
}

export interface ConditionConfig {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
  action: 'show' | 'hide' | 'disable' | 'highlight';
}

/**
 * Hook to detect current device type and screen dimensions
 */
export function useDeviceDetection() {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');

  useEffect(() => {
    const updateDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });
      setOrientation(width > height ? 'landscape' : 'portrait');
      
      if (width < 768) {
        setDevice('mobile');
      } else if (width < 1024) {
        setDevice('tablet');
      } else {
        setDevice('desktop');
      }
    };

    updateDevice();
    window.addEventListener('resize', updateDevice);
    window.addEventListener('orientationchange', updateDevice);
    
    return () => {
      window.removeEventListener('resize', updateDevice);
      window.removeEventListener('orientationchange', updateDevice);
    };
  }, []);

  return { device, screenSize, orientation };
}

/**
 * Main Responsive Layout Component
 */
export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className,
  viewMode = 'embedded',
  mobileLayout = 'app',
  desktopSidebar = true,
  tabletOptimized = true,
  enableGestures = true,
  jsonConfig
}) => {
  const { device, screenSize, orientation } = useDeviceDetection();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bottomNavVisible, setBottomNavVisible] = useState(true);

  // Apply JSON configuration if provided
  const config = jsonConfig || getDefaultLayoutConfig();
  const currentLayout = config.layouts[device];

  const layoutClasses = cn(
    'responsive-layout',
    `device-${device}`,
    `view-${viewMode}`,
    `orientation-${orientation}`,
    device === 'mobile' && `mobile-${mobileLayout}`,
    className
  );

  if (device === 'mobile') {
    return (
      <MobileLayout
        className={layoutClasses}
        config={currentLayout as MobileLayoutConfig}
        viewMode={viewMode}
        enableGestures={enableGestures}
      >
        {children}
      </MobileLayout>
    );
  }

  if (device === 'tablet') {
    return (
      <TabletLayout
        className={layoutClasses}
        config={currentLayout as TabletLayoutConfig}
        viewMode={viewMode}
        orientation={orientation}
        sidebarOpen={sidebarOpen}
        onSidebarToggle={setSidebarOpen}
      >
        {children}
      </TabletLayout>
    );
  }

  return (
    <DesktopLayout
      className={layoutClasses}
      config={currentLayout as DesktopLayoutConfig}
      viewMode={viewMode}
      sidebarOpen={sidebarOpen}
      onSidebarToggle={setSidebarOpen}
    >
      {children}
    </DesktopLayout>
  );
};

/**
 * Mobile Layout Component - App-like experience
 */
interface MobileLayoutProps {
  children: ReactNode;
  className: string;
  config: MobileLayoutConfig;
  viewMode: ViewMode;
  enableGestures: boolean;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  className,
  config,
  viewMode,
  enableGestures
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);

  return (
    <div className={cn(className, 'mobile-layout flex flex-col h-screen')}>
      {/* Mobile Header */}
      {config.header.fixed && (
        <header 
          className={cn(
            'mobile-header bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700',
            'transition-transform duration-300',
            headerVisible ? 'translate-y-0' : '-translate-y-full',
            'z-50 h-[60px]'
          )}
        >
          <div className="flex items-center justify-between px-4 h-full">
            {config.header.showTitle && (
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                Page Title
              </h1>
            )}
            <div className="flex items-center space-x-2">
              {config.header.actions.map((action, index) => (
                <button
                  key={index}
                  aria-label={`${action} action`}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  {/* Action buttons */}
                </button>
              ))}
            </div>
          </div>
        </header>
      )}

      {/* Content Area */}
      <main 
        className={cn(
          'flex-1 overflow-auto p-4',
          config.content.scrollable && 'scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-600'
        )}
      >
        {children}
      </main>

      {/* Bottom Navigation */}
      {config.navigation.type === 'bottom-tabs' && config.navigation.position === 'bottom' && (
        <nav className="mobile-bottom-nav bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 pb-safe">
          <div className="flex items-center justify-around py-2">
            {config.navigation.items.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(index)}
                aria-label={item.label}
                className={cn(
                  'flex flex-col items-center py-2 px-3 rounded-lg transition-colors relative',
                  activeTab === index 
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-600 dark:text-gray-400'
                )}
              >
                <span className="text-xs mt-1">{item.label}</span>
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* Floating Action Button */}
      <button 
        className="fixed bottom-20 right-4 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors z-40"
        aria-label="Add new item"
        title="Add new item"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};

/**
 * Tablet Layout Component - Optimized for tablet usage
 */
interface TabletLayoutProps {
  children: ReactNode;
  className: string;
  config: TabletLayoutConfig;
  viewMode: ViewMode;
  orientation: 'portrait' | 'landscape';
  sidebarOpen: boolean;
  onSidebarToggle: (open: boolean) => void;
}

const TabletLayout: React.FC<TabletLayoutProps> = ({
  children,
  className,
  config,
  viewMode,
  orientation,
  sidebarOpen,
  onSidebarToggle
}) => {
  return (
    <div className={cn(className, 'tablet-layout flex h-screen')}>
      {/* Sidebar */}
      {config.sidebar.enabled && (
        <aside 
          className={cn(
            'tablet-sidebar bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700',
            'transition-transform duration-300 ease-in-out z-40',
            config.sidebar.position === 'left' ? 'order-first' : 'order-last',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
            orientation === 'landscape' ? 'w-80' : 'w-64',
            config.sidebar.collapsible && 'lg:translate-x-0'
          )}
        >
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Navigation
            </h2>
            {/* Sidebar content */}
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="tablet-header bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 h-16">
          <div className="flex items-center justify-between px-6 h-full">
            <div className="flex items-center space-x-4">
              {config.sidebar.enabled && config.sidebar.collapsible && (
                <button
                  onClick={() => onSidebarToggle(!sidebarOpen)}
                  aria-label="Toggle sidebar"
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Tablet View
              </h1>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <div 
            className={cn(
              'tablet-content grid gap-6',
              orientation === 'landscape' 
                ? `grid-cols-${config.grid.columns}` 
                : 'grid-cols-1'
            )}
          >
            {children}
          </div>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => onSidebarToggle(false)}
        />
      )}
    </div>
  );
};

/**
 * Desktop Layout Component - Full desktop experience
 */
interface DesktopLayoutProps {
  children: ReactNode;
  className: string;
  config: DesktopLayoutConfig;
  viewMode: ViewMode;
  sidebarOpen: boolean;
  onSidebarToggle: (open: boolean) => void;
}

const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  children,
  className,
  config,
  viewMode,
  sidebarOpen,
  onSidebarToggle
}) => {
  return (
    <div className={cn(className, 'desktop-layout flex h-screen')}>
      {/* Sidebar */}
      {config.sidebar.enabled && (
        <aside 
          className={cn(
            'desktop-sidebar bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700',
            'transition-all duration-300 ease-in-out',
            sidebarOpen ? 'w-80' : 'w-16',
            config.sidebar.collapsible && 'hover:w-80'
          )}
        >
          <div className="p-4">
            <h2 className={cn(
              'text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-opacity',
              sidebarOpen ? 'opacity-100' : 'opacity-0'
            )}>
              Navigation
            </h2>
            {/* Sidebar content */}
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header 
          className={cn(
            'desktop-header bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700',
            config.header.sticky && 'sticky top-0 z-30',
            'h-16'
          )}
        >
          <div className="flex items-center justify-between px-6 h-full">
            <div className="flex items-center space-x-4">
              {config.sidebar.enabled && config.sidebar.collapsible && (
                <button
                  onClick={() => onSidebarToggle(!sidebarOpen)}
                  aria-label="Toggle sidebar"
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Desktop View
              </h1>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div 
            className={cn(
              'desktop-content p-6',
              config.content.centered && 'mx-auto',
              config.content.maxWidth && `max-w-[${config.content.maxWidth}]`
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

/**
 * Default configuration
 */
function getDefaultLayoutConfig(): LayoutConfig {
  return {
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1200
    },
    layouts: {
      mobile: {
        type: 'app',
        header: {
          fixed: true,
          height: '60px',
          showTitle: true,
          actions: ['search', 'menu']
        },
        navigation: {
          type: 'bottom-tabs',
          position: 'bottom',
          items: [
            { id: 'home', label: 'Home', icon: 'home', route: '/' },
            { id: 'tasks', label: 'Tasks', icon: 'tasks', route: '/tasks' },
            { id: 'cases', label: 'Cases', icon: 'cases', route: '/cases' },
            { id: 'profile', label: 'Profile', icon: 'profile', route: '/profile' }
          ]
        },
        content: {
          padding: '16px',
          scrollable: true,
          pullToRefresh: true
        },
        gestures: {
          swipeNavigation: true,
          pullToRefresh: true,
          longPress: true
        }
      },
      tablet: {
        orientation: 'auto',
        sidebar: {
          enabled: true,
          width: '280px',
          collapsible: true,
          position: 'left'
        },
        grid: {
          columns: 2,
          gap: '24px',
          responsive: true
        },
        tables: {
          horizontalScroll: true,
          stickyHeaders: true,
          compactMode: false
        }
      },
      desktop: {
        layout: 'standard',
        sidebar: {
          enabled: true,
          width: '320px',
          collapsible: true
        },
        header: {
          height: '64px',
          sticky: true
        },
        content: {
          maxWidth: '1200px',
          centered: true
        }
      }
    },
    features: []
  };
}
