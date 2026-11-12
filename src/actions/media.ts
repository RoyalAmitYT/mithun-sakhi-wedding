"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth-helpers";
import { extractYouTubeVideoId } from "@/lib/youtube";

export { extractYouTubeVideoId };

export type MediaCategory =
  | "haldi"
  | "mehndi"
  | "wedding"
  | "reception"
  | "portraits"
  | "others";

const VALID_CATEGORIES: MediaCategory[] = [
  "haldi",
  "mehndi",
  "wedding",
  "reception",
  "portraits",
  "others",
];

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
];

/** Supabase Storage bucket name */
const STORAGE_BUCKET = "wedding-media";

/** Maximum upload size: 50MB */
const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Server Action: Upload one or more photographs to Supabase Storage.
 * Strictly requires Super Admin or 'photos' permission group.
 * Files are stored in the 'wedding-media' bucket; metadata goes into media_items.
 */
export async function uploadMediaAction(formData: FormData) {
  try {
    await requireAdmin("photos");
    const supabase = await createClient();

    const categoryRaw = formData.get("category") as string;
    const category: MediaCategory = VALID_CATEGORIES.includes(
      categoryRaw as MediaCategory
    )
      ? (categoryRaw as MediaCategory)
      : "wedding";

    const caption = ((formData.get("caption") as string) || "")
      .trim()
      .slice(0, 500);
    const isPublished = formData.get("is_published") === "true";
    const downloadEnabled = formData.get("download_enabled") !== "false";

    // Retrieve uploaded files
    const files = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;
    const allFiles: File[] = [];

    if (files && files.length > 0) {
      for (const f of files) {
        if (f && f.size > 0) allFiles.push(f);
      }
    } else if (singleFile && singleFile.size > 0) {
      allFiles.push(singleFile);
    }

    if (allFiles.length === 0) {
      return {
        success: false,
        error: "Please select at least one photograph to upload.",
      };
    }

    const createdIds: string[] = [];
    const uploadResults: Array<{
      fileName: string;
      originalBytes: number;
      uploadedBytes: number;
      success: boolean;
      error?: string;
    }> = [];

    for (const file of allFiles) {
      if (file.size > MAX_FILE_SIZE) {
        return {
          success: false,
          error: `File "${file.name}" exceeds the maximum allowed size of 50MB.`,
        };
      }

      if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
        return {
          success: false,
          error: `File "${file.name}" has an unsupported format. Allowed formats: JPEG, PNG, WebP, AVIF.`,
        };
      }

      const mediaId = crypto.randomUUID();
      const originalBytes = file.size;

      // Convert file to buffer for storage upload
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Determine content type and extension
      // The client-side compression in admin-media-manager sends WebP blobs,
      // so we detect the actual MIME from the file object
      const contentType = file.type || "image/webp";
      const ext =
        contentType.includes("webp")
          ? ".webp"
          : contentType.includes("png")
            ? ".png"
            : contentType.includes("avif")
              ? ".avif"
              : ".jpg";

      // Storage path: {category}/{mediaId}{ext}
      const storagePath = `${category}/${mediaId}${ext}`;

      // Upload to Supabase Storage
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, buffer, {
          contentType,
          upsert: false,
          duplex: "half",
        });

      if (storageError) {
        console.error("Storage upload failed:", storageError);
        uploadResults.push({
          fileName: file.name,
          originalBytes,
          uploadedBytes: file.size,
          success: false,
          error: storageError.message,
        });
        // Continue with other files rather than aborting entirely
        continue;
      }

      // Register metadata in database
      const { data: createdItem, error: rpcError } = await supabase.rpc(
        "admin_create_media_item",
        {
          p_media_type: "photo",
          p_storage_path: storagePath,
          p_category: category,
          p_caption: caption || undefined,
          p_is_published: isPublished,
          p_download_enabled: downloadEnabled,
          p_file_name: file.name,
          p_file_size_bytes: file.size,
          p_mime_type: contentType,
        }
      );

      if (rpcError) {
        console.error(
          "Failed to register media item in database:",
          rpcError
        );
        // Attempt to clean up the orphaned Storage object
        await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
        uploadResults.push({
          fileName: file.name,
          originalBytes,
          uploadedBytes: file.size,
          success: false,
          error: rpcError.message,
        });
        continue;
      }

      const parsed = createdItem as { id: string } | null;
      if (parsed?.id) {
        createdIds.push(parsed.id);
      }

      uploadResults.push({
        fileName: file.name,
        originalBytes,
        uploadedBytes: file.size,
        success: true,
      });
    }

    revalidatePath("/admin/media");
    revalidatePath("/gallery");
    revalidatePath("/");

    const failedUploads = uploadResults.filter((r) => !r.success);
    if (failedUploads.length > 0 && createdIds.length === 0) {
      return {
        success: false,
        error: `All uploads failed: ${failedUploads.map((f) => f.error).join("; ")}`,
      };
    }

    return {
      success: true,
      count: createdIds.length,
      createdIds,
      uploadResults,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to upload media.";
    console.error("uploadMediaAction exception:", err);
    return { success: false, error: message };
  }
}

