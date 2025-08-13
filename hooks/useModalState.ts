import { useState, useCallback } from 'react';

export interface UseModalStateReturn {
  // Dashboard modal
  isDashboardOpen: boolean;
  setDashboardOpen: (open: boolean) => void;
  initialDashboardTab: string | undefined;
  setInitialDashboardTab: (tab: string | undefined) => void;
  
  // Section editing
  editingSectionKey: string | null;
  setEditingSectionKey: (key: string | null) => void;
  
  // Modal states
  isSeoModalOpen: boolean;
  setSeoModalOpen: (open: boolean) => void;
  isPublishModalOpen: boolean;
  setPublishModalOpen: (open: boolean) => void;
  isAppSettingsModalOpen: boolean;
  setAppSettingsModalOpen: (open: boolean) => void;
  isCustomerPortalOpen: boolean;
  setIsCustomerPortalOpen: (open: boolean) => void;
  isAccountPopoverOpen: boolean;
  setAccountPopoverOpen: (open: boolean) => void;
  isPhase7DemoOpen: boolean;
  setIsPhase7DemoOpen: (open: boolean) => void;
  
  // Modal management helpers
  openDashboard: (tab?: string) => void;
  closeDashboard: () => void;
  openSectionEditor: (sectionKey: string) => void;
  closeSectionEditor: () => void;
  closeAllModals: () => void;
}

export function useModalState(): UseModalStateReturn {
  // Dashboard state
  const [isDashboardOpen, setDashboardOpen] = useState(true);
  const [initialDashboardTab, setInitialDashboardTab] = useState<string | undefined>(undefined);
  
  // Section editing
  const [editingSectionKey, setEditingSectionKey] = useState<string | null>(null);
  
  // Modal states
  const [isSeoModalOpen, setSeoModalOpen] = useState(false);
  const [isPublishModalOpen, setPublishModalOpen] = useState(false);
  const [isAppSettingsModalOpen, setAppSettingsModalOpen] = useState(false);
  const [isCustomerPortalOpen, setIsCustomerPortalOpen] = useState(false);
  const [isAccountPopoverOpen, setAccountPopoverOpen] = useState(false);
  const [isPhase7DemoOpen, setIsPhase7DemoOpen] = useState(false);
  
  // Helper functions
  const openDashboard = useCallback((tab?: string) => {
    setInitialDashboardTab(tab);
    setDashboardOpen(true);
  }, []);
  
  const closeDashboard = useCallback(() => {
    setDashboardOpen(false);
    setInitialDashboardTab(undefined);
  }, []);
  
  const openSectionEditor = useCallback((sectionKey: string) => {
    setEditingSectionKey(sectionKey);
  }, []);
  
  const closeSectionEditor = useCallback(() => {
    setEditingSectionKey(null);
  }, []);
  
  const closeAllModals = useCallback(() => {
    setDashboardOpen(false);
    setEditingSectionKey(null);
    setSeoModalOpen(false);
    setPublishModalOpen(false);
    setAppSettingsModalOpen(false);
    setIsCustomerPortalOpen(false);
    setAccountPopoverOpen(false);
    setIsPhase7DemoOpen(false);
    setInitialDashboardTab(undefined);
  }, []);
  
  return {
    // Dashboard modal
    isDashboardOpen,
    setDashboardOpen,
    initialDashboardTab,
    setInitialDashboardTab,
    
    // Section editing
    editingSectionKey,
    setEditingSectionKey,
    
    // Modal states
    isSeoModalOpen,
    setSeoModalOpen,
    isPublishModalOpen,
    setPublishModalOpen,
    isAppSettingsModalOpen,
    setAppSettingsModalOpen,
    isCustomerPortalOpen,
    setIsCustomerPortalOpen,
    isAccountPopoverOpen,
    setAccountPopoverOpen,
    isPhase7DemoOpen,
    setIsPhase7DemoOpen,
    
    // Helper functions
    openDashboard,
    closeDashboard,
    openSectionEditor,
    closeSectionEditor,
    closeAllModals
  };
}
