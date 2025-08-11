

import React, { useState } from 'react';
import type { CrmForm } from '../src/types';
import AddEditFormModal from './AddEditFormModal';
import PlusIcon from './icons/PlusIcon';

interface FormBuilderViewProps {
    forms: CrmForm[];
    onUpdate: () => void;
    userId: string;
}

const FormBuilderView: React.FC<FormBuilderViewProps> = ({ forms, onUpdate, userId }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md h-full flex flex-col">
            <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Your Forms</h3>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 py-2 px-4 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <PlusIcon className="w-5 h-5"/> Create Form
                </button>
            </div>
            <div className="p-4 overflow-y-auto">
                {forms.length === 0 ? (
                    <p className="text-center text-slate-500">No forms created yet.</p>
                ) : (
                    <ul className="space-y-2">
                        {forms.map(form => (
                            <li key={form.id} className="p-4 border dark:border-slate-700 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">{form.name}</p>
                                    <p className="text-sm text-slate-500">{form.fields.length} fields</p>
                                </div>
                                <button className="font-medium text-sm text-indigo-600 hover:underline" disabled>Edit (coming soon)</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            
            {isModalOpen && (
                <AddEditFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onUpdate={onUpdate}
                    userId={userId}
                />
            )}
        </div>
    );
};

export default FormBuilderView;