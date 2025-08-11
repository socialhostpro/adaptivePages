

import React from 'react';
import type { CrmContact, Task } from '../src/types';
import XIcon from './icons/XIcon';
import AssociatedTasks from './AssociatedTasks';

interface ContactDetailModalProps {
    contact: CrmContact;
    isOpen: boolean;
    onClose: () => void;
    allTasks: Task[];
    onOpenTaskModal: (task: Task | null, initialLink: any) => void;
}

const ContactDetailModal: React.FC<ContactDetailModalProps> = ({ contact, isOpen, onClose, allTasks, onOpenTaskModal }) => {
    if (!isOpen) return null;

    const handleAddTask = () => {
        onOpenTaskModal(null, { type: 'contact', id: contact.id });
    };

    const handleEditTask = (task: Task) => {
        onOpenTaskModal(task, null);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Contact Details</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{contact.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                        <XIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                    </button>
                </header>
                <main className="p-6 overflow-y-auto space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Email</h3>
                            <p className="text-indigo-600 dark:text-indigo-400 hover:underline">{contact.email}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Status</h3>
                            <p className="text-slate-900 dark:text-white">{contact.status}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Source</h3>
                            <p className="text-slate-900 dark:text-white">{contact.source}</p>
                        </div>
                         <div>
                            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Date Added</h3>
                            <p className="text-slate-900 dark:text-white">{new Date(contact.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                     <div>
                        <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Notes</h3>
                        <div className="border rounded-lg dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-700/50">
                           <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{contact.notes || 'No notes for this contact.'}</p>
                        </div>
                    </div>

                    <AssociatedTasks
                        entityType="contact"
                        entityId={contact.id}
                        allTasks={allTasks}
                        onAddTask={handleAddTask}
                        onEditTask={handleEditTask}
                    />

                </main>
            </div>
        </div>
    );
};

export default ContactDetailModal;