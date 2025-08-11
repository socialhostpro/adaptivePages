import React, { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { ManagedPage, ManagedOrder, Order } from './types';
import * as pageService from './services/pageService';
import * as orderService from './services/orderService';
import SparklesIcon from './components/icons/SparklesIcon';
import EditIcon from './components/icons/EditIcon';
import TrashIcon from './components/icons/TrashIcon';
import XIcon from './components/icons/XIcon';
import PromptModal from './components/PromptModal';
import CheckCircleIcon from './components/icons/CheckCircleIcon';
import GridIcon from './components/icons/GridIcon';
import ShoppingCartIcon from './components/icons/ShoppingCartIcon';
import ShopManagement from './components/ShopManagement';
import ComingSoon from './components/ComingSoon';
import MenuIcon from './components/icons/MenuIcon';
import CalendarDaysIcon from './components/icons/CalendarDaysIcon';
import BookingManagement from './components/BookingManagement';
import ProfileManagement from './components/ProfileManagement';
import UserIcon from './components/icons/UserIcon';
import ImageIcon from './components/icons/ImageIcon';
import MediaManagement from './components/MediaManagement';
import VideoIcon from './components/icons/VideoIcon';
import VideoWallManagement from './components/VideoWallManagement';
import GlobeIcon from './components/icons/GlobeIcon';
import CopyIcon from './components/icons/CopyIcon';

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (pageId: string) => void;
  session: Session;
  initialTab?: string;
  onOpened: () => void;
  themeMode: 'light' | 'dark';
  setThemeMode: (mode: 'light' | 'dark') => void;
}