/**
 * Server Action: Register a YouTube wedding film or ceremony recording link.
 * Strictly requires Super Admin or 'photos' permission group.
 */
export async function createVideoMediaAction(data: {
  youtube_url: string;
  category: MediaCategory;
  caption?: string;
  is_published?: boolean;
}) {
  try {
    await requireAdmin("photos");
    const supabase = await createClient();

    const videoId = extractYouTubeVideoId(data.youtube_url);
    if (!videoId) {
      return {
        success: false,
        error:
          "Invalid YouTube URL. Please provide a standard YouTube video, Shorts, or unlisted link (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...).",
      };
    }

    const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;

    const { data: createdItem, error: rpcError } = await supabase.rpc(
      "admin_create_media_item",
      {
        p_media_type: "video",
        p_youtube_url: canonicalUrl,
        p_category: data.category || "wedding",
        p_caption: (data.caption || "").trim() || undefined,
        p_is_published: Boolean(data.is_published),
        p_download_enabled: false, // Videos are streamed from YouTube
      }
    );

    if (rpcError) {
      return { success: false, error: rpcError.message };
    }

    revalidatePath("/admin/media");
    revalidatePath("/gallery");
    revalidatePath("/");

    return { success: true, item: createdItem };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to register video.";
    return { success: false, error: message };
  }
}

/**
 * Server Action: Update metadata, caption, category, or order of an existing media item.
 */
