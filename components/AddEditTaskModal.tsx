
import React, { useState, useEffect, useMemo } from 'react';
import type { Task, TaskStatus, TaskPriority, TaskSubtask, TeamMember, ManagedPage, ManagedOrder, ManagedBooking, ProofingRequest, CrmContact, ManagedProduct, SeoReport, PageGroup } from '../types';
import * as geminiService from '../services/geminiService';
import XIcon from './icons/XIcon';
import LoaderIcon from './icons/LoaderIcon';
import Switch from './shared/Switch';
import SparklesIcon from './icons/SparklesIcon';
import CopyIcon from './icons/CopyIcon';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import DraggableList from './shared/DraggableList';
import DragHandleIcon from './icons/DragHandleIcon';

type LinkableEntityType = 'page' | 'order' | 'booking' | 'proofing_request' | 'contact' | 'product' | 'seo_report' | 'page_group';

interface AddEditTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>, taskId?: string) => Promise<void>;
    taskToEdit: Task | null;
    initialLink?: { type: LinkableEntityType, id: string | number } | null;
    teamMembers: TeamMember[];
    pages: ManagedPage[];
    orders: ManagedOrder[];
    bookings: ManagedBooking[];
    proofingRequests: ProofingRequest[];
    contacts: { id: number, name: string | null }[];
    products: ManagedProduct[];
    seoReports: SeoReport[];
    pageGroups: PageGroup[];
}

const STATUS_OPTIONS: TaskStatus[] = ['To-Do', 'In Progress', 'Done', 'On Hold'];
const PRIORITY_OPTIONS: TaskPriority[] = ['Low', 'Medium', 'High'];

