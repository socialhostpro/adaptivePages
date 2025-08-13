

import { supabase } from '../../services/supabase';
import type { Portal, PortalType } from '../types';
import type { Tables, TablesInsert, TablesUpdate } from '../types/database.types';

// Type-safe converter to map database portal to application portal
function convertDbPortalToPortal(dbPortal: Tables<'portals'>): Portal {
    return {
        id: dbPortal.id,
        user_id: dbPortal.user_id,
        created_at: dbPortal.created_at,
        name: dbPortal.name,
        type: dbPortal.type as PortalType,
        page_id: dbPortal.page_id,
        settings: dbPortal.settings,
    };
}

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
    return data ? data.map(convertDbPortalToPortal) : [];
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
        .insert(payload)
        .select()
        .single();
    
    if (error) {
        console.error("Error creating portal:", error);
        throw error;
    }
    if (!data) throw new Error("Portal creation failed.");
    return convertDbPortalToPortal(data);
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
