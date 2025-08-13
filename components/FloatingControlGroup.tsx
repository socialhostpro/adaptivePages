import React, { useState } from 'react';
import FloatingActionButton from './FloatingActionButton';
import { Button } from './shared';
import SparklesIcon from './icons/SparklesIcon';
import SettingsIcon from './icons/SettingsIcon';
import PaletteIcon from './icons/PaletteIcon';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import SaveIcon from './icons/SaveIcon';
import ExportIcon from './icons/ExportIcon';
import GridIcon from './icons/GridIcon';
import PlusIcon from './icons/PlusIcon';
import RefreshIcon from './icons/RefreshIcon';

interface FloatingControlGroupProps {
  isVisible: boolean;
  onToggle: () => void;
  onShowWizard: () => void;
  onSave: () => void;
  onExport: () => void;
  onShowDashboard: () => void;
  onShowGlobalColors: () => void;
  onShowGlobalSettings: () => void;
  onToggleTheme: () => void;
  onAddSection: () => void;
  onStartOver?: () => void;
  themeMode: 'light' | 'dark';
  saveStatus: 'idle' | 'saving' | 'saved';
  hasUnsavedChanges: boolean;
  isLoading?: boolean;
}

const FloatingControlGroup: React.FC<FloatingControlGroupProps> = ({
  isVisible,
  onToggle,
  onShowWizard,
  onSave,
  onExport,
  onShowDashboard,
  onShowGlobalColors,
  onShowGlobalSettings,
  onToggleTheme,
  onAddSection,
  onStartOver,
  themeMode,
  saveStatus,
  hasUnsavedChanges,
  isLoading = false
}) => {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const toggleGroup = (groupName: string) => {
    setExpandedGroup(expandedGroup === groupName ? null : groupName);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Main Toggle Button */}
      <div className="relative">
        <FloatingActionButton
          onClick={onToggle}
          size="lg"
          variant={isVisible ? "close" : "sparkles"}
          className={`transition-all duration-300 ${isVisible ? 'rotate-45' : ''}`}
          aria-label={isVisible ? 'Hide Controls' : 'Show Controls'}
        />

        {/* Expanded Controls */}
        {isVisible && (
          <div className="absolute bottom-16 right-0 space-y-3">
            {/* Content Controls */}
            <div className="relative">
              <Button
                variant="secondary"
                size="md"
                onClick={() => toggleGroup('content')}
                className="w-12 h-12 rounded-full shadow-lg"
                icon={<PlusIcon className="w-5 h-5" />}
                title="Content Controls"
              />
              
              {expandedGroup === 'content' && (
                <div className="absolute bottom-0 right-14 flex flex-col space-y-2 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onShowWizard}
                    icon={<SparklesIcon className="w-4 h-4" />}
                    className="whitespace-nowrap"
                  >
                    New Page Wizard
                  </Button>
                  
                  {onStartOver && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Start over? This will clear your current page and return to the wizard.')) {
                          onStartOver();
                        }
                      }}
                      icon={<RefreshIcon className="w-4 h-4" />}
                      className="whitespace-nowrap text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                    >
                      Start Over
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onAddSection}
                    icon={<PlusIcon className="w-4 h-4" />}
                    className="whitespace-nowrap"
                  >
                    Add Section
                  </Button>
                </div>
              )}
            </div>

            {/* Design Controls */}
            <div className="relative">
              <Button
                variant="secondary"
                size="md"
                onClick={() => toggleGroup('design')}
                className="w-12 h-12 rounded-full shadow-lg"
                icon={<PaletteIcon className="w-5 h-5" />}
                title="Design Controls"
              />
              
              {expandedGroup === 'design' && (
                <div className="absolute bottom-0 right-14 flex flex-col space-y-2 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onShowGlobalColors}
                    icon={<PaletteIcon className="w-4 h-4" />}
                    className="whitespace-nowrap"
                  >
                    Global Colors
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleTheme}
                    icon={themeMode === 'light' ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
                    className="whitespace-nowrap"
                  >
                    {themeMode === 'light' ? 'Dark Mode' : 'Light Mode'}
                  </Button>
                </div>
              )}
            </div>

            {/* Save/Export Controls */}
            <div className="relative">
              <Button
                variant="secondary"
                size="md"
                onClick={onSave}
                disabled={isLoading || !hasUnsavedChanges}
                loading={saveStatus === 'saving'}
                className={`w-12 h-12 rounded-full shadow-lg ${
                  hasUnsavedChanges 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                    : saveStatus === 'saved'
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : ''
                }`}
                icon={<SaveIcon className="w-5 h-5" />}
                title={
                  hasUnsavedChanges 
                    ? 'Save Changes' 
                    : saveStatus === 'saved' 
                    ? 'Saved' 
                    : 'No Changes'
                }
              />
            </div>

            {/* Export Button */}
            <div className="relative">
              <Button
                variant="secondary"
                size="md"
                onClick={onExport}
                disabled={isLoading}
                className="w-12 h-12 rounded-full shadow-lg"
                icon={<ExportIcon className="w-5 h-5" />}
                title="Export Page"
              />
            </div>

            {/* Settings Controls */}
            <div className="relative">
              <Button
                variant="secondary"
                size="md"
                onClick={() => toggleGroup('settings')}
                className="w-12 h-12 rounded-full shadow-lg"
                icon={<SettingsIcon className="w-5 h-5" />}
                title="Settings"
              />
              
              {expandedGroup === 'settings' && (
                <div className="absolute bottom-0 right-14 flex flex-col space-y-2 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onShowDashboard}
                    icon={<GridIcon className="w-4 h-4" />}
                    className="whitespace-nowrap"
                  >
                    Dashboard
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onShowGlobalSettings}
                    icon={<SettingsIcon className="w-4 h-4" />}
                    className="whitespace-nowrap"
                  >
                    Global Settings
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close expanded groups */}
      {expandedGroup && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setExpandedGroup(null)}
        />
      )}
    </div>
  );
};

export default FloatingControlGroup;
