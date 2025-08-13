import React, { useState, useRef, useEffect } from 'react';
import { TONES, PALETTES, INDUSTRIES } from '../constants';
import type { LandingPageData, ManagedPage, ImageStore } from '../types';

// Icons from Heroicons
import {
  SparklesIcon,
  ArrowPathIcon as LoaderIcon,
  CogIcon as SettingsIcon,
  BookmarkIcon as SaveIcon,
  ArrowDownTrayIcon as ExportIcon,
  SunIcon,
  MoonIcon,
  GlobeAltIcon as GlobeIcon,
  Squares2X2Icon as GridIcon,
  MagnifyingGlassIcon as SeoIcon,
  PencilIcon as EditIcon,
  MinusIcon as MinimizeIcon,
  PlusIcon as MaximizeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface FloatingControlPanelProps {
  // Generation
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
  
  // Theme & UI
  themeMode: 'light' | 'dark';
  setThemeMode: (mode: 'light' | 'dark') => void;
  
  // Page Management
  isGenerated: boolean;
  pageData: LandingPageData | null;
  activePage: ManagedPage | null;
  hasUnsavedChanges: boolean;
  saveStatus: 'idle' | 'saving' | 'saved';
  
  // Actions
  onSaveProgress: () => void;
  onExportPage: () => void;
  onShowDashboard: () => void;
  onShowPublishModal: () => void;
  onShowSeoModal: () => void;
  onShowAppSettingsModal: () => void;
  onShowAccount: () => void;
  
  // Import Functions (Missing functionality we need to add)
  onImportFromUrl?: (url: string) => void;
  onImportFromFile?: (file: File) => void;
  onImportTemplate?: (templateId: string) => void;
  onDuplicatePage?: () => void;
  onResetPage?: () => void;
  
  // Media & Assets
  images?: ImageStore;
  onUploadImage?: (file: File) => void;
  onManageMedia?: () => void;
  
  // Additional missing functions
  onPreviewMode?: () => void;
  onFullscreenPreview?: () => void;
  onShowAnalytics?: () => void;
  onShowIntegrations?: () => void;
}

const FloatingControlPanel: React.FC<FloatingControlPanelProps> = ({
  prompt,
  setPrompt,
  tone,
  setTone,
  palette,
  setPalette,
  industry,
  setIndustry,
  isLoading,
  onGenerate,
  themeMode,
  setThemeMode,
  isGenerated,
  pageData,
  activePage,
  hasUnsavedChanges,
  saveStatus,
  onSaveProgress,
  onExportPage,
  onShowDashboard,
  onShowPublishModal,
  onShowSeoModal,
  onShowAppSettingsModal,
  onShowAccount,
  onImportFromUrl,
  onImportFromFile,
  onImportTemplate,
  onDuplicatePage,
  onResetPage,
  onUploadImage,
  onManageMedia,
  onPreviewMode,
  onFullscreenPreview,
  onShowAnalytics,
  onShowIntegrations
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'settings' | 'publish' | 'import' | 'media'>('generate');
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Dragging functionality
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === dragRef.current) {
      setIsDragging(true);
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImportFromFile) {
      onImportFromFile(file);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onUploadImage) {
      onUploadImage(file);
    }
  };

  const handleUrlImport = () => {
    if (urlInput && onImportFromUrl) {
      onImportFromUrl(urlInput);
      setUrlInput('');
    }
  };

  const getSaveStatusColor = () => {
    switch (saveStatus) {
      case 'saving': return 'text-yellow-600 bg-yellow-100';
      case 'saved': return 'text-green-600 bg-green-100';
      default: return hasUnsavedChanges ? 'text-orange-600 bg-orange-100' : 'text-gray-600 bg-gray-100';
    }
  };

  if (isMinimized) {
    return (
      <div 
        className="fixed bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg cursor-pointer transition-all duration-300 z-50"
        style={{ left: position.x, top: position.y }}
        onClick={() => setIsMinimized(false)}
      >
        <SparklesIcon className="w-6 h-6" />
      </div>
    );
  }

  return (
    <>
      <div
        ref={panelRef}
        className={`fixed bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 z-50 ${
          isExpanded ? 'w-96' : 'w-80'
        } ${themeMode === 'dark' ? 'dark' : ''}`}
        style={{ 
          left: position.x, 
          top: position.y,
          maxHeight: 'calc(100vh - 40px)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          ref={dragRef}
          className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white cursor-move"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center space-x-2">
            <SparklesIcon className="w-5 h-5" />
            <span className="font-semibold">AdaptivePages</span>
            {hasUnsavedChanges && <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <button
              onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
              className="p-1.5 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
              title={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}
            >
              {themeMode === 'light' ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
            </button>
            
            {/* Dashboard */}
            <button
              onClick={onShowDashboard}
              className="p-1.5 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
              title="Exit to Dashboard"
            >
              <GridIcon className="w-4 h-4" />
            </button>
            
            {/* Minimize/Maximize */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
              title={isExpanded ? 'Minimize' : 'Maximize'}
            >
              {isExpanded ? <MinimizeIcon className="w-4 h-4" /> : <MaximizeIcon className="w-4 h-4" />}
            </button>
            
            {/* Close */}
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-lg hover:bg-red-500 hover:bg-opacity-20 transition-colors"
              title="Minimize to icon"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className={`px-4 py-2 text-xs ${getSaveStatusColor()} border-b border-gray-200 dark:border-gray-700`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-current"></div>
              <span>
                {saveStatus === 'saving' ? 'Saving...' : 
                 saveStatus === 'saved' ? 'All changes saved' :
                 hasUnsavedChanges ? 'Unsaved changes' : 'Up to date'}
              </span>
            </div>
            {activePage && (
              <span className="text-gray-600 dark:text-gray-400">
                {activePage.title || 'Untitled Page'}
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'generate', label: 'Generate', icon: <SparklesIcon className="w-4 h-4" /> },
            { id: 'import', label: 'Import', icon: <ExportIcon className="w-4 h-4 transform rotate-180" /> },
            { id: 'media', label: 'Media', icon: <EditIcon className="w-4 h-4" /> },
            { id: 'publish', label: 'Publish', icon: <GlobeIcon className="w-4 h-4" /> },
            { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-1 py-2 px-2 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600 dark:text-blue-400 dark:bg-blue-900'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:block">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {/* Generate Tab */}
          {activeTab === 'generate' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What do you want to create?
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your landing page... (e.g., A modern SaaS landing page for a project management tool)"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    title="Select tone for the page"
                  >
                    {TONES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Colors
                  </label>
                  <select
                    value={palette}
                    onChange={(e) => setPalette(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    title="Select color palette"
                  >
                    {PALETTES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Industry
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  title="Select industry"
                >
                  {INDUSTRIES.map(i => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={onGenerate}
                disabled={isLoading || !prompt.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <LoaderIcon className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4" />
                    <span>Generate Page</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Import Tab */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Import Options</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="url-input">
                      Import from URL
                    </label>
                    <div className="flex space-x-2">
                      <input
                        id="url-input"
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://example.com"
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <button
                        onClick={handleUrlImport}
                        disabled={!urlInput.trim()}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                      >
                        Import
                      </button>
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors dark:border-gray-600 dark:text-gray-400"
                    >
                      Import from File (HTML, JSON)
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".html,.json,.txt"
                      onChange={handleFileImport}
                      className="sr-only"
                      title="Import file"
                      aria-label="Import file"
                    />
                  </div>

                  <button
                    onClick={() => onImportTemplate?.('default')}
                    className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Choose from Templates
                  </button>

                  <div className="border-t pt-3 mt-3">
                    <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Page Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={onDuplicatePage}
                        className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-xs hover:bg-green-200 transition-colors"
                      >
                        Duplicate
                      </button>
                      <button
                        onClick={onResetPage}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-xs hover:bg-red-200 transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Media Management</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors dark:border-gray-600 dark:text-gray-400"
                  >
                    Upload Images
                  </button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="sr-only"
                    title="Upload images"
                    aria-label="Upload images"
                  />

                  <button
                    onClick={onManageMedia}
                    className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors dark:bg-blue-900 dark:text-blue-300"
                  >
                    Manage Media Library
                  </button>

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Supported: JPG, PNG, GIF, WebP (Max 10MB)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Publish Tab */}
          {activeTab === 'publish' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onSaveProgress}
                  disabled={saveStatus === 'saving'}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center justify-center space-x-1 disabled:bg-gray-400"
                >
                  <SaveIcon className="w-4 h-4" />
                  <span>Save</span>
                </button>
                
                <button
                  onClick={onShowPublishModal}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                >
                  <GlobeIcon className="w-4 h-4" />
                  <span>Publish</span>
                </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={onShowSeoModal}
                  className="w-full px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition-colors flex items-center justify-center space-x-1"
                >
                  <SeoIcon className="w-4 h-4" />
                  <span>SEO Settings</span>
                </button>

                <button
                  onClick={onExportPage}
                  className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1 dark:bg-gray-700 dark:text-gray-300"
                >
                  <ExportIcon className="w-4 h-4" />
                  <span>Export HTML</span>
                </button>

                <button
                  onClick={onPreviewMode}
                  className="w-full px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200 transition-colors"
                >
                  Preview Mode
                </button>

                <button
                  onClick={onFullscreenPreview}
                  className="w-full px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200 transition-colors"
                >
                  Fullscreen Preview
                </button>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onShowAppSettingsModal}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-300"
                >
                  App Settings
                </button>
                
                <button
                  onClick={onShowAccount}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                >
                  Account
                </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={onShowAnalytics}
                  className="w-full px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
                >
                  Analytics
                </button>

                <button
                  onClick={onShowIntegrations}
                  className="w-full px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition-colors"
                >
                  Integrations
                </button>
              </div>

              <div className="border-t pt-3 mt-3">
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <div>Version: 2.0.0</div>
                  <div>Last Updated: {new Date().toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FloatingControlPanel;
