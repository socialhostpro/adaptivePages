


import { supabase } from './supabase';
import type { OnboardingWizard, OnboardingStep } from '../types';
import type { TablesInsert, Json, Tables, TablesUpdate } from '../database.types';

type WizardRow = Tables<'onboarding_wizards'>;

export async function getWizards(userId: string): Promise<OnboardingWizard[]> {
    const { data, error } = await supabase
        .from('onboarding_wizards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching onboarding wizards:", error);
        throw error;
    }
    return ((data as unknown as WizardRow[]) || []).map((w: WizardRow) => ({ ...w, steps: w.steps as unknown as OnboardingStep[] }));
}

export async function createWizard(userId: string, wizardData: Omit<OnboardingWizard, 'id' | 'user_id' | 'created_at'>): Promise<OnboardingWizard> {
    const payload: TablesInsert<'onboarding_wizards'> = {
        user_id: userId,
        name: wizardData.name,
        steps: wizardData.steps as unknown as Json,
    };
    const { data, error } = await supabase
        .from('onboarding_wizards')
        .insert([payload] as any)
        .select()
        .single();

    if (error) {
        console.error("Error creating wizard:", error);
        throw error;
    }
    if (!data) throw new Error("Wizard creation failed.");
    const wizard = data as unknown as WizardRow;
    return { ...wizard, steps: wizard.steps as unknown as OnboardingStep[] };
}

export async function updateWizard(wizardId: string, updates: Partial<Omit<OnboardingWizard, 'id' | 'user_id' | 'created_at'>>): Promise<OnboardingWizard> {
    const payload: Partial<TablesUpdate<'onboarding_wizards'>> = {
        ...updates,
        steps: updates.steps as unknown as Json
    };
    const { data, error } = await supabase
        .from('onboarding_wizards')
        .update(payload as any)
        .eq('id', wizardId)
        .select()
        .single();
        
    if (error) {
        console.error("Error updating wizard:", error);
        throw error;
    }
    if (!data) throw new Error("Wizard update failed.");
    const wizard = data as unknown as WizardRow;
    return { ...wizard, steps: wizard.steps as unknown as OnboardingStep[] };
}

export async function deleteWizard(wizardId: string): Promise<void> {
    const { error } = await supabase
        .from('onboarding_wizards')
        .delete()
        .eq('id', wizardId);
        
    if (error) {
        console.error("Error deleting wizard:", error);
        throw error;
    }
}

export async function createSubmission(wizardId: string, ownerId: string, submissionData: Record<string, any>): Promise<void> {
    const payload: TablesInsert<'onboarding_submissions'> = {
        wizard_id: wizardId,
        owner_id: ownerId,
        data: submissionData as Json,
    };
    const { error } = await supabase
        .from('onboarding_submissions')
        .insert([payload] as any);
        
    if (error) {
        console.error("Error creating onboarding submission:", error);
        throw error;
    }
}