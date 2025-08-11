
import React, { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { ManagedPage, SeoReport as SeoReportType, Task } from '../types';
import * as seoService from '../services/seoService';
import * as geminiService from '../services/geminiService';
import * as pageService from '../services/pageService';
import LoaderIcon from './icons/LoaderIcon';
import SparklesIcon from './icons/SparklesIcon';
import TrashIcon from './icons/TrashIcon';
import SeoReportDetailModal from './SeoReportDetailModal';

interface SeoReportProps {
    session: Session;
    pages: ManagedPage[];
    seoReports: SeoReportType[];
    onRefresh: () => void;
    allTasks: Task[];
    onOpenTaskModal: (task: Task | null, initialLink: any) => void;
}

const SeoReport: React.FC<SeoReportProps> = ({ session, pages, seoReports, onRefresh, allTasks, onOpenTaskModal }) => {
    const [selectedPageId, setSelectedPageId] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [viewingReport, setViewingReport] = useState<SeoReportType | null>(null);

    const reportsWithNames = seoReports.map(r => {
        const page = pages.find(p => p.id === r.page_id);
        return { ...r, pageName: page?.name || 'Unknown Page' };
    });

    useEffect(() => {
        if (pages.length > 0 && !selectedPageId) {
            setSelectedPageId(pages[0].id);
        }
    }, [pages, selectedPageId]);

    const handleGenerateReport = async () => {
        if (!selectedPageId) {
            setError('Please select a page to analyze.');
            return;
        }
        setIsGenerating(true);
        setError(null);
        try {
            const pageToAnalyze = await pageService.getPage(selectedPageId);
            if (!pageToAnalyze || !pageToAnalyze.data) {
                throw new Error("Could not load page data for analysis.");
            }
            const reportData = await geminiService.generateSeoReport(pageToAnalyze.data);
            await seoService.createSeoReport(session.user.id, selectedPageId, reportData.overallScore, reportData);
            onRefresh(); // Refresh the list
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleDeleteReport = async (reportId: string) => {
        if(window.confirm('Are you sure you want to delete this report?')) {
            await seoService.deleteSeoReport(reportId);
            onRefresh();
        }
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md h-full flex flex-col">
            <div className="p-4 border-b dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Generate On-Page SEO Report</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                    <select value={selectedPageId} onChange={e => setSelectedPageId(e.target.value)} className="flex-grow p-2 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600">
                        {pages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <button onClick={handleGenerateReport} disabled={isGenerating || !selectedPageId} className="flex items-center justify-center gap-2 py-2 px-4 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                        {isGenerating ? <LoaderIcon className="w-5 h-5"/> : <SparklesIcon className="w-5 h-5" />}
                        {isGenerating ? 'Analyzing...' : 'Generate Report'}
                    </button>
                </div>
                 {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            </div>
            <div className="p-4 overflow-y-auto flex-grow">
                 <h4 className="text-md font-semibold text-slate-600 dark:text-slate-400 mb-4">Saved Reports</h4>
                 {
                    reportsWithNames.length === 0 ? <p className="text-center text-slate-500">No reports generated yet.</p> : (
                        <ul className="space-y-3">
                            {reportsWithNames.map(report => (
                                <li key={report.id} className="p-3 border dark:border-slate-700 rounded-lg flex justify-between items-center group">
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">{report.pageName}</p>
                                        <p className="text-xs text-slate-500">{new Date(report.created_at).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`font-bold text-xl ${report.score > 75 ? 'text-green-500' : report.score > 50 ? 'text-yellow-500' : 'text-red-500'}`}>{report.score}<span className="text-xs">/100</span></span>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => setViewingReport(report)} className="text-sm font-medium text-indigo-600 hover:underline">View</button>
                                            <button onClick={() => handleDeleteReport(report.id)} className="p-1 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )
                 }
            </div>
            {viewingReport && (
                <SeoReportDetailModal
                    isOpen={!!viewingReport}
                    onClose={() => setViewingReport(null)}
                    report={{...viewingReport, pageName: reportsWithNames.find(r => r.id === viewingReport.id)?.pageName || '...'} }
                    allTasks={allTasks}
                    onOpenTaskModal={onOpenTaskModal}
                />
            )}
        </div>
    );
};

export default SeoReport;