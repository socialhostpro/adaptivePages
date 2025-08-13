import { useState, useCallback, useEffect } from 'react';
import type { LandingPageData, ImageStore, ManagedPage } from '../types';
import * as pageService from '../services/pageService';

export interface UsePageDataReturn {
  // Core page data
  activePage: ManagedPage | null;
  setActivePage: (page: ManagedPage | null) => void;
  landingPageData: LandingPageData | null;
  setLandingPageData: (data: LandingPageData | null) => void;
  images: ImageStore;
  setImages: (images: ImageStore) => void;
  sectionOrder: string[];
  setSectionOrder: (order: string[]) => void;
  
  // Save functionality
  saveStatus: 'idle' | 'saving' | 'saved';
  hasUnsavedChanges: boolean;
  saveCurrentPage: () => Promise<void>;
  
  // Page management
  loadPage: (pageId: string) => Promise<void>;
  createNewPage: (name: string) => Promise<ManagedPage>;
  updatePageData: (pageData: LandingPageData, imageData: ImageStore) => void;
}

export function usePageData(userId: string): UsePageDataReturn {
  // Core page state
  const [activePage, setActivePage] = useState<ManagedPage | null>(null);
  const [landingPageData, setLandingPageData] = useState<LandingPageData | null>(null);
  const [images, setImages] = useState<ImageStore>({});
  const [sectionOrder, setSectionOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('ai-lp-generator-section-order');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Save state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Auto-save section order to localStorage
  useEffect(() => {
    localStorage.setItem('ai-lp-generator-section-order', JSON.stringify(sectionOrder));
  }, [sectionOrder]);

  // Mark changes when data updates
  useEffect(() => {
    if (landingPageData && activePage) {
      setHasUnsavedChanges(true);
    }
  }, [landingPageData, images, activePage]);

  // Load a specific page
  const loadPage = useCallback(async (pageId: string) => {
    try {
      const page = await pageService.getFullPageData(pageId);
      if (page) {
        setActivePage(page);
        setLandingPageData(page.data);
        setImages(page.images || {});
        // Extract section order from page data
        const order = page.data ? Object.keys(page.data).filter(key => key !== 'metadata') : [];
        setSectionOrder(order);
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Failed to load page:', error);
      throw error;
    }
  }, []);

  // Save current page
  const saveCurrentPage = useCallback(async () => {
    if (!activePage || !landingPageData) return;

    setSaveStatus('saving');
    try {
      // Update the page object with current data
      const updatedPage: ManagedPage = {
        ...activePage,
        data: landingPageData,
        images: images,
        updatedAt: new Date().toISOString()
      };
      
      await pageService.savePage(updatedPage);
      
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      
      // Reset status after a delay
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
      console.error('Failed to save page:', error);
      throw error;
    }
  }, [activePage, landingPageData, images]);

  // Create new page
  const createNewPage = useCallback(async (name: string): Promise<ManagedPage> => {
    try {
      const newPage = await pageService.createPage(name, userId);

      setActivePage(newPage);
      setLandingPageData(newPage.data);
      setImages(newPage.images || {});
      setSectionOrder([]);
      setHasUnsavedChanges(false);

      return newPage;
    } catch (error) {
      console.error('Failed to create page:', error);
      throw error;
    }
  }, [userId]);

  // Update page data with change tracking
  const updatePageData = useCallback((pageData: LandingPageData, imageData: ImageStore) => {
    setLandingPageData(pageData);
    setImages(imageData);
    setHasUnsavedChanges(true);
  }, []);

  return {
    // Core page data
    activePage,
    setActivePage,
    landingPageData,
    setLandingPageData,
    images,
    setImages,
    sectionOrder,
    setSectionOrder,
    
    // Save functionality
    saveStatus,
    hasUnsavedChanges,
    saveCurrentPage,
    
    // Page management
    loadPage,
    createNewPage,
    updatePageData
  };
}
