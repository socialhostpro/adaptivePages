

import { supabase } from './supabase';
import type { TeamMember, TeamRole } from '../types';
import type { TablesInsert, TablesUpdate, PublicEnumTeamRole } from '../database.types';

export async function getTeamMembers(userId: string): Promise<TeamMember[]> {
    const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching team members:", error);
        throw error;
    }
    return (data as unknown as TeamMember[]) || [];
}

export async function createTeamMember(userId: string, memberData: Omit<TeamMember, 'id' | 'user_id' | 'created_at'>): Promise<TeamMember> {
    const payload: TablesInsert<'team_members'> = {
        user_id: userId,
        ...memberData,
    };
    const { data, error } = await supabase
        .from('team_members')
        .insert(payload as any)
        .select()
        .single();
    
    if (error) {
        console.error("Error creating team member:", error);
        throw error;
    }
    if (!data) throw new Error("Team member creation failed.");
    return data as unknown as TeamMember;
}

export async function updateTeamMember(memberId: string, updates: Partial<Omit<TeamMember, 'id' | 'user_id' | 'created_at'>>): Promise<TeamMember> {
    const { error, data } = await supabase
        .from('team_members')
        .update(updates as any)
        .eq('id', memberId)
        .select()
        .single();
        
    if (error) {
        console.error("Error updating team member:", error);
        throw error;
    }
    if (!data) throw new Error("Team member update failed.");
    return data as unknown as TeamMember;
}

export async function deleteTeamMember(memberId: string): Promise<void> {
    const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);
        
    if (error) {
        console.error("Error deleting team member:", error);
        throw error;
    }
}
