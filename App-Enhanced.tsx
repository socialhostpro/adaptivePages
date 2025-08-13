/**
 * Integration Example: App.tsx with Shared Components
 * This file demonstrates how to integrate the shared component system
 * into the existing AdaptivePages application
 */
import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Subscription } from '@supabase/supabase-js';
import { supabase } from './services/supabase';

// Import shared components
import { 
  ApiControlProvider, 
  Button, 
  NavigationDemo,
  useAiAgent 
} from './components/shared';

// Existing imports
import Auth from './Auth';
import Editor from './Editor';
import LoaderIcon from './components/icons/LoaderIcon';
import PublicPageViewer from './PublicPageViewer';
import { getPublicPageByDomain, getPublicPageBySlug } from './services/pageService';
import type { ManagedPage } from './types';

// Enhanced App component with shared component integration
function AppContent() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'loading' | 'auth' | 'editor' | 'public' | 'demo'>('loading');
  const [publicPageData, setPublicPageData] = useState<ManagedPage | null>(null);
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  // AI Agent integration example
  const { executeCommand } = useAiAgent({
    agentId: 'main-app',
    capabilities: ['navigation', 'demo']
  });

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
      
      // Check for demo route
      if (path === '/demo' || hash === '#demo') {
        setView('demo');
        setLoading(false);
        return;
      }
      
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
          console.error('Error checking custom domain:', error);
        }
      }

      // Priority 2: Public Page Check
      if (path.startsWith('/p/')) {
        const slug = path.replace('/p/', '');
        try {
          const page = await getPublicPageBySlug(slug);
          if (page) {
            setPublicPageData(page);
            setView('public');
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error loading public page:', error);
        }
      }

      // Default: Editor Flow
      handleEditorFlow();
    };

    initializeRouting();

    return () => {
      if (authListener) {
        authListener.unsubscribe();
      }
    };
  }, []);

  // AI command examples
  const handleAiDemo = async () => {
    await executeCommand({
      type: 'navigation',
      action: 'navigate',
      target: 'demo'
    });
    setView('demo');
  };

  const handleAiEditor = async () => {
    await executeCommand({
      type: 'navigation', 
      action: 'navigate',
      target: 'editor'
    });
    setView('editor');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoaderIcon className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading AdaptivePages...</p>
        </div>
      </div>
    );
  }

  // Demo view showcasing shared components
  if (view === 'demo') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Demo Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AdaptivePages - Shared Components Demo
            </h1>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setView('editor')}
              >
                Back to Editor
              </Button>
              <Button 
                variant="primary" 
                onClick={handleAiEditor}
              >
                AI Navigate to Editor
              </Button>
            </div>
          </div>
        </header>

        {/* Demo Content */}
        <main className="max-w-7xl mx-auto p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              🎉 Integration Success!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              The shared component system is now integrated into your AdaptivePages application. 
              This demo showcases all the components we built during Phases 1-3.
            </p>
          </div>

          {/* Component Demo */}
          <NavigationDemo />
        </main>
      </div>
    );
  }

  // Existing views with enhanced navigation
  if (view === 'public' && publicPageData) {
    return (
      <div className="relative">
        {/* Add shared component demo access */}
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowDemo(true)}
            className="shadow-lg"
          >
            🚀 View Components
          </Button>
        </div>
        
        <PublicPageViewer 
          pageData={publicPageData} 
          isCustomDomain={isCustomDomain} 
        />
        
        {/* Demo overlay */}
        {showDemo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Shared Components Demo</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Visit the demo page to see all the new shared components in action!
              </p>
              <div className="flex space-x-2">
                <Button variant="primary" onClick={() => setView('demo')}>
                  View Demo
                </Button>
                <Button variant="outline" onClick={() => setShowDemo(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (view === 'auth') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Enhanced auth with demo access */}
        <div className="absolute top-4 right-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAiDemo}
          >
            🎨 Component Demo
          </Button>
        </div>
        <Auth />
      </div>
    );
  }

  if (view === 'editor' && session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Enhanced editor with demo access */}
        <div className="absolute top-4 right-20 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAiDemo}
            className="shadow-lg"
          >
            🎨 Components
          </Button>
        </div>
        <Editor session={session} />
      </div>
    );
  }

  return null;
}

// Main App component with providers
export default function App() {
  return (
    <ApiControlProvider>
      <AppContent />
    </ApiControlProvider>
  );
}
