

import React, { useState, useEffect, useMemo } from 'react';
import type { CourseSectionData, LandingPageTheme, ImageStore, CourseChapter, CourseLesson } from '../src/types';
import * as analyticsService from '../services/analyticsService';
import XIcon from './icons/XIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import CertificateComponent from './CertificateComponent';
import AwardIcon from './icons/AwardIcon';
import DownloadIcon from './icons/DownloadIcon';
import ListOrderedIcon from './icons/ListOrderedIcon';
import PlayCircleIcon from './icons/PlayCircleIcon';
import LockIcon from './icons/LockIcon';
import CheckCircle2Icon from './icons/CheckCircle2Icon';
import EmbedHandler from './shared/EmbedHandler';


export interface LessonViewerModalProps {
  course: CourseSectionData;
  theme: LandingPageTheme;
  images: ImageStore;
  initialLessonIndex: number;
  progress: Record<string, 'completed'>;
  onClose: () => void;
  onCompleteLesson: (lessonId: string) => void;
  onNavigate: (newIndex: number) => void;
  pageId: string;
  userId: string;
}

export const LessonViewerModal: React.FC<LessonViewerModalProps> = ({
  course,
  theme,
  images,
  initialLessonIndex,
  progress,
  onClose,
  onCompleteLesson,
  onNavigate,
  pageId,
  userId,
}) => {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(initialLessonIndex);
  const [showCertificate, setShowCertificate] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  const allLessons = useMemo(() => course.chapters.flatMap(c => c.lessons), [course.chapters]);
  const lesson = allLessons[currentLessonIndex];
  const totalLessons = allLessons.length;
  
  const currentChapter = useMemo(() => {
    let lessonCount = 0;
    for (const chapter of course.chapters) {
      if (currentLessonIndex < lessonCount + chapter.lessons.length) {
        return chapter;
      }
      lessonCount += chapter.lessons.length;
    }
    return course.chapters[0];
  }, [currentLessonIndex, course.chapters]);

  useEffect(() => {
    if (currentChapter) {
        setExpandedChapters(prev => ({ ...prev, [currentChapter.id]: true }));
    }
    // Log lesson view for analytics
    if (userId && pageId && lesson) {
      analyticsService.logLessonView(userId, pageId, lesson.id, lesson.title);
    }
  }, [currentChapter, userId, pageId, lesson]);


  const isCompleted = progress[lesson.id] === 'completed';
  const completedLessonsCount = Object.keys(progress).filter(key => key.startsWith('l-')).length;
  const courseProgressPercentage = totalLessons > 0 ? (completedLessonsCount / totalLessons) * 100 : 0;
  
  const allLessonsInChapterCompleted = useMemo(() => {
    if (!currentChapter) return false;
    return currentChapter.lessons.every(l => progress[l.id] === 'completed');
  }, [currentChapter, progress]);

  const allLessonsCompleted = totalLessons > 0 && completedLessonsCount === totalLessons;

  useEffect(() => {
    setCurrentLessonIndex(initialLessonIndex);
  }, [initialLessonIndex]);

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? currentLessonIndex - 1 : currentLessonIndex + 1;
    if (newIndex >= 0 && newIndex < totalLessons) {
      setCurrentLessonIndex(newIndex);
      onNavigate(newIndex);
    }
  };
  
  const handleLessonClick = (lessonId: string) => {
    const index = allLessons.findIndex(l => l.id === lessonId);
    if (index !== -1) {
      const globalLessonIndex = allLessons.findIndex(gl => gl.id === lessonId);
      const previousLesson = globalLessonIndex > 0 ? allLessons[globalLessonIndex - 1] : null;
      const isSequentiallyLocked = course.enforceSequence && previousLesson && !progress[previousLesson.id];
      
      // Payment gate: only first lesson (index 0) is free
      const isPaymentLocked = globalLessonIndex > 0; // Lock all lessons except the first one

      if (!isSequentiallyLocked && !isPaymentLocked) {
        setCurrentLessonIndex(index);
        onNavigate(index);
      }
    }
  };

  if (showCertificate) {
    return (
       <CertificateComponent
            courseName={course.title}
            providerName={course.courseProviderName}
            certificateTitle={course.certificateTitle}
            studentName={studentName}
            onClose={() => {
              setShowCertificate(false);
              onClose();
            }}
        />
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[102] flex items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 w-full h-full md:rounded-2xl md:shadow-2xl md:max-w-7xl md:h-[90vh] flex flex-row overflow-hidden md:border dark:border-slate-700"
        onClick={e => e.stopPropagation()}
      >
        {/* Main Content */}
        <div className="w-2/3 flex-shrink-0 bg-black flex flex-col min-h-0">
          <header className="p-3 border-b border-slate-700 flex justify-between items-center flex-shrink-0 bg-white dark:bg-slate-900">
            <h2 className="text-lg font-bold text-gray-800 dark:text-slate-200 truncate mx-4">{course.title}</h2>
            <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700">
                <XIcon className="w-6 h-6" />
            </button>
          </header>
          
          <div className="flex-grow flex flex-col min-h-0">
            <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-white dark:bg-slate-900">
              <h1 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white">{lesson.title}</h1>
              <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg [&_iframe]:w-full [&_iframe]:h-full">
                {currentLessonIndex === 0 ? (
                  // Free first lesson
                  lesson.videoSource === 'embed' && lesson.videoEmbedCode ? (
                      <EmbedHandler embedCode={lesson.videoEmbedCode} />
                  ) : (
                      <iframe
                          key={lesson.id}
                          src={`https://www.youtube.com/embed/${lesson.youtubeVideoId}?rel=0&showinfo=0&modestbranding=1&autoplay=1&mute=1`}
                          title={lesson.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                      ></iframe>
                  )
                ) : (
                  // Payment gate for all other lessons
                  <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex flex-col items-center justify-center text-center p-8">
                    <LockIcon className="w-16 h-16 text-slate-400 mb-4" />
                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Premium Content</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Unlock this lesson and all other premium content to continue your learning journey.</p>
                    <button className={`px-6 py-3 bg-${theme.primaryColorName}-600 hover:bg-${theme.primaryColorName}-700 text-white font-semibold rounded-lg transition-colors`}>
                      Upgrade to Premium
                    </button>
                  </div>
                )}
              </div>
              <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">About this lesson</h3>
                  <p className="mt-2 text-gray-600 dark:text-slate-300">{lesson.description}</p>
              </div>
              <div className="flex items-center gap-4 pt-4">
                {lesson.worksheetUrl && (
                    <a 
                        href={lesson.worksheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-${theme.primaryColorName}-600 hover:bg-${theme.primaryColorName}-700 rounded-lg`}
                    >
                        <DownloadIcon className="w-4 h-4" />
                        Download Worksheet
                    </a>
                )}
                <button
                    onClick={() => {
                        onCompleteLesson(lesson.id);
                        if (allLessonsCompleted) {
                            setShowCertificate(true);
                        }
                    }}
                    disabled={isCompleted}
                    className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white rounded-lg ${
                        isCompleted
                            ? 'bg-green-600 cursor-not-allowed'
                            : `bg-${theme.primaryColorName}-600 hover:bg-${theme.primaryColorName}-700`
                    }`}
                >
                    <CheckCircle2Icon className="w-5 h-5" />
                    {isCompleted ? 'Completed' : 'Mark as Complete'}
                </button>
              </div>
            </div>
            
            {/* Navigation Controls */}
            <div className="flex-shrink-0 p-4 border-t dark:border-slate-700 bg-white dark:bg-slate-900">
              <div className="flex justify-between items-center">
                <button
                    onClick={() => handleNavigate('prev')}
                    disabled={currentLessonIndex === 0}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg ${
                        currentLessonIndex === 0
                            ? 'text-gray-400 cursor-not-allowed'
                            : `text-${theme.primaryColorName}-600 hover:bg-${theme.primaryColorName}-50 dark:hover:bg-${theme.primaryColorName}-900/20`
                    }`}
                >
                    <ChevronLeftIcon className="w-4 h-4" />
                    Previous
                </button>
                <span className="text-sm text-gray-500 dark:text-slate-400">
                    {currentLessonIndex + 1} of {totalLessons}
                </span>
                <button
                    onClick={() => handleNavigate('next')}
                    disabled={currentLessonIndex === totalLessons - 1 || currentLessonIndex + 1 > 0}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg ${
                        currentLessonIndex === totalLessons - 1 || currentLessonIndex + 1 > 0
                            ? 'text-gray-400 cursor-not-allowed'
                            : `text-${theme.primaryColorName}-600 hover:bg-${theme.primaryColorName}-50 dark:hover:bg-${theme.primaryColorName}-900/20`
                    }`}
                >
                    Next
                    <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-1/3 p-6 flex flex-col space-y-4 border-l dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 overflow-y-auto">
          {lesson.imagePrompt && images[`lesson_${lesson.id}`] && (
                <div className="w-24 h-24 mx-auto mb-2 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                    <img src={images[`lesson_${lesson.id}`]} alt={lesson.title} className="w-full h-full object-cover" />
                </div>
          )}
          <div className="flex-shrink-0">
            <h3 className="flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-slate-200"><ListOrderedIcon className="w-6 h-6"/>Course Content</h3>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className={`bg-${theme.primaryColorName}-600 h-2.5 rounded-full`} style={{ width: `${courseProgressPercentage}%` }}></div>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{completedLessonsCount} / {totalLessons} lessons completed</p>
          </div>

          <div className="flex-grow space-y-2">
            {course.chapters.map((chapter) => {
                const isExpanded = expandedChapters[chapter.id];
                const lessonsInChapter = chapter.lessons.length;
                const completedInChapter = chapter.lessons.filter(l => progress[l.id]).length;

                return (
                    <div key={chapter.id}>
                        <button onClick={() => setExpandedChapters(p => ({...p, [chapter.id]: !p[chapter.id]}))} className="w-full text-left p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-slate-200">{chapter.title}</h4>
                                <p className="text-xs text-gray-500 dark:text-slate-400">{completedInChapter} / {lessonsInChapter} complete</p>
                            </div>
                            <ChevronRightIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                        {isExpanded && (
                            <ul className="pl-4 mt-1 space-y-1">
                                {chapter.lessons.map(l => {
                                    const isCurrent = l.id === lesson.id;
                                    const isLessonCompleted = !!progress[l.id];
                                    
                                    const globalLessonIndex = allLessons.findIndex(gl => gl.id === l.id);
                                    const previousLesson = globalLessonIndex > 0 ? allLessons[globalLessonIndex - 1] : null;
                                    const isSequentiallyLocked = course.enforceSequence && previousLesson && !progress[previousLesson.id];
                                    
                                    // Payment gate: only first lesson (index 0) is free
                                    const isPaymentLocked = globalLessonIndex > 0;

                                    const isLocked = isSequentiallyLocked || isPaymentLocked;
                                    const isClickable = !isLocked;

                                    const Icon = isLessonCompleted ? CheckCircle2Icon : isLocked ? LockIcon : PlayCircleIcon;
                                    const iconColor = isLessonCompleted ? 'text-green-500' : isLocked ? 'text-slate-400' : `text-${theme.primaryColorName}-500`;
                                    
                                    return (
                                        <li key={l.id}>
                                            <button 
                                                onClick={() => isClickable && handleLessonClick(l.id)}
                                                disabled={!isClickable}
                                                className={`w-full flex items-start gap-3 p-2 rounded-md text-left ${isCurrent ? `bg-${theme.primaryColorName}-100 dark:bg-${theme.primaryColorName}-500/20` : 'hover:bg-slate-200 dark:hover:bg-slate-700'} ${!isClickable ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
                                                <div className="flex-grow">
                                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{l.title}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{l.duration}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{l.description}</p>
                                                </div>
                                            </button>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </div>
                )
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonViewerModal;