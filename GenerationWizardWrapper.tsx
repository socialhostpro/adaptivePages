import React, { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import GenerationWizard, { LocalBusinessData } from './components/GenerationWizard';
import { TONES, PALETTES, INDUSTRIES, DEFAULT_PROMPT } from './constants';

interface GenerationWizardWrapperProps {
  session: Session;
  onPageCreated: (pageId: string) => void;
  onBackToDashboard: () => void;
  themeMode: 'light' | 'dark';
  setThemeMode: (mode: 'light' | 'dark') => void;
}

const GenerationWizardWrapper: React.FC<GenerationWizardWrapperProps> = ({
  session,
  onPageCreated,
  onBackToDashboard,
  themeMode,
  setThemeMode
}) => {
  console.log('🧙 GenerationWizardWrapper rendered');
  
  // Generation state
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [tone, setTone] = useState(TONES[0]);
  const [palette, setPalette] = useState(PALETTES[0]);
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [oldSiteUrl, setOldSiteUrl] = useState('');
  const [inspirationUrl, setInspirationUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Local business data for SEO
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

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      // Import the page service to actually create a page
      const pageService = await import('./services/pageService');
      
      // Create a real page with basic info first
      const pageName = `Generated Page - ${new Date().toLocaleString()}`;
      const newPage = await pageService.createPage(pageName, session.user.id);
      
      console.log('✅ Page created successfully:', newPage.id);
      
      // Store the page ID in localStorage so the Editor can pick it up
      localStorage.setItem('loadPageId', newPage.id);
      
      setIsLoading(false);
      onPageCreated(newPage.id);
    } catch (error) {
      console.error('Generation failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full">
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
        onClose={onBackToDashboard}
        localBusinessData={localBusinessData}
        onLocalBusinessDataChange={setLocalBusinessData}
        enableSeoMode={true}
      />
    </div>
  );
};

export default GenerationWizardWrapper;
