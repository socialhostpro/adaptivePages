
/**
 * @file App.tsx
 * @description This is the root component of the application. It handles routing between the public page viewer,
 * the authentication flow, and the main editor. It checks for custom domains and public page slugs to determine
 * which view to render.
 */

import React, { useState, useEffect } from 'react';
import type { Session, Subscription } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import Auth from './Auth';
import Editor from '../Editor';
import LoaderIcon from '../components/icons/LoaderIcon';
import PublicPageViewer from '../PublicPageViewer';
import { getPublicPageByDomain, getPublicPageBySlug } from './services/pageService';
import type { ManagedPage } from './types';

/**
 * The main application component that orchestrates routing and authentication state.
 * @returns {React.ReactElement} The rendered component.
 */
export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'loading' | 'auth' | 'editor' | 'public'>('loading');
  const [publicPageData, setPublicPageData] = useState<ManagedPage | null>(null);
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  
  useEffect(() => {
    let authListener: Subscription | null = null;

    const handleEditorFlow = async () => {
      try {
        console.log('[APP] Starting getSession...');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('[APP] getSession error:', error);
          throw error;
        }
        console.log('[APP] getSession success, session:', !!session);
        setSession(session);
        setView(session ? 'editor' : 'auth');
        setLoading(false);

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          console.log('[APP] Auth state change:', _event, !!session);
          setSession(session);
          setView(session ? 'editor' : 'auth');
        });
        authListener = subscription;
      } catch (error) {
        console.error('[APP] handleEditorFlow failed:', error);
        setView('auth');
        setLoading(false);
      }
    };

    const initializeRouting = async () => {
      console.log('[APP] initializeRouting start');
      const path = window.location.pathname;
      const hash = window.location.hash;
      const domain = window.location.hostname;
      const isEditorHost = domain === 'pages.imaginecapital.ai';
      const isLocal = domain === 'localhost' || domain.endsWith('.app.localhost') || domain.endsWith('127.0.0.1');
      
      console.log('[APP] Environment:', { path, hash, domain, isEditorHost, isLocal });
      
      // Priority 1: Custom Domain Check
      if (!isLocal && !isEditorHost && path === '/') {
        try {
          console.log('[APP] Checking custom domain:', domain);
          const page = await getPublicPageByDomain(domain);
          if (page) {
            console.log('[APP] Custom domain page found');
            setPublicPageData(page);
            setIsCustomDomain(true);
            setView('public');
            setLoading(false);
            return;
          } else {
            console.log('[APP] No page found for domain:', domain);
          }
        } catch (error) {
          console.warn('[APP] Custom domain check failed:', error);
        }
      }

      // Priority 2: Public Page Slug
      const hashMatch = hash.match(/^#\/([\w-]+)$/);
      if (hashMatch) {
          const slug = hashMatch[1];
          try {
              console.log('[APP] Checking slug:', slug);
              const page = await getPublicPageBySlug(slug);
              if (page) {
                  console.log('[APP] Slug page found');
                  setPublicPageData(page);
                  setIsCustomDomain(false);
                  setView('public');
                  setLoading(false);
                  return;
              } else {
                  console.log('[APP] No page found for slug:', slug);
              }
          } catch (error) {
              console.warn('[APP] Slug check failed:', error);
          }
      }

      // Fallback: Editor/Auth Flow
      console.log('[APP] Proceeding to auth/editor flow');
      handleEditorFlow();
    };

    initializeRouting();
    
    const handleHashChange = () => initializeRouting();
    window.addEventListener('hashchange', handleHashChange);

    return () => {
        window.removeEventListener('hashchange', handleHashChange);
        authListener?.unsubscribe();
    };

  }, []);

  if (loading || view === 'loading') {
      return (
          <div className="w-full h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900">
              <LoaderIcon className="w-12 h-12 text-indigo-500" />
          </div>
      );
  }

  if (view === 'public') {
      return <PublicPageViewer isCustomDomain={isCustomDomain} initialPageData={publicPageData} />;
  }

  if (view === 'auth') {
    return <Auth />;
  }
  
  if (view === 'editor' && session) {
    return <Editor session={session} />;
  }

  return <Auth />;
}