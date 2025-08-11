/**
 * @file Contains type definitions for the Onboarding Wizard feature.
 */

/** Represents a single question within an onboarding step. */
export interface OnboardingQuestion {
  id: string;
  text: string;
  type: 'text' | 'email' | 'tel' | 'password' | 'dropdown' | 'multiple-choice' | 'switch';
  options?: string[]; // For dropdown and multiple-choice
  required: boolean;
}

/** Represents a single step in an onboarding wizard. */
export interface OnboardingStep {
  id: string;
  title: string;
  questions: OnboardingQuestion[];
}

/** Represents a complete onboarding wizard with multiple steps. */
export interface OnboardingWizard {
  id: string;
  user_id: string;
  created_at: string;
  name: string;
  steps: OnboardingStep[];
}
