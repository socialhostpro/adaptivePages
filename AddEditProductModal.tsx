
import React, { useState, useEffect, useMemo } from 'react';
import type { ManagedProduct, ProductStatus, FulfillmentType, ProductCategory, ProductOption, MediaFile, Task } from './types';
import XIcon from './components/icons/XIcon';
import PlusIcon from './components/icons/PlusIcon';
import TrashIcon from './components/icons/TrashIcon';
import ImageInput from './components/ImageInput';
import ImageGalleryInput from './components/ImageGalleryInput';
import MediaLibraryModal from './components/MediaLibraryModal';
import LoaderIcon from './components/icons/LoaderIcon';
import AssociatedTasks from './components/AssociatedTasks';
import { Button } from './components/CaseManager/components/shared/Button';
import { Input } from './components/CaseManager/components/shared/Input';
import { Select } from './components/CaseManager/components/shared/Select';

interface AddEditProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: Omit<ManagedProduct, 'id' | 'user_id' | 'created_at'>, productId?: string) => Promise<void>;
    productToEdit: ManagedProduct | null;
    newItemType?: 'product' | 'service' | 'course';
    categories: ProductCategory[];
    mediaLibrary: MediaFile[];
    onUploadFile: (file: File) => Promise<void>;
    userId: string;
    onCategoriesUpdate: () => void;
    // Task props
    allTasks: Task[];
    onOpenTaskModal: (task: Task | null, initialLink: any) => void;
}

const PRODUCT_STATUSES: ProductStatus[] = ['Active', 'Draft', 'Archived'];

const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">{label}</label>
        {children}
    </div>
);

