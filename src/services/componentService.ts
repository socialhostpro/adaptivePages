

import { supabase } from './supabase';
import type { SiteComponent } from '../types';
import type { TablesInsert, TablesUpdate, Json } from '../database.types';

export async function getComponents(userId: string): Promise<SiteComponent[]> {
    const { data, error } = await supabase
        .from('site_components')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching components:", error);
        throw error;
    }
    return (data as unknown as SiteComponent[]) || [];
}

export async function createComponent(userId: string, componentData: Omit<SiteComponent, 'id' | 'user_id' | 'created_at'>): Promise<SiteComponent> {
    const payload: TablesInsert<'site_components'> = {
        user_id: userId,
        ...componentData,
        data: componentData.data as Json,
    };
    const { data, error } = await supabase
        .from('site_components')
        .insert(payload as any)
        .select()
        .single();
    
    if (error) {
        console.error("Error creating component:", error);
        throw error;
    }
    if (!data) throw new Error("Component creation failed.");
    return data as unknown as SiteComponent;
}

export async function updateComponent(componentId: string, updates: Partial<Omit<SiteComponent, 'id' | 'user_id' | 'created_at'>>): Promise<SiteComponent> {
    const payload: TablesUpdate<'site_components'> = {
        ...updates,
        data: updates.data as Json,
    };
    const { error, data } = await supabase
        .from('site_components')
        .update(payload as any)
        .eq('id', componentId)
        .select()
        .single();
        
    if (error) {
        console.error("Error updating component:", error);
        throw error;
    }
    if (!data) throw new Error("Component update failed.");
    return data as unknown as SiteComponent;
}

export async function deleteComponent(componentId: string): Promise<void> {
    const { error } = await supabase
        .from('site_components')
        .delete()
        .eq('id', componentId);
        
    if (error) {
        console.error("Error deleting component:", error);
        throw error;
    }
}
