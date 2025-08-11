
import React, { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Portal, PortalType, ManagedPage } from '../types';
import * as portalService from '../services/portalService';
import LoaderIcon from './icons/LoaderIcon';
import PlusIcon from './icons/PlusIcon';
import AddEditPortalModal from './AddEditPortalModal';
import TrashIcon from './icons/TrashIcon';
import OwnerPortalModal from './OwnerPortalModal';

interface PortalManagementProps {
    session: Session;
    activeSubTab: string;
    pages: ManagedPage[];
    onSelectPage: (pageId: string) => void;
}

const PortalManagement: React.FC<PortalManagementProps> = ({ session, activeSubTab, pages, onSelectPage }) => {
    const [portals, setPortals] = useState<Portal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewingPortal, setViewingPortal] = useState<Portal | null>(null);

    const { portalType, title } = (() => {
        switch(activeSubTab) {
            case 'portals.owners':
                return { portalType: 'Owners' as PortalType, title: 'Owner Portals' };
            case 'portals.staff':
                return { portalType: 'Owners Staff' as PortalType, title: 'Owner Staff Portals' };
            case 'portals.customer':
                return { portalType: 'Customer' as PortalType, title: 'Customer Portals' };
            default:
                 // Fallback to customer if the subtab is somehow invalid
                return { portalType: 'Customer' as PortalType, title: 'Customer Portals' };
        }
    })();

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const allPortals = await portalService.getPortals(session.user.id);
            setPortals(allPortals.filter(p => p.type === portalType));
        } catch (error) {
            console.error("Failed to load portals", error);
        } finally {
            setIsLoading(false);
        }
    }, [session.user.id, portalType]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleDelete = async (portalId: string) => {
        if (window.confirm("Are you sure you want to delete this portal?")) {
            await portalService.deletePortal(portalId);
            await loadData();
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><LoaderIcon className="w-8 h-8" /></div>;
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md h-full flex flex-col">
            <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{title}</h3>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 py-2 px-4 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <PlusIcon className="w-5 h-5"/> Create New Portal
                </button>
            </div>
            <div className="p-4 overflow-y-auto">
                {portals.length === 0 ? (
                    <p className="text-center text-slate-500">No portals of this type created yet.</p>
                ) : (
                    <ul className="space-y-3">
                        {portals.map(portal => (
                            <li key={portal.id} className="p-4 border dark:border-slate-700 rounded-lg flex justify-between items-center group">
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">{portal.name}</p>
                                    <p className="text-xs text-slate-500">{new Date(portal.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setViewingPortal(portal)} className="text-sm font-medium text-indigo-600 hover:underline">View Portal</button>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                        <button className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white" disabled>Settings</button>
                                        <button className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white" disabled>Users</button>
                                        <button 
                                            onClick={() => handleDelete(portal.id)}
                                            className="p-1.5 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50"
                                        >
                                            <TrashIcon className="w-4 h-4"/>
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {isModalOpen && (
                <AddEditPortalModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onUpdate={loadData}
                    userId={session.user.id}
                    portalType={portalType}
                    pages={pages}
                />
            )}
            {viewingPortal && (
                 <OwnerPortalModal
                    isOpen={!!viewingPortal}
                    onClose={() => setViewingPortal(null)}
                    portal={viewingPortal}
                    onEditSite={onSelectPage}
                />
            )}
        </div>
    );
};

export default PortalManagement;