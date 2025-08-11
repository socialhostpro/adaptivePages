
import React, { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import StockGallery from './MediaManagement'; // Reusing the renamed component
import StockImageGeneration from './StockImageGeneration';
import StockVideoGeneration from './StockVideoGeneration';
import Wan21VideoPromptGenerator from './Wan21VideoPromptGenerator';

interface StockManagementProps {
    session: Session;
}

const StockManagement: React.FC<StockManagementProps> = ({ session }) => {
    const [activeTab, setActiveTab] = useState('gallery');

    const tabs = [
        { key: 'gallery', label: "Gallery" },
        { key: 'imageGeneration', label: 'Image Generation' },
        { key: 'videoGeneration', label: 'Veo3 Prompt Gen' },
        { key: 'wan21Generation', label: 'wan2.1 Prompt Gen' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'gallery':
                return <StockGallery session={session} />;
            case 'imageGeneration':
                return <StockImageGeneration session={session} />;
            case 'videoGeneration':
                return <StockVideoGeneration />;
            case 'wan21Generation':
                return <Wan21VideoPromptGenerator />;
            default:
                return null;
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === tab.key
                                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="flex-grow pt-6 min-h-0">
                {renderContent()}
            </div>
        </div>
    );
};

export default StockManagement;