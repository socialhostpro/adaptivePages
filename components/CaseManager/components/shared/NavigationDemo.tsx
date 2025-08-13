/**
 * Navigation Components Demo
 * Comprehensive examples of all navigation components with AI integration
 * Part of Phase 3: Navigation Components
 */
import React, { useState } from 'react';
import { Breadcrumb, Sidebar, Tabs } from './NavigationComponents';
import { MobileNavigation, Search, Filter } from './MobileNavigation';
import { NavigationItem, BreadcrumbItem, TabItem, SearchResult, FilterOption, NavigationConfig } from './types';
import { Button } from './ButtonComponents';
import { useNavigation } from './NavigationComponents';
import { useAiAgent } from './useAiAgent';
import { cn } from './utils';

// Sample data
const sampleNavigationConfig: NavigationConfig = {
  brand: {
    name: 'AdaptivePages',
    logo: '🚀',
    href: '/'
  },
  items: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: '📊',
      active: true
    },
    {
      id: 'products',
      label: 'Products',
      href: '/products',
      icon: '🛍️',
      badge: '12',
      badgeVariant: 'primary',
      children: [
        { id: 'add-product', label: 'Add Product', href: '/products/add', icon: '➕' },
        { id: 'categories', label: 'Categories', href: '/products/categories', icon: '📂' },
        { id: 'inventory', label: 'Inventory', href: '/products/inventory', icon: '📦', badge: '3', badgeVariant: 'warning' }
      ]
    },
    {
      id: 'orders',
      label: 'Orders',
      href: '/orders',
      icon: '📋',
      badge: '5',
      badgeVariant: 'success'
    },
    {
      id: 'customers',
      label: 'Customers',
      href: '/customers',
      icon: '👥'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      href: '/analytics',
      icon: '📈'
    }
  ],
  secondaryItems: [
    {
      id: 'settings',
      label: 'Settings',
      href: '/settings',
      icon: '⚙️'
    },
    {
      id: 'help',
      label: 'Help & Support',
      href: '/help',
      icon: '❓'
    }
  ],
  userMenu: [
    {
      id: 'profile',
      label: 'Profile',
      href: '/profile',
      icon: '👤'
    },
    {
      id: 'logout',
      label: 'Logout',
      href: '/logout',
      icon: '🚪'
    }
  ],
  collapsible: true,
  defaultCollapsed: false
};

const sampleBreadcrumbs: BreadcrumbItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  { id: 'products', label: 'Products', href: '/products' },
  { id: 'edit', label: 'Edit Product', current: true }
];

const sampleTabs: TabItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: '📊',
    content: <div className="p-4">Overview content here...</div>
  },
  {
    id: 'products',
    label: 'Products',
    icon: '🛍️',
    badge: '12',
    content: <div className="p-4">Products content here...</div>
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: '📋',
    badge: '5',
    badgeVariant: 'success',
    content: <div className="p-4">Orders content here...</div>
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: '⚙️',
    closeable: true,
    content: <div className="p-4">Settings content here...</div>
  }
];

const sampleSearchResults: SearchResult[] = [
  {
    id: '1',
    title: 'Product Management',
    description: 'Manage your product catalog',
    category: 'Pages',
    url: '/products',
    icon: '🛍️'
  },
  {
    id: '2',
    title: 'Order Dashboard',
    description: 'View and manage orders',
    category: 'Pages',
    url: '/orders',
    icon: '📋'
  },
  {
    id: '3',
    title: 'Customer Analytics',
    description: 'Analyze customer behavior',
    category: 'Analytics',
    url: '/analytics/customers',
    icon: '👥'
  },
  {
    id: '4',
    title: 'Settings',
    description: 'Application settings',
    category: 'Configuration',
    url: '/settings',
    icon: '⚙️'
  }
];

