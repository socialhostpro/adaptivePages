import React, { useCallback, useEffect, useRef, Suspense } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { LocalBusinessData } from '../components/GenerationWizard/';
import LandingPagePreview from '../components/LandingPagePreview';
import ControlPanel from '../components/ControlPanel';
import AccountPopover from '../AccountPopover';
import LoaderIcon from '../components/icons/LoaderIcon';

// Custom hooks
import { usePageData } from '../hooks/usePageData';
import { useModalState } from '../hooks/useModalState';
import { useUIState } from '../hooks/useUIState';
import { useImageGeneration } from '../hooks/useImageGeneration';
import { useDataManagement } from '../hooks/useDataManagement';

// Lazy-loaded modals
const EditModal = React.lazy(() => import('../components/EditModal'));
const DashboardModal = React.lazy(() => import('../DashboardModal'));
const SEOModal = React.lazy(() => import('../components/SEOModal'));
const PublishModal = React.lazy(() => import('../PublishModal'));
const AppSettingsModal = React.lazy(() => import('../AppSettingsModal'));
const CustomerPortalModal = React.lazy(() => import('../components/CustomerPortalModal'));
const Phase7DemoModal = React.lazy(() => import('../components/shared/Phase7DemoModal'));

interface PageEditorProps {
  session: Session;
}

const ModalLoader = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 flex items-center gap-3">
      <LoaderIcon className="w-5 h-5 text-blue-600" />
      <span className="text-slate-700 dark:text-slate-300">Loading...</span>
    </div>
  </div>
);

