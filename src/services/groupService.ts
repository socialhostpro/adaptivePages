

import { supabase } from './supabase';
import type { PageGroup } from '../types';
import type { TablesInsert, TablesUpdate } from '../database.types';

export async function getGroups(userId: string): Promise<PageGroup[]> {
    const { data, error } = await supabase
        .from('page_groups')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });
    
    if (error) {
        console.error("Error fetching page groups:", error);
        throw error;
    }
    return (data as unknown as PageGroup[]) || [];
}

export async function createGroup(userId: string, name: string): Promise<PageGroup> {
    const payload: TablesInsert<'page_groups'> = { user_id: userId, name };
    const { data, error } = await supabase
        .from('page_groups')
        .insert(payload as any)
        .select()
        .single();
        
    if (error) throw error;
    if (!data) throw new Error("Group creation failed.");
    return data as unknown as PageGroup;
}

export async function updateGroup(groupId: string, name: string): Promise<PageGroup> {
    const { data, error } = await supabase
        .from('page_groups')
        .update({ name } as any)
        .eq('id', groupId)
        .select()
        .single();

    if (error) throw error;
    if (!data) throw new Error("Group update failed.");
    return data as unknown as PageGroup;
}

export async function deleteGroup(groupId: string): Promise<void> {
    // Note: The `ON DELETE SET NULL` constraint on pages.group_id will
    // automatically un-assign pages from this group.
    const { error } = await supabase
        .from('page_groups')
        .delete()
        .eq('id', groupId);
    
    if (error) throw error;
}
