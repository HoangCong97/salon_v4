import * as fs from "fs";
import * as path from "path";

/**
 * Deletes a file from either the local uploads directory or Supabase Storage,
 * depending on the file URL format.
 */
export async function deleteOldFile(fileUrl: string | null | undefined) {
  if (!fileUrl) return;

  try {
    // 1. Handle local disk file cleanup
    if (fileUrl.includes("/uploads/")) {
      const parts = fileUrl.split("/uploads/");
      if (parts.length === 2) {
        const relativePath = parts[1];
        // Convert to absolute local path on current OS
        const localFilePath = path.join(process.cwd(), "uploads", relativePath.replace(/\//g, path.sep));
        if (fs.existsSync(localFilePath)) {
          fs.unlinkSync(localFilePath);
          console.log(`[File Delete] Deleted local file: ${localFilePath}`);
        } else {
          console.log(`[File Delete] Local file not found for path: ${localFilePath}`);
        }
      }
    } 
    // 2. Handle Supabase storage cleanup
    else if (fileUrl.includes(".supabase.co/storage/v1/object/public/")) {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const bucketName = process.env.DATABASE_BUCKET_NAME || "saas-salon-images";

      const useSupabase = 
        supabaseUrl && 
        supabaseKey && 
        supabaseKey !== "PLACEHOLDER_CHANGE_ME" && 
        supabaseKey !== "";

      if (useSupabase) {
        // Extract bucket sub-path from URL
        const searchStr = `/storage/v1/object/public/${bucketName}/`;
        const idx = fileUrl.indexOf(searchStr);
        if (idx !== -1) {
          const uploadPath = fileUrl.substring(idx + searchStr.length);
          const { createClient } = await import("@supabase/supabase-js");
          const supabase = createClient(supabaseUrl, supabaseKey);
          
          console.log(`[File Delete] Deleting file from Supabase Storage: ${uploadPath}...`);
          const { error } = await supabase.storage
            .from(bucketName)
            .remove([uploadPath]);

          if (error) {
            console.error(`[File Delete] Failed to delete from Supabase:`, error.message);
          } else {
            console.log(`[File Delete] Deleted Supabase file: ${uploadPath}`);
          }
        }
      }
    }
  } catch (error) {
    console.error(`[File Delete] Error deleting old file (${fileUrl}):`, error);
  }
}