export default function PageEditor({ session }: PageEditorProps): React.ReactElement {
  const userId = session.user.id;
  
  // Custom hooks for state management
  const pageData = usePageData(userId);
  const modalState = useModalState();
  const uiState = useUIState();
  const imageGeneration = useImageGeneration();
  const dataManagement = useDataManagement(userId);
  
  // Additional state for business data
  const [localBusinessData, setLocalBusinessData] = React.useState<LocalBusinessData | null>(null);
  
  // Refs
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Auto-save functionality
  useEffect(() => {
    if (pageData.hasUnsavedChanges && pageData.activePage) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await pageData.saveCurrentPage();
        } catch (error) {
          uiState.setError('Failed to auto-save page');
        }
      }, 2000); // Auto-save after 2 seconds of no changes
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [pageData.hasUnsavedChanges, pageData.activePage, pageData.saveCurrentPage, uiState.setError]);
  
  // Handle section editing
  const handleEditSection = useCallback((sectionKey: string) => {
    modalState.openSectionEditor(sectionKey);
  }, [modalState.openSectionEditor]);
  
  // Handle section save
  const handleSaveSection = useCallback(async (
    sectionKey: string, 
    newSectionData: any, 
    newImages?: Record<string, string>
  ) => {
    if (!pageData.landingPageData) return;
    
    try {
      // Update the page data
      const updatedPageData = {
        ...pageData.landingPageData,
        [sectionKey]: newSectionData
      };
      
      // Update images if provided
      const updatedImages = newImages ? { ...pageData.images, ...newImages } : pageData.images;
      
      pageData.updatePageData(updatedPageData, updatedImages);
      modalState.closeSectionEditor();
    } catch (error) {
      uiState.setError('Failed to save section');
    }
  }, [pageData.landingPageData, pageData.images, pageData.updatePageData, modalState.closeSectionEditor, uiState.setError]);
  
  // Handle image regeneration
  const handleRegenerateImage = useCallback(async (imageKey: string, prompt: string) => {
    try {
      uiState.addRegeneratingImage(imageKey);
      const newImageUrl = await imageGeneration.regenerateImage(imageKey, prompt, userId);
      
      // Update the images in page data
      const updatedImages = { ...pageData.images, [imageKey]: newImageUrl };
      pageData.setImages(updatedImages);
    } catch (error) {
      uiState.setError(`Failed to regenerate image: ${imageKey}`);
    } finally {
      uiState.removeRegeneratingImage(imageKey);
    }
  }, [imageGeneration.regenerateImage, userId, pageData.images, pageData.setImages, uiState]);
  
  // Handle file uploads
  const handleUploadFile = useCallback(async (file: File) => {
    try {
      await dataManagement.uploadFile(file);
    } catch (error) {
      uiState.setError('Failed to upload file');
    }
  }, [dataManagement.uploadFile, uiState.setError]);
  
  return (
    <div className={`h-screen flex flex-col ${uiState.themeMode === 'dark' ? 'dark' : ''}`}>
      {/* Error Display */}
      {uiState.error && (
        <div className="bg-red-500 text-white px-4 py-2 text-sm">
          <span>{uiState.error}</span>
          <button 
            onClick={uiState.clearError}
            className="ml-4 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Control Panel */}
        <div className="w-80 flex-shrink-0">
          <ControlPanel
            session={session}
            prompt={uiState.prompt}
            tone={uiState.tone}
            palette={uiState.palette}
            industry={uiState.industry}
            oldSiteUrl={uiState.oldSiteUrl}
            inspirationUrl={uiState.inspirationUrl}
            onPromptChange={uiState.setPrompt}
            onToneChange={uiState.setTone}
            onPaletteChange={uiState.setPalette}
            onIndustryChange={uiState.setIndustry}
            onOldSiteUrlChange={uiState.setOldSiteUrl}
            onInspirationUrlChange={uiState.setInspirationUrl}
            landingPageData={pageData.landingPageData}
            images={pageData.images}
            isGenerating={uiState.isLoading !== false}
            generatingMessage={typeof uiState.isLoading === 'string' ? uiState.isLoading : ''}
            sectionOrder={pageData.sectionOrder}
            onSectionOrderChange={pageData.setSectionOrder}
            onEditSection={handleEditSection}
            onOpenDashboard={modalState.openDashboard}
            onToggleTheme={uiState.toggleTheme}
            themeMode={uiState.themeMode}
            localBusinessData={localBusinessData}
            activePage={pageData.activePage}
            saveStatus={pageData.saveStatus}
          />
        </div>
        
        {/* Page Preview */}
        <div className="flex-1 overflow-auto">
          <LandingPagePreview
            landingPageData={pageData.landingPageData}
            images={pageData.images}
            sectionOrder={pageData.sectionOrder}
            onEditSection={handleEditSection}
            regeneratingImages={uiState.regeneratingImages}
            themeMode={uiState.themeMode}
          />
        </div>
        
        {/* Account Popover */}
        {modalState.isAccountPopoverOpen && (
          <AccountPopover
            user={session.user}
            onClose={() => modalState.setAccountPopoverOpen(false)}
          />
        )}
      </div>
      
      {/* Modals */}
      <Suspense fallback={<ModalLoader />}>
        {modalState.isDashboardOpen && (
          <DashboardModal
            session={session}
            onClose={modalState.closeDashboard}
            initialTab={modalState.initialDashboardTab}
            managedPages={dataManagement.managedPages}
            onSelectPage={pageData.loadPage}
            activePage={pageData.activePage}
          />
        )}
        
        {modalState.editingSectionKey && pageData.landingPageData && (
          <EditModal
            sectionKey={modalState.editingSectionKey}
            pageData={pageData.landingPageData}
            images={pageData.images}
            basePrompt={uiState.prompt}
            tone={uiState.tone}
            palette={uiState.palette}
            onClose={modalState.closeSectionEditor}
            onSave={handleSaveSection}
            mediaLibrary={dataManagement.userMediaFiles}
            onUploadFile={handleUploadFile}
            allProducts={dataManagement.managedProducts}
            customForms={dataManagement.customForms}
            userId={userId}
            allSections={pageData.sectionOrder}
            allPages={dataManagement.managedPages}
          />
        )}
        
        {modalState.isSeoModalOpen && pageData.activePage && (
          <SEOModal
            page={pageData.activePage}
            onClose={() => modalState.setSeoModalOpen(false)}
          />
        )}
        
        {modalState.isPublishModalOpen && pageData.activePage && pageData.landingPageData && (
          <PublishModal
            activePage={pageData.activePage}
            landingPageData={pageData.landingPageData}
            images={pageData.images}
            onClose={() => modalState.setPublishModalOpen(false)}
          />
        )}
        
        {modalState.isAppSettingsModalOpen && pageData.activePage && (
          <AppSettingsModal
            activePage={pageData.activePage}
            onClose={() => modalState.setAppSettingsModalOpen(false)}
          />
        )}
        
        {modalState.isCustomerPortalOpen && (
          <CustomerPortalModal
            session={session}
            onClose={() => modalState.setIsCustomerPortalOpen(false)}
          />
        )}
        
        {modalState.isPhase7DemoOpen && (
          <Phase7DemoModal
            onClose={() => modalState.setIsPhase7DemoOpen(false)}
          />
        )}
      </Suspense>
    </div>
  );
}
