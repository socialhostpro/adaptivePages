

import { supabase } from './supabase';
import type { UserSettings } from '../types';
import type { Json, TablesInsert, Tables } from '../database.types';

type UserProfileRow = Tables<'user_profiles'>;

export async function getProfile(userId: string): Promise<UserSettings | null> {
    const { data, error } = await supabase
        .from('user_profiles')
        .select(`
            id, updated_at, elevenlabs_api_key, google_api_key, google_build_config, default_custom_domain,
            twilio_account_sid, twilio_auth_token, twilio_from_number, sendgrid_api_key, sendgrid_from_email, elevenlabs_webhook_url
        `)
        .eq('id', userId)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: row not found
        console.error("Error fetching user profile:", error);
        throw error;
    }
    return data as unknown as UserSettings | null;
}

export async function updateProfile(userId: string, updates: Omit<UserSettings, 'id' | 'updated_at'>): Promise<UserSettings> {
    const payload: TablesInsert<'user_profiles'> = {
        id: userId,
        ...updates,
        google_build_config: updates.google_build_config as Json,
        updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from('user_profiles')
        .upsert(payload as any)
        .select()
        .single();
    
    if (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
    if (!data) throw new Error("Profile update failed.");
    return data as unknown as UserSettings;
}