import React from 'react';
import type { CourseChapter, LandingPageTheme } from '../types';
import XIcon from './icons/XIcon';
import QuizComponent from './QuizComponent';
import * as analyticsService from '../services/analyticsService';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: CourseChapter;
  theme: LandingPageTheme;
  onQuizPassed: () => void;
  progress: Record<string, 'completed'>;
  pageId: string;
  userId: string;
}

const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, chapter, theme, onQuizPassed, progress, pageId, userId }) => {
    if (!isOpen || !chapter.quiz) return null;
    
    const isCompleted = progress[chapter.id] === 'completed';

    const handleAttempt = (score: number, totalQuestions: number, passed: boolean) => {
        if (userId && pageId) {
            analyticsService.logQuizAttempt(userId, pageId, chapter.id, chapter.quiz!.title, score, totalQuestions, passed);
        }
        if (passed) {
            onQuizPassed();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[103] flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border dark:border-slate-700"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200">
                        {chapter.quiz.title} - {chapter.title}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>
                <div className="p-6 overflow-y-auto">
                    <QuizComponent
                        quiz={chapter.quiz}
                        theme={theme}
                        isCompleted={isCompleted}
                        onAttempt={handleAttempt}
                    />
                </div>
            </div>
        </div>
    );
};

export default QuizModal;