const AddEditTaskModal: React.FC<AddEditTaskModalProps> = (props) => {
    const { 
        isOpen, onClose, onSave, taskToEdit, initialLink, teamMembers, pages, orders, bookings,
        proofingRequests, contacts, products, seoReports, pageGroups
    } = props;
    const [task, setTask] = useState<Partial<Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [linkType, setLinkType] = useState<LinkableEntityType | ''>('');
    const [linkId, setLinkId] = useState<string | number>('');

    useEffect(() => {
        if (isOpen) {
            const initialData = {
                title: taskToEdit?.title || '',
                description: taskToEdit?.description || '',
                due_date: taskToEdit?.due_date || null,
                status: taskToEdit?.status || 'To-Do',
                priority: taskToEdit?.priority || 'Medium',
                assigned_to: taskToEdit?.assigned_to || null,
                is_prompt_mode: taskToEdit?.is_prompt_mode || false,
                prompt: taskToEdit?.prompt || '',
                subtasks: taskToEdit?.subtasks || [],
                page_id: taskToEdit?.page_id,
                order_id: taskToEdit?.order_id,
                booking_id: taskToEdit?.booking_id,
                proofing_request_id: taskToEdit?.proofing_request_id,
                contact_id: taskToEdit?.contact_id,
                product_id: taskToEdit?.product_id,
                seo_report_id: taskToEdit?.seo_report_id,
                page_group_id: taskToEdit?.page_group_id,
            };
            
            if (initialLink && !taskToEdit) {
                const typeKey = `${initialLink.type}_id` as keyof typeof initialData;
                (initialData as any)[typeKey] = initialLink.id;
            }

            setTask(initialData);

            // Set link dropdowns based on existing data or initialLink
            const foundLinkType = (['page', 'order', 'booking', 'proofing_request', 'contact', 'product', 'seo_report', 'page_group'] as const).find(
                type => initialData[`${type}_id` as const] != null
            );

            if (foundLinkType) {
                setLinkType(foundLinkType);
                setLinkId(initialData[`${foundLinkType}_id` as const]!);
            } else {
                setLinkType('');
                setLinkId('');
            }

        }
    }, [isOpen, taskToEdit, initialLink]);

    const handleChange = (field: keyof typeof task, value: any) => {
        setTask(prev => ({ ...prev, [field]: value }));
    };

    const handleLinkTypeChange = (newType: LinkableEntityType | '') => {
        setLinkType(newType);
        setLinkId('');
        // Clear all other link IDs
        const newTask: any = { ...task };
        (['page', 'order', 'booking', 'proofing_request', 'contact', 'product', 'seo_report', 'page_group'] as const).forEach(type => {
            newTask[`${type}_id`] = null;
        });
        setTask(newTask);
    };

    const handleLinkIdChange = (newId: string | number) => {
        setLinkId(newId);
        const newTask: any = { ...task };
        // Clear all link IDs first
        (['page', 'order', 'booking', 'proofing_request', 'contact', 'product', 'seo_report', 'page_group'] as const).forEach(type => {
            newTask[`${type}_id`] = null;
        });
        // Then set the correct one
        if (linkType) {
            (newTask as any)[`${linkType}_id`] = newId;
        }
        setTask(newTask);
    };

    const linkOptions = useMemo(() => {
        switch (linkType) {
            case 'page': return pages.map(p => ({ value: p.id, label: p.name }));
            case 'order': return orders.map(o => ({ value: o.id, label: `Order #${o.id} - ${o.customer.name}` }));
            case 'booking': return bookings.map(b => ({ value: b.id, label: `Booking: ${b.serviceName} - ${new Date(b.bookingDate).toLocaleDateString()}`}));
            case 'proofing_request': return proofingRequests.map(p => ({ value: p.id, label: p.title }));
            case 'contact': return contacts.map(c => ({ value: c.id, label: c.name || 'Unnamed Contact' }));
            case 'product': return products.map(p => ({ value: p.id, label: p.name }));
            case 'seo_report': return seoReports.map(r => ({ value: r.id, label: `SEO Report for ${r.pageName}`}));
            case 'page_group': return pageGroups.map(g => ({ value: g.id, label: g.name }));
            default: return [];
        }
    }, [linkType, pages, orders, bookings, proofingRequests, contacts, products, seoReports, pageGroups]);

    const handleEnhanceDescription = async () => {
        if (!task.description) return;
        setIsEnhancing(true);
        try {
            const { enhancedDescription, subtasks } = await geminiService.enhanceTaskDescription(task.description);
            const newSubtasks = subtasks.map(text => ({ id: `st-${Date.now()}-${Math.random()}`, text, completed: false }));
            setTask(prev => ({
                ...prev,
                description: enhancedDescription,
                subtasks: [...(prev.subtasks || []), ...newSubtasks],
            }));
        } catch (e) {
            alert("Failed to enhance description.");
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleEnhancePrompt = async () => {
        if (!task.prompt) return;
        setIsEnhancing(true);
        try {
            const enhancedPrompt = await geminiService.enhanceTaskPrompt(task.prompt);
            handleChange('prompt', enhancedPrompt);
        } catch (e) {
            alert("Failed to enhance prompt.");
        } finally {
            setIsEnhancing(false);
        }
    };

    const addSubtask = () => {
        const newSubtask = { id: `st-${Date.now()}`, text: '', completed: false };
        handleChange('subtasks', [...(task.subtasks || []), newSubtask]);
    };

    const handleSubtaskUpdate = (index: number, newValues: Partial<TaskSubtask>) => {
        const newSubtasks = [...(task.subtasks || [])];
        newSubtasks[index] = { ...newSubtasks[index], ...newValues };
        handleChange('subtasks', newSubtasks);
    };


    const removeSubtask = (index: number) => {
        const newSubtasks = (task.subtasks || []).filter((_, i) => i !== index);
        handleChange('subtasks', newSubtasks);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!task.title) {
            alert("Title is required.");
            return;
        }
        setIsLoading(true);
        await onSave(task as any, taskToEdit?.id);
        setIsLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[101] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">{taskToEdit ? 'Edit Task' : 'Add Task'}</h2>
                    <button type="button" onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </header>
                <form onSubmit={handleSubmit} className="flex-grow flex flex-col min-h-0">
                    <main className="p-6 space-y-4 overflow-y-auto">
                        <div>
                            <label className="font-semibold">Title</label>
                            <input value={task.title || ''} onChange={e => handleChange('title', e.target.value)} required autoFocus className="w-full p-2 mt-1 border rounded dark:bg-slate-700 dark:border-slate-600"/>
                        </div>
                        
                        <div className="p-3 border rounded-lg dark:border-slate-700 space-y-3">
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">Prompt Mode</span>
                                <Switch enabled={!!task.is_prompt_mode} onChange={v => handleChange('is_prompt_mode', v)} />
                            </label>

                            {task.is_prompt_mode ? (
                                <>
                                    <textarea value={task.prompt || ''} onChange={e => handleChange('prompt', e.target.value)} rows={6} className="w-full p-2 font-mono text-sm border rounded dark:bg-slate-900/50 dark:border-slate-600" placeholder="Enter a prompt for the AI to execute..."/>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => navigator.clipboard.writeText(task.prompt || '')} className="flex-1 text-sm flex items-center justify-center gap-2 py-1.5 px-3 rounded-md bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500"><CopyIcon className="w-4 h-4"/> Copy Prompt</button>
                                        <button type="button" onClick={handleEnhancePrompt} disabled={isEnhancing} className="flex-1 text-sm flex items-center justify-center gap-2 py-1.5 px-3 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900">{isEnhancing ? <LoaderIcon className="w-4 h-4" /> : <SparklesIcon className="w-4 h-4" />} Enhance</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <textarea value={task.description || ''} onChange={e => handleChange('description', e.target.value)} rows={4} className="w-full p-2 mt-1 border rounded dark:bg-slate-700 dark:border-slate-600" placeholder="Describe the task..."/>
                                    <button type="button" onClick={handleEnhanceDescription} disabled={isEnhancing || !task.description} className="w-full text-sm flex items-center justify-center gap-2 py-1.5 px-3 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900 disabled:opacity-50">{isEnhancing ? <LoaderIcon className="w-4 h-4" /> : <SparklesIcon className="w-4 h-4" />} AI Enhance & Create Sub-tasks</button>
                                </>
                            )}
                        </div>

                         <div>
                            <h3 className="font-semibold mb-2">Sub-tasks</h3>
                            <div className="space-y-2">
                                <DraggableList 
                                    items={task.subtasks || []}
                                    onUpdate={(newSubtasks) => handleChange('subtasks', newSubtasks)}
                                    renderItem={(subtask: TaskSubtask, index: number) => (
                                        <div className="flex items-center gap-2">
                                            <DragHandleIcon className="w-5 h-5 text-slate-400 cursor-grab active:cursor-grabbing flex-shrink-0" />
                                            <input 
                                                type="checkbox" 
                                                checked={subtask.completed} 
                                                onChange={e => handleSubtaskUpdate(index, { completed: e.target.checked })} 
                                            />
                                            <input 
                                                value={subtask.text} 
                                                onChange={e => handleSubtaskUpdate(index, { text: e.target.value })} 
                                                className="w-full p-1 border-b dark:border-slate-600 bg-transparent text-sm"
                                            />
                                            <button type="button" onClick={() => removeSubtask(index)}><TrashIcon className="w-4 h-4 text-red-500"/></button>
                                        </div>
                                    )}
                                />
                            </div>
                            <button type="button" onClick={addSubtask} className="mt-2 text-sm flex items-center gap-1 text-indigo-600 hover:underline"><PlusIcon className="w-4 h-4"/> Add Sub-task</button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:border-slate-700">
                             <div>
                                <label className="font-semibold">Due Date</label>
                                <input type="date" value={task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : ''} onChange={e => handleChange('due_date', e.target.value)} className="w-full p-2 mt-1 border rounded dark:bg-slate-700 dark:border-slate-600"/>
                            </div>
                            <div>
                                <label className="font-semibold">Status</label>
                                <select value={task.status} onChange={e => handleChange('status', e.target.value as TaskStatus)} className="w-full p-2 mt-1 border rounded dark:bg-slate-700 dark:border-slate-600">
                                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="font-semibold">Priority</label>
                                <select value={task.priority} onChange={e => handleChange('priority', e.target.value as TaskPriority)} className="w-full p-2 mt-1 border rounded dark:bg-slate-700 dark:border-slate-600">
                                    {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="font-semibold">Assign To</label>
                                <select value={task.assigned_to || ''} onChange={e => handleChange('assigned_to', e.target.value || null)} className="w-full p-2 mt-1 border rounded dark:bg-slate-700 dark:border-slate-600">
                                    <option value="">Unassigned</option>
                                    {teamMembers.map(tm => <option key={tm.id} value={tm.id}>{tm.name}</option>)}
                                </select>
                            </div>
                        </div>

                         <div className="pt-4 border-t dark:border-slate-700">
                            <label className="font-semibold">Link to...</label>
                             <div className="grid grid-cols-2 gap-4 mt-1">
                                <select value={linkType} onChange={e => handleLinkTypeChange(e.target.value as LinkableEntityType | '')} className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600">
                                    <option value="">-- No Link --</option>
                                    <option value="page">Page</option>
                                    <option value="order">Order</option>
                                    <option value="booking">Booking</option>
                                    <option value="proofing_request">Proofing Request</option>
                                    <option value="contact">Contact (Owner)</option>
                                    <option value="product">Product (Stock Item)</option>
                                    <option value="seo_report">SEO Report</option>
                                    <option value="page_group">Page Group</option>
                                </select>
                                {linkType && (
                                    <select value={linkId} onChange={e => handleLinkIdChange(e.target.value)} className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600">
                                        <option value="">-- Select Item --</option>
                                        {linkOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                )}
                            </div>
                        </div>
                    </main>
                    <footer className="p-4 bg-slate-50 dark:bg-slate-700/50 border-t dark:border-slate-700 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-md font-semibold text-sm bg-white dark:bg-slate-600 border dark:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-500">Cancel</button>
                        <button type="submit" disabled={isLoading} className="py-2 px-4 rounded-md font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center w-24">
                            {isLoading ? <LoaderIcon className="w-5 h-5"/> : 'Save'}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default AddEditTaskModal;
