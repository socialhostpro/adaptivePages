

import React, { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { TeamMember } from './types';
import * as teamService from './services/teamService';
import ComingSoon from './components/ComingSoon';
import UsersGroupIcon from './components/icons/UsersGroupIcon';
import AddEditTeamMemberModal from './components/AddEditTeamMemberModal';
import TeamMembers from './components/TeamMembers';

interface TeamManagementProps {
    session: Session;
    activeSubTab: string;
    setActiveSubTab: (tab: string) => void;
    team: TeamMember[];
    onUpdate: () => void;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ session, activeSubTab, setActiveSubTab, team, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

    const handleOpenModal = (member: TeamMember | null = null) => {
        setEditingMember(member);
        setIsModalOpen(true);
    };

    const handleSaveMember = async (memberData: Omit<TeamMember, 'id' | 'user_id' | 'created_at'>, memberId?: string) => {
        if (memberId) {
            await teamService.updateTeamMember(memberId, memberData);
        } else {
            await teamService.createTeamMember(session.user.id, memberData);
        }
        onUpdate();
        setIsModalOpen(false);
    };

    const handleDeleteMember = async (memberId: string) => {
        if (window.confirm("Are you sure you want to remove this team member?")) {
            await teamService.deleteTeamMember(memberId);
            onUpdate();
        }
    };

    const subTabs = [
        { key: 'team.dashboard', label: "Dashboard" },
        { key: 'team.members', label: "Members" },
    ];
    
    const renderContent = () => {
        switch(activeSubTab) {
            case 'team.dashboard':
                return <ComingSoon title="Team Dashboard" message="An overview of team activity and performance will be available here soon." icon={UsersGroupIcon} />;
            case 'team.members':
                return <TeamMembers members={team} onAdd={() => handleOpenModal()} onEdit={handleOpenModal} onDelete={handleDeleteMember} />;
            default:
                 // Default to members view if an unknown sub-tab is selected
                return <TeamMembers members={team} onAdd={() => handleOpenModal()} onEdit={handleOpenModal} onDelete={handleDeleteMember} />;
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-6">
                    {subTabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveSubTab(tab.key)}
                            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                                activeSubTab === tab.key
                                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="flex-grow pt-6 min-h-0">
                {renderContent()}
            </div>
             {isModalOpen && (
                <AddEditTeamMemberModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveMember}
                    memberToEdit={editingMember}
                />
            )}
        </div>
    );
};

export default TeamManagement;