import React, { useState, useEffect } from 'react';
import type { ManagedPage, LandingPageData, ImageStore } from './src/types';
import * as pageService from './services/pageService';
import * as contactService from './services/contactService';
import XIcon from './components/icons/XIcon';
import LoaderIcon from './components/icons/LoaderIcon';
import CopyIcon from './components/icons/CopyIcon';

interface PublishModalProps {
    isOpen: boolean;
    onClose: () => void;
    page: ManagedPage;
    pageData: LandingPageData | null;
    images: ImageStore;
    onUpdate: () => void;
}

const FormField = ({ label, children, description }: { label: string, children: React.ReactNode, description?: string }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">{label}</label>
        {children}
        {description && <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{description}</p>}
    </div>
);

const TextInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        type="text"
        {...props}
        className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500 transition bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-400"
    />
);

const PublishModal: React.FC<PublishModalProps> = ({ isOpen, onClose, page, pageData, images, onUpdate }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [slug, setSlug] = useState(page.slug || '');
    const [customDomain, setCustomDomain] = useState(page.customDomain || '');
    const [copyStatus, setCopyStatus] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [localIsPublished, setLocalIsPublished] = useState(page.isPublished);

    useEffect(() => {
        setLocalIsPublished(page.isPublished);
    }, [page.isPublished]);

    useEffect(() => {
        if ((page.isPublished || localIsPublished) && pageData && page.publishedData) {
            // Using stringify for a deep-enough comparison for this use case.
            const currentDataString = JSON.stringify(pageData);
            const publishedDataString = JSON.stringify(page.publishedData);
            const currentImagesString = JSON.stringify(images);
            const publishedImagesString = JSON.stringify(page.publishedImages || {});
            
            if (currentDataString !== publishedDataString || currentImagesString !== publishedImagesString) {
                setIsDirty(true);
            } else {
                setIsDirty(false);
            }
        } else {
            setIsDirty(false);
        }
    }, [page.isPublished, localIsPublished, page.publishedData, page.publishedImages, pageData, images]);


    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const publicUrl = `${window.location.origin}/#/${page.slug}`;
    const publishedUrl = page.customDomain ? `https://${page.customDomain}` : `https://${page.slug}.adaptivepages.com`;

    const handlePublish = async () => {
        if (!pageData) {
            alert("Page data is missing. Cannot publish.");
            return;
        }
        setIsProcessing(true);
        try {
            let dataToPublish = { ...pageData };

            // Embed form data for public viewing
            if (dataToPublish.customForm?.formId) {
                const form = await contactService.getFormById(dataToPublish.customForm.formId);
                if (form) {
                    // This is a deep mutation, which is fine here since we just created a shallow copy
                    dataToPublish.customForm.fields = form.fields;
                }
            }

            await pageService.publishPage(page.id, dataToPublish, images);
            setLocalIsPublished(true); // Immediately update local state
            onUpdate();
        } catch(e) {
            console.error(e);
            alert("Failed to publish page.");
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleUnpublish = async () => {
        setIsProcessing(true);
        try {
            await pageService.unpublishPage(page.id);
            setLocalIsPublished(false); // Immediately update local state
            onUpdate();
        } catch(e) {
            console.error(e);
            alert("Failed to unpublish page.");
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
            await pageService.updatePublishSettings(page.id, cleanSlug, customDomain);
            onUpdate();
        } catch (e) {
            console.error(e);
            alert("Failed to save settings. The slug or domain might already be in use.");
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleCopy = () => {
        navigator.clipboard.writeText(publicUrl);
        setCopyStatus(true);
        setTimeout(() => setCopyStatus(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl h-auto max-h-[90vh] flex flex-col overflow-hidden border dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200">Publish Settings</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700" title="Close">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>

                <div className="p-6 space-y-6 overflow-y-auto">
                    <div className={`p-4 rounded-lg ${(page.isPublished || localIsPublished) ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-slate-700/50'}`}>
                        <h3 className="font-semibold text-lg text-gray-800 dark:text-slate-200">
                            Status: {(page.isPublished || localIsPublished) ? <span className="text-green-600 dark:text-green-400">Published</span> : "Draft"}
                        </h3>
                        {(page.isPublished || localIsPublished) && (
                            <div className="mt-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Public URL</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 dark:text-indigo-400 bg-gray-200 dark:bg-slate-600 px-2 py-1 rounded-md truncate hover:underline">{publicUrl}</a>
                                    <button onClick={handleCopy} className="p-2 rounded-md bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500" title="Copy URL">
                                        <CopyIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                {copyStatus && <span className="text-xs text-green-600">Copied!</span>}
                            </div>
                        )}
                        <div className="mt-4 flex items-center gap-2">
                            {(page.isPublished || localIsPublished) ? (
                                <>
                                    <button onClick={handleUnpublish} disabled={isProcessing} className="py-2 px-4 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400">
                                        {isProcessing ? <LoaderIcon className="w-5 h-5"/> : 'Unpublish'}
                                    </button>
                                     {isDirty && (
                                        <button onClick={handlePublish} disabled={isProcessing} className="py-2 px-4 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400">
                                            {isProcessing ? <LoaderIcon className="w-5 h-5"/> : 'Update Live Page'}
                                        </button>
                                    )}
                                </>
                            ) : (
                                <button onClick={handlePublish} disabled={isProcessing} className="py-2 px-4 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                                    {isProcessing ? <LoaderIcon className="w-5 h-5"/> : 'Publish Now'}
                                </button>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSaveSettings} className="space-y-4 pt-4 border-t dark:border-slate-600">
                         <FormField label="URL Slug" description="A short, URL-friendly name. E.g., 'my-awesome-product'">
                            <TextInput value={slug} onChange={e => setSlug(e.target.value)} placeholder="my-awesome-product" required />
                        </FormField>
                        
                         <FormField label="Custom Domain (Optional)" description="E.g., www.my-domain.com">
                            <TextInput value={customDomain} onChange={e => setCustomDomain(e.target.value)} placeholder="www.my-domain.com" />
                        </FormField>
                        {customDomain && (
                            <div className="text-sm p-3 bg-gray-100 dark:bg-slate-700/50 rounded-lg space-y-2">
                                <p className="font-bold text-base text-gray-800 dark:text-slate-200">DNS Setup Required</p>
                                <p className="text-gray-600 dark:text-slate-300">To connect your custom domain, create a <code className="bg-gray-200 dark:bg-slate-600 px-1 rounded-sm text-xs font-mono">CNAME</code> record with your domain provider (e.g., GoDaddy, Namecheap) using the following settings:</p>
                                <div className="text-xs font-mono bg-gray-200 dark:bg-slate-900/50 p-3 rounded-md space-y-1">
                                    <p><span className="font-semibold text-gray-500 dark:text-slate-400">Type:</span> CNAME</p>
                                    <p><span className="font-semibold text-gray-500 dark:text-slate-400">Name:</span> www (or your desired subdomain)</p>
                                    <p><span className="font-semibold text-gray-500 dark:text-slate-400">Target:</span> rxkywcylrtoirshfqqpd.supabase.co</p>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-slate-400">Note: DNS changes can take up to 48 hours to update. Our servers will automatically handle the routing once your DNS is set up.</p>
                            </div>
                        )}
                        <button type="submit" disabled={isProcessing} className="w-full py-2.5 px-4 rounded-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                            {isProcessing ? <LoaderIcon className="w-5 h-5 mx-auto"/> : 'Save URL Settings'}
                        </button>
                    </form>

                    {(page.isPublished || localIsPublished) && (
                        <div className="pt-4 border-t dark:border-slate-600">
                            <h4 className="text-md font-semibold text-gray-800 dark:text-slate-200 mb-2">Published URL</h4>
                            <a href={publishedUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 dark:text-indigo-400 bg-gray-200 dark:bg-slate-600 px-2 py-1 rounded-md truncate hover:underline">{publishedUrl}</a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublishModal;