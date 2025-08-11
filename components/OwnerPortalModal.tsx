
import React, { useState, useEffect, useCallback } from 'react';
import type { Portal, ManagedPage, LandingPageData } from '../types';
import * as pageService from '../services/pageService';
import XIcon from './icons/XIcon';
import EditIcon from './icons/EditIcon';
import LoaderIcon from './icons/LoaderIcon';
import Switch from './shared/Switch';
import SaveIcon from './icons/SaveIcon';

interface FeatureToggleProps {
    label: string;
    description: string;
    isEnabled: boolean;
    onToggle: (enabled: boolean) => void;
}

const FeatureToggle: React.FC<FeatureToggleProps> = ({ label, description, isEnabled, onToggle }) => (
    <div className="flex justify-between items-center p-4 border dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700/50">
        <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">{label}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <Switch enabled={isEnabled} onChange={onToggle} />
    </div>
);


interface OwnerPortalModalProps {
    isOpen: boolean;
    onClose: () => void;
    portal: Portal;
    onEditSite: (pageId: string) => void;
}

const OwnerPortalModal: React.FC<OwnerPortalModalProps> = ({ isOpen, onClose, portal, onEditSite }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [page, setPage] = useState<ManagedPage | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const loadPageData = useCallback(async () => {
        if (portal.page_id) {
            setIsLoading(true);
            const pageData = await pageService.getPage(portal.page_id);
            setPage(pageData);
            setIsLoading(false);
        } else {
            setIsLoading(false);
        }
    }, [portal.page_id]);

    useEffect(() => {
        if (isOpen) {
            loadPageData();
        }
    }, [isOpen, loadPageData]);

    const handleEditClick = () => {
        if (portal.page_id) {
            onEditSite(portal.page_id);
            onClose();
        }
    };

    const handlePageDataChange = (newData: LandingPageData) => {
        if (page) {
            setPage(prev => prev ? { ...prev, data: newData } : null);
        }
    };

    const handleToggleFeature = (feature: 'cart' | 'contact' | 'customerPortal' | 'staffPortal', enabled: boolean) => {
        if (!page || !page.data) return;

        let newData = { ...page.data };
        
        switch(feature) {
            case 'cart':
                const newOrderCart = enabled 
                    ? [...new Set([...newData.sectionOrder, 'products'])] 
                    : newData.sectionOrder.filter(s => s !== 'products');
                newData = { ...newData, sectionOrder: newOrderCart, nav: { ...newData.nav, cartButtonEnabled: enabled } };
                break;
            case 'contact':
                 const newOrderContact = enabled
                    ? [...new Set([...newData.sectionOrder, 'contact'])]
                    : newData.sectionOrder.filter(s => s !== 'contact');
                newData = { ...newData, sectionOrder: newOrderContact };
                break;
            case 'customerPortal':
                newData = { ...newData, nav: { ...newData.nav, signInButtonEnabled: enabled } };
                break;
            case 'staffPortal':
                newData = { ...newData, staffPortalEnabled: enabled };
                break;
        }
        handlePageDataChange(newData);
    };

    const handleSaveSettings = async () => {
        if (!page) return;
        setIsSaving(true);
        try {
            await pageService.savePage(page);
            alert("Settings saved successfully!");
        } catch (error) {
            console.error("Failed to save portal settings:", error);
            alert("An error occurred while saving settings.");
        } finally {
            setIsSaving(false);
        }
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[101] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold">{portal.name}</h2>
                    <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><XIcon className="w-6 h-6"/></button>
                </header>
                 <div className="border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
                    <nav className="-mb-px flex space-x-6 px-6">
                        <button onClick={() => setActiveTab('dashboard')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'dashboard' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            Dashboard
                        </button>
                        <button onClick={() => setActiveTab('settings')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'settings' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            Settings
                        </button>
                    </nav>
                </div>
                <main className="p-6 flex-grow overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full"><LoaderIcon className="w-8 h-8"/></div>
                    ) : activeTab === 'dashboard' ? (
                        <div>
                            <h3 className="text-lg font-semibold">Welcome to your Owner Portal</h3>
                            <p className="text-slate-500 mt-2">This is a preview of what an owner portal would look like. From here you can manage your site, view analytics, and more.</p>
                            {page ? (
                                <div className="mt-6 p-4 border rounded-lg dark:border-slate-700">
                                    <h4 className="font-semibold">Assigned Website: {page.name}</h4>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-slate-600 dark:text-slate-300">Manage your site's content and design.</p>
                                        <button onClick={handleEditClick} className="flex items-center gap-2 py-2 px-4 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700">
                                            <EditIcon className="w-5 h-5"/> Edit Site
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-6 p-4 border rounded-lg dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                                    <h4 className="font-semibold">No Website Assigned</h4>
                                    <p className="text-slate-600 dark:text-slate-300 mt-1">Assign a website to this portal to manage it from here.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                       <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Manage Website Features</h3>
                            {page && page.data ? (
                                <>
                                    <FeatureToggle 
                                        label="Shopping Cart"
                                        description="Enable e-commerce functionality and the products section."
                                        isEnabled={page.data.sectionOrder.includes('products')}
                                        onToggle={(enabled) => handleToggleFeature('cart', enabled)}
                                    />
                                     <FeatureToggle 
                                        label="Contact Form"
                                        description="Allow visitors to send you messages through a contact form."
                                        isEnabled={page.data.sectionOrder.includes('contact')}
                                        onToggle={(enabled) => handleToggleFeature('contact', enabled)}
                                    />
                                     <FeatureToggle 
                                        label="Customer Portal"
                                        description="Show a 'Sign In' button for your customers to access their content."
                                        isEnabled={page.data.nav.signInButtonEnabled}
                                        onToggle={(enabled) => handleToggleFeature('customerPortal', enabled)}
                                    />
                                    <FeatureToggle 
                                        label="Staff Portal"
                                        description="Enable a separate login for your staff members (Coming Soon)."
                                        isEnabled={!!page.data.staffPortalEnabled}
                                        onToggle={(enabled) => handleToggleFeature('staffPortal', enabled)}
                                    />
                                </>
                            ) : (
                                <p className="text-slate-500">No website assigned to manage settings.</p>
                            )}
                       </div>
                    )}
                </main>
                 {activeTab === 'settings' && page && (
                    <footer className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex-shrink-0 flex justify-end">
                        <button
                            onClick={handleSaveSettings}
                            disabled={isSaving}
                            className="flex items-center justify-center gap-2 py-2.5 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
                        >
                           {isSaving ? <LoaderIcon className="w-5 h-5" /> : <SaveIcon className="w-5 h-5"/>}
                           {isSaving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </footer>
                 )}
            </div>
        </div>
    );
};

export default OwnerPortalModal;