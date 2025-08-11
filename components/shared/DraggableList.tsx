import React, { useState } from 'react';

const DraggableList = ({ items, onUpdate, renderItem }: { items: any[], onUpdate: (newItems: any[]) => void, renderItem: (item: any, index: number) => React.ReactNode }) => {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const onDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        
        const newItems = [...items];
        const [draggedItem] = newItems.splice(draggedIndex, 1);
        newItems.splice(index, 0, draggedItem);
        
        setDraggedIndex(index);
        onUpdate(newItems);
    };

    const onDragEnd = () => {
        setDraggedIndex(null);
    };

    return (
        <div className="space-y-2">
            {items.map((item, index) => (
                <div 
                    key={index}
                    draggable
                    onDragStart={(e) => onDragStart(e, index)}
                    onDragOver={(e) => onDragOver(e, index)}
                    onDragEnd={onDragEnd}
                    className={`p-3 border border-slate-200 dark:border-slate-700 rounded-lg space-y-2 bg-white dark:bg-slate-800 shadow-sm ${draggedIndex === index ? 'opacity-50' : ''}`}
                >
                    {renderItem(item, index)}
                </div>
            ))}
        </div>
    );
};

export default DraggableList;