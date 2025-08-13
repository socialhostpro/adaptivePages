import React, { useState, useRef, useEffect, useMemo } from 'react';
import { TONES, PALETTES, SECTIONS, SECTION_CATEGORIES, INDUSTRIES, ECOM_FEATURES } from '../constants';
import SparklesIcon from './icons/SparklesIcon';
import LoaderIcon from './icons/LoaderIcon';
import MinimizeIcon from './icons/MinimizeIcon';
import MaximizeIcon from './icons/MaximizeIcon';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import SaveIcon from './icons/SaveIcon';
import ExportIcon from './icons/ExportIcon';
import GridIcon from './icons/GridIcon';
import SeoIcon from './icons/SeoIcon';
import GlobeIcon from './icons/GlobeIcon';
import SettingsIcon from './icons/SettingsIcon';
import StarIcon from './icons/StarIcon';
import UserIcon from './icons/UserIcon';
import EditIcon from './icons/EditIcon';
import PlusIcon from './icons/PlusIcon';
import type { LandingPageData, ManagedPage } from '../types';

// Import shared components
import { Button, Input, Select, Checkbox } from './shared';
import { Card } from './shared/Card';

// Import new components
import GenerationWizard from './GenerationWizard';
import FloatingControlGroup from './FloatingControlGroup';
import type { LocalBusinessData } from './GenerationWizard';

interface EnhancedControlPanelProps {
  prompt: string;
  setPrompt: (value: string) => void;
  tone: string;
  setTone: (value: string) => void;
  palette: string;
  setPalette: (value: string) => void;
  industry: string;
  setIndustry: (value: string) => void;
  isLoading: boolean;
  onGenerate: () => void;
  themeMode: 'light' | 'dark';
  setThemeMode: (mode: 'light' | 'dark') => void;
  isGenerated: boolean;
  onSaveProgress: () => void;
  onExportPage: () => void;
  saveStatus: 'idle' | 'saving' | 'saved';
  hasUnsavedChanges: boolean;
  onShowDashboard: () => void;
  onShowSeoModal: () => void;
  onShowPublishModal: () => void;
  onShowAppSettingsModal: () => void;
  onShowPhase7Demo: () => void;
  sectionOrder: string[];
  setSectionOrder: (order: string[]) => void;
  setHasUnsavedChanges: (value: boolean) => void;
  pageData: LandingPageData | null;
  onShowAccount: () => void;
  activePage: ManagedPage | null;
  onLoadSettings: () => void;
  onEditSection: (sectionKey: string) => void;
  oldSiteUrl: string;
  setOldSiteUrl: (value: string) => void;
  inspirationUrl: string;
  setInspirationUrl: (value: string) => void;
  // SEO & Local Business props
  enableSeoMode?: boolean;
  localBusinessData?: LocalBusinessData;
  onLocalBusinessDataChange?: (data: LocalBusinessData) => void;
  onStartOver?: () => void;
}

