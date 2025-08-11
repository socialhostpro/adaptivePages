
import React, { useState, useMemo } from 'react';
import type { CourseSectionData, LandingPageTheme, CourseChapter, ImageStore, CourseLesson } from '../../src/types';
import RefreshIcon from '../icons/RefreshIcon';
import LoaderIcon from '../icons/LoaderIcon';
import PlayCircleIcon from '../icons/PlayCircleIcon';
import LockIcon from '../icons/LockIcon';
import CheckCircle2Icon from '../icons/CheckCircle2Icon';
import ChevronLeftIcon from '../icons/ChevronLeftIcon';
import ChevronRightIcon from '../icons/ChevronRightIcon';

interface CourseSectionProps {
  section: CourseSectionData;
  theme: LandingPageTheme;
  images: ImageStore;
  onRegenerateImage: (imageKey: string, prompt: string, aspectRatio?: '16:9' | '1:1') => void;
  regeneratingImages: string[];
  hasAccess: boolean;
  onEnroll: (course: CourseSectionData) => void;
  progress: Record<string, 'completed'>;
  onStartLesson: (lessonIndex: number) => void;
  onTakeQuiz: (chapter: CourseChapter) => void;
}

const truncateToFirstSentence = (text: string) => {
  if (!text) return '';
  const firstPeriod = text.indexOf('.');
  const firstQuestion = text.indexOf('?');
  const firstExclamation = text.indexOf('!');
  
  const endings = [firstPeriod, firstQuestion, firstExclamation].filter(i => i !== -1);
  if (endings.length === 0) return text;
  
  const firstEnding = Math.min(...endings);
  return text.substring(0, firstEnding + 1);
};

