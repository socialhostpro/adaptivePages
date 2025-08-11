
import React from 'react';
import XIcon from './icons/XIcon';
import LoaderIcon from './icons/LoaderIcon';

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    isProcessing?: boolean;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ isOpen, onClose, onConfirm, title, message, isProcessing = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200">{title}</h2>
                        <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
                            <XIcon className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-300">{message}</p>
                </div>
                <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 rounded-b-2xl flex justify-end items-center gap-3">
                    <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600">
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 flex items-center justify-center w-28"
                    >
                        {isProcessing ? <LoaderIcon className="w-5 h-5" /> : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteModal;
