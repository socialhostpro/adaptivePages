
import React from 'react';
import type { TeamMember } from '../types';
import PlusIcon from './icons/PlusIcon';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';

interface TeamMembersProps {
    members: TeamMember[];
    onAdd: () => void;
    onEdit: (member: TeamMember) => void;
    onDelete: (memberId: string) => void;
}

const roleColors: { [key in TeamMember['role']]: string } = {
    'Admin': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
    'Member': 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
    'Viewer': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const TeamMembers: React.FC<TeamMembersProps> = ({ members, onAdd, onEdit, onDelete }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md h-full flex flex-col">
            <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Team Members</h3>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 py-2 px-4 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <PlusIcon className="w-5 h-5"/> Add Member
                </button>
            </div>
            <div className="overflow-x-auto flex-grow">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Role</th>
                            <th scope="col" className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map(member => (
                            <tr key={member.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/20">
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{member.name}</td>
                                <td className="px-6 py-4">{member.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${roleColors[member.role]}`}>
                                        {member.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => onEdit(member)} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700">
                                        <EditIcon className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => onDelete(member.id)} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-red-500">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {members.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                        No team members yet. Add one to get started.
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamMembers;
