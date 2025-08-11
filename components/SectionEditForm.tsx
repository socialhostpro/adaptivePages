


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
import type { MediaFile, ManagedProduct, CourseChapter, CourseLesson, CrmForm, HeroSlide, HeroButton, ImageStore, NavMenuItem, SectionAnimation as SectionAnimationType, CrmFormField } from '../types';
import EnhancedFormField from './EnhancedFormField';
import CourseForm from './CourseForm';
import FormField, { TextInput, NumberInput, TextAreaInput, SelectInput } from './shared/FormField';
import DraggableList from './shared/DraggableList';
import ColorSwatchPicker from './ColorSwatchPicker';
import PlusIcon from './icons/PlusIcon';
import Switch from './shared/Switch';
import LinkEditor from './shared/LinkEditor';


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

const SectionAnimation = ({ value, onChange }: { value: SectionAnimationType, onChange: (v: SectionAnimationType) => void }) => (
    <FormField label="Animation">
        <SelectInput value={value} onChange={e => onChange(e.target.value as SectionAnimationType)}>
            <option value="none">None</option>
            <option value="fade-in-up">Fade In Up</option>
        </SelectInput>
    </FormField>
);

const SectionEditForm: React.FC<SectionEditFormProps> = ({ sectionKey, data, setData, onRegenerate, isRegenerating, error, setError, mediaLibrary, onUploadFile, allProducts, customForms, userId, allSections, allPages, images }) => {
    const [prompt, setPrompt] = useState('');
    const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
    const [imageChangeCallback, setImageChangeCallback] = useState<(url: string) => void>(() => () => {});

    const handleFieldChange = (field: string, value: any) => setData({ ...data, [field]: value });

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
            case 'nav': return <NavForm data={data} setData={setData} openMediaLibrary={openMediaLibrary} allPages={allPages} allSections={allSections} images={images} />;
            case 'hero': return <HeroForm data={data} setData={setData} openMediaLibrary={openMediaLibrary} customForms={customForms} images={images} />;
            case 'features':
            case 'whyChooseUs':
                 return <ItemsForm
                    data={data}
                    handleFieldChange={handleFieldChange}
                    items={data.items}
                    onItemsChange={(newItems) => handleFieldChange('items', newItems)}
                    sectionKey={sectionKey}
                    renderItem={(item: any, index: number) => {
                        const [activeIconPicker, setActiveIconPicker] = useState<number | null>(null);
                        const handleItemChange = (field: string, value: any) => {
                            const newItems = [...data.items];
                            newItems[index] = { ...newItems[index], [field]: value };
                            handleFieldChange('items', newItems);
                        };
                        return (
                        <>
                            <div className="flex gap-4">
                                <div className="w-1/4">
                                    <FormField label="Icon">
                                        <div className="relative">
                                            <button 
                                                type="button"
                                                onClick={() => setActiveIconPicker(activeIconPicker === index ? null : index)}
                                                className="w-full flex items-center justify-center p-2 h-16 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700"
                                            >
                                                <DynamicIcon iconName={item.iconName} className="w-8 h-8 text-indigo-500" />
                                            </button>
                                            {activeIconPicker === index && (
                                                <IconPicker
                                                    onSelect={(iconName) => {
                                                        handleItemChange('iconName', iconName);
                                                        setActiveIconPicker(null);
                                                    }}
                                                    onClose={() => setActiveIconPicker(null)}
                                                />
                                            )}
                                        </div>
                                    </FormField>
                                </div>
                                <div className="w-3/4 space-y-2">
                                     <EnhancedFormField label="Title" value={item.title || item.name} onChange={(v) => handleItemChange(item.title ? 'title' : 'name', v)} context="A feature or benefit title"/>
                                </div>
                            </div>
                            <EnhancedFormField label="Description" value={item.description} onChange={(v) => handleItemChange('description', v)} type="textarea" rows={3} context="A feature or benefit description"/>
                        </>
                    )}}
                    onAddItem={() => handleFieldChange('items', [...(data.items || []), { iconName: 'Sparkles', title: 'New Feature', description: 'A description.' }])}
                    addText="Add Item"
                 />;
            case 'gallery':
                 return <ItemsForm
                    data={data}
                    handleFieldChange={handleFieldChange}
                    items={data.items}
                    sectionKey={sectionKey}
                    onItemsChange={(newItems) => handleFieldChange('items', newItems)}
                    renderItem={(item: any, index: number) => {
                        const handleItemChange = (field: string, value: any) => {
                            const newItems = [...data.items];
                            newItems[index] = { ...newItems[index], [field]: value };
                            handleFieldChange('items', newItems);
                        };
                        return (
                        <>
                             <FormField label="Image">
                                <ImageInput 
                                    value={item.imagePrompt}
                                    imageUrl={images[`gallery_${index}`]}
                                    onChange={(newValue) => handleItemChange('imagePrompt', newValue)}
                                    onSelectFromLibrary={() => openMediaLibrary(url => handleItemChange('imagePrompt', url))}
                                />
                             </FormField>
                             <EnhancedFormField label="Alt Text" value={item.altText} onChange={(v) => handleItemChange('altText', v)} context="An image alt text for SEO and accessibility" />
                        </>
                    )}}
                    onAddItem={() => handleFieldChange('items', [...(data.items || []), { imagePrompt: 'A new beautiful image', altText: 'new image' }])}
                    addText="Add Image"
                 />;
            case 'products':
                 return <ProductSelectorForm 
                            data={data}
                            setData={setData}
                            allProducts={allProducts}
                        />;
            case 'course': return <CourseForm data={data} setData={setData} openMediaLibrary={openMediaLibrary} images={images} />;
            case 'video': return <VideoForm data={data} sectionKey={sectionKey} handleFieldChange={handleFieldChange} />;
            case 'testimonials':
                return <ItemsForm
                    data={data}
                    handleFieldChange={handleFieldChange}
                    items={data.items}
                    sectionKey={sectionKey}
                    onItemsChange={(newItems) => handleFieldChange('items', newItems)}
                    renderItem={(item: any, index: number) => {
                        const handleItemChange = (field: string, value: any) => {
                            const newItems = [...data.items];
                            newItems[index] = { ...newItems[index], [field]: value };
                            handleFieldChange('items', newItems);
                        };
                        return (
                        <>
                            <EnhancedFormField label="Quote" value={item.quote} onChange={(v) => handleItemChange('quote', v)} type="textarea" rows={3} context="A customer testimonial" />
                            <EnhancedFormField label="Author" value={item.author} onChange={(v) => handleItemChange('author', v)} context="A testimonial author's name" />
                            <EnhancedFormField label="Role" value={item.role} onChange={(v) => handleItemChange('role', v)} context="A testimonial author's role or title" />
                            <FormField label="Avatar Image">
                                <ImageInput 
                                    value={item.avatarImagePrompt}
                                    imageUrl={images[`testimonial_${index}`]}
                                    onChange={(newValue) => handleItemChange('avatarImagePrompt', newValue)}
                                    onSelectFromLibrary={() => openMediaLibrary(url => handleItemChange('avatarImagePrompt', url))}
                                />
                             </FormField>
                        </>
                    )}}
                    onAddItem={() => handleFieldChange('items', [...(data.items || []), { quote: 'New quote.', author: 'Anonymous', role: 'User', avatarImagePrompt: 'A new friendly face.' }])}
                    addText="Add Testimonial"
                 />;
            case 'pricing':
                return <PricingForm data={data} setData={setData} sectionKey={sectionKey} allPages={allPages} allSections={allSections} />;
            case 'faq':
                return <ItemsForm
                    data={data}
                    handleFieldChange={handleFieldChange}
                    items={data.items}
                    sectionKey={sectionKey}
                    onItemsChange={(newItems) => handleFieldChange('items', newItems)}
                    renderItem={(item: any, index: number) => {
                         const handleItemChange = (field: string, value: any) => {
                            const newItems = [...data.items];
                            newItems[index] = { ...newItems[index], [field]: value };
                            handleFieldChange('items', newItems);
                        };
                        return (
                         <>
                            <EnhancedFormField label="Question" value={item.question} onChange={(v) => handleItemChange('question', v)} context="A frequently asked question" />
                            <EnhancedFormField label="Answer" value={item.answer} onChange={(v) => handleItemChange('answer', v)} type="textarea" rows={3} context="An answer to a question" />
                        </>
                    )}}
                    onAddItem={() => handleFieldChange('items', [...(data.items || []), { question: 'New Question?', answer: 'New Answer.' }])}
                    addText="Add FAQ"
                 />;
            case 'contact': return <SimpleForm data={data} handleFieldChange={handleFieldChange} fields={['title', 'subtitle']} sectionKey={sectionKey} />;
            case 'customForm': return <CustomFormSelectorForm data={data} handleFieldChange={handleFieldChange} customForms={customForms} />;
            case 'embed': return <EmbedForm data={data} handleFieldChange={handleFieldChange} />;
            case 'booking': return <BookingForm data={data} handleFieldChange={handleFieldChange} />;
            case 'cta': return <CTAForm data={data} handleFieldChange={handleFieldChange} sectionKey={sectionKey} allPages={allPages} allSections={allSections}/>;
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
    <div className="space-y-4">
        {fields.includes('title') && <EnhancedFormField label="Title" value={data.title} onChange={(v) => handleFieldChange('title', v)} context={`${sectionKey} section title`} />}
        {fields.includes('subtitle') && <EnhancedFormField label="Subtitle" value={data.subtitle} onChange={(v) => handleFieldChange('subtitle', v)} type="textarea" rows={2} context={`${sectionKey} section subtitle`} />}
        <SectionAnimation value={data.animation} onChange={v => handleFieldChange('animation', v)} />
    </div>
);

