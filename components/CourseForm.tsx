




import React, { useState } from 'react';
import type { CourseChapter, CourseLesson, ImageStore } from '../src/types';
import FormField, { TextInput, TextAreaInput, NumberInput, SelectInput } from './shared/FormField';
import DraggableList from './shared/DraggableList';
import EnhancedFormField from './EnhancedFormField';
import ImageInput from './ImageInput';
import TrashIcon from './icons/TrashIcon';
import DragHandleIcon from './icons/DragHandleIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import ColorSwatchPicker from './ColorSwatchPicker';
import Switch from './shared/Switch';


interface CourseFormProps {
    data: any;
    setData: (data: any) => void;
    openMediaLibrary: (callback: (url: string) => void) => void;
    images: ImageStore;
}

const lightBgColors = ['white', 'slate-50', 'slate-100', 'gray-50', 'gray-100', 'zinc-50', 'zinc-100', 'neutral-50', 'neutral-100'];
const darkBgColors = ['slate-800', 'slate-900', 'gray-800', 'gray-900', 'zinc-800', 'zinc-900', 'neutral-800', 'neutral-900'];


const CourseForm: React.FC<CourseFormProps> = ({ data, setData, openMediaLibrary, images }) => {
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

    const handleFieldChange = (field: string, value: any) => setData({ ...data, [field]: value });
    
    const mediaType = data.mediaType || 'image';
    const videoSource = data.videoSource || 'youtube';

    const handleChaptersChange = (newChapters: CourseChapter[]) => setData({ ...data, chapters: newChapters });
    const handleChapterChange = (cIndex: number, field: string, value: any) => {
        const newChapters = [...data.chapters];
        newChapters[cIndex] = { ...newChapters[cIndex], [field]: value };
        handleChaptersChange(newChapters);
    };
    const addChapter = () => handleChaptersChange([...(data.chapters || []), { id: `c-${Date.now()}`, title: 'New Chapter', lessons: [] }]);
    const removeChapter = (cIndex: number) => handleChaptersChange(data.chapters.filter((_: any, i: number) => i !== cIndex));

    const handleLessonsChange = (cIndex: number, newLessons: CourseLesson[]) => handleChapterChange(cIndex, 'lessons', newLessons);
    const handleLessonChange = (cIndex: number, lIndex: number, field: string, value: any) => {
        const newLessons = [...data.chapters[cIndex].lessons];
        newLessons[lIndex] = { ...newLessons[lIndex], [field]: value };
        handleLessonsChange(cIndex, newLessons);
    };
    const addLesson = (cIndex: number) => {
        const newLessons = [...data.chapters[cIndex].lessons, { id: `l-${Date.now()}`, title: 'New Lesson', description: '', videoSource: 'youtube', youtubeVideoId: '5qap5aO4i9A', duration: '00:00', isFreePreview: false }];
        handleLessonsChange(cIndex, newLessons);
    };
    const removeLesson = (cIndex: number, lIndex: number) => {
        const newLessons = data.chapters[cIndex].lessons.filter((_: any, i: number) => i !== lIndex);
        handleLessonsChange(cIndex, newLessons);
    };

    return (
        <>
        <div className="space-y-4">
            <EnhancedFormField label="Course Title" value={data.title} onChange={v => handleFieldChange('title', v)} context="an online course title"/>
            <EnhancedFormField label="Course Description" value={data.description} onChange={v => handleFieldChange('description', v)} type="textarea" rows={4} context="an online course description"/>
            
            <FormField label="Banner Media Type">
                <div className="flex gap-2 rounded-lg bg-slate-100 dark:bg-slate-700 p-1">
                    <button type="button" onClick={() => handleFieldChange('mediaType', 'image')} className={`w-full p-2 rounded-md font-semibold text-sm ${mediaType === 'image' ? 'bg-white dark:bg-slate-800 shadow' : 'text-slate-600 dark:text-slate-300'}`}>Image</button>
                    <button type="button" onClick={() => handleFieldChange('mediaType', 'video')} className={`w-full p-2 rounded-md font-semibold text-sm ${mediaType === 'video' ? 'bg-white dark:bg-slate-800 shadow' : 'text-slate-600 dark:text-slate-300'}`}>Video</button>
                </div>
            </FormField>

            {mediaType === 'image' ? (
                <ImageInput 
                    value={data.imagePrompt || ''} 
                    imageUrl={images['course_banner']}
                    onChange={(newValue) => handleFieldChange('imagePrompt', newValue)} 
                    onSelectFromLibrary={() => openMediaLibrary(url => handleFieldChange('imagePrompt', url))} 
                />
            ) : (
                <>
                    <FormField label="Video Source">
                        <SelectInput value={videoSource} onChange={e => handleFieldChange('videoSource', e.target.value)}>
                            <option value="youtube">YouTube</option>
                        </SelectInput>
                    </FormField>
                    <FormField label="YouTube Video ID"><TextInput value={data.youtubeVideoId || ''} onChange={e => handleFieldChange('youtubeVideoId', e.target.value)} /></FormField>
                </>
            )}

            <div className="grid grid-cols-2 gap-4">
                <FormField label="Price"><NumberInput value={data.price} onChange={e => handleFieldChange('price', parseFloat(e.target.value))} /></FormField>
                <FormField label="Currency Symbol"><TextInput value={data.currency} onChange={e => handleFieldChange('currency', e.target.value)} /></FormField>
            </div>
            <EnhancedFormField label="Enroll Button Text" value={data.buyButtonText} onChange={v => handleFieldChange('buyButtonText', v)} context="a course enrollment button" />

            <div className="grid grid-cols-2 gap-4">
                <FormField label="Background Color (Light)">
                    <ColorSwatchPicker 
                        colors={lightBgColors}
                        value={data.backgroundColor || 'white'}
                        onChange={v => handleFieldChange('backgroundColor', v)}
                    />
                </FormField>
                <FormField label="Background Color (Dark)">
                     <ColorSwatchPicker 
                        colors={darkBgColors}
                        value={data.darkBackgroundColor || 'gray-900'}
                        onChange={v => handleFieldChange('darkBackgroundColor', v)}
                    />
                </FormField>
            </div>

            <div className="pt-4 border-t dark:border-slate-600 space-y-3">
                <label className="flex items-center justify-between cursor-pointer p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Enforce lesson sequence</span>
                    <Switch enabled={!!data.enforceSequence} onChange={v => handleFieldChange('enforceSequence', v)} />
                </label>
                <label className="flex items-center justify-between cursor-pointer p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Enable Certificate</span>
                    <Switch enabled={!!data.certificateEnabled} onChange={v => handleFieldChange('certificateEnabled', v)} />
                </label>
                {data.certificateEnabled && (
                    <div className="pl-4 space-y-2">
                         <EnhancedFormField label="Certificate Title" value={data.certificateTitle} onChange={v => handleFieldChange('certificateTitle', v)} context="a certificate title" />
                         <EnhancedFormField label="Course Provider Name" value={data.courseProviderName} onChange={v => handleFieldChange('courseProviderName', v)} context="a course provider name" />
                    </div>
                )}
            </div>
             
            <div className="pt-4 border-t dark:border-slate-600">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-2">Curriculum</h3>
                <DraggableList
                    items={data.chapters || []}
                    onUpdate={handleChaptersChange}
                    renderItem={(chapter: CourseChapter, cIndex: number) => (
                        <div className="space-y-3 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                             <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 flex-grow">
                                    <DragHandleIcon className="w-5 h-5 text-slate-500 dark:text-slate-400 cursor-grab active:cursor-grabbing flex-shrink-0" />
                                    <EnhancedFormField value={chapter.title} onChange={v => handleChapterChange(cIndex, 'title', v)} context="a course chapter title"/>
                                </div>
                                <button onClick={() => removeChapter(cIndex)} className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100/50 flex-shrink-0"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                            <div className="pl-6">
                                <DraggableList 
                                    items={chapter.lessons || []}
                                    onUpdate={(lessons) => handleLessonsChange(cIndex, lessons)}
                                    renderItem={(lesson: CourseLesson, lIndex: number) => (
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2 flex-grow">
                                                     <DragHandleIcon className="w-5 h-5 text-slate-500 dark:text-slate-400 cursor-grab active:cursor-grabbing flex-shrink-0" />
                                                     <button type="button" onClick={() => setExpandedItems(p => ({...p, [lesson.id]: !p[lesson.id]}))} className="flex-grow text-left flex items-center gap-2">
                                                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${expandedItems[lesson.id] ? 'rotate-180' : ''}`} />
                                                        <span className="font-semibold text-sm">{lesson.title || 'New Lesson'}</span>
                                                     </button>
                                                </div>
                                                <button onClick={() => removeLesson(cIndex, lIndex)} className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100/50 flex-shrink-0"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                            {expandedItems[lesson.id] && (
                                                <div className="pl-6 space-y-2 border-l-2 ml-2">
                                                    <EnhancedFormField label="Lesson Title" value={lesson.title} onChange={v => handleLessonChange(cIndex, lIndex, 'title', v)} context="a lesson title" />
                                                    <EnhancedFormField label="Description" value={lesson.description} onChange={v => handleLessonChange(cIndex, lIndex, 'description', v)} type="textarea" rows={2} context="a lesson description" />
                                                    <ImageInput 
                                                        value={lesson.imagePrompt || ''}
                                                        imageUrl={images[`lesson_${lesson.id}`]}
                                                        onChange={v => handleLessonChange(cIndex, lIndex, 'imagePrompt', v)}
                                                        onSelectFromLibrary={() => openMediaLibrary(url => handleLessonChange(cIndex, lIndex, 'imagePrompt', url))}
                                                    />
                                                    <FormField label="Video Source">
                                                        <SelectInput value={lesson.videoSource || 'youtube'} onChange={e => handleLessonChange(cIndex, lIndex, 'videoSource', e.target.value)}>
                                                            <option value="youtube">YouTube</option>
                                                            <option value="embed">Embed Code</option>
                                                        </SelectInput>
                                                    </FormField>
                                                    {lesson.videoSource === 'embed' ? (
                                                         <FormField label="Video Embed Code"><TextAreaInput value={lesson.videoEmbedCode || ''} onChange={e => handleLessonChange(cIndex, lIndex, 'videoEmbedCode', e.target.value)} rows={4} /></FormField>
                                                    ) : (
                                                         <FormField label="YouTube Video ID"><TextInput value={lesson.youtubeVideoId || ''} onChange={e => handleLessonChange(cIndex, lIndex, 'youtubeVideoId', e.target.value)} /></FormField>
                                                    )}
                                                    <FormField label="Duration"><TextInput value={lesson.duration} onChange={e => handleLessonChange(cIndex, lIndex, 'duration', e.target.value)} placeholder="mm:ss" /></FormField>
                                                    <label className="flex items-center gap-2"><input type="checkbox" checked={lesson.isFreePreview} onChange={e => handleLessonChange(cIndex, lIndex, 'isFreePreview', e.target.checked)} /> <span className="text-sm">Free Preview?</span></label>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                />
                                 <button onClick={() => addLesson(cIndex)} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mt-2">+ Add Lesson</button>
                            </div>
                        </div>
                    )}
                />
                 <button onClick={addChapter} className="mt-2 text-sm w-full text-center py-2 border-dashed border-2 dark:border-slate-600 rounded-md text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">+ Add Chapter</button>
            </div>
        </div>
        </>
    );
}

export default CourseForm;