
import React, { useState, useEffect } from 'react';
import type { LandingPageData, ImageStore, MediaFile, ManagedProduct, CourseChapter, CrmForm, HeroSlide } from '../types';
import HeroSection from './sections/HeroSection';
import FeaturesSection from './sections/FeaturesSection';
import TestimonialsSection from './sections/TestimonialsSection';
import PricingSection from './sections/PricingSection';
import FAQSection from './sections/FAQSection';
import CTASection from './sections/CTASection';
import VideoSection from './sections/VideoSection';
import BookingSection from './sections/BookingSection';
import ContactSection from './sections/ContactSection';
import { regenerateSectionContent } from '../services/geminiService';
import SectionEditForm from './SectionEditForm';
import Navbar from './Navbar';
import XIcon from './icons/XIcon';
import WhyChooseUsSection from './sections/WhyChooseUsSection';
import GallerySection from './sections/GallerySection';
import ProductsSection from './sections/ProductsSection';
import FooterSection from './sections/FooterSection';
import CourseSection from './sections/CourseSection';
import EmbedSection from './sections/EmbedSection';
import LoaderIcon from './icons/LoaderIcon';
import CustomFormSection from './sections/CustomFormSection';


interface EditModalProps {
    sectionKey: string;
    pageData: LandingPageData;
    images: ImageStore;
    basePrompt: string;
    tone: string;
    palette: string;
    onClose: () => void;
    onSave: (sectionKey: string, newSectionData: any) => Promise<void>;
    mediaLibrary: MediaFile[];
    onUploadFile: (file: File) => Promise<void>;
    allProducts: ManagedProduct[];
    customForms: CrmForm[];
    userId: string;
    allSections: string[];
    allPages: {id: string, name: string}[];
}

