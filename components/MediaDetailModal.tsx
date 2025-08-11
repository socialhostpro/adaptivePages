
import React, { useState, useEffect } from 'react';
import type { MediaFile } from '../src/types';
import * as storageService from '../services/storageService';
import XIcon from './icons/XIcon';
import TrashIcon from './icons/TrashIcon';
import EditIcon from './icons/EditIcon';
import LoaderIcon from './icons/LoaderIcon';

interface MediaDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: MediaFile;
    onDelete: (file: MediaFile) => Promise<void>;
    onUpdate: (updatedFile: MediaFile) => void;
}

const MediaDetailModal: React.FC<MediaDetailModalProps> = ({ isOpen, onClose, file, onDelete, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [description, setDescription] = useState(file.description || '');
    const [keywords, setKeywords] = useState((file.keywords || []).join(', '));
    
    useEffect(() => {
        setDescription(file.description || '');
        setKeywords((file.keywords || []).join(', '));
        setIsEditing(false); // Reset editing state when file changes
    }, [file]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updatedFile = await storageService.updateFileMetadata(file.id, {
                description,
                keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
            });
            onUpdate(updatedFile);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to save metadata", error);
            alert("Could not save changes. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await onDelete(file);
            // onClose will be called from the parent after state update
        } catch (e) {
            // Error is handled in parent, just reset loading state
            setIsDeleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl h-auto max-h-[90vh] flex flex-col md:flex-row overflow-hidden border dark:border-slate-700" onClick={e => e.stopPropagation()}>
                <div className="md:w-2/3 flex-shrink-0 bg-slate-100 dark:bg-black/50 flex items-center justify-center p-4">
                    <img src={file.url} alt={file.name} className="max-w-full max-h-full object-contain rounded-md" />
                </div>
                <div className="md:w-1/3 p-6 flex flex-col">
                     <header className="flex justify-between items-start gap-4">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200 break-all">{file.name}</h2>
                        <button onClick={onClose} className="-mt-2 -mr-2 p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700 flex-shrink-0">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </header>
                    <div className="text-xs text-gray-400 dark:text-slate-500 mt-1">Uploaded: {new Date(file.created_at).toLocaleDateString()}</div>
                    
                    <div className="mt-4 flex-grow overflow-y-auto space-y-4 pr-2">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Description</label>
                            {isEditing ? (
                                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 text-sm" />
                            ) : (
                                <p className="text-sm text-gray-600 dark:text-slate-300 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md min-h-[4rem]">{file.description || 'No description available.'}</p>
                            )}
                        </div>
                         <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Keywords</label>
                             {isEditing ? (
                                <input value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="keyword1, keyword2, ..." className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 text-sm" />
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {(file.keywords || []).map(k => <span key={k} className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 text-xs font-medium px-2.5 py-1 rounded-full">{k}</span>)}
                                    {(!file.keywords || file.keywords.length === 0) && <span className="text-xs text-gray-400">No keywords.</span>}
                                </div>
                            )}
                        </div>
                    </div>

                    <footer className="pt-4 mt-4 border-t dark:border-slate-700 flex justify-between items-center gap-2">
                        <button onClick={handleDelete} disabled={isDeleting} className="flex items-center gap-2 py-2 px-3 rounded-md font-semibold text-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900 disabled:opacity-50">
                           {isDeleting ? <LoaderIcon className="w-4 h-4" /> : <TrashIcon className="w-4 h-4" />}
                           {isDeleting ? 'Deleting' : 'Delete'}
                        </button>
                        {isEditing ? (
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsEditing(false)} className="py-2 px-4 rounded-md font-semibold text-sm bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>
                                <button onClick={handleSave} disabled={isSaving} className="py-2 px-4 rounded-md font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700">
                                    {isSaving ? <LoaderIcon className="w-5 h-5" /> : 'Save'}
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 py-2 px-4 rounded-md font-semibold text-sm text-white bg-slate-600 hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-400">
                               <EditIcon className="w-4 h-4" /> Edit
                            </button>
                        )}
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default MediaDetailModal;