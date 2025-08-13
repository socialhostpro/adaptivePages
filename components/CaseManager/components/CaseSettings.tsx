'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Package, 
  Image, 
  FolderTree, 
  Globe, 
  Users, 
  Shield, 
  Bell, 
  Palette,
  Database,
  Save,
  Plus,
  X,
  Edit,
  Trash2
} from 'lucide-react';

type SettingsSection = 'general' | 'stock-media' | 'page-groups' | 'global' | 'users' | 'security' | 'notifications';

interface StockItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
  size: string;
  uploadDate: string;
}

interface PageGroup {
  id: string;
  name: string;
  description: string;
  pages: number;
  lastModified: string;
}

export function CaseSettings() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  const [stockItems, setStockItems] = useState<StockItem[]>([
    {
      id: '1',
      name: 'company-logo.png',
      type: 'image',
      url: '/assets/logo.png',
      size: '245 KB',
      uploadDate: '2024-01-15'
    },
    {
      id: '2',
      name: 'case-template.pdf',
      type: 'document',
      url: '/assets/template.pdf',
      size: '1.2 MB',
      uploadDate: '2024-01-14'
    }
  ]);

  const [pageGroups, setPageGroups] = useState<PageGroup[]>([
    {
      id: '1',
      name: 'Criminal Defense',
      description: 'Templates for criminal defense cases',
      pages: 12,
      lastModified: '2024-01-15'
    },
    {
      id: '2',
      name: 'Corporate Law',
      description: 'Business and corporate legal templates',
      pages: 8,
      lastModified: '2024-01-14'
    }
  ]);

  const settingsNavigation = [
    {
      name: 'General Settings',
      icon: Settings,
      section: 'general' as SettingsSection
    },
    {
      name: 'Stock & Media',
      icon: Package,
      section: 'stock-media' as SettingsSection
    },
    {
      name: 'Page Groups',
      icon: FolderTree,
      section: 'page-groups' as SettingsSection
    },
    {
      name: 'Global Settings',
      icon: Globe,
      section: 'global' as SettingsSection
    },
    {
      name: 'User Management',
      icon: Users,
      section: 'users' as SettingsSection
    },
    {
      name: 'Security',
      icon: Shield,
      section: 'security' as SettingsSection
    },
    {
      name: 'Notifications',
      icon: Bell,
      section: 'notifications' as SettingsSection
    }
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Firm Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Firm Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              defaultValue="Smith & Associates Law Firm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Primary Contact
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              defaultValue="admin@smithlaw.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              defaultValue="(555) 123-4567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Bar Association ID
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              defaultValue="BAR-12345"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Dark Mode
              </label>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Use dark theme across the application
              </p>
            </div>
            <input type="checkbox" className="rounded" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Email Notifications
              </label>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Receive email notifications for case updates
              </p>
            </div>
            <input type="checkbox" className="rounded" defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStockMedia = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Stock & Media Library</h3>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Upload Media
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Upload Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {stockItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.type === 'image' && <Image className="w-4 h-4 mr-2 text-blue-500" />}
                      {item.type === 'document' && <Database className="w-4 h-4 mr-2 text-green-500" />}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.type === 'image' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                    {item.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                    {item.uploadDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-2"
                      title="Edit item"
                      aria-label="Edit item"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      title="Delete item"
                      aria-label="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPageGroups = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Page Groups</h3>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pageGroups.map((group) => (
          <div key={group.id} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <FolderTree className="w-8 h-8 text-blue-500 mr-3" />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {group.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    {group.description}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                  title="Edit group"
                  aria-label="Edit group"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  className="text-red-600 hover:text-red-900 dark:text-red-400"
                  title="Delete group"
                  aria-label="Delete group"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">
                  {group.pages} pages
                </span>
                <span className="text-gray-500 dark:text-slate-400">
                  Modified {group.lastModified}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGlobalSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Global Application Settings</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Application Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              defaultValue="AdaptivePages Legal Suite"
            />
          </div>
          
          <div>
            <label htmlFor="default-theme" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Default Theme
            </label>
            <select 
              id="default-theme"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option>Light</option>
              <option>Dark</option>
              <option>System</option>
            </select>
          </div>

          <div>
            <label htmlFor="default-language" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Default Language
            </label>
            <select 
              id="default-language"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option>English (US)</option>
              <option>English (UK)</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </div>

          <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">System Limits</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Max File Upload Size (MB)
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  defaultValue="50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  defaultValue="30"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'stock-media':
        return renderStockMedia();
      case 'page-groups':
        return renderPageGroups();
      case 'global':
        return renderGlobalSettings();
      default:
        return (
          <div className="text-center py-12">
            <Settings className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              {settingsNavigation.find(nav => nav.section === activeSection)?.name}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              This section is under development.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-full bg-gray-50 dark:bg-slate-900">
      {/* Settings Navigation */}
      <div className="w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex-shrink-0">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h2>
        </div>
        <nav className="px-2">
          {settingsNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.section}
                onClick={() => setActiveSection(item.section)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 ${
                  activeSection === item.section
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Settings Content */}
      <div className="flex-1 p-6 overflow-auto">
        {renderContent()}
        
        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
