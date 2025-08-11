
import React, { useState, useEffect, useMemo } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { ProofingRequest, ProofingComment, ProofingVersion, Task, ProofingAsset } from '../types';
import * as proofingService from '../services/proofingService';
import XIcon from './icons/XIcon';
import LoaderIcon from './icons/LoaderIcon';
import AssociatedTasks from './AssociatedTasks';
import AssetPricingModal from './AssetPricingModal';

interface ProofingDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    request: ProofingRequest;
    onUpdate: () => void;
    session: Session;
    // Task props
    allTasks?: Task[];
    onOpenTaskModal?: (task: Task | null, initialLink?: any) => void;
}

const ProofingDetailModal: React.FC<ProofingDetailModalProps> = ({ isOpen, onClose, request: initialRequest, onUpdate, session, allTasks = [], onOpenTaskModal }) => {
    const [request, setRequest] = useState(initialRequest);
    const [activeVersion, setActiveVersion] = useState<ProofingVersion | null>(null);
    const [activeAssetIndex, setActiveAssetIndex] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAssetPricingModalOpen, setAssetPricingModalOpen] = useState(false);

    useEffect(() => {
        setRequest(initialRequest);
        const latestVersion = initialRequest.versions?.[(initialRequest.versions?.length || 1) - 1];
        setActiveVersion(latestVersion || null);
        setActiveAssetIndex(0);
    }, [initialRequest]);

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsLoading(true);
        try {
            const comment = await proofingService.addComment(request.id, session.user.id, session.user.email || 'Admin', newComment);
            setRequest(prev => ({ ...prev, comments: [...(prev.comments || []), comment] }));
            setNewComment('');
            
            if(request.status === 'Out for Proof') {
                const updatedRequest = await proofingService.updateProofingRequest(request.id, { status: 'Response from Client' });
                setRequest(updatedRequest);
            }
            onUpdate();
        } catch (error) {
            console.error("Failed to add comment", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSaveAssetPricing = async (assets: ProofingAsset[]) => {
        if (!activeVersion) return;
        
        const newVersion: ProofingVersion = {
            ...activeVersion,
            assets,
        };
        
        const newVersions = (request.versions || []).map(v => v.version === newVersion.version ? newVersion : v);

        await proofingService.updateProofingRequest(request.id, { versions: newVersions });
        onUpdate();
        setAssetPricingModalOpen(false);
    };

    // --- Task Handlers ---
    const handleAddTask = () => {
        onOpenTaskModal && onOpenTaskModal(null, { type: 'proofing_request', id: request.id });
    };

    const handleEditTask = (task: Task) => {
        onOpenTaskModal && onOpenTaskModal(task, null);
    };

    if (!isOpen || !activeVersion) return null;
    
    const activeAsset = activeVersion.assets[activeAssetIndex].url;
    
    const renderAsset = () => {
        switch (request.related_entity_type) {
            case 'image':
                return <img src={activeAsset} alt={`Proof asset ${activeAssetIndex + 1}`} className="max-w-full max-h-full object-contain"/>;
            case 'video':
                // Assuming direct video URLs for now. Can be extended for YouTube/Vimeo.
                return <video src={activeAsset} controls className="max-w-full max-h-full object-contain rounded-lg" />;
            case 'page':
                // The URL structure for public pages is /#/slug
                const pageUrl = `/#/${activeAsset}`;
                return (
                    <div className="w-full h-full bg-white relative">
                        <iframe
                            src={pageUrl}
                            title={`Proof for page: ${request.title}`}
                            className="w-full h-full border-0"
                            sandbox="allow-scripts allow-same-origin" // Security measure
                        />
                        <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-slate-300 dark:ring-slate-700 rounded-lg"></div>
                    </div>
                );
            default:
                return <div className="text-center p-8 bg-slate-200 dark:bg-slate-700 rounded-lg">Unsupported proof type: {request.related_entity_type}</div>;
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/60 z-[101] flex items-center justify-center p-4" onClick={onClose}>
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                        <div>
                            <h2 className="text-xl font-bold">{request.title}</h2>
                            <p className="text-sm text-slate-500">Version {activeVersion.version}</p>
                        </div>
                        <button type="button" onClick={onClose}><XIcon className="w-6 h-6"/></button>
                    </header>
                    <div className="flex-grow flex min-h-0">
                        {/* Main Content */}
                        <main className="w-2/3 flex flex-col p-4">
                            <div className="flex-grow flex items-center justify-center bg-slate-100 dark:bg-black/50 rounded-lg">
                                {renderAsset()}
                            </div>
                            {activeVersion.assets.length > 1 && (
                                <div className="flex-shrink-0 mt-4 h-24">
                                    <div className="flex gap-2 p-2 overflow-x-auto bg-slate-100 dark:bg-slate-900/50 rounded-lg h-full">
                                        {activeVersion.assets.map((asset, index) => (
                                            <button key={index} onClick={() => setActiveAssetIndex(index)} className={`h-full aspect-square rounded-md overflow-hidden flex-shrink-0 ${index === activeAssetIndex ? 'ring-2 ring-indigo-500' : ''}`}>
                                                <img src={asset.url} alt={`Thumbnail ${index+1}`} className="w-full h-full object-cover"/>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </main>

                        {/* Sidebar */}
                        <aside className="w-1/3 border-l dark:border-slate-700 flex flex-col">
                            <div className="p-4 overflow-y-auto flex-grow">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold">Notes & Comments</h3>
                                    <button
                                        onClick={() => setAssetPricingModalOpen(true)}
                                        className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        Finalize Asset Pricing
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {(request.comments || []).map(comment => (
                                        <div key={comment.id} className="p-2 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                                            <p className="text-sm font-semibold">{comment.author_name}</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-300">{comment.comment_text}</p>
                                            <p className="text-xs text-slate-400 text-right">{new Date(comment.created_at).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                                {onOpenTaskModal && (
                                    <AssociatedTasks
                                        entityType="proofing_request"
                                        entityId={request.id}
                                        allTasks={allTasks}
                                        onAddTask={handleAddTask}
                                        onEditTask={handleEditTask}
                                    />
                                )}
                            </div>
                            <div className="p-4 border-t dark:border-slate-700 flex-shrink-0">
                                <form onSubmit={handleAddComment}>
                                    <textarea
                                        value={newComment}
                                        onChange={e => setNewComment(e.target.value)}
                                        placeholder="Add a comment..."
                                        rows={3}
                                        className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                                    />
                                    <button type="submit" disabled={isLoading} className="mt-2 w-full py-2 px-4 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700">
                                        {isLoading ? <LoaderIcon className="w-5 h-5 mx-auto"/> : 'Send'}
                                    </button>
                                </form>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
             {isAssetPricingModalOpen && activeVersion && (
                <AssetPricingModal
                    isOpen={isAssetPricingModalOpen}
                    onClose={() => setAssetPricingModalOpen(false)}
                    assets={activeVersion.assets}
                    onSave={handleSaveAssetPricing}
                />
            )}
        </>
    );
};

export default ProofingDetailModal;