import React, { useState, useEffect, useRef } from 'react';
import XIcon from './icons/XIcon';

interface PromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (value: string) => void;
    title: string;
    inputLabel: string;
    initialValue?: string;
    submitText?: string;
}

const PromptModal: React.FC<PromptModalProps> = ({ isOpen, onClose, onSubmit, title, inputLabel, initialValue = '', submitText = 'Submit' }) => {
    const [value, setValue] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setValue(initialValue);
            // Focus input when modal opens
            setTimeout(() => inputRef.current?.focus(), 100);

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    onClose();
                }
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, initialValue, onClose]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim()) {
            onSubmit(value.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200">{title}</h2>
                            <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
                                <XIcon className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                            </button>
                        </div>
                        <div>
                            <label htmlFor="prompt-input" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                                {inputLabel}
                            </label>
                            <input
                                ref={inputRef}
                                id="prompt-input"
                                type="text"
                                value={value}
                                onChange={e => setValue(e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-base focus:ring-indigo-500 focus:border-indigo-500 transition bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"
                            />
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 rounded-b-2xl flex justify-end items-center gap-3">
                        <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600">
                            Cancel
                        </button>
                        <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                            {submitText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PromptModal;