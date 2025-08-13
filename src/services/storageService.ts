import { supabase } from '../../services/supabase';
import type { MediaFile } from '../types';
import { generateImageDescription } from './geminiService';
import type { Tables, TablesInsert, TablesUpdate } from '../types/database.types';

// Type-safe converter to map database media file to application media file
function convertDbMediaFileToMediaFile(dbFile: Tables<'media_files'>): MediaFile {
    return {
        id: dbFile.id,
        user_id: dbFile.user_id,
        created_at: dbFile.created_at,
        file_path: dbFile.file_path,
        url: dbFile.url,
        name: dbFile.name,
        description: dbFile.description,
        keywords: dbFile.keywords,
    };
}

const BUCKET_NAME = 'media_library';

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // result is "data:image/jpeg;base64,...."
            // We only need the part after the comma
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = error => reject(error);
    });
};

// Helper to convert base64 to a file object
const base64ToFile = (base64: string, filename: string, mimeType: string): File => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new File([byteArray], filename, { type: mimeType });
};


export async function uploadAndAnalyzeFile(userId: string, file: File): Promise<void> {
    const file_path = `${userId}/${Date.now()}-${file.name}`;
    
    // 1. Upload the file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(file_path, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (uploadError) {
        console.error("Error uploading file:", uploadError.message, uploadError);
        throw uploadError;
    }

    // 2. Get the public URL
    const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(file_path);

    if (!publicUrl) {
        throw new Error("Could not get public URL for uploaded file.");
    }
    
    // 3. Get AI-generated description and keywords, only for images
    let description: string | null = "File uploaded.";
    let keywords: string[] | null = [];
    const isImage = file.type.startsWith('image/');
    
    if (isImage) {
        description = "AI analysis pending...";
        try {
            const base64Image = await fileToBase64(file);
            const analysis = await generateImageDescription(base64Image);
            description = analysis.description;
            keywords = analysis.keywords;
        } catch (e) {
            console.error("Failed to analyze image with AI:", e);
            description = "AI analysis failed.";
        }
    }


    // 4. Insert metadata into the database
    const fileMetadata: TablesInsert<'media_files'> = {
        user_id: userId,
        file_path,
        url: publicUrl,
        name: file.name,
        description,
        keywords,
    };

    const { error: dbError } = await supabase
        .from('media_files')
        .insert(fileMetadata);
    
    if (dbError) {
        console.error("Error saving file metadata:", dbError.message, dbError);
        // Attempt to clean up storage if DB insert fails
        await supabase.storage.from(BUCKET_NAME).remove([file_path]);
        throw dbError;
    }
}

export async function uploadBase64File(userId: string, base64Data: string, fileName: string, mimeType: string): Promise<void> {
    const file = base64ToFile(base64Data, fileName, mimeType);
    await uploadAndAnalyzeFile(userId, file);
}

/**
 * Upload a base64 image to Supabase Storage and return the public URL.
 * This is optimized for AI-generated images and doesn't store metadata in the database.
 * @param userId - The user ID for the storage path
 * @param base64Data - The base64 image data (without data:image prefix)
 * @param imageKey - A unique key for the image (e.g., 'hero', 'logo', 'gallery_0')
 * @param mimeType - The MIME type of the image (default: 'image/jpeg')
 * @returns The public URL of the uploaded image
 */
export async function uploadImageToSupabaseStorage(
    userId: string, 
    base64Data: string, 
    imageKey: string, 
    mimeType: string = 'image/jpeg'
): Promise<string> {
    // Create a file path with timestamp to avoid conflicts
    const timestamp = Date.now();
    const extension = mimeType.split('/')[1] || 'jpg';
    const file_path = `generated-images/${userId}/${imageKey}-${timestamp}.${extension}`;
    
    // Convert base64 to file
    const file = base64ToFile(base64Data, `${imageKey}.${extension}`, mimeType);
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(file_path, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (uploadError) {
        console.error("Error uploading generated image:", uploadError.message, uploadError);
        throw uploadError;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(file_path);

    if (!publicUrl) {
        throw new Error("Could not get public URL for uploaded image.");
    }
    
    console.log(`✅ Generated image uploaded successfully: ${imageKey} -> ${publicUrl}`);
    return publicUrl;
}

export async function listFiles(userId: string): Promise<MediaFile[]> {
    const { data, error } = await supabase
        .from('media_files')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error listing files from DB:", error.message, error);
        throw error;
    }

    return data ? data.map(convertDbMediaFileToMediaFile) : [];
}

export async function deleteFile(file: MediaFile): Promise<void> {
    // 1. Delete from storage
    const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([file.file_path]);
    
    if (storageError) {
        console.error("Error deleting file from storage:", storageError.message, storageError);
        // Decide if you want to proceed even if storage deletion fails
    }

    // 2. Delete from database
    const { error: dbError } = await supabase
        .from('media_files')
        .delete()
        .eq('id', file.id);

    if (dbError) {
        console.error("Error deleting file metadata from DB:", dbError.message, dbError);
        throw dbError;
    }
}

export async function updateFileMetadata(fileId: string, updates: { description?: string, keywords?: string[] }): Promise<MediaFile> {
    const dbUpdates: TablesUpdate<'media_files'> = {};
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.keywords !== undefined) dbUpdates.keywords = updates.keywords;

    const { data, error } = await supabase
        .from('media_files')
        .update(dbUpdates)
        .eq('id', fileId)
        .select('*')
        .single();
    
    if (error) {
        console.error("Error updating file metadata:", error.message, error);
        throw error;
    }
    if (!data) {
        throw new Error(`File with id ${fileId} not found.`);
    }
    
    return convertDbMediaFileToMediaFile(data);
}