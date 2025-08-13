
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
import type { LandingPageData, ManagedPage } from '../types';
import DragHandleIcon from './icons/DragHandleIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import LockClosedIcon from './icons/LockClosedIcon';
import UserIcon from './icons/UserIcon';
import EnhancedFormField from './EnhancedFormField';
import EditIcon from './icons/EditIcon';

// Import shared components
import { Button, Input, Select, Checkbox } from './shared';
import { Card } from './shared/Card';

interface ControlPanelProps {
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
}

const SectionManager = ({ 
  order, 
  setOrder, 
  isDisabled, 
  onEditSection, 
  setHasUnsavedChanges 
}: { 
  order: string[];
  setOrder: (order: string[]) => void;
  isDisabled: boolean;
  onEditSection: (sectionKey: string) => void;
  setHasUnsavedChanges: (value: boolean) => void;
}) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [deletingSectionKey, setDeletingSectionKey] = useState<string | null>(null);

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, item: string) => {
    if (isDisabled) return;
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>, item: string) => {
    e.preventDefault();
    if (isDisabled || draggedItem === null || draggedItem === item) return;
    
    const newOrder = [...order];
    const draggedIndex = newOrder.indexOf(draggedItem);
    const targetIndex = newOrder.indexOf(item);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);
    
    setOrder(newOrder);
  };
  
  const onDragEnd = () => {
    setDraggedItem(null);
    setHasUnsavedChanges(true);
  };
  
  const handleSectionToggle = (sectionKey: string, isChecked: boolean) => {
    setOrder(
      isChecked
        ? [...order, sectionKey]
        : order.filter((s) => s !== sectionKey)
    );
    setHasUnsavedChanges(true);
  };

  const handleConfirmDelete = (key: string) => {
    handleSectionToggle(key, false);
    setDeletingSectionKey(null);
  };

  return (
    <Card className={isDisabled ? 'opacity-50' : ''}>
      <fieldset disabled={isDisabled}>
        <h3 className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
          Active Sections
        </h3>
        <div className="space-y-1 mb-4">
          {order.map(key => {
            const isDeleting = deletingSectionKey === key;
            return (
              <div
                key={key}
                draggable={!isDeleting && !isDisabled}
                onDragStart={(e) => onDragStart(e, key)}
                onDragOver={(e) => onDragOver(e, key)}
                onDragEnd={onDragEnd}
                className={`flex items-center space-x-2 p-1.5 rounded-md bg-gray-100 dark:bg-slate-700/50 ${
                  draggedItem === key ? 'opacity-50' : ''
                } ${!isDeleting && !isDisabled ? 'cursor-grab active:cursor-grabbing' : ''}`}
              >
                <DragHandleIcon className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                <span className="text-gray-700 dark:text-slate-300 text-sm flex-grow">
                  {SECTIONS[key as keyof typeof SECTIONS] || key}
                </span>
                
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onEditSection(key)}
                  disabled={isDisabled}
                  aria-label={`Edit ${SECTIONS[key as keyof typeof SECTIONS]}`}
                  icon={<EditIcon className="w-4 h-4" />}
                />

                {isDeleting ? (
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-semibold text-red-700 dark:text-red-400">Delete?</span>
                    <Button
                      variant="danger"
                      size="xs"
                      onClick={() => handleConfirmDelete(key)}
                    >
                      Yes
                    </Button>
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={() => setDeletingSectionKey(null)}
                    >
                      No
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setDeletingSectionKey(key)}
                    className="text-red-500 hover:text-red-700"
                    aria-label={`Remove ${SECTIONS[key as keyof typeof SECTIONS]}`}
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    }
                  />
                )}
              </div>
            );
          })}
          {order.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-2">
              No sections added.
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-gray-200 dark:border-slate-700">
          <h3 className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
            Available Sections
          </h3>
          <div className="space-y-1">
            {SECTION_CATEGORIES.map(category => (
              <div key={category.name}>
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => setOpenCategory(openCategory === category.name ? null : category.name)}
                  className="justify-between"
                  icon={
                    <ChevronDownIcon 
                      className={`w-5 h-5 transition-transform ${
                        openCategory === category.name ? 'rotate-180' : ''
                      }`} 
                    />
                  }
                  iconPosition="right"
                >
                  <span className="font-semibold text-sm">{category.name}</span>
                </Button>
                {openCategory === category.name && (
                  <div className="pt-2 pb-1 pl-4 space-y-2">
                    {category.items.map(({key, name}) => (
                      <label key={key} className="flex items-center space-x-2 cursor-pointer">
                        <Checkbox
                          checked={order.includes(key)}
                          onChange={(checked) => handleSectionToggle(key, checked)}
                          className="text-sm"
                        />
                        <span className="text-gray-700 dark:text-slate-300 text-sm">{name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </fieldset>
    </Card>
  );
};

const ControlPanel: React.FC<ControlPanelProps> = ({
  prompt, setPrompt, tone, setTone, palette, setPalette, industry, setIndustry,
  isLoading, onGenerate, themeMode, setThemeMode, isGenerated, onSaveProgress, 
  onExportPage, saveStatus, hasUnsavedChanges, onShowDashboard, onShowSeoModal, 
  onShowPublishModal, onShowAppSettingsModal, onShowPhase7Demo, sectionOrder, 
  setSectionOrder, setHasUnsavedChanges, pageData, onShowAccount, activePage, 
  onLoadSettings, onEditSection, oldSiteUrl, setOldSiteUrl, inspirationUrl, setInspirationUrl
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const panelRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  // Convert data to options format for shared Select components
  const toneOptions = useMemo(() => 
    Object.entries(TONES).map(([key, value]) => ({ value: key, label: value })),
    []
  );

  const paletteOptions = useMemo(() => 
    Object.entries(PALETTES).map(([key, value]) => ({ value: key, label: value })),
    []
  );

  const industryOptions = useMemo(() => 
    Object.entries(INDUSTRIES).map(([key, value]) => ({ value: key, label: value })),
    []
  );

  // Drag functionality (keeping existing logic)
  useEffect(() => {
    const handleRef = dragHandleRef.current;
    if (!handleRef) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startX = e.clientX - position.x;
      startY = e.clientY - position.y;
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = Math.max(0, Math.min(e.clientX - startX, window.innerWidth - 320));
      const newY = Math.max(0, Math.min(e.clientY - startY, window.innerHeight - 100));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      isDragging = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    handleRef.addEventListener('mousedown', handleMouseDown);
    return () => {
      handleRef.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [position]);

  return (
    <>
      {/* Floating Circle Button */}
      <div
        className="fixed z-50 w-12 h-12 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 rounded-full shadow-lg cursor-pointer flex items-center justify-center transition-all duration-200 hover:scale-110"
        style={{ right: 24, bottom: 24 }}
        onClick={() => setIsPanelVisible(!isPanelVisible)}
        title={isPanelVisible ? 'Hide AdaptivePages Panel' : 'Show AdaptivePages Panel'}
      >
        <SparklesIcon className="w-6 h-6 text-white" />
      </div>

      {/* Main Control Panel */}
      {isPanelVisible && (
        <div
          ref={panelRef}
          className="fixed z-50 w-80 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl"
          style={{ left: position.x, top: position.y }}
        >
      {/* Header */}
      <div 
        ref={dragHandleRef}
        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-750 border-b border-gray-200 dark:border-slate-700 rounded-t-lg cursor-move"
      >
        <div className="flex items-center space-x-2">
          <SparklesIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="font-semibold text-gray-900 dark:text-white">AdaptivePages</h2>
          {activePage && (
            <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded">
              {activePage.name}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
            icon={themeMode === 'light' ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
            aria-label={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}
          />
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setIsMinimized(!isMinimized)}
            icon={isMinimized ? <MaximizeIcon className="w-4 h-4" /> : <MinimizeIcon className="w-4 h-4" />}
            aria-label={isMinimized ? 'Expand panel' : 'Minimize panel'}
          />
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* AI Generation Section */}
          <Card title="AI Generation" padding="small">
            <div className="space-y-3">
              <Input
                value={prompt}
                onChange={setPrompt}
                placeholder="Describe your landing page..."
                className="w-full"
                aria-label="Page description prompt"
              />
              
              <div className="grid grid-cols-1 gap-3">
                <Select
                  value={tone}
                  onChange={setTone}
                  options={toneOptions}
                  placeholder="Select tone..."
                  aria-label="Tone selection"
                />
                
                <Select
                  value={palette}
                  onChange={setPalette}
                  options={paletteOptions}
                  placeholder="Select color palette..."
                  aria-label="Color palette selection"
                />
                
                <Select
                  value={industry}
                  onChange={setIndustry}
                  options={industryOptions}
                  placeholder="Select industry..."
                  aria-label="Industry selection"
                />
              </div>

              <Button
                onClick={onGenerate}
                disabled={isLoading || !prompt.trim()}
                loading={isLoading}
                fullWidth
                variant="primary"
                icon={!isLoading && <SparklesIcon className="w-4 h-4" />}
              >
                {isLoading ? 'Generating...' : 'Generate Page'}
              </Button>
            </div>
          </Card>

          {/* Section Management */}
          {isGenerated && (
            <SectionManager
              order={sectionOrder}
              setOrder={setSectionOrder}
              isDisabled={isLoading}
              onEditSection={onEditSection}
              setHasUnsavedChanges={setHasUnsavedChanges}
            />
          )}

          {/* Actions */}
          {isGenerated && (
            <Card title="Actions" padding="small">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={onSaveProgress}
                    disabled={isLoading || !hasUnsavedChanges}
                    variant="secondary"
                    size="sm"
                    loading={saveStatus === 'saving'}
                    icon={<SaveIcon className="w-4 h-4" />}
                  >
                    Save
                  </Button>
                  
                  <Button
                    onClick={onExportPage}
                    disabled={isLoading}
                    variant="secondary"
                    size="sm"
                    icon={<ExportIcon className="w-4 h-4" />}
                  >
                    Export
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <Button
                    onClick={onShowDashboard}
                    variant="outline"
                    size="sm"
                    icon={<GridIcon className="w-4 h-4" />}
                  >
                    Dashboard
                  </Button>
                  
                  <Button
                    onClick={onShowSeoModal}
                    variant="outline"
                    size="sm"
                    icon={<SeoIcon className="w-4 h-4" />}
                  >
                    SEO Settings
                  </Button>
                  
                  <Button
                    onClick={onShowPublishModal}
                    variant="outline"
                    size="sm"
                    icon={<GlobeIcon className="w-4 h-4" />}
                  >
                    Publish
                  </Button>
                  
                  <Button
                    onClick={onShowAppSettingsModal}
                    variant="outline"
                    size="sm"
                    icon={<SettingsIcon className="w-4 h-4" />}
                  >
                    Settings
                  </Button>
                  
                  <Button
                    onClick={onShowPhase7Demo}
                    variant="outline"
                    size="sm"
                    icon={<StarIcon className="w-4 h-4" />}
                  >
                    Component Library
                  </Button>
                </div>

                <Button
                  onClick={onShowAccount}
                  variant="ghost"
                  size="sm"
                  fullWidth
                  icon={<UserIcon className="w-4 h-4" />}
                >
                  Account
                </Button>
              </div>
            </Card>
          )}

          {/* Status */}
          {saveStatus === 'saved' && (
            <div className="text-xs text-green-600 dark:text-green-400 text-center">
              Changes saved successfully
            </div>
          )}
        </div>
      )}
    </div>
      )}
    </>
  );
};

export default ControlPanel;
