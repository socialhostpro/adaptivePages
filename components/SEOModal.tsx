
import React, { useState, useEffect } from 'react';
import type { SEOData, MetaTag, LandingPageData, MediaFile } from '../src/types';
import { generateSeoForPage } from '../services/geminiService';
import XIcon from './icons/XIcon';
import TrashIcon from './icons/TrashIcon';
import EnhancedFormField from './EnhancedFormField';
import SparklesIcon from './icons/SparklesIcon';
import LoaderIcon from './icons/LoaderIcon';
import ImageInput from './ImageInput';
import MediaLibraryModal from './MediaLibraryModal';

interface SEOModalProps {
    isOpen: boolean;
    onClose: () => void;
    seoData: SEOData;
    onSave: (newSeoData: SEOData) => void;
    pageData: LandingPageData;
    mediaLibrary: MediaFile[];
    onUploadFile: (file: File) => Promise<void>;
}

const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">{label}</label>
        {children}
    </div>
);

const TextAreaInput = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea
        {...props}
        className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500 transition bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-400"
    />
);

const SEOModal: React.FC<SEOModalProps> = ({ isOpen, onClose, seoData, onSave, pageData, mediaLibrary, onUploadFile }) => {
    const [editableData, setEditableData] = useState<SEOData>(seoData);
    const [isAutoCompleting, setIsAutoCompleting] = useState(false);
    const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
    const [imageChangeCallback, setImageChangeCallback] = useState<(url: string) => void>(() => () => {});


    useEffect(() => {
        setEditableData(seoData);
    }, [seoData, isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleFieldChange = (field: keyof SEOData, value: any) => {
        setEditableData(prev => ({ ...prev, [field]: value }));
    };

    const handleMetaTagChange = (index: number, field: keyof MetaTag, value: string) => {
        const newMetaTags = [...(editableData.metaTags || [])];
        newMetaTags[index] = { ...newMetaTags[index], [field]: value };
        handleFieldChange('metaTags', newMetaTags);
    };

    const addMetaTag = () => {
        const newMetaTags = [...(editableData.metaTags || []), { name: '', content: '' }];
        handleFieldChange('metaTags', newMetaTags);
    };

    const removeMetaTag = (index: number) => {
        const newMetaTags = (editableData.metaTags || []).filter((_, i) => i !== index);
        handleFieldChange('metaTags', newMetaTags);
    };

    const handleSave = () => {
        onSave(editableData);
    };

    const handleAutoComplete = async () => {
        setIsAutoCompleting(true);
        try {
            const newSeo = await generateSeoForPage(pageData);
            setEditableData(prev => ({
                ...prev,
                title: newSeo.title,
                description: newSeo.description,
                keywords: newSeo.keywords,
            }));
        } catch (e) {
            console.error(e);
            alert("Failed to auto-complete SEO data.");
        } finally {
            setIsAutoCompleting(false);
        }
    };
    
    const openMediaLibrary = (callback: (url: string) => void) => {
        setImageChangeCallback(() => callback);
        setIsMediaLibraryOpen(true);
    };
    
    const handleSelectFile = (file: MediaFile) => {
        imageChangeCallback(file.url);
        setIsMediaLibraryOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl h-auto max-h-[90vh] flex flex-col overflow-hidden border dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200">SEO Settings</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>

                <div className="p-6 space-y-4 overflow-y-auto">
                    <button onClick={handleAutoComplete} disabled={isAutoCompleting} className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-indigo-500 rounded-md shadow-sm text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 disabled:opacity-50 transition-colors">
                        {isAutoCompleting ? <LoaderIcon className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                        Auto-complete with AI
                    </button>
                    
                    <div className="space-y-4 pt-4 border-t dark:border-slate-700">
                        <EnhancedFormField
                            label="Website Title (for browser tab)"
                            value={editableData.title}
                            onChange={v => handleFieldChange('title', v)}
                            context="A compelling SEO title for a website (under 60 characters)"
                        />
                        <EnhancedFormField
                            label="Meta Description (for search results)"
                            value={editableData.description}
                            onChange={v => handleFieldChange('description', v)}
                            context="A concise meta description for a website (around 155 characters)"
                            type="textarea"
                            rows={3}
                        />
                         <EnhancedFormField
                            label="Keywords (comma-separated)"
                            value={editableData.keywords}
                            onChange={v => handleFieldChange('keywords', v)}
                            context="A comma-separated list of SEO keywords"
                        />
                    </div>
                    
                    <div className="pt-4 border-t dark:border-slate-600">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-2">Social Sharing Image (Open Graph)</h3>
                        <ImageInput
                           value={editableData.ogImagePrompt || ''}
                           onChange={newValue => handleFieldChange('ogImagePrompt', newValue)}
                           onSelectFromLibrary={() => openMediaLibrary(url => handleFieldChange('ogImagePrompt', url))}
                        />
                    </div>

                    <div className="pt-4 border-t dark:border-slate-600">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-2">Structured Data (JSON-LD)</h3>
                        <FormField label="Schema.org Snippet">
                            <TextAreaInput 
                                rows={6} 
                                value={editableData.schemaSnippet || ''} 
                                onChange={e => handleFieldChange('schemaSnippet', e.target.value)}
                                placeholder='<script type="application/ld+json">...'
                                spellCheck="false"
                                className="font-mono text-xs"
                             />
                        </FormField>
                    </div>
                </div>

                <footer className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex-shrink-0 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="flex items-center justify-center py-2.5 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Save & Close
                    </button>
                </footer>
                <MediaLibraryModal
                    isOpen={isMediaLibraryOpen}
                    onClose={() => setIsMediaLibraryOpen(false)}
                    mediaFiles={mediaLibrary}
                    onSelectFile={handleSelectFile}
                    onUploadFile={onUploadFile}
                />
            </div>
        </div>
    );
};

export default SEOModal;