const CourseSection: React.FC<CourseSectionProps> = ({ section, theme, images, onRegenerateImage, regeneratingImages, hasAccess, onEnroll, progress, onStartLesson, onTakeQuiz }) => {
  const { primaryColorName: primary, textColorName: text } = theme;
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  const chapters = Array.isArray(section.chapters) ? section.chapters : [];
  const activeChapter = chapters[currentChapterIndex];
  const allLessons = useMemo(() => chapters.flatMap(c => c.lessons), [chapters]);

  const totalChapters = chapters.length;
  const completedLessons = useMemo(() => new Set(Object.keys(progress)), [progress]);
  const completedChapters = useMemo(() => chapters.filter(c => c.lessons.every(l => completedLessons.has(l.id))).length, [chapters, completedLessons]);
  
  const isCurrentChapterComplete = useMemo(() => activeChapter && activeChapter.lessons.every(l => completedLessons.has(l.id)), [activeChapter, completedLessons]);
  const isQuizCompleted = activeChapter && progress[activeChapter.id] === 'completed';

  const navigateChapter = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentChapterIndex < totalChapters - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
    } else if (direction === 'prev' && currentChapterIndex > 0) {
      setCurrentChapterIndex(prev => prev - 1);
    }
  };
  
  const bannerImageKey = `chapter_${activeChapter?.id}`;
  const bannerImage = images[bannerImageKey] || images['course_banner'];
  const bannerPrompt = activeChapter?.imagePrompt || section.imagePrompt;
  const isRegeneratingBanner = regeneratingImages.includes(bannerImageKey) || regeneratingImages.includes('course_banner');

  return (
    <section id="course" className={`py-20 px-4 sm:px-6 lg:px-8 ${section.backgroundColor ? `bg-${section.backgroundColor}` : 'bg-white'} ${section.darkBackgroundColor ? `dark:bg-${section.darkBackgroundColor}`: 'dark:bg-gray-900'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
            <h2 className={`text-base font-semibold leading-7 text-${primary}-600 dark:text-${primary}-400`}>Online Course</h2>
            <h3 className={`mt-2 text-4xl font-extrabold tracking-tight text-${text}-900 dark:text-${text}-100`}>{section.title}</h3>
            <p className={`mt-4 max-w-3xl mx-auto text-lg text-${text}-600 dark:text-${text}-300`}>{section.subtitle}</p>
        </div>

        <div className={`mt-12 mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700 flex flex-col`}>
          {/* Media and Navigation */}
          <div className="p-4 sm:p-6">
            <div className="relative group aspect-video">
              {section.mediaType === 'video' ? (
                  <iframe
                      className="w-full h-full rounded-xl shadow-lg"
                      src={`https://www.youtube.com/embed/${section.youtubeVideoId}?rel=0&showinfo=0&modestbranding=1`}
                      title={section.title}
                      frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen>
                  </iframe>
              ) : bannerImage ? (
                  <>
                      <img src={bannerImage} alt={activeChapter?.title || section.title} className="w-full h-full object-cover rounded-xl shadow-lg" />
                      {isRegeneratingBanner ? (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center transition-opacity rounded-xl"><LoaderIcon className="w-12 h-12 text-white" /></div>
                      ) : (
                          <button
                          onClick={() => onRegenerateImage(bannerImageKey, bannerPrompt!, '16:9')}
                          className="absolute top-4 right-4 z-20 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                          aria-label="Regenerate course banner image">
                          <RefreshIcon className="w-6 h-6" />
                          </button>
                      )}
                  </>
              ) : <div className="w-full h-full bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>}
            </div>

            <div className="mt-4 flex justify-between items-center">
              <button onClick={() => navigateChapter('prev')} disabled={currentChapterIndex === 0} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"><ChevronLeftIcon className="w-5 h-5"/></button>
              <div className="text-center">
                  <h4 className={`text-xl font-bold text-${text}-900 dark:text-white truncate`}>{activeChapter?.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Chapter {currentChapterIndex + 1} of {totalChapters} ({completedChapters} complete)</p>
              </div>
              <button onClick={() => navigateChapter('next')} disabled={currentChapterIndex === totalChapters - 1} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"><ChevronRightIcon className="w-5 h-5"/></button>
            </div>
          </div>
          
          {/* Lessons List */}
          <ul className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-1 max-h-96 overflow-y-auto border-t border-slate-200 dark:border-slate-700">
              {(activeChapter?.lessons || []).map((lesson, index) => {
                  const globalLessonIndex = chapters.slice(0, currentChapterIndex).reduce((acc, chap) => acc + (chap.lessons?.length || 0), 0) + index;
                  const previousLesson = globalLessonIndex > 0 ? allLessons[globalLessonIndex - 1] : null;
                  const isSequentiallyLocked = section.enforceSequence && previousLesson && !progress[previousLesson.id];
                  const isLocked = (!lesson.isFreePreview && !hasAccess) || isSequentiallyLocked;
                  const isCompleted = progress[lesson.id] === 'completed';
                  const Icon = isCompleted ? CheckCircle2Icon : isLocked ? LockIcon : PlayCircleIcon;
                  const iconColor = isCompleted ? 'text-green-500' : isLocked ? 'text-slate-400' : `text-${primary}-500`;

                  return (
                      <li key={lesson.id}>
                          <button 
                              onClick={() => !isLocked && onStartLesson(globalLessonIndex)}
                              disabled={isLocked}
                              className={`w-full flex items-start gap-3 p-3 rounded-lg text-left ${isLocked ? 'cursor-not-allowed opacity-60' : `hover:bg-${primary}-50 dark:hover:bg-slate-700/50`}`}
                          >
                              <Icon className={`w-6 h-6 flex-shrink-0 mt-0.5 ${iconColor}`} />
                              <div className="flex-grow">
                                  <p className="font-semibold text-slate-800 dark:text-slate-200">{lesson.title}</p>
                                  {lesson.description && <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{truncateToFirstSentence(lesson.description)}</p>}
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{lesson.isFreePreview && !hasAccess ? 'Free Preview' : `${lesson.duration}`}</p>
                              </div>
                          </button>
                      </li>
                  )
              })}
          </ul>

          {/* Quiz / Enrollment Footer */}
          <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-700">
             {!hasAccess ? (
                  <div className="text-center">
                      <p className={`text-5xl font-bold text-${text}-900 dark:text-white`}>{section.currency}{section.price}</p>
                      <p className={`text-sm text-center text-${text}-500 dark:text-slate-400`}>One-time payment, lifetime access</p>
                      <button onClick={() => onEnroll(section)} className={`mt-4 w-full text-center py-3 px-6 rounded-lg font-semibold text-lg text-white bg-${primary}-600 hover:bg-${primary}-700 transition-transform transform hover:scale-105 shadow-lg`}>
                          {section.buyButtonText || 'Enroll Now'}
                      </button>
                  </div>
              ) : activeChapter?.quiz ? (
                   <div>
                      {isQuizCompleted ? (
                          <div className="text-center font-semibold text-green-600 dark:text-green-400 p-2 rounded-lg bg-green-50 dark:bg-green-500/10">Chapter Quiz Passed!</div>
                      ) : (
                          <button
                              onClick={() => onTakeQuiz(activeChapter)}
                              disabled={!isCurrentChapterComplete}
                              className={`w-full text-center py-2 px-4 rounded-lg font-semibold text-white bg-${primary}-600 hover:bg-${primary}-700 disabled:bg-gray-400 disabled:cursor-not-allowed`}
                              title={!isCurrentChapterComplete ? 'Complete all lessons to unlock the quiz' : ''}>
                              Take Chapter Quiz
                          </button>
                      )}
                  </div>
              ) : null}
          </div>
        </div>
        <p className={`mt-10 text-center text-base text-${text}-600 dark:text-${text}-400`}>{section.description}</p>
      </div>
    </section>
  );
};

export default CourseSection;