const CategorySelector: React.FC<{categories: ProductCategory[], value: string | null, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void}> = ({ categories, value, onChange }) => {
    const categoryTree = useMemo(() => {
        const map = new Map(categories.map(c => [c.id, { ...c, children: [] as ProductCategory[] }]));
        const roots: ProductCategory[] = [];
        categories.forEach(c => {
            if (c.parent_id && map.has(c.parent_id)) {
                map.get(c.parent_id)!.children.push(map.get(c.id)!);
            } else {
                roots.push(map.get(c.id)!);
            }
        });
        return roots;
    }, [categories]);

    const renderOptions = (nodes: ProductCategory[], level = 0) => {
        let options: JSX.Element[] = [];
        for (const node of nodes) {
            options.push(<option key={node.id} value={node.id}>{'— '.repeat(level)}{node.name}</option>);
            if (node.children && node.children.length > 0) {
                options = options.concat(renderOptions(node.children, level + 1));
            }
        }
        return options;
    };

    return (
        <select required value={value || ''} onChange={onChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600">
            <option value="" disabled>Select a category</option>
            {renderOptions(categoryTree)}
        </select>
    );
};

const AddEditProductModal: React.FC<AddEditProductModalProps> = ({ 
    isOpen, onClose, onSave, productToEdit, newItemType, categories, mediaLibrary, 
    onUploadFile, userId, onCategoriesUpdate, allTasks = [], onOpenTaskModal 
}) => {
    const [product, setProduct] = useState<Partial<ManagedProduct>>({});
    const [activeTab, setActiveTab] = useState('general');
    const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
    const [imageChangeContext, setImageChangeContext] = useState<{ type: 'featured' | 'gallery', index?: number } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        if (!isOpen) return;
        
        setActiveTab('general');
        
        let newFulfillmentType: FulfillmentType = 'Shippable';
        if (!productToEdit && newItemType) {
            if (newItemType === 'service') newFulfillmentType = 'On-site Service';
            else if (newItemType === 'course') newFulfillmentType = 'VideoCourse';
        }
        
        setProduct({
            id: productToEdit?.id,
            name: productToEdit?.name || '',
            description: productToEdit?.description || '',
            price: productToEdit?.price || 0,
            status: productToEdit?.status || 'Draft',
            fulfillment_type: productToEdit?.fulfillment_type || newFulfillmentType,
            category_id: productToEdit?.category_id || (categories.length > 0 ? categories[0].id : null),
            featured_image_url: productToEdit?.featured_image_url || null,
            gallery_images: productToEdit?.gallery_images || [],
            options: productToEdit?.options || [],
        });
    }, [isOpen, productToEdit, newItemType, categories]);
    
    const handleChange = (field: keyof Omit<ManagedProduct, 'price'>, value: any) => {
        setProduct(prev => ({...prev, [field]: value}));
    };
    
    const handlePriceChange = (value: string) => {
        const newPrice = parseFloat(value);
        setProduct(prev => ({ ...prev, price: isNaN(newPrice) ? 0 : newPrice }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { id, user_id, created_at, category, ...saveData } = product;
        if (!saveData.name) {
            alert("Please provide a name for the item.");
            return;
        }
        if (!saveData.category_id) {
            alert("Please select a category.");
            return;
        }
        
        setIsSaving(true);
        try {
            const categoryName = categories.find(c => c.id === saveData.category_id)?.name || 'Uncategorized';
            await onSave({ ...saveData, category: categoryName } as any, product.id);
            onClose();
        } catch (err) {
            console.error("Failed to save product:", err);
            alert("An error occurred while saving the product.");
        } finally {
            setIsSaving(false);
        }
    };

    // --- Media Library Handling ---
    const openMediaLibrary = (type: 'featured' | 'gallery', index?: number) => {
        setImageChangeContext({ type, index });
        setIsMediaLibraryOpen(true);
    };

    const handleSelectFile = (file: MediaFile) => {
        if (imageChangeContext?.type === 'featured') {
            handleChange('featured_image_url', file.url);
        } else if (imageChangeContext?.type === 'gallery') {
            const currentGallery = product.gallery_images || [];
            handleChange('gallery_images', [...currentGallery, file.url]);
        }
        setIsMediaLibraryOpen(false);
    };
    
    // --- Variants Handling ---
    const addOption = () => {
        const newOptions = [...(product.options || []), { name: 'New Option', values: [{ value: 'Default', priceModifier: 0 }] }];
        handleChange('options', newOptions);
    };
    
    const removeOption = (index: number) => {
        const newOptions = (product.options || []).filter((_, i) => i !== index);
        handleChange('options', newOptions);
    };
    
    const handleOptionChange = (optIndex: number, field: 'name', value: string) => {
        const newOptions = [...(product.options || [])];
        newOptions[optIndex] = { ...newOptions[optIndex], [field]: value };
        handleChange('options', newOptions);
    };
    
    const addOptionValue = (optIndex: number) => {
        const newOptions = [...(product.options || [])];
        newOptions[optIndex].values.push({ value: 'New Value', priceModifier: 0 });
        handleChange('options', newOptions);
    };
    
    const removeOptionValue = (optIndex: number, valIndex: number) => {
        const newOptions = [...(product.options || [])];
        newOptions[optIndex].values = newOptions[optIndex].values.filter((_, i) => i !== valIndex);
        handleChange('options', newOptions);
    };
    
    const handleOptionValueChange = (optIndex: number, valIndex: number, field: 'value' | 'priceModifier', value: string | number) => {
        const newOptions = [...(product.options || [])];
        const newValues = [...newOptions[optIndex].values];
        newValues[valIndex] = { ...newValues[valIndex], [field]: value };
        newOptions[optIndex] = { ...newOptions[optIndex], values: newValues };
        handleChange('options', newOptions);
    };

    // --- Task Handlers ---
    const handleAddTask = () => {
        onOpenTaskModal && onOpenTaskModal(null, { type: 'product', id: product.id });
    };

    const handleEditTask = (task: Task) => {
        onOpenTaskModal && onOpenTaskModal(task, null);
    };

    if (!isOpen || !product) return null;

    const TabButton = ({ tabName, label }: { tabName: string, label: string }) => (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab(tabName)}
            className={`whitespace-nowrap pb-3 px-4 border-b-2 font-medium text-sm ${
                activeTab === tabName
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
        >
            {label}
        </Button>
    );

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl h-auto max-h-[90vh] flex flex-col overflow-hidden border dark:border-slate-700" onClick={e => e.stopPropagation()}>
                    <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200">
                            {productToEdit ? 'Edit Item' : `Add New ${newItemType ? newItemType.charAt(0).toUpperCase() + newItemType.slice(1) : 'Item'}`}
                        </h2>
                        <Button
                            variant="ghost" 
                            size="sm"
                            onClick={onClose} 
                            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700"
                            aria-label="Close modal"
                        >
                            <XIcon className="w-6 h-6" />
                        </Button>
                    </header>
                    <form onSubmit={handleSubmit}>
                        <div className="border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
                            <nav className="-mb-px flex space-x-6 px-6">
                                <TabButton tabName="general" label="General" />
                                <TabButton tabName="images" label="Images" />
                                <TabButton tabName="variants" label="Variants" />
                                {productToEdit && onOpenTaskModal && <TabButton tabName="tasks" label="Tasks" />}
                            </nav>
                        </div>

                        <main className="p-6 overflow-y-auto space-y-4 h-[55vh]">
                            {activeTab === 'general' && (
                                <div className="space-y-4">
                                    <FormField label="Name">
                                        <Input 
                                            required 
                                            value={product.name || ''} 
                                            onChange={(e) => handleChange('name', e.target.value)} 
                                            placeholder="Enter product name"
                                        />
                                    </FormField>
                                    <FormField label="Description">
                                        <Input 
                                            as="textarea"
                                            value={product.description || ''} 
                                            onChange={(e) => handleChange('description', e.target.value)} 
                                            rows={3}
                                            placeholder="Enter product description"
                                        />
                                    </FormField>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField label="Price">
                                            <Input 
                                                required 
                                                type="number" 
                                                step="0.01" 
                                                value={product.price || 0} 
                                                onChange={(e) => handlePriceChange(e.target.value)} 
                                                placeholder="0.00"
                                            />
                                        </FormField>
                                        <FormField label="Category">
                                            <CategorySelector categories={categories} value={product.category_id || null} onChange={e => handleChange('category_id', e.target.value)} />
                                        </FormField>
                                    </div>
                                    <FormField label="Status">
                                        <Select 
                                            value={product.status || 'Draft'} 
                                            onChange={(e) => handleChange('status', e.target.value as ProductStatus)}
                                        >
                                            {PRODUCT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </Select>
                                    </FormField>
                                </div>
                            )}
                            {activeTab === 'images' && (
                                <div className="space-y-4">
                                    <FormField label="Featured Image"><ImageInput value={product.featured_image_url || ''} onChange={v => handleChange('featured_image_url', v)} onSelectFromLibrary={() => openMediaLibrary('featured')} /></FormField>
                                    <FormField label="Image Gallery"><ImageGalleryInput prompts={product.gallery_images || []} onChange={v => handleChange('gallery_images', v)} /></FormField>
                                </div>
                            )}
                            {activeTab === 'variants' && (
                                <div className="space-y-4">
                                    {(product.options || []).map((option, optIndex) => (
                                        <div key={optIndex} className="p-4 border rounded-lg dark:border-slate-600 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <input value={option.name} onChange={e => handleOptionChange(optIndex, 'name', e.target.value)} placeholder="Option Name (e.g., Size)" className="font-semibold p-1 border-b dark:border-slate-500 bg-transparent focus:outline-none focus:border-indigo-500" />
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeOption(optIndex)}
                                                    aria-label={`Remove ${option.name} option`}
                                                >
                                                    <TrashIcon className="w-5 h-5 text-red-500 hover:text-red-700" />
                                                </Button>
                                            </div>
                                            <div className="space-y-2">
                                                {option.values.map((val, valIndex) => (
                                                    <div key={valIndex} className="flex items-center gap-2">
                                                        <input value={val.value} onChange={e => handleOptionValueChange(optIndex, valIndex, 'value', e.target.value)} placeholder="Value (e.g., Small)" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-500 text-sm" />
                                                        <div className="relative">
                                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                                            <input type="number" step="0.01" value={val.priceModifier} onChange={e => handleOptionValueChange(optIndex, valIndex, 'priceModifier', parseFloat(e.target.value))} placeholder="+/- Price" className="w-32 pl-5 p-2 border rounded dark:bg-slate-700 dark:border-slate-500 text-sm" />
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeOptionValue(optIndex, valIndex)}
                                                            aria-label={`Remove ${val.value} value`}
                                                        >
                                                            <TrashIcon className="w-4 h-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => addOptionValue(optIndex)} 
                                                className="text-sm text-indigo-500 hover:underline"
                                            >
                                                + Add Value
                                            </Button>
                                        </div>
                                    ))}
                                    <Button 
                                        variant="secondary" 
                                        styleVariant="outline"
                                        onClick={addOption} 
                                        className="w-full py-2 border-2 border-dashed rounded-lg dark:border-slate-600 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-700/50"
                                    >
                                        + Add Option (e.g., Color, Size)
                                    </Button>
                                </div>
                            )}
                            {activeTab === 'tasks' && productToEdit && onOpenTaskModal && (
                                <AssociatedTasks 
                                    entityType="product"
                                    entityId={productToEdit.id}
                                    allTasks={allTasks}
                                    onAddTask={handleAddTask}
                                    onEditTask={handleEditTask}
                                />
                            )}
                        </main>
                        <footer className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex-shrink-0 flex justify-end gap-3">
                            <Button 
                                variant="secondary" 
                                onClick={onClose} 
                                className="py-2 px-4"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                variant="primary"
                                disabled={isSaving} 
                                className="py-2 px-4 flex items-center justify-center w-24"
                            >
                               {isSaving ? <LoaderIcon className="w-5 h-5" /> : 'Save'}
                            </Button>
                        </footer>
                    </form>
                </div>
            </div>
            <MediaLibraryModal isOpen={isMediaLibraryOpen} onClose={() => setIsMediaLibraryOpen(false)} mediaFiles={mediaLibrary} onSelectFile={handleSelectFile} onUploadFile={onUploadFile} />
        </>
    );
};

export default AddEditProductModal;
