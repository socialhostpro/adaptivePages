

import React, { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { OnboardingWizard } from './types';
import PlusIcon from './components/icons/PlusIcon';
import AddEditOnboardingWizardModal from './components/AddEditOnboardingWizardModal';
import * as onboardingService from './services/onboardingService';

interface OnboardingManagementProps {
    session: Session;
    wizards: OnboardingWizard[];
    onUpdate: () => void;
}

const OnboardingManagement: React.FC<OnboardingManagementProps> = ({ session, wizards, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWizard, setEditingWizard] = useState<OnboardingWizard | null>(null);

    const handleAdd = () => {
        setEditingWizard(null);
        setIsModalOpen(true);
    };

    const handleEdit = (wizard: OnboardingWizard) => {
        setEditingWizard(wizard);
        setIsModalOpen(true);
    };

    const handleDelete = async (wizardId: string) => {
        if (window.confirm("Are you sure you want to delete this wizard?")) {
            await onboardingService.deleteWizard(wizardId);
            onUpdate();
        }
    };

    const handleSave = async (wizardData: Omit<OnboardingWizard, 'id' | 'user_id' | 'created_at'>, wizardId?: string) => {
        if (wizardId) {
            await onboardingService.updateWizard(wizardId, wizardData);
        } else {
            await onboardingService.createWizard(session.user.id, wizardData);
        }
        onUpdate();
        setIsModalOpen(false);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md h-full flex flex-col">
            <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Onboarding Wizards</h3>
                <button 
                    onClick={handleAdd}
                    className="flex items-center gap-2 py-2 px-4 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <PlusIcon className="w-5 h-5"/> Create Wizard
                </button>
            </div>
            <div className="p-4 overflow-y-auto">
                {wizards.length === 0 ? (
                    <p className="text-center text-slate-500">No wizards created yet.</p>
                ) : (
                    <ul className="space-y-2">
                        {wizards.map(wizard => (
                            <li key={wizard.id} className="p-4 border dark:border-slate-700 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">{wizard.name}</p>
                                    <p className="text-sm text-slate-500">{wizard.steps.length} steps</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleEdit(wizard)} className="font-medium text-sm text-indigo-600 hover:underline">Edit</button>
                                    <button onClick={() => handleDelete(wizard.id)} className="font-medium text-sm text-red-600 hover:underline">Delete</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {isModalOpen && (
                <AddEditOnboardingWizardModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    wizardToEdit={editingWizard}
                />
            )}
        </div>
    );
};

export default OnboardingManagement;