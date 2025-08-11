

import React from 'react';
import type { PageGroup, ManagedPage, Task } from '../src/types';
import XIcon from './icons/XIcon';
import AssociatedTasks from './AssociatedTasks';

interface GroupDetailModalProps {
    group: PageGroup;
    pagesInGroup: ManagedPage[];
    isOpen: boolean;
    onClose: () => void;
    allTasks: Task[];
    onOpenTaskModal: (task: Task | null, initialLink: any) => void;
}

const GroupDetailModal: React.FC<GroupDetailModalProps> = ({ group, pagesInGroup, isOpen, onClose, allTasks, onOpenTaskModal }) => {
    if (!isOpen) return null;

    const handleAddTask = () => {
        onOpenTaskModal(null, { type: 'page_group', id: group.id });
    };

    const handleEditTask = (task: Task) => {
        onOpenTaskModal(task, null);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Manage Group</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{group.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                        <XIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                    </button>
                </header>
                <main className="p-6 overflow-y-auto space-y-6">
                    <div>
                        <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Pages in this Group</h3>
                        <div className="border rounded-lg dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-700/50 max-h-48 overflow-y-auto">
                            {pagesInGroup.length > 0 ? (
                                <ul className="space-y-1">
                                    {pagesInGroup.map(page => (
                                        <li key={page.id} className="text-sm text-slate-800 dark:text-slate-200">{page.name}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-slate-500">No pages are assigned to this group.</p>
                            )}
                        </div>
                    </div>

                    <AssociatedTasks
                        entityType="page_group"
                        entityId={group.id}
                        allTasks={allTasks}
                        onAddTask={handleAddTask}
                        onEditTask={handleEditTask}
                    />

                </main>
            </div>
        </div>
    );
};

export default GroupDetailModal;