
import React, { useState } from 'react';
import type { CrmFormField } from '../types';
import * as contactService from '../services/contactService';
import XIcon from './icons/XIcon';
import TrashIcon from './icons/TrashIcon';
import PlusIcon from './icons/PlusIcon';
import LoaderIcon from './icons/LoaderIcon';

interface AddEditFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
    userId: string;
}

const AddEditFormModal: React.FC<AddEditFormModalProps> = ({ isOpen, onClose, onUpdate, userId }) => {
    const [name, setName] = useState('');
    const [fields, setFields] = useState<CrmFormField[]>([{ id: `f-${Date.now()}`, label: 'Name', type: 'text', required: true }]);
    const [isLoading, setIsLoading] = useState(false);

    const addField = () => {
        setFields([...fields, { id: `f-${Date.now()}`, label: '', type: 'text', required: false }]);
    };

    const removeField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
    };

    const handleFieldChange = (id: string, prop: keyof CrmFormField, value: any) => {
        setFields(fields.map(f => f.id === id ? { ...f, [prop]: value } : f));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || fields.length === 0) {
            alert("Please provide a name and at least one field.");
            return;
        }
        setIsLoading(true);
        await contactService.createForm(userId, name, fields);
        onUpdate();
        setIsLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[101] flex items-center justify-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Create New Form</h2>
                    <button type="button" onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </header>
                <main className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label className="font-semibold">Form Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 mt-1 border rounded dark:bg-slate-700 dark:border-slate-600"/>
                    </div>
                    <div>
                        <h3 className="font-semibold">Fields</h3>
                        <div className="space-y-2 mt-2">
                            {fields.map(field => (
                                <div key={field.id} className="p-2 border rounded dark:border-slate-700 grid grid-cols-12 gap-2 items-center">
                                    <div className="col-span-4"><input value={field.label} onChange={e => handleFieldChange(field.id, 'label', e.target.value)} placeholder="Label" className="w-full p-1 border rounded text-sm dark:bg-slate-600 dark:border-slate-500"/></div>
                                    <div className="col-span-4">
                                        <select value={field.type} onChange={e => handleFieldChange(field.id, 'type', e.target.value)} className="w-full p-1 border rounded text-sm dark:bg-slate-600 dark:border-slate-500">
                                            <option value="text">Text</option>
                                            <option value="email">Email</option>
                                            <option value="tel">Phone</option>
                                            <option value="textarea">Text Area</option>
                                        </select>
                                    </div>
                                    <div className="col-span-3 flex items-center gap-1.5">
                                        <input type="checkbox" checked={field.required} onChange={e => handleFieldChange(field.id, 'required', e.target.checked)} className="h-4 w-4"/>
                                        <label className="text-sm">Required</label>
                                    </div>
                                    <div className="col-span-1"><button type="button" onClick={() => removeField(field.id)}><TrashIcon className="w-4 h-4 text-red-500"/></button></div>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addField} className="mt-2 text-sm flex items-center gap-1 text-indigo-600 hover:underline">
                            <PlusIcon className="w-4 h-4"/> Add Field
                        </button>
                    </div>
                </main>
                <footer className="p-4 bg-slate-50 dark:bg-slate-700/50 border-t dark:border-slate-700 flex justify-end">
                    <button type="submit" disabled={isLoading} className="py-2 px-4 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center w-28">
                        {isLoading ? <LoaderIcon className="w-5 h-5"/> : 'Create Form'}
                    </button>
                </footer>
            </form>
        </div>
    );
};

export default AddEditFormModal;
