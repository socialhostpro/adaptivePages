import React from 'react';
import DraggableList from './shared/DraggableList';
import TrashIcon from './icons/TrashIcon';
import DragHandleIcon from './icons/DragHandleIcon';
import PlusIcon from './icons/PlusIcon';
import SparklesIcon from './icons/SparklesIcon';
import FormField from './shared/FormField';

interface ImageGalleryInputProps {
    prompts: string[];
    onChange: (newPrompts: string[]) => void;
}

const ImageGalleryInput: React.FC<ImageGalleryInputProps> = ({ prompts, onChange }) => {
    
    const handlePromptChange = (index: number, value: string) => {
        const newPrompts = [...prompts];
        newPrompts[index] = value;
        onChange(newPrompts);
    };

    const addPrompt = () => {
        onChange([...(prompts || []), 'A new beautiful image']);
    };

    const removePrompt = (index: number) => {
        onChange(prompts.filter((_, i) => i !== index));
    };

    return (
        <FormField label="Slider Image Prompts">
            <div className="space-y-2">
                <DraggableList
                    items={prompts || []}
                    onUpdate={onChange}
                    renderItem={(prompt, index) => (
                        <div className="flex items-center gap-2">
                            <DragHandleIcon className="w-5 h-5 text-gray-400 dark:text-slate-500 cursor-grab active:cursor-grabbing flex-shrink-0" />
                            <textarea
                                value={prompt}
                                onChange={e => handlePromptChange(index, e.target.value)}
                                rows={2}
                                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 text-sm"
                                placeholder="Describe an image for the AI..."
                            />
                            <button type="button" onClick={() => removePrompt(index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                />
                <button
                    type="button"
                    onClick={addPrompt}
                    className="w-full flex items-center justify-center gap-2 text-sm py-2 border-2 border-dashed rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                >
                    <PlusIcon className="w-4 h-4"/> Add Image to Slider
                </button>
            </div>
        </FormField>
    );
};

export default ImageGalleryInput;