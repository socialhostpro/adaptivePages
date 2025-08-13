import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';

// =============================================================================
// THEME CONTEXT & PROVIDER
// =============================================================================

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (stored === 'dark' || (!stored && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    if (theme === 'system') {
      localStorage.removeItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      const newTheme = theme === 'dark';
      setIsDark(newTheme);
      localStorage.setItem('theme', theme);
      if (newTheme) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// =============================================================================
// PROFESSIONAL THEME SWITCHER
// =============================================================================

interface ThemeSwitcherProps {
  variant?: 'toggle' | 'dropdown' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  variant = 'toggle',
  size = 'md',
  showLabel = false,
  className = ''
}) => {
  const { isDark, toggleTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const sizeClasses = {
    sm: 'w-10 h-6',
    md: 'w-12 h-7',
    lg: 'w-14 h-8'
  };

  const toggleClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  if (variant === 'minimal') {
    return (
      <button
        onClick={toggleTheme}
        className={`
          theme-switcher-minimal
          p-2 rounded-lg transition-all duration-200
          hover:bg-gray-100 dark:hover:bg-gray-800
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${className}
        `}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {isDark ? (
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="theme-switcher-dropdown p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label="Theme options"
        >
          {isDark ? '🌙' : '☀️'}
        </button>
        
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-1">
              <button
                onClick={() => { setTheme('light'); setIsOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 flex items-center gap-2"
              >
                ☀️ Light
              </button>
              <button
                onClick={() => { setTheme('dark'); setIsOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 flex items-center gap-2"
              >
                🌙 Dark
              </button>
              <button
                onClick={() => { setTheme('system'); setIsOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 flex items-center gap-2"
              >
                💻 System
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
      <button
        onClick={toggleTheme}
        className={`
          theme-switcher-toggle relative inline-flex ${sizeClasses[size]} rounded-full
          transition-all duration-300 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${isDark 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
            : 'bg-gradient-to-r from-gray-200 to-gray-300'
          }
        `}
        role="switch"
        aria-checked={isDark ? 'true' : 'false'}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        <span
          className={`
            ${toggleClasses[size]} inline-block rounded-full bg-white shadow-lg
            transform transition-all duration-300 ease-in-out
            flex items-center justify-center
            ${isDark ? 'translate-x-6' : 'translate-x-1'}
          `}
        >
          {isDark ? '🌙' : '☀️'}
        </span>
      </button>
    </div>
  );
};

// =============================================================================
// ACCESS CONTROL WRAPPER
// =============================================================================

interface AccessControlProps {
  children: ReactNode;
  roles?: string[];
  permissions?: string[];
  userRole?: string;
  userPermissions?: string[];
  fallback?: ReactNode;
  showFallback?: boolean;
  requireAll?: boolean;
}

export const AccessControl: React.FC<AccessControlProps> = ({
  children,
  roles = [],
  permissions = [],
  userRole = 'guest',
  userPermissions = [],
  fallback = null,
  showFallback = true,
  requireAll = false
}) => {
  const hasRoleAccess = roles.length === 0 || roles.includes(userRole);
  
  const hasPermissionAccess = permissions.length === 0 || (
    requireAll 
      ? permissions.every(permission => userPermissions.includes(permission))
      : permissions.some(permission => userPermissions.includes(permission))
  );

  const hasAccess = hasRoleAccess && hasPermissionAccess;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (showFallback && fallback) {
    return <>{fallback}</>;
  }

  return null;
};

// =============================================================================
// PROFESSIONAL EXPORT BUTTONS
// =============================================================================

interface ExportButtonsProps {
  data: any[];
  filename?: string;
  title?: string;
  variant?: 'buttons' | 'dropdown' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onExport?: (type: 'csv' | 'pdf' | 'excel', data: any[]) => void;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  data,
  filename = 'export',
  title = 'Export Data',
  variant = 'buttons',
  size = 'md',
  className = '',
  onExport
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const exportToCSV = () => {
    if (onExport) {
      onExport('csv', data);
      return;
    }

    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    if (onExport) {
      onExport('pdf', data);
      return;
    }
    // PDF export would require a library like jsPDF
    console.log('PDF export requires jsPDF library');
  };

  const exportToExcel = () => {
    if (onExport) {
      onExport('excel', data);
      return;
    }
    // Excel export would require a library like xlsx
    console.log('Excel export requires xlsx library');
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const buttonClass = `
    ${sizeClasses[size]} rounded-lg font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
    hover:transform hover:scale-105 active:scale-95
  `;

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <button
          onClick={exportToCSV}
          className={`${buttonClass} bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300`}
          title="Export as CSV"
        >
          CSV
        </button>
        <button
          onClick={exportToPDF}
          className={`${buttonClass} bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300`}
          title="Export as PDF"
        >
          PDF
        </button>
        <button
          onClick={exportToExcel}
          className={`${buttonClass} bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300`}
          title="Export as Excel"
        >
          XLS
        </button>
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            ${buttonClass} export-dropdown-trigger
            bg-gradient-to-r from-blue-600 to-purple-600 text-white
            hover:from-blue-700 hover:to-purple-700
            flex items-center gap-2
          `}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {title}
          <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 export-dropdown">
            <div className="p-1">
              <button
                onClick={() => { exportToCSV(); setIsOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 flex items-center gap-3"
              >
                <span className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  📊
                </span>
                <div>
                  <div className="font-medium">CSV</div>
                  <div className="text-xs text-gray-500">Comma-separated values</div>
                </div>
              </button>
              <button
                onClick={() => { exportToPDF(); setIsOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 flex items-center gap-3"
              >
                <span className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  📄
                </span>
                <div>
                  <div className="font-medium">PDF</div>
                  <div className="text-xs text-gray-500">Portable document</div>
                </div>
              </button>
              <button
                onClick={() => { exportToExcel(); setIsOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 flex items-center gap-3"
              >
                <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  📈
                </span>
                <div>
                  <div className="font-medium">Excel</div>
                  <div className="text-xs text-gray-500">Spreadsheet format</div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}:</span>
      <button
        onClick={exportToCSV}
        className={`
          ${buttonClass} export-csv
          bg-gradient-to-r from-green-500 to-emerald-500 text-white
          hover:from-green-600 hover:to-emerald-600
          flex items-center gap-2
        `}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        CSV
      </button>
      <button
        onClick={exportToPDF}
        className={`
          ${buttonClass} export-pdf
          bg-gradient-to-r from-red-500 to-rose-500 text-white
          hover:from-red-600 hover:to-rose-600
          flex items-center gap-2
        `}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        PDF
      </button>
      <button
        onClick={exportToExcel}
        className={`
          ${buttonClass} export-excel
          bg-gradient-to-r from-blue-500 to-indigo-500 text-white
          hover:from-blue-600 hover:to-indigo-600
          flex items-center gap-2
        `}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Excel
      </button>
    </div>
  );
};

// =============================================================================
// EMBED FRAME / IFRAME WRAPPER
// =============================================================================

interface EmbedFrameProps {
  src: string;
  title?: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  allowFullScreen?: boolean;
  sandbox?: string;
  loading?: 'lazy' | 'eager';
  referrerPolicy?: 'no-referrer' | 'origin' | 'unsafe-url';
  onLoad?: () => void;
  onError?: () => void;
  fallback?: ReactNode;
  showControls?: boolean;
}

export const EmbedFrame: React.FC<EmbedFrameProps> = ({
  src,
  title = 'Embedded content',
  width = '100%',
  height = '400px',
  className = '',
  allowFullScreen = false,
  sandbox = 'allow-scripts allow-same-origin',
  loading = 'lazy',
  referrerPolicy = 'no-referrer',
  onLoad,
  onError,
  fallback,
  showControls = true
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const refreshFrame = () => {
    setIsLoading(true);
    setHasError(false);
    // Force iframe refresh by updating key
    const iframe = document.querySelector(`iframe[title="${title}"]`) as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  if (hasError && fallback) {
    return <div className={className}>{fallback}</div>;
  }

  return (
    <div className={`embed-frame-wrapper ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'relative'} ${className}`}>
      {showControls && (
        <div className="embed-controls flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
              {title}
            </span>
            {isLoading && (
              <div className="loading-spinner-sm">
                <div className="loading-spinner loading-spinner-sm"></div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={refreshFrame}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Refresh"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            {allowFullScreen && (
              <button
                onClick={toggleFullscreen}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isFullscreen ? "M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15h4.5M15 15v4.5m0-4.5l5.5 5.5" : "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"} />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
      
      <div className={`embed-frame-container relative ${isFullscreen ? 'fullscreen-container' : ''}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <div className="loading-spinner mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading content...</p>
            </div>
          </div>
        )}
        
        {hasError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center p-6">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Failed to load content
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                The embedded content could not be loaded.
              </p>
              <button
                onClick={refreshFrame}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <iframe
            src={src}
            title={title}
            width="100%"
            height="100%"
            className="embed-frame border-0 rounded-b-lg"
            allowFullScreen={allowFullScreen}
            sandbox={sandbox}
            loading={loading}
            referrerPolicy={referrerPolicy}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
      </div>
      
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-all"
          aria-label="Exit fullscreen"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

// =============================================================================
// COMPREHENSIVE DEMO COMPONENT
// =============================================================================

export const UtilityDemo: React.FC = () => {
  const [userRole] = useState<string>('admin');
  const [userPermissions] = useState<string[]>(['read', 'write', 'export']);
  
  const sampleData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor' }
  ];

  return (
    <div className="utility-demo p-6 space-y-8 bg-white dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Professional Utility Components
      </h1>

      {/* Theme Switcher Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Theme Switchers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="font-medium mb-3">Toggle Switch</h3>
            <ThemeSwitcher variant="toggle" showLabel />
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="font-medium mb-3">Dropdown Menu</h3>
            <ThemeSwitcher variant="dropdown" />
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="font-medium mb-3">Minimal Button</h3>
            <ThemeSwitcher variant="minimal" />
          </div>
        </div>
      </section>

      {/* Access Control Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Access Control
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="font-medium mb-3">Admin Only Content</h3>
            <AccessControl
              roles={['admin']}
              userRole={userRole}
              fallback={<p className="text-red-500">Access denied: Admin role required</p>}
            >
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded text-green-800 dark:text-green-200">
                ✅ You have admin access!
              </div>
            </AccessControl>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="font-medium mb-3">Permission Based</h3>
            <AccessControl
              permissions={['export']}
              userPermissions={userPermissions}
              fallback={<p className="text-red-500">Export permission required</p>}
            >
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded text-blue-800 dark:text-blue-200">
                ✅ You can export data!
              </div>
            </AccessControl>
          </div>
        </div>
      </section>

      {/* Export Buttons Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Export Options
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="font-medium mb-3">Button Group</h3>
            <ExportButtons data={sampleData} variant="buttons" />
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="font-medium mb-3">Dropdown Menu</h3>
            <ExportButtons data={sampleData} variant="dropdown" />
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="font-medium mb-3">Minimal Style</h3>
            <ExportButtons data={sampleData} variant="minimal" />
          </div>
        </div>
      </section>

      {/* Embed Frame Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Embed Frames
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="font-medium mb-3">External Website</h3>
            <EmbedFrame
              src="https://example.com"
              title="Example Website"
              height="300px"
              allowFullScreen
              fallback={
                <div className="h-72 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Demo fallback content</p>
                </div>
              }
            />
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="font-medium mb-3">Video Embed</h3>
            <EmbedFrame
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Video Player"
              height="300px"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-presentation"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default UtilityDemo;
