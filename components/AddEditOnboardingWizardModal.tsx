

import React, { useState, useEffect } from 'react';
import type { OnboardingWizard, OnboardingStep, OnboardingQuestion } from '../src/types';
import * as onboardingService from '../services/onboardingService';
import XIcon from './icons/XIcon';
import TrashIcon from './icons/TrashIcon';
import PlusIcon from './icons/PlusIcon';
import LoaderIcon from './icons/LoaderIcon';

interface AddEditOnboardingWizardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (wizardData: Omit<OnboardingWizard, 'id' | 'user_id' | 'created_at'>, wizardId?: string) => Promise<void>;
    wizardToEdit: OnboardingWizard | null;
}

const AddEditOnboardingWizardModal: React.FC<AddEditOnboardingWizardModalProps> = ({ isOpen, onClose, onSave, wizardToEdit }) => {
    const [wizard, setWizard] = useState<Partial<Omit<OnboardingWizard, 'id' | 'user_id' | 'created_at'>>>({
        name: '',
        steps: [{ id: `s-${Date.now()}`, title: 'Step 1', questions: [] }]
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (wizardToEdit) {
                setWizard(wizardToEdit);
            } else {
                setWizard({
                    name: '',
                    steps: [{ id: `s-${Date.now()}`, title: 'Step 1', questions: [] }]
                });
            }
        }
    }, [isOpen, wizardToEdit]);

    const handleChange = (field: keyof typeof wizard, value: any) => {
        setWizard(prev => ({ ...prev, [field]: value }));
    };

    const handleStepChange = (stepIndex: number, field: 'title', value: string) => {
        const newSteps = [...wizard.steps!];
        newSteps[stepIndex] = { ...newSteps[stepIndex], [field]: value };
        handleChange('steps', newSteps);
    };

    const addStep = () => {
        const newSteps = [...wizard.steps!, { id: `s-${Date.now()}`, title: `Step ${wizard.steps!.length + 1}`, questions: [] }];
        handleChange('steps', newSteps);
    };
    
    const removeStep = (stepIndex: number) => {
        const newSteps = wizard.steps!.filter((_, i) => i !== stepIndex);
        handleChange('steps', newSteps);
    };
    
    const addQuestion = (stepIndex: number) => {
        const newSteps = [...wizard.steps!];
        newSteps[stepIndex].questions.push({ id: `q-${Date.now()}`, text: '', type: 'text', required: true });
        handleChange('steps', newSteps);
    };
    
    const removeQuestion = (stepIndex: number, questionIndex: number) => {
        const newSteps = [...wizard.steps!];
        newSteps[stepIndex].questions = newSteps[stepIndex].questions.filter((_, i) => i !== questionIndex);
        handleChange('steps', newSteps);
    };
    
    const handleQuestionChange = (stepIndex: number, questionIndex: number, field: keyof OnboardingQuestion, value: any) => {
        const newSteps = [...wizard.steps!];
        newSteps[stepIndex].questions[questionIndex] = { ...newSteps[stepIndex].questions[questionIndex], [field]: value };
        handleChange('steps', newSteps);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!wizard.name) {
            alert("Wizard name is required.");
            return;
        }
        setIsLoading(true);
        await onSave(wizard as any, wizardToEdit?.id);
        setIsLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[101] flex items-center justify-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">{wizardToEdit ? 'Edit Wizard' : 'Create Wizard'}</h2>
                    <button type="button" onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </header>
                <main className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label className="font-semibold">Wizard Name</label>
                        <input value={wizard.name} onChange={e => handleChange('name', e.target.value)} required autoFocus className="w-full p-2 mt-1 border rounded dark:bg-slate-700 dark:border-slate-600"/>
                    </div>
                    <div>
                        <h3 className="font-semibold">Steps</h3>
                        <div className="space-y-4 mt-2">
                            {wizard.steps?.map((step, sIndex) => (
                                <div key={step.id} className="p-4 border rounded dark:border-slate-700 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <input value={step.title} onChange={e => handleStepChange(sIndex, 'title', e.target.value)} className="font-bold text-lg p-1 bg-transparent border-b dark:border-slate-600 focus:outline-none focus:border-indigo-500" />
                                        <button type="button" onClick={() => removeStep(sIndex)}><TrashIcon className="w-5 h-5 text-red-500"/></button>
                                    </div>
                                    <div className="space-y-2">
                                        {step.questions.map((q, qIndex) => (
                                            <div key={q.id} className="p-2 border rounded dark:border-slate-600 grid grid-cols-12 gap-2 items-center">
                                                 <div className="col-span-4"><input value={q.text} onChange={e => handleQuestionChange(sIndex, qIndex, 'text', e.target.value)} placeholder="Question Text" className="w-full p-1 border rounded text-sm dark:bg-slate-600 dark:border-slate-500"/></div>
                                                 <div className="col-span-4">
                                                     <select value={q.type} onChange={e => handleQuestionChange(sIndex, qIndex, 'type', e.target.value)} className="w-full p-1 border rounded text-sm dark:bg-slate-600 dark:border-slate-500">
                                                        <option value="text">Text</option>
                                                        <option value="email">Email</option>
                                                        <option value="tel">Phone</option>
                                                        <option value="password">Password</option>
                                                        <option value="dropdown">Dropdown</option>
                                                        <option value="multiple-choice">Multiple Choice</option>
                                                        <option value="switch">Switch</option>
                                                     </select>
                                                 </div>
                                                 <div className="col-span-3 flex items-center gap-1.5">
                                                    <input type="checkbox" checked={q.required} onChange={e => handleQuestionChange(sIndex, qIndex, 'required', e.target.checked)} className="h-4 w-4"/>
                                                    <label className="text-sm">Required</label>
                                                </div>
                                                <div className="col-span-1"><button type="button" onClick={() => removeQuestion(sIndex, qIndex)}><TrashIcon className="w-4 h-4 text-red-500"/></button></div>
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" onClick={() => addQuestion(sIndex)} className="text-sm flex items-center gap-1 text-indigo-600 hover:underline"><PlusIcon className="w-4 h-4"/> Add Question</button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addStep} className="mt-2 text-sm w-full py-2 border-2 border-dashed rounded-lg dark:border-slate-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                            <PlusIcon className="w-5 h-5 mx-auto"/>
                        </button>
                    </div>
                </main>
                <footer className="p-4 bg-slate-50 dark:bg-slate-700/50 border-t dark:border-slate-700 flex justify-end">
                    <button type="submit" disabled={isLoading} className="py-2 px-4 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center w-24">
                        {isLoading ? <LoaderIcon className="w-5 h-5"/> : 'Save'}
                    </button>
                </footer>
            </form>
        </div>
    );
};

export default AddEditOnboardingWizardModal;