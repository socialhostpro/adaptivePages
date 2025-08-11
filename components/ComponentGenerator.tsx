
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { SiteComponent } from '../src/types';
import { SECTIONS, SECTION_CATEGORIES } from '../constants';
import * as componentService from '../services/componentService';
import { generateNewSection } from '../services/geminiService';
import LoaderIcon from './icons/LoaderIcon';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import EditIcon from './icons/EditIcon';
import XIcon from './icons/XIcon';
import SparklesIcon from './icons/SparklesIcon';

interface AddEditComponentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<SiteComponent, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
    componentToEdit: SiteComponent | null;
}

const AddEditComponentModal: React.FC<AddEditComponentModalProps> = ({ isOpen, onClose, onSave, componentToEdit }) => {
    const [name, setName] = useState('');
    const [sectionType, setSectionType] = useState('hero');
    const [keywords, setKeywords] = useState('');
    const [tags, setTags] = useState('');
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (componentToEdit) {
            setName(componentToEdit.name);
            setSectionType(componentToEdit.section_type);
            setKeywords((componentToEdit.keywords || []).join(', '));
            setTags((componentToEdit.tags || []).join(', '));
            setPrompt(''); // Don't pre-fill prompt for edits
        } else {
            setName('');
            setSectionType('hero');
            setKeywords('');
            setTags('');
            setPrompt('');
        }
    }, [componentToEdit, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsGenerating(true);
        try {
            // Re-use the existing AI function for generating a single section
            const sectionData = await generateNewSection(prompt, "Professional", "Vibrant & Energetic", "General Business", sectionType);
            
            const componentData: Omit<SiteComponent, 'id' | 'user_id' | 'created_at'> = {
                name,
                section_type: sectionType,
                keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                data: sectionData,
            };
            await onSave(componentData);
            onClose();
        } catch (error) {
            console.error("Failed to generate component data:", error);
            alert("AI generation failed. Please check your prompt and try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[101] flex items-center justify-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">{componentToEdit ? 'Edit Component' : 'Create New Component'}</h2>
                    <button type="button" onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </header>
                <main className="p-6 space-y-4 overflow-y-auto">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Create reusable page sections. The AI will learn from your components to build better pages in the future.</p>
                    <div><label className="font-semibold">Component Name</label><input value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 mt-1 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600"/></div>
                    <div><label className="font-semibold">Section Type</label>
                        <select value={sectionType} onChange={e => setSectionType(e.target.value)} required className="w-full p-2 mt-1 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600">
                            {Object.entries(SECTIONS).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                        </select>
                    </div>
                     <div><label className="font-semibold">Keywords</label><input value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="Comma-separated, e.g., modern, tech, clean" className="w-full p-2 mt-1 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600"/></div>
                     <div><label className="font-semibold">Tags</label><input value={tags} onChange={e => setTags(e.target.value)} placeholder="Comma-separated, e.g., saas, startup" className="w-full p-2 mt-1 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600"/></div>
                      <div><label className="font-semibold">AI Generation Prompt</label><textarea value={prompt} onChange={e => setPrompt(e.target.value)} required placeholder={`Describe the ${sectionType} section you want to create...`} rows={4} className="w-full p-2 mt-1 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600"/></div>
                </main>
                <footer className="p-4 bg-slate-50 dark:bg-slate-700/50 border-t dark:border-slate-700 flex justify-end">
                    <button type="submit" disabled={isGenerating} className="py-2 px-4 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center w-48">
                        {isGenerating ? <LoaderIcon className="w-5 h-5"/> : <><SparklesIcon className="w-5 h-5 mr-2"/> Generate & Save</>}
                    </button>
                </footer>
            </form>
        </div>
    );
};


interface ComponentGeneratorProps {
    session: Session;
}

const ComponentGenerator: React.FC<ComponentGeneratorProps> = ({ session }) => {
    const [components, setComponents] = useState<SiteComponent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingComponent, setEditingComponent] = useState<SiteComponent | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await componentService.getComponents(session.user.id);
            setComponents(data);
        } catch (error) {
            console.error("Failed to load components", error);
        } finally {
            setIsLoading(false);
        }
    }, [session.user.id]);

    useEffect(() => {
        loadData();
    }, [loadData]);
    
    const handleSave = async (componentData: Omit<SiteComponent, 'id' | 'user_id' | 'created_at'>) => {
        // Since we are always generating new content, we don't support editing the data blob yet.
        // We will just create a new one.
        await componentService.createComponent(session.user.id, componentData);
        await loadData();
    };

    const handleDelete = async (componentId: string) => {
        if (window.confirm("Are you sure you want to delete this component?")) {
            await componentService.deleteComponent(componentId);
            await loadData();
        }
    };
    
    const groupedComponents = useMemo(() => {
        return components.reduce((acc, component) => {
            const type = component.section_type;
            if (!acc[type]) acc[type] = [];
            acc[type].push(component);
            return acc;
        }, {} as Record<string, SiteComponent[]>);
    }, [components]);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md h-full flex flex-col">
            <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Component Generator</h3>
                <button
                    onClick={() => { setEditingComponent(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 py-2 px-4 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <PlusIcon className="w-5 h-5"/> Create Component
                </button>
            </div>

            <div className="p-4 overflow-y-auto">
                {isLoading ? <LoaderIcon className="w-8 h-8 mx-auto mt-10" /> : (
                    Object.keys(groupedComponents).length === 0 ? (
                        <p className="text-center text-slate-500">No components created yet.</p>
                    ) : (
                       <div className="space-y-6">
                            {Object.entries(groupedComponents).map(([sectionType, comps]) => (
                                <div key={sectionType}>
                                    <h4 className="text-base font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">{SECTIONS[sectionType] || sectionType}</h4>
                                    <ul className="space-y-2">
                                        {comps.map(comp => (
                                            <li key={comp.id} className="p-3 border dark:border-slate-700 rounded-lg flex justify-between items-center group">
                                                <div>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-200">{comp.name}</p>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {(comp.keywords || []).map(k => <span key={k} className="text-xs bg-slate-200 dark:bg-slate-600 px-1.5 py-0.5 rounded">{k}</span>)}
                                                    </div>
                                                </div>
                                                 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleDelete(comp.id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full text-red-500"><TrashIcon className="w-4 h-4"/></button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                       </div>
                    )
                )}
            </div>

            <AddEditComponentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                componentToEdit={editingComponent}
            />
        </div>
    );
};

export default ComponentGenerator;