const DashboardModal: React.FC<DashboardModalProps> = ({ isOpen, onClose, onSelectPage, session, initialTab, onOpened, themeMode, setThemeMode }) => {
  const [pages, setPages] = useState<ManagedPage[]>([]);
  const [orders, setOrders] = useState<ManagedOrder[]>([]);
  const [activeTab, setActiveTab] = useState(initialTab || 'store');
  
  const [isPromptOpen, setPromptOpen] = useState(false);
  const [promptConfig, setPromptConfig] = useState<{
      title: string;
      inputLabel: string;
      initialValue: string;
      submitText: string;
      onConfirm: (value: string) => void;
  } | null>(null);
  
  const [deletingPageId, setDeletingPageId] = useState<string | null>(null);
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  const refreshPages = useCallback(async () => {
    const userPages = await pageService.getPages(session.user.id);
    setPages(userPages);
    
    const userOrdersRaw = await orderService.getOrdersForUser(session.user.id);
    const pageMap = new Map(userPages.map(p => [p.id, p.name]));
    
    const managedOrders: ManagedOrder[] = userOrdersRaw
      .filter(rawOrder => rawOrder.data)
      .map(rawOrder => {
        const orderData = rawOrder.data as unknown as Order;
        return {
            id: String(rawOrder.id),
            pageId: rawOrder.page_id,
            pageName: pageMap.get(rawOrder.page_id) || 'Unknown Page',
            createdAt: rawOrder.created_at,
            customer: {
                name: `${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName}`,
                email: orderData.customerInfo.email,
                shippingAddress: orderData.customerInfo.address,
            },
            items: orderData.items.map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.finalPrice,
            })),
            total: orderData.total,
            status: orderData.status,
        };
    });
    setOrders(managedOrders);

  }, [session.user.id]);
  
  useEffect(() => {
    if (isOpen) {
      refreshPages();
      if (initialTab) {
        setActiveTab(initialTab);
        onOpened();
      }
    }
  }, [isOpen, initialTab, onOpened, refreshPages]);

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

  const handleCreateNew = () => {
    setPromptConfig({
      title: "Create New Page",
      inputLabel: "Page Name",
      initialValue: "My New Landing Page",
      submitText: "Create",
      onConfirm: async (name) => {
        const newPage = await pageService.createPage(name, session.user.id);
        onSelectPage(newPage.id);
      }
    });
    setPromptOpen(true);
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
                refreshPages();
            }
        }
    });
    setPromptOpen(true);
  };

  const handleDelete = async (pageId: string) => {
    await pageService.deletePage(pageId);
    refreshPages();
    setDeletingPageId(null);
  };
  
  if (!isOpen) {
      return null;
  }
  
  const navItems = [
      { key: 'store', label: 'Management', icon: ShoppingCartIcon },
      { key: 'bookings', label: 'Bookings', icon: CalendarDaysIcon },
      { key: 'videowall', label: 'Video Wall', icon: VideoIcon },
      { key: 'media', label: 'Media', icon: ImageIcon },
      { key: 'dashboard', label: 'My Pages', icon: GridIcon },
      { key: 'profile', label: 'My Profile', icon: UserIcon },
  ];
  
  const NavContent = ({ onLinkClick = () => {} }) => (
     <>
        <div className="px-2 mb-6">
            <span className="text-2xl font-bold text-gray-800 dark:text-slate-200 tracking-tight">AdaptivePages</span>
        </div>
        <ul className="space-y-1">
            {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                return (
                    <li key={item.key}>
                        <button
                            onClick={() => { setActiveTab(item.key); onLinkClick(); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                                isActive 
                                ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300' 
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                            }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </button>
                    </li>
                );
            })}
        </ul>
        <div className="mt-auto pt-4">
             <button
                onClick={onClose}
                className="w-full text-left font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 p-3 rounded-lg text-sm"
             >
                Back to Editor
            </button>
        </div>
    </>
  );

  const renderContent = () => {
    switch(activeTab) {
        case 'dashboard':
            return (
                <>
                    <div className="mb-6">
                        <button
                            onClick={handleCreateNew}
                            className="w-full flex items-center justify-center py-3 px-5 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-base font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all"
                        >
                            <SparklesIcon className="mr-2 h-5 w-5" />
                            Create New Page
                        </button>
                    </div>
                    {pages.length === 0 ? (
                      <div className="text-center py-20">
                        <h3 className="text-2xl font-semibold">No pages yet!</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Click "Create New Page" to get started.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {pages.map(page => (
                          <div key={page.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col">
                            <button className="block aspect-video bg-slate-200 dark:bg-slate-700 rounded-t-xl overflow-hidden flex items-center justify-center group" onClick={() => onSelectPage(page.id)}>
                                {page.thumbnailUrl ? (
                                  <img src={page.thumbnailUrl} alt={`${page.name} preview`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                  <SparklesIcon className="w-12 h-12 text-slate-400 dark:text-slate-500" />
                                )}
                            </button>
                            <div className="p-4 flex-grow">
                              <h2 className="text-lg font-bold truncate text-slate-900 dark:text-white">{page.name}</h2>
                              {page.isPublished ? (
                                <>
                                    <div className="flex items-center gap-1.5 mt-1 text-xs text-green-600 dark:text-green-400">
                                        <CheckCircleIcon className="w-4 h-4" /> Published
                                    </div>
                                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                                        {page.customDomain ? (
                                            <div className="flex items-center gap-1 group">
                                                <GlobeIcon className="w-4 h-4 flex-shrink-0" />
                                                <a href={`https://${page.customDomain}`} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">{page.customDomain}</a>
                                                <button onClick={() => navigator.clipboard.writeText(`https://${page.customDomain}`)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                                                    <CopyIcon className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : page.slug ? (
                                            <div className="flex items-center gap-1 group">
                                                <GlobeIcon className="w-4 h-4 flex-shrink-0" />
                                                <a href={`${window.location.origin}/#/${page.slug}`} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">{`${window.location.origin.replace(/^https?:\/\//, '')}/#/${page.slug}`}</a>
                                                <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/#/${page.slug}`)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                                                    <CopyIcon className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : null}
                                    </div>
                                </>
                                ) : (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Draft</p>
                                )}
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                Updated {new Date(page.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700/50 flex items-center justify-between text-sm">
                              <div>
                                <button onClick={() => handleRename(page)} className="font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                                  Rename
                                </button>
                              </div>
                              <div className="flex items-center gap-1">
                                 {deletingPageId === page.id ? (
                                    <>
                                        <button onClick={() => setDeletingPageId(null)} className="py-1 px-2 rounded-md font-semibold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600">Cancel</button>
                                        <button onClick={() => handleDelete(page.id)} className="py-1 px-2 rounded-md font-semibold text-xs text-white bg-red-600 hover:bg-red-700">Confirm</button>
                                    </>
                                 ) : (
                                    <button onClick={() => setDeletingPageId(page.id)} className="p-1.5 text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50">
                                      <TrashIcon className="w-4 h-4" />
                                    </button>
                                 )}
                                <button onClick={() => onSelectPage(page.id)} className="flex items-center gap-1 py-1.5 px-3 rounded-md font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors">
                                  <EditIcon className="w-4 h-4" /> Open
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                 </>
            );
        case 'store':
            return <ShopManagement session={session} pages={pages} orders={orders} onUpdateOrder={refreshPages} onSwitchMainTab={setActiveTab} />;
        case 'bookings':
            return <BookingManagement session={session} pages={pages} onUpdatePage={refreshPages} />;
        case 'videowall':
            return <VideoWallManagement session={session} />;
        case 'media':
            return <MediaManagement session={session} />;
        case 'profile':
            return <ProfileManagement user={session.user} themeMode={themeMode} setThemeMode={setThemeMode} />;
        default:
            return <ComingSoon title="Coming Soon!" message="This section is under construction. We're working hard to bring you new features." />;
    }
  };


  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 z-[99]">
        
        {/* Mobile Nav Drawer */}
        {isMobileNavOpen && (
            <div className="md:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setMobileNavOpen(false)}>
                <nav className="w-64 bg-white dark:bg-slate-900 p-4 h-full shadow-lg flex flex-col" onClick={e => e.stopPropagation()}>
                    <NavContent onLinkClick={() => setMobileNavOpen(false)} />
                </nav>
            </div>
        )}
        
        <div className="w-full h-full flex overflow-hidden">
            {/* Sidebar Navigation for Desktop */}
            <nav className="w-64 bg-white dark:bg-slate-800/50 p-4 border-r border-slate-200 dark:border-slate-800 flex-col hidden md:flex">
                <NavContent />
            </nav>
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="flex-shrink-0 p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <button className="md:hidden p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => setMobileNavOpen(true)}>
                            <MenuIcon className="w-6 h-6" />
                        </button>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            {navItems.find(i => i.key === activeTab)?.label}
                        </h1>
                    </div>
                </header>
                
                <main className="flex-grow p-4 sm:p-6 overflow-y-auto">
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
        </div>
    </div>
  );
};

export default DashboardModal;