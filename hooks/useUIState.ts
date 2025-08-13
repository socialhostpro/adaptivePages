import { useState, useCallback, useEffect } from 'react';

export interface UseUIStateReturn {
  // Theme
  themeMode: 'light' | 'dark';
  setThemeMode: (mode: 'light' | 'dark') => void;
  toggleTheme: () => void;
  
  // Loading states
  isLoading: false | string;
  setIsLoading: (loading: false | string) => void;
  isUpdatingSections: boolean;
  setIsUpdatingSections: (updating: boolean) => void;
  
  // Image generation
  regeneratingImages: string[];
  setRegeneratingImages: (images: string[]) => void;
  addRegeneratingImage: (imageKey: string) => void;
  removeRegeneratingImage: (imageKey: string) => void;
  
  // Error handling
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Generation configuration (localStorage persistence)
  prompt: string;
  setPrompt: (prompt: string) => void;
  tone: string;
  setTone: (tone: string) => void;
  palette: string;
  setPalette: (palette: string) => void;
  industry: string;
  setIndustry: (industry: string) => void;
  oldSiteUrl: string;
  setOldSiteUrl: (url: string) => void;
  inspirationUrl: string;
  setInspirationUrl: (url: string) => void;
}

export function useUIState(): UseUIStateReturn {
  // Theme
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
  
  // Loading states
  const [isLoading, setIsLoading] = useState<false | string>(false);
  const [isUpdatingSections, setIsUpdatingSections] = useState(false);
  
  // Image generation
  const [regeneratingImages, setRegeneratingImages] = useState<string[]>([]);
  
  // Error handling
  const [error, setError] = useState<string | null>(null);
  
  // Generation configuration with localStorage persistence
  const [prompt, setPromptState] = useState<string>(() => 
    localStorage.getItem('ai-lp-generator-prompt') || 
    'Create a professional landing page for my business'
  );
  
  const [tone, setToneState] = useState<string>(() => 
    localStorage.getItem('ai-lp-generator-tone') || 'Professional'
  );
  
  const [palette, setPaletteState] = useState<string>(() => 
    localStorage.getItem('ai-lp-generator-palette') || 'Blue & White'
  );
  
  const [industry, setIndustryState] = useState<string>(() => 
    localStorage.getItem('ai-lp-generator-industry') || 'Technology'
  );
  
  const [oldSiteUrl, setOldSiteUrl] = useState('');
  const [inspirationUrl, setInspirationUrl] = useState('');
  
  // Persist generation config to localStorage
  const setPrompt = useCallback((newPrompt: string) => {
    setPromptState(newPrompt);
    localStorage.setItem('ai-lp-generator-prompt', newPrompt);
  }, []);
  
  const setTone = useCallback((newTone: string) => {
    setToneState(newTone);
    localStorage.setItem('ai-lp-generator-tone', newTone);
  }, []);
  
  const setPalette = useCallback((newPalette: string) => {
    setPaletteState(newPalette);
    localStorage.setItem('ai-lp-generator-palette', newPalette);
  }, []);
  
  const setIndustry = useCallback((newIndustry: string) => {
    setIndustryState(newIndustry);
    localStorage.setItem('ai-lp-generator-industry', newIndustry);
  }, []);
  
  // Theme helpers
  const toggleTheme = useCallback(() => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  }, []);
  
  // Image generation helpers
  const addRegeneratingImage = useCallback((imageKey: string) => {
    setRegeneratingImages(prev => [...prev, imageKey]);
  }, []);
  
  const removeRegeneratingImage = useCallback((imageKey: string) => {
    setRegeneratingImages(prev => prev.filter(key => key !== imageKey));
  }, []);
  
  // Error helpers
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Auto-clear errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  return {
    // Theme
    themeMode,
    setThemeMode,
    toggleTheme,
    
    // Loading states
    isLoading,
    setIsLoading,
    isUpdatingSections,
    setIsUpdatingSections,
    
    // Image generation
    regeneratingImages,
    setRegeneratingImages,
    addRegeneratingImage,
    removeRegeneratingImage,
    
    // Error handling
    error,
    setError,
    clearError,
    
    // Generation configuration
    prompt,
    setPrompt,
    tone,
    setTone,
    palette,
    setPalette,
    industry,
    setIndustry,
    oldSiteUrl,
    setOldSiteUrl,
    inspirationUrl,
    setInspirationUrl
  };
}
