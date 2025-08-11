import React, { useState, useEffect } from 'react';
import type { ManagedPage, PageGroup, CrmContact, Task } from '../types';
import * as pageService from '../services/pageService';
import XIcon from './icons/XIcon';
import LoaderIcon from './icons/LoaderIcon';
import AssociatedTasks from './AssociatedTasks';

interface PageAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void; // To trigger a refresh
    page: ManagedPage;
    groups: PageGroup[];
    contacts: { id: number, name: string | null }[];
    // Task props
    allTasks?: Task[];
    onOpenTaskModal?: (task: Task | null, initialLink: any) => void;
}

const PageAssignmentModal: React.FC<PageAssignmentModalProps> = ({ isOpen, onClose, onSave, page, groups, contacts, allTasks = [], onOpenTaskModal }) => {
    const [groupId, setGroupId] = useState<string | null>(page.groupId || null);
    const [ownerId, setOwnerId] = useState<number | null>(page.ownerContactId || null);
    const [domain, setDomain] = useState<string | null>(page.customDomain || null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setGroupId(page.groupId || null);
            setOwnerId(page.ownerContactId || null);
            setDomain(page.customDomain || '');
            setError(null);
        }
    }, [isOpen, page]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        try {
            await pageService.updatePageAssignments(page.id, {
                groupId: groupId,
                ownerContactId: ownerId,
                customDomain: domain,
            });
            onSave();
            onClose();
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setIsSaving(false);
        }
    };
    
    // --- Task Handlers ---
    const handleAddTask = () => {
        onOpenTaskModal && onOpenTaskModal(null, { type: 'page', id: page.id });
    };

    const handleEditTask = (task: Task) => {
        onOpenTaskModal && onOpenTaskModal(task, null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[101] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSave}>
                    <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold">Manage Page</h2>
                            <p className="text-sm text-slate-500">{page.name}</p>
                        </div>
                        <button type="button" onClick={onClose}><XIcon className="w-6 h-6"/></button>
                    </header>
                    <main className="p-6 space-y-4">
                        <div>
                            <label className="font-semibold">Assign to Group</label>
                            <select value={groupId || ''} onChange={e => setGroupId(e.target.value || null)} className="w-full p-2 mt-1 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600">
                                <option value="">-- Uncategorized --</option>
                                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="font-semibold">Assign Owner</label>
                            <select value={ownerId || ''} onChange={e => setOwnerId(Number(e.target.value) || null)} className="w-full p-2 mt-1 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600">
                                <option value="">-- No Owner --</option>
                                {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="font-semibold">Custom Domain</label>
                            <input value={domain || ''} onChange={e => setDomain(e.target.value)} placeholder="www.example.com" className="w-full p-2 mt-1 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600"/>
                        </div>
                        {error && <p className="text-sm text-red-500 bg-red-100 dark:bg-red-900/30 p-2 rounded-md">{error}</p>}
                        
                        {onOpenTaskModal && (
                            <AssociatedTasks
                                entityType="page"
                                entityId={page.id}
                                allTasks={allTasks}
                                onAddTask={handleAddTask}
                                onEditTask={handleEditTask}
                            />
                        )}
                    </main>
                    <footer className="p-4 bg-slate-50 dark:bg-slate-700/50 border-t dark:border-slate-700 flex justify-end">
                        <button type="submit" disabled={isSaving} className="py-2 px-4 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center w-24">
                            {isSaving ? <LoaderIcon className="w-5 h-5"/> : 'Save'}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default PageAssignmentModal;