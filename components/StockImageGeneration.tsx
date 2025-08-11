
import React, { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { generateImageForPrompt, enhanceTextWithAI } from '../services/geminiService';
import { uploadBase64File } from '../services/storageService';
import LoaderIcon from './icons/LoaderIcon';
import SparklesIcon from './icons/SparklesIcon';
import SaveIcon from './icons/SaveIcon';

interface StockImageGenerationProps {
    session: Session;
}

const StockImageGeneration: React.FC<StockImageGenerationProps> = ({ session }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);
        try {
            const imageBytes = await generateImageForPrompt(prompt, '1:1');
            setGeneratedImage(imageBytes);
        } catch (e) {
            setError('Failed to generate image. Please try again.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnhancePrompt = async () => {
        if (!prompt) return;
        try {
            const enhanced = await enhanceTextWithAI(prompt, "an AI image generation prompt");
            setPrompt(enhanced);
        } catch (e) {
            console.error("Failed to enhance prompt", e);
        }
    };
    
    const handleSave = async () => {
        if (!generatedImage) return;
        setIsSaving(true);
        try {
            const fileName = `${prompt.substring(0, 30).replace(/\s/g, '_')}_${Date.now()}.jpg`;
            await uploadBase64File(session.user.id, generatedImage, fileName, 'image/jpeg');
            alert("Image saved to your Stock Gallery!");
            setGeneratedImage(null);
            setPrompt('');
        } catch (e) {
             setError('Failed to save image.');
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Generate Stock Image</h2>
                <div className="space-y-4">
                    <textarea
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        placeholder="e.g., A minimalist office desk with a laptop and a steaming cup of coffee, morning light..."
                        rows={4}
                        className="w-full p-2 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600"
                    />
                    <div className="flex flex-col sm:flex-row gap-2">
                         <button onClick={handleEnhancePrompt} className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md font-semibold text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 hover:bg-indigo-200 dark:hover:bg-indigo-900">
                            <SparklesIcon className="w-4 h-4" /> Enhance with AI
                        </button>
                        <button onClick={handleGenerate} disabled={isLoading} className="flex-1 flex items-center justify-center py-2 px-4 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                            {isLoading ? <LoaderIcon className="w-5 h-5"/> : 'Generate'}
                        </button>
                    </div>
                </div>
            </div>

            {error && <p className="text-center text-red-500">{error}</p>}
            
            {isLoading && (
                 <div className="flex flex-col items-center justify-center text-center text-slate-500">
                    <LoaderIcon className="w-12 h-12 mb-4" />
                    <p>Generating image... this may take a moment.</p>
                </div>
            )}
            
            {generatedImage && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md text-center">
                    <h3 className="text-lg font-bold mb-4">Generated Image</h3>
                    <img src={`data:image/jpeg;base64,${generatedImage}`} alt={prompt} className="max-w-sm w-full mx-auto rounded-lg shadow-lg"/>
                     <button onClick={handleSave} disabled={isSaving} className="mt-6 flex items-center justify-center mx-auto gap-2 py-2 px-6 rounded-md font-semibold text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400">
                        {isSaving ? <LoaderIcon className="w-5 h-5" /> : <><SaveIcon className="w-5 h-5"/> Save to Stock Gallery</>}
                    </button>
                </div>
            )}
        </div>
    );
};

export default StockImageGeneration;