const EditModal: React.FC<EditModalProps> = ({ sectionKey, pageData, images, basePrompt, tone, palette, onClose, onSave, mediaLibrary, onUploadFile, allProducts, customForms, userId, allSections, allPages }) => {
    const [editableData, setEditableData] = useState<any>(null);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [zoom, setZoom] = useState(50);
    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

    useEffect(() => {
        // Initialize editable data when the modal opens or the section changes
        setEditableData(pageData[sectionKey as keyof LandingPageData]);
    }, [sectionKey, pageData]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const sectionName = sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1);

    const handleRegenerate = async (editPrompt: string) => {
        if (!editPrompt.trim()) {
            setError('Please enter an edit instruction.');
            return;
        }
        setError(null);
        setIsRegenerating(true);
        try {
            const newSectionData = await regenerateSectionContent(basePrompt, tone, palette, sectionKey, editableData, editPrompt, mediaLibrary);
            setEditableData(newSectionData);
        } catch (e) {
            setError((e as Error).message || 'An unknown error occurred during regeneration.');
        } finally {
            setIsRegenerating(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        try {
            await onSave(sectionKey, editableData);
            onClose();
        } catch (e) {
            console.error("Failed to save from modal:", e);
            setError((e as Error).message || 'Failed to save changes.');
        } finally {
            setIsSaving(false);
        }
    };
    
    const previewContent = () => {
        if (!editableData) return null;
        const theme = pageData.theme;
        
        const getPreviewImage = (originalKey: string, newPromptOrUrl?: string) => {
            if (newPromptOrUrl?.startsWith('http') || newPromptOrUrl?.startsWith('data:image')) {
                return newPromptOrUrl;
            }
            return images[originalKey];
        };

        switch(sectionKey) {
            case 'nav': {
                const logoImage = getPreviewImage('logo', editableData.logoImagePrompt);
                return <Navbar nav={editableData} theme={theme} image={logoImage} isRegenerating={false} cartItemCount={0} onCartClick={() => {}} onSignInClick={() => {}} onBookingClick={() => {}} />;
            }
            case 'hero': {
                const dynamicImages: ImageStore = { ...images };
                if (editableData.layout === 'split') {
                    dynamicImages['hero_split'] = getPreviewImage('hero_split', editableData.splitImagePrompt);
                }
                if (editableData.backgroundType === 'image') {
                    dynamicImages['hero'] = getPreviewImage('hero', editableData.imagePrompt);
                }
                if (editableData.backgroundType === 'slider') {
                    (editableData.slides || []).forEach((slide: HeroSlide, i: number) => {
                        dynamicImages[`hero_slider_${i}`] = getPreviewImage(`hero_slider_${i}`, slide.imagePrompt);
                    });
                }
                return <HeroSection section={editableData} theme={theme} images={dynamicImages} onRegenerate={() => {}} regeneratingImages={[]} allForms={customForms} />;
            }
            case 'features': return <FeaturesSection section={editableData} theme={theme} />;
            case 'whyChooseUs': return <WhyChooseUsSection section={editableData} theme={theme} />;
            case 'gallery': {
                const dynamicImages = { ...images };
                (editableData.items || []).forEach((item: any, index: number) => {
                    const key = `gallery_${index}`;
                    dynamicImages[key] = getPreviewImage(key, item.imagePrompt);
                });
                return <GallerySection section={editableData} theme={theme} images={dynamicImages} onRegenerateImage={() => {}} regeneratingImages={[]} />;
            }
            case 'products': {
                return <ProductsSection section={editableData} allProducts={allProducts} theme={theme} images={images} onAddToCart={() => {}} regeneratingImages={[]} onRegenerateImage={() => {}} />;
            }
            case 'course': {
                 const dynamicImages = { ...images };
                 if (editableData.mediaType === 'image' || !editableData.mediaType) {
                    dynamicImages['course_banner'] = getPreviewImage('course_banner', editableData.imagePrompt);
                 }
                 (editableData.chapters || []).forEach((chapter: CourseChapter) => {
                    if (chapter.imagePrompt) {
                        const key = `chapter_${chapter.id}`;
                        dynamicImages[key] = getPreviewImage(key, chapter.imagePrompt);
                    }
                 });
                return <CourseSection section={editableData} theme={theme} images={dynamicImages} onRegenerateImage={() => {}} regeneratingImages={[]} hasAccess={true} onEnroll={() => {}} progress={{}} onStartLesson={() => {}} onTakeQuiz={() => alert("Quizzes can be taken in the main editor view.")} />;
            }
            case 'video': return <VideoSection section={editableData} theme={theme} />;
            case 'testimonials': {
                const dynamicImages = { ...images };
                (editableData.items || []).forEach((item: any, index: number) => {
                    const key = `testimonial_${index}`;
                    dynamicImages[key] = getPreviewImage(key, item.avatarImagePrompt);
                });
                return <TestimonialsSection section={editableData} theme={theme} images={dynamicImages} onRegenerateImage={() => {}} regeneratingImages={[]} />;
            }
            case 'pricing': return <PricingSection section={editableData} theme={theme} />;
            case 'faq': return <FAQSection section={editableData} theme={theme} />;
            case 'contact': return <ContactSection section={editableData} theme={theme} />;
            case 'customForm': return <CustomFormSection section={editableData} theme={theme} pageId="preview" allForms={customForms} />;
            case 'embed': return <EmbedSection section={editableData} theme={theme} pageId="preview" />;
            case 'booking': return <BookingSection section={editableData} theme={theme} onOpenModal={() => {}} />;
            case 'cta': return <CTASection section={editableData} theme={theme} />;
            case 'footer': return <FooterSection section={editableData} theme={theme} />;
            default: return <div>Preview not available for this section.</div>;
        }
    };
    
    const TabButton = ({ tab, label }: { tab: 'edit' | 'preview', label: string }) => (
        <button
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap pb-3 px-4 border-b-2 font-semibold text-sm transition-colors ${
                activeTab === tab
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
        >
            {label}
        </button>
    );

    if (!editableData) {
        return null; // or a loading state
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden border dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200">Editing: {sectionName} Section</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <div className="flex-grow flex flex-col min-h-0">
                    <div className="px-6 border-b dark:border-slate-700 flex-shrink-0">
                        <nav className="-mb-px flex space-x-6">
                            <TabButton tab="edit" label="Edit" />
                            <TabButton tab="preview" label="Preview" />
                        </nav>
                    </div>

                    <div className="flex-grow min-h-0 relative">
                        <div className={`p-6 overflow-y-auto h-full ${activeTab === 'edit' ? '' : 'hidden'}`}>
                             <SectionEditForm
                                sectionKey={sectionKey}
                                data={editableData}
                                setData={setEditableData}
                                onRegenerate={handleRegenerate}
                                isRegenerating={isRegenerating}
                                error={error}
                                setError={setError}
                                mediaLibrary={mediaLibrary}
                                onUploadFile={onUploadFile}
                                allProducts={allProducts}
                                customForms={customForms}
                                userId={userId}
                                allSections={allSections}
                                allPages={allPages}
                                images={images}
                            />
                        </div>
                        <div className={`p-6 bg-gray-50 dark:bg-slate-900/50 flex flex-col h-full ${activeTab === 'preview' ? '' : 'hidden'}`}>
                            <div className="flex justify-end items-center mb-4 flex-shrink-0">
                                <input 
                                    type="range" 
                                    min="25" 
                                    max="100" 
                                    value={zoom} 
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-24 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-600"
                                />
                                <span className="text-xs font-mono text-gray-500 dark:text-slate-400 w-10 text-right">{zoom}%</span>
                            </div>

                            <div className="w-full flex-grow overflow-auto rounded-lg bg-white dark:bg-gray-900 ring-1 ring-inset ring-gray-200 dark:ring-slate-700/50">
                                <div style={{ zoom: zoom / 100 }}>
                                    <div style={{ width: '1280px' }}>
                                        {previewContent()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center justify-center py-2.5 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                    >
                         {isSaving ? <LoaderIcon className="w-5 h-5" /> : 'Save & Close'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default EditModal;