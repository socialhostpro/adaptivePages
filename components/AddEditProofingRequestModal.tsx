import React, { useState, useEffect, useMemo } from 'react';
import type { ProofingRequest, ProofingVersion, ManagedPage, MediaFile, ProofingAsset } from '../types';
import * as proofingService from '../services/proofingService';
import XIcon from './icons/XIcon';
import LoaderIcon from './icons/LoaderIcon';
import PlusIcon from './icons/PlusIcon';

interface AddEditProofingRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
    userId: string;
    contacts: { id: number, name: string | null }[];
    pages: ManagedPage[];
    media: MediaFile[];
}

const AddEditProofingRequestModal: React.FC<AddEditProofingRequestModalProps> = ({ isOpen, onClose, onUpdate, userId, contacts, pages, media }) => {
    const [request, setRequest] = useState<Partial<ProofingRequest>>({});
    const [proofType, setProofType] = useState<'image' | 'video' | 'page'>('image');
    const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setRequest({ title: '', client_id: undefined, description: '' });
            setProofType('image');
            setSelectedAssets([]);
            setNotes('');
        }
    }, [isOpen]);

    const handleChange = (field: keyof typeof request, value: any) => {
        setRequest(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!request.title || !request.client_id || selectedAssets.length === 0) {
            alert("Please fill out all required fields and select at least one asset.");
            return;
        }

        setIsLoading(true);
        const newVersion: ProofingVersion = {
            version: 1,
            assets: selectedAssets.map(url => ({ url })),
            notes: notes,
            created_at: new Date().toISOString()
        };

        await proofingService.createProofingRequest(userId, {
            ...request,
            related_entity_type: proofType,
            related_entity_id: selectedAssets[0], // Use first asset as primary reference
            versions: [newVersion]
        });

        onUpdate();
        setIsLoading(false);
        onClose();
    };
    
    const assetOptions = useMemo(() => {
        if (proofType === 'image') return media.filter(m => m.url.includes('image'));
        if (proofType === 'video') return media.filter(m => m.url.includes('video'));
        if (proofType === 'page') return pages;
        return [];
    }, [proofType, media, pages]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[101] flex items-center justify-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">New Proof Request</h2>
                    <button type="button" onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </header>
                <main className="p-6 space-y-4 overflow-y-auto">
                    <div><label className="font-semibold">Title</label><input value={request.title} onChange={e => handleChange('title', e.target.value)} required autoFocus className="w-full p-2 mt-1 border rounded dark:bg-slate-700 dark:border-slate-600"/></div>
                    <div><label className="font-semibold">Client</label>
                        <select value={request.client_id || ''} onChange={e => handleChange('client_id', Number(e.target.value))} required className="w-full p-2 mt-1 border rounded dark:bg-slate-700 dark:border-slate-600">
                            <option value="" disabled>Select a client</option>
                            {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                     <div><label className="font-semibold">Description</label><textarea value={request.description || ''} onChange={e => handleChange('description', e.target.value)} rows={2} className="w-full p-2 mt-1 border rounded dark:bg-slate-700 dark:border-slate-600"/></div>
                     <div><label className="font-semibold">Proof Type</label>
                        <select value={proofType} onChange={e => { setProofType(e.target.value as any); setSelectedAssets([]); }} className="w-full p-2 mt-1 border rounded dark:bg-slate-700 dark:border-slate-600">
                            <option value="image">Image(s)</option>
                            <option value="video">Video(s)</option>
                            <option value="page">Web Page</option>
                        </select>
                     </div>
                     <div><label className="font-semibold">Assets</label>
                        <select
                            multiple
                            value={selectedAssets}
                            onChange={e => setSelectedAssets(Array.from(e.target.selectedOptions, option => option.value))}
                            className="w-full p-2 mt-1 border rounded dark:bg-slate-700 dark:border-slate-600 h-40"
                        >
                           {assetOptions.map(asset => (
                               <option key={'url' in asset ? asset.url : asset.id} value={'url' in asset ? asset.url : asset.slug || asset.id}>{asset.name}</option>
                           ))}
                        </select>
                         <p className="text-xs text-slate-500 mt-1">Hold Ctrl/Cmd to select multiple assets.</p>
                     </div>
                     <div><label className="font-semibold">Initial Notes for Client</label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full p-2 mt-1 border rounded dark:bg-slate-700 dark:border-slate-600"/></div>
                </main>
                <footer className="p-4 bg-slate-50 dark:bg-slate-700/50 border-t dark:border-slate-700 flex justify-end">
                    <button type="submit" disabled={isLoading} className="py-2 px-4 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center w-40">
                        {isLoading ? <LoaderIcon className="w-5 h-5"/> : 'Send for Proof'}
                    </button>
                </footer>
            </form>
        </div>
    );
};

export default AddEditProofingRequestModal;
