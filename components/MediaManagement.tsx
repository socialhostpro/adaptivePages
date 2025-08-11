
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Session } from '@supabase/supabase-js';
import * as storageService from '../services/storageService';
import type { MediaFile } from '../src/types';
import LoaderIcon from './icons/LoaderIcon';
import UploadCloudIcon from './icons/UploadCloudIcon';
import SearchIcon from './icons/SearchIcon';
import MediaDetailModal from './MediaDetailModal';

interface StockGalleryProps {
    session: Session;
}

const StockGallery: React.FC<StockGalleryProps> = ({ session }) => {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);

    const loadFiles = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const userFiles = await storageService.listFiles(session.user.id);
            setFiles(userFiles);
        } catch (e) {
            setError('Could not load media files.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [session.user.id]);

    useEffect(() => {
        loadFiles();
    }, [loadFiles]);
    
    const filteredAndSortedFiles = useMemo(() => {
        return files
            .filter(file => 
                file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (file.description && file.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (file.keywords && file.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase())))
            )
            .sort((a, b) => {
                const dateA = new Date(a.created_at).getTime();
                const dateB = new Date(b.created_at).getTime();
                return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
            });
    }, [files, searchTerm, sortOrder]);


    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);
        try {
            await storageService.uploadAndAnalyzeFile(session.user.id, file);
            await loadFiles();
        } catch (e) {
            setError('Failed to upload file. It might be too large or an unsupported type.');
            console.error(e);
        } finally {
            setIsUploading(false);
            // Reset file input to allow re-uploading the same file
            event.target.value = '';
        }
    };

    const handleDeleteFile = async (file: MediaFile) => {
        if (!window.confirm(`Are you sure you want to delete "${file.name}"?`)) return;
        
        setError(null);
        try {
            await storageService.deleteFile(file);
            setFiles(prev => prev.filter(f => f.id !== file.id));
            setSelectedFile(null); // Close modal if open
        } catch (e) {
            setError('Failed to delete file.');
            console.error(e);
            throw e; // Re-throw to be caught in the modal
        }
    };
    
    const handleUpdateFile = (updatedFile: MediaFile) => {
        setFiles(prevFiles => prevFiles.map(f => f.id === updatedFile.id ? updatedFile : f));
        setSelectedFile(updatedFile); // Keep modal open with updated data
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="relative w-full md:w-1/2">
                    <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search by name, description, or keyword..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-2 pl-10 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm bg-white dark:bg-slate-700"
                    />
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <select value={sortOrder} onChange={e => setSortOrder(e.target.value as any)} className="w-full md:w-auto p-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700">
                        <option value="newest">Sort by Newest</option>
                        <option value="oldest">Sort by Oldest</option>
                    </select>
                    <label className="flex-shrink-0 flex items-center gap-2 py-2 px-4 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer">
                        <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} accept="image/png, image/jpeg, image/gif, image/webp, video/mp4, video/quicktime" />
                        {isUploading ? <LoaderIcon className="w-5 h-5" /> : <UploadCloudIcon className="w-5 h-5" />}
                        {isUploading ? 'Uploading...' : 'Upload'}
                    </label>
                </div>
            </div>
            
            {error && (
                 <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-md text-sm dark:bg-red-900/30 dark:text-red-300">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex-grow flex items-center justify-center">
                    <LoaderIcon className="w-12 h-12 text-indigo-500" />
                </div>
            ) : filteredAndSortedFiles.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400 border-2 border-dashed dark:border-slate-700 rounded-xl">
                    <UploadCloudIcon className="w-16 h-16 mb-4 text-slate-400" />
                    <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                        {files.length > 0 ? 'No files match your search' : 'Your stock gallery is empty'}
                    </h2>
                    <p className="mt-1">
                         {files.length > 0 ? 'Try a different search term.' : 'Click "Upload" to add your first file.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filteredAndSortedFiles.map(file => (
                        <button key={file.id} onClick={() => setSelectedFile(file)} className="relative aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden shadow-md group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900">
                            <img src={file.url} alt={file.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                                <p className="text-xs text-white break-words font-semibold">{file.name}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
            
            {selectedFile && (
                <MediaDetailModal
                    isOpen={!!selectedFile}
                    onClose={() => setSelectedFile(null)}
                    file={selectedFile}
                    onDelete={handleDeleteFile}
                    onUpdate={handleUpdateFile}
                />
            )}
        </div>
    );
};

export default StockGallery;