const FormFieldManager = ({ fields, onFieldsChange }: { fields: CrmFormField[], onFieldsChange: (fields: CrmFormField[]) => void }) => {
    
    const addField = () => {
        onFieldsChange([...fields, { id: `f-${Date.now()}`, label: '', type: 'text', required: false }]);
    };

    const removeField = (id: string) => {
        onFieldsChange(fields.filter(f => f.id !== id));
    };

    const handleFieldChange = (id: string, prop: keyof CrmFormField, value: any) => {
        onFieldsChange(fields.map(f => f.id === id ? { ...f, [prop]: value } : f));
    };
    
    return (
        <div className="space-y-2">
             <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300">Form Fields</h4>
             {fields.map(field => (
                <div key={field.id} className="p-2 border rounded dark:border-slate-700 grid grid-cols-12 gap-2 items-center bg-slate-50 dark:bg-slate-900/50">
                    <div className="col-span-4"><TextInput value={field.label} onChange={e => handleFieldChange(field.id, 'label', e.target.value)} placeholder="Label" /></div>
                    <div className="col-span-4">
                        <SelectInput value={field.type} onChange={e => handleFieldChange(field.id, 'type', e.target.value as CrmFormField['type'])}>
                            <option value="text">Text</option>
                            <option value="email">Email</option>
                            <option value="tel">Phone</option>
                            <option value="textarea">Text Area</option>
                        </SelectInput>
                    </div>
                    <div className="col-span-3 flex items-center gap-1.5">
                        <input type="checkbox" checked={field.required} onChange={e => handleFieldChange(field.id, 'required', e.target.checked)} className="h-4 w-4"/>
                        <label className="text-sm">Required</label>
                    </div>
                    <div className="col-span-1"><button type="button" onClick={() => removeField(field.id)}><TrashIcon className="w-4 h-4 text-red-500"/></button></div>
                </div>
             ))}
             <button type="button" onClick={addField} className="text-sm flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline">
                <PlusIcon className="w-4 h-4"/> Add Field
             </button>
        </div>
    );
};

