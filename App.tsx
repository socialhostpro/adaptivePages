
import React, { useState, useEffect } from 'react';
import type { Session, AuthSubscription as Subscription } from '@supabase/supabase-js';
import { supabase } from './services/supabase';
import Auth from './Auth';
import Editor from './Editor';
import LoaderIcon from './components/icons/LoaderIcon';
import PublicPageViewer from './PublicPageViewer';
import { getPublicPageByDomain, getPublicPageBySlug } from './services/pageService';
import type { ManagedPage } from './types';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'loading' | 'auth' | 'editor' | 'public'>('loading');
  const [publicPageData, setPublicPageData] = useState<ManagedPage | null>(null);
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  
  useEffect(() => {
    let authListener: Subscription | null = null;

    const handleEditorFlow = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setView(session ? 'editor' : 'auth');
      setLoading(false);

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setView(session ? 'editor' : 'auth');
      });
      authListener = subscription;
    };

    const initializeRouting = async () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const domain = window.location.hostname;
      const isEditorHost = domain === 'pages.imaginecapital.ai';
      const isLocal = domain === 'localhost' || domain.endsWith('.app.localhost') || domain.endsWith('127.0.0.1');
      
      // Priority 1: Custom Domain Check
      if (!isLocal && !isEditorHost && path === '/') {
        try {
          const page = await getPublicPageByDomain(domain);
          if (page) {
            setPublicPageData(page);
            setIsCustomDomain(true);
            setView('public');
            setLoading(false);
            return;
          }
        } catch (error) {
           console.warn("Could not check for custom domain. Proceeding to editor.", error);
        }
      }

      // Priority 2: Public Page Slug
      const hashMatch = hash.match(/^#\/([\w-]+)$/);
      if (hashMatch) {
          const slug = hashMatch[1];
          try {
              const page = await getPublicPageBySlug(slug);
              if (page) {
                  setPublicPageData(page);
                  setIsCustomDomain(false);
                  setView('public');
                  setLoading(false);
                  return;
              }
          } catch (error) {
              console.warn(`Could not find page for slug "${slug}" from hash.`, error);
          }
      }

      // Fallback: Editor/Auth Flow
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
    return <Editor key={session.user.id} session={session} />;
  }

  return <Auth />;
}