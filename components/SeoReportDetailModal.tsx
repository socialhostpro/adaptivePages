
import React from 'react';
import type { SeoReport, Task } from '../types';
import XIcon from './icons/XIcon';
import AssociatedTasks from './AssociatedTasks';

interface SeoReportDetailModalProps {
    report: SeoReport;
    isOpen: boolean;
    onClose: () => void;
    allTasks: Task[];
    onOpenTaskModal: (task: Task | null, initialLink: any) => void;
}

const DetailCard = ({ title, content }: { title: string, content: string | string[] }) => (
    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
        <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">{title}</h4>
        {Array.isArray(content) ? (
            <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
                {content.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
        ) : (
            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{content}</p>
        )}
    </div>
);

const SeoReportDetailModal: React.FC<SeoReportDetailModalProps> = ({ report, isOpen, onClose, allTasks, onOpenTaskModal }) => {
    if (!isOpen) return null;

    const handleAddTask = () => {
        onOpenTaskModal(null, { type: 'seo_report', id: report.id });
    };

    const handleEditTask = (task: Task) => {
        onOpenTaskModal(task, null);
    };

    const { report_data, score, pageName } = report;

    return (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">SEO Report</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{pageName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                        <XIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                    </button>
                </header>
                <main className="p-6 overflow-y-auto space-y-6">
                    <div className="text-center">
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Overall Score</p>
                        <p className={`text-6xl font-extrabold ${score > 75 ? 'text-green-500' : score > 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {score}
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <DetailCard title="Title Feedback" content={report_data.titleFeedback} />
                        <DetailCard title="Meta Description Feedback" content={report_data.metaDescriptionFeedback} />
                        <DetailCard title="Content Feedback" content={report_data.contentFeedback} />
                        <DetailCard title="Recommendations" content={report_data.recommendations} />
                    </div>

                    <AssociatedTasks
                        entityType="seo_report"
                        entityId={report.id}
                        allTasks={allTasks}
                        onAddTask={handleAddTask}
                        onEditTask={handleEditTask}
                    />

                </main>
            </div>
        </div>
    );
};

export default SeoReportDetailModal;