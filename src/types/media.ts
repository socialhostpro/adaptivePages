/**
 * @file Contains type definitions related to media files and the media library.
 */

/**
 * Represents a file stored in the media library (Supabase Storage).
 * @interface
 */
export interface MediaFile {
    /** The unique identifier (UUID) for the file. */
    id: string;
    /** The ID of the user who owns the file. */
    user_id: string;
    /** The timestamp when the file was created. */
    created_at: string;
    /** The path of the file within the storage bucket. */
    file_path: string;
    /** The public URL to access the file. */
    url: string;
    /** The original name of the file. */
    name: string;
    /** An AI-generated description of the file's content. */
    description: string | null;
    /** AI-generated keywords for searchability. */
    keywords: string[] | null;
}
