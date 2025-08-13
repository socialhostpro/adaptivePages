

import { supabase } from '../../services/supabase';
import type { UserSettings } from '../types';
import type { Json, TablesInsert, TablesUpdate, Tables } from '../types/database.types';

type UserProfileRow = Tables<'user_profiles'>;

// Type-safe converter to map database user profile to user settings
function convertDbUserProfileToUserSettings(dbProfile: UserProfileRow): UserSettings {
    return {
        id: dbProfile.id,
        updated_at: dbProfile.updated_at,
        elevenlabs_api_key: dbProfile.elevenlabs_api_key,
        elevenlabs_webhook_url: dbProfile.elevenlabs_webhook_url,
        google_api_key: dbProfile.google_api_key,
        google_build_config: dbProfile.google_build_config,
        default_custom_domain: dbProfile.default_custom_domain,
        twilio_account_sid: dbProfile.twilio_account_sid,
        twilio_auth_token: dbProfile.twilio_auth_token,
        twilio_from_number: dbProfile.twilio_from_number,
        sendgrid_api_key: dbProfile.sendgrid_api_key,
        sendgrid_from_email: dbProfile.sendgrid_from_email,
    };
}

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
    return data ? convertDbUserProfileToUserSettings(data) : null;
}

export async function updateProfile(userId: string, updates: Omit<UserSettings, 'id' | 'updated_at'>): Promise<UserSettings> {
    const payload: TablesInsert<'user_profiles'> = {
        id: userId,
        elevenlabs_api_key: updates.elevenlabs_api_key,
        elevenlabs_webhook_url: updates.elevenlabs_webhook_url,
        google_api_key: updates.google_api_key,
        google_build_config: updates.google_build_config,
        default_custom_domain: updates.default_custom_domain,
        twilio_account_sid: updates.twilio_account_sid,
        twilio_auth_token: updates.twilio_auth_token,
        twilio_from_number: updates.twilio_from_number,
        sendgrid_api_key: updates.sendgrid_api_key,
        sendgrid_from_email: updates.sendgrid_from_email,
        updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from('user_profiles')
        .upsert(payload)
        .select()
        .single();
    
    if (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
    if (!data) throw new Error("Profile update failed.");
    return convertDbUserProfileToUserSettings(data);
}