const sampleFilterOptions: FilterOption[] = [
  { id: 'active', label: 'Active Products', value: 'active', count: 45, icon: '✅' },
  { id: 'draft', label: 'Draft Products', value: 'draft', count: 12, icon: '📝' },
  { id: 'archived', label: 'Archived Products', value: 'archived', count: 8, icon: '📦' },
  { id: 'electronics', label: 'Electronics', value: 'electronics', count: 23, icon: '💻' },
  { id: 'clothing', label: 'Clothing', value: 'clothing', count: 34, icon: '👕' },
  { id: 'books', label: 'Books', value: 'books', count: 15, icon: '📚' }
];

export const NavigationDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<any[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { navigate, openTab, closeTab } = useNavigation();
  const { executeCommand } = useAiAgent({ 
    agentId: 'navigation-demo', 
    capabilities: ['navigation', 'tabs', 'search'] 
  });

  // Simulated search function
  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setSearchQuery(query);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const filtered = sampleSearchResults.filter(result =>
      result.title.toLowerCase().includes(query.toLowerCase()) ||
      result.description.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(filtered);
    setIsSearching(false);
  };

  // AI integration examples
  const handleAiNavigation = async () => {
    await executeCommand('navigate to products page');
  };

  const handleAiTabControl = async () => {
    await executeCommand('switch to orders tab');
  };

  const handleAiSearch = async () => {
    await executeCommand('search for customer analytics');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Mobile Navigation */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-2xl mr-3">🚀</span>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              AdaptivePages Navigation Demo
            </h1>
          </div>

          {/* Search */}
          <div className="hidden md:block w-96">
            <Search
              placeholder="Search pages, features, settings..."
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              results={searchResults}
              loading={isSearching}
              showResults={true}
              onResultClick={(result) => {
                console.log('Navigate to:', result.url);
                setSearchQuery('');
                setSearchResults([]);
              }}
              showCategories={true}
              autoFocus={false}
            />
          </div>

          {/* Mobile Navigation */}
          <MobileNavigation
            items={sampleNavigationConfig.items}
            brand={sampleNavigationConfig.brand}
            userMenu={sampleNavigationConfig.userMenu}
            activePath="/dashboard"
            isOpen={mobileMenuOpen}
            onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
            onClose={() => setMobileMenuOpen(false)}
          />

          {/* AI Control Buttons */}
          <div className="hidden lg:flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleAiNavigation}>
              AI Navigate
            </Button>
            <Button variant="outline" size="sm" onClick={handleAiTabControl}>
              AI Tab Control
            </Button>
            <Button variant="outline" size="sm" onClick={handleAiSearch}>
              AI Search
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <Sidebar
          config={sampleNavigationConfig}
          activePath="/dashboard"
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          position="left"
          width="280px"
        />

        {/* Main Content */}
        <main className={cn(
          'flex-1 transition-all duration-300',
          sidebarCollapsed ? 'ml-16' : 'ml-80'
        )}>
          {/* Breadcrumb */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <Breadcrumb
              items={sampleBreadcrumbs}
              separator="/"
              maxItems={5}
              showHome={true}
              responsive={true}
            />
          </div>

          {/* Content Area */}
          <div className="p-6">
            {/* Page Title */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Navigation Components Demo
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Comprehensive navigation system with AI integration capabilities
              </p>
            </div>

            {/* Tabs Demo */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Tab Navigation
              </h3>
              <Tabs
                items={sampleTabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onTabClose={(tabId) => {
                  console.log('Close tab:', tabId);
                }}
                variant="default"
                orientation="horizontal"
                scrollable={true}
                onAddTab={() => {
                  console.log('Add new tab');
                }}
                fullWidth={false}
              />
            </div>

            {/* Filter Demo */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Filter Component
              </h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <Filter
                  options={sampleFilterOptions}
                  selectedValues={selectedFilters}
                  onSelectionChange={setSelectedFilters}
                  title="Product Filters"
                  multiple={true}
                  searchable={true}
                  onClearAll={() => setSelectedFilters([])}
                  showCounts={true}
                  collapsible={true}
                  defaultCollapsed={false}
                />
              </div>
            </div>

            {/* Tab Variants Demo */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Tab Variants
              </h3>
              <div className="space-y-6">
                {/* Pills Variant */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Pills</h4>
                  <Tabs
                    items={sampleTabs.slice(0, 3)}
                    variant="pills"
                    orientation="horizontal"
                  />
                </div>

                {/* Underline Variant */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Underline</h4>
                  <Tabs
                    items={sampleTabs.slice(0, 3)}
                    variant="underline"
                    orientation="horizontal"
                  />
                </div>

                {/* Cards Variant */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Cards</h4>
                  <Tabs
                    items={sampleTabs.slice(0, 3)}
                    variant="cards"
                    orientation="horizontal"
                  />
                </div>

                {/* Vertical Tabs */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Vertical</h4>
                  <div className="max-w-2xl">
                    <Tabs
                      items={sampleTabs.slice(0, 3)}
                      variant="pills"
                      orientation="vertical"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Search Demo */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Search Component
              </h3>
              <div className="space-y-4">
                {/* Default Search */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Default</h4>
                  <Search
                    placeholder="Search anything..."
                    onSearch={(query) => console.log('Search:', query)}
                    results={searchResults}
                    showCategories={true}
                  />
                </div>

                {/* Right Icon Search */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Right Icon</h4>
                  <Search
                    placeholder="Search with right icon..."
                    iconPosition="right"
                    onSearch={(query) => console.log('Search:', query)}
                  />
                </div>

                {/* Loading Search */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Loading State</h4>
                  <Search
                    placeholder="Search with loading..."
                    loading={true}
                    onSearch={(query) => console.log('Search:', query)}
                  />
                </div>
              </div>
            </div>

            {/* AI Integration Examples */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                AI Integration Examples
              </h3>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h4 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-4">
                  Voice Commands & API Control
                </h4>
                <div className="space-y-3 text-blue-800 dark:text-blue-200">
                  <p><strong>Navigation:</strong> "Navigate to products page" → Programmatic navigation</p>
                  <p><strong>Tabs:</strong> "Switch to orders tab" → Tab control via AI</p>
                  <p><strong>Search:</strong> "Search for customer analytics" → AI-powered search</p>
                  <p><strong>Filters:</strong> "Show only active products" → Filter automation</p>
                  <p><strong>Breadcrumbs:</strong> Automatic updates based on AI navigation</p>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="primary" size="sm" onClick={handleAiNavigation}>
                    Test AI Navigation
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleAiTabControl}>
                    Test AI Tab Control
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleAiSearch}>
                    Test AI Search
                  </Button>
                </div>
              </div>
            </div>

            {/* Component Features */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Component Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Breadcrumb Features */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Breadcrumb</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Responsive collapsing</li>
                    <li>• Custom separators</li>
                    <li>• Icon support</li>
                    <li>• Home button</li>
                    <li>• Click handlers</li>
                  </ul>
                </div>

                {/* Sidebar Features */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Sidebar</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Collapsible design</li>
                    <li>• Nested navigation</li>
                    <li>• Badges & icons</li>
                    <li>• Mobile overlay</li>
                    <li>• Brand section</li>
                  </ul>
                </div>

                {/* Tabs Features */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Tabs</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Multiple variants</li>
                    <li>• Closeable tabs</li>
                    <li>• Vertical/horizontal</li>
                    <li>• Badge support</li>
                    <li>• Scrollable</li>
                  </ul>
                </div>

                {/* Search Features */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Search</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Real-time results</li>
                    <li>• Category grouping</li>
                    <li>• Keyboard navigation</li>
                    <li>• Loading states</li>
                    <li>• Auto-complete</li>
                  </ul>
                </div>

                {/* Filter Features */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Filter</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Multi-select</li>
                    <li>• Searchable options</li>
                    <li>• Option counts</li>
                    <li>• Collapsible</li>
                    <li>• Clear all</li>
                  </ul>
                </div>

                {/* Mobile Features */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Mobile</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Slide-out menu</li>
                    <li>• Touch-friendly</li>
                    <li>• Backdrop overlay</li>
                    <li>• Responsive design</li>
                    <li>• User menu</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NavigationDemo;
