
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { ManagedPage, ManagedOrder, CrmContact, PageGroup, ProductCategory, ManagedProduct, MediaFile, TeamMember, OnboardingWizard, CrmForm, Task, ProofingRequest, ManagedBooking, SeoReport, StripeSettings } from './types';
import * as pageService from './services/pageService';
import * as taskService from './services/taskService';
import SparklesIcon from './components/icons/SparklesIcon';
import EditIcon from './components/icons/EditIcon';
import TrashIcon from './components/icons/TrashIcon';
import XIcon from './components/icons/XIcon';
import PromptModal from './components/PromptModal';
import CheckCircleIcon from './components/icons/CheckCircleIcon';
import GridIcon from './components/icons/GridIcon';
import ShoppingCartIcon from './components/icons/ShoppingCartIcon';
import ShopManagement from './components/ShopManagement';
import { Button, IconButton } from './components/shared';
import ComingSoon from './components/ComingSoon';
import MenuIcon from './components/icons/MenuIcon';
import CalendarDaysIcon from './components/icons/CalendarDaysIcon';
import BookingManagement from './components/BookingManagement';
import ProfileManagement from './components/ProfileManagement';
import UserIcon from './components/icons/UserIcon';
import StockIcon from './components/icons/StockIcon';
import StockManagement from './components/StockManagement';
import VideoIcon from './components/icons/VideoIcon';
import VideoWallManagement from './components/VideoWallManagement';
import GlobeIcon from './components/icons/GlobeIcon';
import CopyIcon from './components/icons/CopyIcon';
import UsersIcon from './components/icons/UsersIcon';
import ContactManagement from './components/ContactManagement';
import UsersManagement from './components/UsersManagement';
import ChevronDownIcon from './components/icons/ChevronDownIcon';
import FileCheckIcon from './components/icons/FileCheckIcon';
import ProofingManagement from './components/ProofingManagement';
import TeamManagement from './components/TeamManagement';
import UsersGroupIcon from './components/icons/UsersGroupIcon';
import CodeIcon from './components/icons/CodeIcon';
import DeveloperTools from './components/DeveloperTools';
import AppWindowIcon from './components/icons/AppWindowIcon';
import PortalManagement from './components/PortalManagement';
import ComponentIcon from './components/icons/ComponentIcon';
import ComponentGenerator from './components/ComponentGenerator';
import ClipboardCheckIcon from './components/icons/ClipboardCheckIcon';
import TaskManagement from './components/TaskManagement';
import SeoIcon from './components/icons/SeoIcon';
import SeoReportComponent from './components/SeoReport';
import SettingsIcon from './components/icons/SettingsIcon';
import SettingsManagement from './components/SettingsManagement';
import GroupManagement from './components/GroupManagement';
import PageAssignmentModal from './components/PageAssignmentModal';
import OnboardingManagement from './components/OnboardingManagement';
import CaseManager from './components/CaseManager';
import RefreshIcon from './components/icons/RefreshIcon';
import LoaderIcon from './components/icons/LoaderIcon';
import AddEditTaskModal from './components/AddEditTaskModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';


interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (pageId: string) => void;
  onCreateNewPage: (pageName: string) => void;
  session: Session;
  initialTab?: string;
  onOpened: () => void;
  themeMode: 'light' | 'dark';
  setThemeMode: (mode: 'light' | 'dark') => void;
  isLoadingPages: boolean;
  pages: ManagedPage[];
  orders: ManagedOrder[];
  contacts: CrmContact[];
  groups: PageGroup[];
  contactList: { id: number, name: string | null }[];
  products: ManagedProduct[];
  categories: ProductCategory[];
  media: MediaFile[];
  team: TeamMember[];
  wizards: OnboardingWizard[];
  customForms: CrmForm[];
  onRefresh: () => void;
  proofingRequests: ProofingRequest[];
  bookings: ManagedBooking[];
  seoReports: SeoReport[];
  stripeSettings?: StripeSettings | null;
}

const PageCardSkeleton = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg flex flex-col animate-pulse">
        <div className="aspect-video bg-slate-200 dark:bg-slate-700 rounded-t-xl"></div>
        <div className="p-4 flex-grow">
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
        </div>
    </div>
);

