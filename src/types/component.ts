/**
 * @file Contains type definitions for the reusable Site Component generator.
 */

/** Represents a reusable site component saved by a user. */
export interface SiteComponent {
    id: string;
    user_id: string;
    created_at: string;
    name: string;
    section_type: string;
    keywords: string[] | null;
    tags: string[] | null;
    data: any; // The JSON data for the section
}

/** Represents a structured prompt for the Veo3 video generation model. */
export interface Veo3Prompt {
    audio?: { description: string };
    dialog?: { character: string; text: string }[];
    scenes: {
        timeline: string;
        character?: { name: string; description: string };
        camera?: { type: string; angle: string; movement: string };
        location?: { description: string };
        action?: { description: string };
        labels?: string[];
    }[];
}
