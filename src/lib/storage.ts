import { randomUUID } from "crypto";
import path from "path";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { SupportedFileType } from "@/lib/extractText";

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "resumes";

const CONTENT_TYPE_BY_FILE_TYPE: Record<SupportedFileType, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

/**
 * Persists an uploaded resume file to Supabase Storage, namespaced by user.
 * The bucket should be private — resumes contain personal data and are
 * never served back to the browser directly.
 */
export async function saveUploadedFile(
  userId: string,
  originalFileName: string,
  buffer: Buffer,
  fileType: SupportedFileType,
): Promise<string> {
  const safeExt = path.extname(originalFileName).slice(0, 10);
  const storageKey = `${userId}/${randomUUID()}${safeExt}`;

  const { error } = await getSupabaseAdmin()
    .storage.from(STORAGE_BUCKET)
    .upload(storageKey, buffer, {
      contentType: CONTENT_TYPE_BY_FILE_TYPE[fileType],
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload resume to Supabase Storage: ${error.message}`);
  }

  return storageKey;
}
