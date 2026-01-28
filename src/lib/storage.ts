import { supabase } from './supabase';

/**
 * Uploads a file to a Supabase storage bucket.
 * @param bucket - The name of the storage bucket
 * @param path - The path within the bucket (folder/filename)
 * @param file - The file to upload
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(bucket: string, path: string, file: File): Promise<string> {
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
            cacheControl: '3600',
            upsert: true
        });

    if (error) {
        throw error;
    }

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

    return publicUrl;
}

/**
 * Uploads multiple files to a Supabase storage bucket.
 * @param bucket - The name of the storage bucket
 * @param folder - The folder within the bucket
 * @param files - The files to upload
 * @returns An array of public URLs
 */
export async function uploadFiles(bucket: string, folder: string, files: File[]): Promise<string[]> {
    const uploadPromises = files.map(file => {
        // Generate a unique filename: folder/timestamp-random-name
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const path = `${folder}/${fileName}`;
        return uploadFile(bucket, path, file);
    });

    return Promise.all(uploadPromises);
}