const DashboardModal: React.FC<DashboardModalProps> = (props) => {
  const { 
    isOpen, onClose, onSelectPage, onCreateNewPage, session, initialTab, onOpened, themeMode, setThemeMode,
    isLoadingPages, pages, orders, contacts, groups, contactList, onRefresh, products, categories, media, team, wizards, customForms,
    proofingRequests, bookings, seoReports, stripeSettings
  } = props;
  
  const [activeTab, setActiveTab] = useState(initialTab || 'dashboard');
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({ 'aiAgents': false, 'portals': false });
  
  const [isPromptOpen, setPromptOpen] = useState(false);
  const [promptConfig, setPromptConfig] = useState<{
      title: string;
      inputLabel: string;
      initialValue: string;
      submitText: string;
      onConfirm: (value: string) => void;
  } | null>(null);
  
  const [deletingPageId, setDeletingPageId] = useState<string | null>(null);
  const [managingPage, setManagingPage] = useState<ManagedPage | null>(null);
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [refreshingThumbnailId, setRefreshingThumbnailId] = useState<string | null>(null);

  // Task Management State - LIFTED UP
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [initialTaskLink, setInitialTaskLink] = useState<any>(null);

  const loadTasks = useCallback(async () => {
    try {
        const tasks = await taskService.getTasks(session.user.id);
        setAllTasks(tasks);
    } catch (e) {
        console.error("Failed to load tasks for dashboard", e);
    }
  }, [session.user.id]);
  
  useEffect(() => {
    if (isOpen) {
        loadTasks();
    }
  }, [isOpen, loadTasks]);

  useEffect(() => {
    if (isOpen) {
        if (initialTab) {
            setActiveTab(initialTab);
            onOpened();
        }
    }
  }, [isOpen, initialTab, onOpened]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  
   const groupedPages = useMemo(() => {
        const pageGroups: Record<string, ManagedPage[]> = {};
        pages.forEach(page => {
            const groupName = page.groupName || 'Uncategorized';
            if (!pageGroups[groupName]) {
                pageGroups[groupName] = [];
            }
            pageGroups[groupName].push(page);
        });
        return Object.entries(pageGroups).sort(([a], [b]) => {
            if (a === 'Uncategorized') return 1;
            if (b === 'Uncategorized') return -1;
            return a.localeCompare(b);
        });
    }, [pages]);

  const handleCreateNew = () => {
    console.log('📝 DashboardModal: handleCreateNew called - calling onCreateNewPage');
    // Close the dashboard modal and go directly to wizard
    onClose();
    // Call the wizard directly without prompting for name
    onCreateNewPage("New Landing Page");
  };

  const handleRename = (page: ManagedPage) => {
    setPromptConfig({
        title: "Rename Page",
        inputLabel: "New Page Name",
        initialValue: page.name,
        submitText: "Rename",
        onConfirm: async (newName) => {
            if (newName && newName !== page.name) {
                await pageService.renamePage(page.id, newName);
                onRefresh();
            }
        }
    });
    setPromptOpen(true);
  };

  const handleDelete = async (pageId: string) => {
    await pageService.deletePage(pageId);
    onRefresh();
    setDeletingPageId(null);
  };

  const handleRefreshThumbnail = async (pageId: string) => {
    setRefreshingThumbnailId(pageId);
    try {
        const pageToUpdate = pages.find(p => p.id === pageId);
        if (!pageToUpdate || !pageToUpdate.images) {
            throw new Error("Page data or images not found to refresh from.");
        }

        const newThumbnailUrl = pageToUpdate.images['hero'] || pageToUpdate.images['hero_split'] || null;

        if (!newThumbnailUrl) {
            alert("No hero image found on this page to set as the thumbnail.");
            return;
        }

        if (newThumbnailUrl === pageToUpdate.thumbnailUrl) {
            alert("The thumbnail is already up-to-date with the page's hero image.");
            return;
        }

        await pageService.updatePageThumbnail(pageId, newThumbnailUrl);
        onRefresh(); // This re-fetches all pages and will show the updated thumbnail
    } catch (error) {
        console.error("Failed to refresh thumbnail:", error);
        alert(`Could not refresh the thumbnail. Error: ${(error as Error).message}`);
    } finally {
        setRefreshingThumbnailId(null);
    }
  };
  
    // --- Task Modal Handlers ---
  const handleOpenTaskModal = (task: Task | null = null, initialLink: any = null) => {
    setEditingTask(task);
    setInitialTaskLink(initialLink);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>, taskId?: string) => {
    if (taskId) {
      await taskService.updateTask(taskId, taskData);
    } else {
      await taskService.createTask(session.user.id, taskData);
    }
    await loadTasks();
    setIsTaskModalOpen(false);
  };
  
  const handleUpdateTask = async (updatedTask: Task) => {
    // Optimistically update the UI first for a better user experience
    setAllTasks(prevTasks => prevTasks.map(t => t.id === updatedTask.id ? updatedTask : t));

    try {
      await taskService.updateTask(updatedTask.id, updatedTask);
    } catch (error) {
      console.error("Failed to update task from card:", error);
      // Revert optimistic update on error by fetching from the source of truth
      await loadTasks(); 
      alert("Failed to update task. Please try again.");
    }
  };


  const handleDeleteTaskRequest = (taskId: string) => {
    setDeletingTaskId(taskId);
  };

  const confirmDeleteTask = async () => {
    if (!deletingTaskId) return;
    setIsDeletingTask(true);
    try {
      await taskService.deleteTask(deletingTaskId);
      await loadTasks();
    } catch (error) {
      console.error("Failed to delete task", error);
    } finally {
      setIsDeletingTask(false);
      setDeletingTaskId(null);
    }
  };

  
  if (!isOpen) {
      return null;
  }

  const navSections = [
    {
        name: 'Business',
        items: [
            { key: 'casemanager', label: 'Case Manager', icon: FileCheckIcon },
            { key: 'cart', label: 'Cart', icon: ShoppingCartIcon },
            { key: 'contacts', label: 'Contact Manager', icon: UsersIcon },
            { key: 'users', label: 'Users', icon: UsersGroupIcon },
            { key: 'seoReports', label: 'SEO Reports', icon: SeoIcon },
            {
                key: 'proofing',
                label: 'Proofing',
                icon: FileCheckIcon,
                children: [
                    { key: 'proofing.dashboard', label: 'Dashboard' },
                    { key: 'proofing.out', label: 'Out for Proof' },
                    { key: 'proofing.response', label: 'Response from Client' },
                    { key: 'proofing.approved', label: 'Approved' },
                    { key: 'proofing.disapproved', label: 'Disapproved' },
                    { key: 'proofing.canceled', label: 'Canceled' },
                ]
            },
            { key: 'bookings', label: 'Bookings', icon: CalendarDaysIcon },
        ]
    },
    {
        name: 'Content',
        items: [
            { key: 'videowall', label: 'Video Wall', icon: VideoIcon },
        ]
    },
    {
        name: 'Workspace',
        items: [
            { key: 'dashboard', label: 'My Pages', icon: GridIcon },
            { key: 'pageGroups', label: 'Page Groups', icon: GridIcon },
            { key: 'tasks', label: 'Tasks', icon: ClipboardCheckIcon },
            { key: 'stock', label: 'Stock', icon: StockIcon },
            {
                key: 'profile',
                label: 'My Profile',
                icon: UserIcon,
                children: [
                    { key: 'profile.userInfo', label: 'User Info' },
                    { key: 'profile.notifications', label: 'Notifications' },
                    { key: 'profile.subscriptions', label: 'Subscriptions' },
                    { key: 'profile.addons', label: 'Addons' },
                ]
            },
        ]
    },
    {
        name: 'Configuration',
        items: [
            { key: 'settings', label: 'Global Settings', icon: SettingsIcon },
            { key: 'developer', label: 'Developer', icon: CodeIcon },
        ]
    }
  ];
  
  const handleNavClick = (key: string, hasChildren: boolean, onLinkClick: () => void) => {
    if (hasChildren) {
      setExpandedMenus(prev => ({ ...prev, [key]: !prev[key] }));
    } else {
      // Default to userInfo tab when accessing profile section
      if (key === 'profile') {
        setActiveTab('profile.userInfo');
      } else {
        setActiveTab(key);
      }
      onLinkClick();
    }
  };
  
  const getActiveItem = () => {
      for (const section of navSections) {
          for (const item of section.items) {
              if (item.key === activeTab) return item;
              if ('children' in item && item.children) {
                  const child = item.children.find(c => c.key === activeTab);
                  if (child) return { ...child, parentLabel: item.label };
              }
          }
      }
      return { label: 'Dashboard' }; // Fallback
  };
  const activeItem = getActiveItem();
  
  const NavContent = ({ onLinkClick = () => {}, isSidebarCollapsed = false }) => (
     <>
        {!isSidebarCollapsed && (
            <div className="px-2 mb-6 flex-shrink-0">
                <span className="text-2xl font-bold text-gray-800 dark:text-slate-200 tracking-tight">AdaptivePages</span>
            </div>
        )}
        {isSidebarCollapsed && (
            <div className="px-2 mb-6 flex-shrink-0 text-center">
                <span className="text-2xl font-bold text-gray-800 dark:text-slate-200 tracking-tight">A</span>
            </div>
        )}
        <div className="flex-grow overflow-y-auto -mr-4 pr-4">
            <ul className="space-y-4">
              {navSections.map(section => (
                <li key={section.name}>
                  {!isSidebarCollapsed && (
                      <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{section.name}</h3>
                  )}
                  <ul className={isSidebarCollapsed ? "space-y-2" : "space-y-1"}>
                    {section.items.map(item => {
                        const Icon = item.icon;
                        const isParentActive = activeTab.startsWith(item.key);
                        const isExpanded = expandedMenus[item.key];

                        return (
                            <li key={item.key}>
                                <button
                                    onClick={() => handleNavClick(item.key, 'children' in item, onLinkClick)}
                                    className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                                        isParentActive && !('children' in item)
                                        ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300' 
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                                    }`}
                                    title={isSidebarCollapsed ? item.label : undefined}
                                >
                                    {isSidebarCollapsed ? (
                                        <Icon className="w-5 h-5" />
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <Icon className="w-5 h-5" />
                                                <span>{item.label}</span>
                                            </div>
                                            {'children' in item && <ChevronDownIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />}
                                        </>
                                    )}
                                </button>
                                {!isSidebarCollapsed && isExpanded && 'children' in item && item.children && (
                                    <ul className="pl-6 mt-1 space-y-1">
                                        {item.children.map(child => (
                                            <li key={child.key}>
                                                <button
                                                    onClick={() => { setActiveTab(child.key); onLinkClick(); }}
                                                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                                                        activeTab === child.key 
                                                        ? 'font-semibold text-indigo-700 dark:text-indigo-300' 
                                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                                    }`}
                                                >{child.label}</button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        )
                    })}
                  </ul>
                </li>
              ))}
            </ul>
        </div>
        {!isSidebarCollapsed && (
            <div className="pt-4 flex-shrink-0">
                 <button
                    onClick={onClose}
                    className="w-full text-left font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 p-3 rounded-lg text-sm"
                 >
                    Back to Editor
                </button>
            </div>
        )}
        {isSidebarCollapsed && (
            <div className="pt-4 flex-shrink-0 text-center">
                 <button
                    onClick={onClose}
                    className="w-full flex justify-center font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 p-3 rounded-lg text-sm"
                    title="Back to Editor"
                 >
                    ←
                </button>
            </div>
        )}
    </>
  );

  const renderContent = () => {
    console.log('🚀 renderContent called with activeTab:', activeTab);
    const mainTab = activeTab.split('.')[0];
    console.log('🚀 mainTab extracted:', mainTab);
    const commonTaskProps = {
        allTasks: allTasks,
        team: team,
        onOpenTaskModal: handleOpenTaskModal,
        onDeleteTask: handleDeleteTaskRequest,
        onUpdateTask: handleUpdateTask,
    };
    switch(mainTab) {
        case 'dashboard':
            return (
                <>
                    <div className="mb-6 flex gap-4">
                        <Button
                            onClick={handleCreateNew}
                            variant="secondary"
                            styleVariant="outline"
                            size="lg"
                            className="flex-1 border-dashed border-2"
                        >
                            <SparklesIcon className="mr-2 h-5 w-5" />
                            Create New Page
                        </Button>
                        <button
                            onClick={onRefresh}
                            className="flex items-center justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            title="Refresh Pages"
                        >
                            <RefreshIcon className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => window.open('/phase5-demo.html', '_blank')}
                            className="flex items-center justify-center py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                            title="View Components Demo"
                        >
                            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            Demo
                        </button>
                    </div>
                    {isLoadingPages ? (
                         <div 
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: '1.5rem'
                            }}
                        >
                            {Array.from({ length: 6 }).map((_, i) => <PageCardSkeleton key={i} />)}
                        </div>
                    ) : pages.length === 0 ? (
                      <div className="text-center py-20">
                        <h3 className="text-2xl font-semibold">No pages yet!</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Click "Create New Page" to get started.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                          {groupedPages.map(([groupName, groupPages]) => (
                            <div key={groupName}>
                                <h2 className="text-xl font-bold mb-4">{groupName} ({groupPages.length} pages)</h2>
                                <div 
                                    className="overflow-x-auto" 
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                        gap: '1.5rem'
                                    }}
                                >
                                    {groupPages.map(page => (
                                      <div key={page.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col min-h-0" style={{maxWidth: '400px'}}>
                                        <div className="relative aspect-video bg-slate-200 dark:bg-slate-700 rounded-t-xl overflow-hidden group">
                                            <button className="block w-full h-full flex items-center justify-center" onClick={() => onSelectPage(page.id)}>
                                                {page.thumbnailUrl ? (
                                                  <img src={page.thumbnailUrl} alt={`${page.name} preview`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                ) : (
                                                  <SparklesIcon className="w-12 h-12 text-slate-400 dark:text-slate-500" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleRefreshThumbnail(page.id)}
                                                disabled={refreshingThumbnailId === page.id}
                                                className="absolute top-2 right-2 z-10 p-1.5 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 disabled:opacity-100 disabled:cursor-wait"
                                                title="Refresh Thumbnail from Hero Image"
                                            >
                                                {refreshingThumbnailId === page.id ? <LoaderIcon className="w-4 h-4" /> : <RefreshIcon className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <div className="p-4 flex-grow">
                                          <h2 className="text-lg font-bold truncate text-slate-900 dark:text-white">{page.name}</h2>
                                          <p className="text-xs text-slate-500 mt-2">
                                            Updated {new Date(page.updatedAt).toLocaleDateString()}
                                          </p>
                                        </div>
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700/50 flex items-center justify-between text-sm">
                                          <div>
                                             <button onClick={() => setManagingPage(page)} className="font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                                              Manage
                                            </button>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Button 
                                              onClick={() => setDeletingPageId(page.id)} 
                                              variant="danger"
                                              size="sm"
                                              title="Delete Page"
                                            >
                                              <TrashIcon className="w-4 h-4" />
                                            </Button>
                                            <Button 
                                              onClick={() => onSelectPage(page.id)} 
                                              variant="primary"
                                              size="sm"
                                            >
                                              <EditIcon className="w-4 h-4" /> Open
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                            </div>
                          ))}
                      </div>
                    )}
                 </>
            );
        case 'casemanager':
            return <CaseManager isFullscreen={true} onBackToHome={() => setActiveTab('dashboard')} />;
        case 'cart':
            return <ShopManagement session={session} pages={pages} orders={orders} contacts={contacts} products={products} categories={categories} media={media} onUpdate={onRefresh} onSwitchMainTab={setActiveTab} {...commonTaskProps} />;
        case 'contacts':
            return <ContactManagement session={session} contacts={contacts} forms={customForms} onUpdate={onRefresh} allTasks={allTasks} onOpenTaskModal={handleOpenTaskModal} />;
        case 'users':
            return <UsersManagement onUpdate={onRefresh} />;
        case 'onboarding':
            return <OnboardingManagement session={session} wizards={wizards} onUpdate={onRefresh}/>;
        case 'bookings':
            return <BookingManagement session={session} pages={pages} onUpdatePage={onRefresh} bookings={bookings} {...commonTaskProps}/>;
        case 'videowall':
            return <VideoWallManagement session={session} />;
        case 'stock':
            return <StockManagement session={session} />;
        case 'profile':
            return <ProfileManagement user={session.user} themeMode={themeMode} setThemeMode={setThemeMode} activeSubTab={activeTab} setActiveSubTab={setActiveTab} />;
        case 'proofing':
            return <ProofingManagement session={session} activeSubTab={activeTab} setActiveSubTab={setActiveTab} contactList={contactList} pages={pages} media={media} onRefresh={onRefresh} proofingRequests={proofingRequests} {...commonTaskProps} />;
        case 'team':
            return <TeamManagement session={session} activeSubTab={activeTab} setActiveSubTab={setActiveTab} team={team} onUpdate={onRefresh}/>;
        case 'portals':
            return <PortalManagement session={session} activeSubTab={activeTab} pages={pages} onSelectPage={onSelectPage}/>;
        case 'componentGenerator':
            return <ComponentGenerator session={session} />;
        case 'tasks':
            return <TaskManagement session={session} team={team} onOpenTaskModal={handleOpenTaskModal} onDeleteTask={handleDeleteTaskRequest} onUpdateTask={handleUpdateTask} {...commonTaskProps} />;
        case 'seoReports':
            return <SeoReportComponent session={session} pages={pages} seoReports={seoReports} onRefresh={onRefresh} {...commonTaskProps} />;
        case 'settings':
            return <SettingsManagement session={session} />;
        case 'developer':
            return <DeveloperTools />;
        case 'pageGroups':
            return <GroupManagement groups={groups} userId={session.user.id} onUpdate={onRefresh} allTasks={allTasks} onOpenTaskModal={handleOpenTaskModal} pages={pages} />;
        default:
            return <ComingSoon title="Coming Soon!" message="This section is under construction. We're working hard to bring you new features." />;
    }
  };


  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 z-[99]">
        
        {/* Mobile Nav Drawer */}
        {isMobileNavOpen && (
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setMobileNavOpen(false)}>
                <nav className="w-64 bg-white dark:bg-slate-900 p-4 h-full shadow-lg flex flex-col" onClick={e => e.stopPropagation()}>
                    <NavContent onLinkClick={() => setMobileNavOpen(false)} />
                </nav>
            </div>
        )}
        
        <div className="w-full h-full flex overflow-hidden">
            {/* Sidebar Navigation for Desktop */}
            <nav className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-slate-800/50 p-4 border-r border-slate-200 dark:border-slate-800 flex-col hidden md:flex transition-all duration-300`}>
                <NavContent isSidebarCollapsed={isSidebarCollapsed} />
            </nav>
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="flex-shrink-0 p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            {/* Mobile menu button */}
                            <button 
                                className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 md:hidden" 
                                onClick={() => setMobileNavOpen(true)}
                                title="Open mobile menu"
                            >
                                <MenuIcon className="w-6 h-6" />
                            </button>
                            
                            {/* Desktop sidebar toggle */}
                            <button 
                                className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 hidden md:block" 
                                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                            >
                                <MenuIcon className="w-6 h-6" />
                            </button>
                            
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                 {activeItem && 'parentLabel' in activeItem && activeItem.parentLabel ? `${activeItem.parentLabel} / ${activeItem.label}` : activeItem?.label}
                            </h1>
                        </div>
                    </div>
                    
                    {/* QUICK ACCESS FEATURE MENU */}
                    <div className="flex flex-wrap gap-2 mb-2">
                        <button 
                            onClick={() => setActiveTab('casemanager')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                activeTab === 'casemanager' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            <FileCheckIcon className="w-4 h-4" />
                            Case Manager
                        </button>
                        <button 
                            onClick={() => setActiveTab('cart')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                activeTab === 'cart' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            <ShoppingCartIcon className="w-4 h-4" />
                            Cart & Shop
                        </button>
                        <button 
                            onClick={() => setActiveTab('bookings')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                activeTab === 'bookings' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            <CalendarDaysIcon className="w-4 h-4" />
                            Bookings
                        </button>
                        <button 
                            onClick={() => setActiveTab('videowall')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                activeTab === 'videowall' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            <VideoIcon className="w-4 h-4" />
                            Video Paywall
                        </button>
                        <button 
                            onClick={() => setActiveTab('profile.userInfo')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                activeTab.startsWith('profile') 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            <UserIcon className="w-4 h-4" />
                            Profile
                        </button>
                        <button 
                            onClick={() => setActiveTab('seoReports')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                activeTab === 'seoReports' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            <SeoIcon className="w-4 h-4" />
                            SEO Reports
                        </button>
                        <button 
                            onClick={() => setActiveTab('tasks')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                activeTab === 'tasks' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            <ClipboardCheckIcon className="w-4 h-4" />
                            Tasks
                        </button>
                        <button 
                            onClick={() => setActiveTab('dashboard')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                activeTab === 'dashboard' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            <GridIcon className="w-4 h-4" />
                            My Pages
                        </button>
                        <button 
                            onClick={() => setActiveTab('users')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                activeTab === 'users' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            <UsersGroupIcon className="w-4 h-4" />
                            Users
                        </button>
                        <button 
                            onClick={() => setActiveTab('contacts')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                activeTab === 'contacts' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            <UsersIcon className="w-4 h-4" />
                            Contacts
                        </button>
                    </div>
                </header>
                
                <main className="flex-grow p-4 sm:p-6 overflow-y-auto max-w-none">
                   {renderContent()}
                </main>
            </div>
             {isPromptOpen && promptConfig && (
                <PromptModal
                    isOpen={isPromptOpen}
                    onClose={() => setPromptOpen(false)}
                    onSubmit={(value) => {
                        promptConfig.onConfirm(value);
                        setPromptOpen(false);
                    }}
                    title={promptConfig.title}
                    inputLabel={promptConfig.inputLabel}
                    initialValue={promptConfig.initialValue}
                    submitText={promptConfig.submitText}
                />
            )}
             {managingPage && (
                <PageAssignmentModal
                    isOpen={!!managingPage}
                    onClose={() => setManagingPage(null)}
                    onSave={() => {
                        onRefresh();
                        setManagingPage(null);
                    }}
                    page={managingPage}
                    groups={groups}
                    contacts={contactList}
                    allTasks={allTasks}
                    onOpenTaskModal={handleOpenTaskModal}
                />
            )}
            {isTaskModalOpen && (
                <AddEditTaskModal
                    isOpen={isTaskModalOpen}
                    onClose={() => setIsTaskModalOpen(false)}
                    onSave={handleSaveTask}
                    taskToEdit={editingTask}
                    initialLink={initialTaskLink}
                    teamMembers={team}
                    pages={pages}
                    orders={orders}
                    bookings={bookings}
                    proofingRequests={proofingRequests}
                    contacts={contactList}
                    products={products}
                    seoReports={seoReports}
                    pageGroups={groups}
                />
            )}
            <ConfirmDeleteModal
                isOpen={!!deletingTaskId}
                onClose={() => setDeletingTaskId(null)}
                onConfirm={confirmDeleteTask}
                title="Delete Task"
                message="Are you sure you want to delete this task? This action cannot be undone."
                isProcessing={isDeletingTask}
            />
            <ConfirmDeleteModal
                isOpen={!!deletingPageId}
                onClose={() => setDeletingPageId(null)}
                onConfirm={() => deletingPageId && handleDelete(deletingPageId)}
                title="Delete Page"
                message={`Are you sure you want to delete "${pages.find(p => p.id === deletingPageId)?.name || 'this page'}"? This action cannot be undone.`}
                isProcessing={false}
            />
        </div>
    </div>
  );
};

export default DashboardModal;