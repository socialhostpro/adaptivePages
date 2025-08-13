import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import DashboardModal from './DashboardModal';
import * as pageService from './services/pageService';

interface DashboardModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (pageId: string) => void;
  onCreateNewPage: (pageName: string) => void;
  session: Session;
  initialTab?: string;
  onOpened: () => void;
  themeMode: 'light' | 'dark';
  setThemeMode: (mode: 'light' | 'dark') => void;
}

const DashboardModalWrapper: React.FC<DashboardModalWrapperProps> = (props) => {
  const [isLoadingPages, setIsLoadingPages] = useState(true);
  const [pages, setPages] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (props.isOpen) {
      loadData();
    }
  }, [props.isOpen, refreshKey]);

  const loadData = async () => {
    try {
      setIsLoadingPages(true);
      const pagesData = await pageService.getPages(props.session.user.id);
      setPages(pagesData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setPages([]);
    } finally {
      setIsLoadingPages(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <DashboardModal
      {...props}
      isLoadingPages={isLoadingPages}
      pages={pages}
      onRefresh={handleRefresh}
      // Provide empty defaults for all other props
      orders={[]}
      contacts={[]}
      groups={[]}
      contactList={[]}
      products={[]}
      categories={[]}
      media={[]}
      team={[]}
      wizards={[]}
      customForms={[]}
      proofingRequests={[]}
      bookings={[]}
      seoReports={[]}
    />
  );
};

export default DashboardModalWrapper;
