

import React, { useState, useMemo, useCallback } from 'react';
import type { ProductCategory } from '../src/types';
import * as categoryService from '../services/categoryService';
import LoaderIcon from './icons/LoaderIcon';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';
import PlusIcon from './icons/PlusIcon';
import DragHandleIcon from './icons/DragHandleIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import { TablesInsert, TablesUpdate } from '../database.types';

interface CategoryNodeProps {
    node: ProductCategory;
    level: number;
    onUpdate: (id: string, name: string) => void;
    onDelete: (id: string) => void;
    onAddSubcategory: (parentId: string) => void;
    handleDragStart: (e: React.DragEvent, id: string) => void;
    handleDragOver: (e: React.DragEvent, id: string) => void;
    handleDragEnd: () => void;
    handleDrop: (e: React.DragEvent, targetId: string) => void;
    handleDragEnter: (e: React.DragEvent, targetId: string) => void;
    dropTargetId: string | null;
}

const CategoryTreeNode: React.FC<CategoryNodeProps> = (props) => {
    const { node, level, onUpdate, onDelete, onAddSubcategory, handleDragStart, handleDragOver, handleDragEnd, handleDrop, handleDragEnter, dropTargetId } = props;
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(node.name);
    const [isExpanded, setIsExpanded] = useState(true);

    const handleSave = () => {
        if (name.trim() && name.trim() !== node.name) {
            onUpdate(node.id, name.trim());
        }
        setIsEditing(false);
    };
    
    const isOver = dropTargetId === node.id;

    return (
        <div>
            <div
                draggable
                onDragStart={(e) => handleDragStart(e, node.id)}
                onDragOver={(e) => { e.preventDefault(); handleDragOver(e, node.id); }}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, node.id)}
                onDragEnter={(e) => handleDragEnter(e, node.id)}
                className={`flex items-center gap-2 p-2 rounded-md group hover:bg-slate-100 dark:hover:bg-slate-700/50 ${isOver ? 'bg-indigo-100 dark:bg-indigo-900/50' : ''}`}
                style={{ marginLeft: `${level * 24}px` }}
            >
                <DragHandleIcon className="w-5 h-5 text-slate-400 cursor-grab active:cursor-grabbing flex-shrink-0" />
                 <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600" disabled={!node.children || node.children.length === 0}>
                    <ChevronRightIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : 'rotate-0'}`} />
                </button>
                {isEditing ? (
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        autoFocus
                        className="flex-grow p-1 border rounded bg-white dark:bg-slate-600"
                    />
                ) : (
                    <span className="flex-grow text-slate-800 dark:text-slate-200">{node.name}</span>
                )}
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onAddSubcategory(node.id)} title="Add subcategory" className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"><PlusIcon className="w-4 h-4"/></button>
                    <button onClick={() => setIsEditing(true)} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"><EditIcon className="w-4 h-4"/></button>
                    <button onClick={() => onDelete(node.id)} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"><TrashIcon className="w-4 h-4 text-red-500"/></button>
                </div>
            </div>
             {isExpanded && node.children && (
                 <div className="border-l-2 border-slate-200 dark:border-slate-700">
                    {node.children.map(child => <CategoryTreeNode 
                        {...props}
                        key={child.id} 
                        node={child} 
                        level={level + 1}
                     />)}
                </div>
             )}
        </div>
    );
};


interface CategoryManagementProps {
    userId: string;
    categories: ProductCategory[];
    onUpdate: () => void;
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({ userId, categories, onUpdate }) => {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [dropTargetId, setDropTargetId] = useState<string | null>(null);

    const categoryTree = useMemo(() => {
        const map = new Map(categories.map(c => [c.id, { ...c, children: [] as ProductCategory[] }]));
        const roots: ProductCategory[] = [];
        categories.forEach(c => {
            const node = map.get(c.id)!;
            if (c.parent_id && map.has(c.parent_id)) {
                map.get(c.parent_id)!.children.push(node);
            } else {
                roots.push(node);
            }
        });
        const sortNodes = (nodes: ProductCategory[]) => {
            nodes.sort((a, b) => a.position - b.position);
            nodes.forEach(n => n.children && sortNodes(n.children));
            return nodes;
        };
        return sortNodes(roots);
    }, [categories]);

    const handleAddCategory = async (parentId: string | null = null) => {
        const name = parentId ? 'New Subcategory' : newCategoryName.trim();
        if (!name) return;

        await categoryService.createCategory(userId, name, parentId, 999);
        setNewCategoryName('');
        onUpdate();
    };

    const handleUpdateCategory = async (id: string, name: string) => {
        await categoryService.updateCategory(id, name);
        onUpdate();
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category? Any children will be moved to its parent.')) return;
        await categoryService.deleteCategory(id);
        onUpdate();
    };
    
    // --- Drag and Drop Logic ---
    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.effectAllowed = 'move';
        setDraggedId(id);
    };

    const handleDragEnd = () => {
        setDraggedId(null);
        setDropTargetId(null);
    };

    const handleDragEnter = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (targetId !== draggedId) {
            setDropTargetId(targetId);
        }
    };
    
    const handleDrop = async (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!draggedId || draggedId === targetId) return;

        const flatCategories = categories;
        const draggedItem = flatCategories.find(c => c.id === draggedId)!;
        const targetItem = flatCategories.find(c => c.id === targetId)!;

        const targetRect = (e.target as HTMLElement).closest('div.flex.items-center')?.getBoundingClientRect();
        const dropPosition = targetRect ? (e.clientY - targetRect.top) / targetRect.height : 0.5; // 0-1, top to bottom
 
        let newParentId = targetItem.parent_id;
        let newPosition = targetItem.position;
 
        if (dropPosition < 0.25) { // Drop above target
            newPosition = targetItem.position;
        } else if (dropPosition > 0.75) { // Drop below target
            newPosition = targetItem.position + 1;
        } else { // Drop onto target (make child)
            newParentId = targetItem.id;
            newPosition = (targetItem.children?.length || 0) + 1;
        }
 
        // Adjust position if moving within the same parent
        if (draggedItem.parent_id === newParentId && draggedItem.position < newPosition) {
             newPosition -= 1;
        }

        const siblings = flatCategories.filter(c => c.parent_id === newParentId && c.id !== draggedId);
        siblings.splice(newPosition, 0, draggedItem);
        
        const updates: TablesUpdate<'product_categories'>[] = siblings.map((c, index) => ({
            id: c.id,
            parent_id: newParentId,
            position: index,
        }));
        
        // If the dragged item is not in updates, it means it was dropped into an empty parent
        // or its position was the only thing that changed. We need to ensure its update is included.
        const draggedItemUpdate = updates.find(u => u.id === draggedId);
        if(!draggedItemUpdate) {
             updates.push({ id: draggedId, parent_id: newParentId, position: newPosition });
        } else {
            draggedItemUpdate.parent_id = newParentId;
            draggedItemUpdate.position = siblings.findIndex(s => s.id === draggedId);
        }
        
        await categoryService.updateCategoryOrderAndParent(updates);
        onUpdate();
        handleDragEnd();
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md h-full flex flex-col">
             <div className="p-4 border-b dark:border-slate-700">
                <form onSubmit={(e) => { e.preventDefault(); handleAddCategory(null); }} className="flex gap-2">
                    <input
                        type="text"
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        placeholder="Add a new top-level category..."
                        className="flex-grow p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm bg-white dark:bg-slate-700"
                    />
                    <button type="submit" className="py-2 px-4 rounded-md font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700">Add</button>
                </form>
            </div>
            <div className="p-4 overflow-y-auto flex-grow">
                {categoryTree.length === 0 ? (
                    <p className="text-center text-slate-500">No categories created yet.</p>
                ) : (
                    categoryTree.map(node => (
                        <CategoryTreeNode 
                            key={node.id} 
                            node={node} 
                            level={0}
                            onUpdate={handleUpdateCategory} 
                            onDelete={handleDeleteCategory}
                            onAddSubcategory={handleAddCategory}
                            handleDragStart={handleDragStart}
                            handleDragOver={(e) => e.preventDefault()}
                            handleDragEnd={handleDragEnd}
                            handleDrop={handleDrop}
                            handleDragEnter={handleDragEnter}
                            dropTargetId={dropTargetId}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default CategoryManagement;