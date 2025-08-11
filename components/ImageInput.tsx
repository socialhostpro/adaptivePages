
import React from 'react';
import SparklesIcon from './icons/SparklesIcon';
import ImageIcon from './icons/ImageIcon';

interface ImageInputProps {
    value: string; // The prompt or URL from the DB
    imageUrl?: string; // The actual rendered image URL (base64 or storage url)
    onChange: (newValue: string) => void;
    onSelectFromLibrary: () => void;
}

const ImageInput: React.FC<ImageInputProps> = ({ value, imageUrl, onChange, onSelectFromLibrary }) => {
    const isUrl = value?.startsWith('http') || value?.startsWith('data:image');

    const switchToPrompt = () => {
        onChange(''); // This sets `value` to an empty prompt string
    };

    if (isUrl) {
        // Case 1: The value is a URL from the media library.
        return (
            <div className="p-3 border dark:border-slate-600 rounded-lg space-y-2 bg-slate-50 dark:bg-slate-700/30">
                 <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Image</label>
                 <div className="flex items-center gap-3">
                    <div className="w-24 h-24 bg-slate-200 dark:bg-slate-600 rounded-md flex items-center justify-center flex-shrink-0">
                       <img src={value} alt="Preview" className="w-full h-full object-cover rounded-md"/>
                    </div>
                     <div className="flex-grow space-y-2">
                        <button type="button" onClick={onSelectFromLibrary} className="text-sm w-full text-center py-2 border dark:border-slate-500 rounded-md bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                            Change Image...
                        </button>
                         <button type="button" onClick={switchToPrompt} className="text-xs w-full flex items-center justify-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline">
                            <SparklesIcon className="w-4 h-4" /> Use AI Prompt Instead
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Case 2: The value is a prompt (or empty).
    return (
        <div className="p-3 border dark:border-slate-600 rounded-lg space-y-2 bg-slate-50 dark:bg-slate-700/30">
            <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Image</label>
            {imageUrl && (
                 <div className="w-full h-24 bg-slate-200 dark:bg-slate-600 rounded-md flex items-center justify-center overflow-hidden">
                    <img src={imageUrl} alt="AI Generated Preview" className="w-full h-full object-cover"/>
                 </div>
            )}
            <textarea 
                value={value}
                onChange={e => onChange(e.target.value)}
                rows={3} 
                placeholder="Describe the image you want the AI to generate..."
                className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"
            />
            <button type="button" onClick={onSelectFromLibrary} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                Or, select from Media Library
            </button>
        </div>
    );
};

export default ImageInput;
