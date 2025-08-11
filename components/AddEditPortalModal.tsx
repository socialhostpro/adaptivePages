
import React, { useState, useEffect } from 'react';
import type { Portal, PortalType, ManagedPage } from '../types';
import * as portalService from '../services/portalService';
import XIcon from './icons/XIcon';
import LoaderIcon from './icons/LoaderIcon';

interface AddEditPortalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
    userId: string;
    portalType: PortalType;
    pages: ManagedPage[];
}

const AddEditPortalModal: React.FC<AddEditPortalModalProps> = ({ isOpen, onClose, onUpdate, userId, portalType, pages }) => {
    const [name, setName] = useState('');
    const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setName('');
            setSelectedPageId(null);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;
        setIsLoading(true);
        await portalService.createPortal(userId, name, portalType, selectedPageId);
        onUpdate();
        setIsLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[101] flex items-center justify-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Create New {portalType} Portal</h2>
                    <button type="button" onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </header>
                <main className="p-6 space-y-4">
                    <div>
                        <label className="font-semibold">Portal Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} required autoFocus className="w-full p-2 mt-1 border rounded dark:bg-slate-700 dark:border-slate-600"/>
                    </div>
                     <div>
                        <label className="font-semibold">Assign Website (Optional)</label>
                        <select value={selectedPageId || ''} onChange={e => setSelectedPageId(e.target.value || null)} className="w-full p-2 mt-1 border rounded dark:bg-slate-700 dark:border-slate-600">
                            <option value="">-- No website assigned --</option>
                            {pages.map(page => <option key={page.id} value={page.id}>{page.name}</option>)}
                        </select>
                    </div>
                </main>
                <footer className="p-4 bg-slate-50 dark:bg-slate-700/50 border-t dark:border-slate-700 flex justify-end">
                    <button type="submit" disabled={isLoading} className="py-2 px-4 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center w-36">
                        {isLoading ? <LoaderIcon className="w-5 h-5"/> : 'Create Portal'}
                    </button>
                </footer>
            </form>
        </div>
    );
};

export default AddEditPortalModal;