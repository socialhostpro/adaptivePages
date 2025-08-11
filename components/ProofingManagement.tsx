
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { ProofingRequest, ProofingStatus, ManagedPage, MediaFile, Task } from '../types';
import * as proofingService from '../services/proofingService';
import LoaderIcon from './icons/LoaderIcon';
import PlusIcon from './icons/PlusIcon';
import AddEditProofingRequestModal from './AddEditProofingRequestModal';
import ProofingDetailModal from './ProofingDetailModal';

interface ProofingManagementProps {
    session: Session;
    activeSubTab: string;
    setActiveSubTab: (tab: string) => void;
    contactList: { id: number, name: string | null }[];
    pages: ManagedPage[];
    media: MediaFile[];
    onRefresh: () => void;
    proofingRequests: ProofingRequest[];
    allTasks: Task[];
    onOpenTaskModal: (task?: Task | null, initialLink?: any) => void;
}

const statusMap: Record<string, ProofingStatus | 'All'> = {
    'proofing.dashboard': 'All',
    'proofing.out': 'Out for Proof',
    'proofing.response': 'Response from Client',
    'proofing.approved': 'Approved',
    'proofing.disapproved': 'Disapproved',
    'proofing.canceled': 'Canceled',
};

const ProofingRequestCard: React.FC<{ request: ProofingRequest; onView: () => void; }> = ({ request, onView }) => {
    const statusColors: { [key in ProofingStatus]: string } = {
        'Out for Proof': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        'Response from Client': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        'Approved': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        'Disapproved': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
        'Canceled': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md flex justify-between items-center">
            <div>
                <p className="font-bold text-slate-900 dark:text-white">{request.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Client: {request.client_name || 'N/A'}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Sent: {new Date(request.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[request.status]}`}>
                    {request.status}
                </span>
                <button onClick={onView} className="text-sm font-medium text-indigo-600 hover:underline">View Proof</button>
            </div>
        </div>
    );
};

const ProofingManagement: React.FC<ProofingManagementProps> = ({ session, activeSubTab, setActiveSubTab, contactList, pages, media, onRefresh, proofingRequests, allTasks, onOpenTaskModal }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<ProofingRequest | null>(null);

    const filteredRequests = useMemo(() => {
        const statusFilter = statusMap[activeSubTab];
        if (statusFilter === 'All') return proofingRequests;
        return proofingRequests.filter(r => r.status === statusFilter);
    }, [activeSubTab, proofingRequests]);

    const subTabs = [
        { key: 'proofing.dashboard', label: 'All Proofs' },
        { key: 'proofing.out', label: 'Out for Proof' },
        { key: 'proofing.response', label: 'Client Response' },
        { key: 'proofing.approved', label: 'Approved' },
        { key: 'proofing.disapproved', label: 'Disapproved' },
        { key: 'proofing.canceled', label: 'Canceled' },
    ];
    
    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    {subTabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveSubTab(tab.key)}
                            className={`flex-shrink-0 whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                                activeSubTab === tab.key
                                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
                 <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 py-2 px-4 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <PlusIcon className="w-5 h-5"/> New Proof Request
                </button>
            </div>
            <div className="flex-grow pt-6 min-h-0 overflow-y-auto">
                <div className="space-y-4">
                    {filteredRequests.length > 0 ? filteredRequests.map(req => (
                        <ProofingRequestCard key={req.id} request={req} onView={() => setSelectedRequest(req)} />
                    )) : <p className="text-center text-slate-500 py-10">No requests with this status.</p>}
                </div>
            </div>
            {isModalOpen && (
                <AddEditProofingRequestModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onUpdate={onRefresh}
                    userId={session.user.id}
                    contacts={contactList}
                    pages={pages}
                    media={media}
                />
            )}
            {selectedRequest && (
                <ProofingDetailModal
                    isOpen={!!selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    request={selectedRequest}
                    onUpdate={onRefresh}
                    session={session}
                    allTasks={allTasks}
                    onOpenTaskModal={onOpenTaskModal}
                />
            )}
        </div>
    );
};

export default ProofingManagement;