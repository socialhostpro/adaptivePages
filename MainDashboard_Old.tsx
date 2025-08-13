import React, { useState, useCallback, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { ManagedPage } from './types';
import Editor from './Editor';
import DashboardModal from './DashboardModal';
import GenerationWizardWrapper from './GenerationWizardWrapper';
import SeoWizardDemo from './components/SeoWizardDemo';
import { supabase } from './services/supabase';

interface MainDashboardProps {
  session: Session;
}

const MainDashboard: React.FC<MainDashboardProps> = ({ session }) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor' | 'wizard' | 'seo'>('dashboard');
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false); // Start closed
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  const handleSelectPage = useCallback((pageId: string) => {
    setSelectedPageId(pageId);
    setCurrentView('editor');
    setIsDashboardOpen(false);
  }, []);

  const handleCreateNewPage = useCallback(() => {
    console.log('🎯 MainDashboard: handleCreateNewPage called - setting view to wizard');
    setCurrentView('wizard');
    setIsDashboardOpen(false);
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setCurrentView('dashboard');
    setSelectedPageId(null);
    setIsDashboardOpen(true);
  }, []);

  const handleSeoWizard = useCallback(() => {
    setCurrentView('seo');
    setIsDashboardOpen(false);
  }, []);

  console.log('🔍 MainDashboard render - currentView:', currentView, 'isDashboardOpen:', isDashboardOpen);

  // Show Editor if a page is selected
  if (currentView === 'editor' && selectedPageId) {
    return (
      <Editor 
        session={session}
      />
    );
  }

  // Show Generation Wizard
  if (currentView === 'wizard') {
    return (
      <div className="w-screen h-screen bg-gray-50 dark:bg-gray-900">
        <GenerationWizardWrapper 
          session={session}
          onPageCreated={handleSelectPage}
          onBackToDashboard={handleBackToDashboard}
          themeMode={themeMode}
          setThemeMode={setThemeMode}
        />
      </div>
    );
  }

  // Show SEO Wizard
  if (currentView === 'seo') {
    return (
      <div className="w-screen h-screen bg-gray-50 dark:bg-gray-900">
        <SeoWizardDemo 
          onBackToDashboard={handleBackToDashboard}
        />
      </div>
    );
  }

  // Show Dashboard Modal if open
  if (isDashboardOpen) {
    return (
      <DashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        onSelectPage={handleSelectPage}
        onCreateNewPage={(pageName: string) => {
          console.log('Creating page with name:', pageName);
          handleCreateNewPage();
        }}
        session={session}
        initialTab="pages"
        onOpened={() => {}}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
      />
    );
  }

  // Show Main Dashboard
  return (
    <div className="w-screen h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-6xl w-full mx-auto p-8">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to AdaptivePages
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Create stunning landing pages with AI-powered generation
          </p>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Create New Page */}
            <button
              onClick={handleCreateNewPage}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-8 transition-colors group"
            >
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-400 transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create New Page</h3>
              <p className="text-blue-100">Start with AI-powered generation wizard</p>
            </button>

            {/* Manage Pages */}
            <button
              onClick={() => setIsDashboardOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-8 transition-colors group"
            >
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-400 transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Manage Pages</h3>
              <p className="text-green-100">Edit existing pages, view analytics</p>
            </button>

            {/* SEO Tools */}
            <button
              onClick={handleSeoWizard}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-8 transition-colors group"
            >
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-400 transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">SEO Dashboard</h3>
              <p className="text-purple-100">Google Places, Analytics, Search Console</p>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Your latest pages and projects will appear here
          </p>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
