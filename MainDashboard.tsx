import React, { useState, useCallback, Suspense } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Button } from './components/shared';
import { Card } from './components/shared/Card';
import { Logo } from './components/shared';
import ErrorBoundary from './components/shared/ErrorBoundary';
import LoaderIcon from './components/icons/LoaderIcon';

// Lazy load large components
const Editor = React.lazy(() => import('./Editor'));
const GenerationWizardWrapper = React.lazy(() => import('./GenerationWizardWrapper'));
const DashboardModalWrapper = React.lazy(() => import('./DashboardModalWrapper'));

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

  const handleOpenDashboard = useCallback(() => {
    console.log('🎯 MainDashboard: handleOpenDashboard called - opening dashboard');
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
      <ErrorBoundary>
        <Suspense fallback={
          <div className="w-screen h-screen flex items-center justify-center bg-white dark:bg-gray-900">
            <LoaderIcon className="w-8 h-8 text-indigo-500" />
          </div>
        }>
          <Editor 
            session={session}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  // Show Generation Wizard
  if (currentView === 'wizard') {
    return (
      <ErrorBoundary>
        <div className="w-screen h-screen bg-gray-50 dark:bg-gray-900">
          <Suspense fallback={
            <div className="w-screen h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <LoaderIcon className="w-8 h-8 text-indigo-500" />
            </div>
          }>
            <GenerationWizardWrapper 
              session={session}
              onPageCreated={handleSelectPage}
              onBackToDashboard={handleOpenDashboard}
              themeMode={themeMode}
              setThemeMode={setThemeMode}
            />
          </Suspense>
        </div>
      </ErrorBoundary>
    );
  }

  // Show SEO Dashboard (placeholder for now)
  if (currentView === 'seo') {
    return (
      <div className="w-screen h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card title="SEO Dashboard" className="text-center">
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">SEO tools coming soon...</p>
            <Button
              onClick={handleOpenDashboard}
              variant="primary"
            >
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Show Dashboard Modal if open
  if (isDashboardOpen) {
    return (
      <ErrorBoundary>
        <Suspense fallback={
          <div className="w-screen h-screen flex items-center justify-center bg-white dark:bg-gray-900">
            <LoaderIcon className="w-8 h-8 text-indigo-500" />
          </div>
        }>
          <DashboardModalWrapper
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
        </Suspense>
      </ErrorBoundary>
    );
  }

  // Show Main Dashboard - Compact Welcome Screen
  return (
    <div className="w-screen h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <Card variant="flat" className="shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-none">
        <div className="flex items-center justify-between">
          <Logo size="md" variant="auto" showText={true} />
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleCreateNewPage}
              variant="primary"
              size="sm"
            >
              + Create New Page
            </Button>
            <Button
              onClick={handleOpenDashboard}
              variant="secondary"
              size="sm"
            >
              Dashboard
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to AdaptivePages
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Create stunning landing pages with AI-powered generation
          </p>
          
          {/* Quick Actions - Horizontal Layout */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleCreateNewPage}
              variant="primary"
              size="lg"
              className="flex items-center justify-center space-x-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Start Creating</span>
            </Button>

            <Button
              onClick={handleOpenDashboard}
              variant="secondary"
              size="lg"
              className="flex items-center justify-center space-x-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>View All Features</span>
            </Button>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            Access pages, analytics, e-commerce, bookings, SEO tools, and more from the dashboard
          </p>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
