// filepath: src/lib/storage.ts
import { supabaseAdmin } from "./supabase";

export interface UploadOptions {
  bucket?: string;
  path: string;
  fileBody: Blob | ArrayBuffer | Uint8Array | Buffer | string;
  contentType?: string;
}

/**
 * Uploads a file to a Supabase Storage bucket.
 */
export async function uploadToStorage({
  bucket = "documents",
  path,
  fileBody,
  contentType,
}: UploadOptions) {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, fileBody, {
      contentType: contentType || "application/octet-stream",
      upsert: true,
    });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Generates a signed URL for private bucket access (valid for 1 hour by default).
 */
export async function getSignedDocumentUrl(
  bucket: string = "documents",
  storagePath: string,
  expiresInSeconds = 3600
): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(storagePath, expiresInSeconds);

    if (error || !data) {
      return null;
    }

    return data.signedUrl;
  } catch (err) {
    console.error("Error creating signed URL:", err);
    return null;
  }
}

/**
 * Deletes a file from Supabase Storage.
 */
export async function deleteFromStorage(bucket = "documents", paths: string[]) {
  const { data, error } = await supabaseAdmin.storage.from(bucket).remove(paths);
  if (error) throw error;
  return data;
}
