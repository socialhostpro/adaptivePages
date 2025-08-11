
import React, { useState } from 'react';
import { generateWan21Prompt, enhanceTextWithAI } from '../services/geminiService';
import LoaderIcon from './icons/LoaderIcon';
import SparklesIcon from './icons/SparklesIcon';
import CopyIcon from './icons/CopyIcon';

const Wan21VideoPromptGenerator: React.FC = () => {
    const [concept, setConcept] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copyStatus, setCopyStatus] = useState(false);

    const handleGenerate = async () => {
        if (!concept) return;
        setIsLoading(true);
        setError(null);
        setGeneratedPrompt(null);
        try {
            const promptText = await generateWan21Prompt(concept);
            setGeneratedPrompt(promptText);
        } catch (e) {
            setError('Failed to generate video prompt. Please try again.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleEnhanceConcept = async () => {
        if (!concept) return;
        try {
            const enhanced = await enhanceTextWithAI(concept, "a concept for a short video");
            setConcept(enhanced);
        } catch (e) {
            console.error("Failed to enhance concept", e);
        }
    };
    
     const handleCopy = () => {
        if (!generatedPrompt) return;
        navigator.clipboard.writeText(generatedPrompt);
        setCopyStatus(true);
        setTimeout(() => setCopyStatus(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Generate wan2.1 Video Prompt</h2>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">Describe a video concept, and the AI will generate a structured text prompt for the wan2.1 video model.</p>
                <div className="space-y-4">
                    <textarea
                        value={concept}
                        onChange={e => setConcept(e.target.value)}
                        placeholder="e.g., A corgi wearing a superhero cape running in slow motion through a field of flowers"
                        rows={4}
                        className="w-full p-2 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600"
                    />
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button onClick={handleEnhanceConcept} className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md font-semibold text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 hover:bg-indigo-200 dark:hover:bg-indigo-900">
                            <SparklesIcon className="w-4 h-4" /> Enhance Concept
                        </button>
                        <button onClick={handleGenerate} disabled={isLoading} className="flex-1 flex items-center justify-center py-2 px-4 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                            {isLoading ? <LoaderIcon className="w-5 h-5"/> : 'Generate Prompt'}
                        </button>
                    </div>
                </div>
            </div>
            
            {error && <p className="text-center text-red-500">{error}</p>}
            
            {isLoading && (
                 <div className="flex flex-col items-center justify-center text-center text-slate-500">
                    <LoaderIcon className="w-12 h-12 mb-4" />
                    <p>Generating prompt...</p>
                </div>
            )}

            {generatedPrompt && (
                <div className="bg-slate-900 p-4 rounded-xl shadow-md">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-slate-200">Generated Text Prompt</h3>
                        <button onClick={handleCopy} className="flex items-center gap-2 text-sm text-slate-300 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-md">
                            <CopyIcon className="w-4 h-4"/> {copyStatus ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                    <pre className="text-xs text-white bg-black/50 p-4 rounded-md overflow-x-auto max-h-96 whitespace-pre-wrap">
                        <code>{generatedPrompt}</code>
                    </pre>
                </div>
            )}
        </div>
    );
};

export default Wan21VideoPromptGenerator;
