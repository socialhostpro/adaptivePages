import React, { useState } from 'react';
import EnhancedControlPanel from './EnhancedControlPanel';
import SectionWrapper from './SectionWrapper';
import type { LandingPageData, ManagedPage } from '../types';
import type { LocalBusinessData } from './GenerationWizard';

// Demo component showing how to integrate the new control panel
const EnhancedControlPanelDemo: React.FC = () => {
  // State management
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('');
  const [palette, setPalette] = useState('');
  const [industry, setIndustry] = useState('');
  const [oldSiteUrl, setOldSiteUrl] = useState('');
  const [inspirationUrl, setInspirationUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [isGenerated, setIsGenerated] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  const [pageData, setPageData] = useState<LandingPageData | null>(null);
  const [activePage, setActivePage] = useState<ManagedPage | null>(null);
  const [isEditMode, setIsEditMode] = useState(true);
  const [enableSeoMode, setEnableSeoMode] = useState(false);
  const [localBusinessData, setLocalBusinessData] = useState<LocalBusinessData>({
    businessName: '',
    businessType: '',
    website: '',
    zipCode: '',
    address: '',
    phone: '',
    email: '',
    serviceAreaZips: [],
    brandTerms: [],
    targetKeywords: [],
    competitorUrls: [],
    primaryServices: [],
    uniqueSellingPoints: []
  });

  // Demo sections data
  const [sections, setSections] = useState([
    {
      key: 'hero',
      title: 'Hero Section',
      content: {
        heading: 'Welcome to Our Amazing Product',
        subheading: 'Transform your business with our innovative solution',
        cta: 'Get Started Today'
      }
    },
    {
      key: 'features',
      title: 'Features Section',
      content: {
        heading: 'Powerful Features',
        description: 'Discover what makes our product special'
      }
    },
    {
      key: 'testimonials',
      title: 'Testimonials',
      content: {
        heading: 'What Our Customers Say',
        description: 'Hear from satisfied customers who love our product'
      }
    }
  ]);

  // Handlers
  const handleGenerate = async () => {
    setIsLoading(true);
    
    // Simulate AI generation
    setTimeout(() => {
      setIsGenerated(true);
      setSectionOrder(['hero', 'features', 'testimonials']);
      // For demo purposes, we'll keep pageData simple
      setPageData(null);
      setIsLoading(false);
      setHasUnsavedChanges(true);
    }, 2000);
  };

  const handleSaveProgress = async () => {
    setSaveStatus('saving');
    
    // Simulate save
    setTimeout(() => {
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }, 1000);
  };

  const handleExportPage = () => {
    alert('Export functionality - Feature coming soon!');
  };

  const handleShowDashboard = () => {
    alert('Dashboard - Feature coming soon!');
  };

  const handleShowSeoModal = () => {
    alert('SEO Settings - Feature coming soon!');
  };

  const handleShowPublishModal = () => {
    alert('Publish Modal - Feature coming soon!');
  };

  const handleShowAppSettingsModal = () => {
    alert('App Settings - Feature coming soon!');
  };

  const handleShowPhase7Demo = () => {
    alert('Component Library - Feature coming soon!');
  };

  const handleShowAccount = () => {
    alert('Account Settings - Feature coming soon!');
  };

  const handleLoadSettings = () => {
    alert('Load Settings - Feature coming soon!');
  };

  const handleEditSection = (sectionKey: string) => {
    alert(`Edit section: ${sectionKey} - Opening section editor...`);
  };

  const handleMoveSection = (sectionKey: string, direction: 'up' | 'down') => {
    const currentIndex = sectionOrder.indexOf(sectionKey);
    if (currentIndex === -1) return;

    const newOrder = [...sectionOrder];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex >= 0 && targetIndex < newOrder.length) {
      [newOrder[currentIndex], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[currentIndex]];
      setSectionOrder(newOrder);
      setHasUnsavedChanges(true);
    }
  };

  const handleDeleteSection = (sectionKey: string) => {
    setSectionOrder(sectionOrder.filter(key => key !== sectionKey));
    setHasUnsavedChanges(true);
  };

  const handleUpdateSectionContent = (sectionKey: string, updates: Record<string, any>) => {
    setSections(sections.map(section => 
      section.key === sectionKey 
        ? { ...section, content: { ...section.content, ...updates } }
        : section
    ));
    setHasUnsavedChanges(true);
  };

  // Demo section components
  const renderSection = (sectionKey: string, index: number) => {
    const section = sections.find(s => s.key === sectionKey);
    if (!section) return null;

    const sectionProps = {
      sectionKey,
      sectionTitle: section.title,
      isFirst: index === 0,
      isLast: index === sectionOrder.length - 1,
      onEdit: () => handleEditSection(sectionKey),
      onMoveUp: () => handleMoveSection(sectionKey, 'up'),
      onMoveDown: () => handleMoveSection(sectionKey, 'down'),
      onDelete: () => handleDeleteSection(sectionKey),
      onUpdateContent: (updates: Record<string, any>) => handleUpdateSectionContent(sectionKey, updates),
      isEditMode
    };

    switch (sectionKey) {
      case 'hero':
        return (
          <SectionWrapper key={sectionKey} {...sectionProps} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-5xl font-bold mb-6">{section.content.heading}</h1>
              <p className="text-xl mb-8">{section.content.subheading}</p>
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                {section.content.cta}
              </button>
            </div>
          </SectionWrapper>
        );

      case 'features':
        return (
          <SectionWrapper key={sectionKey} {...sectionProps} className="py-20 bg-gray-50 dark:bg-slate-800">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{section.content.heading}</h2>
                <p className="text-xl text-gray-600 dark:text-slate-300">{section.content.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white dark:bg-slate-700 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Feature {i}</h3>
                    <p className="text-gray-600 dark:text-slate-300">Description of feature {i} goes here.</p>
                  </div>
                ))}
              </div>
            </div>
          </SectionWrapper>
        );

      case 'testimonials':
        return (
          <SectionWrapper key={sectionKey} {...sectionProps} className="py-20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{section.content.heading}</h2>
                <p className="text-xl text-gray-600 dark:text-slate-300">{section.content.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2].map(i => (
                  <div key={i} className="bg-white dark:bg-slate-700 p-6 rounded-lg shadow-md">
                    <p className="text-gray-600 dark:text-slate-300 mb-4">"This product changed everything for us!"</p>
                    <div className="font-semibold text-gray-900 dark:text-white">Customer {i}</div>
                  </div>
                ))}
              </div>
            </div>
          </SectionWrapper>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${themeMode === 'dark' ? 'dark' : ''}`}>
      {/* Enhanced Control Panel */}
      <EnhancedControlPanel
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
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        isGenerated={isGenerated}
        onSaveProgress={handleSaveProgress}
        onExportPage={handleExportPage}
        saveStatus={saveStatus}
        hasUnsavedChanges={hasUnsavedChanges}
        onShowDashboard={handleShowDashboard}
        onShowSeoModal={handleShowSeoModal}
        onShowPublishModal={handleShowPublishModal}
        onShowAppSettingsModal={handleShowAppSettingsModal}
        onShowPhase7Demo={handleShowPhase7Demo}
        sectionOrder={sectionOrder}
        setSectionOrder={setSectionOrder}
        setHasUnsavedChanges={setHasUnsavedChanges}
        pageData={pageData}
        onShowAccount={handleShowAccount}
        activePage={activePage}
        onLoadSettings={handleLoadSettings}
        onEditSection={handleEditSection}
        enableSeoMode={enableSeoMode}
        localBusinessData={localBusinessData}
        onLocalBusinessDataChange={setLocalBusinessData}
      />

      {/* Main Content */}
      <div className="bg-white dark:bg-slate-900 transition-colors duration-200">
        {!isGenerated ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to AdaptivePages
              </h1>
              <p className="text-xl text-gray-600 dark:text-slate-300 mb-8">
                Create stunning landing pages with AI
              </p>
              <p className="text-gray-500 dark:text-slate-400">
                Click the floating button to get started
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Toggle Edit Mode */}
            <div className="fixed top-4 left-4 z-40 space-y-2">
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors block ${
                  isEditMode 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                {isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
              </button>

              <button
                onClick={() => setEnableSeoMode(!enableSeoMode)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors block ${
                  enableSeoMode 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                {enableSeoMode ? 'SEO Mode: ON' : 'SEO Mode: OFF'}
              </button>

              {enableSeoMode && localBusinessData.businessName && (
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg text-sm max-w-64">
                  <div className="font-medium text-green-800 dark:text-green-300 mb-1">
                    SEO Business Profile
                  </div>
                  <div className="text-green-700 dark:text-green-400 space-y-1">
                    <div><strong>Business:</strong> {localBusinessData.businessName}</div>
                    <div><strong>Type:</strong> {localBusinessData.businessType}</div>
                    <div><strong>Location:</strong> {localBusinessData.zipCode}</div>
                    {localBusinessData.primaryServices.length > 0 && (
                      <div><strong>Services:</strong> {localBusinessData.primaryServices.slice(0, 2).join(', ')}{localBusinessData.primaryServices.length > 2 ? '...' : ''}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Generated Sections */}
            {sectionOrder.map((sectionKey, index) => renderSection(sectionKey, index))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedControlPanelDemo;
