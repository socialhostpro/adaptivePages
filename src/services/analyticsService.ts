

import { supabase } from './supabase';
import type { TablesInsert } from '../database.types';

export async function logLessonView(userId: string, pageId: string, lessonId: string, lessonTitle: string) {
    const payload: TablesInsert<'lesson_views'> = {
        user_id: userId,
        page_id: pageId,
        lesson_id: lessonId,
        lesson_title: lessonTitle
    };
    const { error } = await supabase.from('lesson_views').insert([payload]);
    if (error) {
        console.error("Failed to log lesson view:", error.message, error);
    }
}

export async function logQuizAttempt(
    userId: string,
    pageId: string,
    chapterId: string,
    quizTitle: string,
    score: number,
    totalQuestions: number,
    passed: boolean
) {
    const payload: TablesInsert<'quiz_attempts'> = {
        user_id: userId,
        page_id: pageId,
        chapter_id: chapterId,
        quiz_title: quizTitle,
        score,
        total_questions: totalQuestions,
        passed
    };
    const { error } = await supabase.from('quiz_attempts').insert([payload]);
    if (error) {
        console.error("Failed to log quiz attempt:", error.message, error);
    }
}