const HeroForm = ({ data, setData, openMediaLibrary, customForms, images }: { data: any, setData: (d: any) => void, openMediaLibrary: (cb: (url: string) => void) => void, customForms: CrmForm[], images: ImageStore }) => {
    const handleFieldChange = (field: string, value: any) => setData({ ...data, [field]: value });
    const layout = data.layout || 'background';
    const backgroundType = data.backgroundType || 'image';
    const formSource = data.formId ? 'reusable' : 'custom';
    
    const useUniqueTextPerSlide = data.animateText === true;

    const bgLightColors = ['white', 'slate-50', 'slate-100', 'gray-50', 'gray-100'];
    const bgDarkColors = ['slate-800', 'slate-900', 'gray-800', 'gray-900'];

    const handleSlidesChange = (newSlides: HeroSlide[]) => {
        handleFieldChange('slides', newSlides);
    };

    const handleSlideItemChange = (index: number, field: keyof HeroSlide, value: string) => {
        const newSlides = [...(data.slides || [])];
        newSlides[index] = { ...newSlides[index], [field]: value };
        handleSlidesChange(newSlides);
    };
    
    const handleButtonsChange = (newButtons: HeroButton[]) => {
        handleFieldChange('buttons', newButtons);
    };

    const handleButtonChange = (index: number, field: keyof HeroButton, value: string) => {
        const newButtons = [...(data.buttons || [])];
        newButtons[index] = { ...newButtons[index], [field]: value } as HeroButton;
        handleButtonsChange(newButtons);
    };
    
    const addButton = () => {
        const newButton: HeroButton = { text: 'Learn More', link: '#', style: 'primary' };
        handleButtonsChange([...(data.buttons || []), newButton]);
    };

    const addSlide = () => {
        const newSlide = { 
            title: useUniqueTextPerSlide ? 'New Slide Title' : data.title, 
            subtitle: useUniqueTextPerSlide ? 'New slide subtitle.' : data.subtitle, 
            imagePrompt: 'A beautiful landscape' 
        };
        handleSlidesChange([...(data.slides || []), newSlide]);
    };
    
    const handleToggleAnimateText = (enabled: boolean) => {
        handleFieldChange('animateText', enabled);
        if (!enabled && data.slides && data.slides.length > 0) {
            // When turning animation off, sync all slide text to the main text
            const newSlides = data.slides.map((slide: HeroSlide) => ({
                ...slide,
                title: data.title,
                subtitle: data.subtitle,
            }));
            handleFieldChange('slides', newSlides);
        }
    };


    return (
        <div className="space-y-4">
            <FormField label="Layout">
                <SelectInput value={layout} onChange={e => handleFieldChange('layout', e.target.value)}>
                    <option value="background">Background Media</option>
                    <option value="split">Split (Text/Image)</option>
                    <option value="split_video">Split (Text/Video)</option>
                    <option value="split_embed">Split (Text/Embed)</option>
                    <option value="form_overlay">Form Overlay</option>
                    <option value="embed_overlay">Embed Overlay</option>
                </SelectInput>
            </FormField>
            
            <div className={`${useUniqueTextPerSlide && backgroundType === 'slider' ? 'opacity-50' : ''}`}>
                <EnhancedFormField label="Title" value={data.title} onChange={(v) => handleFieldChange('title', v)} context="a hero section title" />
                <EnhancedFormField label="Subtitle" value={data.subtitle} onChange={(v) => handleFieldChange('subtitle', v)} context="a hero section subtitle" type="textarea" rows={3}/>
            </div>
             {useUniqueTextPerSlide && backgroundType === 'slider' && <p className="text-xs text-slate-500 -mt-3 p-1">Main title is disabled. Edit text per slide below.</p>}

            
            <div className="pt-4 border-t dark:border-slate-600 space-y-4">
                <h3 className="text-md font-semibold">Call to Action Buttons</h3>
                 <FormField label="Button Layout">
                    <SelectInput value={data.buttonLayout || 'horizontal'} onChange={e => handleFieldChange('buttonLayout', e.target.value)}>
                        <option value="horizontal">Horizontal</option>
                        <option value="vertical">Vertical</option>
                    </SelectInput>
                </FormField>
                <DraggableList
                    items={data.buttons || []}
                    onUpdate={handleButtonsChange}
                    renderItem={(btn: HeroButton, index: number) => (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <DragHandleIcon className="w-5 h-5 text-gray-400 dark:text-slate-500 cursor-grab active:cursor-grabbing" />
                                    <span className="text-xs font-bold uppercase text-slate-500">Button {index + 1}</span>
                                </div>
                                <button type="button" onClick={() => handleButtonsChange((data.buttons || []).filter((_:any, i:number) => i !== index))}>
                                    <TrashIcon className="w-4 h-4 text-red-500"/>
                                </button>
                            </div>
                            <EnhancedFormField label="Text" value={btn.text} onChange={v => handleButtonChange(index, 'text', v)} context="hero button text"/>
                            <FormField label="Link"><TextInput value={btn.link} onChange={e => handleButtonChange(index, 'link', e.target.value)} /></FormField>
                            <FormField label="Style">
                                <SelectInput value={btn.style} onChange={e => handleButtonChange(index, 'style', e.target.value as HeroButton['style'])}>
                                    <option value="primary">Primary</option>
                                    <option value="secondary">Secondary</option>
                                    <option value="outline">Outline</option>
                                </SelectInput>
                            </FormField>
                        </div>
                    )}
                />
                <button type="button" onClick={addButton} className="text-sm w-full text-center py-2 border-dashed border-2 dark:border-slate-600 rounded-md text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">+ Add Button</button>
            </div>

            <div className="pt-4 border-t dark:border-slate-600 space-y-4">
                <h3 className="text-md font-semibold">Background / Media</h3>
                
                {['background', 'form_overlay', 'embed_overlay'].includes(layout) && (
                     <>
                        <FormField label="Background Type">
                            <SelectInput value={backgroundType} onChange={e => handleFieldChange('backgroundType', e.target.value)}>
                                <option value="image">Single Image</option>
                                <option value="slider">Image Slider</option>
                                <option value="video">Video</option>
                            </SelectInput>
                        </FormField>
                        {backgroundType === 'image' && <ImageInput value={data.imagePrompt || ''} imageUrl={images['hero']} onChange={(newValue) => handleFieldChange('imagePrompt', newValue)} onSelectFromLibrary={() => openMediaLibrary(url => handleFieldChange('imagePrompt', url))} />}
                        {backgroundType === 'video' && (
                            <div className="space-y-2">
                                <FormField label="Video Source">
                                    <SelectInput value={data.videoSource || 'youtube'} onChange={e => handleFieldChange('videoSource', e.target.value)}>
                                        <option value="youtube">YouTube</option>
                                        <option value="vimeo">Vimeo</option>
                                    </SelectInput>
                                </FormField>
                                {(data.videoSource || 'youtube') === 'vimeo' ? (
                                    <FormField label="Vimeo Video ID"><TextInput value={data.vimeoVideoId || ''} onChange={e => handleFieldChange('vimeoVideoId', e.target.value)} /></FormField>
                                ) : (
                                    <FormField label="YouTube Video ID"><TextInput value={data.youtubeVideoId || ''} onChange={(e) => handleFieldChange('youtubeVideoId', e.target.value)} /></FormField>
                                )}
                            </div>
                        )}
                        
                        {backgroundType === 'slider' && (
                            <div className="pt-2 space-y-3">
                                <label className="flex items-center justify-between cursor-pointer p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">Unique text per slide</span>
                                    <Switch enabled={useUniqueTextPerSlide} onChange={handleToggleAnimateText} />
                                </label>
                                
                                <DraggableList
                                    items={data.slides || []}
                                    onUpdate={handleSlidesChange}
                                    renderItem={(slide: HeroSlide, index: number) => (
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <DragHandleIcon className="w-5 h-5 text-gray-400 dark:text-slate-500 cursor-grab active:cursor-grabbing" />
                                                    <span className="text-xs font-bold uppercase text-slate-500">Slide {index + 1}</span>
                                                </div>
                                                <button type="button" onClick={() => handleSlidesChange((data.slides || []).filter((_:any, i:number) => i !== index))}>
                                                    <TrashIcon className="w-4 h-4 text-red-500"/>
                                                </button>
                                            </div>
                                            
                                            {useUniqueTextPerSlide && (
                                                <>
                                                    <EnhancedFormField label="Title" value={slide.title} onChange={v => handleSlideItemChange(index, 'title', v)} context="hero slider title"/>
                                                    <EnhancedFormField label="Subtitle" value={slide.subtitle} onChange={v => handleSlideItemChange(index, 'subtitle', v)} context="hero slider subtitle" type="textarea" rows={2}/>
                                                </>
                                            )}
                                            
                                            <ImageInput 
                                                value={slide.imagePrompt} 
                                                imageUrl={images[`hero_slider_${index}`]}
                                                onChange={v => handleSlideItemChange(index, 'imagePrompt', v)} 
                                                onSelectFromLibrary={() => openMediaLibrary(url => handleSlideItemChange(index, 'imagePrompt', url))} 
                                            />
                                        </div>
                                    )}
                                />
                                <button type="button" onClick={addSlide} className="text-sm w-full text-center py-2 border-dashed border-2 dark:border-slate-600 rounded-md text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">+ Add Slide</button>
                            </div>
                        )}
                    </>
                )}

                {layout === 'split' && <ImageInput value={data.splitImagePrompt || ''} imageUrl={images['hero_split']} onChange={(newValue) => handleFieldChange('splitImagePrompt', newValue)} onSelectFromLibrary={() => openMediaLibrary(url => handleFieldChange('splitImagePrompt', url))} />}

                {layout === 'split_video' && (
                    <div className="space-y-2">
                        <FormField label="Video Source">
                            <SelectInput value={data.splitVideoSource || 'youtube'} onChange={e => handleFieldChange('splitVideoSource', e.target.value)}>
                                <option value="youtube">YouTube</option>
                                <option value="vimeo">Vimeo</option>
                            </SelectInput>
                        </FormField>
                        {(data.splitVideoSource || 'youtube') === 'vimeo' ? (
                            <FormField label="Vimeo Video ID"><TextInput value={data.splitVimeoVideoId || ''} onChange={e => handleFieldChange('splitVimeoVideoId', e.target.value)} /></FormField>
                        ) : (
                            <FormField label="YouTube Video ID"><TextInput value={data.splitYoutubeVideoId || ''} onChange={(e) => handleFieldChange('splitYoutubeVideoId', e.target.value)} /></FormField>
                        )}
                    </div>
                )}
                 {['split_embed', 'embed_overlay'].includes(layout) && (
                    <FormField label="Embed Code (HTML)">
                        <TextAreaInput rows={8} value={data.splitEmbedCode || ''} onChange={(e) => handleFieldChange('splitEmbedCode', e.target.value)} placeholder="Paste your HTML code snippet..." spellCheck="false" className="font-mono text-xs" />
                    </FormField>
                )}
            </div>
            
             {layout === 'form_overlay' && (
                <div className="pt-4 border-t dark:border-slate-600 space-y-4">
                    <h3 className="text-md font-semibold">Overlay Form</h3>
                     <EnhancedFormField label="Form Title" value={data.formTitle || ''} onChange={(v) => handleFieldChange('formTitle', v)} context="a title for a lead capture form" placeholder="Get Started Now" />
                     <FormField label="Form Source">
                        <SelectInput value={formSource} onChange={e => {
                            if (e.target.value === 'reusable') {
                                handleFieldChange('fields', undefined);
                                handleFieldChange('formId', customForms[0]?.id || '');
                            } else {
                                handleFieldChange('formId', undefined);
                                handleFieldChange('fields', [{ id: `f-${Date.now()}`, label: 'Email', type: 'email', required: true }]);
                            }
                        }}>
                            <option value="custom">Create Custom Form</option>
                            <option value="reusable">Use Reusable Form</option>
                        </SelectInput>
                    </FormField>
                    {formSource === 'reusable' ? (
                        <FormField label="Select Reusable Form">
                            <SelectInput value={data.formId || ''} onChange={e => handleFieldChange('formId', e.target.value)}>
                                <option value="" disabled>-- Choose a form --</option>
                                {customForms.map(form => (
                                    <option key={form.id} value={form.id}>{form.name}</option>
                                ))}
                            </SelectInput>
                             {customForms.length === 0 && <p className="text-xs text-slate-500 mt-1">No reusable forms found. Create one in the Contact Manager.</p>}
                        </FormField>
                    ) : (
                        <FormFieldManager fields={data.fields || []} onFieldsChange={newFields => handleFieldChange('fields', newFields)} />
                    )}
                </div>
            )}
            
            <div className="pt-4 border-t dark:border-slate-600 space-y-4">
                 <h3 className="text-md font-semibold">Customization & Animation</h3>
                 <SectionAnimation value={data.animation} onChange={v => handleFieldChange('animation', v)} />
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

const CTAForm = ({ data, handleFieldChange, sectionKey, allPages, allSections }: { data: any, handleFieldChange: (f: string, v: any) => void, sectionKey: string, allPages: {id: string, name: string}[], allSections: string[] }) => (
    <div className="space-y-4">
        <SimpleForm data={data} handleFieldChange={handleFieldChange} fields={['title', 'subtitle']} sectionKey={sectionKey} />
        <EnhancedFormField label="CTA Button Text" value={data.ctaText} onChange={(v) => handleFieldChange('ctaText', v)} context="a call to action button" />
        <LinkEditor value={data.ctaLink || ''} onChange={v => handleFieldChange('ctaLink', v)} allPages={allPages} allSections={allSections} />
    </div>
);

const VideoForm = ({ data, handleFieldChange, sectionKey }: { data: any, handleFieldChange: (f: string, v: any) => void, sectionKey: string }) => {
    const videoSource = data.videoSource || 'youtube';
    return (
        <div className="space-y-4">
            <SimpleForm data={data} handleFieldChange={handleFieldChange} fields={['title', 'subtitle']} sectionKey={sectionKey} />
            <FormField label="Video Source">
                <SelectInput value={videoSource} onChange={e => handleFieldChange('videoSource', e.target.value)}>
                    <option value="youtube">YouTube</option>
                    <option value="vimeo">Vimeo</option>
                </SelectInput>
            </FormField>
            {videoSource === 'vimeo' ? (
                <FormField label="Vimeo Video ID"><TextInput value={data.vimeoVideoId || ''} onChange={(e) => handleFieldChange('vimeoVideoId', e.target.value)} /></FormField>
            ) : (
                <FormField label="YouTube Video ID"><TextInput value={data.youtubeVideoId || ''} onChange={(e) => handleFieldChange('youtubeVideoId', e.target.value)} /></FormField>
            )}
        </div>
    );
};

const BookingForm = ({ data, handleFieldChange }: { data: any, handleFieldChange: (f: string, v: any) => void }) => (
    <div className="space-y-4">
        <EnhancedFormField label="Title" value={data.title} onChange={(v) => handleFieldChange('title', v)} context="a booking section title" />
        <EnhancedFormField label="Subtitle" value={data.subtitle} onChange={(v) => handleFieldChange('subtitle', v)} type="textarea" rows={2} context="a booking section subtitle" />
        <EnhancedFormField label="Button Text" value={data.ctaText} onChange={(v) => handleFieldChange('ctaText', v)} context="a booking button text" placeholder="e.g., Book a Demo" />
        <FormField label="Booking Embed Code (HTML)">
            <TextAreaInput rows={8} value={data.bookingEmbedCode} onChange={(e) => handleFieldChange('bookingEmbedCode', e.target.value)} placeholder="Paste your HTML code snippet from Calendly, etc." spellCheck="false" className="font-mono text-xs" />
        </FormField>
        <SectionAnimation value={data.animation} onChange={v => handleFieldChange('animation', v)} />
    </div>
);

const EmbedForm = ({ data, handleFieldChange }: { data: any, handleFieldChange: (f: string, v: any) => void }) => (
    <div className="space-y-4">
        <EnhancedFormField label="Title" value={data.title} onChange={v => handleFieldChange('title', v)} context="an embed section title" />
        <EnhancedFormField label="Subtitle" value={data.subtitle} onChange={v => handleFieldChange('subtitle', v)} type="textarea" rows={2} context="an embed section subtitle" />
        
        <FormField label="Embed Type">
            <SelectInput value={data.embedType} onChange={e => handleFieldChange('embedType', e.target.value)}>
                <option value="floating-script">Floating Script (e.g., Chatbot)</option>
                <option value="inline-iframe">Inline Iframe (e.g., Video Player)</option>
            </SelectInput>
        </FormField>
        
        <FormField label="Embed Code (Script or Iframe)">
            <TextAreaInput 
                rows={8} 
                value={data.embedCode} 
                onChange={(e) => handleFieldChange('embedCode', e.target.value)} 
                placeholder="Paste your full script or iframe code here." 
                spellCheck="false" 
                className="font-mono text-xs" 
            />
            <p className="text-xs text-slate-500 mt-1">If your code requires an API key, use `[api_key]` as a placeholder, then enter the key below.</p>
        </FormField>
        
        <FormField label="API Key (Optional)">
            <TextInput 
                value={data.apiKey} 
                onChange={(e) => handleFieldChange('apiKey', e.target.value)} 
                placeholder="Enter your API key here" 
            />
        </FormField>
         <SectionAnimation value={data.animation} onChange={v => handleFieldChange('animation', v)} />
    </div>
);

const ItemsForm = ({ data, handleFieldChange, items, onItemsChange, renderItem, onAddItem, addText, sectionKey, titleField='title', subtitleField='subtitle' }: any) => {
    const removeItem = (itemIndex: number) => {
        onItemsChange(items.filter((_:any, i:number) => i !== itemIndex));
    };

    return (
        <div className="space-y-4">
            {data[titleField] !== undefined && <EnhancedFormField label={titleField === 'copyrightText' ? "Copyright Text" : "Title"} value={data[titleField]} onChange={(v) => handleFieldChange(titleField, v)} context={`${sectionKey} section ${titleField}`} />}
            {data[subtitleField] !== undefined && subtitleField && <EnhancedFormField label="Subtitle" value={data[subtitleField]} onChange={(v) => handleFieldChange(subtitleField, v)} type="textarea" rows={2} context={`${sectionKey} section subtitle`} />}

            <DraggableList 
                items={items}
                onUpdate={onItemsChange}
                renderItem={(item, index) => (
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                             <span className="text-xs font-bold uppercase text-slate-500">Item {index + 1}</span>
                            <button onClick={() => removeItem(index)} className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                        {renderItem(item, index)}
                    </div>
                )}
            />
            <button onClick={onAddItem} className="mt-2 text-sm w-full text-center py-2 border-dashed border-2 dark:border-slate-600 rounded-md text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">+ {addText}</button>
            <div className="pt-4 border-t dark:border-slate-600">
                <SectionAnimation value={data.animation} onChange={v => handleFieldChange('animation', v)} />
            </div>
        </div>
    );
};


const PricingForm = ({ data, setData, sectionKey, allPages, allSections }: { data: any, setData: (d: any) => void, sectionKey: string, allPages: {id: string, name: string}[], allSections: string[] }) => {
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
        <div className="space-y-4">
            <SimpleForm data={data} handleFieldChange={handleFieldChange} fields={['title', 'subtitle']} sectionKey={sectionKey} />
            {(data.plans || []).map((plan: any, pIndex: number) => (
                <div key={pIndex} className="p-3 my-2 border dark:border-slate-600 rounded-lg space-y-2">
                    <div className="flex justify-between items-center"><h4 className="font-semibold dark:text-slate-200">Plan {pIndex+1}</h4><button onClick={() => removePlan(pIndex)} className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100/50"><TrashIcon className="w-4 h-4" /></button></div>
                    <EnhancedFormField label="Name" value={plan.name} onChange={v => handlePlanChange(pIndex, 'name', v)} context="a pricing plan name" />
                    <FormField label="Price"><TextInput value={plan.price} onChange={e => handlePlanChange(pIndex, 'price', e.target.value)} /></FormField>
                    <EnhancedFormField label="CTA Text" value={plan.ctaText} onChange={v => handlePlanChange(pIndex, 'ctaText', v)} context="a call to action button for a pricing plan" />
                    <LinkEditor value={plan.ctaLink || ''} onChange={v => handlePlanChange(pIndex, 'ctaLink', v)} allPages={allPages} allSections={allSections} />
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
        </div>
    );
};


const NavForm = ({ data, setData, openMediaLibrary, allPages, allSections, images }: { data: any, setData: (d: any) => void, openMediaLibrary: (cb: (url: string) => void) => void, allPages: {id: string, name: string}[], allSections: string[], images: ImageStore }) => {
    
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
                    imageUrl={images['logo']}
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
                    renderItem={(item: NavMenuItem, index: number) => {
                       const [activeIconPicker, setActiveIconPicker] = useState<number | null>(null);
                       return (
                        <div className="space-y-3">
                            <div className="flex items-start gap-2">
                                <DragHandleIcon className="w-5 h-5 text-gray-400 dark:text-slate-500 cursor-grab active:cursor-grabbing flex-shrink-0 mt-8" />
                                <div className="flex-grow grid grid-cols-2 gap-4">
                                    <EnhancedFormField label="Menu Text" value={item.text} onChange={v => handleMenuItemChange(index, 'text', v)} context="a navigation menu item" />
                                    <FormField label="Icon">
                                        <div className="relative">
                                            <button type="button" onClick={() => setActiveIconPicker(activeIconPicker === index ? null : index)} className="w-full flex items-center justify-between p-2 h-10 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700">
                                                <DynamicIcon iconName={item.iconName || 'HelpCircle'} className="w-5 h-5" />
                                                <span className="text-xs truncate">{item.iconName || 'Select Icon'}</span>
                                                <ChevronDownIcon className="w-4 h-4"/>
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
                                    </FormField>
                                </div>
                                <button onClick={() => removeMenuItem(index)} className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100/50 flex-shrink-0 mt-6"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                            <div className="pl-7">
                                <LinkEditor
                                    value={item.link}
                                    onChange={v => handleMenuItemChange(index, 'link', v)}
                                    allPages={allPages}
                                    allSections={allSections}
                                />
                            </div>
                        </div>
                       )
                    }}
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