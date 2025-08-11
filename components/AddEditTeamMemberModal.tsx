
import React, { useState, useEffect } from 'react';
import type { TeamMember, TeamRole } from '../types';
import XIcon from './icons/XIcon';
import LoaderIcon from './icons/LoaderIcon';

interface AddEditTeamMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (memberData: Omit<TeamMember, 'id' | 'user_id' | 'created_at'>, memberId?: string) => Promise<void>;
    memberToEdit: TeamMember | null;
}

const ROLE_OPTIONS: TeamRole[] = ['Admin', 'Member', 'Viewer'];

const AddEditTeamMemberModal: React.FC<AddEditTeamMemberModalProps> = ({ isOpen, onClose, onSave, memberToEdit }) => {
    const [member, setMember] = useState<Partial<Omit<TeamMember, 'id' | 'user_id' | 'created_at'>>>({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setMember({
                name: memberToEdit?.name || '',
                email: memberToEdit?.email || '',
                role: memberToEdit?.role || 'Member',
            });
        }
    }, [isOpen, memberToEdit]);

    const handleChange = (field: keyof typeof member, value: any) => {
        setMember(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!member.name || !member.email) {
            alert("Name and email are required.");
            return;
        }
        setIsLoading(true);
        await onSave(member as any, memberToEdit?.id);
        setIsLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[101] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">{memberToEdit ? 'Edit Team Member' : 'Add Team Member'}</h2>
                    <button type="button" onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </header>
                <form onSubmit={handleSubmit} className="flex-grow flex flex-col min-h-0">
                    <main className="p-6 space-y-4 overflow-y-auto">
                        <div>
                            <label className="font-semibold">Full Name</label>
                            <input value={member.name || ''} onChange={e => handleChange('name', e.target.value)} required className="w-full p-2 mt-1 border rounded dark:bg-slate-700 dark:border-slate-600"/>
                        </div>
                        <div>
                            <label className="font-semibold">Email</label>
                            <input type="email" value={member.email || ''} onChange={e => handleChange('email', e.target.value)} required className="w-full p-2 mt-1 border rounded dark:bg-slate-700 dark:border-slate-600"/>
                        </div>
                        <div>
                            <label className="font-semibold">Role</label>
                            <select value={member.role} onChange={e => handleChange('role', e.target.value as TeamRole)} className="w-full p-2 mt-1 border rounded dark:bg-slate-700 dark:border-slate-600">
                                {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                    </main>
                    <footer className="p-4 bg-slate-50 dark:bg-slate-700/50 border-t dark:border-slate-700 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-md font-semibold text-sm bg-white dark:bg-slate-600 border dark:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-500">Cancel</button>
                        <button type="submit" disabled={isLoading} className="py-2 px-4 rounded-md font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center w-24">
                            {isLoading ? <LoaderIcon className="w-5 h-5"/> : 'Save'}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default AddEditTeamMemberModal;