export async function updateMediaAction(data: {
  id: string;
  category: MediaCategory;
  caption?: string;
  is_published: boolean;
  download_enabled: boolean;
  display_order?: number;
  youtube_url?: string;
}) {
  try {
    await requireAdmin("photos");
    const supabase = await createClient();

    let canonicalYoutubeUrl: string | undefined = undefined;
    if (data.youtube_url) {
      const videoId = extractYouTubeVideoId(data.youtube_url);
      if (videoId) {
        canonicalYoutubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
      }
    }

    const { error } = await supabase.rpc("admin_update_media_item", {
      p_media_id: data.id,
      p_category: data.category,
      p_caption: (data.caption || "").trim(),
      p_is_published: data.is_published,
      p_download_enabled: data.download_enabled,
      p_display_order: data.display_order ?? 0,
      p_youtube_url: canonicalYoutubeUrl,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/media");
    revalidatePath("/gallery");
    revalidatePath("/");

    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update media item.";
    return { success: false, error: message };
  }
}

/**
 * Server Action: Delete a media item and physically remove it from Supabase Storage.
 *
 * Safety contract:
 * 1. Fetch storage_path from DB.
 * 2. Remove from Supabase Storage.
 * 3. Only delete DB record after successful storage removal.
 * 4. If storage removal fails, return error — do NOT delete DB record silently.
 */
export async function deleteMediaAction(mediaId: string) {
  try {
    await requireAdmin("photos");
    const supabase = await createClient();

    // 1. Fetch the item to get its storage path before deletion
    const { data: itemData, error: fetchError } = await supabase
      .from("media_items")
      .select("id, media_type, storage_path")
      .eq("id", mediaId)
      .single();

    if (fetchError || !itemData) {
      return {
        success: false,
        error: fetchError?.message || "Media item not found.",
      };
    }

    // 2. Remove from Supabase Storage if it's a photo with a storage path
    if (itemData.media_type === "photo" && itemData.storage_path) {
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([itemData.storage_path]);

      if (storageError) {
        // Storage removal failed — do NOT delete the DB record
        console.error("Storage removal failed for", mediaId, storageError);
        return {
          success: false,
          error: `Could not remove photograph from storage: ${storageError.message}. Database record retained for safety. Please retry.`,
        };
      }
    }

    // 3. Delete the database metadata record
    const { error: dbError } = await supabase.rpc("admin_delete_media_item", {
      p_media_id: mediaId,
    });

    if (dbError) {
      // Storage deleted but DB delete failed — log recovery state
      console.error(
        "RECOVERY STATE: Storage object removed but DB record delete failed for",
        mediaId,
        dbError
      );
      return {
        success: false,
        error: `Storage object removed but database record could not be deleted: ${dbError.message}. Contact administrator.`,
      };
    }

    revalidatePath("/admin/media");
    revalidatePath("/gallery");
    revalidatePath("/");

    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to delete media item.";
    return { success: false, error: message };
  }
}

/**
 * Server Action: Toggle publication status between Draft and Published.
 */
export async function toggleMediaPublishedAction(mediaId: string) {
  try {
    await requireAdmin("photos");
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("admin_toggle_media_published", {
      p_media_id: mediaId,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/media");
    revalidatePath("/gallery");
    revalidatePath("/");

    const result = data as { is_published: boolean } | null;
    return { success: true, is_published: result?.is_published };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to toggle publication status.";
    return { success: false, error: message };
  }
}

/**
 * Server Action: Toggle download permissions for an image.
 */
export async function toggleMediaDownloadAction(mediaId: string) {
  try {
    await requireAdmin("photos");
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("admin_toggle_media_download", {
      p_media_id: mediaId,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/media");
    revalidatePath("/gallery");
    revalidatePath("/");

    const result = data as { download_enabled: boolean } | null;
    return { success: true, download_enabled: result?.download_enabled };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to toggle download permission.";
    return { success: false, error: message };
  }
}

/**
 * Server Action: Toggle homepage featured status.
 * Limited to approved/published photos, max 12 items.
 */
export async function toggleMediaFeaturedAction(mediaId: string) {
  try {
    await requireAdmin("photos");
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("admin_toggle_media_featured", {
      p_media_id: mediaId,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/media");
    revalidatePath("/");

    const result = data as { is_featured: boolean } | null;
    return { success: true, is_featured: result?.is_featured };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to toggle homepage featured status.";
    return { success: false, error: message };
  }
}

/**
 * Server Action: Generate a signed URL for a private storage object.
 * Used by admin media manager to preview unpublished photos.
 * Expires in 1 hour.
 */
export async function getMediaSignedUrlAction(
  storagePath: string
): Promise<{ url: string | null; error?: string }> {
  try {
    await requireAdmin("photos");
    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(storagePath, 3600); // 1 hour

    if (error || !data?.signedUrl) {
      return { url: null, error: error?.message || "Could not generate URL." };
    }

    return { url: data.signedUrl };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to generate signed URL.";
    return { url: null, error: message };
  }
}

/**
 * Server Action: Get public URL for a published storage object.
 */
export async function getMediaPublicUrl(storagePath: string): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || !storagePath) return null;
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${storagePath}`;
}

/**
 * Public Server Query: Get featured media items for the homepage section.
 */
export async function getHomepageFeaturedMediaAction(limit = 12) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_homepage_featured_media", {
      p_limit: limit,
    });

    if (error) {
      console.error("Error fetching homepage featured media:", error);
      return [];
    }

    return (
      (data as Array<{
        id: string;
        media_type: "photo" | "youtube";
        storage_path?: string;
        youtube_url?: string;
        category: MediaCategory;
        caption?: string;
        width?: number;
        height?: number;
        aspect_ratio?: number;
        is_featured: boolean;
        created_at: string;
      }>) || []
    );
  } catch (err) {
    console.error("Failed to load featured media for homepage:", err);
    return [];
  }
}
