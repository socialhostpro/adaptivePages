

import { supabase } from '../../services/supabase';
import type { TeamMember, TeamRole } from '../types';
import type { Tables, TablesInsert, TablesUpdate, PublicEnumTeamRole } from '../types/database.types';

// Type-safe converter to map database role to application role
function convertDbTeamMemberToTeamMember(dbMember: Tables<'team_members'>): TeamMember {
    return {
        id: dbMember.id,
        user_id: dbMember.user_id,
        created_at: dbMember.created_at,
        name: dbMember.name,
        email: dbMember.email,
        role: dbMember.role as TeamRole, // Safe cast since enum values are identical
    };
}

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
    return data ? data.map(convertDbTeamMemberToTeamMember) : [];
}

export async function createTeamMember(userId: string, memberData: Omit<TeamMember, 'id' | 'user_id' | 'created_at'>): Promise<TeamMember> {
    const payload: TablesInsert<'team_members'> = {
        user_id: userId,
        name: memberData.name,
        email: memberData.email,
        role: memberData.role as PublicEnumTeamRole, // Safe cast since enum values are identical
    };
    
    const { data, error } = await supabase
        .from('team_members')
        .insert(payload)
        .select()
        .single();
    
    if (error) {
        console.error("Error creating team member:", error);
        throw error;
    }
    if (!data) throw new Error("Team member creation failed.");
    return convertDbTeamMemberToTeamMember(data);
}

export async function updateTeamMember(memberId: string, updates: Partial<Omit<TeamMember, 'id' | 'user_id' | 'created_at'>>): Promise<TeamMember> {
    const payload: TablesUpdate<'team_members'> = {};
    
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.role !== undefined) payload.role = updates.role as PublicEnumTeamRole;
    
    const { error, data } = await supabase
        .from('team_members')
        .update(payload)
        .eq('id', memberId)
        .select()
        .single();
        
    if (error) {
        console.error("Error updating team member:", error);
        throw error;
    }
    if (!data) throw new Error("Team member update failed.");
    return convertDbTeamMemberToTeamMember(data);
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
