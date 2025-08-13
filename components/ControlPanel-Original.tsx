

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

const SectionManager = ({ order, setOrder, isDisabled, onEditSection, setHasUnsavedChanges }: { order: string[], setOrder: (order: string[]) => void, isDisabled: boolean, onEditSection: (sectionKey: string) => void, setHasUnsavedChanges: (value: boolean) => void }) => {
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
        <fieldset disabled={isDisabled} className={isDisabled ? 'opacity-50' : ''}>
            <h3 className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Active Sections</h3>
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
                            className={`flex items-center space-x-2 p-1.5 rounded-md bg-gray-100 dark:bg-slate-700/50 ${draggedItem === key ? 'opacity-50' : ''} ${!isDeleting && !isDisabled ? 'cursor-grab active:cursor-grabbing' : ''}`}
                        >
                            <DragHandleIcon className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                            <span className="text-gray-700 dark:text-slate-300 text-sm flex-grow">{SECTIONS[key as keyof typeof SECTIONS] || key}</span>
                            
                            <button
                                type="button"
                                onClick={() => onEditSection(key)}
                                title={`Edit ${SECTIONS[key as keyof typeof SECTIONS]}`}
                                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50"
                                disabled={isDisabled}
                            >
                                <EditIcon className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                            </button>

                            {isDeleting ? (
                                <div className="flex items-center space-x-2 text-xs">
                                    <span className="font-semibold text-red-700 dark:text-red-400">Delete?</span>
                                    <button onClick={() => handleConfirmDelete(key)} className="px-2 py-0.5 rounded bg-red-500 text-white font-bold hover:bg-red-600">Yes</button>
                                    <button onClick={() => setDeletingSectionKey(null)} className="px-2 py-0.5 rounded bg-gray-200 dark:bg-slate-600 font-bold hover:bg-gray-300 dark:hover:bg-slate-500">No</button>
                                </div>
                            ) : (
                                <button onClick={() => setDeletingSectionKey(key)} title={`Remove ${SECTIONS[key as keyof typeof SECTIONS]}`}
                                  className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                                </button>
                            )}
                        </div>
                     )
                })}
                {order.length === 0 && <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-2">No sections added.</p>}
            </div>

            <div className="pt-3 border-t border-gray-200 dark:border-slate-700">
                <h3 className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Available Sections</h3>
                <div className="space-y-1">
                    {SECTION_CATEGORIES.map(category => (
                      <div key={category.name}>
                          <button onClick={() => setOpenCategory(openCategory === category.name ? null : category.name)} className="w-full flex justify-between items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700/60 text-left">
                            <span className="font-semibold text-sm text-gray-800 dark:text-slate-200">{category.name}</span>
                            <ChevronDownIcon className={`w-5 h-5 text-gray-500 dark:text-slate-400 transition-transform ${openCategory === category.name ? 'rotate-180' : ''}`} />
                          </button>
                          {openCategory === category.name && (
                            <div className="pt-2 pb-1 pl-4 space-y-2">
                                {category.items.map(({key, name}) => {
                                    return (
                                        <label key={key} className={`flex items-center space-x-2 cursor-pointer`}>
                                            <input type="checkbox"
                                                checked={order.includes(key)}
                                                onChange={(e) => handleSectionToggle(key, e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 dark:border-slate-500 text-indigo-600 focus:ring-indigo-500 bg-gray-100 dark:bg-slate-600 disabled:opacity-50"
                                            />
                                            <span className="text-gray-700 dark:text-slate-300 text-sm">{name}</span>
                                        </label>
                                    )
                                })}
                            </div>
                          )}
                      </div>
                    ))}
                </div>
            </div>
        </fieldset>
    );
};

const ControlPanel: React.FC<ControlPanelProps> = ({
  prompt, setPrompt, tone, setTone, palette, setPalette, industry, setIndustry,
  isLoading, onGenerate, themeMode, setThemeMode, isGenerated, onSaveProgress, onExportPage, saveStatus, hasUnsavedChanges,
  onShowDashboard, onShowSeoModal, onShowPublishModal, onShowAppSettingsModal, onShowPhase7Demo, sectionOrder, setSectionOrder, setHasUnsavedChanges, pageData, onShowAccount,
  activePage, onLoadSettings, onEditSection, oldSiteUrl, setOldSiteUrl, inspirationUrl, setInspirationUrl
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const panelRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleRef = dragHandleRef.current;
    if (!handleRef) return;

    const onMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('button')) return;
      
      const startX = e.clientX - position.x;
      const startY = e.clientY - position.y;
      
      const onMouseMove = (e: MouseEvent) => {
        let newX = e.clientX - startX;
        let newY = e.clientY - startY;
        const panelWidth = panelRef.current?.offsetWidth || 0;
        const panelHeight = panelRef.current?.offsetHeight || 0;

        newX = Math.max(0, Math.min(newX, window.innerWidth - panelWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - panelHeight));
        
        setPosition({ x: newX, y: newY });
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    handleRef.addEventListener('mousedown', onMouseDown);
    return () => handleRef.removeEventListener('mousedown', onMouseDown);
  }, [position.x, position.y]);
  
  const toggleTheme = () => {
      setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  };
  
  const generateButtonText = isGenerated ? 'Regenerate Page' : 'Generate Page';
  const generateButtonClasses = isGenerated 
    ? 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-400'
    : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';

  const handleEcomFeatureChange = (newKey: string) => {
      const ecomKeys = ECOM_FEATURES.map(f => f.key).filter(k => k !== 'none');
      let newOrder = sectionOrder.filter(s => !ecomKeys.includes(s));
      if (newKey !== 'none' && !newOrder.includes(newKey)) {
          const heroIndex = newOrder.indexOf('hero');
          if (heroIndex !== -1) {
              newOrder.splice(heroIndex + 1, 0, newKey);
          } else {
              newOrder.unshift(newKey);
          }
      }
      setSectionOrder(newOrder);
      setHasUnsavedChanges(true);
  };
  
  const currentEcomFeature = ECOM_FEATURES.find(f => sectionOrder.includes(f.key))?.key || 'none';

  const saveButtonText = useMemo(() => {
    if (saveStatus === 'saving') return 'Saving...';
    if (saveStatus === 'saved' && !hasUnsavedChanges) return 'Saved!';
    if (hasUnsavedChanges) return 'Update';
    return 'Save';
  }, [saveStatus, hasUnsavedChanges]);

  return (
    <aside
      ref={panelRef}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      className="fixed top-0 left-0 w-[400px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-2xl rounded-2xl flex flex-col transition-all duration-300 z-50 ring-1 ring-black/5 max-h-[90vh]"
    >
      <div
        ref={dragHandleRef}
        className="p-4 border-b border-gray-200/80 dark:border-slate-700/80 flex items-center justify-between cursor-grab active:cursor-grabbing flex-shrink-0"
      >
        <div className="flex items-center gap-3">
            <button onClick={onShowDashboard} title="My Pages" className="p-1.5 rounded-full hover:bg-gray-200/80 dark:hover:bg-slate-700/80">
                <GridIcon className="w-5 h-5 text-gray-600 dark:text-slate-300" />
            </button>
            <span className="text-lg font-bold text-gray-800 dark:text-slate-200 tracking-tight">AdaptivePages</span>
        </div>
        <div className="flex items-center gap-1">
            <button onClick={onShowPhase7Demo} title="Phase 7 Professional Components Demo" className="p-1.5 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-900/30 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20">
                <StarIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </button>
            <button onClick={onShowAccount} aria-label="My Account" className="p-1.5 rounded-full hover:bg-gray-200/80 dark:hover:bg-slate-700/80">
                <UserIcon className="w-5 h-5 text-gray-600 dark:text-slate-300" />
            </button>
            <button onClick={toggleTheme} className="p-1.5 rounded-full hover:bg-gray-200/80 dark:hover:bg-slate-700/80">
                {themeMode === 'light' ? <MoonIcon className="w-5 h-5 text-gray-600 dark:text-slate-300" /> : <SunIcon className="w-5 h-5 text-gray-600 dark:text-slate-300" />}
            </button>
            <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 rounded-full hover:bg-gray-200/80 dark:hover:bg-slate-700/80">
                {isMinimized ? <MaximizeIcon className="w-5 h-5 text-gray-600 dark:text-slate-300" /> : <MinimizeIcon className="w-5 h-5 text-gray-600 dark:text-slate-300" />}
            </button>
        </div>
      </div>

      {!isMinimized && (
          <>
            <div className="flex-grow p-4 space-y-4 overflow-y-auto min-h-0">
              <div>
                <EnhancedFormField
                    label="Your Concept"
                    value={prompt}
                    onChange={setPrompt}
                    context="A landing page concept or idea"
                    type="textarea"
                    rows={3}
                    placeholder="e.g., A mobile app for tracking personal finances..."
                />
                {activePage && activePage.generationConfig && (
                    <div className="text-right mt-1.5">
                        <button
                            type="button"
                            onClick={onLoadSettings}
                            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline focus:outline-none"
                            title={`Load generation settings from '${activePage.name}'`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M3 2v6h6"/><path d="M21 12A9 9 0 0 0 6 5.3L3 8"/><path d="M21 22v-6h-6"/><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/></svg>
                            Load page settings
                        </button>
                    </div>
                )}
              </div>

              <div className="space-y-3">
                  <div>
                      <label htmlFor="oldSiteUrl" className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Old Website URL (for content)</label>
                      <input id="oldSiteUrl" type="url" value={oldSiteUrl} onChange={(e) => setOldSiteUrl(e.target.value)} placeholder="Optional: https://example.com" className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500 transition bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"/>
                  </div>
                  <div>
                      <label htmlFor="inspirationUrl" className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Inspiration URL (for style)</label>
                      <input id="inspirationUrl" type="url" value={inspirationUrl} onChange={(e) => setInspirationUrl(e.target.value)} placeholder="Optional: https://dribbble.com/..." className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500 transition bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"/>
                  </div>
              </div>

              <div>
                <label htmlFor="industry" className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Industry</label>
                <select id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500 transition bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200">
                    {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                   <div>
                      <label htmlFor="tone" className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Tone</label>
                      <select id="tone" value={tone} onChange={(e) => setTone(e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500 transition bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200">
                          {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                  </div>
                  <div>
                      <label htmlFor="palette" className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Palette</label>
                      <select id="palette" value={palette} onChange={(e) => setPalette(e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500 transition bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200">
                          {PALETTES.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                  </div>
              </div>

              <div>
                <label htmlFor="ecom-feature" className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Primary Add-On</label>
                <select id="ecom-feature" value={currentEcomFeature} onChange={(e) => handleEcomFeatureChange(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500 transition bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200">
                    {ECOM_FEATURES.map((f) => <option key={f.key} value={f.key}>{f.name}</option>)}
                </select>
              </div>

              <SectionManager
                  order={sectionOrder}
                  setOrder={setSectionOrder}
                  isDisabled={isLoading}
                  onEditSection={onEditSection}
                  setHasUnsavedChanges={setHasUnsavedChanges}
              />
            </div>

            <div className="flex-shrink-0 p-4 border-t border-gray-200/80 dark:border-slate-700/80 space-y-3">
              <button onClick={onGenerate} disabled={isLoading}
                className={`w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${generateButtonClasses} disabled:bg-gray-400 dark:disabled:bg-slate-500 disabled:cursor-not-allowed transition-all`}
              >
                {isLoading ? ( <><LoaderIcon className="mr-2 h-5 w-5" /> Updating...</> ) : ( <><SparklesIcon className="mr-2 h-5 w-5" /> {generateButtonText}</> )}
              </button>
              <div className="grid grid-cols-2 gap-3">
                  <button onClick={onSaveProgress} disabled={!isGenerated || isLoading || (saveStatus === 'idle' && !hasUnsavedChanges)}
                      className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                      {saveStatus === 'saving' ? <LoaderIcon className="mr-2 h-4 w-4" /> : <SaveIcon className="mr-2 h-4 w-4" />}
                      {saveButtonText}
                  </button>
                   <button onClick={onExportPage} disabled={!isGenerated || isLoading}
                      className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                      <ExportIcon className="mr-2 h-4 w-4" />
                      Export
                  </button>
              </div>
               <div className="grid grid-cols-3 gap-3">
                  <button onClick={onShowSeoModal} disabled={!isGenerated || isLoading || !pageData?.seo}
                      className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                      <SeoIcon className="mr-2 h-4 w-4" />
                      SEO
                  </button>
                   <button onClick={onShowAppSettingsModal} disabled={!isGenerated || isLoading}
                      className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      Settings
                  </button>
                  <button onClick={onShowPublishModal} disabled={!isGenerated || isLoading}
                      className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                      <GlobeIcon className="mr-2 h-4 w-4" />
                      Publish
                  </button>
              </div>
            </div>
          </>
      )}
    </aside>
  );
};

export default ControlPanel;