

import React, { useState } from 'react';
import SparklesIcon from './icons/SparklesIcon';
import LoaderIcon from './icons/LoaderIcon';
import TrashIcon from './icons/TrashIcon';
import DragHandleIcon from './icons/DragHandleIcon';
import IconPicker from '../IconPicker';
import DynamicIcon from './icons/DynamicIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import ImageInput from './ImageInput';
import MediaLibraryModal from './MediaLibraryModal';
import type { MediaFile, ManagedProduct, CourseChapter, CourseLesson, CrmForm, HeroSlide } from '../types';
import EnhancedFormField from './EnhancedFormField';
import CourseForm from './CourseForm';
import FormField, { TextInput, NumberInput, TextAreaInput, SelectInput } from './shared/FormField';
import DraggableList from './shared/DraggableList';
import ImageGalleryInput from './ImageGalleryInput';
import ColorSwatchPicker from './ColorSwatchPicker';
import type { ImageStore } from '../types';


interface SectionEditFormProps {
    sectionKey: string;
    data: any;
    setData: (newData: any) => void;
    onRegenerate: (prompt: string) => Promise<void>;
    isRegenerating: boolean;
    error: string | null;
    setError: (error: string | null) => void;
    mediaLibrary: MediaFile[];
    onUploadFile: (file: File) => Promise<void>;
    allProducts: ManagedProduct[];
    customForms: CrmForm[];
    userId: string;
    allSections: string[];
    allPages: {id: string, name: string}[];
    images: ImageStore;
}

