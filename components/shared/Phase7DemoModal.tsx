import React, { useState } from 'react';
import { X, Settings, Users, Download, Frame, Palette, Shield, Database, Layout, Code, Monitor, Tablet, Smartphone, Navigation, Grid3X3, BarChart3, Calendar, PieChart } from 'lucide-react';
import { ThemeProvider } from './UtilityComponents';
import {
  ThemeSwitcher,
  AccessControl,
  ExportButtons,
  EmbedFrame
} from './UtilityComponents';

// Import existing demo components
import UserInteractionDemo from './UserInteractionDemo';
import { Phase4Demo } from './Phase4Demo';

interface Phase7DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TabProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

type DeviceView = 'desktop' | 'tablet' | 'mobile';

export default function Phase7DemoModal({ isOpen, onClose }: Phase7DemoModalProps) {
  const [activeTab, setActiveTab] = useState('phase1');
  const [deviceView, setDeviceView] = useState<DeviceView>('desktop');

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getDeviceClasses = () => {
    switch (deviceView) {
      case 'mobile':
        return 'max-w-sm mx-auto';
      case 'tablet':
        return 'max-w-3xl mx-auto';
      case 'desktop':
      default:
        return 'w-full';
    }
  };

  const getDeviceScale = () => {
    switch (deviceView) {
      case 'mobile':
        return 'scale-75';
      case 'tablet':
        return 'scale-90';
      case 'desktop':
      default:
        return 'scale-100';
    }
  };

  const tabs: TabProps[] = [
    {
      id: 'phase1',
      label: 'Phase 1: Foundation',
      icon: <Settings className="w-4 h-4" />,
      content: (
        <div className={`${getDeviceClasses()} transform ${getDeviceScale()} transition-all duration-300`}>
          <div className="space-y-8 p-6">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-slate-600 to-gray-600 bg-clip-text text-transparent">
                Phase 1: Foundation Components
              </h3>
              <div className="space-y-8">
                <div>
                  <h4 className="text-lg font-semibold mb-4">Basic Form Elements</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Input Field</label>
                        <input 
                          type="text" 
                          placeholder="Enter your name" 
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email Field</label>
                        <input 
                          type="email" 
                          placeholder="your.email@example.com" 
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Select Dropdown</label>
                        <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                          <option>Select an option</option>
                          <option>Option 1</option>
                          <option>Option 2</option>
                          <option>Option 3</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Textarea</label>
                        <textarea 
                          placeholder="Enter your message" 
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-4">Button Variations</h4>
                  <div className="flex flex-wrap gap-4">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Primary</button>
                    <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">Secondary</button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">Success</button>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Danger</button>
                    <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">Warning</button>
                    <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Outline</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'phase2',
      label: 'Phase 2: Navigation',
      icon: <Navigation className="w-4 h-4" />,
      content: (
        <div className={`${getDeviceClasses()} transform ${getDeviceScale()} transition-all duration-300`}>
          <div className="space-y-8 p-6">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Phase 2: Navigation Components
              </h3>
              <div className="space-y-8">
                <div>
                  <h4 className="text-lg font-semibold mb-4">Navigation Bar</h4>
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <nav className="flex items-center justify-between">
                      <div className="flex items-center space-x-8">
                        <div className="text-xl font-bold text-blue-600">Logo</div>
                        <div className="hidden md:flex space-x-6">
                          <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors">Home</a>
                          <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors">About</a>
                          <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors">Services</a>
                          <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors">Contact</a>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">Login</button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Sign Up</button>
                      </div>
                    </nav>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-4">Breadcrumbs</h4>
                  <nav className="flex items-center space-x-2 text-sm">
                    <a href="#" className="text-blue-600 hover:text-blue-800">Home</a>
                    <span className="text-gray-400">/</span>
                    <a href="#" className="text-blue-600 hover:text-blue-800">Components</a>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-600 dark:text-gray-400">Navigation</span>
                  </nav>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-4">Tab Navigation</h4>
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex space-x-8">
                      <button className="py-2 px-1 border-b-2 border-blue-500 text-blue-600 font-medium">Tab 1</button>
                      <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">Tab 2</button>
                      <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">Tab 3</button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'phase3',
      label: 'Phase 3: Layout',
      icon: <Grid3X3 className="w-4 h-4" />,
      content: (
        <div className={`${getDeviceClasses()} transform ${getDeviceScale()} transition-all duration-300`}>
          <div className="space-y-8 p-6">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Phase 3: Layout Components
              </h3>
              <div className="space-y-8">
                <div>
                  <h4 className="text-lg font-semibold mb-4">Grid Layouts</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-6 rounded-lg text-center">
                      <h5 className="font-semibold">Column 1</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Grid item content</p>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-lg text-center">
                      <h5 className="font-semibold">Column 2</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Grid item content</p>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-6 rounded-lg text-center">
                      <h5 className="font-semibold">Column 3</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Grid item content</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-4">Card Layouts</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
                      <h5 className="text-lg font-semibold mb-3">Card Title</h5>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">Card description with some example content.</p>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Action</button>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
                      <h5 className="text-lg font-semibold mb-3">Another Card</h5>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">More card content with different actions.</p>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">Different Action</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'phase4',
      label: 'Phase 4: Data Display',
      icon: <BarChart3 className="w-4 h-4" />,
      content: (
        <div className={`${getDeviceClasses()} transform ${getDeviceScale()} transition-all duration-300`}>
          <Phase4Demo />
        </div>
      )
    },
    {
      id: 'phase5',
      label: 'Phase 5: Interactions',
      icon: <Users className="w-4 h-4" />,
      content: (
        <div className={`${getDeviceClasses()} transform ${getDeviceScale()} transition-all duration-300`}>
          <UserInteractionDemo />
        </div>
      )
    },
    {
      id: 'phase6',
      label: 'Phase 6: Advanced',
      icon: <PieChart className="w-4 h-4" />,
      content: (
        <div className={`${getDeviceClasses()} transform ${getDeviceScale()} transition-all duration-300`}>
          <div className="space-y-8 p-6">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
                Phase 6: Advanced Components
              </h3>
              <div className="space-y-8">
                <div>
                  <h4 className="text-lg font-semibold mb-4">Advanced Form Controls</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Multi-Select</label>
                        <div className="relative">
                          <select multiple className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" size={4}>
                            <option>Option 1</option>
                            <option>Option 2</option>
                            <option>Option 3</option>
                            <option>Option 4</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">File Upload</label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Drag & drop files or click to browse</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-4">Advanced UI Patterns</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-700">
                      <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">Modal Dialogs</h5>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">Interactive modal components</p>
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">Open Modal</button>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-200 dark:border-green-700">
                      <h5 className="font-semibold text-green-800 dark:text-green-200 mb-3">Tooltips</h5>
                      <p className="text-sm text-green-600 dark:text-green-400 mb-4">Contextual help and information</p>
                      <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors" title="This is a tooltip">Hover Me</button>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-700">
                      <h5 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">Popovers</h5>
                      <p className="text-sm text-purple-600 dark:text-purple-400 mb-4">Rich content overlays</p>
                      <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors">Show Popover</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'phase7',
      label: 'Phase 7: Professional',
      icon: <Palette className="w-4 h-4" />,
      content: (
        <div className={`${getDeviceClasses()} transform ${getDeviceScale()} transition-all duration-300`}>
          <div className="space-y-8 p-6">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Professional Theme Switchers
              </h3>
              <div className="grid gap-8">
                <div>
                  <h4 className="text-lg font-semibold mb-4">Toggle Style</h4>
                  <ThemeSwitcher variant="toggle" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-4">Dropdown Style</h4>
                  <ThemeSwitcher variant="dropdown" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-4">Minimal Style</h4>
                  <ThemeSwitcher variant="minimal" />
                </div>
              </div>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                Access Control & Utilities
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-4">Admin Access Control</h4>
                  <AccessControl requiredRole="admin">
                    <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                      <p className="text-green-800 dark:text-green-200">✓ This content is visible to admins only</p>
                    </div>
                  </AccessControl>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-4">Export Tools</h4>
                  <ExportButtons 
                    data={[
                      { name: 'John Doe', email: 'john@example.com', role: 'Admin' },
                      { name: 'Jane Smith', email: 'jane@example.com', role: 'Editor' }
                    ]}
                    filename="sample_data"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-4">Embed Frame</h4>
                  <EmbedFrame 
                    src="https://www.example.com"
                    title="Sample Embedded Content"
                    showControls={true}
                    allowFullscreen={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <ThemeProvider>
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        onClick={handleBackdropClick}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        
        {/* Modal Container */}
        <div className="relative w-full h-full max-w-full max-h-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          {/* Header */}
          <div className="relative z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                  AdaptivePages Component Library
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Complete enterprise-grade UI components - All phases for review & approval
                </p>
              </div>
              <div className="flex items-center gap-4">
                {/* Device View Switcher */}
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setDeviceView('desktop')}
                    className={`p-2 rounded transition-all ${
                      deviceView === 'desktop'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    title="Desktop View"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeviceView('tablet')}
                    className={`p-2 rounded transition-all ${
                      deviceView === 'tablet'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    title="Tablet View"
                  >
                    <Tablet className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeviceView('mobile')}
                    className={`p-2 rounded transition-all ${
                      deviceView === 'mobile'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    title="Mobile View"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={onClose}
                  className="p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                  aria-label="Close demo"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="mt-6 flex flex-wrap gap-2 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="h-full overflow-auto pb-20">
            <div className="min-h-full">
              {tabs.find(tab => tab.id === activeTab)?.content}
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
