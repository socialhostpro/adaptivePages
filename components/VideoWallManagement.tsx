
import React, { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { ManagedPage, LandingPageData, CourseSectionData, MediaFile } from '../types';
import * as pageService from '../services/pageService';
import * as storageService from '../services/storageService';
import CourseForm from './CourseForm';
import VideoAnalytics from './VideoAnalytics';
import LoaderIcon from './icons/LoaderIcon';
import { supabase } from '../services/supabase';

interface VideoWallManagementProps {
    session: Session;
}

const VideoWallManagement: React.FC<VideoWallManagementProps> = ({ session }) => {
    const [activeTab, setActiveTab] = useState('config');
    const [pages, setPages] = useState<ManagedPage[]>([]);
    const [selectedPage, setSelectedPage] = useState<ManagedPage | null>(null);
    const [courseData, setCourseData] = useState<CourseSectionData | null>(null);
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadPages = useCallback(async () => {
        setIsLoading(true);
        const allPages = await pageService.getPages(session.user.id);
        setPages(allPages);
        setIsLoading(false);
    }, [session.user.id]);

    useEffect(() => {
        loadPages();
        storageService.listFiles(session.user.id).then(setMediaFiles);
    }, [loadPages, session.user.id]);

    const handlePageSelect = async (pageId: string) => {
        if (!pageId) {
            setSelectedPage(null);
            setCourseData(null);
            return;
        }
        setIsLoading(true);
        const page = await pageService.getPage(pageId);
        setSelectedPage(page);
        setCourseData(page?.data?.course || null);
        setIsLoading(false);
    };

    const handleSave = async () => {
        if (!selectedPage || !courseData) return;
        
        setIsLoading(true);
        const newPageData: LandingPageData = {
            ...selectedPage.data!,
            course: courseData,
        };
        const newActivePage = { ...selectedPage, data: newPageData };
        await pageService.savePage(newActivePage);
        setSelectedPage(newActivePage); // Update local state to match saved data
        alert("Course configuration saved!");
        setIsLoading(false);
    };
    
    const tabs = [
        { key: 'config', label: "Configuration" },
        { key: 'analytics', label: 'Analytics' },
    ];
    
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
                {activeTab === 'config' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-4 mb-6">
                            <label htmlFor="page-select" className="font-semibold text-slate-700 dark:text-slate-300">Select Page:</label>
                            <select
                                id="page-select"
                                value={selectedPage?.id || ''}
                                onChange={e => handlePageSelect(e.target.value)}
                                className="flex-grow p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm bg-white dark:bg-slate-700"
                            >
                                <option value="">-- Choose a page with a course --</option>
                                {pages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        
                        {isLoading && <div className="flex justify-center p-12"><LoaderIcon className="w-8 h-8"/></div>}
                        
                        {!isLoading && selectedPage && courseData && (
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">
                                <CourseForm
                                    data={courseData}
                                    setData={setCourseData}
                                    images={selectedPage.images || {}}
                                    openMediaLibrary={() => { alert("Media Library access for course banner is managed in the main page editor.") }}
                                />
                                <div className="mt-6 text-right">
                                    <button onClick={handleSave} className="py-2 px-6 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700">Save Changes</button>
                                </div>
                            </div>
                        )}
                        
                        {!isLoading && selectedPage && !courseData && (
                            <div className="text-center p-12 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                <h3 className="text-xl font-semibold">No Course Found</h3>
                                <p className="text-slate-500 mt-2">The selected page does not have a course section. Please add one in the page editor.</p>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'analytics' && (
                    <VideoAnalytics />
                )}
            </div>
        </div>
    )
};

export default VideoWallManagement;
