

import { supabase } from './supabase';
import type { Portal, PortalType } from '../types';
import type { TablesInsert, TablesUpdate } from '../database.types';

export async function getPortals(userId: string): Promise<Portal[]> {
    const { data, error } = await supabase
        .from('portals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching portals:", error);
        throw error;
    }
    return (data as unknown as Portal[]) || [];
}

export async function createPortal(userId: string, name: string, type: PortalType, pageId: string | null): Promise<Portal> {
    const payload: TablesInsert<'portals'> = {
        user_id: userId,
        name,
        type,
        page_id: pageId,
    };
    const { data, error } = await supabase
        .from('portals')
        .insert(payload as any)
        .select()
        .single();
    
    if (error) {
        console.error("Error creating portal:", error);
        throw error;
    }
    if (!data) throw new Error("Portal creation failed.");
    return data as unknown as Portal;
}

export async function deletePortal(portalId: string): Promise<void> {
    const { error } = await supabase
        .from('portals')
        .delete()
        .eq('id', portalId);
        
    if (error) {
        console.error("Error deleting portal:", error);
        throw error;
    }
}
