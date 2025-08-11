import React from 'react';
import { enhanceTextWithAI } from '../services/geminiService';
import SparklesIcon from './icons/SparklesIcon';
import LoaderIcon from './icons/LoaderIcon';

interface EnhancedFormFieldProps {
    label?: string;
    value: string;
    onChange: (newValue: string) => void;
    context: string; // e.g., "Hero section title", "Feature description"
    type?: 'text' | 'textarea';
    rows?: number;
    description?: string;
    placeholder?: string;
}

const EnhancedFormField: React.FC<EnhancedFormFieldProps> = ({
    label,
    value,
    onChange,
    context,
    type = 'text',
    rows = 3,
    description,
    placeholder,
}) => {
    const [isEnhancing, setIsEnhancing] = React.useState(false);

    const handleEnhance = async () => {
        if (!value) return;
        setIsEnhancing(true);
        try {
            const enhancedText = await enhanceTextWithAI(value, context);
            onChange(enhancedText);
        } catch (error) {
            console.error("Enhancement failed:", error);
            // Optionally show an error to the user
        } finally {
            setIsEnhancing(false);
        }
    };
    
    const InputComponent = type === 'textarea' ? 'textarea' : 'input';

    return (
        <div>
            {label && <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">{label}</label>}
            <div className="relative">
                <InputComponent
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    rows={type === 'textarea' ? rows : undefined}
                    placeholder={placeholder}
                    className="w-full p-2 pr-10 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500 transition bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-400"
                />
                {value && (
                    <button
                        type="button"
                        onClick={handleEnhance}
                        disabled={isEnhancing}
                        title="Enhance with AI"
                        className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 rounded-full text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isEnhancing ? (
                            <LoaderIcon className="w-4 h-4" />
                        ) : (
                            <SparklesIcon className="w-4 h-4" />
                        )}
                    </button>
                )}
            </div>
            {description && <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{description}</p>}
        </div>
    );
};

export default EnhancedFormField;
