
import { supabase } from './supabase';
import type { SeoReport, SeoReportData } from '../src/types';
import type { TablesInsert, Json } from '../database.types';

export async function getSeoReports(userId: string): Promise<SeoReport[]> {
    const { data, error } = await supabase
        .from('seo_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as unknown as SeoReport[]) || [];
}

export async function createSeoReport(userId: string, pageId: string, score: number, reportData: SeoReportData): Promise<SeoReport> {
    const payload: TablesInsert<'seo_reports'> = {
        user_id: userId,
        page_id: pageId,
        score,
        report_data: reportData as unknown as Json,
    };
    const { data, error } = await supabase.from('seo_reports').insert([payload] as any).select().single();
    if (error) throw error;
    if (!data) throw new Error("SEO report creation failed.");
    return data as unknown as SeoReport;
}

export async function deleteSeoReport(reportId: string): Promise<void> {
    const { error } = await supabase.from('seo_reports').delete().eq('id', reportId);
    if (error) throw error;
}
