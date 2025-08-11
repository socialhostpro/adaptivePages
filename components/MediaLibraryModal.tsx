
import React, { useState } from 'react';
import type { MediaFile } from '../src/types';
import XIcon from './icons/XIcon';
import UploadCloudIcon from './icons/UploadCloudIcon';
import LoaderIcon from './icons/LoaderIcon';

interface MediaLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    mediaFiles: MediaFile[];
    onSelectFile: (file: MediaFile) => void;
    onUploadFile: (file: File) => Promise<void>;
}

const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({ isOpen, onClose, mediaFiles, onSelectFile, onUploadFile }) => {
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            await onUploadFile(file);
        } catch (error) {
            console.error("Upload failed in modal:", error);
            alert("Upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[110] p-4" onClick={onClose}>
            <div 
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden border dark:border-slate-700"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200">Select an Image</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>

                <div className="p-4 flex-grow overflow-y-auto">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                        <label className="relative aspect-square border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer">
                            <input type="file" className="absolute inset-0 w-full h-full opacity-0" onChange={handleFileChange} disabled={isUploading} accept="image/*"/>
                            {isUploading ? <LoaderIcon className="w-8 h-8"/> : <UploadCloudIcon className="w-8 h-8"/>}
                            <span className="text-xs mt-2 text-center">{isUploading ? 'Uploading...' : 'Upload New'}</span>
                        </label>

                        {mediaFiles.map(file => (
                            <button key={file.id} onClick={() => onSelectFile(file)} className="relative aspect-square bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800">
                                <img src={file.url} alt={file.name} className="w-full h-full object-cover"/>
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white font-bold">Select</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MediaLibraryModal;