const EnhancedControlPanel: React.FC<EnhancedControlPanelProps> = ({
  prompt, setPrompt, tone, setTone, palette, setPalette, industry, setIndustry,
  isLoading, onGenerate, themeMode, setThemeMode, isGenerated, onSaveProgress, 
  onExportPage, saveStatus, hasUnsavedChanges, onShowDashboard, onShowSeoModal, 
  onShowPublishModal, onShowAppSettingsModal, onShowPhase7Demo, sectionOrder, 
  setSectionOrder, setHasUnsavedChanges, pageData, onShowAccount, activePage, 
  onLoadSettings, onEditSection, oldSiteUrl, setOldSiteUrl, inspirationUrl, setInspirationUrl,
  enableSeoMode = false, localBusinessData, onLocalBusinessDataChange, onStartOver
}) => {
  const [showWizard, setShowWizard] = useState(!isGenerated);
  const [showFloatingControls, setShowFloatingControls] = useState(isGenerated);
  const [showClassicPanel, setShowClassicPanel] = useState(false);
  const [showGlobalColorModal, setShowGlobalColorModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);

  // Show wizard for first-time users or when explicitly requested
  useEffect(() => {
    if (!isGenerated && !showWizard) {
      setShowWizard(true);
    }
  }, [isGenerated, showWizard]);

  // Show floating controls after generation
  useEffect(() => {
    console.log('🔄 EnhancedControlPanel: isGenerated changed to:', isGenerated);
    if (isGenerated) {
      console.log('✅ Showing floating controls and hiding wizard');
      setShowFloatingControls(true);
      setShowWizard(false);
    }
  }, [isGenerated]);

  const handleGenerate = async () => {
    try {
      await onGenerate();
      // Let the useEffect handle closing wizard when isGenerated becomes true
      console.log('🎯 Generation completed in EnhancedControlPanel');
    } catch (error) {
      console.error('Generation failed in EnhancedControlPanel:', error);
      // Don't close wizard on failure so user can see error and retry
    }
  };

  const handleCloseWizard = () => {
    setShowWizard(false);
    if (!isGenerated) {
      setShowClassicPanel(true);
    }
  };

  const handleShowWizard = () => {
    setShowWizard(true);
    setShowClassicPanel(false);
  };

  const handleAddSection = () => {
    setShowAddSectionModal(true);
  };

  const handleToggleTheme = () => {
    setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  };

  // Add Section Modal Component
  const AddSectionModal = () => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const handleSectionAdd = (sectionKey: string) => {
      if (!sectionOrder.includes(sectionKey)) {
        setSectionOrder([...sectionOrder, sectionKey]);
        setHasUnsavedChanges(true);
      }
      setShowAddSectionModal(false);
    };

    if (!showAddSectionModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add Section
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddSectionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </Button>
            </div>
          </div>

          <div className="p-4 overflow-y-auto max-h-[60vh]">
            <div className="space-y-3">
              {SECTION_CATEGORIES.map(category => (
                <div key={category.name}>
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => setSelectedCategory(
                      selectedCategory === category.name ? null : category.name
                    )}
                    className="justify-between text-left"
                  >
                    <span className="font-medium">{category.name}</span>
                    <span className="text-xs text-gray-500">
                      {selectedCategory === category.name ? '−' : '+'}
                    </span>
                  </Button>
                  
                  {selectedCategory === category.name && (
                    <div className="mt-2 ml-4 space-y-2">
                      {category.items.map(({key, name}) => (
                        <Button
                          key={key}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSectionAdd(key)}
                          disabled={sectionOrder.includes(key)}
                          className="w-full justify-start text-sm"
                          icon={<PlusIcon className="w-3 h-3" />}
                        >
                          {name}
                          {sectionOrder.includes(key) && (
                            <span className="ml-auto text-xs text-green-600">Added</span>
                          )}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Classic Panel for fallback/advanced users
  const ClassicPanel = () => {
    if (!showClassicPanel) return null;

    return (
      <div className="fixed top-4 left-4 z-50 w-80 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Quick Generate
            </h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="xs"
                onClick={handleShowWizard}
                icon={<SparklesIcon className="w-4 h-4" />}
                title="Open Wizard"
              />
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setShowClassicPanel(false)}
                title="Close"
              >
                ✕
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <Input
            value={prompt}
            onChange={setPrompt}
            placeholder="Describe your page..."
            className="w-full"
          />
          
          <div className="grid grid-cols-1 gap-2">
            <Select
              value={tone}
              onChange={setTone}
              options={Object.entries(TONES).map(([key, value]) => ({ value: key, label: value }))}
              placeholder="Tone..."
            />
            
            <Select
              value={industry}
              onChange={setIndustry}
              options={Object.entries(INDUSTRIES).map(([key, value]) => ({ value: key, label: value }))}
              placeholder="Industry..."
            />
            
            <Select
              value={palette}
              onChange={setPalette}
              options={Object.entries(PALETTES).map(([key, value]) => ({ value: key, label: value }))}
              placeholder="Colors..."
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            loading={isLoading}
            fullWidth
            variant="primary"
            icon={!isLoading && <SparklesIcon className="w-4 h-4" />}
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Generation Wizard */}
      {showWizard && (
        <GenerationWizard
          prompt={prompt}
          setPrompt={setPrompt}
          tone={tone}
          setTone={setTone}
          palette={palette}
          setPalette={setPalette}
          industry={industry}
          setIndustry={setIndustry}
          oldSiteUrl={oldSiteUrl}
          setOldSiteUrl={setOldSiteUrl}
          inspirationUrl={inspirationUrl}
          setInspirationUrl={setInspirationUrl}
          isLoading={isLoading}
          onGenerate={handleGenerate}
          onClose={handleCloseWizard}
          enableSeoMode={enableSeoMode}
          localBusinessData={localBusinessData}
          onLocalBusinessDataChange={onLocalBusinessDataChange}
        />
      )}

      {/* Floating Control Group */}
      {!showWizard && (
        <FloatingControlGroup
          isVisible={showFloatingControls}
          onToggle={() => setShowFloatingControls(!showFloatingControls)}
          onShowWizard={handleShowWizard}
          onSave={onSaveProgress}
          onExport={onExportPage}
          onShowDashboard={onShowDashboard}
          onShowGlobalColors={() => setShowGlobalColorModal(true)}
          onShowGlobalSettings={onShowAppSettingsModal}
          onToggleTheme={handleToggleTheme}
          onAddSection={handleAddSection}
          onStartOver={onStartOver}
          themeMode={themeMode}
          saveStatus={saveStatus}
          hasUnsavedChanges={hasUnsavedChanges}
          isLoading={isLoading}
        />
      )}

      {/* Classic Panel */}
      <ClassicPanel />

      {/* Add Section Modal */}
      <AddSectionModal />

      {/* Quick Access Button for non-generated pages */}
      {!isGenerated && !showWizard && !showClassicPanel && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            variant="primary"
            size="lg"
            onClick={handleShowWizard}
            className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl"
            icon={<SparklesIcon className="w-6 h-6" />}
            title="Create Landing Page"
          />
        </div>
      )}

      {/* Status Indicator */}
      {saveStatus === 'saved' && (
        <div className="fixed bottom-6 left-6 z-40">
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
            ✓ Saved
          </div>
        </div>
      )}
    </>
  );
};

export default EnhancedControlPanel;
