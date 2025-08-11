
import React, { useState } from 'react';
import type { OnboardingWizard } from '../types';
import XIcon from './icons/XIcon';
import LoaderIcon from './icons/LoaderIcon';

interface OnboardingWizardModalProps {
    isOpen: boolean;
    onClose: () => void;
    wizard: OnboardingWizard;
    onSubmit: (submissionData: Record<string, any>) => Promise<void>;
}

const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({ isOpen, onClose, wizard, onSubmit }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleNext = () => {
        if (currentStep < wizard.steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleChange = (questionId: string, value: any) => {
        setFormData(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await onSubmit(formData);
        setIsLoading(false);
        onClose(); // Assume onSubmit handles everything and we can close.
    };
    
    if (!isOpen) return null;

    const step = wizard.steps[currentStep];

    return (
        <div className="fixed inset-0 bg-black/60 z-[101] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">{wizard.name} - Step {currentStep + 1} of {wizard.steps.length}</h2>
                    <button type="button" onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </header>
                <form onSubmit={handleSubmit} className="flex-grow flex flex-col min-h-0">
                    <main className="p-6 space-y-4 overflow-y-auto">
                        <h3 className="text-lg font-semibold">{step.title}</h3>
                        {step.questions.map(q => {
                            const renderInput = () => {
                                switch (q.type) {
                                    case 'switch':
                                        return (
                                            <div className="flex items-center mt-2">
                                                <input
                                                    type="checkbox"
                                                    checked={!!formData[q.id]}
                                                    onChange={e => handleChange(q.id, e.target.checked)}
                                                    id={q.id}
                                                    className="h-4 w-4 rounded"
                                                />
                                            </div>
                                        );
                                    case 'dropdown':
                                        return (
                                            <select
                                                value={formData[q.id] || ''}
                                                onChange={e => handleChange(q.id, e.target.value)}
                                                required={q.required}
                                                id={q.id}
                                                className="w-full p-2 mt-1 border rounded dark:bg-slate-700 dark:border-slate-600"
                                            >
                                                <option value="" disabled>Select...</option>
                                                {(q.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        );
                                    case 'multiple-choice':
                                        return (
                                            <div className="mt-1 space-y-2">
                                                {(q.options || []).map(opt => (
                                                    <label key={opt} className="flex items-center gap-2">
                                                        <input
                                                            type="radio"
                                                            name={q.id}
                                                            value={opt}
                                                            checked={formData[q.id] === opt}
                                                            onChange={e => handleChange(q.id, e.target.value)}
                                                            required={q.required}
                                                        />
                                                        {opt}
                                                    </label>
                                                ))}
                                            </div>
                                        );
                                    default: // text, email, tel, password
                                        return (
                                            <input
                                                type={q.type}
                                                value={formData[q.id] || ''}
                                                onChange={e => handleChange(q.id, e.target.value)}
                                                required={q.required}
                                                id={q.id}
                                                className="w-full p-2 mt-1 border rounded dark:bg-slate-700 dark:border-slate-600"
                                            />
                                        );
                                }
                            };

                            return (
                                <div key={q.id} className="py-2">
                                    <label htmlFor={q.id} className="font-medium">{q.text}{q.required && ' *'}</label>
                                    {renderInput()}
                                </div>
                            )
                        })}
                    </main>
                    <footer className="p-4 bg-slate-50 dark:bg-slate-700/50 border-t dark:border-slate-700 flex justify-between">
                        <button type="button" onClick={handleBack} disabled={currentStep === 0} className="py-2 px-4 rounded-md font-semibold text-sm bg-white dark:bg-slate-600 border dark:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-500 disabled:opacity-50">Back</button>
                        {currentStep === wizard.steps.length - 1 ? (
                            <button type="submit" disabled={isLoading} className="py-2 px-4 rounded-md font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center w-24">
                                {isLoading ? <LoaderIcon className="w-5 h-5"/> : 'Submit'}
                            </button>
                        ) : (
                             <button type="button" onClick={handleNext} className="py-2 px-4 rounded-md font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700">Next</button>
                        )}
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default OnboardingWizardModal;
