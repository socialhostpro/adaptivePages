import { useState, useCallback, useEffect, useRef } from 'react';
import type { ManagedPage } from '../types';
import * as pageService from '../services/pageService';

interface PagesCacheState {
  pages: ManagedPage[];
  isLoading: boolean;
  lastFetched: number | null;
  error: string | null;
}

interface UsePagesCache {
  pages: ManagedPage[];
  isLoading: boolean;
  error: string | null;
  refreshPages: () => Promise<ManagedPage[]>;
  addPage: (page: ManagedPage) => void;
  updatePage: (updatedPage: ManagedPage) => void;
  removePage: (pageId: string) => void;
  clearCache: () => void;
  getPageById: (pageId: string) => ManagedPage | undefined;
}

const CACHE_KEY = 'adaptive-pages-cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Custom hook for persistent caching of pages data
 * Features:
 * - In-memory state for fast access
 * - localStorage persistence across sessions
 * - Automatic cache invalidation after 5 minutes
 * - Optimistic updates for better UX
 * - Individual page management (add, update, remove)
 */
export function usePagesCache(userId: string): UsePagesCache {
  console.log('🎯 usePagesCache hook called with userId:', userId);
  
  const [state, setState] = useState<PagesCacheState>(() => {
    // Initialize from localStorage if available and not expired
    try {
      const cached = localStorage.getItem(`${CACHE_KEY}-${userId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        const now = Date.now();
        
        // Check if cache is still valid (within CACHE_DURATION)
        if (parsed.lastFetched && (now - parsed.lastFetched) < CACHE_DURATION) {
          console.log('📦 Restored pages cache from localStorage:', parsed.pages.length, 'pages');
          return {
            pages: parsed.pages,
            isLoading: false,
            lastFetched: parsed.lastFetched,
            error: null
          };
        } else {
          console.log('⏰ Pages cache expired, will fetch fresh data');
        }
      }
    } catch (e) {
      console.warn('Failed to restore pages cache from localStorage:', e);
    }
    
    return {
      pages: [],
      isLoading: false,
      lastFetched: null,
      error: null
    };
  });

  const isInitialMount = useRef(true);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (state.pages.length > 0 && state.lastFetched) {
      try {
        localStorage.setItem(`${CACHE_KEY}-${userId}`, JSON.stringify({
          pages: state.pages,
          lastFetched: state.lastFetched
        }));
        console.log('💾 Saved pages cache to localStorage:', state.pages.length, 'pages');
      } catch (e) {
        console.warn('Failed to save pages cache to localStorage:', e);
      }
    }
  }, [state.pages, state.lastFetched, userId]);

  // Check if cache is expired
  const isCacheExpired = useCallback(() => {
    if (!state.lastFetched) return true;
    return (Date.now() - state.lastFetched) > CACHE_DURATION;
  }, [state.lastFetched]);

  // Fetch pages from server
  const refreshPages = useCallback(async (): Promise<ManagedPage[]> => {
    console.log('🔄 Fetching pages from server...');
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const pages = await pageService.getPages(userId);
      const now = Date.now();
      
      setState({
        pages,
        isLoading: false,
        lastFetched: now,
        error: null
      });
      
      console.log('✅ Pages fetched successfully:', pages.length, 'pages');
      return pages;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch pages';
      console.error('❌ Failed to fetch pages:', error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      throw error;
    }
  }, [userId]);

  // Auto-fetch on mount or when cache is expired
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      
      console.log('🔄 usePagesCache initializing for user:', userId);
      console.log('📊 Current cache state:', { 
        pagesCount: state.pages.length, 
        lastFetched: state.lastFetched, 
        isExpired: isCacheExpired() 
      });
      
      // Only fetch if we don't have cached data or if cache is expired
      if (state.pages.length === 0 || isCacheExpired()) {
        console.log('🚀 Fetching pages because cache is empty or expired');
        refreshPages().catch(e => {
          console.error('Initial pages fetch failed:', e);
        });
      } else {
        console.log('📋 Using cached pages data:', state.pages.length, 'pages');
      }
    }
  }, [refreshPages, isCacheExpired, state.pages.length]);

  // Optimistic update: add page
  const addPage = useCallback((page: ManagedPage) => {
    setState(prev => ({
      ...prev,
      pages: [...prev.pages, page]
    }));
    console.log('➕ Added page to cache:', page.name);
  }, []);

  // Optimistic update: update page
  const updatePage = useCallback((updatedPage: ManagedPage) => {
    setState(prev => ({
      ...prev,
      pages: prev.pages.map(page => 
        page.id === updatedPage.id ? updatedPage : page
      )
    }));
    console.log('📝 Updated page in cache:', updatedPage.name);
  }, []);

  // Optimistic update: remove page
  const removePage = useCallback((pageId: string) => {
    setState(prev => {
      const pageToRemove = prev.pages.find(p => p.id === pageId);
      return {
        ...prev,
        pages: prev.pages.filter(page => page.id !== pageId)
      };
    });
    console.log('🗑️ Removed page from cache:', pageId);
  }, []);

  // Clear cache completely
  const clearCache = useCallback(() => {
    setState({
      pages: [],
      isLoading: false,
      lastFetched: null,
      error: null
    });
    try {
      localStorage.removeItem(`${CACHE_KEY}-${userId}`);
      console.log('🧹 Cleared pages cache');
    } catch (e) {
      console.warn('Failed to clear cache from localStorage:', e);
    }
  }, [userId]);

  // Helper to get page by ID
  const getPageById = useCallback((pageId: string): ManagedPage | undefined => {
    return state.pages.find(page => page.id === pageId);
  }, [state.pages]);

  return {
    pages: state.pages,
    isLoading: state.isLoading,
    error: state.error,
    refreshPages,
    addPage,
    updatePage,
    removePage,
    clearCache,
    getPageById
  };
}
