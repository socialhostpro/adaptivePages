

import React, { useState } from 'react';
import type { PageGroup, Task, ManagedPage } from '../src/types';
import * as groupService from '../services/groupService';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import EditIcon from './icons/EditIcon';
import LoaderIcon from './icons/LoaderIcon';
import GroupDetailModal from './GroupDetailModal';

interface GroupManagementProps {
    groups: PageGroup[];
    userId: string;
    onUpdate: () => void;
    allTasks: Task[];
    onOpenTaskModal: (task: Task | null, initialLink: any) => void;
    pages: ManagedPage[];
}

const GroupManagement: React.FC<GroupManagementProps> = ({ groups, userId, onUpdate, allTasks, onOpenTaskModal, pages }) => {
    const [newGroupName, setNewGroupName] = useState('');
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [managingGroup, setManagingGroup] = useState<PageGroup | null>(null);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;
        setIsProcessing(true);
        await groupService.createGroup(userId, newGroupName.trim());
        setNewGroupName('');
        onUpdate();
        setIsProcessing(false);
    };

    const handleEdit = (group: PageGroup) => {
        setEditingGroupId(group.id);
        setEditingName(group.name);
    };

    const handleSave = async (groupId: string) => {
        if (!editingName.trim()) return;
        setIsProcessing(true);
        await groupService.updateGroup(groupId, editingName.trim());
        setEditingGroupId(null);
        setEditingName('');
        onUpdate();
        setIsProcessing(false);
    };

    const handleDelete = async (groupId: string) => {
        if (window.confirm("Are you sure you want to delete this group? Pages in this group will become uncategorized.")) {
            setIsProcessing(true);
            await groupService.deleteGroup(groupId);
            onUpdate();
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md h-full flex flex-col">
            <div className="p-4 border-b dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Manage Page Groups</h3>
                <form onSubmit={handleCreate} className="flex gap-2 mt-4">
                    <input
                        type="text"
                        value={newGroupName}
                        onChange={e => setNewGroupName(e.target.value)}
                        placeholder="Add a new group..."
                        className="flex-grow p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm bg-white dark:bg-slate-700"
                    />
                    <button type="submit" disabled={isProcessing} className="flex items-center gap-2 py-2 px-4 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                        <PlusIcon className="w-5 h-5" /> Add Group
                    </button>
                </form>
            </div>
            <div className="p-4 overflow-y-auto">
                <ul className="space-y-2">
                    {groups.map(group => (
                        <li key={group.id} className="p-2 border dark:border-slate-700 rounded-lg flex justify-between items-center group">
                            {editingGroupId === group.id ? (
                                <input
                                    type="text"
                                    value={editingName}
                                    onChange={e => setEditingName(e.target.value)}
                                    onBlur={() => handleSave(group.id)}
                                    onKeyDown={e => e.key === 'Enter' && handleSave(group.id)}
                                    autoFocus
                                    className="flex-grow p-1 border rounded bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-500"
                                />
                            ) : (
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{group.name}</span>
                            )}
                            <div className="flex items-center gap-1">
                                <button onClick={() => setManagingGroup(group)} className="text-sm font-medium text-indigo-600 hover:underline px-2">Manage</button>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                    <button onClick={() => handleEdit(group)} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"><EditIcon className="w-4 h-4"/></button>
                                    <button onClick={() => handleDelete(group.id)} disabled={isProcessing} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"><TrashIcon className="w-4 h-4 text-red-500" /></button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
                {groups.length === 0 && <p className="text-center text-slate-500">No groups created yet.</p>}
            </div>
            {managingGroup && (
                <GroupDetailModal
                    isOpen={!!managingGroup}
                    onClose={() => setManagingGroup(null)}
                    group={managingGroup}
                    pagesInGroup={pages.filter(p => p.groupId === managingGroup.id)}
                    allTasks={allTasks}
                    onOpenTaskModal={onOpenTaskModal}
                />
            )}
        </div>
    );
};

export default GroupManagement;