const SectionEditForm: React.FC<SectionEditFormProps> = ({ sectionKey, data, setData, onRegenerate, isRegenerating, error, setError, mediaLibrary, onUploadFile, allProducts, customForms, userId, allSections, allPages, images }) => {
    const [prompt, setPrompt] = useState('');
    const [activeIconPicker, setActiveIconPicker] = useState<number | null>(null);
    const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
    const [imageChangeCallback, setImageChangeCallback] = useState<(url: string) => void>(() => () => {});

    const handleFieldChange = (field: string, value: any) => setData({ ...data, [field]: value });
    const handleItemsChange = (newItems: any[]) => setData({ ...data, items: newItems });
    const handleItemChange = (itemIndex: number, field: string, value: any) => {
        const newItems = [...data.items];
        newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
        handleItemsChange(newItems);
    };
    const addItem = (newItem: any) => handleItemsChange([...(data.items || []), newItem]);
    const removeItem = (itemIndex: number) => handleItemsChange(data.items.filter((_:any, i:number) => i !== itemIndex));

    const handleRegenerateClick = () => onRegenerate(prompt);

    const openMediaLibrary = (callback: (url: string) => void) => {
        setImageChangeCallback(() => callback);
        setIsMediaLibraryOpen(true);
    };

    const handleSelectFile = (file: MediaFile) => {
        imageChangeCallback(file.url);
        setIsMediaLibraryOpen(false);
    };

    const renderForm = () => {
        switch (sectionKey) {
            case 'nav': return <NavForm data={data} setData={setData} openMediaLibrary={openMediaLibrary}/>;
            case 'hero': return <HeroForm data={data} handleFieldChange={handleFieldChange} openMediaLibrary={openMediaLibrary} />;
            case 'features':
            case 'whyChooseUs':
                 return <ItemsForm
                    data={data}
                    handleFieldChange={(f:string, v:any) => handleFieldChange(f,v)}
                    items={data.items}
                    onItemsChange={handleItemsChange}
                    sectionKey={sectionKey}
                    renderItem={(item: any, index: number) => (
                        <>
                            <div className="flex gap-4">
                                <div className="w-1/4">
                                    <FormField label="Icon">
                                        <div className="relative">
                                            <button 
                                                type="button"
                                                onClick={() => setActiveIconPicker(index)}
                                                className="w-full flex items-center justify-center p-2 h-16 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700"
                                            >
                                                <DynamicIcon iconName={item.iconName} className="w-8 h-8 text-indigo-500" />
                                            </button>
                                            {activeIconPicker === index && (
                                                <IconPicker
                                                    onSelect={(iconName) => {
                                                        handleItemChange(index, 'iconName', iconName);
                                                        setActiveIconPicker(null);
                                                    }}
                                                    onClose={() => setActiveIconPicker(null)}
                                                />
                                            )}
                                        </div>
                                    </FormField>
                                </div>
                                <div className="w-3/4 space-y-2">
                                     <EnhancedFormField label="Title" value={item.title || item.name} onChange={(v) => handleItemChange(index, item.title ? 'title' : 'name', v)} context="A feature or benefit title"/>
                                </div>
                            </div>
                            <EnhancedFormField label="Description" value={item.description} onChange={(v) => handleItemChange(index, 'description', v)} type="textarea" rows={3} context="A feature or benefit description"/>
                        </>
                    )}
                    onAddItem={() => addItem({ iconName: 'Sparkles', title: 'New Feature', description: 'A description.' })}
                    addText="Add Item"
                 />;
            case 'gallery':
                 return <ItemsForm
                    data={data}
                    handleFieldChange={handleFieldChange}
                    items={data.items}
                    sectionKey={sectionKey}
                    onItemsChange={handleItemsChange}
                    renderItem={(item: any, index: number) => (
                        <>
                             <FormField label="Image">
                                <ImageInput 
                                    value={item.imagePrompt}
                                    onChange={(newValue) => handleItemChange(index, 'imagePrompt', newValue)}
                                    onSelectFromLibrary={() => openMediaLibrary(url => handleItemChange(index, 'imagePrompt', url))}
                                />
                             </FormField>
                             <EnhancedFormField label="Alt Text" value={item.altText} onChange={(v) => handleItemChange(index, 'altText', v)} context="An image alt text for SEO and accessibility" />
                        </>
                    )}
                    onAddItem={() => addItem({ imagePrompt: 'A new beautiful image', altText: 'new image' })}
                    addText="Add Image"
                 />;
            case 'products':
                 return <ProductSelectorForm 
                            data={data}
                            setData={setData}
                            allProducts={allProducts}
                        />;
            case 'course': return <CourseForm data={data} setData={setData} openMediaLibrary={openMediaLibrary} />;
            case 'video': return <VideoForm data={data} sectionKey={sectionKey} handleFieldChange={handleFieldChange} />;
            case 'testimonials':
                return <ItemsForm
                    data={data}
                    handleFieldChange={handleFieldChange}
                    items={data.items}
                    sectionKey={sectionKey}
                    onItemsChange={handleItemsChange}
                    renderItem={(item: any, index: number) => (
                        <>
                            <EnhancedFormField label="Quote" value={item.quote} onChange={(v) => handleItemChange(index, 'quote', v)} type="textarea" rows={3} context="A customer testimonial" />
                            <EnhancedFormField label="Author" value={item.author} onChange={(v) => handleItemChange(index, 'author', v)} context="A testimonial author's name" />
                            <EnhancedFormField label="Role" value={item.role} onChange={(v) => handleItemChange(index, 'role', v)} context="A testimonial author's role or title" />
                            <FormField label="Avatar Image">
                                <ImageInput 
                                    value={item.avatarImagePrompt}
                                    onChange={(newValue) => handleItemChange(index, 'avatarImagePrompt', newValue)}
                                    onSelectFromLibrary={() => openMediaLibrary(url => handleItemChange(index, 'avatarImagePrompt', url))}
                                />
                             </FormField>
                        </>
                    )}
                    onAddItem={() => addItem({ quote: 'New quote.', author: 'Anonymous', role: 'User', avatarImagePrompt: 'A new friendly face.' })}
                    addText="Add Testimonial"
                 />;
            case 'pricing':
                return <PricingForm data={data} setData={setData} sectionKey={sectionKey} />;
            case 'faq':
                return <ItemsForm
                    data={data}
                    handleFieldChange={handleFieldChange}
                    items={data.items}
                    sectionKey={sectionKey}
                    onItemsChange={handleItemsChange}
                    renderItem={(item: any, index: number) => (
                         <>
                            <EnhancedFormField label="Question" value={item.question} onChange={(v) => handleItemChange(index, 'question', v)} context="A frequently asked question" />
                            <EnhancedFormField label="Answer" value={item.answer} onChange={(v) => handleItemChange(index, 'answer', v)} type="textarea" rows={3} context="An answer to a question" />
                        </>
                    )}
                    onAddItem={() => addItem({ question: 'New Question?', answer: 'New Answer.' })}
                    addText="Add FAQ"
                 />;
            case 'contact': return <SimpleForm data={data} handleFieldChange={handleFieldChange} fields={['title', 'subtitle']} sectionKey={sectionKey} />;
            case 'customForm': return <CustomFormSelectorForm data={data} handleFieldChange={handleFieldChange} customForms={customForms} />;
            case 'booking': return <BookingForm data={data} handleFieldChange={handleFieldChange} />;
            case 'cta': return <CTAForm data={data} handleFieldChange={handleFieldChange} sectionKey={sectionKey}/>;
            case 'footer':
                return <ItemsForm
                    data={data}
                    handleFieldChange={handleFieldChange}
                    items={data.socialLinks || []}
                    onItemsChange={(newLinks) => setData({ ...data, socialLinks: newLinks })}
                    sectionKey={sectionKey}
                    renderItem={(item: any, index: number) => {
                        const handleLinkChange = (field: string, value: any) => {
                            const newItems = [...data.socialLinks];
                            newItems[index] = { ...newItems[index], [field]: value };
                            setData({ ...data, socialLinks: newItems });
                        };
                        return (
                            <div className="flex items-center gap-2">
                                <SelectInput value={item.network} onChange={(e) => handleLinkChange('network', e.target.value)}>
                                    <option value="twitter">Twitter</option>
                                    <option value="linkedin">LinkedIn</option>
                                    <option value="github">GitHub</option>
                                    <option value="facebook">Facebook</option>
                                    <option value="instagram">Instagram</option>
                                </SelectInput>
                                <TextInput placeholder="URL" value={item.url} onChange={(e) => handleLinkChange('url', e.target.value)} />
                            </div>
                        )
                    }}
                    onAddItem={() => setData({ ...data, socialLinks: [...(data.socialLinks || []), { network: 'twitter', url: 'https://twitter.com' }]})}
                    addText="Add Social Link"
                    itemContainerClassName="space-y-1"
                    titleField="copyrightText"
                    subtitleField=""
                 />;
            default: return null;
        }
    };

    return (
        <div className="space-y-4">
            {renderForm()}
            <div className="pt-4 border-t dark:border-slate-600 space-y-2">
                <label htmlFor="edit-prompt" className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
                    Or, tell the AI what to change
                </label>
                <TextAreaInput id="edit-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4}
                    placeholder={`e.g., "Make the title more exciting" or "Add a feature about analytics"`}
                    disabled={isRegenerating}
                />
                 {error && <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm dark:bg-red-900/30 dark:text-red-300"><strong>Error:</strong> {error}</div>}
                <button onClick={handleRegenerateClick} disabled={isRegenerating || !prompt} className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all">
                    {isRegenerating ? <><LoaderIcon className="mr-3 h-5 w-5" /> Updating...</> : <><SparklesIcon className="mr-3 h-5 w-5" /> Update with AI</>}
                </button>
            </div>
            <MediaLibraryModal
                isOpen={isMediaLibraryOpen}
                onClose={() => setIsMediaLibraryOpen(false)}
                mediaFiles={mediaLibrary}
                onSelectFile={handleSelectFile}
                onUploadFile={onUploadFile}
            />
        </div>
    );
};

// Generic form for simple title/subtitle sections
const SimpleForm = ({ data, handleFieldChange, fields, sectionKey }: { data: any, handleFieldChange: (f: string, v: any) => void, fields: string[], sectionKey: string }) => (
    <>
        {fields.includes('title') && <EnhancedFormField label="Title" value={data.title} onChange={(v) => handleFieldChange('title', v)} context={`${sectionKey} section title`} />}
        {fields.includes('subtitle') && <EnhancedFormField label="Subtitle" value={data.subtitle} onChange={(v) => handleFieldChange('subtitle', v)} type="textarea" rows={2} context={`${sectionKey} section subtitle`} />}
    </>
);

const HeroForm = ({ data, handleFieldChange, openMediaLibrary }: { data: any, handleFieldChange: (f: string, v: any) => void, openMediaLibrary: (cb: (url: string) => void) => void }) => {
    const layout = data.layout || 'background';
    const backgroundType = data.backgroundType || 'image';

    const buttonColors = ['indigo', 'blue', 'green', 'purple', 'pink', 'red', 'orange', 'yellow'];
    const bgLightColors = ['white', 'slate-50', 'slate-100', 'gray-50', 'gray-100'];
    const bgDarkColors = ['slate-800', 'slate-900', 'gray-800', 'gray-900'];

    return (
        <div className="space-y-4">
            <FormField label="Layout">
                <SelectInput value={layout} onChange={e => handleFieldChange('layout', e.target.value)}>
                    <option value="background">Background Media</option>
                    <option value="split">Split (Text/Image)</option>
                    <option value="form_overlay">Form Overlay</option>
                </SelectInput>
            </FormField>

            <EnhancedFormField label="Title" value={data.title} onChange={(v) => handleFieldChange('title', v)} context="a hero section title" />
            <EnhancedFormField label="Subtitle" value={data.subtitle} onChange={(v) => handleFieldChange('subtitle', v)} context="a hero section subtitle" type="textarea" rows={3}/>

            <div className="pt-4 border-t dark:border-slate-600 space-y-4">
                <h3 className="text-md font-semibold">Call to Action Button</h3>
                <EnhancedFormField label="Button Text" value={data.ctaText || ''} onChange={(v) => handleFieldChange('ctaText', v)} context="a call to action button" />
                <FormField label="Button Link (URL)"><TextInput value={data.ctaLink || ''} onChange={(e) => handleFieldChange('ctaLink', e.target.value)} placeholder="#" /></FormField>
            </div>

            <div className="pt-4 border-t dark:border-slate-600 space-y-4">
                <h3 className="text-md font-semibold">Background / Media</h3>
                {layout === 'split' ? (
                     <ImageInput value={data.splitImagePrompt || ''} onChange={(newValue) => handleFieldChange('splitImagePrompt', newValue)} onSelectFromLibrary={() => openMediaLibrary(url => handleFieldChange('splitImagePrompt', url))} />
                ) : (
                    <>
                        <FormField label="Background Type">
                            <SelectInput value={backgroundType} onChange={e => handleFieldChange('backgroundType', e.target.value)}>
                                <option value="image">Single Image</option>
                                <option value="slider">Image Slider</option>
                                <option value="video">Video</option>
                            </SelectInput>
                        </FormField>
                        {backgroundType === 'image' && <ImageInput value={data.imagePrompt || ''} onChange={(newValue) => handleFieldChange('imagePrompt', newValue)} onSelectFromLibrary={() => openMediaLibrary(url => handleFieldChange('imagePrompt', url))} />}
                        {backgroundType === 'slider' && <ImageGalleryInput prompts={data.imagePrompts || []} onChange={(newValue) => handleFieldChange('imagePrompts', newValue)} />}
                        {backgroundType === 'video' && <FormField label="YouTube Video ID"><TextInput value={data.youtubeVideoId || ''} onChange={(e) => handleFieldChange('youtubeVideoId', e.target.value)} /></FormField>}
                    </>
                )}
            </div>
            
            <div className="pt-4 border-t dark:border-slate-600 space-y-4">
                 <h3 className="text-md font-semibold">Custom Colors (Optional)</h3>
                 <FormField label="Button Color">
                    <ColorSwatchPicker colors={buttonColors} value={data.buttonColor || ''} onChange={v => handleFieldChange('buttonColor', v)} />
                 </FormField>
                 <FormField label="Background Color (Light Mode)">
                    <ColorSwatchPicker colors={bgLightColors} value={data.backgroundColorLight || ''} onChange={v => handleFieldChange('backgroundColorLight', v)} />
                 </FormField>
                  <FormField label="Background Color (Dark Mode)">
                    <ColorSwatchPicker colors={bgDarkColors} value={data.backgroundColorDark || ''} onChange={v => handleFieldChange('backgroundColorDark', v)} />
                 </FormField>
            </div>
        </div>
    );
};

const CTAForm = ({ data, handleFieldChange, sectionKey }: { data: any, handleFieldChange: (f: string, v: any) => void, sectionKey: string }) => (
    <>
        <SimpleForm data={data} handleFieldChange={handleFieldChange} fields={['title', 'subtitle']} sectionKey={sectionKey} />
        <EnhancedFormField label="CTA Button Text" value={data.ctaText} onChange={(v) => handleFieldChange('ctaText', v)} context="a call to action button" />
        <FormField label="CTA Link (URL)"><TextInput value={data.ctaLink} onChange={(e) => handleFieldChange('ctaLink', e.target.value)} placeholder="#" /></FormField>
    </>
);

const VideoForm = ({ data, handleFieldChange, sectionKey }: { data: any, handleFieldChange: (f: string, v: any) => void, sectionKey: string }) => (
    <>
        <SimpleForm data={data} handleFieldChange={handleFieldChange} fields={['title', 'subtitle']} sectionKey={sectionKey} />
        <FormField label="YouTube Video ID"><TextInput value={data.videoId} onChange={(e) => handleFieldChange('videoId', e.target.value)} /></FormField>
    </>
);

const BookingForm = ({ data, handleFieldChange }: { data: any, handleFieldChange: (f: string, v: any) => void }) => (
    <>
        <EnhancedFormField label="Title" value={data.title} onChange={(v) => handleFieldChange('title', v)} context="a booking section title" />
        <EnhancedFormField label="Subtitle" value={data.subtitle} onChange={(v) => handleFieldChange('subtitle', v)} type="textarea" rows={2} context="a booking section subtitle" />
        <EnhancedFormField label="Button Text" value={data.ctaText} onChange={(v) => handleFieldChange('ctaText', v)} context="a booking button text" placeholder="e.g., Book a Demo" />
        <FormField label="Booking Embed Code (HTML)">
            <TextAreaInput rows={8} value={data.bookingEmbedCode} onChange={(e) => handleFieldChange('bookingEmbedCode', e.target.value)} placeholder="Paste your HTML code snippet from Calendly, etc." spellCheck="false" className="font-mono text-xs" />
        </FormField>
    </>
);


const ItemsForm = ({ data, handleFieldChange, items, onItemsChange, renderItem, onAddItem, addText, sectionKey, titleField='title', subtitleField='subtitle' }: any) => {
    const removeItem = (itemIndex: number) => {
        onItemsChange(items.filter((_:any, i:number) => i !== itemIndex));
    };

    return (
        <>
            {data[titleField] !== undefined && <EnhancedFormField label={titleField === 'copyrightText' ? "Copyright Text" : "Title"} value={data[titleField]} onChange={(v) => handleFieldChange(titleField, v)} context={`${sectionKey} section ${titleField}`} />}
            {data[subtitleField] !== undefined && subtitleField && <EnhancedFormField label="Subtitle" value={data[subtitleField]} onChange={(v) => handleFieldChange(subtitleField, v)} type="textarea" rows={2} context={`${sectionKey} section subtitle`} />}

            <DraggableList 
                items={items}
                onUpdate={onItemsChange}
                renderItem={(item, index) => (
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <DragHandleIcon className="w-5 h-5 text-gray-400 dark:text-slate-500 cursor-grab active:cursor-grabbing" />
                            <button onClick={() => removeItem(index)} className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                        {renderItem(item, index)}
                    </div>
                )}
            />
            <button onClick={onAddItem} className="mt-2 text-sm w-full text-center py-2 border-dashed border-2 dark:border-slate-600 rounded-md text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">+ {addText}</button>
        </>
    );
};


const PricingForm = ({ data, setData, sectionKey }: { data: any, setData: (d: any) => void, sectionKey: string }) => {
    const handleFieldChange = (field: string, value: any) => setData({ ...data, [field]: value });
    const handlePlanChange = (pIndex: number, field: string, value: any) => {
        const newPlans = [...data.plans];
        newPlans[pIndex] = { ...newPlans[pIndex], [field]: value };
        setData({ ...data, plans: newPlans });
    };
    const handleFeatureChange = (pIndex: number, fIndex: number, value: string) => {
        const newPlans = [...data.plans];
        newPlans[pIndex].features[fIndex] = value;
        setData({ ...data, plans: newPlans });
    };
    const addPlan = () => setData({ ...data, plans: [...(data.plans || []), { name: 'New', price: '$0', features: [], isFeatured: false, ctaText: 'Go', ctaLink: '#' }]});
    const removePlan = (pIndex: number) => setData({ ...data, plans: data.plans.filter((_:any, i:number) => i !== pIndex) });
    const addFeature = (pIndex: number) => {
        const newPlans = [...data.plans];
        newPlans[pIndex].features.push('New Feature');
        setData({ ...data, plans: newPlans });
    };
    const removeFeature = (pIndex: number, fIndex: number) => {
        const newPlans = [...data.plans];
        newPlans[pIndex].features = newPlans[pIndex].features.filter((_:any, i:number) => i !== fIndex);
        setData({ ...data, plans: newPlans });
    };

    return (
        <>
            <SimpleForm data={data} handleFieldChange={handleFieldChange} fields={['title', 'subtitle']} sectionKey={sectionKey} />
            {(data.plans || []).map((plan: any, pIndex: number) => (
                <div key={pIndex} className="p-3 my-2 border dark:border-slate-600 rounded-lg space-y-2">
                    <div className="flex justify-between items-center"><h4 className="font-semibold dark:text-slate-200">Plan {pIndex+1}</h4><button onClick={() => removePlan(pIndex)} className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100/50"><TrashIcon className="w-4 h-4" /></button></div>
                    <EnhancedFormField label="Name" value={plan.name} onChange={v => handlePlanChange(pIndex, 'name', v)} context="a pricing plan name" />
                    <FormField label="Price"><TextInput value={plan.price} onChange={e => handlePlanChange(pIndex, 'price', e.target.value)} /></FormField>
                    <EnhancedFormField label="CTA Text" value={plan.ctaText} onChange={v => handlePlanChange(pIndex, 'ctaText', v)} context="a call to action button for a pricing plan" />
                    <FormField label="CTA Link"><TextInput value={plan.ctaLink} onChange={e => handlePlanChange(pIndex, 'ctaLink', e.target.value)} /></FormField>
                    <label className="flex items-center space-x-2"><input type="checkbox" checked={plan.isFeatured} onChange={e => handlePlanChange(pIndex, 'isFeatured', e.target.checked)} className="h-4 w-4" /> <span className="text-sm dark:text-slate-300">Is Featured?</span></label>
                    <div className="space-y-1"><h5 className="text-sm font-semibold dark:text-slate-300">Features</h5>
                        {plan.features.map((feat: string, fIndex: number) => (
                            <div key={fIndex} className="flex items-center gap-2">
                                <div className="flex-grow">
                                     <EnhancedFormField value={feat} onChange={v => handleFeatureChange(pIndex, fIndex, v)} context="a feature in a pricing plan" />
                                </div>
                                <button onClick={() => removeFeature(pIndex, fIndex)} className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100/50 flex-shrink-0"><TrashIcon className="w-4 h-4" /></button></div>
                        ))}
                        <button onClick={() => addFeature(pIndex)} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">+ Add Feature</button>
                    </div>
                </div>
            ))}
            <button onClick={addPlan} className="text-sm w-full text-center py-2 border-dashed border-2 dark:border-slate-600 rounded-md text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">+ Add Plan</button>
        </>
    );
};


const NavForm = ({ data, setData, openMediaLibrary }: { data: any, setData: (d: any) => void, openMediaLibrary: (cb: (url: string) => void) => void }) => {
    const [activeIconPicker, setActiveIconPicker] = useState<number | null>(null);
    
    const handleFieldChange = (field: string, value: any) => setData({ ...data, [field]: value });
    
    const handleMenuItemChange = (index: number, field: string, value: string) => {
        const newItems = [...data.menuItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setData({ ...data, menuItems: newItems });
    };

    const addMenuItem = () => {
        setData({ ...data, menuItems: [...(data.menuItems || []), { text: 'New Item', link: '#', iconName: 'Circle' }]});
    };

    const removeMenuItem = (index: number) => {
        setData({ ...data, menuItems: data.menuItems.filter((_:any, i:number) => i !== index) });
    };

    const handleMenuItemsUpdate = (newItems: any[]) => {
        setData({ ...data, menuItems: newItems });
    };
    
    return (
        <div className="space-y-4">
            <FormField label="Logo Type">
                <SelectInput value={data.logoType} onChange={e => handleFieldChange('logoType', e.target.value)}>
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                </SelectInput>
            </FormField>

            {data.logoType === 'text' ? (
                <EnhancedFormField label="Logo Text" value={data.logoText} onChange={(v) => handleFieldChange('logoText', v)} context="a brand name for a text logo" />
            ) : (
                <ImageInput 
                    value={data.logoImagePrompt}
                    onChange={(newValue) => handleFieldChange('logoImagePrompt', newValue)}
                    onSelectFromLibrary={() => openMediaLibrary(url => handleFieldChange('logoImagePrompt', url))}
                />
            )}

            <FormField label="Logo Width (px)">
                <NumberInput value={data.logoWidth} onChange={e => handleFieldChange('logoWidth', parseInt(e.target.value, 10))} />
            </FormField>
            
            <div className="grid grid-cols-2 gap-4">
                <FormField label="Nav Bar Style">
                    <SelectInput value={data.navStyle} onChange={e => handleFieldChange('navStyle', e.target.value)}>
                        <option value="sticky">Sticky</option>
                        <option value="static">Static</option>
                    </SelectInput>
                </FormField>
                 <FormField label="Desktop Layout">
                    <SelectInput value={data.layout} onChange={e => handleFieldChange('layout', e.target.value)}>
                        <option value="standard">Standard</option>
                        <option value="centered">Centered</option>
                        <option value="split">Split</option>
                    </SelectInput>
                </FormField>
            </div>
            
            <FormField label="Mobile Layout">
                <SelectInput value={data.mobileLayout} onChange={e => handleFieldChange('mobileLayout', e.target.value)}>
                    <option value="hamburger">Hamburger Menu</option>
                    <option value="bottom">Bottom Bar</option>
                </SelectInput>
            </FormField>
            
            <div className="pt-4 border-t dark:border-slate-600">
                <h4 className="text-md font-semibold text-gray-800 dark:text-slate-200 mb-2">Menu Items</h4>
                <DraggableList
                    items={data.menuItems || []}
                    onUpdate={handleMenuItemsUpdate}
                    renderItem={(item, index) => (
                        <div className="flex items-center gap-2">
                             <DragHandleIcon className="w-5 h-5 text-gray-400 dark:text-slate-500 cursor-grab active:cursor-grabbing flex-shrink-0" />
                             <div className="relative">
                                <button type="button" onClick={() => setActiveIconPicker(index)} className="p-2 border dark:border-slate-500 rounded-md hover:bg-gray-100 dark:hover:bg-slate-600">
                                    <DynamicIcon iconName={item.iconName || 'HelpCircle'} className="w-5 h-5" />
                                </button>
                                {activeIconPicker === index && (
                                    <IconPicker
                                        onSelect={(iconName) => {
                                            handleMenuItemChange(index, 'iconName', iconName);
                                            setActiveIconPicker(null);
                                        }}
                                        onClose={() => setActiveIconPicker(null)}
                                    />
                                )}
                             </div>
                            <div className="flex-grow"><EnhancedFormField value={item.text} onChange={v => handleMenuItemChange(index, 'text', v)} context="a navigation menu item" /></div>
                            <TextInput placeholder="Link" value={item.link} onChange={e => handleMenuItemChange(index, 'link', e.target.value)} />
                            <button onClick={() => removeMenuItem(index)} className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100/50 flex-shrink-0"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                    )}
                />
                <button onClick={addMenuItem} className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">+ Add Menu Item</button>
            </div>

            <div className="pt-4 border-t dark:border-slate-600 space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={!!data.signInButtonEnabled} onChange={e => handleFieldChange('signInButtonEnabled', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-sm dark:text-slate-300">Show 'Sign In' button</span>
                </label>
                {data.signInButtonEnabled && (
                    <div className="mt-2">
                        <EnhancedFormField label="Button Text" value={data.signInButtonText} onChange={(v) => handleFieldChange('signInButtonText', v)} context="a sign in button" />
                    </div>
                )}
                 <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={!!data.cartButtonEnabled} onChange={e => handleFieldChange('cartButtonEnabled', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-sm dark:text-slate-300">Show shopping cart icon</span>
                </label>
            </div>
        </div>
    );
};

const ProductSelectorForm = ({ data, setData, allProducts }: { data: any, setData: (d:any) => void, allProducts: ManagedProduct[] }) => {
    
    const handleToggleProduct = (productId: string) => {
        const currentIds = data.itemIds || [];
        const newIds = currentIds.includes(productId)
            ? currentIds.filter((id: string) => id !== productId)
            : [...currentIds, productId];
        setData({ ...data, itemIds: newIds });
    };

    return (
        <div className="space-y-4">
            <EnhancedFormField label="Title" value={data.title} onChange={v => setData({ ...data, title: v })} context="a products section title" />
            <EnhancedFormField label="Subtitle" value={data.subtitle} onChange={v => setData({ ...data, subtitle: v })} type="textarea" rows={2} context="a products section subtitle" />
            
            <div className="pt-4 border-t dark:border-slate-600">
                <h3 className="text-md font-semibold text-gray-800 dark:text-slate-200">Select Products to Display</h3>
                <div className="mt-2 p-3 border dark:border-slate-600 rounded-lg max-h-60 overflow-y-auto space-y-2 bg-slate-50 dark:bg-slate-900/50">
                    {allProducts.length === 0 && <p className="text-sm text-slate-500">No products found. Add products in the dashboard.</p>}
                    {allProducts.map(product => (
                        <label key={product.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.itemIds?.includes(product.id) || false}
                                onChange={() => handleToggleProduct(product.id)}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="flex-grow">
                                <p className="font-semibold text-slate-800 dark:text-slate-200">{product.name}</p>
                                <p className="text-xs text-slate-500">${(product.price || 0).toFixed(2)} - {product.category}</p>
                            </div>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

const CustomFormSelectorForm = ({ data, handleFieldChange, customForms }: { data: any, handleFieldChange: (f: string, v: any) => void, customForms: CrmForm[] }) => (
    <div className="space-y-4">
        <EnhancedFormField label="Title" value={data.title} onChange={v => handleFieldChange('title', v)} context="a custom form section title" />
        <EnhancedFormField label="Subtitle" value={data.subtitle} onChange={v => handleFieldChange('subtitle', v)} type="textarea" rows={2} context="a custom form section subtitle" />
        <FormField label="Select Form">
            <SelectInput value={data.formId || ''} onChange={e => handleFieldChange('formId', e.target.value)}>
                <option value="" disabled>-- Choose a form --</option>
                {customForms.map(form => (
                    <option key={form.id} value={form.id}>{form.name}</option>
                ))}
            </SelectInput>
            {customForms.length === 0 && <p className="text-xs text-slate-500 mt-1">No forms found. Create one in the Contact Manager.</p>}
        </FormField>
    </div>
);


export default SectionEditForm;